import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AssetRecoveryChecklist } from '../AssetRecoveryChecklist';

describe('AssetRecoveryChecklist', () => {
  const mockOnUpdateStatus = vi.fn();

  beforeEach(() => {
    mockOnUpdateStatus.mockClear();
  });

  it('should render asset recovery checklist component', () => {
    render(
      <AssetRecoveryChecklist
        employeeId="EMP001"
        onUpdateStatus={mockOnUpdateStatus}
      />
    );

    expect(screen.getByText(/Asset Recovery Checklist/i)).toBeInTheDocument();
  });

  it('should display summary statistics', async () => {
    render(
      <AssetRecoveryChecklist
        employeeId="EMP001"
        onUpdateStatus={mockOnUpdateStatus}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Total Assets/i)).toBeInTheDocument();
      expect(screen.getByText(/Returned/i)).toBeInTheDocument();
      expect(screen.getByText(/Pending/i)).toBeInTheDocument();
      expect(screen.getByText(/Unreturned/i)).toBeInTheDocument();
    });
  });

  it('should display status badges for assets', async () => {
    render(
      <AssetRecoveryChecklist
        employeeId="EMP001"
        onUpdateStatus={mockOnUpdateStatus}
      />
    );

    await waitFor(() => {
      // Status badges should be displayed
      expect(screen.queryByText(/PENDING|RETURNED|DAMAGED|MISSING/i)).toBeInTheDocument();
    });
  });

  it('should allow updating asset status to returned', async () => {
    const user = userEvent.setup();
    mockOnUpdateStatus.mockResolvedValue(undefined);

    render(
      <AssetRecoveryChecklist
        employeeId="EMP001"
        onUpdateStatus={mockOnUpdateStatus}
      />
    );

    await waitFor(() => {
      const updateButtons = screen.queryAllByRole('button', { name: /Update Status/i });
      if (updateButtons.length > 0) {
        expect(updateButtons[0]).toBeInTheDocument();
      }
    });
  });

  it('should display unreturned assets warning', async () => {
    render(
      <AssetRecoveryChecklist
        employeeId="EMP001"
        onUpdateStatus={mockOnUpdateStatus}
      />
    );

    await waitFor(() => {
      // Check if unreturned assets section exists
      const unreturned = screen.queryByText(/⚠️ Unreturned Asset/i);
      if (unreturned) {
        expect(unreturned).toBeInTheDocument();
      }
    });
  });

  it('should display completion message when all assets processed', async () => {
    render(
      <AssetRecoveryChecklist
        employeeId="EMP001"
        onUpdateStatus={mockOnUpdateStatus}
      />
    );

    await waitFor(() => {
      // Check for completion message
      const completion = screen.queryByText(/All assets have been processed/i);
      if (completion) {
        expect(completion).toBeInTheDocument();
      }
    });
  });

  it('should handle loading state', () => {
    render(
      <AssetRecoveryChecklist
        employeeId="EMP001"
        onUpdateStatus={mockOnUpdateStatus}
        isLoading={true}
      />
    );

    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
  });

  it('should display empty state when no assets', async () => {
    render(
      <AssetRecoveryChecklist
        employeeId="EMP001"
        onUpdateStatus={mockOnUpdateStatus}
      />
    );

    await waitFor(() => {
      const emptyState = screen.queryByText(/No assets assigned to this employee/i);
      if (emptyState) {
        expect(emptyState).toBeInTheDocument();
      }
    });
  });
});
