import os
import json
from functools import wraps

from flask import request
from werkzeug.routing import BaseConverter
from werkzeug.exceptions import NotFound, Forbidden, Unauthorized

from issue_api.models import ReportType, Report, Comment, ApiKey, User


SCHEMA_FOLDER_PATH = os.path.join(os.path.dirname(__file__), "static/schema/")
API_KEY_HEADER = "Issue-Api-Key"


def load_json_schema(file_name: str):
    """Loads and returns an existing JSON schema with the given file name."""
    schema_path = os.path.join(SCHEMA_FOLDER_PATH, file_name)
    with open(schema_path, encoding="utf-8") as file:
        return json.load(file)

def _authenticate():
    """Returns the API key object for the key in request headers."""
    key = request.headers.get(API_KEY_HEADER, "").strip()
    if not key:
        raise Unauthorized("Missing API key")
    key_hash = ApiKey.key_hash(key)
    db_api_key = ApiKey.query.filter_by(key=key_hash).first()
    if db_api_key is None:
        raise Unauthorized("Invalid API key")
    return db_api_key

def get_authenticated_user():
    """Returns the user object for the API key in request headers."""
    api_key = _authenticate()
    return api_key.user

def require_admin(func):
    """Wrapper function for requiring admin privileges for HTTP requests."""
    @wraps(func)
    def wrapper(*args, **kwargs):
        db_api_key = _authenticate()
        if not db_api_key.admin:
            raise Forbidden("Only an admin can perform this action")
        return func(*args, auth_user=db_api_key.user, **kwargs)
    return wrapper

def require_api_key(func):
    """Wrapper function for requiring authentication for HTTP requests."""
    @wraps(func)
    def wrapper(*args, **kwargs):
        db_api_key = _authenticate()
        return func(*args, auth_user=db_api_key.user, **kwargs)
    return wrapper

def require_owner_or_admin(resource_name, owner_field="user_id"):
    """Wrapper function for requiring admin privileges
    or ownership of the resource for HTTP requests."""
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
    """Converts report types from ID to object and vice versa."""

    def to_python(self, value):
        db_report_type = ReportType.query.filter_by(id=value).first()
        if db_report_type is None:
            raise NotFound(description=f"ReportType with id '{value}' not found")
        return db_report_type

    def to_url(self, value):
        return str(value.id)

class ReportConverter(BaseConverter):
    """Converts reports from ID to object and vice versa."""

    def to_python(self, value):
        db_report = Report.query.filter_by(id=value).first()
        if db_report is None:
            raise NotFound(description=f"Report with id '{value}' not found")
        return db_report

    def to_url(self, value):
        return str(value.id)

class CommentConverter(BaseConverter):
    """Converts comments from ID to object and vice versa."""

    def to_python(self, value):
        db_comment = Comment.query.filter_by(id=value).first()
        if db_comment is None:
            raise NotFound(description=f"Comment with id '{value}' not found")
        return db_comment

    def to_url(self, value):
        return str(value.id)

class UserConverter(BaseConverter):
    """Converts users from ID to object and vice versa."""

    def to_python(self, value):
        db_user = User.query.filter_by(id=value).first()
        if db_user is None:
            raise NotFound(description=f"User with id '{value}' not found")
        return db_user

    def to_url(self, value):
        return str(value.id)
