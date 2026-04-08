# Backend Errors Report
Generated: 2026-04-06

---

## 1. ESLint (Cannot run)

**Error:** Failed to load plugin `@typescript-eslint` — missing module `@typescript-eslint/tsconfig-utils`.
**Cause:** Version mismatch in `@typescript-eslint` packages inside `node_modules`.
**Fix:** Run `npm install` from the root or `backend/` to resolve dependency mismatches.

---

## 2. TypeScript Build Errors (`npm run build` / `tsc`)

### `src/__tests__/factories/employee.factory.ts`
| Line | Error |
|------|-------|
| 55:22 | TS18048: `firstName` is possibly `undefined` |
| 55:49 | TS18048: `lastName` is possibly `undefined` |

### `src/__tests__/factories/factory-builder.ts`
| Line | Error |
|------|-------|
| 130:77 | TS18048: `designation` is possibly `undefined` |

### `src/__tests__/factories/leave-type.factory.ts`
| Line | Error |
|------|-------|
| 44:13 | TS18048: `leaveType` is possibly `undefined` |
| 45:13 | TS18048: `leaveType` is possibly `undefined` |
| 46:23 | TS18048: `leaveType` is possibly `undefined` |
| 47:21 | TS18048: `leaveType` is possibly `undefined` |
| 48:28 | TS18048: `leaveType` is possibly `undefined` |
| 50:16 | TS18048: `leaveType` is possibly `undefined` |

### `src/__tests__/factories/recruitment.factory.ts`
| Line | Error |
|------|-------|
| 33:40 | TS2314: Generic type `BaseFactory<T>` requires 1 type argument(s) |
| 40:16 | TS2339: Property `generateId` does not exist on type `JobPostingFactory` |
| 56:16 | TS2339: Property `knex` does not exist on type `JobPostingFactory` |
| 56:26 | TS2339: Property `tableName` does not exist on type `JobPostingFactory` |
| 61:39 | TS2314: Generic type `BaseFactory<T>` requires 1 type argument(s) |
| 68:16 | TS2339: Property `generateId` does not exist on type `ApplicantFactory` |
| 71:19 | TS2339: Property `randomEmail` does not exist on type `ApplicantFactory` |
| 80:16 | TS2339: Property `knex` does not exist on type `ApplicantFactory` |
| 80:26 | TS2339: Property `tableName` does not exist on type `ApplicantFactory` |

### `src/__tests__/factories/shift.factory.ts`
| Line | Error |
|------|-------|
| 42:13 | TS18048: `shift` is possibly `undefined` |
| 43:13 | TS18048: `shift` is possibly `undefined` |
| 44:19 | TS18048: `shift` is possibly `undefined` |
| 45:17 | TS18048: `shift` is possibly `undefined` |
| 46:23 | TS18048: `shift` is possibly `undefined` |

### `src/__tests__/utils/test-helpers.ts`
| Line | Error |
|------|-------|
| 71:50 | TS2769: No overload matches — `any[] \| undefined` not assignable to `RawBinding` |
| 114:5 | TS2322: Type `string \| number` is not assignable to type `number` |
| 114:20 | TS4111: Property `count` from index signature must be accessed with `['count']` |

### `src/controllers/documentController.ts`
| Line | Error |
|------|-------|
| 130:30 | TS4111: Property `days` from index signature must be accessed with `['days']` |
| 130:56 | TS4111: Property `days` from index signature must be accessed with `['days']` |

### `src/middleware/rbac.ts`
| Line | Error |
|------|-------|
| 17:7 | TS2717: Property `user` must be of type `User \| undefined`, but declared as `{ id: string; role: Role; ... } \| undefined` |
| 31:10 | TS7030: Not all code paths return a value |
| 43:79 | TS2339: Property `role` does not exist on type `User` |
| 48:28 | TS2339: Property `id` does not exist on type `User` |
| 49:30 | TS2339: Property `role` does not exist on type `User` |
| 82:10 | TS7030: Not all code paths return a value |
| 94:47 | TS2339: Property `role` does not exist on type `User` |
| 99:28 | TS2339: Property `id` does not exist on type `User` |
| 100:30 | TS2339: Property `role` does not exist on type `User` |
| 141:10 | TS7030: Not all code paths return a value |
| 154:26 | TS2339: Property `id` does not exist on type `User` |
| 155:28 | TS2339: Property `role` does not exist on type `User` |
| 156:36 | TS2339: Property `departmentId` does not exist on type `User` |
| 157:33 | TS2339: Property `managerId` does not exist on type `User` |
| 166:28 | TS2339: Property `id` does not exist on type `User` |
| 167:30 | TS2339: Property `role` does not exist on type `User` |
| 209:10 | TS7030: Not all code paths return a value |
| 222:26 | TS2339: Property `id` does not exist on type `User` |
| 223:28 | TS2339: Property `role` does not exist on type `User` |
| 224:36 | TS2339: Property `departmentId` does not exist on type `User` |
| 225:33 | TS2339: Property `managerId` does not exist on type `User` |
| 229:48 | TS2339: Property `role` does not exist on type `User` |
| 234:28 | TS2339: Property `id` does not exist on type `User` |
| 235:30 | TS2339: Property `role` does not exist on type `User` |
| 275:28 | TS2339: Property `id` does not exist on type `User` |
| 276:30 | TS2339: Property `role` does not exist on type `User` |

### `src/middleware/security.ts`
| Line | Error |
|------|-------|
| 9:23 | TS2307: Cannot find module `express-rate-limit` or its type declarations |
| 22:44 | TS4111: `CORS_ORIGIN` must be accessed with `['CORS_ORIGIN']` |
| 49:39 | TS4111: `CORS_ORIGIN` must be accessed with `['CORS_ORIGIN']` |
| 75:10 | TS7006: Parameter `req` implicitly has `any` type |
| 193:19 | TS2339: Property `csrfToken` does not exist on `Session & Partial<SessionData>` |
| 211:39 | TS2339: Property `csrfToken` does not exist on `Session & Partial<SessionData>` |
| 277:10 | TS7030: Not all code paths return a value |
| 278:21 | TS4111: `NODE_ENV` must be accessed with `['NODE_ENV']` |
| 295:10 | TS7030: Not all code paths return a value |
| 328:26 | TS2345: `string \| undefined` not assignable to `string` |

### `src/repositories/bankAccountRepository.ts`
| Line | Error |
|------|-------|
| 8:28 | TS2305: Module `../utils/encryption` has no exported member `parseEncryptedData` |
| 8:48 | TS2305: Module `../utils/encryption` has no exported member `serializeEncryptedData` |

### `src/routes/attendance.ts`
| Line | Error |
|------|-------|
| 17:26 | TS7030: Not all code paths return a value |
| 85:27 | TS7030: Not all code paths return a value |
| 137:36 | TS7030: Not all code paths return a value |
| 209:32 | TS7030: Not all code paths return a value |
| 254:43 | TS7030: Not all code paths return a value |
| 326:24 | TS7030: Not all code paths return a value |

### `src/routes/documents.ts`
| Line | Error |
|------|-------|
| 6:10 | TS2305: Module `../middleware/fileUpload` has no exported member `fileUpload` |

### `src/routes/separation.ts`
| Line | Error |
|------|-------|
| 15:75 | TS7030: Not all code paths return a value |
| 23:14 | TS2339: Property `employeeId` does not exist on type `{}` |
| 48:78 | TS7030: Not all code paths return a value |
| 56:14 | TS2339: Property `employeeId` does not exist on type `{}` |
| 64:81 | TS7030: Not all code paths return a value |
| 72:14 | TS2339: Property `employeeId` does not exist on type `{}` |
| 100:16 | TS2339: Property `fnfSettlementId` does not exist on type `{ id: string; }` |
| 109:16 | TS2339: Property `fnfSettlementId` does not exist on type `{ id: string; }` |
| 118:16 | TS2339: Property `fnfSettlementId` does not exist on type `{ id: string; }` |

### `src/utils/encryption.ts`
| Line | Error |
|------|-------|
| 17:27 | TS4111: `ENCRYPTION_KEY` must be accessed with `['ENCRYPTION_KEY']` |

### `src/utils/fastCheckConfig.ts`
| Line | Error |
|------|-------|
| 68:16 | TS2724: No exported member `Property` — did you mean `property`? |
| 84:16 | TS2724: No exported member `Property` — did you mean `property`? |
| 100:16 | TS2724: No exported member `Property` — did you mean `property`? |
| 116:16 | TS2724: No exported member `Property` — did you mean `property`? |
| 133:16 | TS2724: No exported member `Property` — did you mean `property`? |
| 162:3 | TS2322: Type `T \| undefined` not assignable to `T` |
| 192:3 | TS2322: Type `Arbitrary<any[]>` not assignable to `Arbitrary<T>` |
| 271:71 | TS2724: No exported member `Property` — did you mean `property`? |
| 280:71 | TS2724: No exported member `Property` — did you mean `property`? |
| 293:16 | TS2724: No exported member `Property` — did you mean `property`? |

### `src/utils/googleMapsClient.ts`
| Line | Error |
|------|-------|
| 90:51 | TS2345: `unknown` not assignable to `Record<string, unknown> \| undefined` |
| 154:66 | TS2345: `unknown` not assignable to `Record<string, unknown> \| undefined` |
| 178:14 | TS2532: Object is possibly `undefined` |
| 180:52 | TS2345: `unknown` not assignable to `Record<string, unknown> \| undefined` |
| 206:19 | TS18048: `result` is possibly `undefined` |
| 207:20 | TS18048: `result` is possibly `undefined` |
| 209:18 | TS18048: `result` is possibly `undefined` |
| 212:56 | TS2345: `unknown` not assignable to `Record<string, unknown> \| undefined` |
| 274:9 | TS2532: Object is possibly `undefined` |
| 274:44 | TS2532: Object is possibly `undefined` |

### `src/utils/rbac.ts`
| Line | Error |
|------|-------|
| 127:15 | TS2322: `string \| undefined` not assignable to `string` |
| 130:13 | TS2322: `string \| undefined` not assignable to `string` |

---

## Summary

| Category | Count |
|----------|-------|
| ESLint failures (cannot run) | 1 |
| TS possibly-undefined (TS18048 / TS2532) | 18 |
| TS missing property (TS2339) | 29 |
| TS missing export (TS2305) | 3 |
| TS not all paths return (TS7030) | 12 |
| TS index signature access (TS4111) | 7 |
| TS type mismatch (TS2322 / TS2345 / TS2314) | 12 |
| TS other (TS2717, TS2724, TS7006, TS2769) | 17 |
| **Total TypeScript errors** | **~98** |
