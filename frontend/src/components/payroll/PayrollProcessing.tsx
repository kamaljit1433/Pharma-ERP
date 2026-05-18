import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { Wallet, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

interface FailedEmployee {
  employeeId: string;
  reason: string;
}

interface PayrollSummary {
  total_employees: number;
  total_gross_salary: number;
  total_deductions: number;
  total_net_salary: number;
  processed_count: number;
  pending_count: number;
  failed_employees?: FailedEmployee[];
  month: number;
  year: number;
}

interface PayrollProcessingProps {
  onProcess: (month: number, year: number) => Promise<PayrollSummary>;
  isLoading?: boolean;
}

export const PayrollProcessing: React.FC<PayrollProcessingProps> = ({
  onProcess,
  isLoading = false,
}) => {
  const [month, setMonth] = useState<string>(String(new Date().getMonth() + 1));
  const [year, setYear] = useState<string>(String(new Date().getFullYear()));
  const [summary, setSummary] = useState<PayrollSummary | null>(null);
  const [processing, setProcessing] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleProcessClick = () => {
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    setConfirmOpen(false);
    setProcessing(true);
    try {
      const result = await onProcess(parseInt(month), parseInt(year));
      setSummary(result);
    } catch (error) {
      console.error('Error processing payroll:', error);
    } finally {
      setProcessing(false);
    }
  };

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: String(i + 1),
    label: new Date(2024, i).toLocaleString('en-US', { month: 'long' }),
  }));

  const years = Array.from({ length: 5 }, (_, i) => ({
    value: String(new Date().getFullYear() - i),
    label: String(new Date().getFullYear() - i),
  }));

  const processedPercentage =
    summary && summary.total_employees > 0
      ? (summary.processed_count / summary.total_employees) * 100
      : 0;

  const selectedMonthName = months.find((m) => m.value === month)?.label ?? month;

  return (
    <div className="space-y-6">
      {/* Processing Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Process Monthly Payroll
          </CardTitle>
          <CardDescription>Select month and year to process payroll for all employees</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium">Month</label>
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Year</label>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y.value} value={y.value}>
                      {y.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleProcessClick}
              disabled={processing || isLoading}
              className="gap-2"
            >
              {processing ? 'Processing...' : 'Process Payroll'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Process Payroll for {selectedMonthName} {year}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will calculate and record salaries for all active employees. If payroll has already
              been processed for this period, existing records will be recalculated (locked payrolls
              will not be modified). This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>Process Payroll</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Summary */}
      {summary && (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Total Employees</p>
              <p className="text-2xl font-bold sm:text-3xl">{summary.total_employees}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Gross Salary</p>
              <p className="text-2xl font-bold sm:text-3xl">
                {(summary.total_gross_salary / 100000).toFixed(1)}L
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Total Deductions</p>
              <p className="text-2xl font-bold sm:text-3xl">
                {(summary.total_deductions / 100000).toFixed(1)}L
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Net Salary</p>
              <p className="text-2xl font-bold sm:text-3xl">
                {(summary.total_net_salary / 100000).toFixed(1)}L
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Progress */}
      {summary && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Processing Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processed</span>
                <span className="font-medium">
                  {summary.processed_count} / {summary.total_employees}
                </span>
              </div>
              <Progress value={processedPercentage} className="h-2" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-success" />
                <div>
                  <p className="text-sm text-muted-foreground">Processed</p>
                  <p className="text-lg font-semibold">{summary.processed_count}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-warning" />
                <div>
                  <p className="text-sm text-muted-foreground">Pending / Failed</p>
                  <p className="text-lg font-semibold">{summary.pending_count}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Failed Employees */}
      {summary && summary.failed_employees && summary.failed_employees.length > 0 && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Failed Employees ({summary.failed_employees.length})
            </CardTitle>
            <CardDescription>
              Payroll could not be processed for the following employees. Fix the issues and re-run.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.failed_employees.map((f) => (
                  <TableRow key={f.employeeId}>
                    <TableCell className="font-medium font-mono text-sm">{f.employeeId}</TableCell>
                    <TableCell>
                      <Badge variant="destructive" className="font-normal">
                        {f.reason}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
