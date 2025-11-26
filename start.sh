#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔧 Starting Data Profiling Utility...${NC}\n"

# Kill any existing processes on ports
echo "Cleaning up existing processes..."
lsof -ti:8000 | xargs kill -9 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true

# Wait for ports to be released
sleep 1

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Start backend in background
echo -e "${GREEN}Starting backend server on port 8000...${NC}"
cd "$SCRIPT_DIR/data-profiling-backend"
PYTHONPATH="$SCRIPT_DIR/data-profiling-backend" ./venv/bin/python3 app/main.py &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 2

# Start frontend in background
echo -e "${GREEN}Starting frontend server on port 5173...${NC}"
cd "$SCRIPT_DIR/data-profiling-ui"
npm run dev &
FRONTEND_PID=$!

echo -e "\n${GREEN}✅ Both servers started!${NC}"
echo "Backend PID: $BACKEND_PID (http://localhost:8000)"
echo "Frontend PID: $FRONTEND_PID (http://localhost:5173)"
echo -e "\n${YELLOW}Press Ctrl+C to stop both servers${NC}\n"

# Wait for Ctrl+C and cleanup
trap "echo -e '\n${YELLOW}Stopping servers...${NC}'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT

# Keep script running
wait
