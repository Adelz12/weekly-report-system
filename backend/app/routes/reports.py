from flask import Blueprint, request, jsonify, current_app, send_from_directory, make_response
import os
import uuid
import csv
import io
import re
import datetime
from werkzeug.utils import secure_filename
from bson.objectid import ObjectId

from app.models.report import Report
from app.models.user import User

# Use package-relative imports from within `app` to help editors and runtime
from app.utils.decorators import token_required, admin_required
from app.utils.notifications import send_email, send_slack
from app.utils.audit import log_action
from app.utils import decorators, notifications

from app import mongo

reports_bp = Blueprint('reports', __name__)

@reports_bp.route('/', methods=['POST'])
@token_required
def create_report(current_user):
    try:
        # Support both JSON and multipart/form-data (for attachments)
        if request.is_json:
            data = request.get_json()
        else:
            data = request.form

        # Handle attachments if provided
        attachments_meta = []
        files = request.files.getlist('attachments') if request.files else []
        if files:
            upload_dir = os.path.abspath(os.path.join(current_app.root_path, '..', 'uploads'))
            os.makedirs(upload_dir, exist_ok=True)
            for f in files:
                if not f or f.filename == '':
                    continue
                # create a safe, unique filename
                filename = f"{uuid.uuid4().hex}_{secure_filename(f.filename)}"
                path = os.path.join(upload_dir, filename)
                # attempt a simple size check (max 10MB)
                try:
                    f.seek(0, os.SEEK_END)
                    size = f.tell()
                    f.seek(0)
                except Exception:
                    size = None

                MAX_BYTES = 10 * 1024 * 1024
                if size and size > MAX_BYTES:
                    return jsonify({"msg": f"File {f.filename} is too large (max 10MB)"}), 400

                f.save(path)
                meta = {
                    'filename': filename,
                    'original_name': f.filename,
                    'mime': f.mimetype,
                    'size': size,
                    'url': f"/api/reports/uploads/{filename}"
                }
                attachments_meta.append(meta)

        # parse tags if present
        tags_list = []
        raw_tags = data.get('tags') if data else None
        if raw_tags:
            if isinstance(raw_tags, str):
                tags_list = [t.strip() for t in raw_tags.split(',') if t.strip()]
            elif isinstance(raw_tags, list):
                tags_list = raw_tags

        report = Report(
            user_id=str(current_user['_id']),
            week=data.get('week'),
            year=data.get('year'),
            achievements=data.get('achievements'),
            challenges=data.get('challenges'),
            next_week_plan=data.get('nextWeekPlan'),
            month=data.get('month'),
            status=data.get('status', 'draft'),
            attachments=attachments_meta,
            tags=tags_list
        )

        report_id = report.save()

        # audit log
        try:
            log_action(str(current_user['_id']), 'create', report_id, {'week': data.get('week'), 'year': data.get('year')})
        except Exception:
            pass

        return jsonify(Report.find_by_id(report_id)), 201
    except Exception as e:
        return jsonify({"msg": str(e)}), 500

@reports_bp.route('/myreports', methods=['GET'])
@token_required
def get_user_reports(current_user):
    try:
        # Support filters: q (text), status, tags (comma-separated), start_date, end_date, department
        q = request.args.get('q')
        status = request.args.get('status')
        tags = request.args.get('tags')
        start = request.args.get('start')
        end = request.args.get('end')

        query = {"user_id": ObjectId(str(current_user['_id']))}

        if status:
            query['status'] = status

        if tags:
            tags_list = [t.strip() for t in tags.split(',') if t.strip()]
            if tags_list:
                query['tags'] = {"$in": tags_list}

        if start or end:
            date_q = {}
            if start:
                try:
                    date_q['$gte'] = datetime.datetime.fromisoformat(start)
                except Exception:
                    pass
            if end:
                try:
                    date_q['$lte'] = datetime.datetime.fromisoformat(end)
                except Exception:
                    pass
            if date_q:
                query['created_at'] = date_q

        if q:
            regex = {'$regex': q, '$options': 'i'}
            query['$or'] = [
                {'achievements': regex},
                {'challenges': regex},
                {'next_week_plan': regex}
            ]

        reports = mongo.db.reports.find(query).sort('created_at', -1)
        reports = [Report.to_dict(r) for r in reports]
        return jsonify(reports)
    except Exception as e:
        return jsonify({"msg": str(e)}), 500

@reports_bp.route('/', methods=['GET'])
@token_required
@admin_required
def get_all_reports(current_user):
    try:
        # Admin-level filters: q, status, tags, start, end, department
        q = request.args.get('q')
        status = request.args.get('status')
        tags = request.args.get('tags')
        start = request.args.get('start')
        end = request.args.get('end')
        department = request.args.get('department')

        query = {}

        if status:
            query['status'] = status

        if tags:
            tags_list = [t.strip() for t in tags.split(',') if t.strip()]
            if tags_list:
                query['tags'] = {'$in': tags_list}

        if start or end:
            date_q = {}
            if start:
                try:
                    date_q['$gte'] = datetime.datetime.fromisoformat(start)
                except Exception:
                    pass
            if end:
                try:
                    date_q['$lte'] = datetime.datetime.fromisoformat(end)
                except Exception:
                    pass
            if date_q:
                query['created_at'] = date_q

        if department:
            # find users in department
            user_ids = [u['_id'] for u in mongo.db.users.find({'department': department}, {'_id': 1})]
            if user_ids:
                query['user_id'] = {'$in': user_ids}

        if q:
            regex = {'$regex': q, '$options': 'i'}
            query['$or'] = [
                {'achievements': regex},
                {'challenges': regex},
                {'next_week_plan': regex}
            ]

        cursor = mongo.db.reports.find(query).sort('created_at', -1)
        reports = [Report.to_dict(r) for r in cursor]
        return jsonify(reports)
    except Exception as e:
        return jsonify({"msg": str(e)}), 500

@reports_bp.route('/<report_id>', methods=['GET'])
@token_required
def get_report(current_user, report_id):
    try:
        report = Report.find_by_id(report_id)
        if not report:
            return jsonify({"msg": "Report not found"}), 404
        
        # Check if user owns the report or is admin
        if report['user_id'] != str(current_user['_id']) and current_user.get('role') != 'admin':
            return jsonify({"msg": "Not authorized"}), 401
        
        return jsonify(report)
    except Exception as e:
        return jsonify({"msg": str(e)}), 500


@reports_bp.route('/uploads/<filename>', methods=['GET'])
def serve_upload(filename):
    """Serve uploaded files. Files are stored in backend/uploads."""
    try:
        upload_dir = os.path.abspath(os.path.join(current_app.root_path, '..', 'uploads'))
        return send_from_directory(upload_dir, filename)
    except Exception as e:
        return jsonify({"msg": "File not found"}), 404

@reports_bp.route('/<report_id>', methods=['PUT'])
@token_required
def update_report(current_user, report_id):
    try:
        report = Report.find_by_id(report_id)
        if not report:
            return jsonify({"msg": "Report not found"}), 404
        
        # Check if user owns the report or is admin
        if report['user_id'] != str(current_user['_id']) and current_user.get('role') != 'admin':
            return jsonify({"msg": "Not authorized"}), 401
        
        # Support JSON or multipart/form-data
        if request.is_json:
            body = request.get_json()
        else:
            body = request.form

        # Update fields
        update_data = {}
        if 'week' in body:
            update_data['week'] = body['week']
        if 'year' in body:
            update_data['year'] = body['year']
        if 'month' in body:
            update_data['month'] = body['month']
        if 'achievements' in body:
            update_data['achievements'] = body['achievements']
        if 'challenges' in body:
            update_data['challenges'] = body['challenges']
        if 'nextWeekPlan' in body:
            update_data['next_week_plan'] = body['nextWeekPlan']
        if 'status' in body:
            update_data['status'] = body['status']
        if 'tags' in body:
            # accept comma-separated or list
            tags = body.get('tags')
            if isinstance(tags, str):
                tags_list = [t.strip() for t in tags.split(',') if t.strip()]
            elif isinstance(tags, list):
                tags_list = tags
            else:
                tags_list = []
            update_data['tags'] = tags_list

        # Handle new attachments uploaded during update: append to existing list
        files = request.files.getlist('attachments') if request.files else []
        if files:
            upload_dir = os.path.abspath(os.path.join(current_app.root_path, '..', 'uploads'))
            os.makedirs(upload_dir, exist_ok=True)
            new_meta = []
            for f in files:
                if not f or f.filename == '':
                    continue
                filename = f"{uuid.uuid4().hex}_{secure_filename(f.filename)}"
                path = os.path.join(upload_dir, filename)
                try:
                    f.seek(0, os.SEEK_END)
                    size = f.tell()
                    f.seek(0)
                except Exception:
                    size = None
                MAX_BYTES = 10 * 1024 * 1024
                if size and size > MAX_BYTES:
                    return jsonify({"msg": f"File {f.filename} is too large (max 10MB)"}), 400
                f.save(path)
                meta = {
                    'filename': filename,
                    'original_name': f.filename,
                    'mime': f.mimetype,
                    'size': size,
                    'url': f"/api/reports/uploads/{filename}"
                }
                new_meta.append(meta)

            # combine with existing attachments
            existing_attachments = report.get('attachments', []) or []
            update_data['attachments'] = existing_attachments + new_meta

        updated_report = Report.update(report_id, update_data)
        try:
            log_action(str(current_user['_id']), 'update', report_id, update_data)
        except Exception:
            pass
        return jsonify(Report.to_dict(updated_report))

    except Exception as e:
        return jsonify({"msg": str(e)}), 500

@reports_bp.route('/<report_id>', methods=['DELETE'])
@token_required
def delete_report(current_user, report_id):
    try:
        report = Report.find_by_id(report_id)
        if not report:
            return jsonify({"msg": "Report not found"}), 404
        
        # Check if user owns the report or is admin
        if report['user_id'] != str(current_user['_id']) and current_user.get('role') != 'admin':
            return jsonify({"msg": "Not authorized"}), 401
        
        if Report.delete(report_id):
            try:
                log_action(str(current_user['_id']), 'delete', report_id, {})
            except Exception:
                pass
            return jsonify({"msg": "Report removed"})
        else:
            return jsonify({"msg": "Failed to delete report"}), 500
            
    except Exception as e:
        return jsonify({"msg": str(e)}), 500


@reports_bp.route('/export', methods=['GET'])
@token_required
def export_reports(current_user):
    """Export reports as CSV. Admins can export all reports by passing ?all=true"""
    try:
        export_all = request.args.get('all', 'false').lower() == 'true'
        if export_all and current_user.get('role') != 'admin':
            return jsonify({"msg": "Not authorized"}), 401

        if export_all:
            reports = Report.find_all()
        else:
            reports = Report.find_by_user(str(current_user['_id']))

        # Prepare CSV
        si = io.StringIO()
        writer = csv.writer(si)
        headers = ['id', 'user_id', 'user_name', 'user_email', 'week', 'year', 'month', 'status', 'created_at', 'submitted_at', 'achievements', 'challenges', 'next_week_plan', 'attachments']
        writer.writerow(headers)

        for r in reports:
            attachments_field = ';'.join([a.get('original_name', a.get('filename')) for a in (r.get('attachments') or [])])
            row = [
                r.get('_id'),
                r.get('user_id'),
                r.get('user', {}).get('name'),
                r.get('user', {}).get('email'),
                r.get('week'),
                r.get('year'),
                r.get('month'),
                r.get('status'),
                r.get('created_at'),
                r.get('submitted_at'),
                r.get('achievements'),
                r.get('challenges'),
                r.get('next_week_plan'),
                attachments_field
            ]
            writer.writerow(row)

        output = make_response(si.getvalue())
        output.headers["Content-Disposition"] = "attachment; filename=reports.csv"
        output.headers["Content-type"] = "text/csv"
        return output
    except Exception as e:
        return jsonify({"msg": str(e)}), 500


@reports_bp.route('/stats', methods=['GET'])
@token_required
@admin_required
def reports_stats(current_user):
    """Return aggregated stats for admin dashboard: weekly counts, department counts, overall completion."""
    try:
        # Weekly aggregation: group by year and week
        pipeline_weekly = [
            {
                "$group": {
                    "_id": {"year": "$year", "week": "$week"},
                    "total": {"$sum": 1},
                    "submitted": {"$sum": {"$cond": [{"$eq": ["$status", "submitted"]}, 1, 0]}}
                }
            },
            {"$sort": {"_id.year": 1, "_id.week": 1}}
        ]

        weekly = list(mongo.db.reports.aggregate(pipeline_weekly))
        weekly_formatted = [{
            "year": w['_id']['year'],
            "week": w['_id']['week'],
            "total": w['total'],
            "submitted": w['submitted']
        } for w in weekly]

        # Department aggregation: lookup user and group by department
        pipeline_dept = [
            {
                "$lookup": {
                    "from": "users",
                    "localField": "user_id",
                    "foreignField": "_id",
                    "as": "user"
                }
            },
            {"$unwind": {"path": "$user", "preserveNullAndEmptyArrays": True}},
            {"$group": {
                "_id": "$user.department",
                "total": {"$sum": 1},
                "submitted": {"$sum": {"$cond": [{"$eq": ["$status", "submitted"]}, 1, 0]}}
            }},
            {"$sort": {"total": -1}}
        ]

        dept = list(mongo.db.reports.aggregate(pipeline_dept))
        dept_formatted = [{
            "department": d['_id'] or 'Unknown',
            "total": d['total'],
            "submitted": d['submitted']
        } for d in dept]

        # Overall
        total = mongo.db.reports.count_documents({})
        submitted = mongo.db.reports.count_documents({"status": "submitted"})
        overall = {
            "total": total,
            "submitted": submitted,
            "completion_rate": (submitted / total * 100) if total > 0 else 0
        }

        return jsonify({"weekly": weekly_formatted, "departments": dept_formatted, "overall": overall})
    except Exception as e:
        return jsonify({"msg": str(e)}), 500


    @reports_bp.route('/team', methods=['GET'])
    @token_required
    @admin_required
    def team_aggregates(current_user):
        """Return per-user aggregates optionally filtered by department."""
        try:
            department = request.args.get('department')
            users_cursor = mongo.db.users.find({}) if not department else mongo.db.users.find({'department': department})
            users = list(users_cursor)
            results = []
            for u in users:
                uid = u['_id']
                total = mongo.db.reports.count_documents({'user_id': uid})
                submitted = mongo.db.reports.count_documents({'user_id': uid, 'status': 'submitted'})
                results.append({
                    'user_id': str(uid),
                    'name': u.get('name'),
                    'email': u.get('email'),
                    'department': u.get('department'),
                    'total_reports': total,
                    'submitted_reports': submitted
                })
            # sort by total_reports desc
            results.sort(key=lambda r: r['total_reports'], reverse=True)
            return jsonify(results)
        except Exception as e:
            return jsonify({"msg": str(e)}), 500


@reports_bp.route('/<report_id>/approve', methods=['POST'])
@token_required
@admin_required
def approve_report(current_user, report_id):
    """Approve a submitted report with an optional comment."""
    try:
        report = Report.find_by_id(report_id)
        if not report:
            return jsonify({"msg": "Report not found"}), 404

        if report.get('status') != 'submitted':
            return jsonify({"msg": "Only submitted reports can be approved"}), 400

        data = request.get_json() or {}
        comment = data.get('comment')

        approval = {
            'by': str(current_user['_id']),
            'action': 'approved',
            'comment': comment,
            'at': datetime.datetime.utcnow()
        }

        # Append to approvals and set status
        update = {
            'status': 'approved',
            'approvals': (report.get('approvals') or []) + [approval]
        }
        updated = Report.update(report_id, update)

        try:
            log_action(str(current_user['_id']), 'approve', report_id, {'comment': comment})
        except Exception:
            pass

        # Notify report owner
        try:
            owner_email = report.get('user', {}).get('email')
            owner_name = report.get('user', {}).get('name')
            if owner_email:
                subject = f"Your report for week {report.get('week')} has been approved"
                body = f"Hi {owner_name or ''},\n\nYour report (week {report.get('week')}, {report.get('year')}) was approved by {current_user.get('name')}" + (f"\n\nComment: {comment}" if comment else "")
                send_email(owner_email, subject, body)
            # slack
            send_slack(f"Report {report.get('_id')} approved by {current_user.get('name')}")
        except Exception:
            pass

        return jsonify(updated)
    except Exception as e:
        return jsonify({"msg": str(e)}), 500


@reports_bp.route('/<report_id>/reject', methods=['POST'])
@token_required
@admin_required
def reject_report(current_user, report_id):
    """Reject a submitted report with a required comment."""
    try:
        report = Report.find_by_id(report_id)
        if not report:
            return jsonify({"msg": "Report not found"}), 404

        if report.get('status') != 'submitted':
            return jsonify({"msg": "Only submitted reports can be rejected"}), 400

        data = request.get_json() or {}
        comment = data.get('comment')
        if not comment:
            return jsonify({"msg": "Rejection requires a comment"}), 400

        approval = {
            'by': str(current_user['_id']),
            'action': 'rejected',
            'comment': comment,
            'at': datetime.datetime.utcnow()
        }

        update = {
            'status': 'rejected',
            'approvals': (report.get('approvals') or []) + [approval]
        }
        updated = Report.update(report_id, update)
        try:
            log_action(str(current_user['_id']), 'reject', report_id, {'comment': comment})
        except Exception:
            pass

        # Notify owner
        try:
            owner_email = report.get('user', {}).get('email')
            owner_name = report.get('user', {}).get('name')
            if owner_email:
                subject = f"Your report for week {report.get('week')} has been rejected"
                body = f"Hi {owner_name or ''},\n\nYour report (week {report.get('week')}, {report.get('year')}) was rejected by {current_user.get('name')}" + (f"\n\nComment: {comment}" if comment else "")
                send_email(owner_email, subject, body)
            send_slack(f"Report {report.get('_id')} rejected by {current_user.get('name')}: {comment}")
        except Exception:
            pass

        return jsonify(updated)
    except Exception as e:
        return jsonify({"msg": str(e)}), 500


@reports_bp.route('/audit', methods=['GET'])
@token_required
@admin_required
def get_audit_logs(current_user):
    try:
        # simple pagination
        limit = int(request.args.get('limit', 50))
        cursor = mongo.db.audit_logs.find({}).sort('created_at', -1).limit(limit)
        logs = []
        for l in cursor:
            l['_id'] = str(l['_id'])
            l['user_id'] = str(l.get('user_id'))
            l['report_id'] = str(l.get('report_id')) if l.get('report_id') else None
            l['created_at'] = l.get('created_at')
            logs.append(l)
        return jsonify(logs)
    except Exception as e:
        return jsonify({"msg": str(e)}), 500