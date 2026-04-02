# Performance Management Module - Error Report

**Module:** Performance Reviews, Goals, Feedback & PIP
**Files Analyzed:**
- `src/controllers/performanceController.ts`
- `src/services/performanceReviewService.ts`
- `src/services/goalService.ts`
- `src/services/feedbackService.ts`
- `src/services/pipService.ts`
- `src/repositories/performanceReviewRepository.ts`
- `src/routes/` (performance routes)
- `src/types/` (performance types)

---

## CRITICAL Issues

### 1. `submitReview` Method Signature Mismatch — Tests Completely Broken
- **File:** `src/services/performanceReviewService.ts` — Lines 9–11
- **Description:** The service method signature is `submitReview(data: PerformanceReviewDTO, userId: string)` but the tests call it with 6 flat parameters: `submitReview(employeeId, cycleId, reviewType, rating, comments, reviewerId)`. Every test calling this method will fail at runtime with wrong argument count/type errors.
- **Fix:** Align method signature to match either the controller's usage or the tests' usage — pick one and update the other.

### 2. Controller Injects Wrong Dependency into `PerformanceReviewService`
- **File:** `src/controllers/performanceController.ts` — Line 37
- **Description:** `PerformanceReviewService` is instantiated as `new PerformanceReviewService(reviewRepository, goalRepository)` but the service constructor expects `(reviewRepository, reviewCycleRepository)`. Passing `goalRepository` where a cycle repository is expected causes type mismatch and runtime errors (cycle validation will fail or crash).
- **Fix:** Pass `reviewCycleRepository` as the second argument.

### 3. `PIPService.recordOutcome` Missing `userId` Parameter
- **File:** `src/services/pipService.ts` — Lines 85–88 / `src/controllers/performanceController.ts` — Line 380
- **Description:** The controller calls `pipService.recordOutcome(id, outcome, userId)` (3 arguments) but the service method only accepts `(pipId: string, outcome: string)` (2 arguments). The `userId` is silently dropped, meaning no audit record of who recorded the outcome is ever stored.
- **Fix:** Add `userId: string` as a third parameter and pass it to the repository.

### 4. `FeedbackService.provideFeedback` Signature Mismatch
- **File:** `src/services/feedbackService.ts` — Lines 7–10
- **Description:** Implementation signature is `provideFeedback(data: any, fromEmployeeId: string)` but tests call it as `provideFeedback(toEmployeeId, type, content, isAnonymous, visibility, fromEmployeeId)` — completely different parameter shapes. All feedback tests fail.
- **Fix:** Reconcile the interface — either use a DTO object or flat parameters consistently.

### 5. `PIPService.initiatePIP` Signature Mismatch
- **File:** `src/services/pipService.ts` — Lines 11–14
- **Description:** Implementation: `initiatePIP(data: CreatePIPDTO, userId: string)`. Tests call: `initiatePIP(employeeId, goals, startDate, endDate, userId)`. Flat vs. DTO mismatch means all PIP initiation tests fail.
- **Fix:** Align implementation with tests or vice versa.

### 6. `PIPService.recordCheckIn` Signature Mismatch
- **File:** `src/services/pipService.ts` — Lines 57–61
- **Description:** Implementation: `recordCheckIn(pipId, data: CreatePIPCheckInDTO, userId)`. Tests call: `recordCheckIn(pipId, checkInDate, progress, notes, status, userId)` — 6 flat args vs. 3. All check-in tests fail.
- **Fix:** Align implementation with tests.

---

## HIGH Issues

### 7. `submitReview` Does Not Validate Review Cycle Exists
- **File:** `src/services/performanceReviewService.ts` — Lines 9–25
- **Description:** No query is made to verify the `cycleId` exists before creating a review. Reviews can be created for non-existent cycles, violating referential integrity.
- **Fix:** Query `ReviewCycleRepository.findById(cycleId)`; throw `404` if not found.

### 8. `createPerformanceReview` Silently Overwrites Existing Reviews
- **File:** `src/repositories/performanceReviewRepository.ts` — Lines 10–18
- **Description:** If a review already exists for the same employee/cycle combination, the repository silently calls `updatePerformanceReview()` instead of throwing an error or returning the existing record. Existing review data is overwritten without any warning or audit trail.
- **Fix:** Throw a `409 Conflict` error if a review already exists, or return the existing record explicitly.

### 9. 'Peer' Review Type Has No Status Transition Logic
- **File:** `src/services/performanceReviewService.ts` — Lines 27–33
- **Description:** Status mapping only handles `'Self'` and `'Manager'` review types. Submitting a `'Peer'` review leaves the review status unchanged — peer reviews are accepted but have no effect on workflow.
- **Fix:** Define and implement the expected status transition for peer reviews.

### 10. PIP Outcome `'Extended'` and `'Escalated'` Both Map to `'Active'`
- **File:** `src/services/pipService.ts` — Line 95
- **Description:** `const newStatus = outcome === 'Completed' ? 'Completed' : 'Active'` means both `'Extended'` and `'Escalated'` outcomes map to `'Active'`. These should have distinct statuses (e.g., `'Extended'`, `'Escalated'`) for proper tracking.
- **Fix:** Use a full mapping: `{ Completed: 'Completed', Extended: 'Extended', Escalated: 'Escalated' }`.

---

## MEDIUM Issues

### 11. `feedbackService` Uses `data: any` — No Type Safety
- **File:** `src/services/feedbackService.ts` — Line 8
- **Description:** The `data` parameter is typed as `any`, removing all compile-time validation of required fields.
- **Fix:** Use `CreateFeedbackDTO` as the parameter type.

### 12. PIP Outcome Not Validated Against Allowed Values
- **File:** `src/controllers/performanceController.ts` — Lines 370–385
- **Description:** Validation only checks `if (!outcome)` — it does not verify outcome is one of `['Completed', 'Extended', 'Escalated']`. Invalid strings are passed to the service.
- **Fix:** Add an allowlist check before calling the service.

### 13. PIP Start Date Not Validated Against Current Date
- **File:** `src/services/pipService.ts` — Lines 20–22
- **Description:** Only `startDate < endDate` is validated. A PIP can be created with `startDate` in the past, creating a confusing timeline for check-ins.
- **Fix:** Add `startDate >= today` validation.

### 14. Missing Deadline Ordering Validation in Review Cycles
- **File:** `src/controllers/performanceController.ts` — Line 158
- **Description:** Deadline validation checks each deadline against `end_date` but not against each other. A cycle can be created where the peer review deadline is before the self-review deadline.
- **Fix:** Validate relative ordering: `self_deadline < peer_deadline < manager_deadline <= end_date`.

### 15. `performanceReviewRepository.update` Uses `any` Type
- **File:** `src/repositories/performanceReviewRepository.ts` — Line 89
- **Description:** `updateData: any` bypasses type checking for update fields. Field name typos won't be caught at compile time.
- **Fix:** Use `Partial<PerformanceReviewDB>` as the update type.

---

## LOW Issues

### 16. `calculateFinalRating` and `finalizeReview` Inconsistent on Empty Peer Ratings
- **File:** `src/services/performanceReviewService.ts` — Lines 143–156
- **Description:** `calculateFinalRating()` silently handles an empty peer ratings array (returns a weighted average without peer component), but `finalizeReview()` throws an error if peer ratings are empty. These two methods are inconsistent — one accepts the edge case, the other doesn't.
- **Fix:** Either both should accept empty peer ratings or both should throw. Document the intended behavior.

### 17. Weight Normalization Edge Case — Division by Zero Risk
- **File:** `src/services/goalService.ts` — Lines 80–92
- **Description:** If `totalWeight === 0`, an early return prevents division by zero. However, the code structure makes this easy to break in future edits. The guard exists but is fragile.
- **Fix:** Extract weight normalization into a clearly commented utility function.

### 18. Floating Point Precision in Goal Completion Percentage
- **File:** `src/services/goalService.ts` — Line 92
- **Description:** Rounding to integer after normalizing weighted completion percentages can produce `75` instead of `75.5`. May be intentional but is undocumented.
- **Fix:** Document whether integer rounding is intentional or add a decimal precision parameter.

---

## Summary

| Severity | Count |
|----------|-------|
| Critical | 6     |
| High     | 4     |
| Medium   | 5     |
| Low      | 3     |
| **Total**| **18**|

### Top Priority Fixes
1. Fix all 4 service method signature mismatches — all tests are currently broken
2. Fix wrong dependency injection in controller (`goalRepository` vs `reviewCycleRepository`)
3. Add `userId` parameter to `recordOutcome` for audit trail
4. Validate review cycle existence before creating reviews
5. Fix PIP outcome status mapping for `'Extended'` and `'Escalated'`
