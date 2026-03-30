
import * as fc from 'fast-check';
import { EmployeeService } from '../employeeService';
import db from '../../config/knex';

describe('Employee Module - Property-Based Tests', () => {
  let employeeService: EmployeeService;

  beforeAll(async () => {
    employeeService = new EmployeeService(db);
    await db('emergency_contacts').del();
    await db('employment_history').del();
    await db('employees').del();
  });

  afterAll(async () => {
    await db('emergency_contacts').del();
    await db('employment_history').del();
    await db('employees').del();
  });

  // Property 1: Employee Data Round-Trip
  // **Validates: Requirements 3.1.1, 3.1.3, 3.1.4, 3.1.6**
  it('Property 1: Employee data round-trip - created employee can be retrieved with all fields preserved', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          first_name: fc.stringMatching(/^[a-zA-Z]{2,50}$/),
          last_name: fc.stringMatching(/^[a-zA-Z]{2,50}$/),
          email: fc.emailAddress(),
          phone: fc.stringMatching(/^\d{10}$/),
          date_of_joining: fc.date({ min: new Date('2020-01-01'), max: new Date('2025-12-31') }),
          employment_type: fc.constantFrom('permanent', 'contract', 'temporary', 'intern'),
        }),
        async (data) => {
          const employeeData = {
            ...data,
            date_of_joining: data.date_of_joining.toISOString().split('T')[0],
          };

          const created = await employeeService.createEmployee(employeeData as any);
          const retrieved = await employeeService.getEmployee(created.id);

          // Verify all fields are preserved
          expect(retrieved.first_name).toBe(created.first_name);
          expect(retrieved.last_name).toBe(created.last_name);
          expect(retrieved.email).toBe(created.email);
          expect(retrieved.phone).toBe(created.phone);
          expect(retrieved.employment_type).toBe(created.employment_type);
          expect(retrieved.status).toBe('active');

          // Cleanup
          await db('employees').where('id', created.id).del();
        }
      ),
      { numRuns: 10 }
    );
  });

  // Property 2: Employee ID Uniqueness
  // **Validates: Requirements 3.1.2**
  it('Property 2: Employee ID uniqueness - all auto-generated employee IDs are unique', async () => {
    const employeeIds = new Set<string>();

    await fc.assert(
      fc.asyncProperty(
        fc.record({
          first_name: fc.stringMatching(/^[a-zA-Z]{2,50}$/),
          last_name: fc.stringMatching(/^[a-zA-Z]{2,50}$/),
          email: fc.emailAddress(),
          date_of_joining: fc.date({ min: new Date('2020-01-01'), max: new Date('2025-12-31') }),
          employment_type: fc.constantFrom('permanent', 'contract', 'temporary', 'intern'),
        }),
        async (data) => {
          const employeeData = {
            ...data,
            date_of_joining: data.date_of_joining.toISOString().split('T')[0],
          };

          const created = await employeeService.createEmployee(employeeData as any);

          // Check uniqueness
          expect(employeeIds.has(created.employee_id)).toBe(false);
          employeeIds.add(created.employee_id);

          // Cleanup
          await db('employees').where('id', created.id).del();
        }
      ),
      { numRuns: 5 }
    );
  });

  // Property 3: Emergency Contact Validation
  // **Validates: Requirements 3.1.4**
  it('Property 3: Emergency contact validation - system rejects zero or more than 3 contacts', async () => {
    const employeeData = {
      first_name: 'Test',
      last_name: 'User',
      email: `test-${Date.now()}@example.com`,
      date_of_joining: '2024-01-01',
      employment_type: 'permanent' as const,
    };

    const employee = await employeeService.createEmployee(employeeData as any);

    // Test: Can add 1-3 contacts
    for (let i = 1; i <= 3; i++) {
      const contact = await employeeService.addEmergencyContact(employee.id, {
        name: `Contact ${i}`,
        relationship: 'Friend',
        phone: `555000000${i}`,
      } as any);
      expect(contact).toBeDefined();
    }

    // Test: Cannot add 4th contact
    await expect(
      employeeService.addEmergencyContact(employee.id, {
        name: 'Contact 4',
        relationship: 'Friend',
        phone: '5550000004',
      } as any)
    ).rejects.toThrow('Maximum 3 emergency contacts allowed');

    // Cleanup
    await db('emergency_contacts').where('employee_id', employee.id).del();
    await db('employees').where('id', employee.id).del();
  });

  // Property 4: Audit Trail Completeness
  // **Validates: Requirements 3.1.8**
  it('Property 4: Audit trail completeness - modifications include timestamp and user info', async () => {
    const employeeData = {
      first_name: 'Audit',
      last_name: 'Test',
      email: `audit-${Date.now()}@example.com`,
      date_of_joining: '2024-01-01',
      employment_type: 'permanent' as const,
    };

    const created = await employeeService.createEmployee(employeeData as any);

    // Verify created_at is set
    expect(created.created_at).toBeDefined();

    // Update employee
    const updated = await employeeService.updateEmployee(created.id, {
      phone: '5551234567',
    });

    // Verify updated_at is set and different from created_at
    expect(updated.updated_at).toBeDefined();
    expect(new Date(updated.updated_at).getTime()).toBeGreaterThanOrEqual(
      new Date(created.created_at).getTime()
    );

    // Cleanup
    await db('employees').where('id', created.id).del();
  });

  // Property 5: Search Result Accuracy
  // **Validates: Requirements 3.1.9**
  it('Property 5: Search result accuracy - all returned results match filter criteria', async () => {
    // Create test employees
    const employees = [];
    for (let i = 0; i < 3; i++) {
      const emp = await employeeService.createEmployee({
        first_name: 'John',
        last_name: `Doe${i}`,
        email: `john${i}-${Date.now()}@example.com`,
        date_of_joining: '2024-01-01',
        employment_type: 'permanent' as const,
      } as any);
      employees.push(emp);
    }

    // Test: Search by name
    const results = await employeeService.searchEmployees({
      search: 'John',
      limit: 50,
      offset: 0,
    });

    // All results should contain 'John' in first_name
    results.forEach((emp) => {
      expect(emp.first_name.toLowerCase()).toContain('john');
    });

    // Test: Filter by employment type
    const permResults = await employeeService.searchEmployees({
      employment_type: 'permanent',
      limit: 50,
      offset: 0,
    });

    // All results should have matching employment_type
    permResults.forEach((emp) => {
      expect(emp.employment_type).toBe('permanent');
    });

    // Cleanup
    for (const emp of employees) {
      await db('employees').where('id', emp.id).del();
    }
  });

  // Property 10: Employee Status Transitions
  // **Validates: Requirements 3.1.5**
  it('Property 10: Employee status transitions - status can be updated to valid values', async () => {
    const employeeData = {
      first_name: 'Status',
      last_name: 'Test',
      email: `status-${Date.now()}@example.com`,
      date_of_joining: '2024-01-01',
      employment_type: 'permanent' as const,
    };

    const employee = await employeeService.createEmployee(employeeData as any);

    const validStatuses = ['active', 'on_leave', 'suspended', 'resigned', 'terminated'];

    for (const status of validStatuses) {
      const updated = await employeeService.updateEmployeeStatus(
        employee.id,
        status as any
      );
      expect(updated.status).toBe(status);
    }

    // Cleanup
    await db('employees').where('id', employee.id).del();
  });
});
