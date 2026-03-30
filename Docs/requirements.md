# Employee Management System — Requirements Specification
> Prepared for: Kiro
> Version: 1.0
> Date: 2026-03-05

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [User Roles & Permissions](#2-user-roles--permissions)
3. [Core Module Requirements](#3-core-module-requirements)
   - 3.1 Employee Information Management
   - 3.2 Recruitment & Onboarding
   - 3.3 Attendance & Time Management
   - 3.4 Leave Management
   - 3.5 Payroll Management
   - 3.6 Benefits & Compensation
   - 3.7 Separation & Offboarding
   - 3.8 Performance Management (OKR / KPI)
   - 3.9 Training & Certification Tracking
4. [Extended Feature Requirements](#4-extended-feature-requirements)
   - 4.1 Face Recognition / Biometric Attendance
   - 4.2 Geo Tracking & Travel Allowance
   - 4.3 Company Hierarchy System
   - 4.4 Supplier & Buyer Management
   - 4.5 Attendance-Based Salary Calculation
   - 4.6 Check-In / Check-Out & Leave System
   - 4.7 Bank Details Management
   - 4.8 Salary Calculation Engine
   - 4.9 Employee Self-Upload for Documents
   - 4.10 e-Signature for Contracts & Policies
   - 4.11 Birthday & Work Anniversary Automated Wishes
5. [Non-Functional Requirements](#5-non-functional-requirements)
6. [Database Entities](#6-database-entities)
7. [Tech Stack Recommendations](#7-tech-stack-recommendations)
8. [Future Enhancements](#8-future-enhancements)

---

## 1. Project Overview

The Employee Management System (EMS) is a full-featured, web-based platform (Progressive Web App) designed to manage the complete employee lifecycle — from onboarding to offboarding. It covers attendance, payroll, travel, document management, hierarchy, supplier/buyer relations, and automated HR communications.

### Goals
- Automate repetitive HR processes
- Ensure accurate payroll based on real attendance data
- Provide employees with a self-service portal
- Enable management with real-time visibility into workforce operations

---

## 2. User Roles & Permissions

| Role | Access Level |
|---|---|
| Super Admin | Full system access, configuration, all modules |
| HR Manager | Employee records, payroll, leaves, documents, e-signature |
| Department Manager | Team attendance, approvals, hierarchy view |
| Finance / Payroll | Salary, bank details, travel allowance, expense claims |
| Employee | Self-service: attendance, leave, documents, bank details, suppliers/buyers |
| IT Admin | System settings, device management, access control |

---

## 3. Core Module Requirements

---

### 3.1 Employee Information Management

**Purpose:** Maintain a complete, centralized record for every employee across their entire tenure at the company.

#### Functional Requirements

- FR-3.1.1: The system shall store personal details for each employee: full name, date of birth, gender, nationality, contact number, personal email, and residential address.
- FR-3.1.2: The system shall auto-generate a unique Employee ID upon creation of a new employee record.
- FR-3.1.3: Each employee record shall capture: department, designation, reporting manager, employment type (full-time/part-time/contract), and date of joining.
- FR-3.1.4: The system shall support storing emergency contact details including name, relationship, and contact number (minimum 1, maximum 3 contacts).
- FR-3.1.5: Employees shall be able to upload a profile photo; HR/Admin can also upload on their behalf.
- FR-3.1.6: The system shall maintain a complete employment history per employee: previous employers, roles, duration, and reason for leaving.
- FR-3.1.7: The system shall support attaching identity documents (Aadhar, PAN, Passport) and employment contracts directly to the employee profile.
- FR-3.1.8: All changes to employee records shall be logged with a timestamp and the user who made the change.
- FR-3.1.9: HR shall be able to search and filter employees by name, department, designation, location, or employment status.
- FR-3.1.10: Employee records shall support statuses: Active, On Leave, Suspended, Resigned, Terminated.

---

### 3.2 Recruitment & Onboarding

**Purpose:** Manage the end-to-end hiring process from job posting through to a fully onboarded employee.

#### Functional Requirements

**Job Posting & Applicant Tracking**
- FR-4.2.1: HR shall be able to create job postings with: title, department, location, job description, required skills, experience range, and application deadline.
- FR-4.2.2: The system shall maintain an applicant tracking pipeline with stages: Applied → Screening → Interview → Offer → Hired / Rejected.
- FR-4.2.3: HR shall be able to move applicants between pipeline stages and add notes at each stage.
- FR-4.2.4: Applicants shall receive automated email notifications when their application status changes.

**Interview Scheduling & Feedback**
- FR-4.2.5: HR/Managers shall be able to schedule interviews with date, time, mode (in-person/video), and assigned interviewers.
- FR-4.2.6: Interview invites shall be sent automatically to the applicant and all interviewers via email.
- FR-4.2.7: Interviewers shall be able to submit structured feedback and a rating (1–5) per interview round within the system.
- FR-4.2.8: All interview feedback shall be visible to HR and the hiring manager for final decision-making.

**Offer Letter Generation**
- FR-4.2.9: HR shall be able to generate an offer letter from a configurable template populated with the candidate's name, designation, CTC, joining date, and other terms.
- FR-4.2.10: Generated offer letters shall be sent for e-signature (integrated with module 4.10).
- FR-4.2.11: Once the offer is accepted and signed, the system shall automatically create a draft employee record.

**Onboarding**
- FR-4.2.12: The system shall generate an onboarding checklist for each new hire based on their department and role.
- FR-4.2.13: Checklist items shall include: document submission, IT setup, orientation attendance, policy acknowledgment, and training enrollment.
- FR-4.2.14: HR and the new employee shall both track checklist completion in real time.
- FR-4.2.15: The system shall support asset assignment during onboarding — logging each asset (laptop, ID card, access card, phone) assigned to the employee with serial numbers and condition.
- FR-4.2.16: New employees shall receive a welcome notification with login credentials and an onboarding guide on their first day.

---

### 3.3 Attendance & Time Management

**Purpose:** Track daily employee attendance, work hours, shifts, and integrate data directly with payroll.

#### Functional Requirements

- FR-4.3.1: The system shall support multiple attendance marking modes: biometric (face presence detection), PWA (GPS-verified), and web portal.
- FR-4.3.2: The system shall calculate daily working hours as: check-out time − check-in time, minus any configured break durations.
- FR-4.3.3: The system shall differentiate between regular hours and overtime hours based on the configured standard shift duration per employee/designation.
- FR-4.3.4: Overtime hours shall be tracked separately and flagged for payroll processing based on overtime policy.
- FR-4.3.5: The system shall support remote attendance marking with mandatory GPS capture to verify work location.
- FR-4.3.6: HR shall be able to configure shifts: shift name, start time, end time, break duration, and applicable days.
- FR-4.3.7: Employees shall be assignable to fixed shifts, rotating shifts, or flexible (open) shifts.
- FR-4.3.8: The system shall generate a monthly attendance summary per employee for payroll integration.
- FR-4.3.9: Managers shall receive alerts for employees who have not checked in by a configurable time threshold.
- FR-4.3.10: The system shall support regularization requests — employees can request correction of missed or incorrect attendance, subject to manager approval.

---

### 3.4 Leave Management

**Purpose:** Enable employees to apply for and track leave while giving HR and managers full visibility and control over leave workflows.

#### Functional Requirements

- FR-4.4.1: The system shall support the following leave types: Casual Leave (CL), Sick Leave (SL), Earned/Privilege Leave (EL/PL), Maternity Leave, Paternity Leave, Unpaid Leave (UL), Compensatory Off (CO), and custom types configurable by HR.
- FR-4.4.2: Employees shall be able to apply for leave via the PWA or web portal with: leave type, date range, half-day option (AM/PM), and reason.
- FR-4.4.3: Leave requests shall be routed to the direct reporting manager for approval or rejection with comments.
- FR-4.4.4: HR shall have the ability to approve, reject, or revoke any leave regardless of manager action.
- FR-4.4.5: Employees shall receive in-app and email notifications upon approval, rejection, or revocation.
- FR-4.4.6: The system shall maintain per-employee leave balances per leave type per calendar/financial year.
- FR-4.4.7: Upon leave approval, the balance shall be automatically deducted.
- FR-4.4.8: The system shall support configurable carry-forward rules per leave type (e.g., max 10 EL days can carry forward to next year).
- FR-4.4.9: HR shall be able to configure a company holiday calendar with national and regional holidays.
- FR-4.4.10: A team leave calendar shall be visible to managers showing all approved and pending leaves within their team.

---

### 3.5 Payroll Management

**Purpose:** Automate end-to-end payroll processing including salary computation, statutory deductions, payslip generation, and disbursement.

#### Functional Requirements

- FR-4.5.1: HR/Finance shall be able to configure salary structures with the following components: Basic Pay, HRA, Conveyance Allowance, Medical Allowance, Special Allowance, Travel Allowance, and any custom allowances.
- FR-4.5.2: Deduction components shall include: Provident Fund (PF — employer + employee), ESI, Professional Tax, TDS, Advance Recovery, Loan EMI, and custom deductions.
- FR-4.5.3: The system shall automatically calculate monthly salary based on attendance records, approved leaves, and the configured salary structure.
- FR-4.5.4: The system shall compute statutory deductions (TDS, PF, ESI) based on applicable slabs and thresholds configured by Finance.
- FR-4.5.5: The system shall generate a detailed payslip for each employee each month showing all earnings, deductions, and net pay.
- FR-4.5.6: Payslips shall be available for employee download (PDF) from the self-service portal.
- FR-4.5.7: Finance shall be able to export payroll data in bank-compatible formats (NEFT/CSV) for bulk salary transfers.
- FR-4.5.8: The system shall maintain a full salary revision history per employee with effective dates.
- FR-4.5.9: The system shall support advance salary requests — approved advances shall auto-deduct from the next payroll cycle.
- FR-4.5.10: Payroll processing shall follow a configurable cycle (monthly) with a lock mechanism — once finalized, payroll for that period cannot be edited without HR/Finance admin override and audit log entry.

---

### 3.6 Benefits & Compensation

**Purpose:** Manage employee benefits programs including insurance, retirement plans, reimbursements, and rewards.

#### Functional Requirements

**Health Insurance**
- FR-4.6.1: HR shall be able to configure health insurance plans with provider name, coverage amount, premium, and eligible employee grades.
- FR-4.6.2: Employees shall be able to enroll in or opt out of available insurance plans during defined enrollment windows.
- FR-4.6.3: The system shall track enrollment status, policy numbers, and premium deductions per employee.
- FR-4.6.4: Insurance premium deductions shall be automatically included in payroll.

**Provident Fund, Gratuity & Retirement**
- FR-4.6.5: The system shall calculate and track PF contributions (employee + employer share) per month.
- FR-4.6.6: The system shall calculate gratuity eligibility and estimated gratuity amount for employees who have completed 5+ years of service.
- FR-4.6.7: Finance shall be able to view and export PF and gratuity reports for statutory filing.

**Reimbursement Claims**
- FR-4.6.8: Employees shall be able to submit reimbursement claims with: type (travel/medical/other), amount, date, description, and supporting receipts (image/PDF upload).
- FR-4.6.9: Claims shall be routed to the reporting manager for approval, then to Finance for processing.
- FR-4.6.10: Approved reimbursements shall be added to the next payroll cycle as a separate line item.
- FR-4.6.11: Employees shall be able to track claim status (submitted / approved / rejected / paid) from their portal.

**Perks & Rewards**
- FR-4.6.12: HR shall be able to create and assign reward categories (e.g., Employee of the Month, Performance Bonus, Spot Award).
- FR-4.6.13: Managers shall be able to nominate employees for rewards; HR approves and issues.
- FR-4.6.14: Awarded rewards shall appear on the employee's profile and the company notice board.

---

### 3.7 Separation & Offboarding

**Purpose:** Manage the complete exit process for employees who resign, are terminated, or retire — ensuring a structured, compliant, and smooth transition.

#### Functional Requirements

**Resignation & Termination**
- FR-4.7.1: Employees shall be able to submit a resignation request through the portal with an effective date and reason.
- FR-4.7.2: HR shall be able to initiate a termination process for an employee with: termination type (voluntary/involuntary), reason, and effective date.
- FR-4.7.3: Upon resignation/termination initiation, the system shall automatically trigger the offboarding workflow.

**Notice Period Management**
- FR-4.7.4: The system shall calculate the notice period end date based on the employee's contract and the resignation/termination date.
- FR-4.7.5: The system shall track notice period serving status and flag early exits or buyouts.
- FR-4.7.6: Notice period attendance shall continue to be tracked normally for final settlement calculation.

**Exit Interview**
- FR-4.7.7: HR shall be able to schedule an exit interview with the departing employee and log responses.
- FR-4.7.8: The system shall provide a configurable exit interview questionnaire template.
- FR-4.7.9: Exit interview feedback shall be stored and accessible to HR for attrition analysis.

**Full & Final Settlement**
- FR-4.7.10: The system shall auto-calculate full and final (F&F) settlement including: pending salary for days worked, encashable leave balance payout, gratuity (if applicable), outstanding advances or loan deductions, and any other adjustments.
- FR-4.7.11: Finance shall review and approve the F&F calculation before disbursement.
- FR-4.7.12: A final payslip and F&F settlement statement shall be generated and shared with the employee.

**Asset Recovery**
- FR-4.7.13: The system shall generate an asset recovery checklist based on all assets assigned to the employee during onboarding and tenure.
- FR-4.7.14: HR/IT shall mark each asset as returned, damaged, or missing during the exit process.
- FR-4.7.15: Any unreturned or damaged assets shall be flagged for cost deduction in the F&F settlement.
- FR-4.7.16: The employee record shall be deactivated and access revoked only after all offboarding checklist items are marked complete.

---

### 3.8 Performance Management (OKR / KPI)

**Purpose:** Enable goal-setting, continuous feedback, and structured performance reviews to drive employee growth and align individual work with company objectives.

#### Functional Requirements

**OKR / KPI Goal Setting**
- FR-3.8.1: HR and managers shall be able to define company-level Objectives and Key Results (OKRs) per quarter or annual cycle.
- FR-3.8.2: Managers shall be able to cascade OKRs to their team — each employee shall have individual OKRs aligned to their department's objectives.
- FR-3.8.3: Employees shall also be able to propose their own goals, subject to manager approval.
- FR-3.8.4: The system shall support both OKR format (Objective + measurable Key Results) and KPI format (metric name, target value, unit, measurement frequency).
- FR-3.8.5: Each goal shall have: title, description, type (OKR/KPI), target value, current progress, due date, weight (%), and status (on track / at risk / behind / completed).
- FR-3.8.6: Employees and managers shall be able to update progress on goals at any time with a comment.
- FR-3.8.7: The system shall calculate overall goal completion percentage per employee based on weighted key results.

**Performance Reviews**
- FR-3.8.8: HR shall be able to configure performance review cycles: quarterly, half-yearly, or annual.
- FR-3.8.9: Reviews shall include: self-assessment by employee, manager assessment, and optional peer feedback (360-degree).
- FR-3.8.10: Each review shall produce a final rating on a configurable scale (e.g., 1–5 or Exceeds / Meets / Below Expectations).
- FR-3.8.11: The system shall support configurable review form templates with sections for goal achievement, competencies, and overall comments.
- FR-3.8.12: Completed reviews shall be stored in the employee's profile as a historical performance record.
- FR-3.8.13: HR shall be able to generate performance reports by employee, department, or review cycle.

**Continuous Feedback**
- FR-3.8.14: Managers and peers shall be able to give real-time feedback (positive recognition or constructive note) to any employee at any time outside of formal review cycles.
- FR-3.8.15: Feedback shall be visible to the recipient and their manager.

**Performance Improvement Plans (PIP)**
- FR-3.8.16: Managers (with HR approval) shall be able to initiate a PIP for an underperforming employee with: goals, timeline, check-in schedule, and success criteria.
- FR-3.8.17: PIP progress shall be tracked with regular check-in entries and a final outcome (completed / extended / escalated).

---

### 3.9 Training & Certification Tracking

**Purpose:** Plan, deliver, and track employee training programs and professional certifications to build skills and meet compliance requirements.

#### Functional Requirements

**Training Programs**
- FR-3.9.1: HR shall be able to create training programs with: title, description, category (technical/soft skills/compliance/safety), mode (in-person/online/hybrid), duration, trainer/provider, and scheduled dates.
- FR-3.9.2: HR and managers shall be able to enroll employees into training programs individually or in bulk.
- FR-3.9.3: Employees shall be able to self-enroll in available training programs subject to manager approval.
- FR-3.9.4: The system shall track attendance and completion status per employee per training program.
- FR-3.9.5: Upon completion, the system shall mark the training as complete and optionally issue a system-generated completion certificate.
- FR-3.9.6: The system shall send reminders to enrolled employees 3 days before a scheduled training session.

**Certification Tracking**
- FR-3.9.7: Employees shall be able to upload external certifications (e.g., AWS, PMP, ISO auditor) with: certificate name, issuing body, issue date, expiry date, and certificate file.
- FR-3.9.8: The system shall alert the employee and HR 30 days before a certification's expiry date.
- FR-3.9.9: HR shall be able to view a complete certification inventory across all employees.
- FR-3.9.10: Certifications shall be linkable to required competencies for specific roles/designations.

**Skill Matrix**
- FR-3.9.11: The system shall maintain a skill matrix per employee — a list of skills with proficiency levels (beginner / intermediate / advanced / expert).
- FR-3.9.12: Skills shall be updated automatically when a training program is completed or a certification is added.
- FR-3.9.13: Managers shall be able to view the skill matrix for their entire team to identify skill gaps.
- FR-3.9.14: HR shall be able to define required skill profiles per designation and compare them against the current team skill matrix to generate a gap report.

---

## 4. Extended Feature Requirements

---

### 4.1 Face Recognition / Biometric Attendance

**Purpose:** Verify that a human is physically present at the time of marking attendance. No facial identity matching is required — only human presence detection.

#### Functional Requirements

- FR-3.1.1: The system shall activate the device camera when an employee initiates an attendance check-in or check-out.
- FR-3.1.2: The system shall use a human presence detection model (liveness detection) to confirm a real human face is visible in the camera frame.
- FR-3.1.3: The system shall NOT store or match facial identity data. Only presence confirmation (true/false) is required.
- FR-3.1.4: If no human face is detected within 10 seconds, the system shall deny attendance and show an error message.
- FR-3.1.5: The system shall record the timestamp, device ID, and GPS coordinates at the moment of successful detection.
- FR-3.1.6: Attendance shall only be marked after successful human presence detection.
- FR-3.1.7: The system shall support fallback to manual admin-override attendance in case of camera failure, with mandatory reason logging.

#### Non-Functional Requirements
- Detection response time must be under 3 seconds on standard mobile browsers (PWA).
- Camera feed must not be stored or transmitted to any server — processing must happen client-side (on-device).

---

### 4.2 Geo Tracking & Travel Allowance

**Purpose:** Track employee location during work-related travel and automatically calculate travel allowance based on kilometers travelled.

#### Functional Requirements

- FR-4.2.1: The system shall capture GPS coordinates at check-in and check-out, and optionally at configurable intervals during field work.
- FR-4.2.2: The system shall calculate total distance travelled per day using GPS waypoints (using Haversine formula or Google Maps Distance Matrix API).
- FR-4.2.3: HR Admin shall be able to configure a per-kilometer travel allowance rate per employee grade or designation.
- FR-4.2.4: The system shall auto-calculate travel allowance = (total km travelled) × (rate per km) for each working day.
- FR-4.2.5: Travel allowance shall be added to the monthly payroll as a separate line item.
- FR-4.2.6: Employees shall be able to view their daily travel log (map view + km summary).
- FR-4.2.7: Managers shall be able to approve or reject travel logs before they are processed for payroll.
- FR-4.2.8: The system shall support geo-fencing — defining allowed zones for office-based employees where travel allowance does not apply.
- FR-4.2.9: The system shall flag anomalies (e.g., GPS spoofing, unusually large distances) for HR review.

#### Data Captured Per Travel Session
- Employee ID
- Date
- Start location (lat/lng) + timestamp
- End location (lat/lng) + timestamp
- Waypoints (if continuous tracking enabled)
- Total km calculated
- Allowance amount
- Approval status

---

### 4.3 Company Hierarchy System

**Purpose:** Represent and manage the full organizational structure of the company including departments, designations, and reporting lines.

#### Functional Requirements

- FR-4.3.1: The system shall support a tree-structured hierarchy with unlimited depth levels (e.g., CEO → VP → Manager → Team Lead → Employee).
- FR-4.3.2: Each employee shall be assigned to exactly one position in the hierarchy at a time.
- FR-4.3.3: HR Admin shall be able to create, edit, and delete departments, sub-departments, and designations.
- FR-4.3.4: Each employee node shall display: name, designation, department, profile photo, and direct reports count.
- FR-4.3.5: The system shall provide a visual org chart view (interactive tree diagram) accessible to all employees.
- FR-4.3.6: Managers shall only be able to view and manage employees within their reporting chain.
- FR-4.3.7: The hierarchy shall drive approval workflows — leave approvals, travel approvals, and expense approvals shall route to the direct reporting manager.
- FR-4.3.8: When an employee's position changes (promotion, transfer, resignation), the hierarchy shall update automatically and log the change history.
- FR-4.3.9: The system shall support dotted-line reporting (secondary managers) in addition to primary reporting managers.

---

### 4.4 Supplier & Buyer Management

**Purpose:** Allow employees to add and manage suppliers and buyers linked to their work activities, with traceability to the employee who manages the relationship.

#### Functional Requirements

- FR-4.4.1: Employees shall be able to add, edit, and deactivate supplier and buyer records from their self-service portal.
- FR-4.4.2: Each supplier/buyer record shall contain: name, company, contact number, email, address, GST/tax number, type (supplier/buyer/both), assigned employee, and status (active/inactive).
- FR-4.4.3: Each supplier/buyer shall be linked to the employee who created/manages it.
- FR-4.4.4: HR/Admin shall have a master view of all suppliers and buyers across all employees.
- FR-4.4.5: Managers shall be able to view suppliers/buyers managed by their direct reports.
- FR-4.4.6: The system shall log all visits made to a supplier/buyer location (linked to geo tracking module) with date, employee, and GPS-verified location.
- FR-4.4.7: The system shall support document attachments per supplier/buyer (contracts, agreements, etc.).
- FR-4.4.8: Supplier/buyer visit history shall be viewable as a timeline per record.

---

### 4.5 Attendance-Based Salary Calculation

**Purpose:** Ensure that monthly salary is automatically calculated based on the employee's actual attendance records.

#### Functional Requirements

- FR-4.5.1: The system shall calculate payable days per month based on present days, approved leaves, and holidays.
- FR-4.5.2: Unpaid absences shall be deducted from the monthly salary proportionally.
- FR-4.5.3: The formula shall be: `Payable Salary = (Gross Salary / Total Working Days) × Paid Days`
- FR-4.5.4: Half-day attendance shall count as 0.5 paid days.
- FR-4.5.5: Overtime hours (beyond standard shift hours) shall be tracked and can be configured for additional pay.
- FR-4.5.6: The payroll engine shall pull attendance data automatically at month-end and generate salary previews before finalizing.
- FR-4.5.7: HR shall be able to manually override individual attendance records with a mandatory reason and audit log entry.
- FR-4.5.8: Public holidays configured in the system calendar shall count as paid days.

---

### 4.6 Check-In / Check-Out & Leave System

**Purpose:** Enable employees to mark their attendance digitally and manage their leave requests.

#### Check-In / Check-Out Requirements

- FR-4.6.1: Employees shall mark check-in and check-out via the PWA or web portal.
- FR-4.6.2: Check-in shall require successful human presence detection (see 3.1) and GPS capture (see 3.2).
- FR-4.6.3: The system shall automatically calculate working hours per day = check-out time − check-in time.
- FR-4.6.4: If check-out is not marked, the system shall flag the record as incomplete and notify the employee.
- FR-4.6.5: The system shall support multiple check-in/check-out events per day (e.g., for field staff who visit multiple sites).
- FR-4.6.6: Employees shall be able to view their full attendance history with daily working hours.

#### Leave System Requirements

- FR-4.6.7: The system shall support configurable leave types: Casual Leave, Sick Leave, Earned Leave, Maternity/Paternity Leave, Unpaid Leave, Compensatory Off.
- FR-4.6.8: Employees shall be able to apply for leave via the portal with a reason and date range.
- FR-4.6.9: Leave requests shall be routed to the direct reporting manager for approval or rejection.
- FR-4.6.10: Employees shall be notified of approval/rejection via in-app notification and email.
- FR-4.6.11: The system shall maintain per-employee leave balances and deduct upon approval.
- FR-4.6.12: Leave carry-forward rules shall be configurable per leave type per organization policy.
- FR-4.6.13: A shared team calendar shall show approved leaves for all team members, visible to managers.
- FR-4.6.14: Half-day leave application shall be supported with AM/PM selection.

---

### 4.7 Bank Details Management

**Purpose:** Securely store employee bank details for salary disbursement.

#### Functional Requirements

- FR-4.7.1: Employees shall be able to add and update their bank account details via the self-service portal.
- FR-4.7.2: Required fields: bank name, account holder name, account number, IFSC/SWIFT code, branch name, account type (savings/current).
- FR-4.7.3: Employees shall be able to store up to 2 bank accounts and designate one as primary for salary credit.
- FR-4.7.4: Any changes to bank details shall trigger a verification workflow requiring HR/Finance approval before the new account is activated for payroll.
- FR-4.7.5: Bank details shall be encrypted at rest (AES-256) and masked in all UI views (show only last 4 digits of account number).
- FR-4.7.6: A full audit log shall be maintained for all bank detail changes (who changed, what changed, when).
- FR-4.7.7: Finance team shall be able to export salary disbursement files in standard bank formats (NEFT/CSV).

---

### 4.8 Salary Calculation Engine

**Purpose:** Support flexible salary calculation based on hourly rates, full-day, or half-day pay periods.

#### Salary Modes

| Mode | Description |
|---|---|
| Monthly Fixed | Standard monthly gross salary, deducted for absences |
| Daily Rate | Fixed per-day rate × number of paid days |
| Hourly Rate | Fixed per-hour rate × total hours worked (from check-in/out) |
| Half-Day | Day split into AM/PM; each half counted as 0.5 days |

#### Functional Requirements

- FR-4.8.1: Each employee's salary structure shall be configurable with one of the above modes.
- FR-4.8.2: Salary components shall include: Basic Pay, HRA, Conveyance, Medical Allowance, Special Allowance, Travel Allowance, Overtime Pay, Bonuses.
- FR-4.8.3: Deduction components shall include: Provident Fund (PF), ESI, Professional Tax, TDS, Advance Recovery, Loan EMI, Unpaid Leave Deductions.
- FR-4.8.4: For hourly employees, the system shall calculate total hours from attendance records and multiply by the configured hourly rate.
- FR-4.8.5: For daily-rate employees, each confirmed present day (full or half) shall be counted and multiplied by the daily rate.
- FR-4.8.6: The system shall generate a detailed payslip per employee per month showing all earnings and deductions.
- FR-4.8.7: Payslips shall be downloadable as PDF and accessible from the employee's self-service portal.
- FR-4.8.8: Salary revision history shall be maintained per employee with effective-from dates.
- FR-4.8.9: The system shall support advance salary requests — approved advances shall be auto-deducted from the next payroll cycle.

---

### 4.9 Employee Self-Upload for Personal Documents

**Purpose:** Allow employees to upload, manage, and track their personal and professional documents directly through the portal.

#### Functional Requirements

- FR-4.9.1: Employees shall be able to upload documents from their self-service portal.
- FR-4.9.2: Supported document categories: Identity Proof (Aadhar, PAN, Passport, Driving License), Educational Certificates, Experience Letters, Offer Letter, Appointment Letter, Bank Proof, Insurance Documents, Certifications, Visa/Work Permit, Other.
- FR-4.9.3: Supported file formats: PDF, JPG, PNG, DOCX. Maximum file size: 10 MB per document.
- FR-4.9.4: Each document shall have: document name, category, upload date, expiry date (optional), and status (pending review / verified / rejected).
- FR-4.9.5: HR shall be notified when a new document is uploaded and can mark it as verified or rejected with a comment.
- FR-4.9.6: Employees shall receive a notification when their document status changes.
- FR-4.9.7: The system shall alert employees (and HR) when a document's expiry date is within 30 days.
- FR-4.9.8: Documents shall be stored securely with access restricted to the employee and authorized HR/Admin users only.
- FR-4.9.9: Document storage shall be versioned — if a document is re-uploaded, the previous version is retained in history.

---

### 4.10 e-Signature for Contracts & Policies

**Purpose:** Enable legally binding electronic signatures on employment contracts, policy acknowledgments, and HR documents without requiring physical paperwork.

#### Functional Requirements

- FR-4.10.1: HR shall be able to upload documents (PDF format) and send them to one or more employees for e-signature.
- FR-4.10.2: The system shall support the following document types for e-signature: Employment Contract, NDA, Policy Acknowledgment, Offer Letter, Appraisal Letter, Warning Letter, Separation Agreement.
- FR-4.10.3: Employees shall receive an in-app notification and email when a document requires their signature.
- FR-4.10.4: Employees shall be able to review the full document before signing.
- FR-4.10.5: Signature methods supported: drawn signature (touch/mouse), typed name signature, or upload of scanned signature image.
- FR-4.10.6: Each signature shall be timestamped and include the signer's name, employee ID, IP address, and device info for audit purposes.
- FR-4.10.7: Once all required parties have signed, the final document shall be locked (read-only) and a signed PDF shall be generated and stored.
- FR-4.10.8: Both the employee and HR shall receive a copy of the fully signed document.
- FR-4.10.9: The system shall send reminders for pending signatures after 48 hours of inactivity.
- FR-4.10.10: HR shall be able to track signature status per document (sent / viewed / signed / overdue).
- FR-4.10.11: The system shall maintain a complete audit trail of all signature events.

---

### 4.11 Birthday & Work Anniversary Automated Wishes

**Purpose:** Automatically send personalized wishes to employees on their birthday and work anniversary to improve employee engagement.

#### Functional Requirements

- FR-4.11.1: The system shall automatically detect employee birthdays and work anniversaries using data from employee profiles.
- FR-4.11.2: On the day of the birthday, the system shall send a personalized wish to the employee via in-app notification and email.
- FR-4.11.3: On the work anniversary date, the system shall send a personalized message acknowledging the employee's tenure milestone (e.g., "Happy 3rd Work Anniversary!").
- FR-4.11.4: Wishes shall also be posted on a company-wide announcement/notice board (visible to all employees) unless the employee has opted out of public display.
- FR-4.11.5: HR Admin shall be able to customize wish message templates for birthdays and anniversaries.
- FR-4.11.6: The system shall support configuring who receives notifications about upcoming birthdays and anniversaries (e.g., direct manager, HR, entire team).
- FR-4.11.7: Managers shall receive a 1-day advance notification of their team member's birthday or anniversary so they can personally reach out.
- FR-4.11.8: Employees shall be able to opt out of public birthday/anniversary announcements from their profile settings.
- FR-4.11.9: The system shall handle edge cases: employees born on February 29 shall be wished on February 28 in non-leap years.

---

## 5. Non-Functional Requirements

### 4.1 Security
- All sensitive data (bank details, documents, signatures) shall be encrypted at rest using AES-256.
- All data in transit shall be encrypted using TLS 1.2 or higher.
- The system shall support Multi-Factor Authentication (MFA) for all user roles.
- Role-based access control (RBAC) shall be enforced at both API and UI levels.
- All user actions on sensitive data shall produce an immutable audit log.

### 4.2 Performance
- Page load time shall be under 2 seconds for standard views.
- Face detection shall process within 3 seconds on mid-range mobile browsers (PWA).
- Payroll calculation for up to 1,000 employees shall complete within 60 seconds.
- GPS tracking shall not drain more than 5% additional battery per hour.

### 4.3 Availability
- System uptime target: 99.5% monthly.
- Scheduled maintenance windows shall not occur during business hours (9 AM – 7 PM local time).

### 4.4 Scalability
- The system shall support up to 10,000 employees without architectural changes.
- Geo tracking data storage shall be optimized with data archival policies for records older than 2 years.

### 4.5 Compliance
- The system shall comply with applicable data privacy laws (PDPA / GDPR as applicable).
- Payroll calculations shall support Indian statutory compliance: PF, ESI, Professional Tax, TDS.
- e-Signature implementation shall comply with the IT Act, 2000 (India) or applicable regional e-signature laws.

### 4.6 Accessibility
- The web portal shall meet WCAG 2.1 Level AA accessibility standards.
- The PWA shall be installable on Android and iOS devices via the browser and shall be fully functional offline for attendance marking (with sync on reconnect).

---

## 6. Database Entities

| Entity | Key Fields |
|---|---|
| `employees` | id, name, dob, gender, nationality, contact, email, address, employee_id, join_date, department_id, designation_id, manager_id, employment_type, status |
| `emergency_contacts` | id, employee_id, name, relationship, contact_number |
| `employment_history` | id, employee_id, employer, role, from_date, to_date, reason_for_leaving |
| `job_postings` | id, title, department_id, location, description, required_skills, deadline, status |
| `applicants` | id, job_posting_id, name, email, contact, resume_url, current_stage, applied_at |
| `interviews` | id, applicant_id, scheduled_at, mode, interviewers (JSON), feedback (JSON), status |
| `onboarding_checklists` | id, employee_id, items (JSON), completed_count, total_count |
| `assets` | id, name, serial_number, category, assigned_to, assigned_at, condition, status |
| `shifts` | id, name, start_time, end_time, break_duration, applicable_days, department_id |
| `insurance_plans` | id, provider, coverage_amount, premium, eligible_grades, enrollment_window |
| `insurance_enrollments` | id, employee_id, plan_id, policy_number, enrolled_at, status |
| `reimbursement_claims` | id, employee_id, type, amount, date, description, receipt_url, status, approver_id |
| `rewards` | id, employee_id, category, title, awarded_by, awarded_at, description |
| `resignations` | id, employee_id, type, reason, effective_date, notice_end_date, status |
| `exit_interviews` | id, employee_id, scheduled_at, responses (JSON), conducted_by |
| `fnf_settlements` | id, employee_id, pending_salary, leave_encashment, gratuity, deductions, net_amount, status |
| `departments` | id, name, parent_department_id, head_employee_id |
| `designations` | id, title, grade, department_id |
| `hierarchy_nodes` | id, employee_id, parent_id, level, effective_from, effective_to |
| `attendance` | id, employee_id, date, check_in_time, check_out_time, total_hours, mode, status |
| `face_detection_logs` | id, attendance_id, detected (bool), timestamp, device_id |
| `geo_logs` | id, employee_id, date, waypoints (JSON), total_km, allowance_amount, approval_status |
| `leaves` | id, employee_id, leave_type_id, from_date, to_date, half_day, status, approver_id |
| `leave_balances` | id, employee_id, leave_type_id, year, total, used, remaining |
| `salary_structures` | id, employee_id, mode (monthly/daily/hourly), gross, components (JSON), effective_from |
| `payroll` | id, employee_id, month, year, paid_days, earnings (JSON), deductions (JSON), net_salary, status |
| `bank_details` | id, employee_id, bank_name, account_number_encrypted, ifsc, is_primary, verified, audit_log |
| `documents` | id, employee_id, category, file_url, upload_date, expiry_date, status, version |
| `esignature_requests` | id, document_url, sent_by, recipients (JSON), status, created_at |
| `esignature_events` | id, request_id, employee_id, signed_at, ip_address, device_info |
| `suppliers_buyers` | id, employee_id, name, type, contact, gst_number, status, visit_log (JSON) |
| `goals` | id, employee_id, cycle_id, type (OKR/KPI), title, target_value, current_value, weight, due_date, status |
| `review_cycles` | id, name, type (quarterly/annual), start_date, end_date, status |
| `performance_reviews` | id, employee_id, cycle_id, self_rating, manager_rating, final_rating, comments, status |
| `pips` | id, employee_id, initiated_by, goals (JSON), timeline, outcome, status |
| `training_programs` | id, title, category, mode, duration, provider, scheduled_date, status |
| `training_enrollments` | id, employee_id, program_id, enrolled_at, completed_at, status |
| `certifications` | id, employee_id, name, issuing_body, issue_date, expiry_date, file_url, status |
| `skills` | id, name, category |
| `employee_skills` | id, employee_id, skill_id, proficiency_level, updated_at |

---

## 7. Tech Stack Recommendations

| Layer | Recommended Options |
|---|---|
| Frontend (Web + PWA) | React.js + TypeScript + Vite PWA Plugin (installable on Android & iOS via browser) |
| Backend API | Node.js (Express.js) |
| Database | PostgreSQL (primary), Redis (caching/sessions) |
| File Storage | AWS S3 or Google Cloud Storage |
| Face Detection | TensorFlow.js (BlazeFace) — client-side, on-device |
| Geo / Maps | Google Maps Platform (Distance Matrix + Maps JS API) |
| e-Signature | Custom implementation or integrate with DigiSigner / DocuSign API |
| Push Notifications | Firebase Cloud Messaging (FCM) |
| Email Service | SendGrid or AWS SES |
| Authentication | JWT + OAuth 2.0 + MFA (TOTP) |
| Hosting | AWS / GCP / Azure |
| CI/CD | GitHub Actions |

---

## 8. Future Enhancements

The following features are out of scope for v1.0 but recommended for future releases:

- AI-powered attendance anomaly detection (flag unusual patterns)
- Payroll cost analytics dashboard per department and project
- Loan management module with EMI auto-deductions
- Succession planning and skill gap analysis
- Multi-currency payroll for international teams
- Integration with accounting software (Tally, QuickBooks, Zoho Books)
- Automated compliance report generation (PF challan, ESI returns, Form 16)

---

*End of Requirements Document*
*EMS v1.0 — Prepared for Kiro*
