import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useGeoTrackingStore } from '../../store/geoTrackingStore';
import { MapPin, Navigation, Download, Calendar, Zap } from 'lucide-react';

const formatDate = (date: Date | string, format: string): string => {
  const d = new Date(date);
  if (format === 'MMM dd, yyyy') {
    return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  }
  if (format === 'HH:mm') {
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  }
  return d.toString();
};

const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};

const getStatusBadge = (status: string) => {
  const statusConfig: Record<string, { bg: string; text: string }> = {
    'In Progress': { bg: 'bg-blue-100', text: 'text-blue-800' },
    Completed: { bg: 'bg-green-100', text: 'text-green-800' },
    Cancelled: { bg: 'bg-gray-100', text: 'text-gray-800' },
    Pending: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
    Approved: { bg: 'bg-emerald-100', text: 'text-emerald-800' },
    Rejected: { bg: 'bg-red-100', text: 'text-red-800' },
  };

  const config = statusConfig[status] || statusConfig.Pending;
  return (
    <Badge className={`${config.bg} ${config.text}`}>
      {status}
    </Badge>
  );
};

interface TravelLogViewerProps {
  employeeId: string;
  initialDate?: string;
}

export const TravelLogViewer: React.FC<TravelLogViewerProps> = ({
  employeeId,
  initialDate = new Date().toISOString().split('T')[0],
}) => {
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [selectedJourney, setSelectedJourney] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const { travelLogs, loadingTravelLogs, fetchDailyJourney, exportJourneyData } =
    useGeoTrackingStore();

  useEffect(() => {
    fetchDailyJourney(employeeId, selectedDate);
  }, [employeeId, selectedDate, fetchDailyJourney]);

  const handleExport = async () => {
    try {
      const blob = await exportJourneyData(employeeId, selectedDate, selectedDate, 'csv');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `travel-log-${selectedDate}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const totalDistance = travelLogs.reduce((sum, log) => sum + log.totalDistance, 0);
  const totalAllowance = travelLogs.reduce((sum, log) => sum + log.travelAllowance, 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Travel Log Viewer
          </CardTitle>
          <CardDescription>View and manage your travel journeys</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="flex-1">
              <label className="text-sm font-medium">Select Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <Button onClick={handleExport} variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Distance</p>
                  <p className="text-2xl font-bold">{totalDistance.toFixed(1)} km</p>
                </div>
                <Navigation className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>

            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Travel Allowance</p>
                  <p className="text-2xl font-bold">₹{totalAllowance.toFixed(2)}</p>
                </div>
                <Zap className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>

            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Journeys</p>
                  <p className="text-2xl font-bold">{travelLogs.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Journeys for {formatDate(new Date(selectedDate), 'MMM dd, yyyy')}</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingTravelLogs ? (
            <div className="text-center py-8 text-muted-foreground">Loading journeys...</div>
          ) : travelLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No journeys recorded for this date</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-2 px-2">Start Time</th>
                    <th className="text-left py-2 px-2">End Time</th>
                    <th className="text-left py-2 px-2">Distance</th>
                    <th className="text-left py-2 px-2">Duration</th>
                    <th className="text-left py-2 px-2">Allowance</th>
                    <th className="text-left py-2 px-2">Status</th>
                    <th className="text-left py-2 px-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {travelLogs.map((log) => (
                    <tr key={log.id} className="border-b hover:bg-muted/50">
                      <td className="font-mono text-sm py-2 px-2">
                        {formatDate(new Date(log.startTime), 'HH:mm')}
                      </td>
                      <td className="font-mono text-sm py-2 px-2">
                        {formatDate(new Date(log.endTime), 'HH:mm')}
                      </td>
                      <td className="py-2 px-2">{log.totalDistance.toFixed(1)} km</td>
                      <td className="py-2 px-2">{formatDuration(log.totalDuration)}</td>
                      <td className="font-semibold py-2 px-2">₹{log.travelAllowance.toFixed(2)}</td>
                      <td className="py-2 px-2">{getStatusBadge(log.status)}</td>
                      <td className="py-2 px-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedJourney(log);
                            setShowDetails(true);
                          }}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {showDetails && selectedJourney && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>Journey Details</CardTitle>
              <CardDescription>
                {formatDate(new Date(selectedJourney.startTime), 'MMM dd, yyyy HH:mm')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Start Location</p>
                  <p className="font-medium">{selectedJourney.startLocation.address || 'N/A'}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedJourney.startLocation.latitude.toFixed(4)},
                    {selectedJourney.startLocation.longitude.toFixed(4)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">End Location</p>
                  <p className="font-medium">{selectedJourney.endLocation.address || 'N/A'}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedJourney.endLocation.latitude.toFixed(4)},
                    {selectedJourney.endLocation.longitude.toFixed(4)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Total Distance</p>
                  <p className="text-lg font-semibold">{selectedJourney.totalDistance.toFixed(1)} km</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="text-lg font-semibold">{formatDuration(selectedJourney.totalDuration)}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Travel Allowance</p>
                  <p className="text-lg font-semibold">₹{selectedJourney.travelAllowance.toFixed(2)}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedJourney.status)}</div>
                </div>
              </div>

              {selectedJourney.purpose && (
                <div>
                  <p className="text-sm text-muted-foreground">Purpose</p>
                  <p className="font-medium">{selectedJourney.purpose}</p>
                </div>
              )}

              {selectedJourney.waypoints && selectedJourney.waypoints.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Waypoints ({selectedJourney.waypoints.length})</p>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {selectedJourney.waypoints.map((wp: any, idx: number) => (
                      <p key={idx} className="text-xs text-muted-foreground">
                        {idx + 1}. {wp.address || `${wp.latitude.toFixed(4)}, ${wp.longitude.toFixed(4)}`}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button onClick={() => setShowDetails(false)} className="flex-1">
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
