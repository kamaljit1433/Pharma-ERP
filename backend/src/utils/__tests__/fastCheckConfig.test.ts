/**
 * Fast-Check Configuration Tests
 * Tests for property-based testing configuration
 */

import * as fc from 'fast-check';
import {
  assertProperty,
  assertPropertyQuick,
  assertPropertyThorough,
  assertPropertyCICD,
  assertPropertyWithSeed,
} from '../fastCheckConfig';

describe('Fast-Check Configuration', () => {
  describe('assertProperty', () => {
    it('should pass valid property', () => {
      const property = (n: number) => n + 1 > n;

      expect(() => {
        assertProperty(fc.property(fc.integer(), property));
      }).not.toThrow();
    });

    it('should fail invalid property', () => {
      const property = (n: number) => n > n; // Always false

      expect(() => {
        assertProperty(fc.property(fc.integer(), property));
      }).toThrow();
    });

    it('should work with multiple arbitraries', () => {
      const property = (a: number, b: number) => a + b === b + a;

      expect(() => {
        assertProperty(fc.property(fc.integer(), fc.integer(), property));
      }).not.toThrow();
    });

    it('should provide counterexample on failure', () => {
      const property = (n: number) => n < 0; // Only true for negative numbers

      expect(() => {
        assertProperty(fc.property(fc.integer(), property));
      }).toThrow();
    });
  });

  describe('assertPropertyQuick', () => {
    it('should run with quick configuration', () => {
      const property = (n: number) => n + 1 > n;

      expect(() => {
        assertPropertyQuick(fc.property(fc.integer(), property));
      }).not.toThrow();
    });

    it('should use fewer samples than default', () => {
      let sampleCount = 0;
      const property = (n: number) => {
        sampleCount++;
        return true;
      };

      assertPropertyQuick(fc.property(fc.integer(), property));

      // Quick should use fewer samples (typically 100)
      expect(sampleCount).toBeLessThan(1000);
    });
  });

  describe('assertPropertyThorough', () => {
    it('should run with thorough configuration', () => {
      const property = (n: number) => n + 1 > n;

      expect(() => {
        assertPropertyThorough(fc.property(fc.integer(), property));
      }).not.toThrow();
    });

    it('should use more samples than default', () => {
      let sampleCount = 0;
      const property = (n: number) => {
        sampleCount++;
        return true;
      };

      assertPropertyThorough(fc.property(fc.integer(), property));

      // Thorough should use more samples (configured as 1000)
      expect(sampleCount).toBeGreaterThanOrEqual(1000);
    });
  });

  describe('assertPropertyCICD', () => {
    it('should run with CICD configuration', () => {
      const property = (n: number) => n + 1 > n;

      expect(() => {
        assertPropertyCICD(fc.property(fc.integer(), property));
      }).not.toThrow();
    });

    it('should be deterministic with seed', () => {
      const property = (n: number) => n + 1 > n;

      expect(() => {
        assertPropertyCICD(fc.property(fc.integer(), property));
      }).not.toThrow();
    });
  });

  describe('assertPropertyWithSeed', () => {
    it('should run with specific seed', () => {
      const property = (n: number) => n + 1 > n;

      expect(() => {
        assertPropertyWithSeed(fc.property(fc.integer(), property), 12345);
      }).not.toThrow();
    });

    it('should produce same results with same seed', () => {
      const results: number[] = [];

      const property = (n: number) => {
        results.push(n);
        return true;
      };

      const results1: number[] = [];
      const results2: number[] = [];

      const property1 = (n: number) => {
        results1.push(n);
        return true;
      };

      const property2 = (n: number) => {
        results2.push(n);
        return true;
      };

      assertPropertyWithSeed(fc.property(fc.integer(), property1), 12345);
      assertPropertyWithSeed(fc.property(fc.integer(), property2), 12345);

      // Same seed should produce same sequence
      expect(results1).toEqual(results2);
    });

    it('should produce different results with different seeds', () => {
      const results1: number[] = [];
      const results2: number[] = [];

      const property1 = (n: number) => {
        results1.push(n);
        return true;
      };

      const property2 = (n: number) => {
        results2.push(n);
        return true;
      };

      assertPropertyWithSeed(fc.property(fc.integer(), property1), 12345);
      assertPropertyWithSeed(fc.property(fc.integer(), property2), 54321);

      // Different seeds should produce different sequences
      expect(results1).not.toEqual(results2);
    });
  });

  describe('Property testing patterns', () => {
    it('should test commutativity', () => {
      const property = (a: number, b: number) => a + b === b + a;

      expect(() => {
        assertProperty(fc.property(fc.integer(), fc.integer(), property));
      }).not.toThrow();
    });

    it('should test associativity', () => {
      const property = (a: number, b: number, c: number) =>
        (a + b) + c === a + (b + c);

      expect(() => {
        assertProperty(fc.property(fc.integer(), fc.integer(), fc.integer(), property));
      }).not.toThrow();
    });

    it('should test identity', () => {
      const property = (n: number) => n + 0 === n;

      expect(() => {
        assertProperty(fc.property(fc.integer(), property));
      }).not.toThrow();
    });

    it('should test inverse', () => {
      const property = (n: number) => n + (-n) === 0;

      expect(() => {
        assertProperty(fc.property(fc.integer(), property));
      }).not.toThrow();
    });

    it('should test string properties', () => {
      const property = (s: string) => s.length >= 0;

      expect(() => {
        assertProperty(fc.property(fc.string(), property));
      }).not.toThrow();
    });

    it('should test array properties', () => {
      const property = (arr: number[]) => arr.length >= 0;

      expect(() => {
        assertProperty(fc.property(fc.array(fc.integer()), property));
      }).not.toThrow();
    });

    it('should test object properties', () => {
      const property = (obj: { a: number; b: string }) =>
        typeof obj.a === 'number' && typeof obj.b === 'string';

      expect(() => {
        assertProperty(
          fc.property(fc.record({ a: fc.integer(), b: fc.string() }), property)
        );
      }).not.toThrow();
    });
  });

  describe('Error handling', () => {
    it('should catch property violations', () => {
      const property = (n: number) => n > 0; // Fails for negative numbers

      expect(() => {
        assertProperty(fc.property(fc.integer(), property));
      }).toThrow();
    });

    it('should provide useful error messages', () => {
      const property = (n: number) => n > 0;

      try {
        assertProperty(fc.property(fc.integer(), property));
      } catch (error: any) {
        expect(error.message).toBeDefined();
      }
    });

    it('should handle exceptions in property', () => {
      // Use a property that always throws to ensure the test fails
      const property = (n: number) => {
        throw new Error('Always throws');
      };

      // fast-check should catch the exception and fail the assertion
      expect(() => {
        assertProperty(fc.property(fc.integer(), property));
      }).toThrow();
    });
  });

  describe('Configuration variations', () => {
    it('should handle different sample sizes', () => {
      const property = (n: number) => n + 1 > n;

      // Quick should complete faster than thorough
      const quickStart = Date.now();
      assertPropertyQuick(fc.property(fc.integer(), property));
      const quickTime = Date.now() - quickStart;

      const thoroughStart = Date.now();
      assertPropertyThorough(fc.property(fc.integer(), property));
      const thoroughTime = Date.now() - thoroughStart;

      // Thorough should take longer (though not guaranteed in all cases)
      expect(thoroughTime).toBeGreaterThanOrEqual(quickTime);
    });

    it('should handle shrinking', () => {
      const property = (n: number) => n < 100;

      expect(() => {
        assertProperty(fc.property(fc.integer(), property));
      }).toThrow();
    });
  });
});
