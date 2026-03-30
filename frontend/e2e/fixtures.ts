import { test as base, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

/**
 * Playwright Test Fixtures
 * 
 * Custom fixtures and utilities for E2E testing.
 * Provides reusable test setup and helper functions.
 */

/**
 * Authenticated user fixture
 * Automatically logs in before each test
 */
export const test = base.extend<{
  authenticatedPage: Page;
  loginAsEmployee: (email?: string, password?: string) => Promise<void>;
  loginAsManager: (email?: string, password?: string) => Promise<void>;
  loginAsAdmin: (email?: string, password?: string) => Promise<void>;
}>({
  authenticatedPage: async ({ page }, use) => {
    // Login before test
    await page.goto('/login');
    await page.locator('input[type="email"]').fill('employee@example.com');
    await page.locator('input[type="password"]').fill('password123');
    await page.locator('button:has-text("Sign In")').click();
    await page.waitForURL('/dashboard');

    // Use page in test
    await use(page);

    // Cleanup after test
    await page.context().clearCookies();
  },

  loginAsEmployee: async ({ page }, use) => {
    const login = async (email = 'employee@example.com', password = 'password123') => {
      await page.goto('/login');
      await page.locator('input[type="email"]').fill(email);
      await page.locator('input[type="password"]').fill(password);
      await page.locator('button:has-text("Sign In")').click();
      await page.waitForURL('/dashboard');
    };
    await use(login);
  },

  loginAsManager: async ({ page }, use) => {
    const login = async (email = 'manager@example.com', password = 'password123') => {
      await page.goto('/login');
      await page.locator('input[type="email"]').fill(email);
      await page.locator('input[type="password"]').fill(password);
      await page.locator('button:has-text("Sign In")').click();
      await page.waitForURL('/dashboard');
    };
    await use(login);
  },

  loginAsAdmin: async ({ page }, use) => {
    const login = async (email = 'admin@example.com', password = 'password123') => {
      await page.goto('/login');
      await page.locator('input[type="email"]').fill(email);
      await page.locator('input[type="password"]').fill(password);
      await page.locator('button:has-text("Sign In")').click();
      await page.waitForURL('/dashboard');
    };
    await use(login);
  },
});

export { expect };

/**
 * Helper function to wait for API response
 */
export async function waitForApiResponse(
  page: Page,
  urlPattern: string | RegExp,
  timeout = 5000
) {
  return page.waitForResponse(
    (response) => {
      const url = response.url();
      if (typeof urlPattern === 'string') {
        return url.includes(urlPattern);
      }
      return urlPattern.test(url);
    },
    { timeout }
  );
}

/**
 * Helper function to fill form field
 */
export async function fillFormField(
  page: Page,
  label: string,
  value: string
) {
  const input = page.locator(`label:has-text("${label}") ~ input`);
  await input.fill(value);
}

/**
 * Helper function to select dropdown option
 */
export async function selectDropdownOption(
  page: Page,
  label: string,
  option: string
) {
  const select = page.locator(`label:has-text("${label}") ~ select`);
  await select.selectOption(option);
}

/**
 * Helper function to click button by text
 */
export async function clickButton(page: Page, text: string) {
  await page.locator(`button:has-text("${text}")`).click();
}

/**
 * Helper function to verify toast notification
 */
export async function expectToast(page: Page, message: string) {
  await expect(page.locator(`text=${message}`)).toBeVisible();
}

/**
 * Helper function to verify table row contains text
 */
export async function expectTableRowContains(
  page: Page,
  rowIndex: number,
  text: string
) {
  const row = page.locator('tbody tr').nth(rowIndex);
  await expect(row).toContainText(text);
}

/**
 * Helper function to get table cell value
 */
export async function getTableCellValue(
  page: Page,
  rowIndex: number,
  columnIndex: number
): Promise<string> {
  const cell = page.locator('tbody tr').nth(rowIndex).locator('td').nth(columnIndex);
  return cell.textContent() || '';
}

/**
 * Helper function to verify page title
 */
export async function expectPageTitle(page: Page, title: string) {
  await expect(page.locator(`h1:has-text("${title}")`)).toBeVisible();
}

/**
 * Helper function to verify element is disabled
 */
export async function expectElementDisabled(page: Page, selector: string) {
  const element = page.locator(selector);
  await expect(element).toBeDisabled();
}

/**
 * Helper function to verify element is enabled
 */
export async function expectElementEnabled(page: Page, selector: string) {
  const element = page.locator(selector);
  await expect(element).toBeEnabled();
}

/**
 * Helper function to scroll to element
 */
export async function scrollToElement(page: Page, selector: string) {
  await page.locator(selector).scrollIntoViewIfNeeded();
}

/**
 * Helper function to take screenshot
 */
export async function takeScreenshot(page: Page, name: string) {
  await page.screenshot({ path: `screenshots/${name}.png` });
}
