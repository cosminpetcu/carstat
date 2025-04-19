from db import SessionLocal, CarListing

db = SessionLocal()
print(db.query(CarListing).count())
