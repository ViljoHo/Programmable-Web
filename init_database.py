from database import db, app, User

ctx = app.app_context()
ctx.push()
db.drop_all()
db.create_all()

petteri = User(
    name = "Petteri Kuivanen",
)

ananas = User(
    name = "Ananas Loimu",
)

db.session.add(petteri)
db.session.add(ananas)
db.session.commit()

ctx.pop()
