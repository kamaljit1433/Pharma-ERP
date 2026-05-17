# Employee Management System - Setup Documentation

Welcome! This document will guide you through all the setup documentation available for the Employee Management System.

---

## 📚 Documentation Index

### Quick Start (Start Here!)
- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Common commands and quick setup
  - Getting started in 5 minutes
  - Common commands reference
  - Troubleshooting quick fixes
  - Development workflow

### Detailed Setup Guides
- **[COMPLETE_SETUP_GUIDE.md](COMPLETE_SETUP_GUIDE.md)** - Comprehensive setup instructions
  - Prerequisites and installation
  - Step-by-step configuration
  - Database setup
  - Email configuration
  - Service startup
  - Verification steps
  - Troubleshooting guide

- **[BACKEND_SETUP_COMPLETE.md](BACKEND_SETUP_COMPLETE.md)** - Backend-specific setup
  - What was fixed
  - Environment configuration
  - Next steps
  - Verification procedures

### Status & Changes
- **[SETUP_STATUS.md](SETUP_STATUS.md)** - Current setup status
  - What was fixed
  - Current configuration
  - Quick start guide
  - Architecture overview
  - Verification checklist

- **[CHANGES_SUMMARY.md](CHANGES_SUMMARY.md)** - Detailed change log
  - Files modified
  - Files created
  - Configuration details
  - Breaking changes (none)
  - Migration path

### AWS & Infrastructure
- **[AWS_S3_SETUP_GUIDE.md](AWS_S3_SETUP_GUIDE.md)** - AWS S3 configuration
  - S3 bucket setup
  - IAM credentials
  - Production file storage

### Project Documentation
- **[.kiro/steering/tech.md](.kiro/steering/tech.md)** - Technology stack
  - Backend stack details
  - Frontend stack details
  - Common commands
  - Code style & standards

- **[.kiro/steering/structure.md](.kiro/steering/structure.md)** - Project structure
  - Directory organization
  - File naming conventions
  - Module patterns
  - Development workflow

- **[.kiro/steering/product.md](.kiro/steering/product.md)** - Product overview
  - System overview
  - Core modules
  - User roles
  - Key characteristics

---

## 🚀 Getting Started (5 Minutes)

### 1. Prerequisites
- PostgreSQL 16+ running
- Redis 7.2+ running
- Node.js 22 LTS installed

### 2. Create Database
```bash
psql -U postgres
CREATE USER ems_user WITH PASSWORD 'Root';
CREATE DATABASE employee_management_system OWNER ems_user;
GRANT ALL PRIVILEGES ON DATABASE employee_management_system TO ems_user;
\q
```

### 3. Run Migrations
```bash
cd backend
npm run migrate:latest
```

### 4. Start Backend (Terminal 1)
```bash
cd backend
npm run dev
```

### 5. Start Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```

### 6. Open Browser
```
http://localhost:5173
```

---

## ✅ What's Been Fixed

### 1. Backend Environment ✅
- Fixed `.env` file encoding
- Configured SMTP email provider
- Set database credentials
- Configured Redis session store
- Set up JWT authentication
- Configured file storage (local)

### 2. Frontend Environment ✅
- Fixed `.env` file encoding
- Configured API base URL

### 3. Authorization ✅
- Created `authorize` middleware
- Implements role-based access control
- Integrates with JWT authentication

### 4. Email System ✅
- Switched from SendGrid to SMTP
- Configured Gmail SMTP
- Email provider factory ready

---

## 📋 Current Configuration

### Backend (.env)
```
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=employee_management_system
DB_USER=ems_user
DB_PASSWORD=Root
REDIS_HOST=localhost
REDIS_PORT=6379
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=XXXXXXXXXXXXXXXXX
SMTP_PASSWORD=XXXXXXXXXXXXXXXXX
FILE_STORAGE_PROVIDER=local
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

---

## 🔍 Verification

### Health Check
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "services": {
    "database": "connected",
    "redis": "connected"
  }
}
```

### API Endpoint
```bash
curl http://localhost:3000/api/v1
```

Expected response:
```json
{
  "message": "Employee Management System API",
  "version": "v1",
  "timestamp": "2026-03-21T..."
}
```

---

## 📖 Documentation by Use Case

### "I want to get started quickly"
→ Read [QUICK_REFERENCE.md](QUICK_REFERENCE.md)

### "I need detailed setup instructions"
→ Read [COMPLETE_SETUP_GUIDE.md](COMPLETE_SETUP_GUIDE.md)

### "I want to know what was fixed"
→ Read [CHANGES_SUMMARY.md](CHANGES_SUMMARY.md)

### "I need to check current status"
→ Read [SETUP_STATUS.md](SETUP_STATUS.md)

### "I need to set up AWS S3"
→ Read [AWS_S3_SETUP_GUIDE.md](AWS_S3_SETUP_GUIDE.md)

### "I want to understand the tech stack"
→ Read [.kiro/steering/tech.md](.kiro/steering/tech.md)

### "I want to understand the project structure"
→ Read [.kiro/steering/structure.md](.kiro/steering/structure.md)

### "I want to understand the product"
→ Read [.kiro/steering/product.md](.kiro/steering/product.md)

---

## 🛠️ Common Commands

### Backend
```bash
cd backend
npm run dev              # Start development server
npm run build            # Build for production
npm test                 # Run tests
npm run lint             # Check code quality
npm run migrate:latest   # Run database migrations
```

### Frontend
```bash
cd frontend
npm run dev              # Start development server
npm run build            # Build for production
npm test                 # Run tests
npm run lint             # Check code quality
```

---

## 🐛 Troubleshooting

### Backend won't start
1. Check PostgreSQL is running: `psql -U postgres -c "SELECT 1"`
2. Check Redis is running: `redis-cli ping`
3. Check `.env` credentials
4. Run migrations: `npm run migrate:latest`

### Frontend won't connect
1. Verify backend is running on port 3000
2. Check `VITE_API_BASE_URL` in `frontend/.env`
3. Check CORS origin in `backend/.env`

### Email not sending
1. Verify Gmail credentials in `.env`
2. Check if 2FA is enabled on Gmail
3. Use App Password instead of regular password

### Port already in use
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

---

## 📊 Architecture

### Backend Stack
- Node.js 22 LTS
- Express.js 5.1
- PostgreSQL 16
- Redis 7.2
- JWT Authentication
- SMTP Email (Nodemailer)

### Frontend Stack
- React 19.2
- Vite 6.0
- Zustand 5.0
- Tailwind CSS 4.1
- shadcn/ui Components

### Database
- PostgreSQL 16 (primary)
- Redis 7.2 (sessions)
- Knex.js 3.1 (migrations)

---

## 🔐 User Roles

- **Super Admin** - Full system access
- **HR Manager** - Employee records, payroll, leaves
- **Department Manager** - Team attendance, approvals
- **Finance / Payroll** - Salary, bank details, travel allowance
- **Employee** - Self-service portal
- **IT Admin** - System settings, device management

---

## 📁 Project Structure

```
employee-management-system/
├── backend/              # Node.js/Express API
├── frontend/             # React/Vite PWA
├── Docs/                 # Documentation
├── .kiro/                # Kiro configuration
│   ├── specs/           # Feature specifications
│   └── steering/        # Project guidelines
├── QUICK_REFERENCE.md   # Quick commands
├── COMPLETE_SETUP_GUIDE.md
├── BACKEND_SETUP_COMPLETE.md
├── SETUP_STATUS.md
├── CHANGES_SUMMARY.md
└── README_SETUP.md      # This file
```

---

## ✨ Key Features

- ✅ JWT Authentication
- ✅ Role-Based Access Control
- ✅ SMTP Email System
- ✅ Local File Storage (dev) / S3 (prod)
- ✅ Redis Session Store
- ✅ Database Migrations
- ✅ Email Templates
- ✅ Error Handling
- ✅ CORS Configuration
- ✅ TypeScript Support

---

## 🎯 Next Steps

1. **Read Quick Reference**
   - [QUICK_REFERENCE.md](QUICK_REFERENCE.md)

2. **Follow Setup Guide**
   - [COMPLETE_SETUP_GUIDE.md](COMPLETE_SETUP_GUIDE.md)

3. **Start Development**
   - Backend: `npm run dev`
   - Frontend: `npm run dev`

4. **Verify Setup**
   - Check health endpoint
   - Test API endpoint
   - Access frontend

5. **Create Test User**
   - Use API to create super admin
   - Log in to frontend
   - Test functionality

---

## 📞 Support

- **Setup Issues**: See [COMPLETE_SETUP_GUIDE.md](COMPLETE_SETUP_GUIDE.md)
- **Quick Help**: See [QUICK_REFERENCE.md](QUICK_REFERENCE.md)
- **What Changed**: See [CHANGES_SUMMARY.md](CHANGES_SUMMARY.md)
- **Current Status**: See [SETUP_STATUS.md](SETUP_STATUS.md)

---

## 🚀 Ready to Go!

All systems are configured and ready. Start with [QUICK_REFERENCE.md](QUICK_REFERENCE.md) for the fastest path to a running system.

**Happy coding!** 💻

---

## 📝 Document Versions

- **Last Updated**: March 21, 2026
- **Backend Version**: 1.0.0
- **Frontend Version**: 1.0.0
- **Node.js**: 22 LTS
- **PostgreSQL**: 16
- **Redis**: 7.2

---

## 📄 License

See LICENSE file in repository root.
