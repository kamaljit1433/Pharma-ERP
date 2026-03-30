import knex from '../../config/knex';
import { JobPostingRepository } from '../../repositories/jobPostingRepository';
import { EmployeeRepository } from '../../repositories/employeeRepository';
import { ApplicantTrackingService } from '../applicantTrackingService';
import { InterviewManagementService } from '../interviewManagementService';
import { OnboardingService } from '../onboardingService';
import { v4 as uuidv4 } from 'uuid';

describe('Phase 7: Recruitment Complete - Unit Tests', () => {
  let jobPostingRepository: JobPostingRepository;
  let employeeRepository: EmployeeRepository;
  let departmentId: string;
  let designationId: string;

  beforeAll(async () => {
    jobPostingRepository = new JobPostingRepository(knex);
    employeeRepository = new EmployeeRepository(knex);

    // Create test department
    const deptResult = await knex('departments').insert({
      id: uuidv4(),
      name: 'Test Department',
      created_at: new Date(),
      updated_at: new Date(),
    }).returning('id');
    departmentId = deptResult[0]?.id || deptResult[0];

    // Create test designation
    const desigResult = await knex('designations').insert({
      id: uuidv4(),
      title: 'Test Designation',
      grade: 'A',
      department_id: departmentId,
      level: 1,
      created_at: new Date(),
      updated_at: new Date(),
    }).returning('id');
    designationId = desigResult[0]?.id || desigResult[0];
  });

  afterAll(async () => {
    // Clean up test data
    await knex('designations').where({ title: 'Test Designation' }).del();
    await knex('departments').where({ name: 'Test Department' }).del();
  });

  afterEach(async () => {
    await knex('applicants').del();
    await knex('interviews').del();
    await knex('interview_feedback').del();
    await knex('onboarding_checklists').del();
    await knex('job_postings').del();
  });

  // ===== INTERVIEW MANAGEMENT SERVICE TESTS =====
  describe('Interview Management Service', () => {
    test('should schedule an interview for an applicant', async () => {
      const interviewManagementService = new InterviewManagementService(knex);
      const applicantTrackingService = new ApplicantTrackingService(knex);

      const jobPosting = await jobPostingRepository.createJobPosting({
        title: 'Senior Developer',
        department_id: departmentId,
        description: 'We are looking for a senior developer',
        designation_id: designationId,
        positions_count: 1,
      });

      const applicant = await applicantTrackingService.addApplicant(jobPosting.id, {
        name: 'John Doe',
        email: `john-${uuidv4()}@example.com`,
        contact_number: '1234567890',
        resume_url: 'https://example.com/resume.pdf',
      });

      const interviewDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const interview = await interviewManagementService.scheduleInterview({
        applicant_id: applicant.id,
        scheduled_at: interviewDate,
        mode: 'Video',
        interviewers: [uuidv4()],
      });

      expect(interview.id).toBeDefined();
      expect(interview.applicant_id).toBe(applicant.id);
      expect(interview.type).toBe('video');
      expect(interview.status).toBe('scheduled');
    });

    test('should submit interview feedback with valid rating', async () => {
      const interviewManagementService = new InterviewManagementService(knex);
      const applicantTrackingService = new ApplicantTrackingService(knex);

      // Create an interviewer employee
      const interviewer = await employeeRepository.createEmployee({
        first_name: 'Jane',
        last_name: 'Interviewer',
        email: `interviewer-${uuidv4()}@example.com`,
        phone: '9876543210',
        date_of_birth: '1985-03-20',
        gender: 'female',
        address: 'Test Address',
        city: 'Test City',
        state: 'Test State',
        postal_code: '12345',
        country: 'Test Country',
        department_id: departmentId,
        designation_id: designationId,
        date_of_joining: new Date().toISOString().split('T')[0] || '2024-01-01',
        employment_type: 'permanent',
      });

      const jobPosting = await jobPostingRepository.createJobPosting({
        title: 'Senior Developer',
        department_id: departmentId,
        description: 'We are looking for a senior developer',
        designation_id: designationId,
        positions_count: 1,
      });

      const applicant = await applicantTrackingService.addApplicant(jobPosting.id, {
        name: 'John Doe',
        email: `john-${uuidv4()}@example.com`,
        contact_number: '1234567890',
        resume_url: 'https://example.com/resume.pdf',
      });

      const interview = await interviewManagementService.scheduleInterview({
        applicant_id: applicant.id,
        scheduled_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
        mode: 'Video',
        interviewers: [interviewer.id],
      });

      const feedback = await interviewManagementService.submitFeedback({
        interview_id: interview.id,
        interviewer_id: interviewer.id,
        rating: 4,
        comments: 'Great candidate',
        recommendation: 'hire',
      });

      expect(feedback.id).toBeDefined();
      expect(feedback.rating).toBe(4);
      expect(feedback.comments).toBe('Great candidate');
      expect(feedback.recommendation).toBe('hire');
    });

    test('should retrieve interview feedback', async () => {
      const interviewManagementService = new InterviewManagementService(knex);
      const applicantTrackingService = new ApplicantTrackingService(knex);

      // Create an interviewer employee
      const interviewer = await employeeRepository.createEmployee({
        first_name: 'Bob',
        last_name: 'Interviewer',
        email: `bob-${uuidv4()}@example.com`,
        phone: '5555555555',
        date_of_birth: '1988-07-10',
        gender: 'male',
        address: 'Test Address',
        city: 'Test City',
        state: 'Test State',
        postal_code: '12345',
        country: 'Test Country',
        department_id: departmentId,
        designation_id: designationId,
        date_of_joining: new Date().toISOString().split('T')[0] || '2024-01-01',
        employment_type: 'permanent',
      });

      const jobPosting = await jobPostingRepository.createJobPosting({
        title: 'Senior Developer',
        department_id: departmentId,
        description: 'We are looking for a senior developer',
        designation_id: designationId,
        positions_count: 1,
      });

      const applicant = await applicantTrackingService.addApplicant(jobPosting.id, {
        name: 'John Doe',
        email: `john2-${uuidv4()}@example.com`,
        contact_number: '1234567890',
        resume_url: 'https://example.com/resume.pdf',
      });

      const interview = await interviewManagementService.scheduleInterview({
        applicant_id: applicant.id,
        scheduled_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
        mode: 'Video',
        interviewers: [interviewer.id],
      });

      await interviewManagementService.submitFeedback({
        interview_id: interview.id,
        interviewer_id: interviewer.id,
        rating: 4,
        comments: 'Great candidate',
        recommendation: 'hire',
      });

      const feedback = await interviewManagementService.getFeedback(interview.id);
      expect(feedback).toHaveLength(1);
      expect(feedback[0]?.rating).toBe(4);
    });
  });

  // ===== ONBOARDING SERVICE TESTS =====
  describe('Onboarding Service', () => {
    test('should create onboarding checklist with items', async () => {
      const onboardingService = new OnboardingService(knex);

      const employee = await employeeRepository.createEmployee({
        first_name: 'John',
        last_name: 'Doe',
        email: `john-onboard-${uuidv4()}@example.com`,
        phone: '1234567890',
        date_of_birth: '1990-01-01',
        gender: 'male',
        address: 'Test Address',
        city: 'Test City',
        state: 'Test State',
        postal_code: '12345',
        country: 'Test Country',
        department_id: departmentId,
        designation_id: designationId,
        date_of_joining: new Date().toISOString().split('T')[0] || '2024-01-01',
        employment_type: 'permanent',
      });

      const checklist = await onboardingService.createOnboardingChecklist({
        employee_id: employee.id,
        items: [
          { title: 'IT Setup', description: 'Provide laptop and email' },
          { title: 'Office Access', description: 'Issue access card' },
        ],
      });

      expect(checklist.id).toBeDefined();
      expect(checklist.employee_id).toBe(employee.id);
      expect(checklist.items).toHaveLength(2);
      expect(checklist.items[0]?.completed).toBe(false);
    });

    test('should complete checklist items', async () => {
      const onboardingService = new OnboardingService(knex);

      const employee = await employeeRepository.createEmployee({
        first_name: 'John',
        last_name: 'Doe',
        email: `john-complete-${uuidv4()}@example.com`,
        phone: '1234567890',
        date_of_birth: '1990-01-01',
        gender: 'male',
        address: 'Test Address',
        city: 'Test City',
        state: 'Test State',
        postal_code: '12345',
        country: 'Test Country',
        department_id: departmentId,
        designation_id: designationId,
        date_of_joining: new Date().toISOString().split('T')[0] || '2024-01-01',
        employment_type: 'permanent',
      });

      const checklist = await onboardingService.createOnboardingChecklist({
        employee_id: employee.id,
        items: [{ title: 'IT Setup', description: 'Provide laptop and email' }],
      });

      await onboardingService.completeChecklistItem(checklist.items[0]?.id || '', employee.id);

      const isComplete = await onboardingService.isChecklistComplete(checklist.id);
      expect(isComplete).toBe(true);
    });

    test('should mark checklist as complete when all items done', async () => {
      const onboardingService = new OnboardingService(knex);

      const employee = await employeeRepository.createEmployee({
        first_name: 'Jane',
        last_name: 'Smith',
        email: `jane-${uuidv4()}@example.com`,
        phone: '9876543210',
        date_of_birth: '1992-05-15',
        gender: 'female',
        address: 'Test Address',
        city: 'Test City',
        state: 'Test State',
        postal_code: '12345',
        country: 'Test Country',
        department_id: departmentId,
        designation_id: designationId,
        date_of_joining: new Date().toISOString().split('T')[0] || '2024-01-01',
        employment_type: 'permanent',
      });

      const checklist = await onboardingService.createOnboardingChecklist({
        employee_id: employee.id,
        items: [
          { title: 'IT Setup', description: 'Provide laptop and email' },
          { title: 'Office Access', description: 'Issue access card' },
        ],
      });

      for (const item of checklist.items) {
        await onboardingService.completeChecklistItem(item.id, employee.id);
      }

      const completedChecklist = await onboardingService.getOnboardingChecklist(checklist.id);
      expect(completedChecklist.completed_date).toBeDefined();
    });
  });
});
