/**
 * Attendance Reports Component
 * Displays attendance reports with export functionality
 * Supports CSV, Excel, PDF export formats
 * Requirements: 7.10, 26.1, 26.2, 26.3
 */

import React, { useState, useEffect } from 'react';
import { useAttendanceStore } from '../../store/attendanceStore';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { AlertCircle, Download, Loader2, FileText, Calendar } from 'lucide-react';
import attendanceService from '../../services/attendanceService';
import {
  exportData,
  formatAttendanceForExport,
  openPrintWindow,
  downloadBlob,
  generateFilename,
} from '../../utils/exportUtils';

interface AttendanceReportsProps {
  employeeId?: string;
  fromDate?: string;
  toDate?: string;
}

export const AttendanceReports: React.FC<AttendanceReportsProps> = ({
  employeeId,
  fromDate: initialFromDate,
  toDate: initialToDate,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exportProgress, setExportProgress] = useState<number | null>(null);
  const [fromDate, setFromDate] = useState(initialFromDate || '');
  const [toDate, setToDate] = useState(initialToDate || '');
  const [records, setRecords] = useState<any[]>([]);
  const [recordsLoaded, setRecordsLoaded] = useState(false);
  const { stats } = useAttendanceStore();

  // Load attendance records when dates change
  useEffect(() => {
    if (fromDate && toDate && employeeId) {
      loadRecords();
    }
  }, [fromDate, toDate, employeeId]);

  const loadRecords = async () => {
    try {
      setError(null);
      setIsLoading(true);
      const filters = {
        employee_id: employeeId,
        from_date: fromDate,
        to_date: toDate,
      };
      const data = await attendanceService.getRecords(filters);
      setRecords(data);
      setRecordsLoaded(true);
    } catch (err: any) {
      setError(err.message || 'Failed to load attendance records');
      setRecords([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    try {
      setError(null);
      setExportProgress(0);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setExportProgress((prev) => {
          if (prev === null) return 10;
          if (prev >= 90) return 90;
          return prev + Math.random() * 30;
        });
      }, 300);

      // Format data for export (includes filtered data)
      const formattedData = formatAttendanceForExport(records);

      // Generate export blob (PDF returns null — print window handles it)
      const filename = generateFilename('attendance-report', format);
      const blob = await exportData(
        formattedData,
        format,
        filename,
        {
          title: `Attendance Report (${fromDate} to ${toDate})`,
          sheetName: 'Attendance',
        }
      );

      clearInterval(progressInterval);
      setExportProgress(100);

      // PDF opens a print window — no blob to download
      if (blob) {
        downloadBlob(blob, filename);
      }

      // Reset progress after 2 seconds
      setTimeout(() => {
        setExportProgress(null);
      }, 2000);
    } catch (err: any) {
      const errorMsg = err.message || `Failed to export as ${format.toUpperCase()}`;
      setError(errorMsg);
      setExportProgress(null);
    }
  };

  const handlePrint = () => {
    const formattedData = formatAttendanceForExport(records);
    openPrintWindow(formattedData, {
      title: `Attendance Report (${fromDate} to ${toDate})`,
      sheetName: 'Attendance',
    });
  };

  return (
    <div className="space-y-6">
      {/* Date Filter Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Report Period
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="from-date">From Date</Label>
              <Input
                id="from-date"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="to-date">To Date</Label>
              <Input
                id="to-date"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {recordsLoaded && records.length > 0
              ? `Showing ${records.length} attendance records`
              : 'Select date range to view records'}
          </p>
        </CardContent>
      </Card>

      {/* Export Options Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Export Attendance Report
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="flex gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Export your attendance records in your preferred format. The export will include all
              filtered data from the selected date range.
            </p>

            {/* Export Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button
                onClick={() => handleExport('csv')}
                disabled={isLoading || !recordsLoaded || records.length === 0}
                variant="outline"
                className="gap-2"
              >
                {exportProgress !== null && isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {Math.round(exportProgress)}%
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Export as CSV
                  </>
                )}
              </Button>

              <Button
                onClick={() => handleExport('excel')}
                disabled={isLoading || !recordsLoaded || records.length === 0}
                variant="outline"
                className="gap-2"
              >
                {exportProgress !== null && isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {Math.round(exportProgress)}%
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Export as Excel
                  </>
                )}
              </Button>

              <Button
                onClick={() => handleExport('pdf')}
                disabled={isLoading || !recordsLoaded || records.length === 0}
                variant="outline"
                className="gap-2"
              >
                {exportProgress !== null && isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {Math.round(exportProgress)}%
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Export as PDF
                  </>
                )}
              </Button>
            </div>

            {/* Print Button */}
            <Button
              onClick={handlePrint}
              disabled={isLoading || !recordsLoaded || records.length === 0}
              variant="secondary"
              className="w-full gap-2"
            >
              <FileText className="w-4 h-4" />
              Print Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Summary */}
      {stats && recordsLoaded && records.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Report Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Total Working Days</p>
                <p className="text-2xl font-bold">{stats.total_days}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Present</p>
                <p className="text-2xl font-bold text-success">{stats.present_days}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Absent</p>
                <p className="text-2xl font-bold text-destructive">{stats.absent_days}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Avg Hours/Day</p>
                <p className="text-2xl font-bold">
                  {stats.average_working_hours.toFixed(1)}h
                </p>
              </div>
            </div>

            {/* Attendance Percentage */}
            <div className="mt-6 space-y-2">
              <p className="text-sm font-medium">Attendance Percentage</p>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-success h-2 rounded-full transition-all"
                  style={{
                    width: `${((stats.present_days / stats.total_days) * 100).toFixed(1)}%`,
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {((stats.present_days / stats.total_days) * 100).toFixed(1)}% attendance
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Export Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Export Format Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <p className="font-medium mb-1">CSV Format</p>
            <p className="text-muted-foreground">
              Comma-separated values format. Compatible with Excel, Google Sheets, and other
              spreadsheet applications. Best for data analysis and manipulation.
            </p>
          </div>
          <div>
            <p className="font-medium mb-1">Excel Format</p>
            <p className="text-muted-foreground">
              Microsoft Excel format (.xlsx). Includes formatting and is optimized for spreadsheet
              applications. Supports formulas and advanced features.
            </p>
          </div>
          <div>
            <p className="font-medium mb-1">PDF Format</p>
            <p className="text-muted-foreground">
              Portable Document Format. Best for sharing and printing. Includes summary statistics
              and maintains formatting across all devices.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
