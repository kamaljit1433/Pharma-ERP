C:\Users\kamal\Downloads\Pharma-ERP\frontend>npm test -- attendance

> @ems/frontend@1.0.0 test
> vitest attendance

▲ [WARNING] Unrecognized target environment "ES2024" [tsconfig.json]

    tsconfig.json:4:14:
      4 │     "target": "ES2024",
        ╵               ~~~~~~~~


 DEV  v2.1.9 C:/Users/kamal/Downloads/Pharma-ERP/frontend

12:25:28 pm [vite] warning: Unrecognized target environment "ES2024"
1  |  import '@testing-library/jest-dom';
2  |  import { expect, afterEach, vi } from 'vitest';
   |               ^
3  |  import { cleanup } from '@testing-library/react';
4  |

  Plugin: vite:esbuild
  File: C:/Users/kamal/Downloads/Pharma-ERP/frontend/src/setupTests.ts
12:25:28 pm [vite] warning: Unrecognized target environment "ES2024"
1  |  /**
2  |   * Attendance Service Tests
3  |   * Tests for API calls and service layer functionality
   |                   ^
4  |   *
5  |   * Requirements Tested:

  Plugin: vite:esbuild
  File: C:/Users/kamal/Downloads/Pharma-ERP/frontend/src/services/__tests__/attendanceService.test.ts
12:25:28 pm [vite] warning: Unrecognized target environment "ES2024"
1  |  /**
2  |   * Attendance Reports Component Tests
3  |   * Tests for attendance report display and export functionality
   |         ^
4  |   * Requirements: 7.10, 26.1, 26.2, 26.3
5  |   */

  Plugin: vite:esbuild
  File: C:/Users/kamal/Downloads/Pharma-ERP/frontend/src/components/attendance/__tests__/AttendanceReports.test.tsx
12:25:28 pm [vite] warning: Unrecognized target environment "ES2024"
1  |  /**
2  |   * Attendance Store Tests
3  |   * Tests for Zustand state management and store actions
   |                     ^
4  |   *
5  |   * Requirements Tested:

  Plugin: vite:esbuild
  File: C:/Users/kamal/Downloads/Pharma-ERP/frontend/src/store/__tests__/attendanceStore.test.ts
12:25:28 pm [vite] warning: Unrecognized target environment "ES2024"
1  |  /**
2  |   * AttendanceMarker Component Tests
3  |   * Tests for check-in/check-out logic, geolocation capture, and API calls
   |           ^
4  |   *
5  |   * Requirements Tested:

  Plugin: vite:esbuild
  File: C:/Users/kamal/Downloads/Pharma-ERP/frontend/src/components/attendance/__tests__/AttendanceMarker.test.tsx
12:25:28 pm [vite] warning: Unrecognized target environment "ES2024"
2  |
3  |  // Types
4  |  export interface AttendanceRecord {
   |          ^
5  |    id: string;
6  |    employee_id: string;

  Plugin: vite:esbuild
  File: C:/Users/kamal/Downloads/Pharma-ERP/frontend/src/services/attendanceService.ts
12:25:28 pm [vite] warning: Unrecognized target environment "ES2024"
1  |  import { create } from 'zustand';
2  |  import attendanceService, {
   |                 ^
3  |    AttendanceRecord,
4  |    MarkAttendanceDTO,

  Plugin: vite:esbuild
  File: C:/Users/kamal/Downloads/Pharma-ERP/frontend/src/store/attendanceStore.ts
12:25:28 pm [vite] warning: Unrecognized target environment "ES2024"
1  |  /**
2  |   * Attendance Marker Component
3  |   * Supports multiple attendance modes: web, GPS, biometric
   |                ^
4  |   * Handles check-in/check-out with location capture
5  |   *

  Plugin: vite:esbuild
  File: C:/Users/kamal/Downloads/Pharma-ERP/frontend/src/components/attendance/AttendanceMarker.tsx
 · src/services/__tests__/attendanceService.test.ts (35)
12:25:28 pm [vite] warning: Unrecognized target environment "ES2024"
1  |  /**
2  |   * Attendance Reports Component
3  |   * Displays attendance reports with export functionality
   |               ^
4  |   * Supports CSV, Excel, PDF export formats
5  |   * Requirements: 7.10, 26.1, 26.2, 26.3

  Plugin: vite:esbuild
 ✓ src/services/__tests__/attendanceService.test.ts (35)
 · src/store/__tests__/attendanceStore.test.ts (28)
12:25:29 pm [vite] warning: Unrecognized target environment "ES2024"
1  |  import * as React from 'react';
2  |  import { Slot } from '@radix-ui/react-slot';
   |                   ^
3  |  import { cva, type VariantProps } from 'class-variance-authority';
4  |  import { cn } from '@/lib/utils';

  Plugin: vite:esbuild
  File: C:/Users/kamal/Downloads/Pharma-ERP/frontend/src/components/ui/button.tsx
12:25:29 pm [vite] warning: Unrecognized target environment "ES2024"
1  |  import { type ClassValue, clsx } from 'clsx';
2  |  import { twMerge } from 'tailwind-merge';
   |     ^
3  |
4  |  export function cn(...inputs: ClassValue[]) {

  Plugin: vite:esbuild
  File: C:/Users/kamal/Downloads/Pharma-ERP/frontend/src/lib/utils.ts
12:25:29 pm [vite] warning: Unrecognized target environment "ES2024"
1  |  import * as React from "react"
2  |  import * as DialogPrimitive from "@radix-ui/react-dialog"
   |                    ^
3  |  import { X } from "lucide-react"
4  |

  Plugin: vite:esbuild
  File: C:/Users/kamal/Downloads/Pharma-ERP/frontend/src/components/ui/dialog.tsx
12:25:29 pm [vite] warning: Unrecognized target environment "ES2024"
1  |  import * as React from 'react';
2  |  import { cn } from '@/lib/utils';
   |                   ^
3  |
4  |  const Card = React.forwardRef<

  Plugin: vite:esbuild
  File: C:/Users/kamal/Downloads/Pharma-ERP/frontend/src/components/ui/card.tsx
12:25:29 pm [vite] warning: Unrecognized target environment "ES2024"
1  |  import * as React from 'react';
2  |  import { cn } from '@/lib/utils';
   |                   ^
3  |
4  |  export interface InputProps

  Plugin: vite:esbuild
  File: C:/Users/kamal/Downloads/Pharma-ERP/frontend/src/components/ui/input.tsx
12:25:29 pm [vite] warning: Unrecognized target environment "ES2024"
1  |  import * as React from 'react';
2  |  import * as LabelPrimitive from '@radix-ui/react-label';
   |                   ^
3  |  import { cva, type VariantProps } from 'class-variance-authority';
4  |  import { cn } from '@/lib/utils';

 ✓ src/services/__tests__/attendanceService.test.ts (35)
 ✓ src/store/__tests__/attendanceStore.test.ts (28)
 · src/components/attendance/__tests__/AttendanceReports.test.tsx (20)
12:25:29 pm [vite] warning: Unrecognized target environment "ES2024"
1  |  import * as React from 'react';
2  |  import { cva, type VariantProps } from 'class-variance-authority';
   |                   ^
3  |  import { cn } from '@/lib/utils';
4  |

  Plugin: vite:esbuild
  File: C:/Users/kamal/Downloads/Pharma-ERP/frontend/src/components/ui/badge.tsx
12:25:29 pm [vite] warning: Unrecognized target environment "ES2024"
1  |  import * as React from 'react';
2  |  import * as TabsPrimitive from '@radix-ui/react-tabs';
   |                   ^
3  |
4  |  import { cn } from '@/lib/utils';
stderr | src/components/attendance/__tests__/AttendanceMarker.test.tsx > AttendanceMarker Component > Component Rendering > should open dialog when button is clicked
Warning: Missing `Description` or `aria-describedby={undefined}` for {DialogContent}.

stderr | src/components/attendance/__tests__/AttendanceMarker.test.tsx > AttendanceMarker Component > Component Rendering > should display all three attendance mode tabs
Warning: Missing `Description` or `aria-describedby={undefined}` for {DialogContent}.

stderr | src/components/attendance/__tests__/AttendanceMarker.test.tsx > AttendanceMarker Component > Component Rendering > should close dialog when close button is clicked
Warning: Missing `Description` or `aria-describedby={undefined}` for {DialogContent}.

 ❯ src/components/attendance/__tests__/AttendanceMarker.test.tsx (26)
   ❯ AttendanceMarker Component (26)
     ❯ Component Rendering (4)
       ✓ should render the Mark Attendance button
       × should open dialog when button is clicked 1177ms
       ✓ should display all three attendance mode tabs
       \ should close dialog when close button is clicked
     · Web Check-in Mode (8)
     · GPS Check-in Mode (11)
     · Biometric Check-in Mode (1)
 ❯ src/components/attendance/__tests__/AttendanceMarker.test.tsx (26)
   ❯ AttendanceMarker Component (26)
     ❯ Component Rendering (4)
       ✓ should render the Mark Attendance button
       × should open dialog when button is clicked 1177ms
       ✓ should display all three attendance mode tabs
       | should close dialog when close button is clicked
     · Web Check-in Mode (8)
     · GPS Check-in Mode (11)
     · Biometric Check-in Mode (1)
 ❯ src/components/attendance/__tests__/AttendanceMarker.test.tsx (26)
   ❯ AttendanceMarker Component (26)
     ❯ Component Rendering (4)
       ✓ should render the Mark Attendance button
       × should open dialog when button is clicked 1177ms
       ✓ should display all three attendance mode tabs
       / should close dialog when close button is clicked
     · Web Check-in Mode (8)
     · GPS Check-in Mode (11)
     · Biometric Check-in Mode (1)
 ❯ src/components/attendance/__tests__/AttendanceMarker.test.tsx (26)
   ❯ AttendanceMarker Component (26)
     ❯ Component Rendering (4)
       ✓ should render the Mark Attendance button
       × should open dialog when button is clicked 1177ms
       ✓ should display all three attendance mode tabs
       - should close dialog when close button is clicked
     · Web Check-in Mode (8)
     · GPS Check-in Mode (11)
     · Biometric Check-in Mode (1)
 ❯ src/components/attendance/__tests__/AttendanceMarker.test.tsx (26)
   ❯ AttendanceMarker Component (26)
     ❯ Component Rendering (4)
       ✓ should render the Mark Attendance button
       × should open dialog when button is clicked 1177ms
       ✓ should display all three attendance mode tabs
       | should close dialog when close button is clicked
     · Web Check-in Mode (8)
     · GPS Check-in Mode (11)
     · Biometric Check-in Mode (1)
 ❯ src/components/attendance/__tests__/AttendanceMarker.test.tsx (26)
   ❯ AttendanceMarker Component (26)
     ❯ Component Rendering (4)
       ✓ should render the Mark Attendance button
       × should open dialog when button is clicked 1177ms
       ✓ should display all three attendance mode tabs
       \ should close dialog when close button is clicked
     · Web Check-in Mode (8)
 ❯ src/components/attendance/__tests__/AttendanceMarker.test.tsx (26)
   ❯ AttendanceMarker Component (26)
     ❯ Component Rendering (4)
       ✓ should render the Mark Attendance button
       × should open dialog when button is clicked 1177ms
       ✓ should display all three attendance mode tabs
       | should close dialog when close button is clicked
     · Web Check-in Mode (8)
     · GPS Check-in Mode (11)
     · Biometric Check-in Mode (1)
     · Dialog State Management (2)
 ✓ src/services/__tests__/attendanceService.test.ts (35)
 ✓ src/store/__tests__/attendanceStore.test.ts (28)
 ✓ src/components/attendance/__tests__/AttendanceReports.test.tsx (20) 1517ms
 · src/components/attendance/__tests__/RegularizationRequest.test.tsx (20)
12:25:31 pm [vite] warning: Unrecognized target environment "ES2024"
1  |  /**
2  |   * useAuth Hook
3  |   * Provides access to authentication state and actions
 ❯ src/components/attendance/__tests__/AttendanceMarker.test.tsx (26)
   ❯ AttendanceMarker Component (26)
     ❯ Component Rendering (4)
       ✓ should render the Mark Attendance button
       × should open dialog when button is clicked 1177ms
       ✓ should display all three attendance mode tabs
       / should close dialog when close button is clicked
     · Web Check-in Mode (8)
     · GPS Check-in Mode (11)
stderr | src/components/attendance/__tests__/AttendanceMarker.test.tsx > AttendanceMarker Component > Web Check-in Mode > should display web check-in tab content
Warning: Missing `Description` or `aria-describedby={undefined}` for {DialogContent}.

stderr | src/components/attendance/__tests__/AttendanceMarker.test.tsx > AttendanceMarker Component > Web Check-in Mode > should display current time in web check-in mode
Warning: Missing `Description` or `aria-describedby={undefined}` for {DialogContent}.

stderr | src/components/attendance/__tests__/AttendanceMarker.test.tsx > AttendanceMarker Component > Web Check-in Mode > should call markAttendance with web mode on check-in
Warning: Missing `Description` or `aria-describedby={undefined}` for {DialogContent}.

stderr | src/components/attendance/__tests__/AttendanceMarker.test.tsx > AttendanceMarker Component > Web Check-in Mode > should show success message after web check-in
Warning: Missing `Description` or `aria-describedby={undefined}` for {DialogContent}.

stderr | src/components/attendance/__tests__/AttendanceMarker.test.tsx > AttendanceMarker Component > Web Check-in Mode > should call onSuccess callback after web check-in
Warning: Missing `Description` or `aria-describedby={undefined}` for {DialogContent}.

stderr | src/components/attendance/__tests__/AttendanceMarker.test.tsx > AttendanceMarker Component > Web Check-in Mode > should display error message on web check-in failure
Warning: Missing `Description` or `aria-describedby={undefined}` for {DialogContent}.

stderr | src/components/attendance/__tests__/AttendanceMarker.test.tsx > AttendanceMarker Component > Web Check-in Mode > should call onError callback on web check-in failure
Warning: Missing `Description` or `aria-describedby={undefined}` for {DialogContent}.

stderr | src/components/attendance/__tests__/AttendanceMarker.test.tsx > AttendanceMarker Component > Web Check-in Mode > should disable check-in button while loading
Warning: Missing `Description` or `aria-describedby={undefined}` for {DialogContent}.

stderr | src/components/attendance/__tests__/AttendanceMarker.test.tsx > AttendanceMarker Component > GPS Check-in Mode > should display GPS check-in tab content
Warning: Missing `Description` or `aria-describedby={undefined}` for {DialogContent}.

     ❯ GPS Check-in Mode (11)
       - should display GPS check-in tab content
       · should request geolocation permission on GPS check-in
       · should capture location data on successful geolocation
       · should display location accuracy indicator
       · should show different accuracy levels based on accuracy value
       · should handle geolocation permission denied error
       · should handle geolocation unavailable error
       · should handle geolocation timeout error
       · should call markAttendance with GPS location data
     ❯ GPS Check-in Mode (11)
       | should display GPS check-in tab content
       · should request geolocation permission on GPS check-in
       · should capture location data on successful geolocation
       · should display location accuracy indicator
       · should show different accuracy levels based on accuracy value
       · should handle geolocation permission denied error
       · should handle geolocation unavailable error
       · should handle geolocation timeout error
       · should call markAttendance with GPS location data
     ❯ GPS Check-in Mode (11)
       / should display GPS check-in tab content
       · should request geolocation permission on GPS check-in
       · should capture location data on successful geolocation
       · should display location accuracy indicator
       · should show different accuracy levels based on accuracy value
       · should handle geolocation permission denied error
       · should handle geolocation unavailable error
       · should handle geolocation timeout error
       · should call markAttendance with GPS location data
     ❯ GPS Check-in Mode (11)
       | should display GPS check-in tab content
       · should request geolocation permission on GPS check-in
       · should capture location data on successful geolocation
       · should display location accuracy indicator
       · should show different accuracy levels based on accuracy value
       · should handle geolocation permission denied error
       · should handle geolocation unavailable error
       · should handle geolocation timeout error
       · should call markAttendance with GPS location data
     ❯ GPS Check-in Mode (11)
       / should display GPS check-in tab content
       · should request geolocation permission on GPS check-in
       · should capture location data on successful geolocation
       · should display location accuracy indicator
       · should show different accuracy levels based on accuracy value
       · should handle geolocation permission denied error
       · should handle geolocation unavailable error
       · should handle geolocation timeout error
       · should call markAttendance with GPS location data
stderr | src/pages/__tests__/Attendance.test.tsx > Attendance Page > should render the Attendance page with header
An update to Attendance inside a test was not wrapped in act(...).

When testing, code that causes React state updates should be wrapped into act(...):

act(() => {
  /* fire events that update state */
});
/* assert on the output */

This ensures that you're testing the behavior the user would see in the browser. Learn more at https://react.dev/link/wrap-tests-with-act

stderr | src/components/attendance/__tests__/AttendanceMarker.test.tsx > AttendanceMarker Component > GPS Check-in Mode > should request geolocation permission on GPS check-in
Warning: Missing `Description` or `aria-describedby={undefined}` for {DialogContent}.

     ✓ should render the regularization form
     ✓ should render submit and clear buttons
     ✓ should display error when date is not provided 329ms
     ✓ should display error when reason is not provided
     ✓ should submit form with valid data 787ms
     ✓ should submit form with optional check-in and check-out times 857ms
     ✓ should display success message after successful submission 558ms
     / should display status badge after successful submission
     · should display error message on submission failure
stderr | src/components/attendance/__tests__/AttendanceMarker.test.tsx > AttendanceMarker Component > GPS Check-in Mode > should capture location data on successful geolocation
Warning: Missing `Description` or `aria-describedby={undefined}` for {DialogContent}.

stderr | src/components/attendance/__tests__/AttendanceMarker.test.tsx > AttendanceMarker Component > GPS Check-in Mode > should display location accuracy indicator
Warning: Missing `Description` or `aria-describedby={undefined}` for {DialogContent}.

     ✓ should render submit and clear buttons
     ✓ should display error when date is not provided 329ms
     ✓ should display error when reason is not provided
     ✓ should submit form with valid data 787ms
     ✓ should submit form with optional check-in and check-out times 857ms
     ✓ should display success message after successful submission 558ms
     ✓ should display status badge after successful submission 597ms
     ✓ should display error message on submission failure 399ms
     ✓ should clear form when Clear button is clicked 578ms
     ✓ should disable form fields while loading 366ms
stderr | src/components/attendance/__tests__/AttendanceMarker.test.tsx > AttendanceMarker Component > GPS Check-in Mode > should show different accuracy levels based on accuracy value
Warning: Missing `Description` or `aria-describedby={undefined}` for {DialogContent}.

stderr | src/pages/__tests__/Attendance.test.tsx > Attendance Page > should display Mark Attendance button
An update to Attendance inside a test was not wrapped in act(...).

When testing, code that causes React state updates should be wrapped into act(...):

act(() => {
  /* fire events that update state */
});
/* assert on the output */

This ensures that you're testing the behavior the user would see in the browser. Learn more at https://react.dev/link/wrap-tests-with-act

stderr | src/components/attendance/__tests__/AttendanceMarker.test.tsx > AttendanceMarker Component > GPS Check-in Mode > should call markAttendance with GPS location data
Warning: Missing `Description` or `aria-describedby={undefined}` for {DialogContent}.

stderr | src/pages/__tests__/Attendance.test.tsx > Attendance Page > should display loading state initially
An update to Attendance inside a test was not wrapped in act(...).

When testing, code that causes React state updates should be wrapped into act(...):

act(() => {
  /* fire events that update state */
});
/* assert on the output */

This ensures that you're testing the behavior the user would see in the browser. Learn more at https://react.dev/link/wrap-tests-with-act

     ✓ should display error when date is not provided 329ms
     ✓ should display error when reason is not provided
     ✓ should submit form with valid data 787ms
     ✓ should submit form with optional check-in and check-out times 857ms
     ✓ should display success message after successful submission 558ms
     ✓ should display status badge after successful submission 597ms
     ✓ should display error message on submission failure 399ms
     ✓ should clear form when Clear button is clicked 578ms
     ✓ should disable form fields while loading 366ms
stderr | src/components/attendance/__tests__/AttendanceMarker.test.tsx > AttendanceMarker Component > GPS Check-in Mode > should show success message after GPS check-in
Warning: Missing `Description` or `aria-describedby={undefined}` for {DialogContent}.

stderr | src/components/attendance/__tests__/AttendanceMarker.test.tsx > AttendanceMarker Component > GPS Check-in Mode > should disable GPS check-in button when permission is denied
Warning: Missing `Description` or `aria-describedby={undefined}` for {DialogContent}.

stderr | src/components/attendance/__tests__/AttendanceMarker.test.tsx > AttendanceMarker Component > Biometric Check-in Mode > should display biometric check-in tab content
Warning: Missing `Description` or `aria-describedby={undefined}` for {DialogContent}.

stderr | src/components/attendance/__tests__/AttendanceMarker.test.tsx > AttendanceMarker Component > Dialog State Management > should reset state when dialog is closed
Warning: Missing `Description` or `aria-describedby={undefined}` for {DialogContent}.

stderr | src/components/attendance/__tests__/AttendanceMarker.test.tsx > AttendanceMarker Component > Dialog State Management > should switch between tabs without losing state
Warning: Missing `Description` or `aria-describedby={undefined}` for {DialogContent}.

stderr | src/pages/__tests__/Attendance.test.tsx > Attendance Page > should be responsive and display grid layout
An update to Attendance inside a test was not wrapped in act(...).

When testing, code that causes React state updates should be wrapped into act(...):

act(() => {
  /* fire events that update state */
});
/* assert on the output */

This ensures that you're testing the behavior the user would see in the browser. Learn more at https://react.dev/link/wrap-tests-with-act

       × should display location accuracy indicator 1075ms
       × should show different accuracy levels based on accuracy value 1074ms
       × should handle geolocation permission denied error
       × should handle geolocation unavailable error
       × should handle geolocation timeout error
       × should call markAttendance with GPS location data 1063ms
       × should show success message after GPS check-in 1067ms
       × should disable GPS check-in button when permission is denied 1082ms
     ❯ Biometric Check-in Mode (1) 1083ms
       × should display biometric check-in tab content 1083ms
       × should display location accuracy indicator 1075ms
       × should show different accuracy levels based on accuracy value 1074ms
       × should handle geolocation permission denied error
       × should handle geolocation unavailable error
       × should handle geolocation timeout error
       × should call markAttendance with GPS location data 1063ms
       × should show success message after GPS check-in 1067ms
       × should disable GPS check-in button when permission is denied 1082ms
     ❯ Biometric Check-in Mode (1) 1083ms
       × should display biometric check-in tab content 1083ms
       × should display location accuracy indicator 1075ms
       × should show different accuracy levels based on accuracy value 1074ms
       × should handle geolocation permission denied error
       × should handle geolocation unavailable error
       × should handle geolocation timeout error
       × should call markAttendance with GPS location data 1063ms
       × should show success message after GPS check-in 1067ms
       × should disable GPS check-in button when permission is denied 1082ms
     ❯ Biometric Check-in Mode (1) 1083ms
       × should display biometric check-in tab content 1083ms
 ❯ e2e/attendance.spec.ts (0)
 ❯ src/pages/__tests__/Attendance.test.tsx (17) 9438ms
   ❯ Attendance Page (17) 9438ms
     ✓ should render the Attendance page with header
     × should display current status card with today's information 1040ms
     × should display check-in time in readable format 1007ms
     × should display check-out time in readable format 1008ms
     ✓ should display working hours for the day
     × should display attendance statistics 1008ms
     × should display Mark Attendance button
     ✓ should display tabs for History and Regularization
     ✓ should fetch attendance data on mount
     × should display error message when data fetch fails 1023ms
     ✓ should display loading state initially
     × should display correct status badge for present status 1011ms
     × should display correct status badge for absent status 1015ms
     × should display correct status badge for half day status 1010ms
     ✓ should display dash when check-in time is not available
     × should display statistics with correct values 1013ms
     × should be responsive and display grid layout
 ✓ src/services/__tests__/attendanceService.test.ts (35)
 ✓ src/store/__tests__/attendanceStore.test.ts (28)
 ❯ src/components/attendance/__tests__/AttendanceCheckIn.test.tsx (0)
 ✓ src/components/attendance/__tests__/AttendanceHistory.test.tsx (21) 1175ms
 ❯ src/components/attendance/__tests__/AttendanceMarker.test.tsx (26) 14517ms
   ❯ AttendanceMarker Component (26) 14516ms
     ❯ Component Rendering (4) 2602ms
       ✓ should render the Mark Attendance button
       × should open dialog when button is clicked 1177ms
       ✓ should display all three attendance mode tabs
       × should close dialog when close button is clicked 1079ms
     ✓ Web Check-in Mode (8) 901ms
     ❯ GPS Check-in Mode (11) 8766ms
       × should display GPS check-in tab content 1094ms
       × should request geolocation permission on GPS check-in 1142ms
       × should capture location data on successful geolocation 1166ms
       × should display location accuracy indicator 1075ms
       × should show different accuracy levels based on accuracy value 1074ms
       × should handle geolocation permission denied error
       × should handle geolocation unavailable error
       × should handle geolocation timeout error
       × should call markAttendance with GPS location data 1063ms
       × should show success message after GPS check-in 1067ms
       × should disable GPS check-in button when permission is denied 1082ms
     ❯ Biometric Check-in Mode (1) 1083ms
       × should display biometric check-in tab content 1083ms
     ❯ Dialog State Management (2) 1163ms
       × should reset state when dialog is closed
       × should switch between tabs without losing state 1063ms
 ✓ src/components/attendance/__tests__/AttendanceReports.test.tsx (20) 1517ms
 ✓ src/components/attendance/__tests__/attendanceService.test.ts (13)
 ✓ src/components/attendance/__tests__/ManagerAttendanceView.test.tsx (13) 610ms
 ✓ src/components/attendance/__tests__/RegularizationRequest.test.tsx (20) 9951ms

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ Failed Suites 2 ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯

 FAIL  e2e/attendance.spec.ts [ e2e/attendance.spec.ts ]
Error: Playwright Test did not expect test.describe() to be called here.
Most common reasons include:
- You are calling test.describe() in a configuration file.
- You are calling test.describe() in a file that is imported by the configuration file.
- You have two different versions of @playwright/test. This usually happens
  when one of the dependencies in your package.json depends on @playwright/test.
 ❯ TestTypeImpl._currentSuite ../node_modules/playwright/lib/common/testType.js:75:13
 ❯ TestTypeImpl._describe ../node_modules/playwright/lib/common/testType.js:115:24
 ❯ Function.describe ../node_modules/playwright/lib/transform/transform.js:282:12
 ❯ e2e/attendance.spec.ts:10:6
      8|  */
      9|
     10| test.describe('Attendance Management', () => {
       |      ^
     11|   test.beforeEach(async ({ page }) => {
     12|     // Login as employee

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/29]⎯

 FAIL  src/components/attendance/__tests__/AttendanceCheckIn.test.tsx [ src/components/attendance/__tests__/AttendanceCheckIn.test.tsx ]
Error: Failed to resolve import "@tensorflow/tfjs" from "src/services/faceDetectionService.ts". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/kamal/Downloads/Pharma-ERP/frontend/src/services/faceDetectionService.ts:46:30
  20 |    async _initializeModelInternal() {
  21 |      try {
  22 |        const tf = await import("@tensorflow/tfjs");
     |                                ^
  23 |        const blazeface = await import("@tensorflow-models/blazeface");
  24 |        this.model = await blazeface.load();
 ❯ TransformPluginContext._formatError ../node_modules/vitest/node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:49258:41
 ❯ TransformPluginContext.error ../node_modules/vitest/node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:49253:16
 ❯ normalizeUrl ../node_modules/vitest/node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:64307:23
 ❯ ../node_modules/vitest/node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:64439:39
 ❯ TransformPluginContext.transform ../node_modules/vitest/node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:64366:7
 ❯ PluginContainer.transform ../node_modules/vitest/node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:49099:18
 ❯ loadAndTransform ../node_modules/vitest/node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:51978:27

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/29]⎯

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ Failed Tests 27 ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯

 FAIL  src/pages/__tests__/Attendance.test.tsx > Attendance Page > should display current status card with today's information
TestingLibraryElementError: Found multiple elements with the text: Present

Here are the matching elements:

Ignored nodes: comments, script, style
<div
  class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent hover:bg-primary/80 bg-success text-success-foreground"
>
  Present
</div>

Ignored nodes: comments, script, style
<span
  class="text-xs"
>
  Present
</span>

(If this is intentional, then use the `*AllBy*` variant of the query (like `queryAllByText`, `getAllByText`, or `findAllByText`)).

Ignored nodes: comments, script, style
<body>
  <div>
    <div
      class="space-y-6"
    >
      <div
        class="flex items-center justify-between"
      >
        <h1
          class="text-3xl font-bold"
        >
          Attendance
        </h1>
        <button
          class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 gap-2"
        >
          <svg
            aria-hidden="true"
            class="lucide lucide-circle-check w-4 h-4"
            fill="none"
            height="24"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            viewBox="0 0 24 24"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
            />
            <path
              d="m9 12 2 2 4-4"
            />
          </svg>
          Mark Attendance
        </button>
      </div>
      <div
        class="rounded-lg border bg-card text-card-foreground shadow-sm"
      >
        <div
          class="flex flex-col space-y-1.5 p-6"
        >
          <h3
            class="text-2xl font-semibold leading-none tracking-tight flex items-center gap-2"
          >
            <svg
              aria-hidden="true"
              class="lucide lucide-clock w-5 h-5"
              fill="none"
              height="24"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              viewBox="0 0 24 24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
              />
              <path
                d="M12 6v6l4 2"
              />
            </svg>
            Today's Status
          </h3>
        </div>
        <div
          class="p-6 pt-0"
        >
          <div
            class="grid grid-cols-1 md:grid-cols-4 gap-4"
          >
            <div
              class="space-y-2"
            >
              <p
                class="text-sm text-muted-foreground"
              >
                Status
              </p>
              <div
                class="flex items-center gap-2"
              >
                <svg
                  aria-hidden="true"
                  class="lucide lucide-circle-check w-5 h-5"
                  fill="none"
                  height="24"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  viewBox="0 0 24 24"
                  width="24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                  />
                  <path
                    d="m9 12 2 2 4-4"
                  />
                </svg>
                <div
                  class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent hover:bg-primary/80 bg-success text-success-foreground"
                >
                  Present
                </div>
              </div>
            </div>
            <div
              class="space-y-2"
            >
              <p
                class="text-sm text-muted-foreground"
              >
                Check-in Time
              </p>
              <p
                class="text-lg font-semibold"
              >
                02:30 PM
              </p>
            </div>
            <div
              class="space-y-2"
            >
              <p
                class="text-sm text-muted-foreground"
              >
                Check-out Time
              </p>
              <p
                class="text-lg font-semibold"
              >
                11:00 PM
              </p>
            </div>
            <div
              class="space-y-2"
            >
              <p
                class="text-sm text-muted-foreground"
              >
                Working Hours
              </p>
              <p
                class="text-lg font-semibold"
              >
                8.5h
              </p>
       ...

Ignored nodes: comments, script, style
<html>
  <head />
  <body>
    <div>
      <div
        class="space-y-6"
      >
        <div
          class="flex items-center justify-between"
        >
          <h1
            class="text-3xl font-bold"
          >
            Attendance
          </h1>
          <button
            class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 gap-2"
          >
            <svg
              aria-hidden="true"
              class="lucide lucide-circle-check w-4 h-4"
              fill="none"
              height="24"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              viewBox="0 0 24 24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
              />
              <path
                d="m9 12 2 2 4-4"
              />
            </svg>
            Mark Attendance
          </button>
        </div>
        <div
          class="rounded-lg border bg-card text-card-foreground shadow-sm"
        >
          <div
            class="flex flex-col space-y-1.5 p-6"
          >
            <h3
              class="text-2xl font-semibold leading-none tracking-tight flex items-center gap-2"
            >
              <svg
                aria-hidden="true"
                class="lucide lucide-clock w-5 h-5"
                fill="none"
                height="24"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                viewBox="0 0 24 24"
                width="24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                />
                <path
                  d="M12 6v6l4 2"
                />
              </svg>
              Today's Status
            </h3>
          </div>
          <div
            class="p-6 pt-0"
          >
            <div
              class="grid grid-cols-1 md:grid-cols-4 gap-4"
            >
              <div
                class="space-y-2"
              >
                <p
                  class="text-sm text-muted-foreground"
                >
                  Status
                </p>
                <div
                  class="flex items-center gap-2"
                >
                  <svg
                    aria-hidden="true"
                    class="lucide lucide-circle-check w-5 h-5"
                    fill="none"
                    height="24"
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    viewBox="0 0 24 24"
                    width="24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                    />
                    <path
                      d="m9 12 2 2 4-4"
                    />
                  </svg>
                  <div
                    class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent hover:bg-primary/80 bg-success text-success-foreground"
                  >
                    Present
                  </div>
                </div>
              </div>
              <div
                class="space-y-2"
              >
                <p
                  class="text-sm text-muted-foreground"
                >
                  Check-in Time
                </p>
                <p
                  class="text-lg font-semibold"
                >
                  02:30 PM
                </p>
              </div>
              <div
                class="space-y-2"
              >
                <p
                  class="text-sm text-muted-foreground"
                >
                  Check-out Time
                </p>
                <p
                  class="text-lg font-semibold"
                >
                  11:00 PM
                </p>
              </div>
              <div
                class="space-y-2"
              >
                <p
       ...
 ❯ Proxy.waitForWrapper ../node_modules/@testing-library/dom/dist/wait-for.js:163:27
 ❯ src/pages/__tests__/Attendance.test.tsx:86:11
     84|     render(<Attendance />);
     85|
     86|     await waitFor(() => {
       |           ^
     87|       expect(screen.getByText("Today's Status")).toBeInTheDocument();
     88|       expect(screen.getByText('Present')).toBeInTheDocument();

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/29]⎯

 FAIL  src/pages/__tests__/Attendance.test.tsx > Attendance Page > should display check-in time in readable format
TestingLibraryElementError: Unable to find an element with the text: /09:00/. This could be because the text is broken up by multiple elements. In this case, you can provide a function for your text matcher to make your matcher more flexible.

Ignored nodes: comments, script, style
<body>
  <div>
    <div
      class="space-y-6"
    >
      <div
        class="flex items-center justify-between"
      >
        <h1
          class="text-3xl font-bold"
        >
          Attendance
        </h1>
        <button
          class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 gap-2"
        >
          <svg
            aria-hidden="true"
            class="lucide lucide-circle-check w-4 h-4"
            fill="none"
            height="24"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            viewBox="0 0 24 24"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
            />
            <path
              d="m9 12 2 2 4-4"
            />
          </svg>
          Mark Attendance
        </button>
      </div>
      <div
        class="rounded-lg border bg-card text-card-foreground shadow-sm"
      >
        <div
          class="flex flex-col space-y-1.5 p-6"
        >
          <h3
            class="text-2xl font-semibold leading-none tracking-tight flex items-center gap-2"
          >
            <svg
              aria-hidden="true"
              class="lucide lucide-clock w-5 h-5"
              fill="none"
              height="24"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              viewBox="0 0 24 24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
              />
              <path
                d="M12 6v6l4 2"
              />
            </svg>
            Today's Status
          </h3>
        </div>
        <div
          class="p-6 pt-0"
        >
          <div
            class="grid grid-cols-1 md:grid-cols-4 gap-4"
          >
            <div
              class="space-y-2"
            >
              <p
                class="text-sm text-muted-foreground"
              >
                Status
              </p>
              <div
                class="flex items-center gap-2"
              >
                <svg
                  aria-hidden="true"
                  class="lucide lucide-circle-check w-5 h-5"
                  fill="none"
                  height="24"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  viewBox="0 0 24 24"
                  width="24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                  />
                  <path
                    d="m9 12 2 2 4-4"
                  />
                </svg>
                <div
                  class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent hover:bg-primary/80 bg-success text-success-foreground"
                >
                  Present
                </div>
              </div>
            </div>
            <div
              class="space-y-2"
            >
              <p
                class="text-sm text-muted-foreground"
              >
                Check-in Time
              </p>
              <p
                class="text-lg font-semibold"
              >
                02:30 PM
              </p>
            </div>
            <div
              class="space-y-2"
            >
              <p
                class="text-sm text-muted-foreground"
              >
                Check-out Time
              </p>
              <p
                class="text-lg font-semibold"
              >
                11:00 PM
              </p>
            </div>
            <div
              class="space-y-2"
            >
              <p
                class="text-sm text-muted-foreground"
              >
                Working Hours
              </p>
              <p
                class="text-lg font-semibold"
              >
                8.5h
              </p>
       ...

Ignored nodes: comments, script, style
<html>
  <head />
  <body>
    <div>
      <div
        class="space-y-6"
      >
        <div
          class="flex items-center justify-between"
        >
          <h1
            class="text-3xl font-bold"
          >
            Attendance
          </h1>
          <button
            class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 gap-2"
          >
            <svg
              aria-hidden="true"
              class="lucide lucide-circle-check w-4 h-4"
              fill="none"
              height="24"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              viewBox="0 0 24 24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
              />
              <path
                d="m9 12 2 2 4-4"
              />
            </svg>
            Mark Attendance
          </button>
        </div>
        <div
          class="rounded-lg border bg-card text-card-foreground shadow-sm"
        >
          <div
            class="flex flex-col space-y-1.5 p-6"
          >
            <h3
              class="text-2xl font-semibold leading-none tracking-tight flex items-center gap-2"
            >
              <svg
                aria-hidden="true"
                class="lucide lucide-clock w-5 h-5"
                fill="none"
                height="24"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                viewBox="0 0 24 24"
                width="24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                />
                <path
                  d="M12 6v6l4 2"
                />
              </svg>
              Today's Status
            </h3>
          </div>
          <div
            class="p-6 pt-0"
          >
            <div
              class="grid grid-cols-1 md:grid-cols-4 gap-4"
            >
              <div
                class="space-y-2"
              >
                <p
                  class="text-sm text-muted-foreground"
                >
                  Status
                </p>
                <div
                  class="flex items-center gap-2"
                >
                  <svg
                    aria-hidden="true"
                    class="lucide lucide-circle-check w-5 h-5"
                    fill="none"
                    height="24"
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    viewBox="0 0 24 24"
                    width="24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                    />
                    <path
                      d="m9 12 2 2 4-4"
                    />
                  </svg>
                  <div
                    class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent hover:bg-primary/80 bg-success text-success-foreground"
                  >
                    Present
                  </div>
                </div>
              </div>
              <div
                class="space-y-2"
              >
                <p
                  class="text-sm text-muted-foreground"
                >
                  Check-in Time
                </p>
                <p
                  class="text-lg font-semibold"
                >
                  02:30 PM
                </p>
              </div>
              <div
                class="space-y-2"
              >
                <p
                  class="text-sm text-muted-foreground"
                >
                  Check-out Time
                </p>
                <p
                  class="text-lg font-semibold"
                >
                  11:00 PM
                </p>
              </div>
              <div
                class="space-y-2"
              >
                <p
       ...
 ❯ Proxy.waitForWrapper ../node_modules/@testing-library/dom/dist/wait-for.js:163:27
 ❯ src/pages/__tests__/Attendance.test.tsx:95:11
     93|     render(<Attendance />);
     94|
     95|     await waitFor(() => {
       |           ^
     96|       // Check-in time should be formatted as HH:MM AM/PM
     97|       expect(screen.getByText(/09:00/)).toBeInTheDocument();

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/29]⎯

 FAIL  src/pages/__tests__/Attendance.test.tsx > Attendance Page > should display check-out time in readable format
TestingLibraryElementError: Unable to find an element with the text: /05:30/. This could be because the text is broken up by multiple elements. In this case, you can provide a function for your text matcher to make your matcher more flexible.

Ignored nodes: comments, script, style
<body>
  <div>
    <div
      class="space-y-6"
    >
      <div
        class="flex items-center justify-between"
      >
        <h1
          class="text-3xl font-bold"
        >
          Attendance
        </h1>
        <button
          class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 gap-2"
        >
          <svg
            aria-hidden="true"
            class="lucide lucide-circle-check w-4 h-4"
            fill="none"
            height="24"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            viewBox="0 0 24 24"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
            />
            <path
              d="m9 12 2 2 4-4"
            />
          </svg>
          Mark Attendance
        </button>
      </div>
      <div
        class="rounded-lg border bg-card text-card-foreground shadow-sm"
      >
        <div
          class="flex flex-col space-y-1.5 p-6"
        >
          <h3
            class="text-2xl font-semibold leading-none tracking-tight flex items-center gap-2"
          >
            <svg
              aria-hidden="true"
              class="lucide lucide-clock w-5 h-5"
              fill="none"
              height="24"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              viewBox="0 0 24 24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
              />
              <path
                d="M12 6v6l4 2"
              />
            </svg>
            Today's Status
          </h3>
        </div>
        <div
          class="p-6 pt-0"
        >
          <div
            class="grid grid-cols-1 md:grid-cols-4 gap-4"
          >
            <div
              class="space-y-2"
            >
              <p
                class="text-sm text-muted-foreground"
              >
                Status
              </p>
              <div
                class="flex items-center gap-2"
              >
                <svg
                  aria-hidden="true"
                  class="lucide lucide-circle-check w-5 h-5"
                  fill="none"
                  height="24"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  viewBox="0 0 24 24"
                  width="24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                  />
                  <path
                    d="m9 12 2 2 4-4"
                  />
                </svg>
                <div
                  class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent hover:bg-primary/80 bg-success text-success-foreground"
                >
                  Present
                </div>
              </div>
            </div>
            <div
              class="space-y-2"
            >
              <p
                class="text-sm text-muted-foreground"
              >
                Check-in Time
              </p>
              <p
                class="text-lg font-semibold"
              >
                02:30 PM
              </p>
            </div>
            <div
              class="space-y-2"
            >
              <p
                class="text-sm text-muted-foreground"
              >
                Check-out Time
              </p>
              <p
                class="text-lg font-semibold"
              >
                11:00 PM
              </p>
            </div>
            <div
              class="space-y-2"
            >
              <p
                class="text-sm text-muted-foreground"
              >
                Working Hours
              </p>
              <p
                class="text-lg font-semibold"
              >
                8.5h
              </p>
       ...

Ignored nodes: comments, script, style
<html>
  <head />
  <body>
    <div>
      <div
        class="space-y-6"
      >
        <div
          class="flex items-center justify-between"
        >
          <h1
            class="text-3xl font-bold"
          >
            Attendance
          </h1>
          <button
            class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 gap-2"
          >
            <svg
              aria-hidden="true"
              class="lucide lucide-circle-check w-4 h-4"
              fill="none"
              height="24"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              viewBox="0 0 24 24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
              />
              <path
                d="m9 12 2 2 4-4"
              />
            </svg>
            Mark Attendance
          </button>
        </div>
        <div
          class="rounded-lg border bg-card text-card-foreground shadow-sm"
        >
          <div
            class="flex flex-col space-y-1.5 p-6"
          >
            <h3
              class="text-2xl font-semibold leading-none tracking-tight flex items-center gap-2"
            >
              <svg
                aria-hidden="true"
                class="lucide lucide-clock w-5 h-5"
                fill="none"
                height="24"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                viewBox="0 0 24 24"
                width="24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                />
                <path
                  d="M12 6v6l4 2"
                />
              </svg>
              Today's Status
            </h3>
          </div>
          <div
            class="p-6 pt-0"
          >
            <div
              class="grid grid-cols-1 md:grid-cols-4 gap-4"
            >
              <div
                class="space-y-2"
              >
                <p
                  class="text-sm text-muted-foreground"
                >
                  Status
                </p>
                <div
                  class="flex items-center gap-2"
                >
                  <svg
                    aria-hidden="true"
                    class="lucide lucide-circle-check w-5 h-5"
                    fill="none"
                    height="24"
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    viewBox="0 0 24 24"
                    width="24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                    />
                    <path
                      d="m9 12 2 2 4-4"
                    />
                  </svg>
                  <div
                    class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent hover:bg-primary/80 bg-success text-success-foreground"
                  >
                    Present
                  </div>
                </div>
              </div>
              <div
                class="space-y-2"
              >
                <p
                  class="text-sm text-muted-foreground"
                >
                  Check-in Time
                </p>
                <p
                  class="text-lg font-semibold"
                >
                  02:30 PM
                </p>
              </div>
              <div
                class="space-y-2"
              >
                <p
                  class="text-sm text-muted-foreground"
                >
                  Check-out Time
                </p>
                <p
                  class="text-lg font-semibold"
                >
                  11:00 PM
                </p>
              </div>
              <div
                class="space-y-2"
              >
                <p
       ...
 ❯ Proxy.waitForWrapper ../node_modules/@testing-library/dom/dist/wait-for.js:163:27
 ❯ src/pages/__tests__/Attendance.test.tsx:104:11
    102|     render(<Attendance />);
    103|
    104|     await waitFor(() => {
       |           ^
    105|       // Check-out time should be formatted as HH:MM AM/PM
    106|       expect(screen.getByText(/05:30/)).toBeInTheDocument();

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/29]⎯

 FAIL  src/pages/__tests__/Attendance.test.tsx > Attendance Page > should display attendance statistics
TestingLibraryElementError: Found multiple elements with the text: Present Days

Here are the matching elements:

Ignored nodes: comments, script, style
<h3
  class="tracking-tight text-sm font-medium"
>
  Present Days
</h3>

Ignored nodes: comments, script, style
<h3
  class="tracking-tight text-sm font-medium"
>
  Present Days
</h3>

(If this is intentional, then use the `*AllBy*` variant of the query (like `queryAllByText`, `getAllByText`, or `findAllByText`)).

Ignored nodes: comments, script, style
<body>
  <div>
    <div
      class="space-y-6"
    >
      <div
        class="flex items-center justify-between"
      >
        <h1
          class="text-3xl font-bold"
        >
          Attendance
        </h1>
        <button
          class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 gap-2"
        >
          <svg
            aria-hidden="true"
            class="lucide lucide-circle-check w-4 h-4"
            fill="none"
            height="24"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            viewBox="0 0 24 24"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
            />
            <path
              d="m9 12 2 2 4-4"
            />
          </svg>
          Mark Attendance
        </button>
      </div>
      <div
        class="rounded-lg border bg-card text-card-foreground shadow-sm"
      >
        <div
          class="flex flex-col space-y-1.5 p-6"
        >
          <h3
            class="text-2xl font-semibold leading-none tracking-tight flex items-center gap-2"
          >
            <svg
              aria-hidden="true"
              class="lucide lucide-clock w-5 h-5"
              fill="none"
              height="24"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              viewBox="0 0 24 24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
              />
              <path
                d="M12 6v6l4 2"
              />
            </svg>
            Today's Status
          </h3>
        </div>
        <div
          class="p-6 pt-0"
        >
          <div
            class="grid grid-cols-1 md:grid-cols-4 gap-4"
          >
            <div
              class="space-y-2"
            >
              <p
                class="text-sm text-muted-foreground"
              >
                Status
              </p>
              <div
                class="flex items-center gap-2"
              >
                <svg
                  aria-hidden="true"
                  class="lucide lucide-circle-check w-5 h-5"
                  fill="none"
                  height="24"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  viewBox="0 0 24 24"
                  width="24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                  />
                  <path
                    d="m9 12 2 2 4-4"
                  />
                </svg>
                <div
                  class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent hover:bg-primary/80 bg-success text-success-foreground"
                >
                  Present
                </div>
              </div>
            </div>
            <div
              class="space-y-2"
            >
              <p
                class="text-sm text-muted-foreground"
              >
                Check-in Time
              </p>
              <p
                class="text-lg font-semibold"
              >
                02:30 PM
              </p>
            </div>
            <div
              class="space-y-2"
            >
              <p
                class="text-sm text-muted-foreground"
              >
                Check-out Time
              </p>
              <p
                class="text-lg font-semibold"
              >
                11:00 PM
              </p>
            </div>
            <div
              class="space-y-2"
            >
              <p
                class="text-sm text-muted-foreground"
              >
                Working Hours
              </p>
              <p
                class="text-lg font-semibold"
              >
                8.5h
              </p>
       ...

Ignored nodes: comments, script, style
<html>
  <head />
  <body>
    <div>
      <div
        class="space-y-6"
      >
        <div
          class="flex items-center justify-between"
        >
          <h1
            class="text-3xl font-bold"
          >
            Attendance
          </h1>
          <button
            class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 gap-2"
          >
            <svg
              aria-hidden="true"
              class="lucide lucide-circle-check w-4 h-4"
              fill="none"
              height="24"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              viewBox="0 0 24 24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
              />
              <path
                d="m9 12 2 2 4-4"
              />
            </svg>
            Mark Attendance
          </button>
        </div>
        <div
          class="rounded-lg border bg-card text-card-foreground shadow-sm"
        >
          <div
            class="flex flex-col space-y-1.5 p-6"
          >
            <h3
              class="text-2xl font-semibold leading-none tracking-tight flex items-center gap-2"
            >
              <svg
                aria-hidden="true"
                class="lucide lucide-clock w-5 h-5"
                fill="none"
                height="24"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                viewBox="0 0 24 24"
                width="24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                />
                <path
                  d="M12 6v6l4 2"
                />
              </svg>
              Today's Status
            </h3>
          </div>
          <div
            class="p-6 pt-0"
          >
            <div
              class="grid grid-cols-1 md:grid-cols-4 gap-4"
            >
              <div
                class="space-y-2"
              >
                <p
                  class="text-sm text-muted-foreground"
                >
                  Status
                </p>
                <div
                  class="flex items-center gap-2"
                >
                  <svg
                    aria-hidden="true"
                    class="lucide lucide-circle-check w-5 h-5"
                    fill="none"
                    height="24"
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    viewBox="0 0 24 24"
                    width="24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                    />
                    <path
                      d="m9 12 2 2 4-4"
                    />
                  </svg>
                  <div
                    class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent hover:bg-primary/80 bg-success text-success-foreground"
                  >
                    Present
                  </div>
                </div>
              </div>
              <div
                class="space-y-2"
              >
                <p
                  class="text-sm text-muted-foreground"
                >
                  Check-in Time
                </p>
                <p
                  class="text-lg font-semibold"
                >
                  02:30 PM
                </p>
              </div>
              <div
                class="space-y-2"
              >
                <p
                  class="text-sm text-muted-foreground"
                >
                  Check-out Time
                </p>
                <p
                  class="text-lg font-semibold"
                >
                  11:00 PM
                </p>
              </div>
              <div
                class="space-y-2"
              >
                <p
       ...
 ❯ Proxy.waitForWrapper ../node_modules/@testing-library/dom/dist/wait-for.js:163:27
 ❯ src/pages/__tests__/Attendance.test.tsx:121:11
    119|     render(<Attendance />);
    120|
    121|     await waitFor(() => {
       |           ^
    122|       expect(screen.getByText('Present Days')).toBeInTheDocument();
    123|       expect(screen.getByText('18')).toBeInTheDocument();

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/29]⎯

 FAIL  src/pages/__tests__/Attendance.test.tsx > Attendance Page > should display Mark Attendance button
TestingLibraryElementError: Unable to find an element with the text: Mark Attendance. This could be because the text is broken up by multiple elements. In this case, you can provide a function for your text matcher to make your matcher more flexible.

Ignored nodes: comments, script, style
<body>
  <div>
    <div
      class="space-y-6"
    >
      <div
        class="flex items-center justify-between"
      >
        <h1
          class="text-3xl font-bold"
        >
          Attendance
        </h1>
      </div>
      <div
        class="text-center py-12 text-muted-foreground"
      >
        Loading...
      </div>
    </div>
  </div>
</body>
 ❯ Object.getElementError ../node_modules/@testing-library/dom/dist/config.js:37:19
 ❯ ../node_modules/@testing-library/dom/dist/query-helpers.js:76:38
 ❯ ../node_modules/@testing-library/dom/dist/query-helpers.js:52:17
 ❯ ../node_modules/@testing-library/dom/dist/query-helpers.js:95:19
 ❯ src/pages/__tests__/Attendance.test.tsx:131:19
    129|   it('should display Mark Attendance button', () => {
    130|     render(<Attendance />);
    131|     expect(screen.getByText('Mark Attendance')).toBeInTheDocument();
       |                   ^
    132|   });
    133|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[7/29]⎯

 FAIL  src/pages/__tests__/Attendance.test.tsx > Attendance Page > should display error message when data fetch fails
TestingLibraryElementError: Found multiple elements with the text: Failed to load attendance data

Here are the matching elements:

Ignored nodes: comments, script, style
<p
  class="text-sm text-destructive"
>
  Failed to load attendance data
</p>

Ignored nodes: comments, script, style
<p
  class="text-sm text-destructive"
>
  Failed to load attendance data
</p>

(If this is intentional, then use the `*AllBy*` variant of the query (like `queryAllByText`, `getAllByText`, or `findAllByText`)).

Ignored nodes: comments, script, style
<body>
  <div>
    <div
      class="space-y-6"
    >
      <div
        class="flex items-center justify-between"
      >
        <h1
          class="text-3xl font-bold"
        >
          Attendance
        </h1>
        <button
          class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 gap-2"
        >
          <svg
            aria-hidden="true"
            class="lucide lucide-circle-check w-4 h-4"
            fill="none"
            height="24"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            viewBox="0 0 24 24"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
            />
            <path
              d="m9 12 2 2 4-4"
            />
          </svg>
          Mark Attendance
        </button>
      </div>
      <div
        class="flex gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-lg"
      >
        <svg
          aria-hidden="true"
          class="lucide lucide-circle-alert w-5 h-5 text-destructive flex-shrink-0 mt-0.5"
          fill="none"
          height="24"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          viewBox="0 0 24 24"
          width="24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
          />
          <line
            x1="12"
            x2="12"
            y1="8"
            y2="12"
          />
          <line
            x1="12"
            x2="12.01"
            y1="16"
            y2="16"
          />
        </svg>
        <p
          class="text-sm text-destructive"
        >
          Failed to load attendance data
        </p>
      </div>
      <div
        class="rounded-lg border bg-card text-card-foreground shadow-sm"
      >
        <div
          class="flex flex-col space-y-1.5 p-6"
        >
          <h3
            class="text-2xl font-semibold leading-none tracking-tight flex items-center gap-2"
          >
            <svg
              aria-hidden="true"
              class="lucide lucide-clock w-5 h-5"
              fill="none"
              height="24"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              viewBox="0 0 24 24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
              />
              <path
                d="M12 6v6l4 2"
              />
            </svg>
            Today's Status
          </h3>
        </div>
        <div
          class="p-6 pt-0"
        >
          <div
            class="grid grid-cols-1 md:grid-cols-4 gap-4"
          >
            <div
              class="space-y-2"
            >
              <p
                class="text-sm text-muted-foreground"
              >
                Status
              </p>
              <div
                class="flex items-center gap-2"
              >
                <svg
                  aria-hidden="true"
                  class="lucide lucide-circle-alert w-5 h-5"
                  fill="none"
                  height="24"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  viewBox="0 0 24 24"
                  width="24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                  />
                  <line
                    x1="12"
                    x2="12"
                    y1="8"
                    y2="12"
                  />
                  <line
                    x1="12"
                    x2="12.01"
                    y1="16"
                    y2="16"
                  />

gnored nodes: comments, script, style
<html>
  <head />
  <body>
    <div>
      <div
        class="space-y-6"
      >
        <div
          class="flex items-center justify-between"
        >
          <h1
            class="text-3xl font-bold"
          >
            Attendance
          </h1>
          <button
            class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 gap-2"
          >
            <svg
              aria-hidden="true"
              class="lucide lucide-circle-check w-4 h-4"
              fill="none"
              height="24"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              viewBox="0 0 24 24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
              />
              <path
                d="m9 12 2 2 4-4"
              />
            </svg>
            Mark Attendance
          </button>
        </div>
        <div
          class="flex gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-lg"
        >
          <svg
            aria-hidden="true"
            class="lucide lucide-circle-alert w-5 h-5 text-destructive flex-shrink-0 mt-0.5"
            fill="none"
            height="24"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            viewBox="0 0 24 24"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
            />
            <line
              x1="12"
              x2="12"
              y1="8"
              y2="12"
            />
            <line
              x1="12"
              x2="12.01"
              y1="16"
              y2="16"
            />
          </svg>
          <p
            class="text-sm text-destructive"
          >
            Failed to load attendance data
          </p>
        </div>
        <div
          class="rounded-lg border bg-card text-card-foreground shadow-sm"
        >
          <div
            class="flex flex-col space-y-1.5 p-6"
          >
            <h3
              class="text-2xl font-semibold leading-none tracking-tight flex items-center gap-2"
            >
              <svg
                aria-hidden="true"
                class="lucide lucide-clock w-5 h-5"
                fill="none"
                height="24"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                viewBox="0 0 24 24"
                width="24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                />
                <path
                  d="M12 6v6l4 2"
                />
              </svg>
              Today's Status
            </h3>
          </div>
          <div
            class="p-6 pt-0"
          >
            <div
              class="grid grid-cols-1 md:grid-cols-4 gap-4"
            >
              <div
                class="space-y-2"
              >
                <p
                  class="text-sm text-muted-foreground"
                >
                  Status
                </p>
                <div
                  class="flex items-center gap-2"
                >
                  <svg
                    aria-hidden="true"
                    class="lucide lucide-circle-alert w-5 h-5"
                    fill="none"
                    height="24"
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    viewBox="0 0 24 24"
                    width="24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                    />
                    <line
                      x1="12"
                      x2="12"
                      y1=...
 ❯ Proxy.waitForWrapper ../node_modules/@testing-library/dom/dist/wait-for.js:163:27
 ❯ src/pages/__tests__/Attendance.test.tsx:196:11
    194|     render(<Attendance />);
    195|
    196|     await waitFor(() => {
       |           ^
    197|       expect(screen.getByText(errorMessage)).toBeInTheDocument();
    198|     });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[8/29]⎯

 FAIL  src/pages/__tests__/Attendance.test.tsx > Attendance Page > should display correct status badge for present status
TestingLibraryElementError: Found multiple elements with the text: Present

Here are the matching elements:

Ignored nodes: comments, script, style
<div
  class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent hover:bg-primary/80 bg-success text-success-foreground"
>
  Present
</div>

Ignored nodes: comments, script, style
<span
  class="text-xs"
>
  Present
</span>

(If this is intentional, then use the `*AllBy*` variant of the query (like `queryAllByText`, `getAllByText`, or `findAllByText`)).

Ignored nodes: comments, script, style
<body>
  <div>
    <div
      class="space-y-6"
    >
      <div
        class="flex items-center justify-between"
      >
        <h1
          class="text-3xl font-bold"
        >
          Attendance
        </h1>
        <button
          class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 gap-2"
        >
          <svg
            aria-hidden="true"
            class="lucide lucide-circle-check w-4 h-4"
            fill="none"
            height="24"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            viewBox="0 0 24 24"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
            />
            <path
              d="m9 12 2 2 4-4"
            />
          </svg>
          Mark Attendance
        </button>
      </div>
      <div
        class="rounded-lg border bg-card text-card-foreground shadow-sm"
      >
        <div
          class="flex flex-col space-y-1.5 p-6"
        >
          <h3
            class="text-2xl font-semibold leading-none tracking-tight flex items-center gap-2"
          >
            <svg
              aria-hidden="true"
              class="lucide lucide-clock w-5 h-5"
              fill="none"
              height="24"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              viewBox="0 0 24 24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
              />
              <path
                d="M12 6v6l4 2"
              />
            </svg>
            Today's Status
          </h3>
        </div>
        <div
          class="p-6 pt-0"
        >
          <div
            class="grid grid-cols-1 md:grid-cols-4 gap-4"
          >
            <div
              class="space-y-2"
            >
              <p
                class="text-sm text-muted-foreground"
              >
                Status
              </p>
              <div
                class="flex items-center gap-2"
              >
                <svg
                  aria-hidden="true"
                  class="lucide lucide-circle-check w-5 h-5"
                  fill="none"
                  height="24"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  viewBox="0 0 24 24"
                  width="24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                  />
                  <path
                    d="m9 12 2 2 4-4"
                  />
                </svg>
                <div
                  class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent hover:bg-primary/80 bg-success text-success-foreground"
                >
                  Present
                </div>
              </div>
            </div>
            <div
              class="space-y-2"
            >
              <p
                class="text-sm text-muted-foreground"
              >
                Check-in Time
              </p>
              <p
                class="text-lg font-semibold"
              >
                02:30 PM
              </p>
            </div>
            <div
              class="space-y-2"
            >
              <p
                class="text-sm text-muted-foreground"
              >
                Check-out Time
              </p>
              <p
                class="text-lg font-semibold"
              >
                11:00 PM
              </p>
            </div>
            <div
              class="space-y-2"
            >
              <p
                class="text-sm text-muted-foreground"
              >
                Working Hours
              </p>
              <p
                class="text-lg font-semibold"
              >
                8.5h
              </p>
       ...

Ignored nodes: comments, script, style
<html>
  <head />
  <body>
    <div>
      <div
        class="space-y-6"
      >
        <div
          class="flex items-center justify-between"
        >
          <h1
            class="text-3xl font-bold"
          >
            Attendance
          </h1>
          <button
            class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 gap-2"
          >
            <svg
              aria-hidden="true"
              class="lucide lucide-circle-check w-4 h-4"
              fill="none"
              height="24"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              viewBox="0 0 24 24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
              />
              <path
                d="m9 12 2 2 4-4"
              />
            </svg>
            Mark Attendance
          </button>
        </div>
        <div
          class="rounded-lg border bg-card text-card-foreground shadow-sm"
        >
          <div
            class="flex flex-col space-y-1.5 p-6"
          >
            <h3
              class="text-2xl font-semibold leading-none tracking-tight flex items-center gap-2"
            >
              <svg
                aria-hidden="true"
                class="lucide lucide-clock w-5 h-5"
                fill="none"
                height="24"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                viewBox="0 0 24 24"
                width="24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                />
                <path
                  d="M12 6v6l4 2"
                />
              </svg>
              Today's Status
            </h3>
          </div>
          <div
            class="p-6 pt-0"
          >
            <div
              class="grid grid-cols-1 md:grid-cols-4 gap-4"
            >
              <div
                class="space-y-2"
              >
                <p
                  class="text-sm text-muted-foreground"
                >
                  Status
                </p>
                <div
                  class="flex items-center gap-2"
                >
                  <svg
                    aria-hidden="true"
                    class="lucide lucide-circle-check w-5 h-5"
                    fill="none"
                    height="24"
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    viewBox="0 0 24 24"
                    width="24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                    />
                    <path
                      d="m9 12 2 2 4-4"
                    />
                  </svg>
                  <div
                    class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent hover:bg-primary/80 bg-success text-success-foreground"
                  >
                    Present
                  </div>
                </div>
              </div>
              <div
                class="space-y-2"
              >
                <p
                  class="text-sm text-muted-foreground"
                >
                  Check-in Time
                </p>
                <p
                  class="text-lg font-semibold"
                >
                  02:30 PM
                </p>
              </div>
              <div
                class="space-y-2"
              >
                <p
                  class="text-sm text-muted-foreground"
                >
                  Check-out Time
                </p>
                <p
                  class="text-lg font-semibold"
                >
                  11:00 PM
                </p>
              </div>
              <div
                class="space-y-2"
              >
                <p
       ...
 ❯ Proxy.waitForWrapper ../node_modules/@testing-library/dom/dist/wait-for.js:163:27
 ❯ src/pages/__tests__/Attendance.test.tsx:227:11
    225|     render(<Attendance />);
    226|
    227|     await waitFor(() => {
       |           ^
    228|       const badge = screen.getByText('Present');
    229|       expect(badge).toBeInTheDocument();

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[9/29]⎯

 FAIL  src/pages/__tests__/Attendance.test.tsx > Attendance Page > should display correct status badge for absent status
TestingLibraryElementError: Found multiple elements with the text: Absent

Here are the matching elements:

Ignored nodes: comments, script, style
<div
  class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent hover:bg-primary/80 bg-destructive text-destructive-foreground"
>
  Absent
</div>

Ignored nodes: comments, script, style
<span
  class="text-xs"
>
  Absent
</span>

(If this is intentional, then use the `*AllBy*` variant of the query (like `queryAllByText`, `getAllByText`, or `findAllByText`)).

Ignored nodes: comments, script, style
<body>
  <div>
    <div
      class="space-y-6"
    >
      <div
        class="flex items-center justify-between"
      >
        <h1
          class="text-3xl font-bold"
        >
          Attendance
        </h1>
        <button
          class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 gap-2"
        >
          <svg
            aria-hidden="true"
            class="lucide lucide-circle-check w-4 h-4"
            fill="none"
            height="24"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            viewBox="0 0 24 24"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
            />
            <path
              d="m9 12 2 2 4-4"
            />
          </svg>
          Mark Attendance
        </button>
      </div>
      <div
        class="rounded-lg border bg-card text-card-foreground shadow-sm"
      >
        <div
          class="flex flex-col space-y-1.5 p-6"
        >
          <h3
            class="text-2xl font-semibold leading-none tracking-tight flex items-center gap-2"
          >
            <svg
              aria-hidden="true"
              class="lucide lucide-clock w-5 h-5"
              fill="none"
              height="24"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              viewBox="0 0 24 24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
              />
              <path
                d="M12 6v6l4 2"
              />
            </svg>
            Today's Status
          </h3>
        </div>
        <div
          class="p-6 pt-0"
        >
          <div
            class="grid grid-cols-1 md:grid-cols-4 gap-4"
          >
            <div
              class="space-y-2"
            >
              <p
                class="text-sm text-muted-foreground"
              >
                Status
              </p>
              <div
                class="flex items-center gap-2"
              >
                <svg
                  aria-hidden="true"
                  class="lucide lucide-circle-x w-5 h-5"
                  fill="none"
                  height="24"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  viewBox="0 0 24 24"
                  width="24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                  />
                  <path
                    d="m15 9-6 6"
                  />
                  <path
                    d="m9 9 6 6"
                  />
                </svg>
                <div
                  class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent hover:bg-primary/80 bg-destructive text-destructive-foreground"
                >
                  Absent
                </div>
              </div>
            </div>
            <div
              class="space-y-2"
            >
              <p
                class="text-sm text-muted-foreground"
              >
                Check-in Time
              </p>
              <p
                class="text-lg font-semibold"
              >
                02:30 PM
              </p>
            </div>
            <div
              class="space-y-2"
            >
              <p
                class="text-sm text-muted-foreground"
              >
                Check-out Time
              </p>
              <p
                class="text-lg font-semibold"
              >
                11:00 PM
              </p>
            </div>
            <div
              class="space-y-2"
            >
              <p
                class="text-sm text-muted-foreground"
              >
                Working Hours
              </p>
              <p
                class="te...

Ignored nodes: comments, script, style
<html>
  <head />
  <body>
    <div>
      <div
        class="space-y-6"
      >
        <div
          class="flex items-center justify-between"
        >
          <h1
            class="text-3xl font-bold"
          >
            Attendance
          </h1>
          <button
            class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 gap-2"
          >
            <svg
              aria-hidden="true"
              class="lucide lucide-circle-check w-4 h-4"
              fill="none"
              height="24"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              viewBox="0 0 24 24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
              />
              <path
                d="m9 12 2 2 4-4"
              />
            </svg>
            Mark Attendance
          </button>
        </div>
        <div
          class="rounded-lg border bg-card text-card-foreground shadow-sm"
        >
          <div
            class="flex flex-col space-y-1.5 p-6"
          >
            <h3
              class="text-2xl font-semibold leading-none tracking-tight flex items-center gap-2"
            >
              <svg
                aria-hidden="true"
                class="lucide lucide-clock w-5 h-5"
                fill="none"
                height="24"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                viewBox="0 0 24 24"
                width="24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                />
                <path
                  d="M12 6v6l4 2"
                />
              </svg>
              Today's Status
            </h3>
          </div>
          <div
            class="p-6 pt-0"
          >
            <div
              class="grid grid-cols-1 md:grid-cols-4 gap-4"
            >
              <div
                class="space-y-2"
              >
                <p
                  class="text-sm text-muted-foreground"
                >
                  Status
                </p>
                <div
                  class="flex items-center gap-2"
                >
                  <svg
                    aria-hidden="true"
                    class="lucide lucide-circle-x w-5 h-5"
                    fill="none"
                    height="24"
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    viewBox="0 0 24 24"
                    width="24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                    />
                    <path
                      d="m15 9-6 6"
                    />
                    <path
                      d="m9 9 6 6"
                    />
                  </svg>
                  <div
                    class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent hover:bg-primary/80 bg-destructive text-destructive-foreground"
                  >
                    Absent
                  </div>
                </div>
              </div>
              <div
                class="space-y-2"
              >
                <p
                  class="text-sm text-muted-foreground"
                >
                  Check-in Time
                </p>
                <p
                  class="text-lg font-semibold"
                >
                  02:30 PM
                </p>
              </div>
              <div
                class="space-y-2"
              >
                <p
                  class="text-sm text-muted-foreground"
                >
                  Check-out Time
                </p>
                <p
                  class="text-lg font-semibold"
                >
                  11:00 PM
                </p>
              </div>
              <di...
 ❯ Proxy.waitForWrapper ../node_modules/@testing-library/dom/dist/wait-for.js:163:27
 ❯ src/pages/__tests__/Attendance.test.tsx:259:11
    257|     render(<Attendance />);
    258|
    259|     await waitFor(() => {
       |           ^
    260|       expect(screen.getByText('Absent')).toBeInTheDocument();
    261|     });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[10/29]⎯

 FAIL  src/pages/__tests__/Attendance.test.tsx > Attendance Page > should display correct status badge for half day status
TestingLibraryElementError: Found multiple elements with the text: Half Day

Here are the matching elements:

Ignored nodes: comments, script, style
<div
  class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent hover:bg-primary/80 bg-warning text-warning-foreground"
>
  Half Day
</div>

Ignored nodes: comments, script, style
<span
  class="text-xs"
>
  Half Day
</span>

(If this is intentional, then use the `*AllBy*` variant of the query (like `queryAllByText`, `getAllByText`, or `findAllByText`)).

Ignored nodes: comments, script, style
<body>
  <div>
    <div
      class="space-y-6"
    >
      <div
        class="flex items-center justify-between"
      >
        <h1
          class="text-3xl font-bold"
        >
          Attendance
        </h1>
        <button
          class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 gap-2"
        >
          <svg
            aria-hidden="true"
            class="lucide lucide-circle-check w-4 h-4"
            fill="none"
            height="24"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            viewBox="0 0 24 24"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
            />
            <path
              d="m9 12 2 2 4-4"
            />
          </svg>
          Mark Attendance
        </button>
      </div>
      <div
        class="rounded-lg border bg-card text-card-foreground shadow-sm"
      >
        <div
          class="flex flex-col space-y-1.5 p-6"
        >
          <h3
            class="text-2xl font-semibold leading-none tracking-tight flex items-center gap-2"
          >
            <svg
              aria-hidden="true"
              class="lucide lucide-clock w-5 h-5"
              fill="none"
              height="24"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              viewBox="0 0 24 24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
              />
              <path
                d="M12 6v6l4 2"
              />
            </svg>
            Today's Status
          </h3>
        </div>
        <div
          class="p-6 pt-0"
        >
          <div
            class="grid grid-cols-1 md:grid-cols-4 gap-4"
          >
            <div
              class="space-y-2"
            >
              <p
                class="text-sm text-muted-foreground"
              >
                Status
              </p>
              <div
                class="flex items-center gap-2"
              >
                <svg
                  aria-hidden="true"
                  class="lucide lucide-circle-alert w-5 h-5"
                  fill="none"
                  height="24"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  viewBox="0 0 24 24"
                  width="24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                  />
                  <line
                    x1="12"
                    x2="12"
                    y1="8"
                    y2="12"
                  />
                  <line
                    x1="12"
                    x2="12.01"
                    y1="16"
                    y2="16"
                  />
                </svg>
                <div
                  class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent hover:bg-primary/80 bg-warning text-warning-foreground"
                >
                  Half Day
                </div>
              </div>
            </div>
            <div
              class="space-y-2"
            >
              <p
                class="text-sm text-muted-foreground"
              >
                Check-in Time
              </p>
              <p
                class="text-lg font-semibold"
              >
                02:30 PM
              </p>
            </div>
            <div
              class="space-y-2"
            >
              <p
                class="text-sm text-muted-foreground"
              >
                Check-out Time
              </p>
              <p
                class="text-lg font-semibold"
              >
                11:00 PM
              </p>
            </div>
            <div
              class="space-y-2"
        ...

Ignored nodes: comments, script, style
<html>
  <head />
  <body>
    <div>
      <div
        class="space-y-6"
      >
        <div
          class="flex items-center justify-between"
        >
          <h1
            class="text-3xl font-bold"
          >
            Attendance
          </h1>
          <button
            class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 gap-2"
          >
            <svg
              aria-hidden="true"
              class="lucide lucide-circle-check w-4 h-4"
              fill="none"
              height="24"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              viewBox="0 0 24 24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
              />
              <path
                d="m9 12 2 2 4-4"
              />
            </svg>
            Mark Attendance
          </button>
        </div>
        <div
          class="rounded-lg border bg-card text-card-foreground shadow-sm"
        >
          <div
            class="flex flex-col space-y-1.5 p-6"
          >
            <h3
              class="text-2xl font-semibold leading-none tracking-tight flex items-center gap-2"
            >
              <svg
                aria-hidden="true"
                class="lucide lucide-clock w-5 h-5"
                fill="none"
                height="24"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                viewBox="0 0 24 24"
                width="24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                />
                <path
                  d="M12 6v6l4 2"
                />
              </svg>
              Today's Status
            </h3>
          </div>
          <div
            class="p-6 pt-0"
          >
            <div
              class="grid grid-cols-1 md:grid-cols-4 gap-4"
            >
              <div
                class="space-y-2"
              >
                <p
                  class="text-sm text-muted-foreground"
                >
                  Status
                </p>
                <div
                  class="flex items-center gap-2"
                >
                  <svg
                    aria-hidden="true"
                    class="lucide lucide-circle-alert w-5 h-5"
                    fill="none"
                    height="24"
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    viewBox="0 0 24 24"
                    width="24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                    />
                    <line
                      x1="12"
                      x2="12"
                      y1="8"
                      y2="12"
                    />
                    <line
                      x1="12"
                      x2="12.01"
                      y1="16"
                      y2="16"
                    />
                  </svg>
                  <div
                    class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent hover:bg-primary/80 bg-warning text-warning-foreground"
                  >
                    Half Day
                  </div>
                </div>
              </div>
              <div
                class="space-y-2"
              >
                <p
                  class="text-sm text-muted-foreground"
                >
                  Check-in Time
                </p>
                <p
                  class="text-lg font-semibold"
                >
                  02:30 PM
                </p>
              </div>
              <div
                class="space-y-2"
              >
                <p
                  class="text-sm text-muted-foreground"
                >
                  Check...
 ❯ Proxy.waitForWrapper ../node_modules/@testing-library/dom/dist/wait-for.js:163:27
 ❯ src/pages/__tests__/Attendance.test.tsx:290:11
    288|     render(<Attendance />);
    289|
    290|     await waitFor(() => {
       |           ^
    291|       expect(screen.getByText('Half Day')).toBeInTheDocument();
    292|     });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[11/29]⎯

 FAIL  src/pages/__tests__/Attendance.test.tsx > Attendance Page > should display statistics with correct values
TestingLibraryElementError: Found multiple elements with the text: 18

Here are the matching elements:

Ignored nodes: comments, script, style
<div
  class="text-2xl font-bold"
>
  18
</div>

Ignored nodes: comments, script, style
<div
  class="text-2xl font-bold text-green-600"
>
  18
</div>

Ignored nodes: comments, script, style
<div
  class="aspect-square flex items-center justify-center rounded-md border text-sm font-medium cursor-pointer transition-colors bg-muted/30 border-transparent"
  title=""
>
  18
</div>

(If this is intentional, then use the `*AllBy*` variant of the query (like `queryAllByText`, `getAllByText`, or `findAllByText`)).

Ignored nodes: comments, script, style
<body>
  <div>
    <div
      class="space-y-6"
    >
      <div
        class="flex items-center justify-between"
      >
        <h1
          class="text-3xl font-bold"
        >
          Attendance
        </h1>
        <button
          class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 gap-2"
        >
          <svg
            aria-hidden="true"
            class="lucide lucide-circle-check w-4 h-4"
            fill="none"
            height="24"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            viewBox="0 0 24 24"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
            />
            <path
              d="m9 12 2 2 4-4"
            />
          </svg>
          Mark Attendance
        </button>
      </div>
      <div
        class="rounded-lg border bg-card text-card-foreground shadow-sm"
      >
        <div
          class="flex flex-col space-y-1.5 p-6"
        >
          <h3
            class="text-2xl font-semibold leading-none tracking-tight flex items-center gap-2"
          >
            <svg
              aria-hidden="true"
              class="lucide lucide-clock w-5 h-5"
              fill="none"
              height="24"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              viewBox="0 0 24 24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
              />
              <path
                d="M12 6v6l4 2"
              />
            </svg>
            Today's Status
          </h3>
        </div>
        <div
          class="p-6 pt-0"
        >
          <div
            class="grid grid-cols-1 md:grid-cols-4 gap-4"
          >
            <div
              class="space-y-2"
            >
              <p
                class="text-sm text-muted-foreground"
              >
                Status
              </p>
              <div
                class="flex items-center gap-2"
              >
                <svg
                  aria-hidden="true"
                  class="lucide lucide-circle-check w-5 h-5"
                  fill="none"
                  height="24"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  viewBox="0 0 24 24"
                  width="24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                  />
                  <path
                    d="m9 12 2 2 4-4"
                  />
                </svg>
                <div
                  class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent hover:bg-primary/80 bg-success text-success-foreground"
                >
                  Present
                </div>
              </div>
            </div>
            <div
              class="space-y-2"
            >
              <p
                class="text-sm text-muted-foreground"
              >
                Check-in Time
              </p>
              <p
                class="text-lg font-semibold"
              >
                02:30 PM
              </p>
            </div>
            <div
              class="space-y-2"
            >
              <p
                class="text-sm text-muted-foreground"
              >
                Check-out Time
              </p>
              <p
                class="text-lg font-semibold"
              >
                11:00 PM
              </p>
            </div>
            <div
              class="space-y-2"
            >
              <p
                class="text-sm text-muted-foreground"
              >
                Working Hours
              </p>
              <p
                class="text-lg font-semibold"
              >
                8.5h
              </p>
       ...

Ignored nodes: comments, script, style
<html>
  <head />
  <body>
    <div>
      <div
        class="space-y-6"
      >
        <div
          class="flex items-center justify-between"
        >
          <h1
            class="text-3xl font-bold"
          >
            Attendance
          </h1>
          <button
            class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 gap-2"
          >
            <svg
              aria-hidden="true"
              class="lucide lucide-circle-check w-4 h-4"
              fill="none"
              height="24"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              viewBox="0 0 24 24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
              />
              <path
                d="m9 12 2 2 4-4"
              />
            </svg>
            Mark Attendance
          </button>
        </div>
        <div
          class="rounded-lg border bg-card text-card-foreground shadow-sm"
        >
          <div
            class="flex flex-col space-y-1.5 p-6"
          >
            <h3
              class="text-2xl font-semibold leading-none tracking-tight flex items-center gap-2"
            >
              <svg
                aria-hidden="true"
                class="lucide lucide-clock w-5 h-5"
                fill="none"
                height="24"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                viewBox="0 0 24 24"
                width="24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                />
                <path
                  d="M12 6v6l4 2"
                />
              </svg>
              Today's Status
            </h3>
          </div>
          <div
            class="p-6 pt-0"
          >
            <div
              class="grid grid-cols-1 md:grid-cols-4 gap-4"
            >
              <div
                class="space-y-2"
              >
                <p
                  class="text-sm text-muted-foreground"
                >
                  Status
                </p>
                <div
                  class="flex items-center gap-2"
                >
                  <svg
                    aria-hidden="true"
                    class="lucide lucide-circle-check w-5 h-5"
                    fill="none"
                    height="24"
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    viewBox="0 0 24 24"
                    width="24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                    />
                    <path
                      d="m9 12 2 2 4-4"
                    />
                  </svg>
                  <div
                    class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent hover:bg-primary/80 bg-success text-success-foreground"
                  >
                    Present
                  </div>
                </div>
              </div>
              <div
                class="space-y-2"
              >
                <p
                  class="text-sm text-muted-foreground"
                >
                  Check-in Time
                </p>
                <p
                  class="text-lg font-semibold"
                >
                  02:30 PM
                </p>
              </div>
              <div
                class="space-y-2"
              >
                <p
                  class="text-sm text-muted-foreground"
                >
                  Check-out Time
                </p>
                <p
                  class="text-lg font-semibold"
                >
                  11:00 PM
                </p>
              </div>
              <div
                class="space-y-2"
              >
                <p
       ...
 ❯ Proxy.waitForWrapper ../node_modules/@testing-library/dom/dist/wait-for.js:163:27
 ❯ src/pages/__tests__/Attendance.test.tsx:330:11
    328|     render(<Attendance />);
    329|
    330|     await waitFor(() => {
       |           ^
    331|       expect(screen.getByText('18')).toBeInTheDocument(); // present_days
    332|       expect(screen.getByText('1')).toBeInTheDocument(); // absent_days

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[12/29]⎯

 FAIL  src/pages/__tests__/Attendance.test.tsx > Attendance Page > should be responsive and display grid layout
Error: expect(received).toBeInTheDocument()

received value must be an HTMLElement or an SVGElement.

 ❯ src/pages/__tests__/Attendance.test.tsx:340:25
    338|     const { container } = render(<Attendance />);
    339|     const gridElement = container.querySelector('.grid');
    340|     expect(gridElement).toBeInTheDocument();
       |                         ^
    341|   });
    342| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[13/29]⎯

 FAIL  src/components/attendance/__tests__/AttendanceMarker.test.tsx > AttendanceMarker Component > Component Rendering > should open dialog when button is clicked
TestingLibraryElementError: Found multiple elements with the text: Mark Attendance

Here are the matching elements:

Ignored nodes: comments, script, style
<button
  class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 gap-2"
>
  <svg
    aria-hidden="true"
    class="lucide lucide-circle-check w-4 h-4"
    fill="none"
    height="24"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="2"
    viewBox="0 0 24 24"
    width="24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="12"
      cy="12"
      r="10"
    />
    <path
      d="m9 12 2 2 4-4"
    />
  </svg>
  Mark Attendance
</button>

Ignored nodes: comments, script, style
<h2
  class="text-lg font-semibold leading-none tracking-tight"
  id="radix-_r_4_"
>
  Mark Attendance
</h2>

(If this is intentional, then use the `*AllBy*` variant of the query (like `queryAllByText`, `getAllByText`, or `findAllByText`)).

Ignored nodes: comments, script, style
<body
  data-scroll-locked="1"
  style="pointer-events: none;"
>
  <span
    aria-hidden="true"
    data-aria-hidden="true"
    data-radix-focus-guard=""
    style="outline: none; opacity: 0; position: fixed; pointer-events: none;"
    tabindex="0"
  />
  <div
    aria-hidden="true"
    data-aria-hidden="true"
  >
    <button
      class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 gap-2"
    >
      <svg
        aria-hidden="true"
        class="lucide lucide-circle-check w-4 h-4"
        fill="none"
        height="24"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        viewBox="0 0 24 24"
        width="24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
        />
        <path
          d="m9 12 2 2 4-4"
        />
      </svg>
      Mark Attendance
    </button>
  </div>
  <div
    aria-hidden="true"
    class="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
    data-aria-hidden="true"
    data-state="open"
    style="pointer-events: auto;"
  />
  <div
    aria-describedby="radix-_r_5_"
    aria-labelledby="radix-_r_4_"
    class="fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-4 border border-border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg max-w-md"
    data-state="open"
    id="radix-_r_3_"
    role="dialog"
    style="pointer-events: auto;"
    tabindex="-1"
  >
    <div
      class="flex flex-col space-y-1.5 text-center sm:text-left"
    >
      <h2
        class="text-lg font-semibold leading-none tracking-tight"
        id="radix-_r_4_"
      >
        Mark Attendance
      </h2>
    </div>
    <div
      data-orientation="horizontal"
      dir="ltr"
    >
      <div
        aria-orientation="horizontal"
        class="h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground grid w-full grid-cols-3"
        data-orientation="horizontal"
        role="tablist"
        style="outline: none;"
        tabindex="0"
      >
        <button
          aria-controls="radix-_r_6_-content-web"
          aria-selected="true"
          class="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm gap-1"
          data-orientation="horizontal"
          data-radix-collection-item=""
          data-state="active"
          id="radix-_r_6_-trigger-web"
          role="tab"
          tabindex="0"
          type="button"
        >
          <svg
            aria-hidden="true"
            class="lucide lucide-globe w-4 h-4"
            fill="none"
            height="24"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            viewBox="0 0 24 24"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
            />
            <path
              d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"
            />
            <path
              d="M2 12h20"
            />
          </svg>
          <span
            class="hidden sm:inline"
          >
            Web
          </span>
        </button>
        <button
          aria-controls="radix-_r_6_-content-gps"
          aria-selected="false"
          class="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm gap-1"
          data-orientation="horizontal"

gnored nodes: comments, script, style
<html>
  <head />
  <body
    data-scroll-locked="1"
    style="pointer-events: none;"
  >
    <span
      aria-hidden="true"
      data-aria-hidden="true"
      data-radix-focus-guard=""
      style="outline: none; opacity: 0; position: fixed; pointer-events: none;"
      tabindex="0"
    />
    <div
      aria-hidden="true"
      data-aria-hidden="true"
    >
      <button
        class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 gap-2"
      >
        <svg
          aria-hidden="true"
          class="lucide lucide-circle-check w-4 h-4"
          fill="none"
          height="24"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          viewBox="0 0 24 24"
          width="24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
          />
          <path
            d="m9 12 2 2 4-4"
          />
        </svg>
        Mark Attendance
      </button>
    </div>
    <div
      aria-hidden="true"
      class="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
      data-aria-hidden="true"
      data-state="open"
      style="pointer-events: auto;"
    />
    <div
      aria-describedby="radix-_r_5_"
      aria-labelledby="radix-_r_4_"
      class="fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-4 border border-border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg max-w-md"
      data-state="open"
      id="radix-_r_3_"
      role="dialog"
      style="pointer-events: auto;"
      tabindex="-1"
    >
      <div
        class="flex flex-col space-y-1.5 text-center sm:text-left"
      >
        <h2
          class="text-lg font-semibold leading-none tracking-tight"
          id="radix-_r_4_"
        >
          Mark Attendance
        </h2>
      </div>
      <div
        data-orientation="horizontal"
        dir="ltr"
      >
        <div
          aria-orientation="horizontal"
          class="h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground grid w-full grid-cols-3"
          data-orientation="horizontal"
          role="tablist"
          style="outline: none;"
          tabindex="0"
        >
          <button
            aria-controls="radix-_r_6_-content-web"
            aria-selected="true"
            class="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm gap-1"
            data-orientation="horizontal"
            data-radix-collection-item=""
            data-state="active"
            id="radix-_r_6_-trigger-web"
            role="tab"
            tabindex="0"
            type="button"
          >
            <svg
              aria-hidden="true"
              class="lucide lucide-globe w-4 h-4"
              fill="none"
              height="24"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              viewBox="0 0 24 24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
              />
              <path
                d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"
              />
              <path
                d="M2 12h20"
              />
            </svg>
            <span
              class="hidden sm:inline"
            >
              Web
            </span>
          </button>
          <button
            aria-controls="radix-_r_6_-content-gps"
            aria-selected="false"
            class="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-...
 ❯ Proxy.waitForWrapper ../node_modules/@testing-library/dom/dist/wait-for.js:163:27
 ❯ src/components/attendance/__tests__/AttendanceMarker.test.tsx:127:13
    125|       fireEvent.click(button);
    126|
    127|       await waitFor(() => {
       |             ^
    128|         expect(screen.getByText('Mark Attendance')).toBeInTheDocument();
    129|       });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[14/29]⎯

 FAIL  src/components/attendance/__tests__/AttendanceMarker.test.tsx > AttendanceMarker Component > Component Rendering > should close dialog when close button is clicked
TestingLibraryElementError: Found multiple elements with the text: Mark Attendance

Here are the matching elements:

Ignored nodes: comments, script, style
<button
  class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 gap-2"
>
  <svg
    aria-hidden="true"
    class="lucide lucide-circle-check w-4 h-4"
    fill="none"
    height="24"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="2"
    viewBox="0 0 24 24"
    width="24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="12"
      cy="12"
      r="10"
    />
    <path
      d="m9 12 2 2 4-4"
    />
  </svg>
  Mark Attendance
</button>

Ignored nodes: comments, script, style
<h2
  class="text-lg font-semibold leading-none tracking-tight"
  id="radix-_r_i_"
>
  Mark Attendance
</h2>

(If this is intentional, then use the `*AllBy*` variant of the query (like `queryAllByText`, `getAllByText`, or `findAllByText`)).

Ignored nodes: comments, script, style
<body
  data-scroll-locked="1"
  style="pointer-events: none;"
>
  <span
    aria-hidden="true"
    data-aria-hidden="true"
    data-radix-focus-guard=""
    style="outline: none; opacity: 0; position: fixed; pointer-events: none;"
    tabindex="0"
  />
  <div
    aria-hidden="true"
    data-aria-hidden="true"
  >
    <button
      class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 gap-2"
    >
      <svg
        aria-hidden="true"
        class="lucide lucide-circle-check w-4 h-4"
        fill="none"
        height="24"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        viewBox="0 0 24 24"
        width="24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
        />
        <path
          d="m9 12 2 2 4-4"
        />
      </svg>
      Mark Attendance
    </button>
  </div>
  <div
    aria-hidden="true"
    class="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
    data-aria-hidden="true"
    data-state="open"
    style="pointer-events: auto;"
  />
  <div
    aria-describedby="radix-_r_j_"
    aria-labelledby="radix-_r_i_"
    class="fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-4 border border-border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg max-w-md"
    data-state="open"
    id="radix-_r_h_"
    role="dialog"
    style="pointer-events: auto;"
    tabindex="-1"
  >
    <div
      class="flex flex-col space-y-1.5 text-center sm:text-left"
    >
      <h2
        class="text-lg font-semibold leading-none tracking-tight"
        id="radix-_r_i_"
      >
        Mark Attendance
      </h2>
    </div>
    <div
      data-orientation="horizontal"
      dir="ltr"
    >
      <div
        aria-orientation="horizontal"
        class="h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground grid w-full grid-cols-3"
        data-orientation="horizontal"
        role="tablist"
        style="outline: none;"
        tabindex="0"
      >
        <button
          aria-controls="radix-_r_k_-content-web"
          aria-selected="true"
          class="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm gap-1"
          data-orientation="horizontal"
          data-radix-collection-item=""
          data-state="active"
          id="radix-_r_k_-trigger-web"
          role="tab"
          tabindex="0"
          type="button"
        >
          <svg
            aria-hidden="true"
            class="lucide lucide-globe w-4 h-4"
            fill="none"
            height="24"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            viewBox="0 0 24 24"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
            />
            <path
              d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"
            />
            <path
              d="M2 12h20"
            />
          </svg>
          <span
            class="hidden sm:inline"
          >
            Web
          </span>
        </button>
        <button
          aria-controls="radix-_r_k_-content-gps"
          aria-selected="false"
          class="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm gap-1"
          data-orientation="horizontal"

gnored nodes: comments, script, style
<html>
  <head />
  <body
    data-scroll-locked="1"
    style="pointer-events: none;"
  >
    <span
      aria-hidden="true"
      data-aria-hidden="true"
      data-radix-focus-guard=""
      style="outline: none; opacity: 0; position: fixed; pointer-events: none;"
      tabindex="0"
    />
    <div
      aria-hidden="true"
      data-aria-hidden="true"
    >
      <button
        class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 gap-2"
      >
        <svg
          aria-hidden="true"
          class="lucide lucide-circle-check w-4 h-4"
          fill="none"
          height="24"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          viewBox="0 0 24 24"
          width="24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
          />
          <path
            d="m9 12 2 2 4-4"
          />
        </svg>
        Mark Attendance
      </button>
    </div>
    <div
      aria-hidden="true"
      class="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
      data-aria-hidden="true"
      data-state="open"
      style="pointer-events: auto;"
    />
    <div
      aria-describedby="radix-_r_j_"
      aria-labelledby="radix-_r_i_"
      class="fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-4 border border-border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg max-w-md"
      data-state="open"
      id="radix-_r_h_"
      role="dialog"
      style="pointer-events: auto;"
      tabindex="-1"
    >
      <div
        class="flex flex-col space-y-1.5 text-center sm:text-left"
      >
        <h2
          class="text-lg font-semibold leading-none tracking-tight"
          id="radix-_r_i_"
        >
          Mark Attendance
        </h2>
      </div>
      <div
        data-orientation="horizontal"
        dir="ltr"
      >
        <div
          aria-orientation="horizontal"
          class="h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground grid w-full grid-cols-3"
          data-orientation="horizontal"
          role="tablist"
          style="outline: none;"
          tabindex="0"
        >
          <button
            aria-controls="radix-_r_k_-content-web"
            aria-selected="true"
            class="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm gap-1"
            data-orientation="horizontal"
            data-radix-collection-item=""
            data-state="active"
            id="radix-_r_k_-trigger-web"
            role="tab"
            tabindex="0"
            type="button"
          >
            <svg
              aria-hidden="true"
              class="lucide lucide-globe w-4 h-4"
              fill="none"
              height="24"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              viewBox="0 0 24 24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
              />
              <path
                d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"
              />
              <path
                d="M2 12h20"
              />
            </svg>
            <span
              class="hidden sm:inline"
            >
              Web
            </span>
          </button>
          <button
            aria-controls="radix-_r_k_-content-gps"
            aria-selected="false"
            class="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-...
 ❯ Proxy.waitForWrapper ../node_modules/@testing-library/dom/dist/wait-for.js:163:27
 ❯ src/components/attendance/__tests__/AttendanceMarker.test.tsx:163:13
    161|       fireEvent.click(button);
    162|
    163|       await waitFor(() => {
       |             ^
    164|         expect(screen.getByText('Mark Attendance')).toBeInTheDocument();
    165|       });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[15/29]⎯

 FAIL  src/components/attendance/__tests__/AttendanceMarker.test.tsx > AttendanceMarker Component > GPS Check-in Mode > should display GPS check-in tab content
TestingLibraryElementError: Unable to find an element with the text: GPS Check-in. This could be because the text is broken up by multiple elements. In this case, you can provide a function for your text matcher to make your matcher more flexible.

Ignored nodes: comments, script, style
<body
  data-scroll-locked="1"
  style="pointer-events: none;"
>
  <span
    aria-hidden="true"
    data-aria-hidden="true"
    data-radix-focus-guard=""
    style="outline: none; opacity: 0; position: fixed; pointer-events: none;"
    tabindex="0"
  />
  <div
    aria-hidden="true"
    data-aria-hidden="true"
  >
    <button
      class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 gap-2"
    >
      <svg
        aria-hidden="true"
        class="lucide lucide-circle-check w-4 h-4"
        fill="none"
        height="24"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        viewBox="0 0 24 24"
        width="24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
        />
        <path
          d="m9 12 2 2 4-4"
        />
      </svg>
      Mark Attendance
    </button>
  </div>
  <div
    aria-hidden="true"
    class="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
    data-aria-hidden="true"
    data-state="open"
    style="pointer-events: auto;"
  />
  <div
    aria-describedby="radix-_r_2i_"
    aria-labelledby="radix-_r_2h_"
    class="fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-4 border border-border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg max-w-md"
    data-state="open"
    id="radix-_r_2g_"
    role="dialog"
    style="pointer-events: auto;"
    tabindex="-1"
  >
    <div
      class="flex flex-col space-y-1.5 text-center sm:text-left"
    >
      <h2
        class="text-lg font-semibold leading-none tracking-tight"
        id="radix-_r_2h_"
      >
        Mark Attendance
      </h2>
    </div>
    <div
      data-orientation="horizontal"
      dir="ltr"
    >
      <div
        aria-orientation="horizontal"
        class="h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground grid w-full grid-cols-3"
        data-orientation="horizontal"
        role="tablist"
        style="outline: none;"
        tabindex="0"
      >
        <button
          aria-controls="radix-_r_2j_-content-web"
          aria-selected="true"
          class="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm gap-1"
          data-orientation="horizontal"
          data-radix-collection-item=""
          data-state="active"
          id="radix-_r_2j_-trigger-web"
          role="tab"
          tabindex="0"
          type="button"
        >
          <svg
            aria-hidden="true"
            class="lucide lucide-globe w-4 h-4"
            fill="none"
            height="24"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            viewBox="0 0 24 24"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
            />
            <path
              d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"
            />
            <path
              d="M2 12h20"
            />
          </svg>
          <span
            class="hidden sm:inline"
          >
            Web
          </span>
        </button>
        <button
          aria-controls="radix-_r_2j_-content-gps"
          aria-selected="false"
          class="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm gap-1"
          data-orientation="horizon...

Ignored nodes: comments, script, style
<html>
  <head />
  <body
    data-scroll-locked="1"
    style="pointer-events: none;"
  >
    <span
      aria-hidden="true"
      data-aria-hidden="true"
      data-radix-focus-guard=""
      style="outline: none; opacity: 0; position: fixed; pointer-events: none;"
      tabindex="0"
    />
    <div
      aria-hidden="true"
      data-aria-hidden="true"
    >
      <button
        class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 gap-2"
      >
        <svg
          aria-hidden="true"
          class="lucide lucide-circle-check w-4 h-4"
          fill="none"
          height="24"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          viewBox="0 0 24 24"
          width="24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
          />
          <path
            d="m9 12 2 2 4-4"
          />
        </svg>
        Mark Attendance
      </button>
    </div>
    <div
      aria-hidden="true"
      class="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
      data-aria-hidden="true"
      data-state="open"
      style="pointer-events: auto;"
    />
    <div
      aria-describedby="radix-_r_2i_"
      aria-labelledby="radix-_r_2h_"
      class="fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-4 border border-border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg max-w-md"
      data-state="open"
      id="radix-_r_2g_"
      role="dialog"
      style="pointer-events: auto;"
      tabindex="-1"
    >
      <div
        class="flex flex-col space-y-1.5 text-center sm:text-left"
      >
        <h2
          class="text-lg font-semibold leading-none tracking-tight"
          id="radix-_r_2h_"
        >
          Mark Attendance
        </h2>
      </div>
      <div
        data-orientation="horizontal"
        dir="ltr"
      >
        <div
          aria-orientation="horizontal"
          class="h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground grid w-full grid-cols-3"
          data-orientation="horizontal"
          role="tablist"
          style="outline: none;"
          tabindex="0"
        >
          <button
            aria-controls="radix-_r_2j_-content-web"
            aria-selected="true"
            class="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm gap-1"
            data-orientation="horizontal"
            data-radix-collection-item=""
            data-state="active"
            id="radix-_r_2j_-trigger-web"
            role="tab"
            tabindex="0"
            type="button"
          >
            <svg
              aria-hidden="true"
              class="lucide lucide-globe w-4 h-4"
              fill="none"
              height="24"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              viewBox="0 0 24 24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
              />
              <path
                d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"
              />
              <path
                d="M2 12h20"
              />
            </svg>
            <span
              class="hidden sm:inline"
            >
              Web
            </span>
          </button>
          <button
            aria-controls="radix-_r_2j_-content-gps"
            aria-selected="false"
            class="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:o...
 ❯ Proxy.waitForWrapper ../node_modules/@testing-library/dom/dist/wait-for.js:163:27
 ❯ src/components/attendance/__tests__/AttendanceMarker.test.tsx:402:13
    400|       fireEvent.click(gpsTab);
    401|
    402|       await waitFor(() => {
       |             ^
    403|         expect(screen.getByText('GPS Check-in')).toBeInTheDocument();
    404|       });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[16/29]⎯

 FAIL  src/components/attendance/__tests__/AttendanceMarker.test.tsx > AttendanceMarker Component > GPS Check-in Mode > should request geolocation permission on GPS check-in
TestingLibraryElementError: Unable to find an element with the text: GPS Check-in. This could be because the text is broken up by multiple elements. In this case, you can provide a function for your text matcher to make your matcher more flexible.

Ignored nodes: comments, script, style
<body
  data-scroll-locked="1"
  style="pointer-events: none;"
>
  <span
    aria-hidden="true"
    data-aria-hidden="true"
    data-radix-focus-guard=""
    style="outline: none; opacity: 0; position: fixed; pointer-events: none;"
    tabindex="0"
  />
  <div
    aria-hidden="true"
    data-aria-hidden="true"
  >
    <button
      class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 gap-2"
    >
      <svg
        aria-hidden="true"
        class="lucide lucide-circle-check w-4 h-4"
        fill="none"
        height="24"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        viewBox="0 0 24 24"
        width="24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
        />
        <path
          d="m9 12 2 2 4-4"
        />
      </svg>
      Mark Attendance
    </button>
  </div>
  <div
    aria-hidden="true"
    class="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
    data-aria-hidden="true"
    data-state="open"
    style="pointer-events: auto;"
  />
  <div
    aria-describedby="radix-_r_2p_"
    aria-labelledby="radix-_r_2o_"
    class="fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-4 border border-border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg max-w-md"
    data-state="open"
    id="radix-_r_2n_"
    role="dialog"
    style="pointer-events: auto;"
    tabindex="-1"
  >
    <div
      class="flex flex-col space-y-1.5 text-center sm:text-left"
    >
      <h2
        class="text-lg font-semibold leading-none tracking-tight"
        id="radix-_r_2o_"
      >
        Mark Attendance
      </h2>
    </div>
    <div
      data-orientation="horizontal"
      dir="ltr"
    >
      <div
        aria-orientation="horizontal"
        class="h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground grid w-full grid-cols-3"
        data-orientation="horizontal"
        role="tablist"
        style="outline: none;"
        tabindex="0"
      >
        <button
          aria-controls="radix-_r_2q_-content-web"
          aria-selected="true"
          class="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm gap-1"
          data-orientation="horizontal"
          data-radix-collection-item=""
          data-state="active"
          id="radix-_r_2q_-trigger-web"
          role="tab"
          tabindex="0"
          type="button"
        >
          <svg
            aria-hidden="true"
            class="lucide lucide-globe w-4 h-4"
            fill="none"
            height="24"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            viewBox="0 0 24 24"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
            />
            <path
              d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"
            />
            <path
              d="M2 12h20"
            />
          </svg>
          <span
            class="hidden sm:inline"
          >
            Web
          </span>
        </button>
        <button
          aria-controls="radix-_r_2q_-content-gps"
          aria-selected="false"
          class="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm gap-1"
          data-orientation="horizon...

Ignored nodes: comments, script, style
<html>
  <head />
  <body
    data-scroll-locked="1"
    style="pointer-events: none;"
  >
    <span
      aria-hidden="true"
      data-aria-hidden="true"
      data-radix-focus-guard=""
      style="outline: none; opacity: 0; position: fixed; pointer-events: none;"
      tabindex="0"
    />
    <div
      aria-hidden="true"
      data-aria-hidden="true"
    >
      <button
        class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 gap-2"
      >
        <svg
          aria-hidden="true"
          class="lucide lucide-circle-check w-4 h-4"
          fill="none"
          height="24"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          viewBox="0 0 24 24"
          width="24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
          />
          <path
            d="m9 12 2 2 4-4"
          />
        </svg>
        Mark Attendance
      </button>
    </div>
    <div
      aria-hidden="true"
      class="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
      data-aria-hidden="true"
      data-state="open"
      style="pointer-events: auto;"
    />
    <div
      aria-describedby="radix-_r_2p_"
      aria-labelledby="radix-_r_2o_"
      class="fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-4 border border-border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg max-w-md"
      data-state="open"
      id="radix-_r_2n_"
      role="dialog"
      style="pointer-events: auto;"
      tabindex="-1"
    >
      <div
        class="flex flex-col space-y-1.5 text-center sm:text-left"
      >
        <h2
          class="text-lg font-semibold leading-none tracking-tight"
          id="radix-_r_2o_"
        >
          Mark Attendance
        </h2>
      </div>
      <div
        data-orientation="horizontal"
        dir="ltr"
      >
        <div
          aria-orientation="horizontal"
          class="h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground grid w-full grid-cols-3"
          data-orientation="horizontal"
          role="tablist"
          style="outline: none;"
          tabindex="0"
        >
          <button
            aria-controls="radix-_r_2q_-content-web"
            aria-selected="true"
            class="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm gap-1"
            data-orientation="horizontal"
            data-radix-collection-item=""
            data-state="active"
            id="radix-_r_2q_-trigger-web"
            role="tab"
            tabindex="0"
            type="button"
          >
            <svg
              aria-hidden="true"
              class="lucide lucide-globe w-4 h-4"
              fill="none"
              height="24"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              viewBox="0 0 24 24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
              />
              <path
                d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"
              />
              <path
                d="M2 12h20"
              />
            </svg>
            <span
              class="hidden sm:inline"
            >
              Web
            </span>
          </button>
          <button
            aria-controls="radix-_r_2q_-content-gps"
            aria-selected="false"
            class="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:o...
 ❯ Proxy.waitForWrapper ../node_modules/@testing-library/dom/dist/wait-for.js:163:27
 ❯ src/components/attendance/__tests__/AttendanceMarker.test.tsx:438:13
    436|       fireEvent.click(gpsTab);
    437|
    438|       await waitFor(() => {
       |             ^
    439|         expect(screen.getByText('GPS Check-in')).toBeInTheDocument();
    440|       });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[17/29]⎯

 FAIL  src/components/attendance/__tests__/AttendanceMarker.test.tsx > AttendanceMarker Component > GPS Check-in Mode > should capture location data on successful geolocation
TestingLibraryElementError: Unable to find an element with the text: GPS Check-in. This could be because the text is broken up by multiple elements. In this case, you can provide a function for your text matcher to make your matcher more flexible.

Ignored nodes: comments, script, style
<body
  data-scroll-locked="1"
  style="pointer-events: none;"
>
  <span
    aria-hidden="true"
    data-aria-hidden="true"
    data-radix-focus-guard=""
    style="outline: none; opacity: 0; position: fixed; pointer-events: none;"
    tabindex="0"
  />
  <div
    aria-hidden="true"
    data-aria-hidden="true"
  >
    <button
      class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 gap-2"
    >
      <svg
        aria-hidden="true"
        class="lucide lucide-circle-check w-4 h-4"
        fill="none"
        height="24"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        viewBox="0 0 24 24"
        width="24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
        />
        <path
          d="m9 12 2 2 4-4"
        />
      </svg>
      Mark Attendance
    </button>
  </div>
  <div
    aria-hidden="true"
    class="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
    data-aria-hidden="true"
    data-state="open"
    style="pointer-events: auto;"
  />
  <div
    aria-describedby="radix-_r_30_"
    aria-labelledby="radix-_r_2v_"
    class="fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-4 border border-border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg max-w-md"
    data-state="open"
    id="radix-_r_2u_"
    role="dialog"
    style="pointer-events: auto;"
    tabindex="-1"
  >
    <div
      class="flex flex-col space-y-1.5 text-center sm:text-left"
    >
      <h2
        class="text-lg font-semibold leading-none tracking-tight"
        id="radix-_r_2v_"
      >
        Mark Attendance
      </h2>
    </div>
    <div
      data-orientation="horizontal"
      dir="ltr"
    >
      <div
        aria-orientation="horizontal"
        class="h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground grid w-full grid-cols-3"
        data-orientation="horizontal"
        role="tablist"
        style="outline: none;"
        tabindex="0"
      >
        <button
          aria-controls="radix-_r_31_-content-web"
          aria-selected="true"
          class="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm gap-1"
          data-orientation="horizontal"
          data-radix-collection-item=""
          data-state="active"
          id="radix-_r_31_-trigger-web"
          role="tab"
          tabindex="0"
          type="button"
        >
          <svg
            aria-hidden="true"
            class="lucide lucide-globe w-4 h-4"
            fill="none"
            height="24"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            viewBox="0 0 24 24"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
            />
            <path
              d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"
            />
            <path
              d="M2 12h20"
            />
          </svg>
          <span
            class="hidden sm:inline"
          >
            Web
          </span>
        </button>
        <button
          aria-controls="radix-_r_31_-content-gps"
          aria-selected="false"
          class="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm gap-1"
          data-orientation="horizon...

Ignored nodes: comments, script, style
<html>
  <head />
  <body
    data-scroll-locked="1"
    style="pointer-events: none;"
  >
    <span
      aria-hidden="true"
      data-aria-hidden="true"
      data-radix-focus-guard=""
      style="outline: none; opacity: 0; position: fixed; pointer-events: none;"
      tabindex="0"
    />
    <div
      aria-hidden="true"
      data-aria-hidden="true"
    >
      <button
        class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 gap-2"
      >
        <svg
          aria-hidden="true"
          class="lucide lucide-circle-check w-4 h-4"
          fill="none"
          height="24"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          viewBox="0 0 24 24"
          width="24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
          />
          <path
            d="m9 12 2 2 4-4"
          />
        </svg>
        Mark Attendance
      </button>
    </div>
    <div
      aria-hidden="true"
      class="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
      data-aria-hidden="true"
      data-state="open"
      style="pointer-events: auto;"
    />
    <div
      aria-describedby="radix-_r_30_"
      aria-labelledby="radix-_r_2v_"
      class="fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-4 border border-border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg max-w-md"
      data-state="open"
      id="radix-_r_2u_"
      role="dialog"
      style="pointer-events: auto;"
      tabindex="-1"
    >
      <div
        class="flex flex-col space-y-1.5 text-center sm:text-left"
      >
        <h2
          class="text-lg font-semibold leading-none tracking-tight"
          id="radix-_r_2v_"
        >
          Mark Attendance
        </h2>
      </div>
      <div
        data-orientation="horizontal"
        dir="ltr"
      >
        <div
          aria-orientation="horizontal"
          class="h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground grid w-full grid-cols-3"
          data-orientation="horizontal"
          role="tablist"
          style="outline: none;"
          tabindex="0"
        >
          <button
            aria-controls="radix-_r_31_-content-web"
            aria-selected="true"
            class="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm gap-1"
            data-orientation="horizontal"
            data-radix-collection-item=""
            data-state="active"
            id="radix-_r_31_-trigger-web"
            role="tab"
            tabindex="0"
            type="button"
          >
            <svg
              aria-hidden="true"
              class="lucide lucide-globe w-4 h-4"
              fill="none"
              height="24"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              viewBox="0 0 24 24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
              />
              <path
                d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"
              />
              <path
                d="M2 12h20"
              />
            </svg>
            <span
              class="hidden sm:inline"
            >
              Web
            </span>
          </button>
          <button
            aria-controls="radix-_r_31_-content-gps"
            aria-selected="false"
            class="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:o...
 ❯ Proxy.waitForWrapper ../node_modules/@testing-library/dom/dist/wait-for.js:163:27
 ❯ src/components/attendance/__tests__/AttendanceMarker.test.tsx:483:13
    481|       fireEvent.click(gpsTab);
    482|
    483|       await waitFor(() => {
       |             ^
    484|         expect(screen.getByText('GPS Check-in')).toBeInTheDocument();
    485|       });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[18/29]⎯

 FAIL  src/components/attendance/__tests__/AttendanceMarker.test.tsx > AttendanceMarker Component > GPS Check-in Mode > should display location accuracy indicator
TestingLibraryElementError: Unable to find an element with the text: GPS Check-in. This could be because the text is broken up by multiple elements. In this case, you can provide a function for your text matcher to make your matcher more flexible.

Ignored nodes: comments, script, style
<body
  data-scroll-locked="1"
  style="pointer-events: none;"
>
  <span
    aria-hidden="true"
    data-aria-hidden="true"
    data-radix-focus-guard=""
    style="outline: none; opacity: 0; position: fixed; pointer-events: none;"
    tabindex="0"
  />
  <div
    aria-hidden="true"
    data-aria-hidden="true"
  >
    <button
      class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 gap-2"
    >
      <svg
        aria-hidden="true"
        class="lucide lucide-circle-check w-4 h-4"
        fill="none"
        height="24"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        viewBox="0 0 24 24"
        width="24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
        />
        <path
          d="m9 12 2 2 4-4"
        />
      </svg>
      Mark Attendance
    </button>
  </div>
  <div
    aria-hidden="true"
    class="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
    data-aria-hidden="true"
    data-state="open"
    style="pointer-events: auto;"
  />
  <div
    aria-describedby="radix-_r_37_"
    aria-labelledby="radix-_r_36_"
    class="fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-4 border border-border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg max-w-md"
    data-state="open"
    id="radix-_r_35_"
    role="dialog"
    style="pointer-events: auto;"
    tabindex="-1"
  >
    <div
      class="flex flex-col space-y-1.5 text-center sm:text-left"
    >
      <h2
        class="text-lg font-semibold leading-none tracking-tight"
        id="radix-_r_36_"
      >
        Mark Attendance
      </h2>
    </div>
    <div
      data-orientation="horizontal"
      dir="ltr"
    >
      <div
        aria-orientation="horizontal"
        class="h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground grid w-full grid-cols-3"
        data-orientation="horizontal"
        role="tablist"
        style="outline: none;"
        tabindex="0"
      >
        <button
          aria-controls="radix-_r_38_-content-web"
          aria-selected="true"
          class="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm gap-1"
          data-orientation="horizontal"
          data-radix-collection-item=""
          data-state="active"
          id="radix-_r_38_-trigger-web"
          role="tab"
          tabindex="0"
          type="button"
        >
          <svg
            aria-hidden="true"
            class="lucide lucide-globe w-4 h-4"
            fill="none"
            height="24"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            viewBox="0 0 24 24"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
            />
            <path
              d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"
            />
            <path
              d="M2 12h20"
            />
          </svg>
          <span
            class="hidden sm:inline"
          >
            Web
          </span>
        </button>
        <button
          aria-controls="radix-_r_38_-content-gps"
          aria-selected="false"
          class="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm gap-1"
          data-orientation="horizon...

Ignored nodes: comments, script, style
<html>
  <head />
  <body
    data-scroll-locked="1"
    style="pointer-events: none;"
  >
    <span
      aria-hidden="true"
      data-aria-hidden="true"
      data-radix-focus-guard=""
      style="outline: none; opacity: 0; position: fixed; pointer-events: none;"
      tabindex="0"
    />
    <div
      aria-hidden="true"
      data-aria-hidden="true"
    >
      <button
        class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 gap-2"
      >
        <svg
          aria-hidden="true"
          class="lucide lucide-circle-check w-4 h-4"
          fill="none"
          height="24"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          viewBox="0 0 24 24"
          width="24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
          />
          <path
            d="m9 12 2 2 4-4"
          />
        </svg>
        Mark Attendance
      </button>
    </div>
    <div
      aria-hidden="true"
      class="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
      data-aria-hidden="true"
      data-state="open"
      style="pointer-events: auto;"
    />
    <div
      aria-describedby="radix-_r_37_"
      aria-labelledby="radix-_r_36_"
      class="fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-4 border border-border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg max-w-md"
      data-state="open"
      id="radix-_r_35_"
      role="dialog"
      style="pointer-events: auto;"
      tabindex="-1"
    >
      <div
        class="flex flex-col space-y-1.5 text-center sm:text-left"
      >
        <h2
          class="text-lg font-semibold leading-none tracking-tight"
          id="radix-_r_36_"
        >
          Mark Attendance
        </h2>
      </div>
      <div
        data-orientation="horizontal"
        dir="ltr"
      >
        <div
          aria-orientation="horizontal"
          class="h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground grid w-full grid-cols-3"
          data-orientation="horizontal"
          role="tablist"
          style="outline: none;"
          tabindex="0"
        >
          <button
            aria-controls="radix-_r_38_-content-web"
            aria-selected="true"
            class="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm gap-1"
            data-orientation="horizontal"
            data-radix-collection-item=""
            data-state="active"
            id="radix-_r_38_-trigger-web"
            role="tab"
            tabindex="0"
            type="button"
          >
            <svg
              aria-hidden="true"
              class="lucide lucide-globe w-4 h-4"
              fill="none"
              height="24"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              viewBox="0 0 24 24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
              />
              <path
                d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"
              />
              <path
                d="M2 12h20"
              />
            </svg>
            <span
              class="hidden sm:inline"
            >
              Web
            </span>
          </button>
          <button
            aria-controls="radix-_r_38_-content-gps"
            aria-selected="false"
            class="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:o...
 ❯ Proxy.waitForWrapper ../node_modules/@testing-library/dom/dist/wait-for.js:163:27
 ❯ src/components/attendance/__tests__/AttendanceMarker.test.tsx:529:13
    527|       fireEvent.click(gpsTab);
    528|
    529|       await waitFor(() => {
       |             ^
    530|         expect(screen.getByText('GPS Check-in')).toBeInTheDocument();
    531|       });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[19/29]⎯

 FAIL  src/components/attendance/__tests__/AttendanceMarker.test.tsx > AttendanceMarker Component > GPS Check-in Mode > should show different accuracy levels based on accuracy value
TestingLibraryElementError: Unable to find an element with the text: GPS Check-in. This could be because the text is broken up by multiple elements. In this case, you can provide a function for your text matcher to make your matcher more flexible.

Ignored nodes: comments, script, style
<body
  data-scroll-locked="1"
  style="pointer-events: none;"
>
  <span
    aria-hidden="true"
    data-aria-hidden="true"
    data-radix-focus-guard=""
    style="outline: none; opacity: 0; position: fixed; pointer-events: none;"
    tabindex="0"
  />
  <div
    aria-hidden="true"
    data-aria-hidden="true"
  >
    <button
      class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 gap-2"
    >
      <svg
        aria-hidden="true"
        class="lucide lucide-circle-check w-4 h-4"
        fill="none"
        height="24"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        viewBox="0 0 24 24"
        width="24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
        />
        <path
          d="m9 12 2 2 4-4"
        />
      </svg>
      Mark Attendance
    </button>
  </div>
  <div
    aria-hidden="true"
    class="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
    data-aria-hidden="true"
    data-state="open"
    style="pointer-events: auto;"
  />
  <div
    aria-describedby="radix-_r_3e_"
    aria-labelledby="radix-_r_3d_"
    class="fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-4 border border-border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg max-w-md"
    data-state="open"
    id="radix-_r_3c_"
    role="dialog"
    style="pointer-events: auto;"
    tabindex="-1"
  >
    <div
      class="flex flex-col space-y-1.5 text-center sm:text-left"
    >
      <h2
        class="text-lg font-semibold leading-none tracking-tight"
        id="radix-_r_3d_"
      >
        Mark Attendance
      </h2>
    </div>
    <div
      data-orientation="horizontal"
      dir="ltr"
    >
      <div
        aria-orientation="horizontal"
        class="h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground grid w-full grid-cols-3"
        data-orientation="horizontal"
        role="tablist"
        style="outline: none;"
        tabindex="0"
      >
        <button
          aria-controls="radix-_r_3f_-content-web"
          aria-selected="true"
          class="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm gap-1"
          data-orientation="horizontal"
          data-radix-collection-item=""
          data-state="active"
          id="radix-_r_3f_-trigger-web"
          role="tab"
          tabindex="0"
          type="button"
        >
          <svg
            aria-hidden="true"
            class="lucide lucide-globe w-4 h-4"
            fill="none"
            height="24"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            viewBox="0 0 24 24"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
            />
            <path
              d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"
            />
            <path
              d="M2 12h20"
            />
          </svg>
          <span
            class="hidden sm:inline"
          >
            Web
          </span>
        </button>
        <button
          aria-controls="radix-_r_3f_-content-gps"
          aria-selected="false"
          class="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm gap-1"
          data-orientation="horizon...

Ignored nodes: comments, script, style
<html>
  <head />
  <body
    data-scroll-locked="1"
    style="pointer-events: none;"
  >
    <span
      aria-hidden="true"
      data-aria-hidden="true"
      data-radix-focus-guard=""
      style="outline: none; opacity: 0; position: fixed; pointer-events: none;"
      tabindex="0"
    />
    <div
      aria-hidden="true"
      data-aria-hidden="true"
    >
      <button
        class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 gap-2"
      >
        <svg
          aria-hidden="true"
          class="lucide lucide-circle-check w-4 h-4"
          fill="none"
          height="24"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          viewBox="0 0 24 24"
          width="24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
          />
          <path
            d="m9 12 2 2 4-4"
          />
        </svg>
        Mark Attendance
      </button>
    </div>
    <div
      aria-hidden="true"
      class="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
      data-aria-hidden="true"
      data-state="open"
      style="pointer-events: auto;"
    />
    <div
      aria-describedby="radix-_r_3e_"
      aria-labelledby="radix-_r_3d_"
      class="fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-4 border border-border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg max-w-md"
      data-state="open"
      id="radix-_r_3c_"
      role="dialog"
      style="pointer-events: auto;"
      tabindex="-1"
    >
      <div
        class="flex flex-col space-y-1.5 text-center sm:text-left"
      >
        <h2
          class="text-lg font-semibold leading-none tracking-tight"
          id="radix-_r_3d_"
        >
          Mark Attendance
        </h2>
      </div>
      <div
        data-orientation="horizontal"
        dir="ltr"
      >
        <div
          aria-orientation="horizontal"
          class="h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground grid w-full grid-cols-3"
          data-orientation="horizontal"
          role="tablist"
          style="outline: none;"
          tabindex="0"
        >
          <button
            aria-controls="radix-_r_3f_-content-web"
            aria-selected="true"
            class="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm gap-1"
            data-orientation="horizontal"
            data-radix-collection-item=""
            data-state="active"
            id="radix-_r_3f_-trigger-web"
            role="tab"
            tabindex="0"
            type="button"
          >
            <svg
              aria-hidden="true"
              class="lucide lucide-globe w-4 h-4"
              fill="none"
              height="24"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              viewBox="0 0 24 24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
              />
              <path
                d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"
              />
              <path
                d="M2 12h20"
              />
            </svg>
            <span
              class="hidden sm:inline"
            >
              Web
            </span>
          </button>
          <button
            aria-controls="radix-_r_3f_-content-gps"
            aria-selected="false"
            class="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:o...
 ❯ Proxy.waitForWrapper ../node_modules/@testing-library/dom/dist/wait-for.js:163:27
 ❯ src/components/attendance/__tests__/AttendanceMarker.test.tsx:585:15
    583|         fireEvent.click(gpsTab);
    584|
    585|         await waitFor(() => {
       |               ^
    586|           expect(screen.getByText('GPS Check-in')).toBeInTheDocument();
    587|         });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[20/29]⎯

 FAIL  src/components/attendance/__tests__/AttendanceMarker.test.tsx > AttendanceMarker Component > GPS Check-in Mode > should handle geolocation permission denied error
ReferenceError: GeolocationPositionError is not defined
 ❯ src/components/attendance/__tests__/AttendanceMarker.test.tsx:601:21
    599|
    600|     it('should handle geolocation permission denied error', async () => {
    601|       const error = new GeolocationPositionError();
       |                     ^
    602|       error.code = 1; // PERMISSION_DENIED
    603|       error.message = 'User denied geolocation';

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[21/29]⎯

 FAIL  src/components/attendance/__tests__/AttendanceMarker.test.tsx > AttendanceMarker Component > GPS Check-in Mode > should handle geolocation unavailable error
ReferenceError: GeolocationPositionError is not defined
 ❯ src/components/attendance/__tests__/AttendanceMarker.test.tsx:640:21
    638|
    639|     it('should handle geolocation unavailable error', async () => {
    640|       const error = new GeolocationPositionError();
       |                     ^
    641|       error.code = 2; // POSITION_UNAVAILABLE
    642|       error.message = 'Position unavailable';

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[22/29]⎯

 FAIL  src/components/attendance/__tests__/AttendanceMarker.test.tsx > AttendanceMarker Component > GPS Check-in Mode > should handle geolocation timeout error
ReferenceError: GeolocationPositionError is not defined
 ❯ src/components/attendance/__tests__/AttendanceMarker.test.tsx:679:21
    677|
    678|     it('should handle geolocation timeout error', async () => {
    679|       const error = new GeolocationPositionError();
       |                     ^
    680|       error.code = 3; // TIMEOUT
    681|       error.message = 'Timeout';

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[23/29]⎯

 FAIL  src/components/attendance/__tests__/AttendanceMarker.test.tsx > AttendanceMarker Component > GPS Check-in Mode > should call markAttendance with GPS location data
TestingLibraryElementError: Unable to find an element with the text: GPS Check-in. This could be because the text is broken up by multiple elements. In this case, you can provide a function for your text matcher to make your matcher more flexible.

Ignored nodes: comments, script, style
<body
  data-scroll-locked="1"
  style="pointer-events: none;"
>
  <span
    aria-hidden="true"
    data-aria-hidden="true"
    data-radix-focus-guard=""
    style="outline: none; opacity: 0; position: fixed; pointer-events: none;"
    tabindex="0"
  />
  <div
    aria-hidden="true"
    data-aria-hidden="true"
  >
    <button
      class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 gap-2"
    >
      <svg
        aria-hidden="true"
        class="lucide lucide-circle-check w-4 h-4"
        fill="none"
        height="24"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        viewBox="0 0 24 24"
        width="24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
        />
        <path
          d="m9 12 2 2 4-4"
        />
      </svg>
      Mark Attendance
    </button>
  </div>
  <div
    aria-hidden="true"
    class="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
    data-aria-hidden="true"
    data-state="open"
    style="pointer-events: auto;"
  />
  <div
    aria-describedby="radix-_r_3l_"
    aria-labelledby="radix-_r_3k_"
    class="fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-4 border border-border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg max-w-md"
    data-state="open"
    id="radix-_r_3j_"
    role="dialog"
    style="pointer-events: auto;"
    tabindex="-1"
  >
    <div
      class="flex flex-col space-y-1.5 text-center sm:text-left"
    >
      <h2
        class="text-lg font-semibold leading-none tracking-tight"
        id="radix-_r_3k_"
      >
        Mark Attendance
      </h2>
    </div>
    <div
      data-orientation="horizontal"
      dir="ltr"
    >
      <div
        aria-orientation="horizontal"
        class="h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground grid w-full grid-cols-3"
        data-orientation="horizontal"
        role="tablist"
        style="outline: none;"
        tabindex="0"
      >
        <button
          aria-controls="radix-_r_3m_-content-web"
          aria-selected="true"
          class="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm gap-1"
          data-orientation="horizontal"
          data-radix-collection-item=""
          data-state="active"
          id="radix-_r_3m_-trigger-web"
          role="tab"
          tabindex="0"
          type="button"
        >
          <svg
            aria-hidden="true"
            class="lucide lucide-globe w-4 h-4"
            fill="none"
            height="24"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            viewBox="0 0 24 24"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
            />
            <path
              d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"
            />
            <path
              d="M2 12h20"
            />
          </svg>
          <span
            class="hidden sm:inline"
          >
            Web
          </span>
        </button>
        <button
          aria-controls="radix-_r_3m_-content-gps"
          aria-selected="false"
          class="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm gap-1"
          data-orientation="horizon...

Ignored nodes: comments, script, style
<html>
  <head />
  <body
    data-scroll-locked="1"
    style="pointer-events: none;"
  >
    <span
      aria-hidden="true"
      data-aria-hidden="true"
      data-radix-focus-guard=""
      style="outline: none; opacity: 0; position: fixed; pointer-events: none;"
      tabindex="0"
    />
    <div
      aria-hidden="true"
      data-aria-hidden="true"
    >
      <button
        class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 gap-2"
      >
        <svg
          aria-hidden="true"
          class="lucide lucide-circle-check w-4 h-4"
          fill="none"
          height="24"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          viewBox="0 0 24 24"
          width="24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
          />
          <path
            d="m9 12 2 2 4-4"
          />
        </svg>
        Mark Attendance
      </button>
    </div>
    <div
      aria-hidden="true"
      class="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
      data-aria-hidden="true"
      data-state="open"
      style="pointer-events: auto;"
    />
    <div
      aria-describedby="radix-_r_3l_"
      aria-labelledby="radix-_r_3k_"
      class="fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-4 border border-border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg max-w-md"
      data-state="open"
      id="radix-_r_3j_"
      role="dialog"
      style="pointer-events: auto;"
      tabindex="-1"
    >
      <div
        class="flex flex-col space-y-1.5 text-center sm:text-left"
      >
        <h2
          class="text-lg font-semibold leading-none tracking-tight"
          id="radix-_r_3k_"
        >
          Mark Attendance
        </h2>
      </div>
      <div
        data-orientation="horizontal"
        dir="ltr"
      >
        <div
          aria-orientation="horizontal"
          class="h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground grid w-full grid-cols-3"
          data-orientation="horizontal"
          role="tablist"
          style="outline: none;"
          tabindex="0"
        >
          <button
            aria-controls="radix-_r_3m_-content-web"
            aria-selected="true"
            class="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm gap-1"
            data-orientation="horizontal"
            data-radix-collection-item=""
            data-state="active"
            id="radix-_r_3m_-trigger-web"
            role="tab"
            tabindex="0"
            type="button"
          >
            <svg
              aria-hidden="true"
              class="lucide lucide-globe w-4 h-4"
              fill="none"
              height="24"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              viewBox="0 0 24 24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
              />
              <path
                d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"
              />
              <path
                d="M2 12h20"
              />
            </svg>
            <span
              class="hidden sm:inline"
            >
              Web
            </span>
          </button>
          <button
            aria-controls="radix-_r_3m_-content-gps"
            aria-selected="false"
            class="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:o...
 ❯ Proxy.waitForWrapper ../node_modules/@testing-library/dom/dist/wait-for.js:163:27
 ❯ src/components/attendance/__tests__/AttendanceMarker.test.tsx:750:13
    748|       fireEvent.click(gpsTab);
    749|
    750|       await waitFor(() => {
       |             ^
    751|         expect(screen.getByText('GPS Check-in')).toBeInTheDocument();
    752|       });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[24/29]⎯

 FAIL  src/components/attendance/__tests__/AttendanceMarker.test.tsx > AttendanceMarker Component > GPS Check-in Mode > should show success message after GPS check-in
TestingLibraryElementError: Unable to find an element with the text: GPS Check-in. This could be because the text is broken up by multiple elements. In this case, you can provide a function for your text matcher to make your matcher more flexible.

Ignored nodes: comments, script, style
<body
  data-scroll-locked="1"
  style="pointer-events: none;"
>
  <span
    aria-hidden="true"
    data-aria-hidden="true"
    data-radix-focus-guard=""
    style="outline: none; opacity: 0; position: fixed; pointer-events: none;"
    tabindex="0"
  />
  <div
    aria-hidden="true"
    data-aria-hidden="true"
  >
    <button
      class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 gap-2"
    >
      <svg
        aria-hidden="true"
        class="lucide lucide-circle-check w-4 h-4"
        fill="none"
        height="24"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        viewBox="0 0 24 24"
        width="24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
        />
        <path
          d="m9 12 2 2 4-4"
        />
      </svg>
      Mark Attendance
    </button>
  </div>
  <div
    aria-hidden="true"
    class="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
    data-aria-hidden="true"
    data-state="open"
    style="pointer-events: auto;"
  />
  <div
    aria-describedby="radix-_r_3s_"
    aria-labelledby="radix-_r_3r_"
    class="fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-4 border border-border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg max-w-md"
    data-state="open"
    id="radix-_r_3q_"
    role="dialog"
    style="pointer-events: auto;"
    tabindex="-1"
  >
    <div
      class="flex flex-col space-y-1.5 text-center sm:text-left"
    >
      <h2
        class="text-lg font-semibold leading-none tracking-tight"
        id="radix-_r_3r_"
      >
        Mark Attendance
      </h2>
    </div>
    <div
      data-orientation="horizontal"
      dir="ltr"
    >
      <div
        aria-orientation="horizontal"
        class="h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground grid w-full grid-cols-3"
        data-orientation="horizontal"
        role="tablist"
        style="outline: none;"
        tabindex="0"
      >
        <button
          aria-controls="radix-_r_3t_-content-web"
          aria-selected="true"
          class="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm gap-1"
          data-orientation="horizontal"
          data-radix-collection-item=""
          data-state="active"
          id="radix-_r_3t_-trigger-web"
          role="tab"
          tabindex="0"
          type="button"
        >
          <svg
            aria-hidden="true"
            class="lucide lucide-globe w-4 h-4"
            fill="none"
            height="24"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            viewBox="0 0 24 24"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
            />
            <path
              d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"
            />
            <path
              d="M2 12h20"
            />
          </svg>
          <span
            class="hidden sm:inline"
          >
            Web
          </span>
        </button>
        <button
          aria-controls="radix-_r_3t_-content-gps"
          aria-selected="false"
          class="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm gap-1"
          data-orientation="horizon...

Ignored nodes: comments, script, style
<html>
  <head />
  <body
    data-scroll-locked="1"
    style="pointer-events: none;"
  >
    <span
      aria-hidden="true"
      data-aria-hidden="true"
      data-radix-focus-guard=""
      style="outline: none; opacity: 0; position: fixed; pointer-events: none;"
      tabindex="0"
    />
    <div
      aria-hidden="true"
      data-aria-hidden="true"
    >
      <button
        class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 gap-2"
      >
        <svg
          aria-hidden="true"
          class="lucide lucide-circle-check w-4 h-4"
          fill="none"
          height="24"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          viewBox="0 0 24 24"
          width="24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
          />
          <path
            d="m9 12 2 2 4-4"
          />
        </svg>
        Mark Attendance
      </button>
    </div>
    <div
      aria-hidden="true"
      class="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
      data-aria-hidden="true"
      data-state="open"
      style="pointer-events: auto;"
    />
    <div
      aria-describedby="radix-_r_3s_"
      aria-labelledby="radix-_r_3r_"
      class="fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-4 border border-border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg max-w-md"
      data-state="open"
      id="radix-_r_3q_"
      role="dialog"
      style="pointer-events: auto;"
      tabindex="-1"
    >
      <div
        class="flex flex-col space-y-1.5 text-center sm:text-left"
      >
        <h2
          class="text-lg font-semibold leading-none tracking-tight"
          id="radix-_r_3r_"
        >
          Mark Attendance
        </h2>
      </div>
      <div
        data-orientation="horizontal"
        dir="ltr"
      >
        <div
          aria-orientation="horizontal"
          class="h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground grid w-full grid-cols-3"
          data-orientation="horizontal"
          role="tablist"
          style="outline: none;"
          tabindex="0"
        >
          <button
            aria-controls="radix-_r_3t_-content-web"
            aria-selected="true"
            class="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm gap-1"
            data-orientation="horizontal"
            data-radix-collection-item=""
            data-state="active"
            id="radix-_r_3t_-trigger-web"
            role="tab"
            tabindex="0"
            type="button"
          >
            <svg
              aria-hidden="true"
              class="lucide lucide-globe w-4 h-4"
              fill="none"
              height="24"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              viewBox="0 0 24 24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
              />
              <path
                d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"
              />
              <path
                d="M2 12h20"
              />
            </svg>
            <span
              class="hidden sm:inline"
            >
              Web
            </span>
          </button>
          <button
            aria-controls="radix-_r_3t_-content-gps"
            aria-selected="false"
            class="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:o...
 ❯ Proxy.waitForWrapper ../node_modules/@testing-library/dom/dist/wait-for.js:163:27
 ❯ src/components/attendance/__tests__/AttendanceMarker.test.tsx:804:13
    802|       fireEvent.click(gpsTab);
    803|
    804|       await waitFor(() => {
       |             ^
    805|         expect(screen.getByText('GPS Check-in')).toBeInTheDocument();
    806|       });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[25/29]⎯

 FAIL  src/components/attendance/__tests__/AttendanceMarker.test.tsx > AttendanceMarker Component > GPS Check-in Mode > should disable GPS check-in button when permission is denied
TestingLibraryElementError: Unable to find an element with the text: GPS Check-in. This could be because the text is broken up by multiple elements. In this case, you can provide a function for your text matcher to make your matcher more flexible.

Ignored nodes: comments, script, style
<body
  data-scroll-locked="1"
  style="pointer-events: none;"
>
  <span
    aria-hidden="true"
    data-aria-hidden="true"
    data-radix-focus-guard=""
    style="outline: none; opacity: 0; position: fixed; pointer-events: none;"
    tabindex="0"
  />
  <div
    aria-hidden="true"
    data-aria-hidden="true"
  >
    <button
      class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 gap-2"
    >
      <svg
        aria-hidden="true"
        class="lucide lucide-circle-check w-4 h-4"
        fill="none"
        height="24"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        viewBox="0 0 24 24"
        width="24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
        />
        <path
          d="m9 12 2 2 4-4"
        />
      </svg>
      Mark Attendance
    </button>
  </div>
  <div
    aria-hidden="true"
    class="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
    data-aria-hidden="true"
    data-state="open"
    style="pointer-events: auto;"
  />
  <div
    aria-describedby="radix-_r_43_"
    aria-labelledby="radix-_r_42_"
    class="fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-4 border border-border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg max-w-md"
    data-state="open"
    id="radix-_r_41_"
    role="dialog"
    style="pointer-events: auto;"
    tabindex="-1"
  >
    <div
      class="flex flex-col space-y-1.5 text-center sm:text-left"
    >
      <h2
        class="text-lg font-semibold leading-none tracking-tight"
        id="radix-_r_42_"
      >
        Mark Attendance
      </h2>
    </div>
    <div
      data-orientation="horizontal"
      dir="ltr"
    >
      <div
        aria-orientation="horizontal"
        class="h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground grid w-full grid-cols-3"
        data-orientation="horizontal"
        role="tablist"
        style="outline: none;"
        tabindex="0"
      >
        <button
          aria-controls="radix-_r_44_-content-web"
          aria-selected="true"
          class="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm gap-1"
          data-orientation="horizontal"
          data-radix-collection-item=""
          data-state="active"
          id="radix-_r_44_-trigger-web"
          role="tab"
          tabindex="0"
          type="button"
        >
          <svg
            aria-hidden="true"
            class="lucide lucide-globe w-4 h-4"
            fill="none"
            height="24"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            viewBox="0 0 24 24"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
            />
            <path
              d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"
            />
            <path
              d="M2 12h20"
            />
          </svg>
          <span
            class="hidden sm:inline"
          >
            Web
          </span>
        </button>
        <button
          aria-controls="radix-_r_44_-content-gps"
          aria-selected="false"
          class="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm gap-1"
          data-orientation="horizon...

Ignored nodes: comments, script, style
<html>
  <head />
  <body
    data-scroll-locked="1"
    style="pointer-events: none;"
  >
    <span
      aria-hidden="true"
      data-aria-hidden="true"
      data-radix-focus-guard=""
      style="outline: none; opacity: 0; position: fixed; pointer-events: none;"
      tabindex="0"
    />
    <div
      aria-hidden="true"
      data-aria-hidden="true"
    >
      <button
        class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 gap-2"
      >
        <svg
          aria-hidden="true"
          class="lucide lucide-circle-check w-4 h-4"
          fill="none"
          height="24"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          viewBox="0 0 24 24"
          width="24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
          />
          <path
            d="m9 12 2 2 4-4"
          />
        </svg>
        Mark Attendance
      </button>
    </div>
    <div
      aria-hidden="true"
      class="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
      data-aria-hidden="true"
      data-state="open"
      style="pointer-events: auto;"
    />
    <div
      aria-describedby="radix-_r_43_"
      aria-labelledby="radix-_r_42_"
      class="fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-4 border border-border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg max-w-md"
      data-state="open"
      id="radix-_r_41_"
      role="dialog"
      style="pointer-events: auto;"
      tabindex="-1"
    >
      <div
        class="flex flex-col space-y-1.5 text-center sm:text-left"
      >
        <h2
          class="text-lg font-semibold leading-none tracking-tight"
          id="radix-_r_42_"
        >
          Mark Attendance
        </h2>
      </div>
      <div
        data-orientation="horizontal"
        dir="ltr"
      >
        <div
          aria-orientation="horizontal"
          class="h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground grid w-full grid-cols-3"
          data-orientation="horizontal"
          role="tablist"
          style="outline: none;"
          tabindex="0"
        >
          <button
            aria-controls="radix-_r_44_-content-web"
            aria-selected="true"
            class="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm gap-1"
            data-orientation="horizontal"
            data-radix-collection-item=""
            data-state="active"
            id="radix-_r_44_-trigger-web"
            role="tab"
            tabindex="0"
            type="button"
          >
            <svg
              aria-hidden="true"
              class="lucide lucide-globe w-4 h-4"
              fill="none"
              height="24"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              viewBox="0 0 24 24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
              />
              <path
                d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"
              />
              <path
                d="M2 12h20"
              />
            </svg>
            <span
              class="hidden sm:inline"
            >
              Web
            </span>
          </button>
          <button
            aria-controls="radix-_r_44_-content-gps"
            aria-selected="false"
            class="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:o...
 ❯ Proxy.waitForWrapper ../node_modules/@testing-library/dom/dist/wait-for.js:163:27
 ❯ src/components/attendance/__tests__/AttendanceMarker.test.tsx:839:13
    837|       fireEvent.click(gpsTab);
    838|
    839|       await waitFor(() => {
       |             ^
    840|         expect(screen.getByText('GPS Check-in')).toBeInTheDocument();
    841|       });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[26/29]⎯

 FAIL  src/components/attendance/__tests__/AttendanceMarker.test.tsx > AttendanceMarker Component > Biometric Check-in Mode > should display biometric check-in tab content
TestingLibraryElementError: Unable to find an element with the text: Biometric Check-in. This could be because the text is broken up by multiple elements. In this case, you can provide a function for your text matcher to make your matcher more flexible.

Ignored nodes: comments, script, style
<body
  data-scroll-locked="1"
  style="pointer-events: none;"
>
  <span
    aria-hidden="true"
    data-aria-hidden="true"
    data-radix-focus-guard=""
    style="outline: none; opacity: 0; position: fixed; pointer-events: none;"
    tabindex="0"
  />
  <div
    aria-hidden="true"
    data-aria-hidden="true"
  >
    <button
      class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 gap-2"
    >
      <svg
        aria-hidden="true"
        class="lucide lucide-circle-check w-4 h-4"
        fill="none"
        height="24"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        viewBox="0 0 24 24"
        width="24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
        />
        <path
          d="m9 12 2 2 4-4"
        />
      </svg>
      Mark Attendance
    </button>
  </div>
  <div
    aria-hidden="true"
    class="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
    data-aria-hidden="true"
    data-state="open"
    style="pointer-events: auto;"
  />
  <div
    aria-describedby="radix-_r_4a_"
    aria-labelledby="radix-_r_49_"
    class="fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-4 border border-border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg max-w-md"
    data-state="open"
    id="radix-_r_48_"
    role="dialog"
    style="pointer-events: auto;"
    tabindex="-1"
  >
    <div
      class="flex flex-col space-y-1.5 text-center sm:text-left"
    >
      <h2
        class="text-lg font-semibold leading-none tracking-tight"
        id="radix-_r_49_"
      >
        Mark Attendance
      </h2>
    </div>
    <div
      data-orientation="horizontal"
      dir="ltr"
    >
      <div
        aria-orientation="horizontal"
        class="h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground grid w-full grid-cols-3"
        data-orientation="horizontal"
        role="tablist"
        style="outline: none;"
        tabindex="0"
      >
        <button
          aria-controls="radix-_r_4b_-content-web"
          aria-selected="true"
          class="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm gap-1"
          data-orientation="horizontal"
          data-radix-collection-item=""
          data-state="active"
          id="radix-_r_4b_-trigger-web"
          role="tab"
          tabindex="0"
          type="button"
        >
          <svg
            aria-hidden="true"
            class="lucide lucide-globe w-4 h-4"
            fill="none"
            height="24"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            viewBox="0 0 24 24"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
            />
            <path
              d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"
            />
            <path
              d="M2 12h20"
            />
          </svg>
          <span
            class="hidden sm:inline"
          >
            Web
          </span>
        </button>
        <button
          aria-controls="radix-_r_4b_-content-gps"
          aria-selected="false"
          class="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm gap-1"
          data-orientation="horizon...

Ignored nodes: comments, script, style
<html>
  <head />
  <body
    data-scroll-locked="1"
    style="pointer-events: none;"
  >
    <span
      aria-hidden="true"
      data-aria-hidden="true"
      data-radix-focus-guard=""
      style="outline: none; opacity: 0; position: fixed; pointer-events: none;"
      tabindex="0"
    />
    <div
      aria-hidden="true"
      data-aria-hidden="true"
    >
      <button
        class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 gap-2"
      >
        <svg
          aria-hidden="true"
          class="lucide lucide-circle-check w-4 h-4"
          fill="none"
          height="24"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          viewBox="0 0 24 24"
          width="24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
          />
          <path
            d="m9 12 2 2 4-4"
          />
        </svg>
        Mark Attendance
      </button>
    </div>
    <div
      aria-hidden="true"
      class="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
      data-aria-hidden="true"
      data-state="open"
      style="pointer-events: auto;"
    />
    <div
      aria-describedby="radix-_r_4a_"
      aria-labelledby="radix-_r_49_"
      class="fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-4 border border-border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg max-w-md"
      data-state="open"
      id="radix-_r_48_"
      role="dialog"
      style="pointer-events: auto;"
      tabindex="-1"
    >
      <div
        class="flex flex-col space-y-1.5 text-center sm:text-left"
      >
        <h2
          class="text-lg font-semibold leading-none tracking-tight"
          id="radix-_r_49_"
        >
          Mark Attendance
        </h2>
      </div>
      <div
        data-orientation="horizontal"
        dir="ltr"
      >
        <div
          aria-orientation="horizontal"
          class="h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground grid w-full grid-cols-3"
          data-orientation="horizontal"
          role="tablist"
          style="outline: none;"
          tabindex="0"
        >
          <button
            aria-controls="radix-_r_4b_-content-web"
            aria-selected="true"
            class="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm gap-1"
            data-orientation="horizontal"
            data-radix-collection-item=""
            data-state="active"
            id="radix-_r_4b_-trigger-web"
            role="tab"
            tabindex="0"
            type="button"
          >
            <svg
              aria-hidden="true"
              class="lucide lucide-globe w-4 h-4"
              fill="none"
              height="24"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              viewBox="0 0 24 24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
              />
              <path
                d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"
              />
              <path
                d="M2 12h20"
              />
            </svg>
            <span
              class="hidden sm:inline"
            >
              Web
            </span>
          </button>
          <button
            aria-controls="radix-_r_4b_-content-gps"
            aria-selected="false"
            class="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:o...
 ❯ Proxy.waitForWrapper ../node_modules/@testing-library/dom/dist/wait-for.js:163:27
 ❯ src/components/attendance/__tests__/AttendanceMarker.test.tsx:868:13
    866|       fireEvent.click(biometricTab);
    867|
    868|       await waitFor(() => {
       |             ^
    869|         expect(screen.getByText('Biometric Check-in')).toBeInTheDocument();
    870|       });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[27/29]⎯

 FAIL  src/components/attendance/__tests__/AttendanceMarker.test.tsx > AttendanceMarker Component > Dialog State Management > should reset state when dialog is closed
TestingLibraryElementError: Found multiple elements with the role "button" and name `/Close/i`

Here are the matching elements:

Ignored nodes: comments, script, style
<button
  class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full"
>
  Close
</button>

Ignored nodes: comments, script, style
<button
  class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
  type="button"
>
  <svg
    aria-hidden="true"
    class="lucide lucide-x h-4 w-4"
    fill="none"
    height="24"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="2"
    viewBox="0 0 24 24"
    width="24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M18 6 6 18"
    />
    <path
      d="m6 6 12 12"
    />
  </svg>
  <span
    class="sr-only"
  >
    Close
  </span>
</button>

(If this is intentional, then use the `*AllBy*` variant of the query (like `queryAllByText`, `getAllByText`, or `findAllByText`)).

Ignored nodes: comments, script, style
<body
  data-scroll-locked="1"
  style="pointer-events: none;"
>
  <span
    aria-hidden="true"
    data-aria-hidden="true"
    data-radix-focus-guard=""
    style="outline: none; opacity: 0; position: fixed; pointer-events: none;"
    tabindex="0"
  />
  <div
    aria-hidden="true"
    data-aria-hidden="true"
  >
    <button
      class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 gap-2"
    >
      <svg
        aria-hidden="true"
        class="lucide lucide-circle-check w-4 h-4"
        fill="none"
        height="24"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        viewBox="0 0 24 24"
        width="24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
        />
        <path
          d="m9 12 2 2 4-4"
        />
      </svg>
      Mark Attendance
    </button>
  </div>
  <div
    aria-hidden="true"
    class="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
    data-aria-hidden="true"
    data-state="open"
    style="pointer-events: auto;"
  />
  <div
    aria-describedby="radix-_r_4h_"
    aria-labelledby="radix-_r_4g_"
    class="fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-4 border border-border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg max-w-md"
    data-state="open"
    id="radix-_r_4f_"
    role="dialog"
    style="pointer-events: auto;"
    tabindex="-1"
  >
    <div
      class="flex flex-col space-y-1.5 text-center sm:text-left"
    >
      <h2
        class="text-lg font-semibold leading-none tracking-tight"
        id="radix-_r_4g_"
      >
        Mark Attendance
      </h2>
    </div>
    <div
      data-orientation="horizontal"
      dir="ltr"
    >
      <div
        aria-orientation="horizontal"
        class="h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground grid w-full grid-cols-3"
        data-orientation="horizontal"
        role="tablist"
        style="outline: none;"
        tabindex="0"
      >
        <button
          aria-controls="radix-_r_4i_-content-web"
          aria-selected="true"
          class="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm gap-1"
          data-orientation="horizontal"
          data-radix-collection-item=""
          data-state="active"
          id="radix-_r_4i_-trigger-web"
          role="tab"
          tabindex="0"
          type="button"
        >
          <svg
            aria-hidden="true"
            class="lucide lucide-globe w-4 h-4"
            fill="none"
            height="24"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            viewBox="0 0 24 24"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
            />
            <path
              d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"
            />
            <path
              d="M2 12h20"
            />
          </svg>
          <span
            class="hidden sm:inline"
          >
            Web
          </span>
        </button>
        <button
          aria-controls="radix-_r_4i_-content-gps"
          aria-selected="false"
          class="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm gap-1"
          data-orientation="horizon...
 ❯ Object.getElementError ../node_modules/@testing-library/dom/dist/config.js:37:19
 ❯ getElementError ../node_modules/@testing-library/dom/dist/query-helpers.js:20:35
 ❯ getMultipleElementsFoundError ../node_modules/@testing-library/dom/dist/query-helpers.js:23:10
 ❯ ../node_modules/@testing-library/dom/dist/query-helpers.js:55:13
 ❯ ../node_modules/@testing-library/dom/dist/query-helpers.js:95:19
 ❯ src/components/attendance/__tests__/AttendanceMarker.test.tsx:902:34
    900|       });
    901|
    902|       const closeButton = screen.getByRole('button', { name: /Close/i });
       |                                  ^
    903|       fireEvent.click(closeButton);
    904|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[28/29]⎯

 FAIL  src/components/attendance/__tests__/AttendanceMarker.test.tsx > AttendanceMarker Component > Dialog State Management > should switch between tabs without losing state
TestingLibraryElementError: Unable to find an element with the text: GPS Check-in. This could be because the text is broken up by multiple elements. In this case, you can provide a function for your text matcher to make your matcher more flexible.

Ignored nodes: comments, script, style
<body
  data-scroll-locked="1"
  style="pointer-events: none;"
>
  <span
    aria-hidden="true"
    data-aria-hidden="true"
    data-radix-focus-guard=""
    style="outline: none; opacity: 0; position: fixed; pointer-events: none;"
    tabindex="0"
  />
  <div
    aria-hidden="true"
    data-aria-hidden="true"
  >
    <button
      class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 gap-2"
    >
      <svg
        aria-hidden="true"
        class="lucide lucide-circle-check w-4 h-4"
        fill="none"
        height="24"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        viewBox="0 0 24 24"
        width="24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
        />
        <path
          d="m9 12 2 2 4-4"
        />
      </svg>
      Mark Attendance
    </button>
  </div>
  <div
    aria-hidden="true"
    class="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
    data-aria-hidden="true"
    data-state="open"
    style="pointer-events: auto;"
  />
  <div
    aria-describedby="radix-_r_4o_"
    aria-labelledby="radix-_r_4n_"
    class="fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-4 border border-border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg max-w-md"
    data-state="open"
    id="radix-_r_4m_"
    role="dialog"
    style="pointer-events: auto;"
    tabindex="-1"
  >
    <div
      class="flex flex-col space-y-1.5 text-center sm:text-left"
    >
      <h2
        class="text-lg font-semibold leading-none tracking-tight"
        id="radix-_r_4n_"
      >
        Mark Attendance
      </h2>
    </div>
    <div
      data-orientation="horizontal"
      dir="ltr"
    >
      <div
        aria-orientation="horizontal"
        class="h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground grid w-full grid-cols-3"
        data-orientation="horizontal"
        role="tablist"
        style="outline: none;"
        tabindex="0"
      >
        <button
          aria-controls="radix-_r_4p_-content-web"
          aria-selected="true"
          class="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm gap-1"
          data-orientation="horizontal"
          data-radix-collection-item=""
          data-state="active"
          id="radix-_r_4p_-trigger-web"
          role="tab"
          tabindex="0"
          type="button"
        >
          <svg
            aria-hidden="true"
            class="lucide lucide-globe w-4 h-4"
            fill="none"
            height="24"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            viewBox="0 0 24 24"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
            />
            <path
              d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"
            />
            <path
              d="M2 12h20"
            />
          </svg>
          <span
            class="hidden sm:inline"
          >
            Web
          </span>
        </button>
        <button
          aria-controls="radix-_r_4p_-content-gps"
          aria-selected="false"
          class="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm gap-1"
          data-orientation="horizon...

Ignored nodes: comments, script, style
<html>
  <head />
  <body
    data-scroll-locked="1"
    style="pointer-events: none;"
  >
    <span
      aria-hidden="true"
      data-aria-hidden="true"
      data-radix-focus-guard=""
      style="outline: none; opacity: 0; position: fixed; pointer-events: none;"
      tabindex="0"
    />
    <div
      aria-hidden="true"
      data-aria-hidden="true"
    >
      <button
        class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 gap-2"
      >
        <svg
          aria-hidden="true"
          class="lucide lucide-circle-check w-4 h-4"
          fill="none"
          height="24"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          viewBox="0 0 24 24"
          width="24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
          />
          <path
            d="m9 12 2 2 4-4"
          />
        </svg>
        Mark Attendance
      </button>
    </div>
    <div
      aria-hidden="true"
      class="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
      data-aria-hidden="true"
      data-state="open"
      style="pointer-events: auto;"
    />
    <div
      aria-describedby="radix-_r_4o_"
      aria-labelledby="radix-_r_4n_"
      class="fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-4 border border-border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg max-w-md"
      data-state="open"
      id="radix-_r_4m_"
      role="dialog"
      style="pointer-events: auto;"
      tabindex="-1"
    >
      <div
        class="flex flex-col space-y-1.5 text-center sm:text-left"
      >
        <h2
          class="text-lg font-semibold leading-none tracking-tight"
          id="radix-_r_4n_"
        >
          Mark Attendance
        </h2>
      </div>
      <div
        data-orientation="horizontal"
        dir="ltr"
      >
        <div
          aria-orientation="horizontal"
          class="h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground grid w-full grid-cols-3"
          data-orientation="horizontal"
          role="tablist"
          style="outline: none;"
          tabindex="0"
        >
          <button
            aria-controls="radix-_r_4p_-content-web"
            aria-selected="true"
            class="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm gap-1"
            data-orientation="horizontal"
            data-radix-collection-item=""
            data-state="active"
            id="radix-_r_4p_-trigger-web"
            role="tab"
            tabindex="0"
            type="button"
          >
            <svg
              aria-hidden="true"
              class="lucide lucide-globe w-4 h-4"
              fill="none"
              height="24"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              viewBox="0 0 24 24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
              />
              <path
                d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"
              />
              <path
                d="M2 12h20"
              />
            </svg>
            <span
              class="hidden sm:inline"
            >
              Web
            </span>
          </button>
          <button
            aria-controls="radix-_r_4p_-content-gps"
            aria-selected="false"
            class="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:o...
 ❯ Proxy.waitForWrapper ../node_modules/@testing-library/dom/dist/wait-for.js:163:27
 ❯ src/components/attendance/__tests__/AttendanceMarker.test.tsx:938:13
    936|       fireEvent.click(gpsTab);
    937|
    938|       await waitFor(() => {
       |             ^
    939|         expect(screen.getByText('GPS Check-in')).toBeInTheDocument();
    940|       });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[29/29]⎯

 Test Files  4 failed | 7 passed (11)
      Tests  27 failed | 166 passed (193)
   Start at  12:25:26
   Duration  17.42s (transform 1.06s, setup 3.19s, collect 2.64s, tests 37.38s, environment 15.82s, prepare 1.84s)

 FAIL  Tests failed. Watching for file changes...
       press h to show help, press q to quit
npm error Lifecycle script `test` failed with error:
npm error code 1
npm error path C:\Users\kamal\Downloads\Pharma-ERP\frontend
npm error workspace @ems/frontend@1.0.0
npm error location C:\Users\kamal\Downloads\Pharma-ERP\frontend
npm error command failed
npm error command C:\WINDOWS\system32\cmd.exe /d /s /c vitest attendance