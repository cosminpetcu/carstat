from playwright.sync_api import sync_playwright
import json
from datetime import datetime

def extract_autovit_data(url: str):
    data = {}
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        page.goto(url, timeout=60000)

        page.wait_for_selector("h1", timeout=10000)

        try:
            vin_button = page.query_selector("button:has-text('Vezi VIN-ul (seria de sasiu)')")
            if vin_button:
                vin_button.click()
        except:
            pass

        features_grouped = extract_features_by_category(page)

        data["features"] = features_grouped

        try:
            vin_elem = page.query_selector("div[data-testid='advert-vin'] p")
            if vin_elem:
                data["vin"] = vin_elem.inner_text().strip()
        except:
            data["vin"] = None

        seller_type = None
        try:
            seller_section = page.query_selector("div:has-text('Informații despre vânzător')")
            if seller_section:
                seller_texts = seller_section.query_selector_all("p")
                for elem in seller_texts:
                    text = elem.inner_text().lower()
                    if "dealer" in text:
                        seller_type = "dealer"
                        break
                    elif "persoană fizică" in text or "persoana fizica" in text:
                        seller_type = "private"
                        break
        except:
            pass
        data["seller_type"] = seller_type

        try:
            rhd_div = page.query_selector("div[data-testid='rhd']")
            if rhd_div:
                rhd_text = rhd_div.query_selector("p.ekwurce9")
                if rhd_text:
                    value = rhd_text.inner_text().strip().lower()
                    data["right_hand_drive"] = (value == "da")
                else:
                    data["right_hand_drive"] = None
            else:
                data["right_hand_drive"] = None
        except Exception as e:
            print(f"Error extracting right_hand_drive: {str(e)}")
            data["right_hand_drive"] = None

        try:
            damaged_div = page.query_selector("div[data-testid='damaged']")
            if damaged_div:
                damaged_text = damaged_div.query_selector("p.ekwurce9")
                if damaged_text:
                    value = damaged_text.inner_text().strip().lower()
                    data["damaged"] = (value == "da")
                else:
                    data["damaged"] = None
            else:
                data["damaged"] = None
        except Exception as e:
            print(f"Error extracting damaged: {str(e)}")
            data["damaged"] = None
        
        try:
            date_elem = page.query_selector("p.e11t9j226")
            if date_elem:
                raw_date = date_elem.inner_text().strip()
                parts = raw_date.split(" ")
                if len(parts) >= 3:
                    ziua = parts[0]
                    luna_map = {
                        "ianuarie": "01", "februarie": "02", "martie": "03", "aprilie": "04",
                        "mai": "05", "iunie": "06", "iulie": "07", "august": "08",
                        "septembrie": "09", "octombrie": "10", "noiembrie": "11", "decembrie": "12"
                    }
                    luna = luna_map.get(parts[1].lower())
                    anul = parts[2]
                    if ziua and luna and anul:
                        ad_created_at = datetime.strptime(f"{ziua}.{luna}.{anul}", "%d.%m.%Y")
                        data["ad_created_at"] = ad_created_at.isoformat()
        except:
            data["ad_created_at"] = None

        browser.close()
        return data

def extract_features_by_category(page):
    """Try to extract features by clicking each category header one at a time"""
    features_grouped = {}
    
    headers = page.query_selector_all("div[data-testid='content-equipments-section'] header[role='button'] p")
    categories = []
    for header in headers:
        category_name = header.inner_text().strip()
        if category_name and category_name != "Dotări":
            categories.append(category_name)
            
    print(f"Found {len(categories)} categories: {categories}")
    
    for category in categories:
        try:
            header = page.query_selector(f"header:has(p:text('{category}'))")
            if not header:
                print(f"Could not find header for category: {category}")
                continue
                
            header.click()
            page.wait_for_timeout(1000)
            
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
                print(f"Found {len(features)} features for category {category}")
            
        except Exception as e:
            print(f"Error processing category {category}: {str(e)}")
            
    return features_grouped


if __name__ == "__main__":
    autovit_url = "https://www.autovit.ro/autoturisme/anunt/audi-s7-ver-3-0-tdi-quattro-tiptronic-ID7HzEUo.html"
    results = extract_autovit_data(autovit_url)
    print(json.dumps(results, indent=2, ensure_ascii=False))