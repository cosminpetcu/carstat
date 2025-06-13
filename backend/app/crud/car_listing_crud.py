from sqlalchemy.orm import Session
from app.models.models import CarListing
from app.schemas.car_listing_schema import CarListingOut
from datetime import datetime
from typing import List, Optional
from app.models.models import Favorite

def get_all_car_listings(
    db: Session,
    brand: Optional[List[str]] = None,
    model: Optional[List[str]] = None,
    min_price: float = None,
    max_price: float = None,
    fuel_type: Optional[List[str]] = None,
    year_min: int = None,
    year_max: int = None,
    mileage_min: int = None,
    mileage_max: int = None,
    doors: int = None,
    transmission: Optional[List[str]] = None,
    drive_type: Optional[List[str]] = None,
    color: Optional[List[str]] = None,
    vehicle_condition: Optional[List[str]] = None,
    engine_power_min: int = None,
    engine_power_max: int = None,
    previous_owners: int = None,
    itp_valid_until_before: datetime = None,
    engine_capacity_min: int = None,
    engine_capacity_max: int = None,
    seller_type: Optional[List[str]] = None,
    deal_rating: str = None,
    estimated_price: float = None,
    version: Optional[str] = None,
    generation: Optional[str] = None,
    emissions: Optional[str] = None,
    origin_country: Optional[str] = None,
    first_owner: Optional[bool] = None,
    no_accident: Optional[bool] = None,
    service_book: Optional[bool] = None,
    registered: Optional[bool] = None,
    sold: Optional[bool] = None,
    damaged: Optional[bool] = None,
    right_hand_drive: Optional[bool] = None,
    quality_score_min: Optional[int] = None,
    quality_score_max: Optional[int] = None,
    suspicious_price: Optional[bool] = None,
    is_new: Optional[bool] = None,
    sort_by: str = None,
    order: str = "asc",
    page: int = 1,
    limit: int = 20,
    search: str = None,
    user_id: Optional[int] = None
):
    query = db.query(CarListing)

    if search:
        search_lower = f"%{search.lower()}%"
        query = query.filter(
            CarListing.title.ilike(search_lower) |
            CarListing.model.ilike(search_lower) |
            CarListing.brand.ilike(search_lower) |
            CarListing.description.ilike(search_lower)
        )

    if brand:
        query = query.filter(CarListing.brand.in_(brand))
    if model:
        query = query.filter(CarListing.model.in_(model))
    if min_price:
        query = query.filter(CarListing.price >= min_price)
    if max_price:
        query = query.filter(CarListing.price <= max_price)
    if fuel_type:
        query = query.filter(CarListing.fuel_type.in_(fuel_type))
    if year_min:
        query = query.filter(CarListing.year >= year_min)
    if year_max:
        query = query.filter(CarListing.year <= year_max)
    if mileage_min:
        query = query.filter(CarListing.mileage >= mileage_min)
    if mileage_max:
        query = query.filter(CarListing.mileage <= mileage_max)
    if doors:
        query = query.filter(CarListing.doors == doors)
    if transmission:
        query = query.filter(CarListing.transmission.in_(transmission))
    if drive_type:
        query = query.filter(CarListing.drive_type.in_(drive_type))
    if color:
        query = query.filter(CarListing.color.in_(color))
    if vehicle_condition:
        query = query.filter(CarListing.vehicle_condition.in_(vehicle_condition))
    if engine_power_min:
        query = query.filter(CarListing.engine_power >= engine_power_min)
    if engine_power_max:
        query = query.filter(CarListing.engine_power <= engine_power_max)
    if previous_owners:
        query = query.filter(CarListing.previous_owners <= previous_owners)
    if itp_valid_until_before:
        query = query.filter(CarListing.itp_valid_until <= itp_valid_until_before)
    if engine_capacity_min:
        query = query.filter(CarListing.engine_capacity >= engine_capacity_min)
    if engine_capacity_max:
        query = query.filter(CarListing.engine_capacity <= engine_capacity_max)
    if seller_type:
        query = query.filter(CarListing.seller_type.in_(seller_type))
    if deal_rating:
        query = query.filter(CarListing.deal_rating == deal_rating)
    if estimated_price:
        query = query.filter(CarListing.estimated_price <= estimated_price)
    if version:
        query = query.filter(CarListing.version == version)
    if generation:
        query = query.filter(CarListing.generation == generation)
    if emissions:
        query = query.filter(CarListing.emissions == emissions)
    if origin_country:
        query = query.filter(CarListing.origin_country == origin_country)
    if first_owner is not None:
        query = query.filter(CarListing.first_owner == first_owner)
    if no_accident is not None:
        query = query.filter(CarListing.no_accident == no_accident)
    if service_book is not None:
        query = query.filter(CarListing.service_book == service_book)
    if registered is not None:
        query = query.filter(CarListing.registered == registered)
    if sold is not None:
        query = query.filter(CarListing.sold == sold)
    if damaged is not None:
        query = query.filter(CarListing.damaged == damaged)
    if right_hand_drive is not None:
        query = query.filter(CarListing.right_hand_drive == right_hand_drive)
    if suspicious_price is not None:
        query = query.filter(CarListing.suspicious_price == suspicious_price)
    if quality_score_min is not None:
        query = query.filter(CarListing.quality_score >= quality_score_min)
    if quality_score_max is not None:
        query = query.filter(CarListing.quality_score <= quality_score_max)
    if is_new is not None:
        query = query.filter(CarListing.is_new == is_new)

    if sort_by in ["price", "year", "mileage", "created_at", "engine_power"]:
        sort_column = getattr(CarListing, sort_by)
        if order == "desc":
            query = query.order_by(sort_column.desc().nulls_last())
        else:
            query = query.order_by(sort_column.asc().nulls_last())

    total_count = query.count()
    listings = query.offset((page - 1) * limit).limit(limit).all()

    if not user_id:
        results = [CarListingOut.model_validate(car) for car in listings]
        return {
            "items": results,
            "total": total_count
        }

    favorite_ids = {
        fav.car_id for fav in db.query(Favorite).filter(Favorite.user_id == user_id).all()
    }

    results = []
    for car in listings:
        car_out = CarListingOut.model_validate(car)
        car_out.is_favorite = car.id in favorite_ids
        results.append(car_out)

    return {
        "items": results,
        "total": total_count
    }

def get_car_by_id(db: Session, car_id: int, user_id: Optional[int] = None):
    car = db.query(CarListing).filter(CarListing.id == car_id).first()
    if not car:
        return None

    car_out = CarListingOut.model_validate(car)

    if user_id:
        favorite = db.query(Favorite).filter(Favorite.user_id == user_id, Favorite.car_id == car_id).first()
        car_out.is_favorite = bool(favorite)
    else:
        car_out.is_favorite = False

    return car_out

