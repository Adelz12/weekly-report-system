from functools import wraps
from flask import jsonify, current_app
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from app.models.user import User

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            verify_jwt_in_request()
            current_user_id = get_jwt_identity()
            current_user = User.find_by_id(current_user_id)
            
            if not current_user:
                return jsonify({"msg": "Token is valid but user not found"}), 401
                
            return f(current_user, *args, **kwargs)
        except Exception as e:
            return jsonify({"msg": "Token is invalid"}), 401
    return decorated

def admin_required(f):
    @wraps(f)
    def decorated(current_user, *args, **kwargs):
        if current_user.get('role') != 'admin':
            return jsonify({"msg": "Admin access required"}), 403
        return f(current_user, *args, **kwargs)
    return decorated