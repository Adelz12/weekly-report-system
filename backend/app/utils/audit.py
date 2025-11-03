import datetime
from app import mongo

def log_action(user_id, action, report_id=None, details=None):
    entry = {
        'user_id': user_id,
        'action': action,
        'report_id': report_id,
        'details': details or {},
        'created_at': datetime.datetime.utcnow()
    }
    try:
        mongo.db.audit_logs.insert_one(entry)
    except Exception:
        pass
