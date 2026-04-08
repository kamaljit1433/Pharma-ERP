# Test Failures Report

**Run date:** 2026-04-06
**Total suites:** 188 (46 passed, 142 failed)
**Total tests:** 1377 (1066 passed, 311 failed)

---

## Root Cause Categories

| Category | Suite Count | Description |
|---|---|---|
| Empty test suites (factory/helper files) | ~50 | Factory/utility files have no `it()` blocks |
| Database schema mismatch | ~30 | Migrations haven't been run on the test DB |
| TypeScript errors in test files | ~20 | Test code has compile-time TS errors |
| DB auth failure | ~10 | Postgres password incorrect for test user |
| Logic/assertion failures | ~15 | Service logic or missing feature implementations |
| Missing module/function | ~10 | Exports renamed or missing |
| Other | ~7 | Miscellaneous |

---

## Category 1: Empty Test Suites

**Error:** `Your test suite must contain at least one test.`

These are factory and utility files that Jest picks up as test files (because they're under `__tests__/`) but contain only helper code with no `it()` or `test()` blocks.

**Affected files:**
- `src/__tests__/factories/base.factory.ts`
- `src/__tests__/factories/index.ts`
- `src/__tests__/factories/employee.factory.ts`
- `src/__tests__/factories/attendance.factory.ts`
- `src/__tests__/factories/department.factory.ts`
- `src/__tests__/factories/designation.factory.ts`
- `src/__tests__/factories/leave.factory.ts`
- `src/__tests__/factories/leave-type.factory.ts`
- `src/__tests__/factories/shift.factory.ts`
- `src/__tests__/factories/salary-structure.factory.ts`
- `src/__tests__/factories/recruitment.factory.ts`
- `src/__tests__/factories/factory-builder.ts`
- `src/__tests__/utils/test-db.ts`
- `src/__tests__/utils/test-helpers.ts`
- `src/__tests__/utils/index.ts`
- `src/services/factories/__tests__/StorageProviderFactory.test.ts`

**Fix:** Add `testPathIgnorePatterns` to `jest.config.js` to exclude factory/utility files, or move them outside `__tests__/` directories:
```js
testPathIgnorePatterns: [
  '/node_modules/',
  '/__tests__/factories/',
  '/__tests__/utils/test-db.ts',
  '/__tests__/utils/test-helpers.ts',
  '/__tests__/utils/index.ts',
]
```

---

## Category 2: Database Schema Mismatch

**Error examples:**
- `relation "questionnaire_templates" does not exist`
- `column "date" does not exist` (attendance table)
- `column "details" does not exist` (audit_logs table)
- `column "rejection_notes" does not exist` (advance_salary_requests table)
- `column "carried_forward" does not exist` (leave_balances table)
- `null value in column "employee_number"` (employees table — required column not in test data)

**Root cause:** The database (both main and test) doesn't have the latest schema. Migrations need to be run.

**Affected test files:**
- `src/repositories/__tests__/questionnaireTemplateRepository.test.ts`
- `src/services/__tests__/payrollCalculationService.test.ts` (column `date` in attendance)
- `src/services/__tests__/payrollProcessingService.test.ts` (column `details` in audit_logs)
- `src/services/__tests__/advanceSalaryService.test.ts` (column `rejection_notes`)
- `src/repositories/__tests__/leaveBalanceRepository.test.ts` (column `carried_forward`)
- `src/__tests__/integration/geo-tracking.integration.test.ts` (employees null constraint)
- `src/__tests__/integration/notifications.integration.test.ts` (employees insert failure)
- `src/__tests__/integration/separation.integration.test.ts` (employees insert failure)

**Fix:** Run migrations on the test database:
```bash
# Create the test database first
psql -U postgres -c "CREATE DATABASE employee_management_system_test;"

# Run migrations
NODE_ENV=test npx knex migrate:latest --env test
```
Make sure `knexfile.ts` has a `test` environment entry pointing to `TEST_DB_*` env vars.

---

## Category 3: Database Authentication Failure

**Error:** `password authentication failed for user "postgres"`

Some integration tests (suppliers, hierarchy) connect with a different DB config or the postgres password doesn't match.

**Affected files:**
- `src/__tests__/integration/suppliers.integration.test.ts`
- `src/__tests__/integration/hierarchy.integration.test.ts`

**Fix:** Ensure `TEST_DB_PASSWORD` in `.env` matches the actual postgres password. Currently set to `Root` — verify this matches your local Postgres installation.

---

## Category 4: TypeScript Errors in Test Files

Test files themselves have compile errors that prevent the suite from running.

### 4a. Wrong knex import
**Error:** `Module '"../../config/knex"' has no exported member 'knex'. Did you mean to use 'import knex from "../../config/knex"' instead?`
**File:** `src/__tests__/integration/dashboard.integration.test.ts:3`
**Fix:** Change `import { knex }` to `import knex` (default import).

### 4b. Incorrect GoalService constructor
**Error:** `Argument of type 'GoalRepository' is not assignable to parameter of type 'Knex<any, any[]>'`
**File:** `src/__tests__/integration/performance.integration.test.ts:34`
**Fix:** Check the `GoalService` constructor signature — it may have changed from taking a Knex instance to taking a repository.

### 4c. Missing `app` export from index
**Error:** `Property 'app' does not exist on type 'typeof import("...src/index")'`
**File:** `src/__tests__/integration/recruitment.integration.test.ts:12`
**Fix:** `src/index.ts` likely exports the app as `default` only. Either add a named `export const app =` or change the test to use `module.default`.

### 4d. Undefined variable `hrManagerToken`
**Error:** `Cannot find name 'hrManagerToken'`
**File:** `src/__tests__/integration/esignature.integration.test.ts:97`
**Fix:** The `hrManagerToken` variable is referenced but never declared in this test file. Add a `let hrManagerToken: string;` and assign it in `beforeAll`.

### 4e. Operation type mismatch in fileStorageService
**Error:** `Argument of type 'string' is not assignable to parameter of type '"getObject" | "putObject" | undefined'`
**File:** `src/__tests__/services/fileStorageService.property.test.ts:109`
**Fix:** Cast the operation to the correct union type: `operation as 'getObject' | 'putObject'`.

### 4f. Mock type errors in S3/deletion tests
**Error:** `Argument of type '{}' is not assignable to parameter of type 'never'`
**Files:**
- `src/__tests__/services/s3StorageProvider.deletion.test.ts`
- `src/__tests__/services/fileStorageService.deletion.test.ts`
- `src/__tests__/services/fileStorageService.deletion.property.test.ts`
**Fix:** These mock setup calls need proper TypeScript types. Use `mockResolvedValue({} as any)` or define the return type explicitly.

---

## Category 5: Missing Module / Function Errors

### 5a. `requireRole` not exported from auth middleware
**Error:** `TypeError: (0 , auth_1.requireRole) is not a function`
**File:** A file route that does `import { requireRole } from '../middleware/auth'`
**Fix:** Check `src/middleware/auth.ts` — the function may be named `authorize` or `checkRole` instead. Update the import to match the actual export.

### 5b. Logger crashes when SESSION_SECRET not set
**Error:** `TypeError: Cannot read properties of undefined (reading 'level')` at `src/utils/logger.ts:22`
**Root cause:** `config/index.ts` throws `FATAL: SESSION_SECRET environment variable is required` before the logger can initialize. Tests that import `logger` transitively import `config`, which blows up if `SESSION_SECRET` is missing.
**Fix:** Ensure `SESSION_SECRET` is set in the test environment. It is set in `.env` — make sure the test runner loads it (check `jest.config.js` for `dotenv` setup or `setupFiles`).

---

## Category 6: Logic / Assertion Failures

### 6a. Retry — isRetryableError timeout detection
**Error:** `Expected: true, Received: false` for `new Error('Operation timed out')`
**File:** `src/utils/__tests__/resilience.test.ts:154`
**Root cause:** The `isRetryableError` function doesn't detect timeout errors by message text. It may only check error `code` or `name`.
**Fix:** Add timeout message detection to `isRetryableError`:
```typescript
if (error.message?.toLowerCase().includes('timeout') ||
    error.message?.toLowerCase().includes('timed out')) return true;
```

### 6b. FileValidationService — WebP MIME type
**Error:** `Expected: "image/webp", Received: null` for `detectMimeType('unknown', webpBuffer)`
**File:** `src/services/__tests__/fileValidationService.unit.test.ts:120`
**Root cause:** The WebP magic bytes (`52 49 46 46 ... 57 45 42 50`) are not in the MIME detection logic.
**Fix:** Add WebP magic byte detection to `FileValidationService.detectMimeType()`.

### 6c. FileValidationService — formatFileSize bytes
**Error:** `formatFileSize should format bytes` — assertion mismatch
**File:** `src/services/__tests__/fileValidationService.unit.test.ts`
**Root cause:** Likely an off-by-one in the "bytes" format branch (e.g., returns `"1 byte"` vs `"1 B"`).

### 6d. HierarchyService property tests
**Error:** 3 property-based tests fail:
- `Property 47: Should enforce single primary position per employee`
- `Property 49: Should audit all hierarchy changes`
- `Should support dotted-line reporting relationships`
**File:** `src/services/__tests__/hierarchyService.property.test.ts`
**Root cause:** Business logic for auditing or dotted-line reporting not fully implemented.

### 6e. SalaryStructureService — deactivate previous on new creation
**Error:** `should deactivate previous structure when creating new one` fails
**File:** `src/services/__tests__/salaryStructureService.test.ts`
**Root cause:** The service doesn't deactivate the existing active salary structure before creating a new one.

### 6f. ApprovalRoutingService — null returns
**Error:** Multiple tests expect `null` for non-existent records but receive `undefined`
**File:** `src/services/__tests__/approvalRoutingService.test.ts`
**Root cause:** Repository methods return `undefined` instead of `null` for missing records.

### 6g. DashboardService
**Error:** Multiple stats calculations return wrong values
**File:** `src/services/__tests__/dashboardService.test.ts`
**Root cause:** Aggregation queries or mock data setup mismatch.

### 6h. ReportService
**Error:** Multiple report generation tests fail
**File:** `src/services/__tests__/reportService.test.ts`
**Root cause:** Report queries don't match expected output format/pagination behavior.

### 6i. LeaveService
**Error:** 9 tests fail covering apply, approve, reject leave and carry-forward
**File:** `src/services/__tests__/leaveService.test.ts`
**Root cause:** Schema mismatch or service logic issues.

### 6j. F&F Settlement
**Error:** `generateFnFStatement should generate F&F statement` fails
**File:** `src/services/__tests__/separationService.test.ts`
**Root cause:** F&F statement generation incomplete or schema mismatch.

### 6k. SupplierBuyerService
**Error:** `Property: Search term handling should pass non-empty search terms to repository` fails
**File:** `src/services/__tests__/supplierBuyerService.property.test.ts`
**Root cause:** Empty string `""` is likely being filtered out — the test expects non-empty strings to be passed through.

---

## Category 7: Database/ORM Errors

### 7a. InsuranceService uses wrong SQL dialect
**Error:** Backtick syntax in SQL (`INSERT INTO \`insurance_plans\`...`)
**File:** `src/services/__tests__/insuranceService.test.ts`
**Root cause:** The mock or knex client is using SQLite/MySQL syntax. The test likely uses `knex-mock-client` configured for the wrong dialect.
**Fix:** Configure knex mock to use `postgresql` client, or use `pg` as the client in test setup.

### 7b. Employment History — invalid date syntax
**Error:** `invalid input syntax for type date` in employment_history insert
**File:** `src/repositories/__tests__/` (employment history repository test)
**Root cause:** Date value passed as wrong format (e.g., JS Date object instead of ISO string).

---

## How to Fix the Most Tests Quickly

### Step 1: Run database migrations
```bash
# Ensure test DB exists
psql -U postgres -c "CREATE DATABASE employee_management_system_test;"

# Run migrations
cd backend
npx knex migrate:latest
NODE_ENV=test npx knex migrate:latest
```

### Step 2: Fix jest.config.js to exclude non-test files
Add to `jest.config.js`:
```js
testPathIgnorePatterns: [
  '/node_modules/',
  '/__tests__/factories/',
  '/__tests__/utils/test-db\\.ts',
  '/__tests__/utils/test-helpers\\.ts',
  '/__tests__/utils/index\\.ts',
  '/services/factories/__tests__/StorageProviderFactory\\.test\\.ts',
]
```
This alone will fix ~50 "empty suite" failures.

### Step 3: Ensure SESSION_SECRET is loaded in tests
In `jest.config.js`, add:
```js
setupFiles: ['dotenv/config'],
// or
globalSetup: './src/__tests__/utils/jest.setup.ts',
```

### Step 4: Fix TypeScript errors in test files (Category 4)
- `dashboard.integration.test.ts`: Change `import { knex }` to `import knex`
- `esignature.integration.test.ts`: Declare `hrManagerToken` variable
- `fileStorageService.property.test.ts`: Cast operation type
- Deletion test mocks: Add `as any` to mock return values

---

## Tests Passing (1066)

All unit tests for the following services pass cleanly:
- AuthService (most)
- EmployeeService (most)
- OnboardingService (most)
- SeparationService (most)
- AuditLogService
- FileValidationService (most)
- BankDetailsService (most)
- Many repository unit tests
