from uuid import uuid4

from issue_api import db
from .models import User

def test_task():
    uuid = uuid4()
    user = User()
    user.name = str(uuid)
    db.session.add(user)
    db.session.commit()
