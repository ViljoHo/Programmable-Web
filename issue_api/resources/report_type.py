"""Resources for report types in the issue API."""

from flasgger import swag_from
from flask import Response, request, url_for
from flask_restful import Resource
from jsonschema import validate, ValidationError
from sqlalchemy.exc import IntegrityError
from werkzeug.exceptions import BadRequest, Conflict

from issue_api import db
from issue_api.models import ReportType
from issue_api.utils import load_json_schema, require_admin, get_doc_path


REPORT_TYPE_SCHEMA = load_json_schema("report_type.json")

# pylint: disable=line-too-long
# Adapted from course material: https://github.com/UniOulu-Ubicomp-Programming-Courses/pwp-sensorhub-example/blob/ex2-project-layout/sensorhub/resources/sensor.py
class ReportTypeCollection(Resource):
    """Resource for report type collection."""

    @swag_from(get_doc_path("reporttypecollection/get.yml"))
    def get(self):
        """Get all report types."""
        response_data = []
        report_types = ReportType.query.all()
        for report_type in report_types:
            response_data.append(report_type.serialize())
        return response_data

    @swag_from(get_doc_path("reporttypecollection/post.yml"))
    @require_admin
    def post(self, **_kwargs):
        """Create a new report type."""
        try:
            validate(request.json, REPORT_TYPE_SCHEMA)
        except ValidationError as err:
            raise BadRequest(description=str(err)) from err

        report_type = ReportType()
        report_type.deserialize(json_dict=request.json)
        try:
            db.session.add(report_type)
            db.session.commit()
        except IntegrityError as err:
            raise Conflict(
                description=f"report_type with name '{request.json['name']}' already exists."
            ) from err

        return Response(status=201, headers={
            "Location": url_for("api.reporttypeitem", report_type=report_type)
        })

# pylint: disable=line-too-long
# Adapted from course material: https://github.com/UniOulu-Ubicomp-Programming-Courses/pwp-sensorhub-example/blob/ex2-project-layout/sensorhub/resources/sensor.py
class ReportTypeItem(Resource):
    """Resource for report type item."""

    @swag_from(get_doc_path("reporttypeitem/put.yml"))
    @require_admin
    def put(self, report_type: ReportType, **_kwargs):
        """Update a report type."""
        try:
            validate(request.json, REPORT_TYPE_SCHEMA)
        except ValidationError as err:
            raise BadRequest(description=str(err)) from err

        report_type.deserialize(request.json)
        try:
            db.session.add(report_type)
            db.session.commit()
        except IntegrityError as err:
            raise Conflict(
                description=f"ReportType with name '{request.json['name']}' already exists."
            ) from err

        return Response(status=204)

    @swag_from(get_doc_path("reporttypeitem/delete.yml"))
    @require_admin
    def delete(self, report_type: ReportType, **_kwargs):
        """Delete a report type."""
        db.session.delete(report_type)
        db.session.commit()
        return Response(status=204)
