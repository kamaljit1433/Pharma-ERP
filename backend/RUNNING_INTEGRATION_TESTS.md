# Running Integration Tests - Quick Guide

## Prerequisites

1. **Database Setup**
   ```bash
   # Ensure PostgreSQL is running
   # Ensure test database exists
   npm run migrate:latest
   ```

2. **Environment Variables**
   ```bash
   # Copy .env.example to .env
   cp .env.example .env
   
   # Set test environment
   NODE_ENV=test
   ```

3. **Dependencies**
   ```bash
   npm install
   ```

---

## Running Tests

### Run All Integration Tests
```bash
npm test -- --testPathPattern=integration
```

### Run Specific Test Suites

#### Authentication Tests
```bash
npm test -- auth.integration.test.ts
```

#### Leave Management Tests
```bash
npm test -- leave.integration.test.ts
```

#### Payroll Tests
```bash
npm test -- payroll.integration.test.ts
```

#### Health Check Tests
```bash
npm test -- health.integration.test.ts
```

#### Email Service Tests
```bash
npm test -- email.integration.test.ts
```

#### Employee Management Tests
```bash
npm test -- employee.integration.test.ts
```

#### Attendance Tests
```bash
npm test -- attendance.integration.test.ts
```

#### Benefits Tests
```bash
npm test -- benefits.integration.test.ts
```

#### Recruitment Tests
```bash
npm test -- recruitment.integration.test.ts
```

#### All Other Modules
```bash
# Dashboard
npm test -- dashboard.integration.test.ts

# Documents
npm test -- documents.integration.test.ts

# E-Signature
npm test -- esignature.integration.test.ts

# File Storage
npm test -- fileStorage.integration.test.ts

# Geo-Tracking
npm test -- geo-tracking.integration.test.ts

# Hierarchy
npm test -- hierarchy.integration.test.ts

# Notifications
npm test -- notifications.integration.test.ts

# Performance
npm test -- performance.integration.test.ts

# Separation
npm test -- separation.integration.test.ts

# Suppliers
npm test -- suppliers.integration.test.ts

# Training
npm test -- training.integration.test.ts

# Bank Details
npm test -- bankDetails.integration.test.ts
```

---

## Test Options

### Run with Coverage
```bash
npm test -- --coverage --testPathPattern=integration
```

### Run in Watch Mode
```bash
npm test -- --watch --testPathPattern=integration
```

### Run with Verbose Output
```bash
npm test -- --verbose --testPathPattern=integration
```

### Run Specific Test Case
```bash
npm test -- auth.integration.test.ts -t "should register a new user successfully"
```

### Run Tests Matching Pattern
```bash
npm test -- --testNamePattern="should.*successfully"
```

---

## Debugging Tests

### Run Single Test File with Debugging
```bash
node --inspect-brk node_modules/.bin/jest auth.integration.test.ts
```

### VS Code Debug Configuration
Add to `.vscode/launch.json`:
```json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Integration Tests",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": [
    "--runInBand",
    "--testPathPattern=integration"
  ],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

---

## Test Output

### Successful Test Run
```
PASS  src/__tests__/integration/auth.integration.test.ts
  Auth API Integration Tests
    POST /api/v1/auth/register
      ✓ should register a new user successfully (245ms)
      ✓ should reject registration with duplicate email (89ms)
      ✓ should reject registration with weak password (67ms)
    ...

Test Suites: 1 passed, 1 total
Tests:       25 passed, 25 total
Snapshots:   0 total
Time:        12.456s
```

### Failed Test Example
```
FAIL  src/__tests__/integration/auth.integration.test.ts
  Auth API Integration Tests
    POST /api/v1/auth/login
      ✕ should login successfully with valid credentials (123ms)

  ● Auth API Integration Tests › POST /api/v1/auth/login › should login successfully

    expect(received).toBe(expected)

    Expected: 200
    Received: 401

      at Object.<anonymous> (src/__tests__/integration/auth.integration.test.ts:89:28)
```

---

## Common Issues and Solutions

### Issue: Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution:**
```bash
# Start PostgreSQL
sudo service postgresql start

# Or using Docker
docker-compose up -d postgres
```

### Issue: Test Timeout
```
Timeout - Async callback was not invoked within the 5000ms timeout
```

**Solution:**
```javascript
// Increase timeout in test file
jest.setTimeout(10000);

// Or for specific test
it('should process payroll', async () => {
  // test code
}, 10000);
```

### Issue: Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:**
```bash
# Kill process using port 3000
lsof -ti:3000 | xargs kill -9

# Or change test port in .env.test
PORT=3001
```

### Issue: Test Data Conflicts
```
Error: duplicate key value violates unique constraint
```

**Solution:**
```bash
# Clean test database
npm run migrate:rollback
npm run migrate:latest

# Or use isolated test database
DB_NAME=employee_management_test
```

---

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Integration Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: employee_management_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '22'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run migrations
        run: npm run migrate:latest
        env:
          DB_HOST: localhost
          DB_PORT: 5432
          DB_NAME: employee_management_test
          DB_USER: postgres
          DB_PASSWORD: postgres
      
      - name: Run integration tests
        run: npm test -- --testPathPattern=integration --coverage
        env:
          NODE_ENV: test
          DB_HOST: localhost
          DB_PORT: 5432
          DB_NAME: employee_management_test
          DB_USER: postgres
          DB_PASSWORD: postgres
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

## Performance Benchmarks

### Expected Test Execution Times

| Test Suite | Tests | Avg Time |
|-----------|-------|----------|
| Auth | 25 | ~12s |
| Leave | 30 | ~15s |
| Payroll | 25 | ~18s |
| Health | 25 | ~8s |
| Email | 30 | ~10s |
| Employee | 20 | ~10s |
| Attendance | 25 | ~12s |
| Benefits | 20 | ~14s |
| **Total** | **400+** | **~3-5min** |

---

## Best Practices

1. **Run tests before committing**
   ```bash
   npm test -- --testPathPattern=integration
   ```

2. **Keep tests isolated**
   - Each test should be independent
   - Use proper setup/teardown
   - Clean up test data

3. **Use descriptive test names**
   ```javascript
   it('should reject login with invalid password', async () => {
     // test code
   });
   ```

4. **Test both success and failure cases**
   - Happy path
   - Error scenarios
   - Edge cases
   - Validation errors

5. **Mock external services when appropriate**
   - Email providers
   - File storage
   - Third-party APIs

---

## Monitoring Test Health

### Generate Coverage Report
```bash
npm test -- --coverage --testPathPattern=integration --coverageDirectory=coverage/integration
```

### View Coverage Report
```bash
open coverage/integration/lcov-report/index.html
```

### Coverage Thresholds
```json
{
  "jest": {
    "coverageThreshold": {
      "global": {
        "branches": 80,
        "functions": 80,
        "lines": 80,
        "statements": 80
      }
    }
  }
}
```

---

## Quick Commands Reference

```bash
# Run all integration tests
npm test -- --testPathPattern=integration

# Run with coverage
npm test -- --coverage --testPathPattern=integration

# Run specific suite
npm test -- auth.integration.test.ts

# Run in watch mode
npm test -- --watch --testPathPattern=integration

# Run with verbose output
npm test -- --verbose --testPathPattern=integration

# Run specific test
npm test -- auth.integration.test.ts -t "should register"

# Debug tests
node --inspect-brk node_modules/.bin/jest auth.integration.test.ts

# Clean and run
npm run migrate:rollback && npm run migrate:latest && npm test -- --testPathPattern=integration
```

---

## Support

For issues or questions:
1. Check test output for error messages
2. Review test file for expected behavior
3. Check database connection and migrations
4. Verify environment variables
5. Consult INTEGRATION_TESTS_SUMMARY.md for test details

---

**Last Updated:** 2026-04-21
