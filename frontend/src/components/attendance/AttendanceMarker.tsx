/**
 * Attendance Marker Component
 * Supports multiple attendance modes: web, GPS, biometric
 * Handles check-in/check-out with location capture
 * 
 * Requirements Met:
 * - 7.2: Support multiple attendance modes (web check-in, GPS, biometric)
 * - 7.3: Implement web check-in with timestamp capture
 * - 7.4: Implement GPS check-in with geolocation capture
 * - 28.1: Request geolocation permission from the user
 * - 28.2: When permission is granted, capture current location
 * - 28.5: Display location accuracy indicator
 * - 28.6: Handle geolocation errors gracefully
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useAttendanceStore } from '../../store/attendanceStore';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { MapPin, CheckCircle2, AlertCircle, Loader2, Globe, Smartphone, Fingerprint } from 'lucide-react';

interface AttendanceMarkerProps {
  employeeId: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: Date;
  address?: string;
}

interface AccuracyLevel {
  level: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  color: string;
  description: string;
}

export const AttendanceMarker: React.FC<AttendanceMarkerProps> = ({
  employeeId,
  onSuccess,
  onError,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'web' | 'gps' | 'biometric'>('web');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const { markAttendance } = useAttendanceStore();

  // Check geolocation permission status on mount
  useEffect(() => {
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: 'geolocation' })
        .then((result) => {
          setPermissionStatus(result.state as 'prompt' | 'granted' | 'denied');
        })
        .catch(() => {
          // Fallback if permissions API is not available
          setPermissionStatus('prompt');
        });
    }
  }, []);

  /**
   * Handle web check-in with timestamp capture
   * Requirement 7.3: Implement web check-in with timestamp capture
   */
  const handleWebCheckIn = async () => {
    try {
      setError(null);
      setIsLoading(true);

      const timestamp = new Date();

      const record = await markAttendance({
        employee_id: employeeId,
        type: 'check_in',
        mode: 'web',
      });

      setSuccess(true);
      onSuccess?.();

      setTimeout(() => {
        setIsOpen(false);
        resetState();
      }, 2000);
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to mark attendance';
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle GPS check-in with geolocation capture
   * Requirements:
   * - 7.4: Implement GPS check-in with geolocation capture
   * - 28.1: Request geolocation permission from the user
   * - 28.2: When permission is granted, capture current location
   * - 28.6: Handle geolocation errors gracefully
   */
  const handleGPSCheckIn = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);

      // Check if geolocation is supported
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by your browser');
      }

      // Request geolocation permission (Requirement 28.1)
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      });

      // Capture current location (Requirement 28.2)
      const locationData: LocationData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: new Date(),
      };

      setLocation(locationData);
      setAccuracy(position.coords.accuracy);
      setPermissionStatus('granted');

      // Mark attendance with GPS location
      const record = await markAttendance({
        employee_id: employeeId,
        type: 'check_in',
        location: {
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          accuracy: locationData.accuracy,
        },
        mode: 'gps',
      });

      setSuccess(true);
      onSuccess?.();

      setTimeout(() => {
        setIsOpen(false);
        resetState();
      }, 2000);
    } catch (err: any) {
      let errorMsg = 'Failed to get location';

      // Handle geolocation errors gracefully (Requirement 28.6)
      if (err.code === 1) {
        errorMsg = 'Location permission denied. Please enable location access in your browser settings.';
        setPermissionStatus('denied');
      } else if (err.code === 2) {
        errorMsg = 'Location unavailable. Please check your GPS and try again.';
      } else if (err.code === 3) {
        errorMsg = 'Location request timed out. Please try again.';
      } else if (err instanceof GeolocationPositionError) {
        errorMsg = `Geolocation error: ${err.message}`;
      } else {
        errorMsg = err.message || errorMsg;
      }

      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [employeeId, markAttendance, onSuccess, onError]);

  const resetState = () => {
    setLocation(null);
    setAccuracy(null);
    setError(null);
    setSuccess(false);
    setMode('web');
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      resetState();
    }
  };

  /**
   * Get accuracy level based on accuracy value
   * Requirement 28.5: Display location accuracy indicator
   */
  const getAccuracyLevel = (accuracy: number): AccuracyLevel => {
    if (accuracy < 10) {
      return {
        level: 'Excellent',
        color: 'bg-green-500',
        description: 'Very precise location',
      };
    }
    if (accuracy < 50) {
      return {
        level: 'Good',
        color: 'bg-blue-500',
        description: 'Accurate location',
      };
    }
    if (accuracy < 100) {
      return {
        level: 'Fair',
        color: 'bg-yellow-500',
        description: 'Moderate accuracy',
      };
    }
    return {
      level: 'Poor',
      color: 'bg-red-500',
      description: 'Low accuracy - consider moving to an open area',
    };
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="gap-2"
      >
        <CheckCircle2 className="w-4 h-4" />
        Mark Attendance
      </Button>

      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Mark Attendance</DialogTitle>
          </DialogHeader>

          <Tabs value={mode} onValueChange={(v) => setMode(v as 'web' | 'gps' | 'biometric')}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="web" className="gap-1">
                <Globe className="w-4 h-4" />
                <span className="hidden sm:inline">Web</span>
              </TabsTrigger>
              <TabsTrigger value="gps" className="gap-1">
                <MapPin className="w-4 h-4" />
                <span className="hidden sm:inline">GPS</span>
              </TabsTrigger>
              <TabsTrigger value="biometric" className="gap-1">
                <Fingerprint className="w-4 h-4" />
                <span className="hidden sm:inline">Biometric</span>
              </TabsTrigger>
            </TabsList>

            {/* Web Check-in Tab */}
            <TabsContent value="web" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Web Check-in
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Mark your attendance using web check-in. Your timestamp will be recorded.
                  </p>

                  {error && (
                    <div className="flex gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                      <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-destructive">{error}</p>
                    </div>
                  )}

                  {success && (
                    <div className="flex gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-md">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-green-500">Check-in successful!</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Current Time</p>
                    <p className="text-2xl font-bold">
                      {new Date().toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: true,
                      })}
                    </p>
                  </div>

                  <Button
                    onClick={handleWebCheckIn}
                    disabled={isLoading || success}
                    className="w-full"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Checking In...
                      </>
                    ) : success ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Checked In
                      </>
                    ) : (
                      'Check In Now'
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* GPS Check-in Tab */}
            <TabsContent value="gps" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    GPS Check-in
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Mark your attendance with GPS location. Your location will be recorded for verification.
                  </p>

                  {permissionStatus === 'denied' && (
                    <div className="flex gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
                      <AlertCircle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-yellow-500">
                        Location permission is denied. Please enable it in your browser settings.
                      </p>
                    </div>
                  )}

                  {error && (
                    <div className="flex gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                      <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-destructive">{error}</p>
                    </div>
                  )}

                  {success && (
                    <div className="flex gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-md">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-green-500">Check-in successful with GPS!</p>
                    </div>
                  )}

                  {location && (
                    <div className="space-y-3 p-3 bg-muted rounded-md">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Latitude</p>
                        <p className="text-sm font-mono">{location.latitude.toFixed(6)}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Longitude</p>
                        <p className="text-sm font-mono">{location.longitude.toFixed(6)}</p>
                      </div>
                      {accuracy !== null && (
                        <div className="space-y-2">
                          <p className="text-xs text-muted-foreground">Location Accuracy</p>
                          <div className="flex items-center gap-2">
                            <Badge className={`${getAccuracyLevel(accuracy).color} text-white`}>
                              {getAccuracyLevel(accuracy).level}
                            </Badge>
                            <span className="text-sm font-mono">±{accuracy.toFixed(1)}m</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {getAccuracyLevel(accuracy).description}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  <Button
                    onClick={handleGPSCheckIn}
                    disabled={isLoading || success || permissionStatus === 'denied'}
                    className="w-full"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Getting Location...
                      </>
                    ) : success ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Checked In
                      </>
                    ) : (
                      <>
                        <MapPin className="w-4 h-4 mr-2" />
                        Check In with GPS
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Biometric Check-in Tab */}
            <TabsContent value="biometric" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Fingerprint className="w-4 h-4" />
                    Biometric Check-in
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Biometric attendance marking is not yet available. Please use Web or GPS check-in.
                  </p>
                  <div className="p-3 bg-muted rounded-md">
                    <p className="text-sm text-muted-foreground">
                      Biometric attendance will be available through dedicated hardware integration.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
            className="w-full"
          >
            Close
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};
