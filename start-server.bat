@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0loservice_backend"

REM Clear Python environment variables to avoid conflicts
set PYTHONPATH=
set PYTHONHOME=

REM Run Django server using full venv Python path
"%~dp0venv\Scripts\python.exe" manage.py runserver

pause
