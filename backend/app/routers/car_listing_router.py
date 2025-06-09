from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.dependencies import get_db
from app.schemas.car_listing_schema import CarListingOut, CarListingCreate
from app.models.models import CarListing
from app.crud.car_listing_crud import (
    get_all_car_listings,
    create_car_listing,
    get_car_by_id
)
from typing import List, Optional, Dict, Any
from datetime import datetime
from sqlalchemy import func

router = APIRouter()

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
    quality_score_min: Optional[int] = None,
    quality_score_max: Optional[int] = None,
    suspicious_price: Optional[bool] = None,
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
        quality_score_min=quality_score_min,
        quality_score_max=quality_score_max,
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

@router.get("/cars/model-stats")
def get_car_model_stats(
    brand: str,
    model: str,
    db: Session = Depends(get_db)
):
    cars = db.query(CarListing).filter(
        CarListing.brand == brand,
        CarListing.model == model,
        (CarListing.suspicious_price != True) | (CarListing.suspicious_price == None),
        (CarListing.damaged != True) | (CarListing.damaged == None)
    ).all()
    
    if not cars:
        return {
            "totalCount": 0,
            "averagePrice": 0,
            "averageMileage": 0,
            "averageYear": 0,
            "soldCount": 0,
            "avgSaleTime": None,
            "priceDistribution": [],
            "yearDistribution": [],
            "fuelTypeDistribution": [],
            "transmissionDistribution": []
        }
    
    total_count = len(cars)
    
    prices = [car.price for car in cars if car.price is not None]
    mileages = [car.mileage for car in cars if car.mileage is not None]
    years = [car.year for car in cars if car.year is not None]
    
    avg_price = sum(prices) / len(prices) if prices else 0
    avg_mileage = sum(mileages) / len(mileages) if mileages else 0
    avg_year = round(sum(years) / len(years)) if years else 0
    
    sold_cars = [car for car in cars if car.sold == True]
    sold_count = len(sold_cars)
    
    avg_sale_time = None
    if sold_cars:
        cars_with_sale_data = [car for car in sold_cars 
                              if car.created_at is not None and car.sold_detected_at is not None]
        
        if cars_with_sale_data:
            sale_times = [(car.sold_detected_at - car.created_at).days 
                          for car in cars_with_sale_data]
            
            avg_sale_time = round(sum(max(0, days) for days in sale_times) / len(sale_times))
    
    if prices:
        min_price = min(prices)
        max_price = max(prices)
        price_range = max_price - min_price
    else:
        min_price = 0
        max_price = 0
        price_range = 0
    
    price_brackets = 8
    bracket_size = price_range / price_brackets if price_range > 0 else 1000
    
    price_distribution = []
    for i in range(price_brackets):
        min_bracket = min_price + (i * bracket_size)
        max_bracket = min_price + ((i + 1) * bracket_size)
        
        count = sum(1 for car in cars if car.price is not None and min_bracket <= car.price < max_bracket)
        
        price_distribution.append({
            "range": f"€{int(min_bracket):,} - €{int(max_bracket):,}",
            "count": count,
            "minPrice": min_bracket,
            "maxPrice": max_bracket
        })
    
    if years:
        min_year = min(years)
        max_year = max(years)
    else:
        min_year = 0
        max_year = 0
    
    year_distribution = []
    for year in range(min_year, max_year + 1):
        count = sum(1 for car in cars if car.year == year)
        year_distribution.append({
            "year": year,
            "count": count
        })
    
    fuel_types = {}
    for car in cars:
        if car.fuel_type:
            fuel_types[car.fuel_type] = fuel_types.get(car.fuel_type, 0) + 1
    
    fuel_type_distribution = [{"type": fuel, "count": count} for fuel, count in fuel_types.items()]
    
    transmissions = {}
    for car in cars:
        if car.transmission:
            transmissions[car.transmission] = transmissions.get(car.transmission, 0) + 1
    
    transmission_distribution = [{"type": trans, "count": count} for trans, count in transmissions.items()]
    
    return {
        "totalCount": total_count,
        "averagePrice": avg_price,
        "averageMileage": avg_mileage,
        "averageYear": avg_year,
        "soldCount": sold_count,
        "avgSaleTime": avg_sale_time,
        "priceDistribution": price_distribution,
        "yearDistribution": year_distribution,
        "fuelTypeDistribution": fuel_type_distribution,
        "transmissionDistribution": transmission_distribution
    }
    
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

@router.get("/cars/{car_id}/similar")
def get_similar_cars(
    car_id: int,
    limit: int = 12,
    db: Session = Depends(get_db)
):
    car = db.query(CarListing).filter(CarListing.id == car_id).first()
    if not car:
        return {"error": "Car not found"}
    
    similar_cars = (
        db.query(CarListing)
        .filter(
            CarListing.id != car_id,
            CarListing.brand == car.brand,
            CarListing.model == car.model,
            CarListing.sold == False,
            (CarListing.suspicious_price != True) | (CarListing.suspicious_price == None),
            CarListing.year.between(car.year - 3, car.year + 3) if car.year else True,
            CarListing.engine_capacity.between(car.engine_capacity - 300, car.engine_capacity + 300) if car.engine_capacity else True,
            CarListing.fuel_type == car.fuel_type if car.fuel_type else True,
        )
        .order_by(func.abs(CarListing.price - car.price))
        .limit(limit)
        .all()
    )
    
    return [CarListingOut.from_orm(similar_car) for similar_car in similar_cars]