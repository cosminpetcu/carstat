import schedule
import time
import subprocess

def run_spider():
    print("▶️ Rulăm scraper-ul OLX...")
    subprocess.run(["scrapy", "crawl", "olx_autoturisme"])

schedule.every(30).minutes.do(run_spider)

print("⏳ Așteptăm următoarea rulare a scraper-ului...")
while True:
    schedule.run_pending()
    time.sleep(1)
