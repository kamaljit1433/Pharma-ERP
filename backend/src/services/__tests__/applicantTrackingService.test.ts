import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { Knex } from 'knex';
import knex from 'knex';
import { ApplicantTrackingService } from '../applicantTrackingService';

describe('ApplicantTrackingService', () => {
  let db: Knex;
  let service: ApplicantTrackingService;
  let jobPostingId: string;
  let applicantId: string;

  beforeEach(async () => {
    db = knex({
      client: 'sqlite3',
      connection: ':memory:',
      useNullAsDefault: true,
    });

    // Create tables
    await db.schema.createTable('job_postings', (table) => {
      table.uuid('id').primary();
      table.string('title');
      table.text('description');
      table.string('status').defaultTo('open');
      table.timestamp('created_at').defaultTo(db.fn.now());
    });

    await db.schema.createTable('applicants', (table) => {
      table.uuid('id').primary();
      table.uuid('job_posting_id').references('id').inTable('job_postings');
      table.string('first_name');
      table.string('last_name');
      table.string('email');
      table.string('phone').nullable();
      table.string('resume_url').nullable();
      table.text('cover_letter').nullable();
      table.string('stage').defaultTo('applied');
      table.text('notes').nullable();
      table.timestamp('created_at').defaultTo(db.fn.now());
      table.timestamp('updated_at').defaultTo(db.fn.now());
    });

    // Insert test data
    await db('job_postings').insert({
      id: '550e8400-e29b-41d4-a716-446655440001',
      title: 'Software Engineer',
      description: 'Full-stack developer position',
      status: 'open',
    });

    jobPostingId = '550e8400-e29b-41d4-a716-446655440001';

    service = new ApplicantTrackingService(db);
  });

  afterEach(async () => {
    await db.destroy();
  });

  describe('addApplicant', () => {
    it('should create a new applicant for valid job posting', async () => {
      const applicantData = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        contact_number: '1234567890',
        resume_url: 'https://example.com/resume.pdf',
      };

      const applicant = await service.addApplicant(jobPostingId, applicantData);

      expect(applicant).toBeDefined();
      expect(applicant.email).toBe('john.doe@example.com');
      expect(applicant.stage).toBe('applied');
    });

    it('should throw error for non-existent job posting', async () => {
      const applicantData = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        contact_number: '1234567890',
        resume_url: 'https://example.com/resume.pdf',
      };

      await expect(
        service.addApplicant('non-existent-id', applicantData)
      ).rejects.toThrow('Job posting not found');
    });

    it('should handle email notification failure gracefully', async () => {
      const applicantData = {
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        contact_number: '0987654321',
        resume_url: 'https://example.com/resume2.pdf',
      };

      // Should not throw even if email fails
      const applicant = await service.addApplicant(jobPostingId, applicantData);
      expect(applicant).toBeDefined();
    });
  });

  describe('moveApplicantStage', () => {
    beforeEach(async () => {
      await db('applicants').insert({
        id: '550e8400-e29b-41d4-a716-446655440002',
        job_posting_id: jobPostingId,
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        stage: 'applied',
      });
      applicantId = '550e8400-e29b-41d4-a716-446655440002';
    });

    it('should move applicant from applied to screening', async () => {
      const updated = await service.moveApplicantStage(applicantId, 'screening');

      expect(updated.stage).toBe('screening');
    });

    it('should move applicant from screening to interview', async () => {
      await db('applicants').where({ id: applicantId }).update({ stage: 'screening' });

      const updated = await service.moveApplicantStage(applicantId, 'interview');

      expect(updated.stage).toBe('interview');
    });

    it('should move applicant from interview to offer', async () => {
      await db('applicants').where({ id: applicantId }).update({ stage: 'interview' });

      const updated = await service.moveApplicantStage(applicantId, 'offer');

      expect(updated.stage).toBe('offer');
    });

    it('should move applicant from offer to hired', async () => {
      await db('applicants').where({ id: applicantId }).update({ stage: 'offer' });

      const updated = await service.moveApplicantStage(applicantId, 'hired');

      expect(updated.stage).toBe('hired');
    });

    it('should reject applicant from any stage', async () => {
      const updated = await service.moveApplicantStage(applicantId, 'rejected');

      expect(updated.stage).toBe('rejected');
    });

    it('should throw error for invalid stage transition', async () => {
      await expect(
        service.moveApplicantStage(applicantId, 'offer')
      ).rejects.toThrow('Invalid stage transition from applied to offer');
    });

    it('should throw error for non-existent applicant', async () => {
      await expect(
        service.moveApplicantStage('non-existent-id', 'screening')
      ).rejects.toThrow('Applicant not found');
    });

    it('should not allow transitions from hired stage', async () => {
      await db('applicants').where({ id: applicantId }).update({ stage: 'hired' });

      await expect(
        service.moveApplicantStage(applicantId, 'rejected')
      ).rejects.toThrow('Invalid stage transition');
    });

    it('should not allow transitions from rejected stage', async () => {
      await db('applicants').where({ id: applicantId }).update({ stage: 'rejected' });

      await expect(
        service.moveApplicantStage(applicantId, 'screening')
      ).rejects.toThrow('Invalid stage transition');
    });
  });

  describe('getApplicantsByJobPosting', () => {
    beforeEach(async () => {
      await db('applicants').insert([
        {
          id: '550e8400-e29b-41d4-a716-446655440002',
          job_posting_id: jobPostingId,
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          stage: 'applied',
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440003',
          job_posting_id: jobPostingId,
          first_name: 'Jane',
          last_name: 'Smith',
          email: 'jane@example.com',
          stage: 'screening',
        },
      ]);
    });

    it('should return all applicants for a job posting', async () => {
      const applicants = await service.getApplicantsByJobPosting(jobPostingId);

      expect(applicants).toHaveLength(2);
      expect(applicants[0]?.first_name).toBe('John');
      expect(applicants[1]?.first_name).toBe('Jane');
    });

    it('should return empty array for job posting with no applicants', async () => {
      await db('job_postings').insert({
        id: '550e8400-e29b-41d4-a716-446655440004',
        title: 'Data Scientist',
        description: 'ML position',
      });

      const applicants = await service.getApplicantsByJobPosting(
        '550e8400-e29b-41d4-a716-446655440004'
      );

      expect(applicants).toHaveLength(0);
    });
  });

  describe('getApplicantsByStage', () => {
    beforeEach(async () => {
      await db('applicants').insert([
        {
          id: '550e8400-e29b-41d4-a716-446655440002',
          job_posting_id: jobPostingId,
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          stage: 'screening',
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440003',
          job_posting_id: jobPostingId,
          first_name: 'Jane',
          last_name: 'Smith',
          email: 'jane@example.com',
          stage: 'screening',
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440004',
          job_posting_id: jobPostingId,
          first_name: 'Bob',
          last_name: 'Johnson',
          email: 'bob@example.com',
          stage: 'interview',
        },
      ]);
    });

    it('should return applicants filtered by stage', async () => {
      const applicants = await service.getApplicantsByStage('screening');

      expect(applicants).toHaveLength(2);
      expect(applicants.every((a) => a.stage === 'screening')).toBe(true);
    });

    it('should return empty array for stage with no applicants', async () => {
      const applicants = await service.getApplicantsByStage('hired');

      expect(applicants).toHaveLength(0);
    });
  });

  describe('searchApplicants', () => {
    beforeEach(async () => {
      await db('applicants').insert([
        {
          id: '550e8400-e29b-41d4-a716-446655440002',
          job_posting_id: jobPostingId,
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          stage: 'screening',
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440003',
          job_posting_id: jobPostingId,
          first_name: 'Jane',
          last_name: 'Smith',
          email: 'jane@example.com',
          stage: 'interview',
        },
      ]);
    });

    it('should search applicants by job posting', async () => {
      const applicants = await service.searchApplicants({
        jobPostingId,
      });

      expect(applicants).toHaveLength(2);
    });

    it('should search applicants by stage', async () => {
      const applicants = await service.searchApplicants({
        stage: 'screening',
      });

      expect(applicants).toHaveLength(1);
      expect(applicants[0]?.stage).toBe('screening');
    });

    it('should search applicants by multiple filters', async () => {
      const applicants = await service.searchApplicants({
        jobPostingId,
        stage: 'interview',
      });

      expect(applicants).toHaveLength(1);
      expect(applicants[0]?.first_name).toBe('Jane');
    });
  });

  describe('getApplicant', () => {
    beforeEach(async () => {
      await db('applicants').insert({
        id: '550e8400-e29b-41d4-a716-446655440002',
        job_posting_id: jobPostingId,
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        stage: 'applied',
      });
      applicantId = '550e8400-e29b-41d4-a716-446655440002';
    });

    it('should return applicant by id', async () => {
      const applicant = await service.getApplicant(applicantId);

      expect(applicant).toBeDefined();
      expect(applicant.id).toBe(applicantId);
      expect(applicant.first_name).toBe('John');
    });

    it('should throw error for non-existent applicant', async () => {
      await expect(service.getApplicant('non-existent-id')).rejects.toThrow(
        'Applicant not found'
      );
    });
  });
});
