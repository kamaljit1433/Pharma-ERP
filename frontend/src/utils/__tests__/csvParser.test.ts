import { describe, it, expect } from 'vitest';
import {
  parseCSV,
  validateEmployeeCSV,
  generateEmployeeCSV,
  csvToBlob,
} from '../csvParser';

describe('CSV Parser Utility', () => {
  describe('parseCSV', () => {
    it('should parse valid CSV content', () => {
      const csv = `employee_id,first_name,last_name,email,date_of_joining,employment_type
EMP001,John,Doe,john@example.com,2023-01-15,permanent`;

      const result = parseCSV(csv);

      expect(result.data).toHaveLength(1);
      expect(result.errors).toHaveLength(0);
      expect(result.data[0]).toEqual({
        employee_id: 'EMP001',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        date_of_joining: '2023-01-15',
        employment_type: 'permanent',
      });
    });

    it('should handle multiple rows', () => {
      const csv = `employee_id,first_name,last_name,email,date_of_joining,employment_type
EMP001,John,Doe,john@example.com,2023-01-15,permanent
EMP002,Jane,Smith,jane@example.com,2023-06-20,contract`;

      const result = parseCSV(csv);

      expect(result.data).toHaveLength(2);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle quoted values with commas', () => {
      const csv = `employee_id,first_name,last_name,email,date_of_joining,employment_type
EMP001,"Doe, John",Smith,john@example.com,2023-01-15,permanent`;

      const result = parseCSV(csv);

      expect(result.data).toHaveLength(1);
      expect(result.data[0].first_name).toBe('Doe, John');
    });

    it('should handle escaped quotes', () => {
      const csv = `employee_id,first_name,last_name,email,date_of_joining,employment_type
EMP001,"John ""Johnny"" Doe",Smith,john@example.com,2023-01-15,permanent`;

      const result = parseCSV(csv);

      expect(result.data).toHaveLength(1);
      expect(result.data[0].first_name).toBe('John "Johnny" Doe');
    });

    it('should skip empty lines', () => {
      const csv = `employee_id,first_name,last_name,email,date_of_joining,employment_type
EMP001,John,Doe,john@example.com,2023-01-15,permanent

EMP002,Jane,Smith,jane@example.com,2023-06-20,contract`;

      const result = parseCSV(csv);

      expect(result.data).toHaveLength(2);
      expect(result.errors).toHaveLength(0);
    });

    it('should return error for empty CSV', () => {
      const csv = '';

      const result = parseCSV(csv);

      expect(result.data).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('at least a header row');
    });

    it('should return error for header-only CSV', () => {
      const csv = 'employee_id,first_name,last_name,email,date_of_joining,employment_type';

      const result = parseCSV(csv);

      expect(result.data).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
    });

    it('should return error for mismatched column count', () => {
      const csv = `employee_id,first_name,last_name,email,date_of_joining,employment_type
EMP001,John,Doe,john@example.com`;

      const result = parseCSV(csv);

      expect(result.data).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('columns');
    });

    it('should trim whitespace from values', () => {
      const csv = `employee_id,first_name,last_name,email,date_of_joining,employment_type
  EMP001  ,  John  ,  Doe  ,  john@example.com  ,  2023-01-15  ,  permanent  `;

      const result = parseCSV(csv);

      expect(result.data[0].employee_id).toBe('EMP001');
      expect(result.data[0].first_name).toBe('John');
    });
  });

  describe('validateEmployeeCSV', () => {
    it('should validate correct employee data', () => {
      const data = [
        {
          employee_id: 'EMP001',
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          date_of_joining: '2023-01-15',
          employment_type: 'permanent',
        },
      ];

      const result = validateEmployeeCSV(data);

      expect(result.valid).toHaveLength(1);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing required fields', () => {
      const data = [
        {
          employee_id: 'EMP001',
          first_name: 'John',
          // Missing last_name
          email: 'john@example.com',
          date_of_joining: '2023-01-15',
          employment_type: 'permanent',
        },
      ];

      const result = validateEmployeeCSV(data);

      expect(result.valid).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].column).toBe('last_name');
    });

    it('should detect invalid email format', () => {
      const data = [
        {
          employee_id: 'EMP001',
          first_name: 'John',
          last_name: 'Doe',
          email: 'invalid-email',
          date_of_joining: '2023-01-15',
          employment_type: 'permanent',
        },
      ];

      const result = validateEmployeeCSV(data);

      expect(result.valid).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].column).toBe('email');
    });

    it('should detect invalid employment type', () => {
      const data = [
        {
          employee_id: 'EMP001',
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          date_of_joining: '2023-01-15',
          employment_type: 'invalid_type',
        },
      ];

      const result = validateEmployeeCSV(data);

      expect(result.valid).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].column).toBe('employment_type');
    });

    it('should detect invalid date format', () => {
      const data = [
        {
          employee_id: 'EMP001',
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          date_of_joining: '15-01-2023',
          employment_type: 'permanent',
        },
      ];

      const result = validateEmployeeCSV(data);

      expect(result.valid).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].column).toBe('date_of_joining');
    });

    it('should detect invalid phone format', () => {
      const data = [
        {
          employee_id: 'EMP001',
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          date_of_joining: '2023-01-15',
          employment_type: 'permanent',
          phone: '123', // Too short
        },
      ];

      const result = validateEmployeeCSV(data);

      expect(result.valid).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].column).toBe('phone');
    });

    it('should accept valid phone formats', () => {
      const validPhones = [
        '+1234567890',
        '1234567890',
        '(123) 456-7890',
        '+1 (123) 456-7890',
      ];

      validPhones.forEach((phone) => {
        const data = [
          {
            employee_id: 'EMP001',
            first_name: 'John',
            last_name: 'Doe',
            email: 'john@example.com',
            date_of_joining: '2023-01-15',
            employment_type: 'permanent',
            phone,
          },
        ];

        const result = validateEmployeeCSV(data);
        expect(result.valid).toHaveLength(1);
        expect(result.errors).toHaveLength(0);
      });
    });

    it('should detect invalid status', () => {
      const data = [
        {
          employee_id: 'EMP001',
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          date_of_joining: '2023-01-15',
          employment_type: 'permanent',
          status: 'invalid_status',
        },
      ];

      const result = validateEmployeeCSV(data);

      expect(result.valid).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].column).toBe('status');
    });

    it('should validate multiple rows and separate valid from invalid', () => {
      const data = [
        {
          employee_id: 'EMP001',
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          date_of_joining: '2023-01-15',
          employment_type: 'permanent',
        },
        {
          employee_id: 'EMP002',
          first_name: 'Jane',
          last_name: 'Smith',
          email: 'invalid-email',
          date_of_joining: '2023-06-20',
          employment_type: 'contract',
        },
        {
          employee_id: 'EMP003',
          first_name: 'Bob',
          last_name: 'Johnson',
          email: 'bob@example.com',
          date_of_joining: '2023-03-10',
          employment_type: 'temporary',
        },
      ];

      const result = validateEmployeeCSV(data);

      expect(result.valid).toHaveLength(2);
      expect(result.errors).toHaveLength(1);
    });

    it('should allow optional fields', () => {
      const data = [
        {
          employee_id: 'EMP001',
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          date_of_joining: '2023-01-15',
          employment_type: 'permanent',
          // Optional fields omitted
        },
      ];

      const result = validateEmployeeCSV(data);

      expect(result.valid).toHaveLength(1);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('generateEmployeeCSV', () => {
    it('should generate CSV from employee data', () => {
      const employees = [
        {
          employee_id: 'EMP001',
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          phone: '+1234567890',
          date_of_birth: '1990-01-15',
          gender: 'male',
          department_id: 'DEPT001',
          designation_id: 'DES001',
          reporting_manager_id: 'EMP000',
          date_of_joining: '2023-01-15',
          employment_type: 'permanent',
          status: 'active',
        },
      ];

      const csv = generateEmployeeCSV(employees);

      expect(csv).toContain('employee_id,first_name,last_name');
      expect(csv).toContain('EMP001,John,Doe');
    });

    it('should escape commas in values', () => {
      const employees = [
        {
          employee_id: 'EMP001',
          first_name: 'John, Jr.',
          last_name: 'Doe',
          email: 'john@example.com',
          phone: '',
          date_of_birth: '',
          gender: '',
          department_id: '',
          designation_id: '',
          reporting_manager_id: '',
          date_of_joining: '2023-01-15',
          employment_type: 'permanent',
          status: 'active',
        },
      ];

      const csv = generateEmployeeCSV(employees);

      expect(csv).toContain('"John, Jr."');
    });

    it('should escape quotes in values', () => {
      const employees = [
        {
          employee_id: 'EMP001',
          first_name: 'John "Johnny" Doe',
          last_name: 'Doe',
          email: 'john@example.com',
          phone: '',
          date_of_birth: '',
          gender: '',
          department_id: '',
          designation_id: '',
          reporting_manager_id: '',
          date_of_joining: '2023-01-15',
          employment_type: 'permanent',
          status: 'active',
        },
      ];

      const csv = generateEmployeeCSV(employees);

      expect(csv).toContain('"John ""Johnny"" Doe"');
    });

    it('should handle empty employee list', () => {
      const csv = generateEmployeeCSV([]);

      expect(csv).toBe('');
    });

    it('should include all columns', () => {
      const employees = [
        {
          employee_id: 'EMP001',
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          phone: '+1234567890',
          date_of_birth: '1990-01-15',
          gender: 'male',
          department_id: 'DEPT001',
          designation_id: 'DES001',
          reporting_manager_id: 'EMP000',
          date_of_joining: '2023-01-15',
          employment_type: 'permanent',
          status: 'active',
        },
      ];

      const csv = generateEmployeeCSV(employees);
      const lines = csv.split('\n');
      const headers = lines[0].split(',');

      expect(headers).toContain('employee_id');
      expect(headers).toContain('first_name');
      expect(headers).toContain('last_name');
      expect(headers).toContain('email');
      expect(headers).toContain('phone');
      expect(headers).toContain('date_of_birth');
      expect(headers).toContain('gender');
      expect(headers).toContain('department_id');
      expect(headers).toContain('designation_id');
      expect(headers).toContain('reporting_manager_id');
      expect(headers).toContain('date_of_joining');
      expect(headers).toContain('employment_type');
      expect(headers).toContain('status');
    });
  });

  describe('csvToBlob', () => {
    it('should convert CSV string to Blob', () => {
      const csv = 'employee_id,first_name\nEMP001,John';

      const blob = csvToBlob(csv);

      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('text/csv;charset=utf-8;');
    });

    it('should preserve CSV content in Blob', async () => {
      const csv = 'employee_id,first_name\nEMP001,John';

      const blob = csvToBlob(csv);
      const text = await blob.text();

      expect(text).toBe(csv);
    });
  });
});
