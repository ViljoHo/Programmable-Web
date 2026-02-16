import os

from flask import Flask
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

# Based on http://flask.pocoo.org/docs/1.0/tutorial/factory/#the-application-factory
# Modified to use Flask SQLAlchemy
def create_app(test_config=None):
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_mapping(
        SECRET_KEY="dev",
        SQLALCHEMY_DATABASE_URI="sqlite:///" + os.path.join(app.instance_path, "test.db"),
        SQLALCHEMY_TRACK_MODIFICATIONS=False
    )
    
    if test_config is None:
        app.config.from_pyfile("config.py", silent=True)
    else:
        app.config.from_mapping(test_config)
        
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass
    
    db.init_app(app)

    from . import api
    from . import models
    from .utils import ReportTypeConverter, ReportConverter, CommentConverter, UserConverter

    app.cli.add_command(models.reset_db)

    app.url_map.converters["report_type"] = ReportTypeConverter
    app.url_map.converters["report"] = ReportConverter
    app.url_map.converters["comment"] = CommentConverter
    app.url_map.converters["user"] = UserConverter

    app.register_blueprint(api.api_bp)

    with app.app_context():
        db.create_all()

    return app
