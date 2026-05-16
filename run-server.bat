@echo off
cd /d "c:\LOKATOR SERVCE LAPTOP\loservice_backend"
call "c:\LOKATOR SERVCE LAPTOP\venv\Scripts\activate.bat"
python manage.py runserver
pause
