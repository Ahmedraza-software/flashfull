# Multi-stage build for full ERP (FastAPI + Next.js)
FROM node:22-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend-next/package*.json ./
RUN npm ci
COPY frontend-next/ ./
RUN npm run build

FROM python:3.11-slim AS backend
WORKDIR /app
# Install system deps
RUN apt-get update && apt-get install -y gcc postgresql-client supervisor curl && rm -rf /var/lib/apt/lists/* 
# Copy backend code first
COPY backend/ ./
# Install Python deps
RUN pip install --no-cache-dir -r requirements.txt
# Copy built frontend
COPY --from=frontend-builder /app/frontend/public ./public
COPY --from=frontend-builder /app/frontend/.next/standalone ./
COPY --from=frontend-builder /app/frontend/.next/static ./.next/static
# Create supervisor config
RUN echo "[supervisord]\nnodaemon=true\nlogfile=/var/log/supervisor/supervisord.log\n\n[program:backend]\ncommand=uvicorn app.main:app --host 0.0.0.0 --port 8000\ndirectory=/app\nautorestart=true\nstdout_logfile=/var/log/supervisor/backend.log\nstderr_logfile=/var/log/supervisor/backend_err.log\n\n[program:frontend]\ncommand=node server.js\ndirectory=/app\nautorestart=true\nstdout_logfile=/var/log/supervisor/frontend.log\nstderr_logfile=/var/log/supervisor/frontend_err.log\n" > /etc/supervisor/conf.d/erp.conf
# Create log dir
RUN mkdir -p /var/log/supervisor
# Expose both ports (Render will route to 3000)
EXPOSE 8000 3000
# Start supervisor
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/erp.conf"]
