# Onboarding Test Schema Fix Bugfix Design

## Overview

The onboarding service tests fail due to a schema mismatch between the test database setup and the production migration. The test creates an `onboarding_checklists` table missing three columns (`title`, `description`, `updated_at`) that exist in the production schema. This causes SQLITE_ERROR failures when the `OnboardingRepository.createChecklist()` method attempts to insert these columns during test execution. The fix involves updating the test schema to match the production migration exactly, ensuring tests run against a realistic database structure.

## Glossary

- **Bug_Condition (C)**: The condition that triggers the bug - when tests create the onboarding_checklists table with an incomplete schema
- **Property (P)**: The desired behavior - tests should execute successfully with a schema matching production
- **Preservation**: Existing test logic and assertions that must remain unchanged by the fix
- **OnboardingRepository**: The repository class in `backend/src/repositories/onboardingRepository.ts` that handles database operations for onboarding checklists
- **OnboardingService**: The service class in `backend/src/services/onboardingService.ts` that contains business logic for onboarding workflows
- **Production Migration**: The migration file `backend/src/database/migrations/20260317000000_create_recruitment_tables.ts` that defines the actual database schema

## Bug Details

### Bug Condition

The bug manifests when the onboarding service tests execute and attempt to interact with the `onboarding_checklists` table. The test setup creates a table schema that is missing columns required by the repository layer, causing SQLite errors when insert or query operations reference these missing columns.

**Formal Specification:**
```
FUNCTION isBugCondition(testExecution)
  INPUT: testExecution of type TestExecution
  OUTPUT: boolean
  
  RETURN testExecution.testFile == 'onboardingService.test.ts'
         AND testExecution.tableCreated == 'onboarding_checklists'
         AND testExecution.schema.missingColumns.includes('title')
         AND testExecution.schema.missingColumns.includes('description')
         AND testExecution.schema.missingColumns.includes('updated_at')
         AND repositoryAttemptedInsert('title', 'description', 'updated_at')
END FUNCTION
```

### Examples

- **Test: createOnboardingChecklist** - When `OnboardingRepository.createChecklist()` executes `INSERT INTO onboarding_checklists (id, employee_id, title, items, status, created_at, updated_at)`, SQLite throws "SQLITE_ERROR: table onboarding_checklists has no column named title"

- **Test: completeChecklistItem** - When the repository updates a checklist with `UPDATE onboarding_checklists SET items = ?, updated_at = ? WHERE id = ?`, SQLite throws "SQLITE_ERROR: no such column: updated_at"

- **Test: generateDefaultChecklist** - When creating a default checklist, the insert fails because the test schema lacks the `title` column that the repository always populates with 'Onboarding Checklist'

- **Edge case: getOnboardingChecklist** - Even read operations may fail if the query includes `SELECT title, description, updated_at` from a table that doesn't have these columns

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- All test assertions and expectations must continue to validate the same business logic
- Test data setup for the `employees` table must remain unchanged
- Service method behavior (createOnboardingChecklist, completeChecklistItem, etc.) must remain unchanged
- Email sending mock behavior must remain unchanged

**Scope:**
All test logic that does NOT involve the schema definition of `onboarding_checklists` should be completely unaffected by this fix. This includes:
- Test assertions on checklist status, items, and completion
- Test data for employees and other tables
- Mock implementations for email service
- Test flow and execution order

## Hypothesized Root Cause

Based on the bug description and code analysis, the most likely issues are:

1. **Incomplete Schema Definition**: The test setup in `onboardingService.test.ts` creates the `onboarding_checklists` table with only 6 columns (id, employee_id, items, status, completed_at, created_at), while the production migration defines 10 columns (adding title, description, target_completion_date, completed_date, updated_at)

2. **Schema Drift**: The test was written before the production migration was finalized, or the migration was updated without updating the test schema, causing the test and production schemas to diverge

3. **Missing Column References**: The `OnboardingRepository.createChecklist()` method explicitly inserts `title` and `updated_at` columns, which don't exist in the test schema

4. **Type Mismatch**: The test uses `completed_at` while the production schema uses `completed_date`, causing potential query failures

## Correctness Properties

Property 1: Bug Condition - Test Schema Matches Production

_For any_ test execution where the onboarding service tests run and the onboarding_checklists table is created, the fixed test setup SHALL create a table with all columns defined in the production migration (id, employee_id, title, description, items, status, target_completion_date, completed_date, created_at, updated_at), allowing all repository operations to execute successfully without SQLITE_ERROR failures.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4**

Property 2: Preservation - Test Logic Unchanged

_For any_ test case that does NOT directly involve the schema definition (all test assertions, service method calls, email mocks, and business logic validations), the fixed test file SHALL produce exactly the same test behavior as the original test file, preserving all existing test coverage and assertions.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct:

**File**: `backend/src/services/__tests__/onboardingService.test.ts`

**Function**: `beforeEach` hook - table creation

**Specific Changes**:
1. **Add Missing Columns**: Update the `onboarding_checklists` table creation to include:
   - `table.string('title', 100).notNullable()` - Checklist title
   - `table.text('description').nullable()` - Checklist description
   - `table.timestamp('updated_at').defaultTo(db.fn.now())` - Last update timestamp

2. **Add Missing Optional Columns**: Include columns from production migration:
   - `table.date('target_completion_date').nullable()` - Target completion date
   - `table.date('completed_date').nullable()` - Actual completion date (note: production uses `completed_date`, not `completed_at`)

3. **Align Column Types**: Ensure column types match production:
   - Change `items` from `text` to `jsonb` (or keep as `text` for SQLite compatibility, since SQLite doesn't have native jsonb)
   - Verify `status` enum values match production: 'pending', 'in_progress', 'completed'

4. **Update Test Data**: Modify test data inserts to include the new required columns:
   - Add `title: 'Onboarding Checklist'` to all checklist inserts
   - Add `updated_at` timestamps to all checklist inserts

5. **Fix Column Name Inconsistency**: Update any references to `completed_at` to use `completed_date` to match production schema

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bug on unfixed code, then verify the fix works correctly and preserves existing behavior.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the fix. Confirm or refute the root cause analysis. If we refute, we will need to re-hypothesize.

**Test Plan**: Run the existing onboarding service tests on the UNFIXED code to observe the exact SQLITE_ERROR failures. Examine the error messages to confirm which columns are missing and which operations fail.

**Test Cases**:
1. **createOnboardingChecklist Test**: Run test and observe "SQLITE_ERROR: table onboarding_checklists has no column named title" (will fail on unfixed code)
2. **completeChecklistItem Test**: Run test and observe "SQLITE_ERROR: no such column: updated_at" (will fail on unfixed code)
3. **generateDefaultChecklist Test**: Run test and observe insert failure due to missing `title` column (will fail on unfixed code)
4. **getOnboardingChecklist Test**: Run test and observe potential query failures if selecting missing columns (may fail on unfixed code)

**Expected Counterexamples**:
- SQLITE_ERROR messages indicating missing columns: title, description, updated_at
- Possible causes: incomplete test schema, schema drift between test and production, missing column definitions in beforeEach hook

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed function produces the expected behavior.

**Pseudocode:**
```
FOR ALL testExecution WHERE isBugCondition(testExecution) DO
  result := runTestsWithFixedSchema(testExecution)
  ASSERT result.allTestsPass == true
  ASSERT result.noSQLiteErrors == true
  ASSERT result.schemaMatchesProduction == true
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed function produces the same result as the original function.

**Pseudocode:**
```
FOR ALL testCase WHERE NOT affectsSchemaDefinition(testCase) DO
  ASSERT originalTestLogic(testCase) == fixedTestLogic(testCase)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain
- It catches edge cases that manual unit tests might miss
- It provides strong guarantees that behavior is unchanged for all non-schema-related test logic

**Test Plan**: Observe behavior on UNFIXED code first for test assertions and business logic, then write property-based tests capturing that behavior.

**Test Cases**:
1. **Test Assertions Preservation**: Observe that all test assertions (status checks, item completion, email sending) work correctly on unfixed code when schema is manually fixed, then verify these continue after fix
2. **Service Method Preservation**: Observe that service methods (createOnboardingChecklist, completeChecklistItem, etc.) execute correctly with proper schema, then verify behavior unchanged after fix
3. **Test Data Preservation**: Observe that employee table setup and test data insertion work correctly, then verify these continue unchanged after fix
4. **Mock Behavior Preservation**: Observe that email service mocks function correctly, then verify mock behavior unchanged after fix

### Unit Tests

- Test that the fixed schema includes all required columns (title, description, updated_at, target_completion_date, completed_date)
- Test that column types match production migration (string, text, timestamp, date, jsonb/text)
- Test that all existing test cases pass with the fixed schema
- Test that repository insert operations succeed without SQLITE_ERROR

### Property-Based Tests

- Generate random checklist data and verify all tests pass with the fixed schema
- Generate random test execution scenarios and verify no SQLITE_ERROR failures occur
- Test that schema changes don't affect test assertions across many test runs

### Integration Tests

- Run full test suite for onboarding service with fixed schema
- Verify all test cases pass without schema-related errors
- Verify test execution time remains similar (no performance regression)
- Verify test coverage remains at the same level
