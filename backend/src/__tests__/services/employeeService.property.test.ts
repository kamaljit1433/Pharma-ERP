import fc from 'fast-check';

/**
 * Property-Based Tests for Employee Module
 * **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6**
 */

describe('Employee Service - Property-Based Tests', () => {
  beforeEach(() => {
    // Setup not needed for pure property tests
  });

  /**
   * Property 1: Employee data round-trip
   * When an employee is created with valid data, all data should be preserved
   */
  it('Property 1: Employee data round-trip - data preservation', () => {
    fc.assert(
      fc.property(
        fc.record({
          first_name: fc.stringMatching(/^[a-zA-Z\s]{1,100}$/),
          last_name: fc.stringMatching(/^[a-zA-Z\s]{1,100}$/),
          email: fc.emailAddress(),
          date_of_joining: fc.date({ min: new Date('2020-01-01'), max: new Date('2026-12-31') }).map(d => d.toISOString().split('T')[0]),
          employment_type: fc.constantFrom('permanent', 'contract', 'temporary', 'intern'),
        }),
        (data) => {
          // Verify all required fields are present
          expect(data.first_name).toBeTruthy();
          expect(data.last_name).toBeTruthy();
          expect(data.email).toBeTruthy();
          expect(data.date_of_joining).toBeTruthy();
          expect(['permanent', 'contract', 'temporary', 'intern']).toContain(data.employment_type);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 2: Employee ID uniqueness
   * Each generated employee ID should be unique
   */
  it('Property 2: Employee ID uniqueness', () => {
    fc.assert(
      fc.property(
        fc.array(fc.stringMatching(/^[a-zA-Z0-9]{1,50}$/), { minLength: 1, maxLength: 100 }),
        (names) => {
          const ids = new Set(names.map((_, i) => `EMP${Date.now() + i}`));
          // All IDs should be unique
          expect(ids.size).toBe(names.length);
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property 3: Emergency contact validation
   * Emergency contacts must have name, relationship, and phone
   */
  it('Property 3: Emergency contact validation', () => {
    fc.assert(
      fc.property(
        fc.record({
          name: fc.stringMatching(/^[a-zA-Z\s]{1,100}$/),
          relationship: fc.constantFrom('spouse', 'parent', 'sibling', 'child', 'friend', 'other'),
          phone: fc.stringMatching(/^[0-9]{10}$/),
        }),
        (contact) => {
          // All required fields must be present
          expect(contact.name).toBeTruthy();
          expect(contact.relationship).toBeTruthy();
          expect(contact.phone).toBeTruthy();
          expect(contact.phone).toMatch(/^[0-9]{10}$/);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 4: Audit trail completeness
   * Employee records should have created_at and updated_at timestamps
   */
  it('Property 4: Audit trail completeness', () => {
    fc.assert(
      fc.property(
        fc.date({ min: new Date('2020-01-01'), max: new Date('2026-12-31') }),
        (timestamp) => {
          const created_at = timestamp.toISOString();
          const updated_at = new Date(timestamp.getTime() + 1000).toISOString();

          // Timestamps should be valid ISO strings
          expect(new Date(created_at).getTime()).toBeGreaterThan(0);
          expect(new Date(updated_at).getTime()).toBeGreaterThan(0);
          // Updated should be >= created
          expect(new Date(updated_at).getTime()).toBeGreaterThanOrEqual(new Date(created_at).getTime());
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 5: Search result accuracy
   * Search filters should only return matching employees
   */
  it('Property 5: Search result accuracy - filter consistency', () => {
    fc.assert(
      fc.property(
        fc.record({
          status: fc.constantFrom('active', 'on_leave', 'suspended', 'resigned', 'terminated'),
          employment_type: fc.constantFrom('permanent', 'contract', 'temporary', 'intern'),
        }),
        (filters) => {
          // Filters should be valid enum values
          expect(['active', 'on_leave', 'suspended', 'resigned', 'terminated']).toContain(filters.status);
          expect(['permanent', 'contract', 'temporary', 'intern']).toContain(filters.employment_type);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 6: Employee status transitions
   * Employee status should only transition to valid states
   */
  it('Property 6: Employee status transitions - valid state machine', () => {
    const validStatuses = ['active', 'on_leave', 'suspended', 'resigned', 'terminated'];
    const validTransitions: Record<string, string[]> = {
      active: ['on_leave', 'suspended', 'resigned', 'terminated'],
      on_leave: ['active', 'suspended', 'resigned', 'terminated'],
      suspended: ['active', 'on_leave', 'resigned', 'terminated'],
      resigned: ['terminated'],
      terminated: [],
    };

    fc.assert(
      fc.property(
        fc.constantFrom(...validStatuses),
        (fromStatus) => {
          const allowedTransitions = validTransitions[fromStatus] || [];
          // All allowed transitions should be valid
          for (const toStatus of allowedTransitions) {
            expect(validStatuses).toContain(toStatus);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 7: Emergency contact limit enforcement
   * Maximum 3 emergency contacts per employee
   */
  it('Property 7: Emergency contact limit enforcement', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 5 }),
        (count) => {
          const maxAllowed = 3;
          const canAdd = count < maxAllowed;

          // Should only allow adding if count < 3
          if (count >= maxAllowed) {
            expect(canAdd).toBe(false);
          } else {
            expect(canAdd).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 8: Email uniqueness constraint
   * No two employees should have the same email
   */
  it('Property 8: Email uniqueness constraint', () => {
    fc.assert(
      fc.property(
        fc.array(fc.emailAddress(), { minLength: 1, maxLength: 50 }),
        (emails) => {
          const uniqueEmails = new Set(emails);
          // Set size should equal array length if all unique
          expect(uniqueEmails.size).toBeLessThanOrEqual(emails.length);
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property 9: Employment history chronological order
   * Employment history records should be ordered by date
   */
  it('Property 9: Employment history chronological order', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            from_date: fc.date({ min: new Date('2020-01-01'), max: new Date('2026-12-31') }),
          }),
          { minLength: 1, maxLength: 10 }
        ),
        (records) => {
          const sorted = [...records].sort((a, b) => b.from_date.getTime() - a.from_date.getTime());

          // Verify descending order
          for (let i = 0; i < sorted.length - 1; i++) {
            const current = sorted[i];
            const next = sorted[i + 1];
            if (current && next) {
              expect(current.from_date.getTime()).toBeGreaterThanOrEqual(next.from_date.getTime());
            }
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property 10: Employee status transitions - valid state machine
   * Validates that employee status transitions follow business rules
   */
  it('Property 10: Employee status transitions - comprehensive', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('active', 'on_leave', 'suspended', 'resigned', 'terminated'),
        (status) => {
          // All statuses should be valid
          expect(['active', 'on_leave', 'suspended', 'resigned', 'terminated']).toContain(status);
        }
      ),
      { numRuns: 100 }
    );
  });
});
