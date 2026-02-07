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

def init_db(clear=False):
    with app.app_context():
        if clear:
            db.drop_all()
        db.create_all()

def add_report(user_id: int, description: str, location: str, type_id: int):
    with app.app_context():
        user = User.query.filter_by(id=user_id).first()
        report_type = ReportType.query.filter_by(id=type_id).first()

    new_report = Report(
            user = user,
            description = description,
            location = location,
            report_type = report_type,
        )

    with app.app_context():
        db.session.add(new_report)
        db.session.commit()

def add_report_type(name: str, description: str=None):
    new_report_type = ReportType(
            name = name,
            description = description,
        )

    with app.app_context():
        db.session.add(new_report_type)
        db.session.commit()

def add_upvote(user_id: int, report_id: int):
    with app.app_context():
        user = User.query.filter_by(id=user_id).first()
        report = Report.query.filter_by(id=report_id).first()

    new_upvote = Upvote(
            user = user,
            report = report,
        )

    with app.app_context():
        db.session.add(new_upvote)
        db.session.commit()

def add_comment(user_id: int, report_id: int, text: str):
    with app.app_context():
        user = User.query.filter_by(id=user_id).first()
        report = Report.query.filter_by(id=report_id).first()

    new_comment = Comment(
            user = user,
            report = report,
            text = text,
        )

    with app.app_context():
        db.session.add(new_comment)
        db.session.commit()

def add_user(name: str):
    new_user = User(
            name = name,
        )

    with app.app_context():
        db.session.add(new_user)
        db.session.commit()

def delete_entry(table, id: int):
    with app.app_context():
        entry = table.query.filter_by(id=id).first()
        if entry:
            db.session.delete(entry)
            db.session.commit()

init_db(True)
add_user("buh")
delete_entry(User, 2)
