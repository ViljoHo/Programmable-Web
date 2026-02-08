import database as db

db.init_db(clear=True)
petteri = db.add_user("Petteri Kuivanen")
ananas = db.add_user("Ananas Loimu")
taateli = db.add_user("Taateli Oivas")
reika = db.add_report_type("Reikä")
iso_reika = db.add_report(petteri, reika, "Hullu reikä", "Keskusta")
db.add_upvote(iso_reika, ananas)
db.add_comment(iso_reika, petteri, "Kamalaa!")
db.add_comment(iso_reika, taateli, "Huikeaa!")

db.delete_entry(db.User, petteri)
print(db.get_entry(db.Report, iso_reika))
print(db.get_all(db.User))
print(db.get_upvotes_count(iso_reika))
print(db.get_comments(iso_reika))

db.create_key(admin=True, user_id=taateli)
