/**
 * Tests for GeolocationCapture Component
 * Tests location capture UI, error handling, and user interactions
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GeolocationCapture } from '../GeolocationCapture';

describe('GeolocationCapture Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock geolocation API
    const mockGeolocation = {
      getCurrentPosition: vi.fn(),
    };
    Object.defineProperty(navigator, 'geolocation', {
      value: mockGeolocation,
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial Render', () => {
    it('should render capture button', () => {
      render(<GeolocationCapture />);

      expect(screen.getByRole('button', { name: /Capture Location/i })).toBeInTheDocument();
    });

    it('should display empty state message', () => {
      render(<GeolocationCapture />);

      expect(
        screen.getByText('Click the button above to capture your current location')
      ).toBeInTheDocument();
    });

    it('should render with default props', () => {
      const { container } = render(<GeolocationCapture />);

      expect(container).toBeInTheDocument();
    });
  });

  describe('Location Capture', () => {
    it('should capture location successfully', async () => {
      const mockPosition = {
        coords: {
          latitude: 40.7128,
          longitude: -74.006,
          accuracy: 5,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      };

      (navigator.geolocation.getCurrentPosition as any).mockImplementation(
        (success: any) => {
          success(mockPosition as GeolocationPosition);
        }
      );

      render(<GeolocationCapture showCoordinates={true} />);

      const captureButton = screen.getByRole('button', { name: /Capture Location/i });
      await userEvent.click(captureButton);

      await waitFor(() => {
        expect(screen.getByText('Location Captured')).toBeInTheDocument();
        expect(screen.getByText('40.712800')).toBeInTheDocument();
        expect(screen.getByText('-74.006000')).toBeInTheDocument();
      });
    });

    it('should call onLocationCapture callback', async () => {
      const mockPosition = {
        coords: {
          latitude: 40.7128,
          longitude: -74.006,
          accuracy: 5,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      };

      (navigator.geolocation.getCurrentPosition as any).mockImplementation(
        (success: any) => {
          success(mockPosition as GeolocationPosition);
        }
      );

      const onLocationCapture = vi.fn();
      render(<GeolocationCapture onLocationCapture={onLocationCapture} />);

      const captureButton = screen.getByRole('button', { name: /Capture Location/i });
      await userEvent.click(captureButton);

      await waitFor(() => {
        expect(onLocationCapture).toHaveBeenCalledWith(
          expect.objectContaining({
            latitude: 40.7128,
            longitude: -74.006,
            accuracy: 5,
          })
        );
      });
    });

    it('should display timestamp when location is captured', async () => {
      const mockPosition = {
        coords: {
          latitude: 40.7128,
          longitude: -74.006,
          accuracy: 5,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      };

      (navigator.geolocation.getCurrentPosition as any).mockImplementation(
        (success: any) => {
          success(mockPosition as GeolocationPosition);
        }
      );

      render(<GeolocationCapture />);

      const captureButton = screen.getByRole('button', { name: /Capture Location/i });
      await userEvent.click(captureButton);

      await waitFor(() => {
        expect(screen.getByText('Captured At')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should display permission denied error', async () => {
      const error = new GeolocationPositionError(1, 'Permission denied');

      (navigator.geolocation.getCurrentPosition as any).mockImplementation(
        (success: any, error_callback: any) => {
          error_callback?.(error);
        }
      );

      const { container } = render(<GeolocationCapture />);

      const captureButton = screen.getByRole('button', { name: /Capture Location/i });
      await userEvent.click(captureButton);

      await waitFor(() => {
        expect(screen.getByText('Location Error')).toBeInTheDocument();
        expect(
          screen.getByText(/Location permission denied/)
        ).toBeInTheDocument();
      });
    });

    it('should display permission denied alert', async () => {
      const error = new GeolocationPositionError(1, 'Permission denied');

      (navigator.geolocation.getCurrentPosition as any).mockImplementation(
        (success: any, error_callback: any) => {
          error_callback?.(error);
        }
      );

      render(<GeolocationCapture />);

      const captureButton = screen.getByRole('button', { name: /Capture Location/i });
      await userEvent.click(captureButton);

      await waitFor(() => {
        expect(screen.getByText('Location Permission Denied')).toBeInTheDocument();
      });
    });

    it('should call onError callback when error occurs', async () => {
      const error = new GeolocationPositionError(1, 'Permission denied');

      (navigator.geolocation.getCurrentPosition as any).mockImplementation(
        (success: any, error_callback: any) => {
          error_callback?.(error);
        }
      );

      const onError = vi.fn();
      render(<GeolocationCapture onError={onError} />);

      const captureButton = screen.getByRole('button', { name: /Capture Location/i });
      await userEvent.click(captureButton);

      await waitFor(() => {
        expect(onError).toHaveBeenCalled();
      });
    });

    it('should disable capture button when permission is denied', async () => {
      const error = new GeolocationPositionError(1, 'Permission denied');

      (navigator.geolocation.getCurrentPosition as any).mockImplementation(
        (success: any, error_callback: any) => {
          error_callback?.(error);
        }
      );

      render(<GeolocationCapture />);

      const captureButton = screen.getByRole('button', { name: /Capture Location/i });
      await userEvent.click(captureButton);

      await waitFor(() => {
        expect(captureButton).toBeDisabled();
      });
    });
  });

  describe('Coordinates Display', () => {
    it('should show coordinates when showCoordinates is true', async () => {
      const mockPosition = {
        coords: {
          latitude: 40.7128,
          longitude: -74.006,
          accuracy: 5,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      };

      (navigator.geolocation.getCurrentPosition as any).mockImplementation(
        (success: any) => {
          success(mockPosition as GeolocationPosition);
        }
      );

      render(<GeolocationCapture showCoordinates={true} />);

      const captureButton = screen.getByRole('button', { name: /Capture Location/i });
      await userEvent.click(captureButton);

      await waitFor(() => {
        expect(screen.getByText('Latitude')).toBeInTheDocument();
        expect(screen.getByText('Longitude')).toBeInTheDocument();
      });
    });

    it('should hide coordinates when showCoordinates is false', async () => {
      const mockPosition = {
        coords: {
          latitude: 40.7128,
          longitude: -74.006,
          accuracy: 5,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      };

      (navigator.geolocation.getCurrentPosition as any).mockImplementation(
        (success: any) => {
          success(mockPosition as GeolocationPosition);
        }
      );

      render(<GeolocationCapture showCoordinates={false} />);

      const captureButton = screen.getByRole('button', { name: /Capture Location/i });
      await userEvent.click(captureButton);

      await waitFor(() => {
        expect(screen.queryByText('Latitude')).not.toBeInTheDocument();
        expect(screen.queryByText('Longitude')).not.toBeInTheDocument();
      });
    });
  });

  describe('Copy Functionality', () => {
    it('should show copy button when showCopyButton is true', async () => {
      const mockPosition = {
        coords: {
          latitude: 40.7128,
          longitude: -74.006,
          accuracy: 5,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      };

      (navigator.geolocation.getCurrentPosition as any).mockImplementation(
        (success: any) => {
          success(mockPosition as GeolocationPosition);
        }
      );

      render(<GeolocationCapture showCopyButton={true} />);

      const captureButton = screen.getByRole('button', { name: /Capture Location/i });
      await userEvent.click(captureButton);

      await waitFor(() => {
        const copyButtons = screen.getAllByRole('button', { name: /Copy/i });
        expect(copyButtons.length).toBeGreaterThan(0);
      });
    });

    it('should hide copy button when showCopyButton is false', async () => {
      const mockPosition = {
        coords: {
          latitude: 40.7128,
          longitude: -74.006,
          accuracy: 5,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      };

      (navigator.geolocation.getCurrentPosition as any).mockImplementation(
        (success: any) => {
          success(mockPosition as GeolocationPosition);
        }
      );

      render(<GeolocationCapture showCopyButton={false} />);

      const captureButton = screen.getByRole('button', { name: /Capture Location/i });
      await userEvent.click(captureButton);

      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /Copy/i })).not.toBeInTheDocument();
      });
    });

    it('should copy coordinates to clipboard', async () => {
      const mockPosition = {
        coords: {
          latitude: 40.7128,
          longitude: -74.006,
          accuracy: 5,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      };

      (navigator.geolocation.getCurrentPosition as any).mockImplementation(
        (success: any) => {
          success(mockPosition as GeolocationPosition);
        }
      );

      const writeTextSpy = vi.spyOn(navigator.clipboard, 'writeText');

      render(<GeolocationCapture showCopyButton={true} />);

      const captureButton = screen.getByRole('button', { name: /Capture Location/i });
      await userEvent.click(captureButton);

      await waitFor(() => {
        const copyButtons = screen.getAllByRole('button', { name: /Copy/i });
        expect(copyButtons.length).toBeGreaterThan(0);
      });

      const copyButton = screen.getAllByRole('button', { name: /Copy/i })[1];
      await userEvent.click(copyButton);

      await waitFor(() => {
        expect(writeTextSpy).toHaveBeenCalledWith('40.712800, -74.006000');
      });
    });
  });

  describe('Clear Functionality', () => {
    it('should clear location when clear button is clicked', async () => {
      const mockPosition = {
        coords: {
          latitude: 40.7128,
          longitude: -74.006,
          accuracy: 5,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      };

      (navigator.geolocation.getCurrentPosition as any).mockImplementation(
        (success: any) => {
          success(mockPosition as GeolocationPosition);
        }
      );

      render(<GeolocationCapture />);

      const captureButton = screen.getByRole('button', { name: /Capture Location/i });
      await userEvent.click(captureButton);

      await waitFor(() => {
        expect(screen.getByText('Location Captured')).toBeInTheDocument();
      });

      const clearButton = screen.getByRole('button', { name: /Clear/i });
      await userEvent.click(clearButton);

      await waitFor(() => {
        expect(
          screen.getByText('Click the button above to capture your current location')
        ).toBeInTheDocument();
      });
    });
  });

  describe('Accuracy Indicator', () => {
    it('should display accuracy indicator when location is captured', async () => {
      const mockPosition = {
        coords: {
          latitude: 40.7128,
          longitude: -74.006,
          accuracy: 5,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      };

      (navigator.geolocation.getCurrentPosition as any).mockImplementation(
        (success: any) => {
          success(mockPosition as GeolocationPosition);
        }
      );

      render(<GeolocationCapture />);

      const captureButton = screen.getByRole('button', { name: /Capture Location/i });
      await userEvent.click(captureButton);

      await waitFor(() => {
        expect(screen.getByText('Excellent')).toBeInTheDocument();
        expect(screen.getByText('±5.0m')).toBeInTheDocument();
      });
    });
  });

  describe('CSS Classes', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <GeolocationCapture className="custom-class" />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });
});
