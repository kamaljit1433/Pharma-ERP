# Backend ESLint Error Report

> Generated: 2026-04-21  
> Tool: `npm run lint` (ESLint)  
> **Total: 3,342 problems — 2,659 errors, 683 warnings across 452 files**

TypeScript compilation (`tsc --noEmit`) passes cleanly. All issues below are ESLint violations.

---

## Summary by Rule

| # | Rule | Count | Severity | Auto-fixable |
|---|------|--------|----------|--------------|
| 1 | `@typescript-eslint/no-explicit-any` | 833 | Error | No |
| 2 | `max-len` (line > 100 chars) | 683 | Warning | No |
| 3 | `comma-dangle` (missing trailing comma) | 663 | Error | Yes |
| 4 | `@typescript-eslint/explicit-function-return-types` *(rule not found)* | 512 | Error | No |
| 5 | `indent` (wrong indentation) | 446 | Error | Yes |
| 6 | `@typescript-eslint/no-misused-promises` | 233 | Error | No |
| 7 | `Parsing error` (test files not in tsconfig) | 196 | Error | No |
| 8 | `@typescript-eslint/explicit-module-boundary-types` | 130 | Error | No |
| 9 | `@typescript-eslint/no-unused-vars` | 39 | Error | No |
| 10 | `no-console` (console statements) | 37 | Error | No |
| 11 | `quotes` (must use single quotes) | 28 | Error | Yes |
| 12 | `@typescript-eslint/no-floating-promises` | 14 | Error | No |
| 13 | `no-useless-escape` | 2 | Error | Yes |
| 14 | `@typescript-eslint/no-require-imports` | 2 | Error | No |
| 15 | `@typescript-eslint/no-namespace` | 1 | Error | No |

> 915 errors are auto-fixable with `eslint --fix`

---

## Affected Files: 452 total (241 source, 211 test)

### Top Source Files by Error Count

| Errors | File |
|--------|------|
| 150 | `src/middleware/fileUpload.ts` |
| 76 | `src/routes/separation.ts` |
| 54 | `src/routes/benefits.ts` |
| 52 | `src/services/email/templateEngine.ts` |
| 49 | `src/routes/dashboard.ts` |
| 49 | `src/controllers/benefitsController.ts` |
| 47 | `src/routes/training.ts` |
| 46 | `src/routes/leave.ts` |
| 44 | `src/routes/attendance.ts` |
| 43 | `src/utils/fastCheckConfig.ts` |
| 42 | `src/routes/performance.ts` |
| 41 | `src/services/separationService.ts` |
| 41 | `src/middleware/rbac.ts` |
| 40 | `src/routes/hierarchy.ts` |
| 39 | `src/routes/fileStorageRoutes.ts` |
| 38 | `src/services/auditLogService.ts` |
| 34 | `src/routes/notifications.ts` |
| 33 | `src/middleware/security.ts` |
| 31 | `src/routes/recruitment.ts` |
| 31 | `src/routes/esignature.ts` |
| 31 | `src/controllers/separationController.ts` |
| 28 | `src/services/factories/StorageProviderFactory.ts` |
| 27 | `src/services/factories/EmailProviderFactory.ts` |
| 27 | `src/routes/suppliers.ts` |
| 25 | `src/routes/payroll.ts` |

---

## Error Details by Category

### 1. `@typescript-eslint/no-explicit-any` — 833 occurrences
**What it is:** Functions, parameters, or variables typed as `any` instead of a concrete type.  
**Where:** Pervasive — controllers, services, routes, utils, middleware, factories.

**Examples:**
```
src/utils/fastCheckConfig.ts:15   – parameter typed any
src/utils/encryption.ts:125       – argument 'obj' typed any
src/middleware/rbac.ts:200        – argument 'role' typed any
src/__tests__/factories/*.ts      – factory helper functions
```

**Fix:** Replace `any` with proper types, generics, or `unknown`.

---

### 2. `max-len` — 683 warnings (lines > 100 chars)
**What it is:** Lines exceeding the 100-character limit.  
**Where:** Across the entire codebase.

**Fix:** Break long lines, extract variables, or adjust the `max-len` rule in `.eslintrc`.

---

### 3. `comma-dangle` — 663 occurrences
**What it is:** Missing trailing commas in multiline objects/arrays/function params.  
**Where:** Pervasive across all file types.

**Examples:**
```
src/utils/auditLog.ts:29       – missing trailing comma in object
src/utils/rbac.ts:91           – missing trailing comma
src/utils/circuitBreaker.ts:79 – missing trailing comma
```

**Fix:** Run `eslint --fix` — this rule is auto-fixable.

---

### 4. `@typescript-eslint/explicit-function-return-types` — 512 occurrences (rule not found)
**What it is:** The ESLint plugin version installed does not export this rule, so every file using it generates an error. This is a **configuration bug**, not a code bug.  
**Root cause:** Mismatch between `@typescript-eslint/eslint-plugin` version and the rule name used in `.eslintrc`.

**Fix (option A — preferred):** Upgrade `@typescript-eslint/eslint-plugin` to a version that includes this rule, or replace it with `@typescript-eslint/explicit-function-return-type` (note: without the trailing `s`).  
**Fix (option B):** Remove this rule from `.eslintrc` if return types are not required.

---

### 5. `indent` — 446 occurrences
**What it is:** Inconsistent indentation — typically 2 extra spaces (6 where 4 expected, 8 where 6 expected, etc.).  
**Where:** `src/utils/logger.ts`, controllers, services.

**Fix:** Run `eslint --fix` — this rule is auto-fixable.

---

### 6. `@typescript-eslint/no-misused-promises` — 233 occurrences
**What it is:** Async functions passed as callbacks to Express route handlers, event listeners, or other void-returning APIs without proper handling.  
**Where:** Almost every route file.

**Examples:**
```
src/routes/attendance.ts:26    – async handler passed where void expected
src/routes/benefits.ts:66      – async handler in router.get()
src/routes/leave.ts:46         – async route handler
src/config/passport.ts         – async callback
src/index.ts                   – async in app.use()
```

**Fix:** Wrap async route handlers in an error-handling wrapper, or use a library like `express-async-errors`. Example:
```typescript
// Instead of:
router.get('/path', async (req, res) => { ... });

// Use a wrapper:
router.get('/path', asyncHandler(async (req, res) => { ... }));
```

---

### 7. `Parsing error` (test files not in tsconfig) — 196 occurrences
**What it is:** Test files in `src/__tests__/` and `src/utils/__tests__/` are not included in `tsconfig.json`, so the TypeScript ESLint parser cannot process them.  
**Affected:** All 196 `*.test.ts` and `*.integration.test.ts` files.

**Fix:** Add a `tsconfig.test.json` that extends the base config and includes test files, then reference it in `.eslintrc`:
```json
// tsconfig.test.json
{
  "extends": "./tsconfig.json",
  "include": ["src/**/*.ts", "src/**/__tests__/**/*.ts"]
}
```
Or update `parserOptions.project` in `.eslintrc` to include both tsconfig files.

---

### 8. `@typescript-eslint/explicit-module-boundary-types` — 130 occurrences
**What it is:** Exported functions are missing explicit return types and/or parameter types.  
**Where:** Factory builders, utils, repositories.

**Examples:**
```
src/__tests__/factories/factory-builder.ts:43  – missing return type
src/__tests__/factories/base.factory.ts:71      – argument 'data' typed any
src/utils/retry.ts:180                          – missing return type on exported function
```

**Fix:** Add explicit return types and parameter types to all exported functions.

---

### 9. `@typescript-eslint/no-unused-vars` — 39 occurrences
**What it is:** Variables/imports declared but never used.

**Examples:**
```
src/utils/encryption.ts:10    – 'AUTH_TAG_LENGTH' assigned but never used
src/utils/fastCheckGenerators.ts:9 – 'uuidv4' imported but unused
src/utils/resilience.ts:9     – 'isRetryableError', 'RetryError' unused
src/utils/fastCheckConfig.ts:301 – 'error' defined but unused
```

**Fix:** Remove unused imports/variables, or prefix with `_` to mark as intentionally unused.

---

### 10. `no-console` — 37 occurrences
**What it is:** `console.log`, `console.error`, etc. used directly instead of the logger utility.  
**Where:** `src/utils/logger.ts`, `src/utils/fastCheckConfig.ts`, and other utils.

**Fix:** Replace `console.*` calls with the project's `logger` utility.

---

### 11. `quotes` — 28 occurrences
**What it is:** Double quotes used where single quotes are required by the ESLint config.  
**Where:** Scattered across service and config files.

**Fix:** Run `eslint --fix` — this rule is auto-fixable.

---

### 12. `@typescript-eslint/no-floating-promises` — 14 occurrences
**What it is:** Promises that are not awaited, not chained with `.catch()`, and not marked with `void`.  
**Where:** `src/utils/fastCheckConfig.ts` (lines 72, 88, 104, 120, 138, 300).

**Fix:** Either `await` the promise, chain `.catch()`, or use `void expression` to explicitly discard it.

---

## Quick Wins (do these first)

| Action | Fixes | Command |
|--------|-------|---------|
| Auto-fix trailing commas + indentation + quotes | ~915 errors | `npx eslint src --ext .ts --fix` |
| Fix `tsconfig.json` to include test files | 196 errors | Add `tsconfig.test.json` + update `.eslintrc` |
| Fix missing ESLint rule (`explicit-function-return-types`) | 512 errors | Update `@typescript-eslint/eslint-plugin` or fix rule name in `.eslintrc` |

These three steps alone would eliminate **~1,623 errors (~61% of all errors)** with minimal code changes.

---

## Recommended Fix Order

1. **Config fixes (no code changes):**
   - Fix `@typescript-eslint/explicit-function-return-types` rule name/version → -512 errors
   - Add `tsconfig.test.json` for test file parsing → -196 errors

2. **Auto-fixable (run eslint --fix):**
   - `comma-dangle`, `indent`, `quotes` → ~-915 errors

3. **Route files (high impact):**
   - Wrap all async route handlers with an error wrapper → fixes `no-misused-promises` in all route files

4. **Type safety:**
   - Replace `any` types in utils, factories, and middleware → fixes `no-explicit-any`

5. **Cleanup:**
   - Remove unused imports/variables
   - Replace `console.*` with logger
   - Fix floating promises in `fastCheckConfig.ts`
