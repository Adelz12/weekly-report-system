from bson.objectid import ObjectId
import datetime
from app import mongo

class Report:
    def __init__(self, user_id, week, year, achievements, challenges, next_week_plan, month=None, status='draft', attachments=None, tags=None):
        self.user_id = user_id
        self.week = week
        self.year = year
        self.month = month
        self.achievements = achievements
        self.challenges = challenges
        self.next_week_plan = next_week_plan
        self.status = status
        # attachments is a list of metadata dicts: {filename, original_name, mime, size, url}
        self.attachments = attachments or []
        # tags: list of strings
        self.tags = tags or []
        # approvals: list of {by: ObjectId, action: 'approved'|'rejected', comment, at}
        self.approvals = []
        self.created_at = datetime.datetime.utcnow()
        self.submitted_at = None
    
    def save(self):
        """Save report to database"""
        report_data = {
            "user_id": ObjectId(self.user_id),
            "week": self.week,
            "year": self.year,
            "month": self.month,
            "achievements": self.achievements,
            "challenges": self.challenges,
            "next_week_plan": self.next_week_plan,
            "status": self.status,
            "attachments": self.attachments,
            "tags": self.tags,
            "approvals": self.approvals,
            "created_at": self.created_at
        }
        
        if self.status == 'submitted':
            report_data["submitted_at"] = datetime.datetime.utcnow()
        
        result = mongo.db.reports.insert_one(report_data)
        return str(result.inserted_id)
    
    @staticmethod
    def find_by_id(report_id):
        """Find report by ID"""
        report = mongo.db.reports.find_one({"_id": ObjectId(report_id)})
        return Report.to_dict(report)
    
    @staticmethod
    def find_by_user(user_id):
        """Find all reports by user"""
        reports = mongo.db.reports.find({"user_id": ObjectId(user_id)}).sort("created_at", -1)
        return [Report.to_dict(report) for report in reports]
    
    @staticmethod
    def find_all():
        """Find all reports"""
        reports = mongo.db.reports.find({}).sort("created_at", -1)
        return [Report.to_dict(report) for report in reports]
    
    @staticmethod
    def update(report_id, update_data):
        """Update report"""
        if 'status' in update_data and update_data['status'] == 'submitted':
            update_data['submitted_at'] = datetime.datetime.utcnow()
        
        mongo.db.reports.update_one(
            {"_id": ObjectId(report_id)},
            {"$set": update_data}
        )
        return Report.find_by_id(report_id)
    
    @staticmethod
    def delete(report_id):
        """Delete report"""
        result = mongo.db.reports.delete_one({"_id": ObjectId(report_id)})
        return result.deleted_count > 0
    
    @staticmethod
    def to_dict(report):
        """Convert report object to dictionary"""
        if report:
            report['_id'] = str(report['_id'])
            report['user_id'] = str(report['user_id'])
            # Ensure attachments field exists
            report['attachments'] = report.get('attachments', [])
            # Ensure tags and approvals exist
            report['tags'] = report.get('tags', [])
            report['approvals'] = report.get('approvals', [])
            
            # Add user information
            user = mongo.db.users.find_one({"_id": ObjectId(report['user_id'])})
            if user:
                report['user'] = {
                    'id': str(user['_id']),
                    'name': user['name'],
                    'email': user['email'],
                    'username': user.get('username'),
                    'department': user['department']
                }
            
            return report
        return None