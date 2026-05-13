import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { benefitsService } from '../../services/benefitsService';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface GratuityData {
  gratuity_amount: number;
  is_eligible: boolean;
  years_of_service: number;
}

interface GratuityCalculatorProps {
  employeeId: string;
}

export const GratuityCalculator: React.FC<GratuityCalculatorProps> = ({ employeeId }) => {
  const [lastDrawnSalary, setLastDrawnSalary] = useState('');
  const [gratuityData, setGratuityData] = useState<GratuityData | null>(null);
  const [loading, setLoading] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownloadReport = async () => {
    if (!lastDrawnSalary || parseFloat(lastDrawnSalary) <= 0) {
      setError('Please enter a valid salary amount first');
      return;
    }
    try {
      setReportLoading(true);
      setError(null);
      const response = await benefitsService.getGratuityReport(employeeId, parseFloat(lastDrawnSalary));
      const r = response.data;

      const fmt = (n: number) =>
        n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const fmtDate = (d: string | Date | undefined) =>
        d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : '—';

      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Gratuity Report – ${r.employee_name}</title>
  <style>
    body { font-family: Arial, sans-serif; color: #111; max-width: 720px; margin: 40px auto; padding: 0 24px; }
    h1 { font-size: 22px; margin-bottom: 4px; }
    .subtitle { color: #555; font-size: 13px; margin-bottom: 32px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    th, td { text-align: left; padding: 10px 12px; border: 1px solid #ddd; font-size: 14px; }
    th { background: #f5f5f5; font-weight: 600; width: 40%; }
    .highlight { background: #f0fdf4; }
    .highlight td { font-weight: 700; font-size: 16px; color: #15803d; }
    .badge { display: inline-block; padding: 2px 10px; border-radius: 9999px; font-size: 12px; font-weight: 600; }
    .eligible { background: #dcfce7; color: #166534; }
    .not-eligible { background: #f3f4f6; color: #374151; }
    .footer { margin-top: 40px; font-size: 12px; color: #888; border-top: 1px solid #eee; padding-top: 12px; }
  </style>
</head>
<body>
  <h1>Gratuity Calculation Report</h1>
  <p class="subtitle">Generated on ${fmtDate(new Date())}</p>

  <table>
    <tr><th>Employee Name</th><td>${r.employee_name}</td></tr>
    <tr><th>Employee ID</th><td>${r.employee_id_number}</td></tr>
    <tr><th>Date of Joining</th><td>${fmtDate(r.date_of_joining)}</td></tr>
    <tr><th>Date of Separation</th><td>${fmtDate(r.date_of_separation)}</td></tr>
    <tr><th>Years of Service</th><td>${r.years_of_service} year(s)</td></tr>
    <tr><th>Last Drawn Salary</th><td>₹${fmt(r.last_drawn_salary)}</td></tr>
    <tr><th>Eligibility Status</th><td>
      <span class="badge ${r.is_eligible ? 'eligible' : 'not-eligible'}">
        ${r.is_eligible ? 'Eligible' : 'Not Eligible'}
      </span>
    </td></tr>
    <tr class="highlight"><th>Gratuity Amount</th><td>₹${fmt(r.gratuity_amount)}</td></tr>
    ${r.remarks ? `<tr><th>Remarks</th><td>${r.remarks}</td></tr>` : ''}
  </table>

  <table>
    <tr><th colspan="2" style="background:#f5f5f5">Calculation Formula</th></tr>
    <tr><td colspan="2" style="font-family:monospace">(Last Salary × Years of Service × 15) ÷ 26</td></tr>
  </table>

  <div class="footer">
    This is a system-generated report. Calculation date: ${fmtDate(r.calculation_date)}.
  </div>
</body>
</html>`;

      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gratuity-report-${r.employee_id_number || employeeId}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate report');
    } finally {
      setReportLoading(false);
    }
  };

  const handleCalculate = async () => {
    if (!lastDrawnSalary || parseFloat(lastDrawnSalary) <= 0) {
      setError('Please enter a valid salary amount');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await benefitsService.calculateGratuity(
        employeeId,
        parseFloat(lastDrawnSalary)
      );
      setGratuityData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to calculate gratuity');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Gratuity Calculator</h2>

      {/* Input Card */}
      <Card>
        <CardHeader>
          <CardTitle>Calculate Your Gratuity</CardTitle>
          <CardDescription>
            Enter your last drawn salary to calculate gratuity amount
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="salary">Last Drawn Salary (₹)</Label>
              <Input
                id="salary"
                type="number"
                placeholder="Enter salary amount"
                value={lastDrawnSalary}
                onChange={(e) => setLastDrawnSalary(e.target.value)}
                min="0"
              />
            </div>

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive rounded-lg flex gap-2">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <Button onClick={handleCalculate} disabled={loading} className="w-full">
              {loading ? 'Calculating...' : 'Calculate Gratuity'}
            </Button>
            {gratuityData && (
              <Button
                variant="outline"
                onClick={handleDownloadReport}
                disabled={reportLoading}
                className="w-full"
              >
                {reportLoading ? 'Generating Report...' : 'Download Full Report'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Card */}
      {gratuityData && (
        <Card>
          <CardHeader>
            <CardTitle>Gratuity Calculation Result</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Eligibility Status */}
              <div className="p-4 rounded-lg bg-muted">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-muted-foreground">Eligibility Status</p>
                  {gratuityData.is_eligible ? (
                    <Badge className="bg-success gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Eligible
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Not Eligible
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {gratuityData.is_eligible
                    ? `You are eligible for gratuity after ${gratuityData.years_of_service} years of service`
                    : 'You need at least 5 years of service to be eligible for gratuity'}
                </p>
              </div>

              {/* Years of Service */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Years of Service
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{gratuityData.years_of_service}</p>
                  </CardContent>
                </Card>

                <Card className="border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Last Drawn Salary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">₹{parseFloat(lastDrawnSalary).toLocaleString()}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Gratuity Amount */}
              <div className="p-4 rounded-lg bg-success/10 border border-success">
                <p className="text-sm font-medium text-muted-foreground mb-1">Gratuity Amount</p>
                <p className="text-3xl font-bold text-success">
                  ₹{gratuityData.gratuity_amount.toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>

              {/* Formula Info */}
              <div className="p-3 bg-muted rounded-lg text-sm">
                <p className="font-medium mb-1">Calculation Formula:</p>
                <p className="text-muted-foreground font-mono">
                  (Last Salary × Years of Service × 15) ÷ 26
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
