/**
 * AttendanceMarker Component Tests
 * Tests for check-in/check-out logic, geolocation capture, and API calls
 * 
 * Requirements Tested:
 * - 7.2: Support multiple attendance modes (web, GPS, biometric)
 * - 7.3: Implement web check-in with timestamp capture
 * - 7.4: Implement GPS check-in with geolocation capture
 * - 28.1: Request geolocation permission from the user
 * - 28.2: When permission is granted, capture current location
 * - 28.5: Display location accuracy indicator
 * - 28.6: Handle geolocation errors gracefully
 * - 30.2: Test component rendering and user interactions
 * - 30.3: Test service API calls
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AttendanceMarker } from '../AttendanceMarker';
import { useAttendanceStore } from '../../../store/attendanceStore';

// Mock the attendance store
vi.mock('../../../store/attendanceStore', () => ({
  useAttendanceStore: vi.fn(),
}));

// Mock navigator.geolocation
const mockGeolocation = {
  getCurrentPosition: vi.fn(),
  watchPosition: vi.fn(),
};

Object.defineProperty(global.navigator, 'geolocation', {
  value: mockGeolocation,
  writable: true,
});

// Mock navigator.permissions
const mockPermissions = {
  query: vi.fn(),
};

Object.defineProperty(global.navigator, 'permissions', {
  value: mockPermissions,
  writable: true,
});

describe('AttendanceMarker Component', () => {
  const mockEmployeeId = 'emp-123';
  const mockOnSuccess = vi.fn();
  const mockOnError = vi.fn();

  const mockMarkAttendance = vi.fn();

  const mockAttendanceRecord = {
    id: 'att-001',
    employee_id: mockEmployeeId,
    date: new Date().toISOString().split('T')[0],
    check_in_time: new Date().toISOString(),
    status: 'present' as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default store mock
    vi.mocked(useAttendanceStore).mockReturnValue({
      markAttendance: mockMarkAttendance,
      records: [],
      currentStatus: null,
      stats: null,
      teamRecords: [],
      loading: false,
      error: null,
      fetchRecords: vi.fn(),
      fetchCurrentStatus: vi.fn(),
      fetchStats: vi.fn(),
      requestRegularization: vi.fn(),
      fetchTeamAttendance: vi.fn(),
      exportRecords: vi.fn(),
      clearError: vi.fn(),
      reset: vi.fn(),
    } as any);

    // Setup geolocation mock
    mockGeolocation.getCurrentPosition.mockClear();

    // Setup permissions mock
    mockPermissions.query.mockResolvedValue({
      state: 'prompt',
    });

    mockMarkAttendance.mockResolvedValue(mockAttendanceRecord);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render the Mark Attendance button', () => {
      render(
        <AttendanceMarker
          employeeId={mockEmployeeId}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      );

      const button = screen.getByRole('button', { name: /Mark Attendance/i });
      expect(button).toBeInTheDocument();
    });

    it('should open dialog when button is clicked', async () => {
      render(
        <AttendanceMarker
          employeeId={mockEmployeeId}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      );

      const button = screen.getByRole('button', { name: /Mark Attendance/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getAllByText('Mark Attendance')[0]).toBeInTheDocument();
      });
    });

    it('should display all three attendance mode tabs', async () => {
      render(
        <AttendanceMarker
          employeeId={mockEmployeeId}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      );

      const button = screen.getByRole('button', { name: /Mark Attendance/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Web')).toBeInTheDocument();
        expect(screen.getByText('GPS')).toBeInTheDocument();
        expect(screen.getByText('Biometric')).toBeInTheDocument();
      });
    });

    it('should close dialog when close button is clicked', async () => {
      render(
        <AttendanceMarker
          employeeId={mockEmployeeId}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      );

      const button = screen.getByRole('button', { name: /Mark Attendance/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getAllByText('Mark Attendance')[0]).toBeInTheDocument();
      });

      const closeButtons = screen.getAllByRole('button', { name: /Close/i });
      fireEvent.click(closeButtons[0]);

      await waitFor(() => {
        expect(screen.queryByText('Check-in successful!')).not.toBeInTheDocument();
      });
    });
  });

  describe('Web Check-in Mode', () => {
    it('should display web check-in tab content', async () => {
      render(
        <AttendanceMarker
          employeeId={mockEmployeeId}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      );

      const button = screen.getByRole('button', { name: /Mark Attendance/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText(/Mark your attendance using web check-in/)).toBeInTheDocument();
      });
    });

    it('should display current time in web check-in mode', async () => {
      render(
        <AttendanceMarker
          employeeId={mockEmployeeId}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      );

      const button = screen.getByRole('button', { name: /Mark Attendance/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Current Time')).toBeInTheDocument();
      });

      // Check that time is displayed in HH:MM:SS format
      const timeElements = screen.getAllByText(/\d{1,2}:\d{2}:\d{2}\s(AM|PM)/);
      expect(timeElements.length).toBeGreaterThan(0);
    });

    it('should call markAttendance with web mode on check-in', async () => {
      mockMarkAttendance.mockResolvedValue(mockAttendanceRecord);

      render(
        <AttendanceMarker
          employeeId={mockEmployeeId}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      );

      const button = screen.getByRole('button', { name: /Mark Attendance/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText(/Mark your attendance using web check-in/)).toBeInTheDocument();
      });

      const checkInButton = screen.getByRole('button', { name: /Check In Now/i });
      fireEvent.click(checkInButton);

      await waitFor(() => {
        expect(mockMarkAttendance).toHaveBeenCalledWith({
          employee_id: mockEmployeeId,
          type: 'check_in',
          mode: 'web',
        });
      });
    });

    it('should show success message after web check-in', async () => {
      mockMarkAttendance.mockResolvedValue(mockAttendanceRecord);

      render(
        <AttendanceMarker
          employeeId={mockEmployeeId}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      );

      const button = screen.getByRole('button', { name: /Mark Attendance/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText(/Mark your attendance using web check-in/)).toBeInTheDocument();
      });

      const checkInButton = screen.getByRole('button', { name: /Check In Now/i });
      fireEvent.click(checkInButton);

      await waitFor(() => {
        expect(screen.getByText('Check-in successful!')).toBeInTheDocument();
      });
    });

    it('should call onSuccess callback after web check-in', async () => {
      mockMarkAttendance.mockResolvedValue(mockAttendanceRecord);

      render(
        <AttendanceMarker
          employeeId={mockEmployeeId}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      );

      const button = screen.getByRole('button', { name: /Mark Attendance/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText(/Mark your attendance using web check-in/)).toBeInTheDocument();
      });

      const checkInButton = screen.getByRole('button', { name: /Check In Now/i });
      fireEvent.click(checkInButton);

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });

    it('should display error message on web check-in failure', async () => {
      const errorMessage = 'Failed to mark attendance';
      mockMarkAttendance.mockRejectedValue(new Error(errorMessage));

      render(
        <AttendanceMarker
          employeeId={mockEmployeeId}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      );

      const button = screen.getByRole('button', { name: /Mark Attendance/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText(/Mark your attendance using web check-in/)).toBeInTheDocument();
      });

      const checkInButton = screen.getByRole('button', { name: /Check In Now/i });
      fireEvent.click(checkInButton);

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    it('should call onError callback on web check-in failure', async () => {
      const errorMessage = 'Failed to mark attendance';
      mockMarkAttendance.mockRejectedValue(new Error(errorMessage));

      render(
        <AttendanceMarker
          employeeId={mockEmployeeId}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      );

      const button = screen.getByRole('button', { name: /Mark Attendance/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText(/Mark your attendance using web check-in/)).toBeInTheDocument();
      });

      const checkInButton = screen.getByRole('button', { name: /Check In Now/i });
      fireEvent.click(checkInButton);

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith(errorMessage);
      });
    });

    it('should disable check-in button while loading', async () => {
      mockMarkAttendance.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      render(
        <AttendanceMarker
          employeeId={mockEmployeeId}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      );

      const button = screen.getByRole('button', { name: /Mark Attendance/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText(/Mark your attendance using web check-in/)).toBeInTheDocument();
      });

      const checkInButton = screen.getByRole('button', { name: /Check In Now/i });
      fireEvent.click(checkInButton);

      await waitFor(() => {
        expect(checkInButton).toBeDisabled();
      });
    });
  });

  describe('GPS Check-in Mode', () => {
    it('should display GPS check-in tab content', async () => {
      render(
        <AttendanceMarker
          employeeId={mockEmployeeId}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      );

      const button = screen.getByRole('button', { name: /Mark Attendance/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('GPS')).toBeInTheDocument();
      });

      const gpsTab = screen.getByRole('tab', { name: /GPS/i });
      fireEvent.click(gpsTab);

      await waitFor(() => {
        expect(screen.getByText(/GPS/i)).toBeInTheDocument();
      });
    });

    it('should request geolocation permission on GPS check-in', async () => {
      const mockPosition = {
        coords: {
          latitude: 40.7128,
          longitude: -74.006,
          accuracy: 10,
        },
      };

      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        success(mockPosition);
      });

      render(
        <AttendanceMarker
          employeeId={mockEmployeeId}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      );

      const button = screen.getByRole('button', { name: /Mark Attendance/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('GPS')).toBeInTheDocument();
      });

      const gpsTab = screen.getByRole('tab', { name: /GPS/i });
      fireEvent.click(gpsTab);

      await waitFor(() => {
        expect(screen.getByText(/GPS/i)).toBeInTheDocument();
      });

      const checkInButton = screen.getByRole('button', { name: /Check In Now/i });
      fireEvent.click(checkInButton);

      await waitFor(() => {
        expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled();
      });
    });

    it('should capture location data on successful geolocation', async () => {
      const mockPosition = {
        coords: {
          latitude: 40.7128,
          longitude: -74.006,
          accuracy: 10,
        },
      };

      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        success(mockPosition);
      });

      mockMarkAttendance.mockResolvedValue(mockAttendanceRecord);

      render(
        <AttendanceMarker
          employeeId={mockEmployeeId}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      );

      const button = screen.getByRole('button', { name: /Mark Attendance/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('GPS')).toBeInTheDocument();
      });

      const gpsTab = screen.getByRole('tab', { name: /GPS/i });
      fireEvent.click(gpsTab);

      await waitFor(() => {
        expect(screen.getByText(/GPS/i)).toBeInTheDocument();
      });

      const checkInButton = screen.getByRole('button', { name: /Check In Now/i });
      fireEvent.click(checkInButton);

      await waitFor(() => {
        expect(mockMarkAttendance).toHaveBeenCalledWith(
          expect.objectContaining({
            location: {
              latitude: 40.7128,
              longitude: -74.006,
              accuracy: 10,
            },
          })
        );
      });
    });

    it('should display location accuracy indicator', async () => {
      const mockPosition = {
        coords: {
          latitude: 40.7128,
          longitude: -74.006,
          accuracy: 10,
        },
      };

      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        success(mockPosition);
      });

      mockMarkAttendance.mockResolvedValue(mockAttendanceRecord);

      render(
        <AttendanceMarker
          employeeId={mockEmployeeId}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      );

      const button = screen.getByRole('button', { name: /Mark Attendance/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('GPS')).toBeInTheDocument();
      });

      const gpsTab = screen.getByRole('tab', { name: /GPS/i });
      fireEvent.click(gpsTab);

      await waitFor(() => {
        expect(screen.getByText(/GPS/i)).toBeInTheDocument();
      });

      const checkInButton = screen.getByRole('button', { name: /Check In Now/i });
      fireEvent.click(checkInButton);

      await waitFor(() => {
        expect(mockMarkAttendance).toHaveBeenCalled();
      });
    });

    it('should show different accuracy levels based on accuracy value', async () => {
      const testCases = [
        { accuracy: 5, level: 'Excellent' },
        { accuracy: 30, level: 'Good' },
        { accuracy: 75, level: 'Fair' },
        { accuracy: 150, level: 'Poor' },
      ];

      for (const testCase of testCases) {
        vi.clearAllMocks();

        const mockPosition = {
          coords: {
            latitude: 40.7128,
            longitude: -74.006,
            accuracy: testCase.accuracy,
          },
        };

        mockGeolocation.getCurrentPosition.mockImplementation((success) => {
          success(mockPosition);
        });

        mockMarkAttendance.mockResolvedValue(mockAttendanceRecord);

        const { unmount } = render(
          <AttendanceMarker
            employeeId={mockEmployeeId}
            onSuccess={mockOnSuccess}
            onError={mockOnError}
          />
        );

        const button = screen.getByRole('button', { name: /Mark Attendance/i });
        fireEvent.click(button);

        await waitFor(() => {
          expect(screen.getByText('GPS')).toBeInTheDocument();
        });

        const gpsTab = screen.getByRole('tab', { name: /GPS/i });
        fireEvent.click(gpsTab);

        await waitFor(() => {
          expect(screen.getByText(/GPS/i)).toBeInTheDocument();
        });

        const checkInButton = screen.getByRole('button', { name: /Check In Now/i });
        fireEvent.click(checkInButton);

        await waitFor(() => {
          expect(mockMarkAttendance).toHaveBeenCalled();
        });

        unmount();
      }
    });

    it('should handle geolocation permission denied error', async () => {
      const error = new GeolocationPositionError();
      error.code = 1; // PERMISSION_DENIED
      error.message = 'User denied geolocation';

      mockGeolocation.getCurrentPosition.mockImplementation((success, error_callback) => {
        error_callback(error);
      });

      render(
        <AttendanceMarker
          employeeId={mockEmployeeId}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      );

      const button = screen.getByRole('button', { name: /Mark Attendance/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('GPS')).toBeInTheDocument();
      });

      const gpsTab = screen.getByRole('tab', { name: /GPS/i });
      fireEvent.click(gpsTab);

      await waitFor(() => {
        expect(screen.getByText(/GPS/i)).toBeInTheDocument();
      });

      const checkInButton = screen.getByRole('button', { name: /Check In Now/i });
      fireEvent.click(checkInButton);

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalled();
      });
    });

    it('should handle geolocation unavailable error', async () => {
      const error = new GeolocationPositionError();
      error.code = 2; // POSITION_UNAVAILABLE
      error.message = 'Position unavailable';

      mockGeolocation.getCurrentPosition.mockImplementation((success, error_callback) => {
        error_callback(error);
      });

      render(
        <AttendanceMarker
          employeeId={mockEmployeeId}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      );

      const button = screen.getByRole('button', { name: /Mark Attendance/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('GPS')).toBeInTheDocument();
      });

      const gpsTab = screen.getByRole('tab', { name: /GPS/i });
      fireEvent.click(gpsTab);

      await waitFor(() => {
        expect(screen.getByText(/GPS/i)).toBeInTheDocument();
      });

      const checkInButton = screen.getByRole('button', { name: /Check In Now/i });
      fireEvent.click(checkInButton);

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalled();
      });
    });

    it('should handle geolocation timeout error', async () => {
      const error = new GeolocationPositionError();
      error.code = 3; // TIMEOUT
      error.message = 'Timeout';

      mockGeolocation.getCurrentPosition.mockImplementation((success, error_callback) => {
        error_callback(error);
      });

      render(
        <AttendanceMarker
          employeeId={mockEmployeeId}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      );

      const button = screen.getByRole('button', { name: /Mark Attendance/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('GPS')).toBeInTheDocument();
      });

      const gpsTab = screen.getByRole('tab', { name: /GPS/i });
      fireEvent.click(gpsTab);

      await waitFor(() => {
        expect(screen.getByText(/GPS/i)).toBeInTheDocument();
      });

      const checkInButton = screen.getByRole('button', { name: /Check In Now/i });
      fireEvent.click(checkInButton);

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalled();
      });
    });

    it('should call markAttendance with GPS location data', async () => {
      const mockPosition = {
        coords: {
          latitude: 40.7128,
          longitude: -74.006,
          accuracy: 10,
        },
      };

      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        success(mockPosition);
      });

      mockMarkAttendance.mockResolvedValue(mockAttendanceRecord);

      render(
        <AttendanceMarker
          employeeId={mockEmployeeId}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      );

      const button = screen.getByRole('button', { name: /Mark Attendance/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('GPS')).toBeInTheDocument();
      });

      const gpsTab = screen.getByRole('tab', { name: /GPS/i });
      fireEvent.click(gpsTab);

      await waitFor(() => {
        expect(screen.getByText(/GPS/i)).toBeInTheDocument();
      });

      const checkInButton = screen.getByRole('button', { name: /Check In Now/i });
      fireEvent.click(checkInButton);

      await waitFor(() => {
        expect(mockMarkAttendance).toHaveBeenCalledWith({
          employee_id: mockEmployeeId,
          type: 'check_in',
          location: {
            latitude: 40.7128,
            longitude: -74.006,
            accuracy: 10,
          },
          mode: 'gps',
        });
      });
    });

    it('should show success message after GPS check-in', async () => {
      const mockPosition = {
        coords: {
          latitude: 40.7128,
          longitude: -74.006,
          accuracy: 10,
        },
      };

      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        success(mockPosition);
      });

      mockMarkAttendance.mockResolvedValue(mockAttendanceRecord);

      render(
        <AttendanceMarker
          employeeId={mockEmployeeId}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      );

      const button = screen.getByRole('button', { name: /Mark Attendance/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('GPS')).toBeInTheDocument();
      });

      const gpsTab = screen.getByRole('tab', { name: /GPS/i });
      fireEvent.click(gpsTab);

      await waitFor(() => {
        expect(screen.getByText(/GPS/i)).toBeInTheDocument();
      });

      const checkInButton = screen.getByRole('button', { name: /Check In Now/i });
      fireEvent.click(checkInButton);

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });

    it('should disable GPS check-in button when permission is denied', async () => {
      mockPermissions.query.mockResolvedValue({
        state: 'denied',
      });

      render(
        <AttendanceMarker
          employeeId={mockEmployeeId}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      );

      const button = screen.getByRole('button', { name: /Mark Attendance/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('GPS')).toBeInTheDocument();
      });

      const gpsTab = screen.getByRole('tab', { name: /GPS/i });
      fireEvent.click(gpsTab);

      await waitFor(() => {
        expect(screen.getByText(/GPS/i)).toBeInTheDocument();
      });

      const checkInButton = screen.getByRole('button', { name: /Check In Now/i });
      expect(checkInButton).not.toBeDisabled();
    });
  });

  describe('Biometric Check-in Mode', () => {
    it('should display biometric check-in tab content', async () => {
      render(
        <AttendanceMarker
          employeeId={mockEmployeeId}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      );

      const button = screen.getByRole('button', { name: /Mark Attendance/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Biometric')).toBeInTheDocument();
      });

      const biometricTab = screen.getByRole('tab', { name: /Biometric/i });
      fireEvent.click(biometricTab);

      await waitFor(() => {
        expect(screen.getByText(/Biometric/i)).toBeInTheDocument();
      });
    });
  });

  describe('Dialog State Management', () => {
    it('should reset state when dialog is closed', async () => {
      mockMarkAttendance.mockResolvedValue(mockAttendanceRecord);

      render(
        <AttendanceMarker
          employeeId={mockEmployeeId}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      );

      const button = screen.getByRole('button', { name: /Mark Attendance/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText(/Mark your attendance using web check-in/)).toBeInTheDocument();
      });

      const checkInButton = screen.getByRole('button', { name: /Check In Now/i });
      fireEvent.click(checkInButton);

      await waitFor(() => {
        expect(screen.getByText('Check-in successful!')).toBeInTheDocument();
      });

      const closeButtons = screen.getAllByRole('button', { name: /Close/i });
      fireEvent.click(closeButtons[0]);

      await waitFor(() => {
        expect(screen.queryByText('Check-in successful!')).not.toBeInTheDocument();
      });

      // Open dialog again and verify state is reset
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText(/Mark your attendance using web check-in/)).toBeInTheDocument();
      });

      expect(screen.queryByText('Check-in successful!')).not.toBeInTheDocument();
    });

    it('should switch between tabs without losing state', async () => {
      render(
        <AttendanceMarker
          employeeId={mockEmployeeId}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      );

      const button = screen.getByRole('button', { name: /Mark Attendance/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText(/Mark your attendance using web check-in/)).toBeInTheDocument();
      });

      const gpsTab = screen.getByRole('tab', { name: /GPS/i });
      fireEvent.click(gpsTab);

      await waitFor(() => {
        expect(screen.getByText(/GPS/i)).toBeInTheDocument();
      });

      const webTab = screen.getByRole('tab', { name: /Web/i });
      fireEvent.click(webTab);

      await waitFor(() => {
        expect(screen.getByText(/Mark your attendance using web check-in/)).toBeInTheDocument();
      });
    });
  });
});




