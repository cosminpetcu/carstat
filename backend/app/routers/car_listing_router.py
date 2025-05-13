from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.schemas.car_listing_schema import CarListingOut, CarListingCreate
from app.crud.car_listing_crud import (
    get_all_car_listings,
    create_car_listing,
    get_car_by_id
)
from typing import List, Optional, Dict, Any
from datetime import datetime

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/cars", response_model=Dict[str, Any])
def read_all_cars(
    brand: Optional[List[str]] = Query(None),
    model: Optional[List[str]] = Query(None),
    min_price: float = None,
    max_price: float = None,
    fuel_type: Optional[List[str]] = Query(None),
    year_min: int = None,
    year_max: int = None,
    mileage_min: int = None,
    mileage_max: int = None,
    doors: int = None,
    transmission: Optional[List[str]] = Query(None),
    drive_type: Optional[List[str]] = Query(None),
    color: Optional[List[str]] = Query(None),
    vehicle_condition: Optional[List[str]] = Query(None),
    engine_power_min: int = None,
    engine_power_max: int = None,
    previous_owners: int = None,
    itp_valid_until_before: datetime = None,
    engine_capacity_min: int = None,
    engine_capacity_max: int = None,
    seller_type: Optional[List[str]] = Query(None),
    is_new: Optional[bool] = None,
    deal_rating: Optional[str] = None,
    estimated_price: Optional[float] = None,
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
    quality_score: Optional[int] = None,
    suspicious_price: Optional[bool] = False,
    sort_by: str = None,
    order: str = "asc",
    page: int = 1,
    limit: int = 20,
    search: str = None,
    user_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    return get_all_car_listings(
        db=db,
        brand=brand,
        model=model,
        min_price=min_price,
        max_price=max_price,
        fuel_type=fuel_type,
        year_min=year_min,
        year_max=year_max,
        mileage_min=mileage_min,
        mileage_max=mileage_max,
        doors=doors,
        transmission=transmission,
        drive_type=drive_type,
        color=color,
        vehicle_condition=vehicle_condition,
        engine_power_min=engine_power_min,
        engine_power_max=engine_power_max,
        previous_owners=previous_owners,
        itp_valid_until_before=itp_valid_until_before,
        engine_capacity_min=engine_capacity_min,
        engine_capacity_max=engine_capacity_max,
        seller_type=seller_type,
        deal_rating=deal_rating,
        estimated_price=estimated_price,
        version=version,
        generation=generation,
        emissions=emissions,
        origin_country=origin_country,
        first_owner=first_owner,
        no_accident=no_accident,
        service_book=service_book,
        registered=registered,
        sold=sold,
        damaged=damaged,
        right_hand_drive=right_hand_drive,
        quality_score=quality_score,
        suspicious_price=suspicious_price,
        is_new=is_new,
        sort_by=sort_by,
        order=order,
        page=page,
        limit=limit,
        search=search,
        user_id=user_id
    )


@router.post("/cars", response_model=CarListingOut)
def add_car_listing(car_data: CarListingCreate, db: Session = Depends(get_db)):
    return create_car_listing(db, car_data)

@router.get("/cars/count")
def count_cars(
    brand: Optional[List[str]] = Query(None),
    model: Optional[List[str]] = Query(None),
    min_price: float = None,
    max_price: float = None,
    fuel_type: Optional[List[str]] = Query(None),
    year_min: int = None,
    year_max: int = None,
    mileage_min: int = None,
    mileage_max: int = None,
    doors: int = None,
    transmission: Optional[List[str]] = Query(None),
    drive_type: Optional[List[str]] = Query(None),
    color: Optional[List[str]] = Query(None),
    vehicle_condition: Optional[List[str]] = Query(None),
    engine_power_min: int = None,
    engine_power_max: int = None,
    previous_owners: int = None,
    itp_valid_until_before: datetime = None,
    engine_capacity_min: int = None,
    engine_capacity_max: int = None,
    seller_type: Optional[List[str]] = Query(None),
    is_new: Optional[bool] = None,
    deal_rating: Optional[str] = None,
    estimated_price: Optional[float] = None,
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
    sort_by: str = None,
    order: str = "asc",
    search: str = None,
    user_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    result = get_all_car_listings(
        db=db,
        brand=brand,
        model=model,
        min_price=min_price,
        max_price=max_price,
        fuel_type=fuel_type,
        year_min=year_min,
        year_max=year_max,
        mileage_min=mileage_min,
        mileage_max=mileage_max,
        doors=doors,
        transmission=transmission,
        drive_type=drive_type,
        color=color,
        vehicle_condition=vehicle_condition,
        engine_power_min=engine_power_min,
        engine_power_max=engine_power_max,
        previous_owners=previous_owners,
        itp_valid_until_before=itp_valid_until_before,
        engine_capacity_min=engine_capacity_min,
        engine_capacity_max=engine_capacity_max,
        seller_type=seller_type,
        deal_rating=deal_rating,
        estimated_price=estimated_price,
        version=version,
        generation=generation,
        emissions=emissions,
        origin_country=origin_country,
        first_owner=first_owner,
        no_accident=no_accident,
        service_book=service_book,
        registered=registered,
        sold=sold,
        damaged=damaged,
        right_hand_drive=right_hand_drive,
        is_new=is_new,
        sort_by=sort_by,
        order=order,
        search=search,
        user_id=user_id,
        page=1,
        limit=1,
    )
    return {"total": result["total"]}


@router.get("/cars/{car_id}", response_model=CarListingOut)
def read_car_by_id(
    car_id: int,
    user_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    car = get_car_by_id(db, car_id, user_id)
    if car is None:
        return {"error": "Car not found"}
    return car