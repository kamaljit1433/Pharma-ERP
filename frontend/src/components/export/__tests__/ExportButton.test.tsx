/**
 * Export Button Component Tests
 * Tests for reusable export button
 * 
 * Requirements: 26.1, 26.2, 26.3, 26.4
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ExportButton } from '../ExportButton';

// Mock the useToast hook
vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe('ExportButton', () => {
  const mockData = [
    { id: '1', name: 'John Doe', email: 'john@example.com' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
  ];

  const defaultProps = {
    data: mockData,
    filename: 'test-export',
    title: 'Export Test Data',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders export button', () => {
    render(<ExportButton {...defaultProps} />);
    expect(screen.getByRole('button', { name: /Export/ })).toBeInTheDocument();
  });

  it('displays icon and label by default', () => {
    render(<ExportButton {...defaultProps} />);
    const button = screen.getByRole('button', { name: /Export/ });
    expect(button).toHaveClass('gap-2');
  });

  it('hides icon when showIcon is false', () => {
    render(<ExportButton {...defaultProps} showIcon={false} />);
    const button = screen.getByRole('button', { name: /Export/ });
    expect(button).toBeInTheDocument();
  });

  it('hides label when showLabel is false', () => {
    render(<ExportButton {...defaultProps} showLabel={false} />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('disables button when disabled prop is true', () => {
    render(<ExportButton {...defaultProps} disabled={true} />);
    const button = screen.getByRole('button', { name: /Export/ });
    expect(button).toBeDisabled();
  });

  it('disables button when data is empty', () => {
    render(<ExportButton {...defaultProps} data={[]} />);
    const button = screen.getByRole('button', { name: /Export/ });
    expect(button).toBeDisabled();
  });

  it('enables button when data is available', () => {
    render(<ExportButton {...defaultProps} />);
    const button = screen.getByRole('button', { name: /Export/ });
    expect(button).not.toBeDisabled();
  });

  it('opens export dialog when clicked', async () => {
    render(<ExportButton {...defaultProps} />);
    const button = screen.getByRole('button', { name: /Export/ });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Export Test Data')).toBeInTheDocument();
    });
  });

  it('closes dialog when cancel is clicked', async () => {
    render(<ExportButton {...defaultProps} />);
    const button = screen.getByRole('button', { name: /Export/ });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Export Test Data')).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: /Cancel/ });
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByText('Export Test Data')).not.toBeInTheDocument();
    });
  });

  it('applies custom className', () => {
    render(<ExportButton {...defaultProps} className="custom-class" />);
    const button = screen.getByRole('button', { name: /Export/ });
    expect(button).toHaveClass('custom-class');
  });
});
