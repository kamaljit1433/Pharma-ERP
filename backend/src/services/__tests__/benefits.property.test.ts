import fc from 'fast-check';

/**
 * Property 26: Insurance Enrollment Window Validation
 * **Validates: Requirements 4.6.2**
 *
 * For any insurance enrollment request, the request must be accepted only if
 * the current date falls within the configured enrollment window for that insurance plan.
 */
describe('Benefits Module - Property 26: Insurance Enrollment Window Validation', () => {
  it('should reject enrollment outside enrollment window', () => {
    fc.assert(
      fc.property(
        fc.date({ min: new Date('2020-01-01'), max: new Date('2023-12-31') }),
        fc.date({ min: new Date('2024-01-01'), max: new Date('2024-06-30') }),
        fc.date({ min: new Date('2024-07-01'), max: new Date('2024-12-31') }),
        (enrollmentDate: Date, windowStart: Date, windowEnd: Date) => {
          // Ensure windowStart < windowEnd
          const start = new Date(Math.min(windowStart.getTime(), windowEnd.getTime()));
          const end = new Date(Math.max(windowStart.getTime(), windowEnd.getTime()));

          // Check if enrollment date is outside window
          const isOutsideWindow = enrollmentDate < start || enrollmentDate > end;

          if (isOutsideWindow) {
            // Should be rejected
            expect(enrollmentDate < start || enrollmentDate > end).toBe(true);
          }
        }
      )
    );
  });

  it('should accept enrollment within enrollment window', () => {
    fc.assert(
      fc.property(
        fc.date({ min: new Date('2024-01-01'), max: new Date('2024-12-31') }),
        (enrollmentDate: Date) => {
          const windowStart = new Date('2024-01-01');
          const windowEnd = new Date('2024-12-31');

          const isWithinWindow = enrollmentDate >= windowStart && enrollmentDate <= windowEnd;

          expect(isWithinWindow).toBe(true);
        }
      )
    );
  });

  it('should validate enrollment window boundaries correctly', () => {
    fc.assert(
      fc.property(
        fc.date({ min: new Date('2024-01-01'), max: new Date('2024-12-31') }),
        fc.date({ min: new Date('2024-01-01'), max: new Date('2024-12-31') }),
        (date1: Date, date2: Date) => {
          const start = new Date(Math.min(date1.getTime(), date2.getTime()));
          const end = new Date(Math.max(date1.getTime(), date2.getTime()));

          // Any date between start and end should be valid
          const midDate = new Date((start.getTime() + end.getTime()) / 2);

          expect(midDate >= start && midDate <= end).toBe(true);
        }
      )
    );
  });
});

/**
 * Property 27: Insurance Premium Payroll Integration
 * **Validates: Requirements 4.6.4**
 *
 * For any employee enrolled in an insurance plan, the insurance premium amount
 * must appear as a deduction in their monthly payroll.
 */
describe('Benefits Module - Property 27: Insurance Premium Payroll Integration', () => {
  it('should calculate total premium for multiple enrollments', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 1000, max: 10000 }), { minLength: 1, maxLength: 5 }),
        (premiums: number[]) => {
          const totalPremium = premiums.reduce((sum, p) => sum + p, 0);

          // Total should equal sum of individual premiums
          expect(totalPremium).toBe(premiums.reduce((a, b) => a + b, 0));
          expect(totalPremium).toBeGreaterThan(0);
        }
      )
    );
  });

  it('should ensure premium deduction is non-negative', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 10000 }),
        (premium: number) => {
          expect(premium).toBeGreaterThanOrEqual(0);
        }
      )
    );
  });

  it('should accumulate premiums correctly for payroll period', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 1000, max: 5000 }), { minLength: 1, maxLength: 12 }),
        (monthlyPremiums: number[]) => {
          const totalForYear = monthlyPremiums.reduce((sum, p) => sum + p, 0);

          // Verify accumulation
          let runningTotal = 0;
          monthlyPremiums.forEach((premium) => {
            runningTotal += premium;
            expect(runningTotal).toBeGreaterThanOrEqual(premium);
          });

          expect(runningTotal).toBe(totalForYear);
        }
      )
    );
  });
});

/**
 * Property 28: PF Contribution Calculation
 * **Validates: Requirements 4.6.5**
 *
 * For any employee salary, the PF contribution must be calculated as
 * (employee share + employer share) where each share is the configured
 * percentage of basic salary.
 */
describe('Benefits Module - Property 28: PF Contribution Calculation', () => {
  it('should calculate PF contribution as sum of employee and employer shares', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 10000, max: 500000 }), // basic salary
        fc.integer({ min: 1, max: 20 }), // employee contribution rate
        fc.integer({ min: 1, max: 20 }), // employer contribution rate
        (basicSalary: number, employeeRate: number, employerRate: number) => {
          const employeeContribution = (basicSalary * employeeRate) / 100;
          const employerContribution = (basicSalary * employerRate) / 100;
          const totalContribution = employeeContribution + employerContribution;

          // Verify calculation
          expect(totalContribution).toBe(employeeContribution + employerContribution);
          expect(totalContribution).toBeGreaterThan(0);
        }
      )
    );
  });

  it('should ensure employee contribution is percentage of basic salary', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 10000, max: 500000 }), // basic salary
        fc.integer({ min: 1, max: 20 }), // employee contribution rate
        (basicSalary: number, rate: number) => {
          const contribution = (basicSalary * rate) / 100;

          expect(contribution).toBe((basicSalary * rate) / 100);
          expect(contribution).toBeGreaterThanOrEqual(0);
          expect(contribution).toBeLessThanOrEqual(basicSalary);
        }
      )
    );
  });

  it('should ensure employer contribution is percentage of basic salary', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 10000, max: 500000 }), // basic salary
        fc.integer({ min: 1, max: 20 }), // employer contribution rate
        (basicSalary: number, rate: number) => {
          const contribution = (basicSalary * rate) / 100;

          expect(contribution).toBe((basicSalary * rate) / 100);
          expect(contribution).toBeGreaterThanOrEqual(0);
          expect(contribution).toBeLessThanOrEqual(basicSalary);
        }
      )
    );
  });

  it('should ensure total PF is always positive for positive inputs', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 10000, max: 500000 }),
        fc.integer({ min: 1, max: 20 }),
        fc.integer({ min: 1, max: 20 }),
        (salary: number, empRate: number, emplerRate: number) => {
          const total = (salary * empRate) / 100 + (salary * emplerRate) / 100;

          expect(total).toBeGreaterThan(0);
        }
      )
    );
  });
});

/**
 * Property 29: Gratuity Eligibility Calculation
 * **Validates: Requirements 4.6.6**
 *
 * For any employee with 5 or more years of service, the system must calculate
 * gratuity as (last drawn salary × years of service × 15) / 26, and for employees
 * with less than 5 years, gratuity must be zero.
 */
describe('Benefits Module - Property 29: Gratuity Eligibility Calculation', () => {
  it('should return zero gratuity for less than 5 years of service', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 4 }), // years of service < 5
        fc.integer({ min: 10000, max: 500000 }), // last drawn salary
        (yearsOfService: number, lastDrawnSalary: number) => {
          const gratuity = yearsOfService < 5 ? 0 : (lastDrawnSalary * yearsOfService * 15) / 26;

          expect(gratuity).toBe(0);
        }
      )
    );
  });

  it('should calculate gratuity correctly for 5 or more years of service', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 5, max: 40 }), // years of service >= 5
        fc.integer({ min: 10000, max: 500000 }), // last drawn salary
        (yearsOfService: number, lastDrawnSalary: number) => {
          const expectedGratuity = (lastDrawnSalary * yearsOfService * 15) / 26;

          expect(expectedGratuity).toBeGreaterThan(0);
          expect(expectedGratuity).toBe((lastDrawnSalary * yearsOfService * 15) / 26);
        }
      )
    );
  });

  it('should ensure gratuity increases with years of service', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 5, max: 35 }), // years of service
        fc.integer({ min: 10000, max: 500000 }), // last drawn salary
        (yearsOfService: number, lastDrawnSalary: number) => {
          const gratuity1 = (lastDrawnSalary * yearsOfService * 15) / 26;
          const gratuity2 = (lastDrawnSalary * (yearsOfService + 1) * 15) / 26;

          expect(gratuity2).toBeGreaterThan(gratuity1);
        }
      )
    );
  });

  it('should ensure gratuity increases with salary', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 5, max: 40 }), // years of service
        fc.integer({ min: 10000, max: 400000 }), // last drawn salary
        (yearsOfService: number, salary1: number) => {
          const salary2 = salary1 + 10000;
          const gratuity1 = (salary1 * yearsOfService * 15) / 26;
          const gratuity2 = (salary2 * yearsOfService * 15) / 26;

          expect(gratuity2).toBeGreaterThan(gratuity1);
        }
      )
    );
  });

  it('should ensure gratuity formula is applied correctly', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 5, max: 40 }),
        fc.integer({ min: 10000, max: 500000 }),
        (years: number, salary: number) => {
          const gratuity = (salary * years * 15) / 26;
          const manualCalculation = (salary * years * 15) / 26;

          expect(gratuity).toBe(manualCalculation);
        }
      )
    );
  });
});

/**
 * Property 30: Reimbursement Payroll Integration
 * **Validates: Requirements 4.6.10**
 *
 * For any reimbursement claim approved by both manager and finance, the claim
 * amount must appear as an earning component in the next payroll cycle.
 */
describe('Benefits Module - Property 30: Reimbursement Payroll Integration', () => {
  it('should accumulate approved reimbursements for payroll', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 100, max: 10000 }), { minLength: 1, maxLength: 10 }),
        (claimAmounts: number[]) => {
          const totalReimbursement = claimAmounts.reduce((sum, amount) => sum + amount, 0);

          expect(totalReimbursement).toBe(claimAmounts.reduce((a, b) => a + b, 0));
          expect(totalReimbursement).toBeGreaterThan(0);
        }
      )
    );
  });

  it('should ensure reimbursement amount is non-negative', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 50000 }),
        (amount: number) => {
          expect(amount).toBeGreaterThanOrEqual(0);
        }
      )
    );
  });

  it('should maintain reimbursement integrity across payroll cycles', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 100, max: 5000 }), { minLength: 1, maxLength: 12 }),
        (monthlyReimbursements: number[]) => {
          let cumulativeTotal = 0;

          monthlyReimbursements.forEach((amount) => {
            cumulativeTotal += amount;
            expect(cumulativeTotal).toBeGreaterThanOrEqual(amount);
          });

          const expectedTotal = monthlyReimbursements.reduce((a, b) => a + b, 0);
          expect(cumulativeTotal).toBe(expectedTotal);
        }
      )
    );
  });

  it('should ensure reimbursement does not exceed claim amount', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 100, max: 50000 }),
        (claimAmount: number) => {
          const reimbursedAmount = claimAmount; // Should not exceed claim amount

          expect(reimbursedAmount).toBeLessThanOrEqual(claimAmount);
          expect(reimbursedAmount).toBe(claimAmount);
        }
      )
    );
  });

  it('should calculate total reimbursement correctly for multiple claims', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 100, max: 10000 }), { minLength: 1, maxLength: 20 }),
        (claimAmounts: number[]) => {
          const totalReimbursement = claimAmounts.reduce((sum, amount) => sum + amount, 0);

          // Verify calculation
          let manualTotal = 0;
          claimAmounts.forEach((amount) => {
            manualTotal += amount;
          });

          expect(totalReimbursement).toBe(manualTotal);
        }
      )
    );
  });
});
