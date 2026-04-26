/**
 * Geolocation Capture Component
 * Provides UI for requesting geolocation and displaying captured location
 * 
 * Requirements Met:
 * - 28.1: Request geolocation permission from user
 * - 28.2: Capture current location when permission is granted
 * - 28.5: Display location accuracy indicator
 * - 28.6: Handle geolocation errors gracefully
 * - 28.10: Respect user privacy and location permissions
 */

import React, { useState } from 'react';
import { useGeolocation, GeolocationCoordinates } from '../../hooks/useGeolocation';
import { LocationAccuracyIndicator } from './LocationAccuracyIndicator';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { AlertCircle, CheckCircle2, Loader2, MapPin, Copy } from 'lucide-react';

export interface GeolocationCaptureProps {
  onLocationCapture?: (coordinates: GeolocationCoordinates) => void;
  onError?: (error: string) => void;
  showCoordinates?: boolean;
  showCopyButton?: boolean;
  showMap?: boolean;
  className?: string;
}

/**
 * Geolocation Capture Component
 * Provides a button to request geolocation and displays captured location
 * 
 * @param onLocationCapture - Callback when location is successfully captured
 * @param onError - Callback when an error occurs
 * @param showCoordinates - Whether to show latitude/longitude coordinates
 * @param showCopyButton - Whether to show copy button for coordinates
 * @param showMap - Whether to show map link (not implemented in this component)
 * @param className - Additional CSS classes
 */
export const GeolocationCapture: React.FC<GeolocationCaptureProps> = ({
  onLocationCapture,
  onError,
  showCoordinates = true,
  showCopyButton = true,
  showMap = false,
  className = '',
}) => {
  const [copied, setCopied] = useState(false);
  const {
    coordinates,
    timestamp,
    loading,
    error,
    permissionStatus,
    captureLocation,
    clearLocation,
  } = useGeolocation({
    onSuccess: onLocationCapture,
    onError,
  });

  const handleCaptureClick = async () => {
    try {
      await captureLocation();
    } catch (err) {
      // Error is already handled in the hook
    }
  };

  const handleCopyCoordinates = () => {
    if (coordinates) {
      const text = `${coordinates.latitude.toFixed(6)}, ${coordinates.longitude.toFixed(6)}`;
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const handleClear = () => {
    clearLocation();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Permission Status Alert */}
      {permissionStatus === 'denied' && (
        <div className="flex gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-yellow-800">Location Permission Denied</p>
            <p className="text-xs text-yellow-700 mt-1">
              Please enable location access in your browser settings to use geolocation features.
            </p>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="flex gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">Location Error</p>
            <p className="text-xs text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Capture Button */}
      <Button
        onClick={handleCaptureClick}
        disabled={loading || permissionStatus === 'denied'}
        className="w-full gap-2"
        size="lg"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Capturing Location...
          </>
        ) : coordinates ? (
          <>
            <CheckCircle2 className="w-4 h-4" />
            Location Captured
          </>
        ) : (
          <>
            <MapPin className="w-4 h-4" />
            Capture Location
          </>
        )}
      </Button>

      {/* Location Details Card */}
      {coordinates && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              Location Captured
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Timestamp */}
            {timestamp && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Captured At</p>
                <p className="text-sm font-medium">
                  {timestamp.toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: true,
                  })}
                </p>
              </div>
            )}

            {/* Coordinates */}
            {showCoordinates && (
              <div className="space-y-2">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Latitude</p>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-mono bg-muted p-2 rounded flex-1">
                      {coordinates.latitude.toFixed(6)}
                    </p>
                    {showCopyButton && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopyCoordinates}
                        title="Copy coordinates"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Longitude</p>
                  <p className="text-sm font-mono bg-muted p-2 rounded">
                    {coordinates.longitude.toFixed(6)}
                  </p>
                </div>

                {/* Altitude (if available) */}
                {coordinates.altitude !== undefined && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Altitude</p>
                    <p className="text-sm font-mono bg-muted p-2 rounded">
                      {coordinates.altitude.toFixed(2)}m
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Accuracy Indicator */}
            <div className="pt-2 border-t">
              <LocationAccuracyIndicator
                accuracy={coordinates.accuracy}
                showDescription={true}
                showMeters={true}
              />
            </div>

            {/* Additional Info */}
            {(coordinates.speed !== undefined || coordinates.heading !== undefined) && (
              <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                {coordinates.speed !== undefined && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Speed</p>
                    <p className="text-sm font-mono">
                      {(coordinates.speed * 3.6).toFixed(1)} km/h
                    </p>
                  </div>
                )}
                {coordinates.heading !== undefined && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Heading</p>
                    <p className="text-sm font-mono">{coordinates.heading.toFixed(1)}°</p>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2 border-t">
              <Button
                variant="outline"
                onClick={handleClear}
                className="flex-1"
              >
                Clear
              </Button>
              {showCopyButton && (
                <Button
                  variant="outline"
                  onClick={handleCopyCoordinates}
                  className="flex-1"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!coordinates && !loading && !error && (
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <MapPin className="w-8 h-8 text-muted-foreground mx-auto opacity-50" />
              <p className="text-sm text-muted-foreground">
                Click the button above to capture your current location
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
