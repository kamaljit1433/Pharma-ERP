# Fast-Check Property-Based Testing Setup Guide

## Overview

Fast-Check is a property-based testing library that generates random test data to verify that your code satisfies certain properties. This guide explains how to use fast-check in the Employee Management System.

## Installation

Fast-Check is already installed in `package.json`:

```bash
npm install fast-check --save-dev
```

Current version: `^3.20`

## Quick Start

### 1. Basic Property Test

```typescript
import * as fc from 'fast-check';

describe('Employee Service', () => {
  it('should always return an employee with a valid ID', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1 }), (name) => {
        const employee = createEmployee({ name });
        expect(employee.id).toBeDefined();
        expect(employee.id).toMatch(/^EMP\d{6}$/);
      })
    );
  });
});
```

### 2. Using Custom Generators

The project includes pre-built generators in `src/utils/fastCheckGenerators.ts`:

```typescript
import * as fc from 'fast-check';
import { employeeIdArbitrary, salaryArbitrary } from '@/utils/fastCheckGenerators';

describe('Payroll Service', () => {
  it('should calculate salary correctly for any valid input', () => {
    fc.assert(
      fc.property(employeeIdArbitrary(), salaryArbitrary(), (empId, salary) => {
        const result = calculateSalary(empId, salary);
        expect(result).toBeGreaterThanOrEqual(0);
      })
    );
  });
});
```

## Available Generators

### Basic Generators

- `employeeIdArbitrary()` - Employee IDs (EMP + 6 digits)
- `emailArbitrary()` - Valid email addresses
- `phoneNumberArbitrary()` - 10-digit phone numbers
- `employeeNameArbitrary()` - Realistic employee names
- `departmentArbitrary()` - Valid department names
- `salaryArbitrary()` - Salary amounts (300K - 10M)
- `percentageArbitrary()` - 0-100 percentages
- `leaveBalanceArbitrary()` - 0-30 days
- `workingHoursArbitrary()` - 0-24 hours
- `overtimeHoursArbitrary()` - 0-12 hours
- `distanceArbitrary()` - 0-1000 km

### Geographic Generators

- `latitudeArbitrary()` - Valid latitude (-90 to 90)
- `longitudeArbitrary()` - Valid longitude (-180 to 180)
- `geoLocationArbitrary()` - Complete coordinates

### Status Generators

- `employeeStatusArbitrary()` - Active, On Leave, Suspended, Resigned, Terminated
- `leaveStatusArbitrary()` - Pending, Approved, Rejected, Cancelled
- `attendanceStatusArbitrary()` - Present, Absent, Half-Day, On Leave, Holiday
- `payrollStatusArbitrary()` - Draft, Processed, Paid, Locked

### Date/Time Generators

- `monthArbitrary()` - 1-12
- `yearArbitrary()` - 2020-2030
- `dateArbitrary()` - Valid dates in range
- `uuidArbitrary()` - Valid UUIDs

### Complex Object Generators

- `employeeArbitrary()` - Complete employee objects
- `leaveRequestArbitrary()` - Complete leave requests
- `attendanceRecordArbitrary()` - Complete attendance records
- `payrollRecordArbitrary()` - Complete payroll records

## Common Property Patterns

### 1. Idempotence

A function should produce the same result when called multiple times with the same input:

```typescript
it('should be idempotent', () => {
  fc.assert(
    fc.property(employeeIdArbitrary(), (empId) => {
      const result1 = getEmployee(empId);
      const result2 = getEmployee(empId);
      expect(result1).toEqual(result2);
    })
  );
});
```

### 2. Inverse Operations

Operations should be reversible:

```typescript
it('should support round-trip conversion', () => {
  fc.assert(
    fc.property(employeeArbitrary(), (employee) => {
      const serialized = JSON.stringify(employee);
      const deserialized = JSON.parse(serialized);
      expect(deserialized).toEqual(employee);
    })
  );
});
```

### 3. Invariants

Certain properties should always hold true:

```typescript
it('should maintain leave balance invariant', () => {
  fc.assert(
    fc.property(leaveBalanceArbitrary(), (balance) => {
      expect(balance).toBeGreaterThanOrEqual(0);
      expect(balance).toBeLessThanOrEqual(30);
    })
  );
});
```

### 4. Composition

Multiple operations should compose correctly:

```typescript
it('should compose operations correctly', () => {
  fc.assert(
    fc.property(employeeArbitrary(), (employee) => {
      const updated = updateEmployee(employee.id, { name: 'New Name' });
      const retrieved = getEmployee(employee.id);
      expect(retrieved.name).toBe('New Name');
    })
  );
});
```

## Running Property-Based Tests

### Run all tests

```bash
npm test
```

### Run specific test file

```bash
npm test -- src/services/__tests__/employeeService.property.test.ts
```

### Run with verbose output

```bash
npm test -- --verbose
```

### Run in watch mode

```bash
npm test:watch
```

## Test File Naming Convention

- **Unit tests**: `*.test.ts` or `*.spec.ts`
- **Property-based tests**: `*.property.test.ts`
- **Integration tests**: `*.integration.test.ts`

Example structure:
```
src/services/__tests__/
├── employeeService.test.ts           # Unit tests
├── employeeService.property.test.ts  # Property-based tests
└── employeeService.integration.test.ts # Integration tests
```

## Example: Complete Property Test Suite

```typescript
// src/services/__tests__/employeeService.property.test.ts
import * as fc from 'fast-check';
import { EmployeeService } from '../employeeService';
import {
  employeeIdArbitrary,
  employeeNameArbitrary,
  emailArbitrary,
  salaryArbitrary,
} from '@/utils/fastCheckGenerators';

describe('EmployeeService - Property-Based Tests', () => {
  let service: EmployeeService;

  beforeEach(() => {
    service = new EmployeeService();
  });

  describe('Employee Creation', () => {
    it('should always create employee with valid ID', () => {
      fc.assert(
        fc.property(
          employeeNameArbitrary(),
          emailArbitrary(),
          (name, email) => {
            const employee = service.createEmployee({ name, email });
            expect(employee.id).toMatch(/^EMP\d{6}$/);
          }
        )
      );
    });

    it('should preserve input data', () => {
      fc.assert(
        fc.property(
          employeeNameArbitrary(),
          emailArbitrary(),
          (name, email) => {
            const employee = service.createEmployee({ name, email });
            expect(employee.name).toBe(name);
            expect(employee.email).toBe(email);
          }
        )
      );
    });
  });

  describe('Salary Calculations', () => {
    it('should never return negative salary', () => {
      fc.assert(
        fc.property(salaryArbitrary(), (salary) => {
          const result = service.calculateNetSalary(salary);
          expect(result).toBeGreaterThanOrEqual(0);
        })
      );
    });

    it('should not exceed gross salary', () => {
      fc.assert(
        fc.property(salaryArbitrary(), (salary) => {
          const result = service.calculateNetSalary(salary);
          expect(result).toBeLessThanOrEqual(salary);
        })
      );
    });
  });
});
```

## Best Practices

### 1. Use Meaningful Generators

Create domain-specific generators that reflect real-world constraints:

```typescript
// Good: Generates realistic employee IDs
const employeeIdArbitrary = () => fc.integer({ min: 100000, max: 999999 })
  .map(num => `EMP${num}`);

// Avoid: Too generic
const idArbitrary = () => fc.string();
```

### 2. Test Invariants, Not Implementation

Focus on properties that should always be true:

```typescript
// Good: Tests the invariant
it('should maintain balance >= 0', () => {
  fc.assert(
    fc.property(leaveBalanceArbitrary(), (balance) => {
      expect(balance).toBeGreaterThanOrEqual(0);
    })
  );
});

// Avoid: Testing implementation details
it('should use specific algorithm', () => {
  // Don't test HOW it's calculated, test WHAT the result should be
});
```

### 3. Combine with Unit Tests

Property-based tests complement, not replace, unit tests:

```typescript
describe('EmployeeService', () => {
  // Unit test: specific case
  it('should create employee with given name', () => {
    const employee = service.createEmployee({ name: 'John Doe' });
    expect(employee.name).toBe('John Doe');
  });

  // Property test: general property
  it('should always preserve input name', () => {
    fc.assert(
      fc.property(employeeNameArbitrary(), (name) => {
        const employee = service.createEmployee({ name });
        expect(employee.name).toBe(name);
      })
    );
  });
});
```

### 4. Use Shrinking

Fast-Check automatically shrinks failing examples to minimal cases:

```typescript
// If this fails with a complex object, fast-check will find the minimal
// failing case and show it in the error message
fc.assert(
  fc.property(employeeArbitrary(), (employee) => {
    expect(validateEmployee(employee)).toBe(true);
  })
);
```

### 5. Set Appropriate Sample Sizes

Adjust the number of test cases as needed:

```typescript
fc.assert(
  fc.property(employeeArbitrary(), (employee) => {
    expect(employee.id).toBeDefined();
  }),
  { numRuns: 1000 } // Run 1000 test cases instead of default 100
);
```

## Debugging Failed Properties

When a property test fails, fast-check provides:

1. **Failing example**: The specific input that caused the failure
2. **Shrunk example**: The minimal case that reproduces the failure
3. **Seed**: A seed value to reproduce the exact failure

```typescript
// Output example:
// Property failed after 47 tests
// Counterexample: [{ id: 'EMP123456', salary: 500000 }]
// Seed: 1234567890
```

To reproduce a specific failure:

```typescript
fc.assert(
  fc.property(employeeArbitrary(), (employee) => {
    expect(validateEmployee(employee)).toBe(true);
  }),
  { seed: 1234567890 } // Use the seed from the failure
);
```

## Integration with CI/CD

Property-based tests run as part of the standard test suite:

```bash
# In GitHub Actions or CI pipeline
npm test
```

Tests will fail if any property is violated, preventing regressions.

## Resources

- [Fast-Check Documentation](https://github.com/dubzzz/fast-check)
- [Property-Based Testing Guide](https://hypothesis.works/articles/what-is-property-based-testing/)
- [Fast-Check Examples](https://github.com/dubzzz/fast-check/tree/main/examples)

## Next Steps

1. Review existing property tests in `src/services/__tests__/`
2. Add property tests for critical business logic
3. Use generators from `fastCheckGenerators.ts` in your tests
4. Run tests regularly to catch regressions
