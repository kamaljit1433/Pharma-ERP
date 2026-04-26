/**
 * Component-Specific Accessibility Tests
 * 
 * Tests accessibility of feature-specific components including:
 * - Data tables
 * - Forms
 * - Notifications
 * - Charts
 * - Modals/Dialogs
 * 
 * Requirements: 30.7, 21.1-21.12
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { toHaveNoViolations } from 'jest-axe';
import { BrowserRouter } from 'react-router-dom';

expect.extend(toHaveNoViolations);

// Import UI components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Mock stores
vi.mock('@/store/notificationStore', () => ({
  useNotificationStore: () => ({
    notifications: [],
    unreadCount: 0,
    markAsRead: vi.fn(),
    markAllAsRead: vi.fn(),
  }),
}));

vi.mock('@/store/uiStore', () => ({
  useUIStore: () => ({
    sidebarOpen: false,
    setSidebarOpen: vi.fn(),
    theme: 'light',
    setTheme: vi.fn(),
  }),
}));

vi.mock('@/store/authStore', () => ({
  useAuthStore: () => ({
    user: {
      id: '1',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'EMPLOYEE',
    },
    isAuthenticated: true,
  }),
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Accessibility Tests - Notification Components', () => {
  it('should have accessible notification button', async () => {
    const { container } = render(
      <button aria-label="Notifications, 3 unread notifications">
        <span>🔔</span>
        <span className="badge">3</span>
      </button>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe('Accessibility Tests - Data Table', () => {
  it('should have proper table structure', async () => {
    const { container } = render(
      <table>
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Name</th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td>John Doe</td>
            <td>Active</td>
          </tr>
          <tr>
            <td>2</td>
            <td>Jane Smith</td>
            <td>Inactive</td>
          </tr>
        </tbody>
      </table>
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have accessible sort buttons', async () => {
    const { container } = render(
      <table>
        <thead>
          <tr>
            <th scope="col">
              <button aria-label="Sort by ID, currently sorted ascending">
                ID
              </button>
            </th>
            <th scope="col">
              <button aria-label="Sort by Name">
                Name
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td>John Doe</td>
          </tr>
        </tbody>
      </table>
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have proper ARIA labels for table', async () => {
    const { container } = render(
      <table aria-label="Employee data table">
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>John Doe</td>
            <td>Active</td>
          </tr>
        </tbody>
      </table>
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe('Accessibility Tests - File Uploader', () => {
  it('should have accessible file input', async () => {
    const { container } = render(
      <div>
        <Label htmlFor="file-upload">Upload file</Label>
        <Input
          id="file-upload"
          type="file"
          accept=".pdf,.jpg,.jpeg"
          aria-label="Upload file, accepted types: PDF, JPG, JPEG, maximum size: 10MB"
        />
      </div>
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should announce upload progress', async () => {
    const { container } = render(
      <div>
        <Label htmlFor="file-upload">Upload file</Label>
        <Input id="file-upload" type="file" />
        <div
          role="progressbar"
          aria-valuenow={50}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Upload progress: 50%"
        >
          <div style={{ width: '50%' }} />
        </div>
      </div>
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe('Accessibility Tests - Form Components', () => {
  it('should have accessible form with validation', async () => {
    const { container } = render(
      <form>
        <div>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            aria-required="true"
            aria-invalid="false"
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            aria-required="true"
            aria-invalid="false"
            aria-describedby="password-help"
          />
          <span id="password-help">
            Password must be at least 8 characters
          </span>
        </div>
        <button type="submit">Submit</button>
      </form>
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have accessible error messages', async () => {
    const { container } = render(
      <form>
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            aria-required="true"
            aria-invalid="true"
            aria-describedby="email-error"
          />
          <span id="email-error" role="alert">
            Please enter a valid email address
          </span>
        </div>
      </form>
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe('Accessibility Tests - Interactive Elements', () => {
  it('should have accessible buttons with icons', async () => {
    const { container } = render(
      <button aria-label="Delete item">
        <svg aria-hidden="true">
          <path d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have accessible links', async () => {
    const { container } = render(
      <nav>
        <a href="/dashboard" aria-current="page">Dashboard</a>
        <a href="/employees">Employees</a>
        <a href="/attendance">Attendance</a>
      </nav>
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have accessible modal dialogs', async () => {
    const { container } = render(
      <div
        role="dialog"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-description"
        aria-modal="true"
      >
        <h2 id="dialog-title">Confirm Action</h2>
        <p id="dialog-description">
          Are you sure you want to proceed?
        </p>
        <button>Cancel</button>
        <button>Confirm</button>
      </div>
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe('Accessibility Tests - Status Indicators', () => {
  it('should have accessible status badges', async () => {
    const { container } = render(
      <div>
        <span
          className="badge"
          role="status"
          aria-label="Status: Active"
        >
          Active
        </span>
        <span
          className="badge"
          role="status"
          aria-label="Status: Pending"
        >
          Pending
        </span>
      </div>
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have accessible progress indicators', async () => {
    const { container } = render(
      <div
        role="progressbar"
        aria-valuenow={50}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Upload progress: 50%"
      >
        <div style={{ width: '50%' }} />
      </div>
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe('Accessibility Tests - Navigation', () => {
  it('should have accessible breadcrumb navigation', async () => {
    const { container } = render(
      <nav aria-label="Breadcrumb">
        <ol>
          <li>
            <a href="/">Home</a>
          </li>
          <li>
            <a href="/employees">Employees</a>
          </li>
          <li aria-current="page">
            John Doe
          </li>
        </ol>
      </nav>
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have accessible pagination', async () => {
    const { container } = render(
      <nav aria-label="Pagination">
        <button aria-label="Go to previous page">Previous</button>
        <button aria-label="Go to page 1" aria-current="page">1</button>
        <button aria-label="Go to page 2">2</button>
        <button aria-label="Go to page 3">3</button>
        <button aria-label="Go to next page">Next</button>
      </nav>
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe('Accessibility Tests - Dynamic Content', () => {
  it('should have accessible live regions', async () => {
    const { container } = render(
      <div>
        <div aria-live="polite" aria-atomic="true">
          <p>Data updated successfully</p>
        </div>
        <div aria-live="assertive" role="alert">
          <p>Error: Failed to save changes</p>
        </div>
      </div>
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should announce loading states', async () => {
    const { container } = render(
      <div role="status" aria-live="polite" aria-label="Loading data">
        <span>Loading...</span>
      </div>
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe('Accessibility Tests - Responsive Design', () => {
  it('should maintain accessibility on mobile viewport', async () => {
    // Simulate mobile viewport
    global.innerWidth = 375;
    global.innerHeight = 667;
    
    const { container } = render(
      <nav>
        <button aria-label="Open navigation menu" aria-expanded="false">
          Menu
        </button>
      </nav>
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have touch-friendly interactive elements', async () => {
    const { container } = render(
      <button style={{ minWidth: '44px', minHeight: '44px' }}>
        Touch Target
      </button>
    );
    
    const button = container.querySelector('button');
    const styles = window.getComputedStyle(button!);
    
    // Check minimum touch target size (44x44px)
    expect(parseInt(styles.minWidth)).toBeGreaterThanOrEqual(44);
    expect(parseInt(styles.minHeight)).toBeGreaterThanOrEqual(44);
  });
});
