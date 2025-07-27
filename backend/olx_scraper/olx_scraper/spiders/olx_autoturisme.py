import scrapy
from app.models.models import CarListing, IncompleteDataStats
from app.database import SessionLocal
import json
from datetime import datetime, timedelta
import re
from app.constants.mappings import standardize_drive_type, standardize_fuel_type, standardize_transmission, standardize_vehicle_condition, standardize_color

month_map = {
    "ianuarie": "01",
    "februarie": "02",
    "martie": "03",
    "aprilie": "04",
    "mai": "05",
    "iunie": "06",
    "iulie": "07",
    "august": "08",
    "septembrie": "09",
    "octombrie": "10",
    "noiembrie": "11",
    "decembrie": "12",
}

class OlxAutoturismeSpider(scrapy.Spider):
    name = "olx_autoturisme"
    allowed_domains = ["olx.ro"]
    start_urls = ["https://www.olx.ro/auto-masini-moto-ambarcatiuni/autoturisme/?currency=EUR&search%5Border%5D=created_at:desc"]
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.valid_cars = 0
        self.skipped_cars = 0
        self.duplicate_cars = 0
        self.incomplete_cars = 0
        self.max_pages = 25
        self.current_page = 1
        self.incomplete_reasons = {}
        self.increment_runs_counter("olx")

    def increment_runs_counter(self, source):
        db = SessionLocal()
        try:
            stats = db.query(IncompleteDataStats).filter_by(source=source).first()
            if not stats:
                stats = IncompleteDataStats(source=source)
                db.add(stats)
                stats.total_incomplete = 0
                stats.valid_cars_added = 0
                stats.total_runs = 0
                stats.no_title = 0
                stats.no_price = 0
                stats.no_brand = 0
                stats.no_model = 0
                stats.no_year = 0
                stats.no_mileage = 0
                stats.no_fuel_type = 0
                stats.no_transmission = 0
                stats.no_engine_capacity = 0
            
            if stats.total_runs is None:
                stats.total_runs = 0
            stats.total_runs += 1
            
            stats.last_update = datetime.utcnow()
            db.commit()
            print(f"Incremented run counter for {source}. Total runs: {stats.total_runs}")
        except Exception as e:
            print(f"Error updating runs counter: {e}")
            db.rollback()
        finally:
            db.close()
    
    def closed(self, reason):
        print(f"Scraping finished!")
        print(f"Valid cars added: {self.valid_cars}")
        print(f"Skipped cars (total): {self.skipped_cars}")
        print(f"   - Duplicates: {self.duplicate_cars}")
        print(f"   - Incomplete data: {self.incomplete_cars}")
        print(f"Last page processed: {self.current_page}")
        
        if self.incomplete_reasons:
            print("\nIncomplete data statistics:")
            for reason, count in self.incomplete_reasons.items():
                print(f"   - {reason}: {count}")
        
        db = SessionLocal()
        try:
            stats = db.query(IncompleteDataStats).filter_by(source=self.name.split("_")[0]).first()
            if stats:
                print("\nGlobal statistics:")
                print(f"Total runs: {stats.total_runs}")
                print(f"Total valid cars added: {stats.valid_cars_added}")
                print(f"Total cars with incomplete data: {stats.total_incomplete}")
                print(f"Success rate: {stats.valid_cars_added / (stats.valid_cars_added + stats.total_incomplete) * 100:.2f}% ")
        except Exception as e:
            print(f"Error getting global statistics: {e}")
        finally:
            db.close()

    def start_requests(self):
        session = SessionLocal()
        try:
            session.query(CarListing).update({CarListing.is_new: False})
            session.commit()
        finally:
            session.close()

        for url in self.start_urls:
            yield scrapy.Request(url=url, callback=self.parse)

    def parse(self, response):
        ads = response.css("div.css-u2ayx9")
        print(f"Found {len(ads)} ads on page {self.current_page}")
        
        for ad in ads:
            ad_url = ad.css("a.css-1tqlkj0::attr(href)").get()
            if ad_url:
                ad_url = response.urljoin(ad_url)
                yield scrapy.Request(url=ad_url, callback=self.parse_ad)
        
        if self.current_page >= self.max_pages:
            print(f"Reached maximum page limit ({self.max_pages})")
            return
        
        self.current_page += 1
                
        next_page = response.css("a[data-testid='pagination-forward']::attr(href)").get()
        if next_page:
            next_page_url = response.urljoin(next_page)
            print(f"Moving to page {self.current_page}")
            yield scrapy.Request(url=next_page_url, callback=self.parse)

    def parse_ad(self, response):
        def clean(text):
            return text.strip() if text else None
        
        def extract_location(core_title: str, full_title: str) -> str | None:
            if "•" not in full_title:
                return None

            before_dot = full_title.split("•")[0].strip()
            location_part = before_dot.replace(core_title, "").strip()
            return location_part if location_part else None
        
        def normalize_brand(brand_name):
            if not brand_name:
                return None
            
            brand_mapping = {
                "citroen": "Citroen",
                "citroën": "Citroen",
                "gmc": "GMC",
                "xev": "XEV"
            }

            normalized = brand_name.lower()
            if normalized in brand_mapping:
                return brand_mapping[normalized]
            return brand_name

        def normalize_model(model_name, brand=None):
            if not model_name:
                return None
            
            original_model = model_name
            
            normalized = model_name.lower()
            
            if " class" in normalized:
                model_name = model_name.replace(" Class", "")
            
            if normalized == "altul":
                return "Altul"
            
            if brand == "Ford":
                ford_models = {
                    "b-max": "B-MAX",
                    "b max": "B-MAX",
                    "bmax": "B-MAX",
                    "c-max": "C-MAX",
                    "c max": "C-MAX",
                    "cmax": "C-MAX",
                    "edge": "Edge",
                    "grand c-max": "Grand C-MAX",
                    "grand c max": "Grand C-MAX",
                    "ka": "Ka",
                    "ka+": "Ka+"
                }
                if normalized in ford_models:
                    return ford_models[normalized]
                
            if brand == "Citroen":
                citroen_models = {
                    "c3 aircross": "C3 Aircross",
                }
                if normalized in citroen_models:
                    return citroen_models[normalized]
            
            elif brand == "Hyundai":
                hyundai_models = {
                    "ioniq": "IONIQ",
                    "ioniq 5": "IONIQ 5",
                    "ioniq5": "IONIQ 5",
                    "kona": "Kona"
                }
                if normalized in hyundai_models:
                    return hyundai_models[normalized]
            
            elif brand == "Nissan":
                if normalized == "leaf":
                    return "Leaf"
            
            elif brand == "Renault":
                if normalized == "zoe":
                    return "ZOE"
            
            elif brand == "SsangYong":
                ssangyong_models = {
                    "musso": "Musso",
                    "rexton": "Rexton",
                }
                if normalized in ssangyong_models:
                    return ssangyong_models[normalized]
            
            elif brand == "Subaru":
                if normalized == "outback":
                    return "Outback"
            
            elif brand == "Toyota":
                if normalized in ["rav4", "rav-4"]:
                    return "RAV-4"
            
            elif brand == "Volkswagen":
                if normalized == "arteon":
                    return "Arteon"
                elif normalized in ["t-roc", "t roc", "troc"]:
                    return "T-Roc"
            
            elif brand == "Mini":
                if normalized == "one":
                    return "ONE"
            
            elif brand == "Lamborghini":
                if normalized == "urus":
                    return "URUS"
            
            if model_name != original_model:
                return model_name
            
            return original_model


        title = clean(response.css("h4.css-1dcem4b::text").get())
        full_title = clean(response.css("title::text").get())
        location = extract_location(title, full_title)

        description_meta = response.css("meta[name='description']::attr(content)").get()
        description = None
        price = None

        if description_meta:
            match = re.search(r"([\d\s]+) €:?\s*", description_meta)
            if match:
                price = float(match.group(1).replace(" ", "").replace("€", ""))
                description = description_meta.replace(match.group(0), "").strip()
            else:
                description = description_meta.strip()

        json_ld_raw = response.css('script[type="application/ld+json"]::text').get()
        brand = None
        if json_ld_raw:
            try:
                data = json.loads(json_ld_raw)
                brand = data.get("brand")
            except Exception as e:
                print("JSON-LD parsing failed:", e)

        details = {}
        detail_rows = response.css("div.css-1g2c38u p.css-5l1a1j::text").getall()
        for row in detail_rows:
            if ":" in row:
                key, value = row.split(":", 1)
                details[key.strip().lower()] = value.strip()

        model = details.get("model")
        
        brand = normalize_brand(brand)
        model = normalize_model(model, brand)
        
        year = int(details.get("an de fabricatie", "0").replace(" ", "")) or None
        mileage = int(details.get("rulaj", "0").replace("km", "").replace(" ", "")) or None
        fuel_type_original = details.get("combustibil")
        fuel_type = standardize_fuel_type(fuel_type_original)
        
        is_electric = (fuel_type == "Electric")
        
        engine_capacity = int(details.get("capacitate motor", "0").replace("cm³", "").replace(" ", "")) or None
        
        if is_electric:
            engine_capacity = 0
        
        engine_power = int(details.get("putere", "0").replace("CP", "").replace(" ", "")) or None
        
        transmission_original = details.get("cutie de viteze")
        transmission = standardize_transmission(transmission_original)
        
        if is_electric and transmission is None:
            transmission = "Automatic"
            
        drive_type_original = details.get("caroserie")
        drive_type = standardize_drive_type(drive_type_original)
        color_original = details.get("culoare")
        color = standardize_color(color_original)
        doors = int(details["numar de usi"]) if "numar de usi" in details and details["numar de usi"].isdigit() else None
        vehicle_condition_original = details.get("stare")
        vehicle_condition = standardize_vehicle_condition(vehicle_condition_original)
        created_at = datetime.now()
        
        seller_type_raw = response.css("div[data-testid='ad-parameters-container'] span::text").get()
        seller_type = None

        if seller_type_raw:
            seller_type_raw = seller_type_raw.strip().lower()
            if "persoana" in seller_type_raw or "fizica" in seller_type_raw or "privat" in seller_type_raw:
                seller_type = "Private"
            elif "firma" in seller_type_raw or "dealer" in seller_type_raw:
                seller_type = "Dealer"

        right_hand_drive = False
        right_hand_drive = any("partea dreapta" in el.lower() for el in response.css("p::text").getall())

        raw_date = response.css("span[data-testid='ad-posted-at']::text").get()
        ad_created_at = None

        if raw_date:
            raw_date = raw_date.strip().lower()

            try:
                if "azi" in raw_date:
                    ad_created_at = datetime.now()
                elif "ieri" in raw_date:
                    ad_created_at = datetime.now() - timedelta(days=1)
                else:
                    parts = raw_date.split(" ")
                    if len(parts) == 3:
                        ziua, luna_str, anul = parts
                        luna = month_map.get(luna_str.lower())
                        if luna:
                            ad_created_at = datetime.strptime(f"{ziua}.{luna}.{anul}", "%d.%m.%Y")
            except Exception as e:
                print("⚠️ Date parse error:", e)

        vin = None
        for p in response.css('p::text').getall():
            if "serie sasiu" in p.lower():
                vin = p.split(":")[-1].strip()
                break

        mandatory_fields = [title, price, brand, model, year, mileage, fuel_type, transmission]
        missing_fields = {}
        
        missing_field_list = []
        
        field_names = ["title", "price", "brand", "model", "year", "mileage", "fuel_type", "transmission", "engine_capacity"]
        field_values = [title, price, brand, model, year, mileage, fuel_type, transmission, engine_capacity]
        
        if not is_electric:
            mandatory_fields.append(engine_capacity)
        
        for idx, name in enumerate(field_names):
            if idx < len(field_values) and field_values[idx] is None:
                if name == "engine_capacity" and is_electric:
                    continue
                missing_fields[f"no_{name}"] = True
                missing_field_list.append(name)
                
                if name not in self.incomplete_reasons:
                    self.incomplete_reasons[name] = 0
                self.incomplete_reasons[name] += 1
        
        if any(field is None for field in mandatory_fields):
            try:
                self.update_incomplete_stats("olx", missing_fields)
            except Exception as e:
                print(f"Error updating incomplete stats: {e}")
            self.skipped_cars += 1
            self.incomplete_cars += 1
            print(f"Incomplete ad: {response.url} - Missing fields: {', '.join(missing_field_list)}")
            return

        source_url = response.url
        image_urls = response.css("img::attr(src)").getall()
        image_urls = [url for url in image_urls if "olxcdn.com" in url]
        images = json.dumps(image_urls)

        session = SessionLocal()
        try:
            existing = session.query(CarListing).filter_by(
                source_url=source_url
            ).first()

            if existing:
                if existing.price != price:
                    try:
                        history = json.loads(existing.price_history or "[]")
                        history.append({"price": existing.price, "date": existing.created_at.isoformat()})
                        existing.price = price
                        existing.price_history = json.dumps(history)
                        existing.created_at = created_at
                        session.commit()
                        print(f"Updated price for: {source_url}")
                    except Exception as e:
                        print(f"Error updating price: {e}")
                        session.rollback()
                self.skipped_cars += 1
                self.duplicate_cars += 1
                print(f"Duplicate ad: {source_url}")
                return

            car = CarListing(
                title=title,
                price=price,
                description=description,
                location=location,
                brand=brand,
                model=model,
                year=year,
                mileage=mileage,
                fuel_type=fuel_type,
                engine_capacity=engine_capacity,
                engine_power=engine_power,
                transmission=transmission,
                drive_type=drive_type,
                color=color,
                emission_standard=None,
                seller_type=seller_type,
                is_new=True,
                doors=doors,
                vehicle_condition=vehicle_condition,
                images=images,
                source_url=source_url,
                created_at=created_at,
                right_hand_drive=right_hand_drive,
                ad_created_at=ad_created_at,
                vin=vin,
                battery_capacity=None,
                range_km=None
            )

            session.add(car)
            session.commit()
            self.valid_cars += 1
            self.increment_valid_cars_counter("olx")
            print(f"Added new car: {brand} {model} ({year})")
        except Exception as e:
            print(f"DB Error: {e}")
            session.rollback()
        finally:
            session.close()
    
    def increment_valid_cars_counter(self, source):
        db = SessionLocal()
        try:
            stats = db.query(IncompleteDataStats).filter_by(source=source).first()
            if not stats:
                stats = IncompleteDataStats(source=source)
                db.add(stats)
                stats.total_incomplete = 0
                stats.valid_cars_added = 0
                stats.total_runs = 0
                stats.no_title = 0
                stats.no_price = 0
                stats.no_brand = 0
                stats.no_model = 0
                stats.no_year = 0
                stats.no_mileage = 0
                stats.no_fuel_type = 0
                stats.no_transmission = 0
                stats.no_engine_capacity = 0
            
            if stats.valid_cars_added is None:
                stats.valid_cars_added = 0
            stats.valid_cars_added += 1
            
            db.commit()
        except Exception as e:
            print(f"Error updating valid cars counter: {e}")
            db.rollback()
        finally:
            db.close()
    
    def update_incomplete_stats(self, source, fields):
        db = SessionLocal()
        try:
            stats = db.query(IncompleteDataStats).filter_by(source=source).first()
            if not stats:
                stats = IncompleteDataStats(source=source)
                db.add(stats)
                stats.total_incomplete = 0
                stats.no_title = 0
                stats.no_price = 0
                stats.no_brand = 0
                stats.no_model = 0
                stats.no_year = 0
                stats.no_mileage = 0
                stats.no_fuel_type = 0
                stats.no_transmission = 0
                stats.no_engine_capacity = 0
            
            if stats.total_incomplete is None:
                stats.total_incomplete = 0
            stats.total_incomplete += 1
            
            if fields.get("no_title"):
                if stats.no_title is None:
                    stats.no_title = 0
                stats.no_title += 1
                
            if fields.get("no_price"):
                if stats.no_price is None:
                    stats.no_price = 0
                stats.no_price += 1
                
            if fields.get("no_brand"):
                if stats.no_brand is None:
                    stats.no_brand = 0
                stats.no_brand += 1
                
            if fields.get("no_model"):
                if stats.no_model is None:
                    stats.no_model = 0
                stats.no_model += 1
                
            if fields.get("no_year"):
                if stats.no_year is None:
                    stats.no_year = 0
                stats.no_year += 1
                
            if fields.get("no_mileage"):
                if stats.no_mileage is None:
                    stats.no_mileage = 0
                stats.no_mileage += 1
                
            if fields.get("no_fuel_type"):
                if stats.no_fuel_type is None:
                    stats.no_fuel_type = 0
                stats.no_fuel_type += 1
                
            if fields.get("no_transmission"):
                if stats.no_transmission is None:
                    stats.no_transmission = 0
                stats.no_transmission += 1
                
            if fields.get("no_engine_capacity"):
                if stats.no_engine_capacity is None:
                    stats.no_engine_capacity = 0
                stats.no_engine_capacity += 1
            
            if stats.last_update is None:
                stats.last_update = datetime.utcnow()
            else:
                stats.last_update = datetime.utcnow()
                
            db.commit()
        except Exception as e:
            print(f"Error updating incomplete stats: {e}")
            db.rollback()
        finally:
            db.close()