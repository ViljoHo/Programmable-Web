from functools import wraps
import json
import os

from flask import request
from werkzeug.exceptions import NotFound, Forbidden, Unauthorized
from werkzeug.routing import BaseConverter

from issue_api.models import ReportType, Report, Comment, ApiKey, User
from issue_api.constants import API_KEY_HEADER

SCHEMA_FOLDER_PATH = os.path.join(os.path.dirname(__file__), "static/schema/")

def load_json_schema(file_name: str):
    schema_path = os.path.join(SCHEMA_FOLDER_PATH, file_name)
    with open(schema_path) as file:
        return json.load(file)

def _authenticate():
    key = request.headers.get(API_KEY_HEADER, "").strip()
    if not key:
        raise Forbidden("Missing API key")
    key_hash = ApiKey.key_hash(key)
    db_api_key = ApiKey.query.filter_by(key=key_hash).first()
    if db_api_key is None:
        raise Forbidden("Invalid API key")
    return db_api_key

def get_authenticated_user():
    api_key = _authenticate()
    return api_key.user

def require_admin(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        db_api_key = _authenticate()
        if not db_api_key.admin:
            raise Forbidden("Only an admin can perform this action")
        return func(*args, auth_user=db_api_key.user, **kwargs)
    return wrapper

def require_api_key(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        db_api_key = _authenticate()
        return func(*args, auth_user=db_api_key.user, **kwargs)
    return wrapper

def require_owner_or_admin(resource_name, owner_field="user_id"):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            db_api_key = _authenticate()
            resource = kwargs[resource_name]
            if not db_api_key.admin and getattr(resource, owner_field) != db_api_key.user.id:
                raise Forbidden("Only an admin or the resource owner can perform this action")
            return func(*args, auth_user=db_api_key.user, **kwargs)
        return wrapper
    return decorator

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
    
class UserConverter(BaseConverter):

    def to_python(self, user_id):
        db_user = User.query.filter_by(id=user_id).first()
        if db_user is None:
            raise NotFound(description=f"User with id '{user_id}' not found")
        return db_user

    def to_url(self, db_user):
        return str(db_user.id)
