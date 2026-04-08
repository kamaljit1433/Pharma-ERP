/**
 * Department Repository - Unit Tests
 * Tests for department management
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { DepartmentRepository } from '../departmentRepository';
import db from '../../config/knex';
import { CreateDepartmentDTO, UpdateDepartmentDTO } from '../../types/hierarchy';

describe('DepartmentRepository', () => {
  let repository: DepartmentRepository;
  let testDepartmentId: string;

  beforeAll(async () => {
    repository = new DepartmentRepository(db);

    // Clean up test data
    await db('departments').del();
  });

  afterAll(async () => {
    await db('departments').del();
  });

  describe('createDepartment', () => {
    it('should create department', async () => {
      const data: CreateDepartmentDTO = {
        name: 'Engineering',
        description: 'Software Engineering Department',
        head_id: 'a0000000-0000-4000-a000-000000000001',
      };

      const department = await repository.createDepartment(data);

      expect(department).toBeDefined();
      expect(department.id).toBeDefined();
      expect(department.name).toBe('Engineering');
      expect(department.description).toBe('Software Engineering Department');

      testDepartmentId = department.id;
    });

    it('should create department without optional fields', async () => {
      const data: CreateDepartmentDTO = {
        name: 'HR',
      };

      const department = await repository.createDepartment(data);

      expect(department.name).toBe('HR');
    });
  });

  describe('getDepartment', () => {
    it('should retrieve department by ID', async () => {
      const department = await repository.getDepartment(testDepartmentId);

      expect(department).toBeDefined();
      expect(department?.id).toBe(testDepartmentId);
      expect(department?.name).toBe('Engineering');
    });

    it('should return null for non-existent department', async () => {
      const department = await repository.getDepartment('00000000-0000-4000-a000-ffffffffffff');

      expect(department).toBeNull();
    });
  });

  describe('getDepartmentByName', () => {
    it('should retrieve department by name', async () => {
      const department = await repository.getDepartmentByName('Engineering');

      expect(department).toBeDefined();
      expect(department?.name).toBe('Engineering');
    });

    it('should return null for non-existent name', async () => {
      const department = await repository.getDepartmentByName('NonExistent');

      expect(department).toBeNull();
    });
  });

  describe('updateDepartment', () => {
    it('should update department', async () => {
      const updateData: UpdateDepartmentDTO = {
        name: 'Software Engineering',
        head_id: 'a0000000-0000-4000-a000-000000000002',
      };

      const updated = await repository.updateDepartment(testDepartmentId, updateData);

      expect(updated.name).toBe('Software Engineering');
      expect(updated.head_id).toBe('a0000000-0000-4000-a000-000000000002');
    });

    it('should throw error for non-existent department', async () => {
      await expect(
        repository.updateDepartment('00000000-0000-4000-a000-ffffffffffff', { name: 'Test' })
      ).rejects.toThrow();
    });
  });

  describe('getAllDepartments', () => {
    it('should retrieve all departments', async () => {
      const departments = await repository.getAllDepartments();

      expect(Array.isArray(departments)).toBe(true);
      expect(departments.length).toBeGreaterThan(0);
    });
  });

  describe('getDepartmentCount', () => {
    it('should count all departments', async () => {
      const count = await repository.getDepartmentCount();

      expect(typeof count).toBe('number');
      expect(count).toBeGreaterThan(0);
    });
  });

  describe('getDepartmentEmployees', () => {
    it('should retrieve employees in department', async () => {
      const employees = await repository.getDepartmentEmployees(testDepartmentId);

      expect(Array.isArray(employees)).toBe(true);
    });
  });

  describe('getDepartmentEmployeeCount', () => {
    it('should count employees in department', async () => {
      const count = await repository.getDepartmentEmployeeCount(testDepartmentId);

      expect(typeof count).toBe('number');
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  describe('searchDepartments', () => {
    it('should search departments by name', async () => {
      const results = await repository.searchDepartments('Engineering');

      expect(Array.isArray(results)).toBe(true);
      expect(results.some((d) => d.name.includes('Engineering'))).toBe(true);
    });
  });

  describe('deleteDepartment', () => {
    it('should delete department', async () => {
      const data: CreateDepartmentDTO = {
        name: 'Delete Test',
      };

      const department = await repository.createDepartment(data);
      await repository.deleteDepartment(department.id);

      const deleted = await repository.getDepartment(department.id);
      expect(deleted).toBeNull();
    });
  });
});
