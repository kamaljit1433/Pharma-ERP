import { test, expect } from '@playwright/test';

/**
 * Benefits Management E2E Tests
 * 
 * Tests for insurance, reimbursements, rewards, PF, and gratuity.
 * These tests verify the benefits module functionality.
 */

test.describe('Benefits Management', () => {
  test.describe('Insurance Management', () => {
    test.beforeEach(async ({ page }) => {
      // Login as employee
      await page.goto('/login');
      await page.locator('input[type="email"]').fill('employee@example.com');
      await page.locator('input[type="password"]').fill('password123');
      await page.locator('button:has-text("Sign In")').click();
      await page.waitForURL('/dashboard');
      await page.goto('/benefits');
    });

    test('should display available insurance plans', async ({ page }) => {
      await page.locator('text=Insurance').click();
      
      await expect(page.locator('text=Available Plans')).toBeVisible();
      await expect(page.locator('text=Health Insurance')).toBeVisible();
      await expect(page.locator('text=Life Insurance')).toBeVisible();
    });

    test('should enroll in insurance plan', async ({ page }) => {
      await page.locator('text=Insurance').click();
      await page.locator('button:has-text("Enroll")').first().click();
      
      await page.locator('select[name="coverageType"]').selectOption('Family');
      await page.locator('button:has-text("Confirm Enrollment")').click();
      
      await expect(page.locator('text=Enrolled successfully')).toBeVisible();
    });

    test('should display enrollment details', async ({ page }) => {
      await page.locator('text=Insurance').click();
      await page.locator('text=My Enrollments').click();
      
      await expect(page.locator('table')).toBeVisible();
      await expect(page.locator('th:has-text("Plan Name")')).toBeVisible();
      await expect(page.locator('th:has-text("Coverage")')).toBeVisible();
      await expect(page.locator('th:has-text("Premium")')).toBeVisible();
    });
  });

  test.describe('Reimbursement Claims', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/login');
      await page.locator('input[type="email"]').fill('employee@example.com');
      await page.locator('input[type="password"]').fill('password123');
      await page.locator('button:has-text("Sign In")').click();
      await page.waitForURL('/dashboard');
      await page.goto('/benefits');
    });

    test('should submit reimbursement claim', async ({ page }) => {
      await page.locator('text=Reimbursements').click();
      await page.locator('button:has-text("Submit Claim")').click();
      
      await page.locator('select[name="type"]').selectOption('Medical');
      await page.locator('input[name="amount"]').fill('5000');
      await page.locator('textarea[name="description"]').fill('Medical expenses for treatment');
      await page.locator('input[type="file"]').setInputFiles('test-files/receipt.pdf');
      
      await page.locator('button:has-text("Submit")').click();
      await expect(page.locator('text=Claim submitted successfully')).toBeVisible();
    });

    test('should display claim history', async ({ page }) => {
      await page.locator('text=Reimbursements').click();
      
      await expect(page.locator('table')).toBeVisible();
      await expect(page.locator('th:has-text("Type")')).toBeVisible();
      await expect(page.locator('th:has-text("Amount")')).toBeVisible();
      await expect(page.locator('th:has-text("Status")')).toBeVisible();
    });

    test('should approve claim as manager', async ({ page }) => {
      await page.goto('/logout');
      await page.goto('/login');
      await page.locator('input[type="email"]').fill('manager@example.com');
      await page.locator('input[type="password"]').fill('password123');
      await page.locator('button:has-text("Sign In")').click();
      await page.waitForURL('/dashboard');
      
      await page.goto('/benefits/reimbursements/approvals');
      const pendingRow = page.locator('tr:has-text("Pending")').first();
      await pendingRow.locator('button:has-text("Approve")').click();
      await page.locator('button:has-text("Confirm")').click();
      
      await expect(page.locator('text=Claim approved')).toBeVisible();
    });
  });

  test.describe('Rewards & Recognition', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/login');
      await page.locator('input[type="email"]').fill('manager@example.com');
      await page.locator('input[type="password"]').fill('password123');
      await page.locator('button:has-text("Sign In")').click();
      await page.waitForURL('/dashboard');
      await page.goto('/benefits');
    });

    test('should nominate employee for reward', async ({ page }) => {
      await page.locator('text=Rewards').click();
      await page.locator('button:has-text("Nominate")').click();
      
      await page.locator('select[name="employee"]').selectOption({ index: 0 });
      await page.locator('select[name="category"]').selectOption('Performance');
      await page.locator('textarea[name="reason"]').fill('Exceptional work on project delivery');
      
      await page.locator('button:has-text("Submit Nomination")').click();
      await expect(page.locator('text=Nomination submitted')).toBeVisible();
    });

    test('should display rewards history', async ({ page }) => {
      await page.locator('text=Rewards').click();
      
      await expect(page.locator('text=Recent Rewards')).toBeVisible();
      await expect(page.locator('table')).toBeVisible();
    });
  });

  test.describe('PF & Gratuity', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/login');
      await page.locator('input[type="email"]').fill('employee@example.com');
      await page.locator('input[type="password"]').fill('password123');
      await page.locator('button:has-text("Sign In")').click();
      await page.waitForURL('/dashboard');
      await page.goto('/benefits');
    });

    test('should display PF statement', async ({ page }) => {
      await page.locator('text=PF Statement').click();
      
      await expect(page.locator('text=Provident Fund')).toBeVisible();
      await expect(page.locator('text=Employee Contribution')).toBeVisible();
      await expect(page.locator('text=Employer Contribution')).toBeVisible();
      await expect(page.locator('text=Total Balance')).toBeVisible();
    });

    test('should calculate gratuity', async ({ page }) => {
      await page.locator('text=Gratuity').click();
      
      await expect(page.locator('text=Gratuity Calculator')).toBeVisible();
      await expect(page.locator('text=Years of Service')).toBeVisible();
      await expect(page.locator('text=Estimated Gratuity')).toBeVisible();
    });

    test('should download PF statement', async ({ page }) => {
      await page.locator('text=PF Statement').click();
      
      const downloadPromise = page.waitForEvent('download');
      await page.locator('button:has-text("Download Statement")').click();
      const download = await downloadPromise;
      
      expect(download.suggestedFilename()).toContain('pf-statement');
    });
  });
});
