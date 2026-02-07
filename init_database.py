import database as db

db.init_db(True)
petr = db.add_user("Petteri Kuivanen")
nanas = db.add_user("Ananas Loimu")
taa = db.add_user("Taateli Oivas")
reik = db.add_report_type("Reikä")
hulre = db.add_report(petr, "Hullu reikä", "Keskusta", reik)
db.add_upvote(nanas, hulre)
db.add_comment(petr, hulre, "crazy hamburger!")
db.add_comment(taa, hulre, "67!")

db.delete_entry(db.User, petr)
print(db.get_entry(db.Report, hulre))
print(db.get_all(db.User))
print(db.get_upvotes_count(hulre))
print(db.get_comments(hulre))
