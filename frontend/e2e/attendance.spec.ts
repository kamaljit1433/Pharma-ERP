import { test, expect } from '@playwright/test';

/**
 * Attendance Management E2E Tests
 * 
 * Tests for check-in/check-out, attendance history, and regularization.
 * These tests verify the attendance module functionality.
 */

test.describe('Attendance Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login as employee
    await page.goto('/login');
    await page.locator('input[type="email"]').fill('employee@example.com');
    await page.locator('input[type="password"]').fill('password123');
    await page.locator('button:has-text("Sign In")').click();

    // Wait for dashboard and navigate to attendance
    await page.waitForURL('/dashboard');
    await page.goto('/attendance');
  });

  test('should display attendance page', async ({ page }) => {
    // Verify attendance page loads
    await expect(page.locator('text=Attendance')).toBeVisible();
    await expect(page.locator('button:has-text("Check In")')).toBeVisible();
  });

  test('should display check-in button when not checked in', async ({ page }) => {
    // Verify check-in button is visible
    const checkInButton = page.locator('button:has-text("Check In")');
    await expect(checkInButton).toBeVisible();

    // Verify check-out button is not visible
    const checkOutButton = page.locator('button:has-text("Check Out")');
    await expect(checkOutButton).not.toBeVisible();
  });

  test('should open check-in dialog', async ({ page }) => {
    // Click check-in button
    await page.locator('button:has-text("Check In")').click();

    // Verify dialog opens
    await expect(page.locator('text=Check In')).toBeVisible();
    await expect(page.locator('text=Allow camera access')).toBeVisible();
  });

  test('should display attendance history', async ({ page }) => {
    // Scroll to attendance history section
    await page.locator('text=Attendance History').scrollIntoViewIfNeeded();

    // Verify table is visible
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('th:has-text("Date")')).toBeVisible();
    await expect(page.locator('th:has-text("Check In")')).toBeVisible();
    await expect(page.locator('th:has-text("Check Out")')).toBeVisible();
    await expect(page.locator('th:has-text("Status")')).toBeVisible();
  });

  test('should display monthly attendance summary', async ({ page }) => {
    // Scroll to monthly summary section
    await page.locator('text=Monthly Summary').scrollIntoViewIfNeeded();

    // Verify summary cards are visible
    await expect(page.locator('text=Present')).toBeVisible();
    await expect(page.locator('text=Absent')).toBeVisible();
    await expect(page.locator('text=Half Day')).toBeVisible();
    await expect(page.locator('text=On Leave')).toBeVisible();
  });

  test('should filter attendance by date range', async ({ page }) => {
    // Click date range filter
    await page.locator('button:has-text("Date Range")').click();

    // Select start date
    await page.locator('input[placeholder="Start Date"]').fill('2026-03-01');

    // Select end date
    await page.locator('input[placeholder="End Date"]').fill('2026-03-31');

    // Apply filter
    await page.locator('button:has-text("Apply")').click();

    // Wait for results to update
    await page.waitForTimeout(500);

    // Verify table is updated
    await expect(page.locator('table')).toBeVisible();
  });

  test('should open regularization request form', async ({ page }) => {
    // Scroll to attendance history
    await page.locator('text=Attendance History').scrollIntoViewIfNeeded();

    // Click first row's action menu
    await page.locator('tbody tr').first().locator('button[aria-label="Actions"]').click();

    // Click "Request Regularization"
    await page.locator('text=Request Regularization').click();

    // Verify form opens
    await expect(page.locator('text=Request Regularization')).toBeVisible();
    await expect(page.locator('textarea[placeholder="Reason"]')).toBeVisible();
  });

  test('should submit regularization request', async ({ page }) => {
    // Scroll to attendance history
    await page.locator('text=Attendance History').scrollIntoViewIfNeeded();

    // Click first row's action menu
    await page.locator('tbody tr').first().locator('button[aria-label="Actions"]').click();

    // Click "Request Regularization"
    await page.locator('text=Request Regularization').click();

    // Fill form
    await page.locator('textarea[placeholder="Reason"]').fill('System was down, could not mark attendance');

    // Submit form
    await page.locator('button:has-text("Submit Request")').click();

    // Verify success message
    await expect(page.locator('text=Regularization request submitted')).toBeVisible();
  });

  test('should display pending regularization requests', async ({ page }) => {
    // Click "Pending Requests" tab
    await page.locator('text=Pending Requests').click();

    // Verify pending requests are displayed
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('th:has-text("Date")')).toBeVisible();
    await expect(page.locator('th:has-text("Reason")')).toBeVisible();
    await expect(page.locator('th:has-text("Status")')).toBeVisible();
  });

  test('should display shift information', async ({ page }) => {
    // Click "Shift" tab
    await page.locator('text=Shift').click();

    // Verify shift information is displayed
    await expect(page.locator('text=Current Shift')).toBeVisible();
    await expect(page.locator('text=Shift Type')).toBeVisible();
    await expect(page.locator('text=Start Time')).toBeVisible();
    await expect(page.locator('text=End Time')).toBeVisible();
  });

  test('should display working hours calculation', async ({ page }) => {
    // Scroll to attendance history
    await page.locator('text=Attendance History').scrollIntoViewIfNeeded();

    // Verify working hours column is visible
    await expect(page.locator('th:has-text("Working Hours")')).toBeVisible();

    // Verify working hours are displayed for each row
    const rows = page.locator('tbody tr');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);

    // Check first row has working hours
    const firstRowHours = rows.first().locator('td').nth(4);
    await expect(firstRowHours).toContainText(/\d+:\d+/);
  });

  test('should display overtime information', async ({ page }) => {
    // Click "Overtime" tab
    await page.locator('text=Overtime').click();

    // Verify overtime information is displayed
    await expect(page.locator('text=Total Overtime')).toBeVisible();
    await expect(page.locator('text=Overtime Hours')).toBeVisible();
  });
});
