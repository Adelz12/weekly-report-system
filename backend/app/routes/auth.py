from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from werkzeug.security import generate_password_hash
from bson.objectid import ObjectId
import secrets
import os
from datetime import datetime, timedelta

from app.models.user import User
from app.utils.decorators import token_required, admin_required
from app.utils.notifications import send_email
from app import mongo

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json() or {}

        name = (data.get('name') or '').strip()
        email = (data.get('email') or '').strip().lower()
        username = (data.get('username') or '').strip().lower()
        password = data.get('password') or ''
        department = (data.get('department') or '').strip()
        supervisor_email = (data.get('supervisor_email') or None)
        if supervisor_email:
            supervisor_email = supervisor_email.strip().lower()

        if not name or not email or not username or not password or not department:
            return jsonify({"msg": "Name, username, email, password and department are required"}), 400

        # Check if user exists
        existing_user = User.find_by_email(email)
        if existing_user:
            return jsonify({"msg": "User already exists"}), 400
        # Ensure unique username
        existing_username = User.find_by_username(username)
        if existing_username:
            return jsonify({"msg": "Username already taken"}), 400

        # Create new user
        user = User(
            name=name,
            email=email,
            username=username,
            password=password,
            department=department,
            supervisor_email=supervisor_email
        )

        user_id = user.save()

        # Create access token
        access_token = create_access_token(identity=user_id)

        return jsonify({
            "token": access_token,
            "user": {
                "id": user_id,
                "name": user.name,
                "email": user.email,
                "username": user.username,
                "role": user.role,
                "supervisor_email": user.supervisor_email
            }
        }), 201

    except Exception as e:
        return jsonify({"msg": str(e)}), 500


@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    try:
        data = request.get_json() or {}
        email = data.get('email')
        if not email:
            return jsonify({"msg": "Email is required"}), 400

        user = User.find_by_email(email)
        # Always return success to avoid email enumeration
        if not user:
            return jsonify({"msg": "If an account exists for this email, a reset link has been sent."})

        # Generate a secure token and store it with expiration
        token = secrets.token_urlsafe(32)
        expires_at = datetime.utcnow() + timedelta(hours=1)
        try:
            mongo.db.password_resets.insert_one({
                "token": token,
                "user_id": str(user['_id']),
                "email": user['email'],
                "expires_at": expires_at,
                "used": False,
                "created_at": datetime.utcnow()
            })
        except Exception as e:
            return jsonify({"msg": str(e)}), 500

        frontend_base = os.getenv('FRONTEND_BASE_URL', 'http://localhost:3000')
        reset_link = f"{frontend_base}/reset-password/{token}"
        subject = "Password Reset Request"
        body = (
            f"You requested a password reset.\n\n"
            f"Click the link below to set a new password (valid for 1 hour):\n{reset_link}\n\n"
            f"If you did not request this, you can ignore this email."
        )
        # Best-effort email; even if email fails, do not reveal details
        try:
            send_email(user['email'], subject, body)
        except Exception:
            pass

        return jsonify({"msg": "If an account exists for this email, a reset link has been sent."})
    except Exception as e:
        return jsonify({"msg": str(e)}), 500


@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    try:
        data = request.get_json() or {}
        token = data.get('token')
        new_password = data.get('password')
        if not token or not new_password:
            return jsonify({"msg": "Token and password are required"}), 400

        record = mongo.db.password_resets.find_one({"token": token, "used": False})
        if not record:
            return jsonify({"msg": "Invalid or expired token"}), 400

        # Check expiration
        expires_at = record.get('expires_at')
        if not expires_at or datetime.utcnow() > expires_at:
            return jsonify({"msg": "Invalid or expired token"}), 400

        user_id = record.get('user_id')
        if not user_id:
            return jsonify({"msg": "Invalid or expired token"}), 400

        try:
            mongo.db.users.update_one(
                {"_id": ObjectId(user_id)},
                {"$set": {"password": generate_password_hash(new_password)}}
            )
            # Invalidate the token (mark used)
            mongo.db.password_resets.update_one({"_id": record["_id"]}, {"$set": {"used": True, "used_at": datetime.utcnow()}})
        except Exception as e:
            return jsonify({"msg": str(e)}), 500

        return jsonify({"msg": "Password has been reset successfully"})
    except Exception as e:
        return jsonify({"msg": str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json() or {}
        username = (data.get('username') or '').strip().lower()
        password = data.get('password') or ''
        if not username or not password:
            return jsonify({"msg": "Username and password are required"}), 400

        # Find user
        user = User.find_by_username(username)
        if not user:
            return jsonify({"msg": "Invalid credentials"}), 400

        # Verify password
        if not User.verify_password(user['password'], password):
            return jsonify({"msg": "Invalid credentials"}), 400

        # Create access token
        access_token = create_access_token(identity=str(user['_id']))

        return jsonify({
            "token": access_token,
            "user": {
                "id": str(user['_id']),
                "name": user['name'],
                "email": user['email'],
                "username": user.get('username'),
                "role": user['role']
            }
        })

    except Exception as e:
        return jsonify({"msg": str(e)}), 500

@auth_bp.route('/me', methods=['GET'])
@token_required
def get_current_user(current_user):
    return jsonify(User.to_dict(current_user))


@auth_bp.route('/me', methods=['PATCH'])
@token_required
def update_current_user(current_user):
    try:
        data = request.get_json() or {}

        update_data = {}
        if 'name' in data:
            update_data['name'] = data['name']
        if 'email' in data:
            # ensure email not used by another user
            existing = User.find_by_email(data['email'])
            if existing and str(existing['_id']) != str(current_user['_id']):
                return jsonify({"msg": "Email already in use"}), 400
            update_data['email'] = data['email']
        if 'department' in data:
            update_data['department'] = data['department']
        if 'password' in data and data['password']:
            update_data['password'] = generate_password_hash(data['password'])
        if 'supervisor_email' in data:
            update_data['supervisor_email'] = data['supervisor_email']

        if update_data:
            mongo.db.users.update_one({"_id": ObjectId(str(current_user['_id']))}, {"$set": update_data})

        # return updated user
        user = User.find_by_id(str(current_user['_id']))
        return jsonify(User.to_dict(user))
    except Exception as e:
        return jsonify({"msg": str(e)}), 500


# --- Admin: manage users ---
@auth_bp.route('/users', methods=['GET'])
@token_required
@admin_required
def list_users(current_user):
    try:
        # Optional simple text search by name/email/username/department
        q = (request.args.get('q') or '').strip().lower()
        users = User.find_all()
        if q:
            users = [u for u in users if any(
                q in str(u.get(field, '')).lower() for field in ['name', 'email', 'username', 'department']
            )]
        return jsonify(users)
    except Exception as e:
        return jsonify({"msg": str(e)}), 500


@auth_bp.route('/users/<user_id>', methods=['DELETE'])
@token_required
@admin_required
def delete_user(current_user, user_id):
    try:
        # prevent self-delete by mistake
        if str(current_user.get('_id')) == str(user_id):
            return jsonify({"msg": "You cannot delete your own account"}), 400

        # delete user's reports for cleanliness
        try:
            mongo.db.reports.delete_many({"user_id": ObjectId(user_id)})
        except Exception:
            pass

        ok = User.delete_by_id(user_id)
        if not ok:
            return jsonify({"msg": "User not found"}), 404
        return jsonify({"msg": "User deleted"})
    except Exception as e:
        return jsonify({"msg": str(e)}), 500