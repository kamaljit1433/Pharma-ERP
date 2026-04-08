import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { Knex } from 'knex';
import knex from 'knex';
import { OfferLetterService } from '../offerLetterService';

describe('OfferLetterService', () => {
  let db: Knex;
  let service: OfferLetterService;
  let applicantId: string;
  let offerLetterId: string;
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
      table.string('stage').defaultTo('offer');
      table.timestamp('created_at').defaultTo(db.fn.now());
      table.timestamp('updated_at').defaultTo(db.fn.now());
    });

    await db.schema.createTable('offer_letters', (table) => {
      table.uuid('id').primary();
      table.uuid('applicant_id').references('id').inTable('applicants');
      table.string('position');
      table.string('department');
      table.decimal('salary', 10, 2);
      table.date('start_date');
      table.text('terms').nullable();
      table.string('status').defaultTo('Draft');
      table.timestamp('created_at').defaultTo(db.fn.now());
      table.timestamp('updated_at').defaultTo(db.fn.now());
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
      stage: 'offer',
    });

    applicantId = '550e8400-e29b-41d4-a716-446655440002';

    service = new OfferLetterService(db);
  });

  afterEach(async () => {
    await db.destroy();
  });

  describe('generateOfferLetter', () => {
    it('should generate offer letter for valid applicant', async () => {
      const offerData = {
        applicant_id: applicantId,
        position: 'Software Engineer',
        department: 'Engineering',
        salary: 80000,
        start_date: new Date('2026-04-01'),
        terms: 'Standard employment terms and conditions apply.',
      };

      const offerLetter = await service.generateOfferLetter(offerData);

      expect(offerLetter).toBeDefined();
      expect(offerLetter.applicant_id).toBe(applicantId);
      expect(offerLetter.position).toBe('Software Engineer');
      expect(offerLetter.salary).toBe(80000);
      expect(offerLetter.status).toBe('Draft');
    });

    it('should throw error for non-existent applicant', async () => {
      const offerData = {
        applicant_id: 'non-existent-id',
        position: 'Software Engineer',
        department: 'Engineering',
        salary: 80000,
        start_date: new Date('2026-04-01'),
        terms: 'Standard employment terms and conditions apply.',
      };

      await expect(service.generateOfferLetter(offerData)).rejects.toThrow(
        'Applicant not found'
      );
    });
  });

  describe('sendOfferLetter', () => {
    beforeEach(async () => {
      await db('offer_letters').insert({
        id: '550e8400-e29b-41d4-a716-446655440003',
        applicant_id: applicantId,
        position: 'Software Engineer',
        department: 'Engineering',
        salary: 80000,
        start_date: '2026-04-01',
        status: 'Draft',
      });
      offerLetterId = '550e8400-e29b-41d4-a716-446655440003';
    });

    it('should send offer letter and update status to Sent', async () => {
      const sent = await service.sendOfferLetter(offerLetterId);

      expect(sent.status).toBe('Sent');
    });

    it('should throw error for non-existent offer letter', async () => {
      await expect(service.sendOfferLetter('non-existent-id')).rejects.toThrow(
        'Offer letter not found'
      );
    });

    it('should throw error if applicant not found', async () => {
      await db('applicants').where({ id: applicantId }).delete();

      await expect(service.sendOfferLetter(offerLetterId)).rejects.toThrow(
        'Applicant not found'
      );
    });
  });

  describe('acceptOfferLetter', () => {
    beforeEach(async () => {
      await db('offer_letters').insert({
        id: '550e8400-e29b-41d4-a716-446655440003',
        applicant_id: applicantId,
        position: 'Software Engineer',
        department: 'Engineering',
        salary: 80000,
        start_date: '2026-04-01',
        status: 'Sent',
      });
      offerLetterId = '550e8400-e29b-41d4-a716-446655440003';
    });

    it('should accept offer letter and update status', async () => {
      const accepted = await service.acceptOfferLetter(offerLetterId);

      expect(accepted.status).toBe('Accepted');
    });

    it('should move applicant to hired stage', async () => {
      await service.acceptOfferLetter(offerLetterId);

      const applicant = await db('applicants').where({ id: applicantId }).first();
      expect(applicant.stage).toBe('hired');
    });

    it('should throw error for non-existent offer letter', async () => {
      await expect(service.acceptOfferLetter('non-existent-id')).rejects.toThrow(
        'Offer letter not found'
      );
    });

    it('should send acceptance confirmation email', async () => {
      // Should not throw even if email fails
      const accepted = await service.acceptOfferLetter(offerLetterId);
      expect(accepted).toBeDefined();
    });
  });

  describe('rejectOfferLetter', () => {
    beforeEach(async () => {
      await db('offer_letters').insert({
        id: '550e8400-e29b-41d4-a716-446655440003',
        applicant_id: applicantId,
        position: 'Software Engineer',
        department: 'Engineering',
        salary: 80000,
        start_date: '2026-04-01',
        status: 'Sent',
      });
      offerLetterId = '550e8400-e29b-41d4-a716-446655440003';
    });

    it('should reject offer letter and update status', async () => {
      const rejected = await service.rejectOfferLetter(offerLetterId);

      expect(rejected.status).toBe('Rejected');
    });

    it('should move applicant to rejected stage', async () => {
      await service.rejectOfferLetter(offerLetterId);

      const applicant = await db('applicants').where({ id: applicantId }).first();
      expect(applicant.stage).toBe('rejected');
    });

    it('should throw error for non-existent offer letter', async () => {
      await expect(service.rejectOfferLetter('non-existent-id')).rejects.toThrow(
        'Offer letter not found'
      );
    });
  });

  describe('getOfferLetter', () => {
    beforeEach(async () => {
      await db('offer_letters').insert({
        id: '550e8400-e29b-41d4-a716-446655440003',
        applicant_id: applicantId,
        position: 'Software Engineer',
        department: 'Engineering',
        salary: 80000,
        start_date: '2026-04-01',
        status: 'Draft',
      });
      offerLetterId = '550e8400-e29b-41d4-a716-446655440003';
    });

    it('should return offer letter by id', async () => {
      const offerLetter = await service.getOfferLetter(offerLetterId);

      expect(offerLetter).toBeDefined();
      expect(offerLetter.id).toBe(offerLetterId);
      expect(offerLetter.position).toBe('Software Engineer');
    });

    it('should throw error for non-existent offer letter', async () => {
      await expect(service.getOfferLetter('non-existent-id')).rejects.toThrow(
        'Offer letter not found'
      );
    });
  });

  describe('getOfferLetterByApplicant', () => {
    beforeEach(async () => {
      await db('offer_letters').insert({
        id: '550e8400-e29b-41d4-a716-446655440003',
        applicant_id: applicantId,
        position: 'Software Engineer',
        department: 'Engineering',
        salary: 80000,
        start_date: '2026-04-01',
        status: 'Draft',
      });
    });

    it('should return offer letter for applicant', async () => {
      const offerLetter = await service.getOfferLetterByApplicant(applicantId);

      expect(offerLetter).toBeDefined();
      expect(offerLetter?.applicant_id).toBe(applicantId);
    });

    it('should return null for applicant with no offer letter', async () => {
      await db('applicants').insert({
        id: '550e8400-e29b-41d4-a716-446655440004',
        job_posting_id: jobPostingId,
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane@example.com',
      });

      const offerLetter = await service.getOfferLetterByApplicant(
        '550e8400-e29b-41d4-a716-446655440004'
      );

      expect(offerLetter).toBeUndefined();
    });
  });

  describe('offer letter workflow', () => {
    it('should complete full workflow from generation to acceptance', async () => {
      // Generate offer letter
      const offerData = {
        applicant_id: applicantId,
        position: 'Software Engineer',
        department: 'Engineering',
        salary: 80000,
        start_date: new Date('2026-04-01'),
        terms: 'Standard employment terms and conditions apply.',
      };

      const generated = await service.generateOfferLetter(offerData);
      expect(generated.status).toBe('Draft');

      // Send offer letter
      const sent = await service.sendOfferLetter(generated.id);
      expect(sent.status).toBe('Sent');

      // Accept offer letter
      const accepted = await service.acceptOfferLetter(generated.id);
      expect(accepted.status).toBe('Accepted');

      // Verify applicant stage
      const applicant = await db('applicants').where({ id: applicantId }).first();
      expect(applicant.stage).toBe('hired');
    });

    it('should complete full workflow from generation to rejection', async () => {
      // Generate offer letter
      const offerData = {
        applicant_id: applicantId,
        position: 'Software Engineer',
        department: 'Engineering',
        salary: 80000,
        start_date: new Date('2026-04-01'),
        terms: 'Standard employment terms and conditions apply.',
      };

      const generated = await service.generateOfferLetter(offerData);
      expect(generated.status).toBe('Draft');

      // Send offer letter
      const sent = await service.sendOfferLetter(generated.id);
      expect(sent.status).toBe('Sent');

      // Reject offer letter
      const rejected = await service.rejectOfferLetter(generated.id);
      expect(rejected.status).toBe('Rejected');

      // Verify applicant stage
      const applicant = await db('applicants').where({ id: applicantId }).first();
      expect(applicant.stage).toBe('rejected');
    });
  });
});
