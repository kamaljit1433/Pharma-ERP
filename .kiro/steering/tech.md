# Technology Stack & Build System

Here is your **stack updated to modern stable versions (2026)** in the **same format you used**.

---

## Backend Stack

### Runtime & Framework

* **Node.js** 22 LTS - JavaScript runtime
* **TypeScript** 5.9 - Type-safe JavaScript
* **Express.js** 5.1 - HTTP server framework
* **Knex.js** 3.1 - SQL query builder and migrations

### Database & Caching

* **PostgreSQL** 16+ - Primary relational database
* **Redis** 7.2+ - Session store and caching layer
* **ioredis** 5.8 - Redis client library
* **connect-redis** 9.0 - Express session store integration

### Authentication & Security

* **Passport.js** 0.7 - Authentication middleware
* **jsonwebtoken** 9.0.2 - JWT token generation and verification
* **bcrypt** 6.0 - Password hashing
* **speakeasy** 2.0 - TOTP/MFA support
* **qrcode** 1.5 - QR code generation for MFA setup
* **helmet** 7.1 - Security headers middleware
* **cors** 2.8.5 - CORS middleware
* **express-session** 1.18 - Session management

### File Storage & Processing

* **@aws-sdk/client-s3** 3.600+ - AWS S3 integration
* **@aws-sdk/s3-request-presigner** 3.600+ - Presigned URL generation
* **multer** 2.0.2 - File upload middleware
* **mime-types** 2.1.35 - MIME type detection

### Email & Notifications

* **@sendgrid/mail** 8.1 - SendGrid email provider
* **@aws-sdk/client-ses** 3.600+ - AWS SES email provider
* **nodemailer** 7.0+ - SMTP email provider
* **handlebars** 4.7 - Email template engine

### Utilities

* **uuid** 10.0 - UUID generation
* **dotenv** 16.4 - Environment variable management
* **compression** 1.8 - Response compression middleware
* **morgan** 1.10 - HTTP request logging
* **pg** 8.16 - PostgreSQL client

### Testing & Quality

* **Jest** 30 - Testing framework
* **supertest** 7.0 - HTTP assertion library
* **fast-check** 3.20 - Property-based testing
* **ESLint** 9.0 - Code linting
* **Prettier** 3.2 - Code formatting
* **ts-jest** 29.2 - Jest TypeScript support
* **tsx** 4.20 - TypeScript execution for development

---

## Frontend Stack

### Framework & Build

* **React** 19.2 - UI library
* **TypeScript** 5.9 - Type safety
* **Vite** 6.0 - Build tool and dev server
* **@vitejs/plugin-react** 5.0 - React plugin for Vite

### Routing & State

* **React Router** 7.0 - Client-side routing
* **Zustand** 5.0 - Lightweight state management with persistence

### UI & Styling

* **Tailwind CSS** 4.1 - Utility-first CSS framework
* **Radix UI** latest - Headless UI component primitives
* **shadcn/ui** latest - Pre-built Radix UI components
* **Lucide React** 0.577+ - Icon library
* **class-variance-authority** 0.7 - Component variant management
* **clsx** 2.1 - Conditional className utility
* **tailwind-merge** 3.5 - Tailwind class merging

### PWA & Offline

* **vite-plugin-pwa** 0.20+ - PWA support with Workbox
* **autoprefixer** 10.4 - CSS vendor prefixing
* **postcss** 8.5 - CSS processing

### Testing

* **Vitest** 2.0 - Vite-native testing framework
* **ESLint** 9.0 - Code linting
* **Prettier** 3.2 - Code formatting

---


## Common Commands

### Backend Commands

```bash
# Development
npm run dev              # Start dev server with hot-reload (tsx watch)
npm run build            # Compile TypeScript to JavaScript
npm start                # Run compiled JavaScript

# Testing
npm test                 # Run Jest tests
npm run test:watch       # Run tests in watch mode

# Code Quality
npm run lint             # Check for linting errors
npm run lint:fix         # Fix linting errors automatically
npm run format           # Format code with Prettier

# Database Migrations
npm run migrate:make <name>    # Create new migration
npm run migrate:latest         # Run all pending migrations
npm run migrate:rollback       # Rollback last migration batch
npm run migrate:status         # Check migration status

# Database Seeds
npm run seed:make <name>       # Create new seed file
npm run seed:run               # Run all seed files
```

### Frontend Commands

```bash
# Development
npm run dev              # Start Vite dev server (http://localhost:5173)
npm run build            # Build for production
npm run preview          # Preview production build locally

# Testing
npm test                 # Run Vitest tests

# Code Quality
npm run lint             # Check for linting errors
npm run lint:fix         # Fix linting errors automatically
npm run format           # Format code with Prettier
```

## Project Structure Conventions

### Backend (`backend/src/`)
- `config/` - Configuration files (database, Redis, Passport, etc.)
- `database/migrations/` - Knex migrations
- `database/seeds/` - Database seed files
- `middleware/` - Express middleware (auth, error handling, file upload, etc.)
- `controllers/` - Route handlers
- `services/` - Business logic layer
- `repositories/` - Data access layer
- `routes/` - Route definitions
- `types/` - TypeScript type definitions
- `utils/` - Utility functions (JWT, password, validation, logger, MFA, etc.)
- `templates/email/` - Email templates (Handlebars format)

### Frontend (`frontend/src/`)
- `components/ui/` - shadcn/ui components
- `pages/` - Page components
- `routes/` - Router configuration
- `store/` - Zustand stores
- `services/` - API service layer
- `hooks/` - Custom React hooks
- `utils/` - Utility functions
- `types/` - TypeScript type definitions
- `lib/` - Library utilities

## Code Style & Standards

### TypeScript
- Strict mode enabled
- Explicit type annotations for function parameters and returns
- Use interfaces for object shapes, types for unions/primitives
- Avoid `any` type (use `unknown` if necessary)

### Naming Conventions
- **Files**: kebab-case (e.g., `auth-service.ts`, `user-controller.ts`)
- **Classes/Interfaces**: PascalCase (e.g., `AuthService`, `IUser`)
- **Functions/Variables**: camelCase (e.g., `getUserById`, `isActive`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_RETRY_ATTEMPTS`)
- **React Components**: PascalCase (e.g., `UserCard`, `EmployeeForm`)

### Linting Rules
- No unused variables (prefix with `_` if intentionally unused)
- No `console.log` in production code (use logger utility)
- No explicit `any` types (warn level)
- Consistent import ordering

### Formatting
- 2-space indentation
- Single quotes for strings
- Semicolons required
- Max line length: 100 characters (soft limit)
- Trailing commas in multi-line objects/arrays

## Environment Variables

### Backend (.env)
```
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=employee_management_system
DB_USER=postgres
DB_PASSWORD=
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
SESSION_SECRET=
JWT_SECRET=
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

## Testing Strategy

### Backend
- **Unit Tests**: Jest with fast-check for property-based testing
- **Integration Tests**: Supertest for API endpoint testing
- **Test Location**: `src/__tests__/` and `src/**/__tests__/`
- **Test Files**: `*.test.ts` or `*.spec.ts`

### Frontend
- **Unit Tests**: Vitest for component and utility testing
- **Test Location**: Colocated with source files or in `__tests__/` directories
- **Test Files**: `*.test.tsx` or `*.spec.tsx`

## Performance Considerations

### Backend
- Use connection pooling for PostgreSQL
- Implement Redis caching for frequently accessed data
- Paginate large result sets
- Use database indexes on frequently queried columns
- Compress responses with gzip middleware

### Frontend
- Code splitting with React Router lazy loading
- Image optimization and lazy loading
- Service worker caching strategies (CacheFirst for assets, NetworkFirst for API)
- Minimize bundle size with tree-shaking
- Use Zustand persist middleware for state hydration

## Security Best Practices

### Backend
- Validate and sanitize all user inputs
- Use parameterized queries (Knex prevents SQL injection)
- Hash passwords with bcrypt (min 10 rounds)
- Implement rate limiting on sensitive endpoints
- Use HTTPS in production
- Secure session cookies (httpOnly, secure, sameSite)
- Encrypt sensitive data at rest (bank details, PII)
- Implement CORS properly
- Use helmet for security headers

### Frontend
- Never store sensitive data in localStorage (use httpOnly cookies)
- Validate user input before submission
- Sanitize HTML content to prevent XSS
- Use Content Security Policy headers
- Implement CSRF protection
- Validate JWT tokens before using
