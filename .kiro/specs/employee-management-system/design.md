# Employee Management System — Design Document

> Feature: employee-management-system
> Version: 1.0
> Date: 2026-03-05

---

## Table of Contents

1. [Overview](#overview)
2. [UI/UX Design & Theme](#uiux-design--theme)
3. [Architecture](#architecture)
4. [Components and Interfaces](#components-and-interfaces)
5. [Data Models](#data-models)
6. [Correctness Properties](#correctness-properties)
7. [Error Handling](#error-handling)
8. [Testing Strategy](#testing-strategy)

---

## Overview

The Employee Management System (EMS) is a comprehensive Progressive Web Application (PWA) designed to manage the complete employee lifecycle from recruitment through offboarding. The system encompasses nine core modules and eleven extended features, providing end-to-end HR automation.

### System Goals

- Automate repetitive HR processes and reduce manual data entry
- Ensure accurate payroll calculation based on real-time attendance data
- Provide employees with self-service capabilities for common HR tasks
- Enable management with real-time visibility into workforce operations
- Maintain compliance with statutory requirements (PF, ESI, TDS, data privacy)

### Key Features

**Core Modules:**
- Employee Information Management
- Recruitment & Onboarding
- Attendance & Time Management
- Leave Management
- Payroll Management
- Benefits & Compensation
- Separation & Offboarding
- Performance Management (OKR/KPI)
- Training & Certification Tracking

**Extended Features:**
- Face presence detection for attendance verification
- GPS-based geo tracking and travel allowance calculation
- Company hierarchy visualization and management
- Supplier & buyer relationship tracking
- Attendance-based salary calculation
- Bank details management with encryption
- Flexible salary calculation engine (monthly/daily/hourly)
- Document management with self-upload capabilities
- e-Signature workflow for contracts and policies
- Automated birthday and work anniversary wishes

### Technology Stack

- **Frontend:** React.js + TypeScript + Vite PWA Plugin
- **UI Components:** shadcn/ui (Radix UI primitives)
- **Icons:** Lucide React
- **Styling:** Tailwind CSS
- **Backend:** Node.js + Express.js
- **Database:** PostgreSQL (primary), Redis (caching/sessions)
- **File Storage:** AWS S3 or Google Cloud Storage
- **Face Detection:** TensorFlow.js (BlazeFace) — client-side processing
- **Geo/Maps:** Google Maps Platform (Distance Matrix + Maps JS API)
- **Authentication:** JWT + OAuth 2.0 + MFA (TOTP)
- **Notifications:** Firebase Cloud Messaging (FCM)
- **Email:** SendGrid or AWS SES

---

## UI/UX Design & Theme

### Design Philosophy

The Employee Management System follows a clean, professional, and minimalist design approach with a monochromatic base theme enhanced by semantic accent colors for status indicators and interactive elements.

### Color Palette

**Base Colors (Monochromatic):**
```css
/* Primary Palette - Black & White */
--background: 0 0% 100%           /* Pure White - #FFFFFF */
--foreground: 0 0% 3.9%           /* Near Black - #0A0A0A */

/* Neutral Grays */
--card: 0 0% 100%                 /* White - #FFFFFF */
--card-foreground: 0 0% 3.9%      /* Near Black - #0A0A0A */
--popover: 0 0% 100%              /* White - #FFFFFF */
--popover-foreground: 0 0% 3.9%   /* Near Black - #0A0A0A */

/* Muted Elements */
--muted: 0 0% 96.1%               /* Light Gray - #F5F5F5 */
--muted-foreground: 0 0% 45.1%    /* Medium Gray - #737373 */

/* Borders & Inputs */
--border: 0 0% 89.8%              /* Border Gray - #E5E5E5 */
--input: 0 0% 89.8%               /* Input Border - #E5E5E5 */
--ring: 0 0% 3.9%                 /* Focus Ring - #0A0A0A */

/* Primary Action (Black) */
--primary: 0 0% 9%                /* Primary Black - #171717 */
--primary-foreground: 0 0% 98%    /* White Text - #FAFAFA */

/* Secondary Action (Gray) */
--secondary: 0 0% 96.1%           /* Light Gray - #F5F5F5 */
--secondary-foreground: 0 0% 9%   /* Black Text - #171717 */

/* Accent (Subtle Gray) */
--accent: 0 0% 96.1%              /* Light Gray - #F5F5F5 */
--accent-foreground: 0 0% 9%      /* Black Text - #171717 */
```

**Semantic Accent Colors (Status Indicators):**
```css
/* Success - Green */
--success: 142 76% 36%            /* Green - #16A34A */
--success-foreground: 0 0% 98%    /* White Text - #FAFAFA */

/* Warning - Amber */
--warning: 38 92% 50%             /* Amber - #F59E0B */
--warning-foreground: 0 0% 9%     /* Black Text - #171717 */

/* Error/Destructive - Red */
--destructive: 0 84% 60%          /* Red - #EF4444 */
--destructive-foreground: 0 0% 98% /* White Text - #FAFAFA */

/* Info - Blue */
--info: 221 83% 53%               /* Blue - #3B82F6 */
--info-foreground: 0 0% 98%       /* White Text - #FAFAFA */

/* Pending - Orange */
--pending: 25 95% 53%             /* Orange - #FB923C */
--pending-foreground: 0 0% 9%     /* Black Text - #171717 */

/* Approved - Emerald */
--approved: 160 84% 39%           /* Emerald - #10B981 */
--approved-foreground: 0 0% 98%   /* White Text - #FAFAFA */

/* Rejected - Rose */
--rejected: 0 72% 51%             /* Rose - #E11D48 */
--rejected-foreground: 0 0% 98%   /* White Text - #FAFAFA */
```

### Status Color Mapping

**Attendance Status:**
- Present: `--success` (Green)
- Absent: `--rejected` (Rose)
- Half-Day: `--warning` (Amber)
- On Leave: `--info` (Blue)
- Holiday: `--muted` (Gray)

**Leave Status:**
- Pending: `--pending` (Orange)
- Approved: `--approved` (Emerald)
- Rejected: `--rejected` (Rose)
- Cancelled: `--muted-foreground` (Gray)

**Employee Status:**
- Active: `--success` (Green)
- On Leave: `--info` (Blue)
- Suspended: `--warning` (Amber)
- Resigned: `--muted-foreground` (Gray)
- Terminated: `--destructive` (Red)

**Payroll Status:**
- Draft: `--muted-foreground` (Gray)
- Processed: `--info` (Blue)
- Paid: `--success` (Green)
- Locked: `--foreground` (Black)

**Applicant Pipeline:**
- Applied: `--info` (Blue)
- Screening: `--pending` (Orange)
- Interview: `--warning` (Amber)
- Offer: `--approved` (Emerald)
- Hired: `--success` (Green)
- Rejected: `--rejected` (Rose)

### Typography

**Font Family:**
- Primary: `Inter` (sans-serif) - Clean, modern, highly readable
- Monospace: `JetBrains Mono` - For employee IDs, codes, and data tables

**Font Sizes:**
```css
--text-xs: 0.75rem      /* 12px - Captions, labels */
--text-sm: 0.875rem     /* 14px - Body small, secondary text */
--text-base: 1rem       /* 16px - Body text */
--text-lg: 1.125rem     /* 18px - Subheadings */
--text-xl: 1.25rem      /* 20px - Card titles */
--text-2xl: 1.5rem      /* 24px - Section headings */
--text-3xl: 1.875rem    /* 30px - Page titles */
--text-4xl: 2.25rem     /* 36px - Hero text */
```

**Font Weights:**
- Regular: 400 (body text)
- Medium: 500 (labels, buttons)
- Semibold: 600 (headings, emphasis)
- Bold: 700 (page titles, important data)

### Spacing & Layout

**Container Widths:**
- Mobile: 100% (with 16px padding)
- Tablet: 768px
- Desktop: 1280px
- Wide: 1536px

**Spacing Scale (Tailwind):**
- xs: 4px (spacing-1)
- sm: 8px (spacing-2)
- md: 16px (spacing-4)
- lg: 24px (spacing-6)
- xl: 32px (spacing-8)
- 2xl: 48px (spacing-12)

**Border Radius:**
- sm: 4px (small elements, badges)
- md: 6px (buttons, inputs)
- lg: 8px (cards, modals)
- xl: 12px (large containers)
- full: 9999px (avatars, pills)

### shadcn/ui Components

**Core Components Used:**

1. **Navigation & Layout:**
   - `Sidebar` - Main navigation with collapsible menu
   - `NavigationMenu` - Top navigation bar
   - `Breadcrumb` - Page hierarchy navigation
   - `Separator` - Visual dividers

2. **Data Display:**
   - `Table` - Employee lists, attendance records, payroll data
   - `Card` - Dashboard widgets, summary cards
   - `Badge` - Status indicators, tags
   - `Avatar` - Employee profile pictures
   - `Tabs` - Module switching, multi-view interfaces
   - `Accordion` - Collapsible sections

3. **Forms & Inputs:**
   - `Form` - Form wrapper with validation
   - `Input` - Text inputs
   - `Textarea` - Multi-line text
   - `Select` - Dropdown selections
   - `Checkbox` - Multi-select options
   - `RadioGroup` - Single-select options
   - `Switch` - Toggle switches
   - `DatePicker` - Date selection (with react-day-picker)
   - `Calendar` - Date range selection
   - `Combobox` - Searchable select

4. **Feedback & Overlays:**
   - `Dialog` - Modals for forms and confirmations
   - `AlertDialog` - Confirmation dialogs
   - `Sheet` - Slide-out panels
   - `Popover` - Contextual information
   - `Tooltip` - Hover hints
   - `Toast` - Notifications
   - `Alert` - Inline messages
   - `Progress` - Loading indicators
   - `Skeleton` - Loading placeholders

5. **Actions:**
   - `Button` - Primary, secondary, ghost, outline variants
   - `DropdownMenu` - Action menus
   - `ContextMenu` - Right-click menus
   - `Command` - Command palette (Cmd+K)

### Lucide Icons Mapping

**Module Icons:**
- Employee: `Users`, `UserCircle`, `UserPlus`, `UserMinus`
- Attendance: `Clock`, `CalendarCheck`, `MapPin`, `Camera`
- Leave: `CalendarDays`, `CalendarX`, `Plane`, `Umbrella`
- Payroll: `Wallet`, `DollarSign`, `Receipt`, `CreditCard`
- Recruitment: `Briefcase`, `FileText`, `UserCheck`, `Award`
- Benefits: `Heart`, `Shield`, `Gift`, `TrendingUp`
- Performance: `Target`, `TrendingUp`, `BarChart3`, `Star`
- Training: `GraduationCap`, `BookOpen`, `Certificate`, `Lightbulb`
- Separation: `LogOut`, `FileCheck`, `Package`, `XCircle`

**Action Icons:**
- Add: `Plus`, `PlusCircle`
- Edit: `Pencil`, `Edit`
- Delete: `Trash2`, `X`
- Save: `Save`, `Check`
- Cancel: `X`, `XCircle`
- Search: `Search`
- Filter: `Filter`, `SlidersHorizontal`
- Download: `Download`, `FileDown`
- Upload: `Upload`, `FileUp`
- Print: `Printer`
- Export: `FileOutput`
- Import: `FileInput`
- Refresh: `RefreshCw`
- Settings: `Settings`, `Cog`

**Status Icons:**
- Success: `CheckCircle2`, `Check`
- Warning: `AlertTriangle`, `AlertCircle`
- Error: `XCircle`, `AlertOctagon`
- Info: `Info`, `HelpCircle`
- Pending: `Clock`, `Loader2`

**Navigation Icons:**
- Home: `Home`
- Dashboard: `LayoutDashboard`
- Menu: `Menu`, `MoreVertical`, `MoreHorizontal`
- Back: `ArrowLeft`, `ChevronLeft`
- Forward: `ArrowRight`, `ChevronRight`
- Expand: `ChevronDown`, `ChevronsDown`
- Collapse: `ChevronUp`, `ChevronsUp`

### Component Styling Guidelines

**Buttons:**
```tsx
// Primary Action (Black background)
<Button variant="default">Submit</Button>

// Secondary Action (Gray background)
<Button variant="secondary">Cancel</Button>

// Outline (Border only)
<Button variant="outline">View Details</Button>

// Ghost (No background)
<Button variant="ghost">Skip</Button>

// Destructive (Red for delete/remove)
<Button variant="destructive">Delete</Button>
```

**Status Badges:**
```tsx
// Success (Green)
<Badge className="bg-success text-success-foreground">Active</Badge>

// Warning (Amber)
<Badge className="bg-warning text-warning-foreground">Pending</Badge>

// Error (Red)
<Badge className="bg-destructive text-destructive-foreground">Rejected</Badge>

// Info (Blue)
<Badge className="bg-info text-info-foreground">On Leave</Badge>

// Neutral (Gray)
<Badge variant="secondary">Draft</Badge>
```

**Cards:**
```tsx
<Card className="border-border">
  <CardHeader>
    <CardTitle className="text-foreground">Employee Details</CardTitle>
    <CardDescription className="text-muted-foreground">
      View and manage employee information
    </CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
  <CardFooter className="border-t border-border">
    {/* Actions */}
  </CardFooter>
</Card>
```

**Data Tables:**
```tsx
<Table>
  <TableHeader className="bg-muted">
    <TableRow>
      <TableHead className="text-muted-foreground">Employee ID</TableHead>
      <TableHead className="text-muted-foreground">Name</TableHead>
      <TableHead className="text-muted-foreground">Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow className="hover:bg-muted/50">
      <TableCell className="font-mono">EMP001</TableCell>
      <TableCell>John Doe</TableCell>
      <TableCell>
        <Badge className="bg-success">Active</Badge>
      </TableCell>
    </TableRow>
  </TableBody>
</Table>
```

### Responsive Design

**Breakpoints:**
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: 1024px - 1280px
- Wide: > 1280px

**Mobile-First Approach:**
- Stack layouts vertically on mobile
- Collapsible sidebar navigation
- Bottom navigation bar for primary actions
- Touch-friendly button sizes (min 44x44px)
- Simplified tables with card view on mobile

### Accessibility

**WCAG 2.1 AA Compliance:**
- Minimum contrast ratio 4.5:1 for normal text
- Minimum contrast ratio 3:1 for large text (18px+)
- Focus indicators visible on all interactive elements
- Keyboard navigation support for all features
- ARIA labels for icon-only buttons
- Screen reader friendly status announcements

**Focus States:**
```css
/* Focus ring using primary color */
.focus-visible:focus {
  outline: 2px solid var(--ring);
  outline-offset: 2px;
}
```

### Dark Mode Support (Future Enhancement)

While the initial implementation uses a light monochromatic theme, the design system is prepared for dark mode:

```css
/* Dark Mode Variables */
.dark {
  --background: 0 0% 3.9%           /* Near Black */
  --foreground: 0 0% 98%            /* Off White */
  --muted: 0 0% 14.9%               /* Dark Gray */
  --muted-foreground: 0 0% 63.9%    /* Light Gray */
  --border: 0 0% 14.9%              /* Dark Border */
  /* Status colors remain the same for consistency */
}
```

---

## Architecture

### System Architecture

The EMS follows a three-tier architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                     Presentation Layer                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Web App    │  │   PWA App    │  │  Admin Panel │      │
│  │  (React.js)  │  │  (React.js)  │  │  (React.js)  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS/REST API
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     Application Layer                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              API Gateway (Express.js)                │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │ Employee │ │Attendance│ │  Payroll │ │ Training │      │
│  │ Service  │ │ Service  │ │ Service  │ │ Service  │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │  Leave   │ │  Recruit │ │ Benefits │ │Performance│     │
│  │ Service  │ │ Service  │ │ Service  │ │ Service  │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                       Data Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  PostgreSQL  │  │    Redis     │  │   AWS S3     │      │
│  │  (Primary)   │  │   (Cache)    │  │ (File Store) │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘

```

### Architectural Patterns

**1. Service-Oriented Architecture (SOA)**
- Each major module (Employee, Attendance, Payroll, etc.) is implemented as an independent service
- Services communicate through well-defined interfaces
- Enables independent scaling and maintenance

**2. Repository Pattern**
- Data access logic is abstracted into repository classes
- Business logic remains independent of database implementation
- Facilitates testing with mock repositories

**3. Event-Driven Architecture**
- Key system events (employee hired, leave approved, payroll processed) trigger event handlers
- Enables loose coupling between modules
- Supports asynchronous processing for notifications and background tasks

**4. Role-Based Access Control (RBAC)**
- All API endpoints enforce role-based permissions
- Roles: Super Admin, HR Manager, Department Manager, Finance/Payroll, Employee, IT Admin
- Permissions are checked at both API gateway and service layers

### Data Flow Examples

**Attendance Marking Flow:**
```
Employee → PWA → Face Detection (Client-side) → GPS Capture → 
API Gateway → Attendance Service → PostgreSQL → 
Event: Attendance Marked → Notification Service → Employee
```

**Payroll Processing Flow:**
```
Finance → Trigger Payroll → Payroll Service → 
Fetch Attendance Data → Fetch Leave Data → 
Calculate Salary → Apply Deductions → 
Generate Payslips → Store in DB → 
Event: Payroll Processed → Notification Service → All Employees
```

**Leave Approval Flow:**
```
Employee → Apply Leave → Leave Service → 
Check Balance → Create Request → 
Hierarchy Service (Get Manager) → 
Notification Service → Manager → 
Manager Approves → Update Balance → 
Update Calendar → Notify Employee
```

### Security Architecture

**Authentication:**
- JWT-based authentication with refresh tokens
- Token expiry: Access token (15 min), Refresh token (7 days)
- MFA support using TOTP (Time-based One-Time Password)

**Authorization:**
- Role-based access control enforced at API gateway
- Resource-level permissions (e.g., manager can only view their team's data)
- Audit logging for all sensitive operations

**Data Protection:**
- Sensitive data (bank details, documents) encrypted at rest using AES-256
- All API communication over TLS 1.2+
- PII data masked in logs and UI (show only last 4 digits of account numbers)

**Client-Side Security:**
- Face detection processing happens entirely on-device (no face data transmitted)
- GPS coordinates transmitted over encrypted channels
- PWA service worker caches only non-sensitive data

---

## Components and Interfaces

### Core Service Components

#### 1. Employee Service

**Responsibilities:**
- CRUD operations for employee records
- Profile management
- Employment history tracking
- Emergency contact management
- Document attachment handling

**Key Interfaces:**
```typescript
interface EmployeeService {
  createEmployee(data: CreateEmployeeDTO): Promise<Employee>
  updateEmployee(id: string, data: UpdateEmployeeDTO): Promise<Employee>
  getEmployee(id: string): Promise<Employee>
  searchEmployees(filters: EmployeeFilters): Promise<Employee[]>
  updateStatus(id: string, status: EmployeeStatus): Promise<void>
  getEmploymentHistory(id: string): Promise<EmploymentHistory[]>
  addEmergencyContact(employeeId: string, contact: EmergencyContact): Promise<void>
}
```

#### 2. Attendance Service

**Responsibilities:**
- Check-in/check-out processing
- Working hours calculation
- Overtime tracking
- Shift management
- Attendance regularization
- Face presence verification integration
- GPS tracking integration

**Key Interfaces:**
```typescript
interface AttendanceService {
  checkIn(employeeId: string, location: GeoLocation, faceDetected: boolean): Promise<Attendance>
  checkOut(employeeId: string, location: GeoLocation): Promise<Attendance>
  calculateWorkingHours(attendanceId: string): Promise<number>
  getMonthlyAttendance(employeeId: string, month: number, year: number): Promise<Attendance[]>
  requestRegularization(attendanceId: string, reason: string): Promise<RegularizationRequest>
  approveRegularization(requestId: string, approverId: string): Promise<void>
}
```

#### 3. Leave Service

**Responsibilities:**
- Leave application processing
- Leave balance management
- Approval workflow
- Leave calendar generation
- Carry-forward rule application

**Key Interfaces:**
```typescript
interface LeaveService {
  applyLeave(data: LeaveApplicationDTO): Promise<LeaveRequest>
  approveLeave(requestId: string, approverId: string): Promise<void>
  rejectLeave(requestId: string, approverId: string, reason: string): Promise<void>
  getLeaveBalance(employeeId: string, year: number): Promise<LeaveBalance[]>
  getTeamLeaveCalendar(managerId: string): Promise<LeaveCalendarEntry[]>
  applyCarryForwardRules(year: number): Promise<void>
}
```

#### 4. Payroll Service

**Responsibilities:**
- Salary structure management
- Monthly payroll calculation
- Statutory deduction computation
- Payslip generation
- Advance salary processing
- Integration with attendance and leave data

**Key Interfaces:**
```typescript
interface PayrollService {
  configureSalaryStructure(employeeId: string, structure: SalaryStructure): Promise<void>
  processMonthlyPayroll(month: number, year: number): Promise<PayrollSummary>
  calculateSalary(employeeId: string, month: number, year: number): Promise<SalaryCalculation>
  generatePayslip(employeeId: string, month: number, year: number): Promise<Payslip>
  processAdvance(employeeId: string, amount: number): Promise<AdvanceRequest>
  exportPayrollData(month: number, year: number, format: 'NEFT' | 'CSV'): Promise<Buffer>
}
```

#### 5. Recruitment Service

**Responsibilities:**
- Job posting management
- Applicant tracking
- Interview scheduling
- Feedback collection
- Offer letter generation
- Onboarding checklist management

**Key Interfaces:**
```typescript
interface RecruitmentService {
  createJobPosting(data: JobPostingDTO): Promise<JobPosting>
  addApplicant(jobId: string, data: ApplicantDTO): Promise<Applicant>
  moveApplicantStage(applicantId: string, stage: PipelineStage): Promise<void>
  scheduleInterview(data: InterviewScheduleDTO): Promise<Interview>
  submitFeedback(interviewId: string, feedback: InterviewFeedback): Promise<void>
  generateOfferLetter(applicantId: string, terms: OfferTerms): Promise<Document>
  createOnboardingChecklist(employeeId: string): Promise<OnboardingChecklist>
}
```

#### 6. Benefits Service

**Responsibilities:**
- Insurance plan management
- Enrollment processing
- Reimbursement claim handling
- Reward management
- PF and gratuity tracking

**Key Interfaces:**
```typescript
interface BenefitsService {
  createInsurancePlan(plan: InsurancePlanDTO): Promise<InsurancePlan>
  enrollEmployee(employeeId: string, planId: string): Promise<Enrollment>
  submitReimbursementClaim(data: ReimbursementClaimDTO): Promise<Claim>
  approveClaim(claimId: string, approverId: string): Promise<void>
  awardReward(employeeId: string, reward: RewardDTO): Promise<Reward>
  calculateGratuity(employeeId: string): Promise<number>
}
```

#### 7. Performance Service

**Responsibilities:**
- OKR/KPI goal management
- Performance review cycles
- Feedback collection
- PIP (Performance Improvement Plan) tracking
- Goal progress tracking

**Key Interfaces:**
```typescript
interface PerformanceService {
  createGoal(employeeId: string, goal: GoalDTO): Promise<Goal>
  updateGoalProgress(goalId: string, progress: number, comment: string): Promise<void>
  createReviewCycle(cycle: ReviewCycleDTO): Promise<ReviewCycle>
  submitReview(data: PerformanceReviewDTO): Promise<PerformanceReview>
  provideFeedback(toEmployeeId: string, feedback: FeedbackDTO): Promise<Feedback>
  initiatePIP(employeeId: string, pip: PIPDTO): Promise<PIP>
}
```

#### 8. Training Service

**Responsibilities:**
- Training program management
- Enrollment processing
- Certification tracking
- Skill matrix maintenance
- Skill gap analysis

**Key Interfaces:**
```typescript
interface TrainingService {
  createTrainingProgram(program: TrainingProgramDTO): Promise<TrainingProgram>
  enrollEmployee(employeeId: string, programId: string): Promise<Enrollment>
  markCompletion(enrollmentId: string): Promise<void>
  addCertification(employeeId: string, cert: CertificationDTO): Promise<Certification>
  updateSkillMatrix(employeeId: string, skills: SkillUpdate[]): Promise<void>
  generateSkillGapReport(departmentId: string): Promise<SkillGapReport>
}
```

#### 9. Separation Service

**Responsibilities:**
- Resignation/termination processing
- Notice period tracking
- Exit interview management
- Full & final settlement calculation
- Asset recovery tracking

**Key Interfaces:**
```typescript
interface SeparationService {
  submitResignation(employeeId: string, data: ResignationDTO): Promise<Resignation>
  initiateTermination(employeeId: string, data: TerminationDTO): Promise<Termination>
  scheduleExitInterview(employeeId: string, date: Date): Promise<ExitInterview>
  calculateFnFSettlement(employeeId: string): Promise<FnFSettlement>
  trackAssetRecovery(employeeId: string): Promise<AssetRecoveryChecklist>
  completeOffboarding(employeeId: string): Promise<void>
}
```

### Extended Feature Components

#### 10. Face Detection Service (Client-Side)

**Responsibilities:**
- Human presence detection using TensorFlow.js
- Liveness verification
- No facial identity matching or storage

**Key Interfaces:**
```typescript
interface FaceDetectionService {
  initializeModel(): Promise<void>
  detectHumanPresence(videoElement: HTMLVideoElement): Promise<DetectionResult>
  verifyLiveness(): Promise<boolean>
}

interface DetectionResult {
  detected: boolean
  confidence: number
  timestamp: Date
}
```

#### 11. Geo Tracking Service

**Responsibilities:**
- GPS coordinate capture
- Distance calculation
- Travel allowance computation
- Geo-fencing validation
- Anomaly detection

**Key Interfaces:**
```typescript
interface GeoTrackingService {
  captureLocation(): Promise<GeoLocation>
  trackJourney(employeeId: string, waypoints: GeoLocation[]): Promise<Journey>
  calculateDistance(waypoints: GeoLocation[]): Promise<number>
  calculateTravelAllowance(employeeId: string, distance: number): Promise<number>
  validateGeoFence(location: GeoLocation, allowedZones: GeoFence[]): Promise<boolean>
  detectAnomalies(journey: Journey): Promise<Anomaly[]>
}
```

#### 12. Hierarchy Service

**Responsibilities:**
- Organizational structure management
- Reporting line tracking
- Org chart generation
- Approval routing based on hierarchy

**Key Interfaces:**
```typescript
interface HierarchyService {
  createDepartment(data: DepartmentDTO): Promise<Department>
  assignEmployee(employeeId: string, position: HierarchyPosition): Promise<void>
  getReportingChain(employeeId: string): Promise<Employee[]>
  getDirectReports(managerId: string): Promise<Employee[]>
  generateOrgChart(rootId?: string): Promise<OrgChartNode>
  getApprovalRoute(employeeId: string, approvalType: string): Promise<Employee[]>
}
```

#### 13. Supplier/Buyer Service

**Responsibilities:**
- Supplier/buyer record management
- Visit logging
- Document attachment
- Relationship tracking

**Key Interfaces:**
```typescript
interface SupplierBuyerService {
  createRecord(employeeId: string, data: SupplierBuyerDTO): Promise<SupplierBuyer>
  updateRecord(id: string, data: UpdateSupplierBuyerDTO): Promise<SupplierBuyer>
  logVisit(recordId: string, location: GeoLocation, notes: string): Promise<Visit>
  getVisitHistory(recordId: string): Promise<Visit[]>
  attachDocument(recordId: string, document: Document): Promise<void>
}
```

#### 14. Bank Details Service

**Responsibilities:**
- Bank account management
- Encryption/decryption
- Verification workflow
- Audit logging

**Key Interfaces:**
```typescript
interface BankDetailsService {
  addBankAccount(employeeId: string, data: BankAccountDTO): Promise<BankAccount>
  updateBankAccount(id: string, data: UpdateBankAccountDTO): Promise<BankAccount>
  setPrimaryAccount(employeeId: string, accountId: string): Promise<void>
  requestVerification(accountId: string): Promise<VerificationRequest>
  approveVerification(requestId: string, approverId: string): Promise<void>
  getBankDetails(employeeId: string): Promise<BankAccount[]>
}
```

#### 15. Document Service

**Responsibilities:**
- Document upload and storage
- Version management
- Access control
- Expiry tracking

**Key Interfaces:**
```typescript
interface DocumentService {
  uploadDocument(employeeId: string, data: DocumentUploadDTO): Promise<Document>
  getDocument(id: string): Promise<Document>
  updateDocument(id: string, data: UpdateDocumentDTO): Promise<Document>
  deleteDocument(id: string): Promise<void>
  checkExpiry(): Promise<Document[]>
  notifyExpiry(documentId: string): Promise<void>
}
```

#### 16. e-Signature Service

**Responsibilities:**
- Signature request creation
- Signature capture and validation
- Document locking
- Audit trail maintenance

**Key Interfaces:**
```typescript
interface ESignatureService {
  createSignatureRequest(data: SignatureRequestDTO): Promise<SignatureRequest>
  signDocument(requestId: string, signature: SignatureData): Promise<void>
  getSignatureStatus(requestId: string): Promise<SignatureStatus>
  generateSignedDocument(requestId: string): Promise<Buffer>
  sendReminder(requestId: string): Promise<void>
  getAuditTrail(requestId: string): Promise<SignatureEvent[]>
}
```

#### 17. Notification Service

**Responsibilities:**
- Multi-channel notification delivery (in-app, email, push)
- Template management
- Scheduled notifications
- Birthday/anniversary automation

**Key Interfaces:**
```typescript
interface NotificationService {
  sendNotification(data: NotificationDTO): Promise<void>
  sendEmail(to: string, template: string, data: any): Promise<void>
  sendPushNotification(userId: string, message: string): Promise<void>
  scheduleNotification(data: ScheduledNotificationDTO): Promise<void>
  processBirthdayWishes(): Promise<void>
  processAnniversaryWishes(): Promise<void>
}
```

### API Gateway

The API Gateway serves as the single entry point for all client requests:

**Responsibilities:**
- Request routing
- Authentication and authorization
- Rate limiting
- Request/response logging
- Error handling
- API versioning

**Key Routes:**
```
/api/v1/auth/*          - Authentication endpoints
/api/v1/employees/*     - Employee management
/api/v1/attendance/*    - Attendance operations
/api/v1/leaves/*        - Leave management
/api/v1/payroll/*       - Payroll operations
/api/v1/recruitment/*   - Recruitment workflows
/api/v1/benefits/*      - Benefits management
/api/v1/performance/*   - Performance management
/api/v1/training/*      - Training programs
/api/v1/separation/*    - Offboarding
/api/v1/hierarchy/*     - Org structure
/api/v1/suppliers/*     - Supplier/buyer management
/api/v1/documents/*     - Document management
/api/v1/esignature/*    - e-Signature workflows
/api/v1/notifications/* - Notification management
```

---

## Data Models

### Core Entities

#### Employee
```typescript
interface Employee {
  id: string
  employeeId: string // Auto-generated unique ID
  firstName: string
  lastName: string
  dateOfBirth: Date
  gender: 'Male' | 'Female' | 'Other'
  nationality: string
  contactNumber: string
  personalEmail: string
  workEmail: string
  address: Address
  profilePhotoUrl?: string
  
  // Employment details
  departmentId: string
  designationId: string
  managerId?: string
  employmentType: 'Full-Time' | 'Part-Time' | 'Contract'
  dateOfJoining: Date
  status: 'Active' | 'On Leave' | 'Suspended' | 'Resigned' | 'Terminated'
  
  // Audit fields
  createdAt: Date
  updatedAt: Date
  createdBy: string
  updatedBy: string
}

interface Address {
  street: string
  city: string
  state: string
  country: string
  postalCode: string
}
```

#### Attendance
```typescript
interface Attendance {
  id: string
  employeeId: string
  date: Date
  checkInTime: Date
  checkOutTime?: Date
  totalHours?: number
  overtimeHours?: number
  mode: 'Biometric' | 'PWA' | 'Web' | 'Manual'
  status: 'Present' | 'Absent' | 'Half-Day' | 'On Leave' | 'Holiday'
  checkInLocation?: GeoLocation
  checkOutLocation?: GeoLocation
  faceDetected: boolean
  shiftId?: string
  regularizationRequested: boolean
  createdAt: Date
}

interface GeoLocation {
  latitude: number
  longitude: number
  accuracy: number
  timestamp: Date
}
```

#### Leave
```typescript
interface LeaveRequest {
  id: string
  employeeId: string
  leaveTypeId: string
  fromDate: Date
  toDate: Date
  halfDay: boolean
  halfDayPeriod?: 'AM' | 'PM'
  reason: string
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled'
  approverId?: string
  approverComments?: string
  appliedAt: Date
  processedAt?: Date
}

interface LeaveBalance {
  id: string
  employeeId: string
  leaveTypeId: string
  year: number
  totalAllotted: number
  used: number
  remaining: number
  carriedForward: number
}

interface LeaveType {
  id: string
  name: string
  code: string
  isPaid: boolean
  maxDaysPerYear: number
  carryForwardAllowed: boolean
  maxCarryForwardDays: number
  requiresApproval: boolean
}
```

#### Payroll
```typescript
interface SalaryStructure {
  id: string
  employeeId: string
  mode: 'Monthly' | 'Daily' | 'Hourly'
  grossSalary: number
  effectiveFrom: Date
  effectiveTo?: Date
  components: SalaryComponent[]
}

interface SalaryComponent {
  name: string
  type: 'Earning' | 'Deduction'
  amount: number
  isPercentage: boolean
  isStatutory: boolean
}

interface Payroll {
  id: string
  employeeId: string
  month: number
  year: number
  paidDays: number
  totalWorkingDays: number
  earnings: SalaryComponent[]
  deductions: SalaryComponent[]
  grossPay: number
  totalDeductions: number
  netPay: number
  status: 'Draft' | 'Processed' | 'Paid' | 'Locked'
  processedAt?: Date
  paidAt?: Date
}

interface Payslip {
  id: string
  payrollId: string
  employeeId: string
  month: number
  year: number
  generatedAt: Date
  pdfUrl: string
}
```

#### Recruitment
```typescript
interface JobPosting {
  id: string
  title: string
  departmentId: string
  location: string
  description: string
  requiredSkills: string[]
  experienceRange: { min: number; max: number }
  applicationDeadline: Date
  status: 'Open' | 'Closed' | 'On Hold'
  createdBy: string
  createdAt: Date
}

interface Applicant {
  id: string
  jobPostingId: string
  name: string
  email: string
  contactNumber: string
  resumeUrl: string
  currentStage: 'Applied' | 'Screening' | 'Interview' | 'Offer' | 'Hired' | 'Rejected'
  appliedAt: Date
  notes: ApplicantNote[]
}

interface Interview {
  id: string
  applicantId: string
  scheduledAt: Date
  mode: 'In-Person' | 'Video' | 'Phone'
  interviewers: string[] // Employee IDs
  feedback: InterviewFeedback[]
  status: 'Scheduled' | 'Completed' | 'Cancelled'
}

interface InterviewFeedback {
  interviewerId: string
  rating: number // 1-5
  comments: string
  recommendation: 'Strong Hire' | 'Hire' | 'Maybe' | 'No Hire'
  submittedAt: Date
}
```

#### Performance
```typescript
interface Goal {
  id: string
  employeeId: string
  cycleId: string
  type: 'OKR' | 'KPI'
  title: string
  description: string
  targetValue: number
  currentValue: number
  unit: string
  weight: number // Percentage
  dueDate: Date
  status: 'On Track' | 'At Risk' | 'Behind' | 'Completed'
  createdAt: Date
  updatedAt: Date
}

interface PerformanceReview {
  id: string
  employeeId: string
  cycleId: string
  selfRating?: number
  managerRating?: number
  peerRatings: number[]
  finalRating: number
  comments: string
  status: 'Pending' | 'Self-Assessment Complete' | 'Manager Review Complete' | 'Finalized'
  completedAt?: Date
}

interface PIP {
  id: string
  employeeId: string
  initiatedBy: string
  goals: string[]
  timeline: { start: Date; end: Date }
  checkIns: PIPCheckIn[]
  outcome?: 'Completed' | 'Extended' | 'Escalated'
  status: 'Active' | 'Completed'
}
```

#### Training
```typescript
interface TrainingProgram {
  id: string
  title: string
  category: 'Technical' | 'Soft Skills' | 'Compliance' | 'Safety'
  mode: 'In-Person' | 'Online' | 'Hybrid'
  duration: number // hours
  provider: string
  scheduledDate?: Date
  status: 'Scheduled' | 'Ongoing' | 'Completed' | 'Cancelled'
  createdAt: Date
}

interface TrainingEnrollment {
  id: string
  employeeId: string
  programId: string
  enrolledAt: Date
  completedAt?: Date
  status: 'Enrolled' | 'In Progress' | 'Completed' | 'Dropped'
  certificateUrl?: string
}

interface Certification {
  id: string
  employeeId: string
  name: string
  issuingBody: string
  issueDate: Date
  expiryDate?: Date
  certificateFileUrl: string
  status: 'Active' | 'Expired' | 'Expiring Soon'
}

interface EmployeeSkill {
  id: string
  employeeId: string
  skillId: string
  proficiencyLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'
  updatedAt: Date
}
```

### Extended Feature Entities

#### Hierarchy
```typescript
interface Department {
  id: string
  name: string
  parentDepartmentId?: string
  headEmployeeId?: string
  createdAt: Date
}

interface Designation {
  id: string
  title: string
  grade: string
  departmentId: string
  level: number
}

interface HierarchyNode {
  id: string
  employeeId: string
  parentId?: string
  level: number
  effectiveFrom: Date
  effectiveTo?: Date
}
```

#### Geo Tracking
```typescript
interface GeoLog {
  id: string
  employeeId: string
  date: Date
  waypoints: GeoLocation[]
  totalKm: number
  allowanceAmount: number
  approvalStatus: 'Pending' | 'Approved' | 'Rejected'
  approverId?: string
  createdAt: Date
}

interface GeoFence {
  id: string
  name: string
  center: GeoLocation
  radiusMeters: number
  applicableTo: string[] // Employee IDs or department IDs
}
```

#### Supplier/Buyer
```typescript
interface SupplierBuyer {
  id: string
  employeeId: string
  name: string
  companyName: string
  contactNumber: string
  email: string
  address: Address
  gstNumber?: string
  type: 'Supplier' | 'Buyer' | 'Both'
  status: 'Active' | 'Inactive'
  createdAt: Date
}

interface Visit {
  id: string
  supplierBuyerId: string
  employeeId: string
  visitDate: Date
  location: GeoLocation
  notes: string
  createdAt: Date
}
```

#### Bank Details
```typescript
interface BankAccount {
  id: string
  employeeId: string
  bankName: string
  accountHolderName: string
  accountNumberEncrypted: string // AES-256 encrypted
  ifscCode: string
  branchName: string
  accountType: 'Savings' | 'Current'
  isPrimary: boolean
  verified: boolean
  verificationRequestId?: string
  createdAt: Date
  updatedAt: Date
  auditLog: BankAuditEntry[]
}

interface BankAuditEntry {
  timestamp: Date
  action: string
  performedBy: string
  changes: any
}
```

#### e-Signature
```typescript
interface SignatureRequest {
  id: string
  documentUrl: string
  documentType: string
  sentBy: string
  recipients: SignatureRecipient[]
  status: 'Sent' | 'Partially Signed' | 'Fully Signed' | 'Expired'
  createdAt: Date
  expiresAt: Date
}

interface SignatureRecipient {
  employeeId: string
  order: number
  status: 'Pending' | 'Viewed' | 'Signed'
  signedAt?: Date
}

interface SignatureEvent {
  id: string
  requestId: string
  employeeId: string
  eventType: 'Sent' | 'Viewed' | 'Signed' | 'Reminded'
  timestamp: Date
  ipAddress: string
  deviceInfo: string
  signatureData?: string
}
```

#### Notifications
```typescript
interface Notification {
  id: string
  recipientId: string
  type: 'Info' | 'Warning' | 'Success' | 'Error'
  channel: 'In-App' | 'Email' | 'Push'
  title: string
  message: string
  actionUrl?: string
  read: boolean
  sentAt: Date
  readAt?: Date
}

interface NotificationTemplate {
  id: string
  name: string
  channel: 'Email' | 'Push' | 'In-App'
  subject?: string
  body: string
  variables: string[]
}
```

### Database Schema Relationships

```
employees (1) ──── (N) attendance
employees (1) ──── (N) leaves
employees (1) ──── (N) payroll
employees (1) ──── (N) training_enrollments
employees (1) ──── (N) certifications
employees (1) ──── (N) goals
employees (1) ──── (N) performance_reviews
employees (1) ──── (N) bank_accounts
employees (1) ──── (N) documents
employees (1) ──── (N) supplier_buyers
employees (1) ──── (N) geo_logs

departments (1) ──── (N) employees
designations (1) ──── (N) employees
employees (manager) (1) ──── (N) employees (reports)

job_postings (1) ──── (N) applicants
applicants (1) ──── (N) interviews

leave_types (1) ──── (N) leaves
leave_types (1) ──── (N) leave_balances

training_programs (1) ──── (N) training_enrollments
skills (1) ──── (N) employee_skills

signature_requests (1) ──── (N) signature_events
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, I identified several areas of redundancy:

1. **Data Persistence Properties**: Many requirements (3.1.1, 3.1.3, 4.2.1, 4.2.5, etc.) are about storing and retrieving data correctly. These can be consolidated into a single round-trip property per entity type.

2. **Notification Properties**: Multiple requirements (4.2.4, 4.2.6, 4.4.5, 4.6.10, etc.) specify sending notifications on events. These can be combined into a general event-notification property.

3. **Approval Workflow Properties**: Several requirements (4.4.3, 4.6.9, 4.6.9, 4.7.11) describe approval workflows. These follow the same pattern and can be consolidated.

4. **Calculation Properties**: Multiple calculation requirements (4.3.2, 4.3.3, 4.5.3, FR-4.2.4) can be tested individually as they have different formulas.

5. **Access Control Properties**: Requirements about role-based access (4.2.8, 4.4.4, FR-4.3.6) can be consolidated into a general RBAC property.

The following properties represent the unique, non-redundant validation requirements:

### Property 1: Employee Data Round-Trip

*For any* employee record with valid personal details, employment information, and emergency contacts, creating the employee and then retrieving it should return an equivalent record with all fields preserved.

**Validates: Requirements 3.1.1, 3.1.3, 3.1.4, 3.1.6**

### Property 2: Employee ID Uniqueness

*For any* set of employee records created in the system, all auto-generated employee IDs must be unique across the entire employee database.

**Validates: Requirements 3.1.2**

### Property 3: Emergency Contact Validation

*For any* employee record, the system should reject attempts to add zero emergency contacts or more than three emergency contacts, and should accept exactly 1, 2, or 3 contacts.

**Validates: Requirements 3.1.4**

### Property 4: Audit Trail Completeness

*For any* modification to an employee record, the audit log must contain an entry with the timestamp, the user who made the change, and the fields that were modified.

**Validates: Requirements 3.1.8**

### Property 5: Search Result Accuracy

*For any* employee search query with specific filters (name, department, designation, location, or status), all returned results must match all specified filter criteria.

**Validates: Requirements 3.1.9**

### Property 6: Applicant Pipeline State Transitions

*For any* applicant in the recruitment pipeline, moving them to a new stage should update their current stage to the specified value and maintain the valid stage sequence (Applied → Screening → Interview → Offer → Hired/Rejected).

**Validates: Requirements 4.2.2, 4.2.3**

### Property 7: Event-Driven Notifications

*For any* system event that requires notification (status change, approval, rejection, scheduled event), a notification must be created and sent to all specified recipients through the configured channels.

**Validates: Requirements 4.2.4, 4.2.6, 4.4.5, 4.6.10, FR-4.10.3, FR-4.11.2, FR-4.11.3**

### Property 8: Interview Feedback Access Control

*For any* interview feedback submitted, it must be accessible to users with HR Manager role and the hiring manager for that job posting, and must not be accessible to other employees.

**Validates: Requirements 4.2.8**

### Property 9: Template Population Completeness

*For any* offer letter generated from a template with candidate data, the resulting document must contain all populated fields (name, designation, CTC, joining date) matching the input data.

**Validates: Requirements 4.2.9**

### Property 10: Offer Acceptance Side Effect

*For any* offer letter that is fully signed by all parties, the system must automatically create a draft employee record with the candidate's information from the offer.

**Validates: Requirements 4.2.11**

### Property 11: Onboarding Checklist Generation

*For any* new employee with a specific department and role, the generated onboarding checklist must include all items configured for that department-role combination.

**Validates: Requirements 4.2.12**

### Property 12: Checklist Completion Tracking

*For any* onboarding checklist, as individual items are marked complete, the completion count must equal the number of completed items and the total count must remain constant.

**Validates: Requirements 4.2.13**

### Property 13: Working Hours Calculation

*For any* attendance record with check-in time, check-out time, and configured break duration, the calculated working hours must equal (check-out time − check-in time − break duration).

**Validates: Requirements 4.3.2**

### Property 14: Overtime Calculation

*For any* attendance record with working hours exceeding the standard shift duration, overtime hours must equal (total working hours − standard shift duration) and must be tracked separately.

**Validates: Requirements 4.3.3, 4.3.4**

### Property 15: Remote Attendance GPS Requirement

*For any* attendance marked in remote mode, the attendance record must include valid GPS coordinates (latitude, longitude, accuracy, timestamp).

**Validates: Requirements 4.3.5**

### Property 16: Monthly Attendance Aggregation

*For any* employee and month, the monthly attendance summary must correctly aggregate all attendance records for that period, including total present days, absent days, half-days, leaves, and total working hours.

**Validates: Requirements 4.3.8**

### Property 17: Late Check-In Alert

*For any* employee who has not checked in by the configured threshold time on a working day, an alert notification must be sent to their reporting manager.

**Validates: Requirements 4.3.9**

### Property 18: Leave Balance Deduction

*For any* leave request that is approved, the employee's leave balance for that leave type must decrease by the number of days in the leave request (with half-day counting as 0.5).

**Validates: Requirements 4.4.7, FR-4.5.4**

### Property 19: Leave Carry-Forward Application

*For any* leave type with carry-forward rules enabled, at the end of the year, the remaining balance (up to the maximum carry-forward limit) must be added to the next year's opening balance.

**Validates: Requirements 4.4.8**

### Property 20: Hierarchy-Based Approval Routing

*For any* approval request (leave, travel, expense), the request must be routed to the employee's direct reporting manager as determined by the hierarchy service.

**Validates: Requirements 4.4.3, FR-4.3.7**

### Property 21: Attendance-Based Salary Calculation

*For any* employee with monthly salary mode, the payable salary must equal (gross salary / total working days) × paid days, where paid days = present days + approved leave days + holiday days.

**Validates: Requirements 4.5.3, FR-4.5.1, FR-4.5.3**

### Property 22: Statutory Deduction Calculation

*For any* employee salary and configured tax slabs, the calculated statutory deductions (PF, ESI, TDS) must match the amounts determined by the applicable slab rates and thresholds.

**Validates: Requirements 4.5.4**

### Property 23: Payslip Completeness

*For any* processed payroll record, the generated payslip must include all earning components, all deduction components, gross pay, total deductions, and net pay, with net pay = gross pay − total deductions.

**Validates: Requirements 4.5.5**

### Property 24: Advance Salary Deduction

*For any* approved advance salary request, the advance amount must appear as a deduction in the next payroll cycle for that employee.

**Validates: Requirements 4.5.9**

### Property 25: Payroll Lock Immutability

*For any* payroll record in "Locked" status, any attempt to modify the record must be rejected unless performed by a user with Finance Admin role and must create an audit log entry.

**Validates: Requirements 4.5.10**

### Property 26: Insurance Enrollment Window Validation

*For any* insurance enrollment request, the request must be accepted only if the current date falls within the configured enrollment window for that insurance plan.

**Validates: Requirements 4.6.2**

### Property 27: Insurance Premium Payroll Integration

*For any* employee enrolled in an insurance plan, the insurance premium amount must appear as a deduction in their monthly payroll.

**Validates: Requirements 4.6.4**

### Property 28: PF Contribution Calculation

*For any* employee salary, the PF contribution must be calculated as (employee share + employer share) where each share is the configured percentage of basic salary.

**Validates: Requirements 4.6.5**

### Property 29: Gratuity Eligibility Calculation

*For any* employee with 5 or more years of service, the system must calculate gratuity as (last drawn salary × years of service × 15) / 26, and for employees with less than 5 years, gratuity must be zero.

**Validates: Requirements 4.6.6**

### Property 30: Reimbursement Payroll Integration

*For any* reimbursement claim approved by both manager and finance, the claim amount must appear as an earning component in the next payroll cycle.

**Validates: Requirements 4.6.10**

### Property 31: Resignation Offboarding Trigger

*For any* resignation or termination initiated, the system must automatically create an offboarding workflow with all required checklist items (exit interview, F&F calculation, asset recovery).

**Validates: Requirements 4.7.3**

### Property 32: Notice Period Calculation

*For any* resignation with an effective date and the employee's contract notice period, the notice period end date must equal (resignation date + notice period days).

**Validates: Requirements 4.7.4**

### Property 33: Full & Final Settlement Calculation

*For any* separating employee, the F&F settlement must include: (pending salary for days worked) + (encashable leave balance × per-day salary) + (gratuity if applicable) − (outstanding advances) − (unreturned asset costs).

**Validates: Requirements 4.7.10**

### Property 34: Asset Recovery Checklist Completeness

*For any* separating employee, the asset recovery checklist must include all assets that were assigned to that employee during onboarding and tenure.

**Validates: Requirements 4.7.13**

### Property 35: Employee Deactivation Precondition

*For any* separating employee, the employee record status can only be changed to "Terminated" or "Resigned" after all offboarding checklist items are marked complete.

**Validates: Requirements 4.7.16**

### Property 36: Goal Completion Percentage Calculation

*For any* employee with multiple weighted goals, the overall completion percentage must equal the sum of (individual goal completion × goal weight) for all goals.

**Validates: Requirements 3.8.7**

### Property 37: Performance Review Final Rating

*For any* performance review with self-rating, manager rating, and peer ratings, the final rating must be calculated using the configured weighting formula.

**Validates: Requirements 3.8.10**

### Property 38: Training Completion Skill Update

*For any* training program completed by an employee, if the program is linked to specific skills, those skills must be added to or updated in the employee's skill matrix.

**Validates: Requirements 3.9.12**

### Property 39: Skill Gap Report Accuracy

*For any* designation with required skills and a department with employees in that designation, the skill gap report must identify all required skills that are missing or below the required proficiency level across the team.

**Validates: Requirements 3.9.14**

### Property 40: Face Detection No Storage

*For any* attendance check-in using face detection, the system must not store any facial image data or facial feature vectors; only the boolean detection result (true/false) and metadata (timestamp, device ID, GPS) may be stored.

**Validates: Requirements FR-3.1.3**

### Property 41: Face Detection Attendance Precondition

*For any* attendance check-in attempt, an attendance record must only be created if the face detection result is true (human presence confirmed).

**Validates: Requirements FR-3.1.6**

### Property 42: Manual Attendance Override Audit

*For any* manual attendance override performed by an admin, the attendance record must include a flag indicating manual entry, the admin's user ID, and a mandatory reason in the audit log.

**Validates: Requirements FR-3.1.7**

### Property 43: Distance Calculation from Waypoints

*For any* set of GPS waypoints representing a journey, the calculated total distance must be the sum of distances between consecutive waypoint pairs using the Haversine formula or equivalent.

**Validates: Requirements FR-4.2.2**

### Property 44: Travel Allowance Calculation

*For any* employee with a configured per-km travel allowance rate and a journey with calculated distance, the travel allowance must equal (total km × rate per km).

**Validates: Requirements FR-4.2.4**

### Property 45: Geo-Fence Validation

*For any* GPS location and defined geo-fence (center point + radius), the system must correctly determine whether the location is inside or outside the geo-fence using distance calculation.

**Validates: Requirements FR-4.2.8**

### Property 46: Hierarchy Depth Support

*For any* organizational hierarchy, the system must support unlimited depth levels, allowing any employee node to have child nodes (direct reports) which can themselves have child nodes.

**Validates: Requirements FR-4.3.1**

### Property 47: Single Primary Position Constraint

*For any* employee, they must be assigned to exactly one primary position in the hierarchy at any given time (though historical positions may exist with non-overlapping date ranges).

**Validates: Requirements FR-4.3.2**

### Property 48: Hierarchy-Based Access Control

*For any* manager and employee, the manager can access the employee's data if and only if the employee is in the manager's reporting chain (direct or indirect report).

**Validates: Requirements FR-4.3.6**

### Property 49: Hierarchy Change Audit

*For any* change to an employee's position in the hierarchy (promotion, transfer, manager change), the system must log the change with effective dates and create a new hierarchy node record while closing the previous one.

**Validates: Requirements FR-4.3.8**

### Property 50: Supplier/Buyer Visit GPS Logging

*For any* visit logged to a supplier/buyer location, the visit record must include GPS coordinates that are captured at the time of the visit.

**Validates: Requirements FR-4.4.6**

### Property 51: Unpaid Absence Salary Deduction

*For any* employee with unpaid absences in a month, the salary deduction must equal (gross salary / total working days) × number of unpaid absent days.

**Validates: Requirements FR-4.5.2**

### Property 52: Holiday Paid Day Inclusion

*For any* month with configured company holidays, those holiday dates must be counted as paid days in the salary calculation for all employees.

**Validates: Requirements FR-4.5.8**

### Property 53: Incomplete Check-Out Flagging

*For any* attendance record where check-in exists but check-out is null after the end of the working day, the record must be flagged as incomplete and a notification must be sent to the employee.

**Validates: Requirements FR-4.6.4**

### Property 54: Multiple Daily Attendance Support

*For any* employee and date, the system must support storing multiple check-in/check-out pairs (for field staff visiting multiple sites), and total working hours must be the sum of all pairs.

**Validates: Requirements FR-4.6.5**

### Property 55: Bank Account Limit Validation

*For any* employee, the system must allow storing up to 2 bank accounts and must reject attempts to add a third account.

**Validates: Requirements FR-4.7.3**

### Property 56: Bank Details Encryption

*For any* bank account record stored in the database, the account number field must be encrypted using AES-256 encryption, and the UI must display only the last 4 digits.

**Validates: Requirements FR-4.7.5**

### Property 57: Bank Details Change Verification

*For any* change to an employee's bank account details, the changes must not be activated for payroll until approved by a user with Finance role, and the approval must be logged.

**Validates: Requirements FR-4.7.4**

### Property 58: Salary Mode Flexibility

*For any* employee, the system must support configuring their salary calculation mode as Monthly (fixed), Daily (rate × days), or Hourly (rate × hours), and payroll calculation must use the appropriate formula for their mode.

**Validates: Requirements FR-4.8.1**

### Property 59: Document Lock After Full Signature

*For any* e-signature request where all recipients have signed, the document must be locked (status = "Fully Signed"), preventing any further modifications, and a final signed PDF must be generated.

**Validates: Requirements FR-4.10.7**

### Property 60: Signature Audit Trail

*For any* signature event (document sent, viewed, signed), an audit entry must be created with timestamp, employee ID, IP address, device info, and signature data (if applicable).

**Validates: Requirements FR-4.10.6, FR-4.10.11**

### Property 61: Signature Reminder Scheduling

*For any* signature request where a recipient has not signed within 48 hours of the request being sent (or last reminder), a reminder notification must be automatically sent to that recipient.

**Validates: Requirements FR-4.10.9**

### Property 62: Birthday Detection and Notification

*For any* employee whose date of birth matches the current date (day and month), the system must send a birthday wish notification to the employee and post it on the company notice board (unless the employee has opted out).

**Validates: Requirements FR-4.11.1, FR-4.11.2, FR-4.11.4**

### Property 63: Work Anniversary Detection and Notification

*For any* employee whose date of joining anniversary matches the current date, the system must send a work anniversary wish notification including the number of years of service.

**Validates: Requirements FR-4.11.1, FR-4.11.3**

### Property 64: Manager Advance Birthday Notification

*For any* employee with a birthday tomorrow, the system must send a notification to their direct reporting manager one day in advance.

**Validates: Requirements FR-4.11.7**

### Property 65: Birthday Opt-Out Respect

*For any* employee who has opted out of public birthday announcements, birthday wishes must be sent via private notification only and must not be posted on the company notice board.

**Validates: Requirements FR-4.11.8**

---

## Error Handling

### Error Handling Strategy

The EMS implements a comprehensive error handling strategy with consistent error responses, proper logging, and user-friendly error messages.

### Error Categories

**1. Validation Errors (400 Bad Request)**
- Invalid input data (missing required fields, invalid formats)
- Business rule violations (e.g., adding 4th emergency contact, applying leave with insufficient balance)
- Date range errors (e.g., check-out before check-in, leave end date before start date)

**2. Authentication Errors (401 Unauthorized)**
- Missing or invalid JWT token
- Expired access token
- Invalid credentials during login
- MFA verification failure

**3. Authorization Errors (403 Forbidden)**
- Insufficient permissions for requested operation
- Attempting to access data outside reporting chain
- Role-based access control violations

**4. Resource Not Found Errors (404 Not Found)**
- Employee, department, or other entity not found
- Invalid IDs in request parameters

**5. Conflict Errors (409 Conflict)**
- Duplicate employee ID
- Overlapping leave requests
- Concurrent modification conflicts

**6. External Service Errors (502/503)**
- Face detection model loading failure
- GPS service unavailable
- Email service failure
- File storage service errors

**7. Internal Server Errors (500)**
- Unexpected application errors
- Database connection failures
- Unhandled exceptions

### Error Response Format

All API errors follow a consistent JSON structure:

```typescript
interface ErrorResponse {
  error: {
    code: string           // Machine-readable error code
    message: string        // Human-readable error message
    details?: any          // Additional error context
    timestamp: string      // ISO 8601 timestamp
    requestId: string      // Unique request identifier for tracing
    field?: string         // Field name for validation errors
  }
}
```

### Error Handling Patterns

**1. Input Validation**
```typescript
// Validate at API gateway before reaching service layer
if (!isValidEmail(email)) {
  throw new ValidationError('Invalid email format', { field: 'email' })
}
```

**2. Business Rule Validation**
```typescript
// Check business rules in service layer
const balance = await leaveService.getBalance(employeeId, leaveTypeId)
if (balance.remaining < requestedDays) {
  throw new BusinessRuleError('Insufficient leave balance', {
    available: balance.remaining,
    requested: requestedDays
  })
}
```

**3. Database Error Handling**
```typescript
try {
  await repository.save(employee)
} catch (error) {
  if (error.code === 'UNIQUE_VIOLATION') {
    throw new ConflictError('Employee ID already exists')
  }
  throw new DatabaseError('Failed to save employee', { cause: error })
}
```

**4. External Service Error Handling**
```typescript
try {
  await emailService.send(notification)
} catch (error) {
  // Log error but don't fail the main operation
  logger.error('Failed to send email notification', { error, notification })
  // Queue for retry
  await retryQueue.add({ type: 'email', data: notification })
}
```

**5. Graceful Degradation**
```typescript
// Face detection failure should allow manual override
try {
  const detected = await faceDetectionService.detect(videoFrame)
  if (!detected) {
    return { success: false, reason: 'No face detected' }
  }
} catch (error) {
  logger.error('Face detection service error', { error })
  // Allow admin to manually mark attendance with reason
  return { success: false, reason: 'Face detection unavailable', allowManualOverride: true }
}
```

### Logging Strategy

**Log Levels:**
- **ERROR**: Application errors, external service failures, unhandled exceptions
- **WARN**: Business rule violations, validation failures, retry attempts
- **INFO**: Successful operations, state transitions, important events
- **DEBUG**: Detailed execution flow, variable values (development only)

**Structured Logging:**
```typescript
logger.info('Payroll processed', {
  month,
  year,
  employeeCount,
  totalAmount,
  duration: processingTime,
  requestId
})
```

**Sensitive Data Masking:**
- Bank account numbers: Show only last 4 digits
- Passwords: Never log
- JWT tokens: Log only token ID, not full token
- PII: Mask or hash before logging

### Retry and Circuit Breaker Patterns

**Retry Strategy for External Services:**
- Email service: 3 retries with exponential backoff
- File storage: 2 retries with 1-second delay
- GPS service: No retry (use cached location if available)

**Circuit Breaker for Critical Services:**
- Open circuit after 5 consecutive failures
- Half-open state after 30 seconds
- Close circuit after 2 successful requests

### User-Facing Error Messages

**Validation Errors:**
- "Email address format is invalid"
- "Emergency contacts must be between 1 and 3"
- "Leave end date cannot be before start date"

**Business Rule Errors:**
- "Insufficient leave balance. You have 2 days remaining but requested 5 days"
- "Cannot mark attendance outside of geo-fence area"
- "Payroll for this period is locked and cannot be modified"

**System Errors:**
- "Unable to process your request. Please try again later" (with request ID for support)
- "Face detection is temporarily unavailable. Please contact your manager for manual attendance"

---

## Testing Strategy

### Testing Approach

The EMS employs a dual testing strategy combining unit tests for specific scenarios and property-based tests for comprehensive coverage of correctness properties.

### Unit Testing

**Purpose:**
- Verify specific examples and edge cases
- Test integration points between components
- Validate error conditions and boundary cases

**Scope:**
- Individual service methods
- Repository operations
- Utility functions
- API endpoint handlers

**Framework:** Jest (for Node.js/TypeScript)

**Coverage Target:** Minimum 80% code coverage

**Example Unit Tests:**
```typescript
describe('AttendanceService', () => {
  it('should calculate working hours correctly for full day', async () => {
    const attendance = {
      checkInTime: new Date('2024-01-15T09:00:00'),
      checkOutTime: new Date('2024-01-15T18:00:00'),
      breakDuration: 60 // minutes
    }
    const hours = await attendanceService.calculateWorkingHours(attendance)
    expect(hours).toBe(8) // 9 hours - 1 hour break
  })

  it('should reject attendance without face detection', async () => {
    await expect(
      attendanceService.checkIn(employeeId, location, false)
    ).rejects.toThrow('Face detection required')
  })

  it('should handle missing check-out gracefully', async () => {
    const attendance = await attendanceService.checkIn(employeeId, location, true)
    // Simulate end of day without check-out
    await attendanceService.flagIncompleteAttendance()
    const flagged = await attendanceService.getAttendance(attendance.id)
    expect(flagged.status).toBe('Incomplete')
  })
})
```

### Property-Based Testing

**Purpose:**
- Verify universal properties across all inputs
- Ensure correctness properties from design document hold
- Discover edge cases through randomized testing

**Framework:** fast-check (for TypeScript/JavaScript)

**Configuration:**
- Minimum 100 iterations per property test
- Seed-based reproducibility for failed tests
- Shrinking to find minimal failing examples

**Property Test Structure:**
```typescript
import fc from 'fast-check'

describe('Property Tests', () => {
  /**
   * Feature: employee-management-system
   * Property 1: Employee Data Round-Trip
   * For any employee record with valid personal details, creating the employee
   * and then retrieving it should return an equivalent record with all fields preserved.
   */
  it('Property 1: Employee data round-trip', async () => {
    await fc.assert(
      fc.asyncProperty(
        employeeArbitrary(), // Generator for valid employee data
        async (employeeData) => {
          const created = await employeeService.createEmployee(employeeData)
          const retrieved = await employeeService.getEmployee(created.id)
          
          expect(retrieved.firstName).toBe(employeeData.firstName)
          expect(retrieved.lastName).toBe(employeeData.lastName)
          expect(retrieved.dateOfBirth).toEqual(employeeData.dateOfBirth)
          expect(retrieved.departmentId).toBe(employeeData.departmentId)
          // ... verify all fields
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Feature: employee-management-system
   * Property 2: Employee ID Uniqueness
   * For any set of employee records created in the system, all auto-generated
   * employee IDs must be unique across the entire employee database.
   */
  it('Property 2: Employee ID uniqueness', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(employeeArbitrary(), { minLength: 2, maxLength: 50 }),
        async (employeesData) => {
          const created = await Promise.all(
            employeesData.map(data => employeeService.createEmployee(data))
          )
          const ids = created.map(emp => emp.employeeId)
          const uniqueIds = new Set(ids)
          
          expect(uniqueIds.size).toBe(ids.length)
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Feature: employee-management-system
   * Property 13: Working Hours Calculation
   * For any attendance record with check-in time, check-out time, and configured
   * break duration, the calculated working hours must equal
   * (check-out time − check-in time − break duration).
   */
  it('Property 13: Working hours calculation', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.date({ min: new Date('2024-01-01T06:00:00'), max: new Date('2024-12-31T12:00:00') }),
        fc.integer({ min: 1, max: 12 }), // hours to add for checkout
        fc.integer({ min: 0, max: 120 }), // break duration in minutes
        async (checkInTime, hoursToAdd, breakMinutes) => {
          const checkOutTime = new Date(checkInTime.getTime() + hoursToAdd * 60 * 60 * 1000)
          
          const attendance = await attendanceService.checkIn(employeeId, location, true)
          attendance.checkOutTime = checkOutTime
          attendance.breakDuration = breakMinutes
          
          const calculatedHours = await attendanceService.calculateWorkingHours(attendance)
          const expectedHours = (hoursToAdd * 60 - breakMinutes) / 60
          
          expect(calculatedHours).toBeCloseTo(expectedHours, 2)
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Feature: employee-management-system
   * Property 21: Attendance-Based Salary Calculation
   * For any employee with monthly salary mode, the payable salary must equal
   * (gross salary / total working days) × paid days.
   */
  it('Property 21: Attendance-based salary calculation', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 20000, max: 200000 }), // gross salary
        fc.integer({ min: 20, max: 31 }), // total working days
        fc.integer({ min: 0, max: 31 }), // paid days
        async (grossSalary, totalWorkingDays, paidDays) => {
          fc.pre(paidDays <= totalWorkingDays) // Precondition
          
          const employee = await createEmployeeWithSalary(grossSalary)
          const payroll = await payrollService.calculateSalary(
            employee.id,
            month,
            year,
            { totalWorkingDays, paidDays }
          )
          
          const expectedSalary = (grossSalary / totalWorkingDays) * paidDays
          expect(payroll.netPay).toBeCloseTo(expectedSalary, 2)
        }
      ),
      { numRuns: 100 }
    )
  })
})
```

### Generators (Arbitraries) for Property Tests

```typescript
// Generator for valid employee data
const employeeArbitrary = () => fc.record({
  firstName: fc.string({ minLength: 1, maxLength: 50 }),
  lastName: fc.string({ minLength: 1, maxLength: 50 }),
  dateOfBirth: fc.date({ min: new Date('1960-01-01'), max: new Date('2005-12-31') }),
  gender: fc.constantFrom('Male', 'Female', 'Other'),
  contactNumber: fc.string({ minLength: 10, maxLength: 15 }),
  email: fc.emailAddress(),
  departmentId: fc.uuid(),
  designationId: fc.uuid(),
  employmentType: fc.constantFrom('Full-Time', 'Part-Time', 'Contract')
})

// Generator for GPS locations
const geoLocationArbitrary = () => fc.record({
  latitude: fc.double({ min: -90, max: 90 }),
  longitude: fc.double({ min: -180, max: 180 }),
  accuracy: fc.double({ min: 0, max: 100 }),
  timestamp: fc.date()
})

// Generator for leave requests
const leaveRequestArbitrary = () => fc.record({
  employeeId: fc.uuid(),
  leaveTypeId: fc.uuid(),
  fromDate: fc.date({ min: new Date('2024-01-01'), max: new Date('2024-12-31') }),
  toDate: fc.date({ min: new Date('2024-01-01'), max: new Date('2024-12-31') }),
  halfDay: fc.boolean(),
  reason: fc.string({ minLength: 10, maxLength: 200 })
}).filter(req => req.toDate >= req.fromDate) // Ensure valid date range
```

### Integration Testing

**Purpose:**
- Test interactions between multiple services
- Verify end-to-end workflows
- Validate database transactions and rollbacks

**Scope:**
- Complete user workflows (e.g., recruitment pipeline, payroll processing)
- Cross-service communication
- Database integrity constraints

**Example Integration Tests:**
```typescript
describe('Recruitment Workflow Integration', () => {
  it('should complete full recruitment pipeline', async () => {
    // Create job posting
    const job = await recruitmentService.createJobPosting(jobData)
    
    // Add applicant
    const applicant = await recruitmentService.addApplicant(job.id, applicantData)
    
    // Move through pipeline
    await recruitmentService.moveApplicantStage(applicant.id, 'Screening')
    await recruitmentService.moveApplicantStage(applicant.id, 'Interview')
    
    // Schedule interview
    const interview = await recruitmentService.scheduleInterview({
      applicantId: applicant.id,
      scheduledAt: new Date(),
      interviewers: [managerId]
    })
    
    // Submit feedback
    await recruitmentService.submitFeedback(interview.id, {
      interviewerId: managerId,
      rating: 5,
      recommendation: 'Strong Hire'
    })
    
    // Move to offer
    await recruitmentService.moveApplicantStage(applicant.id, 'Offer')
    
    // Generate offer letter
    const offer = await recruitmentService.generateOfferLetter(applicant.id, offerTerms)
    
    // Verify offer letter created and e-signature request sent
    expect(offer).toBeDefined()
    const signatureRequest = await esignatureService.getRequestByDocument(offer.id)
    expect(signatureRequest.status).toBe('Sent')
  })
})
```

### End-to-End Testing

**Purpose:**
- Test complete user journeys through the UI
- Verify PWA functionality
- Test cross-browser compatibility

**Framework:** Playwright or Cypress

**Scope:**
- Critical user flows (login, attendance marking, leave application, payslip download)
- PWA installation and offline functionality
- Mobile responsiveness

### Performance Testing

**Purpose:**
- Verify system meets performance requirements
- Identify bottlenecks
- Validate scalability

**Tools:** k6 or Artillery

**Test Scenarios:**
- Payroll processing for 1,000 employees (target: < 60 seconds)
- Concurrent attendance marking by 500 employees (target: < 2 seconds response time)
- Face detection processing (target: < 3 seconds)
- API response times under load (target: < 2 seconds for 95th percentile)

### Security Testing

**Purpose:**
- Verify authentication and authorization
- Test encryption implementation
- Validate input sanitization

**Test Areas:**
- JWT token validation and expiry
- Role-based access control enforcement
- SQL injection prevention
- XSS prevention
- Bank details encryption/decryption
- Audit log integrity

### Test Data Management

**Strategy:**
- Use factories and builders for test data creation
- Seed database with realistic test data for integration tests
- Clean up test data after each test run
- Use separate test database instance

**Example Test Data Factory:**
```typescript
class EmployeeFactory {
  static create(overrides?: Partial<Employee>): Employee {
    return {
      id: uuid(),
      employeeId: `EMP${Date.now()}`,
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      dateOfBirth: faker.date.birthdate({ min: 22, max: 60, mode: 'age' }),
      gender: faker.helpers.arrayElement(['Male', 'Female', 'Other']),
      contactNumber: faker.phone.number(),
      email: faker.internet.email(),
      departmentId: uuid(),
      designationId: uuid(),
      employmentType: 'Full-Time',
      status: 'Active',
      ...overrides
    }
  }
}
```

### Continuous Integration

**CI Pipeline:**
1. Lint code (ESLint)
2. Run unit tests
3. Run property-based tests
4. Run integration tests
5. Generate coverage report
6. Run security scans (npm audit, Snyk)
7. Build application
8. Deploy to staging environment
9. Run E2E tests against staging

**Quality Gates:**
- All tests must pass
- Code coverage ≥ 80%
- No high-severity security vulnerabilities
- No linting errors

---

*End of Design Document*

