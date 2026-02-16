from flask import Response, request, url_for
from flask_restful import Resource
from jsonschema import validate, ValidationError
from sqlalchemy.exc import IntegrityError
from werkzeug.exceptions import BadRequest, UnsupportedMediaType, Conflict

from issue_api import db
from issue_api.models import ReportType
from issue_api.utils import load_json_schema, require_admin

REPORT_TYPE_SCHEMA = load_json_schema("report_type.json")

# Adapted from course material: https://github.com/UniOulu-Ubicomp-Programming-Courses/pwp-sensorhub-example/blob/ex2-project-layout/sensorhub/resources/sensor.py
class ReportTypeCollection(Resource):

    def get(self):
        response_data = []
        report_types = ReportType.query.all()
        for report_type in report_types:
            response_data.append(report_type.serialize())
        return response_data

    @require_admin
    def post(self, user):
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

        return Response(status=201, headers={
            "Location": url_for("api.reporttypeitem", report_type=report_type)
        })

# Adapted from course material: https://github.com/UniOulu-Ubicomp-Programming-Courses/pwp-sensorhub-example/blob/ex2-project-layout/sensorhub/resources/sensor.py
class ReportTypeItem(Resource):

    @require_admin
    def put(self, user,  report_type: ReportType):
        if not request.json:
            raise UnsupportedMediaType

        try:
            validate(request.json, REPORT_TYPE_SCHEMA)
        except ValidationError as err:
            raise BadRequest(description=str(err))

        report_type.deserialize(request.json)
        try:
            db.session.add(report_type)
            db.session.commit()
        except IntegrityError:
            raise Conflict(
                description="ReportType with name '{name}' already exists.".format(
                    **request.json
                )
            )

        return Response(status=204)

    @require_admin
    def delete(self, user, report_type: ReportType):
        db.session.delete(report_type)
        db.session.commit()
        return Response(status=204)
