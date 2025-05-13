from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from app.database import Base
from datetime import datetime
from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy import UniqueConstraint
from sqlalchemy import Boolean

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    saved_searches = relationship("SavedSearch", back_populates="user")

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
    nr_seats = Column(Integer, nullable=True)
    color = Column(String)
    color_type = Column(String, nullable=True)
    traction = Column(String, nullable=True)
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
    images = Column(Text)
    source_url = Column(String)
    deal_rating = Column(String, nullable=True)
    version = Column(String, nullable=True)
    generation = Column(String, nullable=True)
    emissions = Column(String, nullable=True)
    consumption_city = Column(String, nullable=True)
    consumption_highway = Column(String, nullable=True)
    consumption_mixed = Column(String, nullable=True)
    origin_country = Column(String, nullable=True)
    first_owner = Column(Boolean, nullable=True)
    no_accident = Column(Boolean, nullable=True)
    service_book = Column(Boolean, nullable=True)
    registered = Column(Boolean, nullable=True)
    features = Column(Text, nullable=True)
    ad_created_at = Column(DateTime, nullable=True)
    price_history = Column(Text, nullable=True)
    sold = Column(Boolean, default=False)
    sold_detected_at = Column(DateTime, nullable=True)
    estimated_price = Column(Float, nullable=True)
    damaged = Column(Boolean, nullable=True)
    right_hand_drive = Column(Boolean, nullable=True)
    views = Column(Integer, nullable=True)
    battery_capacity = Column(Float, nullable=True)
    range_km = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Favorite(Base):
    __tablename__ = "favorites"
    __table_args__ = (UniqueConstraint("user_id", "car_id", name="unique_user_car"),)

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    car_id = Column(Integer, ForeignKey("car_listings.id"))
    
    car = relationship("CarListing")

class SavedSearch(Base):
    __tablename__ = "saved_searches"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    query = Column(String, nullable=False)

    user = relationship("User", back_populates="saved_searches")
    
class IncompleteDataStats(Base):
    __tablename__ = "incomplete_data_stats"

    id = Column(Integer, primary_key=True, index=True)
    source = Column(String, nullable=False)
    total_incomplete = Column(Integer, default=0)
    valid_cars_added = Column(Integer, default=0)
    total_runs = Column(Integer, default=0)
    no_title = Column(Integer, default=0)
    no_price = Column(Integer, default=0)
    no_brand = Column(Integer, default=0)
    no_model = Column(Integer, default=0)
    no_year = Column(Integer, default=0)
    no_mileage = Column(Integer, default=0)
    no_fuel_type = Column(Integer, default=0)
    no_transmission = Column(Integer, default=0)
    no_engine_capacity = Column(Integer, default=0)
    last_update = Column(DateTime, default=datetime.utcnow)