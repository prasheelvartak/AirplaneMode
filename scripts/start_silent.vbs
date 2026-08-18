Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "C:\Users\Prasheel\.gemini\antigravity\scratch\flight-tracker-app"
WshShell.Run "pythonw.exe scripts\telegram_bridge.py", 0, False
Set WshShell = Nothing
