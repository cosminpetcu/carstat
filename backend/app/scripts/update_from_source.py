import json
import time
import re
import os
import sys
import concurrent.futures
from datetime import datetime, timedelta
from playwright.sync_api import sync_playwright, Error as PlaywrightError
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.models import CarListing

progress_file = os.path.join(os.path.dirname(__file__), "progress_tracker.txt")

def get_progress():
    if os.path.exists(progress_file):
        with open(progress_file, "r") as f:
            return int(f.read().strip())
    return 0

def save_progress(index):
    with open(progress_file, "w") as f:
        f.write(str(index))

month_map = {
    "ianuarie": "01", "februarie": "02", "martie": "03",
    "aprilie": "04", "mai": "05", "iunie": "06",
    "iulie": "07", "august": "08", "septembrie": "09",
    "octombrie": "10", "noiembrie": "11", "decembrie": "12",
}

def extract_features_by_category(page):
    features_grouped = {}
    
    headers = page.query_selector_all("div[data-testid='content-equipments-section'] header[role='button'] p")
    categories = []
    for header in headers:
        category_name = header.inner_text().strip()
        if category_name and category_name != "Dotări":
            categories.append(category_name)
    
    for category in categories:
        try:
            header = page.query_selector(f"header:has(p:text('{category}'))")
            if not header:
                continue
                
            header.click()
            page.wait_for_timeout(500)
            
            equipment_section = page.query_selector("div[data-testid='content-equipments-section']")
            if not equipment_section:
                continue

            all_text = equipment_section.inner_text()
            lines = [line.strip() for line in all_text.split('\n') if line.strip()]
            
            features = []
            for line in lines:
                if line != "Dotări" and line not in categories:
                    features.append(line)
            
            if features:
                features_grouped[category] = features
            
        except Exception as e:
            continue
    
    return features_grouped

def check_response_status(page, url):
    response_info = None
    
    def handle_response(response):
        nonlocal response_info
        if response.url == url:
            response_info = {
                "status": response.status,
                "status_text": response.status_text,
                "url": response.url
            }
    
    page.on("response", handle_response)
    
    try:
        page.goto(url, timeout=60000, wait_until="domcontentloaded")  # Redus timeout de la 60000ms la 30000ms
        
        # Așteaptă puțin să se înregistreze răspunsul
        if response_info is None:
            time.sleep(1)  # Redus de la 2s la 1s
        
        if response_info:
            print(f"📊 Cod răspuns: {response_info['status']} ({response_info['status_text']}) pentru {url}")
            
            # Oprește scriptul dacă primim 403 Forbidden
            if response_info['status'] == 403:
                print("❌ A fost detectat codul 403 Forbidden! Se oprește scriptul.")
                sys.exit(1)
                
        else:
            print(f"⚠️ Nu s-a putut obține codul de răspuns pentru {url}")
        
        return response_info
    except PlaywrightError as e:
        if "ERR_CONNECTION_REFUSED" in str(e):
            print(f"❌ Conexiune refuzată pentru {url}")
        elif "timeout" in str(e).lower():
            print(f"⏱️ Timeout la încărcarea paginii {url}")
        else:
            print(f"❌ Eroare la accesarea {url}: {e}")
        return None

def update_car_from_olx(page, car: CarListing, db: Session):
    response_info = check_response_status(page, car.source_url)
    if not response_info or response_info["status"] >= 400:
        print(f"⚠️ Nu se poate actualiza mașina de la OLX din cauza codului de răspuns: {response_info['status'] if response_info else 'necunoscut'}")
        return
    
    updated = False
    content = page.content()

    # views
    if car.views is None:
        try:
            views_raw = page.locator("span[data-testid='page-view-counter']").inner_text(timeout=2000)
            match = re.search(r"\d+", views_raw.replace(".", ""))
            if match:
                car.views = int(match.group())
                updated = True
        except:
            pass

    # seller type
    if car.seller_type is None:
        try:
            html = page.locator("div[data-testid='ad-parameters-container']").inner_text(timeout=2000).lower()
            if "persoană fizică" in html or "persoana fizică" in html:
                car.seller_type = "private"
                updated = True
            elif "firmă" in html or "firma" in html:
                car.seller_type = "dealer"
                updated = True
        except:
            pass

    # right hand drive
    if car.right_hand_drive is None:
        try:
            texts = page.locator("p").all_inner_texts()
            car.right_hand_drive = any("partea dreapta" in el.lower() for el in texts)
            updated = True
        except:
            pass

    # vin
    if car.vin is None:
        try:
            texts = page.locator("p").all_inner_texts()
            for p in texts:
                if "serie sasiu" in p.lower():
                    parts = p.split(":")
                    if len(parts) > 1:
                        car.vin = parts[-1].strip()
                        updated = True
        except:
            pass

    # ad_created_at
    if car.ad_created_at is None:
        try:
            raw_date = page.locator("span[data-testid='ad-posted-at']").inner_text(timeout=2000).lower().strip()
            if "azi" in raw_date:
                car.ad_created_at = datetime.now()
                updated = True
            elif "ieri" in raw_date:
                car.ad_created_at = datetime.now() - timedelta(days=1)
                updated = True
            else:
                parts = raw_date.split(" ")
                if len(parts) == 3:
                    ziua, luna_str, anul = parts
                    luna = month_map.get(luna_str.lower())
                    if luna:
                        car.ad_created_at = datetime.strptime(f"{ziua}.{luna}.{anul}", "%d.%m.%Y")
                        updated = True
        except:
            pass

    # price update
    try:
        price_raw = page.locator("meta[name='description']").get_attribute("content")
        match = re.search(r"([\d\s]+) €", price_raw)
        if match:
            new_price = float(match.group(1).replace(" ", ""))
            if new_price != car.price:
                history = json.loads(car.price_history or "[]")
                history.append({"price": car.price, "date": car.created_at.isoformat()})
                car.price_history = json.dumps(history)
                car.price = new_price
                car.created_at = datetime.now()
                updated = True
    except:
        pass

    # sold
    if "404" in page.title().lower() or "acest anunț nu mai este activ" in content:
        car.sold = True
        updated = True

    if updated:
        try:
            db.commit()
        except Exception as e:
            db.rollback()
            print(f"❌ Eroare la salvarea datelor: {e}")

def update_car_from_autovit(page, car: CarListing, db: Session):
    response_info = check_response_status(page, car.source_url)
    if not response_info or response_info["status"] >= 400:
        print(f"⚠️ Nu se poate actualiza mașina de la Autovit din cauza codului de răspuns: {response_info['status'] if response_info else 'necunoscut'}")
        return
    
    updated = False
    content = page.content()
    
    try:
        page.wait_for_selector("h1", timeout=5000)  # Redus de la 10000ms la 5000ms
    except:
        print("⚠️ Nu s-a putut găsi elementul H1 pe pagină")
    
    if car.vin is None:
        try:
            vin_button = page.query_selector("button:has-text('Vezi VIN-ul (seria de sasiu)')")
            if vin_button:
                vin_button.click()
        except:
            pass
        
        try:
            vin_elem = page.query_selector("div[data-testid='advert-vin'] p")
            if vin_elem:
                car.vin = vin_elem.inner_text().strip()
                updated = True
        except:
            car.vin = None

    if car.ad_created_at is None:
        try:
            raw = page.locator("p.e11t9j226").inner_text(timeout=2000)
            ziua, luna_str, anul = raw.split(" ")
            luna = month_map.get(luna_str.lower())
            if luna:
                car.ad_created_at = datetime.strptime(f"{ziua}.{luna}.{anul}", "%d.%m.%Y")
                updated = True
        except:
            pass

    if not car.features or car.features == "[]":
        try:
            features_grouped = extract_features_by_category(page)
            # Convertim dicționarul în JSON pentru a evita eroarea "can't adapt type 'dict'"
            car.features = json.dumps(features_grouped)
            updated = True
        except Exception as e:
            print(f"❌ Eroare la extragerea caracteristicilor: {e}")
            pass

    if car.damaged is None:
        try:
            damaged_div = page.query_selector("div[data-testid='damaged']")
            if damaged_div:
                damaged_text = damaged_div.query_selector("p.ekwurce9")
                if damaged_text:
                    value = damaged_text.inner_text().strip().lower()
                    car.damaged = (value == "da")
                    updated = True
                else:
                    car.damaged = None
            else:
                car.damaged = None
        except:
            car.damaged = None

    if car.seller_type is None:
        try:
            seller_section = page.query_selector("div:has-text('Informații despre vânzător')")
            if seller_section:
                seller_texts = seller_section.query_selector_all("p")
                for elem in seller_texts:
                    text = elem.inner_text().lower()
                    if "dealer" in text:
                        car.seller_type = "dealer"
                        updated = True
                        break
                    elif "persoană fizică" in text or "persoana fizica" in text:
                        car.seller_type = "private"
                        updated = True
                        break
        except:
            pass

    if car.right_hand_drive is None:
        try:
            rhd_div = page.query_selector("div[data-testid='rhd']")
            if rhd_div:
                rhd_text = rhd_div.query_selector("p.ekwurce9")
                if rhd_text:
                    value = rhd_text.inner_text().strip().lower()
                    car.right_hand_drive = (value == "da")
                    updated = True
                else:
                    car.right_hand_drive = None
            else:
                car.right_hand_drive = None
        except:
            car.right_hand_drive = None

    try:
        price_text = page.locator("span.offer-price__number").inner_text(timeout=2000)
        new_price = float(price_text.replace("\xa0", "").replace(" ", "").replace(",", "."))
        if new_price != car.price:
            history = json.loads(car.price_history or "[]")
            history.append({"price": car.price, "date": car.created_at.isoformat()})
            car.price_history = json.dumps(history)
            car.price = new_price
            car.created_at = datetime.now()
            updated = True
    except:
        pass

    if "404" in page.title().lower() or "anunțul nu mai este disponibil" in content.lower():
        car.sold = True
        updated = True

    if updated:
        try:
            db.commit()
        except Exception as e:
            db.rollback()
            print(f"❌ Eroare la salvarea datelor: {e}")
            
def process_car_batch(car_batch, browser_index=0):
    import os
    db = SessionLocal()
    last_car_id = None
    progress_file = os.path.join(os.path.dirname(__file__), f"progress_batch_{browser_index}.txt")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"
        )
        page = context.new_page()

        for car in car_batch:
            print(f"[Browser {browser_index}] Verificare: {car.source_url}")
            last_car_id = car.id
            try:
                if "olx.ro" in car.source_url:
                    update_car_from_olx(page, car, db)
                elif "autovit.ro" in car.source_url:
                    update_car_from_autovit(page, car, db)
                time.sleep(1)
            except Exception as e:
                print(f"⚠️ Eroare la {car.source_url}: {str(e)}")
                db.rollback()

        browser.close()
    db.close()

    if last_car_id is not None:
        with open(progress_file, "w") as f:
            f.write(str(last_car_id))


def run_update_parallel(num_browsers=4, batch_size=500):
    """Rulează actualizarea folosind mai multe browsere în paralel"""
    db = SessionLocal()
    all_cars = db.query(CarListing).filter(CarListing.sold == False).order_by(CarListing.id).all()
    db.close()
    
    start_index = get_progress()
    remaining_cars = all_cars[start_index:]
    
    print(f"Se procesează {len(remaining_cars)} mașini, începând de la indexul {start_index}")
    
    # Împărțim mașinile în batch-uri pentru a fi procesate de fiecare browser
    batches = []
    for i in range(0, len(remaining_cars), batch_size):
        batches.append(remaining_cars[i:i+batch_size])
    
    # Folosim atâtea browsere câte sunt specificate, sau câte batch-uri avem (care e mai mic)
    active_browsers = min(num_browsers, len(batches))
    
    print(f"Se lansează {active_browsers} browsere pentru {len(batches)} batch-uri")
    
    with concurrent.futures.ProcessPoolExecutor(max_workers=active_browsers) as executor:
        futures = []
        for i, batch in enumerate(batches):
            futures.append(executor.submit(process_car_batch, batch, i))
        
        for future in concurrent.futures.as_completed(futures):
            try:
                future.result()
            except Exception as e:
                print(f"❌ Eroare în procesul paralel: {e}")
    
    latest_id = start_index
    for i in range(active_browsers):
        batch_file = os.path.join(os.path.dirname(__file__), f"progress_batch_{i}.txt")
        if os.path.exists(batch_file):
            with open(batch_file, "r") as f:
                try:
                    car_id = int(f.read().strip())
                    latest_id = max(latest_id, car_id)
                except:
                    continue

    save_progress(latest_id)
    print(f"✅ Progres salvat până la ID-ul: {latest_id}")

def run_update_sequential():
    """Versiunea secvențială, folosind un singur browser"""
    db = SessionLocal()
    all_cars = db.query(CarListing).filter(CarListing.sold == False).order_by(CarListing.id).all()
    start_index = get_progress()
    
    print(f"Se procesează {len(all_cars)-start_index} mașini, începând de la indexul {start_index}")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"
        )
        page = context.new_page()

        for i, car in enumerate(all_cars[start_index:], start=start_index):
            print(f"[{i+1}/{len(all_cars)}] Verificare: {car.source_url}")

            try:
                if "olx.ro" in car.source_url:
                    update_car_from_olx(page, car, db)
                elif "autovit.ro" in car.source_url:
                    update_car_from_autovit(page, car, db)
            except Exception as e:
                print(f"⚠️ Eroare la {car.source_url}: {e}")
                # Rollback pentru a evita blocarea sesiunii
                db.rollback()

            save_progress(i + 1)
            
            # Pauză scurtă între cereri
            time.sleep(1)

        browser.close()
    db.close()

if __name__ == "__main__":
    # Detectăm câte nuclee CPU are computerul pentru a seta numărul optim de browsere
    import multiprocessing
    num_cpus = multiprocessing.cpu_count()
    recommended_browsers = max(1, num_cpus - 1)  # Lăsăm un nucleu liber pentru OS
    
    print(f"Sistem detectat cu {num_cpus} nuclee CPU. Se vor folosi {recommended_browsers} browsere paralele.")
    
    # Folosim varianta paralelă pentru viteza mai mare
    run_update_parallel(num_browsers=recommended_browsers, batch_size=10)
    
    # Alternativ, puteți folosi versiunea secvențială care e mai puțin intensivă pentru resurse
    # run_update_sequential()