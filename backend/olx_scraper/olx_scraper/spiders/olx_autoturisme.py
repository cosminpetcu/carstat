import scrapy
from urllib.parse import urljoin
from app.models.models import CarListing
from app.database import SessionLocal
import json
from datetime import datetime, timedelta
import re

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
    start_urls = ["https://www.olx.ro/auto-masini-moto-ambarcatiuni/autoturisme/"]
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.valid_cars = 0
        self.skipped_cars = 0
    
    def closed(self, reason):
        print(f"Scraping finished!")
        print(f"Valid cars added: {self.valid_cars}")
        print(f"Skipped cars (incomplete or duplicate): {self.skipped_cars}")

    def start_requests(self):
        from app.database import SessionLocal
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
        for ad in ads:
            ad_url = ad.css("a.css-1tqlkj0::attr(href)").get()
            if ad_url:
                ad_url = response.urljoin(ad_url)
                yield scrapy.Request(url=ad_url, callback=self.parse_ad)
                
        next_page = response.css("a[data-testid='pagination-forward']::attr(href)").get()
        if next_page:
            next_page_url = response.urljoin(next_page)
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


        title = clean(response.css("h4.css-1dcem4b::text").get())
        full_title = clean(response.css("title::text").get())
        location = extract_location(title, full_title)

        description_meta = response.css("meta[name='description']::attr(content)").get()
        description = None
        price = None

        if description_meta:
            import re
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
        detail_rows = response.css("div.css-41yf00 p.css-1los5bp::text").getall()
        for row in detail_rows:
            if ":" in row:
                key, value = row.split(":", 1)
                details[key.strip().lower()] = value.strip()

        model = details.get("model")
        year = int(details.get("an de fabricatie", "0").replace(" ", "")) or None
        mileage = int(details.get("rulaj", "0").replace("km", "").replace(" ", "")) or None
        fuel_type = details.get("combustibil")
        engine_capacity = int(details.get("capacitate motor", "0").replace("cm³", "").replace(" ", "")) or None
        if(fuel_type == 'electric'):
            engine_capacity = 0
        engine_power = int(details.get("putere", "0").replace("CP", "").replace(" ", "")) or None
        transmission = details.get("cutie de viteze")
        drive_type = details.get("caroserie")
        color = details.get("culoare")
        doors = int(details["numar de usi"]) if "numar de usi" in details and details["numar de usi"].isdigit() else None
        vehicle_condition = details.get("stare")
        created_at = datetime.now()
        
        seller_type_raw = response.css("div[data-testid='ad-parameters-container'] span::text").get()
        seller_type = None

        if seller_type_raw:
            seller_type_raw = seller_type_raw.strip().lower()
            if "persoana" in seller_type_raw:
                seller_type = "private"
            elif "firma" in seller_type_raw:
                seller_type = "dealer"

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


        mandatory_fields = [title, price, brand, model, year, mileage, fuel_type, engine_capacity, transmission]
        if any(field is None for field in mandatory_fields):
            self.skipped_cars += 1
            print("Incomplete data, skipping car...")
            return


        source_url = response.url
        image_url = response.css("img::attr(src)").getall()
        image_url = [url for url in image_url if "olxcdn.com" in url]

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
            images=json.dumps(image_url),
            source_url=source_url,
            created_at=created_at,
            right_hand_drive=right_hand_drive,
            ad_created_at=ad_created_at,
            vin=vin
        )

        session = SessionLocal()
        try:
            existing = session.query(CarListing).filter_by(
                source_url=source_url
            ).first()

            if existing is None:
                session.add(car)
                session.commit()
                self.valid_cars += 1
            else:
                self.skipped_cars += 1
                print("Duplicate found, skipping...")
        except Exception as e:
            print("DB Error:", e)
            session.rollback()
        finally:
            session.close()
