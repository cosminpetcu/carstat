# from fastapi import APIRouter, Depends
# from sqlalchemy.orm import Session
# from app.database import SessionLocal
# from app.analytics.update_deal_ratings import update_deal_ratings

# router = APIRouter(prefix="/analytics", tags=["Analytics"])

# def get_db():
#     db = SessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()

# @router.post("/update-deal-ratings")
# def update_deal_ratings_endpoint(db: Session = Depends(get_db)):
#     update_deal_ratings(db)
#     return {"message": "Deal ratings updated successfully."}
