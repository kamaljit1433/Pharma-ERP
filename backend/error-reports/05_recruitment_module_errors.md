# Recruitment Module - Error Report

**Module:** Recruitment & Applicant Tracking
**Files Analyzed:**
- `src/controllers/recruitmentController.ts`
- `src/services/recruitmentService.ts`
- `src/services/applicantTrackingService.ts`
- `src/services/interviewManagementService.ts`
- `src/services/offerLetterService.ts`
- `src/services/onboardingService.ts`
- `src/repositories/jobPostingRepository.ts`
- `src/repositories/applicantRepository.ts`
- `src/repositories/interviewRepository.ts`
- `src/repositories/offerLetterRepository.ts`
- `src/repositories/onboardingRepository.ts`
- `src/routes/recruitment.ts`
- `src/types/recruitment.ts`

---

## CRITICAL Issues

### 1. Applicant Creation Route Has No Authentication
- **File:** `src/routes/recruitment.ts` — Line 15
- **Description:** `POST /jobs/:job_posting_id/applicants` has no `authenticateToken` middleware. Any unauthenticated user on the internet can submit applicant records directly to the database.
- **Fix:** Add `authenticateToken` middleware (or design it as a genuinely public endpoint with rate limiting and captcha).

### 2. `CreateJobPostingDTO` Does Not Match What the Controller Sends
- **File:** `src/types/recruitment.ts` — Lines 15–23 vs `src/controllers/recruitmentController.ts` — Lines 27–40
- **Description:** The DTO defines fields `designation_id`, `positions_count`, `posted_date`, `closing_date`. The controller sends `location`, `required_skills`, `experience_min`, `experience_max`, `application_deadline`, `created_by`. These are almost entirely different field sets — the data passed through is untyped at the service boundary.
- **Fix:** Align the DTO with the actual API contract; add missing fields and remove/rename obsolete ones.

### 3. Interview Status Case Mismatch — Queries Never Return Results
- **File:** `src/repositories/interviewRepository.ts` — Line 85
- **Description:** The repository queries for `status = 'Scheduled'` (capitalized) but the `InterviewStatus` type defines `'scheduled'` (lowercase). This `WHERE` clause will never match any row, making the "get scheduled interviews" feature completely broken.
- **Fix:** Use consistent lowercase status values throughout, matching the type definition.

### 4. Hardcoded `example.com` Acceptance URL in Offer Letters
- **File:** `src/services/offerLetterService.ts` — Line 57
- **Description:** `acceptanceUrl: 'https://example.com/accept'` is a placeholder that was never replaced. Every offer letter email contains a broken link.
- **Fix:** Build the URL from environment config: `${config.frontendUrl}/offers/${offerId}/accept`.

### 5. `onboardingService` Loads ALL Checklists to Find One Item
- **File:** `src/services/onboardingService.ts` — Line 52 / `src/repositories/onboardingRepository.ts` — Lines 74–89
- **Description:** `completeChecklistItem()` fetches every checklist in the database with `SELECT *` then loops in memory to find the target item. This is O(n) with no index usage — catastrophic at scale.
- **Fix:** Add a `WHERE employee_id = ?` clause to the query; fetch only the relevant checklist.

### 6. Only First Interviewer Saved — Multiple Interviewers Silently Dropped
- **File:** `src/repositories/interviewRepository.ts` — Lines 28–30
- **Description:** `CreateInterviewDTO` accepts `interviewers?: string[]` (an array) but the repository only stores `interviewer_id?: string` (a single string). All interviewers after the first are silently discarded.
- **Fix:** Either use a junction table `interview_interviewers` or store as a JSON array; update the type to match.

---

## HIGH Issues

### 7. `scheduled_at` Not Validated — Past Dates Accepted
- **File:** `src/services/interviewManagementService.ts` — Line 19
- **Description:** No check that the interview's `scheduled_at` is in the future. Interviews can be scheduled for dates that have already passed.
- **Fix:** Validate `new Date(data.scheduled_at) > new Date()` and reject with a `400` error.

### 8. Negative / Zero Salary Not Validated in Offer Letters
- **File:** `src/services/offerLetterService.ts` — Lines 19–29 / `src/controllers/recruitmentController.ts` — Line 182
- **Description:** No check prevents a salary of `0`, `-1000`, or `NaN` from being stored in an offer letter.
- **Fix:** Validate `salary > 0` in the service before creating the record.

### 9. Application Email Failure Silently Swallowed
- **File:** `src/services/applicantTrackingService.ts` — Lines 36–38, 88
- **Description:** Email send failures are logged to `console.error` but the operation continues with a success response. The applicant (and HR) may never know their confirmation/notification email was never sent.
- **Fix:** Track email send status separately and surface failures to the caller or a retry queue.

### 10. Missing Validation on Input Fields in Controller
- **File:** `src/controllers/recruitmentController.ts` — Lines 27, 50–57, 85–86, 103, 120, 133–140, 182, 201, 226
- **Description:** No validation of required fields before passing to services across multiple endpoints:
  - `createJobPosting`: `title`, `department_id`, `application_deadline` not checked
  - `addApplicant`: Email format not validated; resume URL format not checked
  - `scheduleInterview`: `scheduled_at` not checked
  - `generateOfferLetter`: Salary not checked
- **Fix:** Add input validation (presence + format checks) at the controller level or use a validation middleware.

### 11. Email Validation Missing in Applicant Repository
- **File:** `src/repositories/applicantRepository.ts` — Line 19
- **Description:** Applicant email is stored without format validation. Any string is accepted.
- **Fix:** Validate email format using `isValidEmail()` utility.

### 12. All Errors Return HTTP 400
- **File:** `src/controllers/recruitmentController.ts` — Lines 44, 62, 78, 97, 113, 126, 144, 163, 175, 195, 207, 219, 235, 248, 265
- **Description:** Every catch block returns `400 Bad Request` regardless of whether the error is a validation failure, not-found, or server error.
- **Fix:** Map error types to correct HTTP status codes (400, 404, 409, 500).

### 13. `(req as any).user` Without Type Safety
- **File:** `src/controllers/recruitmentController.ts` — Lines 28, 242
- **Description:** User ID is extracted with an unsafe `any` cast. If authentication middleware fails to set `req.user`, the resulting `undefined` is silently passed to services.
- **Fix:** Use a typed `AuthenticatedRequest` interface.

### 14. Offer Can Be Accepted Multiple Times
- **File:** `src/services/offerLetterService.ts` — Lines 65–94
- **Description:** `acceptOfferLetter()` does not check if the offer is already accepted. Calling it twice will mark the applicant as `hired` twice with no error.
- **Fix:** Check current status before accepting; throw if already `'Accepted'`.

---

## MEDIUM Issues

### 15. Hardcoded Placeholder Values in Interview Email Templates
- **File:** `src/services/interviewManagementService.ts` — Lines 36, 40, 41, 55, 57
- **Description:** Interview emails contain hardcoded `'Position'`, `'HR Team'`, `'example.com/accept'` that were never replaced with actual database values.
- **Fix:** Fetch job posting and company name from DB and inject into email templates.

### 16. Interview Feedback Marks Interview `completed` Regardless of Current Status
- **File:** `src/services/interviewManagementService.ts` — Line 63
- **Description:** Submitting feedback always sets status to `'completed'`, even if the interview was `'rescheduled'` or `'cancelled'`. This produces incorrect status.
- **Fix:** Only update status to `'completed'` if current status is `'scheduled'`.

### 17. Offer Validity Period Hardcoded to 7 Days
- **File:** `src/services/offerLetterService.ts` — Line 56
- **Description:** `valid_until` is always `now + 7 days`. Different roles or companies may need different periods.
- **Fix:** Make validity period configurable (company settings or per-offer input).

### 18. Name Parsing Fragile — Single-Name Applicants Break
- **File:** `src/repositories/applicantRepository.ts` — Lines 10–12
- **Description:** `data.name.split(' ')` always assigns `parts[0]` as first name and `parts[1]` as last name. A single-name applicant will have an empty `last_name`.
- **Fix:** Handle single-name entries gracefully; use `parts.slice(1).join(' ')` for last name.

### 19. No State Machine Validation on Offer Status Transitions
- **File:** `src/repositories/offerLetterRepository.ts` — Lines 34, 62, 72, 104
- **Description:** No checks prevent invalid transitions like `'Draft' → 'Accepted'` (skipping `'Sent'`). Any status can be set at any time.
- **Fix:** Implement a status transition matrix with allowed transitions.

### 20. `CreateInterviewDTO` Has Both `type` and `mode` Fields
- **File:** `src/types/recruitment.ts` — Lines 136–144
- **Description:** The DTO has `type?: 'phone' | 'video' | 'in_person'` AND `mode?: 'In-Person' | 'Video' | 'Phone'` — two fields representing the same concept with different naming conventions. It's unclear which is used.
- **Fix:** Consolidate to one field with consistent casing.

### 21. `applyCarryForward` Hardcoded Start Date Fallback
- **File:** `src/services/onboardingService.ts` — Line 38
- **Description:** `|| '2024-01-01'` is a hardcoded fallback date. Any employee without a joining date will get an onboarding start date of January 1st 2024.
- **Fix:** Throw an error if joining date is missing rather than silently using a wrong date.

### 22. `ilike` Used Without Database Guard
- **File:** `src/repositories/applicantRepository.ts` — Lines 71–76
- **Description:** `ilike` is PostgreSQL-specific. If the database ever changes, this query will fail silently.
- **Fix:** Document the PostgreSQL dependency; at minimum add a comment.

### 23. `returning('*')` Result Handling Inconsistent
- **File:** `src/repositories/jobPostingRepository.ts` — Lines 25–27, 49–52, 57–64
- **Description:** Some paths use `jobPosting[0] || jobPosting` to handle the result, mixing array and object access patterns. This is fragile and could return `undefined` silently.
- **Fix:** Always destructure: `const [record] = await ...; if (!record) throw new NotFoundError()`.

---

## LOW Issues

### 24. `_departmentId` Parameter Is Unused
- **File:** `src/services/onboardingService.ts` — Line 105
- **Description:** Parameter prefixed with `_` is accepted but never used in the function body.
- **Fix:** Remove the parameter or implement department-scoped logic.

### 25. `ApplicantNote` Type Defined But Never Implemented
- **File:** `src/types/recruitment.ts` — Lines 80–86
- **Description:** A `ApplicantNote` interface exists with no corresponding service, repository, or route implementation.
- **Fix:** Either implement the feature or remove the type until it is needed.

### 26. `CreateApplicantDTO.name` vs `Applicant.first_name`/`last_name` Mismatch
- **File:** `src/types/recruitment.ts` — Lines 42–55 vs 125–130
- **Description:** The DTO takes a single `name` string while the entity stores `first_name` and `last_name` separately. The split logic lives in the repository — an unusual design that makes the API contract ambiguous.
- **Fix:** Accept `first_name` and `last_name` in the DTO directly, removing the fragile split logic.

### 27. Missing GET Interview Details Endpoint
- **File:** `src/routes/recruitment.ts`
- **Description:** There is no `GET /interviews/:id` route to retrieve a single interview's details. Only feedback retrieval is exposed.
- **Fix:** Add the missing read endpoint.

---

## Summary

| Severity | Count |
|----------|-------|
| Critical | 6     |
| High     | 8     |
| Medium   | 9     |
| Low      | 4     |
| **Total**| **27**|

### Top Priority Fixes
1. Add authentication to the applicant creation route (security gap)
2. Fix `CreateJobPostingDTO` to match what the controller actually sends (data never saved correctly)
3. Fix interview status case mismatch (`'Scheduled'` vs `'scheduled'`) — scheduled interviews query always returns empty
4. Replace hardcoded `example.com` offer acceptance URL
5. Fix onboarding checklist O(n) full-table scan
6. Fix multiple interviewers being silently dropped (only first saved)
