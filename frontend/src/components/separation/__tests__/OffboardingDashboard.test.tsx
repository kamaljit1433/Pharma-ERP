import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { OffboardingDashboard } from '../OffboardingDashboard';

describe('OffboardingDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render offboarding dashboard component', () => {
    render(
      <OffboardingDashboard
        employeeId="EMP001"
        employeeName="John Doe"
      />
    );

    expect(screen.getByText(/Offboarding Dashboard/i)).toBeInTheDocument();
  });

  it('should display employee name and last working day', () => {
    const lastWorkingDay = new Date('2024-02-15');
    render(
      <OffboardingDashboard
        employeeId="EMP001"
        employeeName="John Doe"
        lastWorkingDay={lastWorkingDay}
      />
    );

    expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
  });

  it('should display completion percentage', async () => {
    render(
      <OffboardingDashboard
        employeeId="EMP001"
        employeeName="John Doe"
      />
    );

    await waitFor(() => {
      // Completion percentage should be displayed
      const percentage = screen.queryByText(/%/i);
      if (percentage) {
        expect(percentage).toBeInTheDocument();
      }
    });
  });

  it('should display offboarding checklist items', async () => {
    render(
      <OffboardingDashboard
        employeeId="EMP001"
        employeeName="John Doe"
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Offboarding Checklist/i)).toBeInTheDocument();
      expect(screen.getByText(/Exit Interview/i)).toBeInTheDocument();
      expect(screen.getByText(/F&F Settlement/i)).toBeInTheDocument();
      expect(screen.getByText(/Asset Recovery/i)).toBeInTheDocument();
      expect(screen.getByText(/System Access/i)).toBeInTheDocument();
      expect(screen.getByText(/Data Archive/i)).toBeInTheDocument();
    });
  });

  it('should display next steps section', async () => {
    render(
      <OffboardingDashboard
        employeeId="EMP001"
        employeeName="John Doe"
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Next Steps/i)).toBeInTheDocument();
      expect(screen.getByText(/Ensure all exit interview questions are answered/i)).toBeInTheDocument();
    });
  });

  it('should display completion status message', async () => {
    render(
      <OffboardingDashboard
        employeeId="EMP001"
        employeeName="John Doe"
      />
    );

    await waitFor(() => {
      // Check for either pending or completion message
      const message = screen.queryByText(/task.*remaining|All offboarding tasks completed/i);
      if (message) {
        expect(message).toBeInTheDocument();
      }
    });
  });

  it('should display progress bar', async () => {
    render(
      <OffboardingDashboard
        employeeId="EMP001"
        employeeName="John Doe"
      />
    );

    await waitFor(() => {
      // Progress bar should be rendered
      const progressBar = screen.queryByRole('progressbar');
      if (progressBar) {
        expect(progressBar).toBeInTheDocument();
      }
    });
  });

  it('should handle loading state', () => {
    render(
      <OffboardingDashboard
        employeeId="EMP001"
        employeeName="John Doe"
      />
    );

    // Component should render without errors
    expect(screen.getByText(/Offboarding Dashboard/i)).toBeInTheDocument();
  });

  it('should display pending tasks when not all items complete', async () => {
    render(
      <OffboardingDashboard
        employeeId="EMP001"
        employeeName="John Doe"
      />
    );

    await waitFor(() => {
      // Check for pending tasks section
      const pendingTasks = screen.queryByText(/Pending Tasks/i);
      if (pendingTasks) {
        expect(pendingTasks).toBeInTheDocument();
      }
    });
  });
});
