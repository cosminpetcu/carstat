@echo off
echo Running Scrapers at %date% %time%

cd /d "C:\Users\cosmi\Desktop\LICENTA\CarStat\backend\olx_scraper"

set PYTHONPATH=%PYTHONPATH%;C:\Users\cosmi\Desktop\LICENTA\CarStat\backend\olx_scraper

call venv_scrapy\Scripts\activate

timeout /t 10 /nobreak

echo Running OLX scraper...
scrapy crawl olx_autoturisme

echo Running Autovit scraper...
scrapy crawl autovit_autoturisme

call venv_scrapy\Scripts\deactivate

cd /d "C:\Users\cosmi\Desktop\LICENTA\CarStat"

echo Scraping completed at %date% %time%