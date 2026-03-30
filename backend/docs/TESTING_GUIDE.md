# Testing Guide for Employee Management System

This guide covers the testing infrastructure for the backend, including unit tests, property-based tests, and integration tests.

## Overview

The testing infrastructure includes:

- **Jest** - Unit and integration testing framework
- **Fast-Check** - Property-based testing library
- **Supertest** - HTTP assertion library for API testing
- **ts-jest** - TypeScript support for Jest

## Test Structure

```
backend/src/
├── __tests__/                          # Integration and E2E tests
│   ├── integration/
│   │   └── [feature].integration.test.ts
│   ├── middleware/
│   │   └── [middleware].test.ts
│   └── services/
│       └── [service].deletion.test.ts
│
├── services/
│   ├── __tests__/
│   │   ├── [service].test.ts           # Unit tests
│   │   ├── [service].property.test.ts  # Property-based tests
│   │   └── [service].integration.test.ts # Integration tests
│   └── [service].ts
│
├── controllers/
│   └── [controller].ts
│
└── utils/
    ├── fastCheckGenerators.ts          # Custom generators
    └── fastCheckConfig.ts              # Configuration utilities
```

## Running Tests

### Run all tests

```bash
npm test
```

### Run tests in watch mode

```bash
npm test:watch
```

### Run specific test file

```bash
npm test -- src/services/__tests__/employeeService.test.ts
```

### Run only property-based tests

```bash
npm test -- --testNamePattern="property|Property"
```

### Run with coverage report

```bash
npm test -- --coverage
```

### Run with verbose output

```bash
npm test -- --verbose
```

## Test Types

### 1. Unit Tests

Test individual functions and methods in isolation.

**File naming**: `*.test.ts` or `*.spec.ts`

**Example**:
```typescript
describe('EmployeeService', () => {
  it('should create employee with valid data', () => {
    const employee = service.createEmployee({
      name: 'John Doe',
      email: 'john@example.com'
    });
    expect(employee.id).toBeDefined();
  });
});
```

### 2. Property-Based Tests

Test that certain properties always hold true for any valid input.

**File naming**: `*.property.test.ts`

**Example**:
```typescript
describe('EmployeeService - Properties', () => {
  it('should always generate valid employee IDs', () => {
    fc.assert(
      fc.property(employeeNameArbitrary(), (name) => {
        const employee = service.createEmployee({ name });
        expect(employee.id).toMatch(/^EMP\d{6}$/);
      })
    );
  });
});
```

### 3. Integration Tests

Test how multiple components work together.

**File naming**: `*.integration.test.ts`

**Example**:
```typescript
describe('Employee API Integration', () => {
  it('should create and retrieve employee', async () => {
    const response = await request(app)
      .post('/api/v1/employees')
      .send({ name: 'John Doe', email: 'john@example.com' });
    
    expect(response.status).toBe(201);
    expect(response.body.id).toBeDefined();
  });
});
```

## Using Fast-Check

### Basic Usage

```typescript
import * as fc from 'fast-check';
import { employeeIdArbitrary } from '@/utils/fastCheckGenerators';

it('should validate employee ID format', () => {
  fc.assert(
    fc.property(employeeIdArbitrary(), (empId) => {
      expect(empId).toMatch(/^EMP\d{6}$/);
    })
  );
});
```

### Using Helper Functions

```typescript
import { assertProperty, assertPropertyThorough } from '@/utils/fastCheckConfig';
import { employeeArbitrary } from '@/utils/fastCheckGenerators';

// Quick test (10 runs)
it('should handle employee creation', () => {
  assertProperty(
    fc.property(employeeArbitrary(), (employee) => {
      expect(employee.id).toBeDefined();
    })
  );
});

// Thorough test (1000 runs)
it('should handle complex employee scenarios', () => {
  assertPropertyThorough(
    fc.property(employeeArbitrary(), (employee) => {
      expect(validateEmployee(employee)).toBe(true);
    })
  );
});
```

### Debugging Failed Properties

When a property test fails, fast-check provides:

1. **Failing example** - The specific input that caused the failure
2. **Shrunk example** - The minimal case that reproduces the failure
3. **Seed** - A seed value to reproduce the exact failure

To reproduce a specific failure:

```typescript
import { assertPropertyWithSeed } from '@/utils/fastCheckConfig';

it('should reproduce specific failure', () => {
  assertPropertyWithSeed(
    fc.property(employeeArbitrary(), (employee) => {
      expect(validateEmployee(employee)).toBe(true);
    }),
    1234567890 // Use the seed from the failure
  );
});
```

## Available Generators

### Basic Generators

- `employeeIdArbitrary()` - Employee IDs (EMP + 6 digits)
- `emailArbitrary()` - Valid email addresses
- `phoneNumberArbitrary()` - 10-digit phone numbers
- `employeeNameArbitrary()` - Realistic names
- `departmentArbitrary()` - Department names
- `salaryArbitrary()` - Salary amounts

### Status Generators

- `employeeStatusArbitrary()` - Employee statuses
- `leaveStatusArbitrary()` - Leave request statuses
- `attendanceStatusArbitrary()` - Attendance statuses
- `payrollStatusArbitrary()` - Payroll statuses

### Complex Generators

- `employeeArbitrary()` - Complete employee objects
- `leaveRequestArbitrary()` - Complete leave requests
- `attendanceRecordArbitrary()` - Complete attendance records
- `payrollRecordArbitrary()` - Complete payroll records

See `src/utils/fastCheckGenerators.ts` for complete list.

## Best Practices

### 1. Test Behavior, Not Implementation

```typescript
// Good: Tests the behavior
it('should never return negative salary', () => {
  fc.assert(
    fc.property(salaryArbitrary(), (salary) => {
      const result = calculateNetSalary(salary);
      expect(result).toBeGreaterThanOrEqual(0);
    })
  );
});

// Avoid: Tests implementation details
it('should use specific algorithm', () => {
  // Don't test HOW it's calculated
});
```

### 2. Combine Unit and Property Tests

```typescript
describe('SalaryCalculation', () => {
  // Unit test: specific case
  it('should calculate salary for known input', () => {
    const result = calculateSalary(50000);
    expect(result).toBe(40000); // 20% deduction
  });

  // Property test: general property
  it('should never return negative salary', () => {
    fc.assert(
      fc.property(salaryArbitrary(), (salary) => {
        expect(calculateSalary(salary)).toBeGreaterThanOrEqual(0);
      })
    );
  });
});
```

### 3. Use Meaningful Generators

```typescript
// Good: Domain-specific generator
const employeeIdArbitrary = () => 
  fc.integer({ min: 100000, max: 999999 })
    .map(num => `EMP${num}`);

// Avoid: Too generic
const idArbitrary = () => fc.string();
```

### 4. Test Invariants

```typescript
// Good: Tests invariants that should always hold
it('should maintain leave balance invariant', () => {
  fc.assert(
    fc.property(leaveBalanceArbitrary(), (balance) => {
      expect(balance).toBeGreaterThanOrEqual(0);
      expect(balance).toBeLessThanOrEqual(30);
    })
  );
});
```

### 5. Handle Edge Cases

```typescript
it('should handle edge cases', () => {
  fc.assert(
    fc.property(salaryArbitrary(), (salary) => {
      const result = calculateSalary(salary);
      
      // Edge case: minimum salary
      if (salary === 300000) {
        expect(result).toBeGreaterThan(0);
      }
      
      // Edge case: maximum salary
      if (salary === 10000000) {
        expect(result).toBeLessThanOrEqual(salary);
      }
    })
  );
});
```

## Coverage Goals

- **Unit Tests**: 80%+ coverage for business logic
- **Property Tests**: Cover critical invariants and edge cases
- **Integration Tests**: Cover main user workflows

Check coverage:

```bash
npm test -- --coverage
```

## CI/CD Integration

Tests run automatically on:

- **Pre-commit**: ESLint and Prettier checks
- **Pull Request**: Full test suite
- **Main Branch**: Full test suite + coverage report

In CI/CD, tests use a fixed seed for reproducibility:

```bash
CI=true npm test
```

## Troubleshooting

### Tests are slow

- Reduce `numRuns` in fast-check configuration
- Use `assertPropertyQuick()` for development
- Use `assertPropertyThorough()` only for critical tests

### Tests are flaky

- Check for timing issues (use `jest.useFakeTimers()`)
- Ensure tests don't depend on external state
- Use fixed seeds for reproducibility

### Property test fails with complex object

- Use `debugArbitrary()` to see generated data
- Simplify the property to isolate the issue
- Use the seed from the failure to reproduce

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Fast-Check Documentation](https://github.com/dubzzz/fast-check)
- [Property-Based Testing Guide](https://hypothesis.works/articles/what-is-property-based-testing/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)

## Next Steps

1. Review existing tests in `src/services/__tests__/`
2. Add property tests for critical business logic
3. Aim for 80%+ code coverage
4. Run tests regularly during development
