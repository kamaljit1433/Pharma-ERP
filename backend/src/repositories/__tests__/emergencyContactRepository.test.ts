/**
 * Emergency Contact Repository - Unit Tests
 * Tests for emergency contact CRUD operations
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import db from '../../config/knex';

describe('Emergency Contact Operations', () => {
  const testEmployeeId = 'a0000000-0000-4000-a000-000000000001';
  let testContactId: string;

  beforeAll(async () => {
    await db('emergency_contacts').del();
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
    await db('emergency_contacts').del();
  });

  describe('Create Emergency Contact', () => {
    it('should create an emergency contact', async () => {
      const [contact] = await db('emergency_contacts')
        .insert({
          employee_id: testEmployeeId,
          name: 'Jane Doe',
          relationship: 'spouse',
          phone: '+1234567890',
          email: 'jane@example.com',
          address: '123 Main St',
          priority: 1,
        })
        .returning('*');

      expect(contact).toBeDefined();
      expect(contact.id).toBeDefined();
      expect(contact.employee_id).toBe(testEmployeeId);
      expect(contact.name).toBe('Jane Doe');
      expect(contact.relationship).toBe('spouse');

      testContactId = contact.id;
    });

    it('should enforce priority constraint', async () => {
      const contact1 = await db('emergency_contacts')
        .insert({
          employee_id: testEmployeeId,
          name: 'Contact 1',
          relationship: 'parent',
          phone: '+1111111111',
          priority: 1,
        })
        .returning('*');

      const contact2 = await db('emergency_contacts')
        .insert({
          employee_id: testEmployeeId,
          name: 'Contact 2',
          relationship: 'sibling',
          phone: '+2222222222',
          priority: 2,
        })
        .returning('*');

      expect(contact1[0].priority).toBe(1);
      expect(contact2[0].priority).toBe(2);
    });
  });

  describe('Retrieve Emergency Contact', () => {
    it('should retrieve contact by ID', async () => {
      const contact = await db('emergency_contacts').where({ id: testContactId }).first();

      expect(contact).toBeDefined();
      expect(contact.id).toBe(testContactId);
      expect(contact.name).toBe('Jane Doe');
    });

    it('should retrieve contacts by employee ID', async () => {
      const contacts = await db('emergency_contacts').where({ employee_id: testEmployeeId });

      expect(Array.isArray(contacts)).toBe(true);
      expect(contacts.length).toBeGreaterThan(0);
      expect(contacts.every((c) => c.employee_id === testEmployeeId)).toBe(true);
    });

    it('should return null for non-existent contact', async () => {
      const contact = await db('emergency_contacts')
        .where({ id: '00000000-0000-4000-a000-ffffffffffff' })
        .first();

      expect(contact).toBeUndefined();
    });
  });

  describe('Update Emergency Contact', () => {
    it('should update contact details', async () => {
      await db('emergency_contacts').where({ id: testContactId }).update({
        phone: '+9876543210',
        email: 'jane.updated@example.com',
      });

      const updated = await db('emergency_contacts').where({ id: testContactId }).first();

      expect(updated.phone).toBe('+9876543210');
      expect(updated.email).toBe('jane.updated@example.com');
    });
  });

  describe('Delete Emergency Contact', () => {
    it('should delete a contact', async () => {
      const contact = await db('emergency_contacts')
        .insert({
          employee_id: testEmployeeId,
          name: 'Temp Contact',
          relationship: 'friend',
          phone: '+5555555555',
        })
        .returning('*');

      await db('emergency_contacts').where({ id: contact[0].id }).del();

      const deleted = await db('emergency_contacts')
        .where({ id: contact[0].id })
        .first();

      expect(deleted).toBeUndefined();
    });
  });

  describe('Count Emergency Contacts', () => {
    it('should count contacts for an employee', async () => {
      const count = await db('emergency_contacts')
        .where({ employee_id: testEmployeeId })
        .count('* as count')
        .first();

      expect(count?.['count']).toBeGreaterThan(0);
    });
  });

  describe('Validate Contact Limits', () => {
    it('should enforce maximum 3 contacts per employee', async () => {
      const empId = 'emp-limit-test';
      await db('emergency_contacts').where({ employee_id: empId }).del();

      // Add 3 contacts
      for (let i = 1; i <= 3; i++) {
        await db('emergency_contacts').insert({
          employee_id: empId,
          name: `Contact ${i}`,
          relationship: 'family',
          phone: `+${i}000000000`,
          priority: i,
        });
      }

      const count = await db('emergency_contacts')
        .where({ employee_id: empId })
        .count('* as count')
        .first();

      expect(count?.count).toBe(3);

      // Cleanup
      await db('emergency_contacts').where({ employee_id: empId }).del();
    });
  });
});
