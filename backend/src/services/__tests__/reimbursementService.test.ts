import { ReimbursementService } from '../reimbursementService';
import { Employee } from '../../types/employee';

describe('ReimbursementService', () => {
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

  const mockClaim = {
    id: 'claim-001',
    employee_id: 'emp-001',
    claim_type: 'medical',
    amount: 5000,
    description: 'Medical expenses',
    receipt_url: 'https://example.com/receipt.pdf',
    status: 'pending' as const,
    created_at: new Date(),
    updated_at: new Date(),
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

  describe('submitReimbursementClaim', () => {
    it('should create a new reimbursement claim', async () => {
      mockEmployeeRepository.getEmployee.mockResolvedValue(mockEmployee);
      mockClaimRepository.createClaim.mockResolvedValue(mockClaim);
      mockKnex.insert.mockReturnThis();

      const result = await service.submitReimbursementClaim({
        employee_id: 'emp-001',
        claim_type: 'medical',
        amount: 5000,
        description: 'Medical expenses',
        receipt_url: 'https://example.com/receipt.pdf',
      });

      expect(result).toEqual(mockClaim);
      expect(mockEmployeeRepository.getEmployee).toHaveBeenCalledWith('emp-001');
      expect(mockClaimRepository.createClaim).toHaveBeenCalled();
    });

    it('should throw error if employee not found', async () => {
      mockEmployeeRepository.getEmployee.mockResolvedValue(null);

      await expect(
        service.submitReimbursementClaim({
          employee_id: 'invalid-emp',
          claim_type: 'medical',
          amount: 5000,
          description: 'Medical expenses',
        })
      ).rejects.toThrow('Employee invalid-emp not found');
    });

    it('should throw error if amount is invalid', async () => {
      mockEmployeeRepository.getEmployee.mockResolvedValue(mockEmployee);

      await expect(
        service.submitReimbursementClaim({
          employee_id: 'emp-001',
          claim_type: 'medical',
          amount: -100,
          description: 'Medical expenses',
        })
      ).rejects.toThrow('Claim amount must be greater than 0');
    });

    it('should throw error if claim type is empty', async () => {
      mockEmployeeRepository.getEmployee.mockResolvedValue(mockEmployee);

      await expect(
        service.submitReimbursementClaim({
          employee_id: 'emp-001',
          claim_type: '',
          amount: 5000,
          description: 'Medical expenses',
        })
      ).rejects.toThrow('Claim type is required');
    });

    it('should throw error if description is empty', async () => {
      mockEmployeeRepository.getEmployee.mockResolvedValue(mockEmployee);

      await expect(
        service.submitReimbursementClaim({
          employee_id: 'emp-001',
          claim_type: 'medical',
          amount: 5000,
          description: '',
        })
      ).rejects.toThrow('Description is required');
    });
  });

  describe('getClaimById', () => {
    it('should return claim by id', async () => {
      mockClaimRepository.getClaimById.mockResolvedValue(mockClaim);

      const result = await service.getClaimById('claim-001');

      expect(result).toEqual(mockClaim);
      expect(mockClaimRepository.getClaimById).toHaveBeenCalledWith('claim-001');
    });

    it('should return null if claim not found', async () => {
      mockClaimRepository.getClaimById.mockResolvedValue(null);

      const result = await service.getClaimById('invalid-claim');

      expect(result).toBeNull();
    });
  });

  describe('getEmployeeClaims', () => {
    it('should return all claims for employee', async () => {
      const claims = [mockClaim, { ...mockClaim, id: 'claim-002' }];
      mockClaimRepository.getClaimsByEmployee.mockResolvedValue(claims);

      const result = await service.getEmployeeClaims('emp-001');

      expect(result).toEqual(claims);
      expect(mockClaimRepository.getClaimsByEmployee).toHaveBeenCalledWith('emp-001');
    });
  });

  describe('approveClaim', () => {
    it('should approve a pending claim', async () => {
      const approvedClaim = { ...mockClaim, status: 'approved' as const };
      mockClaimRepository.getClaimById.mockResolvedValue(mockClaim);
      mockEmployeeRepository.getEmployee.mockResolvedValue(mockEmployee);
      mockClaimRepository.approveClaim.mockResolvedValue(approvedClaim);
      mockKnex.insert.mockReturnThis();

      const result = await service.approveClaim('claim-001', 'emp-002', 'Approved');

      expect(result).toEqual(approvedClaim);
      expect(mockClaimRepository.approveClaim).toHaveBeenCalledWith(
        'claim-001',
        'emp-002',
        'Approved'
      );
    });

    it('should throw error if claim not found', async () => {
      mockClaimRepository.getClaimById.mockResolvedValue(null);

      await expect(service.approveClaim('invalid-claim', 'emp-002')).rejects.toThrow(
        'Claim invalid-claim not found'
      );
    });

    it('should throw error if claim is not pending', async () => {
      const approvedClaim = { ...mockClaim, status: 'approved' as const };
      mockClaimRepository.getClaimById.mockResolvedValue(approvedClaim);

      await expect(service.approveClaim('claim-001', 'emp-002')).rejects.toThrow(
        'Cannot approve claim with status approved'
      );
    });

    it('should throw error if approver not found', async () => {
      mockClaimRepository.getClaimById.mockResolvedValue(mockClaim);
      mockEmployeeRepository.getEmployee.mockResolvedValue(null);

      await expect(service.approveClaim('claim-001', 'invalid-emp')).rejects.toThrow(
        'Approver invalid-emp not found'
      );
    });
  });

  describe('rejectClaim', () => {
    it('should reject a pending claim', async () => {
      const rejectedClaim = { ...mockClaim, status: 'rejected' as const };
      mockClaimRepository.getClaimById.mockResolvedValue(mockClaim);
      mockClaimRepository.rejectClaim.mockResolvedValue(rejectedClaim);
      mockKnex.insert.mockReturnThis();

      const result = await service.rejectClaim('claim-001', 'emp-002', 'Invalid receipt');

      expect(result).toEqual(rejectedClaim);
      expect(mockClaimRepository.rejectClaim).toHaveBeenCalledWith(
        'claim-001',
        'emp-002',
        'Invalid receipt'
      );
    });

    it('should throw error if rejection notes are empty', async () => {
      mockClaimRepository.getClaimById.mockResolvedValue(mockClaim);

      await expect(service.rejectClaim('claim-001', 'emp-002', '')).rejects.toThrow(
        'Rejection notes are required'
      );
    });

    it('should throw error if claim is not pending', async () => {
      const approvedClaim = { ...mockClaim, status: 'approved' as const };
      mockClaimRepository.getClaimById.mockResolvedValue(approvedClaim);

      await expect(
        service.rejectClaim('claim-001', 'emp-002', 'Invalid receipt')
      ).rejects.toThrow('Cannot reject claim with status approved');
    });
  });

  describe('updateClaim', () => {
    it('should update a pending claim', async () => {
      const updatedClaim = { ...mockClaim, amount: 6000 };
      mockClaimRepository.getClaimById.mockResolvedValue(mockClaim);
      mockClaimRepository.updateClaim.mockResolvedValue(updatedClaim);
      mockKnex.insert.mockReturnThis();

      const result = await service.updateClaim('claim-001', 'emp-001', { amount: 6000 });

      expect(result).toEqual(updatedClaim);
      expect(mockClaimRepository.updateClaim).toHaveBeenCalledWith('claim-001', {
        amount: 6000,
      });
    });

    it('should throw error if claim not found', async () => {
      mockClaimRepository.getClaimById.mockResolvedValue(null);

      await expect(
        service.updateClaim('invalid-claim', 'emp-001', { amount: 6000 })
      ).rejects.toThrow('Claim invalid-claim not found');
    });

    it('should throw error if claim is not pending', async () => {
      const approvedClaim = { ...mockClaim, status: 'approved' as const };
      mockClaimRepository.getClaimById.mockResolvedValue(approvedClaim);

      await expect(
        service.updateClaim('claim-001', 'emp-001', { amount: 6000 })
      ).rejects.toThrow('Cannot update claim with status approved');
    });

    it('should throw error if employee is not the claim owner', async () => {
      mockClaimRepository.getClaimById.mockResolvedValue(mockClaim);

      await expect(
        service.updateClaim('claim-001', 'emp-002', { amount: 6000 })
      ).rejects.toThrow('Unauthorized: Can only update your own claims');
    });

    it('should throw error if amount is invalid', async () => {
      mockClaimRepository.getClaimById.mockResolvedValue(mockClaim);

      await expect(
        service.updateClaim('claim-001', 'emp-001', { amount: -100 })
      ).rejects.toThrow('Claim amount must be greater than 0');
    });
  });

  describe('markClaimAsPaid', () => {
    it('should mark approved claim as paid', async () => {
      const approvedClaim = { ...mockClaim, status: 'approved' as const };
      const paidClaim = { ...approvedClaim, status: 'paid' as const };
      mockClaimRepository.getClaimById.mockResolvedValue(approvedClaim);
      mockClaimRepository.markAsPaid.mockResolvedValue(paidClaim);
      mockKnex.insert.mockReturnThis();

      const result = await service.markClaimAsPaid('claim-001');

      expect(result).toEqual(paidClaim);
      expect(mockClaimRepository.markAsPaid).toHaveBeenCalledWith('claim-001');
    });

    it('should throw error if claim is not approved', async () => {
      mockClaimRepository.getClaimById.mockResolvedValue(mockClaim);

      await expect(service.markClaimAsPaid('claim-001')).rejects.toThrow(
        'Cannot mark claim as paid with status pending'
      );
    });
  });

  describe('getEmployeeReimbursementSummary', () => {
    it('should return reimbursement summary for employee', async () => {
      const claims = [
        mockClaim,
        { ...mockClaim, id: 'claim-002', status: 'approved' as const, amount: 3000 },
        { ...mockClaim, id: 'claim-003', status: 'rejected' as const },
        { ...mockClaim, id: 'claim-004', status: 'paid' as const, amount: 2000 },
      ];
      mockClaimRepository.searchClaims.mockResolvedValue(claims);

      const result = await service.getEmployeeReimbursementSummary('emp-001');

      expect(result.total_submitted).toBe(4);
      expect(result.total_approved).toBe(3000);
      expect(result.total_rejected).toBe(1);
      expect(result.total_paid).toBe(2000);
      expect(result.pending_count).toBe(1);
    });
  });

  describe('getApprovedClaimsForPayroll', () => {
    it('should return approved claims for payroll', async () => {
      const approvedClaims = [
        { ...mockClaim, status: 'approved' as const },
        { ...mockClaim, id: 'claim-002', status: 'approved' as const },
      ];
      mockClaimRepository.getApprovedClaimsForPayroll.mockResolvedValue(approvedClaims);

      const result = await service.getApprovedClaimsForPayroll(3, 2024);

      expect(result).toEqual(approvedClaims);
      expect(mockClaimRepository.getApprovedClaimsForPayroll).toHaveBeenCalledWith(3, 2024);
    });
  });
});
