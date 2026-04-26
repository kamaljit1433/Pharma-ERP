/**
 * Location Accuracy Indicator Component
 * Displays the accuracy of captured location with visual feedback
 * 
 * Requirements Met:
 * - 28.5: Display location accuracy indicator
 */

import React from 'react';
import { Badge } from '../ui/badge';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

export interface LocationAccuracyIndicatorProps {
  accuracy: number;
  showDescription?: boolean;
  showMeters?: boolean;
  className?: string;
}

export interface AccuracyLevel {
  level: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  color: string;
  bgColor: string;
  icon: React.ReactNode;
  description: string;
  threshold: number;
}

/**
 * Get accuracy level based on accuracy value in meters
 * Accuracy thresholds:
 * - Excellent: < 10m (GPS with clear sky)
 * - Good: 10-50m (GPS with some obstruction)
 * - Fair: 50-100m (GPS with significant obstruction)
 * - Poor: > 100m (GPS with heavy obstruction or network-based)
 */
const getAccuracyLevel = (accuracy: number): AccuracyLevel => {
  if (accuracy < 10) {
    return {
      level: 'Excellent',
      color: 'text-green-600',
      bgColor: 'bg-green-50 border-green-200',
      icon: <CheckCircle2 className="w-4 h-4" />,
      description: 'Very precise location - ideal for attendance marking',
      threshold: 10,
    };
  }
  if (accuracy < 50) {
    return {
      level: 'Good',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 border-blue-200',
      icon: <CheckCircle2 className="w-4 h-4" />,
      description: 'Accurate location - suitable for attendance marking',
      threshold: 50,
    };
  }
  if (accuracy < 100) {
    return {
      level: 'Fair',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50 border-yellow-200',
      icon: <AlertCircle className="w-4 h-4" />,
      description: 'Moderate accuracy - consider moving to an open area for better precision',
      threshold: 100,
    };
  }
  return {
    level: 'Poor',
    color: 'text-red-600',
    bgColor: 'bg-red-50 border-red-200',
    icon: <AlertCircle className="w-4 h-4" />,
    description: 'Low accuracy - move to an open area with clear sky view',
    threshold: Infinity,
  };
};

/**
 * Location Accuracy Indicator Component
 * Displays accuracy level with color-coded visual feedback
 * 
 * @param accuracy - Accuracy value in meters
 * @param showDescription - Whether to show description text
 * @param showMeters - Whether to show accuracy in meters
 * @param className - Additional CSS classes
 */
export const LocationAccuracyIndicator: React.FC<LocationAccuracyIndicatorProps> = ({
  accuracy,
  showDescription = true,
  showMeters = true,
  className = '',
}) => {
  const accuracyLevel = getAccuracyLevel(accuracy);

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Accuracy Badge and Meters */}
      <div className="flex items-center gap-3">
        <Badge
          variant="outline"
          className={`${accuracyLevel.color} border-current`}
        >
          <span className="flex items-center gap-1">
            {accuracyLevel.icon}
            {accuracyLevel.level}
          </span>
        </Badge>
        {showMeters && (
          <span className="text-sm font-mono text-muted-foreground">
            ±{accuracy.toFixed(1)}m
          </span>
        )}
      </div>

      {/* Description */}
      {showDescription && (
        <div className={`p-3 rounded-md border ${accuracyLevel.bgColor}`}>
          <div className="flex gap-2">
            <Info className={`w-4 h-4 flex-shrink-0 mt-0.5 ${accuracyLevel.color}`} />
            <p className={`text-sm ${accuracyLevel.color}`}>
              {accuracyLevel.description}
            </p>
          </div>
        </div>
      )}

      {/* Accuracy Bar */}
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">Accuracy Range</span>
          <span className="text-xs font-mono text-muted-foreground">
            {accuracy.toFixed(1)}m / {accuracyLevel.threshold}m
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${
              accuracy < 10
                ? 'bg-green-500'
                : accuracy < 50
                  ? 'bg-blue-500'
                  : accuracy < 100
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
            }`}
            style={{
              width: `${Math.min((accuracy / accuracyLevel.threshold) * 100, 100)}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
};
