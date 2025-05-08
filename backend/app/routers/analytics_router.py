from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.analytics.update_deal_ratings import update_deal_ratings
from app.models.models import CarListing
from sqlalchemy import func

router = APIRouter(prefix="/analytics", tags=["Analytics"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/update-deal-ratings")
def update_deal_ratings_endpoint(db: Session = Depends(get_db)):
    update_deal_ratings(db)
    return {"message": "Deal ratings updated successfully."}


@router.get("/top-deals")
def get_top_super_deals(db: Session = Depends(get_db)):
    cars = (
        db.query(CarListing)
        .filter(
            CarListing.deal_rating == "S",
            CarListing.estimated_price != None,
            CarListing.price != None,
        )
        .all()
    )

    sorted_cars = sorted(
        cars,
        key=lambda c: (c.estimated_price - c.price) / c.estimated_price,
        reverse=True,
    )

    top_5 = sorted_cars[:5]

    return [car_listing_to_dict(c) for c in top_5]


def car_listing_to_dict(car: CarListing):
    return {
        "id": car.id,
        "title": car.title,
        "brand": car.brand,
        "model": car.model,
        "price": car.price,
        "estimated_price": car.estimated_price,
        "deal_rating": car.deal_rating,
        "year": car.year,
        "fuel_type": car.fuel_type,
        "transmission": car.transmission,
        "mileage": car.mileage,
        "images": car.images,
    }

@router.get("/deal-rating-distribution")
def get_rating_distribution(db: Session = Depends(get_db)):
    from sqlalchemy import func
    from app.models.models import CarListing

    results = (
        db.query(CarListing.deal_rating, func.count())
        .group_by(CarListing.deal_rating)
        .all()
    )

    distribution = [{"rating": r if r else "Unrated", "count": c} for r, c in results]
    return distribution

@router.get("/top-locations")
def get_top_locations(db: Session = Depends(get_db)):
    results = (
        db.query(CarListing.location, func.count(CarListing.id).label("count"))
        .filter(CarListing.location != None)
        .group_by(CarListing.location)
        .order_by(func.count(CarListing.id).desc())
        .limit(5)
        .all()
    )

    return [{"location": loc, "count": count} for loc, count in results]