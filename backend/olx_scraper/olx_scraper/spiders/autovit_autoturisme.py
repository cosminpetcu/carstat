import scrapy
from app.models.models import CarListing, IncompleteDataStats
from app.database import SessionLocal
from datetime import datetime
import json
import re
import time
from urllib.parse import urljoin

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

class AutovitAutoturismeSpider(scrapy.Spider):
    name = "autovit_autoturisme"
    allowed_domains = ["autovit.ro"]
    start_urls = ["https://www.autovit.ro/autoturisme"]
    
    handle_httpstatus_list = [301, 302]
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.valid_cars = 0
        self.skipped_cars = 0
        self.duplicate_cars = 0
        self.incomplete_cars = 0
        self.max_pages = 25
        self.current_page = 1
        self.incomplete_reasons = {}
        self.increment_runs_counter("autovit")

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

    def parse(self, response):
        if response.status in [301, 302]:
            redirect_url = response.headers.get('Location', b'').decode('utf-8')
            if redirect_url:
                if not redirect_url.startswith(('http://', 'https://')):
                    redirect_url = urljoin(response.url, redirect_url)
                
                print(f"Following redirect from {response.url} to {redirect_url}")
                yield scrapy.Request(url=redirect_url, callback=self.parse, dont_filter=True)
            return
        
        ad_links = []
        for link in response.css('a::attr(href)').getall():
            if link.startswith('/autoturisme/anunt/') or link.startswith('https://www.autovit.ro/autoturisme/anunt/'):
                if not link.startswith(('http://', 'https://')):
                    link = 'https://www.autovit.ro' + link
                if "ver-" not in link:
                    ad_links.append(link)
                
        print(f"Found {len(ad_links)} ads on page {self.current_page}")
        
        for link in ad_links:
            yield scrapy.Request(
                url=link, 
                callback=self.parse_ad,
                errback=self.error_handler,
                meta={'dont_redirect': False}
            )
            
        if self.current_page < self.max_pages:
            self.current_page += 1
            next_url = f"https://www.autovit.ro/autoturisme?search%5Border%5D=created_at_first%3Adesc&page={self.current_page}"
            print(f"Moving to page {self.current_page}")
            yield scrapy.Request(url=next_url, callback=self.parse)
        else:
            print(f"Reached maximum page limit ({self.max_pages})")
    
    def error_handler(self, failure):
        print(f"Request failed: {failure.request.url} - {failure.value}")
    
    def parse_ad(self, response):
        if response.status in [301, 302]:
            redirect_url = response.headers.get('Location', b'').decode('utf-8')
            if redirect_url:
                if not redirect_url.startswith(('http://', 'https://')):
                    redirect_url = urljoin(response.url, redirect_url)
                
                print(f"Following ad redirect from {response.url} to {redirect_url}")
                yield scrapy.Request(
                    url=redirect_url,
                    callback=self.parse_ad,
                    dont_filter=True,
                    meta={'dont_redirect': False}
                )
            return
            
        def extract_testid_value(testid):
            sel = response.css(f'div[data-testid="{testid}"] p.ekwurce9::text').get()
            return sel.strip() if sel else None

        def extract_boolean(testid):
            val = extract_testid_value(testid)
            return True if val == "Da" else False if val == "Nu" else None

        def extract_int(testid, suffix=""):
            val = extract_testid_value(testid)
            if val:
                try:
                    return int(val.replace(suffix, "").replace(" ", ""))
                except:
                    return None
            return None

        def clean(text):
            return text.strip() if text else None

        title = clean(response.css("h1::text").get())
        price_raw = response.css("span.offer-price__number::text").get()
        price = None
        if price_raw:
            try:
                price = float(price_raw.replace("\xa0", "").replace(" ", "").replace(",", "."))
            except:
                print(f"Error parsing price: {price_raw}")
                
        source_url = response.url

        brand = extract_testid_value("make")
        model = extract_testid_value("model")
        year = extract_int("year", "")
        mileage = extract_int("mileage", " km")
        fuel_type = extract_testid_value("fuel_type")
        
        is_electric = (fuel_type == "Electric")
        battery_capacity = None
        range_km = None
        
        engine_capacity = None
        if is_electric:
            engine_capacity = 0
            
            detail_elements = response.css('div[data-testid="detail"]')
            
            for detail in detail_elements:
                aria_label = detail.attrib.get('aria-label', '')
                
                if 'Autonomie' in aria_label:
                    try:
                        km_text = detail.css('p.ez0zock2::text').get() or detail.css('p.ooa-11fwepm::text').get()
                        if km_text:
                            range_km = int(km_text.replace('km', '').strip())
                    except Exception as e:
                        print(f"Error extracting range: {e}")
                        
                elif 'Capacitate baterie' in aria_label:
                    try:
                        battery_text = detail.css('p.ez0zock2::text').get() or detail.css('p.ooa-11fwepm::text').get()
                        if battery_text:
                            battery_capacity = float(battery_text.replace('kWh/100km', '').strip())
                    except Exception as e:
                        print(f"Error extracting battery capacity: {e}")
                        
                elif 'Consum mediu' in aria_label:
                    try:
                        consumption_text = detail.css('p.ez0zock2::text').get() or detail.css('p.ooa-11fwepm::text').get()
                        if consumption_text:
                            consumption_mixed = consumption_text.strip()
                    except Exception as e:
                        print(f"Error extracting consumption: {e}")
            
        transmission = extract_testid_value("gearbox")
        if is_electric and transmission == None:
            transmission = "Automata"
        engine_power = extract_int("engine_power", " CP")
        emission_standard = extract_testid_value("pollution_standard")
        doors = extract_int("door_count")
        nr_seats = extract_int("nr_seats")
        color = extract_testid_value("color")
        color_type = extract_testid_value("colour_type")
        drive_type = extract_testid_value("body_type")
        traction = extract_testid_value("transmission")
        vehicle_condition = extract_testid_value("new_used")
        vin = extract_testid_value("advert-vin")
        
        if engine_capacity is None:
            engine_capacity = extract_int("engine_capacity", " cm3")
            
        version = extract_testid_value("version")
        generation = extract_testid_value("generation")
        emissions = extract_testid_value("co2_emissions")
        consumption_city = extract_testid_value("urban_consumption")
        consumption_highway = extract_testid_value("extra_urban_consumption")
        consumption_mixed = extract_testid_value("mixed_consumption") or extract_testid_value("avg_energy_consumption")
        origin_country = extract_testid_value("country_origin")
        registered = extract_boolean("registered")
        first_owner = extract_boolean("original_owner")
        no_accident = extract_boolean("no_accident")
        service_book = extract_boolean("service_record")
        
        right_hand_drive = extract_boolean("rhd")
        damaged = extract_boolean("damaged")

        seller_type = None
        
        for seller_li in response.css("li"):
            svg_name = seller_li.css("svg::attr(name)").get()
            if svg_name in ["dealer", "private-seller","authorized-dealer"]:
                text = seller_li.css("p::text").get().lower()
                if text:
                    if "dealer" in svg_name or "autorizat" in svg_name:
                        seller_type = "Dealer"
                    elif "persoana" in svg_name or "fizica" in svg_name or "privat" in svg_name or "private" in svg_name:
                        seller_type = "Private"
                break

        possible_locations = response.css("p.ef0vquw1.ooa-1frho3b::text").getall()
        location = next((loc.strip() for loc in possible_locations if "," in loc or "Sector" in loc or "judet" in loc.lower()), None)

        description = response.css("div[data-testid='textWrapper'] p::text").getall()

        itp_text = next((line for line in description if "ITP" in line), None)
        itp_valid_until = None
        if itp_text:
            match = re.search(r'\d{2}\.\d{2}\.\d{4}', itp_text)
            if match:
                try:
                    itp_valid_until = datetime.strptime(match.group(), "%d.%m.%Y")
                except:
                    pass

        features = response.css('div[data-testid="content-equipments-section"] p.e1jq34to3 ooa-1hoe3s8::text').getall()
        features = [f.strip() for f in features if f.strip()]

        image_urls = response.css("img::attr(src)").getall()
        image_urls = [url for url in image_urls if "olxcdn.com" in url or "apollo.olxcdn.com" in url]
        images = json.dumps(image_urls)

        ad_created_raw = response.css("p.e11t9j226::text").get()
        ad_created_at = None

        if ad_created_raw:
            try:
                parts = ad_created_raw.split(" ")
                ziua = parts[0]
                luna = month_map.get(parts[1].lower())
                anul = parts[2]
                ad_created_at = datetime.strptime(f"{ziua}.{luna}.{anul}", "%d.%m.%Y")
            except Exception as e:
                print(f"Date parse error: {e}")

        created_at = datetime.now()

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
            self.update_incomplete_stats("autovit", missing_fields)
            self.skipped_cars += 1
            self.incomplete_cars += 1
            print(f"Incomplete ad: {source_url} - Missing fields: {', '.join(missing_field_list)}")
            return

        session = SessionLocal()
        try:
            existing = session.query(CarListing).filter_by(source_url=source_url).first()
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
                brand=brand,
                model=model,
                price=price,
                year=year,
                mileage=mileage,
                fuel_type=fuel_type,
                transmission=transmission,
                engine_power=engine_power,
                emission_standard=emission_standard,
                doors=doors,
                nr_seats=nr_seats,
                color=color,
                drive_type=drive_type,
                vehicle_condition=vehicle_condition,
                vin=vin,
                engine_capacity=engine_capacity,
                is_new=True if vehicle_condition == "Nou" else False,
                images=images,
                source_url=source_url,
                description=json.dumps(description) if description else None,
                location=location,
                seller_type=seller_type,
                deal_rating=None,
                version=version,
                color_type=color_type,
                traction=traction,
                generation=generation,
                emissions=emissions,
                consumption_city=consumption_city,
                consumption_highway=consumption_highway,
                consumption_mixed=consumption_mixed,
                origin_country=origin_country,
                first_owner=first_owner,
                no_accident=no_accident,
                service_book=service_book,
                registered=registered,
                features=json.dumps(features) if features else None,
                ad_created_at=ad_created_at,
                itp_valid_until=itp_valid_until,
                created_at=created_at,
                price_history=None,
                sold=False,
                damaged=damaged,
                right_hand_drive=right_hand_drive,
                battery_capacity=battery_capacity,
                range_km=range_km
            )

            session.add(car)
            session.commit()
            self.valid_cars += 1
            self.increment_valid_cars_counter("autovit")
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