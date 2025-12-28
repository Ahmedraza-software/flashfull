# Multi-stage build for combined frontend + backend
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend package files
COPY frontend-next/package*.json ./
RUN npm ci --only=production

# Copy frontend source code
COPY frontend-next/ ./

# Build the frontend
RUN npm run build

# Backend stage
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    curl \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements and install Python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ ./

# Copy built frontend from builder stage
COPY --from=frontend-builder /app/frontend/.next/standalone ./frontend
COPY --from=frontend-builder /app/frontend/.next/static ./frontend/.next/static
COPY --from=frontend-builder /app/frontend/public ./frontend/public
COPY --from=frontend-builder /app/frontend/node_modules ./frontend/node_modules

# Create startup script
RUN echo '#!/bin/bash\n\
# Start backend in background\n\
cd /app && uvicorn app.main:app --host 0.0.0.0 --port 8000 &\n\
# Start frontend\n\
cd /app/frontend && npm start &\n\
# Wait for any process to exit\n\
wait' > /app/start.sh && chmod +x /app/start.sh

# Create non-root user
RUN useradd --create-home --shell /bin/bash app \
    && chown -R app:app /app
USER app

# Expose ports
EXPOSE 3000 8000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health && curl -f http://localhost:3000 || exit 1

# Start both services
CMD ["/app/start.sh"]
