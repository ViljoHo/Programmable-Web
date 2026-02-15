import json
import os

from werkzeug.exceptions import NotFound
from werkzeug.routing import BaseConverter

from .models import ReportType, Report, Comment

SCHEMA_FOLDER_PATH = os.path.join(os.path.dirname(__file__), "static/schema/")

def load_json_schema(file_name: str):
    schema_path = os.path.join(SCHEMA_FOLDER_PATH, file_name)
    with open(schema_path) as file:
        return json.load(file)

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
