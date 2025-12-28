2 Containers:
Container 1: PostgreSQL + pgAdmin
PostgreSQL: Port 5432
pgAdmin: Port 5050
pgAdmin Login: admin@flash.com / admin@123
Container 2: Frontend + Backend
Frontend: Port 3000 (Next.js)
Backend: Port 8000 (FastAPI)
Access URLs:
Frontend: http://localhost:3000
Backend API: http://localhost:8000
PostgreSQL: localhost:5432
pgAdmin: http://localhost:5050
To Run:

bash
docker-compose up --build
This setup gives you:

Database management through pgAdmin web interface
All ERP services running together
Persistent data storage for both PostgreSQL and pgAdmin
Ready to run once Docker Desktop is working properly!

