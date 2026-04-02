import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import { DollarSign } from 'lucide-react';
import { payrollService } from '@/services/payrollService';
import { useToast } from '@/hooks/useToast';

interface EmployeePayrollTabProps {
  employeeId: string;
}

interface PayrollRecord {
  id: string;
  month: number;
  year: number;
  gross_salary: number;
  net_salary: number;
  status: string;
  created_at?: string;
}

export const EmployeePayrollTab: React.FC<EmployeePayrollTabProps> = ({ employeeId }) => {
  const { toast } = useToast();
  const [records, setRecords] = useState<PayrollRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayrollData = async () => {
      try {
        setLoading(true);
        const data = await payrollService.getPayrollRecords({
          employee_id: employeeId,
        });
        setRecords(Array.isArray(data) ? data : data.data || []);
      } catch (error) {
        toast({
          type: 'error',
          message: 'Failed to load payroll records',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPayrollData();
  }, [employeeId, toast]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const getMonthName = (month: number) => {
    return new Date(2024, month - 1).toLocaleDateString('en-US', { month: 'long' });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Payroll Records
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Payroll Records
        </CardTitle>
        <CardDescription>Recent payroll processing records</CardDescription>
      </CardHeader>
      <CardContent>
        {records.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">No payroll records found</p>
        ) : (
          <div className="space-y-3">
            {records.map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium">
                    {getMonthName(record.month)} {record.year}
                  </p>
                  <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
                    <span>Gross: {formatCurrency(record.gross_salary)}</span>
                    <span>Net: {formatCurrency(record.net_salary)}</span>
                  </div>
                </div>
                <Badge variant="outline">
                  {record.status || 'Processed'}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
