import json
import os

from werkzeug.exceptions import NotFound
from werkzeug.routing import BaseConverter

from .models import ReportType

SCHEMA_FOLDER_PATH = os.path.join(os.path.dirname(__file__), "static/schema/")

def load_json_schema(file_name: str):
    schema_path = os.path.join(SCHEMA_FOLDER_PATH, file_name)
    with open(schema_path) as file:
        return json.load(file)

class ReportTypeConverter(BaseConverter):

    def to_python(self, report_type_id):
        db_report_type = ReportType.query.get(report_type_id)
        if db_report_type is None:
            raise NotFound(description=f"ReportType with id '{report_type_id}' not found")
        return db_report_type

    def to_url(self, db_report_type):
        return db_report_type.name
