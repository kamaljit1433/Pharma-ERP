# Leave Module - Error Report

**Module:** Leave Management
**Files Analyzed:**
- `src/controllers/leaveController.ts`
- `src/services/leaveService.ts`
- `src/services/holidayService.ts`
- `src/repositories/leaveRepository.ts`
- `src/repositories/holidayRepository.ts`
- `src/routes/leave.ts`
- `src/types/leave.ts`

---

## CRITICAL Issues

### 1. Null Reference Crash in `getTeamLeaveCalendar`
- **File:** `src/services/leaveService.ts` — Lines 141–157
- **Description:** After querying `employees` and `leave_types` tables, there is no null check. If an employee or leave type is deleted after the leave was created, `employee.first_name` and `leaveType.name` will throw `"Cannot read property 'first_name' of undefined"` at runtime.
- **Fix:** Add null guards: `if (!employee || !leaveType) continue;` (or throw a descriptive error).

### 2. Route Ordering Bug — Specific Routes Unreachable
- **File:** `src/routes/leave.ts` — Lines 57–69
- **Description:** In Express, routes are matched in declaration order. Routes like `GET /leaves/:id/...` appear before `GET /leaves/team-calendar` and `GET /leaves/balance/:employeeId`. As a result, Express matches `/leaves/team-calendar` as `/:id` with `id = "team-calendar"`, routing to the wrong handler. The team calendar and balance endpoints are effectively unreachable.
- **Fix:** Register all specific static routes (`/team-calendar`, `/balance/:employeeId`) BEFORE any parameterized routes (`/:id`, `/:id/approve`).

### 3. Leave Day Calculation — Off-by-One / Timezone Bug
- **File:** `src/services/leaveService.ts` — Lines 226–231 / `src/repositories/leaveRepository.ts` — Lines 107–112
- **Description:** The formula `Math.ceil(diffTime / 86400000) + 1` has two issues:
  1. `Math.ceil` on millisecond differences produces wrong counts when dates near midnight boundaries (1 hour difference becomes 1 day, then `+1` makes it 2).
  2. Dates are parsed from strings without UTC anchoring — server timezone affects the result, making same-day leave return 0 or 1 unpredictably.
- **Fix:** Parse dates as UTC midnight: `new Date(dateStr + 'T00:00:00Z')`, use `Math.round` instead of `Math.ceil`, and remove the arbitrary `+1`.

### 4. `from_date > to_date` Not Validated
- **File:** `src/services/leaveService.ts` — Lines 23–54
- **Description:** `applyLeave()` calls `calculateDays(from_date, to_date)` without first checking that `from_date <= to_date`. A reversed date range produces a negative or nonsense day count and creates an invalid leave record.
- **Fix:** Add an explicit check: `if (new Date(data.from_date) > new Date(data.to_date)) throw new Error(...)`.

---

## HIGH Issues

### 5. `approverId` Can Be `undefined` — Passed to Service Without Validation
- **File:** `src/controllers/leaveController.ts` — Lines 141, 151, 173
- **Description:** `const approverId = (req as any).user?.id;` can be `undefined` if the token middleware doesn't set `user`. This undefined value is passed directly to `approveLeave()`, `rejectLeave()`, etc., corrupting audit trails.
- **Fix:** Validate `approverId` exists before proceeding; return `401` if not found.

### 6. Approval Routing Failure Silently Ignored
- **File:** `src/services/leaveService.ts` — Lines 60–70
- **Description:** If `approvalRoutingService.routeApprovalRequest()` fails, the error is `console.error`'d but the leave is still created and returned. A leave request can exist without ever entering the approval workflow — bypassing governance controls entirely.
- **Fix:** Either re-throw the error (blocking leave creation) or explicitly handle the failed-routing state and notify an admin.

### 7. No Transaction for `approveLeave` — Balance and Status Can Desync
- **File:** `src/services/leaveService.ts` — Lines 75–102
- **Description:** `leaveBalanceRepository.deductBalance()` and `leaveRepository.updateLeaveStatus()` are two separate DB operations without a transaction. If deduction succeeds but status update fails, the employee loses balance without the leave being approved.
- **Fix:** Wrap both operations in a Knex transaction.

### 8. Balance Not Re-Validated at Approval Time
- **File:** `src/services/leaveService.ts` — Line 93
- **Description:** Leave balance is checked when the request is created (`applyLeave`), but by the time a manager approves it, another leave may have been approved in between, depleting the balance. There is no re-check at approval time.
- **Fix:** Validate available balance again inside `approveLeave()` before deducting.

### 9. `updateHoliday` Does Not Set `updated_at`
- **File:** `src/repositories/holidayRepository.ts` — Lines 45–54
- **Description:** The update call passes `data` directly without setting `updated_at`. Holiday edits leave no timestamp trail.
- **Fix:** Spread `updated_at: this.knex.fn.now()` into the update object.

### 10. Race Condition in Holiday Duplicate Check
- **File:** `src/services/holidayService.ts` — Lines 13–22
- **Description:** Existence is checked with a `SELECT`, then a separate `INSERT` is issued. A concurrent request between those two operations will pass the check and also insert, creating duplicate holidays.
- **Fix:** Use a database unique constraint on `holiday_date` and handle the constraint violation error, or use `INSERT ... ON CONFLICT DO NOTHING`.

---

## MEDIUM Issues

### 11. N+1 Query in `getTeamLeaveCalendar`
- **File:** `src/services/leaveService.ts` — Lines 140–157
- **Description:** For each leave record in the team calendar, two separate `SELECT` queries are fired (one for employee, one for leave type). This is O(2n) queries.
- **Fix:** Rewrite with a single JOIN query: `knex('leaves').join('employees', ...).join('leave_types', ...)`.

### 12. No Transaction in `applyLeave` for Multi-Step Writes
- **File:** `src/services/leaveService.ts` — Lines 23–70
- **Description:** Leave record creation and approval routing are separate operations without a transaction. If routing fails after the leave is inserted, there is a dangling leave record with no approval workflow.
- **Fix:** Wrap the leave insert and routing call in a transaction; roll back if routing fails.

### 13. `days_count` Used from DB Without Recalculation
- **File:** `src/services/leaveService.ts` — Line 93
- **Description:** `leave.days_count` is read from the database and used as the deduction amount without verifying it still matches the leave's current date range. If dates were ever modified, the stored count could be stale.
- **Fix:** Recalculate days from `leave.from_date` / `leave.to_date` at approval time.

### 14. Date Strings Parsed Without Timezone
- **File:** `src/services/leaveService.ts` — multiple date parse locations
- **Description:** `new Date(data.from_date).getFullYear()` parses dates using local timezone. On a UTC server, a date string like `"2024-12-31"` might be interpreted as Dec 30 UTC.
- **Fix:** Always parse with explicit UTC: `new Date(data.from_date + 'T00:00:00Z')`.

### 15. All Routes Use `authenticateToken as any`
- **File:** `src/routes/leave.ts` — Lines 11, 15, 19, 23, 27, 32, 36, 40, 44, 48, 53, 57, 61, 65, 69
- **Description:** All 15+ route definitions cast middleware with `as any`, bypassing TypeScript type checking for middleware signatures.
- **Fix:** Properly type the middleware with an extended `RequestHandler` interface.

### 16. Missing Input Validation on DTO Fields
- **File:** `src/types/leave.ts`
- **Description:** `LeaveApplicationDTO` accepts any string for `from_date`/`to_date` with no format enforcement. Invalid date strings (e.g., `"not-a-date"`) will silently produce `NaN` in `new Date(...)`.
- **Fix:** Validate date format (ISO 8601) at the controller level before passing to service.

---

## LOW Issues

### 17. `Math.abs()` Masks Date Order Bug
- **File:** `src/services/leaveService.ts` — Line 227
- **Description:** `Math.abs(to - from)` means if `from > to` the calculation still produces a positive result, hiding the invalid input. Defensive code should fail fast on bad input.
- **Fix:** Remove `Math.abs()` and let the negative result surface, or add the explicit date order check (Issue #4).

### 18. `calculateDays` Duplicated in Two Files
- **File:** `src/services/leaveService.ts` — Lines 226–231 AND `src/repositories/leaveRepository.ts` — Lines 107–112
- **Description:** Identical logic in two places. If a bug is fixed in one, the other remains broken.
- **Fix:** Extract to a shared utility function in `src/utils/`.

### 19. Non-UUID ID Generation in `approvalRoutingService`
- **File:** `src/services/approvalRoutingService.ts` — Line 417
- **Description:** `${Date.now()}-${Math.random().toString(36).substr(2, 9)}` is used instead of `uuidv4()`. While collision probability is low, UUIDs are the proper tool here.
- **Fix:** Use `uuidv4()` from the already-installed `uuid` package.

### 20. Inconsistent Error Messages Across Leave Operations
- **File:** `src/services/leaveService.ts` — multiple locations
- **Description:** Similar error conditions produce different messages: `"Leave balance not initialized"`, `"Leave balance not found"`, `"Insufficient leave balance"`. Clients must handle multiple strings for similar scenarios.
- **Fix:** Standardize error messages using error code constants.

### 21. Carry Forward Logic Doesn't Handle Cross-Year Leaves
- **File:** `src/services/leaveService.ts` — Lines 162–217
- **Description:** `applyCarryForwardRules` uses the `from_date` year for all carry-forward logic. A leave spanning two calendar years (e.g., Dec 28 – Jan 3) will only consider the start year.
- **Fix:** Handle cross-year leaves explicitly, or restrict leaves from spanning year boundaries.

---

## Summary

| Severity | Count |
|----------|-------|
| Critical | 4     |
| High     | 6     |
| Medium   | 6     |
| Low      | 5     |
| **Total**| **21**|

### Top Priority Fixes
1. Fix route ordering — team-calendar and balance endpoints are currently unreachable
2. Add null checks in `getTeamLeaveCalendar` — crashes on deleted employees/leave types
3. Validate `from_date <= to_date` before any calculation
4. Wrap `approveLeave` balance deduction + status update in a transaction
5. Fix day calculation timezone and off-by-one issues
6. Re-validate leave balance at approval time (not just at apply time)
