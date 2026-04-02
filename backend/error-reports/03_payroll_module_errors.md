# Payroll Module - Error Report

**Module:** Payroll Management
**Files Analyzed:**
- `src/controllers/payrollController.ts`
- `src/services/payrollCalculationService.ts`
- `src/services/payrollProcessingService.ts`
- `src/services/payslipService.ts`
- `src/services/advanceSalaryService.ts`
- `src/services/salaryStructureService.ts`
- `src/repositories/payrollRepository.ts`
- `src/repositories/advanceSalaryRepository.ts`
- `src/routes/payroll.ts`
- `src/types/payroll.ts`

---

## CRITICAL Issues

### 1. Holiday Double-Counted in Paid Days Calculation
- **File:** `src/services/payrollCalculationService.ts` — Lines 168–173
- **Description:** `calculatePaidDays()` adds `holidayCount` on top of `presentDays + paidLeaveDays`. Holidays are already excluded from `totalWorkingDays`, so adding them again inflates the paid day count — employees are overpaid.
- **Fix:** Remove `holidayCount` from the paid days formula.

### 2. Potential Infinite Loop in `getTotalWorkingDays()`
- **File:** `src/services/payrollCalculationService.ts` — Lines 181–186
- **Description:** The `for` loop uses `d.setDate(d.getDate() + 1)` as the increment. `setDate()` mutates the date in-place and returns a number, not the Date object. In certain edge cases or JS engine versions, the loop condition `d <= endDate` can behave unexpectedly, risking an infinite loop and crashing the process.
- **Fix:** Use `d = new Date(d.getTime() + 86400000)` (explicit millisecond addition) or a proper date library.

### 3. Encrypted Bank Account Number Written to CSV in Plaintext
- **File:** `src/services/payrollProcessingService.ts` — Lines 244, 265
- **Description:** `generateCSVFile()` and `generateNEFTFile()` write `bankAccount.account_number_encrypted` directly into the export file. The variable name implies encryption, but it is being output as a raw string in a downloadable/emailed file — exposing sensitive financial data.
- **Fix:** Decrypt only in a secure context, or mask the account number before including in exports (e.g., `****1234`).

### 4. Only First Advance Salary Deducted When Multiple Exist
- **File:** `src/services/payrollCalculationService.ts` — Lines 331–336
- **Description:** `getAdvanceSalaryDeduction()` uses `.first()` which returns only one approved advance per employee. If an employee has multiple approved advances, only the first is ever deducted. Remaining advances are silently skipped.
- **Fix:** Query all approved advances and sum the deduction amounts.

### 5. Rejection Uses `approved_by` / `approved_at` Fields
- **File:** `src/repositories/advanceSalaryRepository.ts` — Lines 76–80
- **Description:** `rejectAdvanceRequest()` sets `approved_by`, `approval_notes`, and `approved_at` fields when status is `'rejected'`. This corrupts the audit trail — rejections appear as approvals in the database.
- **Fix:** Use the correct fields: `rejected_by`, `rejection_notes`, `rejected_at` (add them to schema if missing).

### 6. All Payroll Errors Return HTTP 400
- **File:** `src/controllers/payrollController.ts` — Lines 45–50, 74–77, 95–99, 127–131, 154–157, 177–181, 194–199, 220–224
- **Description:** Every catch block in the controller returns `400 Bad Request` regardless of error type. Server errors (DB failures, calculation crashes) should return `500`, validation errors `400`, not-found `404`. Clients cannot distinguish error types.
- **Fix:** Inspect error type/code and return the appropriate HTTP status.

---

## HIGH Issues

### 7. `unlockPayroll` Does Not Record Who Unlocked
- **File:** `src/services/payrollProcessingService.ts` — Line 173
- **Description:** `updatePayrollStatus()` is called without the `processedBy` parameter, so the `unlocked_by` audit field is never set.
- **Fix:** Pass the authenticated user ID to `updatePayrollStatus()`.

### 8. `markPayrollAsPaid` Does Not Record Who Paid
- **File:** `src/services/payrollProcessingService.ts` — Line 194
- **Description:** Same issue — `paid_by` is never populated, making it impossible to audit who authorized payment.
- **Fix:** Pass the authenticated user ID.

### 9. Payslip Generation Failure Fails Entire Payroll Run
- **File:** `src/services/payrollProcessingService.ts` — Lines 97–102
- **Description:** If `generatePayslip()` throws, the entire payroll processing for that employee (and potentially others) fails. Payslip generation is a non-critical step and should not block salary processing.
- **Fix:** Wrap payslip generation in its own try/catch; log failures and continue processing.

### 10. `deduction_months` Not Validated in Advance Salary
- **File:** `src/services/advanceSalaryService.ts` — Lines 15–64
- **Description:** If `deduction_months` is not provided, the repository silently defaults to 1, causing the full advance to be deducted in a single month regardless of salary capacity.
- **Fix:** Validate and enforce a sensible default/minimum in the service layer.

---

## MEDIUM Issues

### 11. N+1 Query in `getLeaveData()`
- **File:** `src/services/payrollCalculationService.ts` — Lines 134–146
- **Description:** For each leave record, a separate `SELECT` is made to `leave_types`. With many leaves per employee this becomes O(n) queries.
- **Fix:** Use a single `JOIN` query to fetch leaves with their types in one round trip.

### 12. Month Boundary Calculations Use Local Timezone
- **File:** `src/services/payrollCalculationService.ts` — Lines 106–107
- **Description:** `new Date(year, month - 1, 1)` uses the server's local timezone. On servers in non-UTC timezones, month boundaries shift, causing attendance records to be missed or duplicated.
- **Fix:** Use UTC: `new Date(Date.UTC(year, month - 1, 1))`.

### 13. `month` and `year` Not Validated in Export Route
- **File:** `src/controllers/payrollController.ts` — Lines 208–210
- **Description:** `parseInt(month)` and `parseInt(year)` are passed directly to the service without `isNaN` checks. Invalid inputs like `month=abc` produce `NaN` silently.
- **Fix:** Add `isNaN` guards and return `400` with a clear message.

### 14. Payslip Shows Only Total Gross — No Component Breakdown
- **File:** `src/services/payslipService.ts` — Lines 113–120
- **Description:** `extractEarnings()` only stores `gross_salary`. The detailed component breakdown (Base, HRA, DA, etc.) produced during calculation is discarded. Employees cannot verify their salary components from their payslip.
- **Fix:** Serialize the full earnings component array into the payslip.

### 15. Payslip Shows Only Total Deductions — No Component Breakdown
- **File:** `src/services/payslipService.ts` — Lines 123–129
- **Description:** `extractDeductions()` stores only `total_deductions`. PF, ESI, TDS, and other components are lost. Employees cannot verify individual deductions.
- **Fix:** Serialize the full deductions component array.

### 16. Employees Without Bank Accounts Silently Skipped in Export
- **File:** `src/services/payrollProcessingService.ts` — Lines 243, 264
- **Description:** If an employee has no primary bank account, they are silently excluded from the bank export file. No warning or error is raised, so payroll admins don't know a payment was missed.
- **Fix:** Collect and return a list of skipped employees with the reason.

### 17. `(req as any).user` Used Without Type Safety
- **File:** `src/controllers/payrollController.ts` — Lines 38, 88, 188
- **Description:** `(req as any).user?.id` bypasses TypeScript and can silently produce `undefined` user IDs in audit logs.
- **Fix:** Type `req` properly using an extended Express `Request` interface.

### 18. `undefined as any` in Repository Row Mapping
- **File:** `src/repositories/payrollRepository.ts` — Lines 156–157
- **Description:** Nullable date fields are cast with `undefined as any` to bypass TypeScript. This hides type errors when these fields are accessed downstream.
- **Fix:** Use proper optional typing: `processed_at?: Date`.

### 19. `_updatedBy` Parameter Accepted but Never Used
- **File:** `src/services/salaryStructureService.ts` — Line 97
- **Description:** The `_updatedBy` parameter is accepted but never written to the audit log or database. Salary structure changes cannot be attributed to a user.
- **Fix:** Pass `updatedBy` to the repository and store it.

---

## LOW Issues

### 20. TDS Threshold Hardcoded
- **File:** `src/services/payrollCalculationService.ts` — Line 312
- **Description:** The `50000` TDS threshold is hardcoded. Different companies and tax years require different thresholds.
- **Fix:** Move to configuration or a tax rules table.

### 21. Daily Hours Hardcoded to 8
- **File:** `src/services/payrollCalculationService.ts` — Line 253
- **Description:** `paidDays * 8` assumes an 8-hour workday. Companies with different schedules will get wrong hourly calculations.
- **Fix:** Make hours-per-day configurable per employee or company setting.

### 22. Leave Day Calculation Off-by-One
- **File:** `src/services/payrollCalculationService.ts` — Line 361
- **Description:** Adding `+ 1` to the day difference makes a 1-day leave count as 2 days. The inclusive range logic is inconsistent with how attendance days are counted elsewhere.
- **Fix:** Align the inclusive/exclusive boundary logic across all day-counting functions.

### 23. Route Pattern Ambiguity
- **File:** `src/routes/payroll.ts` — Lines 34–45
- **Description:** Routes `/:employeeId/:month/:year` and `/payslip/:id` may conflict in Express. A 3-segment path could be matched by the first route before reaching the second.
- **Fix:** Prefix the payslip route distinctly (e.g., `/payslips/:id`) or reorder routes.

### 24. Timestamp-Based Payslip Number Not Unique Under Concurrency
- **File:** `src/services/payslipService.ts` — Line 110
- **Description:** `PS-${employeeId}-${year}${monthStr}-${Date.now()}` can produce duplicates if two payslips are generated in the same millisecond.
- **Fix:** Use a UUID or a database sequence for payslip numbers.

### 25. Employee Processing Errors Only Logged to Console
- **File:** `src/services/payrollProcessingService.ts` — Lines 108–114
- **Description:** Errors during individual employee payroll processing are `console.error`'d but not tracked or surfaced to the caller. Admins have no way to see which employees failed.
- **Fix:** Collect failed employees in an array and include them in the response.

### 26. Unused `_paidDays` and `_totalWorkingDays` Parameters
- **File:** `src/services/payrollCalculationService.ts` — Lines 269–270
- **Description:** These parameters are prefixed with `_` (unused) in `calculateDeductions()`. Deductions are therefore NOT prorated based on days worked — an employee on unpaid leave still gets full deductions calculated.
- **Fix:** Implement prorated deduction logic using these values or remove the parameters.

---

## Summary

| Severity | Count |
|----------|-------|
| Critical | 6     |
| High     | 4     |
| Medium   | 9     |
| Low      | 7     |
| **Total**| **26**|

### Top Priority Fixes
1. Fix paid days holiday double-counting (employees overpaid)
2. Fix `getTotalWorkingDays` loop (crash risk)
3. Remove encrypted bank account from CSV/NEFT exports (security breach)
4. Fix advance salary `.first()` — only one deduction applied when multiple exist
5. Fix rejection storing `approved_by` fields (audit trail corruption)
6. Add error breakdown to HTTP responses (all errors return 400)
