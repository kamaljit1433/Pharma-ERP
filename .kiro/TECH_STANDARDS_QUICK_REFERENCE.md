# Tech Standards Quick Reference

**Last Updated**: March 11, 2026

This is a quick reference guide for the tech standards applied to the Employee Management System project.

---

## Key Versions

### Backend
- **Node.js**: 22 LTS
- **TypeScript**: 5.9
- **Express.js**: 5.1
- **PostgreSQL**: 16+
- **Redis**: 7.2+
- **Jest**: 30
- **ESLint**: 9.0

### Frontend
- **React**: 19.2
- **TypeScript**: 5.9
- **Vite**: 6.0
- **Tailwind CSS**: 4.1
- **React Router**: 7.0
- **Vitest**: 2.0
- **ESLint**: 9.0

---

## Code Style Standards

### TypeScript
```typescript
// ✅ DO: Explicit return types
function getUserById(id: string): Promise<User> {
  // implementation
}

// ✅ DO: Explicit parameter types
const handleClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
  // implementation
};

// ❌ DON'T: Implicit any
function getData(data: any) { } // Error!

// ❌ DON'T: Missing return type
function calculate(a: number, b: number) { } // Error!
```

### Naming Conventions
- **Files**: kebab-case (`auth-service.ts`, `user-controller.ts`)
- **Classes/Interfaces**: PascalCase (`AuthService`, `IUser`)
- **Functions/Variables**: camelCase (`getUserById`, `isActive`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_RETRY_ATTEMPTS`)
- **React Components**: PascalCase (`UserCard`, `EmployeeForm`)

### Formatting
- **Indentation**: 2 spaces
- **Quotes**: Single quotes (`'string'`)
- **Semicolons**: Required
- **Line Length**: 100 characters (soft limit)
- **Trailing Commas**: In multiline objects/arrays
- **Line Endings**: LF

### Linting Rules
- ✅ No unused variables (prefix with `_` if intentional)
- ✅ No `console.log` (use logger utility)
- ✅ No explicit `any` types
- ✅ Explicit function return types required
- ✅ React hooks dependencies must be exhaustive
- ✅ React components must export only components

---

## Project Structure

### Backend (`backend/src/`)
```
config/              # Configuration (database, Redis, Passport)
database/
  ├── migrations/    # Knex migrations
  └── seeds/         # Database seeds
middleware/          # Express middleware
controllers/         # Route handlers
services/            # Business logic
repositories/        # Data access layer
routes/              # Route definitions
types/               # TypeScript types
utils/               # Utility functions
templates/email/     # Email templates
__tests__/           # Tests
```

### Frontend (`frontend/src/`)
```
components/
  ├── ui/            # shadcn/ui components
  └── [feature]/     # Feature components
pages/               # Page components
routes/              # Router configuration
store/               # Zustand stores
services/            # API service layer
hooks/               # Custom React hooks
utils/               # Utility functions
types/               # TypeScript types
lib/                 # Library utilities
```

---

## Common Commands

### Backend
```bash
npm run dev              # Start dev server
npm run build            # Compile TypeScript
npm run lint             # Check linting
npm run lint:fix         # Fix linting issues
npm run format           # Format code
npm test                 # Run tests
npm run migrate:latest   # Run migrations
```

### Frontend
```bash
npm run dev              # Start Vite dev server
npm run build            # Build for production
npm run lint             # Check linting
npm run lint:fix         # Fix linting issues
npm run format           # Format code
npm test                 # Run tests
```

---

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

---

## Testing Strategy

### Backend
- **Unit Tests**: Jest with fast-check for property-based testing
- **Integration Tests**: Supertest for API testing
- **Location**: `src/__tests__/` and `src/**/__tests__/`
- **Files**: `*.test.ts` or `*.spec.ts`

### Frontend
- **Unit Tests**: Vitest for components and utilities
- **Location**: Colocated or in `__tests__/` directories
- **Files**: `*.test.tsx` or `*.spec.tsx`

---

## Security Best Practices

### Backend
- ✅ Validate and sanitize all inputs
- ✅ Use parameterized queries (Knex prevents SQL injection)
- ✅ Hash passwords with bcrypt (min 10 rounds)
- ✅ Implement rate limiting on sensitive endpoints
- ✅ Use HTTPS in production
- ✅ Secure session cookies (httpOnly, secure, sameSite)
- ✅ Encrypt sensitive data at rest (AES-256)
- ✅ Implement CORS properly
- ✅ Use helmet for security headers

### Frontend
- ✅ Never store sensitive data in localStorage
- ✅ Use httpOnly cookies for tokens
- ✅ Validate user input before submission
- ✅ Sanitize HTML content to prevent XSS
- ✅ Use Content Security Policy headers
- ✅ Implement CSRF protection
- ✅ Validate JWT tokens before using

---

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
- Service worker caching strategies
- Minimize bundle size with tree-shaking
- Use Zustand persist middleware for state hydration

---

## Git Workflow

- **main**: Production-ready code
- **develop**: Integration branch
- **feature/[name]**: Feature development
- **bugfix/[name]**: Bug fixes
- **release/v[version]**: Release preparation

---

## Useful Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Express.js Guide](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [Vite Guide](https://vitejs.dev/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Redis Docs](https://redis.io/documentation)

---

## Troubleshooting

### ESLint Errors
```bash
# Fix all auto-fixable issues
npm run lint:fix

# Check specific file
npm run lint -- src/file.ts
```

### TypeScript Errors
```bash
# Check types
npm run build

# Check specific file
npx tsc --noEmit src/file.ts
```

### Test Failures
```bash
# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- auth.test.ts
```

---

## Checklist for New Features

- [ ] Create types in `types/[feature].ts`
- [ ] Create service/repository in `services/` or `repositories/`
- [ ] Create controller in `controllers/`
- [ ] Create routes in `routes/`
- [ ] Add tests in `__tests__/`
- [ ] Run `npm run lint:fix`
- [ ] Run `npm run format`
- [ ] Run `npm test`
- [ ] Run `npm run build`
- [ ] Update documentation

---

## Support

For questions about tech standards, refer to:
1. `.kiro/steering/tech.md` - Full tech standards
2. `.kiro/TECH_STANDARDS_UPDATE_SUMMARY.md` - Update details
3. This file - Quick reference
