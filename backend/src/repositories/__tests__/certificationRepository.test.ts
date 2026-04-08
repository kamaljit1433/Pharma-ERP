/**
 * Certification Repository - Unit Tests
 * Tests for certification CRUD operations
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { CertificationRepository } from '../certificationRepository';
import db from '../../config/knex';

describe('CertificationRepository', () => {
  let repository: CertificationRepository;
  const testEmployeeId = 'a0000000-0000-4000-a000-000000000001';
  let testCertId: string;

  beforeAll(async () => {
    repository = new CertificationRepository(db);
    await db('certifications').del();
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
    await db('certifications').del();
  });

  describe('createCertification', () => {
    it('should create a certification', async () => {
      const cert = await repository.createCertification({
        employee_id: testEmployeeId,
        name: 'AWS Solutions Architect',
        issuing_organization: 'Amazon Web Services',
        issue_date: new Date('2024-01-15'),
        expiry_date: new Date('2026-01-15'),
        certificate_number: 'AWS-123456',
        certificate_url: 'https://aws.amazon.com/verify/123456',
      });

      expect(cert).toBeDefined();
      expect(cert.id).toBeDefined();
      expect(cert.employee_id).toBe(testEmployeeId);
      expect(cert.name).toBe('AWS Solutions Architect');
      expect(cert.is_active).toBe(true);

      testCertId = cert.id;
    });
  });

  describe('getCertificationById', () => {
    it('should retrieve certification by ID', async () => {
      const cert = await repository.getCertificationById(testCertId);

      expect(cert).toBeDefined();
      expect(cert?.id).toBe(testCertId);
      expect(cert?.name).toBe('AWS Solutions Architect');
    });

    it('should return null for non-existent certification', async () => {
      const cert = await repository.getCertificationById('00000000-0000-4000-a000-ffffffffffff');

      expect(cert).toBeNull();
    });
  });

  describe('getEmployeeCertifications', () => {
    it('should retrieve all certifications for an employee', async () => {
      const certs = await repository.getEmployeeCertifications(testEmployeeId);

      expect(Array.isArray(certs)).toBe(true);
      expect(certs.length).toBeGreaterThan(0);
      expect(certs.every((c) => c.employee_id === testEmployeeId)).toBe(true);
    });

    it('should return empty array for employee with no certifications', async () => {
      const certs = await repository.getEmployeeCertifications('emp-no-certs');

      expect(Array.isArray(certs)).toBe(true);
      expect(certs.length).toBe(0);
    });
  });

  describe('updateCertification', () => {
    it('should update certification details', async () => {
      const updated = await repository.updateCertification(testCertId, {
        expiry_date: new Date('2027-01-15'),
        certificate_url: 'https://aws.amazon.com/verify/updated',
      });

      expect(updated.expiry_date).toBeInstanceOf(Date);
      expect(updated.certificate_url).toBe('https://aws.amazon.com/verify/updated');
    });
  });

  describe('deleteCertification', () => {
    it('should delete a certification', async () => {
      const cert = await repository.createCertification({
        employee_id: testEmployeeId,
        name: 'Test Cert',
        issuing_organization: 'Test Org',
        issue_date: new Date('2024-01-01'),
      });

      await repository.deleteCertification(cert.id);

      const deleted = await repository.getCertificationById(cert.id);
      expect(deleted).toBeNull();
    });
  });

  describe('getExpiringCertifications', () => {
    it('should retrieve certifications expiring within specified days', async () => {
      const certs = await repository.getExpiringCertifications(365);

      expect(Array.isArray(certs)).toBe(true);
      certs.forEach((cert) => {
        if (cert.expiry_date) {
          const expiryDate = new Date(cert.expiry_date);
          const daysUntilExpiry = Math.ceil(
            (expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
          );
          expect(daysUntilExpiry).toBeLessThanOrEqual(365);
        }
      });
    });
  });

  describe('getExpiredCertifications', () => {
    it('should retrieve expired certifications', async () => {
      const certs = await repository.getExpiredCertifications();

      expect(Array.isArray(certs)).toBe(true);
      certs.forEach((cert) => {
        if (cert.expiry_date) {
          expect(new Date(cert.expiry_date).getTime()).toBeLessThan(new Date().getTime());
        }
      });
    });
  });
});
