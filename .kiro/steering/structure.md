# Project Structure & Organization

## Repository Root Layout

```
employee-management-system/
├── .kiro/                          # Kiro configuration and specs
│   ├── settings/                   # Kiro settings
│   ├── specs/                      # Feature specifications
│   │   └── employee-management-system/
│   │       ├── requirements.md
│   │       ├── design.md
│   │       └── tasks.md
│   └── steering/                   # Steering documents (this folder)
│       ├── product.md              # Product overview
│       ├── tech.md                 # Tech stack and build system
│       └── structure.md            # This file
├── backend/                        # Node.js/Express backend API
├── frontend/                       # React/Vite frontend PWA
├── Docs/                           # Project documentation
├── .git/                           # Git repository
├── .github/                        # GitHub workflows and config
├── .githooks/                      # Git hooks
├── .eslintrc.json                  # Root ESLint config
├── .prettierrc                     # Root Prettier config
├── .prettierignore                 # Prettier ignore rules
├── .gitignore                      # Git ignore rules
├── CONTRIBUTING.md                # Contribution guidelines
└── package.json                    # Root package (monorepo config)
```

## Backend Structure (`backend/`)

### Directory Organization

```
backend/
├── src/
│   ├── config/                     # Configuration modules
│   │   ├── index.ts                # Main config export
│   │   ├── database.ts             # PostgreSQL connection config
│   │   ├── knex.ts                 # Knex instance
│   │   ├── redis.ts                # Redis connection config
│   │   ├── passport.ts             # Passport authentication config
│   │   └── __tests__/              # Config tests
│   │
│   ├── database/
│   │   ├── migrations/             # Knex migrations
│   │   │   ├── 20260311000000_create_initial_tables.ts
│   │   │   └── 20260312000000_create_auth_tables.ts
│   │   └── seeds/                  # Database seed files
│   │
│   ├── middleware/                 # Express middleware
│   │   ├── auth.ts                 # JWT/session authentication
│   │   ├── errorHandler.ts         # Global error handling
│   │   ├── fileAccessControl.ts    # File access authorization
│   │   ├── fileUpload.ts           # Multer file upload config
│   │   └── session.ts              # Express session config
│   │
│   ├── controllers/                # Route handlers
│   │   ├── authController.ts       # Authentication endpoints
│   │   ├── emailController.ts      # Email endpoints
│   │   └── fileStorageController.ts # File storage endpoints
│   │
│   ├── services/                   # Business logic layer
│   │   ├── authService.ts          # Auth business logic
│   │   ├── emailService.ts         # Email service
│   │   ├── fileStorageService.ts   # File storage logic
│   │   ├── fileValidationService.ts # File validation
│   │   ├── email/                  # Email-specific services
│   │   │   ├── templateEngine.ts   # Handlebars template processing
│   │   │   └── providers/          # Email provider implementations
│   │   │       ├── sendgridProvider.ts
│   │   │       ├── sesProvider.ts
│   │   │       └── smtpProvider.ts
│   │   ├── storage/                # Storage provider implementations
│   │   │   └── s3StorageProvider.ts
│   │   └── __tests__/              # Service tests
│   │       ├── emailService.test.ts
│   │       ├── emailService.property.test.ts
│   │       ├── fileStorageService.test.ts
│   │       └── fileStorageService.property.test.ts
│   │
│   ├── repositories/               # Data access layer
│   │   └── authRepository.ts       # Auth data access
│   │
│   ├── routes/                     # Route definitions
│   │   ├── index.ts                # Main router
│   │   ├── auth.ts                 # Auth routes
│   │   ├── employees.ts            # Employee routes
│   │   ├── attendance.ts           # Attendance routes
│   │   ├── leave.ts                # Leave routes
│   │   ├── payroll.ts              # Payroll routes
│   │   └── files.ts                # File storage routes
│   │
│   ├── types/                      # TypeScript type definitions
│   │   ├── index.ts                # Main types export
│   │   ├── auth.ts                 # Auth types
│   │   ├── email.ts                # Email types
│   │   ├── fileStorage.ts          # File storage types
│   │   └── [module].ts             # Module-specific types
│   │
│   ├── utils/                      # Utility functions
│   │   ├── jwt.ts                  # JWT utilities
│   │   ├── password.ts             # Password hashing utilities
│   │   ├── validation.ts           # Input validation
│   │   ├── logger.ts               # Logging utility
│   │   ├── mfa.ts                  # MFA utilities
│   │   └── [utility].ts            # Other utilities
│   │
│   ├── templates/                  # Email templates
│   │   └── email/                  # Handlebars email templates
│   │       ├── welcome.hbs
│   │       ├── leave-request.hbs
│   │       ├── payslip-generated.hbs
│   │       ├── birthday-wish.hbs
│   │       └── system-notification.hbs
│   │
│   ├── __tests__/                  # Integration and end-to-end tests
│   │   ├── integration/
│   │   │   ├── fileStorage.integration.test.ts
│   │   │   └── fileStorageDeletion.integration.test.ts
│   │   ├── middleware/
│   │   │   └── fileAccessControl.test.ts
│   │   └── services/
│   │       ├── fileStorageService.deletion.test.ts
│   │       ├── fileStorageService.property.test.ts
│   │       ├── fileValidationService.property.test.ts
│   │       └── s3StorageProvider.deletion.test.ts
│   │
│   ├── index.ts                    # Application entry point
│   └── setupTests.ts               # Jest test setup
│
├── dist/                           # Compiled JavaScript output
├── .env                            # Environment variables (not in git)
├── .env.example                    # Environment template
├── .eslintrc.json                  # ESLint configuration
├── .prettierrc                     # Prettier configuration
├── .gitignore                      # Git ignore rules
├── jest.config.js                  # Jest configuration
├── knexfile.ts                     # Knex configuration
├── tsconfig.json                   # TypeScript configuration
├── package.json                    # Dependencies and scripts
├── package-lock.json               # Dependency lock file
├── README.md                       # Backend documentation
├── SETUP.md                        # Setup instructions
├── AUTH_IMPLEMENTATION.md          # Auth implementation notes
├── FILE_STORAGE_README.md          # File storage documentation
├── FILE_ACCESS_CONTROL_IMPLEMENTATION.md
├── FILE_DELETION_CLEANUP_IMPLEMENTATION.md
├── FILE_VALIDATION_ENHANCEMENT.md
└── IMPLEMENTATION_SUMMARY.md       # Implementation summary
```

### Key Backend Patterns

**Service Layer Pattern**
- Controllers handle HTTP requests/responses
- Services contain business logic
- Repositories handle database access
- Middleware handles cross-cutting concerns

**Error Handling**
- Global error handler middleware catches all errors
- Custom error classes for different error types
- Consistent error response format

**Testing Structure**
- Unit tests colocated with services (`__tests__/` subdirectories)
- Integration tests in `src/__tests__/integration/`
- Property-based tests use fast-check library
- Test files follow naming: `*.test.ts` or `*.spec.ts`

## Frontend Structure (`frontend/`)

### Directory Organization

```
frontend/
├── src/
│   ├── components/                 # React components
│   │   ├── ui/                     # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── separator.ts
│   │   │   └── index.ts            # Component exports
│   │   ├── layout/                 # Layout components
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── MainLayout.tsx
│   │   ├── forms/                  # Form components
│   │   │   ├── LoginForm.tsx
│   │   │   ├── EmployeeForm.tsx
│   │   │   └── LeaveRequestForm.tsx
│   │   ├── tables/                 # Table components
│   │   │   ├── EmployeeTable.tsx
│   │   │   ├── AttendanceTable.tsx
│   │   │   └── PayrollTable.tsx
│   │   └── [feature]/              # Feature-specific components
│   │       ├── EmployeeCard.tsx
│   │       ├── AttendanceStatus.tsx
│   │       └── LeaveBalance.tsx
│   │
│   ├── pages/                      # Page components (route targets)
│   │   ├── Dashboard.tsx           # Main dashboard
│   │   ├── Login.tsx               # Login page
│   │   ├── Employees.tsx           # Employee list page
│   │   ├── EmployeeDetail.tsx      # Employee detail page
│   │   ├── Attendance.tsx          # Attendance page
│   │   ├── Leave.tsx               # Leave management page
│   │   ├── Payroll.tsx             # Payroll page
│   │   ├── NotFound.tsx            # 404 page
│   │   └── [feature]/              # Feature-specific pages
│   │
│   ├── routes/                     # Router configuration
│   │   ├── index.tsx               # Main router setup
│   │   ├── ProtectedRoute.tsx      # Protected route wrapper
│   │   └── routes.ts               # Route definitions
│   │
│   ├── store/                      # Zustand state stores
│   │   ├── authStore.ts            # Authentication state
│   │   ├── uiStore.ts              # UI state (sidebar, theme)
│   │   ├── employeeStore.ts        # Employee data state
│   │   ├── attendanceStore.ts      # Attendance state
│   │   └── [feature]Store.ts       # Feature-specific stores
│   │
│   ├── services/                   # API service layer
│   │   ├── api.ts                  # API client setup
│   │   ├── authService.ts          # Auth API calls
│   │   ├── employeeService.ts      # Employee API calls
│   │   ├── attendanceService.ts    # Attendance API calls
│   │   ├── leaveService.ts         # Leave API calls
│   │   ├── payrollService.ts       # Payroll API calls
│   │   └── [feature]Service.ts     # Feature-specific API calls
│   │
│   ├── hooks/                      # Custom React hooks
│   │   ├── useAuth.ts              # Auth hook
│   │   ├── useApi.ts               # API call hook
│   │   ├── useLocalStorage.ts      # LocalStorage hook
│   │   └── use[Feature].ts         # Feature-specific hooks
│   │
│   ├── utils/                      # Utility functions
│   │   ├── formatters.ts           # Date, currency, etc. formatters
│   │   ├── validators.ts           # Input validators
│   │   ├── constants.ts            # App constants
│   │   └── helpers.ts              # General helpers
│   │
│   ├── types/                      # TypeScript type definitions
│   │   ├── index.ts                # Main types export
│   │   ├── auth.ts                 # Auth types
│   │   ├── employee.ts             # Employee types
│   │   ├── attendance.ts           # Attendance types
│   │   ├── leave.ts                # Leave types
│   │   ├── payroll.ts              # Payroll types
│   │   └── api.ts                  # API response types
│   │
│   ├── lib/                        # Library utilities
│   │   ├── cn.ts                   # Tailwind class merger
│   │   └── [utility].ts            # Other lib utilities
│   │
│   ├── App.tsx                     # Root component
│   ├── main.tsx                    # Entry point
│   └── index.css                   # Global styles with theme
│
├── dist/                           # Production build output
├── node_modules/                   # Dependencies
├── .eslintrc.json                  # ESLint configuration
├── .prettierrc                     # Prettier configuration
├── index.html                      # HTML entry point
├── vite.config.ts                  # Vite configuration
├── vitest.config.ts                # Vitest configuration
├── tailwind.config.js              # Tailwind CSS configuration
├── postcss.config.js               # PostCSS configuration
├── tsconfig.json                   # TypeScript configuration
├── package.json                    # Dependencies and scripts
├── package-lock.json               # Dependency lock file
├── FRONTEND_SETUP.md               # Frontend setup documentation
└── README.md                       # Frontend documentation
```

### Key Frontend Patterns

**Component Organization**
- UI components in `components/ui/` (shadcn/ui)
- Feature components in `components/[feature]/`
- Page components in `pages/`
- Reusable logic in custom hooks

**State Management**
- Global state in Zustand stores (`store/`)
- Stores use persist middleware for localStorage
- Component-level state with useState for UI-only state

**API Integration**
- Centralized API client in `services/api.ts`
- Feature-specific service files for API calls
- Custom `useApi` hook for common patterns

**Routing**
- Route definitions in `routes/routes.ts`
- Protected routes wrapped with `ProtectedRoute` component
- Lazy loading for code splitting

## Documentation Structure (`Docs/`)

```
Docs/
├── requirements.md                 # Full system requirements
├── GIT_SETUP_SUMMARY.md           # Git setup guide
├── GIT_BRANCH_PROTECTION.md       # Branch protection rules
└── QUICK_START_GIT.md             # Quick start for Git
```

## Monorepo Organization

This is a **monorepo** with two main workspaces:

- **`backend/`** - Node.js/Express API server
- **`frontend/`** - React PWA client

### Shared Configuration
- Root `.eslintrc.json` - Base ESLint rules
- Root `.prettierrc` - Shared Prettier config
- Root `.gitignore` - Shared Git ignore rules

### Independent Configurations
- Each workspace has its own `package.json`
- Each workspace has its own `tsconfig.json`
- Each workspace has its own `.env` files

## File Naming Conventions

### TypeScript/JavaScript Files
- **Services**: `[feature]Service.ts` (e.g., `authService.ts`)
- **Controllers**: `[feature]Controller.ts` (e.g., `authController.ts`)
- **Repositories**: `[feature]Repository.ts` (e.g., `authRepository.ts`)
- **Middleware**: `[feature].ts` (e.g., `auth.ts`, `errorHandler.ts`)
- **Utilities**: `[feature].ts` (e.g., `jwt.ts`, `password.ts`)
- **Stores**: `[feature]Store.ts` (e.g., `authStore.ts`)
- **Hooks**: `use[Feature].ts` (e.g., `useAuth.ts`)
- **Types**: `[feature].ts` (e.g., `auth.ts`, `employee.ts`)

### React Components
- **Components**: `PascalCase.tsx` (e.g., `UserCard.tsx`, `EmployeeForm.tsx`)
- **Pages**: `PascalCase.tsx` (e.g., `Dashboard.tsx`, `Login.tsx`)

### Test Files
- **Unit Tests**: `[file].test.ts` or `[file].spec.ts`
- **Property Tests**: `[file].property.test.ts`
- **Integration Tests**: `[file].integration.test.ts`

### Database Files
- **Migrations**: `YYYYMMDDHHmmss_description.ts` (e.g., `20260311000000_create_initial_tables.ts`)
- **Seeds**: `[feature]_seed.ts` (e.g., `employees_seed.ts`)

### Email Templates
- **Templates**: `[template-name].hbs` (e.g., `welcome.hbs`, `leave-request.hbs`)

## Module Organization Pattern

Each major feature follows this pattern:

```
Feature Module:
├── Controller (handles HTTP)
├── Service (business logic)
├── Repository (data access)
├── Types (TypeScript definitions)
├── Routes (endpoint definitions)
├── Middleware (feature-specific middleware)
└── Tests (unit + integration tests)
```

Example for Employee module:
```
backend/src/
├── controllers/employeeController.ts
├── services/employeeService.ts
├── repositories/employeeRepository.ts
├── types/employee.ts
├── routes/employees.ts
└── __tests__/services/employeeService.test.ts
```

## Development Workflow

### Adding a New Feature

1. **Backend**
   - Create migration in `database/migrations/`
   - Create types in `types/[feature].ts`
   - Create repository in `repositories/[feature]Repository.ts`
   - Create service in `services/[feature]Service.ts`
   - Create controller in `controllers/[feature]Controller.ts`
   - Create routes in `routes/[feature].ts`
   - Add tests in `__tests__/services/[feature]Service.test.ts`

2. **Frontend**
   - Create types in `types/[feature].ts`
   - Create API service in `services/[feature]Service.ts`
   - Create Zustand store in `store/[feature]Store.ts`
   - Create components in `components/[feature]/`
   - Create page in `pages/[Feature].tsx`
   - Add route in `routes/routes.ts`
   - Create tests for components and services

## Git Structure

- **Main branch**: `main` - Production-ready code
- **Development branch**: `develop` - Integration branch
- **Feature branches**: `feature/[feature-name]` - Feature development
- **Bugfix branches**: `bugfix/[bug-name]` - Bug fixes
- **Release branches**: `release/v[version]` - Release preparation

See `Docs/GIT_SETUP_SUMMARY.md` for detailed Git workflow.
