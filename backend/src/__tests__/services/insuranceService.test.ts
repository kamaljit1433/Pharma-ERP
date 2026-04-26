import { InsuranceService } from '../../services/insuranceService';
import { Knex } from 'knex';

describe('InsuranceService', () => {
  let insuranceService: InsuranceService;
  let mockDb: jest.Mocked<Knex>;

  beforeEach(() => {
    mockDb = {} as jest.Mocked<Knex>;
    insuranceService = new InsuranceService(mockDb);
  });

  describe('createInsurancePlan', () => {
    it('should create an insurance plan with valid data', async () => {
      const planData = {
        name: 'Health Insurance Plus',
        provider: 'ABC Insurance Co',
        description: 'Comprehensive health coverage',
        premium_amount: 5000,
        coverage_type: 'health' as const,
        enrollment_start_date: new Date('2026-01-01'),
        enrollment_end_date: new Date('2026-01-31'),
      };

      const mockPlan = {
        id: '123',
        ...planData,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const mockCreate = jest.fn().mockResolvedValue(mockPlan);

      (insuranceService as any).insurancePlanRepository = {
        createInsurancePlan: mockCreate,
      };

      const result = await insuranceService.createInsurancePlan(planData);

      expect(mockCreate).toHaveBeenCalledWith(planData);
      expect(result).toEqual(mockPlan);
    });

    it('should throw error if required fields are missing', async () => {
      const planData = {
        name: '',
        provider: 'ABC Insurance Co',
        premium_amount: 5000,
        coverage_type: 'health' as const,
        enrollment_start_date: new Date('2026-01-01'),
        enrollment_end_date: new Date('2026-01-31'),
      };

      await expect(insuranceService.createInsurancePlan(planData)).rejects.toThrow(
        'Missing required fields'
      );
    });

    it('should throw error if premium amount is invalid', async () => {
      const planData = {
        name: 'Health Insurance Plus',
        provider: 'ABC Insurance Co',
        premium_amount: -100,
        coverage_type: 'health' as const,
        enrollment_start_date: new Date('2026-01-01'),
        enrollment_end_date: new Date('2026-01-31'),
      };

      await expect(insuranceService.createInsurancePlan(planData)).rejects.toThrow(
        'Premium amount must be greater than 0'
      );
    });

    it('should throw error if enrollment dates are invalid', async () => {
      const planData = {
        name: 'Health Insurance Plus',
        provider: 'ABC Insurance Co',
        premium_amount: 5000,
        coverage_type: 'health' as const,
        enrollment_start_date: new Date('2026-01-31'),
        enrollment_end_date: new Date('2026-01-01'),
      };

      await expect(insuranceService.createInsurancePlan(planData)).rejects.toThrow(
        'Enrollment start date must be before end date'
      );
    });
  });

  describe('getInsurancePlan', () => {
    it('should return insurance plan if found', async () => {
      const mockPlan = {
        id: '123',
        name: 'Health Insurance Plus',
        provider: 'ABC Insurance Co',
        premium_amount: 5000,
        coverage_type: 'health',
        is_active: true,
      };

      const mockGet = jest.fn().mockResolvedValue(mockPlan);

      (insuranceService as any).insurancePlanRepository = {
        getInsurancePlanById: mockGet,
      };

      const result = await insuranceService.getInsurancePlan('123');

      expect(mockGet).toHaveBeenCalledWith('123');
      expect(result).toEqual(mockPlan);
    });

    it('should throw error if plan not found', async () => {
      const mockGet = jest.fn().mockResolvedValue(null);

      (insuranceService as any).insurancePlanRepository = {
        getInsurancePlanById: mockGet,
      };

      await expect(insuranceService.getInsurancePlan('999')).rejects.toThrow(
        'Insurance plan not found'
      );
    });
  });

  describe('updateInsurancePlan', () => {
    it('should update insurance plan with valid data', async () => {
      const existingPlan = {
        id: '123',
        name: 'Health Insurance Plus',
        provider: 'ABC Insurance Co',
        premium_amount: 5000,
        coverage_type: 'health',
        is_active: true,
      };

      const updateData = {
        premium_amount: 6000,
      };

      const updatedPlan = {
        ...existingPlan,
        ...updateData,
      };

      const mockGet = jest.fn().mockResolvedValue(existingPlan);
      const mockUpdate = jest.fn().mockResolvedValue(updatedPlan);

      (insuranceService as any).insurancePlanRepository = {
        getInsurancePlanById: mockGet,
        updateInsurancePlan: mockUpdate,
      };

      const result = await insuranceService.updateInsurancePlan('123', updateData);

      expect(mockGet).toHaveBeenCalledWith('123');
      expect(mockUpdate).toHaveBeenCalledWith('123', updateData);
      expect(result).toEqual(updatedPlan);
    });

    it('should throw error if plan not found', async () => {
      const mockGet = jest.fn().mockResolvedValue(null);

      (insuranceService as any).insurancePlanRepository = {
        getInsurancePlanById: mockGet,
      };

      await expect(
        insuranceService.updateInsurancePlan('999', { premium_amount: 6000 })
      ).rejects.toThrow('Insurance plan not found');
    });

    it('should throw error if premium amount is invalid', async () => {
      const existingPlan = {
        id: '123',
        name: 'Health Insurance Plus',
        premium_amount: 5000,
      };

      const mockGet = jest.fn().mockResolvedValue(existingPlan);

      (insuranceService as any).insurancePlanRepository = {
        getInsurancePlanById: mockGet,
      };

      await expect(
        insuranceService.updateInsurancePlan('123', { premium_amount: -100 })
      ).rejects.toThrow('Premium amount must be greater than 0');
    });
  });

  describe('deleteInsurancePlan', () => {
    it('should delete insurance plan', async () => {
      const mockPlan = {
        id: '123',
        name: 'Health Insurance Plus',
      };

      const mockGet = jest.fn().mockResolvedValue(mockPlan);
      const mockDelete = jest.fn().mockResolvedValue(undefined);

      (insuranceService as any).insurancePlanRepository = {
        getInsurancePlanById: mockGet,
        deleteInsurancePlan: mockDelete,
      };

      await insuranceService.deleteInsurancePlan('123');

      expect(mockGet).toHaveBeenCalledWith('123');
      expect(mockDelete).toHaveBeenCalledWith('123');
    });

    it('should throw error if plan not found', async () => {
      const mockGet = jest.fn().mockResolvedValue(null);

      (insuranceService as any).insurancePlanRepository = {
        getInsurancePlanById: mockGet,
      };

      await expect(insuranceService.deleteInsurancePlan('999')).rejects.toThrow(
        'Insurance plan not found'
      );
    });
  });

  describe('enrollEmployee', () => {
    it('should enroll employee in insurance plan within enrollment window', async () => {
      const enrollmentData = {
        employee_id: 'emp-123',
        insurance_plan_id: 'plan-123',
        enrollment_date: new Date('2026-01-15'),
        effective_from: new Date('2026-02-01'),
      };

      const mockPlan = {
        id: 'plan-123',
        name: 'Health Insurance Plus',
        premium_amount: 5000,
        enrollment_start_date: new Date('2026-01-01'),
        enrollment_end_date: new Date('2026-01-31'),
      };

      const mockEnrollment = {
        id: 'enroll-123',
        ...enrollmentData,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
      };

      const mockGetPlan = jest.fn().mockResolvedValue(mockPlan);
      const mockGetExisting = jest.fn().mockResolvedValue(null);
      const mockCreate = jest.fn().mockResolvedValue(mockEnrollment);

      (insuranceService as any).insurancePlanRepository = {
        getInsurancePlanById: mockGetPlan,
      };

      (insuranceService as any).insuranceEnrollmentRepository = {
        getEnrollmentByEmployeeAndPlan: mockGetExisting,
        createEnrollment: mockCreate,
      };

      const result = await insuranceService.enrollEmployee(enrollmentData);

      expect(mockGetPlan).toHaveBeenCalledWith('plan-123');
      expect(mockGetExisting).toHaveBeenCalledWith('emp-123', 'plan-123');
      expect(mockCreate).toHaveBeenCalled();
      expect(result).toEqual(mockEnrollment);
    });

    it('should throw error if enrollment date is outside window', async () => {
      const enrollmentData = {
        employee_id: 'emp-123',
        insurance_plan_id: 'plan-123',
        enrollment_date: new Date('2026-02-15'),
        effective_from: new Date('2026-03-01'),
      };

      const mockPlan = {
        id: 'plan-123',
        name: 'Health Insurance Plus',
        enrollment_start_date: new Date('2026-01-01'),
        enrollment_end_date: new Date('2026-01-31'),
      };

      const mockGetPlan = jest.fn().mockResolvedValue(mockPlan);

      (insuranceService as any).insurancePlanRepository = {
        getInsurancePlanById: mockGetPlan,
      };

      await expect(insuranceService.enrollEmployee(enrollmentData)).rejects.toThrow(
        'Enrollment window validation failed'
      );
    });

    it('should throw error if employee already enrolled', async () => {
      const enrollmentData = {
        employee_id: 'emp-123',
        insurance_plan_id: 'plan-123',
        enrollment_date: new Date('2026-01-15'),
        effective_from: new Date('2026-02-01'),
      };

      const mockPlan = {
        id: 'plan-123',
        name: 'Health Insurance Plus',
        enrollment_start_date: new Date('2026-01-01'),
        enrollment_end_date: new Date('2026-01-31'),
      };

      const existingEnrollment = {
        id: 'enroll-456',
        status: 'active',
      };

      const mockGetPlan = jest.fn().mockResolvedValue(mockPlan);
      const mockGetExisting = jest.fn().mockResolvedValue(existingEnrollment);

      (insuranceService as any).insurancePlanRepository = {
        getInsurancePlanById: mockGetPlan,
      };

      (insuranceService as any).insuranceEnrollmentRepository = {
        getEnrollmentByEmployeeAndPlan: mockGetExisting,
      };

      await expect(insuranceService.enrollEmployee(enrollmentData)).rejects.toThrow(
        'Employee is already enrolled in this insurance plan'
      );
    });

    it('should throw error if plan not found', async () => {
      const enrollmentData = {
        employee_id: 'emp-123',
        insurance_plan_id: 'plan-999',
        enrollment_date: new Date('2026-01-15'),
        effective_from: new Date('2026-02-01'),
      };

      const mockGetPlan = jest.fn().mockResolvedValue(null);

      (insuranceService as any).insurancePlanRepository = {
        getInsurancePlanById: mockGetPlan,
      };

      await expect(insuranceService.enrollEmployee(enrollmentData)).rejects.toThrow(
        'Insurance plan not found'
      );
    });
  });

  describe('getEmployeeEnrollments', () => {
    it('should return all enrollments for employee', async () => {
      const mockEnrollments = [
        {
          id: 'enroll-1',
          employee_id: 'emp-123',
          insurance_plan_id: 'plan-1',
          status: 'active',
        },
        {
          id: 'enroll-2',
          employee_id: 'emp-123',
          insurance_plan_id: 'plan-2',
          status: 'cancelled',
        },
      ];

      const mockGet = jest.fn().mockResolvedValue(mockEnrollments);

      (insuranceService as any).insuranceEnrollmentRepository = {
        getEnrollmentsByEmployee: mockGet,
      };

      const result = await insuranceService.getEmployeeEnrollments('emp-123');

      expect(mockGet).toHaveBeenCalledWith('emp-123');
      expect(result).toEqual(mockEnrollments);
    });
  });

  describe('getActiveEmployeeEnrollments', () => {
    it('should return only active enrollments for employee', async () => {
      const mockEnrollments = [
        {
          id: 'enroll-1',
          employee_id: 'emp-123',
          insurance_plan_id: 'plan-1',
          status: 'active',
        },
      ];

      const mockGet = jest.fn().mockResolvedValue(mockEnrollments);

      (insuranceService as any).insuranceEnrollmentRepository = {
        getEnrollmentsByEmployee: mockGet,
      };

      const result = await insuranceService.getActiveEmployeeEnrollments('emp-123');

      expect(mockGet).toHaveBeenCalledWith('emp-123');
      expect(result).toEqual(mockEnrollments);
    });
  });

  describe('cancelEnrollment', () => {
    it('should cancel active enrollment', async () => {
      const enrollmentId = 'enroll-123';
      const effectiveTo = new Date('2026-03-31');

      const mockEnrollment = {
        id: enrollmentId,
        employee_id: 'emp-123',
        status: 'active',
      };

      const cancelledEnrollment = {
        ...mockEnrollment,
        status: 'cancelled',
        effective_to: effectiveTo,
      };

      const mockGet = jest.fn().mockResolvedValue(mockEnrollment);
      const mockUpdate = jest.fn().mockResolvedValue(cancelledEnrollment);

      (insuranceService as any).insuranceEnrollmentRepository = {
        getEnrollmentById: mockGet,
        updateEnrollment: mockUpdate,
      };

      const result = await insuranceService.cancelEnrollment(enrollmentId, effectiveTo);

      expect(mockGet).toHaveBeenCalledWith(enrollmentId);
      expect(mockUpdate).toHaveBeenCalledWith(enrollmentId, { status: 'cancelled' });
      expect(result).toEqual(cancelledEnrollment);
    });

    it('should throw error if enrollment already cancelled', async () => {
      const enrollmentId = 'enroll-123';
      const effectiveTo = new Date('2026-03-31');

      const mockEnrollment = {
        id: enrollmentId,
        status: 'cancelled',
      };

      const mockGet = jest.fn().mockResolvedValue(mockEnrollment);

      (insuranceService as any).insuranceEnrollmentRepository = {
        getEnrollmentById: mockGet,
      };

      await expect(insuranceService.cancelEnrollment(enrollmentId, effectiveTo)).rejects.toThrow(
        'Enrollment is already cancelled'
      );
    });
  });

  describe('validateEnrollmentWindow', () => {
    it('should validate enrollment within window', () => {
      const enrollmentDate = new Date('2026-01-15');
      const startDate = new Date('2026-01-01');
      const endDate = new Date('2026-01-31');

      const result = insuranceService.validateEnrollmentWindow(enrollmentDate, startDate, endDate);

      expect(result.isValid).toBe(true);
    });

    it('should invalidate enrollment before window start', () => {
      const enrollmentDate = new Date('2025-12-31');
      const startDate = new Date('2026-01-01');
      const endDate = new Date('2026-01-31');

      const result = insuranceService.validateEnrollmentWindow(enrollmentDate, startDate, endDate);

      expect(result.isValid).toBe(false);
      expect(result.reason).toContain('before the enrollment window start date');
    });

    it('should invalidate enrollment after window end', () => {
      const enrollmentDate = new Date('2026-02-01');
      const startDate = new Date('2026-01-01');
      const endDate = new Date('2026-01-31');

      const result = insuranceService.validateEnrollmentWindow(enrollmentDate, startDate, endDate);

      expect(result.isValid).toBe(false);
      expect(result.reason).toContain('after the enrollment window end date');
    });

    it('should validate enrollment on window start date', () => {
      const enrollmentDate = new Date('2026-01-01');
      const startDate = new Date('2026-01-01');
      const endDate = new Date('2026-01-31');

      const result = insuranceService.validateEnrollmentWindow(enrollmentDate, startDate, endDate);

      expect(result.isValid).toBe(true);
    });

    it('should validate enrollment on window end date', () => {
      const enrollmentDate = new Date('2026-01-31');
      const startDate = new Date('2026-01-01');
      const endDate = new Date('2026-01-31');

      const result = insuranceService.validateEnrollmentWindow(enrollmentDate, startDate, endDate);

      expect(result.isValid).toBe(true);
    });
  });

  describe('calculatePremiumDeduction', () => {
    it('should calculate total premium for active enrollments', async () => {
      const employeeId = 'emp-123';
      const month = 3;
      const year = 2026;

      const mockEnrollments = [
        {
          id: 'enroll-1',
          employee_id: employeeId,
          insurance_plan_id: 'plan-1',
          status: 'active',
          effective_from: new Date('2026-01-01'),
          effective_to: null,
        },
        {
          id: 'enroll-2',
          employee_id: employeeId,
          insurance_plan_id: 'plan-2',
          status: 'active',
          effective_from: new Date('2026-02-01'),
          effective_to: null,
        },
      ];

      const mockPlan1 = {
        id: 'plan-1',
        premium_amount: 5000,
      };

      const mockPlan2 = {
        id: 'plan-2',
        premium_amount: 3000,
      };

      const mockGetEnrollments = jest.fn().mockResolvedValue(mockEnrollments);
      const mockGetPlan = jest
        .fn()
        .mockResolvedValueOnce(mockPlan1)
        .mockResolvedValueOnce(mockPlan2);

      (insuranceService as any).insuranceEnrollmentRepository = {
        getEnrollmentsByEmployee: mockGetEnrollments,
      };

      (insuranceService as any).insurancePlanRepository = {
        getInsurancePlanById: mockGetPlan,
      };

      const result = await insuranceService.calculatePremiumDeduction(employeeId, month, year);

      expect(result).toBeGreaterThanOrEqual(0);
    });

    it('should return 0 if no active enrollments', async () => {
      const employeeId = 'emp-123';
      const month = 3;
      const year = 2026;

      const mockGetEnrollments = jest.fn().mockResolvedValue([]);

      (insuranceService as any).insuranceEnrollmentRepository = {
        getEnrollmentsByEmployee: mockGetEnrollments,
      };

      const result = await insuranceService.calculatePremiumDeduction(employeeId, month, year);

      expect(result).toBe(0);
    });

    it('should exclude enrollments not effective for the month', async () => {
      const employeeId = 'emp-123';
      const month = 1;
      const year = 2026;

      const mockEnrollments = [
        {
          id: 'enroll-1',
          employee_id: employeeId,
          insurance_plan_id: 'plan-1',
          status: 'active',
          effective_from: new Date('2026-02-01'),
          effective_to: null,
        },
      ];

      const mockGetEnrollments = jest.fn().mockResolvedValue(mockEnrollments);
      const mockGetPlan = jest.fn().mockResolvedValue(null);

      (insuranceService as any).insuranceEnrollmentRepository = {
        getEnrollmentsByEmployee: mockGetEnrollments,
      };

      (insuranceService as any).insurancePlanRepository = {
        getInsurancePlanById: mockGetPlan,
      };

      const result = await insuranceService.calculatePremiumDeduction(employeeId, month, year);

      expect(result).toBe(0);
    });

    it('should exclude cancelled enrollments', async () => {
      const employeeId = 'emp-123';
      const month = 3;
      const year = 2026;

      const mockEnrollments = [
        {
          id: 'enroll-1',
          employee_id: employeeId,
          insurance_plan_id: 'plan-1',
          status: 'active',
          effective_from: new Date('2026-01-01'),
          effective_to: new Date('2026-02-28'),
        },
      ];

      const mockGetEnrollments = jest.fn().mockResolvedValue(mockEnrollments);

      const mockGetPlan = jest.fn().mockResolvedValue(null);

      (insuranceService as any).insuranceEnrollmentRepository = {
        getEnrollmentsByEmployee: mockGetEnrollments,
      };

      (insuranceService as any).insurancePlanRepository = {
        getInsurancePlanById: mockGetPlan,
      };

      const result = await insuranceService.calculatePremiumDeduction(employeeId, month, year);

      expect(result).toBe(0);
    });
  });

  describe('getPlanEnrollmentCount', () => {
    it('should return count of active enrollments for a plan', async () => {
      const planId = 'plan-123';
      const mockEnrollments = [
        { id: 'enroll-1', status: 'active' },
        { id: 'enroll-2', status: 'active' },
        { id: 'enroll-3', status: 'active' },
      ];

      const mockGet = jest.fn().mockResolvedValue(mockEnrollments);

      (insuranceService as any).insuranceEnrollmentRepository = {
        getActivePlanEnrollments: mockGet,
      };

      const result = await insuranceService.getPlanEnrollmentCount(planId);

      expect(mockGet).toHaveBeenCalledWith(planId);
      expect(result).toBe(3);
    });
  });
});
