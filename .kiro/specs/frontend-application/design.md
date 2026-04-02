# Design Document: Frontend Application

## Overview

The Employee Management System (EMS) frontend is a Progressive Web App (PWA) built with React 19.2, TypeScript 5.9, and Vite 6.0. It provides a comprehensive, role-based user interface for managing the complete employee lifecycle, from recruitment through separation. The application consumes the existing backend REST API and delivers a responsive, accessible, and performant experience across desktop and mobile devices.

### Key Design Goals

1. **Progressive Enhancement**: Core functionality works offline with service worker caching
2. **Role-Based Access**: Dynamic UI adaptation based on user permissions (Super Admin, HR Manager, Department Manager, Finance, Employee, IT Admin)
3. **Performance**: Sub-3-second Time to Interactive (TTI), code splitting, lazy loading
4. **Accessibility**: WCAG 2.1 AA compliance with keyboard navigation and screen reader support
5. **Developer Experience**: Type-safe codebase, comprehensive testing, clear separation of concerns

### Technology Stack

- **Framework**: React 19.2 with TypeScript 5.9
- **Build Tool**: Vite 6.0 with hot module replacement
- **State Management**: Zustand 5.0 with persist middleware
- **Routing**: React Router 7.0 with lazy loading
- **UI Components**: shadcn/ui (Radix UI primitives) + Tailwind CSS 4.1
- **PWA**: vite-plugin-pwa 0.20+ with Workbox
- **Testing**: Vitest 2.0 for unit and component tests
- **API Client**: Axios with interceptors for auth and error handling
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React 0.577+: Frontend Application

## Overview

The Employee Management System (EMS) frontend is a Progressive Web App (PWA) built with React 19.2, TypeScript 5.9, and Vite 6.0. It provides a comprehensive user interface for managing the complete employee lifecycle across all user roles. The application consumes the existing backend API and implements a modern, responsive, accessible interface with offline capabilities.

### Key Design Goals

1. **Progressive Enhancement**: Core functionality works offline with service worker caching
2. **Role-Based Access**: Dynamic UI rendering based on user permissions
3. **Performance**: Code splitting, lazy loading, and optimized bundle sizes
4. **Accessibility**: WCAG 2.1 AA compliance with keyboard navigation and screen reader support
5. **Developer Experience**: Type-safe API integration, centralized state management, and comprehensive testing
6. **Responsive Design**: Seamless experience across mobile, tablet, and desktop devices

### Technology Stack

- **Framework**: React 19.2 with TypeScript 5.9
- **Build Tool**: Vite 6.0 with hot module replacement
- **Routing**: React Router 7.0 with lazy loading
- **State Management**: Zustand 5.0 with persist middleware
- **UI Components**: shadcn/ui (Radix UI primitives) with Tailwind CSS 4.1
- **PWA**: vite-plugin-pwa 0.20+ with Workbox
- **Testing**: Vitest 2.0 for unit and component tests
- **Icons**: Lucide React 0.577+
- **HTTP Client**: Axios with interceptors for auth and error handling

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser / PWA Shell                      │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Service    │  │   IndexedDB  │  │  LocalStorage│     │
│  │   Worker     │  │   (Cache)    │  │   (State)    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
├─────────────────────────────────────────────────────────────┤
│                    React Application                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Router (React Router 7.0)                │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐    │  │
│  │  │  Public    │  │ Protected  │  │   Error    │    │  │
│  │  │  Routes    │  │  Routes    │  │  Boundary  │    │  │
│  │  └────────────┘  └────────────┘  └────────────┘    │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Page Components (Lazy Loaded)               │  │
│  │  Dashboard | Employees | Attendance | Leave | ...    │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Feature Components                       │  │
│  │  Forms | Tables | Cards | Modals | Charts | ...     │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              UI Components (shadcn/ui)                │  │
│  │  Button | Input | Card | Dialog | Select | ...      │  │
│  └──────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                    State Management Layer                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Zustand Stores (Persist)                 │  │
│  │  Auth | UI | Employee | Attendance | Leave | ...    │  │
│  └──────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                    API Integration Layer                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              API Services (Axios)                     │  │
│  │  Auth | Employee | Attendance | Leave | Payroll ...  │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              HTTP Client (Interceptors)               │  │
│  │  Request: Auth Token | Response: Error Handling      │  │
│  └──────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                    Backend API (REST)                        │
│              http://localhost:3000/api/v1                    │
└─────────────────────────────────────────────────────────────┘
```

### Application Structure

```
frontend/
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # shadcn/ui base components
│   │   ├── layout/         # Layout components (Header, Sidebar, MainLayout)
│   │   ├── forms/          # Form components
│   │   ├── tables/         # Data table components
│   │   ├── charts/         # Chart components
│   │   ├── employees/      # Employee feature components
│   │   ├── attendance/     # Attendance feature components
│   │   ├── leave/          # Leave feature components
│   │   ├── payroll/        # Payroll feature components
│   │   └── ...             # Other feature components
│   ├── pages/              # Page components (route targets)
│   │   ├── Dashboard.tsx
│   │   ├── Login.tsx
│   │   ├── Employees.tsx
│   │   ├── EmployeeDetail.tsx
│   │   └── ...
│   ├── routes/             # Router configuration
│   │   ├── index.tsx       # Main router setup
│   │   ├── ProtectedRoute.tsx
│   │   └── routes.ts       # Route definitions
│   ├── store/              # Zustand stores
│   │   ├── authStore.ts
│   │   ├── uiStore.ts
│   │   ├── employeeStore.ts
│   │   └── ...
│   ├── services/           # API service layer
│   │   ├── api.ts          # Axios client setup
│   │   ├── authService.ts
│   │   ├── employeeService.ts
│   │   └── ...
│   ├── hooks/              # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useApi.ts
│   │   ├── useDebounce.ts
│   │   └── ...
│   ├── utils/              # Utility functions
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   ├── constants.ts
│   │   └── ...
│   ├── types/              # TypeScript types
│   │   ├── auth.ts
│   │   ├── employee.ts
│   │   ├── api.ts
│   │   └── ...
│   ├── lib/                # Library utilities
│   │   └── cn.ts           # Tailwind class merger
│   ├── App.tsx             # Root component
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles
├── public/                 # Static assets
│   ├── icons/              # PWA icons
│   └── manifest.json       # PWA manifest
├── vite.config.ts          # Vite configuration
├── tailwind.config.js      # Tailwind configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies
```

### Routing Architecture

The application uses React Router 7.0 with lazy loading for code splitting:

```typescript
// Route structure
/                           → Dashboard (protected)
/login                      → Login (public)
/employees                  → Employee List (protected)
/employees/:id              → Employee Detail (protected)
/employees/new              → Create Employee (protected, HR only)
/attendance                 → Attendance (protected)
/attendance/mark            → Mark Attendance (protected)
/leave                      → Leave Management (protected)
/leave/request              → Request Leave (protected)
/payroll                    → Payroll (protected, Finance only)
/recruitment                → Recruitment (protected, HR only)
/performance                → Performance (protected)
/training                   → Training (protected)
/benefits                   → Benefits (protected)
/separation                 → Separation (protected, HR only)
/profile                    → User Profile (protected)
/settings                   → Settings (protected)
/hierarchy                  → Org Chart (protected)
/reports                    → Reports (protected)
/404                        → Not Found
```

### State Management Architecture

Zustand stores are organized by feature domain with persist middleware for critical state:

```typescript
// Store structure
authStore          → User session, tokens, permissions (persisted)
uiStore            → Theme, sidebar state, notifications (persisted)
employeeStore      → Employee data, filters, pagination
attendanceStore    → Attendance records, status
leaveStore         → Leave requests, balances
payrollStore       → Payroll data, payslips
recruitmentStore   → Job postings, candidates
performanceStore   → Goals, reviews, feedback
trainingStore      → Programs, enrollments, certifications
benefitsStore      → Insurance, reimbursements, rewards
separationStore    → Separation records, settlements
hierarchyStore     → Org chart data
notificationStore  → Notifications, alerts
```

## Components and Interfaces

### Core Component Hierarchy

```
App
├── Router
│   ├── PublicRoutes
│   │   └── Login
│   └── ProtectedRoutes
│       ├── MainLayout
│       │   ├── Header
│       │   │   ├── Logo
│       │   │   ├── SearchBar
│       │   │   ├── NotificationBell
│       │   │   ├── ThemeToggle
│       │   │   └── UserMenu
│       │   ├── Sidebar
│       │   │   ├── Navigation
│       │   │   └── UserProfile
│       │   └── MainContent
│       │       └── [Page Components]
│       └── ErrorBoundary
```

### Key Component Interfaces

#### 1. Layout Components

**MainLayout**
```typescript
interface MainLayoutProps {
  children: React.ReactNode;
}

// Responsibilities:
// - Render header, sidebar, and main content area
// - Handle responsive layout (mobile/tablet/desktop)
// - Manage sidebar collapse state
```

**Header**
```typescript
interface HeaderProps {
  onMenuToggle: () => void;
  isSidebarOpen: boolean;
}

// Responsibilities:
// - Display logo and app title
// - Render search bar
// - Show notification bell with badge
// - Display theme toggle
// - Render user menu with profile and logout
```

**Sidebar**
```typescript
interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

// Responsibilities:
// - Render role-based navigation links
// - Highlight active route
// - Display user profile summary
// - Handle mobile overlay behavior
```

#### 2. Authentication Components

**LoginForm**
```typescript
interface LoginFormProps {
  onSuccess: () => void;
}

interface LoginFormData {
  email: string;
  password: string;
  mfaToken?: string;
}

// Responsibilities:
// - Validate email and password
// - Handle MFA token input
// - Call authService.login()
// - Display error messages
// - Redirect on success
```

**ProtectedRoute**
```typescript
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
}

// Responsibilities:
// - Check authentication status
// - Verify user roles
// - Redirect to login if unauthenticated
// - Show unauthorized message if insufficient permissions
```

#### 3. Data Table Components

**DataTable**
```typescript
interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  pagination?: PaginationConfig;
  sorting?: SortingConfig;
  filtering?: FilteringConfig;
  onRowClick?: (row: T) => void;
  loading?: boolean;
  emptyMessage?: string;
}

interface ColumnDef<T> {
  id: string;
  header: string;
  accessor: keyof T | ((row: T) => any);
  cell?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  filterType?: 'text' | 'select' | 'date' | 'number';
}

// Responsibilities:
// - Render table with headers and rows
// - Handle sorting (client-side or server-side)
// - Handle filtering (client-side or server-side)
// - Handle pagination
// - Display loading state
// - Handle empty state
```

#### 4. Form Components

**FormField**
```typescript
interface FormFieldProps {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'date' | 'select' | 'textarea';
  value: any;
  onChange: (value: any) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  options?: SelectOption[]; // for select type
}

// Responsibilities:
// - Render appropriate input component
// - Display label and error message
// - Handle value changes
// - Show required indicator
```

**EmployeeForm**
```typescript
interface EmployeeFormProps {
  employee?: Employee;
  onSubmit: (data: CreateEmployeeDTO | UpdateEmployeeDTO) => Promise<void>;
  onCancel: () => void;
}

// Responsibilities:
// - Render all employee fields
// - Validate form data
// - Handle file uploads (profile photo)
// - Call onSubmit with validated data
// - Display success/error messages
```

#### 5. File Upload Components

**FileUploader**
```typescript
interface FileUploaderProps {
  accept: string[];
  maxSize: number; // in bytes
  multiple?: boolean;
  onUpload: (files: File[]) => Promise<void>;
  onError: (error: string) => void;
}

// Responsibilities:
// - Validate file type and size
// - Support drag-and-drop
// - Show upload progress
// - Display uploaded files
// - Handle upload errors
```

#### 6. Chart Components

**DashboardChart**
```typescript
interface DashboardChartProps {
  type: 'line' | 'bar' | 'pie' | 'donut';
  data: ChartData;
  title: string;
  loading?: boolean;
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string;
  }[];
}

// Responsibilities:
// - Render chart using Chart.js or Recharts
// - Handle responsive sizing
// - Display loading state
// - Show tooltips on hover
// - Support accessibility (ARIA labels)
```

#### 7. Notification Components

**NotificationBell**
```typescript
interface NotificationBellProps {
  notifications: Notification[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}

// Responsibilities:
// - Display notification icon with badge
// - Show dropdown with notifications
// - Mark notifications as read
// - Navigate to notification details
```

**Toast**
```typescript
interface ToastProps {
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  duration?: number;
  onClose: () => void;
}

// Responsibilities:
// - Display toast notification
// - Auto-dismiss after duration
// - Support manual dismissal
// - Stack multiple toasts
```

### API Service Interfaces

#### HTTP Client Configuration

```typescript
// services/api.ts
interface ApiConfig {
  baseURL: string;
  timeout: number;
  withCredentials: boolean;
}

interface ApiError {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
}

// Axios instance with interceptors
// Request interceptor: Add auth token
// Response interceptor: Handle errors, refresh token
```

#### Service Layer Pattern

Each feature has a dedicated service file:

```typescript
// services/employeeService.ts
export const employeeService = {
  getAll: (filters?: EmployeeFilters) => Promise<PaginatedResponse<Employee>>,
  getById: (id: string) => Promise<Employee>,
  create: (data: CreateEmployeeDTO) => Promise<Employee>,
  update: (id: string, data: UpdateEmployeeDTO) => Promise<Employee>,
  delete: (id: string) => Promise<void>,
  uploadPhoto: (id: string, file: File) => Promise<string>,
  getEmergencyContacts: (id: string) => Promise<EmergencyContact[]>,
  addEmergencyContact: (id: string, data: CreateEmergencyContactDTO) => Promise<EmergencyContact>,
};

// Similar pattern for:
// - authService
// - attendanceService
// - leaveService
// - payrollService
// - recruitmentService
// - performanceService
// - trainingService
// - benefitsService
// - separationService
// - hierarchyService
// - notificationService
```

## Data Models

### Frontend Type Definitions

The frontend mirrors backend types with additional UI-specific types:

#### Authentication Types

```typescript
// types/auth.ts
export interface User {
  id: string;
  employeeId: string;
  email: string;
  role: UserRole;
  mfaEnabled: boolean;
  isActive: boolean;
  lastLoginAt?: Date;
}

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  HR_MANAGER = 'hr_manager',
  DEPARTMENT_MANAGER = 'department_manager',
  FINANCE = 'finance',
  EMPLOYEE = 'employee',
  IT_ADMIN = 'it_admin',
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
  mfaToken?: string;
}
```

#### Employee Types

```typescript
// types/employee.ts
export interface Employee {
  id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  department_id?: string;
  designation_id?: string;
  reporting_manager_id?: string;
  date_of_joining: string;
  employment_type: 'permanent' | 'contract' | 'temporary' | 'intern';
  status: 'active' | 'on_leave' | 'suspended' | 'resigned' | 'terminated';
  profile_photo_url?: string;
}

export interface EmployeeWithDetails extends Employee {
  department?: Department;
  designation?: Designation;
  reporting_manager?: Employee;
  emergency_contacts?: EmergencyContact[];
}

export interface EmployeeFilters {
  department_id?: string;
  designation_id?: string;
  status?: string;
  employment_type?: string;
  search?: string;
}
```

#### Attendance Types

```typescript
// types/attendance.ts
export interface AttendanceRecord {
  id: string;
  employee_id: string;
  date: string;
  check_in_time?: string;
  check_out_time?: string;
  working_hours?: number;
  status: 'present' | 'absent' | 'half_day' | 'on_leave';
  check_in_location?: GeoLocation;
  check_out_location?: GeoLocation;
  remarks?: string;
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export interface AttendanceStatus {
  isCheckedIn: boolean;
  checkInTime?: string;
  checkOutTime?: string;
  workingHours: number;
}
```

#### Leave Types

```typescript
// types/leave.ts
export interface LeaveRequest {
  id: string;
  employee_id: string;
  leave_type_id: string;
  from_date: string;
  to_date: string;
  days_count: number;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  approved_by?: string;
  approval_notes?: string;
}

export interface LeaveBalance {
  leave_type_id: string;
  leave_type_name: string;
  available_balance: number;
  used_balance: number;
  carry_forward_balance: number;
}

export interface LeaveCalendarEntry {
  employee_id: string;
  employee_name: string;
  from_date: string;
  to_date: string;
  leave_type: string;
  status: string;
}
```

#### Dashboard Types

```typescript
// types/dashboard.ts
export interface DashboardStats {
  employees: {
    total: number;
    active: number;
    onLeave: number;
    newHiresThisMonth: number;
  };
  attendance: {
    presentToday: number;
    absentToday: number;
    attendanceRate: number;
  };
  leaves: {
    pendingApprovals: number;
    employeesOnLeaveToday: number;
  };
  payroll: {
    processedThisMonth: number;
    pendingProcessing: number;
  };
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  route: string;
  roles: UserRole[];
}
```

#### UI State Types

```typescript
// types/ui.ts
export interface UIState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  notifications: Notification[];
  toasts: Toast[];
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

export interface Toast {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  duration: number;
}
```

#### API Response Types

```typescript
// types/api.ts
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
}
```

### State Management Data Flow

```
User Action (UI Event)
    ↓
Component Handler
    ↓
Store Action (Zustand)
    ↓
API Service Call
    ↓
HTTP Request (Axios)
    ↓
Backend API
    ↓
HTTP Response
    ↓
Store Update (Zustand)
    ↓
Component Re-render (React)
    ↓
UI Update
```

### Offline Data Strategy

```typescript
// Offline queue structure
interface OfflineAction {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  endpoint: string;
  data: any;
  timestamp: Date;
  retryCount: number;
}

// Service worker caching strategy
// Static assets: CacheFirst
// API GET requests: NetworkFirst with fallback to cache
// API POST/PUT/DELETE: Queue for later sync when online
```: Frontend Application

## Overview

The Employee Management System (EMS) frontend is a Progressive Web App (PWA) built with React 19.2, TypeScript 5.9, and Vite 6.0. It provides a comprehensive user interface for managing the complete employee lifecycle across all user roles (Super Admin, HR Manager, Department Manager, Finance/Payroll, Employee, IT Admin).

### Design Goals

1. **User Experience**: Intuitive, responsive interface that works seamlessly across desktop, tablet, and mobile devices
2. **Performance**: Fast initial load times, optimized bundle sizes, and smooth interactions
3. **Offline Capability**: Service worker-based caching for offline access to critical features
4. **Accessibility**: WCAG 2.1 AA compliant with keyboard navigation and screen reader support
5. **Maintainability**: Clean architecture with separation of concerns and reusable components
6. **Type Safety**: Comprehensive TypeScript coverage for compile-time error detection
7. **Testability**: Well-structured code with high test coverage using Vitest

### Technology Stack

- **Framework**: React 19.2 with TypeScript 5.9
- **Build Tool**: Vite 6.0 with hot module replacement
- **Routing**: React Router 7.0 with lazy loading
- **State Management**: Zustand 5.0 with persist middleware
- **UI Components**: shadcn/ui (Radix UI primitives) with Tailwind CSS 4.1
- **PWA**: vite-plugin-pwa 0.20+ with Workbox
- **Testing**: Vitest 2.0 for unit and component tests
- **Icons**: Lucide React 0.577+
- **Charts**: Recharts for data visualization
- **Maps**: Google Maps JavaScript API for geolocation features

## Architecture

### High-Level Architecture

The frontend follows a layered architecture pattern:

```
┌─────────────────────────────────────────────────────────────┐
│                     Presentation Layer                       │
│  (Pages, Components, Layouts, Forms, Tables)                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    State Management Layer                    │
│         (Zustand Stores with Persist Middleware)            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Service/API Layer                         │
│     (API Client, Service Functions, WebSocket Client)       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      Backend API                             │
│              (Express.js REST API + WebSocket)              │
└─────────────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
App
├── Router
│   ├── PublicRoutes
│   │   ├── Login
│   │   └── NotFound
│   └── ProtectedRoutes (requires authentication)
│       └── MainLayout
│           ├── Header (user menu, notifications, theme toggle)
│           ├── Sidebar (role-based navigation)
│           └── Main Content Area
│               ├── Dashboard (role-specific)
│               ├── Employees Module
│               ├── Attendance Module
│               ├── Leave Module
│               ├── Payroll Module
│               ├── Recruitment Module
│               ├── Performance Module
│               ├── Training Module
│               ├── Benefits Module
│               ├── Separation Module
│               ├── Hierarchy Module
│               └── Settings
```

### Routing Structure

The application uses React Router 7.0 with lazy loading for code splitting:

```typescript
/                           → Dashboard (role-specific redirect)
/login                      → Login Page
/dashboard                  → Dashboard
/employees                  → Employee List
/employees/:id              → Employee Detail
/employees/new              → Create Employee
/attendance                 → Attendance Management
/attendance/mark            → Mark Attendance
/leave                      → Leave Management
/leave/request              → Request Leave
/payroll                    → Payroll Management
/payroll/process            → Process Payroll
/recruitment                → Recruitment Dashboard
/recruitment/jobs           → Job Postings
/recruitment/candidates     → Candidate List
/performance                → Performance Management
/performance/goals          → Goal Management
/performance/reviews        → Performance Reviews
/training                   → Training Programs
/training/certifications    → Certifications
/benefits                   → Benefits Management
/separation                 → Separation Management
/hierarchy                  → Organization Chart
/settings                   → User Settings
/404                        → Not Found Page
```

### State Management Strategy

The application uses Zustand for state management with separate stores for each domain:

1. **authStore**: User authentication, session, roles, permissions
2. **uiStore**: Theme, sidebar state, modal state, toast notifications
3. **employeeStore**: Employee data, filters, pagination
4. **attendanceStore**: Attendance records, check-in/out status
5. **leaveStore**: Leave requests, balances, approvals
6. **payrollStore**: Payroll data, salary components
7. **recruitmentStore**: Job postings, candidates, interviews
8. **performanceStore**: Goals, reviews, feedback
9. **trainingStore**: Training programs, certifications
10. **benefitsStore**: Benefits, reimbursements, loans
11. **separationStore**: Separation records, checklists
12. **notificationStore**: Notifications, WebSocket connection

Each store follows this pattern:

```typescript
interface StoreState {
  // Data
  items: T[];
  currentItem: T | null;
  
  // UI State
  loading: boolean;
  error: string | null;
  
  // Pagination
  page: number;
  pageSize: number;
  total: number;
  
  // Actions
  fetchItems: () => Promise<void>;
  fetchItem: (id: string) => Promise<void>;
  createItem: (data: Partial<T>) => Promise<void>;
  updateItem: (id: string, data: Partial<T>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  setPage: (page: number) => void;
  reset: () => void;
}
```

## Components and Interfaces

### Core UI Components (shadcn/ui)

The application uses shadcn/ui components built on Radix UI primitives:

- **Button**: Primary, secondary, outline, ghost, destructive variants
- **Input**: Text, email, password, number, date inputs
- **Label**: Form field labels with accessibility support
- **Card**: Container for grouped content
- **Badge**: Status indicators and tags
- **Dialog**: Modal dialogs for forms and confirmations
- **DropdownMenu**: Context menus and action menus
- **Select**: Dropdown select inputs
- **Checkbox**: Checkbox inputs
- **RadioGroup**: Radio button groups
- **Switch**: Toggle switches
- **Tabs**: Tabbed interfaces
- **Table**: Data tables with sorting and pagination
- **Toast**: Notification toasts
- **Tooltip**: Hover tooltips
- **Separator**: Visual dividers
- **Avatar**: User profile images
- **Progress**: Progress bars and indicators
- **Skeleton**: Loading skeletons

### Layout Components

#### MainLayout
```typescript
interface MainLayoutProps {
  children: React.ReactNode;
}

// Renders: Header + Sidebar + Main Content Area
// Handles responsive behavior (mobile hamburger menu)
// Manages sidebar collapse state
```

#### Header
```typescript
interface HeaderProps {
  user: User;
  notifications: Notification[];
  onLogout: () => void;
}

// Displays: Logo, breadcrumbs, search, notifications, user menu, theme toggle
// Handles: Notification dropdown, user profile menu
```

#### Sidebar
```typescript
interface SidebarProps {
  role: UserRole;
  collapsed: boolean;
  onToggle: () => void;
}

// Displays: Role-based navigation links with icons
// Handles: Active link highlighting, collapse/expand
```

### Feature Components

#### Data Table Component
```typescript
interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  loading?: boolean;
  pagination?: PaginationState;
  sorting?: SortingState;
  filtering?: FilteringState;
  onPaginationChange?: (pagination: PaginationState) => void;
  onSortingChange?: (sorting: SortingState) => void;
  onFilteringChange?: (filtering: FilteringState) => void;
  onRowClick?: (row: T) => void;
}

// Features:
// - Column sorting (single and multi-column)
// - Column filtering (text, select, date range)
// - Pagination with page size selector
// - Row selection (single and multi-select)
// - Responsive design (card layout on mobile)
// - Export functionality (CSV, Excel, PDF)
// - Loading states and empty states
```

#### File Uploader Component
```typescript
interface FileUploaderProps {
  accept: string[];
  maxSize: number;
  maxFiles: number;
  onUpload: (files: File[]) => Promise<void>;
  onError: (error: string) => void;
}

// Features:
// - Drag and drop support
// - File type validation
// - File size validation
// - Upload progress indicator
// - Multiple file support
// - Preview for images
// - Error handling and display
```

#### Form Components
```typescript
interface FormFieldProps {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'date' | 'select' | 'textarea';
  required?: boolean;
  validation?: ValidationRule[];
  options?: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
}

// Features:
// - Real-time validation on blur
// - Error message display
// - Required field indicators
// - Accessible labels and ARIA attributes
// - Consistent styling across form types
```

### Page Components

Each module has dedicated page components:

#### Dashboard Page
- Role-specific widgets and metrics
- Quick action buttons
- Recent activity feed
- Charts and visualizations
- Notification panel

#### Employee List Page
- Data table with employee records
- Search and filter controls
- Bulk actions (import, export)
- Create employee button
- Column customization

#### Employee Detail Page
- Tabbed interface (Personal, Employment, Documents, History)
- Edit mode toggle
- Document upload section
- Activity timeline
- Related records (attendance, leave, payroll)

#### Attendance Page
- Check-in/check-out interface
- Current status display
- Calendar view of attendance history
- Attendance statistics
- Regularization request form

#### Leave Management Page
- Leave request form
- Leave balance cards
- Leave history table
- Leave calendar
- Approval queue (for managers)

#### Payroll Page
- Payroll processing interface
- Salary component breakdown
- Payslip generation
- Payroll history
- Export functionality

## Data Models

### Frontend Type Definitions

The frontend mirrors backend types with additional UI-specific properties:

```typescript
// Auth Types
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  permissions: Permission[];
  mfaEnabled: boolean;
  profileImage?: string;
}

type UserRole = 'super_admin' | 'hr_manager' | 'department_manager' | 'finance' | 'employee' | 'it_admin';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Employee Types
interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  status: EmployeeStatus;
  joinDate: string;
  profileImage?: string;
  managerId?: string;
}

type EmployeeStatus = 'active' | 'inactive' | 'on_leave' | 'terminated';

// Attendance Types
interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: AttendanceStatus;
  mode: AttendanceMode;
  location?: GeoLocation;
  workHours?: number;
}

type AttendanceStatus = 'present' | 'absent' | 'late' | 'half_day' | 'on_leave';
type AttendanceMode = 'web' | 'gps' | 'biometric';

interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  address?: string;
}

// Leave Types
interface LeaveRequest {
  id: string;
  employeeId: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: LeaveStatus;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
}

type LeaveType = 'casual' | 'sick' | 'earned' | 'maternity' | 'paternity' | 'unpaid';
type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

interface LeaveBalance {
  leaveType: LeaveType;
  total: number;
  used: number;
  remaining: number;
}

// Payroll Types
interface PayrollRecord {
  id: string;
  employeeId: string;
  month: string;
  year: number;
  basicSalary: number;
  allowances: SalaryComponent[];
  deductions: SalaryComponent[];
  grossSalary: number;
  netSalary: number;
  status: PayrollStatus;
  paymentDate?: string;
}

interface SalaryComponent {
  name: string;
  amount: number;
  type: 'allowance' | 'deduction';
}

type PayrollStatus = 'draft' | 'processed' | 'paid';

// Recruitment Types
interface JobPosting {
  id: string;
  title: string;
  department: string;
  location: string;
  type: JobType;
  description: string;
  requirements: string[];
  status: JobStatus;
  postedDate: string;
  closingDate?: string;
  applicantCount: number;
}

type JobType = 'full_time' | 'part_time' | 'contract' | 'internship';
type JobStatus = 'open' | 'closed' | 'on_hold';

interface Candidate {
  id: string;
  jobId: string;
  name: string;
  email: string;
  phone: string;
  resumeUrl: string;
  status: CandidateStatus;
  appliedDate: string;
  currentStage: HiringStage;
}

type CandidateStatus = 'applied' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected';
type HiringStage = 'application' | 'phone_screen' | 'technical' | 'hr_round' | 'final';

// Performance Types
interface Goal {
  id: string;
  employeeId: string;
  title: string;
  description: string;
  type: GoalType;
  targetDate: string;
  progress: number;
  status: GoalStatus;
}

type GoalType = 'okr' | 'kpi' | 'personal';
type GoalStatus = 'not_started' | 'in_progress' | 'completed' | 'cancelled';

interface PerformanceReview {
  id: string;
  employeeId: string;
  reviewerId: string;
  period: string;
  rating: number;
  feedback: string;
  status: ReviewStatus;
  completedDate?: string;
}

type ReviewStatus = 'pending' | 'in_progress' | 'completed';

// Training Types
interface TrainingProgram {
  id: string;
  title: string;
  description: string;
  duration: number;
  instructor: string;
  startDate: string;
  endDate: string;
  capacity: number;
  enrolledCount: number;
  status: TrainingStatus;
}

type TrainingStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

interface Certification {
  id: string;
  employeeId: string;
  name: string;
  issuingOrganization: string;
  issueDate: string;
  expiryDate?: string;
  documentUrl?: string;
  status: CertificationStatus;
}

type CertificationStatus = 'active' | 'expired' | 'pending_renewal';

// Benefits Types
interface Benefit {
  id: string;
  employeeId: string;
  type: BenefitType;
  name: string;
  provider: string;
  startDate: string;
  endDate?: string;
  status: BenefitStatus;
}

type BenefitType = 'health_insurance' | 'pf' | 'gratuity' | 'other';
type BenefitStatus = 'active' | 'inactive' | 'pending';

interface Reimbursement {
  id: string;
  employeeId: string;
  category: ReimbursementCategory;
  amount: number;
  description: string;
  receiptUrl: string;
  status: ReimbursementStatus;
  submittedDate: string;
  approvedDate?: string;
}

type ReimbursementCategory = 'travel' | 'medical' | 'food' | 'education' | 'other';
type ReimbursementStatus = 'pending' | 'approved' | 'rejected' | 'paid';

// Separation Types
interface SeparationRecord {
  id: string;
  employeeId: string;
  type: SeparationType;
  initiatedDate: string;
  lastWorkingDate: string;
  reason: string;
  status: SeparationStatus;
  checklistItems: ChecklistItem[];
  finalSettlement?: FinalSettlement;
}

type SeparationType = 'resignation' | 'termination' | 'retirement' | 'end_of_contract';
type SeparationStatus = 'initiated' | 'in_progress' | 'completed';

interface ChecklistItem {
  id: string;
  task: string;
  completed: boolean;
  completedBy?: string;
  completedDate?: string;
}

interface FinalSettlement {
  basicSalary: number;
  pendingLeave: number;
  gratuity: number;
  deductions: number;
  netAmount: number;
}

// Notification Types
interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

type NotificationType = 'info' | 'success' | 'warning' | 'error';

// API Response Types
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}
```


## API Integration Layer Design

### API Client Configuration

The application uses a centralized API client built with the Fetch API:

```typescript
// services/api.ts
interface ApiClientConfig {
  baseURL: string;
  timeout: number;
  retries: number;
  retryDelay: number;
}

class ApiClient {
  private baseURL: string;
  private timeout: number;
  private retries: number;
  private retryDelay: number;

  constructor(config: ApiClientConfig) {
    this.baseURL = config.baseURL;
    this.timeout = config.timeout;
    this.retries = config.retries;
    this.retryDelay = config.retryDelay;
  }

  // HTTP methods: get, post, put, patch, delete
  // Automatic token injection from cookies
  // Request/response interceptors
  // Error handling and retry logic
  // Request cancellation support
}
```

### Service Layer Organization

Each feature module has a dedicated service file:

```typescript
// services/authService.ts
export const authService = {
  login: (email: string, password: string) => Promise<User>,
  logout: () => Promise<void>,
  verifyMFA: (code: string) => Promise<void>,
  refreshSession: () => Promise<User>,
  getCurrentUser: () => Promise<User>,
};

// services/employeeService.ts
export const employeeService = {
  getEmployees: (params: QueryParams) => Promise<PaginatedResponse<Employee>>,
  getEmployee: (id: string) => Promise<Employee>,
  createEmployee: (data: CreateEmployeeDto) => Promise<Employee>,
  updateEmployee: (id: string, data: UpdateEmployeeDto) => Promise<Employee>,
  deleteEmployee: (id: string) => Promise<void>,
  importEmployees: (file: File) => Promise<ImportResult>,
  exportEmployees: (format: ExportFormat) => Promise<Blob>,
};

// services/attendanceService.ts
export const attendanceService = {
  markAttendance: (data: MarkAttendanceDto) => Promise<AttendanceRecord>,
  getAttendance: (params: QueryParams) => Promise<PaginatedResponse<AttendanceRecord>>,
  getAttendanceStats: (employeeId: string, month: string) => Promise<AttendanceStats>,
  requestRegularization: (data: RegularizationDto) => Promise<void>,
};

// services/leaveService.ts
export const leaveService = {
  requestLeave: (data: LeaveRequestDto) => Promise<LeaveRequest>,
  getLeaveRequests: (params: QueryParams) => Promise<PaginatedResponse<LeaveRequest>>,
  getLeaveBalance: (employeeId: string) => Promise<LeaveBalance[]>,
  approveLeave: (id: string) => Promise<void>,
  rejectLeave: (id: string, reason: string) => Promise<void>,
  cancelLeave: (id: string) => Promise<void>,
};

// services/payrollService.ts
export const payrollService = {
  getPayrollRecords: (params: QueryParams) => Promise<PaginatedResponse<PayrollRecord>>,
  processPayroll: (month: string, year: number, employeeIds: string[]) => Promise<void>,
  generatePayslip: (id: string) => Promise<Blob>,
  updateSalaryComponent: (id: string, data: SalaryComponentDto) => Promise<void>,
};

// Similar services for: recruitment, performance, training, benefits, separation, hierarchy, notifications
```

### WebSocket Integration

Real-time updates are handled via WebSocket connection:

```typescript
// services/websocketService.ts
class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private listeners: Map<string, Set<Function>> = new Map();

  connect(url: string): void {
    // Establish WebSocket connection
    // Handle connection events (open, close, error, message)
    // Implement automatic reconnection with exponential backoff
  }

  disconnect(): void {
    // Close WebSocket connection
    // Clear listeners
  }

  subscribe(event: string, callback: Function): () => void {
    // Subscribe to specific event types
    // Return unsubscribe function
  }

  send(event: string, data: any): void {
    // Send message to server
  }
}

// Event types:
// - notification:new - New notification received
// - attendance:updated - Attendance record updated
// - leave:status_changed - Leave request status changed
// - payroll:processed - Payroll processing completed
// - dashboard:refresh - Dashboard data needs refresh
```

### Error Handling Strategy

```typescript
// utils/errorHandler.ts
interface ApiError {
  status: number;
  message: string;
  code?: string;
  details?: any;
}

class ErrorHandler {
  handle(error: ApiError): void {
    switch (error.status) {
      case 400:
        // Bad request - show validation errors
        this.showValidationErrors(error.details);
        break;
      case 401:
        // Unauthorized - redirect to login
        this.redirectToLogin();
        break;
      case 403:
        // Forbidden - show permission error
        this.showPermissionError();
        break;
      case 404:
        // Not found - show not found message
        this.showNotFoundError();
        break;
      case 500:
        // Server error - show generic error
        this.showServerError();
        break;
      default:
        // Unknown error
        this.showGenericError(error.message);
    }
  }

  // Error display methods using toast notifications
}
```

## Authentication and Authorization Flow

### Login Flow

```
1. User enters email and password
2. Frontend validates input
3. Frontend calls POST /api/v1/auth/login
4. Backend validates credentials
5. If MFA enabled:
   a. Backend returns { mfaRequired: true }
   b. Frontend shows MFA input
   c. User enters TOTP code
   d. Frontend calls POST /api/v1/auth/verify-mfa
6. Backend sets httpOnly session cookie
7. Backend returns user data
8. Frontend stores user in authStore
9. Frontend redirects to dashboard
```

### Session Management

```typescript
// Session is managed via httpOnly cookies (secure, not accessible to JavaScript)
// Frontend checks authentication status on app load
// Automatic session refresh before expiry
// Session timeout handling with warning dialog

interface SessionConfig {
  timeout: number; // 30 minutes
  warningTime: number; // 5 minutes before timeout
  refreshInterval: number; // 25 minutes
}

// Session refresh logic in authStore
const refreshSession = async () => {
  try {
    const user = await authService.refreshSession();
    set({ user, isAuthenticated: true });
  } catch (error) {
    // Session expired, redirect to login
    set({ user: null, isAuthenticated: false });
    router.navigate('/login');
  }
};
```

### Role-Based Access Control

```typescript
// utils/permissions.ts
interface Permission {
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete';
}

const rolePermissions: Record<UserRole, Permission[]> = {
  super_admin: [
    // All permissions
    { resource: '*', action: 'create' },
    { resource: '*', action: 'read' },
    { resource: '*', action: 'update' },
    { resource: '*', action: 'delete' },
  ],
  hr_manager: [
    { resource: 'employees', action: 'create' },
    { resource: 'employees', action: 'read' },
    { resource: 'employees', action: 'update' },
    { resource: 'leave', action: 'read' },
    { resource: 'leave', action: 'update' },
    { resource: 'payroll', action: 'read' },
    { resource: 'recruitment', action: 'create' },
    { resource: 'recruitment', action: 'read' },
    { resource: 'recruitment', action: 'update' },
    // ... more permissions
  ],
  department_manager: [
    { resource: 'employees', action: 'read' },
    { resource: 'attendance', action: 'read' },
    { resource: 'leave', action: 'read' },
    { resource: 'leave', action: 'update' },
    { resource: 'performance', action: 'create' },
    { resource: 'performance', action: 'read' },
    { resource: 'performance', action: 'update' },
    // ... more permissions
  ],
  finance: [
    { resource: 'payroll', action: 'create' },
    { resource: 'payroll', action: 'read' },
    { resource: 'payroll', action: 'update' },
    { resource: 'benefits', action: 'read' },
    { resource: 'benefits', action: 'update' },
    // ... more permissions
  ],
  employee: [
    { resource: 'attendance', action: 'create' },
    { resource: 'attendance', action: 'read' },
    { resource: 'leave', action: 'create' },
    { resource: 'leave', action: 'read' },
    { resource: 'documents', action: 'read' },
    { resource: 'payroll', action: 'read' },
    // ... more permissions
  ],
  it_admin: [
    { resource: 'settings', action: 'read' },
    { resource: 'settings', action: 'update' },
    { resource: 'users', action: 'create' },
    { resource: 'users', action: 'read' },
    { resource: 'users', action: 'update' },
    // ... more permissions
  ],
};

export const hasPermission = (
  role: UserRole,
  resource: string,
  action: 'create' | 'read' | 'update' | 'delete'
): boolean => {
  const permissions = rolePermissions[role];
  return permissions.some(
    (p) =>
      (p.resource === '*' || p.resource === resource) &&
      (p.action === action || p.action === '*')
  );
};

// Usage in components
const canEditEmployee = hasPermission(user.role, 'employees', 'update');
```

### Protected Route Component

```typescript
// routes/ProtectedRoute.tsx
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: Permission;
  requiredRole?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermission,
  requiredRole,
}) => {
  const { user, isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login, preserve intended destination
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && !requiredRole.includes(user.role)) {
    // User doesn't have required role
    return <Navigate to="/unauthorized" replace />;
  }

  if (requiredPermission) {
    const hasAccess = hasPermission(
      user.role,
      requiredPermission.resource,
      requiredPermission.action
    );
    if (!hasAccess) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
};
```

## PWA Configuration

### Service Worker Strategy

The application uses Workbox for service worker management:

```typescript
// vite.config.ts PWA configuration
VitePWA({
  registerType: 'autoUpdate',
  includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
  manifest: {
    name: 'Employee Management System',
    short_name: 'EMS',
    description: 'Comprehensive employee lifecycle management',
    theme_color: '#3b82f6',
    background_color: '#ffffff',
    display: 'standalone',
    orientation: 'portrait',
    scope: '/',
    start_url: '/',
    icons: [
      {
        src: 'pwa-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: 'pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: 'pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
  },
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts-cache',
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
          },
          cacheableResponse: {
            statuses: [0, 200],
          },
        },
      },
      {
        urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'gstatic-fonts-cache',
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
          },
          cacheableResponse: {
            statuses: [0, 200],
          },
        },
      },
      {
        urlPattern: /\/api\/v1\/.*/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'api-cache',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 60 * 5, // 5 minutes
          },
          cacheableResponse: {
            statuses: [0, 200],
          },
          networkTimeoutSeconds: 10,
        },
      },
      {
        urlPattern: /\.(png|jpg|jpeg|svg|gif)$/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'image-cache',
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
          },
        },
      },
    ],
  },
})
```

### Offline Functionality

```typescript
// hooks/useOnlineStatus.ts
export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};

// Offline indicator component
const OfflineIndicator = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg">
      <WifiOff className="inline mr-2" />
      You are offline. Some features may be unavailable.
    </div>
  );
};

// Offline queue for write operations
class OfflineQueue {
  private queue: QueuedRequest[] = [];
  private storageKey = 'offline_queue';

  constructor() {
    this.loadQueue();
    this.setupOnlineListener();
  }

  add(request: QueuedRequest): void {
    this.queue.push(request);
    this.saveQueue();
  }

  private async processQueue(): Promise<void> {
    while (this.queue.length > 0) {
      const request = this.queue[0];
      try {
        await this.executeRequest(request);
        this.queue.shift();
        this.saveQueue();
      } catch (error) {
        // If request fails, stop processing
        break;
      }
    }
  }

  private setupOnlineListener(): void {
    window.addEventListener('online', () => {
      this.processQueue();
    });
  }
}
```

### Update Notification

```typescript
// components/UpdateNotification.tsx
const UpdateNotification = () => {
  const [showUpdate, setShowUpdate] = useState(false);

  useEffect(() => {
    const updateAvailable = (registration: ServiceWorkerRegistration) => {
      setShowUpdate(true);
    };

    // Listen for service worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker?.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              updateAvailable(registration);
            }
          });
        });
      });
    }
  }, []);

  const handleUpdate = () => {
    window.location.reload();
  };

  if (!showUpdate) return null;

  return (
    <div className="fixed top-4 right-4 bg-blue-500 text-white px-4 py-3 rounded-lg shadow-lg">
      <p className="mb-2">A new version is available!</p>
      <button
        onClick={handleUpdate}
        className="bg-white text-blue-500 px-4 py-1 rounded"
      >
        Update Now
      </button>
    </div>
  );
};
```

## Form Handling and Validation

### Form Validation Strategy

The application uses a custom validation system with Zod schemas:

```typescript
// utils/validation.ts
import { z } from 'zod';

// Common validation schemas
export const emailSchema = z.string().email('Invalid email address');
export const phoneSchema = z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number');
export const dateSchema = z.string().refine((date) => !isNaN(Date.parse(date)), {
  message: 'Invalid date',
});

// Employee form schema
export const employeeSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: emailSchema,
  phone: phoneSchema,
  department: z.string().min(1, 'Department is required'),
  position: z.string().min(1, 'Position is required'),
  joinDate: dateSchema,
  salary: z.number().positive('Salary must be positive'),
});

// Leave request schema
export const leaveRequestSchema = z.object({
  leaveType: z.enum(['casual', 'sick', 'earned', 'maternity', 'paternity', 'unpaid']),
  startDate: dateSchema,
  endDate: dateSchema,
  reason: z.string().min(10, 'Reason must be at least 10 characters'),
}).refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
  message: 'End date must be after start date',
  path: ['endDate'],
});

// Custom hook for form validation
export const useFormValidation = <T extends z.ZodType>(schema: T) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (data: z.infer<T>): boolean => {
    try {
      schema.parse(data);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path) {
            fieldErrors[err.path.join('.')] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const validateField = (name: string, value: any): void => {
    try {
      const fieldSchema = schema.shape[name];
      if (fieldSchema) {
        fieldSchema.parse(value);
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors((prev) => ({
          ...prev,
          [name]: error.errors[0].message,
        }));
      }
    }
  };

  const clearErrors = () => setErrors({});

  return { errors, validate, validateField, clearErrors };
};
```

### Form Component Pattern

```typescript
// components/forms/EmployeeForm.tsx
interface EmployeeFormProps {
  initialData?: Partial<Employee>;
  onSubmit: (data: CreateEmployeeDto) => Promise<void>;
  onCancel: () => void;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<CreateEmployeeDto>(
    initialData || getDefaultFormData()
  );
  const [submitting, setSubmitting] = useState(false);
  const { errors, validate, validateField } = useFormValidation(employeeSchema);

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (name: string) => {
    validateField(name, formData[name]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate(formData)) {
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      // Error handled by error handler
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField
        label="First Name"
        name="firstName"
        value={formData.firstName}
        onChange={(value) => handleChange('firstName', value)}
        onBlur={() => handleBlur('firstName')}
        error={errors.firstName}
        required
      />
      
      <FormField
        label="Last Name"
        name="lastName"
        value={formData.lastName}
        onChange={(value) => handleChange('lastName', value)}
        onBlur={() => handleBlur('lastName')}
        error={errors.lastName}
        required
      />

      {/* More form fields */}

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </form>
  );
};
```

## File Upload and Download Design

### File Upload Component

```typescript
// components/FileUploader.tsx
interface FileUploaderProps {
  accept: string[];
  maxSize: number; // in bytes
  maxFiles: number;
  onUpload: (files: File[]) => Promise<void>;
  onError: (error: string) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  accept,
  maxSize,
  maxFiles,
  onUpload,
  onError,
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [dragActive, setDragActive] = useState(false);

  const validateFile = (file: File): boolean => {
    // Check file type
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!accept.includes(`.${fileExtension}`)) {
      onError(`File type .${fileExtension} is not allowed`);
      return false;
    }

    // Check file size
    if (file.size > maxSize) {
      onError(`File size exceeds ${formatBytes(maxSize)}`);
      return false;
    }

    return true;
  };

  const handleFiles = (newFiles: FileList) => {
    const validFiles: File[] = [];
    
    for (let i = 0; i < newFiles.length; i++) {
      const file = newFiles[i];
      if (validateFile(file)) {
        validFiles.push(file);
      }
    }

    if (files.length + validFiles.length > maxFiles) {
      onError(`Maximum ${maxFiles} files allowed`);
      return;
    }

    setFiles((prev) => [...prev, ...validFiles]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    try {
      await onUpload(files);
      setFiles([]);
      setProgress({});
    } catch (error) {
      // Error handled by parent
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center ${
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          Drag and drop files here, or click to select
        </p>
        <input
          type="file"
          multiple={maxFiles > 1}
          accept={accept.join(',')}
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="hidden"
          id="file-input"
        />
        <label
          htmlFor="file-input"
          className="mt-4 inline-block cursor-pointer text-blue-500 hover:text-blue-600"
        >
          Select Files
        </label>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex items-center space-x-2">
                <FileIcon className="h-5 w-5 text-gray-400" />
                <span className="text-sm">{file.name}</span>
                <span className="text-xs text-gray-500">({formatBytes(file.size)})</span>
              </div>
              <button
                onClick={() => setFiles((prev) => prev.filter((_, i) => i !== index))}
                className="text-red-500 hover:text-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {files.length > 0 && (
        <Button onClick={handleUpload} disabled={uploading} className="w-full">
          {uploading ? 'Uploading...' : `Upload ${files.length} file(s)`}
        </Button>
      )}
    </div>
  );
};
```

### File Download Handling

```typescript
// utils/fileDownload.ts
export const downloadFile = async (url: string, filename: string): Promise<void> => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    throw new Error('Failed to download file');
  }
};

export const downloadBlob = (blob: Blob, filename: string): void => {
  const blobUrl = window.URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  window.URL.revokeObjectURL(blobUrl);
};

// Usage in components
const handleDownloadPayslip = async (payrollId: string) => {
  try {
    const blob = await payrollService.generatePayslip(payrollId);
    downloadBlob(blob, `payslip-${payrollId}.pdf`);
  } catch (error) {
    toast.error('Failed to download payslip');
  }
};
```



## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser / PWA Shell                      │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Service    │  │   IndexedDB  │  │  LocalStorage│      │
│  │   Worker     │  │   (Cache)    │  │  (Settings)  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
├─────────────────────────────────────────────────────────────┤
│                    React Application                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Presentation Layer                      │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐          │   │
│  │  │  Pages   │  │Components│  │  Layouts │          │   │
│  │  └──────────┘  └──────────┘  └──────────┘          │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Application Layer                       │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐          │   │
│  │  │  Hooks   │  │  Stores  │  │  Router  │          │   │
│  │  └──────────┘  └──────────┘  └──────────┘          │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Integration Layer                       │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐          │   │
│  │  │   API    │  │WebSocket │  │Validators│          │   │
│  │  │ Services │  │  Client  │  │          │          │   │
│  │  └──────────┘  └──────────┘  └──────────┘          │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/WS
┌─────────────────────────────────────────────────────────────┐
│              Backend API (Express + PostgreSQL)              │
└─────────────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
App
├── ServiceWorkerProvider (PWA lifecycle)
├── ThemeProvider (light/dark mode)
├── AuthProvider (authentication context)
└── Router
    ├── PublicRoutes
    │   ├── Login
    │   ├── ForgotPassword
    │   └── MFAVerification
    └── ProtectedRoutes (role-based)
        └── MainLayout
            ├── Header
            │   ├── Logo
            │   ├── SearchBar
            │   ├── NotificationBell
            │   ├── ThemeToggle
            │   └── UserMenu
            ├── Sidebar
            │   ├── NavigationMenu (role-based)
            │   └── QuickActions
            └── MainContent
                ├── Breadcrumbs
                └── PageContent (lazy loaded)
                    ├── Dashboard
                    ├── Employees
                    ├── Attendance
                    ├── Leave
                    ├── Payroll
                    ├── Recruitment
                    ├── Performance
                    ├── Training
                    ├── Benefits
                    ├── Separation
                    └── Settings
```

### Routing Structure

```typescript
// Route configuration with lazy loading and role guards
const routes = [
  // Public routes
  { path: '/login', component: lazy(() => import('./pages/Login')) },
  { path: '/mfa', component: lazy(() => import('./pages/MFAVerification')) },
  
  // Protected routes with role-based access
  {
    path: '/',
    component: MainLayout,
    guard: AuthGuard,
    children: [
      { path: 'dashboard', component: lazy(() => import('./pages/Dashboard')), roles: ['*'] },
      { path: 'employees', component: lazy(() => import('./pages/Employees')), roles: ['super_admin', 'hr_manager'] },
      { path: 'employees/:id', component: lazy(() => import('./pages/EmployeeDetail')), roles: ['super_admin', 'hr_manager', 'department_manager'] },
      { path: 'attendance', component: lazy(() => import('./pages/Attendance')), roles: ['*'] },
      { path: 'leave', component: lazy(() => import('./pages/Leave')), roles: ['*'] },
      { path: 'payroll', component: lazy(() => import('./pages/Payroll')), roles: ['super_admin', 'hr_manager', 'finance'] },
      { path: 'recruitment', component: lazy(() => import('./pages/Recruitment')), roles: ['super_admin', 'hr_manager'] },
      { path: 'performance', component: lazy(() => import('./pages/Performance')), roles: ['super_admin', 'hr_manager', 'department_manager'] },
      { path: 'training', component: lazy(() => import('./pages/Training')), roles: ['*'] },
      { path: 'benefits', component: lazy(() => import('./pages/Benefits')), roles: ['*'] },
      { path: 'separation', component: lazy(() => import('./pages/Separation')), roles: ['super_admin', 'hr_manager'] },
      { path: 'hierarchy', component: lazy(() => import('./pages/Hierarchy')), roles: ['*'] },
    ]
  }
];
```

### State Management Architecture

The application uses Zustand for state management with separate stores for each domain:

```typescript
// Store structure
stores/
├── authStore.ts          // Authentication state, user session
├── uiStore.ts            // UI state (sidebar, theme, modals)
├── employeeStore.ts      // Employee data and operations
├── attendanceStore.ts    // Attendance records and status
├── leaveStore.ts         // Leave requests and balances
├── payrollStore.ts       // Payroll data and processing
├── recruitmentStore.ts   // Job postings and candidates
├── performanceStore.ts   // Goals, reviews, feedback
├── trainingStore.ts      // Training programs and certifications
├── benefitsStore.ts      // Benefits and reimbursements
├── separationStore.ts    // Separation processes
├── notificationStore.ts  // Notifications and alerts
└── websocketStore.ts     // WebSocket connection state
```

Each store follows this pattern:

```typescript
interface StoreState<T> {
  // Data
  items: T[];
  currentItem: T | null;
  
  // UI state
  loading: boolean;
  error: string | null;
  
  // Pagination
  page: number;
  pageSize: number;
  total: number;
  
  // Actions
  fetchItems: (params?: QueryParams) => Promise<void>;
  fetchById: (id: string) => Promise<void>;
  create: (data: Partial<T>) => Promise<void>;
  update: (id: string, data: Partial<T>) => Promise<void>;
  delete: (id: string) => Promise<void>;
  
  // Optimistic updates
  optimisticUpdate: (id: string, data: Partial<T>) => void;
  revertOptimisticUpdate: (id: string) => void;
  
  // Reset
  reset: () => void;
}
```

### API Integration Layer

```typescript
// services/api.ts - Centralized API client
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000,
  withCredentials: true, // Include cookies for session
});

// Request interceptor - add auth token
apiClient.interceptors.request.use((config) => {
  // Token is in httpOnly cookie, no need to add manually
  return config;
});

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      // Show unauthorized message
      toast.error('You do not have permission to perform this action');
    } else if (error.response?.status >= 500) {
      // Show generic error
      toast.error('An unexpected error occurred. Please try again.');
    }
    return Promise.reject(error);
  }
);

// Retry logic with exponential backoff
const retryRequest = async (fn: () => Promise<any>, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
};
```

### WebSocket Integration

```typescript
// services/websocket.ts
class WebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  
  connect() {
    this.ws = new WebSocket(import.meta.env.VITE_WS_URL);
    
    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
    };
    
    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.handleMessage(message);
    };
    
    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.reconnect();
    };
    
    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }
  
  private reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        this.reconnectAttempts++;
        this.connect();
      }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts));
    } else {
      // Fall back to polling
      this.startPolling();
    }
  }
  
  private handleMessage(message: any) {
    // Dispatch to appropriate store based on message type
    switch (message.type) {
      case 'notification':
        notificationStore.getState().addNotification(message.data);
        break;
      case 'attendance_update':
        attendanceStore.getState().updateAttendance(message.data);
        break;
      case 'leave_status_change':
        leaveStore.getState().updateLeaveStatus(message.data);
        break;
    }
  }
}
```


## Components and Interfaces

### Core UI Components

#### 1. Layout Components

**MainLayout**
```typescript
interface MainLayoutProps {
  children: React.ReactNode;
}

// Responsive layout with header, sidebar, and main content
// Adapts to mobile (< 768px), tablet (768-1024px), desktop (> 1024px)
// Manages sidebar collapse state
```

**Header**
```typescript
interface HeaderProps {
  user: User;
  notifications: Notification[];
  onLogout: () => void;
}

// Contains: Logo, SearchBar, NotificationBell, ThemeToggle, UserMenu
// Sticky positioning, responsive design
```

**Sidebar**
```typescript
interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  navigationItems: NavigationItem[];
}

interface NavigationItem {
  label: string;
  icon: LucideIcon;
  path: string;
  roles: UserRole[];
  badge?: number; // For notification counts
}

// Role-based navigation filtering
// Active route highlighting
// Collapsible on mobile
```

#### 2. Data Display Components

**DataTable**
```typescript
interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  pagination?: PaginationConfig;
  sorting?: SortingConfig;
  filtering?: FilteringConfig;
  onRowClick?: (row: T) => void;
  loading?: boolean;
  emptyMessage?: string;
}

interface ColumnDef<T> {
  key: keyof T;
  header: string;
  cell?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  filterType?: 'text' | 'select' | 'date' | 'dateRange';
  width?: string;
}

// Features:
// - Server-side pagination
// - Multi-column sorting
// - Column-specific filters
// - Virtual scrolling for large datasets (> 100 rows)
// - Responsive (card layout on mobile)
// - Export functionality (CSV, Excel, PDF)
```

**Card**
```typescript
interface CardProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  loading?: boolean;
  className?: string;
}

// Reusable card component for dashboard widgets and content sections
```

**StatCard**
```typescript
interface StatCardProps {
  title: string;
  value: string | number;
  change?: number; // Percentage change
  trend?: 'up' | 'down' | 'neutral';
  icon?: LucideIcon;
  loading?: boolean;
}

// Dashboard metric cards with trend indicators
```

#### 3. Form Components

**Form**
```typescript
interface FormProps<T> {
  initialValues: T;
  validationSchema: ValidationSchema<T>;
  onSubmit: (values: T) => Promise<void>;
  children: React.ReactNode;
}

// Features:
// - Field-level validation (on blur and submit)
// - Error display below fields
// - Error summary at top
// - Disabled state during submission
// - Optimistic updates
```

**FormField**
```typescript
interface FormFieldProps {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'date' | 'select' | 'textarea';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  options?: SelectOption[]; // For select fields
  validation?: FieldValidation;
}

// Integrated with form context for validation and state management
```

**FileUploader**
```typescript
interface FileUploaderProps {
  accept: string[]; // ['pdf', 'doc', 'docx', 'jpg', 'png']
  maxSize: number; // In MB
  maxFiles?: number;
  onUpload: (files: File[]) => Promise<void>;
  onError: (error: string) => void;
}

// Features:
// - Drag and drop support
// - File type validation
// - File size validation (max 10MB)
// - Upload progress indicator
// - Multiple file support
// - Preview for images
```

#### 4. Notification Components

**NotificationBell**
```typescript
interface NotificationBellProps {
  notifications: Notification[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}

// Dropdown with notification list
// Badge showing unread count
// Real-time updates via WebSocket
```

**Toast**
```typescript
interface ToastProps {
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  duration?: number; // Default 5000ms
  onClose?: () => void;
}

// Auto-dismiss after duration
// Stacked positioning for multiple toasts
// Accessible with ARIA live regions
```

#### 5. Chart Components

**LineChart**
```typescript
interface LineChartProps {
  data: ChartDataPoint[];
  xKey: string;
  yKey: string;
  title?: string;
  height?: number;
  loading?: boolean;
}

// Responsive Recharts line chart
// Hover tooltips
// Accessible with ARIA labels
```

**BarChart**
```typescript
interface BarChartProps {
  data: ChartDataPoint[];
  xKey: string;
  yKey: string;
  title?: string;
  height?: number;
  loading?: boolean;
}

// Responsive Recharts bar chart
// Click events for drill-down
```

**PieChart**
```typescript
interface PieChartProps {
  data: ChartDataPoint[];
  nameKey: string;
  valueKey: string;
  title?: string;
  height?: number;
  loading?: boolean;
}

// Responsive Recharts pie/donut chart
// Legend with percentages
```

#### 6. Specialized Components

**AttendanceMarker**
```typescript
interface AttendanceMarkerProps {
  mode: 'web' | 'gps' | 'biometric';
  onCheckIn: (location?: GeolocationCoordinates) => Promise<void>;
  onCheckOut: (location?: GeolocationCoordinates) => Promise<void>;
  currentStatus: 'checked_in' | 'checked_out' | 'absent';
}

// Handles different attendance marking modes
// Geolocation capture for GPS mode
// Real-time status display
```

**LeaveCalendar**
```typescript
interface LeaveCalendarProps {
  leaves: Leave[];
  onDateClick?: (date: Date) => void;
  highlightDates?: Date[];
}

// Calendar view showing approved leaves
// Color-coded by leave type
// Interactive date selection
```

**OrgChart**
```typescript
interface OrgChartProps {
  data: HierarchyNode[];
  onNodeClick?: (node: HierarchyNode) => void;
  expandable?: boolean;
}

interface HierarchyNode {
  id: string;
  name: string;
  position: string;
  photo?: string;
  children?: HierarchyNode[];
}

// Interactive organization chart
// Expand/collapse levels
// Search within chart
// Export as image
```

### Type Definitions

```typescript
// types/auth.ts
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  permissions: Permission[];
  profilePhoto?: string;
}

type UserRole = 'super_admin' | 'hr_manager' | 'department_manager' | 'finance' | 'employee' | 'it_admin';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  mfaRequired: boolean;
  loading: boolean;
}

// types/employee.ts
interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  status: 'active' | 'inactive' | 'on_leave' | 'terminated';
  joinDate: string;
  managerId?: string;
  profilePhoto?: string;
}

// types/attendance.ts
interface Attendance {
  id: string;
  employeeId: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  status: 'present' | 'absent' | 'late' | 'half_day';
  mode: 'web' | 'gps' | 'biometric';
  location?: GeolocationCoordinates;
}

// types/leave.ts
interface Leave {
  id: string;
  employeeId: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  approvedBy?: string;
  approvedAt?: string;
}

type LeaveType = 'casual' | 'sick' | 'earned' | 'maternity' | 'paternity' | 'unpaid';

interface LeaveBalance {
  leaveType: LeaveType;
  total: number;
  used: number;
  remaining: number;
}

// types/payroll.ts
interface Payroll {
  id: string;
  employeeId: string;
  month: string;
  year: number;
  basicSalary: number;
  allowances: Allowance[];
  deductions: Deduction[];
  grossSalary: number;
  netSalary: number;
  status: 'draft' | 'processed' | 'paid';
}

interface Allowance {
  type: string;
  amount: number;
}

interface Deduction {
  type: string;
  amount: number;
}

// types/notification.ts
interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

// types/api.ts
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface ApiError {
  message: string;
  code: string;
  details?: any;
}
```

### Service Layer Interfaces

```typescript
// services/employeeService.ts
interface EmployeeService {
  getEmployees(params: QueryParams): Promise<PaginatedResponse<Employee>>;
  getEmployeeById(id: string): Promise<Employee>;
  createEmployee(data: CreateEmployeeDto): Promise<Employee>;
  updateEmployee(id: string, data: UpdateEmployeeDto): Promise<Employee>;
  deleteEmployee(id: string): Promise<void>;
  importEmployees(file: File): Promise<ImportResult>;
}

// services/attendanceService.ts
interface AttendanceService {
  markAttendance(data: MarkAttendanceDto): Promise<Attendance>;
  getAttendance(params: QueryParams): Promise<PaginatedResponse<Attendance>>;
  getAttendanceStats(employeeId: string, month: string): Promise<AttendanceStats>;
  requestRegularization(data: RegularizationDto): Promise<void>;
}

// services/leaveService.ts
interface LeaveService {
  requestLeave(data: LeaveRequestDto): Promise<Leave>;
  getLeaves(params: QueryParams): Promise<PaginatedResponse<Leave>>;
  getLeaveBalance(employeeId: string): Promise<LeaveBalance[]>;
  approveLeave(id: string): Promise<Leave>;
  rejectLeave(id: string, reason: string): Promise<Leave>;
  cancelLeave(id: string): Promise<Leave>;
}

// services/payrollService.ts
interface PayrollService {
  processPayroll(month: string, year: number, employeeIds: string[]): Promise<void>;
  getPayroll(params: QueryParams): Promise<PaginatedResponse<Payroll>>;
  generatePayslip(payrollId: string): Promise<Blob>;
  downloadPayslip(payrollId: string): Promise<void>;
}
```


## Data Models

### Client-Side Data Models

The frontend maintains local representations of backend entities with additional UI-specific properties:

```typescript
// models/Employee.ts
export class EmployeeModel {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  status: EmployeeStatus;
  joinDate: Date;
  managerId?: string;
  profilePhoto?: string;
  
  // Computed properties
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
  
  get isActive(): boolean {
    return this.status === 'active';
  }
  
  // UI state
  _loading?: boolean;
  _error?: string;
  
  constructor(data: any) {
    Object.assign(this, data);
    this.joinDate = new Date(data.joinDate);
  }
  
  toJSON() {
    return {
      id: this.id,
      employeeId: this.employeeId,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      phone: this.phone,
      department: this.department,
      position: this.position,
      status: this.status,
      joinDate: this.joinDate.toISOString(),
      managerId: this.managerId,
      profilePhoto: this.profilePhoto,
    };
  }
}

// models/Attendance.ts
export class AttendanceModel {
  id: string;
  employeeId: string;
  date: Date;
  checkIn: Date;
  checkOut?: Date;
  status: AttendanceStatus;
  mode: AttendanceMode;
  location?: GeolocationCoordinates;
  
  // Computed properties
  get hoursWorked(): number {
    if (!this.checkOut) return 0;
    return (this.checkOut.getTime() - this.checkIn.getTime()) / (1000 * 60 * 60);
  }
  
  get isLate(): boolean {
    const expectedCheckIn = new Date(this.date);
    expectedCheckIn.setHours(9, 0, 0, 0); // Assuming 9 AM start time
    return this.checkIn > expectedCheckIn;
  }
  
  constructor(data: any) {
    Object.assign(this, data);
    this.date = new Date(data.date);
    this.checkIn = new Date(data.checkIn);
    if (data.checkOut) this.checkOut = new Date(data.checkOut);
  }
}

// models/Leave.ts
export class LeaveModel {
  id: string;
  employeeId: string;
  leaveType: LeaveType;
  startDate: Date;
  endDate: Date;
  reason: string;
  status: LeaveStatus;
  approvedBy?: string;
  approvedAt?: Date;
  
  // Computed properties
  get duration(): number {
    const diffTime = this.endDate.getTime() - this.startDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }
  
  get isPending(): boolean {
    return this.status === 'pending';
  }
  
  get canCancel(): boolean {
    return this.status === 'pending' || (this.status === 'approved' && this.startDate > new Date());
  }
  
  constructor(data: any) {
    Object.assign(this, data);
    this.startDate = new Date(data.startDate);
    this.endDate = new Date(data.endDate);
    if (data.approvedAt) this.approvedAt = new Date(data.approvedAt);
  }
}
```

### Form Data Transfer Objects (DTOs)

```typescript
// DTOs for API requests
export interface CreateEmployeeDto {
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  joinDate: string;
  managerId?: string;
}

export interface UpdateEmployeeDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  department?: string;
  position?: string;
  status?: EmployeeStatus;
  managerId?: string;
}

export interface MarkAttendanceDto {
  employeeId: string;
  mode: AttendanceMode;
  location?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
}

export interface LeaveRequestDto {
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
}

export interface PayrollProcessDto {
  month: string;
  year: number;
  employeeIds: string[];
  adjustments?: {
    employeeId: string;
    allowances?: Allowance[];
    deductions?: Deduction[];
  }[];
}
```

### Validation Schemas

```typescript
// utils/validation.ts
import { z } from 'zod';

export const employeeSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email format'),
  phone: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number'),
  department: z.string().min(1, 'Department is required'),
  position: z.string().min(1, 'Position is required'),
  joinDate: z.string().min(1, 'Join date is required'),
  managerId: z.string().optional(),
});

export const leaveRequestSchema = z.object({
  leaveType: z.enum(['casual', 'sick', 'earned', 'maternity', 'paternity', 'unpaid']),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  reason: z.string().min(10, 'Reason must be at least 10 characters'),
}).refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
  message: 'End date must be after start date',
  path: ['endDate'],
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const mfaSchema = z.object({
  code: z.string().length(6, 'MFA code must be 6 digits'),
});
```

### Local Storage Schema

```typescript
// Persisted state in localStorage
interface PersistedState {
  auth: {
    user: User | null;
    isAuthenticated: boolean;
  };
  ui: {
    theme: 'light' | 'dark';
    sidebarCollapsed: boolean;
    language: string;
  };
  preferences: {
    dateFormat: string;
    timeFormat: string;
    currency: string;
    timezone: string;
  };
}

// IndexedDB schema for offline data
interface OfflineCache {
  employees: Employee[];
  attendance: Attendance[];
  leaves: Leave[];
  notifications: Notification[];
  lastSync: Date;
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, I identified the following categories:
- **Properties (universal rules)**: 45 testable properties that apply across all inputs
- **Examples (specific scenarios)**: 85 specific test cases
- **Edge cases**: 5 boundary conditions
- **Non-testable**: 25 configuration/architecture decisions

**Redundancy Elimination:**
- Combined multiple role-based navigation properties into a single comprehensive property
- Merged form validation properties that test the same underlying mechanism
- Consolidated state persistence properties across different stores
- Combined error handling properties for different HTTP status codes into a single property
- Merged theme persistence and UI preference persistence into a single property

### Property 1: Protected Route Authorization

*For any* protected route and user role, access should be granted if and only if the user's role is included in the route's allowed roles list.

**Validates: Requirements 3.8, 6.12**

### Property 2: Role-Based Navigation Filtering

*For any* user role, the navigation menu should display only the menu items that the user's role has permission to access.

**Validates: Requirements 3.11, 4.4**

### Property 3: Active Route Highlighting

*For any* current route, the corresponding navigation item should be highlighted as active, and all other navigation items should not be highlighted.

**Validates: Requirements 4.5**

### Property 4: Theme Persistence Round Trip

*For any* theme selection (light or dark), setting the theme and then reloading the application should restore the same theme from localStorage.

**Validates: Requirements 4.8, 24.4**

### Property 5: Breadcrumb Path Consistency

*For any* nested route, the breadcrumb navigation should accurately reflect the hierarchical path from root to the current page.

**Validates: Requirements 4.9**

### Property 6: Role-Specific Dashboard Widgets

*For any* user role, the dashboard should display only the widgets and metrics that are relevant to that role's responsibilities.

**Validates: Requirements 5.1**

### Property 7: Data Table Pagination Consistency

*For any* data table with pagination, navigating through pages and returning to a previous page should display the same data that was shown before.

**Validates: Requirements 6.2, 17.2**

### Property 8: Form Required Field Validation

*For any* form with required fields, attempting to submit the form with any required field empty should prevent submission and display an error message for each empty required field.

**Validates: Requirements 6.7, 18.1**

### Property 9: Operation Result Messaging

*For any* create, update, or delete operation, the application should display a success message when the operation succeeds and an error message when it fails.

**Validates: Requirements 6.9**

### Property 10: Attendance Statistics Calculation

*For any* set of attendance records for an employee in a given period, the calculated statistics (present days, absent days, late arrivals) should match the count of records with corresponding status values.

**Validates: Requirements 7.7**

### Property 11: Date Range Validation

*For any* form with start date and end date fields, the form validator should reject submission if the end date is before the start date.

**Validates: Requirements 8.2, 18.4**

### Property 12: Leave Balance Validation

*For any* leave request, the form should prevent submission if the requested leave duration exceeds the available balance for that leave type.

**Validates: Requirements 8.3**

### Property 13: Leave Cancellation Eligibility

*For any* leave request, cancellation should be allowed if and only if the leave status is 'pending' or the leave is 'approved' and the start date is in the future.

**Validates: Requirements 8.11**

### Property 14: File Type Validation

*For any* file selected for upload, the file uploader should accept the file if its type is in the allowed list (PDF, DOC, DOCX, JPG, PNG) and reject it otherwise with an error message.

**Validates: Requirements 15.1, 15.3, 15.4**

### Property 15: File Size Validation

*For any* file selected for upload, the file uploader should accept the file if its size is ≤ 10MB and reject it otherwise with an error message.

**Validates: Requirements 15.2, 15.4**

### Property 16: Search Filter Real-Time Update

*For any* search input in a data table, typing a search term should immediately filter the displayed results to show only rows that match the search term.

**Validates: Requirements 17.2**

### Property 17: Active Filter Indicator Display

*For any* active filter in a data table, a visual indicator should be displayed showing which filters are currently applied.

**Validates: Requirements 17.6**

### Property 18: Individual Filter Clearing

*For any* active filter in a data table, clearing that specific filter should remove only that filter while preserving all other active filters.

**Validates: Requirements 17.7**

### Property 19: Filter State URL Persistence

*For any* filter state in a data table, the current filters should be encoded in the URL query parameters, and navigating to that URL should restore the exact same filter state.

**Validates: Requirements 17.9**

### Property 20: Email Format Validation

*For any* email input field, the form validator should accept valid email formats (containing @ and domain) and reject invalid formats with an error message.

**Validates: Requirements 18.2**

### Property 21: Phone Number Format Validation

*For any* phone number input field, the form validator should accept valid phone formats (10-15 digits with optional country code) and reject invalid formats with an error message.

**Validates: Requirements 18.3**

### Property 22: Numeric Field Validation

*For any* numeric input field, the form validator should accept valid numbers and reject non-numeric input with an error message.

**Validates: Requirements 18.5**

### Property 23: Field-Level Error Display

*For any* invalid form field, an error message should be displayed directly below that field indicating what is wrong.

**Validates: Requirements 18.6**

### Property 24: Form Submission Prevention

*For any* form with validation errors, the submit button should be disabled or submission should be prevented until all errors are resolved.

**Validates: Requirements 18.7**

### Property 25: Form Error Summary Display

*For any* form with multiple validation errors, a summary of all errors should be displayed at the top of the form.

**Validates: Requirements 18.8**

### Property 26: Error Message Clearing

*For any* form field with an error message, correcting the input to a valid value should clear the error message for that field.

**Validates: Requirements 18.10**

### Property 27: Submit Button Disabling During API Call

*For any* form submission that triggers an API call, the submit button should be disabled during the API call and re-enabled when the call completes (success or failure).

**Validates: Requirements 18.11**

### Property 28: Authentication State Persistence

*For any* authentication state change (login or logout), the new state should be persisted to localStorage and restored on application reload.

**Validates: Requirements 19.2**

### Property 29: UI Preference Persistence

*For any* UI preference change (theme, sidebar state, language), the preference should be persisted to localStorage and restored on application reload.

**Validates: Requirements 19.3, 24.4**

### Property 30: State Update Component Synchronization

*For any* state update in a Zustand store, all components subscribed to that state should re-render with the updated data.

**Validates: Requirements 19.6**

### Property 31: Async Operation State Management

*For any* asynchronous operation (API call), the store should set loading state to true when the operation starts, and set it to false when the operation completes (success or failure), and set error state if the operation fails.

**Validates: Requirements 19.7**

### Property 32: Optimistic Update Implementation

*For any* update operation, the UI should immediately reflect the change (optimistic update) before the API call completes.

**Validates: Requirements 19.8**

### Property 33: Optimistic Update Rollback

*For any* optimistic update that fails (API returns error), the state should revert to the previous value before the optimistic update.

**Validates: Requirements 19.9**

### Property 34: Authentication Token Inclusion

*For any* API request to a protected endpoint, the request should include authentication credentials (via httpOnly cookie).

**Validates: Requirements 20.2**

### Property 35: HTTP Status Code Handling

*For any* API response, the application should handle the response appropriately based on the HTTP status code: success for 2xx, client error handling for 4xx, server error handling for 5xx.

**Validates: Requirements 20.3**

### Property 36: Failed Request Retry Logic

*For any* failed API request (network error or 5xx), the API service should retry the request up to 3 times with exponential backoff before giving up.

**Validates: Requirements 20.8**

### Property 37: User-Friendly Error Messages

*For any* API error, the application should display a user-friendly error message (not raw technical error) to the user.

**Validates: Requirements 20.9**

### Property 38: Error Logging

*For any* error (API error, validation error, runtime error), the error should be logged to the console or logging service for debugging purposes.

**Validates: Requirements 20.10**

### Property 39: Request Cancellation Support

*For any* in-flight API request, if the user navigates away or cancels the operation, the request should be cancelled to prevent unnecessary processing.

**Validates: Requirements 20.11**

### Property 40: Theme Consistency Across Components

*For any* theme change (light to dark or dark to light), all components in the application should update to reflect the new theme consistently.

**Validates: Requirements 24.3**

### Property 41: Theme Meta Tag Update

*For any* theme change, the meta theme-color tag in the document head should be updated to match the new theme's primary color.

**Validates: Requirements 24.9**

### Property 42: Offline Data Display

*For any* cached data in the service worker, when the user is offline, the application should display the cached data instead of showing an error.

**Validates: Requirements 2.4**

### Property 43: Offline Write Operation Queueing

*For any* write operation (create, update, delete) attempted while offline, the operation should be queued and automatically retried when the connection is restored.

**Validates: Requirements 2.5**

### Property 44: Session State Management

*For any* authenticated user session, the session state should be maintained in the Zustand auth store and synchronized with the backend session.

**Validates: Requirements 3.6**

### Property 45: Unauthenticated User Redirection

*For any* unauthenticated user attempting to access a protected route, the application should redirect to the login page and preserve the intended destination for post-login redirect.

**Validates: Requirements 3.7, 3.9**


## Error Handling

### Error Categories and Handling Strategies

#### 1. Network Errors

**Scenarios:**
- API server unreachable
- Request timeout (> 30 seconds)
- Connection lost during request
- CORS errors

**Handling Strategy:**
```typescript
// Automatic retry with exponential backoff
const retryRequest = async (fn: () => Promise<any>, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) {
        // Show user-friendly error after all retries exhausted
        toast.error('Unable to connect to server. Please check your internet connection.');
        throw error;
      }
      // Exponential backoff: 1s, 2s, 4s
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
};

// Offline detection and queueing
if (!navigator.onLine) {
  // Queue write operations for later sync
  offlineQueue.add(operation);
  toast.info('You are offline. Changes will be synced when connection is restored.');
}
```

#### 2. Authentication Errors (401)

**Scenarios:**
- Session expired
- Invalid or missing auth token
- User logged out on another device

**Handling Strategy:**
```typescript
// Redirect to login and preserve intended destination
if (error.response?.status === 401) {
  const currentPath = window.location.pathname;
  authStore.getState().logout();
  navigate('/login', { state: { from: currentPath } });
  toast.warning('Your session has expired. Please log in again.');
}
```

#### 3. Authorization Errors (403)

**Scenarios:**
- User lacks required permissions
- Role-based access denied
- Resource access forbidden

**Handling Strategy:**
```typescript
if (error.response?.status === 403) {
  toast.error('You do not have permission to perform this action.');
  // Optionally redirect to dashboard or previous page
  navigate(-1);
}
```

#### 4. Validation Errors (400)

**Scenarios:**
- Invalid input data
- Business rule violations
- Missing required fields

**Handling Strategy:**
```typescript
if (error.response?.status === 400) {
  const validationErrors = error.response.data.errors;
  // Display field-specific errors
  Object.keys(validationErrors).forEach(field => {
    setFieldError(field, validationErrors[field]);
  });
  // Show summary
  toast.error('Please correct the errors in the form.');
}
```

#### 5. Not Found Errors (404)

**Scenarios:**
- Resource doesn't exist
- Invalid route
- Deleted resource

**Handling Strategy:**
```typescript
if (error.response?.status === 404) {
  toast.error('The requested resource was not found.');
  navigate('/404');
}
```

#### 6. Server Errors (500)

**Scenarios:**
- Internal server error
- Database connection failure
- Unhandled backend exception

**Handling Strategy:**
```typescript
if (error.response?.status >= 500) {
  // Log error for debugging
  console.error('Server error:', error);
  // Show generic user-friendly message
  toast.error('An unexpected error occurred. Our team has been notified.');
  // Optionally send error to monitoring service
  errorMonitoring.captureException(error);
}
```

#### 7. Client-Side Errors

**Scenarios:**
- React component errors
- JavaScript runtime errors
- Unhandled promise rejections

**Handling Strategy:**
```typescript
// Error boundary for React component errors
class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Component error:', error, errorInfo);
    errorMonitoring.captureException(error, { extra: errorInfo });
    this.setState({ hasError: true });
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback onReset={() => this.setState({ hasError: false })} />;
    }
    return this.props.children;
  }
}

// Global error handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  errorMonitoring.captureException(event.reason);
  toast.error('An unexpected error occurred.');
});
```

#### 8. Form Validation Errors

**Scenarios:**
- Invalid email format
- Phone number format mismatch
- Date range violations
- Required field missing

**Handling Strategy:**
```typescript
// Field-level validation with Zod
const validateField = (field: string, value: any, schema: z.ZodSchema) => {
  try {
    schema.parse({ [field]: value });
    clearFieldError(field);
  } catch (error) {
    if (error instanceof z.ZodError) {
      setFieldError(field, error.errors[0].message);
    }
  }
};

// Form-level validation
const validateForm = (values: any, schema: z.ZodSchema) => {
  try {
    schema.parse(values);
    return { valid: true, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.reduce((acc, err) => {
        acc[err.path[0]] = err.message;
        return acc;
      }, {});
      return { valid: false, errors };
    }
  }
};
```

#### 9. File Upload Errors

**Scenarios:**
- File size exceeds limit (> 10MB)
- Invalid file type
- Upload interrupted
- Server storage full

**Handling Strategy:**
```typescript
const validateFile = (file: File): { valid: boolean; error?: string } => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword'];
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 10MB' };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'File type not supported' };
  }
  
  return { valid: true };
};

// Handle upload errors
try {
  await uploadFile(file);
  toast.success('File uploaded successfully');
} catch (error) {
  if (error.code === 'UPLOAD_INTERRUPTED') {
    toast.error('Upload was interrupted. Please try again.');
  } else if (error.code === 'STORAGE_FULL') {
    toast.error('Server storage is full. Please contact support.');
  } else {
    toast.error('Failed to upload file. Please try again.');
  }
}
```

#### 10. Geolocation Errors

**Scenarios:**
- Permission denied
- Position unavailable
- Timeout
- Geolocation not supported

**Handling Strategy:**
```typescript
const getCurrentLocation = (): Promise<GeolocationCoordinates> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      reject(new Error('Geolocation not supported'));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position.coords),
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error('Location permission denied. Please enable location access.');
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error('Location information is unavailable.');
            break;
          case error.TIMEOUT:
            toast.error('Location request timed out.');
            break;
        }
        reject(error);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  });
};
```

### Error Logging and Monitoring

```typescript
// Error monitoring service integration
interface ErrorMonitoring {
  captureException(error: Error, context?: any): void;
  captureMessage(message: string, level: 'info' | 'warning' | 'error'): void;
  setUser(user: User): void;
}

// Example implementation with Sentry
const errorMonitoring: ErrorMonitoring = {
  captureException: (error, context) => {
    console.error('Error:', error, context);
    // Send to monitoring service
    // Sentry.captureException(error, { extra: context });
  },
  captureMessage: (message, level) => {
    console[level](message);
    // Sentry.captureMessage(message, level);
  },
  setUser: (user) => {
    // Sentry.setUser({ id: user.id, email: user.email });
  },
};
```

### User Feedback Patterns

```typescript
// Toast notification system
interface ToastOptions {
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  duration?: number;
  action?: { label: string; onClick: () => void };
}

const toast = {
  info: (message: string, options?: Partial<ToastOptions>) => 
    showToast({ type: 'info', message, ...options }),
  success: (message: string, options?: Partial<ToastOptions>) => 
    showToast({ type: 'success', message, ...options }),
  warning: (message: string, options?: Partial<ToastOptions>) => 
    showToast({ type: 'warning', message, ...options }),
  error: (message: string, options?: Partial<ToastOptions>) => 
    showToast({ type: 'error', message, ...options }),
};

// Loading states
interface LoadingState {
  global: boolean; // Full-page loading
  component: string[]; // Component-specific loading
  operation: Record<string, boolean>; // Operation-specific loading
}

// Error boundaries for graceful degradation
const ErrorFallback = ({ error, resetError }: { error: Error; resetError: () => void }) => (
  <div className="error-fallback">
    <h2>Something went wrong</h2>
    <p>{error.message}</p>
    <button onClick={resetError}>Try again</button>
  </div>
);
```


## Testing Strategy

### Overview

The frontend application employs a comprehensive testing strategy combining unit tests, component tests, integration tests, and property-based tests to ensure correctness, reliability, and maintainability.

### Testing Pyramid

```
                    ┌─────────────┐
                    │   E2E Tests │  (10% - Critical user flows)
                    └─────────────┘
                  ┌───────────────────┐
                  │ Integration Tests │  (20% - API integration, store integration)
                  └───────────────────┘
              ┌─────────────────────────────┐
              │    Component Tests          │  (30% - UI components, user interactions)
              └─────────────────────────────┘
          ┌───────────────────────────────────────┐
          │         Unit Tests                    │  (40% - Utils, validators, models)
          └───────────────────────────────────────┘
```

### Testing Framework and Tools

- **Test Runner**: Vitest 2.0 (Vite-native, fast, ESM support)
- **Component Testing**: @testing-library/react (user-centric testing)
- **Property-Based Testing**: fast-check 3.20 (for universal properties)
- **Mocking**: vitest mocks for API calls and external dependencies
- **Accessibility Testing**: @axe-core/react (automated a11y checks)
- **Coverage**: vitest coverage with c8 (target: 80% minimum)

### Unit Tests

**Scope**: Pure functions, utilities, validators, formatters, models

**Examples:**

```typescript
// utils/validators.test.ts
import { describe, it, expect } from 'vitest';
import { validateEmail, validatePhone, validateDateRange } from './validators';

describe('validateEmail', () => {
  it('should accept valid email addresses', () => {
    expect(validateEmail('user@example.com')).toBe(true);
    expect(validateEmail('user.name+tag@example.co.uk')).toBe(true);
  });
  
  it('should reject invalid email addresses', () => {
    expect(validateEmail('invalid')).toBe(false);
    expect(validateEmail('user@')).toBe(false);
    expect(validateEmail('@example.com')).toBe(false);
  });
});

describe('validateDateRange', () => {
  it('should accept valid date ranges', () => {
    const start = new Date('2024-01-01');
    const end = new Date('2024-01-31');
    expect(validateDateRange(start, end)).toBe(true);
  });
  
  it('should reject invalid date ranges', () => {
    const start = new Date('2024-01-31');
    const end = new Date('2024-01-01');
    expect(validateDateRange(start, end)).toBe(false);
  });
});

// models/Leave.test.ts
import { LeaveModel } from './Leave';

describe('LeaveModel', () => {
  it('should calculate duration correctly', () => {
    const leave = new LeaveModel({
      startDate: '2024-01-01',
      endDate: '2024-01-05',
      // ... other fields
    });
    expect(leave.duration).toBe(5);
  });
  
  it('should determine if leave can be cancelled', () => {
    const pendingLeave = new LeaveModel({ status: 'pending', /* ... */ });
    expect(pendingLeave.canCancel).toBe(true);
    
    const approvedFutureLeave = new LeaveModel({ 
      status: 'approved', 
      startDate: new Date(Date.now() + 86400000).toISOString(),
      /* ... */ 
    });
    expect(approvedFutureLeave.canCancel).toBe(true);
    
    const approvedPastLeave = new LeaveModel({ 
      status: 'approved', 
      startDate: new Date(Date.now() - 86400000).toISOString(),
      /* ... */ 
    });
    expect(approvedPastLeave.canCancel).toBe(false);
  });
});
```

### Component Tests

**Scope**: React components, user interactions, rendering logic

**Examples:**

```typescript
// components/forms/LeaveRequestForm.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LeaveRequestForm } from './LeaveRequestForm';

describe('LeaveRequestForm', () => {
  it('should render all form fields', () => {
    render(<LeaveRequestForm onSubmit={vi.fn()} />);
    
    expect(screen.getByLabelText('Leave Type')).toBeInTheDocument();
    expect(screen.getByLabelText('Start Date')).toBeInTheDocument();
    expect(screen.getByLabelText('End Date')).toBeInTheDocument();
    expect(screen.getByLabelText('Reason')).toBeInTheDocument();
  });
  
  it('should validate required fields', async () => {
    const onSubmit = vi.fn();
    render(<LeaveRequestForm onSubmit={onSubmit} />);
    
    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Leave type is required')).toBeInTheDocument();
      expect(screen.getByText('Start date is required')).toBeInTheDocument();
    });
    
    expect(onSubmit).not.toHaveBeenCalled();
  });
  
  it('should validate date range', async () => {
    render(<LeaveRequestForm onSubmit={vi.fn()} />);
    
    const startDate = screen.getByLabelText('Start Date');
    const endDate = screen.getByLabelText('End Date');
    
    fireEvent.change(startDate, { target: { value: '2024-01-31' } });
    fireEvent.change(endDate, { target: { value: '2024-01-01' } });
    fireEvent.blur(endDate);
    
    await waitFor(() => {
      expect(screen.getByText('End date must be after start date')).toBeInTheDocument();
    });
  });
  
  it('should submit form with valid data', async () => {
    const onSubmit = vi.fn();
    render(<LeaveRequestForm onSubmit={onSubmit} />);
    
    fireEvent.change(screen.getByLabelText('Leave Type'), { target: { value: 'casual' } });
    fireEvent.change(screen.getByLabelText('Start Date'), { target: { value: '2024-01-01' } });
    fireEvent.change(screen.getByLabelText('End Date'), { target: { value: '2024-01-05' } });
    fireEvent.change(screen.getByLabelText('Reason'), { target: { value: 'Personal reasons' } });
    
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        leaveType: 'casual',
        startDate: '2024-01-01',
        endDate: '2024-01-05',
        reason: 'Personal reasons',
      });
    });
  });
});

// components/tables/DataTable.test.tsx
describe('DataTable', () => {
  const mockData = [
    { id: '1', name: 'John Doe', department: 'Engineering' },
    { id: '2', name: 'Jane Smith', department: 'HR' },
  ];
  
  const mockColumns = [
    { key: 'name', header: 'Name', sortable: true },
    { key: 'department', header: 'Department', filterable: true },
  ];
  
  it('should render table with data', () => {
    render(<DataTable data={mockData} columns={mockColumns} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });
  
  it('should filter data based on search input', async () => {
    render(<DataTable data={mockData} columns={mockColumns} />);
    
    const searchInput = screen.getByPlaceholderText('Search...');
    fireEvent.change(searchInput, { target: { value: 'John' } });
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });
  });
  
  it('should sort data when column header is clicked', async () => {
    render(<DataTable data={mockData} columns={mockColumns} />);
    
    const nameHeader = screen.getByText('Name');
    fireEvent.click(nameHeader);
    
    await waitFor(() => {
      const rows = screen.getAllByRole('row');
      expect(rows[1]).toHaveTextContent('Jane Smith');
      expect(rows[2]).toHaveTextContent('John Doe');
    });
  });
});
```

### Property-Based Tests

**Scope**: Universal properties that should hold for all inputs

**Configuration**: Minimum 100 iterations per property test

**Examples:**

```typescript
// stores/authStore.property.test.ts
import { describe, it, expect } from 'vitest';
import { fc } from 'fast-check';
import { useAuthStore } from './authStore';

/**
 * Feature: frontend-application, Property 28: Authentication State Persistence
 * For any authentication state change (login or logout), the new state should be 
 * persisted to localStorage and restored on application reload.
 */
describe('Property 28: Authentication State Persistence', () => {
  it('should persist and restore auth state', () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.uuid(),
          email: fc.emailAddress(),
          firstName: fc.string({ minLength: 1, maxLength: 50 }),
          lastName: fc.string({ minLength: 1, maxLength: 50 }),
          role: fc.constantFrom('super_admin', 'hr_manager', 'employee'),
        }),
        (user) => {
          // Login
          const store = useAuthStore.getState();
          store.login(user);
          
          // Check localStorage
          const stored = localStorage.getItem('auth-storage');
          expect(stored).toBeTruthy();
          const parsed = JSON.parse(stored!);
          expect(parsed.state.user).toEqual(user);
          
          // Simulate reload by creating new store instance
          const newStore = useAuthStore.getState();
          expect(newStore.user).toEqual(user);
          expect(newStore.isAuthenticated).toBe(true);
          
          // Logout
          newStore.logout();
          const storedAfterLogout = localStorage.getItem('auth-storage');
          const parsedAfterLogout = JSON.parse(storedAfterLogout!);
          expect(parsedAfterLogout.state.user).toBeNull();
          expect(parsedAfterLogout.state.isAuthenticated).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: frontend-application, Property 11: Date Range Validation
 * For any form with start date and end date fields, the form validator should 
 * reject submission if the end date is before the start date.
 */
describe('Property 11: Date Range Validation', () => {
  it('should reject invalid date ranges', () => {
    fc.assert(
      fc.property(
        fc.date(),
        fc.date(),
        (date1, date2) => {
          const startDate = date1 < date2 ? date1 : date2;
          const endDate = date1 < date2 ? date2 : date1;
          
          // Valid range should pass
          const validResult = validateDateRange(startDate, endDate);
          expect(validResult.valid).toBe(true);
          
          // Invalid range (swapped) should fail
          if (startDate.getTime() !== endDate.getTime()) {
            const invalidResult = validateDateRange(endDate, startDate);
            expect(invalidResult.valid).toBe(false);
            expect(invalidResult.error).toBeTruthy();
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: frontend-application, Property 14: File Type Validation
 * For any file selected for upload, the file uploader should accept the file 
 * if its type is in the allowed list and reject it otherwise with an error message.
 */
describe('Property 14: File Type Validation', () => {
  it('should validate file types correctly', () => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword'];
    
    fc.assert(
      fc.property(
        fc.string(),
        fc.constantFrom(...allowedTypes, 'application/zip', 'text/plain', 'video/mp4'),
        (fileName, mimeType) => {
          const file = new File(['content'], fileName, { type: mimeType });
          const result = validateFileType(file, allowedTypes);
          
          if (allowedTypes.includes(mimeType)) {
            expect(result.valid).toBe(true);
            expect(result.error).toBeUndefined();
          } else {
            expect(result.valid).toBe(false);
            expect(result.error).toBeTruthy();
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: frontend-application, Property 20: Email Format Validation
 * For any email input field, the form validator should accept valid email formats 
 * and reject invalid formats with an error message.
 */
describe('Property 20: Email Format Validation', () => {
  it('should validate email formats', () => {
    fc.assert(
      fc.property(
        fc.emailAddress(),
        (validEmail) => {
          const result = validateEmail(validEmail);
          expect(result.valid).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
    
    fc.assert(
      fc.property(
        fc.string().filter(s => !s.includes('@') || !s.includes('.')),
        (invalidEmail) => {
          const result = validateEmail(invalidEmail);
          expect(result.valid).toBe(false);
          expect(result.error).toBeTruthy();
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: frontend-application, Property 33: Optimistic Update Rollback
 * For any optimistic update that fails, the state should revert to the 
 * previous value before the optimistic update.
 */
describe('Property 33: Optimistic Update Rollback', () => {
  it('should rollback failed optimistic updates', () => {
    fc.assert(
      fc.property(
        fc.array(fc.record({
          id: fc.uuid(),
          name: fc.string({ minLength: 1, maxLength: 50 }),
          status: fc.constantFrom('active', 'inactive'),
        })),
        fc.uuid(),
        fc.string({ minLength: 1, maxLength: 50 }),
        async (initialItems, updateId, newName) => {
          const store = useEmployeeStore.getState();
          store.setItems(initialItems);
          
          const itemToUpdate = initialItems.find(item => item.id === updateId);
          if (!itemToUpdate) return; // Skip if item doesn't exist
          
          const originalName = itemToUpdate.name;
          
          // Perform optimistic update
          store.optimisticUpdate(updateId, { name: newName });
          
          // Verify optimistic update applied
          const updatedItem = store.items.find(item => item.id === updateId);
          expect(updatedItem?.name).toBe(newName);
          
          // Simulate API failure
          try {
            await store.update(updateId, { name: newName }, { shouldFail: true });
          } catch (error) {
            // Verify rollback occurred
            const rolledBackItem = store.items.find(item => item.id === updateId);
            expect(rolledBackItem?.name).toBe(originalName);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Integration Tests

**Scope**: API integration, store integration, multi-component workflows

**Examples:**

```typescript
// services/employeeService.integration.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { employeeService } from './employeeService';

const server = setupServer(
  rest.get('/api/v1/employees', (req, res, ctx) => {
    return res(ctx.json({
      items: [
        { id: '1', name: 'John Doe', department: 'Engineering' },
        { id: '2', name: 'Jane Smith', department: 'HR' },
      ],
      total: 2,
      page: 1,
      pageSize: 10,
    }));
  }),
  
  rest.post('/api/v1/employees', (req, res, ctx) => {
    return res(ctx.status(201), ctx.json({ id: '3', ...req.body }));
  }),
  
  rest.put('/api/v1/employees/:id', (req, res, ctx) => {
    return res(ctx.json({ id: req.params.id, ...req.body }));
  })
);

beforeEach(() => server.listen());
afterEach(() => server.resetHandlers());

describe('Employee Service Integration', () => {
  it('should fetch employees from API', async () => {
    const result = await employeeService.getEmployees({ page: 1, pageSize: 10 });
    
    expect(result.items).toHaveLength(2);
    expect(result.total).toBe(2);
  });
  
  it('should create employee via API', async () => {
    const newEmployee = {
      employeeId: 'EMP003',
      firstName: 'Bob',
      lastName: 'Johnson',
      email: 'bob@example.com',
      department: 'Sales',
    };
    
    const result = await employeeService.createEmployee(newEmployee);
    
    expect(result.id).toBe('3');
    expect(result.firstName).toBe('Bob');
  });
  
  it('should handle API errors gracefully', async () => {
    server.use(
      rest.get('/api/v1/employees', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ message: 'Internal server error' }));
      })
    );
    
    await expect(employeeService.getEmployees()).rejects.toThrow();
  });
});
```

### Accessibility Tests

**Scope**: WCAG 2.1 AA compliance, keyboard navigation, screen reader support

**Examples:**

```typescript
// components/forms/LeaveRequestForm.a11y.test.tsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { LeaveRequestForm } from './LeaveRequestForm';

expect.extend(toHaveNoViolations);

describe('LeaveRequestForm Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<LeaveRequestForm onSubmit={vi.fn()} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  
  it('should have proper ARIA labels', () => {
    const { getByLabelText } = render(<LeaveRequestForm onSubmit={vi.fn()} />);
    
    expect(getByLabelText('Leave Type')).toHaveAttribute('aria-required', 'true');
    expect(getByLabelText('Start Date')).toHaveAttribute('aria-required', 'true');
  });
  
  it('should support keyboard navigation', () => {
    const { getByLabelText, getByRole } = render(<LeaveRequestForm onSubmit={vi.fn()} />);
    
    const leaveType = getByLabelText('Leave Type');
    const startDate = getByLabelText('Start Date');
    const submitButton = getByRole('button', { name: /submit/i });
    
    leaveType.focus();
    expect(document.activeElement).toBe(leaveType);
    
    // Tab to next field
    fireEvent.keyDown(leaveType, { key: 'Tab' });
    expect(document.activeElement).toBe(startDate);
  });
});
```

### Test Coverage Goals

- **Overall Coverage**: Minimum 80%
- **Critical Paths**: 100% (authentication, authorization, data submission)
- **Utility Functions**: 95%
- **Components**: 80%
- **Integration**: 70%

### Continuous Integration

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '22'
      - run: npm ci
      - run: npm run lint
      - run: npm test -- --coverage
      - run: npm run test:a11y
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

### Testing Best Practices

1. **Test Behavior, Not Implementation**: Focus on what the component does, not how it does it
2. **Use Realistic Test Data**: Generate test data that resembles production data
3. **Mock External Dependencies**: Mock API calls, WebSocket connections, geolocation
4. **Test Error States**: Ensure error handling works correctly
5. **Test Accessibility**: Include a11y tests for all interactive components
6. **Property-Based Testing**: Use fast-check for universal properties (100+ iterations)
7. **Avoid Test Interdependence**: Each test should be independent and isolated
8. **Use Descriptive Test Names**: Test names should clearly describe what is being tested
9. **Keep Tests Fast**: Unit tests should run in milliseconds, component tests in seconds
10. **Maintain Test Quality**: Refactor tests as you refactor code
