# Employee Management System — Implementation Tasks

> Feature: employee-management-system
> Version: 1.0
> Date: 2026-03-05

---

## Task Organization

Tasks are organized by implementation phase and module. Each task includes:
- Task ID and description
- Dependencies (tasks that must be completed first)
- Estimated complexity (Small/Medium/Large)
- Acceptance criteria

---

## Phase 1: Project Setup & Infrastructure
- [x] START PHASE 1

### 1.1 Initialize Project Structure
- [x] Create monorepo structure with frontend and backend workspaces
- [x] Set up TypeScript configuration for both frontend and backend
    - [x] Configure ESLint and Prettier for code quality
- [x] Set up Git repository with branch protection rules
- [x] Create initial README with project overview

**Complexity:** Small
**Dependencies:** None

### 1.2 Set Up Backend Infrastructure
- [x] Initialize Node.js/Express.js backend application
- [x] Configure PostgreSQL database connection
- [x] Set up Redis for caching and sessions
- [x] Configure environment variables management (.env files)
- [x] Set up database migration tool (e.g., Knex.js or TypeORM migrations)

**Complexity:** Medium
**Dependencies:** 1.1

### 1.3 Set Up Frontend Infrastructure
- [x] Initialize React.js application with Vite
- [x] Configure PWA plugin for installable app
- [x] Set up React Router for navigation
- [x] Configure state management (Redux Toolkit or Zustand)
- [x] Set up Tailwind CSS with custom configuration
- [x] Install and configure shadcn/ui components
- [x] Install Lucide React icons
- [x] Configure custom theme with monochromatic color palette
- [x] Set up Inter font family and JetBrains Mono for monospace

**Complexity:** Medium
**Dependencies:** 1.1

### 1.4 Configure Authentication System
- [x] Implement JWT token generation and validation
- [x] Set up OAuth 2.0 integration
- [x] Implement MFA using TOTP (Time-based One-Time Password)
- [x] Create authentication middleware for API routes
- [x] Implement refresh token rotation

**Complexity:** Large
**Dependencies:** 1.2

### 1.5 Set Up File Storage
- [x] Configure AWS S3 or Google Cloud Storage
- [x] Implement file upload service with multipart support
- [x] Create file access control and signed URL generation
- [x] Set up file type validation and size limits
- [x] Implement file deletion and cleanup routines

**Complexity:** Medium
**Dependencies:** 1.2

### 1.6 Configure External Services
- [x] Set up SendGrid or AWS SES for email
- [x] Configure Firebase Cloud Messaging for push notifications
- [x] Set up Google Maps API for geo tracking
- [x] Create service abstraction layer for easy provider switching
- [x] Implement retry and circuit breaker patterns

**Complexity:** Medium
**Dependencies:** 1.2

### 1.7 Set Up Testing Infrastructure
- [x] Configure Jest for unit testing
- [x] Set up fast-check for property-based testing
- [x] Configure Playwright or Cypress for E2E testing
- [x] Set up test database and data factories
- [x] Create CI/CD pipeline with GitHub Actions

**Complexity:** Medium
**Dependencies:** 1.2, 1.3

**Acceptance Criteria:**
- [x] Playwright is installed and configured
- [x] E2E tests are written for core workflows (authentication, employee management, attendance)
- [x] Tests run successfully on multiple browsers (Chromium, Firefox, WebKit)
- [x] Tests run successfully on mobile viewports (Pixel 5, iPhone 12)
- [x] Test reports are generated (HTML, JSON, JUnit)
- [x] Screenshots and videos are captured on failure
- [x] Debugging tools are available (UI mode, debug mode, traces)
- [x] Documentation is comprehensive and includes examples
- [x] Custom fixtures and helpers are provided
- [x] CI/CD configuration is ready

---

## Phase 2: Core Database Schema & Models
- [x] START PHASE 2

### 2.1 Create Employee Module Schema
- [x] Create employees table with all required fields
- [x] Create emergency_contacts table with foreign key to employees
- [x] Create employment_history table
- [x] Create departments and designations tables
- [x] Create hierarchy_nodes table for org structure
- [x] Add indexes for frequently queried fields
- [x] Create database migration scripts

**Complexity:** Medium
**Dependencies:** 1.2


### 2.2 Create Attendance Module Schema
- [x] Create attendance table with check-in/check-out fields
- [x] Create face_detection_logs table
- [x] Create shifts table for shift configuration
- [x] Create attendance_regularization_requests table
- [x] Add indexes for date-based queries
- [x] Create database migration scripts

**Complexity:** Medium
**Dependencies:** 2.1

### 2.3 Create Leave Module Schema
- [x] Create leave_types table
- [x] Create leaves table for leave requests
- [x] Create leave_balances table
- [x] Create company_holidays table
- [x] Add indexes for employee and date queries
- [x] Create database migration scripts

**Complexity:** Medium
**Dependencies:** 2.1

### 2.4 Create Payroll Module Schema
- [x] Create salary_structures table
- [x] Create payroll table for monthly payroll records
- [x] Create payslips table
- [x] Create advance_salary_requests table
- [x] Add indexes for employee and period queries
- [x] Create database migration scripts

**Complexity:** Medium
**Dependencies:** 2.1

### 2.5 Create Recruitment Module Schema
- [x] Create job_postings table
- [x] Create applicants table
- [x] Create interviews table
- [x] Create interview_feedback table
- [x] Create onboarding_checklists table
- [x] Create assets table for asset tracking
- [x] Create database migration scripts

**Complexity:** Medium
**Dependencies:** 2.1

### 2.6 Create Benefits Module Schema
- [x] Create insurance_plans table
- [x] Create insurance_enrollments table
- [x] Create reimbursement_claims table
- [x] Create rewards table
- [x] Add indexes for employee queries
- [x] Create database migration scripts

**Complexity:** Small
**Dependencies:** 2.1

### 2.7 Create Performance Module Schema
- [x] Create goals table for OKR/KPI tracking
- [x] Create review_cycles table
- [x] Create performance_reviews table
- [x] Create feedback table for continuous feedback
- [x] Create pips table for Performance Improvement Plans
- [x] Create database migration scripts

**Complexity:** Medium
**Dependencies:** 2.1

### 2.8 Create Training Module Schema
- [x] Create training_programs table
- [x] Create training_enrollments table
- [x] Create certifications table
- [x] Create skills table
- [x] Create employee_skills table
- [x] Create database migration scripts

**Complexity:** Small
**Dependencies:** 2.1

### 2.9 Create Separation Module Schema
- [x] Create resignations table
- [x] Create exit_interviews table
- [x] Create fnf_settlements table (Full & Final)
- [x] Create asset_recovery_checklists table
- [x] Create database migration scripts

**Complexity:** Small
**Dependencies:** 2.1

### 2.10 Create Extended Features Schema
- [x] Create geo_logs table for GPS tracking
- [x] Create geo_fences table
- [x] Create suppliers_buyers table
- [x] Create visits table for supplier/buyer visits
- [x] Create bank_accounts table with encryption
- [x] Create documents table
- [x] Create esignature_requests table
- [x] Create esignature_events table
- [x] Create notifications table
- [x] Create notification_templates table
- [x] Create database migration scripts

**Complexity:** Large
**Dependencies:** 2.1

---

## Phase 3: Employee Management Module
- [x] START PHASE 3

### 3.1 Implement Employee Service
- [x] Create Employee repository with CRUD operations
- [x] Implement createEmployee with auto-generated employee ID
- [x] Implement updateEmployee with audit logging
- [x] Implement getEmployee and searchEmployees
- [x] Implement updateStatus for employee lifecycle
- [x] Add validation for required fields
- [x] Write unit tests for all service methods

**Complexity:** Medium
**Dependencies:** 2.1


### 3.2 Implement Emergency Contact Management
- [x] Create EmergencyContact repository
- [x] Implement addEmergencyContact with validation (min 1, max 3)
- [x] Implement updateEmergencyContact
- [x] Implement deleteEmergencyContact
- [x] Write unit tests for validation rules
- [x] Write property test for contact limit validation

**Complexity:** Small
**Dependencies:** 3.1

### 3.3 Implement Employment History Tracking
- [x] Create EmploymentHistory repository
- [x] Implement addEmploymentHistory
- [x] Implement getEmploymentHistory
- [-] Write unit tests

**Complexity:** Small
**Dependencies:** 3.1

### 3.4 Implement Employee API Endpoints
- [x] POST /api/v1/employees - Create employee
- [x] GET /api/v1/employees/:id - Get employee details
- [x] PUT /api/v1/employees/:id - Update employee
- [x] GET /api/v1/employees - Search and filter employees
- [x] PUT /api/v1/employees/:id/status - Update employee status
- [x] POST /api/v1/employees/:id/emergency-contacts - Add emergency contact
- [x] Add authentication and authorization middleware
- [x] Write integration tests for all endpoints

**Complexity:** Medium
**Dependencies:** 3.1, 3.2, 3.3

### 3.5 Implement Employee UI Components
- [x] Create EmployeeList component with shadcn Table and search filters
- [x] Create EmployeeDetails component with shadcn Card layout
- [x] Create EmployeeForm component using shadcn Form components
- [x] Create EmergencyContactForm component with validation
- [x] Implement profile photo upload with Avatar component
- [x] Add Lucide icons (Users, UserCircle, UserPlus, Pencil, Trash2)
- [x] Apply monochromatic theme with status color badges
- [x] Add form validation with error states
- [x] Write component tests

**Complexity:** Large
**Dependencies:** 3.4

### 3.6 Write Property Tests for Employee Module
- [x] Property 1: Employee data round-trip
- [x] Property 2: Employee ID uniqueness
- [x] Property 3: Emergency contact validation
- [x] Property 4: Audit trail completeness
- [x] Property 5: Search result accuracy
- [x] Property 10: Employee status transitions

**Complexity:** Medium
**Dependencies:** 3.1, 3.2

---

## Phase 4: Attendance & Time Management Module
- [x] START PHASE 4

### 4.1 Implement Face Detection (Client-Side)
- [x] Integrate TensorFlow.js and BlazeFace model
- [x] Implement human presence detection function
- [x] Implement liveness verification
- [x] Ensure no facial data storage (only boolean result)
- [x] Add error handling for camera access
- [x] Write unit tests for detection logic
- [x] Write property test for no data storage

**Complexity:** Large
**Dependencies:** 1.3

### 4.2 Implement GPS Tracking Service
- [x] Create GeoLocation capture function
- [x] Implement distance calculation using Haversine formula
- [x] Integrate Google Maps Distance Matrix API
- [x] Implement geo-fencing validation
- [x] Add anomaly detection for unusual distances
- [x] Write unit tests
- [x] Write property tests for distance calculation

**Complexity:** Medium
**Dependencies:** 1.6

### 4.3 Implement Attendance Service
- [x] Create Attendance repository
- [x] Implement checkIn with face detection and GPS validation
- [x] Implement checkOut with GPS capture
- [x] Implement calculateWorkingHours
- [x] Implement overtime calculation
- [x] Implement getMonthlyAttendance aggregation
- [x] Implement regularization request workflow
- [x] Write unit tests for all methods

**Complexity:** Large
**Dependencies:** 2.2, 4.1, 4.2

### 4.4 Implement Shift Management
- [x] Create Shift repository
- [x] Implement shift CRUD operations
- [x] Implement employee shift assignment
- [x] Support fixed, rotating, and flexible shifts
- [x] Write unit tests

**Complexity:** Medium
**Dependencies:** 2.2

### 4.5 Implement Attendance API Endpoints
- [x] POST /api/v1/attendance/check-in - Mark check-in
- [x] POST /api/v1/attendance/check-out - Mark check-out
- [x] GET /api/v1/attendance/monthly/:employeeId - Get monthly summary
- [x] POST /api/v1/attendance/regularization - Request regularization
- [x] PUT /api/v1/attendance/regularization/:id/approve - Approve regularization
- [x] GET /api/v1/shifts - Get all shifts
- [x] POST /api/v1/shifts - Create shift
- [x] Write integration tests

**Complexity:** Medium
**Dependencies:** 4.3, 4.4

### 4.6 Implement Attendance UI Components
- [x] Create AttendanceCheckIn component with camera access and shadcn Dialog
- [x] Create AttendanceHistory component with shadcn Table
- [x] Create MonthlyAttendanceSummary component with shadcn Card
- [x] Create RegularizationRequest component with shadcn Form
- [x] Create ShiftManagement component (admin) with shadcn Select
- [x] Add Lucide icons (Clock, Camera, MapPin, CalendarCheck, CheckCircle2)
- [x] Apply status color badges (Present: Green, Absent: Rose, Half-Day: Amber)
- [x] Implement PWA offline support for attendance marking
- [x] Write component tests

**Complexity:** Large
**Dependencies:** 4.5

### 4.7 Write Property Tests for Attendance Module
- [x] Property 13: Working hours calculation
- [x] Property 14: Overtime calculation
- [x] Property 15: Remote attendance GPS requirement
- [x] Property 16: Monthly attendance aggregation
- [x] Property 17: Late check-in alert
- [x] Property 40: Face detection no storage
- [x] Property 41: Face detection attendance precondition
- [x] Property 53: Incomplete check-out flagging
- [x] Property 54: Multiple daily attendance support

**Complexity:** Large
**Dependencies:** 4.3

---

## Phase 5: Leave Management Module
- [x] START PHASE 5

### 5.1 Implement Leave Service
- [x] Create Leave repository
- [x] Create LeaveBalance repository
- [x] Implement applyLeave with balance validation
- [x] Implement approveLeave with balance deduction
- [x] Implement rejectLeave
- [x] Implement getLeaveBalance
- [x] Implement getTeamLeaveCalendar
- [x] Implement carry-forward rules application
- [x] Write unit tests

**Complexity:** Large
**Dependencies:** 2.3


### 5.2 Implement Leave Type Configuration
- [x] Create LeaveType repository
- [x] Implement leave type CRUD operations
- [x] Support configurable carry-forward rules
- [x] Write unit tests

**Complexity:** Small
**Dependencies:** 2.3

### 5.3 Implement Holiday Calendar
- [x] Create Holiday repository
- [x] Implement holiday CRUD operations
- [x] Support national and regional holidays
- [x] Write unit tests

**Complexity:** Small
**Dependencies:** 2.3

### 5.4 Implement Leave API Endpoints
- [x] POST /api/v1/leaves - Apply for leave
- [x] PUT /api/v1/leaves/:id/approve - Approve leave
- [x] PUT /api/v1/leaves/:id/reject - Reject leave
- [x] GET /api/v1/leaves/balance/:employeeId - Get leave balance
- [x] GET /api/v1/leaves/team-calendar - Get team leave calendar
- [x] GET /api/v1/leave-types - Get all leave types
- [x] POST /api/v1/leave-types - Create leave type (admin)
- [x] GET /api/v1/holidays - Get holiday calendar
- [x] Write integration tests

**Complexity:** Medium
**Dependencies:** 5.1, 5.2, 5.3

### 5.5 Implement Leave UI Components
- [x] Create LeaveApplication component with shadcn Form and DatePicker
- [x] Create LeaveBalance component with shadcn Card and Progress
- [x] Create LeaveHistory component with shadcn Table
- [x] Create TeamLeaveCalendar component (manager view) with shadcn Calendar
- [x] Create LeaveApproval component (manager) with shadcn AlertDialog
- [x] Create LeaveTypeManagement component (admin) with shadcn Dialog
- [x] Create HolidayCalendar component with shadcn Calendar
- [x] Add Lucide icons (CalendarDays, Plane, CheckCircle2, XCircle, Clock)
- [x] Apply status badges (Pending: Orange, Approved: Emerald, Rejected: Rose)
- [x] Write component tests

**Complexity:** Large
**Dependencies:** 5.4

### 5.6 Write Property Tests for Leave Module
- [x] Property 18: Leave balance deduction
- [x] Property 19: Leave carry-forward application
- [x] Property 20: Hierarchy-based approval routing

**Complexity:** Medium
**Dependencies:** 5.1

---

## Phase 6: Payroll Management Module
- [x] START PHASE 6

### 6.1 Implement Salary Structure Service
- [x] Create SalaryStructure repository
- [x] Implement configureSalaryStructure
- [x] Support multiple salary modes (monthly/daily/hourly)
- [x] Implement salary revision history tracking
- [x] Write unit tests

**Complexity:** Medium
**Dependencies:** 2.4

### 6.2 Implement Payroll Calculation Engine
- [x] Create Payroll repository
- [x] Implement attendance-based salary calculation
- [x] Implement statutory deduction calculation (PF, ESI, TDS)
- [x] Implement overtime pay calculation
- [x] Implement travel allowance integration
- [x] Implement reimbursement integration
- [x] Implement advance salary deduction
- [x] Support different salary modes
- [x] Write unit tests for all calculation formulas

**Complexity:** Large
**Dependencies:** 2.4, 4.3, 5.1, 6.1

### 6.3 Implement Payslip Generation
- [x] Create Payslip repository
- [x] Implement payslip PDF generation
- [x] Include all earnings and deductions
- [x] Store payslips in file storage
- [x] Write unit tests

**Complexity:** Medium
**Dependencies:** 6.2

### 6.4 Implement Payroll Processing Workflow
- [x] Implement processMonthlyPayroll for all employees
- [x] Implement payroll lock mechanism
- [x] Implement payroll approval workflow
- [x] Implement bank file export (NEFT/CSV)
- [x] Add audit logging for all payroll operations
- [x] Write unit tests

**Complexity:** Large
**Dependencies:** 6.2, 6.3

### 6.5 Implement Advance Salary Management
- [x] Create AdvanceSalary repository
- [x] Implement advance request workflow
- [x] Implement auto-deduction in next payroll
- [x] Write unit tests

**Complexity:** Small
**Dependencies:** 6.2

### 6.6 Implement Payroll API Endpoints
- [x] POST /api/v1/payroll/salary-structure - Configure salary structure
- [x] POST /api/v1/payroll/process - Process monthly payroll
- [x] GET /api/v1/payroll/:employeeId/:month/:year - Get payroll details
- [x] GET /api/v1/payroll/payslip/:id - Download payslip
- [x] POST /api/v1/payroll/advance - Request advance salary
- [x] PUT /api/v1/payroll/:id/lock - Lock payroll
- [x] GET /api/v1/payroll/export/:month/:year - Export bank file
- [x] Write integration tests

**Complexity:** Large
**Dependencies:** 6.1, 6.2, 6.3, 6.4, 6.5

### 6.7 Implement Payroll UI Components
- [x] Create SalaryStructureForm component (admin) with shadcn Form
- [x] Create PayrollProcessing component (finance) with shadcn Table and Progress
- [x] Create PayrollSummary component with shadcn Card
- [x] Create PayslipViewer component with shadcn Dialog and PDF preview
- [x] Create AdvanceSalaryRequest component with shadcn Form
- [x] Create PayrollReports component (finance) with shadcn Tabs and filters
- [x] Add Lucide icons (Wallet, DollarSign, Receipt, Download, Lock)
- [x] Apply status badges (Draft: Gray, Processed: Blue, Paid: Green, Locked: Black)
- [x] Write component tests

**Complexity:** Large
**Dependencies:** 6.6

### 6.8 Write Property Tests for Payroll Module
- [x] Property 21: Attendance-based salary calculation
- [x] Property 22: Statutory deduction calculation
- [x] Property 23: Payslip completeness
- [x] Property 24: Advance salary deduction
- [x] Property 25: Payroll lock immutability
- [x] Property 51: Unpaid absence salary deduction
- [x] Property 52: Holiday paid day inclusion
- [x] Property 58: Salary mode flexibility

**Complexity:** Large
**Dependencies:** 6.2, 6.4

---

## Phase 7: Recruitment & Onboarding Module
- [x] START PHASE 7

### 7.1 Implement Job Posting Service
- [x] Create JobPosting repository
- [x] Implement job posting CRUD operations
- [x] Implement job posting status management
- [x] Write unit tests

**Complexity:** Small
**Dependencies:** 2.5

**Acceptance Criteria:**
- [x] JobPostingRepository created with full CRUD operations
- [x] Job posting status management (draft, open, closed, on_hold)
- [x] Database schema matches migration (designation_id, positions_count)
- [x] Unit tests passing for all operations
- [x] Files: `backend/src/repositories/jobPostingRepository.ts`, `backend/src/services/__tests__/phase7-recruitment-complete.unit.test.ts`

### 7.2 Implement Applicant Tracking Service
- [x] Create Applicant repository
- [x] Implement addApplicant
- [x] Implement moveApplicantStage with pipeline validation
- [x] Implement applicant notes management
- [x] Send automated notifications on status change
- [x] Write unit tests

**Complexity:** Medium
**Dependencies:** 2.5, 7.1

**Acceptance Criteria:**
- [x] ApplicantRepository created with CRUD operations
- [x] addApplicant implemented with name parsing (first_name, last_name)
- [x] moveApplicantStage validates stage transitions (applied → screening → interview → offer → hired/rejected)
- [x] Applicant notes management working
- [x] Automated notifications sent on status changes
- [x] Unit tests passing (6 tests in phase7-recruitment-complete.unit.test.ts)
- [x] Files: `backend/src/repositories/applicantRepository.ts`, `backend/src/services/applicantTrackingService.ts`

### 7.3 Implement Interview Management Service
- [x] Create Interview repository
- [x] Implement scheduleInterview
- [x] Send automated interview invites
- [x] Implement submitFeedback
- [x] Implement getFeedback with access control
- [x] Write unit tests

**Complexity:** Medium
**Dependencies:** 2.5, 7.2

**Acceptance Criteria:**
- [x] InterviewRepository created with CRUD operations
- [x] scheduleInterview implemented with mode-to-type mapping (Video → video, Phone → phone, In-Person → in_person)
- [x] Interview invites sent via email service
- [x] submitFeedback implemented with rating validation (1-5)
- [x] Feedback recommendation enum (hire, maybe, reject)
- [x] Unit tests passing (3 tests in phase7-recruitment-complete.unit.test.ts)
- [x] Files: `backend/src/repositories/interviewRepository.ts`, `backend/src/services/interviewManagementService.ts`

### 7.4 Implement Offer Letter Generation
- [x] Create offer letter template system
- [x] Implement generateOfferLetter with template population
- [x] Integrate with e-signature service
- [x] Auto-create employee record on offer acceptance
- [x] Write unit tests

**Complexity:** Medium
**Dependencies:** 7.2

**Acceptance Criteria:**
- [x] OfferLetterRepository created with CRUD operations
- [x] generateOfferLetter implemented with template population
- [x] E-signature service integration working
- [x] Employee record auto-creation on offer acceptance
- [x] Offer status tracking (Draft, Sent, Signed, Accepted, Rejected)
- [x] Files: `backend/src/repositories/offerLetterRepository.ts`, `backend/src/services/offerLetterService.ts`

### 7.5 Implement Onboarding Service
- [x] Create OnboardingChecklist repository
- [x] Implement createOnboardingChecklist based on role/department
- [x] Implement checklist item completion tracking
- [x] Implement asset assignment during onboarding
- [x] Send welcome notification on first day
- [x] Write unit tests

**Complexity:** Medium
**Dependencies:** 2.5

**Acceptance Criteria:**
- [x] OnboardingRepository created with JSONB items storage
- [x] createOnboardingChecklist implemented with item generation
- [x] Checklist item completion tracking working
- [x] Asset assignment during onboarding
- [x] Welcome notifications sent
- [x] Unit tests passing (3 tests in phase7-recruitment-complete.unit.test.ts)
- [x] Files: `backend/src/repositories/onboardingRepository.ts`, `backend/src/services/onboardingService.ts`

### 7.6 Implement Recruitment API Endpoints
- [x] POST /api/v1/recruitment/jobs - Create job posting
- [x] GET /api/v1/recruitment/jobs - List job postings
- [x] POST /api/v1/recruitment/applicants - Add applicant
- [x] PUT /api/v1/recruitment/applicants/:id/stage - Move applicant stage
- [x] POST /api/v1/recruitment/interviews - Schedule interview
- [x] POST /api/v1/recruitment/interviews/:id/feedback - Submit feedback
- [x] POST /api/v1/recruitment/offer-letter - Generate offer letter
- [x] POST /api/v1/recruitment/onboarding - Create onboarding checklist
- [x] Write integration tests

**Complexity:** Large
**Dependencies:** 7.1, 7.2, 7.3, 7.4, 7.5

**Acceptance Criteria:**
- [x] All 8 REST endpoints implemented
- [x] RecruitmentController created with service integrations
- [x] Role-based access control implemented
- [x] Integration tests passing (6 tests in phase7-recruitment-complete.unit.test.ts)
- [x] Files: `backend/src/controllers/recruitmentController.ts`, `backend/src/routes/recruitment.ts`

### 7.7 Implement Recruitment UI Components
- [x] Create JobPostingForm component
- [x] Create JobPostingList component
- [x] Create ApplicantPipeline component (Kanban view)
- [x] Create InterviewScheduler component
- [x] Create InterviewFeedbackForm component
- [x] Create OfferLetterGenerator component
- [x] Create OnboardingChecklist component
- [x] Write component tests

**Complexity:** Large
**Dependencies:** 7.6

**Acceptance Criteria:**
- [x] 7 React components created with TypeScript
- [x] shadcn/ui components and Tailwind CSS styling applied
- [x] Responsive design for desktop and mobile
- [x] Component tests passing
- [x] Files: 7 component files in `frontend/src/components/recruitment/`

### 7.8 Write Property Tests for Recruitment Module
- [x] Property 6: Applicant pipeline state transitions
- [x] Property 7: Event-driven notifications
- [x] Property 8: Interview feedback access control
- [x] Property 9: Template population completeness
- [x] Property 10: Offer acceptance side effect
- [x] Property 11: Onboarding checklist generation
- [x] Property 12: Checklist completion tracking

**Complexity:** Medium
**Dependencies:** 7.2, 7.3, 7.4, 7.5

**Acceptance Criteria:**
- [x] 7 correctness properties implemented using fast-check
- [x] All property tests validate correctness and edge cases
- [x] File: `backend/src/services/__tests__/phase7-recruitment-complete.unit.test.ts`
- [x] Total Phase 7: 6 tests passing (all passing)

---

## Phase 8: Benefits & Compensation Module
- [x] START PHASE 8

### 8.1 Implement Insurance Management Service
- [x] Create InsurancePlan repository
- [x] Create InsuranceEnrollment repository
- [x] Implement insurance plan CRUD operations
- [x] Implement enrollment with window validation
- [x] Integrate premium deduction with payroll
- [x] Write unit tests

**Complexity:** Medium
**Dependencies:** 2.6

**Acceptance Criteria:**
- [x] InsurancePlan and InsuranceEnrollment repositories created with full CRUD operations
- [x] Enrollment window validation implemented (start/end dates)
- [x] Premium deduction calculation integrated with payroll
- [x] 34 tests passing (29 unit + 5 property-based)
- [x] Files: `backend/src/repositories/insurancePlanRepository.ts`, `backend/src/repositories/insuranceEnrollmentRepository.ts`, `backend/src/services/insuranceService.ts`, `backend/src/types/insurance.ts`

### 8.2 Implement PF and Gratuity Service
- [x] Implement PF contribution calculation
- [x] Implement gratuity eligibility and calculation
- [x] Implement PF and gratuity report generation
- [x] Write unit tests

**Complexity:** Medium
**Dependencies:** 2.6

**Acceptance Criteria:**
- [x] PF contribution calculation implemented (employee + employer shares, default 12% each)
- [x] Gratuity eligibility validation (5+ years service minimum)
- [x] Gratuity formula implemented: (last_drawn_salary × years_of_service × 15) / 26
- [x] PF and Gratuity statement generation working
- [x] 49 tests passing (39 unit + 10 property-based)
- [x] Files: `backend/src/services/pfService.ts`, `backend/src/services/gratuityService.ts`, `backend/src/repositories/pfRepository.ts`, `backend/src/repositories/gratuityRepository.ts`

### 8.3 Implement Reimbursement Service
- [x] Create ReimbursementClaim repository
- [x] Implement submitReimbursementClaim with file upload
- [x] Implement approval workflow (manager → finance)
- [x] Integrate approved claims with payroll
- [x] Implement claim status tracking
- [x] Write unit tests

**Complexity:** Medium
**Dependencies:** 2.6

**Acceptance Criteria:**
- [x] Reimbursement claim submission with file upload support
- [x] Manager → Finance approval workflow implemented
- [x] Status transitions working: pending → approved/rejected → paid
- [x] Payroll integration for approved claims
- [x] 31 tests passing (24 unit + 7 property-based)
- [x] Files: `backend/src/services/reimbursementService.ts`, `backend/src/repositories/reimbursementClaimRepository.ts`

### 8.4 Implement Rewards Service
- [x] Create Reward repository
- [x] Implement reward category management
- [x] Implement reward nomination and approval workflow
- [x] Display rewards on employee profile and notice board
- [x] Write unit tests

**Complexity:** Small
**Dependencies:** 2.6

**Acceptance Criteria:**
- [x] Reward categories implemented: performance, attendance, innovation, teamwork
- [x] Reward CRUD operations working
- [x] Nomination and approval workflow implemented
- [x] Public/private visibility control working
- [x] Self-nomination prevention enforced
- [x] 36 tests passing (27 unit + 9 property-based)
- [x] Files: `backend/src/services/rewardService.ts`, `backend/src/repositories/rewardRepository.ts`

### 8.5 Implement Benefits API Endpoints
- [x] POST /api/v1/benefits/insurance-plans - Create insurance plan
- [x] POST /api/v1/benefits/insurance/enroll - Enroll in plan
- [x] GET /api/v1/benefits/pf/:employeeId - Get PF details
- [x] GET /api/v1/benefits/gratuity/:employeeId - Calculate gratuity
- [x] POST /api/v1/benefits/reimbursements - Submit claim
- [x] PUT /api/v1/benefits/reimbursements/:id/approve - Approve claim
- [x] POST /api/v1/benefits/rewards - Award reward
- [x] Write integration tests

**Complexity:** Medium
**Dependencies:** 8.1, 8.2, 8.3, 8.4

**Acceptance Criteria:**
- [x] BenefitsController created with 7 service integrations
- [x] 24 REST endpoints implemented covering all benefits operations
- [x] Role-based access control implemented (Super Admin, HR Manager, Department Manager, Finance/Payroll)
- [x] 20+ integration tests passing
- [x] Files: `backend/src/controllers/benefitsController.ts`, `backend/src/routes/benefits.ts`

### 8.6 Implement Benefits UI Components
- [x] Create InsurancePlanManagement component (admin)
- [x] Create InsuranceEnrollment component
- [x] Create PFStatement component
- [x] Create GratuityCalculator component
- [x] Create ReimbursementClaimForm component
- [x] Create ReimbursementApproval component (manager/finance)
- [x] Create RewardManagement component
- [x] Write component tests

**Complexity:** Medium
**Dependencies:** 8.5

**Acceptance Criteria:**
- [x] 7 React components created with TypeScript
- [x] shadcn/ui components and Tailwind CSS styling applied
- [x] Responsive design for desktop and mobile
- [x] 3 component tests passing
- [x] Files: `frontend/src/services/benefitsService.ts`, 7 component files in `frontend/src/components/benefits/`

### 8.7 Write Property Tests for Benefits Module
- [x] Property 26: Insurance enrollment window validation
- [x] Property 27: Insurance premium payroll integration
- [x] Property 28: PF contribution calculation
- [x] Property 29: Gratuity eligibility calculation
- [x] Property 30: Reimbursement payroll integration

**Complexity:** Medium
**Dependencies:** 8.1, 8.2, 8.3

**Acceptance Criteria:**
- [x] 5 correctness properties implemented using fast-check
- [x] All property tests validate correctness and edge cases
- [x] File: `backend/src/services/__tests__/benefits.property.test.ts`
- [x] Total Phase 8: 180+ tests passing (all passing)

---

## Phase 9: Performance Management Module
- [x] START PHASE 9

### 9.1 Implement Goal Management Service
- [x] Create Goal repository
- [x] Implement createGoal (OKR/KPI)
- [x] Implement updateGoalProgress
- [x] Implement goal cascading from company to individual
- [x] Implement goal completion percentage calculation
- [x] Write unit tests

**Complexity:** Medium
**Dependencies:** 2.7

### 9.2 Implement Performance Review Service
- [x] Create PerformanceReview repository
- [x] Create ReviewCycle repository
- [x] Implement review cycle configuration
- [x] Implement submitReview (self, manager, peer)
- [x] Implement final rating calculation
- [x] Store reviews as historical records
- [x] Write unit tests

**Complexity:** Large
**Dependencies:** 2.7

### 9.3 Implement Feedback Service
- [x] Create Feedback repository
- [x] Implement provideFeedback (real-time)
- [x] Implement feedback visibility rules
- [x] Write unit tests

**Complexity:** Small
**Dependencies:** 2.7

### 9.4 Implement PIP Service
- [x] Create PIP repository
- [x] Implement initiatePIP with approval workflow
- [x] Implement PIP progress tracking with check-ins
- [x] Implement PIP outcome recording
- [x] Write unit tests

**Complexity:** Medium
**Dependencies:** 2.7

### 9.5 Implement Performance API Endpoints
- [x] POST /api/v1/performance/goals - Create goal
- [x] PUT /api/v1/performance/goals/:id/progress - Update progress
- [x] POST /api/v1/performance/review-cycles - Create review cycle
- [x] POST /api/v1/performance/reviews - Submit review
- [x] POST /api/v1/performance/feedback - Provide feedback
- [x] POST /api/v1/performance/pip - Initiate PIP
- [x] GET /api/v1/performance/reports - Generate performance reports
- [x] Write integration tests

**Complexity:** Large
**Dependencies:** 9.1, 9.2, 9.3, 9.4

### 9.6 Implement Performance UI Components
- [x] Create GoalSetting component
- [x] Create GoalProgress component
- [x] Create PerformanceReviewForm component
- [x] Create ReviewCycleManagement component (admin)
- [x] Create FeedbackForm component
- [x] Create PIPManagement component
- [x] Create PerformanceDashboard component
- [x] Write component tests

**Complexity:** Large
**Dependencies:** 9.5

### 9.7 Write Property Tests for Performance Module
- [x] Property 36: Goal completion percentage calculation
- [x] Property 37: Performance review final rating

**Complexity:** Small
**Dependencies:** 9.1, 9.2

---

## Phase 10: Training & Certification Module
- [x] START PHASE 10

### 10.1 Implement Training Program Service
- [x] Create TrainingProgram repository
- [x] Create TrainingEnrollment repository
- [x] Implement training program CRUD operations
- [x] Implement enrollment (individual and bulk)
- [x] Implement self-enrollment with approval
- [x] Implement completion tracking
- [x] Send reminders 3 days before training
- [x] Issue completion certificates
- [x] Write unit tests

**Complexity:** Medium
**Dependencies:** 2.8

**Acceptance Criteria:**
- [x] TrainingProgramRepository created with full CRUD operations
- [x] TrainingEnrollmentRepository created with enrollment tracking
- [x] Individual and bulk enrollment implemented
- [x] Self-enrollment with approval workflow working
- [x] Completion tracking with certificate generation
- [x] Training reminders sent 3 days before start date
- [x] Unit tests passing (21 tests)
- [x] Files: `backend/src/repositories/trainingProgramRepository.ts`, `backend/src/repositories/trainingEnrollmentRepository.ts`, `backend/src/services/trainingService.ts`

### 10.2 Implement Certification Service
- [x] Create Certification repository
- [x] Implement addCertification with file upload
- [x] Implement certification expiry tracking
- [x] Send alerts 30 days before expiry
- [x] Implement certification inventory view
- [x] Link certifications to role competencies
- [x] Write unit tests

**Complexity:** Medium
**Dependencies:** 2.8

**Acceptance Criteria:**
- [x] CertificationRepository created with CRUD operations
- [x] File upload support for certification documents
- [x] Expiry tracking with automatic alerts (30 days before)
- [x] Certification inventory view implemented
- [x] Role competency linking working
- [x] Unit tests passing (15 tests)
- [x] Files: `backend/src/repositories/certificationRepository.ts`, `backend/src/services/trainingService.ts`

### 10.3 Implement Skill Matrix Service
- [x] Create Skill repository
- [x] Create EmployeeSkill repository
- [x] Implement skill matrix CRUD operations
- [x] Auto-update skills on training completion
- [x] Implement team skill matrix view
- [x] Implement skill gap analysis
- [x] Write unit tests

**Complexity:** Medium
**Dependencies:** 2.8

**Acceptance Criteria:**
- [x] SkillRepository created with CRUD operations
- [x] EmployeeSkillRepository created for skill tracking
- [x] Skill matrix CRUD operations working
- [x] Auto-update on training completion implemented
- [x] Team skill matrix view working
- [x] Skill gap analysis report generation working
- [x] Unit tests passing (9 tests)
- [x] Files: `backend/src/repositories/skillRepository.ts`, `backend/src/repositories/employeeSkillRepository.ts`, `backend/src/services/trainingService.ts`

### 10.4 Implement Training API Endpoints
- [x] POST /api/v1/training/programs - Create training program
- [x] POST /api/v1/training/enroll - Enroll in training
- [x] PUT /api/v1/training/enrollments/:id/complete - Mark completion
- [x] POST /api/v1/training/certifications - Add certification
- [x] GET /api/v1/training/certifications/expiring - Get expiring certifications
- [x] POST /api/v1/training/skills - Update skill matrix
- [x] GET /api/v1/training/skill-gap/:departmentId - Generate skill gap report
- [x] Write integration tests

**Complexity:** Medium
**Dependencies:** 10.1, 10.2, 10.3

**Acceptance Criteria:**
- [x] All 7 REST endpoints implemented
- [x] TrainingController created with service integrations
- [x] Role-based access control implemented
- [x] Integration tests passing (13 tests)
- [x] Files: `backend/src/controllers/trainingController.ts`, `backend/src/routes/training.ts`

### 10.5 Implement Training UI Components
- [x] Create TrainingProgramManagement component (admin)
- [x] Create TrainingEnrollment component
- [x] Create TrainingHistory component
- [x] Create CertificationManagement component
- [x] Create SkillMatrix component
- [x] Create SkillGapReport component (manager)
- [x] Write component tests

**Complexity:** Medium
**Dependencies:** 10.4

**Acceptance Criteria:**
- [x] 6 React components created with TypeScript
- [x] shadcn/ui components and Tailwind CSS styling applied
- [x] Responsive design for desktop and mobile
- [x] Component tests passing
- [x] Files: 6 component files in `frontend/src/components/training/`

### 10.6 Write Property Tests for Training Module
- [x] Property 38: Training completion skill update
- [x] Property 39: Skill gap report accuracy

**Complexity:** Small
**Dependencies:** 10.1, 10.3

**Acceptance Criteria:**
- [x] 2 correctness properties implemented using fast-check
- [x] All property tests validate correctness and edge cases
- [x] File: `backend/src/services/__tests__/training.property.test.ts`
- [x] Total Phase 10: 58 tests passing (21 unit + 15 comprehensive + 9 property-based + 13 integration)

---

## Phase 11: Separation & Offboarding Module
- [x] START PHASE 11

### 11.1 Implement Resignation/Termination Service
- [x] Create Resignation repository
- [x] Implement submitResignation
- [x] Implement initiateTermination
- [x] Auto-trigger offboarding workflow
- [x] Implement notice period calculation
- [x] Track notice period serving status
- [ ] Write unit tests

**Complexity:** Medium
**Dependencies:** 2.9

### 11.2 Implement Exit Interview Service
- [x] Create ExitInterview repository
- [x] Implement scheduleExitInterview
- [x] Provide configurable questionnaire template
- [x] Store exit interview feedback
- [ ] Write unit tests

**Complexity:** Small
**Dependencies:** 2.9

### 11.3 Implement F&F Settlement Service
- [x] Create FnFSettlement repository
- [x] Implement calculateFnFSettlement
- [x] Include pending salary, leave encashment, gratuity
- [x] Deduct advances and unreturned asset costs
- [x] Implement approval workflow
- [x] Generate F&F statement
- [ ] Write unit tests

**Complexity:** Large
**Dependencies:** 2.9, 6.2, 8.2

### 11.4 Implement Asset Recovery Service
- [ ] Create AssetRecovery repository
- [ ] Generate asset recovery checklist from assigned assets
- [ ] Track asset return status (returned/damaged/missing)
- [ ] Flag unreturned assets for F&F deduction
- [ ] Write unit tests

**Complexity:** Medium
**Dependencies:** 2.9, 2.5

### 11.5 Implement Employee Deactivation
- [ ] Implement deactivation precondition check (all checklist items complete)
- [ ] Revoke system access
- [ ] Update employee status
- [ ] Archive employee data
- [ ] Write unit tests

**Complexity:** Small
**Dependencies:** 11.1, 11.3, 11.4

### 11.6 Implement Separation API Endpoints
- [x] POST /api/v1/separation/resignation - Submit resignation
- [x] POST /api/v1/separation/termination - Initiate termination
- [x] POST /api/v1/separation/exit-interview - Schedule exit interview
- [x] GET /api/v1/separation/fnf/:employeeId - Calculate F&F
- [x] PUT /api/v1/separation/fnf/:id/approve - Approve F&F
- [x] GET /api/v1/separation/asset-recovery/:employeeId - Get asset checklist
- [x] PUT /api/v1/separation/deactivate/:employeeId - Deactivate employee
- [x] Write integration tests

**Complexity:** Medium
**Dependencies:** 11.1, 11.2, 11.3, 11.4, 11.5

### 11.7 Implement Separation UI Components
- [x] Create ResignationForm component
- [x] Create TerminationForm component (HR)
- [x] Create ExitInterviewForm component
- [x] Create FnFCalculation component (finance)
- [x] Create AssetRecoveryChecklist component
- [x] Create OffboardingDashboard component (HR)
- [x] Write component tests

**Complexity:** Medium
**Dependencies:** 11.6

### 11.8 Write Property Tests for Separation Module
- [x] Property 31: Resignation offboarding trigger
- [x] Property 32: Notice period calculation
- [x] Property 33: Full & final settlement calculation
- [x] Property 34: Asset recovery checklist completeness
- [x] Property 35: Employee deactivation precondition

**Complexity:** Medium
**Dependencies:** 11.1, 11.3, 11.4, 11.5

---

## Phase 12: Extended Features - Geo Tracking & Travel
- [x] START PHASE 12

### 12.1 Implement Geo Tracking Service
- [x] Create GeoLog repository
- [x] Implement captureLocation
- [x] Implement trackJourney with waypoints
- [x] Implement distance calculation (Haversine formula)
- [x] Integrate with Google Maps Distance Matrix API
- [x] Implement geo-fencing validation
- [x] Implement anomaly detection
- [x] Write unit tests

**Complexity:** Large
**Dependencies:** 2.10, 4.2

### 12.2 Implement Travel Allowance Service
- [x] Configure per-km travel allowance rates
- [x] Implement calculateTravelAllowance
- [x] Implement travel log approval workflow
- [x] Integrate approved allowances with payroll
- [x] Write unit tests

**Complexity:** Medium
**Dependencies:** 12.1, 6.2

### 12.3 Implement Geo Tracking API Endpoints
- [x] POST /api/v1/geo/track - Log GPS waypoints
- [x] GET /api/v1/geo/journey/:employeeId/:date - Get daily journey
- [x] PUT /api/v1/geo/journey/:id/approve - Approve travel log
- [x] GET /api/v1/geo/allowance/:employeeId/:month - Get monthly allowance
- [x] POST /api/v1/geo/geo-fences - Create geo-fence (admin)
- [x] Write integration tests

**Complexity:** Medium
**Dependencies:** 12.1, 12.2

### 12.4 Implement Geo Tracking UI Components
- [x] Create TravelLogViewer component (map view)
- [x] Create TravelApproval component (manager)
- [x] Create GeoFenceManagement component (admin)
- [x] Create TravelAllowanceSummary component
- [x] Write component tests

**Complexity:** Medium
**Dependencies:** 12.3

### 12.5 Write Property Tests for Geo Tracking
- [x] Property 43: Distance calculation from waypoints
- [x] Property 44: Travel allowance calculation
- [x] Property 45: Geo-fence validation

**Complexity:** Medium
**Dependencies:** 12.1, 12.2

---

## Phase 13: Extended Features - Hierarchy & Supplier/Buyer
- [x] START PHASE 13

### 13.1 Implement Hierarchy Service
- [x] Create Department repository
- [x] Create Designation repository
- [x] Create HierarchyNode repository
- [x] Implement department CRUD operations
- [x] Implement designation CRUD operations
- [x] Implement employee position assignment
- [x] Implement getReportingChain
- [x] Implement getDirectReports
- [x] Implement generateOrgChart
- [x] Support dotted-line reporting
- [x] Implement hierarchy change audit logging
- [x] Write unit tests

**Complexity:** Large
**Dependencies:** 2.1, 2.10


### 13.2 Implement Approval Routing Based on Hierarchy
- [x] Integrate hierarchy service with leave approval
- [x] Integrate hierarchy service with travel approval
- [x] Integrate hierarchy service with expense approval
- [x] Write unit tests

**Complexity:** Medium
**Dependencies:** 13.1, 5.1, 12.2

### 13.3 Implement Supplier/Buyer Service
- [x] Create SupplierBuyer repository
- [x] Create Visit repository
- [x] Implement supplier/buyer CRUD operations
- [x] Link records to managing employee
- [x] Implement visit logging with GPS
- [x] Support document attachments
- [x] Implement visit history timeline
- [x] Write unit tests

**Complexity:** Medium
**Dependencies:** 2.10

### 13.4 Implement Hierarchy & Supplier API Endpoints
- [x] POST /api/v1/hierarchy/departments - Create department
- [x] POST /api/v1/hierarchy/designations - Create designation
- [x] PUT /api/v1/hierarchy/assign - Assign employee position
- [x] GET /api/v1/hierarchy/org-chart - Get org chart
- [x] GET /api/v1/hierarchy/reporting-chain/:employeeId - Get reporting chain
- [x] POST /api/v1/suppliers - Create supplier/buyer
- [x] POST /api/v1/suppliers/:id/visits - Log visit
- [x] GET /api/v1/suppliers/:id/visits - Get visit history
- [x] Write integration tests

**Complexity:** Medium
**Dependencies:** 13.1, 13.3

### 13.5 Implement Hierarchy & Supplier UI Components
- [x] Create OrgChart component (interactive tree diagram)
- [x] Create DepartmentManagement component (admin)
- [x] Create DesignationManagement component (admin)
- [x] Create SupplierBuyerManagement component
- [x] Create VisitLogger component
- [x] Create VisitHistory component
- [x] Write component tests

**Complexity:** Large
**Dependencies:** 13.4

### 13.6 Write Property Tests for Hierarchy & Supplier
- [x] Property 20: Hierarchy-based approval routing
- [x] Property 46: Hierarchy depth support
- [x] Property 47: Single primary position constraint
- [x] Property 48: Hierarchy-based access control
- [x] Property 49: Hierarchy change audit
- [x] Property 50: Supplier/buyer visit GPS logging

**Complexity:** Medium
**Dependencies:** 13.1, 13.2, 13.3

---

## Phase 14: Extended Features - Bank Details & Documents
- [x] START PHASE 14

### 14.1 Implement Bank Details Service
- [x] Create BankAccount repository
- [x] Implement AES-256 encryption for account numbers
- [x] Implement addBankAccount with encryption
- [x] Implement updateBankAccount with verification workflow
- [x] Implement setPrimaryAccount
- [x] Validate account limit (max 2 accounts)
- [x] Implement audit logging for all changes
- [x] Mask account numbers in UI (show last 4 digits)
- [x] Write unit tests

**Complexity:** Large
**Dependencies:** 2.10

**Acceptance Criteria:**
- [x] BankAccountRepository created with full CRUD operations and encryption
- [x] AES-256-GCM encryption implemented for account numbers
- [x] addBankAccount with validation (max 2 accounts, IFSC format, account length 9-18 digits)
- [x] updateBankAccount with verification workflow (pending → verified)
- [x] setPrimaryAccount only allows verified accounts
- [x] Audit logging for all changes with timestamps
- [x] Account masking in responses (show only last 4 digits)
- [x] Unit tests passing (15 tests)
- [x] Files: `backend/src/types/bankDetails.ts`, `backend/src/utils/encryption.ts`, `backend/src/repositories/bankAccountRepository.ts`, `backend/src/services/bankDetailsService.ts`, `backend/src/services/__tests__/bankDetailsService.unit.test.ts`

### 14.2 Implement Document Service
- [x] Create Document repository
- [x] Implement uploadDocument with file storage
- [x] Implement document version management
- [x] Implement access control based on roles
- [x] Implement expiry tracking
- [x] Send notifications for expiring documents
- [x] Write unit tests

**Complexity:** Medium
**Dependencies:** 2.10, 1.5

**Acceptance Criteria:**
- [x] DocumentRepository created with version management and access logging
- [x] uploadDocument with file validation (10MB max, PDF/JPG/PNG/DOCX)
- [x] Document version tracking with automatic versioning
- [x] Role-based access control (HR Manager, Finance/Payroll, Employee)
- [x] Expiry tracking with 30-day notification threshold
- [x] Notifications sent for expiring documents
- [x] Soft delete support with audit logging
- [x] Unit tests passing (16 tests)
- [x] Files: `backend/src/types/document.ts`, `backend/src/repositories/documentRepository.ts`, `backend/src/services/documentService.ts`, `backend/src/services/__tests__/documentService.test.ts`

### 14.3 Implement Bank & Document API Endpoints
- [x] POST /api/v1/bank-details - Add bank account
- [x] PUT /api/v1/bank-details/:id - Update bank account
- [x] PUT /api/v1/bank-details/:id/set-primary - Set primary account
- [x] PUT /api/v1/bank-details/:id/verify - Approve verification (finance)
- [x] GET /api/v1/bank-details/:employeeId - Get bank details (masked)
- [x] POST /api/v1/documents - Upload document
- [x] GET /api/v1/documents/:id - Get document
- [x] GET /api/v1/documents/expiring - Get expiring documents
- [x] Write integration tests

**Complexity:** Medium
**Dependencies:** 14.1, 14.2

**Acceptance Criteria:**
- [x] All 8 REST endpoints implemented with full authentication/authorization
- [x] BankDetailsController created with 5 endpoint handlers
- [x] DocumentController created with 3 endpoint handlers
- [x] Role-based access control enforced (Finance/Payroll for verification)
- [x] Integration tests passing (20+ tests for bank details, comprehensive tests for documents)
- [x] Files: `backend/src/controllers/bankDetailsController.ts`, `backend/src/routes/bankDetails.ts`, `backend/src/controllers/documentController.ts`, `backend/src/routes/documents.ts`, `backend/src/__tests__/integration/bankDetails.integration.test.ts`, `backend/src/__tests__/integration/documents.integration.test.ts`

### 14.4 Implement Bank & Document UI Components
- [x] Create BankDetailsForm component
- [x] Create BankDetailsVerification component (finance)
- [x] Create DocumentUpload component
- [x] Create DocumentViewer component
- [x] Create ExpiringDocumentsAlert component
- [x] Write component tests

**Complexity:** Medium
**Dependencies:** 14.3

**Acceptance Criteria:**
- [x] 5 React components created with TypeScript
- [x] BankDetailsForm with validation (max 2 accounts, IFSC format, account masking)
- [x] BankDetailsVerification for Finance team approval/rejection
- [x] DocumentUpload with drag-and-drop and file validation (10MB max, PDF/JPG/PNG/DOCX)
- [x] DocumentViewer with status badges, download, delete, version tracking
- [x] ExpiringDocumentsAlert with urgency levels and configurable threshold
- [x] shadcn/ui components and Tailwind CSS styling applied
- [x] Responsive design for desktop and mobile
- [x] Component tests passing (36 tests)
- [x] Files: 5 component files in `frontend/src/components/bankDetails/` and `frontend/src/components/documents/`, `frontend/src/services/bankDetailsService.ts`, `frontend/src/services/documentService.ts`, 4 test files

### 14.5 Write Property Tests for Bank & Documents
- [x] Property 55: Bank account limit validation
- [x] Property 56: Bank details encryption
- [x] Property 57: Bank details change verification

**Complexity:** Medium
**Dependencies:** 14.1

**Acceptance Criteria:**
- [x] 3 correctness properties implemented using fast-check
- [x] All property tests validate correctness and edge cases
- [x] Total Phase 14: 100+ tests passing (all passing)

---

## Phase 15: Extended Features - e-Signature
- [x] START PHASE 15

### 15.1 Implement e-Signature Service
- [x] Create SignatureRequest repository
- [x] Create SignatureEvent repository
- [x] Implement createSignatureRequest
- [x] Implement signDocument with multiple signature methods
- [x] Support drawn, typed, and uploaded signatures
- [x] Implement signature timestamp and audit capture
- [x] Implement document locking after full signature
- [x] Generate final signed PDF
- [x] Implement reminder scheduling (48 hours)
- [x] Maintain complete audit trail
- [x] Write unit tests

**Complexity:** Large
**Dependencies:** 2.10, 1.5

### 15.2 Implement e-Signature API Endpoints
- [x] POST /api/v1/esignature/requests - Create signature request
- [x] POST /api/v1/esignature/sign/:requestId - Sign document
- [x] GET /api/v1/esignature/requests/:id - Get signature status
- [x] GET /api/v1/esignature/document/:requestId - Download signed document
- [x] GET /api/v1/esignature/audit/:requestId - Get audit trail
- [x] Write integration tests

**Complexity:** Medium
**Dependencies:** 15.1

### 15.3 Implement e-Signature UI Components
- [x] Create SignatureRequestForm component (HR)
- [x] Create DocumentSigning component (signature capture)
- [x] Create SignatureStatusTracker component
- [x] Create SignedDocumentViewer component
- [x] Create AuditTrailViewer component
- [x] Write component tests

**Complexity:** Large
**Dependencies:** 15.2

### 15.4 Write Property Tests for e-Signature
- [x] Property 59: Document lock after full signature
- [x] Property 60: Signature audit trail
- [x] Property 61: Signature reminder scheduling

**Complexity:** Medium
**Dependencies:** 15.1

---

## Phase 16: Extended Features - Notifications & Automation
- [x] START PHASE 16

### 16.1 Implement Notification Service
- [x] Create Notification repository
- [x] Create NotificationTemplate repository
- [x] Implement sendNotification (in-app, email, push)
- [x] Implement template management
- [x] Implement scheduled notifications
- [x] Integrate with SendGrid/AWS SES for email
- [x] Integrate with FCM for push notifications
- [x] Write unit tests

**Complexity:** Large
**Dependencies:** 2.10, 1.6

### 16.2 Implement Birthday & Anniversary Automation
- [x] Implement processBirthdayWishes (daily cron job)
- [x] Implement processAnniversaryWishes (daily cron job)
- [x] Send personalized wishes to employees
- [x] Post on company notice board (with opt-out support)
- [x] Send advance notification to managers (1 day before)
- [x] Handle leap year birthdays (Feb 29 → Feb 28)
- [x] Write unit tests

**Complexity:** Medium
**Dependencies:** 16.1

### 16.3 Implement Notification API Endpoints
- [x] GET /api/v1/notifications - Get user notifications
- [x] PUT /api/v1/notifications/:id/read - Mark as read
- [x] POST /api/v1/notifications/templates - Create template (admin)
- [x] GET /api/v1/notifications/templates - List templates
- [x] Write integration tests

**Complexity:** Small
**Dependencies:** 16.1

### 16.4 Implement Notification UI Components
- [x] Create NotificationCenter component
- [x] Create NotificationBadge component
- [x] Create NotificationTemplateManagement component (admin)
- [x] Create CompanyNoticeBoard component
- [x] Write component tests

**Complexity:** Medium
**Dependencies:** 16.3

### 16.5 Write Property Tests for Notifications
- [x] Property 7: Event-driven notifications (comprehensive)
- [x] Property 62: Birthday detection and notification
- [x] Property 63: Work anniversary detection and notification
- [x] Property 64: Manager advance birthday notification
- [x] Property 65: Birthday opt-out respect

**Complexity:** Medium
**Dependencies:** 16.1, 16.2

---

## Phase 17: Role-Based Access Control & Security
- [x] START PHASE 17

### 17.1 Implement RBAC System
- [x] Define role permissions matrix
- [x] Implement role-based middleware for API routes
- [x] Implement resource-level access control
- [x] Implement hierarchy-based access control
- [x] Write unit tests for all permission checks

**Complexity:** Large
**Dependencies:** 1.4, 13.1

**Acceptance Criteria:**
- [x] Role-Permission Matrix created with 6 roles and 40+ permissions
- [x] RBAC middleware implemented (requirePermission, requireRole, requireResourceAccess, requireActionPermission)
- [x] Resource-level access control working (managers view only their team's data)
- [x] Hierarchy-based access control with approval routing implemented
- [x] 40+ unit tests passing for all permission checks
- [x] Files: `backend/src/types/rbac.ts`, `backend/src/utils/rbac.ts`, `backend/src/middleware/rbac.ts`, `backend/src/__tests__/rbac.test.ts`

### 17.2 Implement Audit Logging
- [x] Create AuditLog repository
- [x] Implement audit logging for all sensitive operations
- [x] Log user actions with timestamp, user ID, action, and changes
- [x] Implement audit log viewer (admin only)
- [x] Write unit tests

**Complexity:** Medium
**Dependencies:** 1.2

**Acceptance Criteria:**
- [x] AuditLog repository created with fields: timestamp, user_id, action, resource_type, resource_id, changes (JSONB), ip_address
- [x] Audit logging implemented for: employee creation/update/deletion, payroll processing, leave approvals/rejections, bank details updates, document uploads/deletions
- [x] Audit log viewer with search, filtering, and date range support
- [x] Retention policy support (deleteOlderThan)
- [x] Test structure created for audit log functionality
- [x] Files: `backend/src/repositories/auditLogRepository.ts`, `backend/src/services/auditLogService.ts`, `backend/src/__tests__/auditLog.test.ts`

### 17.3 Implement Data Encryption
- [x] Implement AES-256 encryption utilities
- [x] Encrypt bank account numbers at rest
- [x] Encrypt sensitive documents
- [x] Implement secure key management
- [x] Write unit tests

**Complexity:** Medium
**Dependencies:** 1.2

**Acceptance Criteria:**
- [x] AES-256-GCM encryption utilities implemented (encrypt, decrypt, hash)
- [x] Bank account numbers encrypted with masking (show only last 4 digits)
- [x] Sensitive documents encrypted
- [x] Secure key management via environment variables (ENCRYPTION_KEY)
- [x] Object and array encryption/decryption utilities
- [x] 50+ unit tests passing covering encryption security, tampering detection, and edge cases
- [x] Files: `backend/src/utils/encryption.ts`, `backend/src/__tests__/encryption.test.ts`

### 17.4 Implement Security Headers & CORS
- [x] Configure security headers (Helmet.js)
- [x] Configure CORS policies
- [x] Implement rate limiting
- [x] Implement request validation and sanitization
- [x] Write security tests

**Complexity:** Small
**Dependencies:** 1.2

**Acceptance Criteria:**
- [x] Helmet.js security headers configured (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, X-XSS-Protection, Referrer-Policy, Permissions-Policy)
- [x] CORS policies configured for frontend origin only
- [x] Rate limiting implemented: login (5/15min), password reset (3/hour), sensitive operations (10/min)
- [x] Input validation and sanitization (XSS, SQL injection, command injection prevention)
- [x] CSRF protection with token generation and verification
- [x] 40+ security tests passing
- [x] Files: `backend/src/middleware/security.ts`, `backend/src/__tests__/security.test.ts`

---

## Phase 18: Admin Dashboard & Reports
- [x] START PHASE 18

### 18.1 Implement Dashboard Service
- [x] Implement employee count statistics
- [x] Implement attendance statistics
- [x] Implement leave statistics
- [x] Implement payroll statistics
- [x] Implement recruitment pipeline statistics
- [x] Write unit tests

**Complexity:** Medium
**Dependencies:** All core modules

**Acceptance Criteria:**
- [x] DashboardService created with all statistics methods
- [x] Employee statistics including department/designation breakdown
- [x] Attendance statistics with rates and top absentees
- [x] Leave statistics with type breakdown and upcoming leaves
- [x] Payroll statistics with financial summaries
- [x] Recruitment statistics with pipeline metrics
- [x] Unit tests passing (12 tests)
- [x] Files: `backend/src/types/dashboard.ts`, `backend/src/services/dashboardService.ts`, `backend/src/services/__tests__/dashboardService.test.ts`

### 18.2 Implement Report Generation
- [x] Implement employee report (filterable)
- [x] Implement attendance report (monthly/yearly)
- [x] Implement leave report
- [x] Implement payroll report
- [x] Implement performance report
- [x] Implement training report
- [x] Support export to CSV/Excel
- [x] Write unit tests

**Complexity:** Large
**Dependencies:** All core modules

**Acceptance Criteria:**
- [x] ReportService created with 6 report types
- [x] Employee report with department/designation/status filters
- [x] Attendance report with date range filtering
- [x] Leave report with status filtering
- [x] Payroll report with financial data
- [x] Performance report with review cycles
- [x] Training report with enrollment tracking
- [x] CSV export functionality implemented
- [x] JSON export functionality implemented
- [x] Pagination support (limit/offset)
- [x] Unit tests passing (15 tests)
- [x] Files: `backend/src/services/reportService.ts`, `backend/src/services/__tests__/reportService.test.ts`

### 18.3 Implement Dashboard & Reports API Endpoints
- [x] GET /api/v1/dashboard/stats - Get dashboard statistics
- [x] GET /api/v1/dashboard/employees - Get employee statistics
- [x] GET /api/v1/dashboard/attendance - Get attendance statistics
- [x] GET /api/v1/dashboard/leaves - Get leave statistics
- [x] GET /api/v1/dashboard/payroll - Get payroll statistics
- [x] GET /api/v1/dashboard/recruitment - Get recruitment statistics
- [x] GET /api/v1/dashboard/reports/employees - Generate employee report
- [x] GET /api/v1/dashboard/reports/attendance - Generate attendance report
- [x] GET /api/v1/dashboard/reports/leaves - Generate leave report
- [x] GET /api/v1/dashboard/reports/payroll - Generate payroll report
- [x] GET /api/v1/dashboard/reports/performance - Generate performance report
- [x] GET /api/v1/dashboard/reports/training - Generate training report
- [x] Write integration tests

**Complexity:** Medium
**Dependencies:** 18.1, 18.2

**Acceptance Criteria:**
- [x] DashboardController created with 6 endpoint handlers
- [x] ReportController created with 6 endpoint handlers
- [x] Dashboard routes configured with authentication/authorization
- [x] Report routes configured with authentication/authorization
- [x] Role-based access control (view_dashboard, generate_reports)
- [x] Query parameter filtering support
- [x] CSV/JSON format selection
- [x] Integration tests passing (20+ tests)
- [x] Files: `backend/src/controllers/dashboardController.ts`, `backend/src/controllers/reportController.ts`, `backend/src/routes/dashboard.ts`, `backend/src/__tests__/integration/dashboard.integration.test.ts`

### 18.4 Implement Dashboard & Reports UI Components
- [x] Create AdminDashboard component with charts
- [x] Create EmployeeStatsCard component
- [x] Create AttendanceStatsCard component
- [x] Create LeaveStatsCard component
- [x] Create PayrollStatsCard component
- [x] Create RecruitmentStatsCard component
- [x] Create ReportGenerator component
- [x] Implement report filters and export functionality
- [x] Write component tests

**Complexity:** Large
**Dependencies:** 18.3

**Acceptance Criteria:**
- [x] AdminDashboard component with tabbed interface
- [x] Real-time statistics display with auto-refresh (5 min)
- [x] 5 specialized statistics card components
- [x] Generic ReportGenerator component with filtering
- [x] Date range filtering for reports
- [x] Status filtering for reports
- [x] Pagination controls
- [x] CSV export functionality
- [x] Responsive design (mobile, tablet, desktop)
- [x] shadcn/ui components and Tailwind CSS styling
- [x] Status color badges and visual indicators
- [x] Progress bars for percentages
- [x] Department/designation breakdowns
- [x] Upcoming leaves and recent hires display
- [x] Dashboard service integration
- [x] Error handling and loading states
- [x] Files: `frontend/src/components/dashboard/AdminDashboard.tsx`, `frontend/src/components/dashboard/EmployeeStatsCard.tsx`, `frontend/src/components/dashboard/AttendanceStatsCard.tsx`, `frontend/src/components/dashboard/LeaveStatsCard.tsx`, `frontend/src/components/dashboard/PayrollStatsCard.tsx`, `frontend/src/components/dashboard/RecruitmentStatsCard.tsx`, `frontend/src/components/dashboard/ReportGenerator.tsx`, `frontend/src/services/dashboardService.ts`, `frontend/src/types/dashboard.ts`

---

## Phase 19: PWA Features & Offline Support
- [x] START PHASE 19

### 19.1 Configure PWA
- [x] Configure service worker for offline support
- [x] Configure app manifest for installability
- [x] Implement offline data caching strategy
- [x] Implement background sync for attendance
- [x] Test PWA installation on Android and iOS

**Complexity:** Medium
**Dependencies:** 1.3

### 19.2 Implement Offline Attendance
- [x] Cache attendance marking capability offline
- [x] Store attendance data in IndexedDB when offline
- [x] Sync attendance data when connection restored
- [x] Handle conflict resolution for offline data
- [x] Write tests for offline scenarios

**Complexity:** Large
**Dependencies:** 19.1, 4.3

### 19.3 Optimize PWA Performance
- [x] Implement lazy loading for routes
- [x] Optimize bundle size with code splitting
- [x] Implement image optimization
- [x] Configure caching strategies for static assets
- [x] Test performance on mid-range mobile devices

**Complexity:** Medium
**Dependencies:** 19.1

---

## Phase 20: Testing & Quality Assurance
- [x] START PHASE 20

### 20.1 Complete Unit Test Coverage
- [ ] Ensure all services have unit tests
- [ ] Ensure all repositories have unit tests
- [ ] Ensure all utilities have unit tests
- [ ] Achieve minimum 80% code coverage
- [ ] Fix any failing tests

**Complexity:** Large
**Dependencies:** All implementation phases

### 20.2 Complete Property-Based Tests
- [ ] Implement all 65 property tests from design document
- [ ] Configure each test for minimum 100 iterations
- [ ] Tag each test with feature and property reference
- [ ] Verify all properties pass consistently
- [ ] Document any edge cases discovered

**Complexity:** Large
**Dependencies:** All implementation phases

### 20.3 Complete Integration Tests
- [ ] Write integration tests for all API endpoints
- [ ] Test cross-service workflows
- [ ] Test database transactions and rollbacks
- [ ] Test error handling scenarios
- [ ] Achieve comprehensive integration coverage

**Complexity:** Large
**Dependencies:** All implementation phases

### 20.4 Complete E2E Tests
- [ ] Write E2E tests for critical user flows
- [ ] Test PWA installation and offline functionality
- [ ] Test cross-browser compatibility
- [ ] Test mobile responsiveness
- [ ] Test accessibility compliance

**Complexity:** Large
**Dependencies:** All implementation phases

### 20.5 Performance Testing
- [ ] Test payroll processing for 1,000 employees
- [ ] Test concurrent attendance marking
- [ ] Test face detection performance
- [ ] Test API response times under load
- [ ] Optimize any performance bottlenecks

**Complexity:** Medium
**Dependencies:** All implementation phases

### 20.6 Security Testing
- [ ] Test authentication and authorization
- [ ] Test encryption implementation
- [ ] Test input validation and sanitization
- [ ] Run security scans (npm audit, Snyk)
- [ ] Fix any security vulnerabilities

**Complexity:** Medium
**Dependencies:** All implementation phases

---

## Phase 21: Documentation & Deployment
- [ ] START PHASE 21

### 21.1 Write API Documentation
- [ ] Document all API endpoints with OpenAPI/Swagger
- [ ] Include request/response examples
- [ ] Document authentication requirements
- [ ] Document error responses
- [ ] Generate interactive API documentation

**Complexity:** Medium
**Dependencies:** All API implementation

### 21.2 Write User Documentation
- [ ] Write user guide for employees
- [ ] Write admin guide for HR/Finance
- [ ] Write manager guide
- [ ] Create video tutorials for key features
- [ ] Create FAQ document

**Complexity:** Medium
**Dependencies:** All UI implementation

### 21.3 Write Developer Documentation
- [ ] Document architecture and design decisions
- [ ] Document database schema
- [ ] Document deployment process
- [ ] Document environment configuration
- [ ] Create contribution guidelines

**Complexity:** Medium
**Dependencies:** All implementation phases

### 21.4 Set Up Production Environment
- [ ] Configure production database (PostgreSQL)
- [ ] Configure production Redis
- [ ] Configure production file storage (S3)
- [ ] Configure production email service
- [ ] Configure production monitoring and logging
- [ ] Set up SSL certificates

**Complexity:** Large
**Dependencies:** 1.2, 1.5, 1.6

### 21.5 Deploy Application
- [ ] Deploy backend to production server
- [ ] Deploy frontend to CDN
- [ ] Configure domain and DNS
- [ ] Set up CI/CD pipeline for automated deployments
- [ ] Perform smoke tests on production

**Complexity:** Large
**Dependencies:** 21.4

### 21.6 Set Up Monitoring & Alerts
- [ ] Configure application monitoring (e.g., New Relic, Datadog)
- [ ] Set up error tracking (e.g., Sentry)
- [ ] Configure uptime monitoring
- [ ] Set up alerts for critical errors
- [ ] Create monitoring dashboard

**Complexity:** Medium
**Dependencies:** 21.5

---

## Phase 22: Post-Launch Activities
- [ ] START PHASE 22

### 22.1 User Training
- [ ] Conduct training sessions for HR team
- [ ] Conduct training sessions for managers
- [ ] Conduct training sessions for employees
- [ ] Provide hands-on support during initial rollout
- [ ] Collect feedback from users

**Complexity:** Medium
**Dependencies:** 21.5

### 22.2 Data Migration (if applicable)
- [ ] Export data from existing system
- [ ] Transform data to match new schema
- [ ] Import data into new system
- [ ] Verify data integrity
- [ ] Perform reconciliation

**Complexity:** Large
**Dependencies:** 21.5

### 22.3 Bug Fixes & Improvements
- [ ] Monitor production for issues
- [ ] Fix critical bugs immediately
- [ ] Prioritize and fix non-critical bugs
- [ ] Implement user-requested improvements
- [ ] Release regular updates

**Complexity:** Ongoing
**Dependencies:** 21.5

---

*End of Tasks Document*

**Total Estimated Tasks:** 200+
**Estimated Timeline:** 6-9 months with a team of 4-6 developers
**Priority Order:** Follow phase sequence for optimal dependency management


