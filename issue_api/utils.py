from functools import wraps
import json
import os

from flask import request
from werkzeug.exceptions import NotFound, Forbidden
from werkzeug.routing import BaseConverter

from issue_api.models import ReportType, Report, Comment, ApiKey
from issue_api.constants import API_KEY_HEADER

SCHEMA_FOLDER_PATH = os.path.join(os.path.dirname(__file__), "static/schema/")

def load_json_schema(file_name: str):
    schema_path = os.path.join(SCHEMA_FOLDER_PATH, file_name)
    with open(schema_path) as file:
        return json.load(file)

def _authenticate():
    key_hash = ApiKey.key_hash(request.headers.get(API_KEY_HEADER, "").strip())
    if not key_hash:
        raise Forbidden("Missing API key")
    db_api_key = ApiKey.query.filter_by(key=key_hash).first()
    if db_api_key is None:
        raise Forbidden("Invalid API key")
    return db_api_key

def require_admin(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        db_api_key = _authenticate()
        if not db_api_key.admin:
            raise Forbidden

        return func(*args, **kwargs)
        
    return wrapper

def require_user_or_admin_key(func):
    @wraps(func)
    def wrapper(self, user, *args, **kwargs):
        db_api_key = _authenticate()
        
        if db_api_key.admin:
            return func(*args, **kwargs)
        
        if db_api_key.user == user:
            return func(*args, **kwargs)
        raise Forbidden
    return wrapper

class ReportTypeConverter(BaseConverter):

    def to_python(self, report_type_id):
        db_report_type = ReportType.query.filter_by(id=report_type_id).first()
        if db_report_type is None:
            raise NotFound(description=f"ReportType with id '{report_type_id}' not found")
        return db_report_type

    def to_url(self, db_report_type):
        return str(db_report_type.id)

class ReportConverter(BaseConverter):

    def to_python(self, report_id):
        db_report = Report.query.filter_by(id=report_id).first()
        if db_report is None:
            raise NotFound(description=f"Report with id '{report_id}' not found")
        return db_report

    def to_url(self, db_report):
        return str(db_report.id)

class CommentConverter(BaseConverter):

    def to_python(self, comment_id):
        db_comment = Comment.query.filter_by(id=comment_id).first()
        if db_comment is None:
            raise NotFound(description=f"Comment with id '{comment_id}' not found")
        return db_comment

    def to_url(self, db_comment):
        return str(db_comment.id)
