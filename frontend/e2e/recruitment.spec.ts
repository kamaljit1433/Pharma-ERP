import { test, expect } from '@playwright/test';

/**
 * Recruitment & Onboarding E2E Tests
 * 
 * Tests for job posting, applicant tracking, interview scheduling, and onboarding.
 * These tests verify the complete recruitment workflow.
 */

test.describe('Recruitment & Onboarding', () => {
  test.beforeEach(async ({ page }) => {
    // Login as HR manager
    await page.goto('/login');
    await page.locator('input[type="email"]').fill('hr-manager@example.com');
    await page.locator('input[type="password"]').fill('password123');
    await page.locator('button:has-text("Sign In")').click();

    // Wait for dashboard and navigate to recruitment
    await page.waitForURL('/dashboard');
    await page.goto('/recruitment');
  });

  test('should display recruitment page', async ({ page }) => {
    // Verify recruitment page loads
    await expect(page.locator('text=Recruitment')).toBeVisible();
    await expect(page.locator('button:has-text("Create Job Posting")')).toBeVisible();
  });

  test('should create job posting', async ({ page }) => {
    // Click "Create Job Posting" button
    await page.locator('button:has-text("Create Job Posting")').click();

    // Fill form
    await page.locator('input[name="title"]').fill('Senior Software Engineer');
    await page.locator('textarea[name="description"]').fill('We are looking for an experienced software engineer...');
    await page.locator('select[name="department"]').selectOption('Engineering');
    await page.locator('input[name="positions"]').fill('2');
    await page.locator('select[name="experienceLevel"]').selectOption('Senior');

    // Submit form
    await page.locator('button:has-text("Create")').click();

    // Verify success message
    await expect(page.locator('text=Job posting created successfully')).toBeVisible();
  });

  test('should display job postings list', async ({ page }) => {
    // Verify table is visible
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('th:has-text("Job Title")')).toBeVisible();
    await expect(page.locator('th:has-text("Department")')).toBeVisible();
    await expect(page.locator('th:has-text("Positions")')).toBeVisible();
    await expect(page.locator('th:has-text("Status")')).toBeVisible();
  });

  test('should update job posting status', async ({ page }) => {
    // Click first job posting
    await page.locator('tbody tr').first().click();

    // Click status dropdown
    await page.locator('button:has-text("Status")').click();

    // Select "Closed" status
    await page.locator('text=Closed').click();

    // Verify success message
    await expect(page.locator('text=Job posting status updated')).toBeVisible();
  });

  test('should add applicant', async ({ page }) => {
    // Click "Applicants" tab
    await page.locator('text=Applicants').click();

    // Click "Add Applicant" button
    await page.locator('button:has-text("Add Applicant")').click();

    // Fill form
    await page.locator('input[name="name"]').fill('John Smith');
    await page.locator('input[name="email"]').fill('john.smith@example.com');
    await page.locator('input[name="phone"]').fill('+1234567890');
    await page.locator('select[name="jobPosting"]').selectOption({ index: 0 });

    // Upload resume
    await page.locator('input[type="file"]').setInputFiles('test-files/resume.pdf');

    // Submit form
    await page.locator('button:has-text("Add")').click();

    // Verify success message
    await expect(page.locator('text=Applicant added successfully')).toBeVisible();
  });

  test('should display applicant pipeline', async ({ page }) => {
    // Click "Applicants" tab
    await page.locator('text=Applicants').click();

    // Verify pipeline stages are visible
    await expect(page.locator('text=Applied')).toBeVisible();
    await expect(page.locator('text=Screening')).toBeVisible();
    await expect(page.locator('text=Interview')).toBeVisible();
    await expect(page.locator('text=Offer')).toBeVisible();
    await expect(page.locator('text=Hired')).toBeVisible();
  });

  test('should move applicant to next stage', async ({ page }) => {
    // Click "Applicants" tab
    await page.locator('text=Applicants').click();

    // Find applicant in "Applied" stage
    const applicantCard = page.locator('[data-stage="applied"]').locator('.applicant-card').first();

    // Drag to "Screening" stage
    await applicantCard.dragTo(page.locator('[data-stage="screening"]'));

    // Verify success message
    await expect(page.locator('text=Applicant moved to Screening')).toBeVisible();
  });

  test('should schedule interview', async ({ page }) => {
    // Click "Interviews" tab
    await page.locator('text=Interviews').click();

    // Click "Schedule Interview" button
    await page.locator('button:has-text("Schedule Interview")').click();

    // Fill form
    await page.locator('select[name="applicant"]').selectOption({ index: 0 });
    await page.locator('input[name="date"]').fill('2026-04-30');
    await page.locator('input[name="time"]').fill('14:00');
    await page.locator('select[name="mode"]').selectOption('Video');
    await page.locator('select[name="interviewer"]').selectOption({ index: 0 });

    // Submit form
    await page.locator('button:has-text("Schedule")').click();

    // Verify success message
    await expect(page.locator('text=Interview scheduled successfully')).toBeVisible();
  });

  test('should display interview calendar', async ({ page }) => {
    // Click "Interviews" tab
    await page.locator('text=Interviews').click();

    // Verify calendar is visible
    await expect(page.locator('[role="grid"]')).toBeVisible();
    await expect(page.locator('text=Upcoming Interviews')).toBeVisible();
  });

  test('should submit interview feedback', async ({ page }) => {
    // Click "Interviews" tab
    await page.locator('text=Interviews').click();

    // Click on completed interview
    await page.locator('tr:has-text("Completed")').first().click();

    // Click "Submit Feedback" button
    await page.locator('button:has-text("Submit Feedback")').click();

    // Fill form
    await page.locator('select[name="rating"]').selectOption('4');
    await page.locator('textarea[name="comments"]').fill('Strong technical skills, good communication');
    await page.locator('select[name="recommendation"]').selectOption('Hire');

    // Submit form
    await page.locator('button:has-text("Submit")').click();

    // Verify success message
    await expect(page.locator('text=Feedback submitted successfully')).toBeVisible();
  });

  test('should generate offer letter', async ({ page }) => {
    // Click "Offers" tab
    await page.locator('text=Offers').click();

    // Click "Generate Offer" button
    await page.locator('button:has-text("Generate Offer")').click();

    // Fill form
    await page.locator('select[name="applicant"]').selectOption({ index: 0 });
    await page.locator('input[name="salary"]').fill('80000');
    await page.locator('input[name="joiningDate"]').fill('2026-05-15');
    await page.locator('select[name="designation"]').selectOption('Software Engineer');

    // Submit form
    await page.locator('button:has-text("Generate")').click();

    // Verify success message
    await expect(page.locator('text=Offer letter generated successfully')).toBeVisible();
  });

  test('should send offer letter for e-signature', async ({ page }) => {
    // Click "Offers" tab
    await page.locator('text=Offers').click();

    // Find draft offer and click send
    const offerRow = page.locator('tr:has-text("Draft")').first();
    await offerRow.locator('button:has-text("Send")').click();

    // Confirm send
    await page.locator('button:has-text("Confirm")').click();

    // Verify success message
    await expect(page.locator('text=Offer letter sent for signature')).toBeVisible();
  });

  test('should create onboarding checklist', async ({ page }) => {
    // Click "Onboarding" tab
    await page.locator('text=Onboarding').click();

    // Click "Create Checklist" button
    await page.locator('button:has-text("Create Checklist")').click();

    // Fill form
    await page.locator('select[name="employee"]').selectOption({ index: 0 });
    await page.locator('input[name="startDate"]').fill('2026-05-15');

    // Submit form
    await page.locator('button:has-text("Create")').click();

    // Verify success message
    await expect(page.locator('text=Onboarding checklist created')).toBeVisible();
  });

  test('should display onboarding checklist items', async ({ page }) => {
    // Click "Onboarding" tab
    await page.locator('text=Onboarding').click();

    // Click on employee
    await page.locator('tbody tr').first().click();

    // Verify checklist items are visible
    await expect(page.locator('text=Complete documentation')).toBeVisible();
    await expect(page.locator('text=IT setup')).toBeVisible();
    await expect(page.locator('text=Team introduction')).toBeVisible();
  });

  test('should mark checklist item as complete', async ({ page }) => {
    // Click "Onboarding" tab
    await page.locator('text=Onboarding').click();

    // Click on employee
    await page.locator('tbody tr').first().click();

    // Check first checklist item
    await page.locator('input[type="checkbox"]').first().check();

    // Verify success message
    await expect(page.locator('text=Checklist item updated')).toBeVisible();
  });

  test('should filter applicants by stage', async ({ page }) => {
    // Click "Applicants" tab
    await page.locator('text=Applicants').click();

    // Click stage filter
    await page.locator('button:has-text("Stage")').click();

    // Select "Interview" stage
    await page.locator('text=Interview').click();

    // Wait for results to filter
    await page.waitForTimeout(500);

    // Verify only interview stage applicants are visible
    const applicants = page.locator('.applicant-card');
    const count = await applicants.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should search applicants by name', async ({ page }) => {
    // Click "Applicants" tab
    await page.locator('text=Applicants').click();

    // Enter search term
    await page.locator('input[placeholder="Search applicants..."]').fill('John');

    // Wait for results to filter
    await page.waitForTimeout(500);

    // Verify filtered results
    const applicants = page.locator('.applicant-card');
    const count = await applicants.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should reject applicant', async ({ page }) => {
    // Click "Applicants" tab
    await page.locator('text=Applicants').click();

    // Click on applicant
    await page.locator('.applicant-card').first().click();

    // Click "Reject" button
    await page.locator('button:has-text("Reject")').click();

    // Enter rejection reason
    await page.locator('textarea[placeholder="Reason for rejection"]').fill('Not a good fit for the role');

    // Confirm rejection
    await page.locator('button:has-text("Confirm Rejection")').click();

    // Verify success message
    await expect(page.locator('text=Applicant rejected')).toBeVisible();
  });
});
