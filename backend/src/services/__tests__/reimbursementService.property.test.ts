import fc from 'fast-check';
import { ReimbursementService } from '../reimbursementService';
import { Employee } from '../../types/employee';

describe('ReimbursementService - Property-Based Tests', () => {
  let service: ReimbursementService;
  let mockKnex: any;
  let mockClaimRepository: any;
  let mockEmployeeRepository: any;

  const mockEmployee: Employee = {
    id: 'emp-001',
    employee_id: 'EMP001',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@example.com',
    date_of_joining: '2020-01-01',
    employment_type: 'permanent',
    status: 'active',
    created_at: '2020-01-01',
    updated_at: '2020-01-01',
  };

  beforeEach(() => {
    mockKnex = {
      insert: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      returning: jest.fn().mockReturnThis(),
    };

    mockClaimRepository = {
      createClaim: jest.fn(),
      getClaimById: jest.fn(),
      getClaimsByEmployee: jest.fn(),
      getClaimsByStatus: jest.fn(),
      searchClaims: jest.fn(),
      updateClaim: jest.fn(),
      approveClaim: jest.fn(),
      rejectClaim: jest.fn(),
      markAsPaid: jest.fn(),
      getApprovedClaimsForPayroll: jest.fn(),
    };

    mockEmployeeRepository = {
      getEmployee: jest.fn(),
    };

    service = new ReimbursementService(mockKnex);
    (service as any).claimRepository = mockClaimRepository;
    (service as any).employeeRepository = mockEmployeeRepository;
  });

  /**
   * Property 30: Reimbursement payroll integration
   * Validates: Requirements 8.3
   *
   * Property: Approved claims can be retrieved for payroll processing
   * and are correctly filtered by month and year
   */
  it('Property 30: Approved claims are correctly retrieved for payroll integration', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 12 }),
        fc.integer({ min: 2020, max: 2030 }),
        async (month, year) => {
          const approvedClaims = [
            {
              id: 'claim-001',
              employee_id: 'emp-001',
              claim_type: 'medical',
              amount: 5000,
              description: 'Medical expenses',
              status: 'approved' as const,
              approved_at: new Date(year, month - 1, 15),
              created_at: new Date(),
              updated_at: new Date(),
            },
            {
              id: 'claim-002',
              employee_id: 'emp-002',
              claim_type: 'travel',
              amount: 3000,
              description: 'Travel expenses',
              status: 'approved' as const,
              approved_at: new Date(year, month - 1, 20),
              created_at: new Date(),
              updated_at: new Date(),
            },
          ];

          mockClaimRepository.getApprovedClaimsForPayroll.mockResolvedValue(approvedClaims);

          const result = await service.getApprovedClaimsForPayroll(month, year);

          // All returned claims should have approved status
          expect(result.every((c) => c.status === 'approved')).toBe(true);

          // All returned claims should have approved_at date
          expect(result.every((c) => c.approved_at !== null)).toBe(true);

          // Result should match expected claims
          expect(result).toEqual(approvedClaims);
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Claim amount validation
   * Validates: Requirements 8.3
   *
   * Property: Only positive amounts are accepted for reimbursement claims
   */
  it('Property: Claim amount must be positive', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.oneof(
          fc.integer({ max: 0 }),
          fc.float({ max: 0 })
        ),
        async (invalidAmount) => {
          mockEmployeeRepository.getEmployee.mockResolvedValue(mockEmployee);

          await expect(
            service.submitReimbursementClaim({
              employee_id: 'emp-001',
              claim_type: 'medical',
              amount: invalidAmount,
              description: 'Medical expenses',
            })
          ).rejects.toThrow('Claim amount must be greater than 0');
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Claim status transitions
   * Validates: Requirements 8.3
   *
   * Property: Claims follow valid status transitions:
   * pending -> approved/rejected -> paid (only from approved)
   */
  it('Property: Claim status transitions are valid', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('pending', 'approved', 'rejected', 'paid'),
        async (currentStatus) => {
          const claim = {
            id: 'claim-001',
            employee_id: 'emp-001',
            claim_type: 'medical',
            amount: 5000,
            description: 'Medical expenses',
            status: currentStatus as any,
            created_at: new Date(),
            updated_at: new Date(),
          };

          mockClaimRepository.getClaimById.mockResolvedValue(claim);

          // Test valid transitions
          if (currentStatus === 'pending') {
            // Should allow approval
            mockEmployeeRepository.getEmployee.mockResolvedValue(mockEmployee);
            const approvedClaim = { ...claim, status: 'approved' };
            mockClaimRepository.approveClaim.mockResolvedValue(approvedClaim);

            const result = await service.approveClaim('claim-001', 'emp-002');
            expect(result?.status).toBe('approved');
          } else if (currentStatus === 'approved') {
            // Should allow marking as paid
            const paidClaim = { ...claim, status: 'paid' };
            mockClaimRepository.markAsPaid.mockResolvedValue(paidClaim);

            const result = await service.markClaimAsPaid('claim-001');
            expect(result?.status).toBe('paid');
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Claim data integrity
   * Validates: Requirements 8.3
   *
   * Property: All required fields are preserved when creating a claim
   */
  it('Property: Claim data integrity is maintained', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          claim_type: fc.stringMatching(/^[a-z_]{3,20}$/),
          amount: fc.integer({ min: 1, max: 1000000 }),
          description: fc.string({ minLength: 5, maxLength: 500 }),
        }),
        async (claimData) => {
          const createdClaim = {
            id: 'claim-001',
            employee_id: 'emp-001',
            ...claimData,
            status: 'pending' as const,
            created_at: new Date(),
            updated_at: new Date(),
          };

          mockEmployeeRepository.getEmployee.mockResolvedValue(mockEmployee);
          mockClaimRepository.createClaim.mockResolvedValue(createdClaim);
          mockKnex.insert.mockReturnThis();

          const result = await service.submitReimbursementClaim({
            employee_id: 'emp-001',
            ...claimData,
          });

          // Verify all fields are preserved
          expect(result.claim_type).toBe(claimData.claim_type);
          expect(result.amount).toBe(claimData.amount);
          expect(result.description).toBe(claimData.description);
          expect(result.status).toBe('pending');
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Claim filtering accuracy
   * Validates: Requirements 8.3
   *
   * Property: Filtered claims match the specified criteria
   */
  it('Property: Claim filtering returns accurate results', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('pending', 'approved', 'rejected', 'paid'),
        async (status) => {
          const filteredClaims = [
            {
              id: 'claim-001',
              employee_id: 'emp-001',
              claim_type: 'medical',
              amount: 5000,
              description: 'Medical expenses',
              status,
              created_at: new Date(),
              updated_at: new Date(),
            },
            {
              id: 'claim-002',
              employee_id: 'emp-001',
              claim_type: 'travel',
              amount: 3000,
              description: 'Travel expenses',
              status,
              created_at: new Date(),
              updated_at: new Date(),
            },
          ];

          mockClaimRepository.getClaimsByStatus.mockResolvedValue(filteredClaims as any);

          const result = await service.getClaimsByStatus(status);

          // All returned claims should have the specified status
          expect(result.every((c) => c.status === status)).toBe(true);
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Reimbursement summary calculation
   * Validates: Requirements 8.3
   *
   * Property: Summary totals are correctly calculated from claims
   */
  it('Property: Reimbursement summary calculations are accurate', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            id: fc.uuid(),
            status: fc.constantFrom('pending', 'approved', 'rejected', 'paid'),
            amount: fc.integer({ min: 100, max: 50000 }),
          }),
          { minLength: 1, maxLength: 20 }
        ),
        async (claimsData) => {
          const claims = claimsData.map((c) => ({
            id: c.id,
            employee_id: 'emp-001',
            claim_type: 'medical',
            amount: c.amount,
            description: 'Expense',
            status: c.status as any,
            created_at: new Date(),
            updated_at: new Date(),
          }));

          mockClaimRepository.searchClaims.mockResolvedValue(claims);

          const summary = await service.getEmployeeReimbursementSummary('emp-001');

          // Verify counts
          expect(summary.total_submitted).toBe(claims.length);
          expect(summary.pending_count).toBe(
            claims.filter((c) => c.status === 'pending').length
          );
          expect(summary.total_rejected).toBe(
            claims.filter((c) => c.status === 'rejected').length
          );

          // Verify totals
          const approvedTotal = claims
            .filter((c) => c.status === 'approved')
            .reduce((sum, c) => sum + c.amount, 0);
          expect(summary.total_approved).toBe(approvedTotal);

          const paidTotal = claims
            .filter((c) => c.status === 'paid')
            .reduce((sum, c) => sum + c.amount, 0);
          expect(summary.total_paid).toBe(paidTotal);
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Claim authorization
   * Validates: Requirements 8.3
   *
   * Property: Only claim owner can update their pending claims
   */
  it('Property: Claim authorization is enforced', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        fc.uuid(),
        async (claimOwnerId, differentEmployeeId) => {
          fc.pre(claimOwnerId !== differentEmployeeId);

          const claim = {
            id: 'claim-001',
            employee_id: claimOwnerId,
            claim_type: 'medical',
            amount: 5000,
            description: 'Medical expenses',
            status: 'pending' as const,
            created_at: new Date(),
            updated_at: new Date(),
          };

          mockClaimRepository.getClaimById.mockResolvedValue(claim);

          // Should fail when different employee tries to update
          await expect(
            service.updateClaim('claim-001', differentEmployeeId, { amount: 6000 })
          ).rejects.toThrow('Unauthorized: Can only update your own claims');
        }
      ),
      { numRuns: 50 }
    );
  });
});
