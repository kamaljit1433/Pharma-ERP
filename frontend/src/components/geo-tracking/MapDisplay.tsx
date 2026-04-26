/**
 * Map Display Component
 * Displays location on Google Maps with geofence validation and travel history
 * 
 * Requirements Met:
 * - 28.3: Display location on Google Maps
 * - 28.4: Validate location against allowed geofences
 * - 28.7: Display travel history on a map
 * - 28.9: Display location-based attendance records
 */

import React, { useEffect, useRef, useState } from 'react';
import { useGoogleMaps, createMapInstance, createMarker, createPolyline, createCircle, isPointInGeofence, fitBoundsToMarkers } from '../../hooks/useGoogleMaps';
import { GeoLocation, GeoFence, Journey } from '../../types/geoTracking';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { AlertCircle, Loader2, MapPin, CheckCircle2, XCircle } from 'lucide-react';

export interface MapDisplayProps {
  location?: GeoLocation;
  geofences?: GeoFence[];
  journeys?: Journey[];
  attendanceRecords?: Array<{
    id: string;
    employeeId: string;
    date: string;
    checkInLocation?: GeoLocation;
    checkOutLocation?: GeoLocation;
    status: 'present' | 'absent' | 'half_day' | 'on_leave';
  }>;
  showGeofences?: boolean;
  showTravelHistory?: boolean;
  showAttendanceRecords?: boolean;
  onGeofenceValidation?: (isValid: boolean, geofence?: GeoFence) => void;
  className?: string;
  height?: string;
}

interface MapMarker {
  id: string;
  position: { lat: number; lng: number };
  title: string;
  type: 'current' | 'journey_start' | 'journey_end' | 'waypoint' | 'attendance_checkin' | 'attendance_checkout';
  data?: any;
}

/**
 * Map Display Component
 * Displays location on Google Maps with geofence validation and travel history
 */
export const MapDisplay: React.FC<MapDisplayProps> = ({
  location,
  geofences = [],
  journeys = [],
  attendanceRecords = [],
  showGeofences = true,
  showTravelHistory = true,
  showAttendanceRecords = true,
  onGeofenceValidation,
  className = '',
  height = '500px',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const polylinesRef = useRef<google.maps.Polyline[]>([]);
  const circlesRef = useRef<google.maps.Circle[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [geofenceValidation, setGeofenceValidation] = useState<{
    isValid: boolean;
    geofence?: GeoFence;
  } | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const { isLoaded, error: mapsError } = useGoogleMaps({
    apiKey,
    libraries: ['places', 'geometry'],
  });

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !mapContainerRef.current) {
      return;
    }

    try {
      const defaultCenter = location
        ? { lat: location.latitude, lng: location.longitude }
        : { lat: 40.7128, lng: -74.006 }; // Default to NYC

      const map = createMapInstance(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 15,
        mapTypeId: 'roadmap',
        zoomControl: true,
        mapTypeControl: true,
        scaleControl: true,
        streetViewControl: false,
        rotateControl: false,
        fullscreenControl: true,
      });

      if (!map) {
        setError('Failed to initialize map');
        return;
      }

      mapRef.current = map;
      setIsLoading(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize map');
      setIsLoading(false);
    }
  }, [isLoaded, location]);

  // Add current location marker
  useEffect(() => {
    if (!mapRef.current || !location) {
      return;
    }

    try {
      // Clear existing markers
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];

      // Add current location marker
      const marker = createMarker(mapRef.current, {
        lat: location.latitude,
        lng: location.longitude,
      }, {
        title: 'Current Location',
        icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
      });

      if (marker) {
        markersRef.current.push(marker);
        marker.addListener('click', () => {
          setSelectedMarker({
            id: 'current',
            position: { lat: location.latitude, lng: location.longitude },
            title: 'Current Location',
            type: 'current',
            data: location,
          });
        });
      }

      // Validate geofences
      if (showGeofences && geofences.length > 0) {
        let isInAnyGeofence = false;
        let validGeofence: GeoFence | undefined;

        for (const geofence of geofences) {
          if (isPointInGeofence(
            { lat: location.latitude, lng: location.longitude },
            { lat: geofence.center.latitude, lng: geofence.center.longitude },
            geofence.radius / 1000 // Convert meters to km
          )) {
            isInAnyGeofence = true;
            validGeofence = geofence;
            break;
          }
        }

        setGeofenceValidation({
          isValid: isInAnyGeofence,
          geofence: validGeofence,
        });

        if (onGeofenceValidation) {
          onGeofenceValidation(isInAnyGeofence, validGeofence);
        }
      }
    } catch (err) {
      console.error('Error adding location marker:', err);
    }
  }, [location, geofences, showGeofences, onGeofenceValidation]);

  // Add geofence circles
  useEffect(() => {
    if (!mapRef.current || !showGeofences || geofences.length === 0) {
      return;
    }

    try {
      // Clear existing circles
      circlesRef.current.forEach((circle) => circle.setMap(null));
      circlesRef.current = [];

      // Add geofence circles
      geofences.forEach((geofence) => {
        const circle = createCircle(mapRef.current!, {
          lat: geofence.center.latitude,
          lng: geofence.center.longitude,
        }, geofence.radius, {
          fillColor: geofence.type === 'Restricted' ? '#ff6b6b' : '#4dabf7',
          fillOpacity: 0.1,
          strokeColor: geofence.type === 'Restricted' ? '#ff6b6b' : '#4dabf7',
          strokeOpacity: 0.8,
          strokeWeight: 2,
        });

        if (circle) {
          circlesRef.current.push(circle);
        }
      });
    } catch (err) {
      console.error('Error adding geofence circles:', err);
    }
  }, [geofences, showGeofences]);

  // Add travel history
  useEffect(() => {
    if (!mapRef.current || !showTravelHistory || journeys.length === 0) {
      return;
    }

    try {
      // Clear existing polylines and journey markers
      polylinesRef.current.forEach((polyline) => polyline.setMap(null));
      polylinesRef.current = [];

      journeys.forEach((journey) => {
        // Add start marker
        const startMarker = createMarker(mapRef.current!, {
          lat: journey.startLocation.latitude,
          lng: journey.startLocation.longitude,
        }, {
          title: `Journey Start - ${new Date(journey.startTime).toLocaleString()}`,
          icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
        });

        if (startMarker) {
          markersRef.current.push(startMarker);
          startMarker.addListener('click', () => {
            setSelectedMarker({
              id: `journey_start_${journey.id}`,
              position: { lat: journey.startLocation.latitude, lng: journey.startLocation.longitude },
              title: 'Journey Start',
              type: 'journey_start',
              data: journey,
            });
          });
        }

        // Add end marker
        const endMarker = createMarker(mapRef.current!, {
          lat: journey.endLocation.latitude,
          lng: journey.endLocation.longitude,
        }, {
          title: `Journey End - ${new Date(journey.endTime).toLocaleString()}`,
          icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
        });

        if (endMarker) {
          markersRef.current.push(endMarker);
          endMarker.addListener('click', () => {
            setSelectedMarker({
              id: `journey_end_${journey.id}`,
              position: { lat: journey.endLocation.latitude, lng: journey.endLocation.longitude },
              title: 'Journey End',
              type: 'journey_end',
              data: journey,
            });
          });
        }

        // Add polyline for journey path
        const path = [
          { lat: journey.startLocation.latitude, lng: journey.startLocation.longitude },
          ...journey.waypoints.map((wp) => ({
            lat: wp.latitude,
            lng: wp.longitude,
          })),
          { lat: journey.endLocation.latitude, lng: journey.endLocation.longitude },
        ];

        const polyline = createPolyline(mapRef.current!, path, {
          strokeColor: '#4dabf7',
          strokeOpacity: 0.7,
          strokeWeight: 3,
          geodesic: true,
        });

        if (polyline) {
          polylinesRef.current.push(polyline);
        }
      });
    } catch (err) {
      console.error('Error adding travel history:', err);
    }
  }, [journeys, showTravelHistory]);

  // Add attendance records
  useEffect(() => {
    if (!mapRef.current || !showAttendanceRecords || attendanceRecords.length === 0) {
      return;
    }

    try {
      attendanceRecords.forEach((record) => {
        if (record.checkInLocation) {
          const marker = createMarker(mapRef.current!, {
            lat: record.checkInLocation.latitude,
            lng: record.checkInLocation.longitude,
          }, {
            title: `Check-in - ${record.date}`,
            icon: 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png',
          });

          if (marker) {
            markersRef.current.push(marker);
            marker.addListener('click', () => {
              setSelectedMarker({
                id: `attendance_checkin_${record.id}`,
                position: { lat: record.checkInLocation!.latitude, lng: record.checkInLocation!.longitude },
                title: 'Check-in',
                type: 'attendance_checkin',
                data: record,
              });
            });
          }
        }

        if (record.checkOutLocation) {
          const marker = createMarker(mapRef.current!, {
            lat: record.checkOutLocation.latitude,
            lng: record.checkOutLocation.longitude,
          }, {
            title: `Check-out - ${record.date}`,
            icon: 'http://maps.google.com/mapfiles/ms/icons/orange-dot.png',
          });

          if (marker) {
            markersRef.current.push(marker);
            marker.addListener('click', () => {
              setSelectedMarker({
                id: `attendance_checkout_${record.id}`,
                position: { lat: record.checkOutLocation!.latitude, lng: record.checkOutLocation!.longitude },
                title: 'Check-out',
                type: 'attendance_checkout',
                data: record,
              });
            });
          }
        }
      });
    } catch (err) {
      console.error('Error adding attendance records:', err);
    }
  }, [attendanceRecords, showAttendanceRecords]);

  // Fit bounds to show all markers
  useEffect(() => {
    if (!mapRef.current || markersRef.current.length === 0) {
      return;
    }

    try {
      const positions = markersRef.current.map((marker) => {
        const pos = marker.getPosition();
        return { lat: pos!.lat(), lng: pos!.lng() };
      });

      fitBoundsToMarkers(mapRef.current, positions);
    } catch (err) {
      console.error('Error fitting bounds:', err);
    }
  }, [location, journeys, attendanceRecords]);

  if (mapsError) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="flex gap-3 p-4 bg-red-50 border border-red-200 rounded-md">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">Map Error</p>
              <p className="text-xs text-red-700 mt-1">{mapsError}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Map Container */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Location Map
            </span>
            {geofenceValidation && (
              <Badge variant={geofenceValidation.isValid ? 'default' : 'destructive'}>
                {geofenceValidation.isValid ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    In Geofence
                  </>
                ) : (
                  <>
                    <XCircle className="w-3 h-3 mr-1" />
                    Outside Geofence
                  </>
                )}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            ref={mapContainerRef}
            style={{ height }}
            className="rounded-md border border-gray-200 relative"
          >
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/50 rounded-md z-10">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  <p className="text-sm text-gray-600">Loading map...</p>
                </div>
              </div>
            )}
            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-red-50 rounded-md z-10">
                <div className="flex flex-col items-center gap-2">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Geofence Validation Info */}
      {showGeofences && geofenceValidation && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Geofence Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {geofenceValidation.isValid && geofenceValidation.geofence ? (
              <div className="flex gap-3 p-3 bg-green-50 border border-green-200 rounded-md">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-800">
                    Location is within {geofenceValidation.geofence.name}
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    Type: {geofenceValidation.geofence.type} | Radius: {geofenceValidation.geofence.radius}m
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    Location is outside all geofences
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    {geofences.length} geofence(s) configured
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Selected Marker Info */}
      {selectedMarker && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span>{selectedMarker.title}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedMarker(null)}
              >
                ✕
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Latitude</p>
                <p className="font-mono">{selectedMarker.position.lat.toFixed(6)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Longitude</p>
                <p className="font-mono">{selectedMarker.position.lng.toFixed(6)}</p>
              </div>
            </div>
            {selectedMarker.data && (
              <div className="pt-2 border-t text-xs text-muted-foreground">
                <pre className="bg-muted p-2 rounded overflow-auto max-h-40">
                  {JSON.stringify(selectedMarker.data, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Map Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span>Current Location</span>
            </div>
            {showTravelHistory && (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span>Journey Start</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span>Journey End</span>
                </div>
              </>
            )}
            {showAttendanceRecords && (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span>Check-in</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500" />
                  <span>Check-out</span>
                </div>
              </>
            )}
            {showGeofences && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full border-2 border-blue-500" />
                <span>Geofence</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
