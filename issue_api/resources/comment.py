from flask import Response, request, url_for
from flask_restful import Resource
from jsonschema import validate, ValidationError
from sqlalchemy.exc import IntegrityError
from werkzeug.exceptions import BadRequest, UnsupportedMediaType, Conflict

from issue_api import db
from issue_api.models import Comment
from issue_api.utils import load_json_schema

SCHEMA = load_json_schema("comment.json")

class CommentCollection(Resource):

    def post(self):
        if not request.json:
            raise UnsupportedMediaType

        try:
            validate(request.json, SCHEMA)
        except ValidationError as err:
            raise BadRequest(description=str(err))

        comment = Comment()
        comment.deserialize(json_dict=request.json)

        db.session.add(comment)
        db.session.commit()

        return Response(status=201, headers={
            "Location": url_for("api.commentitem", comment=comment)
        })

class CommentItem(Resource):

    def delete(self, comment: Comment):
        db.session.delete(comment)
        db.session.commit()
        return Response(status=204)
