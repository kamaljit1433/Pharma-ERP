/**
 * Attendance Records Map Component
 * Displays location-based attendance records on a map
 * 
 * Requirements Met:
 * - 28.9: Display location-based attendance records
 */

import React, { useState, useMemo } from 'react';
import { GeoLocation } from '../../types/geoTracking';
import { MapDisplay } from './MapDisplay';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Calendar, MapPin, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { format } from 'date-fns';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  checkInLocation?: GeoLocation;
  checkOutLocation?: GeoLocation;
  checkInTime?: string;
  checkOutTime?: string;
  status: 'present' | 'absent' | 'half_day' | 'on_leave';
  workingHours?: number;
}

export interface AttendanceRecordsMapProps {
  records: AttendanceRecord[];
  onRecordSelect?: (record: AttendanceRecord) => void;
  className?: string;
}

interface AttendanceStats {
  totalRecords: number;
  presentDays: number;
  absentDays: number;
  halfDays: number;
  onLeaveDays: number;
  averageWorkingHours: number;
}

/**
 * Attendance Records Map Component
 * Displays location-based attendance records on a map
 */
export const AttendanceRecordsMap: React.FC<AttendanceRecordsMapProps> = ({
  records,
  onRecordSelect,
  className = '',
}) => {
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(
    records.length > 0 ? records[0] : null
  );
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Calculate statistics
  const stats = useMemo<AttendanceStats>(() => {
    const filtered = records.filter((r) => {
      if (dateFilter !== 'all') {
        const recordDate = new Date(r.date).toDateString();
        const filterDate = new Date(dateFilter).toDateString();
        if (recordDate !== filterDate) return false;
      }
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      return true;
    });

    const presentDays = filtered.filter((r) => r.status === 'present').length;
    const absentDays = filtered.filter((r) => r.status === 'absent').length;
    const halfDays = filtered.filter((r) => r.status === 'half_day').length;
    const onLeaveDays = filtered.filter((r) => r.status === 'on_leave').length;

    const totalWorkingHours = filtered.reduce((sum, r) => sum + (r.workingHours || 0), 0);
    const averageWorkingHours = filtered.length > 0 ? totalWorkingHours / filtered.length : 0;

    return {
      totalRecords: filtered.length,
      presentDays,
      absentDays,
      halfDays,
      onLeaveDays,
      averageWorkingHours,
    };
  }, [records, dateFilter, statusFilter]);

  // Get unique dates for filter
  const uniqueDates = useMemo(() => {
    const dates = new Set<string>();
    records.forEach((r) => {
      dates.add(new Date(r.date).toDateString());
    });
    return Array.from(dates).sort().reverse();
  }, [records]);

  // Filter records based on date and status
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (dateFilter !== 'all') {
        const recordDate = new Date(r.date).toDateString();
        const filterDate = new Date(dateFilter).toDateString();
        if (recordDate !== filterDate) return false;
      }
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      return true;
    });
  }, [records, dateFilter, statusFilter]);

  const handleRecordSelect = (record: AttendanceRecord) => {
    setSelectedRecord(record);
    if (onRecordSelect) {
      onRecordSelect(record);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      case 'half_day':
        return 'bg-yellow-100 text-yellow-800';
      case 'on_leave':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'absent':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'present':
        return 'Present';
      case 'absent':
        return 'Absent';
      case 'half_day':
        return 'Half Day';
      case 'on_leave':
        return 'On Leave';
      default:
        return status;
    }
  };

  if (records.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No attendance records available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Map Display */}
      <MapDisplay
        attendanceRecords={selectedRecord ? [selectedRecord] : filteredRecords}
        showAttendanceRecords={true}
        showGeofences={false}
        showTravelHistory={false}
        height="400px"
      />

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Total Records</p>
              <p className="text-lg font-bold">{stats.totalRecords}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Present</p>
              <p className="text-lg font-bold text-green-600">{stats.presentDays}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Absent</p>
              <p className="text-lg font-bold text-red-600">{stats.absentDays}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Half Day</p>
              <p className="text-lg font-bold text-yellow-600">{stats.halfDays}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Avg Hours</p>
              <p className="text-lg font-bold">{stats.averageWorkingHours.toFixed(1)}h</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm font-medium mb-2">Date</p>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={dateFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDateFilter('all')}
              >
                All Dates
              </Button>
              {uniqueDates.slice(0, 5).map((date) => (
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
          </div>
          <div>
            <p className="text-sm font-medium mb-2">Status</p>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('all')}
              >
                All Status
              </Button>
              {['present', 'absent', 'half_day', 'on_leave'].map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                >
                  {getStatusLabel(status)}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Records List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Attendance Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredRecords.map((record) => (
              <div
                key={record.id}
                className={`p-3 border rounded-md cursor-pointer transition-colors ${
                  selectedRecord?.id === record.id
                    ? 'bg-blue-50 border-blue-300'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => handleRecordSelect(record)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusIcon(record.status)}
                      <p className="text-sm font-medium">
                        {format(new Date(record.date), 'MMM dd, yyyy')}
                      </p>
                      <Badge className={getStatusColor(record.status)} variant="outline">
                        {getStatusLabel(record.status)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {record.checkInTime && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Check-in: {record.checkInTime}
                        </div>
                      )}
                      {record.checkOutTime && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Check-out: {record.checkOutTime}
                        </div>
                      )}
                    </div>
                  </div>
                  {record.workingHours && (
                    <div className="text-right">
                      <p className="text-sm font-medium">{Number(record.workingHours).toFixed(1)}h</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Selected Record Details */}
      {selectedRecord && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Selected Record Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Date</p>
                <p className="text-sm font-medium">
                  {format(new Date(selectedRecord.date), 'MMM dd, yyyy')}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Status</p>
                <Badge className={getStatusColor(selectedRecord.status)} variant="outline">
                  {getStatusLabel(selectedRecord.status)}
                </Badge>
              </div>
              {selectedRecord.checkInTime && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Check-in Time</p>
                  <p className="text-sm font-medium">{selectedRecord.checkInTime}</p>
                </div>
              )}
              {selectedRecord.checkOutTime && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Check-out Time</p>
                  <p className="text-sm font-medium">{selectedRecord.checkOutTime}</p>
                </div>
              )}
              {selectedRecord.workingHours && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Working Hours</p>
                  <p className="text-sm font-medium">{Number(selectedRecord.workingHours).toFixed(1)}h</p>
                </div>
              )}
            </div>

            {/* Check-in Location */}
            {selectedRecord.checkInLocation && (
              <div className="pt-3 border-t">
                <p className="text-sm font-medium mb-2">Check-in Location</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-muted-foreground">Latitude</p>
                    <p className="font-mono">{selectedRecord.checkInLocation.latitude.toFixed(6)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Longitude</p>
                    <p className="font-mono">{selectedRecord.checkInLocation.longitude.toFixed(6)}</p>
                  </div>
                  {selectedRecord.checkInLocation.accuracy && (
                    <div>
                      <p className="text-muted-foreground">Accuracy</p>
                      <p className="font-mono">{selectedRecord.checkInLocation.accuracy.toFixed(1)}m</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Check-out Location */}
            {selectedRecord.checkOutLocation && (
              <div className="pt-3 border-t">
                <p className="text-sm font-medium mb-2">Check-out Location</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-muted-foreground">Latitude</p>
                    <p className="font-mono">{selectedRecord.checkOutLocation.latitude.toFixed(6)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Longitude</p>
                    <p className="font-mono">{selectedRecord.checkOutLocation.longitude.toFixed(6)}</p>
                  </div>
                  {selectedRecord.checkOutLocation.accuracy && (
                    <div>
                      <p className="text-muted-foreground">Accuracy</p>
                      <p className="font-mono">{selectedRecord.checkOutLocation.accuracy.toFixed(1)}m</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
