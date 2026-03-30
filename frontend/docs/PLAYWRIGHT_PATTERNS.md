# Playwright Common Patterns & Examples

Quick reference for common testing patterns used in the EMS E2E tests.

## Navigation & Page Interaction

### Navigate to Page
```typescript
await page.goto('/employees');
await page.goto('/login');
```

### Wait for Navigation
```typescript
await page.waitForURL('/dashboard');
await page.waitForURL(/\/employees\/\d+/);
```

### Go Back
```typescript
await page.goBack();
```

### Reload Page
```typescript
await page.reload();
```

## Locators & Selectors

### By Text
```typescript
page.locator('text=Submit');
page.locator('button:has-text("Submit")');
page.locator('text=/Submit|Save/'); // Regex
```

### By Input Type
```typescript
page.locator('input[type="email"]');
page.locator('input[type="password"]');
page.locator('input[placeholder="Search..."]');
```

### By Label
```typescript
page.locator('label:has-text("Email") ~ input');
page.locator('label:has-text("Department") ~ select');
```

### By Role
```typescript
page.locator('button[role="button"]');
page.locator('link[role="link"]');
page.locator('table[role="table"]');
```

### By Data Attribute
```typescript
page.locator('[data-testid="submit-button"]');
page.locator('[data-cy="employee-list"]');
```

### Combining Selectors
```typescript
page.locator('form').locator('input[type="email"]');
page.locator('tbody tr').first();
page.locator('tbody tr').nth(2);
page.locator('tbody tr').last();
```

## Filling Forms

### Text Input
```typescript
await page.locator('input[type="email"]').fill('user@example.com');
```

### Clear and Fill
```typescript
await page.locator('input').clear();
await page.locator('input').fill('new value');
```

### Type Character by Character
```typescript
await page.locator('input').type('slow typing');
```

### Textarea
```typescript
await page.locator('textarea').fill('Multi-line\ntext');
```

### Select Dropdown
```typescript
await page.locator('select').selectOption('option-value');
await page.locator('select').selectOption({ label: 'Option Label' });
```

### Checkbox
```typescript
await page.locator('input[type="checkbox"]').check();
await page.locator('input[type="checkbox"]').uncheck();
await page.locator('input[type="checkbox"]').setChecked(true);
```

### Radio Button
```typescript
await page.locator('input[type="radio"][value="option1"]').check();
```

### Date Input
```typescript
await page.locator('input[type="date"]').fill('2026-03-20');
```

## Clicking & Interactions

### Click Button
```typescript
await page.locator('button:has-text("Submit")').click();
```

### Double Click
```typescript
await page.locator('element').dblclick();
```

### Right Click
```typescript
await page.locator('element').click({ button: 'right' });
```

### Hover
```typescript
await page.locator('element').hover();
```

### Focus
```typescript
await page.locator('input').focus();
```

### Keyboard Actions
```typescript
await page.locator('input').press('Enter');
await page.locator('input').press('Tab');
await page.locator('input').press('Escape');
await page.keyboard.press('Control+A');
```

## Assertions

### Element Visibility
```typescript
await expect(page.locator('text=Success')).toBeVisible();
await expect(page.locator('text=Error')).not.toBeVisible();
```

### Element Enabled/Disabled
```typescript
await expect(page.locator('button')).toBeEnabled();
await expect(page.locator('button')).toBeDisabled();
```

### Element Checked
```typescript
await expect(page.locator('input[type="checkbox"]')).toBeChecked();
await expect(page.locator('input[type="checkbox"]')).not.toBeChecked();
```

### Text Content
```typescript
await expect(page.locator('h1')).toContainText('Employees');
await expect(page.locator('h1')).toHaveText('Employees');
```

### Input Value
```typescript
await expect(page.locator('input[type="email"]')).toHaveValue('user@example.com');
```

### Element Count
```typescript
await expect(page.locator('tbody tr')).toHaveCount(10);
```

### URL
```typescript
await expect(page).toHaveURL('/employees');
await expect(page).toHaveURL(/\/employees\/\d+/);
```

### Page Title
```typescript
await expect(page).toHaveTitle('Employees - EMS');
```

### Attribute
```typescript
await expect(page.locator('button')).toHaveAttribute('aria-label', 'Submit');
```

### CSS Class
```typescript
await expect(page.locator('div')).toHaveClass('active');
```

## Waiting

### Wait for Element
```typescript
await page.locator('text=Loaded').waitFor();
await page.locator('text=Loaded').waitFor({ state: 'visible' });
await page.locator('text=Loaded').waitFor({ state: 'hidden' });
```

### Wait for Navigation
```typescript
await page.waitForURL('/dashboard');
```

### Wait for Function
```typescript
await page.waitForFunction(() => document.querySelectorAll('tr').length > 0);
```

### Wait for Timeout
```typescript
await page.waitForTimeout(1000); // Only use as last resort
```

### Wait for API Response
```typescript
const response = await page.waitForResponse(
  response => response.url().includes('/api/employees')
);
```

### Wait for Request
```typescript
const request = await page.waitForRequest(
  request => request.url().includes('/api/employees')
);
```

## Tables

### Get Row Count
```typescript
const rows = page.locator('tbody tr');
const count = await rows.count();
```

### Get Cell Value
```typescript
const cell = page.locator('tbody tr').nth(0).locator('td').nth(1);
const value = await cell.textContent();
```

### Click Row
```typescript
await page.locator('tbody tr').nth(0).click();
```

### Get All Row Texts
```typescript
const rows = page.locator('tbody tr');
for (let i = 0; i < await rows.count(); i++) {
  const text = await rows.nth(i).textContent();
  console.log(text);
}
```

## Dialogs & Modals

### Handle Alert
```typescript
page.once('dialog', dialog => {
  console.log(dialog.message());
  dialog.accept();
});
await page.locator('button:has-text("Delete")').click();
```

### Wait for Dialog
```typescript
const dialogPromise = page.waitForEvent('dialog');
await page.locator('button:has-text("Delete")').click();
const dialog = await dialogPromise;
await dialog.accept();
```

## File Upload

### Upload File
```typescript
await page.locator('input[type="file"]').setInputFiles('path/to/file.pdf');
```

### Upload Multiple Files
```typescript
await page.locator('input[type="file"]').setInputFiles([
  'file1.pdf',
  'file2.pdf'
]);
```

## Screenshots & Videos

### Take Screenshot
```typescript
await page.screenshot({ path: 'screenshot.png' });
```

### Screenshot of Element
```typescript
await page.locator('button').screenshot({ path: 'button.png' });
```

## Debugging

### Pause Execution
```typescript
await page.pause(); // Opens inspector
```

### Log to Console
```typescript
console.log('Debug info:', await page.locator('h1').textContent());
```

### Get Page Content
```typescript
const content = await page.content();
console.log(content);
```

### Get Page URL
```typescript
const url = page.url();
console.log(url);
```

## Authentication

### Login Helper
```typescript
async function login(page, email, password) {
  await page.goto('/login');
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.locator('button:has-text("Sign In")').click();
  await page.waitForURL('/dashboard');
}
```

### Using Fixtures
```typescript
import { test } from './fixtures';

test('should work with authenticated user', async ({ authenticatedPage }) => {
  await authenticatedPage.goto('/employees');
});
```

## Common Test Patterns

### Test Form Submission
```typescript
test('should submit form', async ({ page }) => {
  await page.goto('/form');
  await page.locator('input[name="email"]').fill('user@example.com');
  await page.locator('input[name="password"]').fill('password');
  await page.locator('button:has-text("Submit")').click();
  await expect(page.locator('text=Success')).toBeVisible();
});
```

### Test Search/Filter
```typescript
test('should filter results', async ({ page }) => {
  await page.goto('/employees');
  await page.locator('input[placeholder="Search"]').fill('John');
  await page.waitForTimeout(500); // Wait for filter
  const rows = page.locator('tbody tr');
  const count = await rows.count();
  expect(count).toBeGreaterThan(0);
});
```

### Test CRUD Operations
```typescript
test('should create, read, update, delete', async ({ page }) => {
  // Create
  await page.goto('/employees');
  await page.locator('button:has-text("Add")').click();
  await page.locator('input[name="name"]').fill('John Doe');
  await page.locator('button:has-text("Create")').click();
  
  // Read
  await expect(page.locator('text=John Doe')).toBeVisible();
  
  // Update
  await page.locator('text=John Doe').click();
  await page.locator('button:has-text("Edit")').click();
  await page.locator('input[name="name"]').clear();
  await page.locator('input[name="name"]').fill('Jane Doe');
  await page.locator('button:has-text("Save")').click();
  
  // Delete
  await page.locator('button:has-text("Delete")').click();
  await page.locator('button:has-text("Confirm")').click();
  await expect(page.locator('text=Jane Doe')).not.toBeVisible();
});
```

### Test Pagination
```typescript
test('should navigate pages', async ({ page }) => {
  await page.goto('/employees');
  
  // Go to next page
  await page.locator('button:has-text("Next")').click();
  await page.waitForTimeout(500);
  
  // Verify page changed
  const url = page.url();
  expect(url).toContain('page=2');
});
```

### Test Sorting
```typescript
test('should sort table', async ({ page }) => {
  await page.goto('/employees');
  
  // Click sort header
  await page.locator('th:has-text("Name")').click();
  
  // Verify sort applied
  const firstRow = page.locator('tbody tr').first();
  const firstName = await firstRow.locator('td').nth(1).textContent();
  expect(firstName).toBeTruthy();
});
```

## Performance Tips

### Reuse Page
```typescript
// Good - reuse page across tests
test.beforeEach(async ({ page }) => {
  await page.goto('/login');
  // ... login ...
});

// Bad - create new page for each action
test('should do something', async ({ page }) => {
  const page2 = await context.newPage();
  // ...
});
```

### Use Specific Waits
```typescript
// Good - specific wait
await page.waitForURL('/dashboard');

// Bad - arbitrary wait
await page.waitForTimeout(5000);
```

### Parallel Tests
```typescript
// Tests run in parallel by default
test('test 1', async ({ page }) => { });
test('test 2', async ({ page }) => { });

// Disable parallelization for specific test
test.describe.serial('serial tests', () => {
  test('test 1', async ({ page }) => { });
  test('test 2', async ({ page }) => { });
});
```

## Resources

- [Playwright Locators](https://playwright.dev/docs/locators)
- [Playwright Assertions](https://playwright.dev/docs/test-assertions)
- [Playwright Actions](https://playwright.dev/docs/api/class-page)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
