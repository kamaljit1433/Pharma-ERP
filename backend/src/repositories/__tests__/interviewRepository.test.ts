/**
 * Interview Repository - Unit Tests
 * Tests for interview CRUD operations and feedback management
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { InterviewRepository } from '../interviewRepository';
import db from '../../config/knex';

const JOB_ID       = 'b1000000-0000-4000-b000-000000000006';
const APPLICANT_ID = 'b1000000-0000-4000-b000-000000000007';
const INTERVIEWER_ID = 'c0000000-0000-4000-a000-000000000401';

describe('InterviewRepository', () => {
  let repository: InterviewRepository;
  let testInterviewId: string;
  let testApplicantId: string;

  beforeAll(async () => {
    repository = new InterviewRepository(db);

    // Clean up
    await db('interview_feedback').del();
    await db('interviews').del();
    await db('applicants').where('id', APPLICANT_ID).del();
    await db('job_postings').where('id', JOB_ID).del();
    await db('employees').where('id', INTERVIEWER_ID).del();

    // Create interviewer employee
    await db('employees').insert({
      id: INTERVIEWER_ID,
      employee_id: 'EMP-INTERVIEWER-001',
      first_name: 'Inter',
      last_name: 'Viewer',
      email: 'interviewer@example.com',
      date_of_joining: new Date(),
    }).onConflict('id').ignore();

    // Create job posting
    await db('job_postings').insert({
      id: JOB_ID,
      title: 'Test Position',
      description: 'Test',
      status: 'open',
      positions_count: 1,
    }).onConflict('id').ignore();

    // Create applicant
    const [applicant] = await db('applicants').insert({
      id: APPLICANT_ID,
      job_posting_id: JOB_ID,
      first_name: 'Test',
      last_name: 'Applicant',
      email: 'test.applicant@example.com',
      phone: '+1234567890',
      stage: 'interview',
    }).onConflict('id').ignore().returning('*');

    testApplicantId = applicant?.id ?? APPLICANT_ID;
  });

  afterAll(async () => {
    await db('interview_feedback').del();
    await db('interviews').del();
    await db('applicants').where('id', APPLICANT_ID).del();
    await db('job_postings').where('id', JOB_ID).del();
    await db('employees').where('id', INTERVIEWER_ID).del();
  });

  describe('createInterview', () => {
    it('should create an interview with valid data', async () => {
      const interviewDate = new Date('2024-06-15T10:00:00');
      const interview = await repository.createInterview({
        applicant_id: testApplicantId,
        scheduled_at: interviewDate,
        type: 'video',
        interviewer_id: INTERVIEWER_ID,
      });

      expect(interview).toBeDefined();
      expect(interview.id).toBeDefined();
      expect(interview.applicant_id).toBe(testApplicantId);
      expect(interview.type).toBe('video');

      testInterviewId = interview.id;
    });

    it('should create interviews with different types', async () => {
      const types: Array<'video' | 'phone' | 'in_person'> = ['video', 'phone', 'in_person'];

      for (const type of types) {
        const interview = await repository.createInterview({
          applicant_id: testApplicantId,
          scheduled_at: new Date(),
          type,
          interviewer_id: INTERVIEWER_ID,
        });

        expect(interview.type).toBe(type);
      }
    });
  });

  describe('getInterviewById', () => {
    it('should retrieve interview by ID', async () => {
      const interview = await repository.getInterviewById(testInterviewId);

      expect(interview).toBeDefined();
      expect(interview?.id).toBe(testInterviewId);
      expect(interview?.applicant_id).toBe(testApplicantId);
    });

    it('should return null for non-existent ID', async () => {
      const interview = await repository.getInterviewById('00000000-0000-4000-a000-ffffffffffff');
      expect(interview).toBeNull();
    });
  });

  describe('getInterviewsByApplicant', () => {
    it('should retrieve interviews by applicant ID', async () => {
      const interviews = await repository.getInterviewsByApplicant(testApplicantId);

      expect(Array.isArray(interviews)).toBe(true);
      expect(interviews.length).toBeGreaterThan(0);
      interviews.forEach((i) => {
        expect(i.applicant_id).toBe(testApplicantId);
      });
    });

    it('should return empty array for non-existent applicant', async () => {
      const interviews = await repository.getInterviewsByApplicant('00000000-0000-4000-a000-fffffffffffe');
      expect(interviews).toEqual([]);
    });
  });

  describe('updateInterviewStatus', () => {
    it('should update interview status', async () => {
      const updated = await repository.updateInterviewStatus(testInterviewId, 'completed');

      expect(updated.status).toBe('completed');
    });

    it('should update to rescheduled status', async () => {
      const updated = await repository.updateInterviewStatus(testInterviewId, 'rescheduled');

      expect(updated.status).toBe('rescheduled');
    });
  });

  describe('addFeedback', () => {
    it('should add feedback to an interview', async () => {
      const feedback = await repository.addFeedback({
        interview_id: testInterviewId,
        interviewer_id: INTERVIEWER_ID,
        rating: 4,
        recommendation: 'hire',
        comments: 'Great candidate',
      });

      expect(feedback).toBeDefined();
      expect(feedback.rating).toBe(4);
      expect(feedback.recommendation).toBe('hire');
    });

    it('should support different ratings', async () => {
      const interview = await repository.createInterview({
        applicant_id: testApplicantId,
        scheduled_at: new Date(),
        type: 'phone',
        interviewer_id: INTERVIEWER_ID,
      });

      for (let rating = 1; rating <= 5; rating++) {
        const feedback = await repository.addFeedback({
          interview_id: interview.id,
          interviewer_id: INTERVIEWER_ID,
          rating,
          recommendation: 'maybe',
          comments: `Rating ${rating}`,
        });

        expect(feedback.rating).toBe(rating);
      }
    });

    it('should support different recommendations', async () => {
      const interview = await repository.createInterview({
        applicant_id: testApplicantId,
        scheduled_at: new Date(),
        type: 'video',
        interviewer_id: INTERVIEWER_ID,
      });

      const recommendations: Array<'hire' | 'maybe' | 'reject'> = ['hire', 'maybe', 'reject'];

      for (const recommendation of recommendations) {
        const feedback = await repository.addFeedback({
          interview_id: interview.id,
          interviewer_id: INTERVIEWER_ID,
          rating: 3,
          recommendation,
          comments: `Recommendation: ${recommendation}`,
        });

        expect(feedback.recommendation).toBe(recommendation);
      }
    });
  });

  describe('getFeedbackByInterview', () => {
    it('should retrieve feedback for an interview', async () => {
      const feedback = await repository.getFeedbackByInterview(testInterviewId);

      expect(Array.isArray(feedback)).toBe(true);
      expect(feedback.length).toBeGreaterThan(0);
    });

    it('should return empty array if no feedback', async () => {
      const interview = await repository.createInterview({
        applicant_id: testApplicantId,
        scheduled_at: new Date(),
        type: 'phone',
        interviewer_id: INTERVIEWER_ID,
      });

      const feedback = await repository.getFeedbackByInterview(interview.id);
      expect(feedback).toEqual([]);
    });
  });

  describe('edge cases', () => {
    it('should handle multiple interviews for same applicant', async () => {
      const i1 = await repository.createInterview({
        applicant_id: testApplicantId,
        scheduled_at: new Date('2024-06-01'),
        type: 'phone',
        interviewer_id: INTERVIEWER_ID,
      });

      const i2 = await repository.createInterview({
        applicant_id: testApplicantId,
        scheduled_at: new Date('2024-06-15'),
        type: 'in_person',
        interviewer_id: INTERVIEWER_ID,
      });

      expect(i1.id).not.toBe(i2.id);

      const interviews = await repository.getInterviewsByApplicant(testApplicantId);
      expect(interviews.length).toBeGreaterThanOrEqual(2);
    });

    it('should handle multiple feedback entries for same interview', async () => {
      const interview = await repository.createInterview({
        applicant_id: testApplicantId,
        scheduled_at: new Date(),
        type: 'video',
        interviewer_id: INTERVIEWER_ID,
      });

      const f1 = await repository.addFeedback({
        interview_id: interview.id,
        interviewer_id: INTERVIEWER_ID,
        rating: 4,
        recommendation: 'hire',
        comments: 'First feedback',
      });

      const f2 = await repository.addFeedback({
        interview_id: interview.id,
        interviewer_id: INTERVIEWER_ID,
        rating: 3,
        recommendation: 'maybe',
        comments: 'Second feedback',
      });

      expect(f1.id).not.toBe(f2.id);

      const feedback = await repository.getFeedbackByInterview(interview.id);
      expect(feedback.length).toBeGreaterThanOrEqual(2);
    });
  });
});
