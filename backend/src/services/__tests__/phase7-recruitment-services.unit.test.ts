import knex from '../../config/knex';
import { JobPostingRepository } from '../../repositories/jobPostingRepository';
import { ApplicantTrackingService } from '../applicantTrackingService';
import { v4 as uuidv4 } from 'uuid';

describe('Phase 7: Recruitment Services - Unit Tests', () => {
  const jobPostingRepository = new JobPostingRepository(knex);
  const applicantTrackingService = new ApplicantTrackingService(knex);

  afterEach(async () => {
    await knex('applicants').del();
    await knex('job_postings').del();
  });

  // Job Posting Tests
  test('Job Posting: should create a job posting with valid data', async () => {
    const jobData = {
      title: 'Senior Developer',
      department_id: uuidv4(),
      location: 'New York, NY',
      description: 'We are looking for a senior developer',
      required_skills: ['JavaScript', 'TypeScript', 'React'],
      experience_min: 5,
      experience_max: 10,
      application_deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      created_by: uuidv4(),
    };

    const jobPosting = await jobPostingRepository.createJobPosting(jobData);

    expect(jobPosting.id).toBeDefined();
    expect(jobPosting.title).toBe(jobData.title);
    expect(jobPosting.location).toBe(jobData.location);
    expect(jobPosting.required_skills).toEqual(jobData.required_skills);
    expect(jobPosting.status).toBe('Open');
  });

  test('Job Posting: should retrieve job posting by ID', async () => {
    const jobData = {
      title: 'Product Manager',
      department_id: uuidv4(),
      location: 'San Francisco, CA',
      description: 'Looking for a product manager',
      required_skills: ['Product Strategy', 'Analytics'],
      experience_min: 3,
      experience_max: 8,
      application_deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      created_by: uuidv4(),
    };

    const created = await jobPostingRepository.createJobPosting(jobData);
    const retrieved = await jobPostingRepository.getJobPostingById(created.id);

    expect(retrieved).toBeDefined();
    expect(retrieved?.id).toBe(created.id);
    expect(retrieved?.title).toBe(jobData.title);
  });

  test('Job Posting: should update job posting status', async () => {
    const jobData = {
      title: 'QA Engineer',
      department_id: uuidv4(),
      location: 'Austin, TX',
      description: 'QA Engineer needed',
      required_skills: ['Testing', 'Automation'],
      experience_min: 2,
      experience_max: 5,
      application_deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      created_by: uuidv4(),
    };

    const jobPosting = await jobPostingRepository.createJobPosting(jobData);
    const updated = await jobPostingRepository.updateJobPostingStatus(jobPosting.id, 'Closed');

    expect(updated.status).toBe('Closed');
  });

  test('Job Posting: should delete job posting', async () => {
    const jobData = {
      title: 'Intern',
      department_id: uuidv4(),
      location: 'Boston, MA',
      description: 'Internship opportunity',
      required_skills: ['Learning'],
      experience_min: 0,
      experience_max: 1,
      application_deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      created_by: uuidv4(),
    };

    const jobPosting = await jobPostingRepository.createJobPosting(jobData);
    await jobPostingRepository.deleteJobPosting(jobPosting.id);

    const retrieved = await jobPostingRepository.getJobPostingById(jobPosting.id);
    expect(retrieved).toBeNull();
  });

  // Applicant Tracking Tests
  test('Applicant Tracking: should add applicant to job posting', async () => {
    const jobPosting = await jobPostingRepository.createJobPosting({
      title: 'Senior Developer',
      department_id: uuidv4(),
      location: 'New York, NY',
      description: 'We are looking for a senior developer',
      required_skills: ['JavaScript', 'TypeScript'],
      experience_min: 5,
      experience_max: 10,
      application_deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      created_by: uuidv4(),
    });

    const applicant = await applicantTrackingService.addApplicant(jobPosting.id, {
      name: 'John Doe',
      email: 'john@example.com',
      contact_number: '1234567890',
      resume_url: 'https://example.com/resume.pdf',
    });

    expect(applicant.id).toBeDefined();
    expect(applicant.name).toBe('John Doe');
    expect(applicant.email).toBe('john@example.com');
    expect(applicant.current_stage).toBe('Applied');
    expect(applicant.job_posting_id).toBe(jobPosting.id);
  });

  test('Applicant Tracking: should reject adding applicant to non-existent job posting', async () => {
    await expect(
      applicantTrackingService.addApplicant(uuidv4(), {
        name: 'Jane Doe',
        email: 'jane@example.com',
        contact_number: '9876543210',
        resume_url: 'https://example.com/resume.pdf',
      })
    ).rejects.toThrow('Job posting not found');
  });

  test('Applicant Tracking: should move applicant through valid stage transitions', async () => {
    const jobPosting = await jobPostingRepository.createJobPosting({
      title: 'Senior Developer',
      department_id: uuidv4(),
      location: 'New York, NY',
      description: 'We are looking for a senior developer',
      required_skills: ['JavaScript'],
      experience_min: 5,
      experience_max: 10,
      application_deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      created_by: uuidv4(),
    });

    const applicant = await applicantTrackingService.addApplicant(jobPosting.id, {
      name: 'John Doe',
      email: 'john@example.com',
      contact_number: '1234567890',
      resume_url: 'https://example.com/resume.pdf',
    });

    let updated = await applicantTrackingService.moveApplicantStage(applicant.id, 'Screening');
    expect(updated.current_stage).toBe('Screening');

    updated = await applicantTrackingService.moveApplicantStage(applicant.id, 'Interview');
    expect(updated.current_stage).toBe('Interview');

    updated = await applicantTrackingService.moveApplicantStage(applicant.id, 'Offer');
    expect(updated.current_stage).toBe('Offer');

    updated = await applicantTrackingService.moveApplicantStage(applicant.id, 'Hired');
    expect(updated.current_stage).toBe('Hired');
  });

  test('Applicant Tracking: should reject invalid stage transitions', async () => {
    const jobPosting = await jobPostingRepository.createJobPosting({
      title: 'Senior Developer',
      department_id: uuidv4(),
      location: 'New York, NY',
      description: 'We are looking for a senior developer',
      required_skills: ['JavaScript'],
      experience_min: 5,
      experience_max: 10,
      application_deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      created_by: uuidv4(),
    });

    const applicant = await applicantTrackingService.addApplicant(jobPosting.id, {
      name: 'John Doe',
      email: 'john@example.com',
      contact_number: '1234567890',
      resume_url: 'https://example.com/resume.pdf',
    });

    await expect(
      applicantTrackingService.moveApplicantStage(applicant.id, 'Offer')
    ).rejects.toThrow('Invalid stage transition');
  });

  test('Applicant Tracking: should get applicants by job posting', async () => {
    const jobPosting = await jobPostingRepository.createJobPosting({
      title: 'Senior Developer',
      department_id: uuidv4(),
      location: 'New York, NY',
      description: 'We are looking for a senior developer',
      required_skills: ['JavaScript'],
      experience_min: 5,
      experience_max: 10,
      application_deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      created_by: uuidv4(),
    });

    await applicantTrackingService.addApplicant(jobPosting.id, {
      name: 'John Doe',
      email: 'john@example.com',
      contact_number: '1234567890',
      resume_url: 'https://example.com/resume.pdf',
    });

    await applicantTrackingService.addApplicant(jobPosting.id, {
      name: 'Jane Doe',
      email: 'jane@example.com',
      contact_number: '9876543210',
      resume_url: 'https://example.com/resume2.pdf',
    });

    const applicants = await applicantTrackingService.getApplicantsByJobPosting(jobPosting.id);
    expect(applicants.length).toBe(2);
  });

  test('Applicant Tracking: should search applicants by stage', async () => {
    const jobPosting = await jobPostingRepository.createJobPosting({
      title: 'Senior Developer',
      department_id: uuidv4(),
      location: 'New York, NY',
      description: 'We are looking for a senior developer',
      required_skills: ['JavaScript'],
      experience_min: 5,
      experience_max: 10,
      application_deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      created_by: uuidv4(),
    });

    const applicant1 = await applicantTrackingService.addApplicant(jobPosting.id, {
      name: 'John Doe',
      email: 'john@example.com',
      contact_number: '1234567890',
      resume_url: 'https://example.com/resume.pdf',
    });

    await applicantTrackingService.addApplicant(jobPosting.id, {
      name: 'Jane Doe',
      email: 'jane@example.com',
      contact_number: '9876543210',
      resume_url: 'https://example.com/resume2.pdf',
    });

    await applicantTrackingService.moveApplicantStage(applicant1.id, 'Screening');

    const screeningApplicants = await applicantTrackingService.getApplicantsByStage('Screening');
    expect(screeningApplicants.length).toBeGreaterThan(0);
    expect(screeningApplicants.some((a) => a.id === applicant1.id)).toBe(true);
  });
});
