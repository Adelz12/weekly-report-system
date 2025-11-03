import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    MONGO_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/weekly-reports")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET", "your-secret-key")
    JWT_ACCESS_TOKEN_EXPIRES = False