# 🚀 START HERE - Employee Management System Setup

## Welcome! 👋

Your Employee Management System is ready to run. Follow this guide to get started in **5 minutes**.

---

## ⚡ Quick Start (5 Minutes)

### Step 1: Ensure Services Are Running
```bash
# PostgreSQL should be running on port 5432
# Redis should be running on port 6379
# Verify:
psql -U postgres -c "SELECT 1"    # Should return: 1
redis-cli ping                     # Should return: PONG
```

### Step 2: Create Database
```bash
psql -U postgres
CREATE USER ems_user WITH PASSWORD 'Root';
CREATE DATABASE employee_management_system OWNER ems_user;
GRANT ALL PRIVILEGES ON DATABASE employee_management_system TO ems_user;
\q
```

### Step 3: Run Migrations
```bash
cd backend
npm run migrate:latest
```

### Step 4: Start Backend (Terminal 1)
```bash
cd backend
npm run dev
```

**Expected Output:**
```
╔════════════════════════════════════════════════════════════╗
║  Employee Management System - Backend API                  ║
║  Environment: development                                  ║
║  Port: 3000                                                ║
║  Database: Connected                                       ║
║  Redis: Connected                                          ║
╚════════════════════════════════════════════════════════════╝
```

### Step 5: Start Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```

**Expected Output:**
```
  VITE v6.0.0  ready in 234 ms
  ➜  Local:   http://localhost:5173/
```

### Step 6: Open Browser
```
http://localhost:5173
```

---

## ✅ Verify Everything Works

### Test Backend Health
```bash
curl http://localhost:3000/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "services": {
    "database": "connected",
    "redis": "connected"
  }
}
```

### Test API
```bash
curl http://localhost:3000/api/v1
```

**Expected Response:**
```json
{
  "message": "Employee Management System API",
  "version": "v1",
  "timestamp": "2026-03-21T..."
}
```

---

## 📚 Documentation

### For Quick Reference
👉 **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Common commands and quick fixes

### For Detailed Setup
👉 **[COMPLETE_SETUP_GUIDE.md](COMPLETE_SETUP_GUIDE.md)** - Step-by-step instructions

### For Current Status
👉 **[SETUP_STATUS.md](SETUP_STATUS.md)** - What's been configured

### For All Documentation
👉 **[README_SETUP.md](README_SETUP.md)** - Documentation index

---

## 🔧 Common Commands

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

### "Cannot connect to database"
```bash
# Check PostgreSQL is running
psql -U postgres -c "SELECT 1"

# Create database if missing
psql -U postgres -c "CREATE DATABASE employee_management_system OWNER ems_user;"

# Run migrations
cd backend && npm run migrate:latest
```

### "Redis connection failed"
```bash
# Check Redis is running
redis-cli ping

# Should return: PONG
```

### "Port 3000 already in use"
```bash
# Windows - Find and kill process
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use different port
npm run dev -- --port 3001
```

### "Frontend can't connect to backend"
1. Verify backend is running on port 3000
2. Check `VITE_API_BASE_URL` in `frontend/.env`
3. Check CORS origin in `backend/.env`

---

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│              http://localhost:5173                       │
│  ┌──────────────────────────────────────────────────┐   │
│  │  React 19.2 + Vite 6.0 + Zustand 5.0            │   │
│  │  Tailwind CSS + shadcn/ui Components            │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          ↓ API Calls
┌─────────────────────────────────────────────────────────┐
│                    Backend (Express)                     │
│              http://localhost:3000                       │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Node.js 22 + Express 5.1 + TypeScript 5.9      │   │
│  │  JWT Authentication + Role-Based Authorization  │   │
│  │  SMTP Email (Nodemailer) + File Storage         │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
         ↓ Queries              ↓ Sessions
    ┌─────────────┐        ┌──────────────┐
    │ PostgreSQL  │        │    Redis     │
    │ Port 5432   │        │  Port 6379   │
    └─────────────┘        └──────────────┘
```

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
│   ├── src/
│   │   ├── config/      # Configuration
│   │   ├── controllers/ # Route handlers
│   │   ├── services/    # Business logic
│   │   ├── middleware/  # Express middleware
│   │   ├── routes/      # API routes
│   │   └── database/    # Migrations & seeds
│   └── .env             # Environment variables
│
├── frontend/            # React/Vite PWA
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API services
│   │   ├── store/       # Zustand stores
│   │   └── utils/       # Utilities
│   └── .env             # Environment variables
│
└── Docs/                # Documentation
```

---

## ✨ What's Been Fixed

✅ Backend environment configuration (`.env`)
✅ Frontend environment configuration (`.env`)
✅ Email system (switched to SMTP)
✅ Authorization middleware (role-based access)
✅ Database configuration
✅ Redis session store
✅ JWT authentication
✅ File storage (local for dev)

---

## 🎯 Next Steps

1. **Follow Quick Start above** (5 minutes)
2. **Verify everything works** (health check)
3. **Create test user** (use API)
4. **Log in to frontend** (http://localhost:5173)
5. **Start developing!** 🚀

---

## 📞 Need Help?

### Quick Questions?
→ Check [QUICK_REFERENCE.md](QUICK_REFERENCE.md)

### Setup Issues?
→ Check [COMPLETE_SETUP_GUIDE.md](COMPLETE_SETUP_GUIDE.md)

### Want to Know What Changed?
→ Check [CHANGES_SUMMARY.md](CHANGES_SUMMARY.md)

### Need Full Documentation?
→ Check [README_SETUP.md](README_SETUP.md)

---

## 🚀 Ready?

Everything is configured and ready to go!

**Start with Step 1 above and you'll be running in 5 minutes.** ⏱️

---

## 💡 Pro Tips

- **Hot Reload**: Both backend and frontend auto-reload on file changes
- **Database Migrations**: Run `npm run migrate:latest` after pulling new code
- **Email Testing**: Check backend logs for SMTP connection details
- **API Testing**: Use `curl` or Postman to test endpoints
- **Code Quality**: Run `npm run lint:fix` before committing

---

## 📝 Environment Configuration

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
SMTP_USER=smartops.mailer@gmail.com
SMTP_PASSWORD=rzbrlyqvxahwpntv
FILE_STORAGE_PROVIDER=local
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

---

## ✅ Checklist Before Starting

- [ ] PostgreSQL running on localhost:5432
- [ ] Redis running on localhost:6379
- [ ] Node.js 22 LTS installed
- [ ] Database created with correct credentials
- [ ] Dependencies installed (`npm install`)
- [ ] No port conflicts (3000, 5173, 5432, 6379)

---

**Let's build something amazing!** 🎉

**Questions?** Check the documentation links above.

**Ready to start?** Follow the Quick Start section! 🚀
