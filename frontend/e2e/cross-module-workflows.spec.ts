import { test, expect } from '@playwright/test';

/**
 * Cross-Module Workflows E2E Tests
 * 
 * Tests for workflows that span multiple modules and verify end-to-end integration.
 * These tests ensure that different modules work together correctly.
 */

test.describe('Cross-Module Workflows', () => {
  test.describe('Employee Lifecycle Workflow', () => {
    test('should complete full employee lifecycle from hire to separation', async ({ page }) => {
      // Login as HR manager
      await page.goto('/login');
      await page.locator('input[type="email"]').fill('hr-manager@example.com');
      await page.locator('input[type="password"]').fill('password123');
      await page.locator('button:has-text("Sign In")').click();
      await page.waitForURL('/dashboard');

      // Step 1: Create employee
      await page.goto('/employees');
      await page.locator('button:has-text("Add Employee")').click();
      await page.locator('input[placeholder="First Name"]').fill('Test');
      await page.locator('input[placeholder="Last Name"]').fill('Employee');
      await page.locator('input[type="email"]').fill('test.employee@example.com');
      await page.locator('input[placeholder="Employee ID"]').fill('EMP9999');
      await page.locator('select[name="department"]').selectOption('Engineering');
      await page.locator('button:has-text("Create")').click();
      await expect(page.locator('text=Employee created successfully')).toBeVisible();

      // Step 2: Configure salary
      await page.goto('/employees/EMP9999/payroll');
      await page.locator('button:has-text("Configure Salary")').click();
      await page.locator('input[name="basicSalary"]').fill('60000');
      await page.locator('button:has-text("Save")').click();
      await expect(page.locator('text=Salary structure configured')).toBeVisible();

      // Step 3: Assign to training
      await page.goto('/training');
      await page.locator('button:has-text("Enroll Employee")').click();
      await page.locator('select[name="employee"]').selectOption('EMP9999');
      await page.locator('select[name="program"]').selectOption({ index: 0 });
      await page.locator('button:has-text("Enroll")').click();
      await expect(page.locator('text=Employee enrolled')).toBeVisible();

      // Step 4: Submit resignation
      await page.goto('/separation');
      await page.locator('button:has-text("Submit Resignation")').click();
      await page.locator('select[name="employee"]').selectOption('EMP9999');
      await page.locator('input[name="lastWorkingDay"]').fill('2026-05-31');
      await page.locator('textarea[name="reason"]').fill('Personal reasons');
      await page.locator('button:has-text("Submit")').click();
      await expect(page.locator('text=Resignation submitted')).toBeVisible();

      // Step 5: Complete F&F settlement
      await page.goto('/separation/fnf/EMP9999');
      await expect(page.locator('text=Full & Final Settlement')).toBeVisible();
      await page.locator('button:has-text("Calculate")').click();
      await expect(page.locator('text=Settlement calculated')).toBeVisible();
    });
  });

  test.describe('Attendance to Payroll Workflow', () => {
    test('should calculate salary based on attendance', async ({ page }) => {
      // Login as employee
      await page.goto('/login');
      await page.locator('input[type="email"]').fill('employee@example.com');
      await page.locator('input[type="password"]').fill('password123');
      await page.locator('button:has-text("Sign In")').click();
      await page.waitForURL('/dashboard');

      // Mark attendance for multiple days
      for (let i = 0; i < 5; i++) {
        await page.goto('/attendance');
        await page.locator('button:has-text("Check In")').click();
        
        // Mock face detection and GPS
        await page.evaluate(() => {
          (window as any).faceDetectionResult = true;
          (window as any).gpsCoordinates = { latitude: 40.7128, longitude: -74.0060 };
        });
        
        await page.locator('button:has-text("Confirm")').click();
        await expect(page.locator('text=Checked in successfully')).toBeVisible();
        
        // Wait and check out
        await page.waitForTimeout(1000);
        await page.locator('button:has-text("Check Out")').click();
        await page.locator('button:has-text("Confirm")').click();
        await expect(page.locator('text=Checked out successfully')).toBeVisible();
      }

      // Logout and login as finance
      await page.goto('/logout');
      await page.goto('/login');
      await page.locator('input[type="email"]').fill('finance@example.com');
      await page.locator('input[type="password"]').fill('password123');
      await page.locator('button:has-text("Sign In")').click();
      await page.waitForURL('/dashboard');

      // Process payroll
      await page.goto('/payroll');
      await page.locator('button:has-text("Process Payroll")').click();
      await page.locator('select[name="month"]').selectOption('April');
      await page.locator('select[name="year"]').selectOption('2026');
      await page.locator('button:has-text("Confirm")').click();
      await expect(page.locator('text=Payroll processing started')).toBeVisible();

      // Verify attendance-based calculation
      await page.goto('/payroll/employee@example.com/2026/04');
      await expect(page.locator('text=Working Days')).toBeVisible();
      await expect(page.locator('text=Present Days')).toBeVisible();
    });
  });

  test.describe('Leave to Payroll Workflow', () => {
    test('should deduct salary for unpaid leave', async ({ page }) => {
      // Login as employee
      await page.goto('/login');
      await page.locator('input[type="email"]').fill('employee@example.com');
      await page.locator('input[type="password"]').fill('password123');
      await page.locator('button:has-text("Sign In")').click();
      await page.waitForURL('/dashboard');

      // Apply for unpaid leave
      await page.goto('/leave');
      await page.locator('button:has-text("Apply Leave")').click();
      await page.locator('select[name="leaveType"]').selectOption('Unpaid Leave');
      await page.locator('input[name="startDate"]').fill('2026-04-25');
      await page.locator('input[name="endDate"]').fill('2026-04-27');
      await page.locator('textarea[name="reason"]').fill('Personal work');
      await page.locator('button:has-text("Submit")').click();
      await expect(page.locator('text=Leave application submitted')).toBeVisible();

      // Logout and login as manager to approve
      await page.goto('/logout');
      await page.goto('/login');
      await page.locator('input[type="email"]').fill('manager@example.com');
      await page.locator('input[type="password"]').fill('password123');
      await page.locator('button:has-text("Sign In")').click();
      await page.waitForURL('/dashboard');

      await page.goto('/leave/approvals');
      const pendingRow = page.locator('tr:has-text("Pending")').first();
      await pendingRow.locator('button:has-text("Approve")').click();
      await page.locator('button:has-text("Confirm Approval")').click();
      await expect(page.locator('text=Leave approved')).toBeVisible();

      // Logout and login as finance
      await page.goto('/logout');
      await page.goto('/login');
      await page.locator('input[type="email"]').fill('finance@example.com');
      await page.locator('input[type="password"]').fill('password123');
      await page.locator('button:has-text("Sign In")').click();
      await page.waitForURL('/dashboard');

      // Process payroll and verify deduction
      await page.goto('/payroll');
      await page.locator('button:has-text("Process Payroll")').click();
      await page.locator('select[name="month"]').selectOption('April');
      await page.locator('select[name="year"]').selectOption('2026');
      await page.locator('button:has-text("Confirm")').click();

      // Check payslip for deduction
      await page.goto('/payroll/employee@example.com/2026/04');
      await expect(page.locator('text=Unpaid Leave Deduction')).toBeVisible();
    });
  });

  test.describe('Recruitment to Onboarding Workflow', () => {
    test('should complete recruitment and onboarding process', async ({ page }) => {
      // Login as HR manager
      await page.goto('/login');
      await page.locator('input[type="email"]').fill('hr-manager@example.com');
      await page.locator('input[type="password"]').fill('password123');
      await page.locator('button:has-text("Sign In")').click();
      await page.waitForURL('/dashboard');

      // Add applicant
      await page.goto('/recruitment');
      await page.locator('text=Applicants').click();
      await page.locator('button:has-text("Add Applicant")').click();
      await page.locator('input[name="name"]').fill('Jane Candidate');
      await page.locator('input[name="email"]').fill('jane.candidate@example.com');
      await page.locator('input[name="phone"]').fill('+1234567890');
      await page.locator('select[name="jobPosting"]').selectOption({ index: 0 });
      await page.locator('button:has-text("Add")').click();
      await expect(page.locator('text=Applicant added')).toBeVisible();

      // Move through pipeline
      const applicantCard = page.locator('[data-stage="applied"]').locator('.applicant-card').first();
      await applicantCard.dragTo(page.locator('[data-stage="hired"]'));
      await expect(page.locator('text=Applicant moved to Hired')).toBeVisible();

      // Generate offer letter
      await page.locator('text=Offers').click();
      await page.locator('button:has-text("Generate Offer")').click();
      await page.locator('select[name="applicant"]').selectOption('jane.candidate@example.com');
      await page.locator('input[name="salary"]').fill('75000');
      await page.locator('input[name="joiningDate"]').fill('2026-05-15');
      await page.locator('button:has-text("Generate")').click();
      await expect(page.locator('text=Offer letter generated')).toBeVisible();

      // Create onboarding checklist
      await page.locator('text=Onboarding').click();
      await page.locator('button:has-text("Create Checklist")').click();
      await page.locator('select[name="employee"]').selectOption('jane.candidate@example.com');
      await page.locator('input[name="startDate"]').fill('2026-05-15');
      await page.locator('button:has-text("Create")').click();
      await expect(page.locator('text=Onboarding checklist created')).toBeVisible();
    });
  });

  test.describe('Performance to Training Workflow', () => {
    test('should identify skill gaps and assign training', async ({ page }) => {
      // Login as manager
      await page.goto('/login');
      await page.locator('input[type="email"]').fill('manager@example.com');
      await page.locator('input[type="password"]').fill('password123');
      await page.locator('button:has-text("Sign In")').click();
      await page.waitForURL('/dashboard');

      // Submit performance review
      await page.goto('/performance');
      await page.locator('button:has-text("Submit Review")').click();
      await page.locator('select[name="employee"]').selectOption({ index: 0 });
      await page.locator('select[name="rating"]').selectOption('3');
      await page.locator('textarea[name="comments"]').fill('Needs improvement in React skills');
      await page.locator('textarea[name="developmentAreas"]').fill('React, TypeScript');
      await page.locator('button:has-text("Submit")').click();
      await expect(page.locator('text=Review submitted')).toBeVisible();

      // View skill gap report
      await page.goto('/training/skill-gap');
      await expect(page.locator('text=Skill Gap Analysis')).toBeVisible();
      await expect(page.locator('text=React')).toBeVisible();

      // Assign training based on gap
      await page.goto('/training');
      await page.locator('button:has-text("Enroll Employee")').click();
      await page.locator('select[name="employee"]').selectOption({ index: 0 });
      await page.locator('select[name="program"]').selectOption('React Advanced');
      await page.locator('button:has-text("Enroll")').click();
      await expect(page.locator('text=Employee enrolled')).toBeVisible();
    });
  });

  test.describe('Geo Tracking to Travel Allowance Workflow', () => {
    test('should calculate travel allowance from GPS logs', async ({ page }) => {
      // Login as employee
      await page.goto('/login');
      await page.locator('input[type="email"]').fill('employee@example.com');
      await page.locator('input[type="password"]').fill('password123');
      await page.locator('button:has-text("Sign In")').click();
      await page.waitForURL('/dashboard');

      // Log travel journey
      await page.goto('/geo-tracking');
      await page.locator('button:has-text("Start Journey")').click();

      // Mock GPS waypoints
      await page.evaluate(() => {
        (window as any).gpsWaypoints = [
          { latitude: 40.7128, longitude: -74.0060, timestamp: Date.now() },
          { latitude: 40.7580, longitude: -73.9855, timestamp: Date.now() + 1800000 },
        ];
      });

      await page.locator('button:has-text("End Journey")').click();
      await expect(page.locator('text=Journey logged')).toBeVisible();

      // View travel allowance
      await page.goto('/geo-tracking/allowance');
      await expect(page.locator('text=Travel Allowance')).toBeVisible();
      await expect(page.locator('text=Distance Traveled')).toBeVisible();
      await expect(page.locator('text=Allowance Amount')).toBeVisible();

      // Submit for approval
      await page.locator('button:has-text("Submit for Approval")').click();
      await expect(page.locator('text=Travel log submitted')).toBeVisible();

      // Logout and login as manager to approve
      await page.goto('/logout');
      await page.goto('/login');
      await page.locator('input[type="email"]').fill('manager@example.com');
      await page.locator('input[type="password"]').fill('password123');
      await page.locator('button:has-text("Sign In")').click();
      await page.waitForURL('/dashboard');

      await page.goto('/geo-tracking/approvals');
      const pendingRow = page.locator('tr:has-text("Pending")').first();
      await pendingRow.locator('button:has-text("Approve")').click();
      await page.locator('button:has-text("Confirm")').click();
      await expect(page.locator('text=Travel log approved')).toBeVisible();

      // Verify allowance added to payroll
      await page.goto('/logout');
      await page.goto('/login');
      await page.locator('input[type="email"]').fill('finance@example.com');
      await page.locator('input[type="password"]').fill('password123');
      await page.locator('button:has-text("Sign In")').click();
      await page.waitForURL('/dashboard');

      await page.goto('/payroll/employee@example.com/2026/04');
      await expect(page.locator('text=Travel Allowance')).toBeVisible();
    });
  });

  test.describe('Benefits to Payroll Workflow', () => {
    test('should integrate insurance premium with payroll', async ({ page }) => {
      // Login as employee
      await page.goto('/login');
      await page.locator('input[type="email"]').fill('employee@example.com');
      await page.locator('input[type="password"]').fill('password123');
      await page.locator('button:has-text("Sign In")').click();
      await page.waitForURL('/dashboard');

      // Enroll in insurance plan
      await page.goto('/benefits');
      await page.locator('text=Insurance').click();
      await page.locator('button:has-text("Enroll")').click();
      await page.locator('select[name="plan"]').selectOption({ index: 0 });
      await page.locator('button:has-text("Confirm Enrollment")').click();
      await expect(page.locator('text=Enrolled successfully')).toBeVisible();

      // Logout and login as finance
      await page.goto('/logout');
      await page.goto('/login');
      await page.locator('input[type="email"]').fill('finance@example.com');
      await page.locator('input[type="password"]').fill('password123');
      await page.locator('button:has-text("Sign In")').click();
      await page.waitForURL('/dashboard');

      // Process payroll and verify premium deduction
      await page.goto('/payroll');
      await page.locator('button:has-text("Process Payroll")').click();
      await page.locator('select[name="month"]').selectOption('April');
      await page.locator('select[name="year"]').selectOption('2026');
      await page.locator('button:has-text("Confirm")').click();

      // Check payslip for insurance premium deduction
      await page.goto('/payroll/employee@example.com/2026/04');
      await expect(page.locator('text=Insurance Premium')).toBeVisible();
    });
  });

  test.describe('Document Management Workflow', () => {
    test('should upload, verify, and use documents across modules', async ({ page }) => {
      // Login as employee
      await page.goto('/login');
      await page.locator('input[type="email"]').fill('employee@example.com');
      await page.locator('input[type="password"]').fill('password123');
      await page.locator('button:has-text("Sign In")').click();
      await page.waitForURL('/dashboard');

      // Upload document
      await page.goto('/documents');
      await page.locator('button:has-text("Upload Document")').click();
      await page.locator('select[name="type"]').selectOption('ID Proof');
      await page.locator('input[type="file"]').setInputFiles('test-files/id-proof.pdf');
      await page.locator('button:has-text("Upload")').click();
      await expect(page.locator('text=Document uploaded')).toBeVisible();

      // Logout and login as HR to verify
      await page.goto('/logout');
      await page.goto('/login');
      await page.locator('input[type="email"]').fill('hr-manager@example.com');
      await page.locator('input[type="password"]').fill('password123');
      await page.locator('button:has-text("Sign In")').click();
      await page.waitForURL('/dashboard');

      await page.goto('/documents/pending-verification');
      const docRow = page.locator('tr:has-text("ID Proof")').first();
      await docRow.locator('button:has-text("Verify")').click();
      await page.locator('button:has-text("Confirm")').click();
      await expect(page.locator('text=Document verified')).toBeVisible();

      // Use document in other modules (e.g., bank details)
      await page.goto('/employees/employee@example.com/bank-details');
      await expect(page.locator('text=ID Proof')).toBeVisible();
      await expect(page.locator('text=Verified')).toBeVisible();
    });
  });
});
