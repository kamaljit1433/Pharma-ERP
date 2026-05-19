# Pharma-ERP — Project Overview & Interview Prep

---

## Table of Contents
1. [Project Summary](#project-summary)
2. [Tech Stack & Why We Chose It](#tech-stack--why-we-chose-it)
3. [System Architecture](#system-architecture)
4. [Face Verification System (Deep Dive)](#face-verification-system-deep-dive)
5. [Backend Architecture (Deep Dive)](#backend-architecture-deep-dive)
6. [Key Modules](#key-modules)
7. [Database Design](#database-design)
8. [Authentication & Security](#authentication--security)
9. [Likely Interview Questions & Answers](#likely-interview-questions--answers)

---

## Project Summary

A full-stack **Enterprise HR & Employee Management System** built for pharmaceutical companies. Covers the entire employee lifecycle — onboarding, attendance (with face verification + geo-tracking), leave, payroll, performance reviews, recruitment, training, benefits, and separation/offboarding.

- **Type:** Web app + PWA (Progressive Web App, installable on mobile)
- **Users:** Employees, HR Managers, Department Managers, Finance, IT Admin, Super Admin
- **Scale:** Multi-department, multi-role, multi-branch pharma organization

---

## Tech Stack & Why We Chose It

### Frontend

| Technology | Version | Why We Chose It |
|---|---|---|
| **React** | 19.2 | Industry standard for complex SPAs; component model fits a large modular HR system well |
| **TypeScript** | 5.9 | Catches type bugs at compile time — critical in a payroll/HR app where data correctness matters |
| **Vite** | 6.0 | Much faster dev builds than CRA/Webpack; native ESM HMR |
| **Tailwind CSS** | 3.4 | Utility-first = fast UI iteration; consistent spacing/color system without custom CSS sprawl |
| **shadcn/ui** | latest | Headless, accessible Radix UI components with full customization; no vendor lock-in |
| **Zustand** | 5.0 | Lightweight global state — lighter than Redux for our use case; no boilerplate |
| **React Router DOM** | 7.0 | Client-side routing for SPA with nested routes and protected routes |
| **Axios** | 1.7 | Consistent HTTP client with interceptors for JWT refresh token flow |
| **face-api.js + TensorFlow.js** | 0.22.2 / 4.22 | Client-side ML inference — no face data leaves the browser (privacy first) |
| **Firebase (client)** | 12.13 | Web push notifications via FCM — no custom push infra needed |
| **Recharts** | 2.15 | Declarative charts for dashboards; integrates naturally with React |
| **Zod** | 4.3.6 | Runtime schema validation on form data before API calls |
| **vite-plugin-pwa** | 0.21 | Turns the web app into an installable PWA with offline support |

### Backend

| Technology | Version | Why We Chose It |
|---|---|---|
| **Node.js + Express.js** | 18+ / 5.1 | JavaScript full-stack = one language across frontend and backend; Express is minimal and flexible |
| **TypeScript** | 5.9 | Same reasons as frontend — type safety across 47 services and 47 repositories |
| **PostgreSQL** | 14+ | Relational DB with strong ACID guarantees — critical for payroll, leave balances, and audit logs |
| **Knex.js** | 3.1 | Query builder (not a full ORM) — gives us raw SQL power with JavaScript API; avoids N+1 pitfalls common in ORMs like Sequelize |
| **Redis** | 6+ | Session store + caching — fast in-memory key-value store; used for JWT session management |
| **JWT** | jsonwebtoken 9.0 | Stateless authentication — scales horizontally without sticky sessions |
| **bcrypt** | 6.0 | Industry standard password hashing with salt; slow by design to prevent brute force |
| **speakeasy (TOTP)** | 2.0 | MFA via time-based OTP — adds second factor without external SMS cost |
| **Passport.js** | — | Google OAuth 2.0 strategy — SSO for employees using Google Workspace |
| **AWS S3** | @aws-sdk 3.600 | Scalable, durable file storage for payslips, documents, contracts, profile photos |
| **Firebase Admin SDK** | 12.0 | Server-side push notification sending via FCM |
| **Nodemailer + SendGrid** | 7.0 / 8.1 | Email delivery — Nodemailer for SMTP (dev), SendGrid for production delivery at scale |
| **Multer** | 2.0 | Multipart file upload handling in Express |
| **Helmet.js** | 7.1 | Sets secure HTTP headers (CSP, HSTS, X-Frame-Options) automatically |
| **express-rate-limit** | 8.3 | Protects auth endpoints from brute force / credential stuffing |
| **PDFKit** | 0.18 | Programmatic PDF generation for payslips and HR reports |
| **node-cron** | 4.2 | Scheduled jobs — birthday notifications, Google Forms sync, payroll reminders |
| **Google Maps API** | googleapis 171 | Distance Matrix API for travel allowance calculation |

### Why Knex.js over Sequelize/Prisma?

> **Knex** gives us full SQL control without the "magic" of an ORM. In an HR system with complex payroll calculations, multi-table joins, and financial reports, raw SQL power matters. Sequelize adds abstraction that can hide performance issues. Prisma is great but couples you to its migration system. Knex keeps migrations, queries, and schema separate and explicit.

### Why PostgreSQL over MySQL/MongoDB?

> HR data is **highly relational** — employees link to departments, to salaries, to leaves, to payroll. Payroll especially requires **ACID transactions** (atomicity) to ensure you don't write a partial payroll record. MongoDB (NoSQL) is better for unstructured/flexible documents. PostgreSQL also supports `JSONB` columns (used for salary deductions, waypoints in geo-tracking) giving us flexibility where needed.

---

## System Architecture

```
┌─────────────────────────────────────────┐
│             Frontend (React)             │
│  PWA + Face Verification (TensorFlow.js) │
│      Firebase Client (Push Notif.)       │
└───────────────────┬─────────────────────┘
                    │ HTTPS (Axios)
                    ▼
┌─────────────────────────────────────────┐
│       Express.js REST API (Node.js)      │
│     JWT Auth │ RBAC │ Rate Limit         │
│                                          │
│  ┌──────────┐  ┌──────────┐             │
│  │Controllers│→│ Services │             │
│  └──────────┘  └────┬─────┘             │
│                     │                    │
│               ┌─────┴──────┐            │
│               │Repositories│            │
│               └─────┬──────┘            │
└─────────────────────┼────────────────────┘
                       │
          ┌────────────┼─────────────┐
          ▼            ▼             ▼
    ┌──────────┐  ┌─────────┐  ┌─────────┐
    │PostgreSQL│  │  Redis  │  │ AWS S3  │
    │(Primary  │  │(Session │  │(Files & │
    │  Data)   │  │/Cache)  │  │ Docs)   │
    └──────────┘  └─────────┘  └─────────┘
          
External Services: Firebase FCM, Google Maps, SendGrid, Google OAuth
```

**Layer Responsibilities:**
- **Controller** — Parses HTTP request, validates input, delegates to service, returns HTTP response
- **Service** — Business logic (calculations, workflows, validations)
- **Repository** — Database queries via Knex; single source of truth for DB access

---

## Face Verification System (Deep Dive)

This is the most technically interesting part of the project. It's a **privacy-first, fully client-side** face verification system.

### Problem Statement
Traditional face recognition sends face images to a backend server for matching — this is a privacy and GDPR risk. We solved it by doing **all ML inference in the browser**.

### Models Used

| Model | Library | Purpose |
|---|---|---|
| **BlazeFace** | `@tensorflow-models/blazeface` | Lightweight face detection (is there a face in frame?) |
| **SSD MobileNetV1** | `face-api.js` | Accurate face bounding box detection |
| **FaceLandmark68Net** | `face-api.js` | 68 facial keypoints (eyes, nose, mouth, jawline) |
| **FaceRecognitionNet** | `face-api.js` | 128-dimensional face descriptor vector |

Models are stored locally under `/frontend/public/models/` — loaded from the local server, not a CDN. This avoids external network dependency.

### End-to-End Flow

```
Employee opens "Mark Attendance" page
        │
        ▼
Request camera access (navigator.mediaDevices.getUserMedia)
        │
        ▼
Load TensorFlow.js models (BlazeFace + face-api.js)
        │
        ▼
┌─── STEP 1: Liveness Check ──────────────────────────┐
│  BlazeFace scans video frames every 100ms           │
│  Must detect face in 70% of frames over 3 seconds  │
│  → Prevents photo spoofing attacks                 │
└─────────────────────────────────────────────────────┘
        │
        ▼
┌─── STEP 2: Face Recognition ────────────────────────┐
│  face-api.js pipeline:                              │
│  1. SSD MobileNetV1 → detect face bounding box     │
│  2. FaceLandmark68Net → 68 facial keypoints        │
│  3. FaceRecognitionNet → 128-d descriptor vector   │
│                                                    │
│  Stored descriptor (from employee profile photo)   │
│  loaded from backend (encrypted)                   │
│                                                    │
│  Euclidean distance comparison:                    │
│  distance = √(Σ(descriptor_A - descriptor_B)²)    │
│  Threshold: 0.45 (lower = stricter match)         │
│  If distance < 0.45 → MATCH ✓                    │
└─────────────────────────────────────────────────────┘
        │
        ▼
Send to Backend: { match: boolean, confidence: number }
(No face image, no descriptor, no biometric data sent)
        │
        ▼
Backend stores:
  attendance.face_detected = true/false
  face_detection_logs: { detected, confidence, detected_at }
```

### Key Points for Interview

1. **128-dimensional descriptor** — Each face is represented as a point in 128-dimensional space. Similar faces → similar vectors → small Euclidean distance.

2. **Why 0.45 threshold?** — It's a balance between FAR (False Acceptance Rate) and FRR (False Rejection Rate). Too strict (0.3) = legitimate employees fail. Too lenient (0.6) = impostors accepted.

3. **Liveness Detection** — We use temporal consistency: detecting a face in 70% of frames over 3 seconds. A static photo held up to the camera doesn't move naturally between frames — reducing spoof risk. (Not perfect liveness, but practical for a corporate setting.)

4. **Privacy by Design** — Face images never hit the network. Raw descriptors are never stored. Only `face_detected: boolean` goes to the database. This aligns with GDPR Article 9 (biometric data as special category).

5. **Performance** — BlazeFace is designed to run at 30fps on mobile. SSD MobileNetV1 is heavier — used only once for the final recognition step, not continuously.

### Device ID (Audit Trail)
Since we don't store who physically attended on camera, we generate a **browser fingerprint** (device ID) as an audit trail — which device was used to mark attendance. This is stored in `face_detection_logs` for forensic review.

---

## Backend Architecture (Deep Dive)

### Layered Architecture
```
backend/src/
├── controllers/     # HTTP layer — parse request, call service, return response
├── services/        # Business logic — calculations, workflows, validations (47 services)
├── repositories/    # Data access — all Knex queries here (47 repos)
├── middleware/      # Express middleware — auth, RBAC, file upload, error handling
├── routes/          # Route definitions — maps URL + HTTP method to controller
├── config/          # DB, Redis, Firebase, Passport configuration
├── types/           # TypeScript interfaces and enums
├── utils/           # Pure helper functions
└── database/
    ├── migrations/  # Schema version control (35+ migrations)
    └── seeds/       # Initial/test data
```

### Request Lifecycle
```
HTTP Request
    │
    ▼
Router (routes/xxx.ts)
    │
    ├── Middleware Stack (in order):
    │     1. Morgan logging
    │     2. Helmet (security headers)
    │     3. CORS check
    │     4. Rate limiter (auth routes: 10 req/15min)
    │     5. authenticateToken() → validates JWT
    │     6. authorize(role) → RBAC check
    │     7. Multer (if file upload route)
    │
    ▼
Controller (controllers/xxxController.ts)
    │  validates input (Zod), calls service
    ▼
Service (services/xxxService.ts)
    │  business logic, calls repository
    ▼
Repository (repositories/xxxRepository.ts)
    │  executes Knex query
    ▼
PostgreSQL
    │
    ▼
Response flows back up the chain
```

### Middleware Details

**`auth.ts` — JWT Authentication**
```typescript
// Extracts Bearer token from Authorization header
// Verifies signature using JWT_SECRET
// Attaches decoded payload to req.user
// Returns 401 if invalid/expired
```

**`rbac.ts` — Role-Based Access Control**

6 roles with hierarchical permissions:
- `super_admin` — full access
- `hr_manager` — all HR operations
- `department_manager` — own department data
- `finance` — payroll and financial data
- `it_admin` — system config
- `employee` — own data only

**`fileUpload.ts` — Multer Configuration**
- Max size: 10MB per file
- Allowed MIME types: image/*, application/pdf, Office docs, video
- Categories: `profile-photo`, `document`, `payslip`, `contract`, `training-material`

**`errorHandler.ts` — Centralized Error Handling**
- All errors bubble up to a single Express error middleware
- Returns consistent JSON: `{ success: false, error: string, statusCode: number }`

### Session Management
- **Redis** stores session data (not the database)
- `express-session` + `connect-redis` adapter
- Session timeout: 24 hours (`SESSION_MAX_AGE=86400000ms`)
- Each session = Redis key like `sess:abcd1234`

---

## Key Modules

### 1. Attendance & Geo-Tracking
- Employee marks attendance via browser → face verification runs → GPS captured
- `geoTrackingService.ts` — Haversine formula for distance, anomaly detection (speed > 300km/h = impossible)
- Travel allowance = total_km × rate_per_km (configured in `.env`)
- Geo-fencing: `validateGeoFence()` — checks if employee is within radius of office

### 2. Payroll Processing
```
Salary Structure (configured per employee)
    │
    ▼
Monthly Payroll Run (POST /api/v1/payroll/process)
    │
    ├── payrollCalculationService → gross salary = base + HRA + DA + allowances
    ├── Deductions: PF(12%) + ESI(0.75%) + professional tax + TDS
    ├── Net Salary = Gross - Total Deductions
    │
    ▼
Payslip generated (PDFKit) → stored on S3 or local
    │
    ▼
Status: draft → processed → paid → locked
```

### 3. Push Notifications (Firebase FCM)
```
Backend Event (e.g., leave approved)
    │
    ▼
notificationService.sendNotification()
    │
    ├── Looks up employee's FCM device token (from device_tokens table)
    ├── Firebase Admin SDK sends push to FCM server
    │
    ▼
FCM → Browser/Mobile Service Worker → Notification shown
```
Also supports: IN_APP (DB record), EMAIL (via SendGrid/SMTP)

### 4. Full & Final Settlement (Separation)
Most complex module — `separationService.ts` is 68KB:
- Last salary (prorated for partial month)
- Leave encashment (unused PTO at daily rate)
- Gratuity calculation (if eligible)
- Variable pay / bonuses
- Minus: advance salary, loans, TDS
- Final payable amount

### 5. Recruitment Pipeline
- Job postings → applicants → interviews → offer letter → onboarding
- Google Forms integration: Form responses auto-sync to applicants table via cron job

---

## Database Design

### Why PostgreSQL?
HR data is deeply relational. Payroll requires ACID transactions. PostgreSQL also supports `JSONB` for flexible fields (salary deductions, geo waypoints, earnings breakdown) without schema rigidity.

### Key Tables & Relationships

```
employees (master table)
├── → departments (many-to-one)
├── → designations (many-to-one)
├── → employees.id as reporting_manager_id (self-referential)
├── → attendance (one-to-many)
│       └── → face_detection_logs (one-to-many)
├── → leaves (one-to-many)
│       → leave_balances (one-to-many)
├── → salary_structures (one-to-many, one active at a time)
├── → payroll (one-to-many per month/year)
│       └── → payslips (one-to-one)
├── → geo_logs (one-to-many)
│       → journeys (one-to-many)
├── → performance_reviews (one-to-many)
├── → resignations (one-to-one active)
└── → device_tokens (one-to-many, for FCM)
```

### JSONB Columns
Used for flexible structured data:
- `salary_structures.deductions` — custom deduction items
- `payslips.earnings` / `payslips.deductions` — breakdown snapshot
- `journeys.waypoints` — GPS path as array of coordinate objects
- `journeys.anomalies` — detected anomalies with severity

### Migration Strategy
35+ Knex migrations — each migration file is numbered and version-controlled. Never modify an old migration; always create a new one for changes. Run with `npm run migrate:latest`.

---

## Authentication & Security

### Auth Flow
```
1. POST /api/v1/auth/login { email, password }
        │
        ▼
2. bcrypt.compare(password, hashedPassword)
        │
        ▼
3. If MFA enabled → return { requiresMFA: true, tempToken }
   Else → return { accessToken (15m), refreshToken (7d) }
        │
        ▼ (if MFA)
4. POST /api/v1/auth/verify-mfa { otp }
   speakeasy.totp.verify(secret, otp)
        │
        ▼
5. Return { accessToken, refreshToken }
        │
        ▼
6. Client stores tokens; attaches accessToken as
   Authorization: Bearer <token> on every request
        │
        ▼
7. When accessToken expires → POST /api/v1/auth/refresh
   { refreshToken } → new accessToken
```

### Security Measures
| Measure | Implementation |
|---|---|
| Password hashing | bcrypt with salt rounds |
| Transport security | HTTPS (TLS in production) |
| HTTP headers | Helmet.js (CSP, HSTS, X-Frame-Options) |
| Brute force protection | express-rate-limit (10 req/15min on auth) |
| CORS | Whitelist of allowed origins |
| SQL injection | Knex parameterized queries (no raw string concatenation) |
| XSS | React escapes by default; sanitization on input |
| RBAC | Role check middleware on every protected route |
| File upload | MIME type whitelist + size limits |
| Audit logging | Every create/update/delete/approve action logged |

---

## Likely Interview Questions & Answers

### Tech Stack

**Q: Why did you choose React over Angular or Vue?**
> React has the largest ecosystem and is most widely adopted for complex enterprise apps. The component model fits our modular HR system (each HR module = a feature area with its own components). Angular adds overhead we didn't need. Vue is great but smaller enterprise ecosystem.

**Q: Why Express.js and not NestJS for a large project like this?**
> NestJS would have been a valid choice — its opinionated structure suits large teams. We chose Express because it's minimal and flexible, letting us define our own architecture (controller-service-repository). NestJS's decorator magic can make debugging harder. Our TypeScript + explicit layering gives us similar structure without the framework overhead.

**Q: Why Knex.js and not Prisma or Sequelize?**
> Knex gives raw SQL control with a JavaScript API — important for complex payroll queries, multi-table joins, and reports. Prisma is excellent but its type-safe query layer adds abstraction that can hide performance issues. Sequelize has N+1 query problems with eager loading. Knex keeps us close to the SQL without abandoning type safety.

**Q: Why Redis for sessions? Why not store sessions in PostgreSQL?**
> Redis is an in-memory store — session lookups are O(1) and in microseconds. PostgreSQL would add disk I/O on every authenticated request (every single API call checks the session). Redis is also purpose-built for this: key expiry, atomic operations, and pub/sub if we add real-time features.

---

### Face Verification

**Q: How does the face recognition work technically?**
> We use face-api.js (built on TensorFlow.js) running entirely in the browser. When an employee enrolls, we extract a 128-dimensional descriptor vector from their profile photo. At attendance time, we extract a descriptor from the live camera feed and compute the Euclidean distance between the two vectors. If distance < 0.45, it's a match. The model used for descriptor extraction is FaceRecognitionNet, which was trained on the VGGFace2 dataset.

**Q: What is a face descriptor?**
> It's a 128-dimensional vector — think of it as 128 numbers that mathematically represent the unique characteristics of a face. Similar faces produce vectors that are close together in 128-dimensional space. Two vectors from the same person should have Euclidean distance < 0.45; strangers typically have distance > 0.6.

**Q: How do you prevent someone from holding up a photo to the camera?**
> We implement a basic liveness check: BlazeFace scans frames at ~10fps and we require 70% detection consistency over a 3-second window. A static photo doesn't move, so natural micro-movements of a real face help distinguish. It's not enterprise-grade liveness (which would use depth sensors), but it's practical for a corporate attendance system.

**Q: Does the face data go to the server?**
> No — this is the key design decision. All ML inference runs in the browser via TensorFlow.js. Only a `{ match: boolean, confidence: number }` result is sent to the backend. No face image, no descriptor, no biometric data leaves the client. This is GDPR-compliant because we don't store or transmit biometric data.

**Q: Why run face recognition on the client instead of the server?**
> Privacy, performance, and cost. Privacy: biometric data never leaves the device. Performance: no image upload round-trip — inference is local. Cost: server-side GPU inference is expensive. The tradeoff is that client hardware varies — slower devices take longer to load the TF models. We mitigate this by loading models once and caching them.

**Q: What are the models stored in `/public/models/`?**
> Four model files loaded by face-api.js:
> - `ssd_mobilenetv1` — detects face bounding boxes (Single Shot Detector with MobileNetV1 backbone)
> - `face_landmark_68` — detects 68 facial keypoints
> - `face_recognition_net` — extracts 128-d descriptor
> - And BlazeFace weights for the liveness check
> They're served statically from our Vite dev server or CDN in production.

**Q: What is SSD MobileNetV1?**
> SSD stands for Single Shot Detector — a real-time object detection architecture that predicts bounding boxes in a single forward pass (unlike two-stage detectors like R-CNN). MobileNetV1 is the backbone — a lightweight CNN designed for mobile/edge inference using depthwise separable convolutions to reduce compute cost. We use it for face localization before running the recognition network.

---

### Backend Architecture

**Q: Explain your backend architecture pattern.**
> We follow a three-layer architecture: Controller → Service → Repository. Controllers handle HTTP concerns (parsing requests, sending responses). Services contain all business logic (payroll calculations, leave validations, approval workflows). Repositories abstract all database access via Knex — no SQL runs in services or controllers. This separation makes testing each layer in isolation straightforward.

**Q: How does your RBAC (Role-Based Access Control) work?**
> We have 6 roles: super_admin, hr_manager, department_manager, finance, it_admin, employee. Each route has an `authorize(role)` middleware that checks `req.user.role` against the allowed roles for that endpoint. The role is embedded in the JWT payload at login and verified on every request. Department managers can only access their own department's data — enforced at the service layer by comparing `req.user.departmentId` against the requested resource.

**Q: How does the JWT refresh token flow work?**
> Access tokens expire in 15 minutes. Refresh tokens last 7 days. When an API call returns 401, the frontend's Axios interceptor automatically calls `POST /auth/refresh` with the refresh token. The backend validates it, issues a new access token, and the original request is retried. If the refresh token is also expired, the user is logged out. Refresh tokens are stored in HttpOnly cookies (not localStorage) to prevent XSS theft.

**Q: Why 15 minutes for access token expiry?**
> Short-lived access tokens minimize the window of exposure if a token is stolen. An attacker who intercepts an access token can only use it for 15 minutes. The refresh token lives longer but is stored more securely (HttpOnly cookie, sent only to the auth endpoint).

**Q: How does MFA work in your system?**
> We use TOTP (Time-based One-Time Password) via the `speakeasy` library — same algorithm as Google Authenticator. When MFA is enabled, the backend generates a secret key per user, encodes it as a QR code, and the employee scans it with their authenticator app. At login, after password verification, we check `requiresMFA` and prompt for the 6-digit OTP. `speakeasy.totp.verify()` checks the OTP against the current 30-second time window (±1 window for clock drift).

**Q: How do you handle file uploads?**
> We use Multer middleware. Files are validated by MIME type and size (max 10MB). In development they're stored on disk in `/backend/uploads/`. In production they go to AWS S3 — Multer streams directly to S3 via the `multer-s3` adapter. Download URLs are pre-signed S3 URLs that expire in 1 hour for security. File access control middleware checks if the requesting user has permission to access a specific file before generating the URL.

**Q: How does the payroll calculation work?**
> Gross Salary = Base + HRA + Dearness Allowance + Other Allowances. Deductions = PF (12% of basic) + ESI (0.75% of gross, capped at salary limit) + Professional Tax (state-specific slab) + TDS (income tax advance). Net Salary = Gross - Deductions. Monthly payroll is a batch operation — we process all employees in a month, generate payslip PDFs via PDFKit, and transition status from draft → processed → paid → locked (locked payroll cannot be modified).

---

### Database

**Q: How do you prevent duplicate payroll processing?**
> The `payroll` table has a unique constraint on `(employee_id, month, year)`. If you try to process payroll twice for the same employee in the same month, PostgreSQL throws a unique violation error. The service layer catches this and returns an appropriate error. The payroll status `locked` also prevents modification after payment.

**Q: How does the geo-tracking anomaly detection work?**
> We use the Haversine formula to calculate distance between consecutive GPS waypoints. Then we derive speed = distance / time. If speed exceeds 300 km/h between two consecutive points, it's flagged as HIGH severity (physically impossible movement — likely GPS spoofing or error). Distance jump > 50 km in < 1 minute = HIGH. Unusual distance > 100 km in < 1 hour = MEDIUM. Anomalies are stored as a JSONB array in the `journeys` table.

**Q: Why use JSONB for some columns in PostgreSQL?**
> Some data is structured but variable — for example, a salary's deduction breakdown can have custom items per employee. Storing this in a separate table adds joins. JSONB lets us store structured data flexibly while still being queryable with PostgreSQL's JSON operators. We use it for: salary deductions, payslip earnings/deductions breakdown (snapshot at time of processing), geo journey waypoints, and detected anomalies.

**Q: How do you handle database migrations?**
> We use Knex's built-in migration system. Each migration is a numbered TypeScript file with `up()` and `down()` functions. `up()` applies the change; `down()` reverts it. Migrations run via `npm run migrate:latest`. The `knex_migrations` table tracks which migrations have been applied. We never modify old migration files — always create a new migration for changes.

---

### Push Notifications

**Q: How does the push notification system work?**
> When an event occurs (e.g., leave approved), `notificationService.sendNotification()` is called. It looks up the employee's FCM device token from the `device_tokens` table. The Firebase Admin SDK sends the notification payload to FCM servers, which deliver it to the employee's browser or mobile device. On the client, the Firebase service worker intercepts the push and shows the OS-level notification. We also store an in-app notification record in the `notifications` table for the notification bell in the UI.

**Q: How does a device register for push notifications?**
> The frontend requests notification permission from the browser. If granted, Firebase generates a unique FCM registration token for that browser/device. The client sends this token to `POST /api/v1/notifications/device-token`. The backend stores it in `device_tokens` table linked to the user. When sending a notification, we look up all device tokens for that user and send to each.

---

### Design Decisions

**Q: Why build this as a PWA?**
> Field employees in pharma often work in varying network conditions (hospital visits, field sales). A PWA can be installed on mobile like a native app, works offline for attendance marking, and receives push notifications — all without needing an App Store submission. The `vite-plugin-pwa` generates the service worker automatically.

**Q: How do you handle the Google Forms integration?**
> HR sometimes collects employee data via Google Forms (surveys, training feedback). We use the Google Forms API (via `googleapis`) to pull responses. A cron job (`node-cron`) runs periodically to sync new responses into our database. The OAuth refresh token is stored in `.env` to re-authenticate without user interaction.

**Q: What's the most complex part of the system?**
> The separation module (`separationService.ts` at 68KB). Full & Final settlement involves: prorating the last month's salary, calculating leave encashment at daily rate, gratuity eligibility (5+ years of service), variable pay, bonuses — minus advance salary, loans, TDS. Getting the numbers right is critical because it directly affects an outgoing employee's finances. There's no room for rounding errors.

---

### Security Questions

**Q: How do you prevent SQL injection?**
> Knex uses parameterized queries by default — user input is never concatenated into SQL strings. For example, `knex('employees').where('id', userId)` generates `SELECT * FROM employees WHERE id = $1` with `userId` as a bound parameter. PostgreSQL handles the escaping. We never use `knex.raw()` with unsanitized user input.

**Q: How is sensitive data protected at rest?**
> Passwords are hashed with bcrypt (irreversible). Employee financial data (PAN, Aadhaar) is stored encrypted. Files on S3 use server-side encryption (SSE-S3). JWT secrets and API keys are in environment variables, never in code. Face descriptors are never stored.

**Q: What happens if the Redis session store goes down?**
> Sessions would become inaccessible — users would be logged out. To mitigate: Redis should be set up with persistence (AOF or RDB snapshot) and a replica. In a production environment, AWS ElastiCache with Multi-AZ failover would be appropriate. We'd also consider a fallback to JWT-only auth (stateless) for resilience.

---

*Document prepared for PPT presentation review — backend architecture and face verification focus.*
