import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Download, Receipt, Eye } from 'lucide-react';

interface PayslipData {
  id: string;
  payroll_id: string;
  employee_id: string;
  month: number;
  year: number;
  payslip_number: string;
  file_url?: string;
  earnings?: Record<string, number>;
  deductions?: Record<string, number>;
  gross_salary: number;
  net_salary: number;
  generated_at: Date;
}

interface PayslipViewerProps {
  payslip: PayslipData;
  employeeName?: string;
  onDownload?: (payslipId: string) => Promise<void>;
}

export const PayslipViewer: React.FC<PayslipViewerProps> = ({
  payslip,
  employeeName,
  onDownload,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!onDownload) return;

    setIsDownloading(true);
    try {
      await onDownload(payslip.id);
    } catch (error) {
      console.error('Error downloading payslip:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const monthYear = new Date(2024, payslip.month - 1).toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Payslip
              </CardTitle>
              <CardDescription>
                {employeeName} • {monthYear}
              </CardDescription>
            </div>
            <Badge variant="outline">{payslip.payslip_number}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Gross Salary</p>
              <p className="text-lg font-semibold">
                {payslip.gross_salary.toLocaleString('en-IN', {
                  style: 'currency',
                  currency: 'INR',
                  maximumFractionDigits: 0,
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Deductions</p>
              <p className="text-lg font-semibold text-destructive">
                {(payslip.gross_salary - payslip.net_salary).toLocaleString('en-IN', {
                  style: 'currency',
                  currency: 'INR',
                  maximumFractionDigits: 0,
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Net Salary</p>
              <p className="text-lg font-semibold text-success">
                {payslip.net_salary.toLocaleString('en-IN', {
                  style: 'currency',
                  currency: 'INR',
                  maximumFractionDigits: 0,
                })}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsOpen(true)}
              className="gap-2"
            >
              <Eye className="h-4 w-4" />
              View Details
            </Button>
            {payslip.file_url && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                disabled={isDownloading}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                {isDownloading ? 'Downloading...' : 'Download PDF'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Payslip Details</DialogTitle>
            <DialogDescription>
              {employeeName} • {monthYear}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Earnings */}
            {payslip.earnings && Object.keys(payslip.earnings).length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Earnings</h3>
                <div className="space-y-2">
                  {Object.entries(payslip.earnings).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{key}</span>
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
            {payslip.deductions && Object.keys(payslip.deductions).length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Deductions</h3>
                <div className="space-y-2">
                  {Object.entries(payslip.deductions).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{key}</span>
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

            {/* Generated Date */}
            <div className="text-xs text-muted-foreground text-right">
              Generated on {new Date(payslip.generated_at).toLocaleDateString('en-IN')}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
