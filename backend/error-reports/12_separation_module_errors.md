# HR Separation Module - Error Report

**Module:** Employee Separation, Exit Interviews, F&F Settlement & Asset Recovery
**Files Analyzed:**
- `src/controllers/separationController.ts`
- `src/services/separationService.ts`
- `src/repositories/exitInterviewRepository.ts`
- `src/repositories/fnfSettlementRepository.ts`
- `src/repositories/assetRecoveryRepository.ts`
- `src/repositories/resignationRepository.ts`
- `src/routes/separation.ts`

---

## CRITICAL Issues

### 1. `require('uuid')` Inline Instead of Import — Called 6 Times
- **File:** `src/services/separationService.ts` — Lines 138, 460, 496, 529, 731, 784
- **Description:** `require('uuid').v4()` is called inline six times throughout the service instead of being imported once at the top. Beyond being inefficient (module resolved on every call), this is inconsistent with every other file in the codebase. More critically, if the `uuid` package is ever removed or renamed, these will produce runtime errors instead of compile-time errors.
- **Fix:** Add `import { v4 as uuidv4 } from 'uuid'` at the top; replace all inline calls.

### 2. F&F Settlement Insert Assumes Non-Empty Return
- **File:** `src/repositories/fnfSettlementRepository.ts` — Lines 25–44, 77–96
- **Description:** `const [settlement] = await this.knex('fnf_settlements').insert(...).returning('*')` destructures assuming the array always has an element. If a database constraint violation or race condition causes the insert to return an empty array, `settlement` is `undefined` and the subsequent property access crashes with `TypeError`.
- **Fix:** Check array length after insert: `if (!settlement) throw new Error('Failed to create settlement record')`.

### 3. Inconsistent Day-Rate Calculation — 30 vs 26 Days
- **File:** `src/services/separationService.ts` — Lines 322–323 vs Line 352
- **Description:** The F&F daily salary rate uses the actual number of days in the month (line 322–323) for one component, but hardcodes `26` working days for leave encashment (line 352). These two different divisors produce inconsistent per-day salary values within the same settlement.
- **Fix:** Pick one standard (e.g., 26 working days) and apply it consistently across all components, or make it configurable per company policy.

---

## HIGH Issues

### 4. Last Working Day Validation Uses Wrong Operator
- **File:** `src/services/separationService.ts` — Line 80
- **Description:** The condition `lastWorkingDayNorm <= resignationDateNorm` rejects same-day resignations (immediate effect). The error message says "must be after" but the intent likely is to allow same-day. The operator should be `<` not `<=`.
- **Fix:** Change `<=` to `<` to allow same-day last working day.

### 5. Hardcoded `'hr-team'` as Notification Recipient
- **File:** `src/services/separationService.ts` — Lines 105–111
- **Description:** Notifications on resignation are sent to the literal string `'hr-team'` which is not a real user ID or department reference. The notification will never reach a real person.
- **Fix:** Look up the actual HR department manager ID from the database; send to that user.

### 6. F&F Settlement Missing Tax and Statutory Deductions
- **File:** `src/services/separationService.ts` — Lines 254–268
- **Description:** The F&F calculation includes salary, leave encashment, gratuity, and advances — but omits:
  - Provident Fund (PF) deductions from final salary
  - Income Tax / TDS on settlement amounts
  - Labour Welfare Fund
  These are mandatory statutory deductions in most jurisdictions.
- **Fix:** Integrate with the payroll tax calculation service to compute statutory deductions on the settlement total.

### 7. Gratuity Calculation Crashes if `date_of_joining` is Missing
- **File:** `src/services/separationService.ts` — Lines 379–391
- **Description:** `new Date(employee.date_of_joining)` is called without a null check. If the employee record lacks `date_of_joining`, this produces `Invalid Date` and subsequent arithmetic returns `NaN`, silently producing a zero or incorrect gratuity.
- **Fix:** Validate `employee.date_of_joining` exists; throw a descriptive error if not.

### 8. Advance Salary Filter Misses `'pending'` Advances
- **File:** `src/services/separationService.ts` — Lines 410–420
- **Description:** Only advances with status `'approved'` or `'deducted'` are included in the F&F deduction. Advances with status `'pending'` (requested but not yet formally approved) that an HR admin intends to deduct are excluded, understating total deductions.
- **Fix:** Clarify the business rule; if pending advances should be included, add `'pending'` to the filter.

### 9. Notice Period Calculation Uses Imprecise Millisecond Rounding
- **File:** `src/services/separationService.ts` — Line 188
- **Description:** `Math.ceil(diffMs / (1000 * 60 * 60 * 24))` computes notice days from a raw millisecond difference. DST transitions and timezone offsets can cause a 23- or 25-hour day, making the ceil produce the wrong count.
- **Fix:** Use UTC-anchored date arithmetic; compare calendar days, not timestamps.

### 10. Employee Deactivation Does Not Verify User Record Exists
- **File:** `src/services/separationService.ts` — Line 727
- **Description:** `UPDATE users SET ... WHERE employee_id = ?` runs without first checking if the user record exists. If the employee has no linked user account, the update silently affects 0 rows with no error or indication.
- **Fix:** Check row count after update; throw if 0 rows were affected.

### 11. Offboarding Workflow Errors Only Logged to Console
- **File:** `src/services/separationService.ts` — Lines 760–798
- **Description:** Errors in the offboarding workflow are caught and `console.error`'d but otherwise swallowed. HR receives no notification that offboarding steps failed.
- **Fix:** Create an audit log entry for each failure; surface failures in the API response.

---

## MEDIUM Issues

### 12. Date Comparison Against `new Date()` Ignores Time Component
- **File:** `src/services/separationService.ts` — Line 128
- **Description:** `new Date(terminationDate) < new Date()` compares with the current timestamp. If termination is scheduled for "today", the comparison may fail depending on the time of day the check runs.
- **Fix:** Normalize both dates to midnight UTC before comparison.

### 13. Audit Log Uses `new Date()` Instead of DB Function
- **File:** `src/services/separationService.ts` — Lines 458–471
- **Description:** `created_at: new Date()` uses Node.js time instead of `this.db.fn.now()`. In high-load scenarios, JS time and DB time can diverge slightly, causing inconsistent audit trail timestamps.
- **Fix:** Use `this.knex.fn.now()` for all timestamps inserted via the DB.

### 14. JSON.stringify on Exit Interview Responses Without Circular Check
- **File:** `src/repositories/exitInterviewRepository.ts` — Line 44
- **Description:** `JSON.stringify(questionnaire_responses)` is called without error handling. If the object contains circular references, it throws an unhandled exception.
- **Fix:** Wrap in try/catch; validate the object is serializable before storage.

### 15. JSON.parse on Exit Interview Responses Without Error Handling
- **File:** `src/repositories/exitInterviewRepository.ts` — Lines 114–117
- **Description:** Parsing is done without a try/catch. A corrupted row crashes the entire endpoint.
- **Fix:** Wrap `JSON.parse` in try/catch; return the raw string on failure.

### 16. `assetRecoveryRepository` Spread Can Overwrite `updated_at`
- **File:** `src/repositories/assetRecoveryRepository.ts` — Line 39
- **Description:** `...data` spread in the update payload could include an `updated_at` field from the input DTO, overwriting the server-controlled timestamp.
- **Fix:** Explicitly omit `updated_at` from the spread and always set it via `this.knex.fn.now()`.

### 17. `damage_cost` Can Be Negative in Asset Recovery
- **File:** `src/repositories/assetRecoveryRepository.ts` — Lines 47–83
- **Description:** No validation prevents a negative `damage_cost` from being stored, which would incorrectly credit money back to an employee during F&F settlement.
- **Fix:** Validate `damage_cost >= 0` at the service level.

### 18. All `resignationRepository` Methods Use Unsafe Destructuring
- **File:** `src/repositories/resignationRepository.ts` — Lines 11, 37, 49, 62, 75
- **Description:** `const [record] = await ...returning('*')` is used without checking if the array is empty. Failed inserts/updates return `undefined` silently.
- **Fix:** Check array length after every `returning('*')` call; throw on empty result.

---

## LOW Issues

### 19. HTTP 201 Used for PUT Responses
- **File:** `src/controllers/separationController.ts` — Lines 115, 135, 243, 296, 333
- **Description:** PUT/PATCH update operations return `201 Created` instead of `200 OK`. `201` signals that a new resource was created.
- **Fix:** Return `200 OK` for successful updates.

### 20. Route Assigns Body Data to `req.params`
- **File:** `src/routes/separation.ts` — Lines 15, 48, 64
- **Description:** `req.params.employeeId = employeeId` manually copies from request body into params. Mixing body data into params is unusual, error-prone, and can confuse middleware that reads params.
- **Fix:** Pass `employeeId` as a URL path parameter (`:employeeId`) instead of in the request body.

---

## Summary

| Severity | Count |
|----------|-------|
| Critical | 3     |
| High     | 8     |
| Medium   | 7     |
| Low      | 2     |
| **Total**| **20**|

### Top Priority Fixes
1. Fix F&F settlement insert assuming non-empty return (crash risk)
2. Align day-rate calculation to one standard (30 vs 26 inconsistency distorts settlement amounts)
3. Add tax/statutory deductions to F&F settlement calculation
4. Add null check for `date_of_joining` before gratuity calculation
5. Fix hardcoded `'hr-team'` notification recipient
6. Add `'pending'` advance salary to F&F deduction filter
