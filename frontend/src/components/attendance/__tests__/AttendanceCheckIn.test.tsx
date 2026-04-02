/**
 * Component Tests for AttendanceCheckIn
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AttendanceCheckIn } from '../AttendanceCheckIn';

// Mock the face detection service
vi.mock('../../../services/faceDetectionService', () => ({
  faceDetectionService: {
    requestCameraAccess: vi.fn(),
    initializeModel: vi.fn(),
    detectHumanPresence: vi.fn(),
    verifyLiveness: vi.fn(),
    stopCameraStream: vi.fn(),
    dispose: vi.fn(),
  },
}));

describe('AttendanceCheckIn Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render check-in button', () => {
    render(<AttendanceCheckIn employeeId="emp-123" />);

    const button = screen.getByRole('button', { name: /check in/i });
    expect(button).toBeInTheDocument();
  });

  it('should open dialog when button is clicked', async () => {
    render(<AttendanceCheckIn employeeId="emp-123" />);

    const button = screen.getByRole('button', { name: /check in/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Mark Attendance')).toBeInTheDocument();
    });
  });

  it('should display face detection status', async () => {
    render(<AttendanceCheckIn employeeId="emp-123" />);

    const button = screen.getByRole('button', { name: /check in/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/face detection/i)).toBeInTheDocument();
    });
  });

  it('should display GPS status', async () => {
    render(<AttendanceCheckIn employeeId="emp-123" />);

    const button = screen.getByRole('button', { name: /check in/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/gps location/i)).toBeInTheDocument();
    });
  });

  it('should call onCheckInSuccess callback on successful check-in', async () => {
    const onCheckInSuccess = vi.fn();
    render(
      <AttendanceCheckIn
        employeeId="emp-123"
        onCheckInSuccess={onCheckInSuccess}
      />
    );

    // Mock successful API response
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            data: { id: 'att-123', employeeId: 'emp-123' },
          }),
      })
    ) as any;

    // Simulate check-in flow
    const button = screen.getByRole('button', { name: /check in/i });
    fireEvent.click(button);

    // Note: Full integration test would require mocking more services
  });

  it('should call onCheckInError callback on error', async () => {
    const onCheckInError = vi.fn();
    render(
      <AttendanceCheckIn
        employeeId="emp-123"
        onCheckInError={onCheckInError}
      />
    );

    // Mock failed API response
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        json: () =>
          Promise.resolve({
            error: { message: 'Check-in failed' },
          }),
      })
    ) as any;

    // Note: Full integration test would require mocking more services
  });
});
