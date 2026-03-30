import { test, expect } from '@playwright/test';

/**
 * Authentication E2E Tests
 * 
 * Tests for user login, logout, and authentication flows.
 * These tests verify that authentication works correctly across the application.
 */

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page before each test
    await page.goto('/login');
  });

  test('should display login form', async ({ page }) => {
    // Verify login page elements are visible
    await expect(page.locator('text=Login')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button:has-text("Sign In")')).toBeVisible();
  });

  test('should show validation error for empty credentials', async ({ page }) => {
    // Click submit without entering credentials
    await page.locator('button:has-text("Sign In")').click();

    // Verify error messages appear
    await expect(page.locator('text=Email is required')).toBeVisible();
    await expect(page.locator('text=Password is required')).toBeVisible();
  });

  test('should show validation error for invalid email', async ({ page }) => {
    // Enter invalid email
    await page.locator('input[type="email"]').fill('invalid-email');
    await page.locator('input[type="password"]').fill('password123');

    // Click submit
    await page.locator('button:has-text("Sign In")').click();

    // Verify error message
    await expect(page.locator('text=Please enter a valid email')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    // Enter invalid credentials
    await page.locator('input[type="email"]').fill('nonexistent@example.com');
    await page.locator('input[type="password"]').fill('wrongpassword');

    // Click submit
    await page.locator('button:has-text("Sign In")').click();

    // Wait for error message
    await expect(page.locator('text=Invalid email or password')).toBeVisible();
  });

  test('should successfully login with valid credentials', async ({ page }) => {
    // Enter valid credentials (use test user from seed data)
    await page.locator('input[type="email"]').fill('employee@example.com');
    await page.locator('input[type="password"]').fill('password123');

    // Click submit
    await page.locator('button:has-text("Sign In")').click();

    // Wait for redirect to dashboard
    await page.waitForURL('/dashboard');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should display MFA prompt when enabled', async ({ page }) => {
    // Enter credentials for user with MFA enabled
    await page.locator('input[type="email"]').fill('mfa-user@example.com');
    await page.locator('input[type="password"]').fill('password123');

    // Click submit
    await page.locator('button:has-text("Sign In")').click();

    // Verify MFA prompt appears
    await expect(page.locator('text=Enter your authentication code')).toBeVisible();
    await expect(page.locator('input[placeholder="000000"]')).toBeVisible();
  });

  test('should logout successfully', async ({ page, context }) => {
    // Login first
    await page.locator('input[type="email"]').fill('employee@example.com');
    await page.locator('input[type="password"]').fill('password123');
    await page.locator('button:has-text("Sign In")').click();

    // Wait for dashboard
    await page.waitForURL('/dashboard');

    // Click user menu
    await page.locator('button[aria-label="User menu"]').click();

    // Click logout
    await page.locator('text=Logout').click();

    // Verify redirect to login
    await page.waitForURL('/login');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should persist session on page reload', async ({ page }) => {
    // Login
    await page.locator('input[type="email"]').fill('employee@example.com');
    await page.locator('input[type="password"]').fill('password123');
    await page.locator('button:has-text("Sign In")').click();

    // Wait for dashboard
    await page.waitForURL('/dashboard');

    // Reload page
    await page.reload();

    // Verify still on dashboard (session persisted)
    await expect(page).toHaveURL(/\/dashboard/);
  });
});
