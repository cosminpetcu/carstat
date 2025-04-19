from pydantic import BaseModel
from app.schemas.car_listing_schema import CarListingOut

class FavoriteCreate(BaseModel):
    user_id: int
    car_id: int

class FavoriteOut(BaseModel):
    id: int
    user_id: int
    car: CarListingOut

    class Config:
        orm_mode = True
