from flask import Response, request
from flask_restful import Resource
from jsonschema import validate, ValidationError
from sqlalchemy.exc import IntegrityError
from werkzeug.exceptions import BadRequest, UnsupportedMediaType, Conflict

from issue_api import db
from issue_api.models import ReportType
from issue_api.utils import load_json_schema

REPORT_TYPE_SCHEMA = load_json_schema("report_type.json")

class ReportTypeCollection(Resource):

    def post(self):
        if not request.json:
            raise UnsupportedMediaType

        try:
            validate(request.json, REPORT_TYPE_SCHEMA)
        except ValidationError as err:
            raise BadRequest(description=str(err))

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
