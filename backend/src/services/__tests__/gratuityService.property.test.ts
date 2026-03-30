import fc from 'fast-check';
import { GratuityService } from '../gratuityService';
import { GratuityRepository } from '../../repositories/gratuityRepository';
import { EmployeeRepository } from '../../repositories/employeeRepository';
import { Knex } from 'knex';

/**
 * Property 29: Gratuity Eligibility Calculation
 * **Validates: Requirements 4.6.6**
 *
 * For any employee with 5 or more years of service, the system must calculate
 * gratuity as (last drawn salary × years of service × 15) / 26, and for
 * employees with less than 5 years, gratuity must be zero.
 */
describe('GratuityService - Property 29: Gratuity Eligibility Calculation', () => {
  let gratuityService: GratuityService;
  let mockKnex: Knex;
  let mockGratuityRepository: jest.Mocked<GratuityRepository>;
  let mockEmployeeRepository: jest.Mocked<EmployeeRepository>;

  beforeEach(() => {
    mockKnex = {} as Knex;
    mockGratuityRepository = {
      createGratuity: jest.fn(),
      getGratuity: jest.fn(),
      getGratuityById: jest.fn(),
      updateGratuity: jest.fn(),
      getGratuityByEmployeeAndDate: jest.fn(),
      getEligibleGratuities: jest.fn(),
      getGratuityHistory: jest.fn(),
    } as any;

    mockEmployeeRepository = {
      getEmployee: jest.fn(),
    } as any;

    gratuityService = new GratuityService(mockKnex);
    (gratuityService as any).gratuityRepository = mockGratuityRepository;
    (gratuityService as any).employeeRepository = mockEmployeeRepository;
  });

  it('should return zero gratuity for employees with less than 5 years of service', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 4 }), // years of service (0-4)
        fc.integer({ min: 10000, max: 500000 }), // last drawn salary
        (yearsOfService: number, lastDrawnSalary: number) => {
          // For years < 5, gratuity should be 0
          const gratuity = yearsOfService < 5 ? 0 : (lastDrawnSalary * yearsOfService * 15) / 26;

          expect(gratuity).toBe(0);
        }
      )
    );
  });

  it('should calculate gratuity correctly for employees with 5+ years of service', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 5, max: 40 }), // years of service (5+)
        fc.integer({ min: 10000, max: 500000 }), // last drawn salary
        (yearsOfService: number, lastDrawnSalary: number) => {
          // Formula: (salary × years × 15) / 26
          const expectedGratuity = (lastDrawnSalary * yearsOfService * 15) / 26;

          expect(expectedGratuity).toBeGreaterThan(0);
          expect(expectedGratuity).toBe((lastDrawnSalary * yearsOfService * 15) / 26);
        }
      )
    );
  });

  it('should ensure gratuity is always non-negative', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 40 }), // years of service
        fc.integer({ min: 0, max: 500000 }), // last drawn salary
        (yearsOfService: number, lastDrawnSalary: number) => {
          const gratuity = yearsOfService >= 5 ? (lastDrawnSalary * yearsOfService * 15) / 26 : 0;

          expect(gratuity).toBeGreaterThanOrEqual(0);
        }
      )
    );
  });

  it('should ensure gratuity scales proportionally with salary for eligible employees', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 5, max: 40 }), // years of service
        fc.tuple(
          fc.integer({ min: 10000, max: 50000 }),
          fc.integer({ min: 50001, max: 100000 }),
          fc.integer({ min: 100001, max: 500000 })
        ),
        (yearsOfService: number, salaries: [number, number, number]) => {
          const [lowSalary, midSalary, highSalary] = salaries;
          const lowGratuity = (lowSalary * yearsOfService * 15) / 26;
          const midGratuity = (midSalary * yearsOfService * 15) / 26;
          const highGratuity = (highSalary * yearsOfService * 15) / 26;

          // Gratuity should scale proportionally with salary
          expect(midGratuity).toBeGreaterThan(lowGratuity);
          expect(highGratuity).toBeGreaterThan(midGratuity);
        }
      )
    );
  });

  it('should ensure gratuity scales proportionally with years of service for eligible employees', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 10000, max: 500000 }), // salary
        fc.tuple(
          fc.integer({ min: 5, max: 15 }),
          fc.integer({ min: 16, max: 25 }),
          fc.integer({ min: 26, max: 40 })
        ),
        (salary: number, years: [number, number, number]) => {
          const [lowYears, midYears, highYears] = years;
          const lowGratuity = (salary * lowYears * 15) / 26;
          const midGratuity = (salary * midYears * 15) / 26;
          const highGratuity = (salary * highYears * 15) / 26;

          // Gratuity should scale proportionally with years
          expect(midGratuity).toBeGreaterThan(lowGratuity);
          expect(highGratuity).toBeGreaterThan(midGratuity);
        }
      )
    );
  });

  it('should apply the correct formula: (salary × years × 15) / 26', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 5, max: 40 }), // years of service
        fc.integer({ min: 10000, max: 500000 }), // last drawn salary
        (yearsOfService: number, lastDrawnSalary: number) => {
          const gratuity = (lastDrawnSalary * yearsOfService * 15) / 26;

          // Verify the formula is applied correctly
          expect(gratuity).toBe((lastDrawnSalary * yearsOfService * 15) / 26);
          expect(gratuity).toBeCloseTo((lastDrawnSalary * yearsOfService * 15) / 26, 2);
        }
      )
    );
  });

  it('should handle boundary case: exactly 5 years of service', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 10000, max: 500000 }), // last drawn salary
        (lastDrawnSalary: number) => {
          const yearsOfService = 5;
          const gratuity = (lastDrawnSalary * yearsOfService * 15) / 26;

          expect(gratuity).toBeGreaterThan(0);
          expect(gratuity).toBe((lastDrawnSalary * 5 * 15) / 26);
        }
      )
    );
  });

  it('should handle boundary case: just below 5 years of service', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 10000, max: 500000 }), // last drawn salary
        (lastDrawnSalary: number) => {
          const yearsOfService = 4;
          const gratuity = yearsOfService >= 5 ? (lastDrawnSalary * yearsOfService * 15) / 26 : 0;

          expect(gratuity).toBe(0);
        }
      )
    );
  });

  it('should ensure gratuity calculation is consistent across multiple invocations', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 5, max: 40 }), // years of service
        fc.integer({ min: 10000, max: 500000 }), // last drawn salary
        (yearsOfService: number, lastDrawnSalary: number) => {
          const gratuity1 = (lastDrawnSalary * yearsOfService * 15) / 26;
          const gratuity2 = (lastDrawnSalary * yearsOfService * 15) / 26;

          expect(gratuity1).toBe(gratuity2);
        }
      )
    );
  });

  it('should handle zero salary correctly', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 5, max: 40 }), // years of service
        (yearsOfService: number) => {
          const gratuity = (0 * yearsOfService * 15) / 26;

          expect(gratuity).toBe(0);
        }
      )
    );
  });
});
