from playwright.sync_api import sync_playwright
import json
import time

def scrape_mobilede_brands_models():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        page.goto("https://www.mobile.de/ro", timeout=60000)

        page.wait_for_selector("select[name='makeModelVariant1.make']")

        brand_options = page.query_selector_all("select[name='makeModelVariant1.make'] option")

        brands_models = {}

        for brand_option in brand_options:
            brand_value = brand_option.get_attribute("value")
            brand_name = brand_option.inner_text().strip()

            if not brand_value or brand_value == "":
                continue

            page.select_option("select[name='makeModelVariant1.make']", value=brand_value)

            time.sleep(1)

            model_options = page.query_selector_all("select[name='makeModelVariant1.model'] option")
            models = []
            for model_option in model_options:
                model_value = model_option.get_attribute("value")
                model_name = model_option.inner_text().strip()

                if not model_value or model_value == "":
                    continue

                models.append(model_name)

            brands_models[brand_name] = models

        browser.close()

        with open("mobilede_brands_models.json", "w", encoding="utf-8") as f:
            json.dump(brands_models, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    scrape_mobilede_brands_models()
