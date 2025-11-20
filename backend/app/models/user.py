from bson.objectid import ObjectId
from werkzeug.security import generate_password_hash, check_password_hash
import datetime
from app import mongo

class User:
    def __init__(self, name, email, password, department, role='employee', supervisor_email=None, username=None):
        self.name = name
        # normalize emails to lowercase and trimmed
        self.email = (email or '').strip().lower()
        # store normalized username (lowercase, trimmed)
        self.username = (username or '').strip().lower() or None
        self.password = generate_password_hash(password)
        self.department = department
        self.role = role
        self.supervisor_email = (supervisor_email or None)
        if self.supervisor_email:
            self.supervisor_email = self.supervisor_email.strip().lower()
        self.created_at = datetime.datetime.utcnow()
    
    def save(self):
        """Save user to database"""
        user_data = {
            "name": self.name,
            "email": self.email,
            "username": self.username,
            "password": self.password,
            "department": self.department,
            "role": self.role,
            "supervisor_email": self.supervisor_email,
            "created_at": self.created_at
        }
        result = mongo.db.users.insert_one(user_data)
        return str(result.inserted_id)
    
    @staticmethod
    def find_by_email(email):
        """Find user by email"""
        normalized = (email or '').strip().lower()
        return mongo.db.users.find_one({"email": normalized})

    @staticmethod
    def find_by_username(username):
        """Find user by username"""
        normalized = (username or '').strip().lower()
        return mongo.db.users.find_one({"username": normalized})
    
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

    @staticmethod
    def find_all():
        """Return all users without passwords"""
        users = mongo.db.users.find({}).sort('created_at', -1)
        result = []
        for u in users:
            u = dict(u)
            u['_id'] = str(u['_id'])
            u.pop('password', None)
            result.append(u)
        return result

    @staticmethod
    def delete_by_id(user_id: str) -> bool:
        """Delete a user by id"""
        res = mongo.db.users.delete_one({"_id": ObjectId(user_id)})
        return res.deleted_count > 0