import scrapy
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.models import CarListing
from datetime import datetime, timedelta
import json
from tqdm import tqdm
import os
import re

class UpdatePartialSpider(scrapy.Spider):
    name = "update_partial_data"

    def __init__(self):
        self.session: Session = SessionLocal()
        self.last_id_path = "last_updated_id.txt"

        self.last_processed_id = self.load_last_processed_id()

        self.olx_ads = self.session.query(CarListing).filter(
            CarListing.source_url.like("%olx%")
        ).all()

        self.autovit_ads = self.session.query(CarListing).filter(
            CarListing.source_url.like("%autovit%"),
            (CarListing.right_hand_drive == None) |
            (CarListing.seller_type == None) |
            (CarListing.damaged == None)
        ).all()

        self.urls_to_process = [
            car for car in self.olx_ads + self.autovit_ads
            if self.last_processed_id is None or car.id > self.last_processed_id
        ]
        self.total = len(self.urls_to_process)
        self.progress = tqdm(total=self.total, desc="🔄 Updating partial data")

    def load_last_processed_id(self):
        if os.path.exists(self.last_id_path):
            with open(self.last_id_path, "r") as f:
                return int(f.read().strip())
        return None

    def save_last_processed_id(self, car_id: int):
        with open(self.last_id_path, "w") as f:
            f.write(str(car_id))

    def start_requests(self):
        for car in self.urls_to_process:
           yield scrapy.Request(url=car.source_url,callback=self.parse,dont_filter=True,
                                meta={    
                                        'car_id': car.id,
                                        'handle_httpstatus_list': [404]
                                    })

    def parse(self, response):
        
        if response.status == 404:
            car = self.session.query(CarListing).get(response.meta['car_id'])
            car.sold = True
            try:
                self.session.commit()
                self.save_last_processed_id(car.id)
            except Exception as e:
                print(f"❌ DB error on 404: {e}")
                self.session.rollback()
            self.progress.update(1)
            return

        
        car_id = response.meta['car_id']
        car = self.session.query(CarListing).get(car_id)
        url = car.source_url

        def extract_testid_value(testid):
            sel = response.css(f'div[data-testid="{testid}"] p.ekwurce9::text').get()
            return sel.strip() if sel else None

        def extract_boolean(testid):
            val = extract_testid_value(testid)
            return True if val == "Da" else False if val == "Nu" else None

        if "olx" in url:
            
            desc_block = response.css("div[data-cy='ad_description'] div::text").getall()
            desc_list = [line.strip() for line in desc_block if line.strip()]
            car.description = json.dumps(desc_list) if desc_list else None

            description_meta = response.css("meta[name='description']::attr(content)").get()

            if description_meta:
                match = re.search(r"([\d\s]+) €:?\s*", description_meta)
                if match:
                    new_price = float(match.group(1).replace(" ", "").replace("€", ""))
                else:
                    new_price = None
            
            if new_price and car.price and new_price != car.price:
                history = []
                try:
                    if car.price_history:
                        history = json.loads(car.price_history)
                except Exception as e:
                    print(f"⚠️ Could not parse price_history: {e}")
                history.append({
                    "price": car.price,
                    "date": car.created_at.isoformat()
                })
                car.price_history = json.dumps(history)
                car.price = new_price
                car.created_at = datetime.now()

            
            seller_type_raw = response.css("div[data-testid='ad-parameters-container'] span::text").get()
            if seller_type_raw:
                seller_type_raw = seller_type_raw.strip().lower()
                if "persoană" in seller_type_raw or "persoana" in seller_type_raw:
                    car.seller_type = "private"
                elif "firmă" in seller_type_raw or "firma" in seller_type_raw:
                    car.seller_type = "dealer"

            car.right_hand_drive = any("partea dreapta" in el.lower() for el in response.css("p::text").getall())

            raw_date = response.css("span[data-testid='ad-posted-at']::text").get()
            if raw_date:
                try:
                    raw_date = raw_date.strip().lower()
                    if "azi" in raw_date:
                        car.ad_created_at = datetime.now()
                    elif "ieri" in raw_date:
                        car.ad_created_at = datetime.now() - timedelta(days=1)
                    else:
                        parts = raw_date.split(" ")
                        if len(parts) == 3:
                            ziua, luna_str, anul = parts
                            month_map = {
                                "ianuarie": "01", "februarie": "02", "martie": "03", "aprilie": "04",
                                "mai": "05", "iunie": "06", "iulie": "07", "august": "08",
                                "septembrie": "09", "octombrie": "10", "noiembrie": "11", "decembrie": "12"
                            }
                            luna = month_map.get(luna_str.lower())
                            if luna:
                                car.ad_created_at = datetime.strptime(f"{ziua}.{luna}.{anul}", "%d.%m.%Y")
                except Exception as e:
                    print("⚠️ Date parse error:", e)

            for p in response.css('p::text').getall():
                if "serie sasiu" in p.lower():
                    car.vin = p.split(":")[-1].strip()
                    break

        elif "autovit" in url:
            
            price_raw = response.css("span.offer-price__number::text").get()
            new_price = None
            if price_raw:
                try:
                    new_price = float(price_raw.replace("\xa0", "").replace(" ", "").replace(",", "."))
                except:
                    self.log(f"Error parsing price: {price_raw}")
            
            if new_price and car.price and new_price != car.price:
                history = []
                try:
                    if car.price_history:
                        history = json.loads(car.price_history)
                except Exception as e:
                    print(f"⚠️ Could not parse price_history: {e}")
                history.append({
                    "price": car.price,
                    "date": car.created_at.isoformat()
                })
                car.price_history = json.dumps(history)
                car.price = new_price
                car.created_at = datetime.now()

            
            car.right_hand_drive = extract_boolean("rhd")
            car.damaged = extract_boolean("damaged")

            for seller_li in response.css("li"):
                svg_name = seller_li.css("svg::attr(name)").get()
                if svg_name in ["dealer", "private-seller"]:
                    if "dealer" in svg_name:
                        car.seller_type = "dealer"
                    elif "private" in svg_name:
                        car.seller_type = "private"
                    break

        try:
            self.session.commit()
            self.save_last_processed_id(car_id)
        except Exception as e:
            print(f"❌ DB error: {e}")
            self.session.rollback()

        self.progress.update(1)

    def closed(self, reason):
        self.session.close()
        self.progress.close()
