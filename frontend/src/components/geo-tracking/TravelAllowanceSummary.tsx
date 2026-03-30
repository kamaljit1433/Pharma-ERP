import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useGeoTrackingStore } from '../../store/geoTrackingStore';
import { Download, TrendingUp, Navigation, Zap } from 'lucide-react';

const formatDate = (date: Date | string, format: string): string => {
  const d = new Date(date);
  if (format === 'MMM dd') {
    return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
  }
  return d.toString();
};

interface TravelAllowanceSummaryProps {
  employeeId: string;
  initialMonth?: number;
  initialYear?: number;
}

export const TravelAllowanceSummary: React.FC<TravelAllowanceSummaryProps> = ({
  employeeId,
  initialMonth = new Date().getMonth() + 1,
  initialYear = new Date().getFullYear(),
}) => {
  const [selectedMonth, setSelectedMonth] = useState(initialMonth);
  const [selectedYear, setSelectedYear] = useState(initialYear);

  const {
    monthlyAllowance,
    loadingAllowance,
    fetchMonthlyAllowance,
    exportJourneyData,
  } = useGeoTrackingStore();

  useEffect(() => {
    fetchMonthlyAllowance(employeeId, selectedMonth, selectedYear);
  }, [employeeId, selectedMonth, selectedYear, fetchMonthlyAllowance]);

  const handleExport = async () => {
    try {
      const startDate = new Date(selectedYear, selectedMonth - 1, 1)
        .toISOString()
        .split('T')[0];
      const endDate = new Date(selectedYear, selectedMonth, 0)
        .toISOString()
        .split('T')[0];

      const blob = await exportJourneyData(employeeId, startDate, endDate, 'pdf');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `travel-allowance-${selectedYear}-${String(selectedMonth).padStart(2, '0')}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Travel Allowance Summary
          </CardTitle>
          <CardDescription>Monthly travel allowance breakdown and comparison</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="flex gap-4">
              <div>
                <label className="text-sm font-medium">Month</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {monthNames.map((month, idx) => (
                    <option key={idx} value={idx + 1}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Year</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Button onClick={handleExport} variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {loadingAllowance ? (
        <div className="text-center py-8 text-muted-foreground">Loading summary...</div>
      ) : monthlyAllowance ? (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Total Distance</p>
                  <p className="text-2xl font-bold">{monthlyAllowance.totalDistance.toFixed(1)} km</p>
                  <p className="text-xs text-muted-foreground">
                    {monthlyAllowance.journeyCount} journeys
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Total Allowance</p>
                  <p className="text-2xl font-bold">₹{monthlyAllowance.totalAllowance.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">
                    @ ₹{monthlyAllowance.rate.toFixed(2)}/km
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Average Distance</p>
                  <p className="text-2xl font-bold">
                    {(monthlyAllowance.totalDistance / monthlyAllowance.journeyCount).toFixed(1)} km
                  </p>
                  <p className="text-xs text-muted-foreground">per journey</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Currency</p>
                  <p className="text-2xl font-bold">{monthlyAllowance.currency}</p>
                  <p className="text-xs text-muted-foreground">
                    {monthNames[selectedMonth - 1]} {selectedYear}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Journey Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              {monthlyAllowance.journeys.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No journeys recorded for this month
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b">
                      <tr>
                        <th className="text-left py-2 px-2">Date</th>
                        <th className="text-left py-2 px-2">Start Time</th>
                        <th className="text-left py-2 px-2">End Time</th>
                        <th className="text-left py-2 px-2">Distance</th>
                        <th className="text-left py-2 px-2">Allowance</th>
                        <th className="text-left py-2 px-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthlyAllowance.journeys.map((journey) => (
                        <tr key={journey.id} className="border-b hover:bg-muted/50">
                          <td className="text-sm py-2 px-2">
                            {formatDate(new Date(journey.startTime), 'MMM dd')}
                          </td>
                          <td className="font-mono text-sm py-2 px-2">
                            {new Date(journey.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                          </td>
                          <td className="font-mono text-sm py-2 px-2">
                            {new Date(journey.endTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                          </td>
                          <td className="py-2 px-2">{journey.totalDistance.toFixed(1)} km</td>
                          <td className="font-semibold py-2 px-2">
                            ₹{journey.travelAllowance.toFixed(2)}
                          </td>
                          <td className="py-2 px-2">
                            <Badge
                              variant={
                                journey.status === 'Approved'
                                  ? 'default'
                                  : journey.status === 'Rejected'
                                    ? 'destructive'
                                    : 'secondary'
                              }
                            >
                              {journey.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Approved Journeys</p>
                  <p className="text-lg font-semibold">
                    {monthlyAllowance.journeys.filter((j) => j.status === 'Approved').length}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Pending Journeys</p>
                  <p className="text-lg font-semibold">
                    {monthlyAllowance.journeys.filter((j) => j.status === 'Pending').length}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Rejected Journeys</p>
                  <p className="text-lg font-semibold">
                    {monthlyAllowance.journeys.filter((j) => j.status === 'Rejected').length}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Approved Allowance</p>
                  <p className="text-lg font-semibold">
                    ₹
                    {monthlyAllowance.journeys
                      .filter((j) => j.status === 'Approved')
                      .reduce((sum, j) => sum + j.travelAllowance, 0)
                      .toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          No data available for the selected period
        </div>
      )}
    </div>
  );
};
