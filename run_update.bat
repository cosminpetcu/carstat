@echo off
echo Running update_partial_data at %date% %time%
cd /d "C:\Users\cosmi\Desktop\LICENTA\CarStat\backend\olx_scraper"
set PYTHONPATH=%PYTHONPATH%;C:\Users\cosmi\Desktop\LICENTA\CarStat\backend\olx_scraper
call venv_scrapy\Scripts\activate

:run_spider
timeout /t 5 /nobreak
echo Starting spider at %date% %time%
scrapy crawl update_partial_data > scrapy_output.log

findstr /C:"Blocaj Cloudflare (403)" scrapy_output.log > nul
if %errorlevel% equ 0 (
    echo Cloudflare block detected at %date% %time%
    echo Waiting 5 minutes before restarting...
    timeout /t 300 /nobreak
    echo Restarting spider after Cloudflare cooldown...
    goto run_spider
) else (
    echo Spider completed without Cloudflare blocks at %date% %time%
)

call venv_scrapy\Scripts\deactivate

cd /d "C:\Users\cosmi\Desktop\LICENTA\CarStat"
echo Update completed at %date% %time%