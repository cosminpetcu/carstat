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
    color: Optional[str]
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
    created_at: datetime
    is_favorite: Optional[bool] = False
    
    class Config:
        orm_mode = True

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


