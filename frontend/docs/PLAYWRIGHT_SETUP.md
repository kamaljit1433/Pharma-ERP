# Playwright E2E Testing Setup Guide

This guide walks through the Playwright E2E testing setup for the Employee Management System.

## What Was Configured

### 1. Dependencies Added
- `@playwright/test@^1.48` - Playwright testing framework

### 2. NPM Scripts Added
```json
{
  "test:e2e": "playwright test",
  "test:e2e:ui": "playwright test --ui",
  "test:e2e:debug": "playwright test --debug",
  "test:e2e:headed": "playwright test --headed"
}
```

### 3. Configuration Files Created

#### `playwright.config.ts`
- Configures test execution for multiple browsers (Chromium, Firefox, WebKit)
- Includes mobile testing (Pixel 5, iPhone 12)
- Sets up reporters (HTML, JSON, JUnit)
- Configures screenshots and videos on failure
- Auto-starts dev server before tests

#### `e2e/` Directory
Test files organized by feature:
- `auth.spec.ts` - Authentication tests
- `employee.spec.ts` - Employee management tests
- `attendance.spec.ts` - Attendance tracking tests
- `fixtures.ts` - Custom test fixtures and helpers

#### `E2E_TESTING.md`
Comprehensive guide for writing and running E2E tests.

## Quick Start

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Start Backend (in separate terminal)
```bash
cd backend
npm run migrate:latest
npm run seed:run
npm run dev
```

### 3. Run Tests
```bash
cd frontend

# Run all tests (headless)
npm run test:e2e

# Run with UI (interactive)
npm run test:e2e:ui

# Run with visible browser
npm run test:e2e:headed

# Debug mode
npm run test:e2e:debug
```

## Test Files Overview

### `auth.spec.ts` - Authentication Tests
Tests login, logout, MFA, and session persistence:
- Display login form
- Validate empty credentials
- Validate invalid email format
- Show error for invalid credentials
- Successfully login with valid credentials
- Display MFA prompt when enabled
- Logout successfully
- Persist session on page reload

### `employee.spec.ts` - Employee Management Tests
Tests employee CRUD operations and search:
- Display employee list
- Search employees by name
- Filter employees by status
- Open employee detail page
- Open create employee form
- Validate required fields
- Create new employee
- Update employee information
- Add emergency contact
- Delete employee

### `attendance.spec.ts` - Attendance Tests
Tests check-in/check-out and attendance tracking:
- Display attendance page
- Show check-in button when not checked in
- Open check-in dialog
- Display attendance history
- Display monthly attendance summary
- Filter attendance by date range
- Open regularization request form
- Submit regularization request
- Display pending regularization requests
- Display shift information
- Display working hours calculation
- Display overtime information

## Test Fixtures

### Custom Fixtures (`fixtures.ts`)

#### `authenticatedPage`
Automatically logs in before test:
```typescript
test('should work with authenticated user', async ({ authenticatedPage }) => {
  await authenticatedPage.goto('/employees');
});
```

#### `loginAsEmployee`, `loginAsManager`, `loginAsAdmin`
Login with specific roles:
```typescript
test('should work as manager', async ({ loginAsManager, page }) => {
  await loginAsManager('manager@example.com', 'password123');
  await page.goto('/employees');
});
```

### Helper Functions

```typescript
// Wait for API response
await waitForApiResponse(page, '/api/employees');

// Fill form field
await fillFormField(page, 'Email', 'user@example.com');

// Select dropdown
await selectDropdownOption(page, 'Department', 'Engineering');

// Click button
await clickButton(page, 'Submit');

// Verify toast
await expectToast(page, 'Success');

// Verify table row
await expectTableRowContains(page, 0, 'John Doe');

// Get table cell value
const value = await getTableCellValue(page, 0, 1);

// Verify page title
await expectPageTitle(page, 'Employees');

// Scroll to element
await scrollToElement(page, 'text=Overtime');
```

## Running Tests

### Run All Tests
```bash
npm run test:e2e
```

### Run Specific Test File
```bash
npx playwright test e2e/auth.spec.ts
```

### Run Tests Matching Pattern
```bash
npx playwright test -g "should login"
```

### Run in Specific Browser
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Run on Mobile
```bash
npx playwright test --project="Mobile Chrome"
npx playwright test --project="Mobile Safari"
```

### Interactive UI Mode
```bash
npm run test:e2e:ui
```

### Debug Mode
```bash
npm run test:e2e:debug
```

### Headed Mode (Visible Browser)
```bash
npm run test:e2e:headed
```

## Test Reports

After running tests, view the HTML report:
```bash
npx playwright show-report
```

Reports include:
- Test results summary
- Pass/fail status for each test
- Screenshots of failures
- Videos of failures
- Execution time

## Debugging

### 1. Use `page.pause()`
Pause test execution to inspect state:
```typescript
test('debug test', async ({ page }) => {
  await page.goto('/employees');
  await page.pause(); // Pauses here, opens inspector
});
```

### 2. Use UI Mode
Interactive mode with step-by-step execution:
```bash
npm run test:e2e:ui
```

### 3. Use Debug Mode
Launches Playwright Inspector:
```bash
npm run test:e2e:debug
```

### 4. View Traces
Traces are recorded on first retry:
```bash
npx playwright show-trace test-results/trace.zip
```

### 5. Check Screenshots/Videos
Located in `test-results/` directory after failures.

## Test Data

Tests use seed data from backend. Ensure backend is seeded:

```bash
cd backend
npm run migrate:latest
npm run seed:run
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
test('test email', async ({ page }) => {
```

### 2. Wait Properly
```typescript
// Good - wait for element
await expect(page.locator('text=Success')).toBeVisible();

// Good - wait for navigation
await page.waitForURL('/dashboard');

// Avoid - arbitrary waits
await page.waitForTimeout(1000);
```

### 3. Use Specific Selectors
```typescript
// Good
page.locator('button:has-text("Submit")');
page.locator('input[type="email"]');

// Avoid
page.locator('div > div > button');
page.locator('.btn');
```

### 4. Test Complete Workflows
```typescript
test('should create and view employee', async ({ page }) => {
  // Create
  await page.goto('/employees');
  await page.locator('button:has-text("Add")').click();
  await fillFormField(page, 'Name', 'John Doe');
  await clickButton(page, 'Create');
  
  // Verify
  await expectToast(page, 'Success');
  await expect(page.locator('text=John Doe')).toBeVisible();
});
```

### 5. Use Fixtures for Setup
```typescript
test('should work with authenticated user', async ({ authenticatedPage }) => {
  // Already logged in
  await authenticatedPage.goto('/employees');
});
```

## CI/CD Integration

### GitHub Actions Example

Create `.github/workflows/e2e.yml`:

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
      
      - name: Install backend dependencies
        run: cd backend && npm install
      
      - name: Run migrations
        run: cd backend && npm run migrate:latest
      
      - name: Seed database
        run: cd backend && npm run seed:run
      
      - name: Start backend
        run: cd backend && npm run dev &
      
      - name: Install frontend dependencies
        run: cd frontend && npm install
      
      - name: Run E2E tests
        run: cd frontend && npm run test:e2e
      
      - name: Upload report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: frontend/playwright-report/
```

## Troubleshooting

### Tests Timeout
- Increase timeout in `playwright.config.ts`
- Check if backend is running
- Verify test data is seeded

### Element Not Found
- Use `page.pause()` to debug
- Check selectors in browser DevTools
- Verify page has loaded

### Flaky Tests
- Add proper waits instead of `waitForTimeout`
- Use `waitForURL` for navigation
- Use `expect(...).toBeVisible()` for elements

### Browser Crashes
- Update Playwright: `npm install @playwright/test@latest`
- Clear cache: `npx playwright clean`
- Run with `--headed` to see what's happening

## Next Steps

1. **Add more test coverage** - Add tests for Leave, Payroll, Benefits modules
2. **Create page objects** - Refactor tests to use Page Object Model for maintainability
3. **Add visual regression tests** - Use `toHaveScreenshot()` for UI consistency
4. **Set up CI/CD** - Integrate with GitHub Actions for automated testing
5. **Performance testing** - Add performance metrics collection
6. **Accessibility testing** - Add accessibility checks with `@axe-core/playwright`

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright Debugging](https://playwright.dev/docs/debug)
- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)
