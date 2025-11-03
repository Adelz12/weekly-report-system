from bson.objectid import ObjectId
from werkzeug.security import generate_password_hash, check_password_hash
import datetime
from app import mongo

class User:
    def __init__(self, name, email, password, department, role='employee'):
        self.name = name
        self.email = email
        self.password = generate_password_hash(password)
        self.department = department
        self.role = role
        self.created_at = datetime.datetime.utcnow()
    
    def save(self):
        """Save user to database"""
        user_data = {
            "name": self.name,
            "email": self.email,
            "password": self.password,
            "department": self.department,
            "role": self.role,
            "created_at": self.created_at
        }
        result = mongo.db.users.insert_one(user_data)
        return str(result.inserted_id)
    
    @staticmethod
    def find_by_email(email):
        """Find user by email"""
        return mongo.db.users.find_one({"email": email})
    
    @staticmethod
    def find_by_id(user_id):
        """Find user by ID"""
        return mongo.db.users.find_one({"_id": ObjectId(user_id)})
    
    @staticmethod
    def verify_password(stored_password, provided_password):
        """Verify password"""
        return check_password_hash(stored_password, provided_password)
    
    @staticmethod
    def to_dict(user):
        """Convert user object to dictionary"""
        if user:
            user['_id'] = str(user['_id'])
            user.pop('password', None)
            return user
        return None