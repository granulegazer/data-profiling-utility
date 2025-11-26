#!/bin/bash

# Kill any existing process on port 8000
lsof -ti:8000 | xargs kill -9 2>/dev/null || true

# Wait for port to be released
sleep 1

# Start the backend server
cd "$(dirname "$0")"
PYTHONPATH="$PWD" ./venv/bin/python3 app/main.py
