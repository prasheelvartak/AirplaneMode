@echo off
echo ===================================================
echo Setting up AirplaneMode Telegram Bridge Auto-Start
echo ===================================================

set SCRIPT_DIR=%~dp0
set VBS_TARGET=%SCRIPT_DIR%start_silent.vbs
set STARTUP_DIR=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup
set SHORTCUT_PATH=%STARTUP_DIR%\AirplaneModeBridge.lnk

powershell -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut('%SHORTCUT_PATH%'); $s.TargetPath = '%VBS_TARGET%'; $s.WorkingDirectory = '%SCRIPT_DIR%..'; $s.Description = 'AirplaneMode Telegram Mobile Bridge'; $s.Save()"

echo [OK] Auto-start shortcut installed to Windows Startup folder!
echo Telegram Bridge will now start automatically whenever your PC turns on.
echo.
pause
