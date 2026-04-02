import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Breadcrumbs } from './Breadcrumbs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Breadcrumbs Example Component
 * 
 * Demonstrates the Breadcrumbs component with various route configurations.
 * This example shows how breadcrumbs automatically adapt to different URL paths.
 */

const ExamplePage: React.FC<{ title: string; description: string }> = ({ title, description }) => (
  <div className="space-y-4">
    <Breadcrumbs />
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Navigate to different pages to see how breadcrumbs change:
          </p>
          <div className="flex flex-wrap gap-2">
            <Link to="/dashboard" className="text-blue-600 hover:underline">
              Dashboard
            </Link>
            <Link to="/employees" className="text-blue-600 hover:underline">
              Employees
            </Link>
            <Link to="/employees/123" className="text-blue-600 hover:underline">
              Employee Detail
            </Link>
            <Link to="/employees/123/edit" className="text-blue-600 hover:underline">
              Edit Employee
            </Link>
            <Link to="/recruitment/jobs/456/candidates" className="text-blue-600 hover:underline">
              Job Candidates
            </Link>
            <Link to="/bank-details" className="text-blue-600 hover:underline">
              Bank Details
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

export const BreadcrumbsExample: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="container mx-auto p-8">
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ExamplePage
                title="Dashboard"
                description="No breadcrumbs on dashboard (root page)"
              />
            }
          />
          <Route
            path="/employees"
            element={
              <ExamplePage
                title="Employees"
                description="Breadcrumb: Dashboard > Employees"
              />
            }
          />
          <Route
            path="/employees/:id"
            element={
              <ExamplePage
                title="Employee Detail"
                description="Breadcrumb: Dashboard > Employees > 123"
              />
            }
          />
          <Route
            path="/employees/:id/edit"
            element={
              <ExamplePage
                title="Edit Employee"
                description="Breadcrumb: Dashboard > Employees > 123 > Edit"
              />
            }
          />
          <Route
            path="/recruitment/jobs/:jobId/candidates"
            element={
              <ExamplePage
                title="Job Candidates"
                description="Breadcrumb: Dashboard > Recruitment > Jobs > 456 > Candidates"
              />
            }
          />
          <Route
            path="/bank-details"
            element={
              <ExamplePage
                title="Bank Details"
                description="Breadcrumb: Dashboard > Bank Details (custom label)"
              />
            }
          />
          <Route
            path="*"
            element={
              <ExamplePage
                title="Breadcrumbs Demo"
                description="Click the links above to see breadcrumbs in action"
              />
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default BreadcrumbsExample;

/**
 * Usage in Storybook or development:
 * 
 * import { BreadcrumbsExample } from '@/components/layout/Breadcrumbs.example';
 * 
 * function App() {
 *   return <BreadcrumbsExample />;
 * }
 */
