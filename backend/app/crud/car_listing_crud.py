from sqlalchemy.orm import Session
from app.models.models import CarListing
from app.schemas.car_listing_schema import CarListingCreate
from datetime import datetime
from typing import List, Optional
from app.models.models import Favorite
from app.schemas.car_listing_schema import CarListingOut


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


    if sort_by in ["price", "year", "mileage", "created_at"]:
        sort_column = getattr(CarListing, sort_by)
        sort_column = sort_column.desc() if order == "desc" else sort_column.asc()
        query = query.order_by(sort_column)

    offset = (page - 1) * limit
    listings = query.offset(offset).limit(limit).all()

    if not user_id:
        return listings

    favorite_ids = {
        fav.car_id for fav in db.query(Favorite).filter(Favorite.user_id == user_id).all()
    }

    results = []
    for car in listings:
        car_dict = car.__dict__.copy()
        car_dict["is_favorite"] = car.id in favorite_ids
        results.append(CarListingOut(**car_dict))

    return results


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
        seller_type = car_data.seller_type,
        is_new = car_data.is_new,
        created_at=datetime.utcnow()
    )
    db.add(new_car)
    db.commit()
    db.refresh(new_car)
    return new_car

def get_car_by_id(db: Session, car_id: int):
    return db.query(CarListing).filter(CarListing.id == car_id).first()
