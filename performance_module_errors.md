# Performance Module Error Report

## CRITICAL — Runtime crashes / data never written

### `backend/src/database/migrations/20260319000000_create_performance_tables.ts`

The migration is missing many columns that the repositories actually use. Any write/read will either fail or silently drop data:

| Table | Missing columns |
|---|---|
| `goals` | `cycle_id`, `unit`, `weight`, `due_date`, `created_by`, `completion_percentage`; status enum has `['draft','active','completed','cancelled']` but repo writes `'On Track'` / `'At Risk'` / `'Behind'` / `'Completed'` |
| `goals` | `goal_progress_history` table never created but `goalRepository.ts:96` inserts into it |
| `feedback` | Column is named `employee_id` but repo uses `to_employee_id`; missing `type`, `content`, `is_anonymous` (migration has `feedback_text` instead of `content`) |
| `pips` | Missing `checkpoints` column — `pipRepository.ts:77` inserts `checkpoints: JSON.stringify([])` which will fail |
| `review_cycles` | Missing `self_review_deadline`, `manager_review_deadline`, `peer_review_deadline`, `created_by` |

---

### `backend/src/services/pipService.ts`

- **Line 66**: `pip.startDate` / `pip.endDate` don't exist — `PIPRepository.PIP` uses snake_case `start_date` / `end_date`. The `as any` cast hides the compile error; at runtime both are `undefined`, so the date comparison always throws or gives wrong results.
- **Line 92**: `pip.status !== 'Active'` — repo always sets status as `'active'` (lowercase), so this check is always `true`, and **no PIP outcome can ever be recorded**.
- **Line 105**: `pip.checkIns` — `PIPRepository.PIP` has no `checkIns` field (it has `goals`). This is `undefined`, so `pip.checkIns.length` **throws a TypeError at runtime**.
- **Lines 108, 124**: `pip.employeeId` / `pip.outcome` — neither exists on `PIPRepository.PIP`; always `undefined`.

---

### `backend/src/controllers/performanceController.ts` — `getDashboard`

- **~Line 438**: Queries `goals` filtering `status IN ['active', 'completed']` (lowercase), but actual stored values are `'On Track'` / `'Completed'` / etc. → **goal stats always return zeros**.
- **~Line 438**: References `progress_percentage` column, but `goalRepository.ts:89` writes `completion_percentage`. One of them is wrong and the query will fail or return nulls.

---

## HIGH — Wrong data / 404s at runtime

### `frontend/src/services/performanceService.ts` — PIP URL mismatch (all 5 calls)

Frontend uses `/pips` (plural), backend routes all use `/pip` (singular):

| Line | Frontend calls | Backend route |
|---|---|---|
| 126 | `POST /performance/pips` | `POST /performance/pip` |
| 136 | `GET /performance/pips/active` | **no route at all** |
| 141 | `GET /performance/pips/employee/:id` | `GET /performance/pip/employee/:id` |
| 145 | `POST /performance/pips/:id/check-in` | `PUT /performance/pip/:id/check-in` (also wrong HTTP method) |
| 150 | `PUT /performance/pips/:pipId/outcome` | `PUT /performance/pip/:id/outcome` |

### `frontend/src/services/performanceService.ts` — Missing backend routes for review cycles

These frontend calls have no corresponding backend route:
- `GET /performance/review-cycles` (line 54) — store's `fetchReviewCycles`
- `GET /performance/review-cycles/:id` (line 48)
- `PUT /performance/review-cycles/:id` (line 61)
- `PUT /performance/review-cycles/:id/status` (line 65)
- `DELETE /performance/review-cycles/:id` (line 71)

### `frontend/src/services/performanceService.ts` — Other missing routes

- Line 113: `GET /performance/feedback/employee/:id` — backend route is `GET /performance/feedback/:employeeId` (no `employee/` prefix)
- Line 118: `GET /performance/feedback/given/:id` — no such route
- Lines 165–182: Three stats endpoints (`/stats/goal-completion`, `/stats/review-ratings`, `/stats/feedback-sentiment`) — none registered in routes
- Line 22: `PUT /performance/goals/:id` (full update) — no route; only `PUT /goals/:id/progress` exists
- Line 35: `DELETE /performance/goals/:id` — no route
- Line 97: `PUT /performance/reviews/:id` — no route

---

## MEDIUM — Type/interface mismatches (wrong shape returned to callers)

### `backend/src/services/performanceReviewService.ts`

- **Lines 82, 104–113**: `generateSummaryReport` and `generateDetailedReport` access `r.finalRating`, `r.selfRating`, `r.managerRating`, `r.peerRatings`, `r.employeeId`, `r.cycleId`, `r.createdAt` — but `PerformanceReviewRepository.PerformanceReview` is snake_case (`employee_id`, `cycle_id`, no `selfRating`/`managerRating`/`peerRatings`/`finalRating`). All these will be `undefined` in reports.

### `backend/src/types/performance.ts` vs `backend/src/repositories/performanceReviewRepository.ts`

- `types/performance.ts` `PerformanceReview` has `selfRating`, `managerRating`, `peerRatings`, `finalRating` — the repository interface and DB schema only have a single `rating` column. The two `PerformanceReview` interfaces are completely different shapes and both named the same thing.

### `backend/src/repositories/feedbackRepository.ts`

- **Line 83**: `feedback.visibility === 'Manager Only'` — `types/performance.ts` defines visibility as `'Private' | 'Manager Only' | 'Public'` but the migration stores lowercase `'manager'`, `'public'`, `'private'`. The filter will never match.

### `frontend/src/store/performanceStore.ts`

- **Line 59**: Store `PIP` interface has `goalIds: string[]`, but `types/performance.ts` and `pipService` use `goals: string[]`. If any code accesses `pips[n].goalIds`, it gets `undefined`.

---

## LOW — Minor inconsistencies

- `reviewCycleRepository.ts` `ReviewCycle` interface uses snake_case (`start_date`, `end_date`) while `types/performance.ts` `ReviewCycle` uses camelCase (`startDate`, `endDate`) — two incompatible interfaces with the same name in the same module.
- `goalRepository.ts:19`: sets initial status as `'On Track'` — not in the migration's enum `['draft','active','completed','cancelled']`, so this insert will fail with a DB constraint error.

---

## Summary

The biggest issue is the **migration file** — it is severely out of sync with what the repositories expect. Nearly every table is missing columns or has wrong column names. Beyond that there are **5 PIP endpoint URL mismatches**, **5+ missing review-cycle routes**, and a **runtime crash** in `pipService.getPIPProgress` from accessing `pip.checkIns` which doesn't exist on the repository's return type.
