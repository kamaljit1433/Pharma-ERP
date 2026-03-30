import request from 'supertest';
import knex from '../../config/knex';
import { v4 as uuidv4 } from 'uuid';

// Mock Express app for testing
let app: any;

describe('Recruitment API Integration Tests', () => {
  beforeAll(async () => {
    // Initialize app (assuming it's exported from index.ts)
    const module = await import('../../index');
    app = module.default || module.app;
  });

  afterEach(async () => {
    await knex('applicants').del();
    await knex('interviews').del();
    await knex('interview_feedback').del();
    await knex('offer_letters').del();
    await knex('onboarding_checklist_items').del();
    await knex('onboarding_checklists').del();
    await knex('job_postings').del();
  });

  afterAll(async () => {
    await knex.destroy();
  });

  describe('Job Posting Endpoints', () => {
    test('POST /api/v1/recruitment/jobs - should create job posting', async () => {
      const response = await request(app)
        .post('/api/v1/recruitment/jobs')
        .send({
          title: 'Senior Developer',
          department_id: uuidv4(),
          location: 'New York, NY',
          description: 'We are looking for a senior developer',
          required_skills: ['JavaScript', 'TypeScript'],
          experience_min: 5,
          experience_max: 10,
          application_deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        });

      expect(response.status).toBe(201);
      expect(response.body.data.title).toBe('Senior Developer');
      expect(response.body.data.status).toBe('Open');
    });

    test('GET /api/v1/recruitment/jobs - should list job postings', async () => {
      const response = await request(app).get('/api/v1/recruitment/jobs');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('GET /api/v1/recruitment/jobs/:id - should get job posting by ID', async () => {
      const createResponse = await request(app)
        .post('/api/v1/recruitment/jobs')
        .send({
          title: 'Product Manager',
          department_id: uuidv4(),
          location: 'San Francisco, CA',
          description: 'Looking for a product manager',
          required_skills: ['Product Strategy'],
          experience_min: 3,
          experience_max: 8,
          application_deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        });

      const jobId = createResponse.body.data.id;

      const response = await request(app).get(`/api/v1/recruitment/jobs/${jobId}`);

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(jobId);
      expect(response.body.data.title).toBe('Product Manager');
    });
  });

  describe('Applicant Endpoints', () => {
    test('POST /api/v1/recruitment/applicants - should add applicant', async () => {
      const jobResponse = await request(app)
        .post('/api/v1/recruitment/jobs')
        .send({
          title: 'Senior Developer',
          department_id: uuidv4(),
          location: 'New York, NY',
          description: 'We are looking for a senior developer',
          required_skills: ['JavaScript'],
          experience_min: 5,
          experience_max: 10,
          application_deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        });

      const jobId = jobResponse.body.data.id;

      const response = await request(app)
        .post('/api/v1/recruitment/applicants')
        .send({
          job_posting_id: jobId,
          name: 'John Doe',
          email: 'john@example.com',
          contact_number: '1234567890',
          resume_url: 'https://example.com/resume.pdf',
        });

      expect(response.status).toBe(201);
      expect(response.body.data.name).toBe('John Doe');
      expect(response.body.data.current_stage).toBe('Applied');
    });

    test('PUT /api/v1/recruitment/applicants/:id/stage - should move applicant stage', async () => {
      const jobResponse = await request(app)
        .post('/api/v1/recruitment/jobs')
        .send({
          title: 'Senior Developer',
          department_id: uuidv4(),
          location: 'New York, NY',
          description: 'We are looking for a senior developer',
          required_skills: ['JavaScript'],
          experience_min: 5,
          experience_max: 10,
          application_deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        });

      const jobId = jobResponse.body.data.id;

      const applicantResponse = await request(app)
        .post('/api/v1/recruitment/applicants')
        .send({
          job_posting_id: jobId,
          name: 'John Doe',
          email: 'john@example.com',
          contact_number: '1234567890',
          resume_url: 'https://example.com/resume.pdf',
        });

      const applicantId = applicantResponse.body.data.id;

      const response = await request(app)
        .put(`/api/v1/recruitment/applicants/${applicantId}/stage`)
        .send({ stage: 'Screening' });

      expect(response.status).toBe(200);
      expect(response.body.data.current_stage).toBe('Screening');
    });
  });

  describe('Interview Endpoints', () => {
    test('POST /api/v1/recruitment/interviews - should schedule interview', async () => {
      const jobResponse = await request(app)
        .post('/api/v1/recruitment/jobs')
        .send({
          title: 'Senior Developer',
          department_id: uuidv4(),
          location: 'New York, NY',
          description: 'We are looking for a senior developer',
          required_skills: ['JavaScript'],
          experience_min: 5,
          experience_max: 10,
          application_deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        });

      const jobId = jobResponse.body.data.id;

      const applicantResponse = await request(app)
        .post('/api/v1/recruitment/applicants')
        .send({
          job_posting_id: jobId,
          name: 'John Doe',
          email: 'john@example.com',
          contact_number: '1234567890',
          resume_url: 'https://example.com/resume.pdf',
        });

      const applicantId = applicantResponse.body.data.id;

      const response = await request(app)
        .post('/api/v1/recruitment/interviews')
        .send({
          applicant_id: applicantId,
          scheduled_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
          mode: 'Video',
          interviewers: [uuidv4()],
        });

      expect(response.status).toBe(201);
      expect(response.body.data.applicant_id).toBe(applicantId);
      expect(response.body.data.status).toBe('Scheduled');
    });

    test('POST /api/v1/recruitment/interviews/:id/feedback - should submit feedback', async () => {
      const jobResponse = await request(app)
        .post('/api/v1/recruitment/jobs')
        .send({
          title: 'Senior Developer',
          department_id: uuidv4(),
          location: 'New York, NY',
          description: 'We are looking for a senior developer',
          required_skills: ['JavaScript'],
          experience_min: 5,
          experience_max: 10,
          application_deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        });

      const jobId = jobResponse.body.data.id;

      const applicantResponse = await request(app)
        .post('/api/v1/recruitment/applicants')
        .send({
          job_posting_id: jobId,
          name: 'John Doe',
          email: 'john@example.com',
          contact_number: '1234567890',
          resume_url: 'https://example.com/resume.pdf',
        });

      const applicantId = applicantResponse.body.data.id;

      const interviewResponse = await request(app)
        .post('/api/v1/recruitment/interviews')
        .send({
          applicant_id: applicantId,
          scheduled_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
          mode: 'Video',
          interviewers: [uuidv4()],
        });

      const interviewId = interviewResponse.body.data.id;

      const response = await request(app)
        .post(`/api/v1/recruitment/interviews/${interviewId}/feedback`)
        .send({
          interviewer_id: uuidv4(),
          rating: 4,
          comments: 'Great candidate',
          recommendation: 'Hire',
        });

      expect(response.status).toBe(201);
      expect(response.body.data.rating).toBe(4);
    });
  });

  describe('Offer Letter Endpoints', () => {
    test('POST /api/v1/recruitment/offer-letter - should generate offer letter', async () => {
      const jobResponse = await request(app)
        .post('/api/v1/recruitment/jobs')
        .send({
          title: 'Senior Developer',
          department_id: uuidv4(),
          location: 'New York, NY',
          description: 'We are looking for a senior developer',
          required_skills: ['JavaScript'],
          experience_min: 5,
          experience_max: 10,
          application_deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        });

      const jobId = jobResponse.body.data.id;

      const applicantResponse = await request(app)
        .post('/api/v1/recruitment/applicants')
        .send({
          job_posting_id: jobId,
          name: 'John Doe',
          email: 'john@example.com',
          contact_number: '1234567890',
          resume_url: 'https://example.com/resume.pdf',
        });

      const applicantId = applicantResponse.body.data.id;

      const response = await request(app)
        .post('/api/v1/recruitment/offer-letter')
        .send({
          applicant_id: applicantId,
          position: 'Senior Developer',
          department: 'Engineering',
          salary: 150000,
          start_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          terms: 'Standard terms',
        });

      expect(response.status).toBe(201);
      expect(response.body.data.position).toBe('Senior Developer');
      expect(response.body.data.status).toBe('Draft');
    });
  });

  describe('Onboarding Endpoints', () => {
    test('POST /api/v1/recruitment/onboarding - should create onboarding checklist', async () => {
      const employeeResponse = await request(app)
        .post('/api/v1/employees')
        .send({
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          phone_number: '1234567890',
          date_of_birth: new Date('1990-01-01'),
          gender: 'Male',
          address: 'Test Address',
          city: 'Test City',
          state: 'Test State',
          postal_code: '12345',
          country: 'Test Country',
          department_id: uuidv4(),
          designation_id: uuidv4(),
          date_of_joining: new Date(),
          employment_type: 'Full-time',
        });

      const employeeId = employeeResponse.body.data.id;

      const response = await request(app)
        .post('/api/v1/recruitment/onboarding')
        .send({
          employee_id: employeeId,
          items: [
            { title: 'IT Setup', description: 'Provide laptop and email' },
            { title: 'Office Access', description: 'Issue access card' },
          ],
        });

      expect(response.status).toBe(201);
      expect(response.body.data.employee_id).toBe(employeeId);
      expect(response.body.data.items).toHaveLength(2);
    });
  });
});
