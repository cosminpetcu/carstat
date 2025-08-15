from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.dependencies import get_db
from app.models.models import CarListing
from sqlalchemy import func
import json
from datetime import datetime, timedelta

router = APIRouter(prefix="/analytics", tags=["Analytics"])

# @router.get("/top-deals")
# def get_top_super_deals(db: Session = Depends(get_db)):
#     six_months_ago = datetime.utcnow() - timedelta(days=180)
    
#     premium_deals = (
#         db.query(CarListing)
#         .filter(
#             CarListing.deal_rating.in_(["S", "A"]),
#             CarListing.estimated_price > 8000,
#             CarListing.price > 5000,
#             CarListing.price != None,
#             CarListing.estimated_price != None,
#             CarListing.year > 2012,
#             CarListing.mileage < 150000,
#             CarListing.sold == False,
#             (CarListing.suspicious_price != True) | (CarListing.suspicious_price == None),
#             CarListing.created_at > six_months_ago
#         )
#         .order_by(
#             CarListing.deal_rating,
#             (CarListing.quality_score * 
#              (CarListing.estimated_price - CarListing.price) / CarListing.estimated_price).desc().nulls_last()
#         )
#         .limit(15)
#         .all()
#     )

#     by_brand = {}
#     for car in premium_deals:
#         if car.brand not in by_brand:
#             by_brand[car.brand] = []
#         by_brand[car.brand].append(car)
    
#     top_picks = []
#     brands_priority = ["BMW", "Mercedes-Benz", "Audi", "Volkswagen", "Ford", "Volvo", "Toyota"]
    
#     for brand in brands_priority:
#         if brand in by_brand and len(by_brand[brand]) > 0:
#             sorted_cars = sorted(
#                 by_brand[brand],
#                 key=lambda c: (
#                     (0 if c.deal_rating == "S" else 1),
#                     -c.quality_score if c.quality_score else 0,
#                     -(c.estimated_price - c.price) / c.estimated_price if c.estimated_price else 0
#                 )
#             )
#             top_picks.append(sorted_cars[0])
#             by_brand[brand].remove(sorted_cars[0])
         
#             if len(top_picks) >= 5:
#                 break
    
#     if len(top_picks) < 5:
#         other_brands = [b for b in by_brand.keys() if b not in brands_priority]
#         for brand in other_brands:
#             if len(top_picks) >= 5:
#                 break
#             if len(by_brand[brand]) > 0:
#                 sorted_cars = sorted(
#                     by_brand[brand],
#                     key=lambda c: (
#                         (0 if c.deal_rating == "S" else 1),
#                         -c.quality_score if c.quality_score else 0,
#                         -(c.estimated_price - c.price) / c.estimated_price if c.estimated_price else 0
#                     )
#                 )
#                 top_picks.append(sorted_cars[0])
    
#     remaining_slots = 5 - len(top_picks)
#     if remaining_slots > 0:
#         for brand in brands_priority:
#             if remaining_slots <= 0:
#                 break
#             if brand in by_brand and len(by_brand[brand]) > 0:
#                 top_picks.append(by_brand[brand][0])
#                 by_brand[brand].pop(0)
#                 remaining_slots -= 1
    
#     final_top_5 = top_picks[:5]
    
#     return [car_listing_to_dict(c) for c in final_top_5]


# def car_listing_to_dict(car: CarListing):
#     return {
#         "id": car.id,
#         "title": car.title,
#         "brand": car.brand,
#         "model": car.model,
#         "price": car.price,
#         "estimated_price": car.estimated_price,
#         "deal_rating": car.deal_rating,
#         "year": car.year,
#         "fuel_type": car.fuel_type,
#         "transmission": car.transmission,
#         "mileage": car.mileage,
#         "images": car.images,
#     }

# @router.get("/deal-rating-distribution")
# def get_rating_distribution(db: Session = Depends(get_db)):
#     results = (
#         db.query(CarListing.deal_rating, func.count())
#         .filter(
#             CarListing.sold == False,
#             (CarListing.suspicious_price != True) | (CarListing.suspicious_price == None)
#         )
#         .group_by(CarListing.deal_rating)
#         .all()
#     )

#     distribution = [{"rating": r if r else "Unrated", "count": c} for r, c in results]
#     return distribution

# @router.get("/top-locations")
# def get_top_locations(db: Session = Depends(get_db)):
#     results = (
#         db.query(CarListing.location, func.count(CarListing.id).label("count"))
#         .filter(
#             CarListing.location != None,
#             CarListing.sold == False,
#             (CarListing.suspicious_price != True) | (CarListing.suspicious_price == None)
#         )
#         .group_by(CarListing.location)
#         .order_by(func.count(CarListing.id).desc())
#         .limit(10)
#         .all()
#     )

#     return [{"location": loc, "count": count} for loc, count in results]

# @router.get("/brand-stats")
# def get_brand_statistics(db: Session = Depends(get_db)):
#     query = db.execute(text("""
#         SELECT 
#             brand,
#             COUNT(*) as total_count,
#             SUM(CASE WHEN sold = true THEN 1 ELSE 0 END) as sold_count,
#             AVG(CASE WHEN sold = true AND sold_detected_at IS NOT NULL AND created_at IS NOT NULL
#                 THEN EXTRACT(EPOCH FROM (sold_detected_at - created_at))/86400
#                 ELSE NULL END) as avg_sell_time_days
#         FROM car_listings
#         WHERE brand IS NOT NULL
#         AND (suspicious_price IS NULL OR suspicious_price = false)
#         GROUP BY brand
#         ORDER BY total_count DESC
#         LIMIT 10
#     """))
    
#     results = []
#     for row in query:
#         results.append({
#             "brand": row[0],
#             "count": row[1],
#             "soldCount": row[2] or 0,
#             "avgSellTime": round(row[3] or 0, 1)
#         })
    
#     return results

# @router.get("/model-stats")
# def get_model_statistics(db: Session = Depends(get_db)):
#     query = db.execute(text("""
#         SELECT 
#             brand,
#             model,
#             COUNT(*) as total_count,
#             SUM(CASE WHEN sold = true THEN 1 ELSE 0 END) as sold_count,
#             AVG(price) as avg_price
#         FROM car_listings
#         WHERE model IS NOT NULL AND brand IS NOT NULL
#         AND (suspicious_price IS NULL OR suspicious_price = false)
#         GROUP BY brand, model
#         ORDER BY total_count DESC
#         LIMIT 10
#     """))
    
#     results = []
#     for row in query:
#         results.append({
#             "brand": row[0],
#             "model": row[1],
#             "count": row[2],
#             "soldCount": row[3] or 0,
#             "avgPrice": round(row[4] or 0, 2)
#         })
    
#     return results

# @router.get("/price-stats")
# def get_price_statistics(db: Session = Depends(get_db)):
#     price_ranges = [
#         (0, 5000),
#         (5000, 10000),
#         (10000, 15000),
#         (15000, 20000),
#         (20000, 30000),
#         (30000, 50000),
#         (50000, 1000000)
#     ]
    
#     results = []
#     for i, (min_price, max_price) in enumerate(price_ranges):
#         if i == len(price_ranges) - 1:
#             range_label = f"> €{min_price:,}"
#             price_filter = f"price >= {min_price}"
#         else:
#             range_label = f"€{min_price:,} - €{max_price:,}"
#             price_filter = f"price >= {min_price} AND price < {max_price}"
        
#         total_count = db.execute(text(f"""
#             SELECT COUNT(*) FROM car_listings 
#             WHERE {price_filter}
#             AND (suspicious_price IS NULL OR suspicious_price = false)
#         """)).scalar() or 0
        
#         sold_count = db.execute(text(f"""
#             SELECT COUNT(*) FROM car_listings 
#             WHERE {price_filter} AND sold = true
#             AND (suspicious_price IS NULL OR suspicious_price = false)
#         """)).scalar() or 0
        
#         sold_percentage = round((sold_count / total_count) * 100, 1) if total_count > 0 else 0
        
#         results.append({
#             "range": range_label,
#             "count": total_count,
#             "soldCount": sold_count,
#             "soldPercentage": sold_percentage
#         })
    
#     return results

# @router.get("/market-summary")
# def get_market_summary(db: Session = Depends(get_db)):
#     total_listings = db.query(CarListing).filter(
#         (CarListing.suspicious_price != True) | (CarListing.suspicious_price == None)
#     ).count()
    
#     active_listings = db.query(CarListing).filter(
#         CarListing.sold != True,
#         (CarListing.suspicious_price != True) | (CarListing.suspicious_price == None)
#     ).count()
    
#     total_sold = db.query(CarListing).filter(
#         CarListing.sold == True,
#         (CarListing.suspicious_price != True) | (CarListing.suspicious_price == None)
#     ).count()
    
#     avg_sell_time = db.execute(text("""
#         SELECT AVG(EXTRACT(EPOCH FROM (sold_detected_at - created_at))/86400)
#         FROM car_listings
#         WHERE sold = true AND sold_detected_at IS NOT NULL AND created_at IS NOT NULL
#         AND (suspicious_price IS NULL OR suspicious_price = false)
#     """)).scalar() or 0
    
#     avg_price = db.execute(text("""
#         SELECT AVG(price)
#         FROM car_listings
#         WHERE price IS NOT NULL 
#         AND (sold IS NULL OR sold = false)
#         AND (suspicious_price IS NULL OR suspicious_price = false)
#     """)).scalar() or 0
    
#     return {
#         "totalListings": total_listings,
#         "activeListings": active_listings,
#         "totalSold": total_sold,
#         "averageSellTime": round(avg_sell_time, 1),
#         "averagePrice": round(avg_price, 2)
#     }
    
# @router.get("/detailed-price-stats")
# def get_detailed_price_statistics(db: Session = Depends(get_db)):
#     brand_prices = db.execute(text("""
#         SELECT 
#             brand,
#             AVG(price) as avg_price,
#             COUNT(*) as count
#         FROM car_listings
#         WHERE price IS NOT NULL 
#         AND brand IS NOT NULL
#         AND (sold IS NULL OR sold = false)
#         AND (suspicious_price IS NULL OR suspicious_price = false)
#         GROUP BY brand
#         HAVING COUNT(*) > 10
#         ORDER BY avg_price DESC
#         LIMIT 10
#     """)).fetchall()
    
#     year_prices = db.execute(text("""
#         SELECT 
#             year,
#             AVG(price) as avg_price,
#             COUNT(*) as count
#         FROM car_listings
#         WHERE price IS NOT NULL 
#         AND year IS NOT NULL
#         AND (sold IS NULL OR sold = false)
#         AND (suspicious_price IS NULL OR suspicious_price = false)
#         GROUP BY year
#         HAVING COUNT(*) > 5
#         ORDER BY year DESC
#         LIMIT 20
#     """)).fetchall()
    
#     fuel_prices = db.execute(text("""
#         SELECT 
#             fuel_type,
#             AVG(price) as avg_price,
#             COUNT(*) as count
#         FROM car_listings
#         WHERE price IS NOT NULL 
#         AND fuel_type IS NOT NULL
#         AND (sold IS NULL OR sold = false)
#         AND (suspicious_price IS NULL OR suspicious_price = false)
#         GROUP BY fuel_type
#         HAVING COUNT(*) > 5
#         ORDER BY avg_price DESC
#     """)).fetchall()
    
#     transmission_prices = db.execute(text("""
#         SELECT 
#             transmission,
#             AVG(price) as avg_price,
#             COUNT(*) as count
#         FROM car_listings
#         WHERE price IS NOT NULL 
#         AND transmission IS NOT NULL
#         AND (sold IS NULL OR sold = false)
#         AND (suspicious_price IS NULL OR suspicious_price = false)
#         GROUP BY transmission
#         HAVING COUNT(*) > 5
#         ORDER BY avg_price DESC
#     """)).fetchall()
    
#     return {
#         "brandPrices": [
#             {"brand": row[0], "avgPrice": round(row[1], 2), "count": row[2]} 
#             for row in brand_prices
#         ],
#         "yearPrices": [
#             {"year": row[0], "avgPrice": round(row[1], 2), "count": row[2]} 
#             for row in year_prices
#         ],
#         "fuelPrices": [
#             {"fuelType": row[0], "avgPrice": round(row[1], 2), "count": row[2]} 
#             for row in fuel_prices
#         ],
#         "transmissionPrices": [
#             {"transmission": row[0], "avgPrice": round(row[1], 2), "count": row[2]} 
#             for row in transmission_prices
#         ]
#     }

# @router.get("/price-drop-stats")
# def get_price_drop_statistics(db: Session = Depends(get_db)):
#     cars_with_history = db.query(CarListing).filter(
#         CarListing.price_history.isnot(None),
#         CarListing.price_history != "[]",
#         (CarListing.suspicious_price != True) | (CarListing.suspicious_price == None)
#     ).all()
    
#     total_drops = 0
#     total_drop_percentage = 0
#     cars_with_price_drops = 0
    
#     for car in cars_with_history:
#         try:
#             history = json.loads(car.price_history)
#             if not history or not isinstance(history, list):
#                 continue
                
#             history.sort(key=lambda x: x.get("date", ""), reverse=True)
            
#             price_drops = []
#             for i in range(len(history) - 1):
#                 current_price = history[i].get("price")
#                 previous_price = history[i + 1].get("price")
                
#                 if current_price and previous_price and current_price < previous_price:
#                     drop_amount = previous_price - current_price
#                     drop_percentage = (drop_amount / previous_price) * 100
#                     price_drops.append({
#                         "amount": drop_amount,
#                         "percentage": drop_percentage
#                     })
            
#             if price_drops:
#                 cars_with_price_drops += 1
#                 total_drops += sum(drop["amount"] for drop in price_drops)
#                 total_drop_percentage += sum(drop["percentage"] for drop in price_drops)
                
#         except Exception as e:
#             print(f"Error processing price history for car {car.id}: {e}")
#             continue
    
#     avg_price_drop = total_drops / cars_with_price_drops if cars_with_price_drops > 0 else 0
#     avg_percentage_drop = total_drop_percentage / cars_with_price_drops if cars_with_price_drops > 0 else 0
    
#     biggest_drops = []
#     if cars_with_price_drops > 0:
#         cars_with_drops = []
#         for car in cars_with_history:
#             try:
#                 history = json.loads(car.price_history)
#                 if not history or not isinstance(history, list) or len(history) < 2:
#                     continue
                
#                 total_car_drop = 0
#                 percentage_drop = 0
                
#                 history.sort(key=lambda x: x.get("date", ""), reverse=True)
                
#                 first_price = history[0].get("price")
#                 last_price = history[-1].get("price")
                
#                 if first_price and last_price and first_price < last_price:
#                     total_car_drop = last_price - first_price
#                     percentage_drop = (total_car_drop / last_price) * 100
                    
#                     cars_with_drops.append({
#                         "car_id": car.id,
#                         "title": car.title,
#                         "brand": car.brand,
#                         "model": car.model,
#                         "year": car.year,
#                         "original_price": last_price,
#                         "current_price": first_price,
#                         "drop_amount": total_car_drop,
#                         "drop_percentage": percentage_drop
#                     })
#             except:
#                 continue
        
#         cars_with_drops.sort(key=lambda x: x["drop_amount"], reverse=True)
#         biggest_drops = cars_with_drops[:5]
    
#     return {
#         "averagePriceDrop": round(avg_price_drop, 2),
#         "averagePercentageDrop": round(avg_percentage_drop, 2),
#         "carsWithPriceDrops": cars_with_price_drops,
#         "biggestDrops": biggest_drops
#     }
    
# @router.get("/quality-score-distribution")
# def get_quality_score_distribution(db: Session = Depends(get_db)):
#     score_ranges = [
#         (0, 20),
#         (21, 40),
#         (41, 60),
#         (61, 80),
#         (81, 100)
#     ]
    
#     results = []
#     for min_score, max_score in score_ranges:
#         range_label = f"{min_score}-{max_score}"
        
#         count = db.execute(text(f"""
#             SELECT COUNT(*) 
#             FROM car_listings 
#             WHERE quality_score >= {min_score} AND quality_score <= {max_score}
#             AND (suspicious_price IS NULL OR suspicious_price = false)
#         """)).scalar() or 0
        
#         results.append({
#             "range": range_label,
#             "count": count,
#             "label": get_quality_label(min_score)
#         })
    
#     return results

# def get_quality_label(min_score):
#     if min_score >= 81:
#         return "Excellent"
#     elif min_score >= 61:
#         return "Good"
#     elif min_score >= 41:
#         return "Average"
#     elif min_score >= 21:
#         return "Below Average"
#     else:
#         return "Poor"

# @router.get("/quality-score-vs-sell-time")
# def get_quality_score_vs_sell_time(db: Session = Depends(get_db)):
#     score_ranges = [
#         (0, 20),
#         (21, 40),
#         (41, 60),
#         (61, 80),
#         (81, 100)
#     ]
    
#     results = []
#     for min_score, max_score in score_ranges:
#         range_label = f"{min_score}-{max_score}"
        
#         avg_sell_time = db.execute(text(f"""
#             SELECT AVG(EXTRACT(EPOCH FROM (sold_detected_at - created_at))/86400)
#             FROM car_listings
#             WHERE quality_score >= {min_score} AND quality_score <= {max_score}
#             AND sold = true 
#             AND sold_detected_at IS NOT NULL 
#             AND created_at IS NOT NULL
#             AND (suspicious_price IS NULL OR suspicious_price = false)
#         """)).scalar() or 0
        
#         results.append({
#             "range": range_label,
#             "avgSellTime": round(avg_sell_time, 1),
#             "label": get_quality_label(min_score)
#         })
    
#     return results

# @router.get("/quality-score-vs-price-reduction")
# def get_quality_score_vs_price_reduction(db: Session = Depends(get_db)):
#     score_ranges = [
#         (0, 20),
#         (21, 40),
#         (41, 60),
#         (61, 80),
#         (81, 100)
#     ]
    
#     results = []
#     for min_score, max_score in score_ranges:
#         range_label = f"{min_score}-{max_score}"
        
#         cars = db.query(CarListing).filter(
#             CarListing.quality_score >= min_score,
#             CarListing.quality_score <= max_score,
#             CarListing.price_history.isnot(None),
#             CarListing.price_history != "[]",
#             (CarListing.suspicious_price != True) | (CarListing.suspicious_price == None)
#         ).all()
        
#         total_reduction = 0
#         total_percentage = 0
#         cars_with_reductions = 0
        
#         for car in cars:
#             try:
#                 history = json.loads(car.price_history)
#                 if not history or not isinstance(history, list) or len(history) < 2:
#                     continue
                
#                 history.sort(key=lambda x: x.get("date", ""))
#                 first_price = history[0].get("price")
#                 last_price = history[-1].get("price")
                
#                 if first_price and last_price and first_price > last_price:
#                     reduction = first_price - last_price
#                     percentage = (reduction / first_price) * 100
#                     total_reduction += reduction
#                     total_percentage += percentage
#                     cars_with_reductions += 1
#             except:
#                 continue
        
#         avg_reduction = total_reduction / cars_with_reductions if cars_with_reductions > 0 else 0
#         avg_percentage = total_percentage / cars_with_reductions if cars_with_reductions > 0 else 0
        
#         results.append({
#             "range": range_label,
#             "avgReduction": round(avg_reduction, 2),
#             "avgPercentage": round(avg_percentage, 1),
#             "carsCount": cars_with_reductions,
#             "label": get_quality_label(min_score)
#         })
    
#     return results

# @router.get("/location-heatmap")
# def get_location_heatmap(db: Session = Depends(get_db)):
    
#     results = db.execute(text("""
#         SELECT 
#             location,
#             COUNT(*) as car_count
#         FROM car_listings
#         WHERE location IS NOT NULL
#         AND (suspicious_price IS NULL OR suspicious_price = false)
#         GROUP BY location
#         ORDER BY car_count DESC
#     """)).fetchall()
    
#     return [{"location": row[0], "count": row[1]} for row in results]

# @router.get("/origin-country-analysis")
# def get_origin_country_analysis(db: Session = Depends(get_db)):
#     price_by_origin = db.execute(text("""
#         SELECT 
#             origin_country,
#             AVG(price) as avg_price,
#             COUNT(*) as car_count
#         FROM car_listings
#         WHERE origin_country IS NOT NULL
#         AND price IS NOT NULL
#         AND (suspicious_price IS NULL OR suspicious_price = false)
#         GROUP BY origin_country
#         HAVING COUNT(*) > 5
#         ORDER BY avg_price DESC
#     """)).fetchall()
    
#     sell_time_by_origin = db.execute(text("""
#         SELECT 
#             origin_country,
#             AVG(EXTRACT(EPOCH FROM (sold_detected_at - created_at))/86400) as avg_sell_time,
#             COUNT(*) as car_count
#         FROM car_listings
#         WHERE origin_country IS NOT NULL
#         AND sold = true
#         AND sold_detected_at IS NOT NULL
#         AND created_at IS NOT NULL
#         AND (suspicious_price IS NULL OR suspicious_price = false)
#         GROUP BY origin_country
#         HAVING COUNT(*) > 3
#         ORDER BY avg_sell_time
#     """)).fetchall()
    
#     top_brands_by_origin = {}
#     origin_countries = [row[0] for row in price_by_origin]
    
#     for country in origin_countries:
#         brands = db.execute(text(f"""
#             SELECT 
#                 brand,
#                 COUNT(*) as count
#             FROM car_listings
#             WHERE origin_country = '{country}'
#             AND (suspicious_price IS NULL OR suspicious_price = false)
#             GROUP BY brand
#             ORDER BY count DESC
#             LIMIT 3
#         """)).fetchall()
        
#         top_brands_by_origin[country] = [{"brand": row[0], "count": row[1]} for row in brands]
    
#     return {
#         "priceByOrigin": [
#             {"country": row[0], "avgPrice": round(row[1], 2), "count": row[2]} 
#             for row in price_by_origin
#         ],
#         "sellTimeByOrigin": [
#             {"country": row[0], "avgSellTime": round(row[1], 1), "count": row[2]} 
#             for row in sell_time_by_origin
#         ],
#         "topBrandsByOrigin": top_brands_by_origin
#     }

# @router.get("/dealer-vs-private")
# def get_dealer_vs_private_analysis(db: Session = Depends(get_db)):
#     general_stats = db.execute(text("""
#         SELECT 
#             seller_type,
#             COUNT(*) as total_count,
#             AVG(price) as avg_price,
#             COUNT(CASE WHEN sold = true THEN 1 ELSE NULL END) as sold_count,
#             AVG(CASE WHEN sold = true AND sold_detected_at IS NOT NULL AND created_at IS NOT NULL
#                 THEN EXTRACT(EPOCH FROM (sold_detected_at - created_at))/86400
#                 ELSE NULL END) as avg_sell_time
#         FROM car_listings
#         WHERE seller_type IN ('Dealer', 'Private')
#         AND (suspicious_price IS NULL OR suspicious_price = false)
#         GROUP BY seller_type
#     """)).fetchall()
    
#     deal_ratings = db.execute(text("""
#         SELECT 
#             seller_type,
#             deal_rating,
#             COUNT(*) as count
#         FROM car_listings
#         WHERE seller_type IN ('Dealer', 'Private')
#         AND deal_rating IS NOT NULL
#         AND (suspicious_price IS NULL OR suspicious_price = false)
#         GROUP BY seller_type, deal_rating
#         ORDER BY seller_type, deal_rating
#     """)).fetchall()
    
#     quality_scores = db.execute(text("""
#         SELECT 
#             seller_type,
#             AVG(quality_score) as avg_score
#         FROM car_listings
#         WHERE seller_type IN ('Dealer', 'Private')
#         AND quality_score IS NOT NULL
#         AND (suspicious_price IS NULL OR suspicious_price = false)
#         GROUP BY seller_type
#     """)).fetchall()
    
#     return {
#         "generalStats": [
#             {
#                 "sellerType": row[0],
#                 "count": row[1],
#                 "avgPrice": round(row[2], 2) if row[2] else None,
#                 "soldCount": row[3],
#                 "avgSellTime": round(row[4], 1) if row[4] else None
#             } 
#             for row in general_stats
#         ],
#         "dealRatings": [
#             {
#                 "sellerType": row[0],
#                 "dealRating": row[1],
#                 "count": row[2]
#             }
#             for row in deal_ratings
#         ],
#         "qualityScores": [
#             {
#                 "sellerType": row[0],
#                 "avgScore": round(row[1], 1) if row[1] else None
#             }
#             for row in quality_scores
#         ]
#     }
    
# @router.get("/brand-reliability")
# def get_brand_reliability(db: Session = Depends(get_db)):
#     results = db.execute(text("""
#         SELECT 
#             brand,
#             COUNT(*) as total_cars,
#             AVG(quality_score) as avg_quality,
#             SUM(CASE WHEN no_accident = true THEN 1 ELSE 0 END)::float / 
#                 NULLIF(COUNT(CASE WHEN no_accident IS NOT NULL THEN 1 ELSE NULL END), 0) as no_accident_rate,
#             SUM(CASE WHEN service_book = true THEN 1 ELSE 0 END)::float / 
#                 NULLIF(COUNT(CASE WHEN service_book IS NOT NULL THEN 1 ELSE NULL END), 0) as service_book_rate,
#             SUM(CASE WHEN first_owner = true THEN 1 ELSE 0 END)::float / 
#                 NULLIF(COUNT(CASE WHEN first_owner IS NOT NULL THEN 1 ELSE NULL END), 0) as first_owner_rate,
#             COUNT(CASE WHEN deal_rating IN ('S', 'A', 'B') THEN 1 ELSE NULL END)::float / 
#                 NULLIF(COUNT(CASE WHEN deal_rating IS NOT NULL THEN 1 ELSE NULL END), 0) as good_deal_rate
#         FROM car_listings
#         WHERE brand IS NOT NULL
#         AND (suspicious_price IS NULL OR suspicious_price = false)
#         GROUP BY brand
#         HAVING COUNT(*) > 10
#         ORDER BY avg_quality DESC
#     """)).fetchall()
    
#     brand_reliability = []
#     for row in results:
#         avg_quality = row[2] if row[2] is not None else 0
#         no_accident_rate = row[3] if row[3] is not None else 0
#         service_book_rate = row[4] if row[4] is not None else 0
#         first_owner_rate = row[5] if row[5] is not None else 0
#         good_deal_rate = row[6] if row[6] is not None else 0
        
#         reliability_score = (
#             (float(avg_quality) * 0.5) +
#             (no_accident_rate * 15) +
#             (service_book_rate * 15) +
#             (first_owner_rate * 10) +
#             (good_deal_rate * 10)
#         )
        
#         brand_reliability.append({
#             "brand": row[0],
#             "totalCars": row[1],
#             "avgQuality": round(avg_quality, 1) if avg_quality else None,
#             "noAccidentRate": round(no_accident_rate * 100, 1) if no_accident_rate else None,
#             "serviceBookRate": round(service_book_rate * 100, 1) if service_book_rate else None, 
#             "firstOwnerRate": round(first_owner_rate * 100, 1) if first_owner_rate else None,
#             "goodDealRate": round(good_deal_rate * 100, 1) if good_deal_rate else None,
#             "reliabilityScore": round(reliability_score, 1) if reliability_score is not None else None
#         })
    
#     brand_reliability.sort(key=lambda x: x["reliabilityScore"] if x["reliabilityScore"] is not None else 0, reverse=True)
    
#     return brand_reliability

@router.get("/available-brands")
def get_available_brands(db: Session = Depends(get_db)):
    brands = db.execute(text("""
        SELECT brand
        FROM (
            SELECT brand, COUNT(*) as brand_count
            FROM car_listings
            WHERE brand IS NOT NULL
            GROUP BY brand
            HAVING COUNT(*) > 10
        ) as brand_counts
        ORDER BY brand_counts.brand_count DESC
    """)).fetchall()
    
    return [brand[0] for brand in brands]

@router.get("/available-models/{brand}")
def get_available_models(brand: str, db: Session = Depends(get_db)):
    models = db.execute(text(f"""
        SELECT model
        FROM car_listings
        WHERE brand = '{brand}'
        AND model IS NOT NULL
        GROUP BY model
        HAVING COUNT(*) > 5
        ORDER BY COUNT(*) DESC
    """)).fetchall()
    
    return [model[0] for model in models]

# @router.get("/model-depreciation/{brand}/{model}")
# def get_model_depreciation_by_brand_model(brand: str, model: str, db: Session = Depends(get_db)):
#     yearly_prices = db.execute(text(f"""
#         SELECT 
#             year,
#             AVG(price) as avg_price,
#             COUNT(*) as count
#         FROM car_listings
#         WHERE brand = '{brand}'
#         AND model = '{model}'
#         AND year IS NOT NULL
#         AND price IS NOT NULL
#         AND (suspicious_price IS NULL OR suspicious_price = false)
#         GROUP BY year
#         HAVING COUNT(*) >= 2
#         ORDER BY year DESC
#     """)).fetchall()
    
#     if len(yearly_prices) >= 2:
#         years = [row[0] for row in yearly_prices]
#         prices = [row[1] for row in yearly_prices]
        
#         newest_year = max(years)
#         newest_price = dict(zip(years, prices))[newest_year]
        
#         depreciation_rates = []
#         for i in range(len(yearly_prices) - 1):
#             current_year = yearly_prices[i][0]
#             current_price = yearly_prices[i][1]
#             next_year = yearly_prices[i + 1][0]
#             next_price = yearly_prices[i + 1][1]
            
#             years_diff = current_year - next_year
#             if years_diff > 0 and current_price > 0 and next_price > 0:
#                 yearly_rate = (current_price - next_price) / current_price / years_diff
#                 depreciation_rates.append(yearly_rate)
        
#         if depreciation_rates:
#             avg_yearly_rate = sum(depreciation_rates) / len(depreciation_rates)
            
#             return {
#                 "brand": brand,
#                 "model": model, 
#                 "newestYear": newest_year,
#                 "newestPrice": round(newest_price, 2),
#                 "yearlyDepreciationRate": round(avg_yearly_rate * 100, 1),
#                 "yearlyPrices": [
#                     {"year": row[0], "avgPrice": round(row[1], 2), "count": row[2]}
#                     for row in yearly_prices
#                 ]
#             }
    
#     return {"brand": brand, "model": model, "yearlyPrices": []}

# @router.get("/generation-analysis/{brand}/{model}")
# def get_generation_analysis_by_brand_model(brand: str, model: str, db: Session = Depends(get_db)):
#     generations = db.execute(text(f"""
#         SELECT 
#             generation,
#             AVG(price) as avg_price,
#             AVG(quality_score) as avg_quality,
#             AVG(mileage) as avg_mileage,
#             COUNT(*) as count,
#             SUM(CASE WHEN sold = true THEN 1 ELSE 0 END)::float / 
#                 NULLIF(COUNT(*), 0) as sold_rate,
#             AVG(CASE WHEN sold = true AND sold_detected_at IS NOT NULL AND created_at IS NOT NULL
#                 THEN EXTRACT(EPOCH FROM (sold_detected_at - created_at))/86400
#                 ELSE NULL END) as avg_sell_time
#         FROM car_listings
#         WHERE brand = '{brand}'
#         AND model = '{model}'
#         AND generation IS NOT NULL
#         AND (suspicious_price IS NULL OR suspicious_price = false)
#         GROUP BY generation
#         HAVING COUNT(*) >= 2
#         ORDER BY MIN(year) DESC
#     """)).fetchall()
    
#     return {
#         "brand": brand,
#         "model": model,
#         "generations": [
#             {
#                 "generation": row[0],
#                 "avgPrice": round(row[1], 2) if row[1] else None,
#                 "avgQuality": round(row[2], 1) if row[2] else None,
#                 "avgMileage": round(row[3], 2) if row[3] else None,
#                 "count": row[4],
#                 "soldRate": round(row[5] * 100, 1) if row[5] else None,
#                 "avgSellTime": round(row[6], 1) if row[6] else None
#             }
#             for row in generations
#         ]
#     }

# @router.get("/model-depreciation")
# def get_model_depreciation(db: Session = Depends(get_db)):
#     popular_models = db.execute(text("""
#         SELECT 
#             brand, 
#             model, 
#             COUNT(*) as count
#         FROM car_listings
#         WHERE brand IS NOT NULL 
#         AND model IS NOT NULL
#         AND (suspicious_price IS NULL OR suspicious_price = false)
#         GROUP BY brand, model
#         HAVING COUNT(*) > 15
#         ORDER BY count DESC
#         LIMIT 10
#     """)).fetchall()
    
#     model_depreciation = []
    
#     for brand, model, _ in popular_models:
#         yearly_prices = db.execute(text(f"""
#             SELECT 
#                 year,
#                 AVG(price) as avg_price,
#                 COUNT(*) as count
#             FROM car_listings
#             WHERE brand = '{brand}'
#             AND model = '{model}'
#             AND year IS NOT NULL
#             AND price IS NOT NULL
#             AND (suspicious_price IS NULL OR suspicious_price = false)
#             GROUP BY year
#             HAVING COUNT(*) >= 3
#             ORDER BY year DESC
#         """)).fetchall()
        
#         if len(yearly_prices) >= 3:
#             years = [row[0] for row in yearly_prices]
#             prices = [row[1] for row in yearly_prices]
            
#             newest_year = max(years)
#             newest_price = dict(zip(years, prices))[newest_year]
            
#             depreciation_rates = []
#             for i in range(len(yearly_prices) - 1):
#                 current_year = yearly_prices[i][0]
#                 current_price = yearly_prices[i][1]
#                 next_year = yearly_prices[i + 1][0]
#                 next_price = yearly_prices[i + 1][1]
                
#                 years_diff = current_year - next_year
#                 if years_diff > 0 and current_price > 0 and next_price > 0:
#                     yearly_rate = (current_price - next_price) / current_price / years_diff
#                     depreciation_rates.append(yearly_rate)
            
#             if depreciation_rates:
#                 avg_yearly_rate = sum(depreciation_rates) / len(depreciation_rates)
                
#                 model_depreciation.append({
#                     "brand": brand,
#                     "model": model, 
#                     "newestYear": newest_year,
#                     "newestPrice": round(newest_price, 2),
#                     "yearlyDepreciationRate": round(avg_yearly_rate * 100, 1),
#                     "yearlyPrices": [
#                         {"year": row[0], "avgPrice": round(row[1], 2), "count": row[2]}
#                         for row in yearly_prices
#                     ]
#                 })
    
#     model_depreciation.sort(key=lambda x: x["yearlyDepreciationRate"], reverse=True)
    
#     return model_depreciation

# @router.get("/generation-analysis")
# def get_generation_analysis(db: Session = Depends(get_db)):
#     models_with_generations = db.execute(text("""
#         SELECT 
#             brand, 
#             model,
#             COUNT(DISTINCT generation) as generation_count
#         FROM car_listings
#         WHERE brand IS NOT NULL 
#         AND model IS NOT NULL
#         AND generation IS NOT NULL
#         AND (suspicious_price IS NULL OR suspicious_price = false)
#         GROUP BY brand, model
#         HAVING COUNT(DISTINCT generation) > 1
#         ORDER BY generation_count DESC
#         LIMIT 10
#     """)).fetchall()
    
#     generation_analysis = []
    
#     for brand, model, generation_count in models_with_generations:
#         generations = db.execute(text(f"""
#             SELECT 
#                 generation,
#                 AVG(price) as avg_price,
#                 AVG(quality_score) as avg_quality,
#                 AVG(mileage) as avg_mileage,
#                 COUNT(*) as count,
#                 SUM(CASE WHEN sold = true THEN 1 ELSE 0 END)::float / 
#                     NULLIF(COUNT(*), 0) as sold_rate,
#                 AVG(CASE WHEN sold = true AND sold_detected_at IS NOT NULL AND created_at IS NOT NULL
#                     THEN EXTRACT(EPOCH FROM (sold_detected_at - created_at))/86400
#                     ELSE NULL END) as avg_sell_time
#             FROM car_listings
#             WHERE brand = '{brand}'
#             AND model = '{model}'
#             AND generation IS NOT NULL
#             AND (suspicious_price IS NULL OR suspicious_price = false)
#             GROUP BY generation
#             HAVING COUNT(*) >= 3
#             ORDER BY MIN(year) DESC
#         """)).fetchall()
        
#         if len(generations) >= 1:
#             generation_analysis.append({
#                 "brand": brand,
#                 "model": model,
#                 "generation_count": generation_count,
#                 "generations": [
#                     {
#                         "generation": row[0],
#                         "avgPrice": round(row[1], 2) if row[1] else None,
#                         "avgQuality": round(row[2], 1) if row[2] else None,
#                         "avgMileage": round(row[3], 2) if row[3] else None,
#                         "count": row[4],
#                         "soldRate": round(row[5] * 100, 1) if row[5] else None,
#                         "avgSellTime": round(row[6], 1) if row[6] else None
#                     }
#                     for row in generations
#                 ]
#             })
    
#     return generation_analysis

# @router.get("/mileage-impact")
# def get_mileage_impact(db: Session = Depends(get_db)):
#     mileage_ranges = [
#         (0, 10000, "0-10,000 km"),
#         (10001, 50000, "10,001-50,000 km"),
#         (50001, 100000, "50,001-100,000 km"),
#         (100001, 150000, "100,001-150,000 km"),
#         (150001, 200000, "150,001-200,000 km"),
#         (200001, 300000, "200,001-300,000 km"),
#         (300001, 1000000, "Over 300,000 km")
#     ]
    
#     results = []
#     for min_mileage, max_mileage, label in mileage_ranges:
#         price_data = db.execute(text(f"""
#             SELECT 
#                 AVG(price) as avg_price,
#                 MIN(price) as min_price,
#                 MAX(price) as max_price,
#                 COUNT(*) as count
#             FROM car_listings
#             WHERE mileage >= {min_mileage} 
#             AND mileage <= {max_mileage}
#             AND price IS NOT NULL
#             AND (suspicious_price IS NULL OR suspicious_price = false)
#         """)).fetchone()
        
#         sell_time_data = db.execute(text(f"""
#             SELECT 
#                 AVG(EXTRACT(EPOCH FROM (sold_detected_at - created_at))/86400) as avg_sell_time,
#                 COUNT(*) as sold_count
#             FROM car_listings
#             WHERE mileage >= {min_mileage} 
#             AND mileage <= {max_mileage}
#             AND sold = true
#             AND sold_detected_at IS NOT NULL
#             AND created_at IS NOT NULL
#             AND (suspicious_price IS NULL OR suspicious_price = false)
#         """)).fetchone()
        
#         sales_rate_data = db.execute(text(f"""
#             SELECT 
#                 COUNT(CASE WHEN sold = true THEN 1 ELSE NULL END)::float / 
#                     NULLIF(COUNT(*), 0) as sales_rate
#             FROM car_listings
#             WHERE mileage >= {min_mileage} 
#             AND mileage <= {max_mileage}
#             AND (suspicious_price IS NULL OR suspicious_price = false)
#         """)).fetchone()
        
#         deal_ratings_data = db.execute(text(f"""
#             SELECT 
#                 deal_rating,
#                 COUNT(*) as count
#             FROM car_listings
#             WHERE mileage >= {min_mileage} 
#             AND mileage <= {max_mileage}
#             AND deal_rating IS NOT NULL
#             AND (suspicious_price IS NULL OR suspicious_price = false)
#             GROUP BY deal_rating
#             ORDER BY deal_rating
#         """)).fetchall()
        
#         avg_price = price_data[0] if price_data and price_data[0] is not None else None
#         min_price = price_data[1] if price_data and price_data[1] is not None else None
#         max_price = price_data[2] if price_data and price_data[2] is not None else None
#         count = price_data[3] if price_data else 0
        
#         avg_sell_time = sell_time_data[0] if sell_time_data and sell_time_data[0] is not None else None
#         sold_count = sell_time_data[1] if sell_time_data and len(sell_time_data) > 1 else 0
        
#         sales_rate = sales_rate_data[0] if sales_rate_data and sales_rate_data[0] is not None else None
        
#         deal_ratings = {}
#         for deal_rating, rating_count in deal_ratings_data:
#             deal_ratings[deal_rating] = rating_count
        
#         good_deals_count = sum(deal_ratings.get(rating, 0) for rating in ['S', 'A', 'B'])
#         total_rated = sum(deal_ratings.values())
#         good_deals_percentage = (good_deals_count / total_rated * 100) if total_rated > 0 else None
        
#         results.append({
#             "range": label,
#             "minMileage": min_mileage,
#             "maxMileage": max_mileage,
#             "avgPrice": round(avg_price, 2) if avg_price is not None else None,
#             "minPrice": round(min_price, 2) if min_price is not None else None,
#             "maxPrice": round(max_price, 2) if max_price is not None else None,
#             "count": count,
#             "avgSellTime": round(avg_sell_time, 1) if avg_sell_time is not None else None,
#             "soldCount": sold_count,
#             "salesRate": round(sales_rate * 100, 1) if sales_rate is not None else None,
#             "dealRatings": deal_ratings,
#             "goodDealsPercentage": round(good_deals_percentage, 1) if good_deals_percentage is not None else None
#         })
    
#     results.sort(key=lambda x: x["minMileage"])
    
#     return results

# @router.get("/suspicious-listings")
# def get_suspicious_listings_analysis(db: Session = Depends(get_db)):
#     total_suspicious = db.query(CarListing).filter(CarListing.suspicious_price == True).count()
    
#     total_listings = db.query(CarListing).count()
    
#     suspicious_factors = db.execute(text("""
#         SELECT 
#             COUNT(CASE WHEN brand IS NOT NULL THEN 1 ELSE NULL END) as with_brand,
#             COUNT(CASE WHEN model IS NOT NULL THEN 1 ELSE NULL END) as with_model,
#             COUNT(CASE WHEN year IS NOT NULL THEN 1 ELSE NULL END) as with_year,
#             COUNT(CASE WHEN mileage IS NOT NULL THEN 1 ELSE NULL END) as with_mileage,
#             COUNT(CASE WHEN fuel_type IS NOT NULL THEN 1 ELSE NULL END) as with_fuel_type,
#             COUNT(CASE WHEN transmission IS NOT NULL THEN 1 ELSE NULL END) as with_transmission,
#             COUNT(CASE WHEN engine_capacity IS NOT NULL THEN 1 ELSE NULL END) as with_engine_capacity,
#             COUNT(CASE WHEN engine_power IS NOT NULL THEN 1 ELSE NULL END) as with_engine_power,
#             COUNT(CASE WHEN right_hand_drive = true THEN 1 ELSE NULL END) as right_hand_drive,
#             COUNT(CASE WHEN damaged = true THEN 1 ELSE NULL END) as damaged,
#             COUNT(CASE WHEN seller_type = 'Private' THEN 1 ELSE NULL END) as private_sellers,
#             COUNT(CASE WHEN seller_type = 'Dealer' THEN 1 ELSE NULL END) as dealer_sellers,
#             AVG(price) as avg_price,
#             MIN(price) as min_price,
#             MAX(price) as max_price
#         FROM car_listings
#         WHERE suspicious_price = true
#     """)).fetchone()

#     normal_factors = db.execute(text("""
#         SELECT 
#             COUNT(CASE WHEN brand IS NOT NULL THEN 1 ELSE NULL END) as with_brand,
#             COUNT(CASE WHEN model IS NOT NULL THEN 1 ELSE NULL END) as with_model,
#             COUNT(CASE WHEN year IS NOT NULL THEN 1 ELSE NULL END) as with_year,
#             COUNT(CASE WHEN mileage IS NOT NULL THEN 1 ELSE NULL END) as with_mileage,
#             COUNT(CASE WHEN fuel_type IS NOT NULL THEN 1 ELSE NULL END) as with_fuel_type,
#             COUNT(CASE WHEN transmission IS NOT NULL THEN 1 ELSE NULL END) as with_transmission,
#             COUNT(CASE WHEN engine_capacity IS NOT NULL THEN 1 ELSE NULL END) as with_engine_capacity,
#             COUNT(CASE WHEN engine_power IS NOT NULL THEN 1 ELSE NULL END) as with_engine_power,
#             COUNT(CASE WHEN right_hand_drive = true THEN 1 ELSE NULL END) as right_hand_drive,
#             COUNT(CASE WHEN damaged = true THEN 1 ELSE NULL END) as damaged,
#             COUNT(CASE WHEN seller_type = 'Private' THEN 1 ELSE NULL END) as private_sellers,
#             COUNT(CASE WHEN seller_type = 'Dealer' THEN 1 ELSE NULL END) as dealer_sellers,
#             AVG(price) as avg_price,
#             MIN(price) as min_price,
#             MAX(price) as max_price
#         FROM car_listings
#         WHERE suspicious_price IS NULL OR suspicious_price = false
#     """)).fetchone()
    
#     top_suspicious_brands = db.execute(text("""
#         SELECT 
#             brand,
#             COUNT(*) as count,
#             (COUNT(*)::float / 
#                 (SELECT COUNT(*) FROM car_listings WHERE suspicious_price = true AND brand IS NOT NULL)
#             ) * 100 as percentage
#         FROM car_listings
#         WHERE suspicious_price = true AND brand IS NOT NULL
#         GROUP BY brand
#         ORDER BY count DESC
#         LIMIT 10
#     """)).fetchall()
    
#     price_ranges_suspicious = db.execute(text("""
#         SELECT 
#             CASE 
#                 WHEN price < 1000 THEN 'Under €1,000'
#                 WHEN price >= 1000 AND price < 5000 THEN '€1,000 - €5,000'
#                 WHEN price >= 5000 AND price < 10000 THEN '€5,000 - €10,000'
#                 WHEN price >= 10000 AND price < 20000 THEN '€10,000 - €20,000'
#                 WHEN price >= 20000 AND price < 50000 THEN '€20,000 - €50,000'
#                 ELSE 'Over €50,000'
#             END as price_range,
#             COUNT(*) as count
#         FROM car_listings
#         WHERE suspicious_price = true
#         AND price IS NOT NULL
#         GROUP BY price_range
#         ORDER BY MIN(price)
#     """)).fetchall()
    
#     incomplete_sources = db.execute(text("""
#         SELECT 
#             source,
#             total_incomplete,
#             valid_cars_added,
#             total_runs,
#             CASE 
#                 WHEN valid_cars_added + total_incomplete > 0 
#                 THEN CAST(((valid_cars_added::float / (valid_cars_added + total_incomplete)) * 100) AS DECIMAL(10,1))
#                 ELSE 0
#             END as success_rate
#         FROM incomplete_data_stats
#     ORDER BY total_incomplete DESC
#     """)).fetchall()
    
#     incomplete_fields = db.execute(text("""
#         SELECT 
#             'Brand' as field, SUM(no_brand) as count FROM incomplete_data_stats
#         UNION ALL
#         SELECT 'Model' as field, SUM(no_model) as count FROM incomplete_data_stats
#         UNION ALL
#         SELECT 'Year' as field, SUM(no_year) as count FROM incomplete_data_stats
#         UNION ALL
#         SELECT 'Mileage' as field, SUM(no_mileage) as count FROM incomplete_data_stats
#         UNION ALL
#         SELECT 'Fuel Type' as field, SUM(no_fuel_type) as count FROM incomplete_data_stats
#         UNION ALL
#         SELECT 'Transmission' as field, SUM(no_transmission) as count FROM incomplete_data_stats
#         UNION ALL
#         SELECT 'Engine Capacity' as field, SUM(no_engine_capacity) as count FROM incomplete_data_stats
#         UNION ALL
#         SELECT 'Price' as field, SUM(no_price) as count FROM incomplete_data_stats
#         UNION ALL
#         SELECT 'Title' as field, SUM(no_title) as count FROM incomplete_data_stats
#         ORDER BY count DESC
#     """)).fetchall()
    
#     total_stats = db.execute(text("""
#         SELECT 
#             SUM(total_incomplete) as total_incomplete,
#             SUM(valid_cars_added) as total_valid,
#             CASE 
#                 WHEN SUM(valid_cars_added) + SUM(total_incomplete) > 0 
#                 THEN CAST(((SUM(valid_cars_added)::float / (SUM(valid_cars_added) + SUM(total_incomplete))) * 100) AS DECIMAL(10,1))
#                 ELSE 0
#             END as success_rate
#         FROM incomplete_data_stats
#     """)).fetchone()
    
#     suspicious_percentage = round((total_suspicious / total_listings) * 100, 1) if total_listings > 0 else 0
    
#     suspicious_dict = {}
#     normal_dict = {}
    
#     if suspicious_factors:
#         for i, column in enumerate(["with_brand", "with_model", "with_year", "with_mileage", 
#                                    "with_fuel_type", "with_transmission", "with_engine_capacity", 
#                                    "with_engine_power", "right_hand_drive", "damaged", 
#                                    "private_sellers", "dealer_sellers", "avg_price", 
#                                    "min_price", "max_price"]):
#             suspicious_dict[column] = suspicious_factors[i]
    
#     if normal_factors:
#         for i, column in enumerate(["with_brand", "with_model", "with_year", "with_mileage", 
#                                    "with_fuel_type", "with_transmission", "with_engine_capacity", 
#                                    "with_engine_power", "right_hand_drive", "damaged", 
#                                    "private_sellers", "dealer_sellers", "avg_price", 
#                                    "min_price", "max_price"]):
#             normal_dict[column] = normal_factors[i]
    
#     factor_comparisons = []
#     for factor in ["with_brand", "with_model", "with_year", "with_mileage", 
#                   "with_fuel_type", "with_transmission", "with_engine_capacity", 
#                   "with_engine_power"]:
        
#         suspicious_pct = (suspicious_dict.get(factor, 0) / total_suspicious) * 100 if total_suspicious > 0 else 0
#         normal_pct = (normal_dict.get(factor, 0) / total_listings) * 100 if total_listings > 0 else 0
        
#         factor_comparisons.append({
#             "factor": factor.replace("with_", ""),
#             "suspiciousPercentage": round(suspicious_pct, 1),
#             "normalPercentage": round(normal_pct, 1),
#             "difference": round(suspicious_pct - normal_pct, 1)
#         })
    
#     right_hand_drive_pct_suspicious = (suspicious_dict.get("right_hand_drive", 0) / total_suspicious) * 100 if total_suspicious > 0 else 0
#     right_hand_drive_pct_normal = (normal_dict.get("right_hand_drive", 0) / (total_listings - total_suspicious)) * 100 if (total_listings - total_suspicious) > 0 else 0
    
#     damaged_pct_suspicious = (suspicious_dict.get("damaged", 0) / total_suspicious) * 100 if total_suspicious > 0 else 0
#     damaged_pct_normal = (normal_dict.get("damaged", 0) / (total_listings - total_suspicious)) * 100 if (total_listings - total_suspicious) > 0 else 0
    
#     private_sellers_pct_suspicious = (suspicious_dict.get("private_sellers", 0) / total_suspicious) * 100 if total_suspicious > 0 else 0
#     private_sellers_pct_normal = (normal_dict.get("private_sellers", 0) / (total_listings - total_suspicious)) * 100 if (total_listings - total_suspicious) > 0 else 0
    
#     return {
#         "totalSuspicious": total_suspicious,
#         "totalListings": total_listings,
#         "suspiciousPercentage": suspicious_percentage,
#         "factorComparisons": factor_comparisons,
#         "specificFactors": {
#             "rightHandDrive": {
#                 "suspiciousPercentage": round(right_hand_drive_pct_suspicious, 1),
#                 "normalPercentage": round(right_hand_drive_pct_normal, 1),
#                 "difference": round(right_hand_drive_pct_suspicious - right_hand_drive_pct_normal, 1)
#             },
#             "damaged": {
#                 "suspiciousPercentage": round(damaged_pct_suspicious, 1),
#                 "normalPercentage": round(damaged_pct_normal, 1),
#                 "difference": round(damaged_pct_suspicious - damaged_pct_normal, 1)
#             },
#             "privateSellers": {
#                 "suspiciousPercentage": round(private_sellers_pct_suspicious, 1),
#                 "normalPercentage": round(private_sellers_pct_normal, 1),
#                 "difference": round(private_sellers_pct_suspicious - private_sellers_pct_normal, 1)
#             }
#         },
#         "priceStatistics": {
#             "suspicious": {
#                 "avgPrice": round(suspicious_dict.get("avg_price", 0), 2) if suspicious_dict.get("avg_price") else None,
#                 "minPrice": round(suspicious_dict.get("min_price", 0), 2) if suspicious_dict.get("min_price") else None,
#                 "maxPrice": round(suspicious_dict.get("max_price", 0), 2) if suspicious_dict.get("max_price") else None
#             },
#             "normal": {
#                 "avgPrice": round(normal_dict.get("avg_price", 0), 2) if normal_dict.get("avg_price") else None,
#                 "minPrice": round(normal_dict.get("min_price", 0), 2) if normal_dict.get("min_price") else None,
#                 "maxPrice": round(normal_dict.get("max_price", 0), 2) if normal_dict.get("max_price") else None
#             }
#         },
#         "topSuspiciousBrands": [
#             {
#                 "brand": row[0],
#                 "count": row[1],
#                 "percentage": round(row[2], 1) if row[2] is not None else None
#             }
#             for row in top_suspicious_brands
#         ],
#         "priceRangesSuspicious": [
#             {
#                 "range": row[0],
#                 "count": row[1]
#             }
#             for row in price_ranges_suspicious
#         ],
#         "incompleteStats": {
#             "totalIncomplete": total_stats[0] if total_stats and total_stats[0] is not None else 0,
#             "totalValid": total_stats[1] if total_stats and total_stats[1] is not None else 0,
#             "successRate": total_stats[2] if total_stats and total_stats[2] is not None else 0,
#             "sources": [
#                 {
#                     "source": row[0],
#                     "totalIncomplete": row[1],
#                     "validCarsAdded": row[2],
#                     "totalRuns": row[3],
#                     "successRate": row[4]
#                 }
#                 for row in incomplete_sources
#             ],
#             "fieldsBreakdown": [
#                 {
#                     "field": row[0],
#                     "count": row[1] or 0
#                 }
#                 for row in incomplete_fields
#             ]
#         }
#     }