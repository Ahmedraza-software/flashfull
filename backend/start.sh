#!/bin/bash
# Start backend
cd /app && uvicorn app.main:app --host 0.0.0.0 --port 8000
