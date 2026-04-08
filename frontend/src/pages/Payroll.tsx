import React, { useEffect, useState } from 'react';
import { usePayrollStore } from '@/store/payrollStore';
import { useAuthStore } from '@/store/authStore';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PayrollProcessing } from '@/components/payroll/PayrollProcessing';
import { PayslipViewer } from '@/components/payroll/PayslipViewer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Download, FileText, Wallet } from 'lucide-react';
import { UserRole } from '@/types/auth';

const Payroll: React.FC = () => {
  const { user } = useAuthStore();
  const {
    records,
    payslips,
    loading,
    error,
    fetchRecords,
    generatePayslip,
    downloadPayslip,
    processMonthlyPayroll,
  } = usePayrollStore();

  const [selectedPayslip, setSelectedPayslip] = useState<string | null>(null);
  const [downloadingPayslipId, setDownloadingPayslipId] = useState<string | null>(null);

  // Check authorization
  const isAuthorized = user?.role === UserRole.FINANCE || user?.role === UserRole.HR_MANAGER;

  useEffect(() => {
    if (isAuthorized) {
      fetchRecords();
    }
  }, [isAuthorized, fetchRecords]);

  const handleDownloadPayslip = async (payslipId: string) => {
    try {
      setDownloadingPayslipId(payslipId);
      const blob = await downloadPayslip(payslipId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `payslip-${payslipId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading payslip:', err);
    } finally {
      setDownloadingPayslipId(null);
    }
  };

  const handleProcessPayroll = async (month: number, year: number) => {
    try {
      await processMonthlyPayroll(month, year);
      await fetchRecords();
    } catch (err) {
      console.error('Error processing payroll:', err);
    }
  };

  if (!isAuthorized) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                Access Denied
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                You do not have permission to access the Payroll module. Only Finance and HR roles can access this section.
              </p>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
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

        {/* Error Alert */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="h-5 w-5" />
                <p>{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="processing">Processing</TabsTrigger>
            <TabsTrigger value="payslips">Payslips</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Salary Details Card */}
            <Card>
              <CardHeader>
                <CardTitle>Payroll History</CardTitle>
                <CardDescription>
                  View processed payroll records and salary details
                </CardDescription>
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
                            <TableCell>
                              {record.month}/{record.year}
                            </TableCell>
                            <TableCell>₹{record.gross_salary.toLocaleString()}</TableCell>
                            <TableCell>₹{record.deductions.toLocaleString()}</TableCell>
                            <TableCell className="font-semibold">
                              ₹{record.net_salary.toLocaleString()}
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
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedPayslip(record.id)}
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Statutory Deductions Info */}
            <Card>
              <CardHeader>
                <CardTitle>Statutory Deductions</CardTitle>
                <CardDescription>
                  Standard deductions applied to all employees
                </CardDescription>
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
          </TabsContent>

          {/* Processing Tab */}
          <TabsContent value="processing">
            <PayrollProcessing
              onProcess={handleProcessPayroll}
              isLoading={loading}
            />
          </TabsContent>

          {/* Payslips Tab */}
          <TabsContent value="payslips" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Generated Payslips</CardTitle>
                <CardDescription>
                  View and download generated payslips for employees
                </CardDescription>
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
                            <TableCell>
                              {payslip.month}/{payslip.year}
                            </TableCell>
                            <TableCell>₹{payslip.gross_salary.toLocaleString()}</TableCell>
                            <TableCell className="font-semibold">
                              ₹{payslip.net_salary.toLocaleString()}
                            </TableCell>
                            <TableCell>
                              {new Date(payslip.generated_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDownloadPayslip(payslip.id)}
                                disabled={downloadingPayslipId === payslip.id}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payslip Viewer */}
            {selectedPayslip && (
              <PayslipViewer
                payslipId={selectedPayslip}
                onClose={() => setSelectedPayslip(null)}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Payroll;
