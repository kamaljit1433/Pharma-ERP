/**
 * Attendance Check-In Component
 * Handles employee check-in with face detection and GPS validation
 */

import React, { useState, useRef, useEffect } from 'react';
import { faceDetectionService } from '../../services/faceDetectionService';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Camera, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';

interface AttendanceCheckInProps {
  employeeId: string;
  onCheckInSuccess?: (attendance: any) => void;
  onCheckInError?: (error: string) => void;
}

export const AttendanceCheckIn: React.FC<AttendanceCheckInProps> = ({
  employeeId,
  onCheckInSuccess,
  onCheckInError,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [gpsLocation, setGpsLocation] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup: stop camera stream
      if (streamRef.current) {
        faceDetectionService.stopCameraStream(streamRef.current);
      }
      faceDetectionService.dispose();
    };
  }, []);

  const startCamera = async () => {
    try {
      setError(null);
      setIsLoading(true);

      // Request camera access
      const stream = await faceDetectionService.requestCameraAccess();
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Initialize face detection model
      await faceDetectionService.initializeModel();
    } catch (err: any) {
      setError(err.message || 'Failed to access camera');
      onCheckInError?.(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const detectFace = async () => {
    try {
      setError(null);
      setIsLoading(true);

      if (!videoRef.current) {
        throw new Error('Video element not available');
      }

      // Detect face
      const result = await faceDetectionService.detectHumanPresence(videoRef.current);
      setFaceDetected(result.detected);

      if (!result.detected) {
        setError('No face detected. Please ensure your face is visible to the camera.');
        return;
      }

      // Verify liveness
      const livenessResult = await faceDetectionService.verifyLiveness(videoRef.current);
      if (!livenessResult.isLive) {
        setError('Liveness verification failed. Please try again.');
        return;
      }

      // Get GPS location
      await getGPSLocation();
    } catch (err: any) {
      setError(err.message || 'Face detection failed');
      onCheckInError?.(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getGPSLocation = async () => {
    try {
      return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolocation is not supported'));
          return;
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            const location = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              timestamp: new Date(),
            };
            setGpsLocation(location);
            resolve(location);
          },
          (error) => {
            reject(new Error(`GPS error: ${error.message}`));
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          }
        );
      });
    } catch (err: any) {
      setError(err.message || 'Failed to get GPS location');
      throw err;
    }
  };

  const handleCheckIn = async () => {
    try {
      setError(null);
      setIsLoading(true);

      if (!faceDetected) {
        setError('Face detection required for check-in');
        return;
      }

      if (!gpsLocation) {
        setError('GPS location required for check-in');
        return;
      }

      // Call API to mark check-in
      const response = await fetch('/api/v1/attendance/check-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employeeId,
          location: gpsLocation,
          faceDetected: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Check-in failed');
      }

      const data = await response.json();
      setSuccess(true);
      onCheckInSuccess?.(data.data);

      // Close dialog after 2 seconds
      setTimeout(() => {
        setIsOpen(false);
        resetState();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Check-in failed');
      onCheckInError?.(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const resetState = () => {
    setFaceDetected(false);
    setGpsLocation(null);
    setError(null);
    setSuccess(false);
    if (streamRef.current) {
      faceDetectionService.stopCameraStream(streamRef.current);
      streamRef.current = null;
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      resetState();
    }
  };

  return (
    <>
      <Button
        onClick={() => {
          setIsOpen(true);
          setTimeout(startCamera, 100);
        }}
        className="gap-2"
      >
        <Camera className="w-4 h-4" />
        Check In
      </Button>

      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Mark Attendance</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Video Feed */}
            <div className="relative bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-64 object-cover"
              />
              {faceDetected && (
                <div className="absolute top-2 right-2">
                  <Badge className="bg-success text-success-foreground gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Face Detected
                  </Badge>
                </div>
              )}
            </div>

            {/* Status Indicators */}
            <div className="space-y-2">
              {/* Face Detection Status */}
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">
                  Face Detection:{' '}
                  {faceDetected ? (
                    <Badge className="bg-success text-success-foreground">Detected</Badge>
                  ) : (
                    <Badge variant="secondary">Pending</Badge>
                  )}
                </span>
              </div>

              {/* GPS Status */}
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">
                  GPS Location:{' '}
                  {gpsLocation ? (
                    <Badge className="bg-success text-success-foreground">Captured</Badge>
                  ) : (
                    <Badge variant="secondary">Pending</Badge>
                  )}
                </span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="flex gap-2 p-3 bg-success/10 border border-success/20 rounded-md">
                <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                <p className="text-sm text-success">Check-in successful!</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              {!faceDetected ? (
                <Button
                  onClick={detectFace}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? 'Detecting...' : 'Detect Face'}
                </Button>
              ) : (
                <Button
                  onClick={handleCheckIn}
                  disabled={isLoading || !faceDetected || !gpsLocation}
                  className="flex-1"
                >
                  {isLoading ? 'Checking In...' : 'Confirm Check In'}
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
