/**
 * useGeolocation Hook
 * Custom React hook for capturing geolocation with permission handling
 * 
 * Requirements Met:
 * - 28.1: Request geolocation permission from user
 * - 28.2: Capture current location when permission is granted
 * - 28.5: Display location accuracy indicator
 * - 28.6: Handle geolocation errors gracefully
 * - 28.10: Respect user privacy and location permissions
 */

import { useState, useCallback, useEffect } from 'react';

export interface GeolocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number;
  altitudeAccuracy?: number;
  heading?: number;
  speed?: number;
}

export interface GeolocationState {
  coordinates: GeolocationCoordinates | null;
  timestamp: Date | null;
  loading: boolean;
  error: string | null;
  permissionStatus: 'prompt' | 'granted' | 'denied';
}

export interface UseGeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  onSuccess?: (coordinates: GeolocationCoordinates) => void;
  onError?: (error: string) => void;
}

const DEFAULT_OPTIONS: UseGeolocationOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 0,
};

/**
 * Custom hook for capturing geolocation
 * Handles permission requests, location capture, and error handling
 * 
 * @param options - Configuration options for geolocation
 * @returns Geolocation state and capture function
 */
export const useGeolocation = (options: UseGeolocationOptions = {}) => {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  
  const [state, setState] = useState<GeolocationState>({
    coordinates: null,
    timestamp: null,
    loading: false,
    error: null,
    permissionStatus: 'prompt',
  });

  // Check geolocation permission status on mount
  useEffect(() => {
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: 'geolocation' })
        .then((result) => {
          setState((prev) => ({
            ...prev,
            permissionStatus: result.state as 'prompt' | 'granted' | 'denied',
          }));
        })
        .catch(() => {
          // Fallback if permissions API is not available
          setState((prev) => ({
            ...prev,
            permissionStatus: 'prompt',
          }));
        });
    }
  }, []);

  /**
   * Capture current location
   * Requirement 28.2: Capture current location when permission is granted
   */
  const captureLocation = useCallback(async () => {
    try {
      setState((prev) => ({
        ...prev,
        loading: true,
        error: null,
      }));

      // Check if geolocation is supported
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by your browser');
      }

      // Request geolocation permission (Requirement 28.1)
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: mergedOptions.enableHighAccuracy,
          timeout: mergedOptions.timeout,
          maximumAge: mergedOptions.maximumAge,
        });
      });

      // Extract coordinates (Requirement 28.2)
      const coordinates: GeolocationCoordinates = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        altitude: position.coords.altitude ?? undefined,
        altitudeAccuracy: position.coords.altitudeAccuracy ?? undefined,
        heading: position.coords.heading ?? undefined,
        speed: position.coords.speed ?? undefined,
      };

      const timestamp = new Date();

      setState((prev) => ({
        ...prev,
        coordinates,
        timestamp,
        loading: false,
        permissionStatus: 'granted',
      }));

      // Call success callback if provided
      mergedOptions.onSuccess?.(coordinates);

      return { coordinates, timestamp };
    } catch (err: any) {
      let errorMsg = 'Failed to capture location';

      // Handle geolocation errors gracefully (Requirement 28.6)
      if (err.code === 1) {
        errorMsg = 'Location permission denied. Please enable location access in your browser settings.';
        setState((prev) => ({
          ...prev,
          permissionStatus: 'denied',
        }));
      } else if (err.code === 2) {
        errorMsg = 'Location unavailable. Please check your GPS and try again.';
      } else if (err.code === 3) {
        errorMsg = 'Location request timed out. Please try again.';
      } else if (err instanceof GeolocationPositionError) {
        errorMsg = `Geolocation error: ${err.message}`;
      } else {
        errorMsg = err.message || errorMsg;
      }

      setState((prev) => ({
        ...prev,
        error: errorMsg,
        loading: false,
      }));

      // Call error callback if provided
      mergedOptions.onError?.(errorMsg);

      throw new Error(errorMsg);
    }
  }, [mergedOptions]);

  /**
   * Clear location data
   */
  const clearLocation = useCallback(() => {
    setState((prev) => ({
      ...prev,
      coordinates: null,
      timestamp: null,
      error: null,
    }));
  }, []);

  /**
   * Reset to initial state
   */
  const reset = useCallback(() => {
    setState({
      coordinates: null,
      timestamp: null,
      loading: false,
      error: null,
      permissionStatus: 'prompt',
    });
  }, []);

  return {
    ...state,
    captureLocation,
    clearLocation,
    reset,
  };
};
