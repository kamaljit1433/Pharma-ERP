import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

/**
 * Breadcrumbs Component
 * 
 * Displays breadcrumb navigation trail for nested pages.
 * Automatically generates breadcrumbs from the current route path.
 * Makes breadcrumbs clickable for navigation.
 * 
 * Requirements: 4.9
 */

interface BreadcrumbSegment {
  label: string;
  path: string;
  isLast: boolean;
}

// Route label mapping for better display names
const routeLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  employees: 'Employees',
  attendance: 'Attendance',
  leave: 'Leave',
  payroll: 'Payroll',
  'salary-structure': 'Salary Structure',
  recruitment: 'Recruitment',
  performance: 'Performance',
  training: 'Training',
  benefits: 'Benefits',
  separation: 'Separation',
  hierarchy: 'Hierarchy',
  settings: 'Settings',
  profile: 'Profile',
  reports: 'Reports',
  notifications: 'Notifications',
  documents: 'Documents',
  'bank-details': 'Bank Details',
  'geo-tracking': 'Geo Tracking',
  suppliers: 'Suppliers',
  new: 'New',
  edit: 'Edit',
  view: 'View',
  mark: 'Mark',
  request: 'Request',
  process: 'Process',
  jobs: 'Jobs',
  candidates: 'Candidates',
  interviews: 'Interviews',
  goals: 'Goals',
  reviews: 'Reviews',
  feedback: 'Feedback',
  programs: 'Training Programs',
  certifications: 'Certifications',
  reimbursements: 'Reimbursements',
  loans: 'Loans',
  insurance: 'Insurance',
  checklist: 'Checklist',
  settlement: 'Settlement',
};

/**
 * Formats a path segment into a readable label
 */
const formatLabel = (segment: string): string => {
  // Check if we have a custom label
  if (routeLabels[segment]) {
    return routeLabels[segment];
  }

  // If it's a UUID or ID (alphanumeric string), return as is
  if (/^[a-f0-9-]{36}$/i.test(segment) || /^\d+$/.test(segment)) {
    return segment;
  }

  // Convert kebab-case or snake_case to Title Case
  return segment
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Generates breadcrumb segments from the current path
 */
const generateBreadcrumbs = (pathname: string): BreadcrumbSegment[] => {
  // Remove leading/trailing slashes and split
  const segments = pathname.replace(/^\/|\/$/g, '').split('/');

  // Filter out empty segments
  const validSegments = segments.filter((segment) => segment.length > 0);

  // If we're at root or dashboard, return empty array (no breadcrumbs needed)
  if (validSegments.length === 0 || (validSegments.length === 1 && validSegments[0] === 'dashboard')) {
    return [];
  }

  // Build breadcrumb segments
  const breadcrumbs: BreadcrumbSegment[] = validSegments.map((segment, index) => {
    const path = '/' + validSegments.slice(0, index + 1).join('/');
    const isLast = index === validSegments.length - 1;

    return {
      label: formatLabel(segment),
      path,
      isLast,
    };
  });

  return breadcrumbs;
};

export const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const breadcrumbs = generateBreadcrumbs(location.pathname);

  // Don't render breadcrumbs if there are none
  if (breadcrumbs.length === 0) {
    return null;
  }

  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        {/* Home/Dashboard link */}
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link
              to="/dashboard"
              className="flex items-center gap-1.5 hover:text-foreground transition-colors"
            >
              <Home className="h-4 w-4" />
              <span className="sr-only sm:not-sr-only">Dashboard</span>
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {/* Render breadcrumb segments */}
        {breadcrumbs.map((crumb) => (
          <React.Fragment key={crumb.path}>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {crumb.isLast ? (
                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link
                    to={crumb.path}
                    className="hover:text-foreground transition-colors"
                  >
                    {crumb.label}
                  </Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default Breadcrumbs;
