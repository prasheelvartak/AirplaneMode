@echo off
echo Stopping any running Telegram Bridge instances...
taskkill /F /IM pythonw.exe /FI "WINDOWTITLE eq AirplaneMode*" 2>nul
powershell -Command "Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -like '*telegram_bridge.py*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }"
echo [OK] Telegram Bridge stopped.
pause
