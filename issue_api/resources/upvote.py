from flask import Response
from flask_restful import Resource
from werkzeug.exceptions import NotFound, Conflict

from issue_api import db
from issue_api.models import Report, User
from issue_api.utils import validate_user


class ReportUpvote(Resource):
    
    def post(self, report: Report, user: User):
        validate_user(user)

        if report in user.reports_upvoted:
            raise Conflict("You have already upvoted this report")

        user.reports_upvoted.append(report)
        db.session.commit()

        return Response(status=201)

    def delete(self, report: Report, user: User):
        validate_user(user)

        if report not in user.reports_upvoted:
            raise NotFound("You have not upvoted this report")

        user.reports_upvoted.remove(report)
        db.session.commit()

        return Response(status=204)
