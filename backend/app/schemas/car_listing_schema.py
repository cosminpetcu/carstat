from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class CarListingOut(BaseModel):
    id: int
    title: str
    brand: str
    model: str
    price: float
    year: Optional[int]
    mileage: Optional[int]
    fuel_type: Optional[str]
    transmission: Optional[str]
    engine_power: Optional[int]
    emission_standard: Optional[str]
    doors: Optional[int]
    nr_seats: Optional[int]
    color: Optional[str]
    color_type: Optional[str]
    traction: Optional[str]
    drive_type: Optional[str]
    vehicle_condition: Optional[str]
    previous_owners: Optional[int]
    itp_valid_until: Optional[datetime]
    vin: Optional[str]
    location: Optional[str]
    description: Optional[str]
    engine_capacity: Optional[int]
    seller_type: Optional[str]
    is_new: Optional[bool]
    images: Optional[str] = None
    source_url: Optional[str]
    deal_rating: Optional[str]
    estimated_price: Optional[float]
    version: Optional[str]
    generation: Optional[str]
    emissions: Optional[str]
    consumption_city: Optional[str]
    consumption_highway: Optional[str]
    consumption_mixed: Optional[str]
    origin_country: Optional[str]
    first_owner: Optional[bool]
    no_accident: Optional[bool]
    service_book: Optional[bool]
    registered: Optional[bool]
    features: Optional[str]
    ad_created_at: Optional[datetime]
    price_history: Optional[str]
    sold: Optional[bool]
    damaged: Optional[bool]
    right_hand_drive: Optional[bool]
    views: Optional[int]
    created_at: datetime
    is_favorite: Optional[bool] = False
    
    class Config:
        from_attributes = True

class CarListingCreate(BaseModel):
    title: str
    brand: str
    model: str
    price: float
    year: int
    mileage: int
    fuel_type: str
    transmission: Optional[str]
    engine_power: Optional[int]
    emission_standard: Optional[str]
    doors: Optional[int]
    color: Optional[str]
    drive_type: Optional[str]
    vehicle_condition: Optional[str]
    previous_owners: Optional[int]
    itp_valid_until: Optional[datetime]
    vin: Optional[str]
    location: str
    description: Optional[str]
    engine_capacity: Optional[int]
    seller_type: Optional[str]
    is_new: Optional[bool]
    images: Optional[str]
    source_url: Optional[str]


