@echo off
echo Starting Anomalyse System...

echo Starting Backend Server...
start "Anomalyse Backend" cmd /k "cd backend && uvicorn main:app --reload --host 0.0.0.0 --port 8000"

echo Starting Frontend Dashboard (including AI Assistant)...
start "Anomalyse Dashboard" cmd /k "cd frontend && npm run dev"

echo All services started!
echo Dashboard & AI Assistant: http://localhost:5173
echo Backend: http://localhost:8000
pause
