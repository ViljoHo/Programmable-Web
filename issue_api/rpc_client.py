""""""
import os
import sys
import grpc
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# pylint: disable=wrong-import-position
import protos.ranking_pb2 as pb2
import protos.ranking_pb2_grpc as pb2_grpc

from issue_api.models import Report
from issue_api import db

def update_rankings():
    """Remotely calls a function on an RPC server to calculate 
    urgency score and updates the scores in the database"""
    channel = grpc.insecure_channel('localhost:50051')
    stub = pb2_grpc.RankingServiceStub(channel)

    reports = Report.query.all()
    reports_serialized = []
    for report in reports:
        serialized = report.serialize()
        serialized_cut = {
            "id": serialized["id"],
            "timestamp": serialized["timestamp"],
            "upvote_count": serialized["upvote_count"],
            "comment_count": serialized["comment_count"],
        }
        reports_serialized.append(serialized_cut)

    response = stub.CalculateRanking((pb2.RankingRequest(reports=reports_serialized)))

    for entry in response.rankings:
        report = Report.query.get(entry.report_id)
        if report:
            report.urgency_score = entry.score

    db.session.commit()
