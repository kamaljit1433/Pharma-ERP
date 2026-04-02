# Dashboard, Reports & Audit Logging - Error Report

**Module:** Dashboard Analytics, Reports & Audit Logging
**Files Analyzed:**
- `src/controllers/dashboardController.ts`
- `src/controllers/reportController.ts`
- `src/services/dashboardService.ts`
- `src/services/reportService.ts`
- `src/services/auditLogService.ts`
- `src/repositories/auditLogRepository.ts`
- `src/repositories/notificationRepository.ts`
- `src/routes/dashboard.ts`
- `src/routes/reports.ts`

---

## CRITICAL Issues

### 1. Dashboard Queries Use Wrong Column Name — `join_date` Does Not Exist
- **File:** `src/services/dashboardService.ts` — Lines 75–76
- **Description:** The query filters with `.where('join_date', '>=', monthStart)` but the actual column in the `employees` table is `date_of_joining`. This query always returns 0 results — the "new hires this month" dashboard stat is always empty.
- **Fix:** Replace `'join_date'` with `'date_of_joining'`.

### 2. Audit Log Insert ID Not Properly Captured
- **File:** `src/repositories/auditLogRepository.ts` — Lines 42–57
- **Description:** After the insert, `getById(id)` is called to retrieve the created record, but `id` is extracted from the `.returning('*')` result incorrectly — the destructuring pattern `const [id]` extracts the first element of the array (the full row object), not the ID field. `getById(rowObject)` will never find a matching record, causing every audit log creation to crash.
- **Fix:** Use `const [record] = await ...; return record;` directly instead of re-querying.

### 3. `COUNT(*)` Query Returns String — Not Cast to Number
- **File:** `src/services/dashboardService.ts` — Lines 34–35
- **Description:** `count('* as count')` from Knex returns the count as a **string** in PostgreSQL (e.g., `"42"` not `42`). Using this value directly in arithmetic produces `NaN` or string concatenation instead of numeric addition.
- **Fix:** Wrap with `Number(result?.count ?? 0)` or use `knex.count('*').as('count')` with explicit casting.

---

## HIGH Issues

### 4. Controller Accesses Service Methods Via Bracket Notation
- **File:** `src/controllers/dashboardController.ts` — Lines 25, 40, 55, 70
- **Description:** `dashboardService['getEmployeeStatistics']()` uses bracket notation, implying either the method is private or doesn't exist on the typed interface. This bypasses TypeScript's type checking and will break silently if the method is renamed.
- **Fix:** Make the method public and call it directly: `dashboardService.getEmployeeStatistics()`.

### 5. Hardcoded Check-In Time `'09:00:00'` in Attendance Query
- **File:** `src/services/dashboardService.ts` — Line 154
- **Description:** Late attendance is computed by comparing `check_in_time > '09:00:00'`. This hardcoded time does not account for different shifts, flexible work hours, or timezone differences. All employees are evaluated against 9 AM regardless of their actual shift.
- **Fix:** Join with the employee's shift schedule to determine the correct expected check-in time per employee.

### 6. Report CSV Export Uses First Row Keys for All Rows — Columns Can Misalign
- **File:** `src/services/reportService.ts` — Line 363
- **Description:** `Object.keys(rows[0])` is used to define CSV column headers. If subsequent rows have different or additional keys (e.g., from a LEFT JOIN returning NULLs for some rows), those columns are missing from the header, causing misaligned CSV data.
- **Fix:** Collect the union of all keys from all rows, or use a predefined column list.

### 7. CSV Export Does Not Escape Newlines — Breaks CSV Format
- **File:** `src/services/reportService.ts` — Lines 368–379
- **Description:** If any data field contains a newline character (`\n`), it will break the CSV row structure, making the exported file unparseable by standard CSV parsers.
- **Fix:** Escape newlines (`\n` → `\\n`) and properly quote fields containing commas, quotes, or newlines.

### 8. CSV Export Vulnerable to CSV Injection
- **File:** `src/controllers/reportController.ts` — Lines 24–28
- **Description:** Report data is written directly to CSV without sanitizing fields that begin with `=`, `@`, `+`, or `-`. Spreadsheet applications (Excel, Google Sheets) will interpret these as formulas, enabling CSV injection attacks.
- **Fix:** Prefix dangerous characters with a single quote `'` or wrap all values in double quotes with proper escaping.

### 9. `CONCAT()` Function Used — Not Portable / Fails on Some DB Configurations
- **File:** `src/services/reportService.ts` — Lines 80, 136, 191
- **Description:** `CONCAT(first_name, ' ', last_name)` is used in raw SQL. While PostgreSQL supports `CONCAT()`, it is not universally available in all DB engines and certain configurations. Additionally, this is database-specific raw SQL mixed into Knex queries, reducing portability.
- **Fix:** Use `||` operator for PostgreSQL string concatenation inside Knex raw: `knex.raw("first_name || ' ' || last_name as full_name")`.

### 10. Report Query with LEFT JOINs Returns Duplicate Rows
- **File:** `src/services/reportService.ts` — Lines 17–34
- **Description:** LEFT JOINs on `hierarchy_nodes` and related tables without a `.distinct()` call. If an employee has multiple hierarchy records, they appear multiple times in the report.
- **Fix:** Add `.distinct('employees.id')` or aggregate the hierarchy data differently.

### 11. `req.user` Defaults to String `'system'` — Masks Auth Failures
- **File:** `src/controllers/reportController.ts` — Line 21
- **Description:** `req.user?.id || 'system'` silently defaults to `'system'` if the user is not authenticated. Report generation continues without a real user identity, making audit records unattributable.
- **Fix:** Return `401` if `req.user` is not set; never default to a fake identity.

### 12. `ilike` Used in Audit Log Search — Not Portable
- **File:** `src/repositories/auditLogRepository.ts` — Line 148
- **Description:** `ilike` is PostgreSQL-specific. SQLite and MySQL do not support it — the query will fail if the database changes.
- **Fix:** Use `.where(knex.raw('LOWER(column)'), 'like', `%${search.toLowerCase()}%`)` for portability.

### 13. Old Audit Log Deletion Ignores Timezone
- **File:** `src/repositories/auditLogRepository.ts` — Lines 224–230
- **Description:** Deletion of audit logs older than N days uses server-local date arithmetic. If the server timezone changes (e.g., after a deploy in a new region), logs may be deleted earlier or later than intended.
- **Fix:** Use UTC dates for all time-based deletion queries.

---

## MEDIUM Issues

### 14. Null Values in Dashboard Row Fields Not Guarded
- **File:** `src/services/dashboardService.ts` — Lines 43–56, 167–175
- **Description:** `row.status`, `row.department_id`, `row.designation_id`, `row.first_name`, and `row.last_name` are used as object keys and in string concatenation without null guards. A null value in any of these causes a runtime error or incorrect data.
- **Fix:** Add null coalescing: `row.status ?? 'unknown'`, `(row.first_name ?? '') + ' ' + (row.last_name ?? '')`.

### 15. `CASE WHEN` in Aggregate SQL — Database-Specific
- **File:** `src/services/dashboardService.ts` — Lines 239–241
- **Description:** Raw `CASE WHEN` SQL inside a `sum()` call is valid PostgreSQL but not universally portable. Mixing raw SQL strings with Knex reduces maintainability.
- **Fix:** Use Knex's `.sum(knex.raw('CASE WHEN ... END'))` or restructure using application-level aggregation.

### 16. `auditLogService` Does Not Validate Input Fields
- **File:** `src/services/auditLogService.ts` — Lines 33–98
- **Description:** `userId`, `userRole`, `action`, etc. are accepted without validation. An empty string `userId` or null `action` is stored in the audit log without error.
- **Fix:** Validate required fields (at minimum `userId` and `action`) before creating the record.

### 17. `auditLogService` Uses Singleton Repository — Not Injectable
- **File:** `src/services/auditLogService.ts` — Line 6
- **Description:** `auditLogRepository` is imported as a module-level singleton rather than injected via constructor. This makes the service untestable in isolation (cannot mock the repository) and couples it to the concrete implementation.
- **Fix:** Accept `auditLogRepository` as a constructor parameter.

### 18. `JSON.parse()` in Audit Log Retrieval Without Error Handling
- **File:** `src/repositories/auditLogRepository.ts` — Line 245
- **Description:** `JSON.parse()` on stored changes without try/catch. A corrupted audit log record crashes the retrieval endpoint.
- **Fix:** Wrap in try/catch; return the raw string on parse failure.

### 19. `JSON.stringify()` on Audit Changes Without Circular Reference Guard
- **File:** `src/repositories/auditLogRepository.ts` — Line 50
- **Description:** `JSON.stringify(changes)` is called without error handling. If the `changes` object contains a circular reference, this throws an unhandled exception.
- **Fix:** Wrap in try/catch; use a replacer function to handle circular references.

### 20. Dashboard Payroll Stats Accessible with Only `view_dashboard` Permission
- **File:** `src/routes/dashboard.ts` — Lines 10–15
- **Description:** Payroll-related dashboard statistics (salary totals, deductions) require only the `view_dashboard` permission. These sensitive financial figures should require a more privileged permission (e.g., `view_payroll`).
- **Fix:** Separate payroll stats into a distinct endpoint with a higher permission requirement.

---

## LOW Issues

### 21. Unused `db` Import in Dashboard Controller
- **File:** `src/controllers/dashboardController.ts` — Line 5
- **Description:** `const db = getKnexInstance()` is imported and initialized but never used — the controller delegates to `dashboardService`.
- **Fix:** Remove the unused import.

### 22. Inconsistent Authentication Import in Dashboard Route
- **File:** `src/routes/dashboard.ts` — Line 4
- **Description:** Imports `authenticate` while all other route files import `authenticateToken`. Either they are the same function under different names (which is confusing) or different functions (which is a bug).
- **Fix:** Standardize to one import name across all route files.

---

## Summary

| Severity | Count |
|----------|-------|
| Critical | 3     |
| High     | 9     |
| Medium   | 7     |
| Low      | 2     |
| **Total**| **21**|

### Top Priority Fixes
1. Fix `'join_date'` → `'date_of_joining'` — new hire dashboard stat always shows 0
2. Fix audit log insert ID extraction — every audit log creation currently crashes
3. Cast `COUNT(*)` result to number — used as string in arithmetic produces `NaN`
4. Sanitize CSV export output — vulnerable to CSV injection
5. Fix LEFT JOIN duplicate rows in reports
6. Remove `'system'` default for unauthenticated report generation
