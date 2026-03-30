# Test Setup Verification Checklist

Use this checklist to verify that the test infrastructure is properly set up.

## Prerequisites

- [ ] PostgreSQL 16+ is installed
- [ ] PostgreSQL is running
- [ ] Node.js 22 LTS is installed
- [ ] npm is installed

## Database Setup

- [ ] Test database created: `employee_management_system_test`
  ```bash
  createdb -U postgres employee_management_system_test
  ```

- [ ] Test database is accessible
  ```bash
  psql -U postgres -d employee_management_system_test -c "SELECT NOW();"
  ```

- [ ] `.env` file exists in `backend/` directory
- [ ] `.env` contains test database variables:
  ```env
  TEST_DB_HOST=localhost
  TEST_DB_PORT=5432
  TEST_DB_NAME=employee_management_system_test
  TEST_DB_USER=postgres
  TEST_DB_PASSWORD=your_password_here
  ```

## Dependencies

- [ ] Dependencies installed
  ```bash
  cd backend && npm install
  ```

- [ ] All required packages present:
  - [ ] `knex` (3.1+)
  - [ ] `pg` (8.16+)
  - [ ] `jest` (30+)
  - [ ] `ts-jest` (29.2+)
  - [ ] `fast-check` (3.20+)
  - [ ] `supertest` (7.0+)

## File Structure

- [ ] Test utilities exist:
  - [ ] `src/__tests__/utils/test-db.ts`
  - [ ] `src/__tests__/utils/test-helpers.ts`
  - [ ] `src/__tests__/utils/index.ts`

- [ ] Factories exist:
  - [ ] `src/__tests__/factories/base.factory.ts`
  - [ ] `src/__tests__/factories/department.factory.ts`
  - [ ] `src/__tests__/factories/designation.factory.ts`
  - [ ] `src/__tests__/factories/employee.factory.ts`
  - [ ] `src/__tests__/factories/leave-type.factory.ts`
  - [ ] `src/__tests__/factories/shift.factory.ts`
  - [ ] `src/__tests__/factories/salary-structure.factory.ts`
  - [ ] `src/__tests__/factories/attendance.factory.ts`
  - [ ] `src/__tests__/factories/leave.factory.ts`
  - [ ] `src/__tests__/factories/factory-builder.ts`
  - [ ] `src/__tests__/factories/index.ts`

- [ ] Example tests exist:
  - [ ] `src/__tests__/example.test.ts`

- [ ] Configuration files updated:
  - [ ] `knexfile.ts` - Has `test` environment
  - [ ] `jest.config.js` - Updated with test settings
  - [ ] `setupTests.ts` - Has test DB environment variables
  - [ ] `.env.example` - Has test DB variables

- [ ] Documentation exists:
  - [ ] `TEST_DATABASE_SETUP.md`
  - [ ] `FACTORY_QUICK_REFERENCE.md`
  - [ ] `TEST_SETUP_GUIDE.md`
  - [ ] `TEST_INFRASTRUCTURE_SUMMARY.md`
  - [ ] `TEST_SETUP_CHECKLIST.md` (this file)

## Configuration Verification

- [ ] Jest configuration is correct
  ```bash
  npm test -- --showConfig | grep testEnvironment
  ```
  Should show: `"testEnvironment": "node"`

- [ ] Test timeout is set to 30 seconds
  ```bash
  npm test -- --showConfig | grep testTimeout
  ```
  Should show: `"testTimeout": 30000`

- [ ] Setup file is configured
  ```bash
  npm test -- --showConfig | grep setupFilesAfterEnv
  ```
  Should show: `"setupFilesAfterEnv": ["<rootDir>/src/setupTests.ts"]`

## Running Tests

- [ ] Run all tests successfully
  ```bash
  npm test
  ```
  Expected: All tests pass, database is cleaned up

- [ ] Run example tests specifically
  ```bash
  npm test -- src/__tests__/example.test.ts
  ```
  Expected: All example tests pass

- [ ] Run tests in watch mode
  ```bash
  npm run test:watch
  ```
  Expected: Tests run and watch for changes

- [ ] Run tests with coverage
  ```bash
  npm test -- --coverage
  ```
  Expected: Coverage report generated in `coverage/` directory

## Database Verification

- [ ] Database is empty after tests
  ```bash
  psql -U postgres -d employee_management_system_test -c "SELECT COUNT(*) FROM employees;"
  ```
  Expected: Returns `0`

- [ ] Migrations are applied
  ```bash
  psql -U postgres -d employee_management_system_test -c "SELECT COUNT(*) FROM knex_migrations;"
  ```
  Expected: Returns number > 0

- [ ] All tables exist
  ```bash
  psql -U postgres -d employee_management_system_test -c "\dt"
  ```
  Expected: Shows all tables (employees, departments, designations, etc.)

## Factory Verification

- [ ] Can create a department
  ```typescript
  const factories = helpers.getFactories();
  const dept = await factories.departments().create();
  expect(dept.id).toBeDefined();
  ```

- [ ] Can create an employee
  ```typescript
  const employee = await factories.employees().create();
  expect(employee.employee_id).toMatch(/EMP\d+/);
  ```

- [ ] Can create a complete organization
  ```typescript
  const org = await factories.createOrganization({
    departmentCount: 2,
    employeesPerDepartment: 3,
  });
  expect(org.employees.length).toBe(6);
  ```

## Test Helpers Verification

- [ ] Can initialize test environment
  ```typescript
  const helpers = createTestHelpers();
  await helpers.setup();
  expect(helpers.getKnex()).toBeDefined();
  ```

- [ ] Can reset database
  ```typescript
  await helpers.reset();
  const count = await helpers.count('employees');
  expect(count).toBe(0);
  ```

- [ ] Can perform CRUD operations
  ```typescript
  const record = await helpers.insert('departments', { /* data */ });
  expect(record.id).toBeDefined();
  ```

## Documentation Verification

- [ ] Can find setup instructions
  - [ ] `TEST_SETUP_GUIDE.md` exists and is readable
  - [ ] Contains step-by-step instructions
  - [ ] Contains troubleshooting section

- [ ] Can find factory examples
  - [ ] `FACTORY_QUICK_REFERENCE.md` exists
  - [ ] Contains all factory methods
  - [ ] Contains usage examples

- [ ] Can find comprehensive documentation
  - [ ] `TEST_DATABASE_SETUP.md` exists
  - [ ] Contains detailed explanations
  - [ ] Contains best practices

## Troubleshooting

If any checks fail, refer to:

1. **Database Connection Issues**
   - See "Troubleshooting" section in `TEST_SETUP_GUIDE.md`
   - Verify PostgreSQL is running
   - Verify test database exists

2. **Test Failures**
   - Check `TEST_DATABASE_SETUP.md` for common issues
   - Review example tests in `src/__tests__/example.test.ts`
   - Check factory documentation in `FACTORY_QUICK_REFERENCE.md`

3. **Configuration Issues**
   - Verify `.env` file has correct variables
   - Check `jest.config.js` is properly configured
   - Verify `setupTests.ts` is in correct location

## Final Verification

Run this comprehensive test to verify everything works:

```bash
# 1. Run all tests
npm test

# 2. Verify database is clean
psql -U postgres -d employee_management_system_test -c "SELECT COUNT(*) FROM employees;"

# 3. Run specific test file
npm test -- src/__tests__/example.test.ts

# 4. Check coverage
npm test -- --coverage
```

Expected results:
- ✅ All tests pass
- ✅ Database shows 0 employees after tests
- ✅ Example tests pass
- ✅ Coverage report generated

## Sign-Off

- [ ] All checks passed
- [ ] Test infrastructure is ready for use
- [ ] Team members can run tests successfully
- [ ] Documentation is accessible and clear

## Next Steps

1. **Start Writing Tests**
   - Use `FACTORY_QUICK_REFERENCE.md` for factory usage
   - Follow patterns in `src/__tests__/example.test.ts`
   - Refer to `TEST_DATABASE_SETUP.md` for detailed info

2. **Integrate with CI/CD**
   - See CI/CD section in `TEST_SETUP_GUIDE.md`
   - Set up GitHub Actions or other CI/CD platform
   - Configure test database in CI/CD environment

3. **Expand Factories**
   - Add factories for remaining entities (Recruitment, Benefits, etc.)
   - Create specialized factory builders for complex scenarios
   - Document new factories in `FACTORY_QUICK_REFERENCE.md`

4. **Monitor and Optimize**
   - Track test execution time
   - Optimize slow tests
   - Add performance benchmarks

## Support

For questions or issues:
1. Check the relevant documentation file
2. Review example tests
3. Check troubleshooting sections
4. Consult team members

---

**Last Updated**: 2026-03-05
**Status**: ✅ Ready for Use
