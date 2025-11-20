from flask import Flask
from flask_pymongo import PyMongo
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from dotenv import load_dotenv
import os

load_dotenv()

mongo = PyMongo()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    
    # Configuration
    app.config["MONGO_URI"] = os.getenv("MONGODB_URI", "mongodb://localhost:27017/weekly-reports")
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET", "your-secret-key")
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = False
    
    # Initialize extensions
    mongo.init_app(app)
    jwt.init_app(app)
    CORS(app)
    
    # Ensure essential indexes exist (idempotent)
    try:
        with app.app_context():
            # Unique email and username (username can be null -> sparse)
            mongo.db.users.create_index('email', unique=True)
            mongo.db.users.create_index('username', unique=True, sparse=True)
            # Helpful for report queries
            mongo.db.reports.create_index([('user_id', 1), ('created_at', -1)])
            # Ensure a default admin exists (username/password can be overridden by env)
            from app.models.user import User
            default_admin_username = os.getenv('DEFAULT_ADMIN_USERNAME', 'adel zawia')
            default_admin_password = os.getenv('DEFAULT_ADMIN_PASSWORD', 'ilmhgru123')
            default_admin_email = os.getenv('DEFAULT_ADMIN_EMAIL', 'admin@local')
            existing_admin = User.find_by_username(default_admin_username)
            if not existing_admin:
                try:
                    admin_user = User(
                        name='Administrator',
                        email=default_admin_email,
                        username=default_admin_username,
                        password=default_admin_password,
                        department='Admin',
                        role='admin',
                        supervisor_email=None
                    )
                    admin_user.save()
                except Exception:
                    pass
    except Exception:
        # Do not crash app if index creation fails at startup
        pass

    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.reports import reports_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(reports_bp, url_prefix='/api/reports')
    
    return app
