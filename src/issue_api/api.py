from flask import Blueprint
from flask_restful import Api

from .resources.report_type import ReportTypeCollection

api_bp = Blueprint("api", __name__, url_prefix="/api")
api = Api(api_bp)

api.add_resource(ReportTypeCollection, "/report-types/")
