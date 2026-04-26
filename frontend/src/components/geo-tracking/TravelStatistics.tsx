import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Navigation, Zap, Clock, AlertTriangle, TrendingUp } from 'lucide-react';
import {
  calculateDistanceStats,
  calculateAverageSpeed,
  formatDistance,
  formatSpeed,
  GeoPoint,
} from '../../utils/distanceCalculator';

export interface Journey {
  id: string;
  startLocation: GeoPoint;
  endLocation: GeoPoint;
  waypoints: GeoPoint[];
  totalDistance: number;
  totalDuration: number;
  startTime: Date;
  endTime: Date;
  purpose?: string;
  travelAllowance: number;
  status: 'In Progress' | 'Completed' | 'Cancelled' | 'Pending' | 'Approved' | 'Rejected';
}

export interface TravelStatisticsProps {
  journeys: Journey[];
  loading?: boolean;
  emptyMessage?: string;
}

/**
 * TravelStatistics Component
 *
 * Displays comprehensive travel statistics including:
 * - Total distance traveled
 * - Average, minimum, and maximum distances per journey
 * - Journey count and duration statistics
 * - Average speed calculations
 * - Anomalies or unusual patterns
 *
 * @example
 * <TravelStatistics
 *   journeys={journeyData}
 *   loading={isLoading}
 * />
 */
export const TravelStatistics: React.FC<TravelStatisticsProps> = ({
  journeys,
  loading = false,
  emptyMessage = 'No journey data available',
}) => {
  // Calculate statistics from journeys
  const statistics = useMemo(() => {
    if (!journeys || journeys.length === 0) {
      return null;
    }

    // Calculate total distance
    const totalDistance = journeys.reduce((sum, j) => sum + j.totalDistance, 0);

    // Calculate average distance per journey
    const averageDistance = totalDistance / journeys.length;

    // Find min and max distances
    const distances = journeys.map((j) => j.totalDistance);
    const minDistance = Math.min(...distances);
    const maxDistance = Math.max(...distances);

    // Calculate total duration
    const totalDurationMs = journeys.reduce((sum, j) => sum + j.totalDuration, 0);
    const totalDurationHours = totalDurationMs / (1000 * 60 * 60);

    // Calculate average speed
    const averageSpeed = totalDurationHours > 0 ? totalDistance / totalDurationHours : 0;

    // Calculate journey statistics
    const completedJourneys = journeys.filter((j) => j.status === 'Completed').length;
    const approvedJourneys = journeys.filter((j) => j.status === 'Approved').length;
    const pendingJourneys = journeys.filter((j) => j.status === 'Pending').length;

    // Calculate total allowance
    const totalAllowance = journeys.reduce((sum, j) => sum + j.travelAllowance, 0);

    // Detect anomalies (journeys with unusually high speeds)
    const anomalies = journeys.filter((journey) => {
      if (journey.totalDuration === 0) return false;
      const durationHours = journey.totalDuration / (1000 * 60 * 60);
      const speed = journey.totalDistance / durationHours;
      return speed > 120; // Flag speeds over 120 km/h as anomalies
    });

    return {
      totalDistance,
      averageDistance,
      minDistance,
      maxDistance,
      totalDurationHours,
      averageSpeed,
      journeyCount: journeys.length,
      completedJourneys,
      approvedJourneys,
      pendingJourneys,
      totalAllowance,
      anomalies,
    };
  }, [journeys]);

  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">Loading travel statistics...</div>
    );
  }

  if (!statistics) {
    return (
      <div className="text-center py-8 text-muted-foreground">{emptyMessage}</div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Distance Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Navigation className="h-4 w-4" />
                Total Distance
              </p>
              <p className="text-2xl font-bold">{formatDistance(statistics.totalDistance)}</p>
              <p className="text-xs text-muted-foreground">
                {statistics.journeyCount} journeys
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Average Distance
              </p>
              <p className="text-2xl font-bold">{formatDistance(statistics.averageDistance)}</p>
              <p className="text-xs text-muted-foreground">per journey</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Average Speed
              </p>
              <p className="text-2xl font-bold">{formatSpeed(statistics.averageSpeed)}</p>
              <p className="text-xs text-muted-foreground">overall average</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Total Duration
              </p>
              <p className="text-2xl font-bold">{statistics.totalDurationHours.toFixed(1)}h</p>
              <p className="text-xs text-muted-foreground">travel time</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distance Range Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Distance Range</CardTitle>
          <CardDescription>Minimum and maximum distances per journey</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Minimum Distance</p>
              <p className="text-lg font-semibold">{formatDistance(statistics.minDistance)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Maximum Distance</p>
              <p className="text-lg font-semibold">{formatDistance(statistics.maxDistance)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Journey Status Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Journey Status Summary</CardTitle>
          <CardDescription>Breakdown of journey statuses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-lg font-semibold">{statistics.completedJourneys}</p>
              <Badge variant="default" className="w-fit">
                {((statistics.completedJourneys / statistics.journeyCount) * 100).toFixed(0)}%
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Approved</p>
              <p className="text-lg font-semibold">{statistics.approvedJourneys}</p>
              <Badge variant="secondary" className="w-fit">
                {((statistics.approvedJourneys / statistics.journeyCount) * 100).toFixed(0)}%
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-lg font-semibold">{statistics.pendingJourneys}</p>
              <Badge variant="outline" className="w-fit">
                {((statistics.pendingJourneys / statistics.journeyCount) * 100).toFixed(0)}%
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Travel Allowance Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Travel Allowance Summary</CardTitle>
          <CardDescription>Total allowance for all journeys</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Total Allowance</p>
            <p className="text-3xl font-bold">₹{statistics.totalAllowance.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">
              Average: ₹{(statistics.totalAllowance / statistics.journeyCount).toFixed(2)} per journey
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Anomalies Section */}
      {statistics.anomalies.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-900 dark:text-yellow-100">
              <AlertTriangle className="h-5 w-5" />
              Anomalies Detected
            </CardTitle>
            <CardDescription className="text-yellow-800 dark:text-yellow-200">
              {statistics.anomalies.length} journey(ies) with unusual speed patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {statistics.anomalies.map((journey, idx) => {
                const durationHours = journey.totalDuration / (1000 * 60 * 60);
                const speed = journey.totalDistance / durationHours;
                return (
                  <div
                    key={journey.id}
                    className="flex items-center justify-between p-2 rounded bg-yellow-100 dark:bg-yellow-900"
                  >
                    <div>
                      <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                        Journey {idx + 1}
                      </p>
                      <p className="text-xs text-yellow-800 dark:text-yellow-200">
                        {formatDistance(journey.totalDistance)} at {formatSpeed(speed)}
                      </p>
                    </div>
                    <Badge variant="destructive">High Speed</Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TravelStatistics;
