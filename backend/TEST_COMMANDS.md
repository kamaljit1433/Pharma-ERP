# Backend Test Commands - Windows CMD

This document contains all test commands for the backend with Windows CMD syntax.

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
cd backend
npm test
```

### Run All Tests in Watch Mode
```cmd
cd backend
npm run test:watch
```

---

## Running Specific Test Suites

### Run Config Tests
```cmd
cd backend
npm test -- src/config/__tests__
```

### Run Service Tests
```cmd
cd backend
npm test -- src/services/__tests__
```

### Run Integration Tests
```cmd
cd backend
npm test -- src/__tests__/integration
```

### Run Middleware Tests
```cmd
cd backend
npm test -- src/__tests__/middleware
```

### Run Property-Based Tests
```cmd
cd backend
npm test -- --testNamePattern="property|Property"
```

---

## Running Tests by Feature

### Authentication Tests
```cmd
cd backend
npm test -- authService
```

### Email Service Tests
```cmd
cd backend
npm test -- emailService
```

### File Storage Tests
```cmd
cd backend
npm test -- fileStorage
```

### File Validation Tests
```cmd
cd backend
npm test -- fileValidation
```

### Database Tests
```cmd
cd backend
npm test -- database
```

### Redis Tests
```cmd
cd backend
npm test -- redis
```

---

## Running Tests with Coverage

### Generate Coverage Report
```cmd
cd backend
npm test -- --coverage
```

### Generate Coverage for Specific File
```cmd
cd backend
npm test -- --coverage src/services/authService.ts
```

### Generate Coverage and Show HTML Report
```cmd
cd backend
npm test -- --coverage && start coverage/lcov-report/index.html
```

---

## Running Tests with Filters

### Run Tests Matching Pattern
```cmd
cd backend
npm test -- --testNamePattern="auth"
```

### Run Tests in Specific File
```cmd
cd backend
npm test -- src/services/__tests__/authService.test.ts
```

### Run Tests Excluding Pattern
```cmd
cd backend
npm test -- --testNamePattern="^(?!.*integration)"
```

### Run Only Unit Tests (Exclude Integration)
```cmd
cd backend
npm test -- --testPathIgnorePatterns="integration"
```

---

## Running Tests with Options

### Run Tests with Verbose Output
```cmd
cd backend
npm test -- --verbose
```

### Run Tests with Detailed Error Output
```cmd
cd backend
npm test -- --verbose --no-coverage
```

### Run Tests and Update Snapshots
```cmd
cd backend
npm test -- --updateSnapshot
```

### Run Tests with Bail (Stop on First Failure)
```cmd
cd backend
npm test -- --bail
```

### Run Tests with Max Workers
```cmd
cd backend
npm test -- --maxWorkers=2
```

---

## Code Quality Commands

### Lint All Files
```cmd
cd backend
npm run lint
```

### Lint Specific Directory
```cmd
cd backend
npm run lint -- src/services
```

### Fix Linting Errors
```cmd
cd backend
npm run lint:fix
```

### Format Code with Prettier
```cmd
cd backend
npm run format
```

### Check Formatting Without Changes
```cmd
cd backend
npx prettier --check src
```

---

## Database Tests

### Run Database Connection Tests
```cmd
cd backend
npm test -- src/config/__tests__/database.test.ts
```

### Run Redis Connection Tests
```cmd
cd backend
npm test -- src/config/__tests__/redis.test.ts
```

---

## Property-Based Testing

### Run All Property-Based Tests
```cmd
cd backend
npm test -- --testNamePattern="property"
```

### Run Email Service Property Tests
```cmd
cd backend
npm test -- src/services/__tests__/emailService.property.test.ts
```

### Run File Storage Property Tests
```cmd
cd backend
npm test -- src/services/__tests__/fileStorageService.property.test.ts
```

### Run File Validation Property Tests
```cmd
cd backend
npm test -- src/services/__tests__/fileValidationService.property.test.ts
```

---

## Integration Tests

### Run All Integration Tests
```cmd
cd backend
npm test -- src/__tests__/integration
```

### Run File Storage Integration Tests
```cmd
cd backend
npm test -- src/__tests__/integration/fileStorage.integration.test.ts
```

### Run File Storage Deletion Integration Tests
```cmd
cd backend
npm test -- src/__tests__/integration/fileStorageDeletion.integration.test.ts
```

---

## Middleware Tests

### Run File Access Control Tests
```cmd
cd backend
npm test -- src/__tests__/middleware/fileAccessControl.test.ts
```

---

## Advanced Test Scenarios

### Run Tests with Specific Timeout
```cmd
cd backend
npm test -- --testTimeout=10000
```

### Run Tests and Generate JSON Report
```cmd
cd backend
npm test -- --json --outputFile=test-results.json
```

### Run Tests with Debug Output
```cmd
cd backend
npm test -- --verbose --detectOpenHandles
```

### Run Tests and Check for Memory Leaks
```cmd
cd backend
npm test -- --detectOpenHandles --forceExit
```

---

## Continuous Integration Commands

### Run All Tests with Coverage (CI Mode)
```cmd
cd backend
npm test -- --coverage --ci --maxWorkers=2
```

### Run Tests and Generate Reports
```cmd
cd backend
npm test -- --coverage --json --outputFile=coverage/test-results.json
```

---

## Troubleshooting

### Clear Jest Cache
```cmd
cd backend
npx jest --clearCache
```

### Run Tests with Fresh Cache
```cmd
cd backend
npx jest --clearCache && npm test
```

### Run Tests with Detailed Logging
```cmd
cd backend
npm test -- --verbose --no-coverage --detectOpenHandles
```

### Run Single Test File with Full Output
```cmd
cd backend
npm test -- src/services/__tests__/authService.test.ts --verbose --no-coverage
```

---

## Test File Locations

- **Config Tests**: `backend/src/config/__tests__/`
- **Service Tests**: `backend/src/services/__tests__/`
- **Integration Tests**: `backend/src/__tests__/integration/`
- **Middleware Tests**: `backend/src/__tests__/middleware/`
- **Property-Based Tests**: `backend/src/services/__tests__/*.property.test.ts`

---

## Environment Setup for Tests

Before running tests, ensure:

1. PostgreSQL is running
2. Redis is running
3. `.env` file is configured with test database credentials
4. All dependencies are installed: `npm install`

### Quick Setup
```cmd
cd backend
npm install
npm test
```

---

## Notes

- All commands assume you're in the project root or use `cd backend` first
- Tests use Jest as the testing framework
- Property-based tests use fast-check library
- Coverage reports are generated in `coverage/` directory
- Test results can be found in `test-results.json` when using JSON output
