import scrapy
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.models import CarListing
from datetime import datetime
import json
from tqdm import tqdm # type: ignore
import os
import re
from scrapy.exceptions import CloseSpider

class UpdatePartialSpider(scrapy.Spider):
    name = "update_partial_data"

    def __init__(self):
        super().__init__()
        self.session: Session = SessionLocal()
        self.last_id_path = "last_updated_id.txt"
        self.last_processed_id = self.load_last_processed_id()
        self.checked_cars = 0
        self.updated_prices = 0
        self.marked_sold = 0
        self.errors = 0
        self.cloudflare_blocks = 0
        
        print("Cautare anunturi OLX active...")
        self.olx_ads = self.session.query(CarListing).filter(
            CarListing.source_url.like("%olx%"),
            CarListing.sold == False
        ).all()
        print(f"Gasite {len(self.olx_ads)} anunturi OLX active")
        
        print("Cautare anunturi Autovit active...")
        self.autovit_ads = self.session.query(CarListing).filter(
            CarListing.source_url.like("%autovit%"),
            CarListing.sold == False
        ).all()
        print(f"Gasite {len(self.autovit_ads)} anunturi Autovit active")

        self.all_ads = self.olx_ads + self.autovit_ads
        
        self.all_ads.sort(key=lambda car: car.id)
        
        self.urls_to_process = [
            car for car in self.all_ads
            if car.id > self.last_processed_id
        ]
        self.urls_to_process.sort(key=lambda car: car.id)
        
        self.total = len(self.urls_to_process)
        
        print(f"Total de procesat: {self.total} anunturi, incepand de la ID: {self.last_processed_id}")
        self.progress = tqdm(total=self.total, desc="Verificare anunturi")

    def load_last_processed_id(self):
        if os.path.exists(self.last_id_path):
            with open(self.last_id_path, "r") as f:
                try:
                    return int(f.read().strip())
                except ValueError:
                    print("Eroare la citirea last_updated_id.txt, se foloseste 0 ca valoare initiala")
                    return 0
        return 0

    def save_last_processed_id(self, car_id: int):
        with open(self.last_id_path, "w") as f:
            f.write(str(car_id))

    def start_requests(self):
        self.urls_to_process.sort(key=lambda car: car.id)
        
        for car in self.urls_to_process:    
            yield scrapy.Request(
                url=car.source_url,
                callback=self.parse,
                errback=self.handle_error,
                dont_filter=True,
                meta={    
                    'car_id': car.id,
                    'handle_httpstatus_list': [404, 403, 429]
                }
            )
    
    def handle_error(self, failure):
        car_id = failure.request.meta.get('car_id')
        print(f"Eroare la request pentru car_id {car_id}: {str(failure.value)}")
        
        self.errors += 1
        current_id = self.load_last_processed_id()
        if car_id > current_id:
            self.save_last_processed_id(car_id)
            print(f"Actualizat last_processed_id la {car_id}")
        
        self.progress.update(1)

    def parse(self, response):
        car_id = response.meta['car_id']
        car = self.session.query(CarListing).get(car_id)
        
        if not car:
            print(f"Masina cu ID {car_id} nu mai exista in baza de date")
            self.progress.update(1)
            return
            
        url = car.source_url
        self.checked_cars += 1
        
        if response.status == 404:
            car.sold = True
            car.sold_detected_at = datetime.now()
            self.marked_sold += 1
            print(f"Anunt marcat ca vandut (404): {url}")
            
            try:
                self.session.commit()
                current_id = self.load_last_processed_id()
                if car_id > current_id:
                    self.save_last_processed_id(car_id)
                    print(f"Actualizat last_processed_id la {car_id}")
            except Exception as e:
                print(f"DB error (404): {e}")
                self.session.rollback()
            self.progress.update(1)
            return
        
        elif response.status == 410:
            car.sold = True
            car.sold_detected_at = datetime.now()
            self.marked_sold += 1
            print(f"Anunt marcat ca vandut (410 Gone): {url}")
            
            try:
                self.session.commit()
                current_id = self.load_last_processed_id()
                if car_id > current_id:
                    self.save_last_processed_id(car_id)
                    print(f"Actualizat last_processed_id la {car_id}")
            except Exception as e:
                print(f"DB error (410): {e}")
                self.session.rollback()
            self.progress.update(1)
            return
        
        elif response.status == 403 or response.status == 429:
            self.cloudflare_blocks += 1
            print(f"Blocaj Cloudflare (403) pentru: {url}")
            
            current_id = self.load_last_processed_id()
            if car_id > current_id:
                self.save_last_processed_id(car_id)
                print(f"Actualizat last_processed_id la {car_id}")
            
            self.progress.update(1)
            raise CloseSpider("Blocaj Cloudflare detectat, se opreste spider-ul")

        if response.status == 200 and "olx" in url:
            page_text = response.text.lower()
            unavailable_indicators = [
                "acest anunț nu mai este disponibil",
                "acest anunt nu mai este disponibil", 
                "anunțul nu mai este disponibil",
                "anuntul nu mai este disponibil",
                "it seems like a dead end"
            ]
            
            is_error_page = any(indicator in page_text for indicator in unavailable_indicators)
            
            if is_error_page:
                car.sold = True
                car.sold_detected_at = datetime.now()
                self.marked_sold += 1
                print(f"Anunt OLX marcat ca vandut (pagina indisponibil): {url}")
                
                try:
                    self.session.commit()
                    current_id = self.load_last_processed_id()
                    if car_id > current_id:
                        self.save_last_processed_id(car_id)
                        print(f"Actualizat last_processed_id la {car_id}")
                except Exception as e:
                    print(f"DB error (OLX unavailable): {e}")
                    self.session.rollback()
                self.progress.update(1)
                return

        updated = False

        if "olx" in url:
            description_meta = response.css("meta[name='description']::attr(content)").get()

            if description_meta:
                match = re.search(r"([\d\s]+) €:?\s*", description_meta)
                if match:
                    new_price = float(match.group(1).replace(" ", "").replace("€", ""))
                    
                    if new_price and car.price and new_price != car.price:
                        history = []
                        try:
                            if car.price_history:
                                history = json.loads(car.price_history)
                        except Exception as e:
                            print(f"Could not parse price_history: {e}")
                        
                        history.append({
                            "price": car.price,
                            "date": car.created_at.isoformat()
                        })
                        car.price_history = json.dumps(history)
                        car.price = new_price
                        car.created_at = datetime.now()
                        updated = True
                        self.updated_prices += 1
                        print(f"Actualizat pret pentru OLX: {url}")

        elif "autovit" in url:
            price_raw = response.css("span.offer-price__number::text").get()
            new_price = None
            if price_raw:
                try:
                    new_price = float(price_raw.replace("\xa0", "").replace(" ", "").replace(",", "."))
                    
                    if new_price and car.price and new_price != car.price:
                        history = []
                        try:
                            if car.price_history:
                                history = json.loads(car.price_history)
                        except Exception as e:
                            print(f"Could not parse price_history: {e}")
                        
                        history.append({
                            "price": car.price,
                            "date": car.created_at.isoformat()
                        })
                        car.price_history = json.dumps(history)
                        car.price = new_price
                        car.created_at = datetime.now()
                        updated = True
                        self.updated_prices += 1
                        print(f"Actualizat pret pentru Autovit: {url}")
                except Exception as e:
                    print(f"Eroare la parsare pret Autovit: {e}")
                    
        try:
            if updated:
                self.session.commit()
                print(f"Modificari salvate pentru: {url}")
        except Exception as e:
            print(f"DB error: {e}")
            self.session.rollback()

        current_id = self.load_last_processed_id()
        if car_id > current_id:
            self.save_last_processed_id(car_id)
            print(f"Actualizat last_processed_id la {car_id}")
        
        self.progress.update(1)

    def closed(self, reason):
        print("\n========== STATISTICI ==========")
        print(f"Masini verificate: {self.checked_cars}")
        print(f"Preturi actualizate: {self.updated_prices}")
        print(f"Masini marcate ca vandute: {self.marked_sold}")
        print(f"Erori: {self.errors}")
        print(f"Blocaje Cloudflare: {self.cloudflare_blocks}")
        print("================================")
        
        if "cloudflare" in reason.lower():
            print("Spider inchis din cauza blocajului Cloudflare.")
            return
            
        if self.cloudflare_blocks == 0 and self.urls_to_process and self.checked_cars >= len(self.urls_to_process):
            self.save_last_processed_id(0)
            print("Toate masinile au fost procesate cu succes.")
            print("Resetat contorul la 0 pentru urmatoarea rulare.")
        
        self.session.close()
        self.progress.close()