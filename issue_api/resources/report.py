"""Resources for reports in the issue API."""

from flasgger import swag_from
from flask import Response, request, url_for
from flask_restful import Resource
from jsonschema import validate, ValidationError
from werkzeug.exceptions import BadRequest
from grpc import RpcError

from issue_api import db
from issue_api.models import Report
from issue_api.utils import load_json_schema, require_api_key, require_owner_or_admin, get_doc_path
from ..rpc_client import update_rankings

SCHEMA = load_json_schema("report.json")


class ReportCollection(Resource):
    """Resource for handling report collections."""

    @swag_from(get_doc_path("reportcollection/get.yml"))
    def get(self):
        """Get all reports."""
        user_id = request.args.get("user_id")

        response_data = []
        if user_id:
            reports = Report.query.filter_by(user_id=user_id).all()
        else:
            reports = Report.query.all()
        for report in reports:
            response_data.append(report.serialize(short_form=True))
        return response_data

    @swag_from(get_doc_path("reportcollection/post.yml"))
    @require_api_key
    def post(self, auth_user):
        """Create a new report."""
        try:
            validate(request.json, SCHEMA)
        except ValidationError as err:
            raise BadRequest(description=str(err)) from err

        report = Report()
        report.deserialize(json_dict=request.json)

        report.user = auth_user
        db.session.add(report)
        db.session.commit()

        try:
            update_rankings()
        except RpcError:
            # RPC server unavailable
            pass

        return Response(status=201, headers={
            "location": url_for("api.reportitem", report=report)
        })


class ReportItem(Resource):
    """Resource for handling report items."""

    @swag_from(get_doc_path("reportitem/get.yml"))
    def get(self, report: Report):
        """Get a specific report."""
        return report.serialize(short_form=False)

    @swag_from(get_doc_path("reportitem/put.yml"))
    @require_owner_or_admin("report", "user_id")
    def put(self, report: Report, **_kwargs):
        """Update a specific report."""
        try:
            validate(request.json, SCHEMA)
        except ValidationError as err:
            raise BadRequest(description=str(err)) from err

        report.deserialize(request.json)

        db.session.add(report)
        db.session.commit()

        return Response(status=204)

    @swag_from(get_doc_path("reportitem/delete.yml"))
    @require_owner_or_admin("report", "user_id")
    def delete(self, report: Report, **_kwargs):
        """Delete a specific report."""
        db.session.delete(report)
        db.session.commit()
        return Response(status=204)
