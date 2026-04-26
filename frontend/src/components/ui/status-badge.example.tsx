/**
 * StatusBadge Component Examples
 * 
 * This file demonstrates how to use the StatusBadge components
 * for accessible status indicators that comply with WCAG 2.1 AA.
 * 
 * Requirements: 21.6, 21.7, 21.8, 21.9
 */

import React from 'react';
import {
  StatusBadge,
  LeaveStatusBadge,
  AttendanceStatusBadge,
  EmployeeStatusBadge,
} from './status-badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';

export const StatusBadgeExamples: React.FC = () => {
  return (
    <div className="space-y-8 p-8">
      {/* Generic Status Badges */}
      <Card>
        <CardHeader>
          <CardTitle>Generic Status Badges</CardTitle>
          <CardDescription>
            Use StatusBadge for general-purpose status indicators
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <StatusBadge status="pending" />
            <StatusBadge status="approved" />
            <StatusBadge status="rejected" />
            <StatusBadge status="cancelled" />
          </div>

          <div className="flex flex-wrap gap-2">
            <StatusBadge status="success" />
            <StatusBadge status="warning" />
            <StatusBadge status="error" />
            <StatusBadge status="info" />
          </div>

          <div className="flex flex-wrap gap-2">
            <StatusBadge status="active" />
            <StatusBadge status="inactive" />
            <StatusBadge status="completed" />
            <StatusBadge status="in_progress" />
            <StatusBadge status="on_hold" />
          </div>
        </CardContent>
      </Card>

      {/* Size Variants */}
      <Card>
        <CardHeader>
          <CardTitle>Size Variants</CardTitle>
          <CardDescription>
            StatusBadge supports three sizes: sm, md (default), lg
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <StatusBadge status="approved" size="sm" />
            <span className="text-sm text-muted-foreground">Small</span>
          </div>

          <div className="flex items-center gap-2">
            <StatusBadge status="approved" size="md" />
            <span className="text-sm text-muted-foreground">Medium (default)</span>
          </div>

          <div className="flex items-center gap-2">
            <StatusBadge status="approved" size="lg" />
            <span className="text-sm text-muted-foreground">Large</span>
          </div>
        </CardContent>
      </Card>

      {/* Without Icons */}
      <Card>
        <CardHeader>
          <CardTitle>Without Icons</CardTitle>
          <CardDescription>
            Hide icons when space is limited (still accessible with text + color)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <StatusBadge status="pending" showIcon={false} />
            <StatusBadge status="approved" showIcon={false} />
            <StatusBadge status="rejected" showIcon={false} />
            <StatusBadge status="cancelled" showIcon={false} />
          </div>
        </CardContent>
      </Card>

      {/* Leave Status Badges */}
      <Card>
        <CardHeader>
          <CardTitle>Leave Status Badges</CardTitle>
          <CardDescription>
            Specialized badges for leave request status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <LeaveStatusBadge status="pending" />
            <LeaveStatusBadge status="approved" />
            <LeaveStatusBadge status="rejected" />
            <LeaveStatusBadge status="cancelled" />
          </div>
        </CardContent>
      </Card>

      {/* Attendance Status Badges */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Status Badges</CardTitle>
          <CardDescription>
            Specialized badges for attendance records
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <AttendanceStatusBadge status="present" />
            <AttendanceStatusBadge status="absent" />
            <AttendanceStatusBadge status="half_day" />
            <AttendanceStatusBadge status="on_leave" />
          </div>
        </CardContent>
      </Card>

      {/* Employee Status Badges */}
      <Card>
        <CardHeader>
          <CardTitle>Employee Status Badges</CardTitle>
          <CardDescription>
            Specialized badges for employee status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <EmployeeStatusBadge status="active" />
            <EmployeeStatusBadge status="on_leave" />
            <EmployeeStatusBadge status="suspended" />
            <EmployeeStatusBadge status="resigned" />
            <EmployeeStatusBadge status="terminated" />
          </div>
        </CardContent>
      </Card>

      {/* Usage in Tables */}
      <Card>
        <CardHeader>
          <CardTitle>Usage in Tables</CardTitle>
          <CardDescription>
            Example of status badges in a table context
          </CardDescription>
        </CardHeader>
        <CardContent>
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Employee</th>
                <th className="text-left p-2">Leave Type</th>
                <th className="text-left p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-2">John Doe</td>
                <td className="p-2">Annual Leave</td>
                <td className="p-2">
                  <LeaveStatusBadge status="approved" size="sm" />
                </td>
              </tr>
              <tr className="border-b">
                <td className="p-2">Jane Smith</td>
                <td className="p-2">Sick Leave</td>
                <td className="p-2">
                  <LeaveStatusBadge status="pending" size="sm" />
                </td>
              </tr>
              <tr className="border-b">
                <td className="p-2">Bob Johnson</td>
                <td className="p-2">Casual Leave</td>
                <td className="p-2">
                  <LeaveStatusBadge status="rejected" size="sm" />
                </td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Accessibility Features */}
      <Card>
        <CardHeader>
          <CardTitle>Accessibility Features</CardTitle>
          <CardDescription>
            All status badges include multiple accessibility features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">✅ Icon + Color + Text</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Status is conveyed through three visual cues, not just color
            </p>
            <StatusBadge status="approved" />
          </div>

          <div>
            <h3 className="font-semibold mb-2">✅ ARIA Labels</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Each badge has role="status" and descriptive aria-label
            </p>
            <code className="text-xs bg-muted p-2 rounded block">
              {`<Badge role="status" aria-label="Status: Approved">`}
            </code>
          </div>

          <div>
            <h3 className="font-semibold mb-2">✅ Color Contrast</h3>
            <p className="text-sm text-muted-foreground mb-2">
              All colors meet WCAG 2.1 AA standards (4.5:1 contrast ratio)
            </p>
            <div className="flex gap-2">
              <StatusBadge status="success" />
              <StatusBadge status="warning" />
              <StatusBadge status="error" />
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">✅ Screen Reader Support</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Icons are hidden from screen readers (aria-hidden="true")
            </p>
            <p className="text-sm text-muted-foreground">
              Text labels are announced by screen readers
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Code Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Code Examples</CardTitle>
          <CardDescription>
            How to use StatusBadge components in your code
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Import</h3>
            <code className="text-xs bg-muted p-2 rounded block">
              {`import { StatusBadge, LeaveStatusBadge } from '@/components/ui';`}
            </code>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Basic Usage</h3>
            <code className="text-xs bg-muted p-2 rounded block">
              {`<StatusBadge status="approved" />`}
            </code>
          </div>

          <div>
            <h3 className="font-semibold mb-2">With Size</h3>
            <code className="text-xs bg-muted p-2 rounded block">
              {`<StatusBadge status="pending" size="lg" />`}
            </code>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Without Icon</h3>
            <code className="text-xs bg-muted p-2 rounded block">
              {`<StatusBadge status="approved" showIcon={false} />`}
            </code>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Specialized Badges</h3>
            <code className="text-xs bg-muted p-2 rounded block">
              {`<LeaveStatusBadge status="approved" />\n<AttendanceStatusBadge status="present" />\n<EmployeeStatusBadge status="active" />`}
            </code>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatusBadgeExamples;
