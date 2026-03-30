import { Knex } from 'knex';
import { SalaryStructureService } from '../salaryStructureService';
import { CreateSalaryStructureDTO } from '../../types/payroll';

describe('SalaryStructureService', () => {
  let service: SalaryStructureService;
  let knex: Knex;

  beforeAll(async () => {
    knex = require('../../config/knex').default;
    service = new SalaryStructureService(knex);
  });

  afterAll(async () => {
    await knex.destroy();
  });

  describe('configureSalaryStructure', () => {
    it('should create a new salary structure for an employee', async () => {
      // Create test employee
      const [employee] = await knex('employees')
        .insert({
          employee_id: 'EMP-TEST-001',
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@test.com',
          phone: '9876543210',
          date_of_birth: '1990-01-01',
          gender: 'male',
          status: 'active',
          department_id: null,
          designation_id: null,
          date_of_joining: new Date(),
        })
        .returning('*');

      const dto: CreateSalaryStructureDTO = {
        employee_id: employee.id,
        salary_mode: 'monthly',
        base_salary: 50000,
        hra: 10000,
        dearness_allowance: 5000,
        other_allowances: 2000,
        pf_contribution_rate: 12,
        esi_contribution_rate: 0.75,
        professional_tax: 200,
        effective_from: new Date(),
      };

      const result = await service.configureSalaryStructure(dto, employee.id);

      expect(result).toBeDefined();
      expect(result.employee_id).toBe(employee.id);
      expect(result.salary_mode).toBe('monthly');
      expect(result.base_salary).toBe(50000);
      expect(result.is_active).toBe(true);

      // Cleanup
      await knex('employees').where({ id: employee.id }).delete();
    });

    it('should reject invalid salary mode', async () => {
      const [employee] = await knex('employees')
        .insert({
          employee_id: 'EMP-TEST-002',
          first_name: 'Jane',
          last_name: 'Smith',
          email: 'jane@test.com',
          phone: '9876543211',
          date_of_birth: '1991-01-01',
          gender: 'female',
          status: 'active',
          department_id: null,
          designation_id: null,
          date_of_joining: new Date(),
        })
        .returning('*');

      const dto: CreateSalaryStructureDTO = {
        employee_id: employee.id,
        salary_mode: 'invalid' as any,
        base_salary: 50000,
        hra: 10000,
        dearness_allowance: 5000,
        other_allowances: 2000,
        pf_contribution_rate: 12,
        esi_contribution_rate: 0.75,
        professional_tax: 200,
        effective_from: new Date(),
      };

      await expect(
        service.configureSalaryStructure(dto, employee.id)
      ).rejects.toThrow('Invalid salary mode');

      // Cleanup
      await knex('employees').where({ id: employee.id }).delete();
    });

    it('should reject negative base salary', async () => {
      const [employee] = await knex('employees')
        .insert({
          employee_id: 'EMP-TEST-003',
          first_name: 'Bob',
          last_name: 'Johnson',
          email: 'bob@test.com',
          phone: '9876543212',
          date_of_birth: '1992-01-01',
          gender: 'male',
          status: 'active',
          department_id: null,
          designation_id: null,
          date_of_joining: new Date(),
        })
        .returning('*');

      const dto: CreateSalaryStructureDTO = {
        employee_id: employee.id,
        salary_mode: 'monthly',
        base_salary: -50000,
        hra: 10000,
        dearness_allowance: 5000,
        other_allowances: 2000,
        pf_contribution_rate: 12,
        esi_contribution_rate: 0.75,
        professional_tax: 200,
        effective_from: new Date(),
      };

      await expect(
        service.configureSalaryStructure(dto, employee.id)
      ).rejects.toThrow('Base salary must be greater than 0');

      // Cleanup
      await knex('employees').where({ id: employee.id }).delete();
    });

    it('should reject invalid PF contribution rate', async () => {
      const [employee] = await knex('employees')
        .insert({
          employee_id: 'EMP-TEST-004',
          first_name: 'Alice',
          last_name: 'Williams',
          email: 'alice@test.com',
          phone: '9876543213',
          date_of_birth: '1993-01-01',
          gender: 'female',
          status: 'active',
          department_id: null,
          designation_id: null,
          date_of_joining: new Date(),
        })
        .returning('*');

      const dto: CreateSalaryStructureDTO = {
        employee_id: employee.id,
        salary_mode: 'monthly',
        base_salary: 50000,
        hra: 10000,
        dearness_allowance: 5000,
        other_allowances: 2000,
        pf_contribution_rate: 150,
        esi_contribution_rate: 0.75,
        professional_tax: 200,
        effective_from: new Date(),
      };

      await expect(
        service.configureSalaryStructure(dto, employee.id)
      ).rejects.toThrow('PF contribution rate must be between 0 and 100');

      // Cleanup
      await knex('employees').where({ id: employee.id }).delete();
    });

    it('should deactivate previous structure when creating new one', async () => {
      const [employee] = await knex('employees')
        .insert({
          employee_id: 'EMP-TEST-005',
          first_name: 'Charlie',
          last_name: 'Brown',
          email: 'charlie@test.com',
          phone: '9876543214',
          date_of_birth: '1994-01-01',
          gender: 'male',
          status: 'active',
          department_id: null,
          designation_id: null,
          date_of_joining: new Date(),
        })
        .returning('*');

      const dto1: CreateSalaryStructureDTO = {
        employee_id: employee.id,
        salary_mode: 'monthly',
        base_salary: 50000,
        hra: 10000,
        dearness_allowance: 5000,
        other_allowances: 2000,
        pf_contribution_rate: 12,
        esi_contribution_rate: 0.75,
        professional_tax: 200,
        effective_from: new Date(),
      };

      const structure1 = await service.configureSalaryStructure(dto1, employee.id);

      const dto2: CreateSalaryStructureDTO = {
        employee_id: employee.id,
        salary_mode: 'monthly',
        base_salary: 60000,
        hra: 12000,
        dearness_allowance: 6000,
        other_allowances: 2500,
        pf_contribution_rate: 12,
        esi_contribution_rate: 0.75,
        professional_tax: 200,
        effective_from: new Date(),
      };

      const structure2 = await service.configureSalaryStructure(dto2, employee.id);

      const oldStructure = await knex('salary_structures')
        .where({ id: structure1.id })
        .first();

      expect(oldStructure.is_active).toBe(false);
      expect(structure2.is_active).toBe(true);

      // Cleanup
      await knex('employees').where({ id: employee.id }).delete();
    });
  });

  describe('getSalaryStructure', () => {
    it('should retrieve active salary structure for employee', async () => {
      const [employee] = await knex('employees')
        .insert({
          employee_id: 'EMP-TEST-006',
          first_name: 'Diana',
          last_name: 'Prince',
          email: 'diana@test.com',
          phone: '9876543215',
          date_of_birth: '1995-01-01',
          gender: 'female',
          status: 'active',
          department_id: null,
          designation_id: null,
          date_of_joining: new Date(),
        })
        .returning('*');

      const dto: CreateSalaryStructureDTO = {
        employee_id: employee.id,
        salary_mode: 'monthly',
        base_salary: 50000,
        hra: 10000,
        dearness_allowance: 5000,
        other_allowances: 2000,
        pf_contribution_rate: 12,
        esi_contribution_rate: 0.75,
        professional_tax: 200,
        effective_from: new Date(),
      };

      await service.configureSalaryStructure(dto, employee.id);

      const result = await service.getSalaryStructure(employee.id);

      expect(result).toBeDefined();
      expect(result?.employee_id).toBe(employee.id);
      expect(result?.is_active).toBe(true);

      // Cleanup
      await knex('employees').where({ id: employee.id }).delete();
    });
  });

  describe('calculateGrossSalary', () => {
    it('should calculate gross salary correctly', async () => {
      const [employee] = await knex('employees')
        .insert({
          employee_id: 'EMP-TEST-007',
          first_name: 'Eve',
          last_name: 'Adams',
          email: 'eve@test.com',
          phone: '9876543216',
          date_of_birth: '1996-01-01',
          gender: 'female',
          status: 'active',
          department_id: null,
          designation_id: null,
          date_of_joining: new Date(),
        })
        .returning('*');

      const dto: CreateSalaryStructureDTO = {
        employee_id: employee.id,
        salary_mode: 'monthly',
        base_salary: 50000,
        hra: 10000,
        dearness_allowance: 5000,
        other_allowances: 2000,
        pf_contribution_rate: 12,
        esi_contribution_rate: 0.75,
        professional_tax: 200,
        effective_from: new Date(),
      };

      await service.configureSalaryStructure(dto, employee.id);

      const grossSalary = await service.calculateGrossSalary(employee.id);

      expect(grossSalary).toBe(67000); // 50000 + 10000 + 5000 + 2000

      // Cleanup
      await knex('employees').where({ id: employee.id }).delete();
    });
  });
});
