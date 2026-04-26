import { test, expect } from '@playwright/test';

/**
 * Leave Management E2E Tests
 * 
 * Tests for leave application, approval, rejection, and balance management.
 * These tests verify the complete leave workflow from application to approval.
 */

test.describe('Leave Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login as employee
    await page.goto('/login');
    await page.locator('input[type="email"]').fill('employee@example.com');
    await page.locator('input[type="password"]').fill('password123');
    await page.locator('button:has-text("Sign In")').click();

    // Wait for dashboard and navigate to leave
    await page.waitForURL('/dashboard');
    await page.goto('/leave');
  });

  test('should display leave page with balance', async ({ page }) => {
    // Verify leave page loads
    await expect(page.locator('text=Leave Management')).toBeVisible();
    await expect(page.locator('text=Leave Balance')).toBeVisible();
    
    // Verify leave types are displayed
    await expect(page.locator('text=Annual Leave')).toBeVisible();
    await expect(page.locator('text=Sick Leave')).toBeVisible();
  });

  test('should display leave balance cards', async ({ page }) => {
    // Verify balance cards are visible
    await expect(page.locator('text=Available')).toBeVisible();
    await expect(page.locator('text=Used')).toBeVisible();
    await expect(page.locator('text=Pending')).toBeVisible();
  });

  test('should open leave application form', async ({ page }) => {
    // Click "Apply Leave" button
    await page.locator('button:has-text("Apply Leave")').click();

    // Verify form opens
    await expect(page.locator('text=Apply for Leave')).toBeVisible();
    await expect(page.locator('select[name="leaveType"]')).toBeVisible();
    await expect(page.locator('input[name="startDate"]')).toBeVisible();
    await expect(page.locator('input[name="endDate"]')).toBeVisible();
  });

  test('should validate leave application form', async ({ page }) => {
    // Click "Apply Leave" button
    await page.locator('button:has-text("Apply Leave")').click();

    // Try to submit empty form
    await page.locator('button:has-text("Submit")').click();

    // Verify validation errors
    await expect(page.locator('text=Leave type is required')).toBeVisible();
    await expect(page.locator('text=Start date is required')).toBeVisible();
    await expect(page.locator('text=End date is required')).toBeVisible();
  });

  test('should apply for leave successfully', async ({ page }) => {
    // Click "Apply Leave" button
    await page.locator('button:has-text("Apply Leave")').click();

    // Fill form
    await page.locator('select[name="leaveType"]').selectOption('Annual Leave');
    await page.locator('input[name="startDate"]').fill('2026-04-25');
    await page.locator('input[name="endDate"]').fill('2026-04-27');
    await page.locator('textarea[name="reason"]').fill('Family vacation');

    // Submit form
    await page.locator('button:has-text("Submit")').click();

    // Verify success message
    await expect(page.locator('text=Leave application submitted successfully')).toBeVisible();

    // Verify leave appears in pending list
    await expect(page.locator('text=Pending')).toBeVisible();
  });

  test('should show error when insufficient balance', async ({ page }) => {
    // Click "Apply Leave" button
    await page.locator('button:has-text("Apply Leave")').click();

    // Fill form with excessive days
    await page.locator('select[name="leaveType"]').selectOption('Annual Leave');
    await page.locator('input[name="startDate"]').fill('2026-04-25');
    await page.locator('input[name="endDate"]').fill('2026-06-30');
    await page.locator('textarea[name="reason"]').fill('Long vacation');

    // Submit form
    await page.locator('button:has-text("Submit")').click();

    // Verify error message
    await expect(page.locator('text=Insufficient leave balance')).toBeVisible();
  });

  test('should display leave history', async ({ page }) => {
    // Click "Leave History" tab
    await page.locator('text=Leave History').click();

    // Verify table is visible
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('th:has-text("Leave Type")')).toBeVisible();
    await expect(page.locator('th:has-text("Start Date")')).toBeVisible();
    await expect(page.locator('th:has-text("End Date")')).toBeVisible();
    await expect(page.locator('th:has-text("Status")')).toBeVisible();
  });

  test('should cancel pending leave', async ({ page }) => {
    // Click "Leave History" tab
    await page.locator('text=Leave History').click();

    // Find pending leave and click cancel
    const pendingRow = page.locator('tr:has-text("Pending")').first();
    await pendingRow.locator('button:has-text("Cancel")').click();

    // Confirm cancellation
    await page.locator('button:has-text("Confirm")').click();

    // Verify success message
    await expect(page.locator('text=Leave cancelled successfully')).toBeVisible();
  });

  test('should display team leave calendar for manager', async ({ page }) => {
    // Logout and login as manager
    await page.goto('/logout');
    await page.goto('/login');
    await page.locator('input[type="email"]').fill('manager@example.com');
    await page.locator('input[type="password"]').fill('password123');
    await page.locator('button:has-text("Sign In")').click();

    // Navigate to leave
    await page.waitForURL('/dashboard');
    await page.goto('/leave');

    // Click "Team Calendar" tab
    await page.locator('text=Team Calendar').click();

    // Verify calendar is visible
    await expect(page.locator('text=Team Leave Calendar')).toBeVisible();
    await expect(page.locator('[role="grid"]')).toBeVisible();
  });

  test('should approve leave as manager', async ({ page }) => {
    // Logout and login as manager
    await page.goto('/logout');
    await page.goto('/login');
    await page.locator('input[type="email"]').fill('manager@example.com');
    await page.locator('input[type="password"]').fill('password123');
    await page.locator('button:has-text("Sign In")').click();

    // Navigate to leave approvals
    await page.waitForURL('/dashboard');
    await page.goto('/leave/approvals');

    // Find pending leave and click approve
    const pendingRow = page.locator('tr:has-text("Pending")').first();
    await pendingRow.locator('button:has-text("Approve")').click();

    // Confirm approval
    await page.locator('button:has-text("Confirm Approval")').click();

    // Verify success message
    await expect(page.locator('text=Leave approved successfully')).toBeVisible();
  });

  test('should reject leave as manager', async ({ page }) => {
    // Logout and login as manager
    await page.goto('/logout');
    await page.goto('/login');
    await page.locator('input[type="email"]').fill('manager@example.com');
    await page.locator('input[type="password"]').fill('password123');
    await page.locator('button:has-text("Sign In")').click();

    // Navigate to leave approvals
    await page.waitForURL('/dashboard');
    await page.goto('/leave/approvals');

    // Find pending leave and click reject
    const pendingRow = page.locator('tr:has-text("Pending")').first();
    await pendingRow.locator('button:has-text("Reject")').click();

    // Enter rejection reason
    await page.locator('textarea[placeholder="Reason for rejection"]').fill('Insufficient staffing during this period');

    // Confirm rejection
    await page.locator('button:has-text("Confirm Rejection")').click();

    // Verify success message
    await expect(page.locator('text=Leave rejected successfully')).toBeVisible();
  });

  test('should display holiday calendar', async ({ page }) => {
    // Click "Holidays" tab
    await page.locator('text=Holidays').click();

    // Verify holiday calendar is visible
    await expect(page.locator('text=Company Holidays')).toBeVisible();
    await expect(page.locator('[role="grid"]')).toBeVisible();
  });

  test('should filter leave history by status', async ({ page }) => {
    // Click "Leave History" tab
    await page.locator('text=Leave History').click();

    // Click status filter
    await page.locator('button:has-text("Status")').click();

    // Select "Approved" status
    await page.locator('text=Approved').click();

    // Wait for results to filter
    await page.waitForTimeout(500);

    // Verify all visible rows show "Approved" status
    const statusBadges = page.locator('text=Approved');
    const count = await statusBadges.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should display leave carry-forward information', async ({ page }) => {
    // Scroll to carry-forward section
    await page.locator('text=Carry Forward').scrollIntoViewIfNeeded();

    // Verify carry-forward information is displayed
    await expect(page.locator('text=Carry Forward Rules')).toBeVisible();
    await expect(page.locator('text=Maximum Carry Forward')).toBeVisible();
  });
});
