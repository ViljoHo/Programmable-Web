from flask import Response, request, url_for
from flask_restful import Resource
from jsonschema import validate, ValidationError
from werkzeug.exceptions import BadRequest, UnsupportedMediaType

from issue_api import db
from issue_api.models import Report
from issue_api.utils import load_json_schema


SCHEMA = load_json_schema("report.json")


class ReportCollection(Resource):

    def get(self):
        response_data = []
        reports = Report.query.all()
        for report in reports:
            response_data.append(report.serialize(short_form=True))
        return response_data

    def post(self):
        if not request.json:
            raise UnsupportedMediaType

        try:
            validate(request.json, SCHEMA)
        except ValidationError as err:
            raise BadRequest(description=str(err))

        report = Report()
        report.deserialize(json_dict=request.json)
        
        db.session.add(report)
        db.session.commit()

        return Response(status=201, headers={
            "location": url_for("api.reportitem", report=report)
        })


class ReportItem(Resource):

    def get(self, report: Report):
        return report.serialize(short_form=False)
    
    def put(self, report: Report):
        if not request.json:
            raise UnsupportedMediaType

        try:
            validate(request.json, SCHEMA)
        except ValidationError as err:
            raise BadRequest(description=str(err))

        report.deserialize(request.json)
        
        db.session.add(report)
        db.session.commit()

        return Response(status=204)

    def delete(self, report: Report):
        db.session.delete(report)
        db.session.commit()
        return Response(status=204)
