# Hierarchy Module - Error Report

**Module:** Organization Hierarchy & Department Structure
**Files Analyzed:**
- `src/controllers/hierarchyController.ts`
- `src/services/hierarchyService.ts`
- `src/repositories/hierarchyNodeRepository.ts`
- `src/repositories/departmentRepository.ts`
- `src/routes/hierarchy.ts`
- `src/types/hierarchy.ts`

---

## CRITICAL Issues

### 1. Infinite Loop in `getReportingChain()` — No Cycle Detection
- **File:** `src/repositories/hierarchyNodeRepository.ts` — Lines 66–80
- **Description:** The `while (currentEmployeeId)` loop walks up the manager chain with no visited-node tracking. If a circular reference exists (A → B → C → A), the loop never terminates, consuming 100% CPU and hanging the request.
- **Fix:** Track visited IDs in a `Set`; break and throw an error if a node is visited twice:
  ```ts
  const visited = new Set<string>();
  while (currentEmployeeId) {
    if (visited.has(currentEmployeeId)) throw new Error('Circular hierarchy detected');
    visited.add(currentEmployeeId);
    ...
  }
  ```

### 2. Unbounded Recursion in `buildOrgChartNode()` — Stack Overflow Risk
- **File:** `src/services/hierarchyService.ts` — Lines 334–360
- **Description:** `buildOrgChartNode()` recursively calls itself for every direct report with no depth limit and no visited-node guard. A circular hierarchy will cause a stack overflow and crash the Node.js process.
- **Fix:** Pass a `visited: Set<string>` and a `maxDepth` parameter; stop recursion if depth is exceeded or node is already in the set.

---

## HIGH Issues

### 3. Partial Update Overwrites Fields with `undefined`
- **File:** `src/repositories/hierarchyNodeRepository.ts` — Lines 31–43
- **Description:** `updateHierarchyNode()` spreads the entire partial DTO into the `UPDATE` statement unconditionally. If a caller sends only `{ manager_id: "emp5" }`, the `department_id` and `designation_id` columns are set to `undefined`/`null`, corrupting the record.
- **Fix:** Filter out `undefined` values before the update:
  ```ts
  const updateData = Object.fromEntries(
    Object.entries(data).filter(([_, v]) => v !== undefined)
  );
  ```

### 4. No Circular Reference Check When Assigning Manager
- **File:** `src/services/hierarchyService.ts` — Lines 157–216
- **Description:** `assignEmployeePosition()` does not verify that assigning the new `manager_id` won't create a cycle. For example: A currently manages B — setting B as A's manager creates A→B→A.
- **Fix:** After resolving the new manager, traverse the manager's reporting chain and reject if the target employee already appears in it.

### 5. `JSON.parse()` in `getHierarchyAuditLogs()` Without Error Handling
- **File:** `src/services/hierarchyService.ts` — Lines 389–390
- **Description:** `JSON.parse(log.new_value)` is called without try/catch. A single corrupted audit log row will crash the entire endpoint with an unhandled `SyntaxError`.
- **Fix:** Wrap in try/catch; return the raw string if parse fails.

### 6. No Transaction for Position Assignment + Audit Log
- **File:** `src/services/hierarchyService.ts` — Lines 157–216
- **Description:** Hierarchy update and audit log creation are two separate DB operations without a transaction. If the hierarchy update succeeds but audit logging fails, the org chart changes are untracked.
- **Fix:** Wrap both operations in a Knex transaction.

### 7. N+1 Queries in `getDirectReports()`
- **File:** `src/services/hierarchyService.ts` — Lines 252–300
- **Description:** For each direct report, three separate queries are fired (employee, designation, department). With 100 direct reports = 300+ database round trips.
- **Fix:** Use a single query with `JOIN`s across the three tables.

---

## MEDIUM Issues

### 8. All Route Middleware Uses `as any` — Type Safety Bypassed
- **File:** `src/routes/hierarchy.ts` — Lines 12, 17, 32, 37, 44, 59, 64, 71, 93
- **Description:** `authenticateToken as any` and `authorize([...]) as any` are used on every route, disabling TypeScript type checking for middleware signatures.
- **Fix:** Properly type middleware using an extended Express `RequestHandler` interface.

### 9. `getDepartmentsByParent()` Returns Empty Silently on Invalid Parent
- **File:** `src/repositories/departmentRepository.ts` — Lines 51–65
- **Description:** No existence check on `parentId` before querying child departments. A non-existent parent returns an empty array with no error, making it indistinguishable from a valid empty department.
- **Fix:** Verify the parent department exists first; throw `404` if not found.

### 10. `updateDepartment()` Overwrites Fields with `undefined`
- **File:** `src/repositories/departmentRepository.ts` — Lines 33–44
- **Description:** Same issue as #3 — partial DTO fields not provided will overwrite existing values with `undefined`.
- **Fix:** Filter undefined fields before updating.

---

## LOW Issues

### 11. Designation Level Not Validated
- **File:** `src/types/hierarchy.ts` — Line 14 / `src/services/hierarchyService.ts` — Lines 96–107
- **Description:** `level?: number` is optional but no bounds check exists. A designation with `level = -999` or `level = 99999` can be stored.
- **Fix:** Validate `level >= 1 && level <= 20` (or whatever business range applies).

---

## Summary

| Severity | Count |
|----------|-------|
| Critical | 2     |
| High     | 5     |
| Medium   | 3     |
| Low      | 1     |
| **Total**| **11**|

### Top Priority Fixes
1. Add circular reference detection to both `getReportingChain()` and `buildOrgChartNode()`
2. Add cycle check before allowing manager assignment
3. Fix partial updates to not overwrite unset fields with `undefined`
4. Wrap position assignment + audit log in a transaction
