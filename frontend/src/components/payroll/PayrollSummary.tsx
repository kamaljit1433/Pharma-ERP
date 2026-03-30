import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { DollarSign, TrendingDown, TrendingUp } from 'lucide-react';

interface PayrollData {
  id: string;
  employee_id: string;
  month: number;
  year: number;
  gross_salary: number;
  net_salary: number;
  total_deductions: number;
  status: 'draft' | 'processed' | 'paid' | 'locked';
  processed_at?: Date;
  paid_at?: Date;
}

interface PayrollSummaryProps {
  payroll: PayrollData;
  employeeName?: string;
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

export const PayrollSummary: React.FC<PayrollSummaryProps> = ({
  payroll,
  employeeName,
}) => {
  const deductionPercentage = (payroll.total_deductions / payroll.gross_salary) * 100;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Payroll Summary
            </CardTitle>
            <CardDescription>
              {employeeName} • {new Date(2024, payroll.month - 1).toLocaleString('en-US', { month: 'long', year: 'numeric' })}
            </CardDescription>
          </div>
          <Badge className={getStatusColor(payroll.status)}>
            {payroll.status.charAt(0).toUpperCase() + payroll.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Figures */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Gross Salary</p>
            <p className="text-3xl font-bold">
              {payroll.gross_salary.toLocaleString('en-IN', {
                style: 'currency',
                currency: 'INR',
                maximumFractionDigits: 0,
              })}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <TrendingDown className="h-4 w-4" />
              Total Deductions
            </p>
            <p className="text-3xl font-bold text-destructive">
              {payroll.total_deductions.toLocaleString('en-IN', {
                style: 'currency',
                currency: 'INR',
                maximumFractionDigits: 0,
              })}
            </p>
            <p className="text-xs text-muted-foreground">
              {deductionPercentage.toFixed(1)}% of gross
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              Net Salary
            </p>
            <p className="text-3xl font-bold text-success">
              {payroll.net_salary.toLocaleString('en-IN', {
                style: 'currency',
                currency: 'INR',
                maximumFractionDigits: 0,
              })}
            </p>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-3 border-t pt-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Processed</span>
            {payroll.processed_at ? (
              <span className="font-medium">
                {new Date(payroll.processed_at).toLocaleDateString('en-IN')}
              </span>
            ) : (
              <span className="text-muted-foreground">Pending</span>
            )}
          </div>

          {payroll.paid_at && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Paid</span>
              <span className="font-medium">
                {new Date(payroll.paid_at).toLocaleDateString('en-IN')}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
