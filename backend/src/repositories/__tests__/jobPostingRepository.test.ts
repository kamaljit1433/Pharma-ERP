/**
 * Job Posting Repository - Unit Tests
 * Tests for job posting management
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { JobPostingRepository } from '../jobPostingRepository';
import db from '../../config/knex';
import { CreateJobPostingDTO, UpdateJobPostingDTO } from '../../types/recruitment';

describe('JobPostingRepository', () => {
  let repository: JobPostingRepository;
  let testJobPostingId: string;

  const DEPT_ID = 'd0000000-0000-4000-f000-000000000001';
  const DESIG_ID = 'd0000000-0000-4000-f000-000000000011';

  beforeAll(async () => {
    repository = new JobPostingRepository(db);

    await db('job_postings').del();

    await db('departments')
      .insert({ id: DEPT_ID, name: 'Engineering Test Dept' })
      .onConflict('id').ignore();

    await db('designations')
      .insert({ id: DESIG_ID, title: 'Senior Engineer', grade: 'L5', department_id: DEPT_ID, level: 5 })
      .onConflict('id').ignore();
  });

  afterAll(async () => {
    await db('job_postings').del();
    await db('designations').where('id', DESIG_ID).del();
    await db('departments').where('id', DEPT_ID).del();
  });

  describe('createJobPosting', () => {
    it('should create job posting', async () => {
      const data: CreateJobPostingDTO = {
        title: 'Senior Software Engineer',
        description: 'We are looking for a senior software engineer',
        designation_id: 'd0000000-0000-4000-f000-000000000011',
        department_id: 'd0000000-0000-4000-f000-000000000001',
        positions_count: 2,
        status: 'open',
      };

      const posting = await repository.createJobPosting(data);

      expect(posting).toBeDefined();
      expect(posting.id).toBeDefined();
      expect(posting.title).toBe('Senior Software Engineer');
      expect(posting.status).toBe('open');
      expect(posting.positions_count).toBe(2);

      testJobPostingId = posting.id;
    });
  });

  describe('getJobPosting', () => {
    it('should retrieve job posting by ID', async () => {
      const posting = await repository.getJobPosting(testJobPostingId);

      expect(posting).toBeDefined();
      expect(posting?.id).toBe(testJobPostingId);
      expect(posting?.title).toBe('Senior Software Engineer');
    });

    it('should return null for non-existent posting', async () => {
      const posting = await repository.getJobPosting('00000000-0000-4000-a000-ffffffffffff');

      expect(posting).toBeNull();
    });
  });

  describe('updateJobPosting', () => {
    it('should update job posting', async () => {
      const updateData: UpdateJobPostingDTO = {
        status: 'closed',
        positions_count: 1,
      };

      const updated = await repository.updateJobPosting(testJobPostingId, updateData);

      expect(updated.status).toBe('closed');
      expect(updated.positions_count).toBe(1);
    });

    it('should throw error for non-existent posting', async () => {
      await expect(
        repository.updateJobPosting('00000000-0000-4000-a000-ffffffffffff', { status: 'closed' })
      ).rejects.toThrow();
    });
  });

  describe('getAllJobPostings', () => {
    it('should retrieve all job postings', async () => {
      const postings = await repository.getAllJobPostings();

      expect(Array.isArray(postings)).toBe(true);
      expect(postings.length).toBeGreaterThan(0);
    });
  });

  describe('getOpenJobPostings', () => {
    it('should retrieve open job postings', async () => {
      const postings = await repository.getOpenJobPostings();

      expect(Array.isArray(postings)).toBe(true);
      expect(postings.every((p) => p.status === 'open')).toBe(true);
    });
  });

  describe('getJobPostingsByDepartment', () => {
    it('should retrieve job postings by department', async () => {
      const postings = await repository.getJobPostingsByDepartment('d0000000-0000-4000-f000-000000000001');

      expect(Array.isArray(postings)).toBe(true);
    });
  });

  describe('getJobPostingsByDesignation', () => {
    it('should retrieve job postings by designation', async () => {
      const postings = await repository.getJobPostingsByDesignation('d0000000-0000-4000-f000-000000000011');

      expect(Array.isArray(postings)).toBe(true);
    });
  });

  describe('getJobPostingCount', () => {
    it('should count all job postings', async () => {
      const count = await repository.getJobPostingCount();

      expect(typeof count).toBe('number');
      expect(count).toBeGreaterThan(0);
    });

    it('should count by status', async () => {
      const count = await repository.getJobPostingCount('open');

      expect(typeof count).toBe('number');
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  describe('searchJobPostings', () => {
    it('should search job postings by title', async () => {
      const results = await repository.searchJobPostings('Engineer');

      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe('deleteJobPosting', () => {
    it('should delete job posting', async () => {
      const data: CreateJobPostingDTO = {
        title: 'Delete Test',
        description: 'To be deleted',
        designation_id: 'd0000000-0000-4000-f000-000000000011',
        department_id: 'd0000000-0000-4000-f000-000000000001',
        positions_count: 1,
        status: 'draft',
      };

      const posting = await repository.createJobPosting(data);
      await repository.deleteJobPosting(posting.id);

      const deleted = await repository.getJobPosting(posting.id);
      expect(deleted).toBeNull();
    });
  });
});
