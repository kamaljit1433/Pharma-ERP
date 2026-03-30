# Test Database Setup Guide

This guide walks you through setting up the test database and running tests for the Employee Management System.

## Prerequisites

- PostgreSQL 16+ installed and running
- Node.js 22 LTS installed
- npm or yarn package manager

## One-Time Setup

### 1. Create Test Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create test database
CREATE DATABASE employee_management_system_test;

# Exit psql
\q
```

Or using command line:

```bash
createdb -U postgres employee_management_system_test
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and update test database variables:

```bash
cp .env.example .env
```

Edit `.env` and ensure these variables are set:

```env
# Test Database Configuration
TEST_DB_HOST=localhost
TEST_DB_PORT=5432
TEST_DB_NAME=employee_management_system_test
TEST_DB_USER=postgres
TEST_DB_PASSWORD=your_password_here
```

### 3. Install Dependencies

```bash
cd backend
npm install
```

## Running Tests

### Run All Tests

```bash
npm test
```

This will:
1. Initialize the test database connection
2. Run all pending migrations
3. Execute all test files
4. Clean up the database
5. Close connections

### Run Tests in Watch Mode

```bash
npm run test:watch
```

Automatically re-runs tests when files change.

### Run Specific Test File

```bash
npm test -- src/__tests__/example.test.ts
```

### Run Tests with Coverage

```bash
npm test -- --coverage
```

Generates coverage report in `coverage/` directory.

### Run Tests Matching Pattern

```bash
npm test -- --testNamePattern="Employee Factory"
```

## Verifying Setup

### 1. Check Database Connection

```bash
psql -U postgres -d employee_management_system_test -c "SELECT NOW();"
```

Should return current timestamp.

### 2. Run Example Test

```bash
npm test -- src/__tests__/example.test.ts
```

Should pass all tests and show:
```
PASS  src/__tests__/example.test.ts
  Test Database and Factories Example
    ✓ Department Factory
    ✓ Designation Factory
    ✓ Employee Factory
    ...
```

### 3. Check Test Database Cleanup

After running tests, verify database is cleaned:

```bash
psql -U postgres -d employee_management_system_test -c "SELECT COUNT(*) FROM employees;"
```

Should return `0` (all test data cleaned up).

## Troubleshooting

### Error: "connect ECONNREFUSED 127.0.0.1:5432"

**Problem**: PostgreSQL is not running or test database doesn't exist.

**Solution**:
1. Start PostgreSQL:
   ```bash
   # macOS
   brew services start postgresql
   
   # Linux
   sudo systemctl start postgresql
   
   # Windows
   # Start PostgreSQL service from Services
   ```

2. Create test database:
   ```bash
   createdb -U postgres employee_management_system_test
   ```

### Error: "password authentication failed"

**Problem**: PostgreSQL password is incorrect.

**Solution**:
1. Update `TEST_DB_PASSWORD` in `.env`
2. Or reset PostgreSQL password:
   ```bash
   psql -U postgres
   ALTER USER postgres WITH PASSWORD 'new_password';
   \q
   ```

### Error: "database does not exist"

**Problem**: Test database not created.

**Solution**:
```bash
createdb -U postgres employee_management_system_test
```

### Tests Timeout

**Problem**: Tests take too long or hang.

**Solution**:
1. Check database connection:
   ```bash
   psql -U postgres -d employee_management_system_test -c "SELECT NOW();"
   ```

2. Check for stuck connections:
   ```bash
   psql -U postgres -d employee_management_system_test -c "SELECT * FROM pg_stat_activity;"
   ```

3. Increase test timeout in `jest.config.js`:
   ```javascript
   testTimeout: 60000, // 60 seconds
   ```

### Foreign Key Constraint Error

**Problem**: `Error: insert or update on table violates foreign key constraint`

**Solution**:
- Ensure parent records are created before child records
- Factories handle this automatically
- Check that migrations have run successfully

### Stale Data Between Tests

**Problem**: Data from previous tests appears in current test.

**Solution**:
- Ensure `afterEach(async () => helpers.reset())` is called
- Check that `helpers.reset()` completes before next test starts

## Development Workflow

### Writing a New Test

1. Create test file in `src/__tests__/` or colocated with source:

```typescript
import { createTestHelpers } from './utils/test-helpers';

describe('My Feature', () => {
  const helpers = createTestHelpers();

  beforeAll(async () => {
    await helpers.setup();
  });

  afterAll(async () => {
    await helpers.teardown();
  });

  afterEach(async () => {
    await helpers.reset();
  });

  it('should do something', async () => {
    const factories = helpers.getFactories();
    
    // Create test data
    const employee = await factories.employees().create();
    
    // Test your code
    expect(employee).toBeDefined();
  });
});
```

2. Run the test:
```bash
npm test -- src/__tests__/my-feature.test.ts
```

3. Verify it passes and database is cleaned up.

### Using Factories

See [FACTORY_QUICK_REFERENCE.md](./FACTORY_QUICK_REFERENCE.md) for factory usage examples.

### Debugging Tests

1. Add `console.log()` statements:
```typescript
it('should do something', async () => {
  const factories = helpers.getFactories();
  const employee = await factories.employees().create();
  console.log('Employee:', employee);
  expect(employee).toBeDefined();
});
```

2. Run with verbose output:
```bash
npm test -- --verbose
```

3. Run single test:
```bash
npm test -- --testNamePattern="should do something"
```

4. Use Node debugger:
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

## CI/CD Integration

### GitHub Actions

Add to `.github/workflows/test.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: employee_management_system_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '22'
      
      - name: Install dependencies
        run: cd backend && npm install
      
      - name: Run tests
        run: cd backend && npm test
        env:
          TEST_DB_HOST: localhost
          TEST_DB_PORT: 5432
          TEST_DB_NAME: employee_management_system_test
          TEST_DB_USER: postgres
          TEST_DB_PASSWORD: postgres
```

## Performance Tips

1. **Run tests in parallel** (default):
   ```bash
   npm test
   ```

2. **Run tests sequentially** (slower but useful for debugging):
   ```bash
   npm test -- --runInBand
   ```

3. **Run only changed tests**:
   ```bash
   npm test -- --onlyChanged
   ```

4. **Update snapshots**:
   ```bash
   npm test -- --updateSnapshot
   ```

## Next Steps

1. Read [TEST_DATABASE_SETUP.md](./TEST_DATABASE_SETUP.md) for detailed documentation
2. Read [FACTORY_QUICK_REFERENCE.md](./FACTORY_QUICK_REFERENCE.md) for factory usage
3. Check [src/__tests__/example.test.ts](./src/__tests__/example.test.ts) for examples
4. Start writing tests for your features!

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review example tests in `src/__tests__/example.test.ts`
3. Check factory documentation in `FACTORY_QUICK_REFERENCE.md`
4. Review test database setup in `TEST_DATABASE_SETUP.md`
