/**
 * Reimbursement Claim Repository - Unit Tests
 * Tests for reimbursement claim CRUD operations
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { ReimbursementClaimRepository } from '../reimbursementClaimRepository';
import db from '../../config/knex';

describe('ReimbursementClaimRepository', () => {
  let repository: ReimbursementClaimRepository;
  let testClaimId: string;
  let testEmployeeId: string;

  beforeAll(async () => {
    repository = new ReimbursementClaimRepository(db);

    // Clean up test data
    await db('reimbursement_claims').del();
    await db('employees').del();

    // Create test employee
    const [emp] = await db('employees')
      .insert({
        id: 'a1000000-0000-4000-a000-000000000005',
        employee_id: 'EMP-REIMB-001',
        first_name: 'Test',
        last_name: 'Employee',
        email: 'test@example.com',
        phone: '+1234567890',
        date_of_joining: new Date(),
        employment_type: 'permanent',
        status: 'active',
      })
      .returning('*');

    testEmployeeId = emp.id;
  });

  afterAll(async () => {
    await db('reimbursement_claims').del();
    await db('employees').del();
  });

  describe('createClaim', () => {
    it('should create a reimbursement claim with valid data', async () => {
      const claim = await repository.createClaim({
        employee_id: testEmployeeId,
        category: 'travel',
        amount: 5000,
        currency: 'USD',
        description: 'Flight tickets for client meeting',
        claim_date: new Date(),
        status: 'pending',
      });

      expect(claim).toBeDefined();
      expect(claim.id).toBeDefined();
      expect(claim.employee_id).toBe(testEmployeeId);
      expect(claim.amount).toBe(5000);
      expect(claim.status).toBe('pending');

      testClaimId = claim.id;
    });

    it('should create claims with different categories', async () => {
      const categories = ['travel', 'meals', 'accommodation', 'supplies', 'other'];

      for (const category of categories) {
        const claim = await repository.createClaim({
          employee_id: testEmployeeId,
          category,
          amount: 1000,
          currency: 'USD',
          description: `${category} expense`,
          claim_date: new Date(),
          status: 'pending',
        });

        expect(claim.category).toBe(category);
      }
    });

    it('should create claims with different statuses', async () => {
      const statuses = ['pending', 'approved', 'rejected', 'paid'];

      for (const status of statuses) {
        const claim = await repository.createClaim({
          employee_id: testEmployeeId,
          category: 'travel',
          amount: 1000,
          currency: 'USD',
          description: `Status: ${status}`,
          claim_date: new Date(),
          status: status as any,
        });

        expect(claim.status).toBe(status);
      }
    });
  });

  describe('getClaimById', () => {
    it('should retrieve claim by ID', async () => {
      const claim = await repository.getClaimById(testClaimId);

      expect(claim).toBeDefined();
      expect(claim?.id).toBe(testClaimId);
      expect(claim?.employee_id).toBe(testEmployeeId);
    });

    it('should return null for non-existent ID', async () => {
      const claim = await repository.getClaimById('00000000-0000-4000-a000-ffffffffffff');
      expect(claim).toBeNull();
    });
  });

  describe('getClaimsByEmployee', () => {
    it('should retrieve claims by employee ID', async () => {
      const claims = await repository.getClaimsByEmployee(testEmployeeId);

      expect(Array.isArray(claims)).toBe(true);
      expect(claims.length).toBeGreaterThan(0);
      claims.forEach((c) => {
        expect(c.employee_id).toBe(testEmployeeId);
      });
    });

    it('should return empty array for non-existent employee', async () => {
      const claims = await repository.getClaimsByEmployee('00000000-0000-4000-a000-fffffffffffe');
      expect(claims).toEqual([]);
    });
  });

  describe('getClaimsByStatus', () => {
    it('should retrieve claims by status', async () => {
      const claims = await repository.getClaimsByStatus('pending');

      expect(Array.isArray(claims)).toBe(true);
      claims.forEach((c) => {
        expect(c.status).toBe('pending');
      });
    });
  });

  describe('updateClaim', () => {
    it('should update claim properties', async () => {
      const updated = await repository.updateClaim(testClaimId, {
        amount: 6000,
        description: 'Updated description',
      });

      expect(updated.amount).toBe(6000);
      expect(updated.description).toBe('Updated description');
    });

    it('should update claim status', async () => {
      const updated = await repository.updateClaim(testClaimId, {
        status: 'approved',
      });

      expect(updated.status).toBe('approved');
    });
  });

  describe('approveClaim', () => {
    it('should approve a claim', async () => {
      const claim = await repository.createClaim({
        employee_id: testEmployeeId,
        category: 'travel',
        amount: 2000,
        currency: 'USD',
        description: 'To approve',
        claim_date: new Date(),
        status: 'pending',
      });

      const approved = await repository.approveClaim(claim.id, testEmployeeId);

      expect(approved.status).toBe('approved');
    });
  });

  describe('rejectClaim', () => {
    it('should reject a claim', async () => {
      const claim = await repository.createClaim({
        employee_id: testEmployeeId,
        category: 'travel',
        amount: 2000,
        currency: 'USD',
        description: 'To reject',
        claim_date: new Date(),
        status: 'pending',
      });

      const rejected = await repository.rejectClaim(claim.id, testEmployeeId, 'Insufficient documentation');

      expect(rejected.status).toBe('rejected');
    });
  });

  describe('deleteClaim', () => {
    it('should delete a claim', async () => {
      const claim = await repository.createClaim({
        employee_id: testEmployeeId,
        category: 'travel',
        amount: 1000,
        currency: 'USD',
        description: 'To delete',
        claim_date: new Date(),
        status: 'pending',
      });

      await repository.deleteClaim(claim.id);

      const deleted = await repository.getClaimById(claim.id);
      expect(deleted).toBeNull();
    });
  });

  describe('CRUD operations', () => {
    it('should support full CRUD lifecycle', async () => {
      // Create
      const created = await repository.createClaim({
        employee_id: testEmployeeId,
        category: 'meals',
        amount: 500,
        currency: 'USD',
        description: 'CRUD test',
        claim_date: new Date(),
        status: 'pending',
      });

      expect(created.id).toBeDefined();

      // Read
      const read = await repository.getClaimById(created.id);
      expect(read?.description).toBe('CRUD test');

      // Update
      const updated = await repository.updateClaim(created.id, {
        amount: 600,
      });

      expect(updated.amount).toBe(600);

      // Delete
      await repository.deleteClaim(created.id);
      const deleted = await repository.getClaimById(created.id);
      expect(deleted).toBeNull();
    });
  });

  describe('edge cases', () => {
    it('should handle different currencies', async () => {
      const currencies = ['USD', 'EUR', 'GBP', 'INR'];

      for (const currency of currencies) {
        const claim = await repository.createClaim({
          employee_id: testEmployeeId,
          category: 'travel',
          amount: 1000,
          currency,
          description: `Currency: ${currency}`,
          claim_date: new Date(),
          status: 'pending',
        });

        expect(claim.amount).toBe(1000); // currency not stored in DB
      }
    });

    it('should handle zero amount', async () => {
      const claim = await repository.createClaim({
        employee_id: testEmployeeId,
        category: 'travel',
        amount: 0,
        currency: 'USD',
        description: 'Zero amount',
        claim_date: new Date(),
        status: 'pending',
      });

      expect(claim.amount).toBe(0);
    });

    it('should handle very large amounts', async () => {
      const claim = await repository.createClaim({
        employee_id: testEmployeeId,
        category: 'travel',
        amount: 999999.99,
        currency: 'USD',
        description: 'Large amount',
        claim_date: new Date(),
        status: 'pending',
      });

      expect(claim.amount).toBe(999999.99);
    });

    it('should handle long descriptions', async () => {
      const longDescription = 'A'.repeat(5000);

      const claim = await repository.createClaim({
        employee_id: testEmployeeId,
        category: 'travel',
        amount: 1000,
        currency: 'USD',
        description: longDescription,
        claim_date: new Date(),
        status: 'pending',
      });

      expect(claim.description?.length).toBe(5000);
    });
  });
});
