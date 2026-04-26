"""
The auxiliary service server.
Ranks reports based on their estimated urgency upon request via gRPC.
"""
import logging
import os
import sys
import time
from concurrent import futures
from datetime import datetime, timezone

import grpc

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# pylint: disable=wrong-import-position
import protos.ranking_pb2 as pb2
import protos.ranking_pb2_grpc as pb2_grpc

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class RankingService(pb2_grpc.RankingServiceServicer):
    """Provides methods that implement functionality of ranking server."""

    def calculate_urgency(self, timestamp, upvotes, comments):
        """Ranks an issue report based on its estimated urgency."""
        current_time = int(time.time())
        try:
            report_time = int(datetime.fromisoformat(timestamp).replace(tzinfo=timezone.utc).timestamp())
        except ValueError:
            report_time = current_time

        age_in_seconds = max(1, current_time - report_time)

        score = upvotes / (age_in_seconds / 60) * (1.2 ** comments)
        return float(score)

    def CalculateRanking(self, request, context):
        """Urgency ranking function called by the Main API."""
        logger.info("Received ranking request for %d reports", len(request.reports))

        rankings = []
        # pylint: disable=no-member
        try:
            for report in request.reports:
                score = self.calculate_urgency(
                    report.timestamp,
                    report.upvote_count,
                    report.comment_count
                )

                rankings.append(
                    pb2.Ranking(report_id=report.id, score=score)
                )

            logger.info("Successfully ranked %d reports", len(rankings))

            return pb2.RankingResponse(
                success=True,
                message="",
                rankings=rankings
            )

        except (ValueError, TypeError) as e:
            logger.error("Data processing error: %s", e)
            return pb2.RankingResponse(success=False, message=f"Invalid data: {e}")
        except grpc.RpcError as e:
            logger.error("gRPC error: %s", e)
            return pb2.RankingResponse(success=False, message="Communication error")


def serve():
    """Starts the gRPC server."""
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    pb2_grpc.add_RankingServiceServicer_to_server(RankingService(), server)

    server.add_insecure_port("[::]:50051")
    logger.info("Ranking Service Server started on port 50051")

    server.start()
    server.wait_for_termination()


if __name__ == "__main__":
    try:
        serve()
    except KeyboardInterrupt:
        logger.info("Server shutting down...")
