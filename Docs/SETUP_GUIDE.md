# Employee Management System - Complete Setup & Run Guide

This guide walks you through setting up and running the Employee Management System project locally.

## Prerequisites

Before you start, ensure you have the following installed:

- **Node.js** 22 LTS or higher ([Download](https://nodejs.org/))
- **npm** 10+ (comes with Node.js)
- **PostgreSQL** 16+ ([Download](https://www.postgresql.org/download/))
- **Redis** 7.2+ ([Download](https://redis.io/download))
- **Git** ([Download](https://git-scm.com/))

### Verify Installation

```bash
node --version      # Should be v22.x.x or higher
npm --version       # Should be 10.x.x or higher
psql --version      # Should be 16.x or higher
redis-cli --version # Should be 7.2.x or higher
```

---

## Step 1: Clone the Repository

```bash
git clone <repository-url>
cd employee-management-system
```

---

## Step 2: Set Up PostgreSQL Database

### Create Database and User

```bash
# Connect to PostgreSQL
psql -U postgres

# In the PostgreSQL prompt, run:
CREATE USER ems_user WITH PASSWORD 'ems_password_123';
CREATE DATABASE employee_management_system OWNER ems_user;
CREATE DATABASE employee_management_system_test OWNER ems_user;

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE employee_management_system TO ems_user;
GRANT ALL PRIVILEGES ON DATABASE employee_management_system_test TO ems_user;

# Exit PostgreSQL
\q
```

### Verify Connection

```bash
psql -U ems_user -d employee_management_system -h localhost
# If successful, you'll see the psql prompt
\q
```

---

## Step 3: Set Up Redis

### Start Redis Server

**On macOS (using Homebrew):**
```bash
brew services start redis
```

**On Linux:**
```bash
sudo systemctl start redis-server
```

**On Windows (using WSL or Docker):**
```bash
# Using Docker
docker run -d -p 6379:6379 redis:7.2
```

### Verify Redis Connection

```bash
redis-cli ping
# Should return: PONG
```

---

## Step 4: Configure Backend Environment

### Create .env File

```bash
cd backend
cp .env.example .env
```

### Edit .env with Your Configuration

```bash
# Use your preferred editor (nano, vim, VS Code, etc.)
nano .env
```

### Minimal Configuration for Local Development

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
DB_PASSWORD=ems_password_123
DB_POOL_MIN=2
DB_POOL_MAX=10

# Test Database Configuration
TEST_DB_HOST=localhost
TEST_DB_PORT=5432
TEST_DB_NAME=employee_management_system_test
TEST_DB_USER=ems_user
TEST_DB_PASSWORD=ems_password_123

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Session Configuration
SESSION_SECRET=your_dev_session_secret_change_in_production
SESSION_MAX_AGE=86400000

# JWT Configuration
JWT_SECRET=your_dev_jwt_secret_change_in_production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# File Upload Configuration
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document

# AWS S3 Configuration (Optional for local development)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_key_here
S3_BUCKET_NAME=ems-file-storage
S3_BUCKET_REGION=us-east-1
FILE_STORAGE_PROVIDER=s3
FILE_URL_EXPIRY=3600

# Email Configuration (Optional for local development)
EMAIL_PROVIDER=sendgrid
EMAIL_FROM_NAME=Employee Management System
EMAIL_FROM_ADDRESS=noreply@yourcompany.com
SENDGRID_API_KEY=your_sendgrid_api_key_here

# Google Maps API Configuration (Optional)
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
GOOGLE_MAPS_DISTANCE_MATRIX_API_KEY=your_google_maps_distance_matrix_api_key_here
GOOGLE_MAPS_ENABLED=false
GEO_TRACKING_ENABLED=false

# Logging
LOG_LEVEL=debug

# Firebase Configuration (Optional)
FIREBASE_ENABLED=false
```

---

## Step 5: Install Backend Dependencies

```bash
cd backend
npm install
```

### Expected Output

```
added XXX packages in X.XXs
```

---

## Step 6: Run Database Migrations

```bash
cd backend

# Run all pending migrations
npm run migrate:latest

# Check migration status
npm run migrate:status
```

### Expected Output

```
Batch 1 run: X migrations
```

---

## Step 7: Configure Frontend Environment

### Create .env File

```bash
cd frontend
cat > .env << EOF
VITE_API_BASE_URL=http://localhost:3000/api/v1
EOF
```

---

## Step 8: Install Frontend Dependencies

```bash
cd frontend
npm install
```

### Expected Output

```
added XXX packages in X.XXs
```

---

## Step 9: Start the Development Servers

You'll need **two terminal windows** for this step.

### Terminal 1: Start Backend Server

```bash
cd backend
npm run dev
```

### Expected Output

```
[nodemon] 3.0.1
[nodemon] to restart at any time, type `rs`
[nodemon] watching path(s): src/**/*
[nodemon] watching extensions: ts
[nodemon] starting `tsx watch src/index.ts`
Server running on port 3000
Database connected
Redis connected
```

### Terminal 2: Start Frontend Development Server

```bash
cd frontend
npm run dev
```

### Expected Output

```
  VITE v6.0.0  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

---

## Step 10: Access the Application

Open your browser and navigate to:

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000/api/v1

---

## Running Tests

### Backend Tests

```bash
cd backend

# Run all tests
npm test

# Run tests in watch mode
npm test:watch

# Run specific test file
npm test -- authService.test.ts
```

### Frontend Tests

```bash
cd frontend

# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch
```

### E2E Tests (Playwright)

```bash
cd frontend

# Run E2E tests
npm run test:e2e

# Run E2E tests in UI mode (interactive)
npm run test:e2e:ui

# Run E2E tests in debug mode
npm run test:e2e:debug

# Run E2E tests in headed mode (see browser)
npm run test:e2e:headed
```

---

## Building for Production

### Build Backend

```bash
cd backend

# Compile TypeScript to JavaScript
npm run build

# Start production server
npm start
```

### Build Frontend

```bash
cd frontend

# Build for production (with PWA support)
npm run build

# Preview production build locally
npm run preview
```

---

## Code Quality & Formatting

### Linting

```bash
# Backend
cd backend
npm run lint          # Check for linting errors
npm run lint:fix      # Fix linting errors automatically

# Frontend
cd frontend
npm run lint          # Check for linting errors
npm run lint:fix      # Fix linting errors automatically
```

### Code Formatting

```bash
# Backend
cd backend
npm run format

# Frontend
cd frontend
npm run format
```

---

## Database Management

### Create a New Migration

```bash
cd backend
npm run migrate:make create_users_table
```

### Rollback Last Migration Batch

```bash
cd backend
npm run migrate:rollback
```

### Run Seeds

```bash
cd backend
npm run seed:run
```

---

## Troubleshooting

### Issue: PostgreSQL Connection Failed

**Solution:**
```bash
# Verify PostgreSQL is running
psql -U postgres -c "SELECT version();"

# Check if database exists
psql -U ems_user -d employee_management_system -c "SELECT 1;"

# Verify credentials in .env file
```

### Issue: Redis Connection Failed

**Solution:**
```bash
# Verify Redis is running
redis-cli ping

# Check Redis port
redis-cli -p 6379 ping

# Restart Redis
redis-cli shutdown
redis-server
```

### Issue: Port Already in Use

**Solution:**
```bash
# Find process using port 3000 (backend)
lsof -i :3000
kill -9 <PID>

# Find process using port 5173 (frontend)
lsof -i :5173
kill -9 <PID>
```

### Issue: Module Not Found Errors

**Solution:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: Database Migration Errors

**Solution:**
```bash
# Check migration status
npm run migrate:status

# Rollback and retry
npm run migrate:rollback
npm run migrate:latest
```

---

## Project Structure Overview

```
employee-management-system/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── controllers/     # API controllers
│   │   ├── services/        # Business logic
│   │   ├── repositories/    # Data access layer
│   │   ├── middleware/      # Express middleware
│   │   ├── routes/          # API routes
│   │   ├── types/           # TypeScript types
│   │   ├── utils/           # Utility functions
│   │   ├── templates/       # Email templates
│   │   └── index.ts         # Entry point
│   ├── database/
│   │   ├── migrations/      # Database migrations
│   │   └── seeds/           # Seed data
│   ├── .env                 # Environment variables
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── hooks/           # Custom hooks
│   │   ├── store/           # Zustand stores
│   │   ├── types/           # TypeScript types
│   │   ├── utils/           # Utilities
│   │   ├── App.tsx          # Root component
│   │   └── main.tsx         # Entry point
│   ├── public/              # Static assets
│   ├── .env                 # Environment variables
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── docs/                    # Documentation
├── README.md
└── SETUP_GUIDE.md          # This file
```

---

## Key Commands Reference

### Backend Commands

```bash
cd backend

npm run dev              # Start development server with hot-reload
npm run build            # Compile TypeScript
npm start                # Run compiled JavaScript
npm test                 # Run tests
npm run lint             # Check code quality
npm run lint:fix         # Fix linting errors
npm run format           # Format code with Prettier
npm run migrate:latest   # Run database migrations
npm run migrate:rollback # Rollback migrations
npm run migrate:status   # Check migration status
npm run seed:run         # Run database seeds
```

### Frontend Commands

```bash
cd frontend

npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build
npm test                 # Run tests
npm run lint             # Check code quality
npm run lint:fix         # Fix linting errors
npm run format           # Format code with Prettier
npm run test:e2e         # Run E2E tests
npm run test:e2e:ui      # Run E2E tests in UI mode
npm run test:e2e:debug   # Run E2E tests in debug mode
```

---

## Next Steps

1. **Explore the Application:**
   - Log in with default credentials (if seeds are run)
   - Navigate through different modules
   - Test core features

2. **Review Documentation:**
   - Check `.kiro/specs/employee-management-system/` for detailed specifications
   - Review `.kiro/steering/` for architecture and standards

3. **Start Development:**
   - Create a feature branch: `git checkout -b feature/your-feature`
   - Follow the project structure and coding standards
   - Write tests for new features
   - Submit a pull request

4. **Implement Phase 10:**
   - Training & Certification Module
   - See `.kiro/specs/employee-management-system/tasks.md` for details

---

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review project documentation in `.kiro/specs/`
3. Check backend logs in terminal
4. Check browser console for frontend errors

---

**Last Updated:** 2026-03-21  
**Version:** 1.0
