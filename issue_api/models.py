"""Data models for the issue API."""

import hashlib
import secrets
from datetime import datetime, timezone

import click
from flask.cli import with_appcontext
from sqlalchemy import event
from sqlalchemy.engine import Engine
from sqlalchemy.exc import IntegrityError

from .extensions import db


@event.listens_for(Engine, "connect")
def set_sqlite_pragma(dbapi_connection, _):
    """Enables SQLite foreign key enforcement."""
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()

upvotes = db.Table("upvotes",
    db.Column("report_id", db.Integer, db.ForeignKey("report.id"), primary_key=True),
    db.Column("user_id", db.Integer, db.ForeignKey("user.id"), primary_key=True)
)

class Report(db.Model):
    """Report model."""

    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    user_id = db.Column(db.Integer, db.ForeignKey("user.id", ondelete="SET NULL"))
    report_type_id = db.Column(db.Integer, db.ForeignKey("report_type.id", ondelete="SET NULL"))
    description = db.Column(db.String(128), nullable=False)
    location = db.Column(db.String(64), nullable=False)
    urgency_score = db.Column(db.Float)

    user = db.relationship("User", back_populates="reports", passive_deletes=True)
    report_type = db.relationship("ReportType", back_populates="reports", passive_deletes=True)
    comments = db.relationship("Comment", back_populates="report", passive_deletes=True)

    def deserialize(self, json_dict):
        """Copies values from the given dictionary to the object."""
        self.report_type_id = json_dict["report_type_id"]
        self.description = json_dict["description"]
        self.location = json_dict["location"]

    def serialize(self, short_form=False):
        """Turns the object into a dictionary."""
        report_type = None
        if self.report_type:
            report_type = self.report_type.serialize(True)

        user_name = "Deleted user"
        if self.user:
            user_name = self.user.name
        doc = {
            "id": self.id,
            "timestamp": str(self.timestamp),
            "user_name": user_name,
            "report_type": report_type,
            "description": self.description,
            "location": self.location,
            "urgency_score": self.urgency_score,
            "upvote_count": len(self.upvoted_by),
            "comment_count": len(self.comments),
        }
        if not short_form:
            doc["comments"] = [comment.serialize() for comment in self.comments]
        return doc

class ReportType(db.Model):
    """Report type model."""

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(32), nullable=False, unique=True)
    description = db.Column(db.String(128))

    reports = db.relationship("Report", back_populates="report_type", passive_deletes=True)

    def deserialize(self, json_dict):
        """Copies values from the given dictionary to the object."""
        self.name = json_dict["name"]
        self.description = json_dict.get("description")

    def serialize(self, short_form=False):
        """Turns the object into a dictionary."""
        doc = {
            "name": self.name,
            "description": self.description,
        }
        if not short_form:
            doc["id"] = self.id
        return doc

class Comment(db.Model):
    """Comment model."""

    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    report_id = db.Column(db.Integer, db.ForeignKey("report.id", ondelete="CASCADE"),
                          nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id", ondelete="SET NULL"))
    text = db.Column(db.String(128), nullable=False)

    user = db.relationship("User", back_populates="comments", passive_deletes=True)
    report = db.relationship("Report", back_populates="comments", passive_deletes=True)

    def deserialize(self, json_dict):
        """Copies values from the given dictionary to the object."""
        self.text = json_dict["text"]

    def serialize(self):
        """Turns the object into a dictionary."""
        user = "Deleted user"
        if self.user:
            user = self.user.serialize()

        return {
            "id": self.id,
            "timestamp": str(self.timestamp),
            "user": user,
            "text": self.text,
        }

class User(db.Model):
    """User model."""

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(32), unique=True, nullable=False)

    reports = db.relationship("Report", back_populates="user", passive_deletes=True)
    comments = db.relationship("Comment", back_populates="user", passive_deletes=True)
    reports_upvoted = db.relationship("Report", secondary=upvotes, backref="upvoted_by")
    api_key = db.relationship("ApiKey", back_populates="user", cascade="all, delete-orphan")

    def deserialize(self, json_dict):
        """Copies values from the given dictionary to the object."""
        self.name = json_dict["name"]

    def serialize(self):
        """Turns the object into a dictionary."""
        return {
            "id": self.id,
            "name": self.name,
        }

class ApiKey(db.Model):
    """API key model."""

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id", ondelete='CASCADE'), nullable=False)
    key = db.Column(db.String(32), unique=True, nullable=False)
    admin = db.Column(db.Boolean, default=False)

    user = db.relationship("User", back_populates="api_key")

    @staticmethod
    def key_hash(key):
        """Returns the hash for a given key."""
        return hashlib.sha256(key.encode()).digest()

    def serialize(self):
        """Turns the object into a dictionary."""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "key": self.key,
            "admin": self.admin,
        }

def add_default_report_types():
    """Adds default report types to the database."""
    default_report_types = [
        ReportType(name="Pothole", description="Road surface damage, potholes, or cracks"),
        ReportType(name="Graffiti", description="Unauthorized markings or drawings on property"),
        ReportType(name="Damaged Sign", description="Damaged, missing, or obstructed traffic sign"),
        ReportType(name="Fallen Tree", description="Tree or large branches blocking the road"),
        ReportType(name="Debris", description="Objects or debris on the road"),
        ReportType(name="Street Light Broken", description="Street light not working"),
        ReportType(name="Other", description="Other issues not covered by other categories"),
    ]

    try:
        for report_type in default_report_types:
            db.session.add(report_type)

        db.session.commit()
        print("Added default report types.")
    except IntegrityError as err:
        db.session.rollback()
        print(f"Failed to add default report types: {err}")

@click.command("init-db")
@with_appcontext
def init_db():
    """Initializes the database with tables and default report types."""
    print("Initializing database...")
    db.drop_all()
    db.create_all()
    add_default_report_types()
    print("Database initialized.")

@click.command("reset-db")
@with_appcontext
def reset_db():
    """Drops and recreates all database tables."""
    print("Resetting database...")
    db.drop_all()
    db.create_all()
    print("Database reset complete.")

@click.command("create-admin-user")
@click.option("--name", default="admin", help="Admin user name")
@with_appcontext
def create_admin_user(name):
    """Creates an admin user into the database and prints the API key."""
    try:
        user = User(name=name)
        token = secrets.token_urlsafe()
        db_key = ApiKey(
            key=ApiKey.key_hash(token),
            admin=True,
            user=user
        )
        db.session.add(db_key)
        db.session.commit()
        print(f"Admin user '{name}' created successfully")
        print(f"Api-key: {token}")
    except IntegrityError:
        db.session.rollback()
        print(f"Error: User '{name}' already exists")
