# Backend Test Errors Report

> Generated: 2026-04-21  
> Command: `npm run test` (Jest)  
> Duration: 85.7 seconds  
> **Result: 102 test suites FAILED, 94 passed — 427 tests failed, 2136 passed (2565 total)**

---

## Overall Summary

| Category | Count |
|----------|-------|
| Test suites failed | 102 |
| Test suites passed | 94 |
| Tests failed | 427 |
| Tests passed | 2136 |
| Tests skipped | 2 |

---

## Failure Categories

### 1. Database Authentication Failure — ~488 occurrences
**Error:**
```
error: password authentication failed for user "postgres"
```
**Root cause:** The test database credentials in the environment or `.env.test` are wrong, or PostgreSQL is not accepting connections with the configured username/password.

**Affected suites:**
- `src/__tests__/example.test.ts`
- `src/__tests__/integration/bankDetails.integration.test.ts`
- `src/__tests__/integration/benefits.integration.test.ts`
- `src/__tests__/integration/documents.integration.test.ts`
- `src/__tests__/integration/hierarchy.integration.test.ts`
- `src/__tests__/integration/suppliers.integration.test.ts`

**Fix:** Verify the `DATABASE_URL` or `DB_PASSWORD` in `.env.test`. Ensure the `postgres` user exists and has a matching password:
```sql
ALTER USER postgres WITH PASSWORD 'your_password';
```

---

### 2. Missing DB Tables (Relation Does Not Exist) — ~130 occurrences
**Errors:**
```
error: relation "employees" does not exist
error: relation "designations" does not exist
error: relation "onboarding_checklist_items" does not exist
error: relation "journeys" does not exist
error: relation "auth" does not exist
```
**Root cause:** The test database schema is incomplete — migrations have not been run or the test DB was not properly set up. Tests are hitting a fresh/empty database.

**Missing tables:**
| Table | Occurrences |
|-------|-------------|
| `employees` | 60 |
| `designations` | 48 |
| `onboarding_checklist_items` | 18 |
| `journeys` | 2 |
| `auth` | 2 |

**Affected suites:**
- `src/__tests__/integration/notifications.integration.test.ts`
- `src/repositories/__tests__/applicantRepository.test.ts`
- `src/repositories/__tests__/jobPostingRepository.test.ts`
- `src/services/__tests__/leaveService.test.ts`
- Most repository and integration tests

**Fix:** Run all migrations against the test database before running tests:
```bash
NODE_ENV=test npx knex migrate:latest
```
Or add a `globalSetup` in Jest config that runs migrations.

---

### 3. Schema Mismatch — Columns Don't Exist — ~108 occurrences
**Errors:**
```
error: column "contact_number" of relation "employees" does not exist
error: column "department_id" of relation "designations" does not exist
```
**Root cause:** Test fixtures/factories are inserting columns that exist in the TypeScript types/factories but are absent from the actual database schema. The database migrations are out of sync with the application models.

**Details:**
| Column | Table | Count |
|--------|-------|-------|
| `contact_number` | `employees` | 60 |
| `department_id` | `designations` | 48 |

**Affected suites:** Most employee and designation related tests.

**Fix:** Either:
- Add the missing columns to the migration files and re-run migrations, OR
- Update the test factories to not use columns that don't exist in the DB schema.

---

### 4. `this.knex is not a function` / `this.db is not a function` — 60 occurrences
**Errors:**
```
TypeError: this.knex is not a function
TypeError: this.db is not a function
TypeError: this.db.transaction is not a function
```
**Root cause:** Repository or service classes are being instantiated without a proper database connection injected. The knex/db dependency is `undefined` at runtime in test context — likely a broken mock or missing dependency injection setup.

**Affected suites:**
- `src/services/__tests__/approvalRoutingService.test.ts`
- `src/services/__tests__/dashboardService.test.ts`
- `src/services/__tests__/documentService.test.ts`
- `src/services/__tests__/reportService.test.ts`

**Fix:** Ensure tests properly import and pass the knex instance when constructing repositories/services, or fix the mock setup to return a valid knex object.

---

### 5. Foreign Key Constraint Violations — ~68 occurrences
**Errors:**
```
error: insert or update on table "rewards" violates foreign key constraint "rewards_employee_id_foreign"
error: insert or update on table "bank_accounts" violates foreign key constraint "bank_accounts_employee_id_foreign"
error: insert or update on table "performance_reviews" violates foreign key constraint "performance_reviews_employee_id_foreign"
error: insert or update on table "reimbursement_claims" violates foreign key constraint "reimbursement_claims_employee_id_foreign"
error: insert or update on table "payroll" violates foreign key constraint "payroll_employee_id_foreign"
error: insert or update on table "leaves" violates foreign key constraint "leaves_leave_type_id_foreign"
```
**Root cause:** Tests insert records referencing `employee_id` (or other FK ids) that don't exist in the parent table, because employee/parent records weren't created first, or setup order is wrong.

**Affected suites:**
- `src/repositories/__tests__/rewardRepository.test.ts`
- `src/repositories/__tests__/bankAccountRepository.test.ts`
- `src/services/__tests__/payslipService.test.ts`
- `src/repositories/__tests__/performanceReviewRepository.test.ts`
- `src/repositories/__tests__/reimbursementClaimRepository.test.ts`
- Various repository tests

**Fix:** Fix `beforeEach`/`beforeAll` test setup to insert the required parent records (employee, leave type, etc.) before inserting dependent records.

---

### 6. `null value in column "employee_id"` — ~50 occurrences
**Error:**
```
error: null value in column "employee_id" of relation "employees" violates not-null constraint
```
**Root cause:** Test factories for `employees` don't provide an `employee_id` field (separate from the primary key `id`), but the DB schema requires it as NOT NULL.

**Affected suites:**
- `src/__tests__/integration/geo-tracking.integration.test.ts` (all 13 tests)
- Several other integration tests

**Fix:** Add `employee_id` (business identifier, e.g. `EMP001`) to the employee factory/test data.

---

### 7. Invalid UUID Syntax — ~44 occurrences
**Error:**
```
error: invalid input syntax for type uuid: "test-emp-sep-001"
error: invalid input syntax for type uuid: "emp-no-history"
```
**Root cause:** Tests use human-readable string IDs like `"test-emp-sep-001"` in places where the database column type is `UUID`. The DB rejects non-UUID formatted strings.

**Affected suites:**
- `src/__tests__/integration/separation.integration.test.ts`
- `src/repositories/__tests__/employmentHistoryRepository.test.ts`
- Several other tests

**Fix:** Replace string IDs in test fixtures with valid UUIDs using `uuid.v4()` or a test helper.

---

### 8. TypeScript Type Errors in Tests — ~44 affected test files
**Root cause:** Test files use mock objects that are out of sync with updated TypeScript types/interfaces. The types were updated but the test mocks weren't.

**Key type mismatches found:**

| File | Error |
|------|-------|
| `trainingService.unit.test.ts` | `Property 'program_id' missing in 'TrainingEnrollment'` |
| `trainingService.comprehensive.test.ts` | `Property 'program_id' missing in 'TrainingEnrollment'` |
| `trainingService.unit.test.ts` | `Property 'proficiency_levels' missing in type 'Skill'` |
| `supplierBuyerService.test.ts` | `Property 'record_id' missing in type 'Visit'` |
| `supplierBuyerService.test.ts` | `Argument not assignable to 'CreateVisitDTO'` |
| `supplierBuyerService.property.test.ts` | `Property 'record_id' missing in 'CreateVisitDTO'` |
| `recruitmentModule.test.ts` | `Argument '"Screening"' not assignable to enum (lowercase expected)` |
| `recruitmentModule.property.test.ts` | `Argument '"Screening"' not assignable to enum` |
| `phase7-recruitment-services.unit.test.ts` | `Argument not assignable to 'CreateJobPostingDTO'` |
| `pfService.test.ts` | `Argument not assignable to 'PFAccount'` |
| `onboardingService.test.ts` | `'items[].task' missing, got 'items[].title'` |
| `onboardingService.bugCondition.test.ts` | `Same 'items' type mismatch` |
| `auth.integration.test.ts` | `Type 'undefined' not assignable to 'boolean'` in `TokenPayload.role` |
| `encryption.test.ts` | Multiple TS errors |
| `performanceReviewService.test.ts` | Type mismatches |
| `pipService.test.ts` | Type mismatches |

**Fix:** Update test mock objects to match the current interface definitions. Common pattern:
- `TrainingEnrollment` now requires `program_id` field
- `Visit` now requires `record_id` field  
- `CreateVisitDTO` now requires `record_id` field
- Recruitment status enum values are lowercase (`"screening"` not `"Screening"`)
- `OnboardingChecklistItem` uses `task` not `title`
- `TokenPayload.role` is `UserRole` (not optional/undefined)

---

### 9. `requireRole` is not a function — 4 occurrences
**Error:**
```
TypeError: (0, auth_1.requireRole) is not a function
```
**Root cause:** The `requireRole` export from the auth module is not found or the import path is broken in the test context.

**Affected suites:**
- Integration tests importing from auth routes

**Fix:** Check that `requireRole` is properly exported from `src/middleware/auth.ts` and that the import path in the affected test is correct.

---

### 10. `insuranceEnrollmentRepository` method not found — ~18 occurrences
**Errors:**
```
TypeError: this.insuranceEnrollmentRepository.getEnrollmentsByEmployee is not a function
TypeError: this.insuranceEnrollmentRepository.getEnrollmentById is not a function
TypeError: this.insuranceEnrollmentRepository.createEnrollment is not a function
```
**Root cause:** The `InsuranceEnrollmentRepository` interface or class is missing these methods, or the service was updated to call methods that haven't been implemented in the repository yet.

**Affected suites:**
- `src/services/__tests__/insuranceService.test.ts`
- `src/__tests__/services/insuranceService.test.ts`
- `src/__tests__/services/insuranceService.property.test.ts`

**Fix:** Implement the missing methods in `InsuranceEnrollmentRepository`:
- `getEnrollmentsByEmployee(employeeId: string)`
- `getEnrollmentById(id: string)`
- `createEnrollment(data: CreateEnrollmentDTO)`

---

### 11. Deadlock Detected — 4 occurrences
**Error:**
```
error: deadlock detected
```
**Root cause:** Concurrent test workers are trying to write to the same DB rows simultaneously, causing PostgreSQL deadlocks.

**Affected:** `payslipService.test.ts`, `reimbursement_claims` update

**Fix:** Either run affected tests serially (`--runInBand`) or ensure each test uses isolated data (unique IDs per test run).

---

### 12. Jest Worker Crashed — 2 occurrences
**Error:**
```
Jest worker encountered 4 child process exceptions, exceeding retry limit
```
**Affected:** `src/__tests__/integration/employees.integration.test.ts`

**Root cause:** The test process crashes due to memory/resource exhaustion or an unhandled fatal error in setup.

**Fix:** Investigate with `--runInBand` to get the full error, or increase Jest worker memory with `--maxWorkers=2`.

---

### 13. "Cannot log after tests are done" — 13 occurrences
**Error:**
```
Cannot log after tests are done. Did you forget to wait for something async in your test?
```
**Root cause:** Async operations (DB queries, Redis connections) complete after the test has already finished. Missing `await` or improper cleanup in `afterAll`/`afterEach`.

**Fix:** Ensure all async operations are awaited and all connections are closed in `afterAll`:
```typescript
afterAll(async () => {
  await db.destroy();
  await redis.quit();
});
```

---

## Failing Test Suites by Category

### Integration Tests (all failing)
```
src/__tests__/integration/attendance.integration.test.ts
src/__tests__/integration/auth.integration.test.ts
src/__tests__/integration/bankDetails.integration.test.ts
src/__tests__/integration/benefits.integration.test.ts
src/__tests__/integration/dashboard.integration.test.ts
src/__tests__/integration/documents.integration.test.ts
src/__tests__/integration/email.integration.test.ts
src/__tests__/integration/employees.integration.test.ts
src/__tests__/integration/esignature.integration.test.ts
src/__tests__/integration/fileStorage.integration.test.ts
src/__tests__/integration/fileStorageDeletion.integration.test.ts
src/__tests__/integration/geo-tracking.integration.test.ts
src/__tests__/integration/health.integration.test.ts
src/__tests__/integration/hierarchy.integration.test.ts
src/__tests__/integration/leave.integration.test.ts
src/__tests__/integration/notifications.integration.test.ts
src/__tests__/integration/payroll.integration.test.ts
src/__tests__/integration/performance.integration.test.ts
src/__tests__/integration/recruitment.integration.test.ts
src/__tests__/integration/separation.integration.test.ts
src/__tests__/integration/suppliers.integration.test.ts
src/__tests__/integration/training.integration.test.ts
```

### Repository Tests (failing)
```
src/repositories/__tests__/applicantRepository.test.ts
src/repositories/__tests__/bankAccountRepository.test.ts
src/repositories/__tests__/emergencyContactRepository.test.ts
src/repositories/__tests__/employeeRepository.test.ts
src/repositories/__tests__/employeeSkillRepository.test.ts
src/repositories/__tests__/employmentHistoryRepository.test.ts
src/repositories/__tests__/exitInterviewRepository.test.ts
src/repositories/__tests__/feedbackRepository.test.ts
src/repositories/__tests__/fnfSettlementRepository.test.ts
src/repositories/__tests__/geoFenceRepository.test.ts
src/repositories/__tests__/geoLogRepository.test.ts
src/repositories/__tests__/goalRepository.test.ts
src/repositories/__tests__/gratuityRepository.test.ts
src/repositories/__tests__/hierarchyNodeRepository.test.ts
src/repositories/__tests__/holidayRepository.test.ts
src/repositories/__tests__/insuranceEnrollmentRepository.test.ts
src/repositories/__tests__/jobPostingRepository.test.ts
src/repositories/__tests__/leaveRepository.test.ts
src/repositories/__tests__/performanceReviewRepository.test.ts
src/repositories/__tests__/reimbursementClaimRepository.test.ts
src/repositories/__tests__/resignationRepository.test.ts
src/repositories/__tests__/rewardRepository.test.ts
```

### Service Tests (failing)
```
src/services/__tests__/approvalRoutingService.test.ts
src/services/__tests__/attendanceManualOverride.property.test.ts
src/services/__tests__/auditLogService.unit.test.ts
src/services/__tests__/bankDetails.property.test.ts
src/services/__tests__/bankDetailsService.test.ts
src/services/__tests__/birthdayAnniversary.property.test.ts
src/services/__tests__/dashboardService.test.ts
src/services/__tests__/documentService.test.ts
src/services/__tests__/esignature.property.test.ts
src/services/__tests__/expenseService.test.ts
src/services/__tests__/fileStorageService.test.ts
src/services/__tests__/geoFenceValidation.property.test.ts
src/services/__tests__/geoTrackingService.property.test.ts
src/services/__tests__/geoTrackingService.test.ts
src/services/__tests__/hierarchyService.property.test.ts
src/services/__tests__/hierarchyService.test.ts
src/services/__tests__/holidayService.test.ts
src/services/__tests__/insuranceService.test.ts
src/services/__tests__/leave.property.test.ts
src/services/__tests__/leaveService.test.ts
src/services/__tests__/leaveTypeService.test.ts
src/services/__tests__/offerLetterService.test.ts
src/services/__tests__/onboardingService.bugCondition.test.ts
src/services/__tests__/onboardingService.preservation.test.ts
src/services/__tests__/onboardingService.test.ts
src/services/__tests__/payrollCalculationService.test.ts
src/services/__tests__/payrollProcessingService.test.ts
src/services/__tests__/payslipService.test.ts
src/services/__tests__/performanceReviewService.test.ts
src/services/__tests__/pfService.test.ts
src/services/__tests__/phase7-recruitment-complete.unit.test.ts
src/services/__tests__/phase7-recruitment-services.unit.test.ts
src/services/__tests__/pipService.test.ts
src/services/__tests__/recruitmentModule.property.test.ts
src/services/__tests__/recruitmentModule.test.ts
src/services/__tests__/reimbursementService.property.test.ts
src/services/__tests__/reportService.test.ts
src/services/__tests__/separationService.test.ts
src/services/__tests__/supplierBuyerService.property.test.ts
src/services/__tests__/supplierBuyerService.test.ts
src/services/__tests__/trainingService.comprehensive.test.ts
src/services/__tests__/trainingService.unit.test.ts
src/services/__tests__/travelAllowanceService.test.ts
src/factories/__tests__/StorageProviderFactory.test.ts
```

---

## Warnings (non-blocking)

- **ts-jest deprecation**: `ts-jest` config defined under `globals` is deprecated. Move to `transform` in `jest.config.ts`.
- **Firebase disabled**: `Firebase is disabled in configuration` — informational only.
- **Redis/DB connection logs**: Tests log connection events; these should be silenced in test env.

---

## Recommended Fix Order

### Step 1 — Fix the test database (unblocks ~80% of failures)
```bash
# Create test DB and run migrations
NODE_ENV=test npx knex migrate:latest
# Verify DB credentials in .env.test match your local postgres setup
```

### Step 2 — Fix test factories / seed data
- Add `employee_id` (NOT NULL field) to employee factory
- Replace invalid UUID strings (`"test-emp-sep-001"`) with `uuid.v4()` 
- Fix `beforeEach` setup order so parent records are created before child records

### Step 3 — Fix TypeScript type mismatches in test mocks
- Add `program_id` to `TrainingEnrollment` mock objects
- Add `record_id` to `Visit` and `CreateVisitDTO` mock objects
- Change `"Screening"` → `"screening"` in recruitment tests
- Change `items[].title` → `items[].task` in onboarding tests
- Fix `TokenPayload.role` to not be `undefined`

### Step 4 — Implement missing repository methods
- Add `getEnrollmentsByEmployee`, `getEnrollmentById`, `createEnrollment` to `InsuranceEnrollmentRepository`

### Step 5 — Fix service unit test DI issues
- Pass a real or properly mocked knex instance to `approvalRoutingService`, `dashboardService`, `documentService`, `reportService`

### Step 6 — Fix async cleanup
- Add proper `afterAll` teardown (close DB + Redis connections) to prevent "Cannot log after tests" warnings

### Step 7 — Update ts-jest config
```ts
// jest.config.ts
transform: {
  '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.json' }]
}
```
