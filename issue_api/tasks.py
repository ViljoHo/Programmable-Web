from uuid import uuid4

from issue_api import db
from .models import Report

def test_task():
    uuid = uuid4()
    report = Report()
    report.description = str(uuid)
    report.location = "buh"
    db.session.add(report)
    db.session.commit()
