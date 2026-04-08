/**
 * Offer Letter Repository - Unit Tests
 * Tests for offer letter CRUD operations and status management
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { OfferLetterRepository } from '../offerLetterRepository';
import db from '../../config/knex';

describe('OfferLetterRepository', () => {
  let repository: OfferLetterRepository;
  let testOfferId: string;
  let testApplicantId: string;

  beforeAll(async () => {
    repository = new OfferLetterRepository(db);

    // Clean up test data
    await db('offer_letters').del();
    await db('applicants').del();
    await db('job_postings').del();

    // Create test job posting
    const [job] = await db('job_postings')
      .insert({
        id: '00000000-0000-4000-a000-000000000001',
        title: 'Senior Developer',
        description: 'Test',
        status: 'open',
        positions_count: 1,
      })
      .returning('*');

    // Create test applicant
    const [applicant] = await db('applicants')
      .insert({
        id: '00000000-0000-4000-a000-000000000002',
        job_posting_id: job.id,
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        stage: 'offer',
      })
      .returning('*');

    testApplicantId = applicant.id;
  });

  afterAll(async () => {
    await db('offer_letters').del();
    await db('applicants').del();
    await db('job_postings').del();
  });

  describe('createOfferLetter', () => {
    it('should create an offer letter with valid data', async () => {
      const offerLetter = await repository.createOfferLetter({
        applicant_id: testApplicantId,
        position: 'Senior Developer',
        salary: 100000,
        currency: 'USD',
        start_date: new Date('2024-07-01'),
        status: 'draft',
        terms: 'Standard employment terms',
      });

      expect(offerLetter).toBeDefined();
      expect(offerLetter.id).toBeDefined();
      expect(offerLetter.applicant_id).toBe(testApplicantId);
      expect(offerLetter.position).toBe('Senior Developer');
      expect(offerLetter.salary).toBe(100000);
      expect(offerLetter.status).toBe('draft');

      testOfferId = offerLetter.id;
    });

    it('should create offer letters with different statuses', async () => {
      const statuses = ['draft', 'sent', 'signed', 'accepted', 'rejected'];

      for (const status of statuses) {
        const offerLetter = await repository.createOfferLetter({
          applicant_id: testApplicantId,
          position: 'Developer',
          salary: 80000,
          currency: 'USD',
          start_date: new Date('2024-07-01'),
          status: status as any,
          terms: 'Test terms',
        });

        expect(offerLetter.status).toBe(status);
      }
    });
  });

  describe('getOfferLetterById', () => {
    it('should retrieve offer letter by ID', async () => {
      const offerLetter = await repository.getOfferLetterById(testOfferId);

      expect(offerLetter).toBeDefined();
      expect(offerLetter?.id).toBe(testOfferId);
      expect(offerLetter?.applicant_id).toBe(testApplicantId);
    });

    it('should return null for non-existent ID', async () => {
      const offerLetter = await repository.getOfferLetterById('00000000-0000-4000-a000-ffffffffffff');
      expect(offerLetter).toBeNull();
    });
  });

  describe('getOfferLetterByApplicant', () => {
    it('should retrieve offer letter by applicant ID', async () => {
      const offerLetter = await repository.getOfferLetterByApplicant(testApplicantId);

      expect(offerLetter).toBeDefined();
      expect(offerLetter?.applicant_id).toBe(testApplicantId);
    });

    it('should return null for applicant without offer', async () => {
      const offerLetter = await repository.getOfferLetterByApplicant('00000000-0000-4000-a000-ffffffffffff');
      expect(offerLetter).toBeNull();
    });
  });

  describe('updateOfferLetter', () => {
    it('should update offer letter properties', async () => {
      const updated = await repository.updateOfferLetter(testOfferId, {
        salary: 120000,
        terms: 'Updated terms',
      });

      expect(updated.salary).toBe(120000);
      expect(updated.terms).toBe('Updated terms');
    });

    it('should update status', async () => {
      const updated = await repository.updateOfferLetter(testOfferId, {
        status: 'sent',
      });

      expect(updated.status).toBe('sent');
    });

    it('should update start date', async () => {
      const newDate = new Date('2024-08-01');
      const updated = await repository.updateOfferLetter(testOfferId, {
        start_date: newDate,
      });

      const d = new Date(updated.start_date);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      expect(dateStr).toBe('2024-08-01');
    });
  });

  describe('deleteOfferLetter', () => {
    it('should delete an offer letter', async () => {
      const offerLetter = await repository.createOfferLetter({
        applicant_id: testApplicantId,
        position: 'Developer',
        salary: 80000,
        currency: 'USD',
        start_date: new Date('2024-07-01'),
        status: 'draft',
        terms: 'To be deleted',
      });

      await repository.deleteOfferLetter(offerLetter.id);

      const deleted = await repository.getOfferLetterById(offerLetter.id);
      expect(deleted).toBeNull();
    });
  });

  describe('CRUD operations', () => {
    it('should support full CRUD lifecycle', async () => {
      // Create
      const created = await repository.createOfferLetter({
        applicant_id: testApplicantId,
        position: 'CRUD Test Position',
        salary: 90000,
        currency: 'USD',
        start_date: new Date('2024-07-01'),
        status: 'draft',
        terms: 'CRUD test terms',
      });

      expect(created.id).toBeDefined();

      // Read
      const read = await repository.getOfferLetterById(created.id);
      expect(read?.position).toBe('CRUD Test Position');

      // Update
      const updated = await repository.updateOfferLetter(created.id, {
        position: 'Updated CRUD Position',
      });

      expect(updated.position).toBe('Updated CRUD Position');

      // Delete
      await repository.deleteOfferLetter(created.id);
      const deleted = await repository.getOfferLetterById(created.id);
      expect(deleted).toBeNull();
    });
  });

  describe('edge cases', () => {
    it('should handle different currencies', async () => {
      const currencies = ['USD', 'EUR', 'GBP', 'INR'];

      for (const currency of currencies) {
        const offerLetter = await repository.createOfferLetter({
          applicant_id: testApplicantId,
          position: 'Developer',
          salary: 100000,
          currency,
          start_date: new Date('2024-07-01'),
          status: 'draft',
          terms: 'Test',
        });

        expect(offerLetter.currency).toBe(currency);
      }
    });

    it('should handle zero salary', async () => {
      const offerLetter = await repository.createOfferLetter({
        applicant_id: testApplicantId,
        position: 'Intern',
        salary: 0,
        currency: 'USD',
        start_date: new Date('2024-07-01'),
        status: 'draft',
        terms: 'Unpaid internship',
      });

      expect(offerLetter.salary).toBe(0);
    });

    it('should handle very large salaries', async () => {
      const offerLetter = await repository.createOfferLetter({
        applicant_id: testApplicantId,
        position: 'Executive',
        salary: 999999999.99,
        currency: 'USD',
        start_date: new Date('2024-07-01'),
        status: 'draft',
        terms: 'Executive package',
      });

      expect(offerLetter.salary).toBe(999999999.99);
    });

    it('should handle long terms text', async () => {
      const longTerms = 'A'.repeat(5000);

      const offerLetter = await repository.createOfferLetter({
        applicant_id: testApplicantId,
        position: 'Developer',
        salary: 100000,
        currency: 'USD',
        start_date: new Date('2024-07-01'),
        status: 'draft',
        terms: longTerms,
      });

      expect(offerLetter.terms.length).toBe(5000);
    });
  });
});
