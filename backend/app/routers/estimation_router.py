from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.dependencies import get_db
from app.models.models import CarListing
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import statistics
from app.auth.utils import get_current_user
from app.models.models import User
from app.crud import estimation_history_crud
from app.schemas.estimation_history_schema import EstimationHistoryCreate

router = APIRouter(prefix="/estimation", tags=["Price Estimation"])

class CarEstimationRequest(BaseModel):
    brand: str
    model: str
    year: int
    mileage: int
    fuel_type: str
    transmission: str
    engine_capacity: int
    drive_type: Optional[str] = None
    generation: Optional[str] = None
    right_hand_drive: Optional[bool] = None
    
class CarEstimationResponse(BaseModel):
    estimated_price: Optional[float]
    confidence_level: str
    similar_cars_count: int
    price_range: Dict[str, float]
    market_position: str
    market_comparison: Dict[str, Any]
    price_distribution: List[Dict[str, Any]]
    similar_cars_sample: List[Dict[str, Any]]

@router.post("/estimate-price", response_model=CarEstimationResponse)
def estimate_car_price(
    car_data: CarEstimationRequest, 
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    
    filters = [
        CarListing.brand == car_data.brand,
        CarListing.model == car_data.model,
        CarListing.fuel_type == car_data.fuel_type,
        CarListing.transmission == car_data.transmission,
        CarListing.engine_capacity.between(car_data.engine_capacity - 200, car_data.engine_capacity + 200),
        CarListing.year.between(car_data.year - 2, car_data.year + 2),
        CarListing.mileage.between(car_data.mileage - 15000, car_data.mileage + 15000),
        (CarListing.damaged != True) | (CarListing.damaged == None),
        (CarListing.suspicious_price != True) | (CarListing.suspicious_price == None),
        CarListing.price > 1000
    ]

    if car_data.drive_type:
        filters.append(CarListing.drive_type == car_data.drive_type)
    
    if car_data.generation:
        filters.append(CarListing.generation == car_data.generation)
    elif car_data.generation is None:
        filters.append(CarListing.generation == None)
    
    if car_data.right_hand_drive is not None:
        filters.append(CarListing.right_hand_drive == car_data.right_hand_drive)

    similar_cars = db.query(CarListing).filter(*filters).all()
    
    if len(similar_cars) < 3:
        broader_filters = [
            CarListing.brand == car_data.brand,
            CarListing.model == car_data.model,
            CarListing.fuel_type == car_data.fuel_type,
            CarListing.year.between(car_data.year - 2, car_data.year + 2),
            CarListing.mileage.between(car_data.mileage - 30000, car_data.mileage + 30000),
            (CarListing.damaged != True) | (CarListing.damaged == None),
            (CarListing.suspicious_price != True) | (CarListing.suspicious_price == None),
            CarListing.price > 1000
        ]
        similar_cars = db.query(CarListing).filter(*broader_filters).all()

    if len(similar_cars) < 3:
        raise HTTPException(
            status_code=404, 
            detail=f"Not enough similar cars found for {car_data.brand} {car_data.model}. Need at least 3 similar cars for estimation."
        )

    prices = [car.price for car in similar_cars if car.price and car.price > 0]
    
    if len(prices) < 3:
        raise HTTPException(
            status_code=404,
            detail="Not enough price data available for estimation."
        )

    estimated_price = round(statistics.median(prices), 2)
    avg_price = round(statistics.mean(prices), 2)
    min_price = round(min(prices), 2)
    max_price = round(max(prices), 2)
    
    price_std = statistics.stdev(prices) if len(prices) > 1 else 0
    confidence_level = "High" if len(similar_cars) >= 10 and price_std < (avg_price * 0.3) else \
                      "Medium" if len(similar_cars) >= 5 else "Low"
    
    price_percentile = sum(1 for p in prices if p <= estimated_price) / len(prices)
    if price_percentile < 0.33:
        market_position = "Below Average"
    elif price_percentile > 0.67:
        market_position = "Above Average"
    else:
        market_position = "Average"
    
    price_ranges = [
        (0, 5000), (5000, 10000), (10000, 15000), (15000, 20000),
        (20000, 30000), (30000, 50000), (50000, 100000), (100000, float('inf'))
    ]
    
    price_distribution = []
    for min_range, max_range in price_ranges:
        count = sum(1 for p in prices if min_range <= p < max_range)
        if count > 0:
            range_label = f"€{min_range:,} - €{max_range:,}" if max_range != float('inf') else f"€{min_range:,}+"
            price_distribution.append({
                "range": range_label,
                "count": count,
                "percentage": round((count / len(prices)) * 100, 1)
            })
    
    similar_cars_sorted = sorted(similar_cars, key=lambda x: abs(x.price - estimated_price))[:6]
    similar_cars_sample = []
    
    for car in similar_cars_sorted:
        similar_cars_sample.append({
            "id": car.id,
            "title": car.title,
            "year": car.year,
            "mileage": car.mileage,
            "price": car.price,
            "fuel_type": car.fuel_type,
            "transmission": car.transmission,
            "engine_capacity": car.engine_capacity,
            "location": car.location,
            "source_url": car.source_url,
            "images": car.images,
            "deal_rating": car.deal_rating,
            "estimated_price": car.estimated_price,
            "sold": car.sold
        })
    
    market_comparison = {
        "total_similar_cars": len(similar_cars),
        "price_variance": round(price_std, 2),
        "cheapest_similar": min_price,
        "most_expensive_similar": max_price,
        "your_estimated_rank": f"{round(price_percentile * 100)}th percentile",
        "savings_vs_highest": round(max_price - estimated_price, 2),
        "premium_vs_lowest": round(estimated_price - min_price, 2)
    }
    
    estimation_response = CarEstimationResponse(
        estimated_price=estimated_price,
        confidence_level=confidence_level,
        similar_cars_count=len(similar_cars),
        price_range={
            "min": min_price,
            "max": max_price,
            "avg": avg_price
        },
        market_position=market_position,
        market_comparison=market_comparison,
        price_distribution=price_distribution,
        similar_cars_sample=similar_cars_sample
    )
    
    if current_user:
        try:
            history_data = EstimationHistoryCreate(
                user_id=current_user.id,
                car_data=car_data.dict(),
                estimation_result=estimation_response.dict()
            )
            estimation_history_crud.create_estimation_history(db, history_data)
        except Exception as e:
            print(f"Failed to save estimation to history: {e}")
    
    return estimation_response

@router.get("/specs/{brand}/{model}")
def get_model_specifications(brand: str, model: str, db: Session = Depends(get_db)):
    cars = db.query(CarListing).filter(
        CarListing.brand == brand,
        CarListing.model == model,
        (CarListing.suspicious_price != True) | (CarListing.suspicious_price == None)
    ).all()
    
    if not cars:
        return {
            "fuel_types": [],
            "transmissions": [],
            "drive_types": [],
            "engine_capacities": [],
            "year_range": {"min": None, "max": None},
            "typical_mileage": {"min": None, "max": None, "avg": None}
        }
    
    fuel_types = list(set(car.fuel_type for car in cars if car.fuel_type))
    transmissions = list(set(car.transmission for car in cars if car.transmission))
    drive_types = list(set(car.drive_type for car in cars if car.drive_type))
    engine_capacities = sorted(list(set(car.engine_capacity for car in cars if car.engine_capacity)))
    
    years = [car.year for car in cars if car.year]
    mileages = [car.mileage for car in cars if car.mileage]
    
    return {
        "fuel_types": sorted(fuel_types),
        "transmissions": sorted(transmissions),
        "drive_types": sorted(drive_types),
        "engine_capacities": engine_capacities,
        "year_range": {
            "min": min(years) if years else None,
            "max": max(years) if years else None
        },
        "typical_mileage": {
            "min": min(mileages) if mileages else None,
            "max": max(mileages) if mileages else None,
            "avg": round(sum(mileages) / len(mileages)) if mileages else None
        }
    }