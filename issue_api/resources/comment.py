from flask import Response, request, url_for
from flask_restful import Resource
from jsonschema import validate, ValidationError
from sqlalchemy.exc import IntegrityError
from werkzeug.exceptions import BadRequest, UnsupportedMediaType, Conflict

from issue_api import db
from issue_api.models import Comment, Report
from issue_api.utils import load_json_schema, require_owner_or_admin

SCHEMA = load_json_schema("comment.json")

class CommentCollection(Resource):

    
    def post(self, report: Report):
        if not request.json:
            raise UnsupportedMediaType

        try:
            validate(request.json, SCHEMA)
        except ValidationError as err:
            raise BadRequest(description=str(err))

        comment = Comment()

        try:
            comment.deserialize(json_dict=request.json)
        except ValueError as err:
            return Response(str(err), status=404)

        comment.report = report
        db.session.add(comment)
        db.session.commit()

        return Response(status=201, headers={
            "Location": url_for("api.commentitem", comment=comment)
        })

class CommentItem(Resource):

    @require_owner_or_admin("comment", "user_id")
    def delete(self, auth_user, comment: Comment):
        db.session.delete(comment)
        db.session.commit()
        return Response(status=204)
