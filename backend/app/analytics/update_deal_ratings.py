from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.models import CarListing
from tqdm import tqdm # type: ignore
import statistics
from datetime import datetime

def is_suspicious_price_heuristic(car):
    placeholder_prices = [1, 123, 1111, 1234]
    
    if car.price in placeholder_prices or car.price < 100:
        return True
    
    if car.year and car.year >= 2020:
        if car.brand in ["Toyota", "Honda", "Ford", "Volkswagen"] and car.price > 60000:
            return True
        if car.brand in ["Dacia", "Skoda", "Seat"] and car.price > 40000:
            return True
        if car.brand in ["Fiat", "Peugeot", "Citroen"] and car.price > 45000:
            return True
    
    if car.year and car.year > 2010:
        if car.brand in ["BMW", "Mercedes-Benz", "Audi"] and car.price < 3000:
            return True
        if car.brand in ["Porsche", "Ferrari", "Lamborghini"] and car.price < 15000:
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
    
    if car.transmission and "automatic" in car.transmission.lower():
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
    
    print(f"Începe procesarea pentru {total} mașini cu algoritmul îmbunătățit...")

    flagged_obvious = 0
    
    for car in tqdm(cars, desc="Pass 0 - Flag placeholder prices"):
        if car.price and (car.price in [1, 123, 1111, 1234] or car.price < 100):
            car.suspicious_price = True
            flagged_obvious += 1
    
    db.commit()
    print(f"Pass 0 completat: {flagged_obvious} prețuri placeholder detectate")

    flagged_outliers = 0
    errors = 0
    
    for car in tqdm(cars, desc="Pass 1 - Detect extreme outliers"):
        try:
            if car.suspicious_price == True or not car.price:
                continue
            
            if is_suspicious_price_heuristic(car):
                car.suspicious_price = True
                flagged_outliers += 1
                continue
            
            if not car.year or not car.brand or not car.model:
                continue
                
            similar_cars = db.query(CarListing).filter(
                CarListing.id != car.id,
                CarListing.brand == car.brand,
                CarListing.model == car.model,
                CarListing.year.between(car.year - 3, car.year + 3),
                CarListing.price > 1000,
                CarListing.price < 200000,
                (CarListing.damaged != True) | (CarListing.damaged == None),
                (CarListing.suspicious_price != True) | (CarListing.suspicious_price == None)
            ).all()
            
            if len(similar_cars) >= 5:
                prices = [c.price for c in similar_cars if c.price and c.price > 0]
                if len(prices) >= 5:
                    median_price = statistics.median(prices)
                    
                    if car.price < median_price * 0.15 or car.price > median_price * 6:
                        car.suspicious_price = True
                        flagged_outliers += 1
                        
        except Exception as e:
            print(f"Error în Pass 1 pentru car ID {car.id}: {str(e)}")
            errors += 1
    
    db.commit()
    print(f"Pass 1 completat: {flagged_outliers} outliers detectați, {errors} erori")
    
    estimated_updated = 0
    errors = 0
    
    for car in tqdm(cars, desc="Pass 2 - Calculate estimated prices"):
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
                CarListing.engine_capacity.between(car.engine_capacity - 50, car.engine_capacity + 50) if car.engine_capacity else True,
                CarListing.engine_power.between(car.engine_power - 20, car.engine_power + 20) if car.engine_power else True,
                CarListing.mileage.between(car.mileage - 10000, car.mileage + 10000) if car.mileage else True,
                CarListing.year.between(car.year - 1, car.year + 1) if car.year else True,
                (CarListing.damaged != True) | (CarListing.damaged == None),
                (CarListing.suspicious_price != True) | (CarListing.suspicious_price == None),
                CarListing.price > 1000
            ]

            if car.right_hand_drive is not None:
                filters.append(CarListing.right_hand_drive == car.right_hand_drive)

            if car.generation:
                filters.append(CarListing.generation == car.generation)
            else:
                filters.append(CarListing.generation == None)

            similar_cars = db.query(CarListing).filter(*filters).all()

            if len(similar_cars) < 4:
                continue

            prices = [c.price for c in similar_cars if c.price and c.price > 0]
            if len(prices) < 4:
                continue

            estimated_price = round(statistics.median(prices), 2)
            car.estimated_price = estimated_price

            price_diff_percentage = ((car.price - estimated_price) / estimated_price) * 100

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

            estimated_updated += 1
            
        except Exception as e:
            print(f"Error în Pass 2 pentru car ID {car.id}: {str(e)}")
            errors += 1

    db.commit()
    print(f"Pass 2 completat: {estimated_updated} estimated prices calculate, {errors} erori")
    
    flagged_final = 0
    errors = 0
    
    for car in tqdm(cars, desc="Pass 3 - Final suspicious detection"):
        try:
            if car.suspicious_price == True or not car.estimated_price:
                continue
                
            if car.price < (car.estimated_price * 0.12):
                car.suspicious_price = True
                car.deal_rating = None
                car.estimated_price = None
                flagged_final += 1
                
        except Exception as e:
            print(f"Error în Pass 3 pentru car ID {car.id}: {str(e)}")
            errors += 1
    
    db.commit()
    print(f"Pass 3 completat: {flagged_final} prețuri suspicious finale, {errors} erori")

    quality_scores_updated = 0
    errors = 0
    
    for car in tqdm(cars, desc="Pass 4 - Calculate quality scores"):
        try:
            if car.suspicious_price == True or car.damaged == True:
                continue
                
            car.quality_score = calculate_quality_score(car)
            quality_scores_updated += 1
            
        except Exception as e:
            print(f"Error în Pass 4 pentru car ID {car.id}: {str(e)}")
            errors += 1
    
    db.commit()
    db.close()
    
    total_suspicious = flagged_obvious + flagged_outliers + flagged_final
    
    print(f"\n" + "="*60)
    print(f"PROCESARE COMPLETĂ")
    print(f"="*60)
    print(f"Total mașini procesate: {total:,}")
    print(f"Estimated prices calculate: {estimated_updated:,}")
    print(f"Quality scores calculate: {quality_scores_updated:,}")
    print(f"Total suspicious detectate: {total_suspicious:,}")
    print(f"  - Placeholder prices: {flagged_obvious:,}")
    print(f"  - Extreme outliers: {flagged_outliers:,}")
    print(f"  - Final detection: {flagged_final:,}")
    print(f"="*60)

if __name__ == "__main__":
    update_deal_ratings()