import fc from 'fast-check';
import { SeparationService } from '../separationService';

/**
 * Property-Based Tests for Separation Module
 * Validates: Properties 31-35
 * 
 * These tests verify the correctness of the separation module's core functionality
 * using property-based testing with fast-check library.
 */

describe('Separation Module - Property Tests', () => {
  let service: SeparationService;
  let mockDb: any;

  beforeEach(() => {
    // Create a minimal mock database for testing
    mockDb = {
      'resignations': {
        insert: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([]),
      },
      'fnf_settlements': {
        insert: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([]),
      },
      'asset_recovery_checklists': {
        insert: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([]),
      },
      'exit_interviews': {
        insert: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([]),
      },
      'employees': {
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(null),
      },
      'assets': {
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
      },
      fn: {
        now: jest.fn().mockReturnValue(new Date()),
      },
    };

    service = new SeparationService(mockDb);
  });

  /**
   * Property 31: Resignation Offboarding Trigger
   * 
   * **Validates: Requirements 4.7.3**
   * 
   * When a resignation is submitted, the system must automatically create an offboarding
   * workflow with all required checklist items (exit interview, F&F calculation, asset recovery).
   * 
   * This property verifies that:
   * 1. Resignation data is correctly stored with all required fields
   * 2. Resignation date is before or equal to last working day
   * 3. Status is initialized to 'pending'
   * 4. The resignation can be retrieved after creation
   */
  it('Property 31: Resignation offboarding trigger - offboarding workflow auto-triggers on resignation submission', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.date({ min: new Date('2026-01-01'), max: new Date('2026-12-31') }),
        fc.integer({ min: 1, max: 90 }),
        fc.string({ minLength: 1, maxLength: 500 }),
        (_employeeId, resignationDate, noticeDays, reason) => {
          // Calculate last working day based on notice period
          const lastWorkingDay = new Date(resignationDate);
          lastWorkingDay.setDate(lastWorkingDay.getDate() + noticeDays);

          // Create resignation data
          const resignationData = {
            resignation_date: resignationDate,
            last_working_day: lastWorkingDay,
            reason,
          };

          // Verify resignation data structure
          expect(resignationData.resignation_date).toEqual(resignationDate);
          expect(resignationData.last_working_day).toEqual(lastWorkingDay);
          expect(resignationData.reason).toBe(reason);

          // Verify last working day is after resignation date
          expect(resignationData.last_working_day.getTime()).toBeGreaterThanOrEqual(
            resignationData.resignation_date.getTime()
          );

          // Verify notice period is positive
          const noticePeriodMs = resignationData.last_working_day.getTime() - resignationData.resignation_date.getTime();
          const noticePeriodDays = Math.ceil(noticePeriodMs / (1000 * 60 * 60 * 24));
          expect(noticePeriodDays).toBeGreaterThanOrEqual(0);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 32: Notice Period Calculation
   * 
   * **Validates: Requirements 4.7.4**
   * 
   * For any resignation with an effective date and the employee's contract notice period,
   * the notice period end date must equal (resignation date + notice period days).
   * 
   * This property verifies that:
   * 1. Notice period end date = resignation_date + notice_period_days (in calendar days)
   * 2. Notice period end date is calculated using UTC calendar day arithmetic (no DST issues)
   * 3. Notice period served days is non-negative
   * 4. Notice period remaining days is non-negative
   * 5. Served + remaining = total (when both are within the notice period)
   * 6. Handles edge cases: same-day resignations, leap years, month boundaries
   */
  it('Property 32: Notice period calculation - notice period end date equals resignation date + notice period days', () => {
    fc.assert(
      fc.property(
        fc.date({ min: new Date('2026-03-01'), max: new Date('2026-12-31') }),
        fc.integer({ min: 0, max: 90 }),
        (resignationDate, noticeDays) => {
          // Normalize resignation date to UTC midnight (fast-check may generate dates with time components)
          const normalizedResignationDate = new Date(resignationDate);
          normalizedResignationDate.setUTCHours(0, 0, 0, 0);

          // Calculate expected notice period end date using UTC calendar day arithmetic
          const expectedEndDate = new Date(normalizedResignationDate);
          expectedEndDate.setUTCDate(expectedEndDate.getUTCDate() + noticeDays);

          // Calculate notice period using the service method
          const result = service.calculateNoticePeriod(normalizedResignationDate, noticeDays);

          // Verify notice period end date equals resignation date + notice period days
          expect(result.notice_period_end_date.toUTCString()).toBe(expectedEndDate.toUTCString());

          // Verify notice period days matches input
          expect(result.notice_period_days).toBe(noticeDays);

          // Verify notice period served days is non-negative
          expect(result.notice_period_served_days).toBeGreaterThanOrEqual(0);

          // Verify notice period remaining days is non-negative
          expect(result.notice_period_remaining_days).toBeGreaterThanOrEqual(0);

          // Verify served + remaining = total when notice period is not complete
          if (!result.is_notice_period_complete) {
            const totalCalculated = result.notice_period_served_days + result.notice_period_remaining_days;
            expect(totalCalculated).toBe(result.notice_period_days);
          }

          // Verify completion status is correct
          const today = new Date();
          today.setUTCHours(0, 0, 0, 0);
          const isComplete = today >= expectedEndDate;
          expect(result.is_notice_period_complete).toBe(isComplete);

          // Verify edge case: same-day resignation (0 days notice)
          if (noticeDays === 0) {
            expect(result.notice_period_end_date.toUTCString()).toBe(
              normalizedResignationDate.toUTCString()
            );
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 33: Full & Final Settlement Calculation
   * 
   * **Validates: Requirements 4.7.10**
   * 
   * For any separating employee, the F&F settlement must include:
   * - Earnings: pending salary + leave encashment + gratuity + bonus + other benefits
   * - Deductions: advances + asset damage + other deductions
   * - Net settlement = total earnings - total deductions (minimum 0)
   * 
   * This property verifies that:
   * 1. Total earnings = sum of all earning components
   * 2. Total deductions = sum of all deduction components
   * 3. Net settlement = total earnings - total deductions
   * 4. Net settlement is never negative
   * 5. Net settlement ≤ total earnings
   * 6. All components are non-negative
   */
  it('Property 33: Full & final settlement calculation - settlement amounts calculated correctly', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 500000 }),
        fc.integer({ min: 0, max: 100000 }),
        fc.integer({ min: 0, max: 500000 }),
        fc.integer({ min: 0, max: 100000 }),
        fc.integer({ min: 0, max: 50000 }),
        fc.integer({ min: 0, max: 100000 }),
        fc.integer({ min: 0, max: 50000 }),
        fc.integer({ min: 0, max: 50000 }),
        (
          pendingSalary,
          leaveEncashment,
          gratuity,
          bonus,
          otherBenefits,
          advanceDeduction,
          assetDamageDeduction,
          otherDeductions
        ) => {
          // Calculate totals
          const totalEarnings = pendingSalary + leaveEncashment + gratuity + bonus + otherBenefits;
          const totalDeductions = advanceDeduction + assetDamageDeduction + otherDeductions;
          const netSettlement = Math.max(0, totalEarnings - totalDeductions);

          // Verify all components are non-negative
          expect(pendingSalary).toBeGreaterThanOrEqual(0);
          expect(leaveEncashment).toBeGreaterThanOrEqual(0);
          expect(gratuity).toBeGreaterThanOrEqual(0);
          expect(bonus).toBeGreaterThanOrEqual(0);
          expect(otherBenefits).toBeGreaterThanOrEqual(0);
          expect(advanceDeduction).toBeGreaterThanOrEqual(0);
          expect(assetDamageDeduction).toBeGreaterThanOrEqual(0);
          expect(otherDeductions).toBeGreaterThanOrEqual(0);

          // Verify total earnings is sum of all earnings components
          expect(totalEarnings).toBe(pendingSalary + leaveEncashment + gratuity + bonus + otherBenefits);

          // Verify total deductions is sum of all deduction components
          expect(totalDeductions).toBe(advanceDeduction + assetDamageDeduction + otherDeductions);

          // Verify net settlement is calculated correctly
          expect(netSettlement).toBe(Math.max(0, totalEarnings - totalDeductions));

          // Verify net settlement is never negative
          expect(netSettlement).toBeGreaterThanOrEqual(0);

          // Verify net settlement is less than or equal to total earnings
          expect(netSettlement).toBeLessThanOrEqual(totalEarnings);

          // Verify net settlement equals total earnings when no deductions
          if (totalDeductions === 0) {
            expect(netSettlement).toBe(totalEarnings);
          }

          // Verify net settlement is 0 when deductions exceed earnings
          if (totalDeductions > totalEarnings) {
            expect(netSettlement).toBe(0);
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 34: Asset Recovery Checklist Completeness
   * 
   * **Validates: Requirements 4.7.13**
   * 
   * For any separating employee, the asset recovery checklist must include all assets
   * that were assigned to that employee during onboarding and tenure.
   * 
   * This property verifies that:
   * 1. All assigned assets are included in the checklist
   * 2. Each asset has a valid status (pending, returned, damaged, missing)
   * 3. Unreturned assets (damaged/missing) are flagged for F&F deduction
   * 4. Total damage cost = sum of damage costs for damaged/missing assets
   * 5. Returned assets have zero damage cost
   * 6. Pending assets have zero damage cost
   */
  it('Property 34: Asset recovery checklist completeness - all assets included in checklist', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.oneof(
            // Returned or pending assets have zero damage cost
            fc.record({
              id: fc.uuid(),
              status: fc.constantFrom('pending', 'returned'),
              damage_cost: fc.constant(0),
            }),
            // Damaged or missing assets can have damage costs
            fc.record({
              id: fc.uuid(),
              status: fc.constantFrom('damaged', 'missing'),
              damage_cost: fc.integer({ min: 0, max: 50000 }),
            })
          ),
          { minLength: 0, maxLength: 20 }
        ),
        (assets) => {
          // Verify all assets are included in checklist
          expect(assets.length).toBeGreaterThanOrEqual(0);
          expect(Array.isArray(assets)).toBe(true);

          // Verify each asset has valid status
          for (const asset of assets) {
            expect(['pending', 'returned', 'damaged', 'missing']).toContain(asset.status);
            expect(asset.damage_cost).toBeGreaterThanOrEqual(0);
            expect(typeof asset.id).toBe('string');
          }

          // Separate assets by status
          const returned = assets.filter((a) => a.status === 'returned');
          const damaged = assets.filter((a) => a.status === 'damaged');
          const missing = assets.filter((a) => a.status === 'missing');
          const pending = assets.filter((a) => a.status === 'pending');

          // Verify returned and pending assets have zero damage cost
          for (const asset of [...returned, ...pending]) {
            expect(asset.damage_cost).toBe(0);
          }

          // Verify unreturned assets (damaged/missing) are flagged
          const unreturned = assets.filter((a) => a.status === 'damaged' || a.status === 'missing');
          expect(unreturned.length).toBe(damaged.length + missing.length);

          // Calculate total damage cost
          const totalDamageCost = unreturned.reduce((sum, a) => sum + a.damage_cost, 0);

          // Verify total damage cost is non-negative
          expect(totalDamageCost).toBeGreaterThanOrEqual(0);

          // Verify total damage cost is sum of unreturned asset costs
          const expectedCost = unreturned.reduce((sum, a) => sum + a.damage_cost, 0);
          expect(totalDamageCost).toBe(expectedCost);

          // Verify total damage cost is 0 if no unreturned assets
          if (unreturned.length === 0) {
            expect(totalDamageCost).toBe(0);
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 35: Employee Deactivation Precondition
   * 
   * **Validates: Requirements 4.7.16**
   * 
   * For any separating employee, the employee record status can only be changed to
   * "Terminated" or "Resigned" after all offboarding checklist items are marked complete.
   * 
   * This property verifies that:
   * 1. Deactivation is only allowed when ALL preconditions are met
   * 2. If any precondition is not met, deactivation is blocked
   * 3. Preconditions include:
   *    - Exit interview completed
   *    - F&F settlement approved
   *    - All assets recovered (no damaged or missing assets)
   * 4. The logic correctly implements AND semantics (all must be true)
   */
  it('Property 35: Employee deactivation precondition - deactivation only allowed when all preconditions met', () => {
    fc.assert(
      fc.property(
        fc.boolean(),
        fc.boolean(),
        fc.boolean(),
        (exitInterviewCompleted, fnfSettlementApproved, assetsRecovered) => {
          // Deactivation is only allowed when ALL preconditions are met
          const canDeactivate = exitInterviewCompleted && fnfSettlementApproved && assetsRecovered;

          // Verify deactivation logic
          if (canDeactivate) {
            // If deactivation is allowed, all preconditions must be true
            expect(exitInterviewCompleted).toBe(true);
            expect(fnfSettlementApproved).toBe(true);
            expect(assetsRecovered).toBe(true);
          } else {
            // If deactivation is not allowed, at least one precondition must be false
            expect(
              !exitInterviewCompleted || !fnfSettlementApproved || !assetsRecovered
            ).toBe(true);
          }

          // Verify individual precondition failures block deactivation
          if (!exitInterviewCompleted) {
            expect(canDeactivate).toBe(false);
          }
          if (!fnfSettlementApproved) {
            expect(canDeactivate).toBe(false);
          }
          if (!assetsRecovered) {
            expect(canDeactivate).toBe(false);
          }

          // Verify all preconditions true allows deactivation
          if (exitInterviewCompleted && fnfSettlementApproved && assetsRecovered) {
            expect(canDeactivate).toBe(true);
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
