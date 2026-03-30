# Playwright E2E Testing Checklist

Use this checklist when writing new E2E tests or running existing tests.

## Before Running Tests

- [ ] Backend is running (`npm run dev` in backend directory)
- [ ] Database is migrated (`npm run migrate:latest`)
- [ ] Database is seeded (`npm run seed:run`)
- [ ] Frontend dependencies installed (`npm install`)
- [ ] No other process running on port 5173 (Vite dev server)
- [ ] No other process running on port 3000 (Backend API)

## Running Tests

### First Time Setup
- [ ] Install Playwright browsers: `npx playwright install`
- [ ] Run tests once to verify setup: `npm run test:e2e`
- [ ] Check test report: `npx playwright show-report`

### Regular Test Runs
- [ ] Run all tests: `npm run test:e2e`
- [ ] Check for failures in console output
- [ ] Review any screenshots in `test-results/`
- [ ] Review any videos in `test-results/`

### Debugging Failed Tests
- [ ] Run in UI mode: `npm run test:e2e:ui`
- [ ] Run in debug mode: `npm run test:e2e:debug`
- [ ] Run with headed browser: `npm run test:e2e:headed`
- [ ] Check screenshots in `test-results/`
- [ ] Check videos in `test-results/`
- [ ] View trace: `npx playwright show-trace test-results/trace.zip`

## Writing New Tests

### Test Structure
- [ ] Test file ends with `.spec.ts`
- [ ] Test file is in `e2e/` directory
- [ ] Test has descriptive name
- [ ] Test has `test.describe()` block for grouping
- [ ] Test has `test.beforeEach()` for setup
- [ ] Test has `test.afterEach()` for cleanup (if needed)

### Test Content
- [ ] Test navigates to correct page
- [ ] Test fills forms with valid data
- [ ] Test verifies success messages
- [ ] Test verifies error messages
- [ ] Test verifies page navigation
- [ ] Test verifies element visibility
- [ ] Test uses proper waits (not `waitForTimeout`)
- [ ] Test uses specific selectors
- [ ] Test is independent (doesn't depend on other tests)
- [ ] Test cleans up after itself

### Selectors
- [ ] Use `button:has-text("text")` for buttons
- [ ] Use `input[type="email"]` for email inputs
- [ ] Use `input[placeholder="text"]` for inputs with placeholder
- [ ] Use `label:has-text("text") ~ input` for labeled inputs
- [ ] Use `text=` for text content
- [ ] Avoid class selectors (`.btn`, `.primary`)
- [ ] Avoid ID selectors unless necessary
- [ ] Avoid XPath selectors

### Assertions
- [ ] Use `expect(...).toBeVisible()` for visibility
- [ ] Use `expect(...).toContainText()` for text content
- [ ] Use `expect(...).toHaveValue()` for input values
- [ ] Use `expect(...).toBeEnabled()` for enabled state
- [ ] Use `expect(...).toBeChecked()` for checkbox state
- [ ] Use `expect(page).toHaveURL()` for URL verification
- [ ] Use `expect(...).toHaveCount()` for element count

### Waits
- [ ] Use `page.waitForURL()` for navigation
- [ ] Use `expect(...).toBeVisible()` for elements
- [ ] Use `waitForApiResponse()` for API calls
- [ ] Avoid `page.waitForTimeout()` unless necessary
- [ ] Set reasonable timeouts (5000ms default)

### Test Data
- [ ] Use test users from seed data
- [ ] Use realistic data values
- [ ] Don't hardcode IDs (use selectors instead)
- [ ] Clean up created data if needed

## Code Quality

### TypeScript
- [ ] No `any` types
- [ ] All functions have return types
- [ ] All parameters have types
- [ ] No unused variables

### Naming
- [ ] Test names are descriptive
- [ ] Variable names are clear
- [ ] Function names follow camelCase
- [ ] Constants follow UPPER_SNAKE_CASE

### Organization
- [ ] Related tests are grouped in `describe` blocks
- [ ] Setup code is in `beforeEach`
- [ ] Cleanup code is in `afterEach`
- [ ] Helper functions are in `fixtures.ts`
- [ ] No duplicate code

### Comments
- [ ] Complex logic has comments
- [ ] Test purpose is clear from name (minimal comments needed)
- [ ] No commented-out code

## Performance

### Test Speed
- [ ] Tests complete in reasonable time (< 30s each)
- [ ] No unnecessary waits
- [ ] No `waitForTimeout` unless necessary
- [ ] Parallel tests are enabled

### Resource Usage
- [ ] Tests don't create excessive data
- [ ] Tests clean up after themselves
- [ ] No memory leaks
- [ ] Browser cache is cleared between tests

## Maintenance

### Updating Tests
- [ ] Update test when UI changes
- [ ] Update selectors if elements change
- [ ] Update assertions if behavior changes
- [ ] Add new tests for new features
- [ ] Remove tests for removed features

### Debugging
- [ ] Use `page.pause()` to inspect state
- [ ] Use `console.log()` for debugging
- [ ] Use UI mode for interactive debugging
- [ ] Use debug mode with Inspector
- [ ] Check screenshots/videos on failure

## CI/CD

### Before Committing
- [ ] All tests pass locally
- [ ] No console errors
- [ ] No flaky tests
- [ ] Code is formatted: `npm run format`
- [ ] Code is linted: `npm run lint`

### GitHub Actions
- [ ] Workflow file exists: `.github/workflows/e2e.yml`
- [ ] Workflow runs on push and PR
- [ ] Workflow uploads test reports
- [ ] Workflow uploads screenshots/videos
- [ ] Workflow fails on test failure

## Documentation

### Test Files
- [ ] Test file has header comment
- [ ] Test file describes what it tests
- [ ] Each test has clear name
- [ ] Complex tests have inline comments

### Helper Functions
- [ ] Helper functions have JSDoc comments
- [ ] Helper functions have clear names
- [ ] Helper functions are reusable
- [ ] Helper functions are in `fixtures.ts`

### README
- [ ] `E2E_TESTING.md` is up to date
- [ ] `PLAYWRIGHT_SETUP.md` is up to date
- [ ] `PLAYWRIGHT_PATTERNS.md` has examples
- [ ] `PLAYWRIGHT_IMPLEMENTATION_SUMMARY.md` is current

## Troubleshooting

### Common Issues
- [ ] Check if backend is running
- [ ] Check if database is seeded
- [ ] Check if port 5173 is available
- [ ] Check if port 3000 is available
- [ ] Check browser cache: `npx playwright clean`
- [ ] Update Playwright: `npm install @playwright/test@latest`

### Test Failures
- [ ] Run in UI mode to see what's happening
- [ ] Check screenshots in `test-results/`
- [ ] Check videos in `test-results/`
- [ ] Run with `--headed` to see browser
- [ ] Use `page.pause()` to inspect state

### Flaky Tests
- [ ] Replace `waitForTimeout` with proper waits
- [ ] Add `waitForURL` for navigation
- [ ] Add `expect(...).toBeVisible()` for elements
- [ ] Increase timeout if needed
- [ ] Check for race conditions

## Resources

- [ ] Read `E2E_TESTING.md` for comprehensive guide
- [ ] Read `PLAYWRIGHT_SETUP.md` for quick start
- [ ] Read `PLAYWRIGHT_PATTERNS.md` for code examples
- [ ] Check existing test files for examples
- [ ] Review Playwright documentation
- [ ] Check Playwright best practices

## Sign-Off

- [ ] All tests pass
- [ ] Code is reviewed
- [ ] Documentation is updated
- [ ] Ready for merge

---

**Last Updated**: 2026-03-20
**Playwright Version**: 1.48+
**Node Version**: 22 LTS
