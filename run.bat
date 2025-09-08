@echo off
echo ========================================
echo Resume Screener Bot - Startup Script
echo ========================================

echo Starting Resume Screener Bot...
echo.

echo [1/4] Checking Python installation...
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://python.org
    pause
    exit /b 1
)
echo ✓ Python found

echo.
echo [2/4] Setting up backend...
cd backend

echo Installing Python dependencies...
pip install -r requirements.txt
if errorlevel 1 (
    echo ERROR: Failed to install Python dependencies
    pause
    exit /b 1
)
echo ✓ Backend dependencies installed

echo.
echo [3/4] Setting up frontend...
cd ../frontend

echo Installing Node.js dependencies...
npm install
if errorlevel 1 (
    echo ERROR: Failed to install Node.js dependencies
    pause
    exit /b 1
)
echo ✓ Frontend dependencies installed

echo.
echo [4/4] Starting servers...
echo.

echo Starting backend server in new window...
start "Resume Screener Backend" cmd /k "cd backend && python app.py"

timeout /t 3 /nobreak >nul

echo Starting frontend server in new window...
start "Resume Screener Frontend" cmd /k "cd frontend && npm start"

echo.
echo ========================================
echo Servers are starting up...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo ========================================
echo.
echo Press any key to close this window...
pause >nul
