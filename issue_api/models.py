from datetime import datetime, timezone
import hashlib

import click
from flask.cli import with_appcontext
from sqlalchemy import event
from sqlalchemy.engine import Engine

from . import db

@event.listens_for(Engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()

upvotes = db.Table("upvotes",
    db.Column("report_id", db.Integer, db.ForeignKey("report.id"), primary_key=True),
    db.Column("user_id", db.Integer, db.ForeignKey("user.id"), primary_key=True)
)

class Report(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    user_id = db.Column(db.Integer, db.ForeignKey("user.id", ondelete="SET NULL"))
    type = db.Column(db.Integer, db.ForeignKey("report_type.id", ondelete="SET NULL"))
    description = db.Column(db.String(128), nullable=False)
    location = db.Column(db.String(64), nullable=False)

    user = db.relationship("User", back_populates="reports", passive_deletes=True)
    report_type = db.relationship("ReportType", back_populates="reports", passive_deletes=True)
    comments = db.relationship("Comment", back_populates="report", passive_deletes=True)

    def deserialize(self, json_dict):
        self.description = json_dict["description"]
        self.location = json_dict["location"]

    def serialize(self, short_form=False):
        doc = {
            "id": self.id,
            "timestamp": str(self.timestamp),
            "type": self.type,
            "user": self.user.serialize(),
            "description": self.description,
            "location": self.location,
        }
        if not short_form:
            doc["comments"] = [comment.serialize() for comment in self.comments]
        return doc

class ReportType(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(32), nullable=False, unique=True)
    description = db.Column(db.String(128))

    reports = db.relationship("Report", back_populates="report_type", passive_deletes=True)

    def deserialize(self, json_dict):
        self.name = json_dict["name"]
        self.description = json_dict.get("description")

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
        }

class Comment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    report_id = db.Column(db.Integer, db.ForeignKey("report.id", ondelete="CASCADE"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id", ondelete="SET NULL"))
    text = db.Column(db.String(128), nullable=False)

    user = db.relationship("User", back_populates="comments", passive_deletes=True)
    report = db.relationship("Report", back_populates="comments", passive_deletes=True)

    def serialize(self):
        return {
            "id": self.id,
            "timestamp": str(self.timestamp),
            "user": self.user.serialize(),
            "text": self.text,
        }

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(32), unique=True, nullable=False)

    reports = db.relationship("Report", back_populates="user", passive_deletes=True)
    comments = db.relationship("Comment", back_populates="user", passive_deletes=True)
    api_key = db.relationship("ApiKey", back_populates="user", passive_deletes=True)

    def serialize(self):
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

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "key": self.key,
            "admin": self.admin,
        }

@click.command("reset-db")
@with_appcontext
def reset_db():
    print("Resetting database...")
    db.drop_all()
    db.create_all()
    print("Database reset complete.")
