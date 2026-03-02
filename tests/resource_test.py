import json
import os
import tempfile

from flask.testing import FlaskClient
import pytest
from werkzeug.datastructures import Headers

from issue_api import create_app, db
from issue_api.constants import API_KEY_HEADER
from issue_api.models import ReportType, User, Report, ApiKey, Comment

RESOURCE_AMOUNT = 3
TEST_ADMIN_KEY = "testingkey"
TEST_USER_KEY = "userstestinkey"


# https://stackoverflow.com/questions/16416001/set-http-headers-for-all-requests-in-a-flask-test
class AuthHeaderClient(FlaskClient):

    def open(self, *args, **kwargs):
        headers = Headers({
            API_KEY_HEADER: TEST_ADMIN_KEY
        })
        extra_headers = kwargs.pop('headers', Headers())
        headers.extend(extra_headers)
        kwargs['headers'] = headers
        return super().open(*args, **kwargs)

# Adapted from course material: https://github.com/UniOulu-Ubicomp-Programming-Courses/pwp-sensorhub-example/blob/ex2-project-layout/tests/test_resource.py
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

    app.test_client_class = AuthHeaderClient
    yield app.test_client()

    db.session.rollback()
    db.drop_all()
    db.session.remove()
    db.engine.dispose()
    os.close(db_fd)
    os.unlink(db_file_name)

    ctx.pop()

def _populate_db():
    for i in range(1, RESOURCE_AMOUNT + 1):
        report_type = ReportType(
            name=f"test-report_type-{i}",
        )

        user = User(
            name=f"test-user-{i}",
        )

        db_key = ApiKey(
            key=ApiKey.key_hash(f"{TEST_USER_KEY}-{i}"),
            admin=False,
            user=user
        )
        db.session.add(db_key)

        report = Report(
            user = user,
            report_type = report_type,
            description = f"test-description-{i}",
            location = f"test-location-{i}",
        )

        comment = Comment(
            user=user,
            report=report,
            text=f"test-text-{i}"
        )

        db.session.add(report_type)
        db.session.add(user)
        db.session.add(report)
        db.session.add(comment)
        user.reports_upvoted.append(report)

    admin_user = User(
        name=f"test-admin-user-{i}",
    )
    db_key = ApiKey(
        key=ApiKey.key_hash(TEST_ADMIN_KEY),
        admin=True,
        user=admin_user
    )
    db.session.add(db_key)

    db.session.commit()

def _get_report_type_json(number=1):
    return {
        "name": f"new-report_type-{number}",
        "description": "some description",
    }

def _get_report_json(number=1, report_type_id=1, user_id=1):
    return {
        "report_type_id": report_type_id,
        "user_id": user_id,
        "description": f"new-report-{number}",
        "location": f"test location",
    }

def _get_comment_json(number=1):
    return {
        "text": f"new-comment-{number}"
    }

def _get_user_json(number=1):
    return {
        "name": f"new-user-{number}",
        "api_key": f"test-api-key-{number}"
    }

# Adapted from course material: https://github.com/UniOulu-Ubicomp-Programming-Courses/pwp-sensorhub-example/blob/ex2-project-layout/tests/test_resource.py
class TestReportTypeCollection:

    RESOURCE_URL = "/api/report-types/"

    # GET all report types
    def test_get(self, client):
        resp = client.get(self.RESOURCE_URL)
        assert resp.status_code == 200
        body = json.loads(resp.data)
        assert len(body) == RESOURCE_AMOUNT
        for item in body:
            assert "name" in item

    # POST a valid report type
    def test_post(self, client):
        valid = _get_report_type_json()
        resp = client.post(self.RESOURCE_URL, json=valid)
        assert resp.status_code == 201
        new_report_id = str(RESOURCE_AMOUNT + 1)
        assert resp.headers["Location"].endswith(self.RESOURCE_URL + new_report_id + "/")
        resp = client.put(resp.headers["Location"], json=valid)
        assert resp.status_code == 204
    
    # POST wrong media type (text/plain)
    def test_post_wrong_media_type(self, client):
        resp = client.post(self.RESOURCE_URL)
        assert resp.status_code == 415

    # POST a report type with a missing mandatory field
    def test_post_missing_field(self, client):
        resp = client.post(self.RESOURCE_URL, json={"":""})
        assert resp.status_code == 400

    # POST a report type with already existing name (name must be unique) 
    def test_post_name_conflict(self, client):
        valid = _get_report_type_json()
        valid["name"] = "test-report_type-1"
        resp = client.post(self.RESOURCE_URL, json=valid)
        assert resp.status_code == 409

    # Only allow POST with admin key
    def test_forbidden(self, client):
        resp = client.post(self.RESOURCE_URL, headers={API_KEY_HEADER: f"{TEST_USER_KEY}-1"})
        assert resp.status_code == 403

# Adapted from course material: https://github.com/UniOulu-Ubicomp-Programming-Courses/pwp-sensorhub-example/blob/ex2-project-layout/tests/test_resource.py
class TestReportTypeItem:

    RESOURCE_URL = "api/report-types/1/"
    INVALID_URL = "/api/test/report-types/99999/"

    # PUT a valid report type
    def test_put(self, client):
        valid = _get_report_type_json()
        resp = client.put(self.RESOURCE_URL, json=valid)
        assert resp.status_code == 204

    # PUT wrong media type (text/plain)
    def test_put_wrong_media_type(self, client):
        resp = client.put(self.RESOURCE_URL)
        assert resp.status_code == 415

    # PUT a report type with a missing mandatory field
    def test_put_missing_field(self, client):
        resp = client.put(self.RESOURCE_URL, json={"":""})
        assert resp.status_code == 400

    # PUT a report type to already existing name (name must be unique)
    def test_put_name_conflict(self, client):
        valid = _get_report_type_json()
        valid["name"] = "test-report_type-2"
        resp = client.put(self.RESOURCE_URL, json=valid)
        assert resp.status_code == 409
    
    # DELETE an existing report type
    def test_delete(self, client):
        resp = client.delete(self.RESOURCE_URL)
        assert resp.status_code == 204

    # Only allow PUT or DELETE with admin key 
    def test_forbidden(self, client):
        resp = client.put(self.RESOURCE_URL, headers={API_KEY_HEADER: f"{TEST_USER_KEY}-1"})
        assert resp.status_code == 403
        resp = client.delete(self.RESOURCE_URL, headers={API_KEY_HEADER: f"{TEST_USER_KEY}-1"})
        assert resp.status_code == 403

class TestReportCollection:

    RESOURCE_URL = "/api/reports/"
    
    # GET list of all reports
    def test_get(self, client):
        resp = client.get(self.RESOURCE_URL)
        assert resp.status_code == 200
        body = json.loads(resp.data)
        assert len(body) == RESOURCE_AMOUNT
        for item in body:
            assert "description" in item
            assert "upvotes" in item
            assert item["upvotes"] == 1

    # POST valid report
    def test_post(self, client):
        valid = _get_report_json()
        resp = client.post(self.RESOURCE_URL, json=valid)
        assert resp.status_code == 201
        
    # POST wrong media type (text/plain)
    def test_post_wrong_media_type(self, client):
        resp = client.post(self.RESOURCE_URL)
        assert resp.status_code == 415

    # POST report with invalid JSON
    def test_post_missing_field(self, client):
        resp = client.post(self.RESOURCE_URL, json={"":""})
        assert resp.status_code == 400
    
    # POST with invalid API key
    def test_unauthorized(self, client):
        resp = client.post(self.RESOURCE_URL, headers={API_KEY_HEADER: "wrongkey"})
        assert resp.status_code == 401

class TestReportItem:

    RESOURCE_URL = "/api/reports/1/"
    
    # PUT valid report
    def test_put(self, client):
        valid = _get_report_json()
        resp = client.put(self.RESOURCE_URL, json=valid)
        assert resp.status_code == 204

    # PUT wrong media type (text/plain)
    def test_put_wrong_media_type(self, client):
        resp = client.put(self.RESOURCE_URL)
        assert resp.status_code == 415

    # PUT report with invalid JSON
    def test_put_missing_field(self, client):
        resp = client.put(self.RESOURCE_URL, json={"":""})
        assert resp.status_code == 400
    
    # DELETE existing report
    def test_delete(self, client):
        resp = client.delete(self.RESOURCE_URL)
        assert resp.status_code == 204

    # Only allow PUT and DELETE with admin key or correct user key
    def test_forbidden(self, client):
        resp = client.put(self.RESOURCE_URL, headers={API_KEY_HEADER: f"{TEST_USER_KEY}-2"})
        assert resp.status_code == 403
        resp = client.delete(self.RESOURCE_URL, headers={API_KEY_HEADER: f"{TEST_USER_KEY}-2"})
        assert resp.status_code == 403
        
class TestCommentCollection:

    RESOURCE_URL = "/api/reports/1/comments/"

    # POST valid comment
    def test_post(self, client):
        valid = _get_comment_json()
        resp = client.post(self.RESOURCE_URL, json=valid)
        assert resp.status_code == 201
        
    # POST wrong media type (text/plain)
    def test_post_wrong_media_type(self, client):
        resp = client.post(self.RESOURCE_URL)
        assert resp.status_code == 415

    # POST comment with invalid JSON
    def test_post_missing_field(self, client):
        resp = client.post(self.RESOURCE_URL, json={"":""})
        assert resp.status_code == 400
    
    # POST comment with invalid API key
    def test_unauthorized(self, client):
        resp = client.post(self.RESOURCE_URL, headers={API_KEY_HEADER: "wrongkey"})
        assert resp.status_code == 401

class TestCommentItem:

    RESOURCE_URL = "/api/comments/1/"
    
    # DELETE existing comment
    def test_delete(self, client):
        resp = client.delete(self.RESOURCE_URL)
        assert resp.status_code == 204

    # Only allow DELETE with admin key or correct user key
    def test_forbidden(self, client):
        resp = client.delete(self.RESOURCE_URL, headers={API_KEY_HEADER: f"{TEST_USER_KEY}-2"})
        assert resp.status_code == 403

class TestReportUpvote:
    
    RESOURCE_URL = "/api/reports/1/upvote/"
        
    # POST and DELETE with valid API key
    def test_post_delete(self, client):
        resp = client.post(self.RESOURCE_URL)
        assert resp.status_code == 201 # POST SUCCESS
        resp = client.post(self.RESOURCE_URL)
        assert resp.status_code == 409 # ALREADY UPVOTED
        resp = client.delete(self.RESOURCE_URL)
        assert resp.status_code == 204 # DELETE SUCCESS
        resp = client.delete(self.RESOURCE_URL)
        assert resp.status_code == 404 # NOT FOUND
    
    # POST and DELETE with invalid API key
    def test_unauthorized(self, client):
        resp = client.post(self.RESOURCE_URL, headers={API_KEY_HEADER: "wrongkey"})
        assert resp.status_code == 401
        resp = client.delete(self.RESOURCE_URL, headers={API_KEY_HEADER: "wrongkey"})
        assert resp.status_code == 401
    
    # POST and then DELETE as other user
    def test_forbidden(self, client):
        resp = client.post(self.RESOURCE_URL)
        assert resp.status_code == 201
        resp = client.delete(self.RESOURCE_URL, headers={API_KEY_HEADER: f"{TEST_USER_KEY}-1"})
        assert resp.status_code == 403


# Adapted from course material: https://github.com/UniOulu-Ubicomp-Programming-Courses/pwp-sensorhub-example/blob/ex2-project-layout/tests/test_resource.py
class TestUserCollection:

    RESOURCE_URL = "/api/users/"

    # GET all users with admin
    def test_get(self, client):
        resp = client.get(self.RESOURCE_URL)
        assert resp.status_code == 200
        body = json.loads(resp.data)
        assert len(body) == 4
        for item in body:
            assert "name" in item
            assert "id" in item
    
    # GET all users with not admin user
    def test_non_admin_get(self, client):
        resp = client.get(self.RESOURCE_URL, headers={API_KEY_HEADER: f"{TEST_USER_KEY}-1"})
        assert resp.status_code == 401

    # POST valid user
    def test_post(self, client):
        valid = _get_user_json()
        resp = client.post(self.RESOURCE_URL, json=valid)
        assert resp.status_code == 201
        new_user_id = str(RESOURCE_AMOUNT + 2)
        assert resp.headers["Location"].endswith(self.RESOURCE_URL + new_user_id + "/")
    
    # POST wrong mediatype (text/plain)
    def test_post_wrong_mediatype(self, client):
        resp = client.post(self.RESOURCE_URL)
        assert resp.status_code == 415

    # POST report type with missing mandatory field
    def test_post_missing_field(self, client):
        valid = _get_user_json()
        valid.pop("name")
        resp = client.post(self.RESOURCE_URL, json=valid)
        assert resp.status_code == 400

    # POST user with already existing name (name must be unique)
    def test_post_name_conflict(self, client):
        valid = _get_user_json()
        valid["name"] = "test-user-1"
        resp = client.post(self.RESOURCE_URL, json=valid)
        assert resp.status_code == 409

    # POST user with already existing api-key (api key must be unique)
    def test_post_api_key_conflict(self, client):
        valid = _get_user_json()
        valid["api_key"] = f"{TEST_USER_KEY}-1"
        resp = client.post(self.RESOURCE_URL, json=valid)
        assert resp.status_code == 409

# Adapted from course material: https://github.com/UniOulu-Ubicomp-Programming-Courses/pwp-sensorhub-example/blob/ex2-project-layout/tests/test_resource.py
class TestUserItem:

    RESOURCE_URL = "api/users/1/"
    INVALID_URL = "/api/users/99999/"
    
    # DELETE an existing user
    def test_delete(self, client):
        resp = client.delete(self.RESOURCE_URL)
        assert resp.status_code == 204

    # DELETE an unexisting user
    def test_delete_unexisting(self, client):
        resp = client.delete(self.INVALID_URL)
        assert resp.status_code == 404

    # Only allow DELETE with admin key or correct user key
    def test_forbidden(self, client):
        resp = client.delete(self.RESOURCE_URL, headers={API_KEY_HEADER: f"{TEST_USER_KEY}-2"})
        assert resp.status_code == 403
