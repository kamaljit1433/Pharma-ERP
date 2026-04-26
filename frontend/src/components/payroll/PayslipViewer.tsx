import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Download, Receipt } from 'lucide-react';
import { usePayrollStore } from '../../store/payrollStore';
import { Payslip } from '../../types/payroll';

interface PayslipViewerProps {
  payslipId: string;
  onClose: () => void;
}

export const PayslipViewer: React.FC<PayslipViewerProps> = ({ payslipId, onClose }) => {
  const { fetchPayslipById, downloadPayslip } = usePayrollStore();
  const [payslip, setPayslip] = useState<Payslip | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsFetching(true);
    fetchPayslipById(payslipId).then((data) => {
      if (!cancelled) {
        setPayslip(data);
        setIsFetching(false);
      }
    });
    return () => { cancelled = true; };
  }, [payslipId, fetchPayslipById]);

  const handleDownload = async () => {
    if (!payslip) return;
    setIsDownloading(true);
    try {
      const blob = await downloadPayslip(payslip.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `payslip-${(payslip as any).payslip_number || payslip.id}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading payslip:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const monthYear = payslip
    ? new Date(payslip.year, payslip.month - 1).toLocaleString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : '';

  const earnings = payslip ? ((payslip as any).earnings as Record<string, number> | undefined) : undefined;
  const deductions = payslip ? ((payslip as any).deductions as Record<string, number> | undefined) : undefined;

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Payslip Details
          </DialogTitle>
          {payslip && (
            <DialogDescription>
              {payslip.employee_name || payslip.employee_id} • {monthYear}
            </DialogDescription>
          )}
        </DialogHeader>

        {isFetching ? (
          <div className="py-8 text-center text-muted-foreground">Loading payslip...</div>
        ) : !payslip ? (
          <div className="py-8 text-center text-muted-foreground">Payslip not found.</div>
        ) : (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Payslip Number</p>
                <Badge variant="outline">{(payslip as any).payslip_number || payslip.id}</Badge>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                disabled={isDownloading}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                {isDownloading ? 'Downloading...' : 'Download'}
              </Button>
            </div>

            {/* Earnings */}
            {earnings && Object.keys(earnings).length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Earnings</h3>
                <div className="space-y-2">
                  {Object.entries(earnings).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</span>
                      <span className="font-medium">
                        {(value as number).toLocaleString('en-IN', {
                          style: 'currency',
                          currency: 'INR',
                          maximumFractionDigits: 0,
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Deductions */}
            {deductions && Object.keys(deductions).length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Deductions</h3>
                <div className="space-y-2">
                  {Object.entries(deductions).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</span>
                      <span className="font-medium text-destructive">
                        {(value as number).toLocaleString('en-IN', {
                          style: 'currency',
                          currency: 'INR',
                          maximumFractionDigits: 0,
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Summary */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between font-semibold">
                <span>Gross Salary</span>
                <span>
                  {payslip.gross_salary.toLocaleString('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                    maximumFractionDigits: 0,
                  })}
                </span>
              </div>
              <div className="flex justify-between font-semibold text-destructive">
                <span>Total Deductions</span>
                <span>
                  {(payslip.gross_salary - payslip.net_salary).toLocaleString('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                    maximumFractionDigits: 0,
                  })}
                </span>
              </div>
              <div className="flex justify-between font-bold text-lg text-success">
                <span>Net Salary</span>
                <span>
                  {payslip.net_salary.toLocaleString('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                    maximumFractionDigits: 0,
                  })}
                </span>
              </div>
            </div>

            <div className="text-xs text-muted-foreground text-right">
              Generated on {new Date(payslip.generated_at).toLocaleDateString('en-IN')}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
