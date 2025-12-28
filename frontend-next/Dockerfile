# Use Node.js base image
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm config set fetch-retry-maxtimeout 600000 && \
    npm config set fetch-retries 5 && \
    npm install

# Copy source code
COPY . .

# Build for development (optimized for dev server in Docker)
# For production, we would use 'npm run build'
# But user wants to "run from frontend", so we'll just use dev mode for now
# or build it properly. Let's do a dev-ready build or just run dev.

EXPOSE 3000

# Next.js dev server with hot reload
CMD ["npm", "run", "dev"]
