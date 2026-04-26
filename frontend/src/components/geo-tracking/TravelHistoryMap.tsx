/**
 * Travel History Map Component
 * Displays travel history on a map with journey details
 * 
 * Requirements Met:
 * - 28.7: Display travel history on a map
 * - 28.8: Calculate distance traveled
 */

import React, { useState, useMemo } from 'react';
import { Journey } from '../../types/geoTracking';
import { MapDisplay } from './MapDisplay';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Calendar, MapPin, Clock, Navigation } from 'lucide-react';
import { format } from 'date-fns';

export interface TravelHistoryMapProps {
  journeys: Journey[];
  onJourneySelect?: (journey: Journey) => void;
  className?: string;
}

interface JourneyStats {
  totalDistance: number;
  totalDuration: number;
  averageSpeed: number;
  journeyCount: number;
}

/**
 * Travel History Map Component
 * Displays travel history on a map with journey details and statistics
 */
export const TravelHistoryMap: React.FC<TravelHistoryMapProps> = ({
  journeys,
  onJourneySelect,
  className = '',
}) => {
  const [selectedJourney, setSelectedJourney] = useState<Journey | null>(
    journeys.length > 0 ? journeys[0] : null
  );
  const [dateFilter, setDateFilter] = useState<string>('all');

  // Calculate statistics
  const stats = useMemo<JourneyStats>(() => {
    const filtered = journeys.filter((j) => {
      if (dateFilter === 'all') return true;
      const journeyDate = new Date(j.startTime).toDateString();
      const filterDate = new Date(dateFilter).toDateString();
      return journeyDate === filterDate;
    });

    const totalDistance = filtered.reduce((sum, j) => sum + j.totalDistance, 0);
    const totalDuration = filtered.reduce((sum, j) => sum + j.totalDuration, 0);
    const averageSpeed = totalDuration > 0 ? (totalDistance / (totalDuration / 3600)) : 0;

    return {
      totalDistance,
      totalDuration,
      averageSpeed,
      journeyCount: filtered.length,
    };
  }, [journeys, dateFilter]);

  // Get unique dates for filter
  const uniqueDates = useMemo(() => {
    const dates = new Set<string>();
    journeys.forEach((j) => {
      dates.add(new Date(j.startTime).toDateString());
    });
    return Array.from(dates).sort().reverse();
  }, [journeys]);

  // Filter journeys based on date
  const filteredJourneys = useMemo(() => {
    if (dateFilter === 'all') return journeys;
    return journeys.filter((j) => {
      const journeyDate = new Date(j.startTime).toDateString();
      const filterDate = new Date(dateFilter).toDateString();
      return journeyDate === filterDate;
    });
  }, [journeys, dateFilter]);

  const handleJourneySelect = (journey: Journey) => {
    setSelectedJourney(journey);
    if (onJourneySelect) {
      onJourneySelect(journey);
    }
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (journeys.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No travel history available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Map Display */}
      <MapDisplay
        journeys={selectedJourney ? [selectedJourney] : filteredJourneys}
        showTravelHistory={true}
        showGeofences={false}
        showAttendanceRecords={false}
        height="400px"
      />

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Total Distance</p>
              <p className="text-lg font-bold">{stats.totalDistance.toFixed(1)} km</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Total Duration</p>
              <p className="text-lg font-bold">{formatDuration(stats.totalDuration)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Avg Speed</p>
              <p className="text-lg font-bold">{stats.averageSpeed.toFixed(1)} km/h</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Journeys</p>
              <p className="text-lg font-bold">{stats.journeyCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Date Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Filter by Date
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={dateFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDateFilter('all')}
            >
              All Dates
            </Button>
            {uniqueDates.map((date) => (
              <Button
                key={date}
                variant={dateFilter === date ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDateFilter(date)}
              >
                {format(new Date(date), 'MMM dd')}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Journey List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Journey Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredJourneys.map((journey) => (
              <div
                key={journey.id}
                className={`p-3 border rounded-md cursor-pointer transition-colors ${
                  selectedJourney?.id === journey.id
                    ? 'bg-blue-50 border-blue-300'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => handleJourneySelect(journey)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium truncate">
                        {journey.purpose || 'Journey'}
                      </p>
                      <Badge className={getStatusColor(journey.status)} variant="outline">
                        {journey.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {format(new Date(journey.startTime), 'HH:mm')} -{' '}
                        {format(new Date(journey.endTime), 'HH:mm')}
                      </div>
                      <div className="flex items-center gap-1">
                        <Navigation className="w-3 h-3" />
                        {journey.totalDistance.toFixed(1)} km
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      ₹{journey.travelAllowance.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDuration(journey.totalDuration)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Selected Journey Details */}
      {selectedJourney && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Selected Journey Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Start Location</p>
                <p className="text-sm font-mono">
                  {selectedJourney.startLocation.latitude.toFixed(6)},
                  {selectedJourney.startLocation.longitude.toFixed(6)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">End Location</p>
                <p className="text-sm font-mono">
                  {selectedJourney.endLocation.latitude.toFixed(6)},
                  {selectedJourney.endLocation.longitude.toFixed(6)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Distance</p>
                <p className="text-sm font-medium">{selectedJourney.totalDistance.toFixed(2)} km</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Duration</p>
                <p className="text-sm font-medium">{formatDuration(selectedJourney.totalDuration)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Travel Allowance</p>
                <p className="text-sm font-medium">₹{selectedJourney.travelAllowance.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Waypoints</p>
                <p className="text-sm font-medium">{selectedJourney.waypoints.length}</p>
              </div>
            </div>
            {selectedJourney.purpose && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Purpose</p>
                <p className="text-sm">{selectedJourney.purpose}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
