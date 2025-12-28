# Final Image
FROM python:3.11-slim
WORKDIR /app

# Install system dependencies including MySQL client
RUN apt-get update && apt-get install -y \
    gcc \
    default-mysql-client \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir --default-timeout=100 -r requirements.txt

# Copy backend code
COPY backend/ ./

# Create startup script
RUN echo '#!/bin/bash\n\
    # Start backend\n\
    cd /app && uvicorn app.main:app --host 0.0.0.0 --port 8000\n\
    ' > /app/start.sh && chmod +x /app/start.sh

# Expose ports
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Start service
CMD ["bash", "/app/start.sh"]
