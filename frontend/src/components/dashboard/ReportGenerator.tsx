import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Loader2, Download, Eye } from 'lucide-react';
import { ReportFilter, ReportData } from '../../types/dashboard';
import { dashboardService } from '../../services/dashboardService';

interface ReportGeneratorProps {
  reportType: 'employee' | 'attendance' | 'leave' | 'payroll' | 'performance' | 'training';
  title: string;
  description: string;
}

export default function ReportGenerator({ reportType, title, description }: ReportGeneratorProps) {
  const [filter, setFilter] = useState<ReportFilter>({
    limit: 1000,
    offset: 0,
  });
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateReport = async (format: 'json' | 'csv' = 'json') => {
    try {
      setLoading(true);
      setError(null);

      let data;
      switch (reportType) {
        case 'employee':
          data = await dashboardService.generateEmployeeReport(filter, format);
          break;
        case 'attendance':
          data = await dashboardService.generateAttendanceReport(filter, format);
          break;
        case 'leave':
          data = await dashboardService.generateLeaveReport(filter, format);
          break;
        case 'payroll':
          data = await dashboardService.generatePayrollReport(filter, format);
          break;
        case 'performance':
          data = await dashboardService.generatePerformanceReport(filter, format);
          break;
        case 'training':
          data = await dashboardService.generateTrainingReport(filter, format);
          break;
      }

      if (format === 'csv' && data instanceof Blob) {
        dashboardService.downloadReport(data, `${reportType}-report.csv`);
      } else {
        setReportData(data as ReportData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate report');
      console.error('Report generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <Input
                type="date"
                value={filter.startDate ? filter.startDate.toISOString().split('T')[0] : ''}
                onChange={(e) =>
                  setFilter({
                    ...filter,
                    startDate: e.target.value ? new Date(e.target.value) : undefined,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">End Date</label>
              <Input
                type="date"
                value={filter.endDate ? filter.endDate.toISOString().split('T')[0] : ''}
                onChange={(e) =>
                  setFilter({
                    ...filter,
                    endDate: e.target.value ? new Date(e.target.value) : undefined,
                  })
                }
              />
            </div>

            {(reportType === 'employee' || reportType === 'leave' || reportType === 'payroll') && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={filter.status || ''} onValueChange={(value) => setFilter({ ...filter, status: value || undefined })}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All statuses</SelectItem>
                    {reportType === 'employee' && (
                      <>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="on_leave">On Leave</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                        <SelectItem value="resigned">Resigned</SelectItem>
                        <SelectItem value="terminated">Terminated</SelectItem>
                      </>
                    )}
                    {reportType === 'leave' && (
                      <>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </>
                    )}
                    {reportType === 'payroll' && (
                      <>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="processed">Processed</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="locked">Locked</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Limit</label>
              <Input
                type="number"
                min="1"
                max="10000"
                value={filter.limit || 1000}
                onChange={(e) =>
                  setFilter({
                    ...filter,
                    limit: parseInt(e.target.value) || 1000,
                  })
                }
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={() => handleGenerateReport('json')}
              disabled={loading}
              variant="default"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Eye className="mr-2 h-4 w-4" />
                  View Report
                </>
              )}
            </Button>

            <Button
              onClick={() => handleGenerateReport('csv')}
              disabled={loading}
              variant="outline"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Display */}
      {reportData && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Report Results</CardTitle>
                <CardDescription>
                  {reportData.totalRows} records found
                </CardDescription>
              </div>
              <Badge variant="secondary">
                Generated: {new Date(reportData.generatedAt).toLocaleString()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    {reportData.rows.length > 0 &&
                      Object.keys(reportData.rows[0]).map((key) => (
                        <th key={key} className="text-left py-2 px-4 font-medium">
                          {key}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {reportData.rows.slice(0, 50).map((row, index) => (
                    <tr key={index} className="border-b hover:bg-muted/50">
                      {Object.values(row).map((value, cellIndex) => (
                        <td key={cellIndex} className="py-2 px-4">
                          {value instanceof Date
                            ? value.toLocaleDateString()
                            : typeof value === 'boolean'
                            ? value
                              ? 'Yes'
                              : 'No'
                            : value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {reportData.rows.length > 50 && (
                <p className="text-xs text-muted-foreground mt-4">
                  Showing 50 of {reportData.totalRows} records. Download CSV to see all records.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
