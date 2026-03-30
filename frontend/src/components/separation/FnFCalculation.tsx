import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

interface FnFSettlement {
  id: string;
  employee_id: string;
  pending_salary: number;
  leave_encashment: number;
  gratuity: number;
  bonus: number;
  other_benefits: number;
  total_earnings: number;
  advance_deduction: number;
  asset_damage_deduction: number;
  other_deductions: number;
  total_deductions: number;
  net_settlement: number;
  status: 'draft' | 'pending_approval' | 'approved' | 'paid';
  approved_by?: string;
  approved_at?: Date;
  paid_at?: Date;
}

interface FnFCalculationProps {
  employeeId: string;
  onApprove?: (fnfId: string, approvedBy: string) => Promise<void>;
  isLoading?: boolean;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
};

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'draft':
      return 'bg-muted text-muted-foreground';
    case 'pending_approval':
      return 'bg-warning text-warning-foreground';
    case 'approved':
      return 'bg-approved text-approved-foreground';
    case 'paid':
      return 'bg-success text-success-foreground';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

export const FnFCalculation: React.FC<FnFCalculationProps> = ({
  employeeId,
  onApprove,
  isLoading = false,
}) => {
  const [fnfSettlement, setFnfSettlement] = useState<FnFSettlement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approveLoading, setApproveLoading] = useState(false);
  const [approvedBy, setApprovedBy] = useState('');

  useEffect(() => {
    const fetchFnFSettlement = async () => {
      try {
        setLoading(true);
        // This would be replaced with actual API call
        // const response = await fetch(`/api/v1/separation/${employeeId}/fnf`);
        // const data = await response.json();
        // setFnfSettlement(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch F&F settlement');
      } finally {
        setLoading(false);
      }
    };

    fetchFnFSettlement();
  }, [employeeId]);

  const handleApprove = async () => {
    if (!fnfSettlement || !approvedBy) {
      setError('Please enter your employee ID');
      return;
    }

    try {
      setApproveLoading(true);
      if (onApprove) {
        await onApprove(fnfSettlement.id, approvedBy);
        setApprovedBy('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve F&F settlement');
    } finally {
      setApproveLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="w-full max-w-4xl">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!fnfSettlement) {
    return (
      <Card className="w-full max-w-4xl">
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">No F&F settlement found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Full & Final Settlement</CardTitle>
            <CardDescription>Employee ID: {employeeId}</CardDescription>
          </div>
          <Badge className={getStatusColor(fnfSettlement.status)}>
            {fnfSettlement.status.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-md">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Earnings Section */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">Earnings</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex justify-between p-2 bg-muted rounded">
              <span className="text-sm">Pending Salary</span>
              <span className="font-semibold">{formatCurrency(fnfSettlement.pending_salary)}</span>
            </div>
            <div className="flex justify-between p-2 bg-muted rounded">
              <span className="text-sm">Leave Encashment</span>
              <span className="font-semibold">{formatCurrency(fnfSettlement.leave_encashment)}</span>
            </div>
            <div className="flex justify-between p-2 bg-muted rounded">
              <span className="text-sm">Gratuity</span>
              <span className="font-semibold">{formatCurrency(fnfSettlement.gratuity)}</span>
            </div>
            <div className="flex justify-between p-2 bg-muted rounded">
              <span className="text-sm">Bonus</span>
              <span className="font-semibold">{formatCurrency(fnfSettlement.bonus)}</span>
            </div>
            <div className="flex justify-between p-2 bg-muted rounded">
              <span className="text-sm">Other Benefits</span>
              <span className="font-semibold">{formatCurrency(fnfSettlement.other_benefits)}</span>
            </div>
          </div>
          <div className="flex justify-between p-3 bg-success/10 rounded-md font-semibold">
            <span>Total Earnings</span>
            <span className="text-success">{formatCurrency(fnfSettlement.total_earnings)}</span>
          </div>
        </div>

        {/* Deductions Section */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">Deductions</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex justify-between p-2 bg-muted rounded">
              <span className="text-sm">Advance Deduction</span>
              <span className="font-semibold">{formatCurrency(fnfSettlement.advance_deduction)}</span>
            </div>
            <div className="flex justify-between p-2 bg-muted rounded">
              <span className="text-sm">Asset Damage</span>
              <span className="font-semibold">{formatCurrency(fnfSettlement.asset_damage_deduction)}</span>
            </div>
            <div className="flex justify-between p-2 bg-muted rounded">
              <span className="text-sm">Other Deductions</span>
              <span className="font-semibold">{formatCurrency(fnfSettlement.other_deductions)}</span>
            </div>
          </div>
          <div className="flex justify-between p-3 bg-destructive/10 rounded-md font-semibold">
            <span>Total Deductions</span>
            <span className="text-destructive">{formatCurrency(fnfSettlement.total_deductions)}</span>
          </div>
        </div>

        {/* Net Settlement */}
        <div className="flex justify-between p-4 bg-primary/10 rounded-lg font-bold text-lg">
          <span>Net Settlement Amount</span>
          <span className="text-primary">{formatCurrency(fnfSettlement.net_settlement)}</span>
        </div>

        {/* Approval Section */}
        {fnfSettlement.status === 'draft' && (
          <div className="space-y-3 p-4 bg-muted rounded-lg">
            <h3 className="font-semibold">Approve Settlement</h3>
            <input
              type="text"
              placeholder="Your Employee ID (Finance/Payroll)"
              value={approvedBy}
              onChange={(e) => setApprovedBy(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md"
            />
            <Button onClick={handleApprove} disabled={approveLoading || !approvedBy} className="w-full">
              {approveLoading ? 'Approving...' : 'Approve Settlement'}
            </Button>
          </div>
        )}

        {fnfSettlement.status === 'approved' && fnfSettlement.approved_by && (
          <div className="flex items-center gap-2 p-3 bg-success/10 text-success rounded-md">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-sm">
              Approved by {fnfSettlement.approved_by} on{' '}
              {fnfSettlement.approved_at
                ? new Date(fnfSettlement.approved_at).toLocaleDateString()
                : 'N/A'}
            </span>
          </div>
        )}

        {fnfSettlement.status === 'paid' && (
          <div className="flex items-center gap-2 p-3 bg-success/10 text-success rounded-md">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-sm">
              Settlement paid on{' '}
              {fnfSettlement.paid_at ? new Date(fnfSettlement.paid_at).toLocaleDateString() : 'N/A'}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
