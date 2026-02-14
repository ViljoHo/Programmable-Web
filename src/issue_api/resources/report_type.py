from flask import Response
from flask_restful import Resource
from models import ReportType

class ReportTypeItem(Resource):

    def get(self, report_id):
        return Response(
            ReportType.query.filter_by(report_id=report_id).first(),
            status=201,
            )
