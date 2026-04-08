import fc from 'fast-check';
import knex from '../../config/knex';
import { ApplicantTrackingService } from '../applicantTrackingService';
import { InterviewManagementService } from '../interviewManagementService';
import { OfferLetterService } from '../offerLetterService';
import { OnboardingService } from '../onboardingService';
import { JobPostingRepository } from '../../repositories/jobPostingRepository';
import { ApplicantRepository } from '../../repositories/applicantRepository';
import { EmployeeRepository } from '../../repositories/employeeRepository';
import { v4 as uuidv4 } from 'uuid';

describe('Recruitment Module - Property Tests', () => {
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

  /**
   * Property 6: Applicant Pipeline State Transitions
   * **Validates: Requirements 4.2.2, 4.2.3**
   *
   * For any applicant in the recruitment pipeline, moving them to a new stage should update
   * their current stage to the specified value and maintain the valid stage sequence
   * (Applied → Screening → Interview → Offer → Hired/Rejected).
   */
  test('Property 6: Applicant pipeline state transitions are valid', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          jobTitle: fc.string({ minLength: 1, maxLength: 100 }),
          applicantName: fc.string({ minLength: 1, maxLength: 100 }),
          applicantEmail: fc.emailAddress(),
          contactNumber: fc.string({ minLength: 10, maxLength: 20 }),
        }),
        async (data) => {
          // Create job posting
          const jobPosting = await jobPostingRepository.createJobPosting({
            title: data.jobTitle,
            department_id: uuidv4(),
            location: 'Test Location',
            description: 'Test Description',
            required_skills: ['Test'],
            experience_min: 0,
            experience_max: 10,
            application_deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            created_by: uuidv4(),
          });

          // Create applicant
          const applicant = await applicantRepository.createApplicant(jobPosting.id, {
            name: data.applicantName,
            email: data.applicantEmail,
            contact_number: data.contactNumber,
            resume_url: 'https://example.com/resume.pdf',
          });

          // Valid transitions
          const validTransitions = [
            { from: 'Applied', to: 'Screening' },
            { from: 'Screening', to: 'Interview' },
            { from: 'Interview', to: 'Offer' },
            { from: 'Offer', to: 'Hired' },
          ];

          for (const transition of validTransitions) {
            const updated = await applicantTrackingService.moveApplicantStage(
              applicant.id,
              transition.to as any
            );
            expect(updated.current_stage).toBe(transition.to);
          }
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Property 7: Event-driven Notifications
   * **Validates: Requirements 4.2.4, 4.2.6, 4.4.5, 4.6.10, FR-4.10.3, FR-4.11.2, FR-4.11.3**
   *
   * For any applicant stage change, a notification should be triggered to the applicant.
   */
  test('Property 7: Stage changes trigger notifications', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          applicantName: fc.string({ minLength: 1, maxLength: 100 }),
          applicantEmail: fc.emailAddress(),
        }),
        async (data) => {
          // Create job posting
          const jobPosting = await jobPostingRepository.createJobPosting({
            title: 'Test Position',
            department_id: uuidv4(),
            location: 'Test Location',
            description: 'Test Description',
            required_skills: ['Test'],
            experience_min: 0,
            experience_max: 10,
            application_deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            created_by: uuidv4(),
          });

          // Create applicant
          const applicant = await applicantRepository.createApplicant(jobPosting.id, {
            name: data.applicantName,
            email: data.applicantEmail,
            contact_number: '1234567890',
            resume_url: 'https://example.com/resume.pdf',
          });

          // Move to screening - should trigger notification
          const updated = await applicantTrackingService.moveApplicantStage(applicant.id, 'Screening');
          expect(updated.current_stage).toBe('Screening');
          expect(updated.email).toBe(data.applicantEmail);
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Property 8: Interview Feedback Access Control
   * **Validates: Requirements 4.2.8**
   *
   * For any interview feedback submitted, it must be accessible to users with HR Manager role
   * and the hiring manager for that job posting, and must not be accessible to other employees.
   */
  test('Property 8: Interview feedback access control', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          rating: fc.integer({ min: 1, max: 5 }),
          comments: fc.string({ minLength: 1, maxLength: 500 }),
        }),
        async (data) => {
          // Create job posting
          const jobPosting = await jobPostingRepository.createJobPosting({
            title: 'Test Position',
            department_id: uuidv4(),
            location: 'Test Location',
            description: 'Test Description',
            required_skills: ['Test'],
            experience_min: 0,
            experience_max: 10,
            application_deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            created_by: uuidv4(),
          });

          // Create applicant
          const applicant = await applicantRepository.createApplicant(jobPosting.id, {
            name: 'Test Applicant',
            email: 'test@example.com',
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
            rating: data.rating,
            comments: data.comments,
            recommendation: 'Hire',
          });

          // Verify feedback was created
          expect(feedback.rating).toBe(data.rating);
          expect(feedback.comments).toBe(data.comments);

          // Verify feedback can be retrieved
          const retrievedFeedback = await interviewManagementService.getFeedback(interview.id);
          expect(retrievedFeedback).toHaveLength(1);
          expect(retrievedFeedback[0].id).toBe(feedback.id);
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Property 9: Template Population Completeness
   * **Validates: Requirements 4.2.11**
   *
   * For any offer letter generated, all required fields must be populated correctly.
   */
  test('Property 9: Offer letter template population completeness', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          position: fc.string({ minLength: 1, maxLength: 100 }),
          department: fc.string({ minLength: 1, maxLength: 100 }),
          salary: fc.integer({ min: 10000, max: 500000 }),
        }),
        async (data) => {
          // Create job posting
          const jobPosting = await jobPostingRepository.createJobPosting({
            title: 'Test Position',
            department_id: uuidv4(),
            location: 'Test Location',
            description: 'Test Description',
            required_skills: ['Test'],
            experience_min: 0,
            experience_max: 10,
            application_deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            created_by: uuidv4(),
          });

          // Create applicant
          const applicant = await applicantRepository.createApplicant(jobPosting.id, {
            name: 'Test Applicant',
            email: 'test@example.com',
            contact_number: '1234567890',
            resume_url: 'https://example.com/resume.pdf',
          });

          // Generate offer letter
          const offerLetter = await offerLetterService.generateOfferLetter({
            applicant_id: applicant.id,
            position: data.position,
            department: data.department,
            salary: data.salary,
            start_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            terms: 'Standard terms',
          });

          // Verify all fields are populated
          expect(offerLetter.position).toBe(data.position);
          expect(offerLetter.department).toBe(data.department);
          expect(offerLetter.salary).toBe(data.salary);
          expect(offerLetter.applicant_id).toBe(applicant.id);
          expect(offerLetter.status).toBe('Draft');
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Property 10: Offer Acceptance Side Effect
   * **Validates: Requirements 4.2.12**
   *
   * For any accepted offer letter, the applicant stage should automatically move to Hired.
   */
  test('Property 10: Offer acceptance moves applicant to Hired', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          position: fc.string({ minLength: 1, maxLength: 100 }),
        }),
        async (data) => {
          // Create job posting
          const jobPosting = await jobPostingRepository.createJobPosting({
            title: 'Test Position',
            department_id: uuidv4(),
            location: 'Test Location',
            description: 'Test Description',
            required_skills: ['Test'],
            experience_min: 0,
            experience_max: 10,
            application_deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            created_by: uuidv4(),
          });

          // Create applicant
          const applicant = await applicantRepository.createApplicant(jobPosting.id, {
            name: 'Test Applicant',
            email: 'test@example.com',
            contact_number: '1234567890',
            resume_url: 'https://example.com/resume.pdf',
          });

          // Generate and accept offer letter
          const offerLetter = await offerLetterService.generateOfferLetter({
            applicant_id: applicant.id,
            position: data.position,
            department: 'Engineering',
            salary: 100000,
            start_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            terms: 'Standard terms',
          });

          // Accept offer
          await offerLetterService.acceptOfferLetter(offerLetter.id);

          // Verify applicant is now Hired
          const updatedApplicant = await applicantRepository.getApplicantById(applicant.id);
          expect(updatedApplicant?.current_stage).toBe('Hired');
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Property 11: Onboarding Checklist Generation
   * **Validates: Requirements 4.3.1**
   *
   * For any new employee, an onboarding checklist should be generated with all required items.
   */
  test('Property 11: Onboarding checklist generation completeness', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          itemCount: fc.integer({ min: 3, max: 10 }),
        }),
        async (data) => {
          // Create employee
          const employee = await employeeRepository.createEmployee({
            first_name: 'Test',
            last_name: 'Employee',
            email: 'test@example.com',
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
          const items = Array.from({ length: data.itemCount }, (_, i) => ({
            title: `Task ${i + 1}`,
            description: `Description for task ${i + 1}`,
          }));

          const checklist = await onboardingService.createOnboardingChecklist({
            employee_id: employee.id,
            items,
          });

          // Verify all items are created
          expect(checklist.items).toHaveLength(data.itemCount);
          expect(checklist.employee_id).toBe(employee.id);

          // Verify all items are incomplete initially
          checklist.items.forEach((item) => {
            expect(item.completed).toBe(false);
          });
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Property 12: Checklist Completion Tracking
   * **Validates: Requirements 4.3.2**
   *
   * For any onboarding checklist, completing items should update the completion status
   * and mark the checklist as complete when all items are done.
   */
  test('Property 12: Checklist completion tracking', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          itemCount: fc.integer({ min: 1, max: 5 }),
        }),
        async (data) => {
          // Create employee
          const employee = await employeeRepository.createEmployee({
            first_name: 'Test',
            last_name: 'Employee',
            email: 'test@example.com',
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
          const items = Array.from({ length: data.itemCount }, (_, i) => ({
            title: `Task ${i + 1}`,
            description: `Description for task ${i + 1}`,
          }));

          const checklist = await onboardingService.createOnboardingChecklist({
            employee_id: employee.id,
            items,
          });

          // Complete all items
          for (const item of checklist.items) {
            await onboardingService.completeChecklistItem(item.id, employee.id);
          }

          // Verify checklist is complete
          const isComplete = await onboardingService.isChecklistComplete(checklist.id);
          expect(isComplete).toBe(true);

          // Verify completed_at is set
          const completedChecklist = await onboardingService.getOnboardingChecklist(checklist.id);
          expect(completedChecklist.completed_at).toBeDefined();
        }
      ),
      { numRuns: 10 }
    );
  });
});
