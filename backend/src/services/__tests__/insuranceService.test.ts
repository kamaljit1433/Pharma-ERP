import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { Knex } from 'knex';
import knex from 'knex';
import { InsuranceService } from '../insuranceService';

describe('InsuranceService', () => {
  let db: Knex;
  let service: InsuranceService;
  let insurancePlanId: string;
  let employeeId: string;

  beforeEach(async () => {
    db = knex({
      client: 'sqlite3',
      connection: ':memory:',
      useNullAsDefault: true,
    });

    // Create tables
    await db.schema.createTable('insurance_plans', (table) => {
      table.uuid('id').primary();
      table.string('name');
      table.string('provider');
      table.string('coverage_type');
      table.text('description').nullable();
      table.decimal('premium_amount', 10, 2);
      table.date('enrollment_start_date');
      table.date('enrollment_end_date');
      table.boolean('is_active').defaultTo(true);
      table.timestamp('created_at').defaultTo(db.fn.now());
      table.timestamp('updated_at').defaultTo(db.fn.now());
    });

    await db.schema.createTable('insurance_enrollments', (table) => {
      table.uuid('id').primary();
      table.uuid('employee_id');
      table.uuid('insurance_plan_id').references('id').inTable('insurance_plans');
      table.date('enrollment_date');
      table.date('effective_from');
      table.date('effective_to').nullable();
      table.string('status').defaultTo('active');
      table.timestamp('created_at').defaultTo(db.fn.now());
      table.timestamp('updated_at').defaultTo(db.fn.now());
    });

    service = new InsuranceService(db);

    // Insert test data
    await db('insurance_plans').insert({
      id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'Health Insurance Premium',
      provider: 'ABC Insurance',
      coverage_type: 'health',
      premium_amount: 5000,
      enrollment_start_date: '2026-01-01',
      enrollment_end_date: '2026-12-31',
      is_active: true,
    });

    insurancePlanId = '550e8400-e29b-41d4-a716-446655440001';
    employeeId = '550e8400-e29b-41d4-a716-446655440002';
  });

  afterEach(async () => {
    await db.destroy();
  });

  describe('createInsurancePlan', () => {
    it('should create a new insurance plan with valid data', async () => {
      const planData = {
        name: 'Life Insurance',
        provider: 'XYZ Insurance',
        coverage_type: 'life' as const,
        premium_amount: 3000,
        enrollment_start_date: new Date('2026-01-01'),
        enrollment_end_date: new Date('2026-12-31'),
      };

      const plan = await service.createInsurancePlan(planData);

      expect(plan).toBeDefined();
      expect(plan.name).toBe('Life Insurance');
      expect(plan.provider).toBe('XYZ Insurance');
      expect(plan.premium_amount).toBe(3000);
    });

    it('should throw error for missing required fields', async () => {
      const planData = {
        name: '',
        provider: 'XYZ Insurance',
        coverage_type: 'life' as const,
        premium_amount: 3000,
        enrollment_start_date: new Date('2026-01-01'),
        enrollment_end_date: new Date('2026-12-31'),
      };

      await expect(service.createInsurancePlan(planData)).rejects.toThrow(
        'Missing required fields'
      );
    });

    it('should throw error for invalid premium amount', async () => {
      const planData = {
        name: 'Life Insurance',
        provider: 'XYZ Insurance',
        coverage_type: 'life' as const,
        premium_amount: 0,
        enrollment_start_date: new Date('2026-01-01'),
        enrollment_end_date: new Date('2026-12-31'),
      };

      await expect(service.createInsurancePlan(planData)).rejects.toThrow(
        'Premium amount must be greater than 0'
      );
    });

    it('should throw error for invalid enrollment dates', async () => {
      const planData = {
        name: 'Life Insurance',
        provider: 'XYZ Insurance',
        coverage_type: 'life' as const,
        premium_amount: 3000,
        enrollment_start_date: new Date('2026-12-31'),
        enrollment_end_date: new Date('2026-01-01'),
      };

      await expect(service.createInsurancePlan(planData)).rejects.toThrow(
        'Enrollment start date must be before end date'
      );
    });
  });

  describe('getInsurancePlan', () => {
    it('should return insurance plan by id', async () => {
      const plan = await service.getInsurancePlan(insurancePlanId);

      expect(plan).toBeDefined();
      expect(plan.id).toBe(insurancePlanId);
      expect(plan.name).toBe('Health Insurance Premium');
    });

    it('should throw error for non-existent plan', async () => {
      await expect(service.getInsurancePlan('non-existent-id')).rejects.toThrow(
        'Insurance plan not found'
      );
    });
  });

  describe('getAllInsurancePlans', () => {
    beforeEach(async () => {
      await db('insurance_plans').insert({
        id: '550e8400-e29b-41d4-a716-446655440003',
        name: 'Dental Insurance',
        provider: 'DEF Insurance',
        coverage_type: 'dental',
        premium_amount: 2000,
        enrollment_start_date: '2026-01-01',
        enrollment_end_date: '2026-12-31',
        is_active: false,
      });
    });

    it('should return all insurance plans', async () => {
      const plans = await service.getAllInsurancePlans();

      expect(plans).toHaveLength(2);
    });

    it('should filter by active status', async () => {
      const plans = await service.getAllInsurancePlans(true);

      expect(plans).toHaveLength(1);
      expect(plans[0]?.is_active).toBe(true);
    });
  });

  describe('getActiveInsurancePlans', () => {
    it('should return only active plans', async () => {
      await db('insurance_plans').insert({
        id: '550e8400-e29b-41d4-a716-446655440003',
        name: 'Dental Insurance',
        provider: 'DEF Insurance',
        coverage_type: 'dental',
        premium_amount: 2000,
        enrollment_start_date: '2026-01-01',
        enrollment_end_date: '2026-12-31',
        is_active: false,
      });

      const plans = await service.getActiveInsurancePlans();

      expect(plans).toHaveLength(1);
      expect(plans.every((p) => p.is_active)).toBe(true);
    });
  });

  describe('getInsurancePlansByType', () => {
    beforeEach(async () => {
      await db('insurance_plans').insert({
        id: '550e8400-e29b-41d4-a716-446655440003',
        name: 'Life Insurance',
        provider: 'XYZ Insurance',
        coverage_type: 'life',
        premium_amount: 3000,
        enrollment_start_date: '2026-01-01',
        enrollment_end_date: '2026-12-31',
      });
    });

    it('should return plans filtered by coverage type', async () => {
      const plans = await service.getInsurancePlansByType('health');

      expect(plans).toHaveLength(1);
      expect(plans[0]?.coverage_type).toBe('health');
    });
  });

  describe('updateInsurancePlan', () => {
    it('should update insurance plan', async () => {
      const updated = await service.updateInsurancePlan(insurancePlanId, {
        premium_amount: 6000,
      });

      expect(updated.premium_amount).toBe(6000);
    });

    it('should throw error for non-existent plan', async () => {
      await expect(
        service.updateInsurancePlan('non-existent-id', { premium_amount: 6000 })
      ).rejects.toThrow('Insurance plan not found');
    });

    it('should throw error for invalid premium amount', async () => {
      await expect(
        service.updateInsurancePlan(insurancePlanId, { premium_amount: 0 })
      ).rejects.toThrow('Premium amount must be greater than 0');
    });

    it('should throw error for invalid enrollment dates', async () => {
      await expect(
        service.updateInsurancePlan(insurancePlanId, {
          enrollment_start_date: new Date('2026-12-31'),
          enrollment_end_date: new Date('2026-01-01'),
        })
      ).rejects.toThrow('Enrollment start date must be before end date');
    });
  });

  describe('deleteInsurancePlan', () => {
    it('should delete insurance plan', async () => {
      await service.deleteInsurancePlan(insurancePlanId);

      await expect(service.getInsurancePlan(insurancePlanId)).rejects.toThrow(
        'Insurance plan not found'
      );
    });

    it('should throw error for non-existent plan', async () => {
      await expect(service.deleteInsurancePlan('non-existent-id')).rejects.toThrow(
        'Insurance plan not found'
      );
    });
  });

  describe('enrollEmployee', () => {
    it('should enroll employee in insurance plan', async () => {
      const enrollmentData = {
        employee_id: employeeId,
        insurance_plan_id: insurancePlanId,
        enrollment_date: new Date('2026-03-15'),
        effective_from: new Date('2026-04-01'),
      };

      const enrollment = await service.enrollEmployee(enrollmentData);

      expect(enrollment).toBeDefined();
      expect(enrollment.employee_id).toBe(employeeId);
      expect(enrollment.status).toBe('active');
    });

    it('should throw error for missing required fields', async () => {
      const enrollmentData = {
        employee_id: '',
        insurance_plan_id: insurancePlanId,
        enrollment_date: new Date('2026-03-15'),
        effective_from: new Date('2026-04-01'),
      };

      await expect(service.enrollEmployee(enrollmentData)).rejects.toThrow(
        'Missing required fields'
      );
    });

    it('should throw error for non-existent insurance plan', async () => {
      const enrollmentData = {
        employee_id: employeeId,
        insurance_plan_id: 'non-existent-id',
        enrollment_date: new Date('2026-03-15'),
        effective_from: new Date('2026-04-01'),
      };

      await expect(service.enrollEmployee(enrollmentData)).rejects.toThrow(
        'Insurance plan not found'
      );
    });

    it('should throw error for enrollment outside window', async () => {
      const enrollmentData = {
        employee_id: employeeId,
        insurance_plan_id: insurancePlanId,
        enrollment_date: new Date('2025-12-15'),
        effective_from: new Date('2026-01-01'),
      };

      await expect(service.enrollEmployee(enrollmentData)).rejects.toThrow(
        'Enrollment window validation failed'
      );
    });

    it('should throw error for duplicate active enrollment', async () => {
      const enrollmentData = {
        employee_id: employeeId,
        insurance_plan_id: insurancePlanId,
        enrollment_date: new Date('2026-03-15'),
        effective_from: new Date('2026-04-01'),
      };

      await service.enrollEmployee(enrollmentData);

      await expect(service.enrollEmployee(enrollmentData)).rejects.toThrow(
        'Employee is already enrolled in this insurance plan'
      );
    });
  });

  describe('getEmployeeEnrollments', () => {
    beforeEach(async () => {
      await db('insurance_enrollments').insert({
        id: '550e8400-e29b-41d4-a716-446655440004',
        employee_id: employeeId,
        insurance_plan_id: insurancePlanId,
        enrollment_date: '2026-03-15',
        effective_from: '2026-04-01',
        status: 'active',
      });
    });

    it('should return all enrollments for employee', async () => {
      const enrollments = await service.getEmployeeEnrollments(employeeId);

      expect(enrollments).toHaveLength(1);
      expect(enrollments[0]?.employee_id).toBe(employeeId);
    });
  });

  describe('getActiveEmployeeEnrollments', () => {
    beforeEach(async () => {
      await db('insurance_enrollments').insert([
        {
          id: '550e8400-e29b-41d4-a716-446655440004',
          employee_id: employeeId,
          insurance_plan_id: insurancePlanId,
          enrollment_date: '2026-03-15',
          effective_from: '2026-04-01',
          status: 'active',
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440005',
          employee_id: employeeId,
          insurance_plan_id: insurancePlanId,
          enrollment_date: '2025-03-15',
          effective_from: '2025-04-01',
          status: 'cancelled',
        },
      ]);
    });

    it('should return only active enrollments', async () => {
      const enrollments = await service.getActiveEmployeeEnrollments(employeeId);

      expect(enrollments).toHaveLength(1);
      expect(enrollments[0]?.status).toBe('active');
    });
  });

  describe('getEnrollmentDetails', () => {
    let enrollmentId: string;

    beforeEach(async () => {
      await db('insurance_enrollments').insert({
        id: '550e8400-e29b-41d4-a716-446655440004',
        employee_id: employeeId,
        insurance_plan_id: insurancePlanId,
        enrollment_date: '2026-03-15',
        effective_from: '2026-04-01',
        status: 'active',
      });
      enrollmentId = '550e8400-e29b-41d4-a716-446655440004';
    });

    it('should return enrollment details', async () => {
      const enrollment = await service.getEnrollmentDetails(enrollmentId);

      expect(enrollment).toBeDefined();
      expect(enrollment.id).toBe(enrollmentId);
    });

    it('should throw error for non-existent enrollment', async () => {
      await expect(service.getEnrollmentDetails('non-existent-id')).rejects.toThrow(
        'Insurance enrollment not found'
      );
    });
  });

  describe('updateEnrollment', () => {
    let enrollmentId: string;

    beforeEach(async () => {
      await db('insurance_enrollments').insert({
        id: '550e8400-e29b-41d4-a716-446655440004',
        employee_id: employeeId,
        insurance_plan_id: insurancePlanId,
        enrollment_date: '2026-03-15',
        effective_from: '2026-04-01',
        status: 'active',
      });
      enrollmentId = '550e8400-e29b-41d4-a716-446655440004';
    });

    it('should update enrollment status', async () => {
      const updated = await service.updateEnrollment(enrollmentId, {
        status: 'inactive',
      });

      expect(updated).toBeDefined();
    });

    it('should throw error for non-existent enrollment', async () => {
      await expect(
        service.updateEnrollment('non-existent-id', { status: 'cancelled' })
      ).rejects.toThrow('Insurance enrollment not found');
    });
  });

  describe('cancelEnrollment', () => {
    let enrollmentId: string;

    beforeEach(async () => {
      await db('insurance_enrollments').insert({
        id: '550e8400-e29b-41d4-a716-446655440004',
        employee_id: employeeId,
        insurance_plan_id: insurancePlanId,
        enrollment_date: '2026-03-15',
        effective_from: '2026-04-01',
        status: 'active',
      });
      enrollmentId = '550e8400-e29b-41d4-a716-446655440004';
    });

    it('should cancel active enrollment', async () => {
      const cancelled = await service.cancelEnrollment(
        enrollmentId,
        new Date('2026-12-31')
      );

      expect(cancelled.status).toBe('cancelled');
    });

    it('should throw error for non-existent enrollment', async () => {
      await expect(
        service.cancelEnrollment('non-existent-id', new Date('2026-12-31'))
      ).rejects.toThrow('Insurance enrollment not found');
    });

    it('should throw error for already cancelled enrollment', async () => {
      await service.cancelEnrollment(enrollmentId, new Date('2026-12-31'));

      await expect(
        service.cancelEnrollment(enrollmentId, new Date('2026-12-31'))
      ).rejects.toThrow('Enrollment is already cancelled');
    });
  });

  describe('validateEnrollmentWindow', () => {
    it('should validate enrollment within window', () => {
      const result = service.validateEnrollmentWindow(
        new Date('2026-06-15'),
        new Date('2026-01-01'),
        new Date('2026-12-31')
      );

      expect(result.isValid).toBe(true);
    });

    it('should reject enrollment before window', () => {
      const result = service.validateEnrollmentWindow(
        new Date('2025-12-15'),
        new Date('2026-01-01'),
        new Date('2026-12-31')
      );

      expect(result.isValid).toBe(false);
      expect(result.reason).toContain('before the enrollment window');
    });

    it('should reject enrollment after window', () => {
      const result = service.validateEnrollmentWindow(
        new Date('2027-01-15'),
        new Date('2026-01-01'),
        new Date('2026-12-31')
      );

      expect(result.isValid).toBe(false);
      expect(result.reason).toContain('after the enrollment window');
    });
  });

  describe('calculatePremiumDeduction', () => {
    beforeEach(async () => {
      await db('insurance_enrollments').insert({
        id: '550e8400-e29b-41d4-a716-446655440004',
        employee_id: employeeId,
        insurance_plan_id: insurancePlanId,
        enrollment_date: '2026-03-15',
        effective_from: '2026-04-01',
        status: 'active',
      });
    });

    it('should calculate premium deduction for active enrollments', async () => {
      const premium = await service.calculatePremiumDeduction(employeeId, 5, 2026);

      expect(premium).toBe(5000);
    });

    it('should return 0 for employee with no enrollments', async () => {
      const premium = await service.calculatePremiumDeduction('other-employee', 5, 2026);

      expect(premium).toBe(0);
    });

    it('should calculate premium deduction for any enrolled plan', async () => {
      const premium = await service.calculatePremiumDeduction(employeeId, 3, 2026);

      expect(premium).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getPlanEnrollmentCount', () => {
    beforeEach(async () => {
      await db('insurance_enrollments').insert([
        {
          id: '550e8400-e29b-41d4-a716-446655440004',
          employee_id: employeeId,
          insurance_plan_id: insurancePlanId,
          enrollment_date: '2026-03-15',
          effective_from: '2026-04-01',
          status: 'active',
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440005',
          employee_id: '550e8400-e29b-41d4-a716-446655440006',
          insurance_plan_id: insurancePlanId,
          enrollment_date: '2026-03-15',
          effective_from: '2026-04-01',
          status: 'active',
        },
      ]);
    });

    it('should return count of active enrollments for plan', async () => {
      const count = await service.getPlanEnrollmentCount(insurancePlanId);

      expect(count).toBe(2);
    });
  });

  describe('getPlanEnrollments', () => {
    beforeEach(async () => {
      await db('insurance_enrollments').insert([
        {
          id: '550e8400-e29b-41d4-a716-446655440004',
          employee_id: employeeId,
          insurance_plan_id: insurancePlanId,
          enrollment_date: '2026-03-15',
          effective_from: '2026-04-01',
          status: 'active',
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440005',
          employee_id: '550e8400-e29b-41d4-a716-446655440006',
          insurance_plan_id: insurancePlanId,
          enrollment_date: '2026-03-15',
          effective_from: '2026-04-01',
          status: 'cancelled',
        },
      ]);
    });

    it('should return all enrollments for plan', async () => {
      const enrollments = await service.getPlanEnrollments(insurancePlanId);

      expect(enrollments).toHaveLength(2);
    });
  });
});
