# Implementation Plan: Frontend Application

## Overview

This implementation plan breaks down the Progressive Web App (PWA) frontend for the Employee Management System into manageable, sequential tasks. The frontend is built with React 19.2, TypeScript 5.9, and Vite 6.0, consuming the existing backend REST API. The implementation follows a layered approach: foundation → core infrastructure → authentication → layout → feature modules → optimization.

## Tasks

- [x] 1. Project Setup and Build Configuration
  - Initialize Vite 6.0 project with React 19.2 and TypeScript 5.9
  - Configure TypeScript with strict mode and path aliases
  - Set up ESLint 9.0 and Prettier 3.2 for code quality
  - Configure Tailwind CSS 4.1 with custom theme
  - Install core dependencies (React Router 7.0, Zustand 5.0, Axios)
  - Create environment configuration (.env files for dev/prod)
  - Set up Vitest 2.0 for testing
  - Configure hot module replacement for development
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8_

- [x] 2. PWA Configuration and Service Worker Setup
  - Install and configure vite-plugin-pwa 0.20+
  - Create manifest.json with app metadata and icons
  - Generate PWA icons (192x192, 512x512) for different devices
  - Configure Workbox caching strategies (CacheFirst for assets, NetworkFirst for API)
  - Implement offline indicator component
  - Create update notification component for new versions
  - Set up offline queue for write operations
  - Test PWA installation on desktop and mobile
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9_

- [x] 3. Project Structure and Base Components
  - Create folder structure (components, pages, routes, store, services, hooks, utils, types, lib)
  - Set up shadcn/ui with Radix UI primitives
  - Install Lucide React 0.577+ for icons
  - Create base UI components (Button, Input, Label, Card, Badge, Dialog, Select, Checkbox, Switch, Tabs, Table, Toast, Tooltip, Separator, Avatar, Progress, Skeleton)
  - Create utility functions (cn for class merging, formatters, validators, constants)
  - Set up global styles and theme variables (light/dark mode)
  - _Requirements: 1.3, 24.1, 24.2, 24.3_


- [x] 4. API Integration Layer
  - [x] 4.1 Create centralized API client with Axios
    - Configure base URL, timeout, and credentials
    - Implement request interceptor for auth token injection
    - Implement response interceptor for error handling
    - Add retry logic with exponential backoff (3 retries)
    - Support request cancellation
    - _Requirements: 20.1, 20.2, 20.3, 20.8, 20.11_
  
  - [x] 4.2 Create API service modules
    - Create authService (login, logout, verifyMFA, refreshSession, getCurrentUser)
    - Create employeeService (CRUD operations, import, export)
    - Create attendanceService (mark attendance, get records, stats, regularization)
    - Create leaveService (request, approve, reject, cancel, get balance)
    - Create payrollService (process, generate payslip, get records)
    - Create recruitmentService (job postings, candidates, interviews)
    - Create performanceService (goals, reviews, feedback)
    - Create trainingService (programs, enrollments, certifications)
    - Create benefitsService (benefits, reimbursements, loans)
    - Create separationService (initiate, checklist, settlement)
    - Create hierarchyService (org chart data)
    - Create notificationService (get notifications, mark as read)
    - _Requirements: 20.1, 20.2, 20.3_
  
  - [x] 4.3 Implement error handling and user feedback
    - Create error handler utility for different HTTP status codes
    - Handle 401 (redirect to login), 403 (unauthorized), 404 (not found), 500 (server error)
    - Display user-friendly error messages via toast notifications
    - Log errors for debugging
    - _Requirements: 20.4, 20.5, 20.6, 20.9, 20.10_

- [x] 5. State Management with Zustand
  - [x] 5.1 Create core stores
    - Create authStore (user, isAuthenticated, login, logout, session management)
    - Create uiStore (theme, sidebarOpen, modals, toasts)
    - Configure persist middleware for authStore and uiStore
    - _Requirements: 19.1, 19.2, 19.3, 19.4_
  
  - [x] 5.2 Create feature stores
    - Create employeeStore (items, currentItem, loading, error, CRUD actions, pagination)
    - Create attendanceStore (records, currentStatus, actions)
    - Create leaveStore (requests, balances, actions)
    - Create payrollStore (records, actions)
    - Create recruitmentStore (jobs, candidates, actions)
    - Create performanceStore (goals, reviews, actions)
    - Create trainingStore (programs, certifications, actions)
    - Create benefitsStore (benefits, reimbursements, actions)
    - Create separationStore (records, checklists, actions)
    - Create notificationStore (notifications, WebSocket connection)
    - _Requirements: 19.4, 19.5_
  
  - [x] 5.3 Implement optimistic updates and error handling
    - Add optimistic update logic to stores
    - Implement revert mechanism for failed updates
    - Handle loading and error states
    - Clear sensitive data on logout
    - _Requirements: 19.6, 19.7, 19.8, 19.9, 19.10_

- [x] 6. Authentication System
  - [x] 6.1 Create login page and form
    - Create Login page component
    - Create LoginForm with email and password fields
    - Implement client-side validation (email format, required fields)
    - Handle form submission and API call
    - Display error messages for invalid credentials
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  
  - [x] 6.2 Implement MFA support
    - Create MFA verification component
    - Handle TOTP code input
    - Call verifyMFA API endpoint
    - Display error messages for invalid codes
    - _Requirements: 3.5_
  
  - [x] 6.3 Implement session management
    - Store user data in authStore after successful login
    - Implement automatic session refresh (every 25 minutes)
    - Handle session expiry with redirect to login
    - Preserve intended destination for post-login redirect
    - Implement logout functionality
    - _Requirements: 3.6, 3.7, 3.8, 3.9, 3.10_
  
  - [x] 6.4 Create ProtectedRoute component
    - Verify authentication status before rendering
    - Check user roles against required roles
    - Redirect to login if unauthenticated
    - Show unauthorized message if insufficient permissions
    - _Requirements: 3.8, 3.11_
  
  - [x] 6.5 Implement role-based access control
    - Create permission utility functions
    - Define role-permission mappings
    - Filter navigation items based on user role
    - Conditionally render UI elements based on permissions
    - _Requirements: 3.11_

- [x] 7. Layout and Navigation
  - [x] 7.1 Create MainLayout component
    - Implement responsive layout with header, sidebar, and main content
    - Handle mobile (< 768px), tablet (768-1024px), desktop (> 1024px) breakpoints
    - Manage sidebar collapse state
    - _Requirements: 4.1, 4.2_
  
  - [x] 7.2 Create Header component
    - Display logo and app title
    - Create search bar component (optional feature)
    - Create NotificationBell component with badge
    - Create ThemeToggle component
    - Create UserMenu with profile and logout options
    - Handle mobile hamburger menu toggle
    - _Requirements: 4.6, 4.7, 4.3_
  
  - [x] 7.3 Create Sidebar component
    - Render role-based navigation links with icons
    - Highlight active route
    - Display user profile summary
    - Handle mobile overlay behavior
    - Implement collapsible sidebar
    - _Requirements: 4.4, 4.5, 4.3_
  
  - [x] 7.4 Implement theme system
    - Create theme toggle functionality (light/dark mode)
    - Use CSS variables for theme colors
    - Persist theme preference in localStorage
    - Detect system theme preference on first load
    - Animate theme transitions
    - Update meta theme-color for mobile browsers
    - _Requirements: 24.1, 24.2, 24.3, 24.4, 24.5, 24.6, 24.7, 24.8, 24.9_
  
  - [x] 7.5 Create breadcrumb navigation
    - Display breadcrumb trail for nested pages
    - Make breadcrumbs clickable for navigation
    - _Requirements: 4.9_


- [-] 8. Dashboard Module
  - [x] 8.1 Create Dashboard page component
    - Create role-specific dashboard layouts
    - Implement dashboard for Super Admin (system-wide stats)
    - Implement dashboard for HR Manager (employee, leave, payroll metrics)
    - Implement dashboard for Department Manager (team attendance, performance)
    - Implement dashboard for Employee (personal attendance, leave balance, events)
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [x] 8.2 Create dashboard widgets and charts
    - Create StatCard component for metrics
    - Create LineChart component using Recharts
    - Create BarChart component using Recharts
    - Create PieChart component using Recharts
    - Display charts with loading states and empty states
    - Make charts responsive and accessible with ARIA labels
    - _Requirements: 5.6, 25.1, 25.2, 25.3, 25.4, 25.5, 25.6, 25.7, 25.8, 25.10_
  
  - [x] 8.3 Implement dashboard data fetching and refresh
    - Fetch dashboard data on mount
    - Implement automatic refresh every 5 minutes
    - Display quick action buttons for common tasks
    - Display recent notifications and alerts
    - _Requirements: 5.7, 5.8, 5.9_
  
  - [x] 8.4 Write unit tests for dashboard components
    - Test StatCard rendering and data display
    - Test chart components with mock data
    - Test role-based dashboard rendering
    - _Requirements: 30.2_

- [-] 9. Employee Management Module
  - [x] 9.1 Create Employee List page
    - Create Employees page component
    - Implement DataTable component with pagination, sorting, filtering
    - Display employee ID, name, department, position, status columns
    - Add search functionality with debouncing
    - Add column-specific filters (department, status, employment type)
    - Add "Create Employee" button (role-restricted)
    - _Requirements: 6.1, 6.2, 6.3, 17.1, 17.2, 17.3, 17.4, 17.5, 17.6_
  
  - [x] 9.2 Create Employee Detail page
    - Create EmployeeDetail page component
    - Display complete employee information in tabs (Personal, Employment, Documents, History)
    - Show emergency contacts
    - Display related records (attendance, leave, payroll)
    - Add edit mode toggle (role-restricted)
    - _Requirements: 6.4, 6.11_
  
  - [x] 9.3 Create Employee Form
    - Create EmployeeForm component for create/edit
    - Implement all employee fields with validation
    - Add profile photo upload with FileUploader
    - Validate required fields, email format, phone format
    - Handle form submission with success/error messages
    - _Requirements: 6.5, 6.6, 6.7, 6.8, 6.9, 18.1, 18.2, 18.3, 18.6, 18.7_
  
  - [x] 9.4 Implement employee import/export
    - Add bulk import via CSV upload
    - Validate CSV format and data
    - Add export functionality (CSV, Excel, PDF)
    - Display import progress and results
    - _Requirements: 6.10, 26.1, 26.2, 26.3, 26.4_
  
  - [x] 9.5 Implement role-based access control
    - Restrict employee management to HR Manager and Super Admin
    - Hide create/edit/delete buttons for unauthorized roles
    - _Requirements: 6.12_
  
  - [x] 9.6 Write unit tests for employee components
    - Test EmployeeForm validation
    - Test DataTable sorting and filtering
    - Test employee service API calls
    - _Requirements: 30.2, 30.3_

- [ ] 10. Attendance Management Module
  - [x] 10.1 Create Attendance page
    - Create Attendance page component
    - Display current attendance status (checked in, checked out, absent)
    - Show check-in and check-out times
    - Display working hours for the day
    - _Requirements: 7.5_
  
  - [x] 10.2 Create AttendanceMarker component
    - Support multiple attendance modes (web, GPS, biometric)
    - Implement web check-in with timestamp capture
    - Implement GPS check-in with geolocation capture
    - Request geolocation permission for GPS mode
    - Display location accuracy indicator
    - Handle geolocation errors gracefully
    - _Requirements: 7.2, 7.3, 7.4, 28.1, 28.2, 28.5, 28.6_
  
  - [x] 10.3 Create attendance history view
    - Display attendance history in calendar view
    - Show attendance statistics (present days, absent days, late arrivals)
    - Add date range filter
    - Display attendance records in table format
    - _Requirements: 7.6, 7.7_
  
  - [x] 10.4 Implement manager attendance view
    - Allow managers to view team attendance
    - Display team attendance summary
    - _Requirements: 7.8_
  
  - [x] 10.5 Create attendance regularization form
    - Create form for regularization requests
    - Validate dates and reason
    - Submit regularization request to API
    - _Requirements: 7.9_
  
  - [x] 10.6 Implement attendance reports
    - Display attendance reports with export functionality
    - Support CSV, Excel, PDF export formats
    - _Requirements: 7.10, 26.1, 26.2, 26.3_
  
  - [x] 10.7 Write unit tests for attendance components
    - Test AttendanceMarker check-in/check-out logic
    - Test geolocation capture
    - Test attendance service API calls
    - _Requirements: 30.2, 30.3_

- [x] 11. Leave Management Module
  - [x] 11.1 Create Leave page
    - Create Leave page component
    - Display leave balance cards for each leave type
    - Show leave history table with status
    - Display leave calendar with approved leaves
    - _Requirements: 8.5, 8.6, 8.7_
  
  - [x] 11.2 Create LeaveRequestForm component
    - Create form with leave type, dates, and reason fields
    - Validate leave dates (end date after start date)
    - Check leave balance before submission
    - Display validation errors
    - Submit leave request to API
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 18.4, 18.6, 18.7_
  
  - [ ] 11.3 Create LeaveCalendar component
    - Display calendar view with approved leaves
    - Color-code leaves by type
    - Show leave details on hover
    - _Requirements: 8.7_
  
  - [ ] 11.4 Implement leave approval workflow
    - Display pending leave requests for managers
    - Create approve/reject actions
    - Add rejection reason input
    - Send notifications on status change
    - _Requirements: 8.8, 8.9, 8.10_
  
  - [ ] 11.5 Implement leave cancellation
    - Allow cancellation of pending leave requests
    - Confirm cancellation with dialog
    - _Requirements: 8.11_
  
  - [ ] 11.6 Write unit tests for leave components
    - Test LeaveRequestForm validation
    - Test leave balance calculation
    - Test leave service API calls
    - _Requirements: 30.2, 30.3_


- [ ] 12. Payroll Management Module
  - [ ] 12.1 Create Payroll page
    - Create Payroll page component
    - Display employee salary details and components
    - Show statutory deductions (PF, ESI, tax)
    - Display payroll history table
    - Restrict access to Finance and HR roles
    - _Requirements: 9.1, 9.2, 9.4, 9.8, 9.10_
  
  - [ ] 12.2 Implement payroll processing
    - Create payroll processing interface
    - Calculate salary based on attendance data
    - Allow manual adjustments to salary components
    - Support bulk payroll processing
    - Display payroll summary and statistics
    - _Requirements: 9.3, 9.5, 9.9, 9.11_
  
  - [ ] 12.3 Implement payslip generation and download
    - Generate payslips for selected employees
    - Download payslips in PDF format
    - Handle file download with progress indicator
    - _Requirements: 9.6, 9.7, 26.4_
  
  - [ ] 12.4 Write unit tests for payroll components
    - Test salary calculation logic
    - Test payslip generation
    - Test payroll service API calls
    - _Requirements: 30.2, 30.3_

- [ ] 13. Recruitment Management Module
  - [ ] 13.1 Create Recruitment Dashboard page
    - Create Recruitment page component
    - Display active job postings with applicant count
    - Show recruitment pipeline metrics
    - Restrict access to HR Manager and Super Admin
    - _Requirements: 10.2, 10.9_
  
  - [ ] 13.2 Create job posting management
    - Create JobPostingForm for creating/editing job postings
    - Display job posting details
    - Validate required fields
    - _Requirements: 10.1_
  
  - [ ] 13.3 Create candidate management
    - Display candidate list for each job posting
    - Show candidate details and resume
    - Track candidate status through hiring stages
    - _Requirements: 10.3, 10.4, 10.6_
  
  - [ ] 13.4 Implement interview scheduling
    - Create interview scheduling form
    - Display scheduled interviews
    - Create interview feedback form
    - _Requirements: 10.5, 10.7_
  
  - [ ] 13.5 Implement job offer management
    - Create job offer form
    - Send job offers to candidates
    - Track offer status
    - _Requirements: 10.8_
  
  - [ ] 13.6 Implement candidate communication
    - Support email communication with candidates
    - Display communication history
    - _Requirements: 10.10_
  
  - [ ] 13.7 Write unit tests for recruitment components
    - Test JobPostingForm validation
    - Test candidate status tracking
    - Test recruitment service API calls
    - _Requirements: 30.2, 30.3_

- [ ] 14. Performance Management Module
  - [ ] 14.1 Create Performance page
    - Create Performance page component
    - Display employee goals with progress tracking
    - Show review history
    - Display performance analytics and trends
    - _Requirements: 11.2, 11.5, 11.8_
  
  - [ ] 14.2 Create goal management
    - Create GoalForm for setting OKRs and KPIs
    - Display goals with progress bars
    - Allow updating goal progress and status
    - _Requirements: 11.1, 11.3_
  
  - [ ] 14.3 Create performance review system
    - Create PerformanceReviewForm
    - Display review history for each employee
    - Calculate performance ratings and scores
    - Send reminders for pending reviews
    - _Requirements: 11.4, 11.7, 11.10_
  
  - [ ] 14.4 Implement 360-degree feedback
    - Create feedback collection form
    - Support multiple feedback sources
    - Display aggregated feedback
    - _Requirements: 11.6_
  
  - [ ] 14.5 Implement continuous feedback
    - Create quick feedback form
    - Display feedback timeline
    - _Requirements: 11.9_
  
  - [ ] 14.6 Write unit tests for performance components
    - Test GoalForm validation
    - Test progress calculation
    - Test performance service API calls
    - _Requirements: 30.2, 30.3_

- [ ] 15. Training and Certification Module
  - [ ] 15.1 Create Training page
    - Create Training page component
    - Display available training programs
    - Show enrolled programs with completion status
    - Display training completion reports
    - _Requirements: 12.1, 12.3, 12.9_
  
  - [ ] 15.2 Implement training enrollment
    - Allow employees to enroll in training programs
    - Display enrollment confirmation
    - Allow managers to assign training to employees
    - _Requirements: 12.2, 12.8_
  
  - [ ] 15.3 Create certification management
    - Create certification management page
    - Allow uploading certification documents
    - Display certification expiry dates and alerts
    - Display employee skill matrix
    - _Requirements: 12.4, 12.5, 12.6, 12.7_
  
  - [ ] 15.4 Implement skill gap analysis
    - Display skill gap analysis reports
    - Recommend training based on gaps
    - _Requirements: 12.10_
  
  - [ ] 15.5 Write unit tests for training components
    - Test training enrollment logic
    - Test certification expiry alerts
    - Test training service API calls
    - _Requirements: 30.2, 30.3_

- [ ] 16. Benefits Management Module
  - [ ] 16.1 Create Benefits page
    - Create Benefits page component
    - Display employee benefits overview
    - Show health insurance details and coverage
    - Display PF and gratuity information
    - Display rewards and recognition
    - _Requirements: 13.1, 13.2, 13.3, 13.9_
  
  - [ ] 16.2 Implement reimbursement management
    - Create ReimbursementForm for submitting requests
    - Display reimbursement history and status
    - Allow uploading reimbursement receipts with FileUploader
    - _Requirements: 13.4, 13.5, 13.6_
  
  - [ ] 16.3 Implement loan management
    - Display loan information and repayment schedule
    - Create loan application form
    - _Requirements: 13.7, 13.8_
  
  - [ ] 16.4 Implement benefit plan management
    - Allow HR to manage benefit plans
    - Display benefit plan details
    - _Requirements: 13.10_
  
  - [ ] 16.5 Write unit tests for benefits components
    - Test ReimbursementForm validation
    - Test loan calculation logic
    - Test benefits service API calls
    - _Requirements: 30.2, 30.3_


- [ ] 17. Separation and Offboarding Module
  - [ ] 17.1 Create Separation page
    - Create Separation page component
    - Display separation history and reports
    - Restrict access to HR Manager and Super Admin
    - _Requirements: 14.7, 14.10_
  
  - [ ] 17.2 Implement separation initiation
    - Create SeparationForm for initiating separation
    - Validate required fields (type, dates, reason)
    - _Requirements: 14.1_
  
  - [ ] 17.3 Create separation checklist
    - Display separation checklist with pending tasks
    - Track asset recovery status
    - Allow marking tasks as complete
    - Send notifications for pending tasks
    - _Requirements: 14.2, 14.3, 14.8_
  
  - [ ] 17.4 Implement final settlement calculation
    - Calculate full and final settlement
    - Display settlement breakdown
    - _Requirements: 14.4_
  
  - [ ] 17.5 Implement exit interview and documents
    - Create exit interview form
    - Generate relieving letters and certificates
    - _Requirements: 14.5, 14.6_
  
  - [ ] 17.6 Implement employee separation view
    - Allow employees to view their separation status
    - Display pending tasks and settlement details
    - _Requirements: 14.9_
  
  - [ ] 17.7 Write unit tests for separation components
    - Test SeparationForm validation
    - Test settlement calculation
    - Test separation service API calls
    - _Requirements: 30.2, 30.3_

- [ ] 18. Document Management and File Upload
  - [ ] 18.1 Create FileUploader component
    - Support multiple file formats (PDF, DOC, DOCX, JPG, PNG)
    - Validate file size (maximum 10MB per file)
    - Validate file type before upload
    - Display error messages for invalid files
    - Show upload progress indicator
    - Support drag-and-drop file selection
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6_
  
  - [ ] 18.2 Create document list and management
    - Display uploaded documents in a list
    - Show document metadata (name, size, upload date)
    - Allow downloading documents
    - Allow deleting documents (with authorization)
    - Support document preview for images and PDFs
    - _Requirements: 15.7, 15.8, 15.9, 15.10, 15.11_
  
  - [ ] 18.3 Write unit tests for file upload components
    - Test file validation logic
    - Test upload progress tracking
    - Test file service API calls
    - _Requirements: 30.2, 30.3_

- [ ] 19. Notification System
  - [ ] 19.1 Create NotificationBell component
    - Display notification bell icon in header
    - Show unread notification count as badge
    - Display notification dropdown on click
    - Show notification title, message, and timestamp
    - _Requirements: 16.1, 16.2, 16.3, 16.4_
  
  - [ ] 19.2 Implement notification actions
    - Mark notifications as read when viewed
    - Provide "Mark all as read" action
    - Allow viewing notification history
    - _Requirements: 16.5, 16.6, 16.9_
  
  - [ ] 19.3 Create Toast notification system
    - Display toast notifications for real-time events
    - Support different notification types (info, success, warning, error)
    - Auto-dismiss toasts after 5 seconds
    - Stack multiple toasts
    - _Requirements: 16.7, 16.8, 16.10_
  
  - [ ] 19.4 Implement WebSocket integration
    - Establish WebSocket connection to backend
    - Reconnect automatically when connection is lost
    - Display connection status indicator
    - Update UI automatically when new data is available
    - Display real-time notifications for important events
    - Handle WebSocket errors gracefully
    - Fall back to polling when WebSocket is unavailable
    - Close WebSocket connection on logout
    - _Requirements: 27.1, 27.2, 27.3, 27.4, 27.5, 27.7, 27.8, 27.10_
  
  - [ ] 19.5 Write unit tests for notification components
    - Test NotificationBell rendering
    - Test toast notification display and dismissal
    - Test WebSocket connection and reconnection
    - _Requirements: 30.2, 30.3_

- [ ] 20. Search and Filter Functionality
  - [ ] 20.1 Implement DataTable search and filters
    - Add search input field to DataTable
    - Filter results in real-time as user types
    - Debounce search input to reduce API calls
    - _Requirements: 17.1, 17.2, 22.4_
  
  - [ ] 20.2 Implement column-specific filters
    - Support date range filters for date columns
    - Support dropdown filters for enum columns
    - Support text filters for string columns
    - Display active filters with clear indicators
    - _Requirements: 17.3, 17.4, 17.5, 17.6_
  
  - [ ] 20.3 Implement filter management
    - Allow clearing individual filters
    - Provide "Clear all filters" action
    - Persist filter state in URL query parameters
    - Display "No results found" message when filters return empty results
    - _Requirements: 17.7, 17.8, 17.9, 17.10_
  
  - [ ] 20.4 Write unit tests for search and filter
    - Test search debouncing
    - Test filter application
    - Test URL query parameter persistence
    - _Requirements: 30.2_

- [ ] 21. Form Handling and Validation
  - [ ] 21.1 Create form validation utilities
    - Create validation schemas using Zod
    - Create useFormValidation custom hook
    - Implement field-level validation (on blur)
    - Implement form-level validation (on submit)
    - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5, 18.9_
  
  - [ ] 21.2 Implement form error display
    - Display error messages below invalid fields
    - Display error summary at top of form
    - Clear error messages when user corrects input
    - _Requirements: 18.6, 18.8, 18.10_
  
  - [ ] 21.3 Implement form submission handling
    - Prevent form submission when validation fails
    - Disable submit buttons during API calls
    - Display loading state during submission
    - Show success/error messages after submission
    - _Requirements: 18.7, 18.11_
  
  - [ ] 21.4 Write unit tests for form validation
    - Test validation schemas
    - Test useFormValidation hook
    - Test form submission flow
    - _Requirements: 30.1, 30.2_


- [ ] 22. Data Visualization and Charts
  - [ ] 22.1 Create chart components
    - Create LineChart component using Recharts
    - Create BarChart component using Recharts
    - Create PieChart component using Recharts
    - Make charts responsive to screen size
    - _Requirements: 25.1, 25.2, 25.3, 25.4_
  
  - [ ] 22.2 Implement chart features
    - Provide chart legends and labels
    - Support chart interactions (hover tooltips, click events)
    - Display loading states while fetching chart data
    - Handle empty data gracefully
    - Ensure charts are accessible with ARIA labels
    - _Requirements: 25.5, 25.6, 25.7, 25.8, 25.10_
  
  - [ ] 22.3 Implement chart export
    - Allow exporting charts as images
    - _Requirements: 25.9_
  
  - [ ] 22.4 Write unit tests for chart components
    - Test chart rendering with mock data
    - Test chart interactions
    - Test empty state handling
    - _Requirements: 30.2_

- [ ] 23. Export and Reporting Functionality
  - [ ] 23.1 Implement data export
    - Add export functionality to DataTable
    - Support export formats (CSV, Excel, PDF)
    - Include filtered data in exports
    - Display export progress indicator
    - _Requirements: 26.1, 26.2, 26.3, 26.4_
  
  - [ ] 23.2 Implement report generation
    - Generate reports with proper formatting
    - Include report metadata (generated date, user, filters)
    - Allow printing reports
    - Optimize print layouts with CSS
    - _Requirements: 26.5, 26.6, 26.7, 26.8_
  
  - [ ] 23.3 Handle large exports
    - Handle large exports without freezing the UI
    - Provide download links for generated reports
    - _Requirements: 26.9, 26.10_
  
  - [ ] 23.4 Write unit tests for export functionality
    - Test CSV generation
    - Test PDF generation
    - Test export with filters
    - _Requirements: 30.2, 30.3_

- [ ] 24. Geo-tracking and Maps Integration
  - [ ] 24.1 Implement geolocation capture
    - Request geolocation permission from user
    - Capture current location when permission is granted
    - Display location accuracy indicator
    - Handle geolocation errors gracefully
    - Respect user privacy and location permissions
    - _Requirements: 28.1, 28.2, 28.5, 28.6, 28.10_
  
  - [ ] 24.2 Implement map display
    - Display location on Google Maps
    - Validate location against allowed geofences
    - Display travel history on a map
    - Display location-based attendance records
    - _Requirements: 28.3, 28.4, 28.7, 28.9_
  
  - [ ] 24.3 Implement distance calculation
    - Calculate distance traveled
    - Display travel statistics
    - _Requirements: 28.8_
  
  - [ ] 24.4 Write unit tests for geolocation
    - Test geolocation permission handling
    - Test location capture
    - Test geofence validation
    - _Requirements: 30.2, 30.3_

- [ ] 25. Hierarchy and Organization Chart
  - [ ] 25.1 Create OrgChart component
    - Display interactive organization chart
    - Show employee names, positions, and photos
    - Support expanding and collapsing hierarchy levels
    - Highlight reporting relationships
    - _Requirements: 29.1, 29.2, 29.3, 29.4_
  
  - [ ] 25.2 Implement org chart interactions
    - Allow clicking on employees to view details
    - Support searching within the org chart
    - Display team size for each manager
    - _Requirements: 29.5, 29.6, 29.7_
  
  - [ ] 25.3 Implement responsive org chart
    - Make org chart responsive for mobile devices
    - Allow exporting org chart as an image
    - Display department-specific org charts
    - _Requirements: 29.8, 29.9, 29.10_
  
  - [ ] 25.4 Write unit tests for org chart
    - Test org chart rendering
    - Test expand/collapse functionality
    - Test search within org chart
    - _Requirements: 30.2_

- [ ] 26. Accessibility Compliance
  - [ ] 26.1 Implement keyboard navigation
    - Provide keyboard navigation for all interactive elements
    - Support tab navigation in logical order
    - Provide visible focus indicators
    - Provide skip navigation links
    - _Requirements: 21.1, 21.2, 21.3, 21.10_
  
  - [ ] 26.2 Implement ARIA attributes
    - Include ARIA labels for all interactive elements
    - Provide alt text for all images
    - Announce dynamic content changes to screen readers
    - Support screen reader navigation
    - _Requirements: 21.4, 21.5, 21.11, 21.12_
  
  - [ ] 26.3 Implement semantic HTML and color contrast
    - Use semantic HTML elements
    - Maintain color contrast ratio of at least 4.5:1 for normal text
    - Maintain color contrast ratio of at least 3:1 for large text
    - Do not rely solely on color to convey information
    - _Requirements: 21.6, 21.7, 21.8, 21.9_
  
  - [ ] 26.4 Test accessibility with automated tools
    - Run accessibility tests with axe-core or similar tools
    - Test keyboard navigation manually
    - Test with screen readers
    - _Requirements: 30.7_

- [ ] 27. Performance Optimization
  - [ ] 27.1 Implement code splitting and lazy loading
    - Implement route-based lazy loading with React.lazy
    - Lazy load images below the fold
    - Minimize bundle size using tree-shaking
    - _Requirements: 22.1, 22.2, 22.9_
  
  - [ ] 27.2 Implement virtual scrolling
    - Implement virtual scrolling for large lists (> 100 items)
    - _Requirements: 22.3_
  
  - [ ] 27.3 Implement caching and debouncing
    - Debounce search input to reduce API calls
    - Cache API responses in memory for 5 minutes
    - _Requirements: 22.4, 22.5_
  
  - [ ] 27.4 Optimize build and performance metrics
    - Achieve First Contentful Paint (FCP) under 1.5 seconds
    - Achieve Time to Interactive (TTI) under 3 seconds
    - Achieve Lighthouse performance score above 90
    - Use production builds with minification and compression
    - _Requirements: 22.6, 22.7, 22.8, 22.10_
  
  - [ ] 27.5 Run performance tests
    - Test performance with Lighthouse
    - Test bundle size
    - Test load times
    - _Requirements: 30.4_


- [ ] 28. Responsive Design and Mobile Experience
  - [ ] 28.1 Implement responsive breakpoints
    - Use responsive breakpoints (mobile: < 768px, tablet: 768-1024px, desktop: > 1024px)
    - Test on multiple devices and browsers
    - _Requirements: 23.2, 23.10_
  
  - [ ] 28.2 Optimize for mobile devices
    - Ensure full functionality on mobile devices (iOS and Android)
    - Use touch-friendly button sizes (minimum 44x44px)
    - Support touch gestures (swipe, pinch-to-zoom where appropriate)
    - Use mobile-optimized navigation (hamburger menu)
    - Prevent horizontal scrolling on mobile
    - _Requirements: 23.1, 23.3, 23.4, 23.6, 23.9_
  
  - [ ] 28.3 Optimize mobile layouts
    - Adapt form layouts for mobile screens
    - Display mobile-optimized tables (horizontal scroll or card layout)
    - Optimize images for mobile bandwidth
    - _Requirements: 23.5, 23.7, 23.8_
  
  - [ ] 28.4 Test responsive layouts
    - Test at different breakpoints
    - Test on real devices
    - Test touch interactions
    - _Requirements: 30.8_

- [ ] 29. Testing and Quality Assurance
  - [ ] 29.1 Set up testing infrastructure
    - Configure Vitest 2.0 for unit and component tests
    - Set up test utilities and mocks
    - Configure test coverage reporting
    - _Requirements: 30.5_
  
  - [ ] 29.2 Write utility function tests
    - Write unit tests for formatters
    - Write unit tests for validators
    - Write unit tests for helpers
    - _Requirements: 30.1_
  
  - [ ] 29.3 Write component tests
    - Write component tests for UI components
    - Mock API calls in tests
    - Test component rendering and interactions
    - _Requirements: 30.2, 30.6_
  
  - [ ] 29.4 Write integration tests
    - Write integration tests for API services
    - Test API error handling
    - Test authentication flow
    - _Requirements: 30.3_
  
  - [ ] 29.5 Achieve code coverage goals
    - Achieve minimum 80% code coverage
    - Generate coverage reports
    - _Requirements: 30.4_
  
  - [ ] 29.6 Set up CI/CD pipeline
    - Run tests in CI/CD pipeline before deployment
    - Fail builds on test failures
    - _Requirements: 30.10_

- [ ] 30. Final Integration and Polish
  - [ ] 30.1 Implement error boundaries
    - Create error boundary components
    - Display user-friendly error messages
    - Log errors for debugging
    - _Requirements: 20.10_
  
  - [ ] 30.2 Implement loading states
    - Add loading skeletons for all pages
    - Display loading indicators during API calls
    - Show progress bars for long operations
    - _Requirements: 22.5_
  
  - [ ] 30.3 Implement empty states
    - Create empty state components for all lists
    - Display helpful messages and actions
    - _Requirements: 17.10, 25.8_
  
  - [ ] 30.4 Optimize bundle size
    - Analyze bundle size with Vite build analyzer
    - Remove unused dependencies
    - Optimize imports
    - _Requirements: 22.9_
  
  - [ ] 30.5 Create user documentation
    - Document key features and workflows
    - Create user guide for common tasks
    - Document keyboard shortcuts
    - _Requirements: General best practice_
  
  - [ ] 30.6 Perform end-to-end testing
    - Test critical user flows (login, attendance, leave request, payroll)
    - Test across different browsers (Chrome, Firefox, Safari, Edge)
    - Test on different devices (desktop, tablet, mobile)
    - _Requirements: 30.9_
  
  - [ ] 30.7 Final accessibility audit
    - Run automated accessibility tests
    - Perform manual keyboard navigation testing
    - Test with screen readers
    - Fix any accessibility issues
    - _Requirements: 21.1-21.12, 30.7_
  
  - [ ] 30.8 Performance audit
    - Run Lighthouse performance audit
    - Optimize any performance bottlenecks
    - Verify FCP, TTI, and performance score targets
    - _Requirements: 22.6, 22.7, 22.8_
  
  - [ ] 30.9 Security review
    - Review authentication and authorization implementation
    - Ensure no sensitive data in localStorage
    - Verify CSRF protection
    - Review API error handling
    - _Requirements: Security best practices_
  
  - [ ] 30.10 Deployment preparation
    - Create production build
    - Test production build locally
    - Configure environment variables for production
    - Prepare deployment documentation
    - _Requirements: 1.8_

- [ ] 31. Checkpoint - Final Review
  - Ensure all tests pass
  - Verify all features work as expected
  - Review code quality and documentation
  - Ask the user if any questions or issues arise

## Notes

- Tasks marked with `*` are optional testing tasks and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- The implementation follows a layered approach: foundation → infrastructure → authentication → layout → features → optimization
- All API integration assumes the backend API is running and accessible
- PWA features require HTTPS in production
- Geolocation features require user permission
- WebSocket features require WebSocket server support in backend
- Testing tasks are marked optional but highly recommended for production quality
- The checkpoint task ensures validation before considering the implementation complete

