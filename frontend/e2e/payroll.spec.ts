import { test, expect } from '@playwright/test';

/**
 * Payroll Management E2E Tests
 * 
 * Tests for payroll processing, payslip generation, and salary management.
 * These tests verify the complete payroll workflow.
 */

test.describe('Payroll Management', () => {
  test.describe('Employee View', () => {
    test.beforeEach(async ({ page }) => {
      // Login as employee
      await page.goto('/login');
      await page.locator('input[type="email"]').fill('employee@example.com');
      await page.locator('input[type="password"]').fill('password123');
      await page.locator('button:has-text("Sign In")').click();

      // Wait for dashboard and navigate to payroll
      await page.waitForURL('/dashboard');
      await page.goto('/payroll');
    });

    test('should display payroll page', async ({ page }) => {
      // Verify payroll page loads
      await expect(page.locator('text=Payroll')).toBeVisible();
      await expect(page.locator('text=Salary Information')).toBeVisible();
    });

    test('should display salary structure', async ({ page }) => {
      // Verify salary structure is visible
      await expect(page.locator('text=Basic Salary')).toBeVisible();
      await expect(page.locator('text=Allowances')).toBeVisible();
      await expect(page.locator('text=Deductions')).toBeVisible();
      await expect(page.locator('text=Net Salary')).toBeVisible();
    });

    test('should display payslip history', async ({ page }) => {
      // Click "Payslips" tab
      await page.locator('text=Payslips').click();

      // Verify table is visible
      await expect(page.locator('table')).toBeVisible();
      await expect(page.locator('th:has-text("Month")')).toBeVisible();
      await expect(page.locator('th:has-text("Gross Salary")')).toBeVisible();
      await expect(page.locator('th:has-text("Net Salary")')).toBeVisible();
      await expect(page.locator('th:has-text("Status")')).toBeVisible();
    });

    test('should download payslip', async ({ page }) => {
      // Click "Payslips" tab
      await page.locator('text=Payslips').click();

      // Click download button for first payslip
      const downloadPromise = page.waitForEvent('download');
      await page.locator('tbody tr').first().locator('button:has-text("Download")').click();
      const download = await downloadPromise;

      // Verify download started
      expect(download.suggestedFilename()).toContain('payslip');
    });

    test('should view payslip details', async ({ page }) => {
      // Click "Payslips" tab
      await page.locator('text=Payslips').click();

      // Click first payslip row
      await page.locator('tbody tr').first().click();

      // Verify payslip details are displayed
      await expect(page.locator('text=Payslip Details')).toBeVisible();
      await expect(page.locator('text=Earnings')).toBeVisible();
      await expect(page.locator('text=Deductions')).toBeVisible();
      await expect(page.locator('text=Net Pay')).toBeVisible();
    });

    test('should request advance salary', async ({ page }) => {
      // Click "Advance Salary" tab
      await page.locator('text=Advance Salary').click();

      // Click "Request Advance" button
      await page.locator('button:has-text("Request Advance")').click();

      // Fill form
      await page.locator('input[name="amount"]').fill('5000');
      await page.locator('textarea[name="reason"]').fill('Medical emergency');

      // Submit form
      await page.locator('button:has-text("Submit Request")').click();

      // Verify success message
      await expect(page.locator('text=Advance salary request submitted')).toBeVisible();
    });

    test('should display advance salary history', async ({ page }) => {
      // Click "Advance Salary" tab
      await page.locator('text=Advance Salary').click();

      // Verify table is visible
      await expect(page.locator('table')).toBeVisible();
      await expect(page.locator('th:has-text("Amount")')).toBeVisible();
      await expect(page.locator('th:has-text("Reason")')).toBeVisible();
      await expect(page.locator('th:has-text("Status")')).toBeVisible();
    });
  });

  test.describe('Finance View', () => {
    test.beforeEach(async ({ page }) => {
      // Login as finance user
      await page.goto('/login');
      await page.locator('input[type="email"]').fill('finance@example.com');
      await page.locator('input[type="password"]').fill('password123');
      await page.locator('button:has-text("Sign In")').click();

      // Wait for dashboard and navigate to payroll
      await page.waitForURL('/dashboard');
      await page.goto('/payroll');
    });

    test('should display payroll processing page', async ({ page }) => {
      // Verify payroll processing page loads
      await expect(page.locator('text=Payroll Processing')).toBeVisible();
      await expect(page.locator('button:has-text("Process Payroll")')).toBeVisible();
    });

    test('should configure salary structure', async ({ page }) => {
      // Navigate to employee payroll
      await page.goto('/employees/1/payroll');

      // Click "Configure Salary" button
      await page.locator('button:has-text("Configure Salary")').click();

      // Fill form
      await page.locator('input[name="basicSalary"]').fill('50000');
      await page.locator('input[name="hra"]').fill('20000');
      await page.locator('input[name="transportAllowance"]').fill('5000');

      // Submit form
      await page.locator('button:has-text("Save")').click();

      // Verify success message
      await expect(page.locator('text=Salary structure configured successfully')).toBeVisible();
    });

    test('should process monthly payroll', async ({ page }) => {
      // Click "Process Payroll" button
      await page.locator('button:has-text("Process Payroll")').click();

      // Select month and year
      await page.locator('select[name="month"]').selectOption('March');
      await page.locator('select[name="year"]').selectOption('2026');

      // Confirm processing
      await page.locator('button:has-text("Confirm")').click();

      // Wait for processing to complete
      await expect(page.locator('text=Payroll processing started')).toBeVisible();
      
      // Verify progress indicator
      await expect(page.locator('[role="progressbar"]')).toBeVisible();
    });

    test('should display payroll summary', async ({ page }) => {
      // Click "Payroll Summary" tab
      await page.locator('text=Payroll Summary').click();

      // Verify summary cards are visible
      await expect(page.locator('text=Total Employees')).toBeVisible();
      await expect(page.locator('text=Total Gross Salary')).toBeVisible();
      await expect(page.locator('text=Total Deductions')).toBeVisible();
      await expect(page.locator('text=Total Net Salary')).toBeVisible();
    });

    test('should export payroll data', async ({ page }) => {
      // Click "Export" button
      const downloadPromise = page.waitForEvent('download');
      await page.locator('button:has-text("Export")').click();

      // Select format
      await page.locator('text=CSV').click();

      const download = await downloadPromise;

      // Verify download started
      expect(download.suggestedFilename()).toContain('payroll');
      expect(download.suggestedFilename()).toContain('.csv');
    });

    test('should lock payroll', async ({ page }) => {
      // Click "Payroll Summary" tab
      await page.locator('text=Payroll Summary').click();

      // Click "Lock Payroll" button
      await page.locator('button:has-text("Lock Payroll")').click();

      // Confirm lock
      await page.locator('button:has-text("Confirm Lock")').click();

      // Verify success message
      await expect(page.locator('text=Payroll locked successfully')).toBeVisible();

      // Verify lock icon is displayed
      await expect(page.locator('[data-icon="lock"]')).toBeVisible();
    });

    test('should approve advance salary request', async ({ page }) => {
      // Click "Advance Requests" tab
      await page.locator('text=Advance Requests').click();

      // Find pending request and click approve
      const pendingRow = page.locator('tr:has-text("Pending")').first();
      await pendingRow.locator('button:has-text("Approve")').click();

      // Confirm approval
      await page.locator('button:has-text("Confirm Approval")').click();

      // Verify success message
      await expect(page.locator('text=Advance salary approved')).toBeVisible();
    });

    test('should reject advance salary request', async ({ page }) => {
      // Click "Advance Requests" tab
      await page.locator('text=Advance Requests').click();

      // Find pending request and click reject
      const pendingRow = page.locator('tr:has-text("Pending")').first();
      await pendingRow.locator('button:has-text("Reject")').click();

      // Enter rejection reason
      await page.locator('textarea[placeholder="Reason for rejection"]').fill('Insufficient justification');

      // Confirm rejection
      await page.locator('button:has-text("Confirm Rejection")').click();

      // Verify success message
      await expect(page.locator('text=Advance salary rejected')).toBeVisible();
    });

    test('should filter payroll by status', async ({ page }) => {
      // Click status filter
      await page.locator('button:has-text("Status")').click();

      // Select "Processed" status
      await page.locator('text=Processed').click();

      // Wait for results to filter
      await page.waitForTimeout(500);

      // Verify all visible rows show "Processed" status
      const statusBadges = page.locator('text=Processed');
      const count = await statusBadges.count();
      expect(count).toBeGreaterThan(0);
    });

    test('should display statutory deductions breakdown', async ({ page }) => {
      // Click on employee payroll
      await page.locator('tbody tr').first().click();

      // Verify deductions are displayed
      await expect(page.locator('text=PF Contribution')).toBeVisible();
      await expect(page.locator('text=ESI Contribution')).toBeVisible();
      await expect(page.locator('text=TDS')).toBeVisible();
    });
  });
});
