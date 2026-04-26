/**
 * Hook for Google Maps integration
 * Loads Google Maps API and provides map instance management
 */

import { useEffect, useRef, useState } from 'react';

export interface GoogleMapsConfig {
  apiKey: string;
  libraries?: string[];
}

export interface MapOptions {
  center: { lat: number; lng: number };
  zoom: number;
  mapTypeId?: 'roadmap' | 'satellite' | 'terrain' | 'hybrid';
  disableDefaultUI?: boolean;
  zoomControl?: boolean;
  mapTypeControl?: boolean;
  scaleControl?: boolean;
  streetViewControl?: boolean;
  rotateControl?: boolean;
  fullscreenControl?: boolean;
}

declare global {
  interface Window {
    google?: {
      maps: {
        Map: any;
        Marker: any;
        Polyline: any;
        Circle: any;
        InfoWindow: any;
        LatLng: any;
        LatLngBounds: any;
        event: any;
        places: any;
      };
    };
  }
}

export const useGoogleMaps = (config: GoogleMapsConfig) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  useEffect(() => {
    // Check if Google Maps is already loaded
    if (window.google?.maps) {
      setIsLoaded(true);
      return;
    }

    // Create script element
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${config.apiKey}${
      config.libraries ? `&libraries=${config.libraries.join(',')}` : ''
    }`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      setIsLoaded(true);
      setError(null);
    };

    script.onerror = () => {
      setError('Failed to load Google Maps API');
      setIsLoaded(false);
    };

    document.head.appendChild(script);
    scriptRef.current = script;

    return () => {
      // Don't remove the script as it might be used by other components
      // Just clean up the ref
      scriptRef.current = null;
    };
  }, [config.apiKey, config.libraries]);

  return { isLoaded, error };
};

/**
 * Utility function to create a map instance
 */
export const createMapInstance = (
  container: HTMLElement,
  options: MapOptions
): google.maps.Map | null => {
  if (!window.google?.maps) {
    console.error('Google Maps API not loaded');
    return null;
  }

  return new window.google.maps.Map(container, options);
};

/**
 * Utility function to create a marker
 */
export const createMarker = (
  map: google.maps.Map,
  position: { lat: number; lng: number },
  options?: {
    title?: string;
    icon?: string;
    label?: string;
    draggable?: boolean;
  }
): google.maps.Marker | null => {
  if (!window.google?.maps) {
    return null;
  }

  return new window.google.maps.Marker({
    map,
    position,
    ...options,
  });
};

/**
 * Utility function to create a polyline
 */
export const createPolyline = (
  map: google.maps.Map,
  path: Array<{ lat: number; lng: number }>,
  options?: {
    strokeColor?: string;
    strokeOpacity?: number;
    strokeWeight?: number;
    geodesic?: boolean;
  }
): google.maps.Polyline | null => {
  if (!window.google?.maps) {
    return null;
  }

  return new window.google.maps.Polyline({
    map,
    path,
    ...options,
  });
};

/**
 * Utility function to create a circle (geofence)
 */
export const createCircle = (
  map: google.maps.Map,
  center: { lat: number; lng: number },
  radius: number,
  options?: {
    fillColor?: string;
    fillOpacity?: number;
    strokeColor?: string;
    strokeOpacity?: number;
    strokeWeight?: number;
    editable?: boolean;
    draggable?: boolean;
  }
): google.maps.Circle | null => {
  if (!window.google?.maps) {
    return null;
  }

  return new window.google.maps.Circle({
    map,
    center,
    radius,
    ...options,
  });
};

/**
 * Utility function to calculate distance between two points
 */
export const calculateDistance = (
  point1: { lat: number; lng: number },
  point2: { lat: number; lng: number }
): number => {
  if (!window.google?.maps) {
    return 0;
  }

  const lat1 = (point1.lat * Math.PI) / 180;
  const lat2 = (point2.lat * Math.PI) / 180;
  const deltaLat = ((point2.lat - point1.lat) * Math.PI) / 180;
  const deltaLng = ((point2.lng - point1.lng) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const earthRadiusKm = 6371;

  return earthRadiusKm * c;
};

/**
 * Utility function to check if a point is within a circle (geofence)
 */
export const isPointInGeofence = (
  point: { lat: number; lng: number },
  center: { lat: number; lng: number },
  radiusKm: number
): boolean => {
  const distance = calculateDistance(point, center);
  return distance <= radiusKm;
};

/**
 * Utility function to fit bounds to show all markers
 */
export const fitBoundsToMarkers = (
  map: google.maps.Map,
  markers: Array<{ lat: number; lng: number }>
): void => {
  if (!window.google?.maps || markers.length === 0) {
    return;
  }

  const bounds = new window.google.maps.LatLngBounds();
  markers.forEach((marker) => {
    bounds.extend(new window.google.maps.LatLng(marker.lat, marker.lng));
  });

  map.fitBounds(bounds);
};
