"""Resources for users in the issue API."""

from flasgger import swag_from
from flask import Response, request, url_for
from flask_restful import Resource
from jsonschema import validate, ValidationError
from sqlalchemy.exc import IntegrityError
from werkzeug.exceptions import BadRequest, Conflict

from issue_api import db
from issue_api.models import User, ApiKey
from issue_api.utils import load_json_schema, require_admin, require_owner_or_admin, get_doc_path


SCHEMA = load_json_schema("user.json")


class UserCollection(Resource):
    """Resource for handling user collections."""

    @swag_from(get_doc_path("usercollection/get.yml"))
    @require_admin
    def get(self, **_kwargs):
        """Get all users."""
        response_data = []
        users = User.query.all()
        for user in users:
            response_data.append(user.serialize())
        return response_data

    @swag_from(get_doc_path("usercollection/post.yml"))
    def post(self):
        """Create a new user."""
        try:
            validate(request.json, SCHEMA)
        except ValidationError as err:
            raise BadRequest(description=str(err)) from err

        user = User()
        user.deserialize(json_dict=request.json)

        api_key = ApiKey()
        api_key.user = user
        api_key.key = ApiKey.key_hash(request.json["api_key"])
        api_key.admin = False

        try:
            db.session.add(user)
            db.session.add(api_key)
            db.session.commit()
        except IntegrityError as exc:
            raise Conflict(
                description=f"User with name '{request.json['name']}' or given api key already exists."
            ) from exc

        return Response(status=201, headers={
            "location": url_for("api.useritem", user=user)
        })


class UserItem(Resource):
    """Resource for handling user items."""

    @swag_from(get_doc_path("useritem/get.yml"))
    @require_owner_or_admin("user", "id")
    def get(self, user: User, **_kwargs):
        """Get a specific user."""
        return user.serialize()

    @swag_from(get_doc_path("useritem/delete.yml"))
    @require_owner_or_admin("user", "id")
    def delete(self, user: User, **_kwargs):
        """Delete a specific user."""
        db.session.delete(user)
        db.session.commit()
        return Response(status=204)
