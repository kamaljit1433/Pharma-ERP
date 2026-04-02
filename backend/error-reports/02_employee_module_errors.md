# Employee Module - Error Report

**Module:** Employee Management
**Files Analyzed:**
- `src/controllers/employeeController.ts`
- `src/services/employeeService.ts`
- `src/repositories/employeeRepository.ts`
- `src/routes/employees.ts`
- `src/types/employee.ts`

---

## HIGH Issues

### 1. NaN Validation Logic is Backwards (searchEmployees)
- **File:** `src/controllers/employeeController.ts` — Lines 76–79
- **Description:** `Math.min()` / `Math.max()` are called BEFORE the `isNaN()` check. If `parseInt()` returns `NaN`, `Math.min(NaN, 100)` also returns `NaN`, making the subsequent `isNaN` check operate on an already-corrupted value. The validation must happen before the Math operations.
- **Fix:** Check `isNaN(parsed)` immediately after `parseInt()`, before passing to `Math.min/max`.

### 2. No NaN Validation in `getAllEmployees`
- **File:** `src/controllers/employeeController.ts` — Lines 119–120, 129–130
- **Description:** `parseInt()` is called on `limit` and `offset` query params without any `isNaN` guard. A request like `?limit=abc` will silently pass `NaN` to the service/repository and cause incorrect pagination or database errors. `searchEmployees` has this check but `getAllEmployees` does not — inconsistent behavior.
- **Fix:** Add the same `isNaN` guard used in `searchEmployees`.

### 3. Missing Existence Check Before `updateEmergencyContact`
- **File:** `src/services/employeeService.ts` — Line 95
- **Description:** `updateEmergencyContact()` does not verify the contact exists before attempting the update. If an invalid `contactId` is supplied, the repository will silently update 0 rows and the caller receives no error.
- **Fix:** Fetch the contact first; throw a 404-style error if not found.

### 4. Missing Existence Check Before `deleteEmergencyContact`
- **File:** `src/services/employeeService.ts` — Line 98 / `src/repositories/employeeRepository.ts` — Lines 192–194
- **Description:** Deletion is performed without verifying the record exists. A delete on a non-existent `id` silently succeeds with 0 rows affected. There is also no verification that the contact belongs to the specified employee.
- **Fix:** Return the count of deleted rows or do a pre-check and throw if not found.

### 5. Array Destructuring on Possibly Empty Result
- **File:** `src/repositories/employeeRepository.ts` — Lines 56, 68, 181
- **Description:** `const [employee] = await this.db(...).returning('*')` assumes the query always returns a row. If an `UPDATE`/`INSERT` affects 0 rows (e.g., wrong ID), the array is empty and `employee` is `undefined`, which is then returned to the caller without error.
- **Fix:** Check array length after destructuring: `if (!result.length) throw new NotFoundError(...)`.

### 6. Route Parameter Ambiguity — Emergency Contacts
- **File:** `src/routes/employees.ts` — Lines 21–22
- **Description:** Routes like `/:employeeId/emergency-contacts` and `/emergency-contacts/:contactId` do not enforce ownership. There is no verification that a `contactId` being modified actually belongs to the `employeeId` in the URL. An authenticated user could modify another employee's contacts by guessing IDs.
- **Fix:** Validate contact-to-employee ownership in the service layer or add a combined route `/:employeeId/emergency-contacts/:contactId`.

### 7. Same Ownership Gap for Employment History
- **File:** `src/routes/employees.ts` — Lines 25–26
- **Description:** Same issue as emergency contacts — employment history routes don't enforce that the record belongs to the employee in the URL path.
- **Fix:** Add ownership validation in the service.

### 8. Route Ordering Is Fragile
- **File:** `src/routes/employees.ts` — Lines 12–14
- **Description:** `GET /search` must appear before `GET /:id` in Express or `/search` will be caught by the `/:id` handler with `id = 'search'`. The current order is correct but is a silent maintenance trap — any reordering breaks search silently.
- **Fix:** Document the ordering constraint with a comment, or prefix search under a different path like `/employees/search`.

### 9. `updateEmergencyContact` Repository Does Not Verify Row Exists
- **File:** `src/repositories/employeeRepository.ts` — Lines 180–190
- **Description:** The update query returns the updated row via `.returning('*')` destructuring, but if no rows matched, `undefined` is returned silently (same pattern as issue #5).
- **Fix:** Check result array length; throw if empty.

### 10. `EmploymentHistory` Interface Missing `updated_at`
- **File:** `src/types/employee.ts` — Line 52
- **Description:** The `EmploymentHistory` interface has `created_at` but no `updated_at`, yet the pattern across other entities includes it. If future updates are added to employment history, the type won't support it without a breaking change.
- **Fix:** Add optional `updated_at?: string` to be consistent with other entity types.

---

## MEDIUM Issues

### 11. Email Format Not Validated
- **File:** `src/services/employeeService.ts` — Lines 14–16
- **Description:** Only `!data.email` is checked (field presence), not email format. A value like `"not-an-email"` passes through to the database. The `isValidEmail()` utility exists in `src/utils/validation.ts` but is not used here.
- **Fix:** Call `isValidEmail(data.email)` and reject invalid formats.

### 12. Phone Format Not Validated
- **File:** `src/services/employeeService.ts` — Lines 78–79
- **Description:** Phone presence is checked but format is not. The `isValidPhone()` utility exists but is unused.
- **Fix:** Use `isValidPhone(data.phone)` to validate format.

### 13. `any` Type on Service Return Values
- **File:** `src/services/employeeService.ts` — Lines 66, 85, 94
- **Description:** `addEmergencyContact()`, `getEmergencyContacts()`, `updateEmergencyContact()`, `addEmploymentHistory()`, and `getEmploymentHistory()` all return `any` or `Promise<any>`. Proper return types (`EmergencyContact`, `EmploymentHistory[]`, etc.) should be specified.
- **Fix:** Replace `any` with the correct interface types.

### 14. `data: any` Parameter in `addEmploymentHistory`
- **File:** `src/services/employeeService.ts` — Line 103
- **Description:** The function accepts `data: any` with no type constraint. No TypeScript safety on what fields are expected.
- **Fix:** Create a `CreateEmploymentHistoryDTO` interface and use it.

### 15. Unsafe `status` and `employment_type` Casting
- **File:** `src/controllers/employeeController.ts` — Lines 89–90
- **Description:** Query params `status` and `employment_type` are cast with `as any` without validation against allowed enum values. Invalid values could reach the database layer.
- **Fix:** Validate against known enum values before passing to service.

### 16. Non-Unique Employee ID Generation
- **File:** `src/repositories/employeeRepository.ts` — Lines 9–10
- **Description:** `employee_id` is generated as `'EMP' + Date.now()`. Two simultaneous requests in the same millisecond would produce identical IDs, causing a unique constraint violation or silently duplicate records.
- **Fix:** Use a database sequence, a UUID, or a distributed ID generator.

### 17. Search Input Not Sanitized in LIKE Query
- **File:** `src/repositories/employeeRepository.ts` — Lines 100–103
- **Description:** `filters.search` is used directly in `LIKE` queries. While Knex parameterizes values (preventing SQL injection), special LIKE characters (`%`, `_`) in user input would cause unintended wildcard matching.
- **Fix:** Escape LIKE special characters before using in the query.

### 18. No Authorization Beyond Authentication on Routes
- **File:** `src/routes/employees.ts` — Line 8
- **Description:** All routes only apply `authenticateToken` (identity check) but no RBAC/permission check. Any authenticated user can read, create, update, or delete any employee record.
- **Fix:** Apply role-based authorization middleware on sensitive routes (create, update, delete).

---

## LOW Issues

### 19. `authenticateToken as any` in Routes
- **File:** `src/routes/employees.ts` — Line 8
- **Description:** Middleware is cast with `as any` to suppress TypeScript errors, hiding potential signature incompatibilities.
- **Fix:** Properly type the middleware or use a typed wrapper.

### 20. `updated_at` Field Has No Documented Format
- **File:** `src/types/employee.ts` — Lines 39–41
- **Description:** `updated_at: string` gives no indication of format (ISO 8601, Unix timestamp, etc.). This can cause inconsistencies when dates are parsed by consumers.
- **Fix:** Either use `Date` type with a serialization note or standardize on ISO 8601 and document it.

### 21. Redundant Dual ID System
- **File:** `src/repositories/employeeRepository.ts` — Lines 9–10
- **Description:** Employees have both a `uuid` `id` and a string `employee_id`. The rationale for having both is unclear. This adds complexity without obvious benefit unless `employee_id` is user-visible.
- **Fix:** Document why both are needed, or consolidate to one if possible.

---

## Summary

| Severity | Count |
|----------|-------|
| Critical | 0     |
| High     | 10    |
| Medium   | 8     |
| Low      | 3     |
| **Total**| **21**|

### Top Priority Fixes
1. Fix NaN validation in both `searchEmployees` and `getAllEmployees` (pagination broken with bad input)
2. Add existence checks before update/delete operations
3. Fix array destructuring on empty results in repository
4. Add ownership validation for emergency contacts and employment history routes
5. Add email/phone format validation in service layer
6. Add RBAC authorization middleware on employee mutation routes
