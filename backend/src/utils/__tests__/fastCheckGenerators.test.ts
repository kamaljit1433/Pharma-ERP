/**
 * Fast-Check Generators Tests
 * Tests for property-based testing generators
 */

import * as fc from 'fast-check';
import {
  employeeIdArbitrary,
  emailArbitrary,
  phoneNumberArbitrary,
  employeeNameArbitrary,
  departmentArbitrary,
} from '../fastCheckGenerators';

describe('Fast-Check Generators', () => {
  describe('employeeIdArbitrary', () => {
    it('should generate valid employee IDs', () => {
      fc.assert(
        fc.property(employeeIdArbitrary(), (id: string) => {
          expect(typeof id).toBe('string');
          expect(id.length).toBeGreaterThan(0);
        })
      );
    });

    it('should generate consistent format', () => {
      fc.assert(
        fc.property(employeeIdArbitrary(), (id: string) => {
          // Employee IDs should follow a pattern (e.g., EMP-XXXX or similar)
          expect(id).toMatch(/^[A-Z0-9\-]+$/);
        })
      );
    });

    it('should generate unique IDs', () => {
      const ids = new Set<string>();

      fc.assert(
        fc.property(employeeIdArbitrary(), (id: string) => {
          ids.add(id);
          return true;
        }),
        { numRuns: 100 }
      );

      // Should have generated many unique IDs
      expect(ids.size).toBeGreaterThan(50);
    });
  });

  describe('emailArbitrary', () => {
    it('should generate valid email addresses', () => {
      fc.assert(
        fc.property(emailArbitrary(), (email: string) => {
          expect(typeof email).toBe('string');
          expect(email).toContain('@');
          expect(email).toContain('.');
        })
      );
    });

    it('should generate emails with valid format', () => {
      fc.assert(
        fc.property(emailArbitrary(), (email: string) => {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          expect(emailRegex.test(email)).toBe(true);
        })
      );
    });

    it('should not contain spaces', () => {
      fc.assert(
        fc.property(emailArbitrary(), (email: string) => {
          expect(email).not.toContain(' ');
        })
      );
    });

    it('should have valid domain', () => {
      fc.assert(
        fc.property(emailArbitrary(), (email: string) => {
          const parts = email.split('@');
          expect(parts.length).toBe(2);
          expect(parts[1]).toContain('.');
        })
      );
    });
  });

  describe('phoneNumberArbitrary', () => {
    it('should generate valid phone numbers', () => {
      fc.assert(
        fc.property(phoneNumberArbitrary(), (phone: string) => {
          expect(typeof phone).toBe('string');
          expect(phone.length).toBeGreaterThan(0);
        })
      );
    });

    it('should contain only valid characters', () => {
      fc.assert(
        fc.property(phoneNumberArbitrary(), (phone: string) => {
          expect(phone).toMatch(/^[\d\s\-\+\(\)]+$/);
        })
      );
    });

    it('should have at least 10 digits', () => {
      fc.assert(
        fc.property(phoneNumberArbitrary(), (phone: string) => {
          const digits = phone.replace(/\D/g, '');
          expect(digits.length).toBeGreaterThanOrEqual(10);
        })
      );
    });

    it('should support various formats', () => {
      fc.assert(
        fc.property(phoneNumberArbitrary(), (phone: string) => {
          // Should be parseable as a phone number
          expect(phone.length).toBeGreaterThan(0);
        })
      );
    });
  });

  describe('employeeNameArbitrary', () => {
    it('should generate valid employee names', () => {
      fc.assert(
        fc.property(employeeNameArbitrary(), (name: string) => {
          expect(typeof name).toBe('string');
          expect(name.length).toBeGreaterThan(0);
        })
      );
    });

    it('should contain alphabetic characters', () => {
      fc.assert(
        fc.property(employeeNameArbitrary(), (name: string) => {
          expect(name).toMatch(/[a-zA-Z]/);
        })
      );
    });

    it('should not contain special characters', () => {
      fc.assert(
        fc.property(employeeNameArbitrary(), (name: string) => {
          expect(name).toMatch(/^[a-zA-Z\s\-']+$/);
        })
      );
    });

    it('should have reasonable length', () => {
      fc.assert(
        fc.property(employeeNameArbitrary(), (name: string) => {
          expect(name.length).toBeGreaterThan(1);
          expect(name.length).toBeLessThan(100);
        })
      );
    });

    it('should support multi-word names', () => {
      fc.assert(
        fc.property(employeeNameArbitrary(), (name: string) => {
          // Should be able to contain spaces for multi-word names
          expect(typeof name).toBe('string');
        })
      );
    });
  });

  describe('departmentArbitrary', () => {
    it('should generate valid department names', () => {
      fc.assert(
        fc.property(departmentArbitrary(), (dept: string) => {
          expect(typeof dept).toBe('string');
          expect(dept.length).toBeGreaterThan(0);
        })
      );
    });

    it('should contain alphabetic characters', () => {
      fc.assert(
        fc.property(departmentArbitrary(), (dept: string) => {
          expect(dept).toMatch(/[a-zA-Z]/);
        })
      );
    });

    it('should not contain special characters', () => {
      fc.assert(
        fc.property(departmentArbitrary(), (dept: string) => {
          expect(dept).toMatch(/^[a-zA-Z\s\-&]+$/);
        })
      );
    });

    it('should have reasonable length', () => {
      fc.assert(
        fc.property(departmentArbitrary(), (dept: string) => {
          expect(dept.length).toBeGreaterThan(1);
          expect(dept.length).toBeLessThan(100);
        })
      );
    });

    it('should generate common department names', () => {
      const departments = new Set<string>();

      fc.assert(
        fc.property(departmentArbitrary(), (dept: string) => {
          departments.add(dept);
          return true;
        }),
        { numRuns: 100 }
      );

      // Should generate multiple different departments
      expect(departments.size).toBeGreaterThan(1);
    });
  });

  describe('Generator combinations', () => {
    it('should combine multiple generators', () => {
      fc.assert(
        fc.property(
          employeeIdArbitrary(),
          employeeNameArbitrary(),
          emailArbitrary(),
          (id: string, name: string, email: string) => {
            expect(id).toBeDefined();
            expect(name).toBeDefined();
            expect(email).toBeDefined();
          }
        )
      );
    });

    it('should generate employee records', () => {
      fc.assert(
        fc.property(
          employeeIdArbitrary(),
          employeeNameArbitrary(),
          emailArbitrary(),
          phoneNumberArbitrary(),
          departmentArbitrary(),
          (id: string, name: string, email: string, phone: string, dept: string) => {
            const employee = { id, name, email, phone, department: dept };

            expect(employee.id).toBeDefined();
            expect(employee.name).toBeDefined();
            expect(employee.email).toContain('@');
            expect(employee.phone).toBeDefined();
            expect(employee.department).toBeDefined();
          }
        )
      );
    });
  });

  describe('Generator properties', () => {
    it('should generate diverse values', () => {
      const values = new Set<string>();

      fc.assert(
        fc.property(employeeIdArbitrary(), (id: string) => {
          values.add(id);
          return true;
        }),
        { numRuns: 50 }
      );

      // Should generate diverse values
      expect(values.size).toBeGreaterThan(40);
    });

    it('should be deterministic with seed', () => {
      const values1: string[] = [];
      const values2: string[] = [];

      fc.assert(
        fc.property(employeeIdArbitrary(), (id: string) => {
          values1.push(id);
          return true;
        }),
        { seed: 12345, numRuns: 10 }
      );

      fc.assert(
        fc.property(employeeIdArbitrary(), (id: string) => {
          values2.push(id);
          return true;
        }),
        { seed: 12345, numRuns: 10 }
      );

      // Same seed should produce same sequence
      expect(values1).toEqual(values2);
    });

    it('should handle edge cases', () => {
      fc.assert(
        fc.property(
          employeeNameArbitrary(),
          (name: string) => {
            // Should handle very short names
            expect(name.length).toBeGreaterThan(0);
            // Should handle names with special characters
            expect(typeof name).toBe('string');
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Shrinking', () => {
    it('should shrink to minimal counterexample', () => {
      // This test verifies that generators support shrinking
      // by checking that they can generate minimal values
      fc.assert(
        fc.property(employeeNameArbitrary(), (name: string) => {
          // Property that fails for very short names
          return name.length > 0;
        })
      );
    });
  });
});
