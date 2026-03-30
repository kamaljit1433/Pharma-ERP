# Employee Management System - Backend API

## Overview

This is the backend API for the Employee Management System, built with Node.js, Express.js, PostgreSQL, and Redis.

## Prerequisites

- Node.js >= 18.0.0
- PostgreSQL >= 14
- Redis >= 6.0

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy the `.env.example` file to `.env` and update the values:

```bash
cp .env.example .env
```

Update the following variables in `.env`:
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` - PostgreSQL connection details
- `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD` - Redis connection details
- `SESSION_SECRET` - Secret for session encryption (change in production)
- `JWT_SECRET` - Secret for JWT token signing (change in production)

### 3. Create Database

Create the PostgreSQL database:

```bash
createdb employee_management_system
```

Or using psql:

```sql
CREATE DATABASE employee_management_system;
```

### 4. Run Migrations

```bash
npm run migrate:latest
```

## Development

### Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3000` with hot-reload enabled.

### Health Check

Visit `http://localhost:3000/health` to check the server status and database/Redis connections.

## Database Migrations

### Create a New Migration

```bash
npm run migrate:make migration_name
```

### Run Migrations

```bash
npm run migrate:latest
```

### Rollback Last Migration

```bash
npm run migrate:rollback
```

### Check Migration Status

```bash
npm run migrate:status
```

## Database Seeds

### Create a New Seed

```bash
npm run seed:make seed_name
```

### Run Seeds

```bash
npm run seed:run
```

## Testing

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

## Code Quality

### Linting

```bash
npm run lint
```

Fix linting issues:

```bash
npm run lint:fix
```

### Formatting

```bash
npm run format
```

## Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration files
│   │   ├── index.ts      # Main config
│   │   ├── database.ts   # PostgreSQL connection
│   │   ├── redis.ts      # Redis connection
│   │   └── knex.ts       # Knex instance
│   ├── database/
│   │   ├── migrations/   # Database migrations
│   │   └── seeds/        # Database seeds
│   ├── middleware/       # Express middleware
│   │   ├── session.ts    # Session configuration
│   │   └── errorHandler.ts # Error handling
│   ├── controllers/      # Route controllers (to be added)
│   ├── services/         # Business logic (to be added)
│   ├── repositories/     # Data access layer (to be added)
│   ├── models/           # Data models (to be added)
│   ├── types/            # TypeScript types (to be added)
│   ├── utils/            # Utility functions (to be added)
│   └── index.ts          # Application entry point
├── .env                  # Environment variables (not in git)
├── .env.example          # Environment variables template
├── knexfile.ts           # Knex configuration
├── package.json          # Dependencies and scripts
└── tsconfig.json         # TypeScript configuration
```

## API Endpoints

### Health Check

- `GET /health` - Check server and service health

### API Base

- `GET /api/v1` - API information

More endpoints will be added as modules are implemented.

## Technology Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL
- **Cache/Sessions:** Redis
- **Migration Tool:** Knex.js
- **Testing:** Jest
- **Code Quality:** ESLint, Prettier

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/staging/production) | development |
| `PORT` | Server port | 3000 |
| `DB_HOST` | PostgreSQL host | localhost |
| `DB_PORT` | PostgreSQL port | 5432 |
| `DB_NAME` | Database name | employee_management_system |
| `DB_USER` | Database user | postgres |
| `DB_PASSWORD` | Database password | - |
| `REDIS_HOST` | Redis host | localhost |
| `REDIS_PORT` | Redis port | 6379 |
| `SESSION_SECRET` | Session encryption secret | - |
| `JWT_SECRET` | JWT signing secret | - |
| `CORS_ORIGIN` | Allowed CORS origin | http://localhost:5173 |

## License

Private - Employee Management System
