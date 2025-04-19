import scrapy
from urllib.parse import urljoin
from app.models.models import CarListing
from app.database import SessionLocal
import json
from datetime import datetime

def extract_location(core_title: str, full_title: str) -> str | None:
        if "•" not in full_title:
            return None

        before_dot = full_title.split("•")[0].strip()
        location_part = before_dot.replace(core_title, "").strip()
        return location_part if location_part else None

class OlxAutoturismeSpider(scrapy.Spider):
    name = "olx_autoturisme"
    allowed_domains = ["olx.ro"]
    start_urls = ["https://www.olx.ro/auto-masini-moto-ambarcatiuni/autoturisme/"]
    
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
        title = None
        location = None

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
                print("⚠️ JSON-LD parsing failed:", e)

        details = {}
        detail_rows = response.css("div.css-41yf00 p.css-1los5bp::text").getall()
        for row in detail_rows:
            if ":" in row:
                key, value = row.split(":", 1)
                details[key.strip().lower()] = value.strip()
                
        source_url = response.url
        image_url = response.css("img::attr(src)").getall()
        image_url = [url for url in image_url if "olxcdn.com" in url]

        model = details.get("model")
        year = int(details.get("an de fabricatie", "0")) or None
        mileage = int(details.get("rulaj", "0").replace("km", "").replace(" ", "")) or None
        fuel_type = details.get("combustibil")
        engine_capacity = int(details.get("capacitate motor", "0").replace("cm³", "").replace(" ", "")) or None
        engine_power = int(details.get("putere", "0").replace("CP", "").replace(" ", "")) or None
        transmission = details.get("cutie de viteze")
        drive_type = details.get("caroserie")
        color = details.get("culoare")
        doors = int(details["numar de usi"]) if "numar de usi" in details and details["numar de usi"].isdigit() else None
        vehicle_condition = details.get("stare")
        created_at = datetime.now()



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
            seller_type = None,
            is_new = True,
            doors=doors,
            vehicle_condition=vehicle_condition,
            images=json.dumps(image_url),
            source_url=source_url,
            created_at = created_at
        )

        session = SessionLocal()
        
        try:
            existing = session.query(CarListing).filter_by(
                title=title,
                price=price,
                brand=brand,
                model=model,
                location=location,
                description=description
            ).first()

            if existing is None:
                session.add(car)
                session.commit()
            else:
                print("⚠️ Duplicate found, skipping...")
        except Exception as e:
            print("⚠️ DB Error:", e)
            session.rollback()
        finally:
            session.close()
