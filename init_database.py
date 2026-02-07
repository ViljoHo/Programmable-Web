import database as db

db.init_db(True)
db.add_user("Petteri Kuivanen")
db.add_user("Ananas Loimu")
db.add_report_type("Reikä")
db.add_report(1, "Hullu reikä", "Keskusta", 1)
db.add_upvote(2, 1)
db.add_comment(1, 1, "crazy hamburger!")
