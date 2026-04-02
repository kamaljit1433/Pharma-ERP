# File Storage Module - Error Report

**Module:** File Storage, Document Management & S3 Integration
**Files Analyzed:**
- `src/controllers/fileStorageController.ts`
- `src/services/fileStorageService.ts`
- `src/services/fileValidationService.ts`
- `src/services/documentService.ts`
- `src/services/storage/s3StorageProvider.ts`
- `src/services/storage/localStorageProvider.ts`
- `src/middleware/fileUpload.ts`
- `src/middleware/fileAccessControl.ts`
- `src/repositories/documentRepository.ts`
- `src/routes/fileStorageRoutes.ts`
- `src/types/fileStorage.ts`

---

## CRITICAL Issues

### 1. Admin File Cleanup Routes Have No Authorization
- **File:** `src/routes/fileStorageRoutes.ts` — Lines 168, 178, 188, 198
- **Description:** Routes for cleanup, bulk delete, and orphaned file cleanup only have `authenticateToken` applied — no role check. Any authenticated user (even a regular employee) can invoke bulk delete and wipe all stored files.
- **Fix:** Apply `authorize(['Super Admin'])` middleware on all destructive admin routes.

### 2. Private Method Accessed Via Bracket Notation — Breaks Encapsulation
- **File:** `src/controllers/fileStorageController.ts` — Line 353
- **Description:** `fileStorageService['filterFilesByPermissions']()` accesses a private method using bracket notation to bypass TypeScript's access control. This is a type-safety hole and will break if the method is renamed or refactored.
- **Fix:** Make `filterFilesByPermissions()` a `public` method, or expose a public wrapper.

### 3. File Key Parsing is Fragile — Silent Failure
- **File:** `src/middleware/fileAccessControl.ts` — Lines 322–353
- **Description:** `parseFileKey()` uses `key.split('/')` to extract components like `employeeId`. If the key format changes, contains encoded slashes, or is malformed, the parsed values are silently wrong — there is no validation of the extracted components (e.g., that `employeeId` is a valid UUID).
- **Fix:** Use a regex with named capture groups and validate each extracted field; throw on unrecognized key format.

### 4. Hardcoded Default JWT and Session Secrets
- **File:** `src/config/index.ts` — Lines 146, 150
- **Description:** JWT_SECRET and SESSION_SECRET have hardcoded default values (plain text strings). If environment variables are missing in production, the application silently uses weak, publicly known secrets — making all tokens forgeable.
- **Fix:** Remove defaults entirely; throw an error on startup if these are not set.

### 5. S3 Credentials Stored in Plain In-Memory Object
- **File:** `src/services/storage/s3StorageProvider.ts` — Lines 47–52
- **Description:** AWS access key and secret are read from config and stored in a plain object passed to the S3 client. No IAM role / instance profile is used. No credential rotation. If the process memory is dumped, credentials are exposed.
- **Fix:** Use AWS IAM roles (instance profiles) in production; if keys are required, use AWS Secrets Manager or environment-based credential chains, not hardcoded config values.

---

## HIGH Issues

### 6. Department Manager Has Blanket File Access — TODO Never Implemented
- **File:** `src/middleware/fileAccessControl.ts` — Lines 58–62, 150–154, 302–307
- **Description:** Three separate locations have `// TODO: Implement proper hierarchy check` with a fallback that grants department managers access to ALL files. No department scoping is enforced.
- **Fix:** Query the hierarchy to verify the requesting manager is in the same department as the file owner.

### 7. Finance Role Has Blanket Payslip/Contract Access
- **File:** `src/middleware/fileAccessControl.ts` — Lines 66, 250
- **Description:** Any user with the `finance` role can access any payslip or contract file across all employees. There is no check that the finance user is working on the relevant department or employee.
- **Fix:** Add additional filtering — finance role should only access files from their assigned cost center or business unit.

### 8. Missing Admin Authorization on Cleanup/Delete Controller Actions
- **File:** `src/controllers/fileStorageController.ts` — Lines 505, 545, 593, 627
- **Description:** Controller comments mark cleanup and bulk delete operations as "(Admin only)" but no authorization enforcement exists in the controller methods — the check only exists (incompletely) at the route level.
- **Fix:** Add explicit admin role check within the controller methods as a defense-in-depth measure.

### 9. Signed URLs Generated Without Access Verification
- **File:** `src/services/storage/s3StorageProvider.ts` — Lines 283–310
- **Description:** `getSignedUrl()` generates a pre-signed S3 URL for any given key without verifying the requesting user has permission to access that file. The URL, once generated, can be shared or leaked without further authorization.
- **Fix:** Validate user access to the file key before generating the signed URL; set the shortest reasonable expiry time.

### 10. S3 Bucket Existence Not Validated on Startup
- **File:** `src/services/storage/s3StorageProvider.ts` — Lines 42–55
- **Description:** The S3 client is initialized without verifying the configured bucket exists or is accessible. All errors surface only when actual operations fail, making startup misconfiguration hard to diagnose.
- **Fix:** Call `HeadBucket` on startup and throw a clear error if the bucket is unreachable.

### 11. File Upload Category Parameter Not Validated
- **File:** `src/middleware/fileUpload.ts` — Lines 22–50
- **Description:** `req.body?.category` is used without validation. If category is missing or invalid, `getCategoryLimits()` returns default limits silently instead of rejecting the request with a clear error.
- **Fix:** Validate category against allowed values before proceeding; reject with `400` if unknown.

### 12. Zip Bomb Detection is Inadequate
- **File:** `src/services/fileValidationService.ts` — Lines 296–302
- **Description:** Zip bomb detection relies on a simple byte entropy calculation. Highly compressed legitimate files may trigger false positives, and sophisticated zip bombs could evade this check. This is labeled as zip bomb prevention but provides minimal actual protection.
- **Fix:** Use proper decompression-based size check: decompress a small portion and extrapolate the ratio.

---

## MEDIUM Issues

### 13. Path Traversal Vulnerability in Local Storage Provider
- **File:** `src/services/storage/localStorageProvider.ts` — Lines 27, 71, 120
- **Description:** `path.join(this.uploadDir, key)` does not sanitize `key`. An attacker supplying a key like `../../etc/passwd` could read or overwrite files outside the upload directory.
- **Fix:** Use `path.resolve()` and verify the resolved path starts with `this.uploadDir`.

### 14. `JSON.parse` on Metadata Without Error Handling
- **File:** `src/controllers/fileStorageController.ts` — Line 68
- **Description:** `JSON.parse(metadata)` will throw a `SyntaxError` if `metadata` is invalid JSON, crashing the request handler without a proper error response.
- **Fix:** Wrap in try/catch and return `400 Bad Request` with a descriptive message.

### 15. S3 `listFiles()` Has 1,000-Item Hard Cap Without Pagination
- **File:** `src/services/storage/s3StorageProvider.ts` — Line 336
- **Description:** `MaxKeys: 1000` is set with no continuation token handling. Buckets with more than 1,000 objects will silently return an incomplete list.
- **Fix:** Implement paginated listing using `ContinuationToken` until `IsTruncated` is false.

### 16. `listFiles()` Makes N+1 S3 HEAD Requests
- **File:** `src/services/storage/s3StorageProvider.ts` — Lines 349–356
- **Description:** After listing objects, a `HeadObject` call is made for every file to retrieve metadata — N additional API calls for N files. For 1,000 files this means 1,001 S3 API calls.
- **Fix:** Use the `ListObjectsV2` response directly for available metadata; only call `HeadObject` for individual file details when needed.

### 17. Error Messages Expose Internal AWS Details
- **File:** `src/services/storage/s3StorageProvider.ts` — Lines 105, 134, 149, 248, 277, 308, etc.
- **Description:** Raw AWS SDK exception messages are returned to callers, potentially exposing bucket names, region, endpoint, and IAM details.
- **Fix:** Map AWS errors to generic messages; log the full error internally only.

### 18. Orphaned File Cleanup Has Incomplete Implementation
- **File:** `src/services/fileStorageService.ts` — Lines 472–538
- **Description:** A comment on lines 492–493 explicitly states: `"TODO: This would need database integration to check which files are referenced"`. The current heuristic (30 days old + empty metadata) is unreliable and will delete valid files.
- **Fix:** Join against the `documents` table to identify truly unreferenced files before deletion.

### 19. PDF JavaScript Detection is String-Based
- **File:** `src/services/fileValidationService.ts` — Lines 343–345
- **Description:** Checks for `/JavaScript` and `/JS` as plain string contains. Obfuscated or binary-encoded JavaScript in PDFs will bypass this check.
- **Fix:** Use a proper PDF parsing library (e.g., `pdf-lib`) for structural analysis.

### 20. Missing Dangerous File Extensions in Blocklist
- **File:** `src/services/fileValidationService.ts` — Line 256
- **Description:** Dangerous extensions like `.vb`, `.ps1`, `.psm1`, `.msh`, `.msh1`, `.scf`, `.reg`, `.hta`, `.inf` are not blocked.
- **Fix:** Expand the blocklist with all known dangerous extensions; prefer an allowlist approach instead.

### 21. Document Upload Missing `uploadedBy` in Audit Trail
- **File:** `src/services/documentService.ts` — Lines 36–43
- **Description:** `uploadFile()` does not include `uploadedBy` in the record. No audit trail of who uploaded a document.
- **Fix:** Add `uploadedBy: userId` to the document creation payload.

### 22. Hardcoded File Size Limit in `documentService`
- **File:** `src/services/documentService.ts` — Line 228
- **Description:** `10MB` max file size is hardcoded instead of reading from `config.upload.categoryLimits`.
- **Fix:** Reference the config value; this also allows category-specific overrides.

### 23. `GET /list` Route Ordering Issue
- **File:** `src/routes/fileStorageRoutes.ts` — Line 114
- **Description:** The `/list` route must be declared before any `/:key` pattern routes, otherwise Express may match `/list` as a key parameter. Current placement may cause this conflict.
- **Fix:** Move `/list` above all `/:key` routes.

### 24. No Disk Space Check in Local Storage
- **File:** `src/services/storage/localStorageProvider.ts` — Lines 25–36
- **Description:** Files are written without checking available disk space. A full disk will cause an unhandled OS-level exception.
- **Fix:** Check available space before writing large files; return a `507 Insufficient Storage` response.

---

## LOW Issues

### 25. `console.log` Used Instead of Logger Throughout Service
- **File:** `src/services/fileStorageService.ts` — Lines 64, 89, 111, 156, 201, 223, etc.
- **Description:** Raw `console.log` calls scattered throughout the service instead of using the structured logger (`src/utils/logger.ts`). Cannot control log levels or send to centralized logging.
- **Fix:** Replace all `console.log/error` with `logger.info/error`.

### 26. `as any` Type Assertions in File Upload Middleware
- **File:** `src/middleware/fileUpload.ts` — Lines 80, 145, 194, 243, 340
- **Description:** TypeScript type checking bypassed in multiple places in the middleware.
- **Fix:** Properly type the `res` and `next` parameters using Express types.

### 27. WebP Signature Detection May Exceed Buffer Bounds
- **File:** `src/services/fileValidationService.ts` — Line 203
- **Description:** The WebP check uses `subarray(8, 12)` without verifying the buffer is at least 12 bytes long. On very small files this throws a range error.
- **Fix:** Add a length guard: `if (buffer.length < 12) return false`.

### 28. `listMultipartUploads` Always Returns Empty Array
- **File:** `src/services/storage/localStorageProvider.ts` — Lines 248–250
- **Description:** Method always returns `[]` with a comment explaining it's not tracked. Callers expecting actual multipart upload info will get silently wrong data.
- **Fix:** Either implement tracking or throw `NotImplementedError` so callers know the method is unavailable.

---

## Summary

| Severity | Count |
|----------|-------|
| Critical | 5     |
| High     | 7     |
| Medium   | 12    |
| Low      | 4     |
| **Total**| **28**|

### Top Priority Fixes
1. Add authorization middleware on all admin/cleanup/delete routes (any user can currently delete all files)
2. Fix private method access via bracket notation
3. Add JWT/Session secret startup validation — no defaults
4. Implement hierarchy-based department manager access control (currently TODO)
5. Fix local storage path traversal vulnerability
6. Add S3 bucket validation on startup for clear misconfiguration errors
