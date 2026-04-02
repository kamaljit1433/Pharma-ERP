# Notifications Module - Error Report

**Module:** Notifications (In-App, Email, Push)
**Files Analyzed:**
- `src/controllers/notificationController.ts`
- `src/services/notificationService.ts`
- `src/repositories/notificationRepository.ts`
- `src/repositories/notificationTemplateRepository.ts`
- `src/routes/notifications.ts`
- `src/types/notification.ts`

---

## CRITICAL Issues

### 1. In-App Notifications Are Never Persisted
- **File:** `src/services/notificationService.ts` — Lines 256–279
- **Description:** `storeInAppNotification()` only logs the notification — it never writes to the database. A comment on line 258 says `"In a real implementation, store in database"`. Every in-app notification is lost when the process restarts or when the caller checks for notifications.
- **Fix:** Implement the actual database insert using `notificationRepository.create()`.

### 2. Push Notifications Are Never Sent
- **File:** `src/services/notificationService.ts` — Lines 227–254
- **Description:** Both `sendPushNotification()` and `sendBulkPushNotification()` have placeholder bodies. Line 233 says `"In a real implementation, fetch device tokens from database"`. No FCM calls are ever made. The entire push notification feature is non-functional.
- **Fix:** Implement device token lookup and FCM `sendEachForMulticast()` call using the Firebase Admin SDK (already imported).

---

## HIGH Issues

### 3. Email Notifications Only Logged — Never Sent
- **File:** `src/services/notificationService.ts` — Lines 120–123, 156–158
- **Description:** Email notification sending is reduced to a `console.log()` call. No email is ever dispatched despite the API promising email delivery. This silently fails for all email-triggered notifications (leave approvals, payroll, etc.).
- **Fix:** Call the actual email service (SES/SendGrid/Nodemailer — already configured in the project) from `sendNotification()`.

### 4. Template Management Endpoints Lack Authorization in Controller
- **File:** `src/controllers/notificationController.ts` — Lines 118–283
- **Description:** Create, list, get, update, and delete template endpoints have no authorization check within the controller methods. The route-level `authorize` call is the only guard — if it's bypassed or misconfigured, any user can modify notification templates.
- **Fix:** Add explicit role checks inside the controller as defense-in-depth, or ensure route-level authorization is consistently applied.

### 5. User Notification Preferences Never Checked
- **File:** `src/services/notificationService.ts` — Lines 110–144
- **Description:** The `NotificationPreferences` type is defined and the `getUserPreferences()` repository method exists, but `sendNotification()` never reads user preferences. Users who opt out of email or push notifications still receive them.
- **Fix:** Fetch user preferences before sending each channel type; skip channels the user has disabled.

---

## MEDIUM Issues

### 6. Role String Comparison is Case-Sensitive and Fragile
- **File:** `src/routes/notifications.ts` — Lines 33, 41, 49, 57, 66
- **Description:** Authorization uses string literals like `'Super Admin'` and `'HR Manager'`. If roles are stored as `'super_admin'` or `'hr_manager'` in the database, the comparison silently fails and blocks legitimate access.
- **Fix:** Use an enum or constants for role names; normalize to one case convention throughout.

### 7. No Validation on Template Variables Field
- **File:** `src/controllers/notificationController.ts` — Line 152 / `src/repositories/notificationTemplateRepository.ts` — Lines 43, 82–83
- **Description:** The `variables` field on templates accepts any object without schema validation. An invalid structure can cause rendering errors at notification-send time, not at template-save time.
- **Fix:** Validate that `variables` is a JSON object with string values; reject malformed payloads at save time.

### 8. Notification ID Not Validated Before Mark-as-Read
- **File:** `src/controllers/notificationController.ts` — Lines 68–70
- **Description:** The `id` parameter for `markAsRead()` is not validated for format (UUID, numeric, etc.). A malformed ID could cause unexpected repository behavior.
- **Fix:** Validate the `id` format before passing to the service.

### 9. Pagination `limit=0` Not Prevented
- **File:** `src/controllers/notificationController.ts` — Line 38
- **Description:** Maximum limit is capped at 100 but no minimum is enforced. A request with `limit=0` produces an empty page with no error, making pagination logic confusing for clients.
- **Fix:** Enforce `limit >= 1`; return `400` if below minimum.

### 10. Notification Hard Delete — No Audit Trail
- **File:** `src/repositories/notificationRepository.ts` — Lines 92–94
- **Description:** `delete()` performs a hard DELETE from the database. Deleted notifications leave no trace, making it impossible to audit what notifications were sent to a user.
- **Fix:** Implement soft delete using a `deleted_at` timestamp column.

### 11. FCM Provider Not Thread-Safe on Initialization
- **File:** `src/services/notificationService.ts` — Lines 24–34
- **Description:** `fcmProvider` is initialized in the constructor without any locking or singleton guard. In environments with multiple workers, each instance initializes Firebase Admin separately, potentially causing connection pool issues.
- **Fix:** Use a module-level singleton for Firebase Admin initialization (as recommended in Firebase docs).

### 12. Notification Metadata Stored Without Validation
- **File:** `src/repositories/notificationRepository.ts` — Line 37
- **Description:** `metadata` is stored as-is without schema validation. Arbitrary or oversized metadata objects can be persisted.
- **Fix:** Define a `NotificationMetadata` interface with required/optional fields; validate before storage.

### 13. Templates Hardcoded In-Memory — Not Configurable Without Code Change
- **File:** `src/services/notificationService.ts` — Lines 37–107
- **Description:** All notification templates are hardcoded in `initializeTemplates()`. Any change to a template (subject line, body copy, variables) requires a code deploy.
- **Fix:** Load templates from the database at startup (using `notificationTemplateRepository`). Fall back to in-memory defaults only if DB load fails.

### 14. `data` Field Type Too Permissive
- **File:** `src/types/notification.ts` — Line 76
- **Description:** `data?: Record<string, string>` allows any string key-value pairs without structure validation. Template rendering can silently receive unexpected or missing fields.
- **Fix:** Define strongly typed `data` interfaces per notification type, or validate required fields before sending.

---

## LOW Issues

### 15. Missing Route Ordering — `/templates` Post Before General Routes
- **File:** `src/routes/notifications.ts` — Lines 30, 45
- **Description:** The `POST /templates` route is defined before specific `GET /templates/:id` routes. While this works in this case, the ordering is a maintenance risk if more routes are added.
- **Fix:** Group routes by resource and document the ordering requirement.

### 16. No Composite Index on `(employee_id, is_read)`
- **File:** `src/repositories/notificationRepository.ts` — Lines 82–90
- **Description:** `getUnreadCount()` filters by `employee_id` and `is_read` without a composite index hint. On large notification tables this query will be slow.
- **Fix:** Ensure a composite index exists on `(employee_id, is_read)` in the migration.

---

## Summary

| Severity | Count |
|----------|-------|
| Critical | 2     |
| High     | 3     |
| Medium   | 9     |
| Low      | 2     |
| **Total**| **16**|

### Top Priority Fixes
1. Implement `storeInAppNotification()` — currently all in-app notifications are lost immediately
2. Implement push notification sending — entire push feature is non-functional stubs
3. Implement email sending — currently only `console.log`'d
4. Check user notification preferences before sending — opt-outs are ignored
5. Fix role string comparison — use consistent casing/enum to prevent silent auth failures
