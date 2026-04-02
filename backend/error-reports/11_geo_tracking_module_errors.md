# Geo-Tracking Module - Error Report

**Module:** Geo-Tracking, Journey Management & Travel Allowance
**Files Analyzed:**
- `src/controllers/geoTrackingController.ts`
- `src/services/geoTrackingService.ts`
- `src/services/travelAllowanceService.ts`
- `src/repositories/geoLogRepository.ts`
- `src/repositories/journeyRepository.ts`
- `src/routes/geo-tracking.ts`
- `src/types/geoTracking.ts`

---

## CRITICAL Issues

### 1. `captureLocation()` Uses `navigator.geolocation` — Browser API in Node.js
- **File:** `src/services/geoTrackingService.ts` — Lines 47–73
- **Description:** `captureLocation()` calls `navigator.geolocation`, a browser-only Web API. `navigator` does not exist in Node.js — this code will always throw `ReferenceError: navigator is not defined` at runtime. The entire function is non-functional on the backend.
- **Fix:** Remove this function from the backend service entirely. Location should be captured on the client (frontend/mobile app) and sent to the backend as coordinates in the request body.

---

## HIGH Issues

### 2. Any Authenticated User Can View Any Employee's Journey
- **File:** `src/routes/geo-tracking.ts` — Lines 23–25
- **Description:** `GET /journey/:employeeId/:date` only applies `authenticateToken` — no authorization check verifies the requester is the employee themselves or their manager. Any authenticated user can retrieve any employee's movement history.
- **Fix:** Add middleware to verify `req.user.id === employeeId` OR the requester is in the employee's management chain.

### 3. Journey Approver Not Verified as Employee's Manager
- **File:** `src/controllers/geoTrackingController.ts` — Lines 143–191
- **Description:** `approveJourney()` requires `['Manager', 'HR Manager', 'Super Admin']` role but does not verify the approving manager is actually in the target employee's reporting chain. Any HR Manager can approve any employee's journey regardless of department.
- **Fix:** Validate the approver's relationship to the employee before allowing approval.

### 4. `JSON.parse()` Without Error Handling in Repositories
- **File:** `src/repositories/geoLogRepository.ts` — Line 96 / `src/repositories/journeyRepository.ts` — Line 132
- **Description:** `JSON.parse(row.metadata)` and `JSON.parse(row.waypoints)` are called without try/catch. A single corrupted row in the database will throw an unhandled `SyntaxError` and crash the endpoint.
- **Fix:** Wrap every `JSON.parse` call in try/catch; return `null` or the raw string on parse failure.

### 5. Invalid `timestamp` Accepted Without Validation
- **File:** `src/controllers/geoTrackingController.ts` — Line 55
- **Description:** `new Date(timestamp)` is called on the raw request body value without validating the format. An invalid string produces `Invalid Date` which is silently stored in the database.
- **Fix:** Validate `timestamp` is a valid ISO 8601 string or a Unix millisecond integer; return `400` if invalid.

### 6. `NaN` Passes Month/Year Validation
- **File:** `src/controllers/geoTrackingController.ts` — Lines 199–202
- **Description:** `parseInt(month)` produces `NaN` when `month` is not a number. The check `NaN < 1` evaluates to `false` in JavaScript, so `NaN` silently passes the bounds validation and is passed to the database query, causing a SQL error.
- **Fix:** Add an explicit `isNaN(monthNum)` check immediately after `parseInt()`.

### 7. Coordinate Values Not Type-Checked
- **File:** `src/controllers/geoTrackingController.ts` — Lines 35–47
- **Description:** Latitude and longitude are validated as numeric ranges, but if sent as strings (e.g., `"91"`), JavaScript's loose comparison `"91" < -90` returns `true` (string comparison), making the bounds check incorrect.
- **Fix:** Explicitly parse and type-check: `const lat = parseFloat(latitude); if (isNaN(lat) || lat < -90 || lat > 90) ...`.

### 8. Travel Allowance Approval Routing Failure Silently Swallowed
- **File:** `src/services/travelAllowanceService.ts` — Lines 74–84
- **Description:** If `approvalRoutingService.routeApprovalRequest()` throws, the error is only `console.error`'d and the travel log is returned as successfully created — even though it will never go through the approval workflow.
- **Fix:** Re-throw the error or return a status indicating approval routing failed.

---

## MEDIUM Issues

### 9. `accuracy` Field Not Validated
- **File:** `src/controllers/geoTrackingController.ts` — Lines 30–47
- **Description:** Latitude and longitude are range-checked, but `accuracy` (GPS precision in meters) is not validated. Negative values, zero, or extreme values (e.g., `accuracy = -1` or `accuracy = 999999`) are accepted.
- **Fix:** Validate `accuracy >= 0 && accuracy < 50000`.

### 10. Employee Existence Not Verified Before Creating Geo Log
- **File:** `src/controllers/geoTrackingController.ts` — Lines 30–56
- **Description:** A geo log is created for any `employeeId` in the request body without checking if that employee exists, creating orphaned records.
- **Fix:** Query the employee before creating the log; return `404` if not found.

### 11. Day Boundaries Use Server Timezone, Not UTC
- **File:** `src/repositories/journeyRepository.ts` — Lines 48–63, 65–80
- **Description:** `setHours(0, 0, 0, 0)` uses the Node.js process's local timezone. If the server is in a different timezone than the employee, daily journey queries will include/exclude records from the wrong day.
- **Fix:** Use UTC throughout: `new Date(date + 'T00:00:00Z')`.

### 12. Anomaly Detection Thresholds Hardcoded
- **File:** `src/services/geoTrackingService.ts` — Lines 148–176
- **Description:** Speed and distance anomaly thresholds are hardcoded (`300 km/h`, `100 km in 1 hour`, `50 km in 60 seconds`). No configuration option exists, and no validation ensures these values are sensible.
- **Fix:** Move thresholds to application config; validate they are positive numbers.

### 13. `GeoLocation` Accuracy Field Inconsistently Optional
- **File:** `src/types/geoTracking.ts` — Line 13 / `src/services/geoTrackingService.ts` — Line 9
- **Description:** `types/geoTracking.ts` declares `accuracy?: number` (optional) while `geoTrackingService.ts` treats it as `accuracy: number` (required). This inconsistency causes TypeScript errors to be suppressed silently.
- **Fix:** Align both to `accuracy?: number` and handle the undefined case explicitly.

### 14. GeoFence `type` Not Validated Against Allowed Values
- **File:** `src/controllers/geoTrackingController.ts` — Lines 307–309
- **Description:** `type` from query is cast directly as `'Office' | 'Site' | 'Restricted' | 'Custom'` without validation. An invalid value passes through silently.
- **Fix:** Validate against the allowed union values before use.

### 15. Travel Allowance Config Values Not Validated
- **File:** `src/services/travelAllowanceService.ts` — Lines 33–38
- **Description:** `ratePerKm`, `minDistance`, `maxAllowancePerDay` are parsed from environment variables with no validation. Negative values or zero would cause incorrect allowance calculations.
- **Fix:** Validate all config values are positive numbers on service initialization.

---

## LOW Issues

### 16. `require('uuid').v4()` Called Inline Instead of Top-Level Import
- **File:** `src/controllers/geoTrackingController.ts` — Lines 60, 164, 275
- **Description:** `require('uuid').v4()` is called inline in the function body rather than imported once at the top. This re-requires the module on every call (inefficient) and is inconsistent with the rest of the codebase.
- **Fix:** Add `import { v4 as uuidv4 } from 'uuid'` at the top.

### 17. Non-UUID ID Generation in `travelAllowanceService`
- **File:** `src/services/travelAllowanceService.ts` — Line 208
- **Description:** `${Date.now()}-${Math.random().toString(36).substr(2, 9)}` is used for ID generation instead of `uuidv4()`. Has a small but non-zero collision risk.
- **Fix:** Use `uuidv4()`.

### 18. Inconsistent Date Range Handling Between Repositories
- **File:** `src/repositories/geoLogRepository.ts` vs `src/repositories/journeyRepository.ts`
- **Description:** `geoLogRepository` uses `setHours(23, 59, 59, 999)` to set end-of-day, while `journeyRepository` uses `0, 23, 59, 59, 999`. The inclusion of milliseconds is inconsistent and can cause off-by-one errors at day boundaries.
- **Fix:** Standardize to UTC end-of-day: `new Date(date + 'T23:59:59.999Z')`.

---

## Summary

| Severity | Count |
|----------|-------|
| Critical | 1     |
| High     | 7     |
| Medium   | 7     |
| Low      | 3     |
| **Total**| **18**|

### Top Priority Fixes
1. Remove `captureLocation()` — `navigator.geolocation` doesn't exist in Node.js, the function always crashes
2. Add authorization to journey endpoint — any user can view any employee's location history
3. Add `JSON.parse()` error handling in geo log and journey repositories
4. Fix `NaN` passing month/year validation
5. Validate timestamp format before calling `new Date()`
