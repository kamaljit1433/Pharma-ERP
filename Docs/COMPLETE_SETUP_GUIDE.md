# Employee Management System - Complete Setup Guide

## Overview

This guide will help you set up and run the Employee Management System (EMS) locally. The system consists of:
- **Backend**: Node.js/Express API server (port 3000)
- **Frontend**: React/Vite PWA (port 5173)
- **Database**: PostgreSQL (port 5432)
- **Cache**: Redis (port 6379)

## Prerequisites

### Required Software
- **Node.js**: v22 LTS or higher
- **npm**: v10 or higher (comes with Node.js)
- **PostgreSQL**: v16 or higher
- **Redis**: v7.2 or higher
- **Git**: For version control

### Installation

#### Windows

**Option 1: Using Installers (Recommended)**
1. Download and install Node.js from https://nodejs.org/ (LTS version)
2. Download and install PostgreSQL from https://www.postgresql.org/download/windows/
3. Download and install Redis from https://github.com/microsoftarchive/redis/releases

**Option 2: Using Chocolatey**
```powershell
choco install nodejs postgresql redis
```

**Option 3: Using Docker**
```powershell
# Install Docker Desktop from https://www.docker.com/products/docker-desktop

# Start PostgreSQL
docker run --name postgres -e POSTGRES_PASSWORD=Root -p 5432:5432 -d postgres:16

# Start Redis
docker run --name redis -p 6379:6379 -d redis:7.2
```

## Step 1: Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd employee-management-system

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Return to root
cd ..
```

## Step 2: Configure Environment Variables

### Backend Configuration

Create/verify `backend/.env` with the following settings:

```env
# Server Configuration
NODE_ENV=development
PORT=3000
API_VERSION=v1

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=employee_management_system
DB_USER=ems_user
DB_PASSWORD=Root
DB_POOL_MIN=2
DB_POOL_MAX=10

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Session Configuration
SESSION_SECRET=dev_session_secret_change_in_production
SESSION_MAX_AGE=86400000

# JWT Configuration
JWT_SECRET=dev_jwt_secret_change_in_production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# File Storage Configuration (use local for development)
FILE_STORAGE_PROVIDER=local

# Email Configuration (SMTP)
EMAIL_PROVIDER=smtp
EMAIL_FROM_NAME=Employee Management System
EMAIL_FROM_ADDRESS=noreply@yourcompany.com

# SMTP Configuration (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Google Maps API Configuration
GOOGLE_MAPS_API_KEY=your-api-key
GOOGLE_MAPS_DISTANCE_MATRIX_API_KEY=your-api-key
GOOGLE_MAPS_ENABLED=true
GEO_TRACKING_ENABLED=true
TRAVEL_ALLOWANCE_RATE=5
TRAVEL_ALLOWANCE_UNIT=per_km

# Logging
LOG_LEVEL=debug

# Firebase Configuration
FIREBASE_ENABLED=false
```

### Frontend Configuration

Create/verify `frontend/.env` with:

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

## Step 3: Set Up Database

### Create Database User and Database

**Using PostgreSQL Command Line:**

```bash
# Connect to PostgreSQL
psql -U postgres

# Create user
CREATE USER ems_user WITH PASSWORD 'Root';

# Create database
CREATE DATABASE employee_management_system OWNER ems_user;

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE employee_management_system TO ems_user;

# Exit
\q
```

**Using pgAdmin (GUI):**
1. Open pgAdmin
2. Right-click "Servers" → "Register" → "Server"
3. Name: `EMS`
4. Connection tab:
   - Host: `localhost`
   - Port: `5432`
   - Username: `postgres`
   - Password: (your PostgreSQL password)
5. Right-click "Databases" → "Create" → "Database"
6. Name: `employee_management_system`
7. Owner: `ems_user`

### Run Database Migrations

```bash
cd backend

# Run all pending migrations
npm run migrate:latest

# Check migration status
npm run migrate:status

# (Optional) Rollback last migration
npm run migrate:rollback
```

## Step 4: Configure Email (SMTP)

### Using Gmail

1. **Enable 2-Factor Authentication**
   - Go to https://myaccount.google.com/
   - Click "Security" in the left menu
   - Enable "2-Step Verification"

2. **Generate App Password**
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Windows Computer"
   - Google will generate a 16-character password
   - Copy this password to `SMTP_PASSWORD` in `.env`

3. **Update .env**
   ```env
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=xxxx xxxx xxxx xxxx
   ```

### Using Other Email Providers

**Outlook/Office 365:**
```env
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASSWORD=your-password
```

**SendGrid (Alternative):**
```env
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=your-sendgrid-api-key
```

## Step 5: Start Services

### Terminal 1: Start Backend

```bash
cd backend
npm run dev
```

Expected output:
```
╔════════════════════════════════════════════════════════════╗
║  Employee Management System - Backend API                  ║
║  Environment: development                                  ║
║  Port: 3000                                                ║
║  API Version: v1                                           ║
║  Database: Connected                                       ║
║  Redis: Connected                                          ║
╚════════════════════════════════════════════════════════════╝
```

### Terminal 2: Start Frontend

```bash
cd frontend
npm run dev
```

Expected output:
```
  VITE v6.0.0  ready in 234 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

## Step 6: Verify Setup

### Test Backend Health

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-03-21T10:30:00.000Z",
  "services": {
    "database": "connected",
    "redis": "connected"
  }
}
```

### Test API Endpoint

```bash
curl http://localhost:3000/api/v1
```

Expected response:
```json
{
  "message": "Employee Management System API",
  "version": "v1",
  "timestamp": "2026-03-21T10:30:00.000Z"
}
```

### Access Frontend

Open browser and navigate to: http://localhost:5173

## Common Commands

### Backend

```bash
cd backend

# Development server with hot-reload
npm run dev

# Build for production
npm run build

# Run compiled code
npm start

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Lint code
npm run lint

# Fix linting errors
npm run lint:fix

# Format code
npm run format

# Database migrations
npm run migrate:latest      # Run all pending migrations
npm run migrate:rollback    # Rollback last migration batch
npm run migrate:status      # Check migration status
npm run migrate:make <name> # Create new migration

# Database seeds
npm run seed:run            # Run all seed files
npm run seed:make <name>    # Create new seed file
```

### Frontend

```bash
cd frontend

# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test

# Lint code
npm run lint

# Fix linting errors
npm run lint:fix

# Format code
npm run format
```

## Troubleshooting

### Backend Won't Start

**Error: "Cannot connect to database"**
- Verify PostgreSQL is running: `psql -U postgres -c "SELECT 1"`
- Check database credentials in `.env`
- Ensure database exists: `psql -U ems_user -d employee_management_system -c "SELECT 1"`

**Error: "Redis connection failed"**
- Verify Redis is running: `redis-cli ping` (should return "PONG")
- Check Redis host/port in `.env`
- Note: Backend will still work without Redis, but sessions won't persist

**Error: "SMTP configuration error"**
- Verify Gmail credentials in `.env`
- Check if 2FA is enabled on Gmail account
- Verify App Password is correct (16 characters with spaces)
- Test SMTP connection: `npm run test:email` (if available)

### Frontend Won't Start

**Error: "Port 5173 already in use"**
```bash
# Kill process using port 5173
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Or use different port
npm run dev -- --port 5174
```

**Error: "Cannot reach API"**
- Verify backend is running on port 3000
- Check `VITE_API_BASE_URL` in `frontend/.env`
- Check CORS configuration in backend `.env`

### Database Issues

**Error: "Database does not exist"**
```bash
# Create database
psql -U postgres -c "CREATE DATABASE employee_management_system OWNER ems_user;"
```

**Error: "User does not have permission"**
```bash
# Grant privileges
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE employee_management_system TO ems_user;"
```

**Migrations not running**
```bash
# Check migration status
npm run migrate:status

# Run migrations with verbose output
npm run migrate:latest -- --verbose
```

## Project Structure

```
employee-management-system/
├── backend/                 # Node.js/Express API
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Route handlers
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # API routes
│   │   ├── types/          # TypeScript types
│   │   ├── utils/          # Utility functions
│   │   ├── database/       # Migrations and seeds
│   │   └── templates/      # Email templates
│   ├── .env                # Environment variables
│   └── package.json        # Dependencies
│
├── frontend/               # React/Vite PWA
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── store/          # Zustand stores
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # Utility functions
│   ├── .env                # Environment variables
│   └── package.json        # Dependencies
│
└── Docs/                   # Documentation
```

## Next Steps

1. **Create Initial User**
   - Access the API to create a super admin user
   - Use this account to log in to the frontend

2. **Configure Additional Services**
   - Set up Google Maps API for geo-tracking
   - Configure Firebase for notifications (optional)
   - Set up AWS S3 for file storage (production)

3. **Run Tests**
   ```bash
   cd backend
   npm test
   
   cd ../frontend
   npm test
   ```

4. **Build for Production**
   ```bash
   # Backend
   cd backend
   npm run build
   npm start
   
   # Frontend
   cd frontend
   npm run build
   npm run preview
   ```

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review error logs in the terminal
3. Check `.env` configuration
4. Verify all services are running (PostgreSQL, Redis)

## Security Notes

⚠️ **Development Only**
- Change all default secrets in `.env` for production
- Use strong passwords for database and JWT
- Enable HTTPS in production
- Use environment-specific `.env` files
- Never commit `.env` to version control

## Ready to Go! 🚀

Your Employee Management System is now set up and ready to use. Happy coding!
