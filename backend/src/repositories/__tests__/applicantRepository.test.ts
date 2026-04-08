/**
 * Applicant Repository - Unit Tests
 * Tests for applicant tracking and management
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { ApplicantRepository } from '../applicantRepository';
import db from '../../config/knex';

describe('ApplicantRepository', () => {
  let repository: ApplicantRepository;
  let testJobPostingId: string;
  let testApplicantId: string;

  const testDeptId = 'd0000000-0000-4000-a000-000000000001';
  const testDesigId = 'e0000000-0000-4000-a000-000000000001';

  beforeAll(async () => {
    repository = new ApplicantRepository(db);
    testJobPostingId = crypto.randomUUID();

    await db('applicants').del();

    await db('departments')
      .insert({ id: testDeptId, name: 'Test Department' })
      .onConflict('id').ignore();

    await db('designations')
      .insert({ id: testDesigId, title: 'Test Designation', grade: 'A', department_id: testDeptId, level: 1 })
      .onConflict('id').ignore();

    await db('job_postings').insert({
      id: testJobPostingId,
      title: 'Test Job',
      description: 'Test description',
      department_id: testDeptId,
      designation_id: testDesigId,
      positions_count: 1,
      status: 'open',
    });
  });

  afterAll(async () => {
    await db('applicants').del();
    await db('job_postings').where({ id: testJobPostingId }).del();
    await db('designations').where({ id: testDesigId }).del();
    await db('departments').where({ id: testDeptId }).del();
    await db.destroy();
  });

  describe('createApplicant', () => {
    it('should create applicant', async () => {
      const applicant = await repository.createApplicant(testJobPostingId, {
        name: 'John Doe',
        email: 'john.doe@example.com',
        contact_number: '+1234567890',
        resume_url: 'https://example.com/resume.pdf',
      });

      expect(applicant).toBeDefined();
      expect(applicant.id).toBeDefined();
      expect(applicant.job_posting_id).toBe(testJobPostingId);
      expect(applicant.first_name).toBe('John');
      expect(applicant.stage).toBe('applied');

      testApplicantId = applicant.id;
    });
  });

  describe('getApplicantById', () => {
    it('should retrieve applicant by ID', async () => {
      const applicant = await repository.getApplicantById(testApplicantId);

      expect(applicant).toBeDefined();
      expect(applicant?.id).toBe(testApplicantId);
      expect(applicant?.first_name).toBe('John');
    });

    it('should return null for non-existent applicant', async () => {
      const applicant = await repository.getApplicantById('00000000-0000-4000-a000-ffffffffffff');

      expect(applicant).toBeNull();
    });
  });

  describe('updateApplicant', () => {
    it('should update applicant stage', async () => {
      const updated = await repository.updateApplicant(testApplicantId, {
        stage: 'screening',
      });

      expect(updated.stage).toBe('screening');
    });

    it('should throw error for non-existent applicant', async () => {
      await expect(
        repository.updateApplicant('00000000-0000-4000-a000-ffffffffffff', { stage: 'screening' })
      ).rejects.toThrow();
    });
  });

  describe('getApplicantsByJobPosting', () => {
    it('should retrieve applicants for job posting', async () => {
      const applicants = await repository.getApplicantsByJobPosting(testJobPostingId);

      expect(Array.isArray(applicants)).toBe(true);
      expect(applicants.length).toBeGreaterThan(0);
    });

    it('should return empty array for unknown job posting', async () => {
      const applicants = await repository.getApplicantsByJobPosting('00000000-0000-4000-a000-fffffffffffa');

      expect(Array.isArray(applicants)).toBe(true);
      expect(applicants.length).toBe(0);
    });
  });

  describe('getApplicantsByStage', () => {
    it('should retrieve applicants by stage', async () => {
      const applicants = await repository.getApplicantsByStage('screening');

      expect(Array.isArray(applicants)).toBe(true);
    });
  });

  describe('searchApplicants', () => {
    it('should search applicants by name', async () => {
      const results = await repository.searchApplicants({ search: 'John' });

      expect(Array.isArray(results)).toBe(true);
    });

    it('should search applicants by job posting', async () => {
      const results = await repository.searchApplicants({ jobPostingId: testJobPostingId });

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
    });

    it('should filter by stage', async () => {
      const results = await repository.searchApplicants({ stage: 'screening' });

      expect(Array.isArray(results)).toBe(true);
    });
  });
});
