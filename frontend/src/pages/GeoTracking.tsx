import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useGeoTrackingStore } from '../store/geoTrackingStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { AlertCircle, MapPin, Navigation, TrendingUp, Wallet } from 'lucide-react';
import { UserRole } from '../types/auth';
import {
  TravelLogViewer,
  TravelAllowanceSummary,
  TravelApproval,
  GeoFenceManagement,
} from '../components/geo-tracking';

const GeoTracking: React.FC = () => {
  const { user } = useAuth();
  const { monthlyAllowance, loadingAllowance, fetchMonthlyAllowance, error, clearError } =
    useGeoTrackingStore();
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const isManager =
    user?.role === UserRole.DEPARTMENT_MANAGER ||
    user?.role === UserRole.HR_MANAGER ||
    user?.role === UserRole.SUPER_ADMIN;

  const isAdmin =
    user?.role === UserRole.SUPER_ADMIN ||
    user?.role === UserRole.IT_ADMIN ||
    user?.role === UserRole.HR_MANAGER;

  useEffect(() => {
    if (!user?.employeeId) return;
    const now = new Date();
    fetchMonthlyAllowance(user.employeeId, now.getMonth() + 1, now.getFullYear()).catch((err) =>
      setSummaryError(err?.message || 'Failed to load summary')
    );
    return () => clearError();
  }, [user?.employeeId]);

  const defaultTab = 'logs';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold sm:text-2xl lg:text-3xl flex items-center gap-2">
          <MapPin className="w-6 h-6" />
          Geo Tracking
        </h1>
      </div>

      {/* Error alert */}
      {(summaryError || error) && (
        <div className="flex gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">{summaryError || error}</p>
        </div>
      )}

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="w-5 h-5" />
            This Month's Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingAllowance ? (
            <div className="text-center py-4 text-muted-foreground text-sm">Loading...</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Navigation className="w-4 h-4" />
                  Total Distance
                </p>
                <p className="text-2xl font-bold">
                  {monthlyAllowance ? `${monthlyAllowance.totalDistance.toFixed(1)} km` : '0 km'}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Wallet className="w-4 h-4" />
                  Travel Allowance
                </p>
                <p className="text-2xl font-bold">
                  {monthlyAllowance
                    ? `${monthlyAllowance.currency} ${monthlyAllowance.totalAllowance.toFixed(2)}`
                    : '0.00'}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  Journeys
                </p>
                <p className="text-2xl font-bold">
                  {monthlyAllowance ? monthlyAllowance.journeyCount : 0}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Rate</p>
                <p className="text-2xl font-bold">
                  {monthlyAllowance
                    ? `${monthlyAllowance.currency} ${monthlyAllowance.rate}/km`
                    : '-'}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="w-full flex-wrap h-auto">
          <TabsTrigger value="logs">Travel Logs</TabsTrigger>
          <TabsTrigger value="allowance">Allowance</TabsTrigger>
          {isManager && <TabsTrigger value="approvals">Approvals</TabsTrigger>}
          {isAdmin && <TabsTrigger value="geofences">Geo-Fences</TabsTrigger>}
        </TabsList>

        <TabsContent value="logs" className="space-y-4 mt-4">
          <TravelLogViewer employeeId={user?.employeeId || ''} />
        </TabsContent>

        <TabsContent value="allowance" className="space-y-4 mt-4">
          <TravelAllowanceSummary
            employeeId={user?.employeeId || ''}
            initialMonth={new Date().getMonth() + 1}
            initialYear={new Date().getFullYear()}
          />
        </TabsContent>

        {isManager && (
          <TabsContent value="approvals" className="space-y-4 mt-4">
            <TravelApproval managerId={user?.employeeId || ''} />
          </TabsContent>
        )}

        {isAdmin && (
          <TabsContent value="geofences" className="space-y-4 mt-4">
            <GeoFenceManagement />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default GeoTracking;
