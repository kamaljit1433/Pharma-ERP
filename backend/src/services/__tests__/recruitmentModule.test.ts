import knex from '../../config/knex';
import { ApplicantTrackingService } from '../applicantTrackingService';
import { InterviewManagementService } from '../interviewManagementService';
import { OfferLetterService } from '../offerLetterService';
import { OnboardingService } from '../onboardingService';
import { JobPostingRepository } from '../../repositories/jobPostingRepository';
import { ApplicantRepository } from '../../repositories/applicantRepository';
import { EmployeeRepository } from '../../repositories/employeeRepository';
import { v4 as uuidv4 } from 'uuid';

describe('Recruitment Module - Unit Tests', () => {
  let jobPostingRepository: JobPostingRepository;
  let applicantRepository: ApplicantRepository;
  let employeeRepository: EmployeeRepository;
  let applicantTrackingService: ApplicantTrackingService;
  let interviewManagementService: InterviewManagementService;
  let offerLetterService: OfferLetterService;
  let onboardingService: OnboardingService;

  beforeAll(() => {
    jobPostingRepository = new JobPostingRepository(knex);
    applicantRepository = new ApplicantRepository(knex);
    employeeRepository = new EmployeeRepository(knex);
    applicantTrackingService = new ApplicantTrackingService(knex);
    interviewManagementService = new InterviewManagementService(knex);
    offerLetterService = new OfferLetterService(knex);
    onboardingService = new OnboardingService(knex);
  });

  afterEach(async () => {
    // Clean up test data
    await knex('applicants').del();
    await knex('interviews').del();
    await knex('interview_feedback').del();
    await knex('offer_letters').del();
    await knex('onboarding_checklist_items').del();
    await knex('onboarding_checklists').del();
    await knex('job_postings').del();
  });

  describe('Applicant Tracking Service', () => {
    test('should create an applicant for a job posting', async () => {
      // Create job posting
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

      // Add applicant
      const applicant = await applicantTrackingService.addApplicant(jobPosting.id, {
        name: 'John Doe',
        email: 'john@example.com',
        contact_number: '1234567890',
        resume_url: 'https://example.com/resume.pdf',
      });

      expect(applicant.name).toBe('John Doe');
      expect(applicant.email).toBe('john@example.com');
      expect(applicant.current_stage).toBe('Applied');
      expect(applicant.job_posting_id).toBe(jobPosting.id);
    });

    test('should move applicant through valid stage transitions', async () => {
      // Create job posting
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

      // Create applicant
      const applicant = await applicantTrackingService.addApplicant(jobPosting.id, {
        name: 'John Doe',
        email: 'john@example.com',
        contact_number: '1234567890',
        resume_url: 'https://example.com/resume.pdf',
      });

      // Move to Screening
      let updated = await applicantTrackingService.moveApplicantStage(applicant.id, 'Screening');
      expect(updated.current_stage).toBe('Screening');

      // Move to Interview
      updated = await applicantTrackingService.moveApplicantStage(applicant.id, 'Interview');
      expect(updated.current_stage).toBe('Interview');

      // Move to Offer
      updated = await applicantTrackingService.moveApplicantStage(applicant.id, 'Offer');
      expect(updated.current_stage).toBe('Offer');

      // Move to Hired
      updated = await applicantTrackingService.moveApplicantStage(applicant.id, 'Hired');
      expect(updated.current_stage).toBe('Hired');
    });

    test('should reject invalid stage transitions', async () => {
      // Create job posting
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

      // Create applicant
      const applicant = await applicantTrackingService.addApplicant(jobPosting.id, {
        name: 'John Doe',
        email: 'john@example.com',
        contact_number: '1234567890',
        resume_url: 'https://example.com/resume.pdf',
      });

      // Try invalid transition (Applied -> Offer)
      await expect(applicantTrackingService.moveApplicantStage(applicant.id, 'Offer')).rejects.toThrow();
    });
  });

  describe('Interview Management Service', () => {
    test('should schedule an interview for an applicant', async () => {
      // Create job posting
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

      // Create applicant
      const applicant = await applicantTrackingService.addApplicant(jobPosting.id, {
        name: 'John Doe',
        email: 'john@example.com',
        contact_number: '1234567890',
        resume_url: 'https://example.com/resume.pdf',
      });

      // Schedule interview
      const interviewDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const interview = await interviewManagementService.scheduleInterview({
        applicant_id: applicant.id,
        scheduled_at: interviewDate,
        mode: 'Video',
        interviewers: [uuidv4()],
      });

      expect(interview.applicant_id).toBe(applicant.id);
      expect(interview.mode).toBe('Video');
      expect(interview.status).toBe('Scheduled');
    });

    test('should submit interview feedback with valid rating', async () => {
      // Create job posting
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

      // Create applicant
      const applicant = await applicantTrackingService.addApplicant(jobPosting.id, {
        name: 'John Doe',
        email: 'john@example.com',
        contact_number: '1234567890',
        resume_url: 'https://example.com/resume.pdf',
      });

      // Schedule interview
      const interview = await interviewManagementService.scheduleInterview({
        applicant_id: applicant.id,
        scheduled_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
        mode: 'Video',
        interviewers: [uuidv4()],
      });

      // Submit feedback
      const feedback = await interviewManagementService.submitFeedback({
        interview_id: interview.id,
        interviewer_id: uuidv4(),
        rating: 4,
        comments: 'Great candidate',
        recommendation: 'Hire',
      });

      expect(feedback.rating).toBe(4);
      expect(feedback.comments).toBe('Great candidate');
      expect(feedback.recommendation).toBe('Hire');
    });

    test('should reject feedback with invalid rating', async () => {
      // Create job posting
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

      // Create applicant
      const applicant = await applicantTrackingService.addApplicant(jobPosting.id, {
        name: 'John Doe',
        email: 'john@example.com',
        contact_number: '1234567890',
        resume_url: 'https://example.com/resume.pdf',
      });

      // Schedule interview
      const interview = await interviewManagementService.scheduleInterview({
        applicant_id: applicant.id,
        scheduled_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
        mode: 'Video',
        interviewers: [uuidv4()],
      });

      // Try to submit feedback with invalid rating
      await expect(
        interviewManagementService.submitFeedback({
          interview_id: interview.id,
          interviewer_id: uuidv4(),
          rating: 10,
          comments: 'Great candidate',
          recommendation: 'Hire',
        })
      ).rejects.toThrow();
    });
  });

  describe('Offer Letter Service', () => {
    test('should generate an offer letter', async () => {
      // Create job posting
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

      // Create applicant
      const applicant = await applicantTrackingService.addApplicant(jobPosting.id, {
        name: 'John Doe',
        email: 'john@example.com',
        contact_number: '1234567890',
        resume_url: 'https://example.com/resume.pdf',
      });

      // Generate offer letter
      const offerLetter = await offerLetterService.generateOfferLetter({
        applicant_id: applicant.id,
        position: 'Senior Developer',
        department: 'Engineering',
        salary: 150000,
        start_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        terms: 'Standard terms',
      });

      expect(offerLetter.applicant_id).toBe(applicant.id);
      expect(offerLetter.position).toBe('Senior Developer');
      expect(offerLetter.salary).toBe(150000);
      expect(offerLetter.status).toBe('Draft');
    });

    test('should accept offer letter and move applicant to Hired', async () => {
      // Create job posting
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

      // Create applicant
      const applicant = await applicantTrackingService.addApplicant(jobPosting.id, {
        name: 'John Doe',
        email: 'john@example.com',
        contact_number: '1234567890',
        resume_url: 'https://example.com/resume.pdf',
      });

      // Generate offer letter
      const offerLetter = await offerLetterService.generateOfferLetter({
        applicant_id: applicant.id,
        position: 'Senior Developer',
        department: 'Engineering',
        salary: 150000,
        start_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        terms: 'Standard terms',
      });

      // Accept offer
      const accepted = await offerLetterService.acceptOfferLetter(offerLetter.id);
      expect(accepted.status).toBe('Accepted');

      // Verify applicant is now Hired
      const updatedApplicant = await applicantRepository.getApplicantById(applicant.id);
      expect(updatedApplicant?.current_stage).toBe('Hired');
    });
  });

  describe('Onboarding Service', () => {
    test('should create onboarding checklist with items', async () => {
      // Create employee
      const employee = await employeeRepository.createEmployee({
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
        status: 'Active',
      });

      // Create onboarding checklist
      const checklist = await onboardingService.createOnboardingChecklist({
        employee_id: employee.id,
        items: [
          { title: 'IT Setup', description: 'Provide laptop and email' },
          { title: 'Office Access', description: 'Issue access card' },
        ],
      });

      expect(checklist.employee_id).toBe(employee.id);
      expect(checklist.items).toHaveLength(2);
      expect(checklist.items[0].completed).toBe(false);
    });

    test('should complete checklist items and mark checklist as complete', async () => {
      // Create employee
      const employee = await employeeRepository.createEmployee({
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
        status: 'Active',
      });

      // Create onboarding checklist
      const checklist = await onboardingService.createOnboardingChecklist({
        employee_id: employee.id,
        items: [{ title: 'IT Setup', description: 'Provide laptop and email' }],
      });

      // Complete item
      await onboardingService.completeChecklistItem(checklist.items[0].id, employee.id);

      // Verify checklist is complete
      const isComplete = await onboardingService.isChecklistComplete(checklist.id);
      expect(isComplete).toBe(true);
    });
  });
});
