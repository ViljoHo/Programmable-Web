import json
from datetime import datetime, timezone
import hashlib
import secrets
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.engine import Engine
from sqlalchemy import event

@event.listens_for(Engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()

app = Flask("database")
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///test.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)

class Report(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.String(20), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id", ondelete="SET NULL"))
    type = db.Column(db.Integer, db.ForeignKey("report_type.id", ondelete="SET NULL"))
    description = db.Column(db.String(128), nullable=False)
    location = db.Column(db.String(64), nullable=False)

    user = db.relationship("User", back_populates="reports", passive_deletes=True)
    report_type = db.relationship("ReportType", back_populates="reports", passive_deletes=True)
    upvotes = db.relationship("Upvote", back_populates="report", passive_deletes=True)
    comments = db.relationship("Comment", back_populates="report", passive_deletes=True)

    def to_dict(self):
        return {
            "id": self.id,
            "timestamp": self.timestamp,
            "user_id": self.user_id,
            "type": self.type,
            "description": self.description,
            "location": self.location,
        }

class ReportType(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(32), nullable=False, unique=True)
    description = db.Column(db.String(128))

    reports = db.relationship("Report", back_populates="report_type", passive_deletes=True)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
        }

class Upvote(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    report_id = db.Column(db.Integer, db.ForeignKey("report.id", ondelete="CASCADE"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id", ondelete="SET NULL"))

    report = db.relationship("Report", back_populates="upvotes", passive_deletes=True)
    user = db.relationship("User", back_populates="upvotes", passive_deletes=True)

    def to_dict(self):
        return {
            "id": self.id,
            "report_id": self.report_id,
            "user_id": self.user_id,
        }

class Comment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.String(20), nullable=False)
    report_id = db.Column(db.Integer, db.ForeignKey("report.id", ondelete="CASCADE"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id", ondelete="SET NULL"))
    text = db.Column(db.String(128), nullable=False)

    user = db.relationship("User", back_populates="comments", passive_deletes=True)
    report = db.relationship("Report", back_populates="comments", passive_deletes=True)

    def to_dict(self):
        return {
            "id": self.id,
            "timestamp": self.timestamp,
            "report_id": self.report_id,
            "user_id": self.user_id,
            "text": self.text,
        }

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(32), unique=True, nullable=False)

    reports = db.relationship("Report", back_populates="user", passive_deletes=True)
    upvotes = db.relationship("Upvote", back_populates="user", passive_deletes=True)
    comments = db.relationship("Comment", back_populates="user", passive_deletes=True)
    api_key = db.relationship("ApiKey", back_populates="user", passive_deletes=True)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
        }
    
class ApiKey(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    key = db.Column(db.String(32), unique=True, nullable=False)
    admin = db.Column(db.Boolean, default=False)

    user = db.relationship("User", back_populates="api_key")

    @staticmethod
    def key_hash(key):
        return hashlib.sha256(key.encode()).digest()

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "key": self.key,
            "admin": self.admin,
        }

def init_db(clear: bool=False):
    with app.app_context():
        if clear:
            db.drop_all()
        db.create_all()

def add_report(user_id: int, type_id: int, description: str, location: str):
    with app.app_context():
        user = User.query.filter_by(id=user_id).first()
        report_type = ReportType.query.filter_by(id=type_id).first()

    new_report = Report(
            timestamp = _get_timestamp(),
            user = user,
            report_type = report_type,
            description = description,
            location = location,
        )

    with app.app_context():
        db.session.add(new_report)
        db.session.commit()
        return new_report.id

def add_report_type(name: str, description: str=None):
    new_report_type = ReportType(
            name = name,
            description = description,
        )

    with app.app_context():
        db.session.add(new_report_type)
        db.session.commit()
        return new_report_type.id

def add_upvote(report_id: int, user_id: int):
    with app.app_context():
        report = Report.query.filter_by(id=report_id).first()
        user = User.query.filter_by(id=user_id).first()

    new_upvote = Upvote(
            report = report,
            user = user,
        )

    with app.app_context():
        db.session.add(new_upvote)
        db.session.commit()
        return new_upvote.id

def add_comment(report_id: int, user_id: int, text: str):
    with app.app_context():
        report = Report.query.filter_by(id=report_id).first()
        user = User.query.filter_by(id=user_id).first()

    new_comment = Comment(
            timestamp = _get_timestamp(),
            report = report,
            user = user,
            text = text,
        )

    with app.app_context():
        db.session.add(new_comment)
        db.session.commit()
        return new_comment.id

def add_user(name: str):
    new_user = User(
            name = name,
        )

    with app.app_context():
        db.session.add(new_user)
        db.session.commit()
        return new_user.id

def delete_entry(table, id: int):
    with app.app_context():
        entry = table.query.filter_by(id=id).first()
        if entry:
            db.session.delete(entry)
            db.session.commit()

def get_entry(table, id: int):
    with app.app_context():
        entry = table.query.filter_by(id=id).first()
        if entry:
            return json.dumps(entry.to_dict())

def get_all(table):
    with app.app_context():
        entry_list = [entry.to_dict() for entry in table.query.all()]
        return json.dumps(entry_list)

def get_upvotes_count(report_id: int):
    with app.app_context():
        count = Upvote.query.filter_by(report_id=report_id).count()
        return count

def get_comments(report_id: int):
    with app.app_context():
        entry_list = [entry.to_dict() for entry in Comment.query.filter_by(report_id=report_id).all()]
        return json.dumps(entry_list)

def _get_timestamp():
    return datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")

def create_key(admin: bool, user_id: int):
    with app.app_context():
        user = User.query.filter_by(id=user_id).first()
    token = secrets.token_urlsafe()

    new_key = ApiKey(
        key = ApiKey.key_hash(token),
        user = user,
        admin = admin,
    )

    with app.app_context():
        db.session.add(new_key)
        db.session.commit()
        return new_key.id
