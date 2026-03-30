# Backend Infrastructure Setup Guide

This guide walks you through setting up the backend infrastructure for the Employee Management System.

## Prerequisites Installation

### 1. PostgreSQL Installation

#### Windows
1. Download PostgreSQL from https://www.postgresql.org/download/windows/
2. Run the installer and follow the setup wizard
3. Remember the password you set for the `postgres` user
4. Default port is 5432

#### macOS
```bash
brew install postgresql@14
brew services start postgresql@14
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2. Redis Installation

#### Windows
1. Download Redis from https://github.com/microsoftarchive/redis/releases
2. Extract and run `redis-server.exe`
3. Default port is 6379

Or use WSL2:
```bash
wsl --install
# Then follow Linux instructions
```

#### macOS
```bash
brew install redis
brew services start redis
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

### 3. Verify Installations

#### PostgreSQL
```bash
psql --version
# Should output: psql (PostgreSQL) 14.x or higher
```

#### Redis
```bash
redis-cli ping
# Should output: PONG
```

## Database Setup

### 1. Create Database

#### Using psql
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE employee_management_system;

# Verify
\l

# Exit
\q
```

#### Using createdb command
```bash
createdb -U postgres employee_management_system
```

### 2. Create Database User (Optional but Recommended)

```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create user
CREATE USER ems_user WITH PASSWORD 'your_secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE employee_management_system TO ems_user;

-- Exit
\q
```

Update your `.env` file:
```env
DB_USER=ems_user
DB_PASSWORD=your_secure_password
```

## Backend Configuration

### 1. Install Dependencies

From the project root:
```bash
npm install
```

Or from the backend directory:
```bash
cd backend
npm install
```

### 2. Configure Environment Variables

```bash
cd backend
cp .env.example .env
```

Edit `.env` and update the following:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=employee_management_system
DB_USER=postgres
DB_PASSWORD=your_postgres_password

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Session Secret (generate a random string)
SESSION_SECRET=your_random_session_secret_here

# JWT Secret (generate a random string)
JWT_SECRET=your_random_jwt_secret_here
```

**Important:** Change `SESSION_SECRET` and `JWT_SECRET` to random, secure strings in production!

Generate secure secrets:
```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32
```

### 3. Run Database Migrations

```bash
npm run migrate:latest
```

This will create the initial database tables.

### 4. Verify Setup

Start the development server:
```bash
npm run dev
```

Check the health endpoint:
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-03-11T...",
  "services": {
    "database": "connected",
    "redis": "connected"
  }
}
```

## Troubleshooting

### PostgreSQL Connection Issues

**Error: `ECONNREFUSED`**
- Ensure PostgreSQL is running: `sudo systemctl status postgresql` (Linux) or check Services (Windows)
- Verify the port: `sudo netstat -plnt | grep 5432`
- Check `pg_hba.conf` for connection permissions

**Error: `password authentication failed`**
- Verify the password in `.env` matches your PostgreSQL user password
- Try connecting manually: `psql -U postgres -d employee_management_system`

**Error: `database does not exist`**
- Create the database: `createdb -U postgres employee_management_system`

### Redis Connection Issues

**Error: `ECONNREFUSED` (Redis)**
- Ensure Redis is running: `sudo systemctl status redis-server` (Linux)
- Verify the port: `redis-cli ping` should return `PONG`
- Check Redis configuration: `/etc/redis/redis.conf` (Linux)

**Error: `NOAUTH Authentication required`**
- If Redis has a password, add it to `.env`: `REDIS_PASSWORD=your_redis_password`

### Migration Issues

**Error: `relation already exists`**
- The migration has already been run
- Check migration status: `npm run migrate:status`
- If needed, rollback: `npm run migrate:rollback`

**Error: `permission denied`**
- Ensure your database user has sufficient privileges
- Grant privileges: `GRANT ALL PRIVILEGES ON DATABASE employee_management_system TO your_user;`

### Port Already in Use

**Error: `EADDRINUSE`**
- Another process is using port 3000
- Change the port in `.env`: `PORT=3001`
- Or kill the process using the port:
  - Linux/macOS: `lsof -ti:3000 | xargs kill -9`
  - Windows: `netstat -ano | findstr :3000` then `taskkill /PID <PID> /F`

## Testing the Setup

### Run Tests

```bash
npm test
```

**Note:** Tests require PostgreSQL and Redis to be running.

### Manual Testing

1. **Health Check:**
   ```bash
   curl http://localhost:3000/health
   ```

2. **API Info:**
   ```bash
   curl http://localhost:3000/api/v1
   ```

3. **Database Query:**
   ```bash
   psql -U postgres -d employee_management_system -c "SELECT NOW();"
   ```

4. **Redis Check:**
   ```bash
   redis-cli ping
   ```

## Next Steps

1. ✅ Backend infrastructure is set up
2. ⏭️ Implement authentication system (Task 1.4)
3. ⏭️ Set up file storage (Task 1.5)
4. ⏭️ Configure external services (Task 1.6)
5. ⏭️ Create database schemas for core modules (Phase 2)

## Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Redis Documentation](https://redis.io/documentation)
- [Knex.js Documentation](https://knexjs.org/)
- [Express.js Documentation](https://expressjs.com/)

## Support

If you encounter issues not covered in this guide, please:
1. Check the logs in the console
2. Verify all services are running
3. Review the `.env` configuration
4. Consult the project documentation
