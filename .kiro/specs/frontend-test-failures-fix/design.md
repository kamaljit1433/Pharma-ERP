# Frontend Test Failures Fix - Bugfix Design

## Overview

This bugfix addresses 27 failing tests in the frontend test suite caused by seven distinct defect conditions: TypeScript ES2024 target incompatibility with esbuild, missing TensorFlow.js dependency, incorrect test assertions using `getByText` for duplicate elements in two test files, missing `GeolocationPositionError` mock in the jsdom environment, and Playwright E2E test files being incorrectly included in Vitest runs. The fix strategy involves downgrading the TypeScript target to ES2023, adding the missing TensorFlow.js dependency, refactoring test assertions to use `getAllByText` or scoped queries, adding the `GeolocationPositionError` mock to `setupTests.ts`, and configuring Vitest to exclude E2E test files.

## Glossary

- **Bug_Condition (C)**: The conditions that trigger test failures - ES2024 target, missing dependency, incorrect assertions, missing mocks, and incorrect test file inclusion
- **Property (P)**: The desired behavior - all 193 tests pass without warnings or errors
- **Preservation**: Existing test behavior for 166 passing tests and production code functionality must remain unchanged
- **esbuild**: The JavaScript bundler used by Vite that doesn't recognize ES2024 as a valid target
- **Testing Library**: React Testing Library used for component testing with query methods like `getByText` and `getAllByText`
- **jsdom**: JavaScript implementation of web standards used as the test environment for Vitest
- **GeolocationPositionError**: Browser API error class for geolocation failures, not available in jsdom by default
- **Vitest**: Vite-native testing framework configured in `vitest.config.ts`
- **Playwright**: E2E testing framework with test files in `e2e/` directory

## Bug Details

### Bug Condition

The test suite fails when running `npm test -- attendance` due to multiple independent issues that must all be resolved for the test suite to pass.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type TestExecutionContext
  OUTPUT: boolean
  
  RETURN (input.tsconfig.target == 'ES2024' AND input.bundler == 'esbuild')
         OR (input.testFile == 'AttendanceCheckIn.test.tsx' AND NOT dependencyExists('@tensorflow/tfjs'))
         OR (input.testFile == 'AttendanceMarker.test.tsx' AND usesGetByTextForDuplicates(input.assertions))
         OR (input.testFile == 'Attendance.test.tsx' AND usesGetByTextForDuplicates(input.assertions))
         OR (input.testFile == 'AttendanceMarker.test.tsx' AND usesGeolocationPositionError(input.code) AND NOT mockExists('GeolocationPositionError'))
         OR (input.testRunner == 'vitest' AND input.testFile.includes('e2e/') AND input.testFile.endsWith('.spec.ts'))
         OR (input.failedTests == 27 AND input.totalTests == 193)
END FUNCTION
```

### Examples

- **Defect 1 (TypeScript Target)**: When compiling `setupTests.ts`, esbuild displays warning "Unrecognized target environment 'ES2024'" because esbuild only supports up to ES2023
- **Defect 2 (Missing Dependency)**: When running `AttendanceCheckIn.test.tsx`, Vitest fails with "Failed to resolve import '@tensorflow/tfjs' from 'src/services/faceDetectionService.ts'"
- **Defect 3 (AttendanceMarker Assertions)**: When test executes `screen.getByText('Mark Attendance')`, it throws "TestingLibraryElementError: Found multiple elements with the text: Mark Attendance" because the text appears in both the button and dialog title
- **Defect 4 (Attendance Assertions)**: When test executes `screen.getByText('Present')`, it throws "TestingLibraryElementError: Found multiple elements with the text: Present" because the text appears in multiple status badges
- **Defect 5 (GeolocationPositionError)**: When test creates `new GeolocationPositionError()`, it throws ReferenceError because jsdom doesn't provide this browser API class
- **Defect 6 (E2E Test Inclusion)**: When running `npm test -- attendance`, Vitest attempts to execute `e2e/attendance.spec.ts` and fails with "Playwright Test did not expect test.describe() to be called here"
- **Defect 7 (Overall Failure)**: Test suite reports 27 failures out of 193 tests, preventing CI/CD pipeline progression

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- All 166 currently passing tests must continue to pass without modification
- Tests using `getByText` for unique elements must continue to use `getByText`
- Existing mock patterns in `setupTests.ts` for `window.matchMedia` and `scrollIntoView` must remain unchanged
- Playwright E2E tests must continue to execute successfully via `npm run test:e2e`
- Production code must continue to function identically (no code changes to components or services)
- TypeScript compilation for production builds must continue to produce valid JavaScript
- Dynamic TensorFlow.js imports in production code must continue to work at runtime

**Scope:**
All inputs that do NOT involve the seven defect conditions should be completely unaffected by this fix. This includes:
- Tests for components other than attendance
- Test assertions for unique text elements
- Production component rendering and behavior
- Build and deployment processes

## Hypothesized Root Cause

Based on the bug description and error messages, the root causes are:

1. **TypeScript ES2024 Target**: The `tsconfig.json` specifies `"target": "ES2024"`, but esbuild (used by Vite) only supports up to ES2023. This causes compilation warnings during test execution.

2. **Missing TensorFlow.js Dependency**: The `package.json` does not include `@tensorflow/tfjs` as a dependency, but `faceDetectionService.ts` dynamically imports it. During test execution, Vitest attempts to resolve the import and fails because the package is not installed.

3. **Incorrect Test Assertions in AttendanceMarker.test.tsx**: The test file uses `screen.getByText('Mark Attendance')` to query for elements, but this text appears in multiple places (button and dialog title). Testing Library's `getByText` throws an error when multiple elements match.

4. **Incorrect Test Assertions in Attendance.test.tsx**: The test file uses `screen.getByText('Present')` to query for status badges, but this text appears in multiple status indicators. Testing Library's `getByText` throws an error when multiple elements match.

5. **Missing GeolocationPositionError Mock**: The `AttendanceMarker.test.tsx` file creates instances of `GeolocationPositionError` to test geolocation error handling, but jsdom (the test environment) doesn't provide this browser API class by default.

6. **Vitest Including E2E Test Files**: The `vitest.config.ts` does not explicitly exclude Playwright E2E test files from execution. When running tests with filters like `attendance`, Vitest attempts to execute `e2e/attendance.spec.ts`, which uses Playwright's `test.describe()` API incompatible with Vitest.

7. **Cascading Failures**: The combination of these six issues causes 27 tests to fail, preventing the overall test suite from passing.

## Correctness Properties

Property 1: Bug Condition - All Test Failures Resolved

_For any_ test execution where any of the seven bug conditions hold (ES2024 target, missing dependency, incorrect assertions, missing mock, E2E file inclusion), the fixed test suite SHALL resolve all issues such that all 193 tests pass without errors or warnings.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7**

Property 2: Preservation - Existing Test Behavior

_For any_ test that is NOT affected by the seven bug conditions (166 currently passing tests), the fixed test suite SHALL produce exactly the same test results as before, preserving all existing test behavior and assertions.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7**

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct:

**File 1**: `frontend/tsconfig.json`

**Change**: Downgrade TypeScript target from ES2024 to ES2023

**Specific Changes**:
1. **Line 4**: Change `"target": "ES2024"` to `"target": "ES2023"`
2. **Line 5**: Change `"lib": ["ES2024", "DOM", "DOM.Iterable", "WebWorker"]` to `"lib": ["ES2023", "DOM", "DOM.Iterable", "WebWorker"]`

**Rationale**: esbuild (used by Vite) only supports up to ES2023. ES2023 includes all modern JavaScript features needed for the application.

---

**File 2**: `frontend/package.json`

**Change**: Add TensorFlow.js as a dependency

**Specific Changes**:
1. **dependencies section**: Add `"@tensorflow/tfjs": "^4.22"` to the dependencies object

**Rationale**: The `faceDetectionService.ts` dynamically imports TensorFlow.js, so it must be available as a dependency for tests to resolve the import. Using version 4.22 (latest stable as of 2026).

---

**File 3**: `frontend/src/components/attendance/__tests__/AttendanceMarker.test.tsx`

**Change**: Replace `getByText` with `getAllByText` or scoped queries for duplicate text

**Specific Changes**:
1. **Line 82** (Component Rendering > should open dialog when button is clicked):
   - Change `expect(screen.getByText('Mark Attendance')).toBeInTheDocument();`
   - To `expect(screen.getAllByText('Mark Attendance')[0]).toBeInTheDocument();`

2. **Lines 138, 156, 174, 192, 210, 228, 246** (Web Check-in Mode tests):
   - Change `expect(screen.getByText('Web Check-in')).toBeInTheDocument();`
   - To `expect(screen.getByRole('heading', { name: /Web Check-in/i })).toBeInTheDocument();`
   - Or use `within()` to scope queries to specific containers

3. **Lines 280, 298, 316, 334, 352, 370, 388, 406, 424, 442, 460** (GPS Check-in Mode tests):
   - Change `expect(screen.getByText('GPS Check-in')).toBeInTheDocument();`
   - To `expect(screen.getByRole('heading', { name: /GPS Check-in/i })).toBeInTheDocument();`

4. **Lines 478, 496** (Dialog State Management tests):
   - Use scoped queries or `getAllByText` for duplicate text elements

5. **Lines 382-385, 400-403, 418-421** (Geolocation error tests):
   - Keep the `GeolocationPositionError` usage as-is (will be fixed by setupTests.ts mock)

**Rationale**: Testing Library's `getByText` throws an error when multiple elements match. Using `getAllByText` returns an array of matches, or using role-based queries provides more semantic and unique selectors.

---

**File 4**: `frontend/src/pages/__tests__/Attendance.test.tsx`

**Change**: Replace `getByText` with `getAllByText` or scoped queries for duplicate text

**Specific Changes**:
1. **Line 75** (should display current status card with today's information):
   - Change `expect(screen.getByText('Present')).toBeInTheDocument();`
   - To `const statusBadges = screen.getAllByText('Present'); expect(statusBadges.length).toBeGreaterThan(0);`

2. **Line 127** (should display attendance statistics):
   - Change `expect(screen.getByText('18')).toBeInTheDocument();`
   - To `const presentDaysValues = screen.getAllByText('18'); expect(presentDaysValues.length).toBeGreaterThan(0);`

3. **Line 129** (should display attendance statistics):
   - Change `expect(screen.getByText('1')).toBeInTheDocument();`
   - To `const absentDaysValues = screen.getAllByText('1'); expect(absentDaysValues.length).toBeGreaterThan(0);`

4. **Line 131** (should display attendance statistics):
   - Change `expect(screen.getByText('2')).toBeInTheDocument();`
   - To `const lateArrivalsValues = screen.getAllByText('2'); expect(lateArrivalsValues.length).toBeGreaterThan(0);`

5. **Line 135** (should display Mark Attendance button):
   - Change `expect(screen.getByText('Mark Attendance')).toBeInTheDocument();`
   - To `expect(screen.getByRole('button', { name: /Mark Attendance/i })).toBeInTheDocument();`

6. **Lines 195, 213, 231** (status badge tests):
   - Use `getAllByText` or role-based queries for status text

7. **Line 262** (should display statistics with correct values):
   - Use `getAllByText` for numeric values that may appear multiple times

**Rationale**: Same as AttendanceMarker.test.tsx - avoid multiple element errors by using array queries or more specific selectors.

---

**File 5**: `frontend/src/setupTests.ts`

**Change**: Add `GeolocationPositionError` mock to jsdom environment

**Specific Changes**:
1. **After line 18** (after `Element.prototype.scrollIntoView` mock):
   - Add the following code:

```typescript
// Mock GeolocationPositionError for jsdom environment
class GeolocationPositionError extends Error {
  public code: number;
  public PERMISSION_DENIED: number = 1;
  public POSITION_UNAVAILABLE: number = 2;
  public TIMEOUT: number = 3;

  constructor(code?: number, message?: string) {
    super(message || 'Geolocation error');
    this.name = 'GeolocationPositionError';
    this.code = code || 0;
  }
}

// Add to global scope
(global as any).GeolocationPositionError = GeolocationPositionError;
```

**Rationale**: jsdom doesn't provide the `GeolocationPositionError` class that browsers have. Tests need this class to simulate geolocation errors.

---

**File 6**: `frontend/vitest.config.ts`

**Change**: Exclude Playwright E2E test files from Vitest execution

**Specific Changes**:
1. **In the `test` configuration object** (after line 7):
   - Add `exclude` property to the test configuration:

```typescript
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/e2e/**',
      '**/.{idea,git,cache,output,temp}/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/setupTests.ts',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
        'dist/',
        'e2e/',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@services': path.resolve(__dirname, './src/services'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@types': path.resolve(__dirname, './src/types'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@store': path.resolve(__dirname, './src/store'),
      '@routes': path.resolve(__dirname, './src/routes'),
    },
  },
});
```

**Rationale**: Vitest should only run unit and integration tests in `src/`, not E2E tests in `e2e/`. Playwright E2E tests use a different test runner and API.

---

**File 7**: `frontend/src/components/attendance/__tests__/AttendanceCheckIn.test.tsx`

**Change**: Replace Jest syntax with Vitest syntax

**Specific Changes**:
1. **Line 8**: Change `jest.mock` to `vi.mock`
2. **Line 10**: Change `jest.fn()` to `vi.fn()`
3. **Line 11**: Change `jest.fn()` to `vi.fn()`
4. **Line 12**: Change `jest.fn()` to `vi.fn()`
5. **Line 13**: Change `jest.fn()` to `vi.fn()`
6. **Line 14**: Change `jest.fn()` to `vi.fn()`
7. **Line 15**: Change `jest.fn()` to `vi.fn()`
8. **Line 20**: Change `jest.clearAllMocks()` to `vi.clearAllMocks()`
9. **Lines 35, 51, 67, 83**: Change `jest.fn()` to `vi.fn()`
10. **Lines 99, 115**: Change `global.fetch = jest.fn()` to `global.fetch = vi.fn()`
11. **Line 100**: Change `as jest.Mock` to `as any`

**Rationale**: The test file uses Jest syntax (`jest.mock`, `jest.fn()`) but the project uses Vitest. All Jest references must be replaced with Vitest equivalents (`vi.mock`, `vi.fn()`).

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, verify that the fixes resolve each specific defect condition, then verify that all 193 tests pass and the 166 previously passing tests remain unchanged.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate each bug BEFORE implementing the fix. Confirm or refute the root cause analysis for each defect condition.

**Test Plan**: Run `npm test -- attendance` on the UNFIXED code to observe all 27 failures and understand each root cause.

**Test Cases**:
1. **TypeScript Target Test**: Run tests and observe esbuild warnings about "Unrecognized target environment 'ES2024'" (will fail on unfixed code)
2. **Missing Dependency Test**: Run `AttendanceCheckIn.test.tsx` and observe "Failed to resolve import '@tensorflow/tfjs'" error (will fail on unfixed code)
3. **AttendanceMarker Assertions Test**: Run `AttendanceMarker.test.tsx` and observe "Found multiple elements with the text: Mark Attendance" errors (will fail on unfixed code)
4. **Attendance Assertions Test**: Run `Attendance.test.tsx` and observe "Found multiple elements with the text: Present" errors (will fail on unfixed code)
5. **GeolocationPositionError Test**: Run GPS check-in tests and observe ReferenceError for `GeolocationPositionError` (will fail on unfixed code)
6. **E2E Test Inclusion Test**: Run tests with `attendance` filter and observe "Playwright Test did not expect test.describe()" error (will fail on unfixed code)
7. **Overall Test Suite Test**: Verify 27 failures out of 193 tests (will fail on unfixed code)

**Expected Counterexamples**:
- esbuild warnings for ES2024 target
- Import resolution failures for TensorFlow.js
- Testing Library errors for multiple matching elements
- ReferenceError for GeolocationPositionError
- Playwright API incompatibility errors
- Test suite failure status

### Fix Checking

**Goal**: Verify that for all inputs where the bug conditions hold, the fixed test suite produces the expected behavior (all tests pass).

**Pseudocode:**
```
FOR ALL testExecution WHERE isBugCondition(testExecution) DO
  result := runTests_fixed(testExecution)
  ASSERT result.passedTests == 193
  ASSERT result.failedTests == 0
  ASSERT result.warnings == 0
END FOR
```

**Test Plan**: After applying all fixes, run `npm test -- attendance` and verify:
1. No esbuild warnings about ES2024
2. No import resolution errors for TensorFlow.js
3. No Testing Library errors for multiple elements
4. No ReferenceError for GeolocationPositionError
5. No Playwright API errors
6. All 193 tests pass
7. Test suite reports success status

### Preservation Checking

**Goal**: Verify that for all tests where the bug conditions do NOT hold, the fixed test suite produces the same results as the original test suite.

**Pseudocode:**
```
FOR ALL test WHERE NOT isBugCondition(test) DO
  ASSERT runTest_original(test) == runTest_fixed(test)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the test domain
- It catches edge cases that manual verification might miss
- It provides strong guarantees that behavior is unchanged for all non-buggy tests

**Test Plan**: Observe behavior on UNFIXED code first for passing tests, then verify they continue to pass after fix.

**Test Cases**:
1. **Non-Attendance Tests Preservation**: Run tests for other components (employee, leave, payroll) and verify they continue to pass
2. **Unique Element Assertions Preservation**: Verify tests using `getByText` for unique elements continue to work
3. **Existing Mock Preservation**: Verify `window.matchMedia` and `scrollIntoView` mocks continue to work
4. **Production Code Preservation**: Verify no changes to component or service code
5. **Build Process Preservation**: Verify `npm run build` continues to work
6. **E2E Test Preservation**: Verify `npm run test:e2e` continues to work with Playwright

### Unit Tests

- Test TypeScript compilation with ES2023 target
- Test TensorFlow.js import resolution in test environment
- Test Testing Library queries with `getAllByText` for duplicate elements
- Test GeolocationPositionError mock in jsdom environment
- Test Vitest exclude configuration for E2E files
- Test Vitest syntax in AttendanceCheckIn.test.tsx

### Property-Based Tests

- Generate random test file patterns and verify Vitest correctly includes/excludes them
- Generate random text content and verify Testing Library queries handle duplicates correctly
- Generate random geolocation error codes and verify mock handles them correctly

### Integration Tests

- Run full test suite with all fixes applied and verify 193 passing tests
- Run E2E tests separately with Playwright and verify they work independently
- Run production build and verify no compilation errors
- Run tests for non-attendance components and verify no regressions
