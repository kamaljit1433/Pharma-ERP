# Training Module - Error Report

**Module:** Training & Certification Management
**Files Analyzed:**
- `src/controllers/trainingController.ts`
- `src/services/trainingService.ts`
- `src/repositories/trainingProgramRepository.ts`
- `src/repositories/trainingEnrollmentRepository.ts`
- `src/repositories/certificationRepository.ts`
- `src/repositories/skillRepository.ts`
- `src/repositories/employeeSkillRepository.ts`
- `src/routes/training.ts`
- `src/types/training.ts`

---

## CRITICAL Issues

### 1. No Capacity Limit Enforcement Anywhere
- **File:** `src/controllers/trainingController.ts` — Lines 81–100 / `src/services/trainingService.ts` — Lines 67–79, 254–280, 283–300
- **Description:** Training programs have a `max_participants` field but it is **never checked** before enrollment — neither in the controller, nor in the service, nor in the repository. This applies to individual enrollment, bulk enrollment, and self-enrollment. Programs can be infinitely overbooked.
- **Fix:** Before creating any enrollment, query the current enrollment count and compare to `max_participants`; reject with `409 Conflict` if full.

### 2. Bulk Enrollment Bypasses All Capacity Checks
- **File:** `src/services/trainingService.ts` — Lines 254–280
- **Description:** `bulkEnrollEmployees()` iterates and enrolls each employee independently without ever checking the program's remaining capacity. A program with 5 seats can receive 100 enrollments in a single call.
- **Fix:** Query current enrollment count once before the loop; calculate remaining seats; reject excess enrollments.

### 3. Self-Enrollment Also Bypasses Capacity
- **File:** `src/services/trainingService.ts` — Lines 283–300
- **Description:** `requestSelfEnrollment()` has the same missing capacity check as regular enrollment.
- **Fix:** Add same capacity validation as the fix for Issue #1.

### 4. Deleting a Training Program Orphans Enrollment Records
- **File:** `src/repositories/trainingProgramRepository.ts` — Line 65 / `src/controllers/trainingController.ts` — Lines 70–78
- **Description:** `deleteTrainingProgram()` does not check for active enrollments before deleting the program. This orphans `training_enrollment` records, which now reference a non-existent program.
- **Fix:** Check for existing enrollments; block deletion if any active (`enrolled`/`in_progress`) enrollments exist, or cascade delete only if all are `completed`/`cancelled`.

### 5. Route Ordering Bug — `/certifications/expiring` Unreachable
- **File:** `src/routes/training.ts` — Line 26
- **Description:** The route `GET /certifications/expiring` appears after `GET /certifications/:employeeId`. Express will match `expiring` as an employee ID, routing to the wrong handler. The expiring certifications endpoint is effectively broken.
- **Fix:** Move `GET /certifications/expiring` before `GET /certifications/:employeeId`.

### 6. `autoUpdateSkillsOnCompletion()` Is Empty — Training Completion Does Nothing
- **File:** `src/services/trainingService.ts` — Lines 247–251
- **Description:** `autoUpdateSkillsOnCompletion()` is a private method that is called when a training is completed, but its body is completely empty. No skills are ever updated when an employee completes training.
- **Fix:** Implement the skill-update logic: fetch skills linked to the training program and add/update them on the employee's profile.

---

## HIGH Issues

### 7. Employee Skill Duplicate Not Prevented
- **File:** `src/repositories/employeeSkillRepository.ts` — Lines 8–21
- **Description:** `createEmployeeSkill()` does not check if the employee already has a record for the same skill. Multiple entries with conflicting proficiency levels can be created for the same skill.
- **Fix:** Check with `getEmployeeSkillBySkillId()` before inserting; update instead of insert if exists.

### 8. Enrollment Status Workflow Not Validated
- **File:** `src/services/trainingService.ts` / all enrollment repositories
- **Description:** There is no validation of valid status transitions. An enrollment can go from `'completed'` back to `'enrolled'`, or a `'cancelled'` enrollment can be marked `'in_progress'` — invalid business state.
- **Fix:** Define a transition matrix (e.g., `enrolled → in_progress → completed`) and validate before any status update.

### 9. Marking Enrollment Complete Does Not Check Current Status
- **File:** `src/services/trainingService.ts` — Lines 93–109
- **Description:** `markEnrollmentComplete()` does not verify the enrollment is in `'in_progress'` or `'enrolled'` status. A `'cancelled'` enrollment can be marked complete.
- **Fix:** Validate enrollment status before update; throw if not in an appropriate transitioning state.

### 10. Duplicate Certificate Not Prevented
- **File:** `src/controllers/trainingController.ts` — Lines 321–341
- **Description:** `issueCertificate()` does not check if a certificate already exists for the same enrollment/employee. Duplicate certificates can be issued.
- **Fix:** Check for existing certificate by `enrollment_id` before issuing; return existing or throw `409`.

### 11. Enrollment Exists Check Ignores Status — Blocks Re-enrollment
- **File:** `src/services/trainingService.ts` — Lines 69–72 / `src/repositories/trainingEnrollmentRepository.ts` — Lines 69–76
- **Description:** `checkEnrollmentExists()` returns `true` even for `'cancelled'` enrollments. A previously cancelled employee cannot re-enroll — the API returns "already enrolled" even though the enrollment is cancelled.
- **Fix:** Only treat `enrolled`, `in_progress`, and `completed` as blocking re-enrollment; allow re-enrollment after `cancelled`.

### 12. Enrollment Does Not Validate Employee or Program Existence
- **File:** `src/services/trainingService.ts` — Lines 67–79
- **Description:** `enrollEmployee()` does not verify the `employee_id` or `training_program_id` exist before creating the enrollment. Orphaned enrollment records can be created for non-existent entities.
- **Fix:** Fetch both records; throw `404` if either is not found.

### 13. Certification Issue Date / Expiry Date Not Validated
- **File:** `src/services/trainingService.ts` — Lines 120–122
- **Description:** No check that `issue_date < expiry_date`. A certificate with expiry before its issue date is silently stored.
- **Fix:** Validate date ordering: `if (expiry_date <= issue_date) throw new Error(...)`.

### 14. Program Start/End Date Not Validated
- **File:** `src/controllers/trainingController.ts` — Lines 11–26
- **Description:** No validation that `start_date < end_date` when creating or updating a training program.
- **Fix:** Add date order validation before passing to service.

---

## MEDIUM Issues

### 15. Bulk Enrollment Errors Silently Swallowed
- **File:** `src/services/trainingService.ts` — Line 275
- **Description:** Failed individual enrollments in `bulkEnrollEmployees()` are only `console.error`'d. The API returns a count of successes but does not identify which employees failed or why.
- **Fix:** Accumulate failed enrollments with error details in an array and return them in the response.

### 16. Enrollment After Program Start Date Not Blocked
- **File:** `src/services/trainingService.ts` — Lines 67–79
- **Description:** An employee can be enrolled in a program after its `start_date` (or even after `end_date`). There is no check against the program's timeline.
- **Fix:** Validate that `enrollment_date <= program.start_date` (or apply business rule for late enrollment).

### 17. Expired Certifications Not Auto-Deactivated
- **File:** `src/repositories/certificationRepository.ts` — Lines 33–40
- **Description:** Certifications past their `expiry_date` are still returned with `is_active: true`. The filter only checks the `is_active` flag, not the expiry date itself. Expired certifications appear valid.
- **Fix:** Add `AND expiry_date > NOW()` to the active certification query; run a scheduled job to set `is_active = false` on expired certs.

### 18. N+1 Query Pattern in Skill Gap Report
- **File:** `src/services/trainingService.ts` — Lines 193–240
- **Description:** `generateSkillGapReport()` queries employee skills individually inside a loop instead of using a single JOIN query.
- **Fix:** Use a single query with `JOIN` and `GROUP BY` to fetch all skill data at once.

### 19. Unsafe Array Destructuring Throughout Repositories
- **File:** `trainingProgramRepository.ts`, `trainingEnrollmentRepository.ts`, `certificationRepository.ts`, `skillRepository.ts`, `employeeSkillRepository.ts` — Multiple lines
- **Description:** `const [record] = await this.db(...).returning('*')` is used pervasively. If the query affects 0 rows, `record` is `undefined` and the caller silently gets `undefined` back as a success response.
- **Fix:** After destructuring, check: `if (!record) throw new NotFoundError(...)`.

### 20. Duplicate Skill Names Not Prevented
- **File:** `src/repositories/skillRepository.ts` — Lines 8–20
- **Description:** `createSkill()` does not check if a skill with the same name already exists. Duplicate skill entries pollute the skill catalog.
- **Fix:** Add a unique database constraint on `skill_name` and/or check before insert.

### 21. `getCertificationInventory` Returns `any` Type
- **File:** `src/services/trainingService.ts` — Line 366
- **Description:** The method's return type is `any`, losing all type safety for this response.
- **Fix:** Define an interface for the certification inventory response and use it.

### 22. Hardcoded Required Proficiency in Skill Gap Report
- **File:** `src/services/trainingService.ts` — Line 227
- **Description:** `required_proficiency: 'intermediate'` is hardcoded in the skill gap report. All skills are assumed to require `intermediate` level regardless of actual requirements.
- **Fix:** Fetch required proficiency from a job role or skill requirement table.

### 23. `duration_hours` and `max_participants` Not Validated
- **File:** `src/controllers/trainingController.ts` — Lines 24–25
- **Description:** These numeric fields are not validated. Negative values, zero, or extremely large numbers can be stored.
- **Fix:** Add bounds validation: `duration_hours > 0`, `max_participants >= 1`.

### 24. Route Uses camelCase `:employeeId` — Inconsistent with Other Modules
- **File:** `src/routes/training.ts` — Lines 20, 25, 36
- **Description:** Parameter names use camelCase (`:employeeId`) while other modules use snake_case (`:employee_id`). This is inconsistent across the API.
- **Fix:** Standardize to one convention — preferably snake_case to match database column names.

---

## LOW Issues

### 25. No Enrollment Approval Workflow Despite Being Planned
- **File:** `src/services/trainingService.ts` — Lines 294–299
- **Description:** A comment mentions "pending status (requires approval)" for self-enrollment, but no approval mechanism exists. All self-enrollments are created as `'pending'` with no way for anyone to approve them.
- **Fix:** Implement an approval endpoint or automatically approve if no approval workflow is configured.

### 26. Missing DELETE Endpoint for Enrollments
- **File:** `src/routes/training.ts`
- **Description:** There is no `DELETE /enrollments/:id` route for withdrawing from a training.
- **Fix:** Add a cancel/withdraw endpoint.

### 27. Missing GET Single Certification Endpoint
- **File:** `src/routes/training.ts`
- **Description:** No `GET /certifications/:id` route exists to fetch a specific certificate.
- **Fix:** Add the missing read endpoint.

### 28. Training Status Should Be an Enum
- **File:** `src/types/training.ts` — Line 9
- **Description:** Status is a string union `'draft' | 'published' | 'ongoing' | 'completed' | 'cancelled'`. Using a TypeScript `enum` would prevent accidental typos across the codebase.
- **Fix:** Convert to an `enum TrainingStatus`.

### 29. `UpdateEmployeeSkillDTO` Cannot Change the Skill
- **File:** `src/types/training.ts` — Lines 128–132
- **Description:** The DTO only allows updating `proficiency_level` and `years_of_experience`, not `skill_id`. If an employee's skill record has the wrong skill linked, it cannot be corrected through an update — only delete and recreate.
- **Fix:** Either add `skill_id` as an optional field or document this limitation.

---

## Summary

| Severity | Count |
|----------|-------|
| Critical | 6     |
| High     | 8     |
| Medium   | 10    |
| Low      | 5     |
| **Total**| **29**|

### Top Priority Fixes
1. Implement `max_participants` capacity enforcement in all enrollment paths (individual, bulk, self)
2. Block program deletion when active enrollments exist
3. Fix route ordering — `/certifications/expiring` is currently unreachable
4. Implement `autoUpdateSkillsOnCompletion()` — it's empty, so training completion has no effect on skills
5. Add enrollment status transition validation
6. Fix expiring certifications route and expired certificate display logic
