from flask import Blueprint
from flask_restful import Api

from .resources.report_type import ReportTypeCollection, ReportTypeItem
from .resources.report import ReportCollection, ReportItem
from .resources.comment import CommentCollection, CommentItem
from .resources.user import UserCollection, UserItem

api_bp = Blueprint("api", __name__, url_prefix="/api")
api = Api(api_bp)

api.add_resource(ReportTypeCollection, "/report-types/")
api.add_resource(ReportTypeItem, "/report-types/<report_type:report_type>/")
api.add_resource(ReportCollection, "/reports/")
api.add_resource(ReportItem, "/reports/<report:report>/")
api.add_resource(CommentCollection, "/comments/")
api.add_resource(CommentItem, "/comments/<comment:comment>/")
api.add_resource(UserCollection, "/users/")
api.add_resource(UserItem, "/users/<user:user>/")
