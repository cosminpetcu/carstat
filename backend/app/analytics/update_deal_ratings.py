from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.models import CarListing
from tqdm import tqdm

def update_deal_ratings():
    db: Session = SessionLocal()
    cars = db.query(CarListing).all()
    total = len(cars)
    updated = 0

    for car in tqdm(cars, desc="Procesare mașini"):
        if not all([car.price, car.year, car.mileage, car.engine_capacity, car.fuel_type, car.transmission, car.drive_type]):
            continue

        filters = [
            CarListing.id != car.id,
            CarListing.brand == car.brand,
            CarListing.model == car.model,
            CarListing.fuel_type == car.fuel_type,
            CarListing.transmission == car.transmission,
            CarListing.engine_capacity.between(car.engine_capacity - 200, car.engine_capacity + 200),
            CarListing.year.between(car.year - 2, car.year + 2),
            CarListing.mileage.between(car.mileage - 30000, car.mileage + 30000),
            CarListing.drive_type == car.drive_type,
        ]

        if car.generation:
            filters.append(CarListing.generation == car.generation)

        similar_cars = db.query(CarListing).filter(*filters).all()

        if len(similar_cars) < 5:
            car.deal_rating = None
            car.estimated_price = None
            continue

        prices = [c.price for c in similar_cars if c.price]
        if not prices:
            car.deal_rating = None
            car.estimated_price = None
            continue

        average_price = round(sum(prices) / len(prices), 2)
        car.estimated_price = average_price

        price_diff_percentage = (car.price - average_price) / average_price * 100

        if price_diff_percentage <= -35:
            car.deal_rating = "S"
        elif -35 < price_diff_percentage <= -15:
            car.deal_rating = "A"
        elif -15 < price_diff_percentage <= -5:
            car.deal_rating = "B"
        elif -5 < price_diff_percentage <= 5:
            car.deal_rating = "C"
        elif 5 < price_diff_percentage <= 15:
            car.deal_rating = "D"
        elif 15 < price_diff_percentage <= 30:
            car.deal_rating = "E"
        else:
            car.deal_rating = "F"

        updated += 1

    db.commit()
    db.close()
    print(f"\nActualizate {updated} mașini din {total}.")

if __name__ == "__main__":
    update_deal_ratings()
