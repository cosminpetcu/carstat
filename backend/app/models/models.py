from sqlalchemy import Column, Integer, String, Float, DateTime
from app.database import Base
from datetime import datetime
from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy import UniqueConstraint
from sqlalchemy import Boolean

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)

class CarListing(Base):
    __tablename__ = "car_listings"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    brand = Column(String)
    model = Column(String)
    price = Column(Float)
    year = Column(Integer)
    mileage = Column(Integer)
    fuel_type = Column(String)
    transmission = Column(String)
    engine_power = Column(Integer)
    emission_standard = Column(String)
    doors = Column(Integer)
    color = Column(String)
    drive_type = Column(String)
    vehicle_condition = Column(String)
    previous_owners = Column(Integer)
    itp_valid_until = Column(DateTime)
    vin = Column(String, unique=True, index=True)
    location = Column(String)
    description = Column(String)
    seller_type = Column(String)
    engine_capacity = Column(Integer)
    is_new = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Favorite(Base):
    __tablename__ = "favorites"
    __table_args__ = (UniqueConstraint("user_id", "car_id", name="unique_user_car"),)

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    car_id = Column(Integer, ForeignKey("car_listings.id"))
    
    car = relationship("CarListing")
