# Auth Module - Error Report

**Module:** Authentication & Authorization
**Files Analyzed:**
- `src/controllers/authController.ts`
- `src/services/authService.ts`
- `src/repositories/authRepository.ts`
- `src/routes/authRoutes.ts`
- `src/types/auth.ts`
- `src/config/passport.ts`
- `src/utils/jwt.ts`
- `src/middleware/auth.ts`

---

## CRITICAL Issues

### 1. Tokens Exposed in OAuth Redirect URL
- **File:** `src/routes/authRoutes.ts` — Line 122
- **Description:** Access tokens and refresh tokens are passed as URL query parameters during OAuth callback redirect. This exposes tokens to browser history, HTTP referrer headers, proxy/firewall logs, and CDN logs.
- **Fix:** Use HTTP-only secure cookies or a short-lived exchange code pattern instead of query params.

---

## HIGH Issues

### 2. MFA Secret Not Verified on Enable
- **File:** `src/services/authService.ts` — Lines 231–252
- **Description:** `enableMFA()` accepts the `secret` directly from the request body without verifying it matches the one generated in `setupMFA()`. An attacker could enable MFA with a secret they control, locking out the legitimate user or gaining unauthorized access.
- **Fix:** Store the generated secret server-side (temporarily in Redis/DB) during setup and verify it matches before enabling.

### 3. Race Condition in Backup Code Usage
- **File:** `src/repositories/authRepository.ts` — Lines 144–165
- **Description:** `useBackupCode()` performs a non-atomic read-then-update. Two simultaneous requests using the same backup code could both read `used: false` and both succeed.
- **Fix:** Use a single atomic `UPDATE ... WHERE used = false RETURNING *` query to eliminate the race.

### 4. Incorrect OAuth Callback — Wrong Function Call
- **File:** `src/routes/authRoutes.ts` — Lines 117–122
- **Description:** The Google OAuth callback calls `authService.refreshToken(user.id)` but `refreshToken()` expects a refresh token string, not a user ID. This will throw a runtime error on every OAuth login, breaking the entire Google OAuth flow.
- **Fix:** Generate tokens using `generateAccessToken(user)` / `generateRefreshToken(user)` instead.

### 5. Department Manager Can Access Any Employee's Data
- **File:** `src/middleware/auth.ts` — Lines 152–157
- **Description:** The `canAccessEmployeeData()` middleware has a placeholder comment: *"For now, we'll allow department managers to access any employee data"*. This grants department managers unrestricted access to all employees' data regardless of department.
- **Fix:** Implement proper department scoping — managers should only access employees in their department.

---

## MEDIUM Issues

### 6. Inconsistent `id` vs `userId` in JWT Payload
- **File:** `src/middleware/auth.ts` — Lines 14–21 vs `src/types/auth.ts` — Lines 25–31
- **Description:** The middleware defines `JWTPayload` with field `id`, while `TokenPayload` in types uses `userId`. This type mismatch causes data inconsistencies when verifying tokens.
- **Fix:** Unify the field name across all files to either `id` or `userId`.

### 7. JWT Middleware Skips Issuer/Audience Validation
- **File:** `src/middleware/auth.ts` — Line 43
- **Description:** Token generation in `jwt.ts` sets `issuer` and `audience` options, but the verification middleware does not check them. Any valid-signature token from a different system would be accepted.
- **Fix:** Add `issuer` and `audience` to the `verify()` options in the middleware.

### 8. Registration Event Logged as Login
- **File:** `src/services/authService.ts` — Lines 58–63
- **Description:** During user registration, the audit event is logged as `'login_success'` instead of `'register_success'`, corrupting audit logs.
- **Fix:** Use the correct event type `'register_success'` during registration.

### 9. OAuth User Created with Fake Employee ID
- **File:** `src/services/authService.ts` — Lines 420–427
- **Description:** New OAuth users are assigned `employeeId: 'OAUTH_' + Date.now()` as a placeholder. These records are never linked to an actual employee, breaking the employee management relationship.
- **Fix:** Either create a proper employee record on first OAuth login or defer employee linking to an onboarding flow.

### 10. No Rate Limiting on MFA Backup Code Attempts
- **File:** `src/services/authService.ts` — Lines 283–298
- **Description:** Backup codes can be brute-forced without any attempt tracking or rate limiting.
- **Fix:** Track failed attempts per user, lock after N failures.

### 11. `mapToUser()` Uses `any` Type — No Field Validation
- **File:** `src/repositories/authRepository.ts` — Line 300
- **Description:** Row data is mapped to a `User` object using `row: any` with no validation that required fields exist. Missing fields will produce `undefined` properties silently.
- **Fix:** Type the row properly or add explicit checks for required fields.

### 12. `logAuthEvent()` Calls `.toLowerCase()` Without Null Check
- **File:** `src/repositories/authRepository.ts` — Lines 279–295
- **Description:** If `email` is null or undefined, calling `.toLowerCase()` will throw a runtime error.
- **Fix:** Add a null/undefined guard: `email?.toLowerCase() ?? ''`.

### 13. All Route Handlers Use `as any` Casts
- **File:** `src/routes/authRoutes.ts` — Lines 34, 41, 48, 55, 62, 83
- **Description:** Type checking is bypassed in 6 route handler definitions using `as any`, hiding potential middleware/handler signature mismatches.
- **Fix:** Properly type request/response objects or use typed middleware wrappers.

### 14. Silent Error Handling in `logout()` and `getProfile()`
- **File:** `src/controllers/authController.ts` — Lines 147–151, 175–180
- **Description:** Errors are caught but never logged, making it impossible to debug failures in these methods.
- **Fix:** Add `logger.error(error)` or equivalent in catch blocks.

### 15. Silent Error in `deserializeUser()`
- **File:** `src/config/passport.ts` — Lines 104–121
- **Description:** Database errors during session deserialization are silently forwarded to `done(error)` without any logging.
- **Fix:** Log errors before passing to `done()`.

### 16. `as any` Casts in Passport Config
- **File:** `src/config/passport.ts` — Lines 41, 85, 114
- **Description:** Type checking is bypassed in 3 places when casting user payloads.
- **Fix:** Define proper types for serialized user data.

### 17. Token Extraction Doesn't Validate Header Format
- **File:** `src/middleware/auth.ts` — Line 28
- **Description:** `authHeader.split(' ')[1]` will return `undefined` if the header has no space (e.g., `"Bearer"` alone). The undefined check on line 30 catches it eventually, but the logic is fragile.
- **Fix:** Validate header format explicitly: `if (!authHeader || !authHeader.startsWith('Bearer '))`.

### 18. Parameter Pollution in `canAccessEmployeeData()`
- **File:** `src/middleware/auth.ts` — Line 138
- **Description:** `targetEmployeeId` is pulled from `params`, `body`, OR `query` without specifying precedence. An attacker could supply it in multiple places to cause unexpected behavior.
- **Fix:** Pick a single authoritative source (e.g., `req.params` only).

---

## LOW Issues

### 19. `decodeToken()` Is Dangerous and Should Be Removed
- **File:** `src/utils/jwt.ts` — Lines 82–88
- **Description:** This function decodes tokens WITHOUT verifying the signature, marked as "for debugging." If ever called in a code path, it bypasses token security.
- **Fix:** Remove this function entirely or add a clear development-only guard.

### 20. Shared JWT Secret for Access and Refresh Tokens
- **File:** `src/utils/jwt.ts` — Lines 9–10, 20–21
- **Description:** Both token types use `config.jwt.secret`. Compromising one compromises both.
- **Fix:** Use separate secrets: `config.jwt.accessSecret` and `config.jwt.refreshSecret`.

### 21. `mfaEnabled: true` Allowed Without `mfaSecret`
- **File:** `src/types/auth.ts` — Lines 7–8
- **Description:** The `User` type allows `mfaEnabled: true` while `mfaSecret` is optional/undefined, allowing an inconsistent state.
- **Fix:** Use a discriminated union or make `mfaSecret` required when `mfaEnabled` is true.

### 22. Hardcoded OAuth Redirect Paths
- **File:** `src/routes/authRoutes.ts` — Lines 105, 112, 124
- **Description:** Redirect paths like `/login` are hardcoded and not configurable via environment variables.
- **Fix:** Move to environment config or a constants file.

---

## Summary

| Severity | Count |
|----------|-------|
| Critical | 1     |
| High     | 4     |
| Medium   | 13    |
| Low      | 4     |
| **Total**| **22**|

### Top Priority Fixes
1. Remove tokens from OAuth redirect URL query params
2. Fix the broken OAuth callback (`refreshToken(user.id)` bug)
3. Fix `id` vs `userId` JWT payload mismatch
4. Add atomic backup code usage to prevent race conditions
5. Restrict department manager access to their own department only
6. Add issuer/audience validation to JWT middleware
