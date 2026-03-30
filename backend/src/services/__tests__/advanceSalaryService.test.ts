import { Knex } from 'knex';
import { AdvanceSalaryService } from '../advanceSalaryService';
import { CreateAdvanceSalaryDTO } from '../../types/payroll';

describe('AdvanceSalaryService', () => {
  let service: AdvanceSalaryService;
  let knex: Knex;
  let employeeId: string;

  beforeAll(async () => {
    knex = require('../../config/knex').default;
    service = new AdvanceSalaryService(knex);
  });

  beforeEach(async () => {
    // Create test employee
    const [employee] = await knex('employees')
      .insert({
        employee_id: `EMP-ADV-${Date.now()}`,
        first_name: 'Test',
        last_name: 'Employee',
        email: `test-adv-${Date.now()}@test.com`,
        phone: '9876543210',
        date_of_birth: '1990-01-01',
        gender: 'male',
        status: 'active',
        department_id: null,
        designation_id: null,
        date_of_joining: new Date(),
      })
      .returning('*');

    employeeId = employee.id;

    // Create salary structure
    await knex('salary_structures').insert({
      employee_id: employeeId,
      salary_mode: 'monthly',
      base_salary: 50000,
      hra: 10000,
      dearness_allowance: 5000,
      other_allowances: 2000,
      pf_contribution_rate: 12,
      esi_contribution_rate: 0.75,
      professional_tax: 200,
      effective_from: new Date(),
      is_active: true,
    });
  });

  afterEach(async () => {
    // Cleanup
    await knex('employees').where({ id: employeeId }).delete();
  });

  afterAll(async () => {
    await knex.destroy();
  });

  describe('requestAdvanceSalary', () => {
    it('should create an advance salary request', async () => {
      const dto: CreateAdvanceSalaryDTO = {
        employee_id: employeeId,
        amount: 10000,
        reason: 'Medical emergency',
        deduction_months: 3,
      };

      const result = await service.requestAdvanceSalary(dto);

      expect(result).toBeDefined();
      expect(result.employee_id).toBe(employeeId);
      expect(result.amount).toBe(10000);
      expect(result.status).toBe('pending');
      expect(result.deduction_months).toBe(3);
    });

    it('should reject advance amount greater than gross salary', async () => {
      const dto: CreateAdvanceSalaryDTO = {
        employee_id: employeeId,
        amount: 100000, // Greater than gross salary (67000)
        reason: 'Medical emergency',
      };

      await expect(service.requestAdvanceSalary(dto)).rejects.toThrow(
        'Advance amount cannot exceed gross salary'
      );
    });

    it('should reject negative advance amount', async () => {
      const dto: CreateAdvanceSalaryDTO = {
        employee_id: employeeId,
        amount: -5000,
        reason: 'Medical emergency',
      };

      await expect(service.requestAdvanceSalary(dto)).rejects.toThrow(
        'Advance amount must be greater than 0'
      );
    });

    it('should reject if employee has pending advance request', async () => {
      const dto1: CreateAdvanceSalaryDTO = {
        employee_id: employeeId,
        amount: 10000,
        reason: 'Medical emergency',
      };

      await service.requestAdvanceSalary(dto1);

      const dto2: CreateAdvanceSalaryDTO = {
        employee_id: employeeId,
        amount: 5000,
        reason: 'Another emergency',
      };

      await expect(service.requestAdvanceSalary(dto2)).rejects.toThrow(
        'Employee already has a pending advance request'
      );
    });

    it('should reject if employee not found', async () => {
      const validUUID = '00000000-0000-0000-0000-000000000000';
      const dto: CreateAdvanceSalaryDTO = {
        employee_id: validUUID,
        amount: 10000,
        reason: 'Medical emergency',
      };

      await expect(service.requestAdvanceSalary(dto)).rejects.toThrow(
        `Employee with ID ${validUUID} not found`
      );
    });
  });

  describe('approveAdvanceRequest', () => {
    it('should approve a pending advance request', async () => {
      const dto: CreateAdvanceSalaryDTO = {
        employee_id: employeeId,
        amount: 10000,
        reason: 'Medical emergency',
      };

      const request = await service.requestAdvanceSalary(dto);

      const [approver] = await knex('employees')
        .insert({
          employee_id: `EMP-APPROVER-${Date.now()}`,
          first_name: 'Approver',
          last_name: 'User',
          email: `approver-${Date.now()}@test.com`,
          phone: '9876543211',
          date_of_birth: '1990-01-01',
          gender: 'male',
          status: 'active',
          department_id: null,
          designation_id: null,
          date_of_joining: new Date(),
        })
        .returning('*');

      const result = await service.approveAdvanceRequest(
        request.id,
        approver.id,
        'Approved'
      );

      expect(result.status).toBe('approved');
      expect(result.approved_by).toBe(approver.id);
      expect(result.approval_notes).toBe('Approved');

      // Cleanup
      await knex('employees').where({ id: approver.id }).delete();
    });

    it('should reject if request not found', async () => {
      const validUUID = '00000000-0000-0000-0000-000000000000';
      const [approver] = await knex('employees')
        .insert({
          employee_id: `EMP-APPROVER-${Date.now()}`,
          first_name: 'Approver',
          last_name: 'User',
          email: `approver-${Date.now()}@test.com`,
          phone: '9876543211',
          date_of_birth: '1990-01-01',
          gender: 'male',
          status: 'active',
          department_id: null,
          designation_id: null,
          date_of_joining: new Date(),
        })
        .returning('*');

      await expect(
        service.approveAdvanceRequest(validUUID, approver.id)
      ).rejects.toThrow(`Advance request with ID ${validUUID} not found`);

      // Cleanup
      await knex('employees').where({ id: approver.id }).delete();
    });
  });

  describe('rejectAdvanceRequest', () => {
    it('should reject a pending advance request', async () => {
      const dto: CreateAdvanceSalaryDTO = {
        employee_id: employeeId,
        amount: 10000,
        reason: 'Medical emergency',
      };

      const request = await service.requestAdvanceSalary(dto);

      const [approver] = await knex('employees')
        .insert({
          employee_id: `EMP-APPROVER-${Date.now()}`,
          first_name: 'Approver',
          last_name: 'User',
          email: `approver-${Date.now()}@test.com`,
          phone: '9876543211',
          date_of_birth: '1990-01-01',
          gender: 'male',
          status: 'active',
          department_id: null,
          designation_id: null,
          date_of_joining: new Date(),
        })
        .returning('*');

      const result = await service.rejectAdvanceRequest(
        request.id,
        approver.id,
        'Rejected due to policy'
      );

      expect(result.status).toBe('rejected');
      expect(result.approved_by).toBe(approver.id);

      // Cleanup
      await knex('employees').where({ id: approver.id }).delete();
    });
  });
});
