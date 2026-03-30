# Test Database Setup & Data Factories

This document describes the test database configuration and data factories for the Employee Management System.

## Overview

The test infrastructure provides:
- **Isolated Test Database**: Separate PostgreSQL database for running tests
- **Data Factories**: Reusable utilities for generating realistic test data
- **Test Helpers**: Convenient utilities for database operations in tests
- **Automatic Cleanup**: Database is cleaned between test runs

## Test Database Configuration

### Environment Variables

The test database uses the following environment variables (with defaults):

```env
TEST_DB_HOST=localhost
TEST_DB_PORT=5432
TEST_DB_NAME=employee_management_system_test
TEST_DB_USER=postgres
TEST_DB_PASSWORD=postgres
```

### Database Setup

1. **Create Test Database** (one-time setup):
```bash
createdb employee_management_system_test
```

2. **Run Migrations** (automatic during test setup):
```bash
npm test
```

The test database is automatically migrated before each test suite runs.

### Database Cleanup

- **Between Tests**: All tables are truncated (data deleted, schema preserved)
- **After Tests**: Database connection is closed
- **Foreign Key Handling**: Constraints are temporarily disabled during cleanup to allow truncation

## Data Factories

Factories are located in `backend/src/__tests__/factories/` and provide convenient methods for creating test data.

### Available Factories

#### 1. DepartmentFactory

Creates department records with optional hierarchy.

```typescript
const factories = helpers.getFactories();

// Create a single department
const dept = await factories.departments().create();

// Create a department with parent
const child = await factories.departments().createWithParent(parentId);

// Create a hierarchy (parent + children)
const { parent, children } = await factories.departments().createHierarchy(3);
```

#### 2. DesignationFactory

Creates job designation records.

```typescript
// Create a designation for a department
const designation = await factories.designations().createForDepartment(deptId);

// Create multiple designations
const designations = await factories.designations().createManyForDepartment(deptId, 3);
```

#### 3. EmployeeFactory

Creates employee records with realistic data.

```typescript
// Create a single employee
const employee = await factories.employees().create();

// Create with department and designation
const emp = await factories.employees().createWithRole(deptId, designationId);

// Create with manager
const subordinate = await factories.employees().createWithManager(managerId);

// Create manager with team
const { manager, team } = await factories.employees().createManagerWithTeam(deptId, designationId, 3);

// Create inactive employee
const resigned = await factories.employees().createInactive();

// Create multiple employees
const employees = await factories.employees().createMany(5);
```

#### 4. LeaveTypeFactory

Creates leave type configurations.

```typescript
// Create a single leave type
const leaveType = await factories.leaveTypes().create();

// Create all standard leave types (CL, SL, EL, ML, PL, UL)
const leaveTypes = await factories.leaveTypes().createStandardLeaveTypes();
```

#### 5. ShiftFactory

Creates shift configurations.

```typescript
// Create a single shift
const shift = await factories.shifts().create();

// Create all standard shifts (Morning, Evening, Night, Flexible)
const shifts = await factories.shifts().createStandardShifts();
```

#### 6. SalaryStructureFactory

Creates salary structure records.

```typescript
// Create salary structure for employee
const salary = await factories.salaryStructures().createForEmployee(employeeId);

// Create with custom salary mode
const salary = await factories.salaryStructures().createWithMode(employeeId, 'daily');
```

#### 7. AttendanceFactory

Creates attendance records.

```typescript
// Create a single attendance record
const attendance = await factories.attendance().createForEmployee(employeeId);

// Create with custom status
const absent = await factories.attendance().createWithStatus(employeeId, 'absent');

// Create monthly attendance (all working days in a month)
const records = await factories.attendance().createMonthlyAttendance(employeeId, 2024, 0, 20);
```

#### 8. LeaveFactory

Creates leave request records.

```typescript
// Create a leave request
const leave = await factories.leaves().createForEmployee(employeeId, leaveTypeId);

// Create approved leave
const approved = await factories.leaves().createApproved(employeeId, leaveTypeId, approverId);

// Create rejected leave
const rejected = await factories.leaves().createRejected(employeeId, leaveTypeId, approverId, 'Not approved');

// Create multiple leaves
const leaves = await factories.leaves().createManyForEmployee(employeeId, leaveTypeId, 3);
```

## Factory Builder

The `FactoryBuilder` class provides convenient methods for creating complex test scenarios.

### Creating a Complete Organization

```typescript
const factories = helpers.getFactories();

const org = await factories.createOrganization({
  departmentCount: 2,
  employeesPerDepartment: 5,
  withSalaryStructures: true,
  withAttendance: true,
});

// Returns:
// {
//   departments: Department[],
//   designations: Designation[],
//   employees: Employee[],
//   salaryStructures: SalaryStructure[],
//   attendanceRecords: Attendance[]
// }
```

### Creating Leave Setup

```typescript
const { leaveTypes, leaves } = await factories.createLeaveSetup(employeeIds);
```

### Creating Monthly Attendance

```typescript
const { attendanceRecords } = await factories.createMonthlyAttendanceSetup(employeeIds, 2024, 0);
```

## Test Helpers

The `TestHelpers` class provides utilities for database operations in tests.

### Setup and Teardown

```typescript
import { createTestHelpers } from './utils/test-helpers';

describe('My Test Suite', () => {
  const helpers = createTestHelpers();

  beforeAll(async () => {
    await helpers.setup();  // Initialize database and migrations
  });

  afterAll(async () => {
    await helpers.teardown();  // Close connections
  });

  afterEach(async () => {
    await helpers.reset();  // Clean tables between tests
  });
});
```

### Database Operations

```typescript
// Get knex instance for raw queries
const knex = helpers.getKnex();

// Get factory builder
const factories = helpers.getFactories();

// Insert data
const record = await helpers.insert('employees', { /* data */ });

// Get records
const records = await helpers.get('employees');
const record = await helpers.getOne('employees', { id: 'some-id' });

// Count records
const count = await helpers.count('employees');

// Update records
await helpers.update('employees', { status: 'active' }, { id: 'some-id' });

// Delete records
await helpers.delete('employees', { id: 'some-id' });

// Execute raw SQL
const result = await helpers.query('SELECT * FROM employees WHERE status = ?', ['active']);
```

## Example Test

```typescript
import { createTestHelpers } from './utils/test-helpers';

describe('Employee Service', () => {
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

  it('should create an employee with department and designation', async () => {
    const factories = helpers.getFactories();

    // Create test data
    const department = await factories.departments().create();
    const designation = await factories.designations().createForDepartment(department.id);
    const employee = await factories.employees().createWithRole(department.id, designation.id);

    // Verify
    expect(employee.department_id).toBe(department.id);
    expect(employee.designation_id).toBe(designation.id);
    expect(employee.status).toBe('active');
  });

  it('should create a manager with team', async () => {
    const factories = helpers.getFactories();

    // Create test data
    const department = await factories.departments().create();
    const designation = await factories.designations().createForDepartment(department.id);
    const { manager, team } = await factories.employees().createManagerWithTeam(department.id, designation.id, 3);

    // Verify
    expect(team).toHaveLength(3);
    team.forEach((member) => {
      expect(member.reporting_manager_id).toBe(manager.id);
    });
  });

  it('should create monthly attendance records', async () => {
    const factories = helpers.getFactories();

    // Create test data
    const employee = await factories.employees().create();
    const records = await factories.attendance().createMonthlyAttendance(employee.id, 2024, 0, 20);

    // Verify
    expect(records.length).toBeGreaterThan(0);
    records.forEach((record) => {
      expect(record.employee_id).toBe(employee.id);
    });
  });
});
```

## Running Tests

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Run Specific Test File

```bash
npm test -- src/__tests__/example.test.ts
```

### Run Tests with Coverage

```bash
npm test -- --coverage
```

## Best Practices

1. **Use Factories**: Always use factories to create test data instead of hardcoding values
2. **Clean Between Tests**: Use `afterEach(async () => helpers.reset())` to ensure test isolation
3. **Meaningful Data**: Factories generate realistic data (valid emails, phone numbers, dates)
4. **Relationships**: Factories handle relationships correctly (foreign keys, hierarchies)
5. **Reusable Scenarios**: Use `FactoryBuilder` methods for common test scenarios
6. **Minimal Setup**: Only create data needed for the specific test

## Troubleshooting

### Test Database Connection Error

**Problem**: `Error: connect ECONNREFUSED 127.0.0.1:5432`

**Solution**: Ensure PostgreSQL is running and test database exists:
```bash
createdb employee_management_system_test
```

### Foreign Key Constraint Error

**Problem**: `Error: insert or update on table violates foreign key constraint`

**Solution**: Ensure parent records are created before child records. Factories handle this automatically.

### Tests Timeout

**Problem**: `Jest did not exit one second after the test run has completed`

**Solution**: Ensure `helpers.teardown()` is called in `afterAll()` to close database connections.

### Stale Data Between Tests

**Problem**: Data from previous tests appears in current test

**Solution**: Ensure `helpers.reset()` is called in `afterEach()` to clean tables.

## Performance Considerations

- **Connection Pooling**: Test database uses minimal pool (min: 1, max: 2) to reduce overhead
- **Batch Operations**: Use `createMany()` for creating multiple records efficiently
- **Cleanup Strategy**: Tables are truncated (not dropped) to preserve schema
- **Test Timeout**: Increased to 30 seconds to allow for database operations

## Future Enhancements

- [ ] Seed data for common test scenarios
- [ ] Performance benchmarking utilities
- [ ] Data validation helpers
- [ ] Snapshot testing support
- [ ] Parallel test execution support
