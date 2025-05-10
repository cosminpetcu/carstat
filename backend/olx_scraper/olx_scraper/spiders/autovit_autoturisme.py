import scrapy
from app.models.models import CarListing
from app.database import SessionLocal
from datetime import datetime
import json
import re
import time
import os
from urllib.parse import urljoin
from scrapy.exceptions import CloseSpider

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
    handle_httpstatus_list = [301, 302]
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.valid_cars = 0
        self.skipped_cars = 0
        self.max_pages = 1300
        self.current_page = 29
        self.consecutive_empty_pages = 0
        self.max_consecutive_empty = 50
        self.got_forbidden = False
        
        log_dir = os.path.dirname(os.path.join(os.path.dirname(__file__), "../../scraper.log"))
        if not os.path.exists(log_dir):
            os.makedirs(log_dir, exist_ok=True)

    def start_requests(self):
        try:
            with open("last_page.txt", "r") as f:
                start_page = int(f.read().strip())
                self.current_page = start_page
                self.log(f"Restarting from saved page: {start_page}")
        except:
            start_page = 1
            self.current_page = 1
            self.log("Starting from page 1")
        
        with open("last_page.txt", "w") as f:
            f.write(str(start_page))
            
        url = f"https://www.autovit.ro/autoturisme?page={start_page}"
        yield scrapy.Request(
            url=url, 
            callback=self.parse,
            meta={'dont_redirect': False, 'handle_httpstatus_list': [301, 302]}
        )

    def closed(self, reason):
        if reason == "403_cooldown":
            self.log_to_file(f"Spider closed due to 403 Forbidden. Sleeping for 5 minutes...")
            self.log(f"Spider closed due to 403 Forbidden. Sleeping for 5 minutes...")
            
            with open("last_page.txt", "w") as f:
                f.write(str(self.current_page))
                
            time.sleep(300)
            
            self.log_to_file(f"5-minute cooldown completed. Please restart the spider manually to continue from page {self.current_page}")
            self.log(f"5-minute cooldown completed. Please restart the spider manually to continue from page {self.current_page}")
            print(f"\n\nCOOLDOWN COMPLETED: Please restart the spider to continue from page {self.current_page}\n\n")
        else:
            print(f"Scraping finished!")
            print(f"Valid cars added: {self.valid_cars}")
            print(f"Skipped cars (incomplete or duplicate): {self.skipped_cars}")
            print(f"Last page processed: {self.current_page}")
            self.log_to_file(f"Scraping finished! Valid cars: {self.valid_cars}, Skipped: {self.skipped_cars}, Last page: {self.current_page}")

    def log_to_file(self, message):
        log_path = os.path.join(os.path.dirname(__file__), "../../scraper.log")
        with open(log_path, "a", encoding="utf-8") as log_file:
            log_file.write(f"[{datetime.now().isoformat()}] {message}\n")

    def parse(self, response):
        if self.got_forbidden:
            return
            
        if response.status == 403:
            self.got_forbidden = True
            self.log_to_file(f"Received 403 Forbidden at {response.url}, stopping all operations and sleeping for 5 minutes...")
            self.log(f"Received 403 Forbidden, stopping all operations and sleeping for 5 minutes...")
            
            raise CloseSpider("403_cooldown")
            
        if response.status in [301, 302]:
            redirect_url = response.headers.get('Location', b'').decode('utf-8')
            if redirect_url:
                if not redirect_url.startswith(('http://', 'https://')):
                    redirect_url = urljoin(response.url, redirect_url)
                
                self.log(f"Following redirect from {response.url} to {redirect_url}")
                yield scrapy.Request(
                    url=redirect_url, 
                    callback=self.parse_ad if '/anunt/' in redirect_url else self.parse,
                    meta={'dont_redirect': False, 'handle_httpstatus_list': [301, 302]}
                )
            return
            
        match = re.search(r"page=(\d+)", response.url)
        if match:
            self.current_page = int(match.group(1))
        else:
            pass
            
        self.log_to_file(f"Processing page {self.current_page}: {response.url}")
        self.log(f"Processing page {self.current_page}")
        
        if "Nu s-a găsit nicio ofertă care să se potrivească căutării tale" in response.text:
            self.log_to_file(f"Received 'No results' message at page {self.current_page}, but will continue to next page")
            self.log(f"Received 'No results' message at page {self.current_page}, but will continue to next page")
            self.consecutive_empty_pages += 1
            
            if self.consecutive_empty_pages >= self.max_consecutive_empty:
                self.log_to_file(f"Reached {self.max_consecutive_empty} consecutive empty pages, stopping")
                self.log(f"Reached {self.max_consecutive_empty} consecutive empty pages, stopping")
                return
            
            yield from self.process_next_page()
            return

        ad_links = []
        for link in response.css('a::attr(href)').getall():
            if link.startswith('/autoturisme/anunt/') or link.startswith('https://www.autovit.ro/autoturisme/anunt/'):
                if not link.startswith(('http://', 'https://')):
                    link = 'https://www.autovit.ro' + link
                if "ver-" not in link:
                    ad_links.append(link)
                
        if not ad_links:
            self.consecutive_empty_pages += 1
            self.log_to_file(f"No ads found on page {self.current_page}, consecutive empty pages: {self.consecutive_empty_pages}")
            self.log(f"No ads found on page {self.current_page}, consecutive empty pages: {self.consecutive_empty_pages}")
            
            if self.consecutive_empty_pages >= self.max_consecutive_empty:
                self.log_to_file(f"Reached {self.max_consecutive_empty} consecutive empty pages, stopping")
                self.log(f"Reached {self.max_consecutive_empty} consecutive empty pages, stopping")
                return
                
            yield from self.process_next_page()
            return
            
        self.consecutive_empty_pages = 0
            
        self.log_to_file(f"Found {len(ad_links)} ads on page {self.current_page}")
        self.log(f"Found {len(ad_links)} ads on page {self.current_page}")
        
        for link in ad_links:
            yield scrapy.Request(
                url=link, 
                callback=self.parse_ad,
                meta={'dont_redirect': False, 'handle_httpstatus_list': [301, 302]}
            )
            
        yield from self.process_next_page()

    def process_next_page(self):
        """Metoda pentru a procesa următoarea pagină"""
        if self.current_page < self.max_pages:
            next_page = self.current_page + 1
            
            with open("last_page.txt", "w") as f:
                f.write(str(next_page))

            time.sleep(2)
            
            next_url = f"https://www.autovit.ro/autoturisme?page={next_page}"
            self.log_to_file(f"Moving to page {next_page}")
            yield scrapy.Request(
                url=next_url, 
                callback=self.parse,
                meta={'dont_redirect': False, 'handle_httpstatus_list': [301, 302]}
            )
        else:
            self.log_to_file(f"Reached maximum page limit ({self.max_pages})")
            self.log(f"Reached maximum page limit ({self.max_pages})")

    def parse_ad(self, response):
        if self.got_forbidden:
            return
        
        if response.status == 403:
            self.got_forbidden = True
            self.log_to_file(f"Received 403 Forbidden at an ad page: {response.url}, stopping all operations and sleeping for 5 minutes...")
            self.log(f"Received 403 Forbidden at an ad page, stopping all operations and sleeping for 5 minutes...")
            
            raise CloseSpider("403_cooldown")
    
        if response.status in [301, 302]:
            redirect_url = response.headers.get('Location', b'').decode('utf-8')
            if redirect_url:
                if not redirect_url.startswith(('http://', 'https://')):
                    redirect_url = urljoin(response.url, redirect_url)
                    
                self.log(f"Following ad redirect from {response.url} to {redirect_url}")
                yield scrapy.Request(
                    url=redirect_url, 
                    callback=self.parse_ad,
                    meta={'dont_redirect': False, 'handle_httpstatus_list': [301, 302]}
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
                self.log(f"Error parsing price: {price_raw}")
                
        source_url = response.url

        brand = extract_testid_value("make")
        model = extract_testid_value("model")
        year = extract_int("year", "")
        mileage = extract_int("mileage", " km")
        fuel_type = extract_testid_value("fuel_type")
        
        engine_capacity = None
        if fuel_type == "electric":
            engine_capacity = 0
            
        transmission = extract_testid_value("gearbox")
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
            if svg_name in ["dealer", "private-seller"]:
                text = seller_li.css("p::text").get()
                if text:
                    if "dealer" in svg_name:
                        seller_type = "dealer"
                    elif "private" in svg_name:
                        seller_type = "private"
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
                self.log(f"Date parse error: {e}")

        created_at = datetime.now()

        mandatory_fields = [title, price, brand, model, year, mileage, fuel_type, engine_capacity, transmission]
        if any(field is None for field in mandatory_fields):
            self.skipped_cars += 1
            self.log(f"Incomplete ad: {source_url}")
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
                        self.log(f"Updated price for: {source_url}")
                    except Exception as e:
                        self.log(f"Error updating price: {e}")
                        session.rollback()
                self.skipped_cars += 1
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
            )

            session.add(car)
            session.commit()
            self.valid_cars += 1
            self.log(f"Added new car: {brand} {model} ({year})")
        except Exception as e:
            self.log(f"DB Error: {e}")
            session.rollback()
        finally:
            session.close()