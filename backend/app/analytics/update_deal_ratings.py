from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.models import CarListing
from tqdm import tqdm
import statistics
from datetime import datetime

def is_suspicious_price(car, db):
    placeholder_prices = [1, 123, 1111, 1234]
    
    if car.price in placeholder_prices or car.price < 100:
        return True
    
    if car.estimated_price and car.price < (car.estimated_price * 0.2):
        return True
        
    threshold = 0.3
    similar_cars = db.query(CarListing).filter(
        CarListing.brand == car.brand,
        CarListing.model == car.model,
        CarListing.year.between(car.year - 3, car.year + 3),
        CarListing.price > 1000,
        CarListing.damaged != True
    ).all()
    
    if len(similar_cars) >= 5:
        prices = [c.price for c in similar_cars if c.price]
        if prices:
            median_price = statistics.median(prices)
            
            if car.price < threshold * median_price:
                return True
    
    return False

def calculate_quality_score(car):
    score = 50
    max_score = 100
    
    if car.mileage is not None:
        if car.mileage < 10000:
            score += 15
        elif car.mileage < 50000:
            score += 10
        elif car.mileage < 100000:
            score += 5
        elif car.mileage > 200000:
            score -= 5
        elif car.mileage > 250000:
            score -= 10
        elif car.mileage > 300000:
            score -= 15
        elif car.mileage > 400000:
            score -= 20
            
        avg_yearly_mileage = car.mileage / max(1, (datetime.now().year - car.year))
        
        if avg_yearly_mileage < 10000:
            score += 10
        elif avg_yearly_mileage < 15000:
            score += 5
        elif avg_yearly_mileage > 25000:
            score -= 5
        elif avg_yearly_mileage > 35000:
            score -= 10
    
    if car.service_book == True:
        score += 15
    
    if car.no_accident == True:
        score += 15
    
    if car.first_owner == True:
        score += 10
    
    car_age = datetime.now().year - car.year
    if car_age < 3:
        score += 10
    elif car_age < 5:
        score += 8
    elif car_age < 7:
        score += 6
    elif car_age < 10:
        score += 4
    elif car_age < 15:
        score += 2
    
    if car.registered == True:
        score += 5
    
    if car.transmission and "automat" in car.transmission.lower():
        score += 10
    
    if car.right_hand_drive == True:
        score -= 15
    
    if car.deal_rating == "S":
        score += 10
    elif car.deal_rating == "A":
        score += 7
    elif car.deal_rating == "B":
        score += 5
    elif car.deal_rating == "D":
        score -= 5
    elif car.deal_rating == "E":
        score -= 7
    elif car.deal_rating == "F":
        score -= 10
    
    return max(0, min(max_score, score))

def update_deal_ratings():
    db = SessionLocal()
    cars = db.query(CarListing).all()
    total = len(cars)
    updated = 0
    flagged_suspicious = 0
    errors = 0

    for car in tqdm(cars, desc="Pass 0 - Flag suspicious prices"):
        if car.price:
            if car.price in [1, 123, 1111, 1234] or car.price < 100:
                car.suspicious_price = True
                flagged_suspicious += 1

    db.commit()

    for car in tqdm(cars, desc="Pass 1 - Calculate estimated prices"):
        try:
            if car.suspicious_price == True or car.damaged == True:
                continue
                
            if not car.price or not car.year or not car.mileage or not car.engine_capacity or not car.fuel_type or not car.transmission or not car.drive_type:
                continue

            filters = [
                CarListing.id != car.id,
                CarListing.brand == car.brand,
                CarListing.model == car.model,
                CarListing.fuel_type == car.fuel_type,
                CarListing.transmission == car.transmission,
                CarListing.engine_capacity.between(car.engine_capacity - 200, car.engine_capacity + 200) if car.engine_capacity else True,
                CarListing.year.between(car.year - 2, car.year + 2) if car.year else True,
                CarListing.mileage.between(car.mileage - 30000, car.mileage + 30000) if car.mileage else True,
                CarListing.drive_type == car.drive_type if car.drive_type else True,
                (CarListing.damaged != True) | (CarListing.damaged == None),
                (CarListing.suspicious_price != True) | (CarListing.suspicious_price == None),
            ]

            if car.right_hand_drive is not None:
                filters.append(CarListing.right_hand_drive == car.right_hand_drive)

            if car.generation:
                filters.append(CarListing.generation == car.generation)
            else:
                filters.append(CarListing.generation == None)

            similar_cars = db.query(CarListing).filter(*filters).all()

            if len(similar_cars) < 5:
                continue

            prices = [c.price for c in similar_cars if c.price and c.price > 0]
            if len(prices) < 5:
                continue

            average_price = round(statistics.median(prices), 2)
            car.estimated_price = average_price

            price_diff_percentage = ((car.price - average_price) / average_price) * 100

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
        except Exception as e:
            print(f"Error processing car ID {car.id}: {str(e)}")
            errors += 1

    db.commit()
    print(f"Pass 1 completed: {updated} cars processed, {errors} errors")
    
    flagged_in_pass2 = 0
    errors = 0
    
    for car in tqdm(cars, desc="Pass 2 - Flag abnormal prices"):
        try:
            if car.suspicious_price == True or not car.estimated_price:
                continue
                
            if car.price < (car.estimated_price * 0.2):
                car.suspicious_price = True
                car.deal_rating = None
                flagged_in_pass2 += 1
                flagged_suspicious += 1
                continue
                
            if is_suspicious_price(car, db):
                car.suspicious_price = True
                car.deal_rating = None
                flagged_in_pass2 += 1
                flagged_suspicious += 1
        except Exception as e:
            print(f"Error in Pass 2 for car ID {car.id}: {str(e)}")
            errors += 1
    
    db.commit()
    print(f"Pass 2 completed: {flagged_in_pass2} cars flagged, {errors} errors")
    
    quality_scores_updated = 0
    errors = 0
    
    for car in tqdm(cars, desc="Pass 3 - Calculate quality scores"):
        try:
            if car.suspicious_price == True or car.damaged == True:
                continue
                
            car.quality_score = calculate_quality_score(car)
            quality_scores_updated += 1
        except Exception as e:
            print(f"Error in Pass 3 for car ID {car.id}: {str(e)}")
            errors += 1
    
    db.commit()
    db.close()
    
    print(f"\nUpdated {updated} cars out of {total}")
    print(f"Flagged as suspicious: {flagged_suspicious} cars")
    print(f"Quality scores updated: {quality_scores_updated} cars")

if __name__ == "__main__":
    update_deal_ratings()