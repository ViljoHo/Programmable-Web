"""Resources for comments in the issue API."""

from flasgger import swag_from
from flask import Response, request, url_for
from flask_restful import Resource
from jsonschema import validate, ValidationError
from werkzeug.exceptions import BadRequest

from issue_api import db
from issue_api.models import Comment, Report
from issue_api.utils import load_json_schema, require_api_key, require_owner_or_admin, get_doc_path


SCHEMA = load_json_schema("comment.json")

class CommentCollection(Resource):
    """Resource for comment collection."""

    @swag_from(get_doc_path("commentcollection/post.yml"))
    @require_api_key
    def post(self, auth_user, report: Report):
        """Create a new comment."""
        try:
            validate(request.json, SCHEMA)
        except ValidationError as err:
            raise BadRequest(description=str(err)) from err

        comment = Comment()
        comment.deserialize(json_dict=request.json)

        comment.user = auth_user
        comment.report = report
        db.session.add(comment)
        db.session.commit()

        return Response(status=201, headers={
            "Location": url_for("api.commentitem", comment=comment)
        })

class CommentItem(Resource):
    """Resource for comment item."""

    @swag_from(get_doc_path("commentitem/delete.yml"))
    @require_owner_or_admin("comment", "user_id")
    def delete(self, comment: Comment, **_kwargs):
        """Delete a comment."""
        db.session.delete(comment)
        db.session.commit()
        return Response(status=204)
