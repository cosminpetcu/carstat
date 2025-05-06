from sqlalchemy.orm import Session
from app.models.models import CarListing
from app.schemas.car_listing_schema import CarListingCreate, CarListingOut
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
    is_new: bool = True,
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
    if is_new:
        query = query.filter(CarListing.is_new == is_new)
    if deal_rating:
        query = query.filter(CarListing.deal_rating == deal_rating)

    if sort_by in ["price", "year", "mileage", "created_at"]:
        sort_column = getattr(CarListing, sort_by)
        sort_column = sort_column.desc() if order == "desc" else sort_column.asc()
        query = query.order_by(sort_column)

    total_count = query.count()
    listings = query.offset((page - 1) * limit).limit(limit).all()

    if not user_id:
        results = [CarListingOut.from_orm(car) for car in listings]
        return {
            "items": results,
            "total": total_count
        }

    favorite_ids = {
        fav.car_id for fav in db.query(Favorite).filter(Favorite.user_id == user_id).all()
    }

    results = []
    for car in listings:
        car_out = CarListingOut.from_orm(car)
        car_out.is_favorite = car.id in favorite_ids
        results.append(car_out)


    return {
        "items": results,
        "total": total_count
    }

def create_car_listing(db: Session, car_data: CarListingCreate):
    new_car = CarListing(
        title=car_data.title,
        brand=car_data.brand,
        model=car_data.model,
        price=car_data.price,
        year=car_data.year,
        mileage=car_data.mileage,
        fuel_type=car_data.fuel_type,
        transmission=car_data.transmission,
        engine_power=car_data.engine_power,
        emission_standard=car_data.emission_standard,
        doors=car_data.doors,
        color=car_data.color,
        drive_type=car_data.drive_type,
        vehicle_condition=car_data.vehicle_condition,
        previous_owners=car_data.previous_owners,
        itp_valid_until=car_data.itp_valid_until,
        vin=car_data.vin,
        location=car_data.location,
        description=car_data.description,
        engine_capacity=car_data.engine_capacity,
        seller_type=car_data.seller_type,
        is_new=car_data.is_new,
        image_url=car_data.image_url,
        source_url=car_data.source_url,
        created_at=datetime.utcnow()
    )
    db.add(new_car)
    db.commit()
    db.refresh(new_car)
    return new_car

def get_car_by_id(db: Session, car_id: int, user_id: Optional[int] = None):
    car = db.query(CarListing).filter(CarListing.id == car_id).first()
    if not car:
        return None

    car_out = CarListingOut.from_orm(car)

    if user_id:
        favorite = db.query(Favorite).filter(Favorite.user_id == user_id, Favorite.car_id == car_id).first()
        car_out.is_favorite = bool(favorite)
    else:
        car_out.is_favorite = False

    return car_out

