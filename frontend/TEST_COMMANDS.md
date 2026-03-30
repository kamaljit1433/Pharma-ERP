# Frontend Test Commands - Windows CMD

This document contains all test commands for the frontend with Windows CMD syntax.

## Quick Reference

| Command | Purpose |
|---------|---------|
| `npm test` | Run all tests once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | Check for linting errors |
| `npm run lint:fix` | Fix linting errors automatically |
| `npm run format` | Format code with Prettier |

---

## Running All Tests

### Run All Tests Once
```cmd
cd frontend
npm test
```

### Run All Tests in Watch Mode
```cmd
cd frontend
npm run test:watch
```

### Run Tests with UI
```cmd
cd frontend
npm test -- --ui
```

---

## Running Specific Test Suites

### Run Component Tests
```cmd
cd frontend
npm test -- src/components
```

### Run Page Tests
```cmd
cd frontend
npm test -- src/pages
```

### Run Hook Tests
```cmd
cd frontend
npm test -- src/hooks
```

### Run Store Tests
```cmd
cd frontend
npm test -- src/store
```

### Run Service Tests
```cmd
cd frontend
npm test -- src/services
```

### Run Utility Tests
```cmd
cd frontend
npm test -- src/utils
```

---

## Running Tests by Feature

### Authentication Tests
```cmd
cd frontend
npm test -- auth
```

### Employee Management Tests
```cmd
cd frontend
npm test -- employee
```

### Attendance Tests
```cmd
cd frontend
npm test -- attendance
```

### Leave Management Tests
```cmd
cd frontend
npm test -- leave
```

### Payroll Tests
```cmd
cd frontend
npm test -- payroll
```

### File Storage Tests
```cmd
cd frontend
npm test -- fileStorage
```

### Offline Storage Tests
```cmd
cd frontend
npm test -- offlineStorage
```

---

## Running Tests with Coverage

### Generate Coverage Report
```cmd
cd frontend
npm test -- --coverage
```

### Generate Coverage for Specific Directory
```cmd
cd frontend
npm test -- --coverage src/components
```

### Generate Coverage and Show HTML Report
```cmd
cd frontend
npm test -- --coverage && start coverage/index.html
```

### Generate Coverage with Detailed Report
```cmd
cd frontend
npm test -- --coverage --reporter=verbose
```

---

## Running Tests with Filters

### Run Tests Matching Pattern
```cmd
cd frontend
npm test -- --grep="Button"
```

### Run Tests in Specific File
```cmd
cd frontend
npm test -- src/components/ui/button.test.tsx
```

### Run Tests Excluding Pattern
```cmd
cd frontend
npm test -- --grep="^(?!.*integration)"
```

### Run Only Unit Tests (Exclude Integration)
```cmd
cd frontend
npm test -- --exclude="**/*.integration.test.tsx"
```

---

## Running Tests with Options

### Run Tests with Verbose Output
```cmd
cd frontend
npm test -- --reporter=verbose
```

### Run Tests with Detailed Error Output
```cmd
cd frontend
npm test -- --reporter=verbose --no-coverage
```

### Run Tests and Update Snapshots
```cmd
cd frontend
npm test -- --update
```

### Run Tests with Bail (Stop on First Failure)
```cmd
cd frontend
npm test -- --bail
```

### Run Tests with Specific Number of Workers
```cmd
cd frontend
npm test -- --threads=2
```

---

## Code Quality Commands

### Lint All Files
```cmd
cd frontend
npm run lint
```

### Lint Specific Directory
```cmd
cd frontend
npm run lint -- src/components
```

### Fix Linting Errors
```cmd
cd frontend
npm run lint:fix
```

### Format Code with Prettier
```cmd
cd frontend
npm run format
```

### Check Formatting Without Changes
```cmd
cd frontend
npx prettier --check src
```

---

## Component Tests

### Run UI Component Tests
```cmd
cd frontend
npm test -- src/components/ui
```

### Run Layout Component Tests
```cmd
cd frontend
npm test -- src/components/layout
```

### Run Form Component Tests
```cmd
cd frontend
npm test -- src/components/forms
```

### Run Table Component Tests
```cmd
cd frontend
npm test -- src/components/tables
```

---

## Page Tests

### Run Dashboard Page Tests
```cmd
cd frontend
npm test -- src/pages/Dashboard
```

### Run Login Page Tests
```cmd
cd frontend
npm test -- src/pages/Login
```

### Run Employee Page Tests
```cmd
cd frontend
npm test -- src/pages/Employees
```

### Run Attendance Page Tests
```cmd
cd frontend
npm test -- src/pages/Attendance
```

### Run Leave Page Tests
```cmd
cd frontend
npm test -- src/pages/Leave
```

### Run Payroll Page Tests
```cmd
cd frontend
npm test -- src/pages/Payroll
```

---

## Hook Tests

### Run useAuth Hook Tests
```cmd
cd frontend
npm test -- useAuth
```

### Run useApi Hook Tests
```cmd
cd frontend
npm test -- useApi
```

### Run useLocalStorage Hook Tests
```cmd
cd frontend
npm test -- useLocalStorage
```

---

## Store Tests

### Run Auth Store Tests
```cmd
cd frontend
npm test -- authStore
```

### Run UI Store Tests
```cmd
cd frontend
npm test -- uiStore
```

### Run Employee Store Tests
```cmd
cd frontend
npm test -- employeeStore
```

### Run Attendance Store Tests
```cmd
cd frontend
npm test -- attendanceStore
```

---

## Service Tests

### Run Auth Service Tests
```cmd
cd frontend
npm test -- authService
```

### Run Employee Service Tests
```cmd
cd frontend
npm test -- employeeService
```

### Run Attendance Service Tests
```cmd
cd frontend
npm test -- attendanceService
```

### Run Leave Service Tests
```cmd
cd frontend
npm test -- leaveService
```

### Run Payroll Service Tests
```cmd
cd frontend
npm test -- payrollService
```

---

## Utility Tests

### Run Formatter Utility Tests
```cmd
cd frontend
npm test -- formatters
```

### Run Validator Utility Tests
```cmd
cd frontend
npm test -- validators
```

### Run Helper Utility Tests
```cmd
cd frontend
npm test -- helpers
```

---

## Advanced Test Scenarios

### Run Tests with Specific Timeout
```cmd
cd frontend
npm test -- --testTimeout=10000
```

### Run Tests and Generate JSON Report
```cmd
cd frontend
npm test -- --reporter=json --outputFile=test-results.json
```

### Run Tests with Debug Output
```cmd
cd frontend
npm test -- --reporter=verbose --inspect-brk
```

### Run Tests with Coverage Threshold
```cmd
cd frontend
npm test -- --coverage --coverage-threshold=80
```

---

## Continuous Integration Commands

### Run All Tests with Coverage (CI Mode)
```cmd
cd frontend
npm test -- --coverage --run --threads=2
```

### Run Tests and Generate Reports
```cmd
cd frontend
npm test -- --coverage --run --reporter=json --outputFile=coverage/test-results.json
```

---

## Snapshot Testing

### Update All Snapshots
```cmd
cd frontend
npm test -- --update
```

### Update Snapshots for Specific File
```cmd
cd frontend
npm test -- src/components/Button.test.tsx --update
```

### Review Snapshots Interactively
```cmd
cd frontend
npm test -- --ui
```

---

## Troubleshooting

### Clear Vitest Cache
```cmd
cd frontend
npx vitest --clearCache
```

### Run Tests with Fresh Cache
```cmd
cd frontend
npx vitest --clearCache && npm test
```

### Run Tests with Detailed Logging
```cmd
cd frontend
npm test -- --reporter=verbose --no-coverage
```

### Run Single Test File with Full Output
```cmd
cd frontend
npm test -- src/components/ui/button.test.tsx --reporter=verbose --no-coverage
```

### Run Tests with Browser Debug
```cmd
cd frontend
npm test -- --inspect-brk
```

---

## Test File Locations

- **Component Tests**: `frontend/src/components/**/*.test.tsx`
- **Page Tests**: `frontend/src/pages/**/*.test.tsx`
- **Hook Tests**: `frontend/src/hooks/**/*.test.ts`
- **Store Tests**: `frontend/src/store/**/*.test.ts`
- **Service Tests**: `frontend/src/services/**/*.test.ts`
- **Utility Tests**: `frontend/src/utils/**/*.test.ts`

---

## Environment Setup for Tests

Before running tests, ensure:

1. All dependencies are installed: `npm install`
2. `.env` file is configured (if needed for tests)
3. Backend API is running (if integration tests require it)

### Quick Setup
```cmd
cd frontend
npm install
npm test
```

---

## Development Workflow

### Watch Mode for Active Development
```cmd
cd frontend
npm run test:watch
```

### Watch Mode with UI
```cmd
cd frontend
npm test -- --ui
```

### Run Tests Before Commit
```cmd
cd frontend
npm test -- --run && npm run lint
```

---

## Performance Testing

### Run Tests with Performance Metrics
```cmd
cd frontend
npm test -- --reporter=verbose
```

### Run Tests and Measure Coverage Impact
```cmd
cd frontend
npm test -- --coverage --run
```

---

## Notes

- All commands assume you're in the project root or use `cd frontend` first
- Tests use Vitest as the testing framework (Vite-native)
- Vitest is configured in `vitest.config.ts`
- Coverage reports are generated in `coverage/` directory
- Test results can be found in `test-results.json` when using JSON output
- UI mode provides interactive test runner with browser interface
- Snapshots are stored alongside test files with `.snap` extension
