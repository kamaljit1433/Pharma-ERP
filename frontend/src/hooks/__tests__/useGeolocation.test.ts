/**
 * Tests for useGeolocation Hook
 * Tests geolocation capture, permission handling, and error scenarios
 * 
 * Requirements Tested:
 * - 28.1: Request geolocation permission from user
 * - 28.2: Capture current location when permission is granted
 * - 28.5: Display location accuracy indicator
 * - 28.6: Handle geolocation errors gracefully
 * - 28.10: Respect user privacy and location permissions
 * - 30.2: Unit tests for components
 * - 30.3: Integration tests for API services
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useGeolocation } from '../useGeolocation';

describe('useGeolocation Hook', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    
    // Mock geolocation API
    const mockGeolocation = {
      getCurrentPosition: vi.fn(),
    };
    Object.defineProperty(navigator, 'geolocation', {
      value: mockGeolocation,
      writable: true,
      configurable: true,
    });

    // Mock permissions API
    Object.defineProperty(navigator, 'permissions', {
      value: {
        query: vi.fn(),
      },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Permission Handling', () => {
    it('should check geolocation permission status on mount', async () => {
      const mockQuery = vi.fn().mockResolvedValue({
        state: 'granted',
      });

      Object.defineProperty(navigator, 'permissions', {
        value: {
          query: mockQuery,
        },
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => useGeolocation());

      await waitFor(() => {
        expect(result.current.permissionStatus).toBe('granted');
      });

      expect(mockQuery).toHaveBeenCalledWith({ name: 'geolocation' });
    });

    it('should handle permission denied status', async () => {
      const mockQuery = vi.fn().mockResolvedValue({
        state: 'denied',
      });

      Object.defineProperty(navigator, 'permissions', {
        value: {
          query: mockQuery,
        },
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => useGeolocation());

      await waitFor(() => {
        expect(result.current.permissionStatus).toBe('denied');
      });
    });

    it('should handle permission prompt status', async () => {
      const mockQuery = vi.fn().mockResolvedValue({
        state: 'prompt',
      });

      Object.defineProperty(navigator, 'permissions', {
        value: {
          query: mockQuery,
        },
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => useGeolocation());

      await waitFor(() => {
        expect(result.current.permissionStatus).toBe('prompt');
      });
    });

    it('should fallback to prompt when permissions API is not available', async () => {
      Object.defineProperty(navigator, 'permissions', {
        value: undefined,
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => useGeolocation());

      await waitFor(() => {
        expect(result.current.permissionStatus).toBe('prompt');
      });
    });

    it('should fallback to prompt when permissions query fails', async () => {
      const mockQuery = vi.fn().mockRejectedValue(new Error('Permission query failed'));

      Object.defineProperty(navigator, 'permissions', {
        value: {
          query: mockQuery,
        },
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => useGeolocation());

      await waitFor(() => {
        expect(result.current.permissionStatus).toBe('prompt');
      });
    });

    it('should update permission status to granted after successful capture', async () => {
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

      const { result } = renderHook(() => useGeolocation());

      expect(result.current.permissionStatus).toBe('prompt');

      await act(async () => {
        await result.current.captureLocation();
      });

      expect(result.current.permissionStatus).toBe('granted');
    });

    it('should update permission status to denied after permission denied error', async () => {
      const error = new GeolocationPositionError(1, 'Permission denied');

      (navigator.geolocation.getCurrentPosition as any).mockImplementation(
        (success: any, error_callback: any) => {
          error_callback?.(error);
        }
      );

      const { result } = renderHook(() => useGeolocation());

      await act(async () => {
        try {
          await result.current.captureLocation();
        } catch (e) {
          // Expected error
        }
      });

      expect(result.current.permissionStatus).toBe('denied');
    });
  });

  describe('Initial State', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useGeolocation());

      expect(result.current.coordinates).toBeNull();
      expect(result.current.timestamp).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.permissionStatus).toBe('prompt');
    });

    it('should check geolocation permission status on mount', async () => {
      const mockQuery = vi.fn().mockResolvedValue({
        state: 'granted',
      });

      Object.defineProperty(navigator, 'permissions', {
        value: {
          query: mockQuery,
        },
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => useGeolocation());

      await waitFor(() => {
        expect(result.current.permissionStatus).toBe('granted');
      });
    });
  });

  describe('Location Capture', () => {
    it('should capture location successfully with all coordinate properties', async () => {
      const mockPosition = {
        coords: {
          latitude: 40.7128,
          longitude: -74.006,
          accuracy: 5,
          altitude: 10,
          altitudeAccuracy: 2,
          heading: 90,
          speed: 0,
        },
        timestamp: Date.now(),
      };

      (navigator.geolocation.getCurrentPosition as any).mockImplementation(
        (success: any) => {
          success(mockPosition as GeolocationPosition);
        }
      );

      const { result } = renderHook(() => useGeolocation());

      await act(async () => {
        await result.current.captureLocation();
      });

      expect(result.current.coordinates).not.toBeNull();
      expect(result.current.coordinates?.latitude).toBe(40.7128);
      expect(result.current.coordinates?.longitude).toBe(-74.006);
      expect(result.current.coordinates?.accuracy).toBe(5);
      expect(result.current.coordinates?.altitude).toBe(10);
      expect(result.current.coordinates?.altitudeAccuracy).toBe(2);
      expect(result.current.coordinates?.heading).toBe(90);
      expect(result.current.coordinates?.speed).toBe(0);
      expect(result.current.error).toBeNull();
      expect(result.current.permissionStatus).toBe('granted');
    });

    it('should capture location successfully with minimal coordinate properties', async () => {
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

      const { result } = renderHook(() => useGeolocation());

      await act(async () => {
        await result.current.captureLocation();
      });

      expect(result.current.coordinates).not.toBeNull();
      expect(result.current.coordinates?.latitude).toBe(40.7128);
      expect(result.current.coordinates?.longitude).toBe(-74.006);
      expect(result.current.coordinates?.accuracy).toBe(5);
      expect(result.current.coordinates?.altitude).toBeUndefined();
      expect(result.current.coordinates?.altitudeAccuracy).toBeUndefined();
      expect(result.current.coordinates?.heading).toBeUndefined();
      expect(result.current.coordinates?.speed).toBeUndefined();
    });

    it('should capture high accuracy location', async () => {
      const mockPosition = {
        coords: {
          latitude: 40.7128,
          longitude: -74.006,
          accuracy: 1, // High accuracy
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

      const { result } = renderHook(() => useGeolocation({
        enableHighAccuracy: true,
      }));

      await act(async () => {
        await result.current.captureLocation();
      });

      expect(result.current.coordinates?.accuracy).toBe(1);
    });

    it('should capture location with low accuracy when high accuracy is disabled', async () => {
      const mockPosition = {
        coords: {
          latitude: 40.7128,
          longitude: -74.006,
          accuracy: 50, // Lower accuracy
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

      const { result } = renderHook(() => useGeolocation({
        enableHighAccuracy: false,
      }));

      await act(async () => {
        await result.current.captureLocation();
      });

      expect(result.current.coordinates?.accuracy).toBe(50);
    });

    it('should return captured coordinates and timestamp from captureLocation', async () => {
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

      const { result } = renderHook(() => useGeolocation());

      let captureResult;
      await act(async () => {
        captureResult = await result.current.captureLocation();
      });

      expect(captureResult).toBeDefined();
      expect(captureResult.coordinates.latitude).toBe(40.7128);
      expect(captureResult.coordinates.longitude).toBe(-74.006);
      expect(captureResult.timestamp).toBeInstanceOf(Date);
    });
  });

  describe('Successful Location Capture', () => {
    it('should capture location successfully', async () => {
      const mockPosition = {
        coords: {
          latitude: 40.7128,
          longitude: -74.006,
          accuracy: 5,
          altitude: 10,
          altitudeAccuracy: 2,
          heading: 90,
          speed: 0,
        },
        timestamp: Date.now(),
      };

      (navigator.geolocation.getCurrentPosition as any).mockImplementation(
        (success: any) => {
          success(mockPosition as GeolocationPosition);
        }
      );

      const { result } = renderHook(() => useGeolocation());

      await act(async () => {
        await result.current.captureLocation();
      });

      expect(result.current.coordinates).not.toBeNull();
      expect(result.current.coordinates?.latitude).toBe(40.7128);
      expect(result.current.coordinates?.longitude).toBe(-74.006);
      expect(result.current.coordinates?.accuracy).toBe(5);
      expect(result.current.error).toBeNull();
      expect(result.current.permissionStatus).toBe('granted');
    });

    it('should call onSuccess callback when location is captured', async () => {
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

      const onSuccess = vi.fn();
      const { result } = renderHook(() => useGeolocation({ onSuccess }));

      await act(async () => {
        await result.current.captureLocation();
      });

      expect(onSuccess).toHaveBeenCalledWith(
        expect.objectContaining({
          latitude: 40.7128,
          longitude: -74.006,
          accuracy: 5,
        })
      );
    });

    it('should set timestamp when location is captured', async () => {
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

      const { result } = renderHook(() => useGeolocation());
      const beforeCapture = new Date();

      await act(async () => {
        await result.current.captureLocation();
      });

      const afterCapture = new Date();

      expect(result.current.timestamp).not.toBeNull();
      expect(result.current.timestamp!.getTime()).toBeGreaterThanOrEqual(
        beforeCapture.getTime()
      );
      expect(result.current.timestamp!.getTime()).toBeLessThanOrEqual(
        afterCapture.getTime()
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle permission denied error (code 1)', async () => {
      const error = new GeolocationPositionError(1, 'Permission denied');

      (navigator.geolocation.getCurrentPosition as any).mockImplementation(
        (success: any, error_callback: any) => {
          error_callback?.(error);
        }
      );

      const { result } = renderHook(() => useGeolocation());

      await act(async () => {
        try {
          await result.current.captureLocation();
        } catch (e) {
          // Expected error
        }
      });

      expect(result.current.error).toContain('Location permission denied');
      expect(result.current.error).toContain('Please enable location access in your browser settings');
      expect(result.current.permissionStatus).toBe('denied');
      expect(result.current.coordinates).toBeNull();
      expect(result.current.loading).toBe(false);
    });

    it('should handle position unavailable error (code 2)', async () => {
      const error = new GeolocationPositionError(2, 'Position unavailable');

      (navigator.geolocation.getCurrentPosition as any).mockImplementation(
        (success: any, error_callback: any) => {
          error_callback?.(error);
        }
      );

      const { result } = renderHook(() => useGeolocation());

      await act(async () => {
        try {
          await result.current.captureLocation();
        } catch (e) {
          // Expected error
        }
      });

      expect(result.current.error).toContain('Location unavailable');
      expect(result.current.error).toContain('Please check your GPS and try again');
      expect(result.current.permissionStatus).toBe('prompt'); // Should not change for this error
    });

    it('should handle timeout error (code 3)', async () => {
      const error = new GeolocationPositionError(3, 'Timeout');

      (navigator.geolocation.getCurrentPosition as any).mockImplementation(
        (success: any, error_callback: any) => {
          error_callback?.(error);
        }
      );

      const { result } = renderHook(() => useGeolocation());

      await act(async () => {
        try {
          await result.current.captureLocation();
        } catch (e) {
          // Expected error
        }
      });

      expect(result.current.error).toContain('Location request timed out');
      expect(result.current.error).toContain('Please try again');
    });

    it('should handle unknown GeolocationPositionError', async () => {
      const error = new GeolocationPositionError(999, 'Unknown error');

      (navigator.geolocation.getCurrentPosition as any).mockImplementation(
        (success: any, error_callback: any) => {
          error_callback?.(error);
        }
      );

      const { result } = renderHook(() => useGeolocation());

      await act(async () => {
        try {
          await result.current.captureLocation();
        } catch (e) {
          // Expected error
        }
      });

      expect(result.current.error).toContain('Geolocation error: Unknown error');
    });

    it('should handle geolocation not supported', async () => {
      const originalGeolocation = navigator.geolocation;
      Object.defineProperty(navigator, 'geolocation', {
        value: undefined,
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => useGeolocation());

      await act(async () => {
        try {
          await result.current.captureLocation();
        } catch (e) {
          // Expected error
        }
      });

      expect(result.current.error).toContain('Geolocation is not supported by your browser');
      expect(result.current.loading).toBe(false);

      Object.defineProperty(navigator, 'geolocation', {
        value: originalGeolocation,
        writable: true,
        configurable: true,
      });
    });

    it('should handle generic error', async () => {
      const error = new Error('Network error');

      (navigator.geolocation.getCurrentPosition as any).mockImplementation(
        (success: any, error_callback: any) => {
          error_callback?.(error);
        }
      );

      const { result } = renderHook(() => useGeolocation());

      await act(async () => {
        try {
          await result.current.captureLocation();
        } catch (e) {
          // Expected error
        }
      });

      expect(result.current.error).toBe('Network error');
    });

    it('should call onError callback when error occurs', async () => {
      const error = new GeolocationPositionError(1, 'Permission denied');

      (navigator.geolocation.getCurrentPosition as any).mockImplementation(
        (success: any, error_callback: any) => {
          error_callback?.(error);
        }
      );

      const onError = vi.fn();
      const { result } = renderHook(() => useGeolocation({ onError }));

      await act(async () => {
        try {
          await result.current.captureLocation();
        } catch (e) {
          // Expected error
        }
      });

      expect(onError).toHaveBeenCalledWith(
        expect.stringContaining('Location permission denied')
      );
    });

    it('should throw error when capture fails', async () => {
      const error = new GeolocationPositionError(1, 'Permission denied');

      (navigator.geolocation.getCurrentPosition as any).mockImplementation(
        (success: any, error_callback: any) => {
          error_callback?.(error);
        }
      );

      const { result } = renderHook(() => useGeolocation());

      await expect(async () => {
        await act(async () => {
          await result.current.captureLocation();
        });
      }).rejects.toThrow('Location permission denied');
    });
  });

  describe('State Management', () => {
    it('should set loading state during capture', async () => {
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
          setTimeout(() => success(mockPosition as GeolocationPosition), 100);
        }
      );

      const { result } = renderHook(() => useGeolocation());

      expect(result.current.loading).toBe(false);

      act(() => {
        result.current.captureLocation();
      });

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('should clear location data', async () => {
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

      const { result } = renderHook(() => useGeolocation());

      await act(async () => {
        await result.current.captureLocation();
      });

      expect(result.current.coordinates).not.toBeNull();

      act(() => {
        result.current.clearLocation();
      });

      expect(result.current.coordinates).toBeNull();
      expect(result.current.timestamp).toBeNull();
      expect(result.current.error).toBeNull();
    });

    it('should reset to initial state', async () => {
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

      const { result } = renderHook(() => useGeolocation());

      await act(async () => {
        await result.current.captureLocation();
      });

      expect(result.current.coordinates).not.toBeNull();

      act(() => {
        result.current.reset();
      });

      expect(result.current.coordinates).toBeNull();
      expect(result.current.timestamp).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.permissionStatus).toBe('prompt');
    });
  });

  describe('Options and Configuration', () => {
    it('should use custom options for geolocation', async () => {
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

      const getCurrentPositionSpy = (navigator.geolocation.getCurrentPosition as any);
      getCurrentPositionSpy.mockImplementation((success: any) => {
        success(mockPosition as GeolocationPosition);
      });

      const { result } = renderHook(() =>
        useGeolocation({
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: 1000,
        })
      );

      await act(async () => {
        await result.current.captureLocation();
      });

      expect(getCurrentPositionSpy).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        {
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: 1000,
        }
      );
    });

    it('should use default options when none provided', async () => {
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

      const getCurrentPositionSpy = (navigator.geolocation.getCurrentPosition as any);
      getCurrentPositionSpy.mockImplementation((success: any) => {
        success(mockPosition as GeolocationPosition);
      });

      const { result } = renderHook(() => useGeolocation());

      await act(async () => {
        await result.current.captureLocation();
      });

      expect(getCurrentPositionSpy).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });

    it('should merge custom options with defaults', async () => {
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

      const getCurrentPositionSpy = (navigator.geolocation.getCurrentPosition as any);
      getCurrentPositionSpy.mockImplementation((success: any) => {
        success(mockPosition as GeolocationPosition);
      });

      const { result } = renderHook(() =>
        useGeolocation({
          timeout: 15000, // Override default
          // enableHighAccuracy and maximumAge should use defaults
        })
      );

      await act(async () => {
        await result.current.captureLocation();
      });

      expect(getCurrentPositionSpy).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        {
          enableHighAccuracy: true, // Default
          timeout: 15000, // Custom
          maximumAge: 0, // Default
        }
      );
    });
  });

  describe('Options', () => {
    it('should use custom options for geolocation', async () => {
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

      const getCurrentPositionSpy = (navigator.geolocation.getCurrentPosition as any);
      getCurrentPositionSpy.mockImplementation((success: any) => {
        success(mockPosition as GeolocationPosition);
      });

      const { result } = renderHook(() =>
        useGeolocation({
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: 1000,
        })
      );

      await act(async () => {
        await result.current.captureLocation();
      });

      expect(getCurrentPositionSpy).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        {
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: 1000,
        }
      );
    });
  });
});
