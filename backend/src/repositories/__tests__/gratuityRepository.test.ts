/**
 * Gratuity Repository - Unit Tests
 * Tests for gratuity CRUD operations
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import db from '../../config/knex';

describe('Gratuity Operations', () => {
  const testEmployeeId = 'a0000000-0000-4000-a000-000000000001';
  let testGratuityId: string;

  beforeAll(async () => {
    await db('gratuity').del();
    // Create test employee (FK requirement)
    await db('employees')
      .insert({
        id: testEmployeeId,
        employee_id: 'EMP-TEST-001',
        first_name: 'Test',
        last_name: 'Employee',
        email: 'test.employee@example.com',
        phone: '+1234567890',
        date_of_joining: new Date(),
        employment_type: 'permanent',
        status: 'active',
      })
      .onConflict('id')
      .ignore();
  });

  afterAll(async () => {
    await db('employees').del();
    await db('gratuity').del();
  });

  describe('Create Gratuity Record', () => {
    it('should create gratuity record', async () => {
      const [gratuity] = await db('gratuity')
        .insert({
          employee_id: testEmployeeId,
          years_of_service: 5,
          last_drawn_salary: 50000,
          gratuity_amount: 96153.85,
          calculation_method: 'statutory',
          status: 'calculated',
        })
        .returning('*');

      expect(gratuity).toBeDefined();
      expect(gratuity.id).toBeDefined();
      expect(gratuity.employee_id).toBe(testEmployeeId);
      expect(gratuity.years_of_service).toBe(5);
      expect(gratuity.status).toBe('calculated');

      testGratuityId = gratuity.id;
    });
  });

  describe('Retrieve Gratuity', () => {
    it('should retrieve gratuity by ID', async () => {
      const gratuity = await db('gratuity')
        .where({ id: testGratuityId })
        .first();

      expect(gratuity).toBeDefined();
      expect(gratuity.id).toBe(testGratuityId);
    });

    it('should retrieve gratuity by employee', async () => {
      const gratuity = await db('gratuity')
        .where({ employee_id: testEmployeeId })
        .first();

      expect(gratuity).toBeDefined();
      expect(gratuity.employee_id).toBe(testEmployeeId);
    });

    it('should return null for employee with no gratuity', async () => {
      const gratuity = await db('gratuity')
        .where({ employee_id: 'emp-no-gratuity' })
        .first();

      expect(gratuity).toBeUndefined();
    });
  });

  describe('Update Gratuity', () => {
    it('should update gratuity amount', async () => {
      await db('gratuity').where({ id: testGratuityId }).update({
        gratuity_amount: 100000,
      });

      const updated = await db('gratuity')
        .where({ id: testGratuityId })
        .first();

      expect(updated.gratuity_amount).toBe(100000);
    });

    it('should update gratuity status', async () => {
      await db('gratuity').where({ id: testGratuityId }).update({
        status: 'approved',
      });

      const updated = await db('gratuity')
        .where({ id: testGratuityId })
        .first();

      expect(updated.status).toBe('approved');
    });

    it('should update payment details', async () => {
      await db('gratuity').where({ id: testGratuityId }).update({
        status: 'paid',
        payment_date: new Date().toISOString().split('T')[0],
        payment_reference: 'GRAT-12345',
      });

      const updated = await db('gratuity')
        .where({ id: testGratuityId })
        .first();

      expect(updated.status).toBe('paid');
      expect(updated.payment_reference).toBe('GRAT-12345');
    });
  });

  describe('Delete Gratuity', () => {
    it('should delete gratuity record', async () => {
      const [gratuity] = await db('gratuity')
        .insert({
          employee_id: testEmployeeId,
          years_of_service: 3,
          last_drawn_salary: 40000,
          gratuity_amount: 0,
          status: 'not_eligible',
        })
        .returning('*');

      await db('gratuity').where({ id: gratuity.id }).del();

      const deleted = await db('gratuity')
        .where({ id: gratuity.id })
        .first();

      expect(deleted).toBeUndefined();
    });
  });

  describe('Query Gratuity', () => {
    it('should retrieve gratuity by status', async () => {
      const gratuities = await db('gratuity')
        .where({ status: 'calculated' });

      expect(Array.isArray(gratuities)).toBe(true);
      expect(gratuities.every((g) => g.status === 'calculated')).toBe(true);
    });

    it('should retrieve paid gratuities', async () => {
      const gratuities = await db('gratuity')
        .where({ status: 'paid' });

      expect(Array.isArray(gratuities)).toBe(true);
      expect(gratuities.every((g) => g.status === 'paid')).toBe(true);
    });

    it('should retrieve gratuities by calculation method', async () => {
      const gratuities = await db('gratuity')
        .where({ calculation_method: 'statutory' });

      expect(Array.isArray(gratuities)).toBe(true);
      expect(gratuities.every((g) => g.calculation_method === 'statutory')).toBe(true);
    });
  });

  describe('Gratuity Eligibility', () => {
    it('should identify eligible employees', async () => {
      const gratuities = await db('gratuity')
        .where('years_of_service', '>=', 5);

      expect(Array.isArray(gratuities)).toBe(true);
      expect(gratuities.every((g) => g.years_of_service >= 5)).toBe(true);
    });

    it('should identify ineligible employees', async () => {
      const gratuities = await db('gratuity')
        .where('years_of_service', '<', 5);

      expect(Array.isArray(gratuities)).toBe(true);
      expect(gratuities.every((g) => g.years_of_service < 5)).toBe(true);
    });
  });

  describe('Gratuity Calculations', () => {
    it('should validate gratuity formula', async () => {
      const gratuity = await db('gratuity')
        .where({ id: testGratuityId })
        .first();

      // Formula: (last_drawn_salary × years_of_service × 15) / 26
      const expectedGratuity = (gratuity.last_drawn_salary * gratuity.years_of_service * 15) / 26;

      // Allow for rounding differences
      expect(Math.abs(gratuity.gratuity_amount - expectedGratuity)).toBeLessThan(1);
    });

    it('should calculate total gratuity payable', async () => {
      const result = await db('gratuity')
        .sum('gratuity_amount as total_gratuity')
        .first();

      expect(result?.total_gratuity).toBeGreaterThanOrEqual(0);
    });
  });
});
