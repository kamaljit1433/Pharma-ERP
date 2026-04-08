/**
 * Supplier Buyer Repository - Unit Tests
 * Tests for supplier/buyer CRUD operations
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { SupplierBuyerRepository } from '../supplierBuyerRepository';
import db from '../../config/knex';

describe('SupplierBuyerRepository', () => {
  let repository: SupplierBuyerRepository;
  let testRecordId: string;
  let testEmployeeId: string;

  beforeAll(async () => {
    repository = new SupplierBuyerRepository(db);

    // Clean up test data
    await db('suppliers_buyers').del();
    await db('employees').del();

    // Create test employee
    const [emp] = await db('employees')
      .insert({
        id: 'a1000000-0000-4000-a000-000000000008',
        employee_id: 'EMP-SB-001',
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
    await db('suppliers_buyers').del();
    await db('employees').del();
  });

  describe('createRecord', () => {
    it('should create a supplier/buyer record with valid data', async () => {
      const record = await repository.createRecord({
        employee_id: testEmployeeId,
        name: 'ABC Supplies',
        type: 'supplier',
        contact_person: 'John Doe',
        email: 'john@abcsupplies.com',
        phone: '+1234567890',
        address: '123 Business St',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        postal_code: '10001',
      });

      expect(record).toBeDefined();
      expect(record.id).toBeDefined();
      expect(record.employee_id).toBe(testEmployeeId);
      expect(record.name).toBe('ABC Supplies');
      expect(record.type).toBe('supplier');

      testRecordId = record.id;
    });

    it('should create records with different types', async () => {
      const types = ['supplier', 'buyer'];

      for (const type of types) {
        const record = await repository.createRecord({
          employee_id: testEmployeeId,
          name: `${type} Company`,
          type: type as any,
          contact_person: 'Contact',
          email: 'contact@example.com',
          phone: '+1234567890',
          address: '123 St',
          city: 'City',
          state: 'State',
          country: 'Country',
          postal_code: '12345',
        });

        expect(record.type).toBe(type);
      }
    });
  });

  describe('getRecordById', () => {
    it('should retrieve record by ID', async () => {
      const record = await repository.getRecordById(testRecordId);

      expect(record).toBeDefined();
      expect(record?.id).toBe(testRecordId);
      expect(record?.employee_id).toBe(testEmployeeId);
    });

    it('should return null for non-existent ID', async () => {
      const record = await repository.getRecordById('00000000-0000-4000-a000-ffffffffffff');
      expect(record).toBeNull();
    });
  });

  describe('getRecordsByEmployee', () => {
    it('should retrieve records by employee ID', async () => {
      const records = await repository.getRecordsByEmployee(testEmployeeId);

      expect(Array.isArray(records)).toBe(true);
      expect(records.length).toBeGreaterThan(0);
      records.forEach((r) => {
        expect(r.employee_id).toBe(testEmployeeId);
      });
    });

    it('should return empty array for non-existent employee', async () => {
      const records = await repository.getRecordsByEmployee('00000000-0000-4000-a000-fffffffffffe');
      expect(records).toEqual([]);
    });
  });

  describe('getRecordsByType', () => {
    it('should retrieve records by type', async () => {
      const records = await repository.getRecordsByType('supplier');

      expect(Array.isArray(records)).toBe(true);
      records.forEach((r) => {
        expect(r.type).toBe('supplier');
      });
    });
  });

  describe('updateRecord', () => {
    it('should update record properties', async () => {
      const updated = await repository.updateRecord(testRecordId, {
        contact_person: 'Jane Doe',
        email: 'jane@abcsupplies.com',
      });

      expect(updated.contact_person).toBe('Jane Doe');
      expect(updated.email).toBe('jane@abcsupplies.com');
    });

    it('should update address information', async () => {
      const updated = await repository.updateRecord(testRecordId, {
        address: '456 Business Ave',
        city: 'Los Angeles',
        state: 'CA',
      });

      expect(updated.address).toBe('456 Business Ave');
      expect(updated.city).toBe('Los Angeles');
      expect(updated.state).toBe('CA');
    });
  });

  describe('deleteRecord', () => {
    it('should delete a record', async () => {
      const record = await repository.createRecord({
        employee_id: testEmployeeId,
        name: 'To Delete',
        type: 'supplier',
        contact_person: 'Contact',
        email: 'contact@example.com',
        phone: '+1234567890',
        address: '123 St',
        city: 'City',
        state: 'State',
        country: 'Country',
        postal_code: '12345',
      });

      await repository.deleteRecord(record.id);

      const deleted = await repository.getRecordById(record.id);
      expect(deleted).toBeNull();
    });
  });

  describe('CRUD operations', () => {
    it('should support full CRUD lifecycle', async () => {
      // Create
      const created = await repository.createRecord({
        employee_id: testEmployeeId,
        name: 'CRUD Test Company',
        type: 'supplier',
        contact_person: 'Test Contact',
        email: 'test@example.com',
        phone: '+1234567890',
        address: '123 Test St',
        city: 'Test City',
        state: 'TS',
        country: 'Test Country',
        postal_code: '12345',
      });

      expect(created.id).toBeDefined();

      // Read
      const read = await repository.getRecordById(created.id);
      expect(read?.name).toBe('CRUD Test Company');

      // Update
      const updated = await repository.updateRecord(created.id, {
        name: 'Updated CRUD Company',
      });

      expect(updated.name).toBe('Updated CRUD Company');

      // Delete
      await repository.deleteRecord(created.id);
      const deleted = await repository.getRecordById(created.id);
      expect(deleted).toBeNull();
    });
  });

  describe('edge cases', () => {
    it('should handle multiple records for same employee', async () => {
      const r1 = await repository.createRecord({
        employee_id: testEmployeeId,
        name: 'First Company',
        type: 'supplier',
        contact_person: 'Contact 1',
        email: 'contact1@example.com',
        phone: '+1111111111',
        address: '111 St',
        city: 'City 1',
        state: 'S1',
        country: 'Country 1',
        postal_code: '11111',
      });

      const r2 = await repository.createRecord({
        employee_id: testEmployeeId,
        name: 'Second Company',
        type: 'buyer',
        contact_person: 'Contact 2',
        email: 'contact2@example.com',
        phone: '+2222222222',
        address: '222 St',
        city: 'City 2',
        state: 'S2',
        country: 'Country 2',
        postal_code: '22222',
      });

      expect(r1.id).not.toBe(r2.id);

      const records = await repository.getRecordsByEmployee(testEmployeeId);
      expect(records.length).toBeGreaterThanOrEqual(2);
    });

    it('should handle long company names', async () => {
      const longName = 'A'.repeat(500);

      const record = await repository.createRecord({
        employee_id: testEmployeeId,
        name: longName,
        type: 'supplier',
        contact_person: 'Contact',
        email: 'contact@example.com',
        phone: '+1234567890',
        address: '123 St',
        city: 'City',
        state: 'State',
        country: 'Country',
        postal_code: '12345',
      });

      expect(record.name.length).toBe(500);
    });
  });
});
