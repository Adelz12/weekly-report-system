from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from werkzeug.security import generate_password_hash
from bson.objectid import ObjectId

from app.models.user import User
from app.utils.decorators import token_required
from app import mongo

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        # Check if user exists
        existing_user = User.find_by_email(data['email'])
        if existing_user:
            return jsonify({"msg": "User already exists"}), 400
        
        # Create new user
        user = User(
            name=data['name'],
            email=data['email'],
            password=data['password'],
            department=data['department']
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
                "role": user.role
            }
        }), 201
        
    except Exception as e:
        return jsonify({"msg": str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        # Find user
        user = User.find_by_email(data['email'])
        if not user:
            return jsonify({"msg": "Invalid credentials"}), 400
        
        # Verify password
        if not User.verify_password(user['password'], data['password']):
            return jsonify({"msg": "Invalid credentials"}), 400
        
        # Create access token
        access_token = create_access_token(identity=str(user['_id']))
        
        return jsonify({
            "token": access_token,
            "user": {
                "id": str(user['_id']),
                "name": user['name'],
                "email": user['email'],
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

        if update_data:
            mongo.db.users.update_one({"_id": ObjectId(str(current_user['_id']))}, {"$set": update_data})

        # return updated user
        user = User.find_by_id(str(current_user['_id']))
        return jsonify(User.to_dict(user))
    except Exception as e:
        return jsonify({"msg": str(e)}), 500