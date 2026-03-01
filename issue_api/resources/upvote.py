from flask import Response
from flask_restful import Resource
from werkzeug.exceptions import NotFound, Conflict

from issue_api import db
from issue_api.models import Report
from issue_api.utils import get_authenticated_user


class ReportUpvote(Resource):
    
    def post(self, report_id):
        user = get_authenticated_user()
        
        report = Report.query.get(report_id)
        if not report:
            raise NotFound("Report not found")

        if report in user.reports_upvoted:
            raise Conflict("You have already upvoted this report")

        user.reports_upvoted.append(report)
        db.session.commit()

        return Response(status=201)

    def delete(self, report_id):
        user = get_authenticated_user()

        report = Report.query.get(report_id)
        if not report:
            raise NotFound("Report not found")

        if report not in user.reports_upvoted:
            raise NotFound("You have not upvoted this report")

        user.reports_upvoted.remove(report)
        db.session.commit()

        return Response(status=204)
