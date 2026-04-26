# Map Display Components - Usage Examples

This document provides practical examples of how to use the map display components in your application.

## Example 1: Basic Map Display with Current Location

```typescript
import React, { useState, useEffect } from 'react';
import { MapDisplay } from '@/components/geo-tracking';
import { GeoLocation } from '@/types/geoTracking';

export function CurrentLocationPage() {
  const [location, setLocation] = useState<GeoLocation | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date(),
          });
          setLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setLoading(false);
        }
      );
    }
  }, []);

  if (loading) {
    return <div>Loading location...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">My Current Location</h1>
      <MapDisplay
        location={location}
        showGeofences={false}
        showTravelHistory={false}
        showAttendanceRecords={false}
        height="600px"
      />
    </div>
  );
}
```

## Example 2: Map with Geofence Validation

```typescript
import React, { useState, useEffect } from 'react';
import { MapDisplay } from '@/components/geo-tracking';
import { GeoLocation, GeoFence } from '@/types/geoTracking';
import { geoTrackingService } from '@/services/geoTrackingService';

export function GeofenceValidationPage() {
  const [location, setLocation] = useState<GeoLocation | undefined>();
  const [geofences, setGeofences] = useState<GeoFence[]>([]);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    geofence?: GeoFence;
  } | null>(null);

  useEffect(() => {
    // Fetch geofences
    geoTrackingService.getGeoFences().then(setGeofences);

    // Get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date(),
        });
      });
    }
  }, []);

  const handleGeofenceValidation = (isValid: boolean, geofence?: GeoFence) => {
    setValidationResult({ isValid, geofence });
    
    // Show notification
    if (isValid) {
      console.log(`✓ You are within ${geofence?.name}`);
    } else {
      console.log('✗ You are outside all geofences');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Geofence Validation</h1>
      
      <MapDisplay
        location={location}
        geofences={geofences}
        showGeofences={true}
        showTravelHistory={false}
        showAttendanceRecords={false}
        onGeofenceValidation={handleGeofenceValidation}
        height="600px"
      />

      {validationResult && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
          <p className="font-semibold">
            {validationResult.isValid ? '✓ Valid Location' : '✗ Invalid Location'}
          </p>
          {validationResult.geofence && (
            <p className="text-sm text-gray-600">
              Geofence: {validationResult.geofence.name}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
```

## Example 3: Travel History Visualization

```typescript
import React, { useState, useEffect } from 'react';
import { TravelHistoryMap } from '@/components/geo-tracking';
import { Journey } from '@/types/geoTracking';
import { geoTrackingService } from '@/services/geoTrackingService';

export function TravelHistoryPage() {
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJourney, setSelectedJourney] = useState<Journey | null>(null);

  useEffect(() => {
    // Fetch journeys for the current month
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), 1)
      .toISOString()
      .split('T')[0];
    const endDate = today.toISOString().split('T')[0];

    geoTrackingService
      .getJourneysByDateRange('emp123', startDate, endDate)
      .then((data) => {
        setJourneys(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching journeys:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>Loading travel history...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Travel History</h1>
      
      <TravelHistoryMap
        journeys={journeys}
        onJourneySelect={(journey) => {
          setSelectedJourney(journey);
          console.log('Selected journey:', journey);
        }}
      />

      {selectedJourney && (
        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded">
          <h2 className="font-semibold mb-2">Journey Details</h2>
          <p>Distance: {selectedJourney.totalDistance.toFixed(2)} km</p>
          <p>Duration: {(selectedJourney.totalDuration / 3600).toFixed(1)} hours</p>
          <p>Allowance: ₹{selectedJourney.travelAllowance.toFixed(2)}</p>
          {selectedJourney.purpose && <p>Purpose: {selectedJourney.purpose}</p>}
        </div>
      )}
    </div>
  );
}
```

## Example 4: Attendance Records Visualization

```typescript
import React, { useState, useEffect } from 'react';
import { AttendanceRecordsMap } from '@/components/geo-tracking';
import { AttendanceRecord } from '@/components/geo-tracking/AttendanceRecordsMap';
import { attendanceService } from '@/services/attendanceService';

export function AttendanceHistoryPage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);

  useEffect(() => {
    // Fetch attendance records
    attendanceService
      .getRecords('emp123')
      .then((data) => {
        // Transform API response to AttendanceRecord format
        const transformedRecords = data.map((record: any) => ({
          id: record.id,
          employeeId: record.employeeId,
          date: record.date,
          checkInLocation: record.checkInLocation,
          checkOutLocation: record.checkOutLocation,
          checkInTime: record.checkInTime,
          checkOutTime: record.checkOutTime,
          status: record.status,
          workingHours: record.workingHours,
        }));
        setRecords(transformedRecords);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching records:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>Loading attendance records...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Attendance History</h1>
      
      <AttendanceRecordsMap
        records={records}
        onRecordSelect={(record) => {
          setSelectedRecord(record);
          console.log('Selected record:', record);
        }}
      />

      {selectedRecord && (
        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded">
          <h2 className="font-semibold mb-2">Record Details</h2>
          <p>Date: {new Date(selectedRecord.date).toLocaleDateString()}</p>
          <p>Status: {selectedRecord.status}</p>
          {selectedRecord.checkInTime && <p>Check-in: {selectedRecord.checkInTime}</p>}
          {selectedRecord.checkOutTime && <p>Check-out: {selectedRecord.checkOutTime}</p>}
          {selectedRecord.workingHours && (
            <p>Working Hours: {selectedRecord.workingHours.toFixed(1)}h</p>
          )}
        </div>
      )}
    </div>
  );
}
```

## Example 5: Combined Map with All Features

```typescript
import React, { useState, useEffect } from 'react';
import { MapDisplay } from '@/components/geo-tracking';
import { GeoLocation, GeoFence, Journey } from '@/types/geoTracking';
import { geoTrackingService } from '@/services/geoTrackingService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function ComprehensiveMapPage() {
  const [location, setLocation] = useState<GeoLocation | undefined>();
  const [geofences, setGeofences] = useState<GeoFence[]>([]);
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [activeTab, setActiveTab] = useState('location');

  useEffect(() => {
    // Get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date(),
        });
      });
    }

    // Fetch geofences
    geoTrackingService.getGeoFences().then(setGeofences);

    // Fetch journeys
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), 1)
      .toISOString()
      .split('T')[0];
    const endDate = today.toISOString().split('T')[0];

    geoTrackingService
      .getJourneysByDateRange('emp123', startDate, endDate)
      .then(setJourneys);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Location & Travel Management</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="location">Current Location</TabsTrigger>
          <TabsTrigger value="geofence">Geofence Validation</TabsTrigger>
          <TabsTrigger value="travel">Travel History</TabsTrigger>
        </TabsList>

        <TabsContent value="location" className="mt-4">
          <MapDisplay
            location={location}
            showGeofences={false}
            showTravelHistory={false}
            showAttendanceRecords={false}
            height="600px"
          />
        </TabsContent>

        <TabsContent value="geofence" className="mt-4">
          <MapDisplay
            location={location}
            geofences={geofences}
            showGeofences={true}
            showTravelHistory={false}
            showAttendanceRecords={false}
            height="600px"
          />
        </TabsContent>

        <TabsContent value="travel" className="mt-4">
          <MapDisplay
            location={location}
            journeys={journeys}
            showGeofences={false}
            showTravelHistory={true}
            showAttendanceRecords={false}
            height="600px"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

## Example 6: Using the useGoogleMaps Hook Directly

```typescript
import React, { useRef, useEffect } from 'react';
import {
  useGoogleMaps,
  createMapInstance,
  createMarker,
  createPolyline,
  calculateDistance,
} from '@/hooks/useGoogleMaps';

export function CustomMapComponent() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const { isLoaded, error } = useGoogleMaps({
    apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ['places', 'geometry'],
  });

  useEffect(() => {
    if (!isLoaded || !mapContainerRef.current) return;

    // Create map
    const map = createMapInstance(mapContainerRef.current, {
      center: { lat: 40.7128, lng: -74.006 },
      zoom: 12,
    });

    // Add markers
    const marker1 = createMarker(map, {
      lat: 40.7128,
      lng: -74.006,
    }, {
      title: 'Start Location',
    });

    const marker2 = createMarker(map, {
      lat: 40.758,
      lng: -73.9855,
    }, {
      title: 'End Location',
    });

    // Add polyline
    const polyline = createPolyline(map, [
      { lat: 40.7128, lng: -74.006 },
      { lat: 40.758, lng: -73.9855 },
    ], {
      strokeColor: '#4dabf7',
      strokeWeight: 3,
    });

    // Calculate distance
    const distance = calculateDistance(
      { lat: 40.7128, lng: -74.006 },
      { lat: 40.758, lng: -73.9855 }
    );
    console.log(`Distance: ${distance.toFixed(2)} km`);
  }, [isLoaded]);

  if (error) {
    return <div className="text-red-600">Error loading map: {error}</div>;
  }

  return (
    <div
      ref={mapContainerRef}
      style={{ width: '100%', height: '600px' }}
      className="rounded-lg border border-gray-200"
    />
  );
}
```

## Example 7: Real-time Location Tracking

```typescript
import React, { useState, useEffect, useRef } from 'react';
import { MapDisplay } from '@/components/geo-tracking';
import { GeoLocation } from '@/types/geoTracking';
import { Button } from '@/components/ui/button';

export function RealTimeTrackingPage() {
  const [location, setLocation] = useState<GeoLocation | undefined>();
  const [isTracking, setIsTracking] = useState(false);
  const watchIdRef = useRef<number | null>(null);

  const startTracking = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported');
      return;
    }

    setIsTracking(true);
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date(),
        });
      },
      (error) => {
        console.error('Error tracking location:', error);
        setIsTracking(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  };

  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
  };

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Real-time Location Tracking</h1>

      <div className="mb-4 flex gap-2">
        <Button
          onClick={startTracking}
          disabled={isTracking}
          variant={isTracking ? 'secondary' : 'default'}
        >
          {isTracking ? 'Tracking...' : 'Start Tracking'}
        </Button>
        <Button
          onClick={stopTracking}
          disabled={!isTracking}
          variant="destructive"
        >
          Stop Tracking
        </Button>
      </div>

      {location && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded">
          <p>Latitude: {location.latitude.toFixed(6)}</p>
          <p>Longitude: {location.longitude.toFixed(6)}</p>
          <p>Accuracy: {location.accuracy?.toFixed(1)}m</p>
          <p>Last Updated: {location.timestamp.toLocaleTimeString()}</p>
        </div>
      )}

      <MapDisplay
        location={location}
        showGeofences={false}
        showTravelHistory={false}
        showAttendanceRecords={false}
        height="600px"
      />
    </div>
  );
}
```

## Best Practices

1. **Always provide API key**: Ensure `VITE_GOOGLE_MAPS_API_KEY` is set in environment variables
2. **Handle errors gracefully**: Provide fallback UI when map fails to load
3. **Optimize performance**: Use memoization for expensive computations
4. **Request permissions**: Always request geolocation permission before accessing location
5. **Validate data**: Ensure coordinates are within valid ranges (-90 to 90 for latitude, -180 to 180 for longitude)
6. **Cache results**: Use Zustand stores to cache API responses
7. **Test thoroughly**: Test on different devices and browsers
8. **Accessibility**: Ensure keyboard navigation and screen reader support

## Common Issues and Solutions

### Issue: Map not displaying
**Solution**: Check if container has defined height and width

### Issue: Markers not showing
**Solution**: Verify coordinates are valid and within map bounds

### Issue: Geofence validation not working
**Solution**: Ensure geofence radius is in meters and location is provided

### Issue: API key errors
**Solution**: Verify API key is valid and has required APIs enabled

## Performance Tips

1. Use `showGeofences={false}` if not needed to reduce rendering
2. Limit number of journeys displayed at once
3. Use date filtering to reduce data volume
4. Implement virtual scrolling for large lists
5. Cache map instances when possible
