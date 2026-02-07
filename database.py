from flask import Flask
from flask_sqlalchemy import SQLAlchemy

app = Flask("database")
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///test.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)

class Report(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"))
    description = db.Column(db.String(128), nullable=False)
    location = db.Column(db.String(64), nullable=False)
    type = db.Column(db.Integer, db.ForeignKey("report_type.id"))

    user = db.relationship("User", back_populates="reports")
    report_type = db.relationship("ReportType", back_populates="reports")
    upvotes = db.relationship("Upvote", back_populates="report", cascade="all, delete-orphan")
    comments = db.relationship("Comment", back_populates="report", cascade="all, delete-orphan")

class ReportType(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(32), nullable=False, unique=True)
    description = db.Column(db.String(128))

    reports = db.relationship("Report", back_populates="report_type")

class Upvote(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    report_id = db.Column(db.Integer, db.ForeignKey("report.id"), nullable=False)

    user = db.relationship("User", back_populates="upvotes")
    report = db.relationship("Report", back_populates="upvotes")

class Comment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"))
    report_id = db.Column(db.Integer, db.ForeignKey("report.id"), nullable=False)
    text = db.Column(db.String(128), nullable=False)

    user = db.relationship("User", back_populates="comments")
    report = db.relationship("Report", back_populates="comments")

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(32), unique=True, nullable=False)

    comments = db.relationship("Comment", back_populates="user")
    upvotes = db.relationship("Upvote", back_populates="user", cascade="all, delete-orphan")
    reports = db.relationship("Report", back_populates="user")
