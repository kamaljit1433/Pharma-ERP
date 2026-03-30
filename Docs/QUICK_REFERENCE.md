# Quick Reference - Common Commands

## 🚀 Getting Started (First Time)

```bash
# 1. Create database
psql -U postgres
CREATE USER ems_user WITH PASSWORD 'Root';
CREATE DATABASE employee_management_system OWNER ems_user;
GRANT ALL PRIVILEGES ON DATABASE employee_management_system TO ems_user;
\q

# 2. Run migrations
cd backend
npm run migrate:latest

# 3. Start backend (Terminal 1)
npm run dev

# 4. Start frontend (Terminal 2)
cd frontend
npm run dev

# 5. Open browser
http://localhost:5173
```

---

## 🔧 Backend Commands

```bash
cd backend

# Development
npm run dev              # Start with hot-reload
npm run build            # Compile TypeScript
npm start                # Run compiled code

# Testing
npm test                 # Run tests once
npm run test:watch      # Run tests in watch mode

# Code Quality
npm run lint             # Check for errors
npm run lint:fix         # Fix errors automatically
npm run format           # Format code with Prettier

# Database
npm run migrate:latest   # Run all pending migrations
npm run migrate:rollback # Undo last migration
npm run migrate:status   # Check migration status
npm run migrate:make <name> # Create new migration

# Seeds
npm run seed:run         # Run all seeds
npm run seed:make <name> # Create new seed
```

---

## 🎨 Frontend Commands

```bash
cd frontend

# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build

# Testing
npm test                 # Run tests once

# Code Quality
npm run lint             # Check for errors
npm run lint:fix         # Fix errors automatically
npm run format           # Format code with Prettier
```

---

## 🔍 Verification Commands

```bash
# Check backend health
curl http://localhost:3000/health

# Check API endpoint
curl http://localhost:3000/api/v1

# Check database connection
psql -U ems_user -d employee_management_system -c "SELECT 1"

# Check Redis connection
redis-cli ping

# Check if ports are in use
# Windows
netstat -ano | findstr :3000
netstat -ano | findstr :5173
netstat -ano | findstr :5432
netstat -ano | findstr :6379
```

---

## 📝 Environment Files

### Backend (.env)
```env
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
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FILE_STORAGE_PROVIDER=local
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Windows - Find and kill process
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use different port
npm run dev -- --port 3001
```

### Database Connection Failed
```bash
# Check if PostgreSQL is running
psql -U postgres -c "SELECT 1"

# Create database if missing
psql -U postgres -c "CREATE DATABASE employee_management_system OWNER ems_user;"

# Run migrations
npm run migrate:latest
```

### Redis Connection Failed
```bash
# Check if Redis is running
redis-cli ping

# Start Redis (if using Docker)
docker run --name redis -p 6379:6379 -d redis:7.2
```

### Email Not Sending
```bash
# Check SMTP credentials in .env
# Verify Gmail 2FA is enabled
# Use App Password instead of regular password
# Check backend logs for SMTP errors
```

---

## 📊 Project Structure

```
employee-management-system/
├── backend/              # Node.js/Express API
│   ├── src/
│   │   ├── config/      # Configuration
│   │   ├── controllers/ # Route handlers
│   │   ├── services/    # Business logic
│   │   ├── middleware/  # Express middleware
│   │   ├── routes/      # API routes
│   │   ├── types/       # TypeScript types
│   │   ├── utils/       # Utilities
│   │   └── database/    # Migrations & seeds
│   ├── .env             # Environment variables
│   └── package.json
│
├── frontend/            # React/Vite PWA
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API services
│   │   ├── store/       # Zustand stores
│   │   ├── types/       # TypeScript types
│   │   └── utils/       # Utilities
│   ├── .env             # Environment variables
│   └── package.json
│
└── Docs/                # Documentation
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

## 📚 API Endpoints

### Health Check
```
GET /health
```

### API Root
```
GET /api/v1
```

### Authentication
```
POST /api/v1/auth/login
POST /api/v1/auth/register
POST /api/v1/auth/logout
POST /api/v1/auth/refresh
```

### Employees
```
GET /api/v1/employees
POST /api/v1/employees
GET /api/v1/employees/:id
PUT /api/v1/employees/:id
DELETE /api/v1/employees/:id
```

### Leave Management
```
GET /api/v1/leaves
POST /api/v1/leaves
GET /api/v1/leaves/:id
PUT /api/v1/leaves/:id
```

### Payroll
```
GET /api/v1/payroll
POST /api/v1/payroll/process
GET /api/v1/payroll/:id
```

### Benefits
```
GET /api/v1/benefits/insurance-plans
POST /api/v1/benefits/insurance/enroll
GET /api/v1/benefits/pf/:employeeId
```

---

## 🎯 Development Workflow

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Backend: `backend/src/`
   - Frontend: `frontend/src/`

3. **Run Tests**
   ```bash
   npm test
   ```

4. **Format Code**
   ```bash
   npm run format
   npm run lint:fix
   ```

5. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: description of changes"
   ```

6. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

---

## 📞 Support

- **Setup Issues**: See `COMPLETE_SETUP_GUIDE.md`
- **Backend Details**: See `BACKEND_SETUP_COMPLETE.md`
- **AWS S3 Setup**: See `AWS_S3_SETUP_GUIDE.md`
- **Tech Stack**: See `.kiro/steering/tech.md`

---

## ✅ Checklist Before Starting

- [ ] PostgreSQL running on localhost:5432
- [ ] Redis running on localhost:6379
- [ ] Database created with correct credentials
- [ ] `.env` files configured in backend and frontend
- [ ] Dependencies installed (`npm install`)
- [ ] Migrations run (`npm run migrate:latest`)
- [ ] No port conflicts (3000, 5173, 5432, 6379)

---

**Ready to code!** 🚀
