/**
 * Salary Structure Repository - Unit Tests
 * Tests for salary structure management and configuration
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { SalaryStructureRepository } from '../salaryStructureRepository';
import db from '../../config/knex';
import { CreateSalaryStructureDTO, UpdateSalaryStructureDTO } from '../../types/payroll';

describe('SalaryStructureRepository', () => {
  let repository: SalaryStructureRepository;
  let testEmployeeId: string;
  let testStructureId: string;

  beforeAll(async () => {
    repository = new SalaryStructureRepository(db);
    testEmployeeId = crypto.randomUUID();

    // Clean up test data
    await db('salary_structures').del();
  });

  afterAll(async () => {
    await db('salary_structures').del();
  });

  describe('createSalaryStructure', () => {
    it('should create salary structure', async () => {
      const data: CreateSalaryStructureDTO = {
        employee_id: testEmployeeId,
        salary_mode: 'monthly',
        basic_salary: 50000,
        hra: 10000,
        dearness_allowance: 5000,
        other_allowances: 5000,
        pf_percentage: 12,
        esi_percentage: 0.75,
        effective_from: '2024-01-01',
      };

      const structure = await repository.createSalaryStructure(data);

      expect(structure).toBeDefined();
      expect(structure.id).toBeDefined();
      expect(structure.employee_id).toBe(testEmployeeId);
      expect(structure.salary_mode).toBe('monthly');
      expect(structure.basic_salary).toBe(50000);

      testStructureId = structure.id;
    });

    it('should create daily rate salary structure', async () => {
      const data: CreateSalaryStructureDTO = {
        employee_id: testEmployeeId,
        salary_mode: 'daily',
        daily_rate: 2000,
        pf_percentage: 12,
        esi_percentage: 0.75,
        effective_from: '2024-01-01',
      };

      const structure = await repository.createSalaryStructure(data);

      expect(structure.salary_mode).toBe('daily');
      expect(structure.daily_rate).toBe(2000);
    });

    it('should create hourly rate salary structure', async () => {
      const data: CreateSalaryStructureDTO = {
        employee_id: testEmployeeId,
        salary_mode: 'hourly',
        hourly_rate: 250,
        pf_percentage: 12,
        esi_percentage: 0.75,
        effective_from: '2024-01-01',
      };

      const structure = await repository.createSalaryStructure(data);

      expect(structure.salary_mode).toBe('hourly');
      expect(structure.hourly_rate).toBe(250);
    });
  });

  describe('getSalaryStructure', () => {
    it('should retrieve salary structure by ID', async () => {
      const structure = await repository.getSalaryStructure(testStructureId);

      expect(structure).toBeDefined();
      expect(structure?.id).toBe(testStructureId);
    });

    it('should return null for non-existent structure', async () => {
      const structure = await repository.getSalaryStructure('00000000-0000-4000-a000-ffffffffffff');

      expect(structure).toBeNull();
    });
  });

  describe('getEmployeeSalaryStructure', () => {
    it('should retrieve current salary structure for employee', async () => {
      const structure = await repository.getEmployeeSalaryStructure(testEmployeeId);

      expect(structure).toBeDefined();
      expect(structure?.employee_id).toBe(testEmployeeId);
    });

    it('should return null if no structure exists', async () => {
      const structure = await repository.getEmployeeSalaryStructure('00000000-0000-4000-a000-fffffffffffe');

      expect(structure).toBeNull();
    });
  });

  describe('updateSalaryStructure', () => {
    it('should update salary structure', async () => {
      const updateData: UpdateSalaryStructureDTO = {
        basic_salary: 55000,
        hra: 11000,
      };

      const updated = await repository.updateSalaryStructure(testStructureId, updateData);

      expect(updated.basic_salary).toBe(55000);
      expect(updated.hra).toBe(11000);
    });

    it('should throw error for non-existent structure', async () => {
      await expect(
        repository.updateSalaryStructure('00000000-0000-4000-a000-ffffffffffff', { basic_salary: 50000 })
      ).rejects.toThrow();
    });
  });

  describe('getSalaryStructureHistory', () => {
    it('should retrieve salary structure history', async () => {
      const history = await repository.getSalaryStructureHistory(testEmployeeId);

      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBeGreaterThan(0);
    });
  });

  describe('getSalaryStructureByDate', () => {
    it('should retrieve salary structure effective on date', async () => {
      const structure = await repository.getSalaryStructureByDate(testEmployeeId, '2024-01-15');

      expect(structure).toBeDefined();
      expect(structure?.employee_id).toBe(testEmployeeId);
    });
  });

  describe('calculateGrossSalary', () => {
    it('should calculate gross salary', async () => {
      const gross = await repository.calculateGrossSalary(testStructureId);

      expect(typeof gross).toBe('number');
      expect(gross).toBeGreaterThan(0);
    });
  });

  describe('calculateNetSalary', () => {
    it('should calculate net salary with deductions', async () => {
      const net = await repository.calculateNetSalary(testStructureId);

      expect(typeof net).toBe('number');
      expect(net).toBeGreaterThan(0);
    });
  });

  describe('calculatePFContribution', () => {
    it('should calculate PF contribution', async () => {
      const pf = await repository.calculatePFContribution(testStructureId);

      expect(typeof pf).toBe('number');
      expect(pf).toBeGreaterThan(0);
    });
  });

  describe('calculateESIContribution', () => {
    it('should calculate ESI contribution', async () => {
      const esi = await repository.calculateESIContribution(testStructureId);

      expect(typeof esi).toBe('number');
      expect(esi).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getActiveSalaryStructures', () => {
    it('should retrieve all active salary structures', async () => {
      const structures = await repository.getActiveSalaryStructures();

      expect(Array.isArray(structures)).toBe(true);
    });
  });

  describe('deactivateSalaryStructure', () => {
    it('should deactivate salary structure', async () => {
      const data: CreateSalaryStructureDTO = {
        employee_id: testEmployeeId,
        salary_mode: 'monthly',
        basic_salary: 50000,
        pf_percentage: 12,
        esi_percentage: 0.75,
        effective_from: '2024-01-01',
      };

      const structure = await repository.createSalaryStructure(data);
      const deactivated = await repository.deactivateSalaryStructure(structure.id);

      expect(deactivated.is_active).toBe(false);
    });
  });

  describe('deleteSalaryStructure', () => {
    it('should delete salary structure', async () => {
      const data: CreateSalaryStructureDTO = {
        employee_id: testEmployeeId,
        salary_mode: 'monthly',
        basic_salary: 50000,
        pf_percentage: 12,
        esi_percentage: 0.75,
        effective_from: '2024-01-01',
      };

      const structure = await repository.createSalaryStructure(data);
      await repository.deleteSalaryStructure(structure.id);

      const deleted = await repository.getSalaryStructure(structure.id);
      expect(deleted).toBeNull();
    });
  });
});
