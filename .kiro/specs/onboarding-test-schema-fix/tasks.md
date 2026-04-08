# Implementation Plan

- [x] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - Test Schema Missing Required Columns
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists
  - **Scoped PBT Approach**: Scope the property to concrete failing cases - test operations that require title, description, and updated_at columns
  - Test that createChecklist() operations fail with SQLITE_ERROR when inserting title, description, and updated_at columns
  - Test that the test schema is missing columns: title, description, updated_at (from Bug Condition in design)
  - The test assertions should match the Expected Behavior Properties from design (all tests pass without schema errors)
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS with SQLITE_ERROR messages (this is correct - it proves the bug exists)
  - Document counterexamples found: specific SQLITE_ERROR messages for missing columns
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Test Logic and Assertions Unchanged
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for test logic that doesn't involve schema definition
  - Write property-based tests capturing observed behavior patterns from Preservation Requirements
  - Test that service method calls (createOnboardingChecklist, completeChecklistItem, etc.) work correctly with proper schema
  - Test that test assertions for checklist status, items, and completion remain unchanged
  - Test that employee table setup and test data insertion work correctly
  - Test that email service mocks function correctly
  - Property-based testing generates many test cases for stronger guarantees
  - Run tests on UNFIXED code (with manually fixed schema for observation)
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 3. Fix for onboarding test schema mismatch

  - [x] 3.1 Implement the fix
    - Update the `beforeEach` hook in `backend/src/services/__tests__/onboardingService.test.ts`
    - Add missing required columns to onboarding_checklists table:
      - `table.string('title', 100).notNullable()` - Checklist title
      - `table.text('description').nullable()` - Checklist description
      - `table.timestamp('updated_at').defaultTo(db.fn.now())` - Last update timestamp
    - Add missing optional columns from production migration:
      - `table.date('target_completion_date').nullable()` - Target completion date
      - `table.date('completed_date').nullable()` - Actual completion date
    - Ensure column types match production migration (keep items as text for SQLite compatibility)
    - Update test data inserts to include new required columns (title, updated_at)
    - Fix column name inconsistency: update any references to `completed_at` to use `completed_date`
    - _Bug_Condition: isBugCondition(testExecution) where testExecution.schema.missingColumns.includes('title', 'description', 'updated_at')_
    - _Expected_Behavior: All tests execute successfully without SQLITE_ERROR failures, schema matches production migration_
    - _Preservation: Test assertions, service method behavior, test data setup, and mock behavior remain unchanged_
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 3.2 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Test Schema Matches Production
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed - no more SQLITE_ERROR failures)
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 3.3 Verify preservation tests still pass
    - **Property 2: Preservation** - Test Logic Unchanged
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions in test logic, assertions, or behavior)
    - Confirm all tests still pass after fix (no regressions)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 4. Checkpoint - Ensure all tests pass
  - Run full onboarding service test suite
  - Verify all tests pass without schema-related errors
  - Verify test execution time remains similar (no performance regression)
  - Verify test coverage remains at the same level
  - Ask the user if questions arise
