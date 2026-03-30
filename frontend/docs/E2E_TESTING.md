# E2E Testing with Playwright

This document describes the end-to-end (E2E) testing setup for the Employee Management System frontend using Playwright.

## Overview

Playwright is a modern E2E testing framework that supports multiple browsers (Chromium, Firefox, WebKit) and provides excellent debugging capabilities. It's configured to test the EMS PWA across desktop and mobile viewports.

## Installation

Playwright is already included in `package.json`. Install dependencies:

```bash
cd frontend
npm install
```

This will install Playwright and its browser binaries.

## Configuration

The Playwright configuration is defined in `playwright.config.ts`:

- **Test Directory**: `e2e/` - All test files are located here
- **Test Pattern**: `**/*.spec.ts` - Test files must end with `.spec.ts`
- **Base URL**: `http://localhost:5173` (configurable via `PLAYWRIGHT_TEST_BASE_URL`)
- **Browsers**: Chromium, Firefox, WebKit
- **Mobile**: Pixel 5 (Android), iPhone 12 (iOS)
- **Reporters**: HTML, JSON, JUnit XML, and console output
- **Screenshots**: Captured on test failure
- **Videos**: Recorded on test failure
- **Traces**: Recorded on first retry for debugging

## Running Tests

### Run all tests (headless)
```bash
npm run test:e2e
```

### Run tests in UI mode (interactive)
```bash
npm run test:e2e:ui
```

### Run tests in headed mode (visible browser)
```bash
npm run test:e2e:headed
```

### Debug tests
```bash
npm run test:e2e:debug
```

### Run specific test file
```bash
npx playwright test e2e/auth.spec.ts
```

### Run tests matching pattern
```bash
npx playwright test -g "should login"
```

### Run tests in specific browser
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Run tests on mobile
```bash
npx playwright test --project="Mobile Chrome"
npx playwright test --project="Mobile Safari"
```

## Test Structure

### Test Files

- **`auth.spec.ts`** - Authentication tests (login, logout, MFA)
- **`employee.spec.ts`** - Employee management tests (CRUD, search, filter)
- **`attendance.spec.ts`** - Attendance tests (check-in, history, regularization)

### Test Organization

Each test file follows this structure:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup before each test
  });

  test('should do something', async ({ page }) => {
    // Test implementation
  });
});
```

### Using Fixtures

Custom fixtures are provided in `fixtures.ts` for common test scenarios:

```typescript
import { test, expect } from './fixtures';

test('should work with authenticated user', async ({ authenticatedPage }) => {
  // authenticatedPage is already logged in
  await authenticatedPage.goto('/employees');
});

test('should login as manager', async ({ loginAsManager, page }) => {
  await loginAsManager('manager@example.com', 'password123');
  // Now logged in as manager
});
```

### Helper Functions

Common helper functions are available in `fixtures.ts`:

```typescript
import {
  waitForApiResponse,
  fillFormField,
  selectDropdownOption,
  clickButton,
  expectToast,
  expectTableRowContains,
  getTableCellValue,
  expectPageTitle,
  scrollToElement,
} from './fixtures';

// Usage examples
await fillFormField(page, 'Email', 'user@example.com');
await selectDropdownOption(page, 'Department', 'Engineering');
await clickButton(page, 'Submit');
await expectToast(page, 'Success');
await expectPageTitle(page, 'Employees');
```

## Test Data

Tests use seed data from the backend. Ensure the backend is running with test data:

```bash
cd backend
npm run migrate:latest
npm run seed:run
npm run dev
```

### Test Users

- **Employee**: `employee@example.com` / `password123`
- **Manager**: `manager@example.com` / `password123`
- **HR Manager**: `hr-manager@example.com` / `password123`
- **Admin**: `admin@example.com` / `password123`

## Best Practices

### 1. Use Meaningful Test Names
```typescript
// Good
test('should display validation error when email is invalid', async ({ page }) => {

// Bad
test('test email validation', async ({ page }) => {
```

### 2. Use Page Object Model (Optional)
For complex tests, create page objects:

```typescript
class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.page.locator('input[type="email"]').fill(email);
    await this.page.locator('input[type="password"]').fill(password);
    await this.page.locator('button:has-text("Sign In")').click();
  }
}
```

### 3. Wait for Elements Properly
```typescript
// Good - wait for element to be visible
await expect(page.locator('text=Success')).toBeVisible();

// Good - wait for navigation
await page.waitForURL('/dashboard');

// Avoid - arbitrary waits
await page.waitForTimeout(1000); // Only use as last resort
```

### 4. Use Specific Selectors
```typescript
// Good - specific and semantic
page.locator('button:has-text("Submit")');
page.locator('input[type="email"]');

// Avoid - fragile
page.locator('div > div > button');
page.locator('.btn-primary');
```

### 5. Test User Workflows
```typescript
// Good - tests complete workflow
test('should create and view employee', async ({ page }) => {
  await page.goto('/employees');
  await page.locator('button:has-text("Add")').click();
  // ... fill form ...
  await page.locator('button:has-text("Create")').click();
  await expect(page.locator('text=Success')).toBeVisible();
  // Verify employee appears in list
  await expect(page.locator('text=New Employee')).toBeVisible();
});
```

### 6. Handle Async Operations
```typescript
// Good - wait for response
const response = await waitForApiResponse(page, '/api/employees');

// Good - wait for navigation
await page.waitForURL('/employees');

// Good - wait for element
await expect(page.locator('text=Loaded')).toBeVisible();
```

## Debugging

### 1. Use Playwright Inspector
```bash
npm run test:e2e:debug
```

### 2. Use UI Mode
```bash
npm run test:e2e:ui
```

### 3. View Test Report
```bash
npx playwright show-report
```

### 4. Take Screenshots
```typescript
await page.screenshot({ path: 'screenshot.png' });
```

### 5. Record Video
Videos are automatically recorded on failure. Check `test-results/` directory.

### 6. View Traces
Traces are recorded on first retry. Open with:
```bash
npx playwright show-trace test-results/trace.zip
```

## CI/CD Integration

### GitHub Actions

Add to `.github/workflows/e2e.yml`:

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
      - run: cd frontend && npm install
      - run: cd backend && npm install && npm run migrate:latest && npm run seed:run
      - run: cd backend && npm run dev &
      - run: cd frontend && npm run test:e2e
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: frontend/playwright-report/
```

## Troubleshooting

### Tests timeout
- Increase timeout in `playwright.config.ts`
- Check if backend is running
- Verify test data is seeded

### Element not found
- Use `page.pause()` to debug
- Check element selectors in browser DevTools
- Verify page has loaded completely

### Flaky tests
- Add proper waits instead of `waitForTimeout`
- Use `waitForURL` for navigation
- Use `expect(...).toBeVisible()` for elements

### Browser crashes
- Update Playwright: `npm install @playwright/test@latest`
- Clear browser cache: `npx playwright clean`
- Run with `--headed` to see what's happening

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright Debugging](https://playwright.dev/docs/debug)
- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)

## Next Steps

1. **Add more test coverage** - Add tests for other modules (Leave, Payroll, etc.)
2. **Create page objects** - Refactor tests to use Page Object Model
3. **Add visual regression tests** - Use `toHaveScreenshot()`
4. **Set up CI/CD** - Integrate with GitHub Actions
5. **Performance testing** - Add performance metrics collection
