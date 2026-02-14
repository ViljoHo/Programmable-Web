import database as db

db.init_db(clear=True)
petteri = db.add_user("Petteri Kuivanen")
ananas = db.add_user("Ananas Loimu")
taateli = db.add_user("Taateli Oivas")
admin_key = db.create_key(admin=True, user_id=taateli)
reika = db.add_report_type("Reikä")
iso_reika = db.add_report(petteri, reika, "Hullu reikä", "Keskusta")
db.add_upvote(iso_reika, ananas)
db.add_comment(iso_reika, petteri, "Kamalaa!")
db.add_comment(iso_reika, taateli, "Huikeaa!")

# some tests
db.delete_entry(db.User, petteri)
db.get_entry(db.Report, iso_reika)
db.get_all(db.User)
db.get_upvotes_count(iso_reika)
db.get_comments(iso_reika)
