import { test, expect } from '@playwright/test';

/**
 * Employee Management E2E Tests
 * 
 * Tests for employee CRUD operations, search, and filtering.
 * These tests verify the employee module functionality.
 */

test.describe('Employee Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.locator('input[type="email"]').fill('hr-manager@example.com');
    await page.locator('input[type="password"]').fill('password123');
    await page.locator('button:has-text("Sign In")').click();

    // Wait for dashboard and navigate to employees
    await page.waitForURL('/dashboard');
    await page.goto('/employees');
  });

  test('should display employee list', async ({ page }) => {
    // Verify employee list page loads
    await expect(page.locator('text=Employees')).toBeVisible();
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('th:has-text("Employee ID")')).toBeVisible();
    await expect(page.locator('th:has-text("Name")')).toBeVisible();
    await expect(page.locator('th:has-text("Status")')).toBeVisible();
  });

  test('should search employees by name', async ({ page }) => {
    // Enter search term
    await page.locator('input[placeholder="Search employees..."]').fill('John');

    // Wait for results to filter
    await page.waitForTimeout(500);

    // Verify filtered results
    const rows = page.locator('tbody tr');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);

    // Verify all results contain "John"
    for (let i = 0; i < count; i++) {
      const text = await rows.nth(i).textContent();
      expect(text).toContain('John');
    }
  });

  test('should filter employees by status', async ({ page }) => {
    // Click status filter
    await page.locator('button:has-text("Status")').click();

    // Select "Active" status
    await page.locator('text=Active').click();

    // Wait for results to filter
    await page.waitForTimeout(500);

    // Verify all visible rows show "Active" status
    const statusBadges = page.locator('text=Active');
    const count = await statusBadges.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should open employee detail page', async ({ page }) => {
    // Click first employee row
    await page.locator('tbody tr').first().click();

    // Verify detail page loads
    await page.waitForURL(/\/employees\/\d+/);
    await expect(page.locator('text=Employee Details')).toBeVisible();
    await expect(page.locator('text=Personal Information')).toBeVisible();
    await expect(page.locator('text=Employment History')).toBeVisible();
  });

  test('should open create employee form', async ({ page }) => {
    // Click "Add Employee" button
    await page.locator('button:has-text("Add Employee")').click();

    // Verify form opens
    await expect(page.locator('text=Create New Employee')).toBeVisible();
    await expect(page.locator('input[placeholder="First Name"]')).toBeVisible();
    await expect(page.locator('input[placeholder="Last Name"]')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test('should validate required fields in employee form', async ({ page }) => {
    // Click "Add Employee" button
    await page.locator('button:has-text("Add Employee")').click();

    // Try to submit empty form
    await page.locator('button:has-text("Create")').click();

    // Verify validation errors
    await expect(page.locator('text=First name is required')).toBeVisible();
    await expect(page.locator('text=Last name is required')).toBeVisible();
    await expect(page.locator('text=Email is required')).toBeVisible();
  });

  test('should create new employee', async ({ page }) => {
    // Click "Add Employee" button
    await page.locator('button:has-text("Add Employee")').click();

    // Fill form
    await page.locator('input[placeholder="First Name"]').fill('Jane');
    await page.locator('input[placeholder="Last Name"]').fill('Doe');
    await page.locator('input[type="email"]').fill('jane.doe@example.com');
    await page.locator('input[placeholder="Employee ID"]').fill('EMP999');

    // Select department
    await page.locator('select[name="department"]').selectOption('Engineering');

    // Submit form
    await page.locator('button:has-text("Create")').click();

    // Verify success message
    await expect(page.locator('text=Employee created successfully')).toBeVisible();

    // Verify redirect to employee list
    await page.waitForURL('/employees');
  });

  test('should update employee information', async ({ page }) => {
    // Click first employee row
    await page.locator('tbody tr').first().click();

    // Wait for detail page
    await page.waitForURL(/\/employees\/\d+/);

    // Click edit button
    await page.locator('button:has-text("Edit")').click();

    // Verify form is editable
    const firstNameInput = page.locator('input[placeholder="First Name"]');
    await expect(firstNameInput).toBeEnabled();

    // Update name
    await firstNameInput.clear();
    await firstNameInput.fill('Updated Name');

    // Submit form
    await page.locator('button:has-text("Save")').click();

    // Verify success message
    await expect(page.locator('text=Employee updated successfully')).toBeVisible();
  });

  test('should add emergency contact', async ({ page }) => {
    // Click first employee row
    await page.locator('tbody tr').first().click();

    // Wait for detail page
    await page.waitForURL(/\/employees\/\d+/);

    // Scroll to emergency contacts section
    await page.locator('text=Emergency Contacts').scrollIntoViewIfNeeded();

    // Click "Add Contact" button
    await page.locator('button:has-text("Add Contact")').click();

    // Fill contact form
    await page.locator('input[placeholder="Contact Name"]').fill('Emergency Contact');
    await page.locator('input[placeholder="Phone"]').fill('+1234567890');
    await page.locator('input[placeholder="Relationship"]').fill('Spouse');

    // Submit form
    await page.locator('button:has-text("Add")').click();

    // Verify success message
    await expect(page.locator('text=Contact added successfully')).toBeVisible();
  });

  test('should delete employee', async ({ page }) => {
    // Click first employee row
    await page.locator('tbody tr').first().click();

    // Wait for detail page
    await page.waitForURL(/\/employees\/\d+/);

    // Click delete button
    await page.locator('button:has-text("Delete")').click();

    // Confirm deletion in dialog
    await page.locator('button:has-text("Confirm Delete")').click();

    // Verify success message
    await expect(page.locator('text=Employee deleted successfully')).toBeVisible();

    // Verify redirect to employee list
    await page.waitForURL('/employees');
  });
});
