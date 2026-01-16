@echo off
echo ========================================
echo Starting Backend Server (Django)
echo ========================================
cd /d "c:\LOKATOR SERVCE LAPTOP\loservice_backend"
call venv\Scripts\activate.bat
echo.
echo Backend server starting at http://127.0.0.1:8000
echo Press Ctrl+C to stop the server
echo.
python manage.py runserver
pause
