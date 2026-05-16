@echo off
echo ========================================
echo Starting Backend Server (Django)
echo ========================================
call "c:\LOKATOR SERVCE LAPTOP\venv\Scripts\activate.bat"
cd /d "c:\LOKATOR SERVCE LAPTOP\loservice_backend"
echo.
echo Backend server starting at http://127.0.0.1:8000
echo Press Ctrl+C to stop the server
echo.
python manage.py runserver
pause
