import json
import os
import tempfile

from flask.testing import FlaskClient
import pytest

from issue_api import create_app, db
from issue_api.models import ReportType, User, Report

REPORT_TYPE_AMOUNT = 3

@pytest.fixture
def client():
    db_fd, db_file_name = tempfile.mkstemp()
    config = {
        "SQLALCHEMY_DATABASE_URI": "sqlite:///" + db_file_name,
        "TESTING": True,
    }

    app = create_app(config)

    ctx = app.app_context()
    ctx.push()

    db.create_all()
    _populate_db()

    # app.test_client_class = FlaskClient
    yield app.test_client()

    db.session.rollback()
    db.drop_all()
    db.session.remove()
    db.engine.dispose()
    os.close(db_fd)
    os.unlink(db_file_name)

    ctx.pop()

def _populate_db():
    for i in range(1, REPORT_TYPE_AMOUNT + 1):
        report_type = ReportType(
            name=f"test-report_type-{i}",
        )

        user = User(
            name=f"test-user-{i}",
        )

        report = Report(
            user = user,
            report_type = report_type,
            description = f"test-description-{i}",
            location = f"test-location-{i}",
        )

        db.session.add(report_type)
        db.session.add(user)
        db.session.add(report)

    db.session.commit()

def _get_report_type_json(number=1):
    return {
        "name": f"new-report_type-{number}",
        "description": "some description",
    }

def _get_report_json(number=1, report_type_id=1, user_id=1):
    return {
        "type": report_type_id,
        "user_id": user_id,
        "description": f"new-report-{number}",
        "location": f"test location",
    }

def _get_comment_json(number=1, user_id=1, report_id=1):
    return {
        "text": f"new-comment-{number}",
        "user_id": user_id,
        "report_id": report_id,
    }


class TestReportTypeCollection:

    RESOURCE_URL = "/api/report-types/"

    def test_get(self, client):
        resp = client.get(self.RESOURCE_URL)
        assert resp.status_code == 200
        body = json.loads(resp.data)
        assert len(body) == REPORT_TYPE_AMOUNT
        for item in body:
            assert "name" in item

    def test_post_valid_request(self, client):
        valid = _get_report_type_json()
        resp = client.post(self.RESOURCE_URL, json=valid)
        assert resp.status_code == 201
        new_report_id = str(REPORT_TYPE_AMOUNT + 1)
        assert resp.headers["Location"].endswith(self.RESOURCE_URL + new_report_id + "/")
        resp = client.put(resp.headers["Location"], json=valid)
        assert resp.status_code == 204
    
    def test_post_wrong_mediatype(self, client):
        valid = _get_report_type_json()
        resp = client.post(self.RESOURCE_URL, data=json.dumps(valid))
        assert resp.status_code == 415

    def test_post_missing_field(self, client):
        valid = _get_report_type_json()
        valid.pop("name")
        resp = client.post(self.RESOURCE_URL, json=valid)
        assert resp.status_code == 400

    def test_post_name_conflict(self, client):
        valid = _get_report_type_json()
        valid["name"] = "test-report_type-1"
        resp = client.post(self.RESOURCE_URL, json=valid)
        assert resp.status_code == 409


class TestReportTypeItem:

    RESOURCE_URL = "api/report-types/1/"
    INVALID_URL = "/api/test/report-types/99999/"

    def test_put_valid_request(self, client):
        valid = _get_report_type_json()
        resp = client.put(self.RESOURCE_URL, json=valid)
        assert resp.status_code == 204

    def test_put_wrong_mediatype(self, client):
        valid = _get_report_type_json()
        resp = client.put(self.RESOURCE_URL, data=json.dumps(valid))
        assert resp.status_code == 415

    def test_put_missing_field(self, client):
        valid = _get_report_type_json()
        valid.pop("name")
        resp = client.put(self.RESOURCE_URL, json=valid)
        assert resp.status_code == 400

    def test_put_name_conflict(self, client):
        valid = _get_report_type_json()
        valid["name"] = "test-report_type-2"
        resp = client.put(self.RESOURCE_URL, json=valid)
        assert resp.status_code == 409

class TestReportCollection:

    RESOURCE_URL = "/api/reports/"
    
    def test_get(self, client):
        resp = client.get(self.RESOURCE_URL)
        assert resp.status_code == 200
        body = json.loads(resp.data)
        assert len(body) == 3
        for item in body:
            assert "description" in item

    def test_post_valid_request(self, client):
        valid = _get_report_json()
        resp = client.post(self.RESOURCE_URL, json=valid)
        assert resp.status_code == 201

        
class TestCommentCollection:

    RESOURCE_URL = "/api/comments/"

    # POST a valid comment
    def test_post_valid_request(self, client):
        valid = _get_comment_json()
        resp = client.post(self.RESOURCE_URL, json=valid)
        assert resp.status_code == 201
    
    # POST with an invalid user id
    def test_post_invalid_user_id_request(self, client):
        valid = _get_comment_json(user_id=56)
        resp = client.post(self.RESOURCE_URL, json=valid)
        assert resp.status_code == 404
