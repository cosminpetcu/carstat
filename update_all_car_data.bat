@echo off
echo ========================================
echo Starting Car Data Update Process
echo Started at %date% %time%
echo ========================================

cd /d "C:\Users\cosmi\Desktop\LICENTA\CarStat"

echo.
echo Step 1/5: Running Autovit Scraper
echo ----------------------------------------
cd /d "C:\Users\cosmi\Desktop\LICENTA\CarStat\backend\olx_scraper"
set PYTHONPATH=%PYTHONPATH%;C:\Users\cosmi\Desktop\LICENTA\CarStat\backend\olx_scraper
call venv_scrapy\Scripts\activate
timeout /t 5 /nobreak
scrapy crawl autovit_autoturisme
call venv_scrapy\Scripts\deactivate

echo.
echo Step 2/5: Running OLX Scraper
echo ----------------------------------------
cd /d "C:\Users\cosmi\Desktop\LICENTA\CarStat\backend\olx_scraper"
set PYTHONPATH=%PYTHONPATH%;C:\Users\cosmi\Desktop\LICENTA\CarStat\backend\olx_scraper
call venv_scrapy\Scripts\activate
timeout /t 5 /nobreak
scrapy crawl olx_autoturisme
call venv_scrapy\Scripts\deactivate

echo.
echo Step 3/5: Running Update Partial Data
echo ----------------------------------------
cd /d "C:\Users\cosmi\Desktop\LICENTA\CarStat\backend\olx_scraper"
set PYTHONPATH=%PYTHONPATH%;C:\Users\cosmi\Desktop\LICENTA\CarStat\backend\olx_scraper
call venv_scrapy\Scripts\activate

:run_update_spider
timeout /t 5 /nobreak
echo Starting update_partial_data spider at %date% %time%
scrapy crawl update_partial_data > scrapy_output.log

findstr /C:"Blocaj Cloudflare (403)" scrapy_output.log > nul
if %errorlevel% equ 0 (
    echo Cloudflare block detected at %date% %time%
    echo Waiting 5 minutes before restarting...
    timeout /t 300 /nobreak
    echo Restarting spider after Cloudflare cooldown...
    goto run_update_spider
) else (
    echo Spider completed without Cloudflare blocks at %date% %time%
)

call venv_scrapy\Scripts\deactivate

echo.
echo Step 4/5: Running Fill Missing Generations
echo ----------------------------------------
cd /d "C:\Users\cosmi\Desktop\LICENTA\CarStat"
python -m app.analytics.fill_missing_generations

echo.
echo Step 5/5: Running Update Deal Ratings
echo ----------------------------------------
cd /d "C:\Users\cosmi\Desktop\LICENTA\CarStat"
python -m app.analytics.update_deal_ratings

echo.
echo Reset tracking files
echo ----------------------------------------
cd /d "C:\Users\cosmi\Desktop\LICENTA\CarStat\backend\olx_scraper"
echo 0 > last_updated_id.txt
if exist cloudflare_block_id.txt (
    echo 0 > cloudflare_block_id.txt
    echo Tracking files have been reset to 0
) else (
    echo last_updated_id.txt has been reset to 0
)

echo.
echo ========================================
echo Car Data Update Process Completed
echo Finished at %date% %time%
echo ========================================

cd /d "C:\Users\cosmi\Desktop\LICENTA\CarStat"

for /f "tokens=1-3 delims=:" %%a in ("%time%") do (
    set hour=%%a
    set minute=%%b
)
set hour=%hour: =%

if %hour% GEQ 1 (
    if %hour% LEQ 8 (
        echo.
        echo Time is between 1 AM and 6 AM. Putting PC to hibernate in 60 seconds.
        echo Press Ctrl+C to cancel...
        timeout /t 60
        rundll32.exe powrprof.dll,SetSuspendState 1,1,0
    )
)