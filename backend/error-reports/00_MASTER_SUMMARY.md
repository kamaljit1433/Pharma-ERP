# Pharma-ERP Backend — Master Error Summary

All modules have been analyzed. Individual detailed reports are in this folder.

---

## Module Reports Index

| # | Module | Report File | Critical | High | Medium | Low | Total |
|---|--------|-------------|----------|------|--------|-----|-------|
| 1 | Auth | `01_auth_module_errors.md` | 1 | 4 | 13 | 4 | **22** |
| 2 | Employee | `02_employee_module_errors.md` | 0 | 10 | 8 | 3 | **21** |
| 3 | Payroll | `03_payroll_module_errors.md` | 6 | 4 | 9 | 7 | **26** |
| 4 | Leave | `04_leave_module_errors.md` | 4 | 6 | 6 | 5 | **21** |
| 5 | Recruitment | `05_recruitment_module_errors.md` | 6 | 8 | 9 | 4 | **27** |
| 6 | Training | `06_training_module_errors.md` | 6 | 8 | 10 | 5 | **29** |
| 7 | Performance Management | `07_performance_module_errors.md` | 6 | 4 | 5 | 3 | **18** |
| 8 | File Storage | `08_file_storage_module_errors.md` | 5 | 7 | 12 | 4 | **28** |
| 9 | Notifications | `09_notifications_module_errors.md` | 2 | 3 | 9 | 2 | **16** |
| 10 | Hierarchy | `10_hierarchy_module_errors.md` | 2 | 5 | 3 | 1 | **11** |
| 11 | Geo-Tracking | `11_geo_tracking_module_errors.md` | 1 | 7 | 7 | 3 | **18** |
| 12 | HR Separation | `12_separation_module_errors.md` | 3 | 8 | 7 | 2 | **20** |
| 13 | Benefits & Insurance | `13_benefits_module_errors.md` | 2 | 8 | 7 | 2 | **19** |
| 14 | Dashboard / Reports / Audit | `14_dashboard_reports_audit_errors.md` | 3 | 9 | 7 | 2 | **21** |
| | **TOTALS** | | **47** | **91** | **112** | **47** | **297** |

---

## Overall Severity Breakdown

| Severity | Count | % of Total |
|----------|-------|------------|
| Critical | 47 | 16% |
| High | 91 | 31% |
| Medium | 112 | 38% |
| Low | 47 | 16% |
| **Total** | **297** | |

---

## Top Critical Issues Across All Modules (Fix First)

These issues cause crashes, data corruption, security breaches, or completely broken features:

### Security / Data Exposure
1. **Auth** — OAuth redirect exposes access tokens in URL query params (browser history, logs)
2. **Payroll** — Encrypted bank account numbers written in plaintext to CSV/NEFT export files
3. **File Storage** — Any authenticated user can invoke bulk delete (no admin authorization on cleanup routes)
4. **File Storage** — Hardcoded default JWT/Session secrets — forgeable tokens in production
5. **Recruitment** — Applicant creation route has no authentication — open to the internet

### Application Crashes
6. **Payroll** — `getTotalWorkingDays()` has an infinite loop risk (mutable date in for-loop condition)
7. **Leave** — `getTeamLeaveCalendar()` crashes with `TypeError` when employee or leave type is deleted
8. **Hierarchy** — `getReportingChain()` has no cycle detection — circular hierarchy causes infinite loop
9. **Hierarchy** — `buildOrgChartNode()` is unbounded recursive — circular hierarchy causes stack overflow
10. **Geo-Tracking** — `captureLocation()` calls `navigator.geolocation` (browser API) in Node.js — always crashes
11. **Dashboard** — Audit log insert ID extraction broken — every audit log creation crashes

### Broken Features (Completely Non-Functional)
12. **Notifications** — In-app notifications never saved to DB — lost on every request
13. **Notifications** — Push notifications are stubs — no FCM calls ever made
14. **Notifications** — Email notifications only `console.log`'d — never sent
15. **Training** — `autoUpdateSkillsOnCompletion()` is empty — training completion has no effect
16. **Leave** — Route ordering bug — `team-calendar` and `balance` endpoints are unreachable
17. **Recruitment** — Route `/certifications/expiring` is unreachable (caught by `/:employeeId`)
18. **Dashboard** — "New hires this month" always shows 0 (queries non-existent column `join_date`)

### Financial / Data Integrity
19. **Payroll** — Holiday double-counted in paid days — employees are systematically overpaid
20. **Payroll** — Only first approved advance deducted — multiple advances silently skipped
21. **Payroll** — Rejection stores `approved_by`/`approved_at` — audit trail shows approvals for rejections
22. **Recruitment** — `CreateJobPostingDTO` fields don't match what controller sends — jobs never saved correctly
23. **Recruitment** — Interview status `'Scheduled'` vs `'scheduled'` case mismatch — query always returns 0
24. **Performance** — 4 service method signatures don't match tests — all performance tests fail
25. **Performance** — Wrong dependency injected in controller (`goalRepository` vs `reviewCycleRepository`)
26. **Separation** — F&F settlement missing tax/statutory deductions — settlement amounts legally incorrect
27. **Separation** — Day-rate uses 30 days for one component and 26 for another — inconsistent settlement

---

## High-Impact Patterns Across Modules

### Pattern 1: Unsafe Array Destructuring After `.returning('*')`
Appears in **12+ repository files**. `const [record] = await ...returning('*')` returns `undefined` silently when 0 rows are affected (e.g., update on non-existent ID), and callers never receive an error.
**Files:** `employeeRepository`, `payrollRepository`, `trainingProgramRepository`, `certificationRepository`, `fnfSettlementRepository`, `resignationRepository`, and others.

### Pattern 2: `as any` Middleware Casts on Routes
Appears in **all 14 modules**. Every route file casts `authenticateToken as any` and `authorize([...]) as any`, eliminating TypeScript's type safety for middleware.

### Pattern 3: All Errors Return HTTP 400
Appears in **auth, payroll, recruitment, training** controllers. Every catch block returns `400 Bad Request` regardless of the actual error type (validation error, not-found, server error, etc.).

### Pattern 4: `JSON.parse()` Without try/catch
Appears in **hierarchy, geo-tracking, audit log, separation, exit interview** repositories. A single corrupted database row crashes an entire endpoint.

### Pattern 5: N+1 Query Problems
Appears in **leave (team calendar), payroll (leave data), training (skill gap), hierarchy (direct reports), geo-tracking** — separate DB queries inside loops instead of JOIN queries.

### Pattern 6: Missing Existence Checks Before Update/Delete
Appears in **employee, leave, training, separation** — update/delete operations that silently succeed when the target record doesn't exist.

### Pattern 7: Hardcoded Placeholder Values
Appears in **recruitment (offer letters), notifications (templates), interview emails** — `example.com` URLs and `'HR Team'` strings left in production code paths.

### Pattern 8: No Transaction on Multi-Step DB Operations
Appears in **leave approval, payroll processing, hierarchy assignment, separation settlement** — two or more DB writes that can leave records in inconsistent states if one fails.

---

## Recommended Fix Priority

### Phase 1 — Crash & Security (Fix Immediately)
- Fix infinite loops in hierarchy (cycle detection)
- Remove `navigator.geolocation` from backend
- Fix audit log insert ID extraction
- Fix OAuth token URL exposure
- Add admin authorization to file cleanup routes
- Remove hardcoded JWT/Session secret defaults
- Fix `getTotalWorkingDays()` loop
- Implement in-app/push/email notification delivery
- Fix "new hires" dashboard query column name

### Phase 2 — Financial Integrity (Fix Before Payroll Run)
- Fix holiday double-counting in paid days
- Fix advance salary `.first()` — only first deduction applied
- Fix rejection storing `approved_by` fields
- Fix F&F daily rate inconsistency (30 vs 26 days)
- Add tax/statutory deductions to F&F settlement
- Fix `CreateJobPostingDTO` field mismatch

### Phase 3 — Broken Endpoints (Fix Before Next Release)
- Fix all route ordering bugs (leave, training, recruitment)
- Fix interview status case mismatch
- Align performance service method signatures with tests
- Fix wrong dependency injection in performance controller
- Implement `autoUpdateSkillsOnCompletion()`

### Phase 4 — Data Integrity & Quality
- Add circular reference checks to hierarchy tree traversal
- Wrap all multi-step operations in transactions
- Add `JSON.parse()` try/catch in all repositories
- Fix array destructuring on `.returning('*')` results
- Sanitize CSV export (newline escaping, CSV injection)
- Implement proper department manager access scoping

### Phase 5 — Code Quality
- Replace all `as any` middleware casts with proper types
- Standardize HTTP status codes (400 vs 404 vs 500)
- Replace inline `require('uuid')` calls with top-level imports
- Replace `console.log/error` with structured logger
- Add input validation (isNaN, format checks) consistently
