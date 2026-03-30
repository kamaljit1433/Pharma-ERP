import { InsuranceService } from '../../services/insuranceService';
import fc from 'fast-check';
import { Knex } from 'knex';

describe('InsuranceService - Property-Based Tests', () => {
  let insuranceService: InsuranceService;
  let mockDb: jest.Mocked<Knex>;

  beforeEach(() => {
    mockDb = {} as jest.Mocked<Knex>;
    insuranceService = new InsuranceService(mockDb);
  });

  /**
   * **Validates: Requirements 3.6 - Insurance enrollment with window validation**
   *
   * Property: Enrollment window validation is consistent
   * - If enrollment date is within [start, end], validation should pass
   * - If enrollment date is before start or after end, validation should fail
   * - Boundary dates (start and end) should be valid
   */
  it('Property 26: Enrollment window validation consistency', () => {
    fc.assert(
      fc.property(
        fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
        fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
        (startDate, endDate) => {
          // Ensure start <= end
          const start = startDate <= endDate ? startDate : endDate;
          const end = startDate <= endDate ? endDate : startDate;

          // Test 1: Enrollment on start date should be valid
          const resultOnStart = insuranceService.validateEnrollmentWindow(start, start, end);
          expect(resultOnStart.isValid).toBe(true);

          // Test 2: Enrollment on end date should be valid
          const resultOnEnd = insuranceService.validateEnrollmentWindow(end, start, end);
          expect(resultOnEnd.isValid).toBe(true);

          // Test 3: Enrollment between start and end should be valid
          if (start < end) {
            const midDate = new Date((start.getTime() + end.getTime()) / 2);
            const resultMid = insuranceService.validateEnrollmentWindow(midDate, start, end);
            expect(resultMid.isValid).toBe(true);
          }

          // Test 4: Enrollment before start should be invalid
          const beforeStart = new Date(start.getTime() - 86400000); // 1 day before
          const resultBefore = insuranceService.validateEnrollmentWindow(beforeStart, start, end);
          expect(resultBefore.isValid).toBe(false);

          // Test 5: Enrollment after end should be invalid
          const afterEnd = new Date(end.getTime() + 86400000); // 1 day after
          const resultAfter = insuranceService.validateEnrollmentWindow(afterEnd, start, end);
          expect(resultAfter.isValid).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Validates: Requirements 3.6 - Insurance premium payroll integration**
   *
   * Property: Premium deduction calculation is non-negative
   * - Premium deduction should never be negative
   * - Premium deduction should be deterministic for same inputs
   */
  it('Property 27: Premium deduction is non-negative', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            planId: fc.uuid(),
            premium: fc.integer({ min: 100, max: 50000 }),
            effectiveFrom: fc.date({ min: new Date('2026-01-01'), max: new Date('2026-12-31') }),
            effectiveTo: fc.option(
              fc.date({ min: new Date('2026-01-01'), max: new Date('2026-12-31') })
            ),
          }),
          { minLength: 0, maxLength: 5 }
        ),
        async (enrollmentConfigs) => {
          const employeeId = 'emp-test';
          const month = 6;
          const year = 2026;

          // Build mock enrollments - ensure unique plan IDs
          const uniquePlanIds = new Set<string>();
          const mockEnrollments = enrollmentConfigs
            .filter((config) => {
              if (uniquePlanIds.has(config.planId)) {
                return false;
              }
              uniquePlanIds.add(config.planId);
              return true;
            })
            .map((config, index) => ({
              id: `enroll-${index}`,
              employee_id: employeeId,
              insurance_plan_id: config.planId,
              status: 'active' as const,
              effective_from: config.effectiveFrom,
              effective_to: config.effectiveTo,
            }));

          // Build mock plans
          const mockPlans = Array.from(uniquePlanIds).map((planId) => {
            const config = enrollmentConfigs.find((c) => c.planId === planId)!;
            return {
              id: planId,
              premium_amount: config.premium,
            };
          });

          const mockGetEnrollments = jest.fn().mockResolvedValue(mockEnrollments);
          let planIndex = 0;
          const mockGetPlan = jest.fn().mockImplementation(() => {
            const plan = mockPlans[planIndex];
            planIndex++;
            return Promise.resolve(plan);
          });

          (insuranceService as any).insuranceEnrollmentRepository = {
            getActiveEmployeeEnrollments: mockGetEnrollments,
          };

          (insuranceService as any).insurancePlanRepository = {
            getInsurancePlanById: mockGetPlan,
          };

          const result = await insuranceService.calculatePremiumDeduction(employeeId, month, year);

          // Property: Premium deduction should be non-negative
          expect(result).toBeGreaterThanOrEqual(0);

          // Property: Premium deduction should be deterministic
          planIndex = 0;
          const result2 = await insuranceService.calculatePremiumDeduction(employeeId, month, year);
          expect(result).toBe(result2);
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * **Validates: Requirements 3.6 - Insurance enrollment window validation**
   *
   * Property: Enrollment window validation is reflexive
   * - If a date is within a window, it should always be within that window
   * - Validation result should be deterministic
   */
  it('Property 28: Enrollment window validation determinism', () => {
    fc.assert(
      fc.property(
        fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
        fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
        fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
        (enrollmentDate, startDate, endDate) => {
          // Ensure start <= end
          const start = startDate <= endDate ? startDate : endDate;
          const end = startDate <= endDate ? endDate : startDate;

          // Call validation multiple times
          const result1 = insuranceService.validateEnrollmentWindow(enrollmentDate, start, end);
          const result2 = insuranceService.validateEnrollmentWindow(enrollmentDate, start, end);
          const result3 = insuranceService.validateEnrollmentWindow(enrollmentDate, start, end);

          // Results should be identical
          expect(result1.isValid).toBe(result2.isValid);
          expect(result2.isValid).toBe(result3.isValid);

          if (result1.reason) {
            expect(result1.reason).toBe(result2.reason);
            expect(result2.reason).toBe(result3.reason);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Validates: Requirements 3.6 - Insurance enrollment boundary conditions**
   *
   * Property: Enrollment window boundaries are inclusive
   * - Enrollment on start date should be valid
   * - Enrollment on end date should be valid
   * - Enrollment one millisecond before start should be invalid
   * - Enrollment one millisecond after end should be invalid
   */
  it('Property 29: Enrollment window boundary inclusivity', () => {
    fc.assert(
      fc.property(
        fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
        fc.integer({ min: 1, max: 365 * 24 * 60 * 60 * 1000 }), // Up to 1 year in milliseconds
        (startDate, windowDuration) => {
          const start = new Date(startDate);
          const end = new Date(start.getTime() + windowDuration);

          // Boundary 1: Start date is valid
          const resultStart = insuranceService.validateEnrollmentWindow(start, start, end);
          expect(resultStart.isValid).toBe(true);

          // Boundary 2: End date is valid
          const resultEnd = insuranceService.validateEnrollmentWindow(end, start, end);
          expect(resultEnd.isValid).toBe(true);

          // Boundary 3: One millisecond before start is invalid
          const beforeStart = new Date(start.getTime() - 1);
          const resultBefore = insuranceService.validateEnrollmentWindow(beforeStart, start, end);
          expect(resultBefore.isValid).toBe(false);

          // Boundary 4: One millisecond after end is invalid
          const afterEnd = new Date(end.getTime() + 1);
          const resultAfter = insuranceService.validateEnrollmentWindow(afterEnd, start, end);
          expect(resultAfter.isValid).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Validates: Requirements 3.6 - Insurance premium calculation accuracy**
   *
   * Property: Premium calculation is consistent
   * - Same inputs should always produce same output
   * - Premium should never be negative
   */
  it('Property 30: Premium calculation consistency', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 12 }),
        fc.integer({ min: 2026, max: 2030 }),
        async (targetMonth, targetYear) => {
          const employeeId = 'emp-test';

          // Create test enrollments
          const mockEnrollments = [
            {
              id: 'enroll-1',
              employee_id: employeeId,
              insurance_plan_id: 'plan-1',
              status: 'active' as const,
              effective_from: new Date(2026, 0, 1),
              effective_to: undefined,
            },
            {
              id: 'enroll-2',
              employee_id: employeeId,
              insurance_plan_id: 'plan-2',
              status: 'active' as const,
              effective_from: new Date(2026, 5, 1),
              effective_to: undefined,
            },
          ];

          const mockPlans = [
            { id: 'plan-1', premium_amount: 5000 },
            { id: 'plan-2', premium_amount: 3000 },
          ];

          const mockGetEnrollments = jest.fn().mockResolvedValue(mockEnrollments);
          let planIndex = 0;
          const mockGetPlan = jest.fn().mockImplementation(() => {
            const plan = mockPlans[planIndex];
            planIndex++;
            return Promise.resolve(plan);
          });

          (insuranceService as any).insuranceEnrollmentRepository = {
            getActiveEmployeeEnrollments: mockGetEnrollments,
          };

          (insuranceService as any).insurancePlanRepository = {
            getInsurancePlanById: mockGetPlan,
          };

          const result1 = await insuranceService.calculatePremiumDeduction(
            employeeId,
            targetMonth,
            targetYear
          );

          // Reset plan index for second call
          planIndex = 0;
          const result2 = await insuranceService.calculatePremiumDeduction(
            employeeId,
            targetMonth,
            targetYear
          );

          // Property 1: Results should be consistent
          expect(result1).toBe(result2);

          // Property 2: Result should be non-negative
          expect(result1).toBeGreaterThanOrEqual(0);
        }
      ),
      { numRuns: 50 }
    );
  });
});
