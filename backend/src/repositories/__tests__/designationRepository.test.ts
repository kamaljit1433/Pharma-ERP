/**
 * Designation Repository - Unit Tests
 * Tests for designation/job title management
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { DesignationRepository } from '../designationRepository';
import db from '../../config/knex';
import { CreateDesignationDTO, UpdateDesignationDTO } from '../../types/hierarchy';

describe('DesignationRepository', () => {
  let repository: DesignationRepository;
  let testDesignationId: string;

  beforeAll(async () => {
    repository = new DesignationRepository(db);

    // Clean up test data
    await db('designations').del();
  });

  afterAll(async () => {
    await db('designations').del();
  });

  describe('createDesignation', () => {
    it('should create designation', async () => {
      const data: CreateDesignationDTO = {
        name: 'Senior Software Engineer',
        description: 'Senior level software engineer position',
        level: 'senior',
      };

      const designation = await repository.createDesignation(data);

      expect(designation).toBeDefined();
      expect(designation.id).toBeDefined();
      expect(designation.name).toBe('Senior Software Engineer');
      expect(designation.level).toBe('senior');

      testDesignationId = designation.id;
    });

    it('should create designation without optional fields', async () => {
      const data: CreateDesignationDTO = {
        name: 'Manager',
      };

      const designation = await repository.createDesignation(data);

      expect(designation.name).toBe('Manager');
    });
  });

  describe('getDesignation', () => {
    it('should retrieve designation by ID', async () => {
      const designation = await repository.getDesignation(testDesignationId);

      expect(designation).toBeDefined();
      expect(designation?.id).toBe(testDesignationId);
      expect(designation?.name).toBe('Senior Software Engineer');
    });

    it('should return null for non-existent designation', async () => {
      const designation = await repository.getDesignation('00000000-0000-4000-a000-ffffffffffff');

      expect(designation).toBeNull();
    });
  });

  describe('getDesignationByName', () => {
    it('should retrieve designation by name', async () => {
      const designation = await repository.getDesignationByName('Senior Software Engineer');

      expect(designation).toBeDefined();
      expect(designation?.name).toBe('Senior Software Engineer');
    });

    it('should return null for non-existent name', async () => {
      const designation = await repository.getDesignationByName('NonExistent');

      expect(designation).toBeNull();
    });
  });

  describe('updateDesignation', () => {
    it('should update designation', async () => {
      const updateData: UpdateDesignationDTO = {
        name: 'Lead Software Engineer',
        level: 'lead',
      };

      const updated = await repository.updateDesignation(testDesignationId, updateData);

      expect(updated.name).toBe('Lead Software Engineer');
      expect(updated.level).toBe('lead');
    });

    it('should throw error for non-existent designation', async () => {
      await expect(
        repository.updateDesignation('00000000-0000-4000-a000-ffffffffffff', { name: 'Test' })
      ).rejects.toThrow();
    });
  });

  describe('getAllDesignations', () => {
    it('should retrieve all designations', async () => {
      const designations = await repository.getAllDesignations();

      expect(Array.isArray(designations)).toBe(true);
      expect(designations.length).toBeGreaterThan(0);
    });
  });

  describe('getDesignationsByLevel', () => {
    it('should retrieve designations by level', async () => {
      const designations = await repository.getDesignationsByLevel('senior');

      expect(Array.isArray(designations)).toBe(true);
    });
  });

  describe('getDesignationCount', () => {
    it('should count all designations', async () => {
      const count = await repository.getDesignationCount();

      expect(typeof count).toBe('number');
      expect(count).toBeGreaterThan(0);
    });
  });

  describe('searchDesignations', () => {
    it('should search designations by name', async () => {
      const results = await repository.searchDesignations('Engineer');

      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe('deleteDesignation', () => {
    it('should delete designation', async () => {
      const data: CreateDesignationDTO = {
        name: 'Delete Test',
      };

      const designation = await repository.createDesignation(data);
      await repository.deleteDesignation(designation.id);

      const deleted = await repository.getDesignation(designation.id);
      expect(deleted).toBeNull();
    });
  });
});
