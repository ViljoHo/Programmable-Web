from flask import Response, request, url_for
from flask_restful import Resource
from jsonschema import validate, ValidationError
from sqlalchemy.exc import IntegrityError
from werkzeug.exceptions import BadRequest, UnsupportedMediaType, Conflict

from issue_api import db
from issue_api.models import User, ApiKey
from issue_api.utils import load_json_schema


SCHEMA = load_json_schema("user.json")


class UserCollection(Resource):

    def get(self):
        response_data = []
        users = User.query.all()
        for user in users:
            response_data.append(user.serialize())
        return response_data

    def post(self):
        if not request.json:
            raise UnsupportedMediaType

        try:
            validate(request.json, SCHEMA)
        except ValidationError as err:
            raise BadRequest(description=str(err))

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
        except IntegrityError:
            raise Conflict(
                description="User with name '{name}' already exists.".format(
                    **request.json
                )
            )

        return Response(status=201, headers={
            "location": url_for("api.useritem", user=user)
        })


class UserItem(Resource):

    def delete(self, user: User):
        db.session.delete(user)
        db.session.commit()
        return Response(status=204)
