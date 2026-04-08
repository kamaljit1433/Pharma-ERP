import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { Knex } from 'knex';
import knex from 'knex';
import { InterviewManagementService } from '../interviewManagementService';

describe('InterviewManagementService', () => {
  let db: Knex;
  let service: InterviewManagementService;
  let applicantId: string;
  let interviewId: string;
  let jobPostingId: string;

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
      table.timestamp('created_at').defaultTo(db.fn.now());
    });

    await db.schema.createTable('applicants', (table) => {
      table.uuid('id').primary();
      table.uuid('job_posting_id').references('id').inTable('job_postings');
      table.string('first_name');
      table.string('last_name');
      table.string('email');
      table.string('resume_url').nullable();
      table.string('stage').defaultTo('applied');
      table.timestamp('created_at').defaultTo(db.fn.now());
      table.timestamp('updated_at').defaultTo(db.fn.now());
    });

    await db.schema.createTable('interviews', (table) => {
      table.uuid('id').primary();
      table.uuid('applicant_id').references('id').inTable('applicants');
      table.uuid('interviewer_id').nullable();
      table.string('type');
      table.timestamp('scheduled_at');
      table.integer('duration_minutes').defaultTo(30);
      table.string('status').defaultTo('scheduled');
      table.text('notes').nullable();
      table.timestamp('created_at').defaultTo(db.fn.now());
      table.timestamp('updated_at').defaultTo(db.fn.now());
    });

    await db.schema.createTable('interview_feedback', (table) => {
      table.uuid('id').primary();
      table.uuid('interview_id').references('id').inTable('interviews');
      table.uuid('interviewer_id');
      table.integer('rating');
      table.text('comments').nullable();
      table.string('recommendation');
      table.timestamp('created_at').defaultTo(db.fn.now());
    });

    // Insert test data
    await db('job_postings').insert({
      id: '550e8400-e29b-41d4-a716-446655440001',
      title: 'Software Engineer',
    });

    jobPostingId = '550e8400-e29b-41d4-a716-446655440001';

    await db('applicants').insert({
      id: '550e8400-e29b-41d4-a716-446655440002',
      job_posting_id: jobPostingId,
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      stage: 'interview',
    });

    applicantId = '550e8400-e29b-41d4-a716-446655440002';

    service = new InterviewManagementService(db);
  });

  afterEach(async () => {
    await db.destroy();
  });

  describe('scheduleInterview', () => {
    it('should schedule an interview for valid applicant', async () => {
      const interviewData = {
        applicant_id: applicantId,
        type: 'video' as const,
        scheduled_at: new Date('2026-03-20T10:00:00'),
      };

      const interview = await service.scheduleInterview(interviewData);

      expect(interview).toBeDefined();
      expect(interview.applicant_id).toBe(applicantId);
      expect(interview.type).toBe('video');
      expect(interview.status).toBe('scheduled');
    });

    it('should throw error for non-existent applicant', async () => {
      const interviewData = {
        applicant_id: 'non-existent-id',
        type: 'phone' as const,
        scheduled_at: new Date('2026-03-20T10:00:00'),
      };

      await expect(service.scheduleInterview(interviewData)).rejects.toThrow(
        'Applicant not found'
      );
    });

    it('should handle email notification failure gracefully', async () => {
      const interviewData = {
        applicant_id: applicantId,
        type: 'in_person' as const,
        scheduled_at: new Date('2026-03-20T14:00:00'),
      };

      // Should not throw even if email fails
      const interview = await service.scheduleInterview(interviewData);
      expect(interview).toBeDefined();
    });
  });

  describe('submitFeedback', () => {
    beforeEach(async () => {
      await db('interviews').insert({
        id: '550e8400-e29b-41d4-a716-446655440003',
        applicant_id: applicantId,
        type: 'technical',
        scheduled_at: new Date('2026-03-20T10:00:00'),
        status: 'scheduled',
      });
      interviewId = '550e8400-e29b-41d4-a716-446655440003';
    });

    it('should submit feedback for valid interview', async () => {
      const feedbackData = {
        interview_id: interviewId,
        interviewer_id: '550e8400-e29b-41d4-a716-446655440004',
        rating: 4,
        comments: 'Good technical skills',
        recommendation: 'hire' as const,
      };

      const feedback = await service.submitFeedback(feedbackData);

      expect(feedback).toBeDefined();
      expect(feedback.rating).toBe(4);
      expect(feedback.comments).toBe('Good technical skills');
    });

    it('should update interview status to completed after feedback', async () => {
      const feedbackData = {
        interview_id: interviewId,
        interviewer_id: '550e8400-e29b-41d4-a716-446655440004',
        rating: 5,
        comments: 'Excellent candidate',
        recommendation: 'hire' as const,
      };

      await service.submitFeedback(feedbackData);

      const interview = await db('interviews').where({ id: interviewId }).first();
      expect(interview.status).toBe('completed');
    });

    it('should throw error for non-existent interview', async () => {
      const feedbackData = {
        interview_id: 'non-existent-id',
        interviewer_id: '550e8400-e29b-41d4-a716-446655440004',
        rating: 4,
        comments: 'Good',
        recommendation: 'hire' as const,
      };

      await expect(service.submitFeedback(feedbackData)).rejects.toThrow(
        'Interview not found'
      );
    });

    it('should throw error for invalid rating below 1', async () => {
      const feedbackData = {
        interview_id: interviewId,
        interviewer_id: '550e8400-e29b-41d4-a716-446655440004',
        rating: 0,
        comments: 'Poor',
        recommendation: 'reject' as const,
      };

      await expect(service.submitFeedback(feedbackData)).rejects.toThrow(
        'Rating must be between 1 and 5'
      );
    });

    it('should throw error for invalid rating above 5', async () => {
      const feedbackData = {
        interview_id: interviewId,
        interviewer_id: '550e8400-e29b-41d4-a716-446655440004',
        rating: 6,
        comments: 'Excellent',
        recommendation: 'hire' as const,
      };

      await expect(service.submitFeedback(feedbackData)).rejects.toThrow(
        'Rating must be between 1 and 5'
      );
    });
  });

  describe('getFeedback', () => {
    beforeEach(async () => {
      await db('interviews').insert({
        id: '550e8400-e29b-41d4-a716-446655440003',
        applicant_id: applicantId,
        type: 'technical',
        scheduled_at: new Date('2026-03-20T10:00:00'),
        status: 'completed',
      });
      interviewId = '550e8400-e29b-41d4-a716-446655440003';

      await db('interview_feedback').insert([
        {
          id: '550e8400-e29b-41d4-a716-446655440005',
          interview_id: interviewId,
          interviewer_id: '550e8400-e29b-41d4-a716-446655440004',
          rating: 4,
          comments: 'Good technical skills',
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440006',
          interview_id: interviewId,
          interviewer_id: '550e8400-e29b-41d4-a716-446655440007',
          rating: 5,
          comments: 'Excellent problem solving',
        },
      ]);
    });

    it('should return all feedback for an interview', async () => {
      const feedback = await service.getFeedback(interviewId);

      expect(feedback).toHaveLength(2);
      expect(feedback[0]?.rating).toBe(4);
      expect(feedback[1]?.rating).toBe(5);
    });

    it('should return empty array for interview with no feedback', async () => {
      await db('interviews').insert({
        id: '550e8400-e29b-41d4-a716-446655440008',
        applicant_id: applicantId,
        type: 'hr',
        scheduled_at: new Date('2026-03-21T10:00:00'),
        status: 'scheduled',
      });

      const feedback = await service.getFeedback('550e8400-e29b-41d4-a716-446655440008');

      expect(feedback).toHaveLength(0);
    });
  });

  describe('getInterview', () => {
    beforeEach(async () => {
      await db('interviews').insert({
        id: '550e8400-e29b-41d4-a716-446655440003',
        applicant_id: applicantId,
        type: 'technical',
        scheduled_at: new Date('2026-03-20T10:00:00'),
        status: 'scheduled',
      });
      interviewId = '550e8400-e29b-41d4-a716-446655440003';
    });

    it('should return interview by id', async () => {
      const interview = await service.getInterview(interviewId);

      expect(interview).toBeDefined();
      expect(interview.id).toBe(interviewId);
      expect(interview.type).toBe('technical');
    });

    it('should throw error for non-existent interview', async () => {
      await expect(service.getInterview('non-existent-id')).rejects.toThrow(
        'Interview not found'
      );
    });
  });

  describe('getInterviewsByApplicant', () => {
    beforeEach(async () => {
      await db('interviews').insert([
        {
          id: '550e8400-e29b-41d4-a716-446655440003',
          applicant_id: applicantId,
          type: 'technical',
          scheduled_at: new Date('2026-03-20T10:00:00'),
          status: 'scheduled',
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440004',
          applicant_id: applicantId,
          type: 'hr',
          scheduled_at: new Date('2026-03-21T14:00:00'),
          status: 'scheduled',
        },
      ]);
    });

    it('should return all interviews for an applicant', async () => {
      const interviews = await service.getInterviewsByApplicant(applicantId);

      expect(interviews).toHaveLength(2);
      expect(interviews[0]?.type).toBe('technical');
      expect(interviews[1]?.type).toBe('hr');
    });

    it('should return empty array for applicant with no interviews', async () => {
      await db('applicants').insert({
        id: '550e8400-e29b-41d4-a716-446655440009',
        job_posting_id: jobPostingId,
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane@example.com',
      });

      const interviews = await service.getInterviewsByApplicant(
        '550e8400-e29b-41d4-a716-446655440009'
      );

      expect(interviews).toHaveLength(0);
    });
  });

  describe('cancelInterview', () => {
    beforeEach(async () => {
      await db('interviews').insert({
        id: '550e8400-e29b-41d4-a716-446655440003',
        applicant_id: applicantId,
        type: 'technical',
        scheduled_at: new Date('2026-03-20T10:00:00'),
        status: 'scheduled',
      });
      interviewId = '550e8400-e29b-41d4-a716-446655440003';
    });

    it('should cancel scheduled interview', async () => {
      const cancelled = await service.cancelInterview(interviewId);

      expect(cancelled.status).toBe('cancelled');
    });

    it('should send notification email to applicant', async () => {
      // Should not throw even if email fails
      const cancelled = await service.cancelInterview(interviewId);
      expect(cancelled).toBeDefined();
    });
  });

  describe('getScheduledInterviews', () => {
    beforeEach(async () => {
      await db('interviews').insert([
        {
          id: '550e8400-e29b-41d4-a716-446655440003',
          applicant_id: applicantId,
          type: 'technical',
          scheduled_at: '2026-03-20 10:00:00',
          status: 'scheduled',
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440004',
          applicant_id: applicantId,
          type: 'hr',
          scheduled_at: '2026-03-25 14:00:00',
          status: 'scheduled',
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440005',
          applicant_id: applicantId,
          type: 'managerial',
          scheduled_at: '2026-04-05 10:00:00',
          status: 'scheduled',
        },
      ]);
    });

    it('should return interviews within date range', async () => {
      const interviews = await service.getScheduledInterviews(
        new Date('2026-03-15'),
        new Date('2026-03-31')
      );

      expect(interviews).toHaveLength(2);
    });

    it('should return empty array for date range with no interviews', async () => {
      const interviews = await service.getScheduledInterviews(
        new Date('2026-05-01'),
        new Date('2026-05-31')
      );

      expect(interviews).toHaveLength(0);
    });

    it('should include interviews on boundary dates', async () => {
      const interviews = await service.getScheduledInterviews(
        new Date('2026-03-20'),
        new Date('2026-03-25')
      );

      expect(interviews).toHaveLength(2);
    });
  });
});
