/**
 * Insurance Plan Repository - Unit Tests
 * Tests for insurance plan CRUD operations, filtering, and status management
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { InsurancePlanRepository } from '../insurancePlanRepository';
import db from '../../config/knex';
import { CreateInsurancePlanDTO } from '../../types/insurance';

describe('InsurancePlanRepository', () => {
  let repository: InsurancePlanRepository;
  let testPlanId: string;

  beforeAll(async () => {
    repository = new InsurancePlanRepository(db);
    await db('insurance_plans').del();
  });

  afterAll(async () => {
    await db('insurance_plans').del();
  });

  describe('createInsurancePlan', () => {
    it('should create an insurance plan with valid data', async () => {
      const data: CreateInsurancePlanDTO = {
        name: 'Health Insurance',
        provider: 'ABC Insurance',
        description: 'Comprehensive health coverage',
        premium_amount: 5000,
        coverage_type: 'health',
        enrollment_start_date: new Date('2024-01-01'),
        enrollment_end_date: new Date('2024-12-31'),
      };

      const plan = await repository.createInsurancePlan(data);

      expect(plan).toBeDefined();
      expect(plan.id).toBeDefined();
      expect(plan.name).toBe('Health Insurance');
      expect(plan.provider).toBe('ABC Insurance');
      expect(plan.premium_amount).toBe(5000);
      expect(plan.is_active).toBe(true);

      testPlanId = plan.id;
    });

    it('should create plans with different coverage types', async () => {
      const types = ['health', 'dental', 'vision', 'life'] as const;

      for (const type of types) {
        const plan = await repository.createInsurancePlan({
          name: `${type} Plan`,
          provider: 'Test Provider',
          description: `${type} coverage`,
          premium_amount: 1000,
          coverage_type: type,
          enrollment_start_date: new Date('2024-01-01'),
          enrollment_end_date: new Date('2024-12-31'),
        });

        expect(plan.coverage_type).toBe(type);
      }
    });
  });

  describe('getInsurancePlanById', () => {
    it('should retrieve insurance plan by ID', async () => {
      const plan = await repository.getInsurancePlanById(testPlanId);

      expect(plan).toBeDefined();
      expect(plan?.id).toBe(testPlanId);
      expect(plan?.name).toBe('Health Insurance');
    });

    it('should return null for non-existent ID', async () => {
      const plan = await repository.getInsurancePlanById('00000000-0000-4000-a000-ffffffffffff');
      expect(plan).toBeNull();
    });
  });

  describe('getAllInsurancePlans', () => {
    it('should retrieve all insurance plans', async () => {
      const plans = await repository.getAllInsurancePlans();

      expect(Array.isArray(plans)).toBe(true);
      expect(plans.length).toBeGreaterThan(0);
    });

    it('should filter by active status', async () => {
      const activePlans = await repository.getAllInsurancePlans(true);

      expect(Array.isArray(activePlans)).toBe(true);
      activePlans.forEach((plan) => {
        expect(plan.is_active).toBe(true);
      });
    });

    it('should filter by inactive status', async () => {
      // Create an inactive plan
      const plan = await repository.createInsurancePlan({
        name: 'Inactive Plan',
        provider: 'Test',
        description: 'Test',
        premium_amount: 1000,
        coverage_type: 'health',
        enrollment_start_date: new Date('2024-01-01'),
        enrollment_end_date: new Date('2024-12-31'),
      });

      await repository.updateInsurancePlan(plan.id, { is_active: false });

      const inactivePlans = await repository.getAllInsurancePlans(false);
      const found = inactivePlans.find((p) => p.id === plan.id);

      expect(found).toBeDefined();
      expect(found?.is_active).toBe(false);
    });
  });

  describe('getActiveInsurancePlans', () => {
    it('should retrieve only active insurance plans', async () => {
      const plans = await repository.getActiveInsurancePlans();

      expect(Array.isArray(plans)).toBe(true);
      plans.forEach((plan) => {
        expect(plan.is_active).toBe(true);
      });
    });
  });

  describe('getInsurancePlansByType', () => {
    it('should retrieve insurance plans by coverage type', async () => {
      const plans = await repository.getInsurancePlansByType('health');

      expect(Array.isArray(plans)).toBe(true);
      plans.forEach((plan) => {
        expect(plan.coverage_type).toBe('health');
        expect(plan.is_active).toBe(true);
      });
    });

    it('should return empty array for non-existent type', async () => {
      const plans = await repository.getInsurancePlansByType('non-existent-type');
      expect(plans).toEqual([]);
    });
  });

  describe('updateInsurancePlan', () => {
    it('should update insurance plan properties', async () => {
      const updated = await repository.updateInsurancePlan(testPlanId, {
        name: 'Updated Health Insurance',
        premium_amount: 6000,
      });

      expect(updated.name).toBe('Updated Health Insurance');
      expect(updated.premium_amount).toBe(6000);
    });

    it('should update active status', async () => {
      const updated = await repository.updateInsurancePlan(testPlanId, {
        is_active: false,
      });

      expect(updated.is_active).toBe(false);
    });

    it('should update enrollment dates', async () => {
      const newStart = new Date('2025-01-01');
      const newEnd = new Date('2025-12-31');

      const updated = await repository.updateInsurancePlan(testPlanId, {
        enrollment_start_date: newStart,
        enrollment_end_date: newEnd,
      });

      const toLocalDate = (d: any) => { const x = new Date(d); return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}-${String(x.getDate()).padStart(2,'0')}`; };
      expect(toLocalDate(updated.enrollment_start_date)).toBe('2025-01-01');
      expect(toLocalDate(updated.enrollment_end_date)).toBe('2025-12-31');
    });
  });

  describe('deleteInsurancePlan', () => {
    it('should delete an insurance plan', async () => {
      const plan = await repository.createInsurancePlan({
        name: 'Plan to Delete',
        provider: 'Test',
        description: 'Test',
        premium_amount: 1000,
        coverage_type: 'health',
        enrollment_start_date: new Date('2024-01-01'),
        enrollment_end_date: new Date('2024-12-31'),
      });

      await repository.deleteInsurancePlan(plan.id);

      const deleted = await repository.getInsurancePlanById(plan.id);
      expect(deleted).toBeNull();
    });
  });

  describe('CRUD operations', () => {
    it('should support full CRUD lifecycle', async () => {
      // Create
      const created = await repository.createInsurancePlan({
        name: 'CRUD Test Plan',
        provider: 'Test Provider',
        description: 'Test',
        premium_amount: 2000,
        coverage_type: 'dental',
        enrollment_start_date: new Date('2024-01-01'),
        enrollment_end_date: new Date('2024-12-31'),
      });

      expect(created.id).toBeDefined();

      // Read
      const read = await repository.getInsurancePlanById(created.id);
      expect(read?.name).toBe('CRUD Test Plan');

      // Update
      const updated = await repository.updateInsurancePlan(created.id, {
        name: 'Updated CRUD Plan',
        premium_amount: 3000,
      });

      expect(updated.name).toBe('Updated CRUD Plan');
      expect(updated.premium_amount).toBe(3000);

      // Delete
      await repository.deleteInsurancePlan(created.id);
      const deleted = await repository.getInsurancePlanById(created.id);
      expect(deleted).toBeNull();
    });
  });

  describe('edge cases', () => {
    it('should handle zero premium amount', async () => {
      const plan = await repository.createInsurancePlan({
        name: 'Free Plan',
        provider: 'Test',
        description: 'Free coverage',
        premium_amount: 0,
        coverage_type: 'health',
        enrollment_start_date: new Date('2024-01-01'),
        enrollment_end_date: new Date('2024-12-31'),
      });

      expect(plan.premium_amount).toBe(0);
    });

    it('should handle very large premium amounts', async () => {
      const plan = await repository.createInsurancePlan({
        name: 'Premium Plan',
        provider: 'Test',
        description: 'Expensive coverage',
        premium_amount: 999999.99,
        coverage_type: 'health',
        enrollment_start_date: new Date('2024-01-01'),
        enrollment_end_date: new Date('2024-12-31'),
      });

      expect(plan.premium_amount).toBe(999999.99);
    });

    it('should handle same enrollment start and end dates', async () => {
      const date = new Date('2024-06-15');
      const plan = await repository.createInsurancePlan({
        name: 'Single Day Plan',
        provider: 'Test',
        description: 'Test',
        premium_amount: 1000,
        coverage_type: 'health',
        enrollment_start_date: date,
        enrollment_end_date: date,
      });

      const toLocalDate = (d: any) => { const x = new Date(d); return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}-${String(x.getDate()).padStart(2,'0')}`; };
      expect(toLocalDate(plan.enrollment_start_date)).toBe('2024-06-15');
      expect(toLocalDate(plan.enrollment_end_date)).toBe('2024-06-15');
    });
  });
});
