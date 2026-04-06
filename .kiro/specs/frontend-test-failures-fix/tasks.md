# Implementation Plan

## Overview

This task list implements fixes for 27 failing frontend tests across 7 files. The fixes address TypeScript ES2024 target incompatibility, missing TensorFlow.js dependency, incorrect test assertions for duplicate elements, missing GeolocationPositionError mock, Playwright E2E test inclusion in Vitest runs, and Jest syntax in Vitest tests.

---

## Tasks

- [x] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - All Test Failures Resolved
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bugs exist
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate each of the 7 bugs exists
  - **Scoped PBT Approach**: For deterministic bugs, scope the property to the concrete failing cases to ensure reproducibility
  - Run `npm test -- attendance` on UNFIXED code
  - Verify TypeScript ES2024 target causes esbuild warning "Unrecognized target environment 'ES2024'"
  - Verify AttendanceCheckIn.test.tsx fails with "Failed to resolve import '@tensorflow/tfjs'"
  - Verify AttendanceMarker.test.tsx fails with "Found multiple elements with the text: Mark Attendance"
  - Verify Attendance.test.tsx fails with "Found multiple elements with the text: Present"
  - Verify AttendanceMarker.test.tsx GPS tests fail with ReferenceError for GeolocationPositionError
  - Verify Vitest attempts to run e2e/attendance.spec.ts and fails with "Playwright Test did not expect test.describe()"
  - Verify 27 tests fail out of 193 total tests
  - **EXPECTED OUTCOME**: Test run FAILS with 27 failures (this is correct - it proves the bugs exist)
  - Document all counterexamples found to understand root causes
  - Mark task complete when test is run and all 7 failures are documented
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Existing Test Behavior
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for non-buggy tests (166 currently passing tests)
  - Run tests for non-attendance components (employee, leave, payroll) and verify they pass
  - Verify tests using `getByText` for unique elements work correctly
  - Verify existing mocks in setupTests.ts (window.matchMedia, scrollIntoView) work correctly
  - Verify production code (components, services) functions correctly
  - Verify `npm run build` completes successfully
  - Verify `npm run test:e2e` runs Playwright tests successfully
  - Write property-based tests capturing observed behavior patterns from Preservation Requirements
  - Property-based testing generates many test cases for stronger guarantees
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

- [-] 3. Fix for frontend test failures

  - [x] 3.1 Downgrade TypeScript target from ES2024 to ES2023
    - Open `frontend/tsconfig.json`
    - Change line 4: `"target": "ES2024"` to `"target": "ES2023"`
    - Change line 5: `"lib": ["ES2024", "DOM", "DOM.Iterable", "WebWorker"]` to `"lib": ["ES2023", "DOM", "DOM.Iterable", "WebWorker"]`
    - Save file
    - _Bug_Condition: input.tsconfig.target == 'ES2024' AND input.bundler == 'esbuild'_
    - _Expected_Behavior: No esbuild warnings about unrecognized target environment_
    - _Preservation: TypeScript compilation for production builds continues to produce valid JavaScript_
    - _Requirements: 1.1, 2.1, 3.7_

  - [x] 3.2 Add TensorFlow.js dependency to package.json
    - Open `frontend/package.json`
    - Add `"@tensorflow/tfjs": "^4.22"` to the dependencies object (after existing dependencies)
    - Save file
    - Run `npm install` in frontend directory to install the dependency
    - _Bug_Condition: input.testFile == 'AttendanceCheckIn.test.tsx' AND NOT dependencyExists('@tensorflow/tfjs')_
    - _Expected_Behavior: Vitest successfully resolves @tensorflow/tfjs import_
    - _Preservation: Dynamic TensorFlow.js imports in production code continue to work at runtime_
    - _Requirements: 1.2, 2.2, 3.6_

  - [x] 3.3 Refactor AttendanceMarker.test.tsx assertions for duplicate elements
    - Open `frontend/src/components/attendance/__tests__/AttendanceMarker.test.tsx`
    - Line 82: Change `expect(screen.getByText('Mark Attendance')).toBeInTheDocument();` to `expect(screen.getAllByText('Mark Attendance')[0]).toBeInTheDocument();`
    - Lines 138, 156, 174, 192, 210, 228, 246 (Web Check-in tests): Change `expect(screen.getByText('Web Check-in')).toBeInTheDocument();` to `expect(screen.getByRole('heading', { name: /Web Check-in/i })).toBeInTheDocument();`
    - Lines 280, 298, 316, 334, 352, 370, 388, 406, 424, 442, 460 (GPS Check-in tests): Change `expect(screen.getByText('GPS Check-in')).toBeInTheDocument();` to `expect(screen.getByRole('heading', { name: /GPS Check-in/i })).toBeInTheDocument();`
    - Lines 478, 496 (Dialog State Management tests): Use scoped queries or `getAllByText` for duplicate text elements
    - Save file
    - _Bug_Condition: input.testFile == 'AttendanceMarker.test.tsx' AND usesGetByTextForDuplicates(input.assertions)_
    - _Expected_Behavior: No Testing Library errors for multiple matching elements_
    - _Preservation: Tests using getByText for unique elements continue to use getByText_
    - _Requirements: 1.3, 2.3, 3.3_

  - [x] 3.4 Refactor Attendance.test.tsx assertions for duplicate elements
    - Open `frontend/src/pages/__tests__/Attendance.test.tsx`
    - Line 75: Change `expect(screen.getByText('Present')).toBeInTheDocument();` to `const statusBadges = screen.getAllByText('Present'); expect(statusBadges.length).toBeGreaterThan(0);`
    - Line 127: Change `expect(screen.getByText('18')).toBeInTheDocument();` to `const presentDaysValues = screen.getAllByText('18'); expect(presentDaysValues.length).toBeGreaterThan(0);`
    - Line 129: Change `expect(screen.getByText('1')).toBeInTheDocument();` to `const absentDaysValues = screen.getAllByText('1'); expect(absentDaysValues.length).toBeGreaterThan(0);`
    - Line 131: Change `expect(screen.getByText('2')).toBeInTheDocument();` to `const lateArrivalsValues = screen.getAllByText('2'); expect(lateArrivalsValues.length).toBeGreaterThan(0);`
    - Line 135: Change `expect(screen.getByText('Mark Attendance')).toBeInTheDocument();` to `expect(screen.getByRole('button', { name: /Mark Attendance/i })).toBeInTheDocument();`
    - Lines 195, 213, 231 (status badge tests): Use `getAllByText` or role-based queries for status text
    - Line 262: Use `getAllByText` for numeric values that may appear multiple times
    - Save file
    - _Bug_Condition: input.testFile == 'Attendance.test.tsx' AND usesGetByTextForDuplicates(input.assertions)_
    - _Expected_Behavior: No Testing Library errors for multiple matching elements_
    - _Preservation: Tests using getByText for unique elements continue to use getByText_
    - _Requirements: 1.4, 2.4, 3.3_

  - [x] 3.5 Add GeolocationPositionError mock to setupTests.ts
    - Open `frontend/src/setupTests.ts`
    - After line 18 (after `Element.prototype.scrollIntoView` mock), add the following code:
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
    - Save file
    - _Bug_Condition: input.testFile == 'AttendanceMarker.test.tsx' AND usesGeolocationPositionError(input.code) AND NOT mockExists('GeolocationPositionError')_
    - _Expected_Behavior: No ReferenceError for GeolocationPositionError in tests_
    - _Preservation: Existing mock patterns in setupTests.ts continue to work_
    - _Requirements: 1.5, 2.5, 3.4_

  - [x] 3.6 Configure Vitest to exclude E2E test files
    - Open `frontend/vitest.config.ts`
    - In the `test` configuration object (after line 7), add `exclude` property:
    ```typescript
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/e2e/**',
      '**/.{idea,git,cache,output,temp}/**',
    ],
    ```
    - In the `coverage` configuration, add `'e2e/'` to the exclude array
    - Save file
    - _Bug_Condition: input.testRunner == 'vitest' AND input.testFile.includes('e2e/') AND input.testFile.endsWith('.spec.ts')_
    - _Expected_Behavior: Vitest does not attempt to run Playwright E2E test files_
    - _Preservation: Playwright E2E tests continue to execute successfully via npm run test:e2e_
    - _Requirements: 1.6, 2.6, 3.5_

  - [x] 3.7 Convert AttendanceCheckIn.test.tsx from Jest to Vitest syntax
    - Open `frontend/src/components/attendance/__tests__/AttendanceCheckIn.test.tsx`
    - Line 1: Add import: `import { describe, it, expect, beforeEach, vi } from 'vitest';`
    - Line 8: Change `jest.mock` to `vi.mock`
    - Lines 10-15: Change all `jest.fn()` to `vi.fn()`
    - Line 20: Change `jest.clearAllMocks()` to `vi.clearAllMocks()`
    - Lines 35, 51, 67, 83: Change `jest.fn()` to `vi.fn()`
    - Lines 99, 115: Change `global.fetch = jest.fn()` to `global.fetch = vi.fn()`
    - Line 100: Change `as jest.Mock` to `as any`
    - Remove any remaining Jest references
    - Save file
    - _Bug_Condition: Test file uses Jest syntax but project uses Vitest_
    - _Expected_Behavior: AttendanceCheckIn.test.tsx runs successfully with Vitest_
    - _Preservation: Test behavior and assertions remain unchanged_
    - _Requirements: 2.2, 3.1_

  - [x] 3.8 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - All Test Failures Resolved
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run `npm test -- attendance` on FIXED code
    - Verify no esbuild warnings about ES2024
    - Verify no import resolution errors for TensorFlow.js
    - Verify no Testing Library errors for multiple elements
    - Verify no ReferenceError for GeolocationPositionError
    - Verify no Playwright API errors
    - Verify all 193 tests pass
    - Verify test suite reports success status
    - **EXPECTED OUTCOME**: Test PASSES (confirms bugs are fixed)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

  - [ ] 3.9 Verify preservation tests still pass
    - **Property 2: Preservation** - Existing Test Behavior
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run tests for non-attendance components and verify they still pass
    - Verify tests using `getByText` for unique elements still work
    - Verify existing mocks in setupTests.ts still work
    - Verify production code still functions correctly
    - Verify `npm run build` still completes successfully
    - Verify `npm run test:e2e` still runs Playwright tests successfully
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all tests still pass after fix (no regressions)

- [ ] 4. Checkpoint - Ensure all tests pass
  - Run full test suite: `npm test`
  - Verify 193 tests pass with 0 failures
  - Verify no warnings or errors in test output
  - Verify production build works: `npm run build`
  - Verify E2E tests work: `npm run test:e2e`
  - If any issues arise, investigate and resolve before proceeding
  - Ask the user if questions arise

---

## Summary

This implementation plan fixes 27 failing tests by:
1. Downgrading TypeScript target to ES2023 (esbuild compatibility)
2. Adding @tensorflow/tfjs dependency (import resolution)
3. Refactoring test assertions to handle duplicate elements (Testing Library)
4. Adding GeolocationPositionError mock (jsdom environment)
5. Excluding E2E tests from Vitest runs (test runner separation)
6. Converting Jest syntax to Vitest syntax (test framework consistency)
7. Verifying all fixes work together to achieve 193 passing tests

The plan follows the bugfix workflow: explore bugs first, preserve existing behavior, implement fixes, and validate results.
