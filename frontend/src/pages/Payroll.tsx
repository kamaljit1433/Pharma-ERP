import React, { useEffect, useState } from 'react';
import { usePayrollStore } from '@/store/payrollStore';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PayrollProcessing } from '@/components/payroll/PayrollProcessing';
import { PayslipViewer } from '@/components/payroll/PayslipViewer';
import { SalaryStructureTab } from '@/components/payroll/SalaryStructureTab';
import { AdvanceSalaryRequest } from '@/components/payroll/AdvanceSalaryRequest';
import { PayrollReports } from '@/components/payroll/PayrollReports';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Download, FileText, Wallet } from 'lucide-react';
import { UserRole } from '@/types/auth';
import { useToast } from '@/hooks/useToast';
import { PayrollSummary } from '@/types/payroll';

const Payroll: React.FC = () => {
  const { user } = useAuthStore();
  const { toast } = useToast();

  const {
    records,
    payslips,
    loading,
    error,
    clearError,
    fetchRecords,
    fetchPayslips,
    generatePayslip,
    downloadPayslip,
    processMonthlyPayroll,
    requestAdvanceSalary,
    exportBankFile,
  } = usePayrollStore();

  const [selectedPayslipId, setSelectedPayslipId] = useState<string | null>(null);

  const isAuthorized =
    user?.role === UserRole.SUPER_ADMIN ||
    user?.role === UserRole.FINANCE ||
    user?.role === UserRole.HR_MANAGER;

  useEffect(() => {
    if (isAuthorized) {
      fetchRecords();
      fetchPayslips();
    }
  }, [isAuthorized, fetchRecords, fetchPayslips]);

  useEffect(() => {
    if (error) {
      toast({ type: 'error', message: error });
      clearError();
    }
  }, [error, toast, clearError]);

  const handleProcessPayroll = async (month: number, year: number): Promise<PayrollSummary> => {
    try {
      const summary = await processMonthlyPayroll(month, year);
      await fetchPayslips({ month, year });
      toast({ type: 'success', message: `Payroll processed for ${month}/${year}` });
      return summary;
    } catch (err) {
      // Error message is surfaced via the store's error effect
      throw err;
    }
  };

  const handleDownloadPayslip = async (payslipId: string) => {
    try {
      const blob = await downloadPayslip(payslipId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `payslip-${payslipId}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast({ type: 'error', message: 'Failed to download payslip' });
    }
  };

  const handleExportBankFile = async (month: number, year: number, format: 'CSV' | 'NEFT') => {
    try {
      const blob = await exportBankFile(month, year, format);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `payroll-bank-${month}-${year}.${format === 'NEFT' ? 'txt' : 'csv'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast({ type: 'success', message: `${format} file exported successfully` });
    } catch {
      // Error message is surfaced via the store's error effect below
    }
  };

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              You do not have permission to access the Payroll module. Required role:{' '}
              <strong>super_admin</strong>, <strong>finance</strong>, or{' '}
              <strong>hr_manager</strong>.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Wallet className="h-8 w-8" />
            Payroll Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Process payroll, manage salary components, and generate payslips
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
          <TabsTrigger value="payslips">Payslips</TabsTrigger>
          <TabsTrigger value="salary-structure">Salary Structure</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Statutory Deductions Info */}
          <Card>
            <CardHeader>
              <CardTitle>Statutory Deductions</CardTitle>
              <CardDescription>Standard deductions applied to all employees</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Provident Fund (PF)</p>
                  <p className="text-2xl font-bold">12%</p>
                  <p className="text-xs text-muted-foreground">Employee contribution</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Employee State Insurance (ESI)
                  </p>
                  <p className="text-2xl font-bold">0.75%</p>
                  <p className="text-xs text-muted-foreground">Employee contribution</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Income Tax</p>
                  <p className="text-2xl font-bold">Slab</p>
                  <p className="text-xs text-muted-foreground">As per income tax rules</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payroll History */}
          <Card>
            <CardHeader>
              <CardTitle>Payroll History</CardTitle>
              <CardDescription>View processed payroll records and salary details</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <p className="text-muted-foreground">Loading payroll records...</p>
                </div>
              ) : records.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <p className="text-muted-foreground">No payroll records found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee ID</TableHead>
                        <TableHead>Month/Year</TableHead>
                        <TableHead>Gross Salary</TableHead>
                        <TableHead>Deductions</TableHead>
                        <TableHead>Net Salary</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {records.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium">{record.employee_id}</TableCell>
                          <TableCell>{record.month}/{record.year}</TableCell>
                          <TableCell>₹{Number(record.gross_salary ?? 0).toLocaleString()}</TableCell>
                          <TableCell>₹{Number(record.deductions ?? 0).toLocaleString()}</TableCell>
                          <TableCell className="font-semibold">
                            ₹{Number(record.net_salary ?? 0).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                record.status === 'locked'
                                  ? 'default'
                                  : record.status === 'processed'
                                    ? 'secondary'
                                    : 'outline'
                              }
                            >
                              {record.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {/* View payslip if it exists for this record */}
                            {payslips.find((p) => p.payroll_id === record.id) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const ps = payslips.find((p) => p.payroll_id === record.id);
                                  if (ps) setSelectedPayslipId(ps.id);
                                }}
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Processing Tab */}
        <TabsContent value="processing">
          <PayrollProcessing onProcess={handleProcessPayroll} isLoading={loading} />
        </TabsContent>

        {/* Payslips Tab */}
        <TabsContent value="payslips" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Generated Payslips</CardTitle>
              <CardDescription>View and download generated payslips for employees</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <p className="text-muted-foreground">Loading payslips...</p>
                </div>
              ) : payslips.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <p className="text-muted-foreground">No payslips generated yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Month/Year</TableHead>
                        <TableHead>Gross Salary</TableHead>
                        <TableHead>Net Salary</TableHead>
                        <TableHead>Generated Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payslips.map((payslip) => (
                        <TableRow key={payslip.id}>
                          <TableCell className="font-medium">
                            {payslip.employee_name || payslip.employee_id}
                          </TableCell>
                          <TableCell>{payslip.month}/{payslip.year}</TableCell>
                          <TableCell>₹{Number(payslip.gross_salary ?? 0).toLocaleString()}</TableCell>
                          <TableCell className="font-semibold">
                            ₹{Number(payslip.net_salary ?? 0).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {new Date(payslip.generated_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedPayslipId(payslip.id)}
                                title="View payslip"
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDownloadPayslip(payslip.id)}
                                title="Download payslip"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Salary Structure Tab */}
        <TabsContent value="salary-structure" className="space-y-6">
          <SalaryStructureTab />
        </TabsContent>

        {/* Reports Tab (includes advance salary) */}
        <TabsContent value="reports" className="space-y-6">
          <PayrollReports
            payrolls={records.map((r) => ({
              ...r,
              employee_name: r.employee_id,
            }))}
            onExport={handleExportBankFile}
            isLoading={loading}
          />
          <AdvanceSalaryRequest
            employeeId={user?.employeeId || ''}
            maxAmount={50000}
            onSubmit={requestAdvanceSalary}
            isLoading={loading}
          />
        </TabsContent>
      </Tabs>

      {/* Payslip Viewer Modal */}
      {selectedPayslipId && (
        <PayslipViewer
          payslipId={selectedPayslipId}
          onClose={() => setSelectedPayslipId(null)}
        />
      )}
    </div>
  );
};

export default Payroll;
