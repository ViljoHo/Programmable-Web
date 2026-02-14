from flask import Response, request
from flask_restful import Resource
from werkzeug.exceptions import BadRequest, UnsupportedMediaType, Conflict
from sqlalchemy.exc import IntegrityError

from issue_api import db
from issue_api.models import ReportType

class ReportTypeCollection(Resource):

    def post(self):

        if not request.json:
            raise UnsupportedMediaType

        report_type = ReportType()
        report_type.deserialize(json_dict=request.json)
        try:
            db.session.add(report_type)
            db.session.commit()
        except IntegrityError:
            raise Conflict(
                description="report_type with name '{name}' already exists.".format(
                    **request.json
                )
            )

        return Response(status=201)
