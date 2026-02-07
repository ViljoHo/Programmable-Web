from database import db, app, User, Report, Upvote, ReportType, Comment

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

hole = ReportType(
    name = "Reikä",
)

pothole = Report(
    user = petteri,
    description = "Hullu reikä",
    location = "Keskusta",
    report_type = hole,
)

updoot = Upvote(
    user = ananas,
    report = pothole,
)

komment = Comment(
    user = ananas,
    report = pothole,
    text = "kamalaa miten ihmeessä me voidaan nyt mennä kauppaan ):",
)

db.session.add_all([petteri, ananas, hole, pothole, updoot])
db.session.commit()

db.session.delete(hole)
db.session.commit()

ctx.pop()
