import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { BarChart3, Download, Filter } from 'lucide-react';
import { PayrollRecord } from '../../types/payroll';

interface PayrollReportsProps {
  payrolls: PayrollRecord[];
  onExport?: (month: number, year: number, format: 'CSV' | 'NEFT') => Promise<void>;
  isLoading?: boolean;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'draft':
      return 'bg-muted text-muted-foreground';
    case 'processed':
      return 'bg-info text-info-foreground';
    case 'paid':
      return 'bg-success text-success-foreground';
    case 'locked':
      return 'bg-foreground text-background';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

export const PayrollReports: React.FC<PayrollReportsProps> = ({
  payrolls,
  onExport,
  isLoading = false,
}) => {
  const [selectedMonth, setSelectedMonth] = useState<string>(
    String(new Date().getMonth() + 1)
  );
  const [selectedYear, setSelectedYear] = useState<string>(
    String(new Date().getFullYear())
  );
  const [exporting, setExporting] = useState(false);

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: String(i + 1),
    label: new Date(2024, i).toLocaleString('en-US', { month: 'long' }),
  }));

  const years = Array.from({ length: 5 }, (_, i) => ({
    value: String(new Date().getFullYear() - i),
    label: String(new Date().getFullYear() - i),
  }));

  const filteredPayrolls = payrolls.filter(
    (p) => p.month === parseInt(selectedMonth) && p.year === parseInt(selectedYear)
  );

  const summary = {
    totalEmployees: filteredPayrolls.length,
    totalGross: filteredPayrolls.reduce((sum, p) => sum + Number(p.gross_salary), 0),
    totalDeductions: filteredPayrolls.reduce((sum, p) => sum + Number(p.total_deductions), 0),
    totalNet: filteredPayrolls.reduce((sum, p) => sum + Number(p.net_salary), 0),
    processed: filteredPayrolls.filter((p) => p.status === 'processed').length,
    paid: filteredPayrolls.filter((p) => p.status === 'paid').length,
    locked: filteredPayrolls.filter((p) => p.status === 'locked').length,
  };

  const handleExport = async (format: 'CSV' | 'NEFT') => {
    if (!onExport) return;

    setExporting(true);
    try {
      await onExport(parseInt(selectedMonth), parseInt(selectedYear), format);
    } catch (error) {
      console.error('Error exporting:', error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium">Month</label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-40">
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
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-40">
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

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('CSV')}
                disabled={exporting || isLoading || filteredPayrolls.length === 0}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('NEFT')}
                disabled={exporting || isLoading || filteredPayrolls.length === 0}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Export NEFT
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Employees</p>
            <p className="text-3xl font-bold">{summary.totalEmployees}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Gross Salary</p>
            <p className="text-2xl font-bold">
              {(summary.totalGross / 100000).toFixed(1)}L
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Deductions</p>
            <p className="text-2xl font-bold text-destructive">
              {(summary.totalDeductions / 100000).toFixed(1)}L
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Net Salary</p>
            <p className="text-2xl font-bold text-success">
              {(summary.totalNet / 100000).toFixed(1)}L
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All ({filteredPayrolls.length})</TabsTrigger>
          <TabsTrigger value="processed">Processed ({summary.processed})</TabsTrigger>
          <TabsTrigger value="locked">Locked ({summary.locked})</TabsTrigger>
          <TabsTrigger value="paid">Paid ({summary.paid})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                All Payroll Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead className="text-right">Gross Salary</TableHead>
                      <TableHead className="text-right">Deductions</TableHead>
                      <TableHead className="text-right">Net Salary</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayrolls.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          No payroll records found for the selected period.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPayrolls.map((payroll) => (
                        <TableRow key={payroll.id}>
                          <TableCell className="font-medium">
                            {payroll.employee_name}
                          </TableCell>
                          <TableCell className="text-right">
                            {Number(payroll.gross_salary).toLocaleString('en-IN', {
                              style: 'currency',
                              currency: 'INR',
                              maximumFractionDigits: 0,
                            })}
                          </TableCell>
                          <TableCell className="text-right text-destructive">
                            {Number(payroll.total_deductions).toLocaleString('en-IN', {
                              style: 'currency',
                              currency: 'INR',
                              maximumFractionDigits: 0,
                            })}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {Number(payroll.net_salary).toLocaleString('en-IN', {
                              style: 'currency',
                              currency: 'INR',
                              maximumFractionDigits: 0,
                            })}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(payroll.status)}>
                              {payroll.status.charAt(0).toUpperCase() +
                                payroll.status.slice(1)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="processed">
          <Card>
            <CardHeader>
              <CardTitle>Processed Payroll</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead className="text-right">Gross Salary</TableHead>
                      <TableHead className="text-right">Net Salary</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayrolls.filter((p) => p.status === 'processed').length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                          No processed payroll records for the selected period.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPayrolls
                        .filter((p) => p.status === 'processed')
                        .map((payroll) => (
                          <TableRow key={payroll.id}>
                            <TableCell className="font-medium">
                              {payroll.employee_name}
                            </TableCell>
                            <TableCell className="text-right">
                              {Number(payroll.gross_salary).toLocaleString('en-IN', {
                                style: 'currency',
                                currency: 'INR',
                                maximumFractionDigits: 0,
                              })}
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              {Number(payroll.net_salary).toLocaleString('en-IN', {
                                style: 'currency',
                                currency: 'INR',
                                maximumFractionDigits: 0,
                              })}
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(payroll.status)}>
                                Processed
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="locked">
          <Card>
            <CardHeader>
              <CardTitle>Locked Payroll</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead className="text-right">Gross Salary</TableHead>
                      <TableHead className="text-right">Net Salary</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayrolls.filter((p) => p.status === 'locked').length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                          No locked payroll records for the selected period.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPayrolls
                        .filter((p) => p.status === 'locked')
                        .map((payroll) => (
                          <TableRow key={payroll.id}>
                            <TableCell className="font-medium">
                              {payroll.employee_name}
                            </TableCell>
                            <TableCell className="text-right">
                              {Number(payroll.gross_salary).toLocaleString('en-IN', {
                                style: 'currency',
                                currency: 'INR',
                                maximumFractionDigits: 0,
                              })}
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              {Number(payroll.net_salary).toLocaleString('en-IN', {
                                style: 'currency',
                                currency: 'INR',
                                maximumFractionDigits: 0,
                              })}
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(payroll.status)}>
                                Locked
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="paid">
          <Card>
            <CardHeader>
              <CardTitle>Paid Payroll</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead className="text-right">Gross Salary</TableHead>
                      <TableHead className="text-right">Net Salary</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayrolls.filter((p) => p.status === 'paid').length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                          No paid payroll records for the selected period.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPayrolls
                        .filter((p) => p.status === 'paid')
                        .map((payroll) => (
                          <TableRow key={payroll.id}>
                            <TableCell className="font-medium">
                              {payroll.employee_name}
                            </TableCell>
                            <TableCell className="text-right">
                              {Number(payroll.gross_salary).toLocaleString('en-IN', {
                                style: 'currency',
                                currency: 'INR',
                                maximumFractionDigits: 0,
                              })}
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              {Number(payroll.net_salary).toLocaleString('en-IN', {
                                style: 'currency',
                                currency: 'INR',
                                maximumFractionDigits: 0,
                              })}
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(payroll.status)}>
                                Paid
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
