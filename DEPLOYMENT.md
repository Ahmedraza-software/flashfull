# 🐳 Docker Deployment Guide

## ⚠️ Prerequisites
**Docker Desktop must be running!**
If you see an error like `open //./pipe/dockerDesktopLinuxEngine: The system cannot find the file specified`, it means Docker Desktop is not started.

## 🚀 Quick Start

1. **Start Docker Desktop** application on your Windows machine.
2. Wait for the engine to start (green icon in Docker Dashboard).
3. Run the following command in this directory:

```powershell
docker-compose up --build
```

## 🏗️ Architecture

The setup consists of two isolated containers:

### 1. Backend Container (`erp_backend`)
- **Port**: 8002
- **Tech**: Python FastAPI
- **Database**: SQLite (persisted in `./backend/database`)
- **Uploads**: Persisted in `./backend/uploads`

### 2. Frontend Container (`erp_frontend`)
- **Port**: 3000
- **Tech**: Next.js (Standalone build)
- **Networking**: connects to backend via host networking or internal network

## 🛠️ Maintenance

**Stop all containers:**
```powershell
docker-compose down
```

**Rebuild containers (after code changes):**
```powershell
docker-compose up --build -d
```

**View Logs:**
```powershell
docker-compose logs -f
```

## 🔍 Troubleshooting

**Port Conflicts:**
If ports 3000 or 8002 are in use:
```powershell
Stop-Process -Name "node", "python", "uvicorn" -ErrorAction SilentlyContinue -Force
```

**Database Locks:**
If you see "database is locked", ensure only one instance (local or docker) is accessing `flash_erp.db` at a time.
