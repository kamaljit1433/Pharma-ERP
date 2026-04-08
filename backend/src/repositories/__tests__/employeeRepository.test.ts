/**
 * Employee Repository - Unit Tests
 * Tests for employee CRUD operations, emergency contacts, employment history,
 * and archiving functionality
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { EmployeeRepository } from '../employeeRepository';
import db from '../../config/knex';
import { CreateEmployeeDTO, UpdateEmployeeDTO } from '../../types/employee';

describe('EmployeeRepository', () => {
  let repository: EmployeeRepository;
  let testEmployeeId: string;

  beforeAll(async () => {
    repository = new EmployeeRepository(db);
    // Clean up test data
    await db('emergency_contacts').del();
    await db('employment_history').del();
    await db('employees').del();
    await db('employees')
      .insert({
        id: 'c0000000-0000-4000-a000-000000000101',
        employee_id: 'EMP-MGR-001',
        first_name: 'Manager',
        last_name: 'One',
        email: 'mgr1@example.com',
        employment_type: 'permanent',
        status: 'active',
        date_of_joining: new Date()
      })
      .onConflict('id').ignore();
  });

  afterAll(async () => {
    await db('emergency_contacts').del();
    await db('employment_history').del();
    await db('employees').del();
  });

  describe('createEmployee', () => {
    it('should create an employee with valid data', async () => {
      const data: CreateEmployeeDTO = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        personal_email: 'john.personal@example.com',
        date_of_birth: '1990-01-15',
        gender: 'male',
        blood_group: 'O+',
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        postal_code: '10001',
        country: 'USA',
        pan: 'ABCDE1234F',
        aadhar: '123456789012',
        department_id: 'd0000000-0000-4000-f000-000000000001',
        designation_id: 'd0000000-0000-4000-f000-000000000011',
        reporting_manager_id: 'c0000000-0000-4000-a000-000000000101',
        date_of_joining: '2024-01-01',
        employment_type: 'permanent',
      };

      const employee = await repository.createEmployee(data);

      expect(employee).toBeDefined();
      expect(employee.id).toBeDefined();
      expect(employee.employee_id).toMatch(/^EMP-/);
      expect(employee.first_name).toBe('John');
      expect(employee.last_name).toBe('Doe');
      expect(employee.email).toBe('john.doe@example.com');
      expect(employee.status).toBe('active');
      expect(employee.created_at).toBeDefined();

      testEmployeeId = employee.id;
    });

    it('should generate unique employee IDs', async () => {
      const data1: CreateEmployeeDTO = {
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane.smith@example.com',
        phone: '+1234567891',
        date_of_joining: '2024-01-01',
        employment_type: 'permanent',
      };

      const data2: CreateEmployeeDTO = {
        first_name: 'Bob',
        last_name: 'Johnson',
        email: 'bob.johnson@example.com',
        phone: '+1234567892',
        date_of_joining: '2024-01-01',
        employment_type: 'permanent',
      };

      const emp1 = await repository.createEmployee(data1);
      const emp2 = await repository.createEmployee(data2);

      expect(emp1.employee_id).not.toBe(emp2.employee_id);
    });
  });

  describe('getEmployee', () => {
    it('should retrieve employee by ID', async () => {
      const employee = await repository.getEmployee(testEmployeeId);

      expect(employee).toBeDefined();
      expect(employee?.id).toBe(testEmployeeId);
      expect(employee?.first_name).toBe('John');
    });

    it('should return null for non-existent employee', async () => {
      const employee = await repository.getEmployee('00000000-0000-4000-a000-ffffffffffff');

      expect(employee).toBeNull();
    });
  });

  describe('getEmployeeByEmail', () => {
    it('should retrieve employee by email', async () => {
      const employee = await repository.getEmployeeByEmail('john.doe@example.com');

      expect(employee).toBeDefined();
      expect(employee?.email).toBe('john.doe@example.com');
    });

    it('should return null for non-existent email', async () => {
      const employee = await repository.getEmployeeByEmail('nonexistent@example.com');

      expect(employee).toBeNull();
    });
  });

  describe('updateEmployee', () => {
    it('should update employee data', async () => {
      const updateData: UpdateEmployeeDTO = {
        first_name: 'Jonathan',
        phone: '+9876543210',
      };

      const updated = await repository.updateEmployee(testEmployeeId, updateData);

      expect(updated.first_name).toBe('Jonathan');
      expect(updated.phone).toBe('+9876543210');
      expect(updated.updated_at).toBeDefined();
    });

    it('should throw error for non-existent employee', async () => {
      await expect(
        repository.updateEmployee('00000000-0000-4000-a000-ffffffffffff', { first_name: 'Test' })
      ).rejects.toThrow('Employee not found or update failed');
    });
  });

  describe('updateEmployeeStatus', () => {
    it('should update employee status', async () => {
      const updated = await repository.updateEmployeeStatus(testEmployeeId, 'on_leave');

      expect(updated.status).toBe('on_leave');

      // Reset status
      await repository.updateEmployeeStatus(testEmployeeId, 'active');
    });

    it('should throw error for non-existent employee', async () => {
      await expect(
        repository.updateEmployeeStatus('00000000-0000-4000-a000-ffffffffffff', 'active')
      ).rejects.toThrow('Employee not found or status update failed');
    });
  });

  describe('searchEmployees', () => {
    it('should search employees by name', async () => {
      const results = await repository.searchEmployees({ search: 'John' });

      expect(results.length).toBeGreaterThan(0);
      expect(results.some((e) => e.first_name === 'John')).toBe(true);
    });

    it('should search employees by email', async () => {
      const results = await repository.searchEmployees({ search: 'john.doe' });

      expect(results.length).toBeGreaterThan(0);
    });

    it('should filter by status', async () => {
      const results = await repository.searchEmployees({ status: 'active' });

      expect(results.length).toBeGreaterThan(0);
      expect(results.every((e) => e.status === 'active')).toBe(true);
    });

    it('should filter by employment type', async () => {
      const results = await repository.searchEmployees({ employment_type: 'permanent' });

      expect(results.length).toBeGreaterThan(0);
    });

    it('should support pagination', async () => {
      const page1 = await repository.searchEmployees({ limit: 2, offset: 0 });
      const page2 = await repository.searchEmployees({ limit: 2, offset: 2 });

      expect(page1.length).toBeLessThanOrEqual(2);
      expect(page2.length).toBeLessThanOrEqual(2);
    });
  });

  describe('getAllEmployees', () => {
    it('should retrieve all employees', async () => {
      const employees = await repository.getAllEmployees();

      expect(Array.isArray(employees)).toBe(true);
      expect(employees.length).toBeGreaterThan(0);
    });

    it('should support pagination', async () => {
      const page1 = await repository.getAllEmployees(2, 0);
      const page2 = await repository.getAllEmployees(2, 2);

      expect(page1.length).toBeLessThanOrEqual(2);
      expect(page2.length).toBeLessThanOrEqual(2);
    });
  });

  describe('getEmployeeCount', () => {
    it('should count all employees', async () => {
      const count = await repository.getEmployeeCount();

      expect(typeof count).toBe('number');
      expect(count).toBeGreaterThan(0);
    });

    it('should count with filters', async () => {
      const count = await repository.getEmployeeCount({ status: 'active' });

      expect(typeof count).toBe('number');
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Emergency Contacts', () => {
    describe('addEmergencyContact', () => {
      it('should add emergency contact', async () => {
        const contact = await repository.addEmergencyContact(testEmployeeId, {
          name: 'Jane Doe',
          relationship: 'spouse',
          phone: '+1111111111',
          email: 'jane@example.com',
          address: '123 Main St',
          priority: 1,
        });

        expect(contact).toBeDefined();
        expect(contact.id).toBeDefined();
        expect(contact.name).toBe('Jane Doe');
        expect(contact.employee_id).toBe(testEmployeeId);
      });
    });

    describe('getEmergencyContacts', () => {
      it('should retrieve emergency contacts for employee', async () => {
        const contacts = await repository.getEmergencyContacts(testEmployeeId);

        expect(Array.isArray(contacts)).toBe(true);
        expect(contacts.length).toBeGreaterThan(0);
      });
    });

    describe('updateEmergencyContact', () => {
      it('should update emergency contact', async () => {
        const contacts = await repository.getEmergencyContacts(testEmployeeId);
        const contactId = contacts[0]?.id;

        expect(contactId).toBeDefined();

        const updated = await repository.updateEmergencyContact(contactId!, {
          phone: '+2222222222',
        });

        expect(updated.phone).toBe('+2222222222');
      });
    });

    describe('deleteEmergencyContact', () => {
      it('should delete emergency contact', async () => {
        const contact = await repository.addEmergencyContact(testEmployeeId, {
          name: 'Test Contact',
          relationship: 'friend',
          phone: '+3333333333',
        });

        await repository.deleteEmergencyContact(contact.id);

        const deleted = await repository.getEmergencyContactById(contact.id);
        expect(deleted).toBeNull();
      });
    });

    describe('getEmergencyContactCount', () => {
      it('should count emergency contacts', async () => {
        const count = await repository.getEmergencyContactCount(testEmployeeId);

        expect(typeof count).toBe('number');
        expect(count).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('Employment History', () => {
    describe('addEmploymentHistory', () => {
      it('should add employment history', async () => {
        const history = await repository.addEmploymentHistory(testEmployeeId, {
          designation_id: 'd0000000-0000-4000-f000-000000000011',
          department_id: 'd0000000-0000-4000-f000-000000000001',
          from_date: '2024-01-01',
          to_date: '2024-06-01',
          reason: 'Promotion',
        });

        expect(history).toBeDefined();
        expect(history.id).toBeDefined();
        expect(history.employee_id).toBe(testEmployeeId);
        expect(history.reason).toBe('Promotion');
      });
    });

    describe('getEmploymentHistory', () => {
      it('should retrieve employment history', async () => {
        const history = await repository.getEmploymentHistory(testEmployeeId);

        expect(Array.isArray(history)).toBe(true);
      });
    });
  });

  describe('Archiving', () => {
    describe('archiveEmployee', () => {
      it('should archive employee', async () => {
        const data: CreateEmployeeDTO = {
          first_name: 'Archive',
          last_name: 'Test',
          email: 'archive.test@example.com',
          phone: '+1234567899',
          date_of_joining: '2024-01-01',
          employment_type: 'permanent',
        };

        const employee = await repository.createEmployee(data);
        const archived = await repository.archiveEmployee(employee.id, 'Retired');

        expect(archived.archived_at).toBeDefined();
        expect(archived.archive_reason).toBe('Retired');
      });
    });

    describe('getArchivedEmployees', () => {
      it('should retrieve archived employees', async () => {
        const archived = await repository.getArchivedEmployees();

        expect(Array.isArray(archived)).toBe(true);
      });
    });

    describe('isEmployeeArchived', () => {
      it('should check if employee is archived', async () => {
        const data: CreateEmployeeDTO = {
          first_name: 'Check',
          last_name: 'Archive',
          email: 'check.archive@example.com',
          phone: '+1234567898',
          date_of_joining: '2024-01-01',
          employment_type: 'permanent',
        };

        const employee = await repository.createEmployee(data);
        let isArchived = await repository.isEmployeeArchived(employee.id);
        expect(isArchived).toBe(false);

        await repository.archiveEmployee(employee.id, 'Test');
        isArchived = await repository.isEmployeeArchived(employee.id);
        expect(isArchived).toBe(true);
      });
    });
  });
});
