import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { benefitsService } from '../../services/benefitsService';
import { Download, AlertCircle } from 'lucide-react';

interface PFContribution {
  month: number;
  year: number;
  basic_salary: number;
  employee_contribution: number;
  employer_contribution: number;
  total_contribution?: number;
}

interface PFDetails {
  account: {
    pf_number: string;
    current_balance: number;
  } | null;
  contributions: PFContribution[];
  balance: number;
}

interface PFStatementProps {
  employeeId: string;
}

const MONTHS = [
  { value: 1, label: 'January' }, { value: 2, label: 'February' },
  { value: 3, label: 'March' }, { value: 4, label: 'April' },
  { value: 5, label: 'May' }, { value: 6, label: 'June' },
  { value: 7, label: 'July' }, { value: 8, label: 'August' },
  { value: 9, label: 'September' }, { value: 10, label: 'October' },
  { value: 11, label: 'November' }, { value: 12, label: 'December' },
];

const currency = (n: number | undefined) =>
  `₹${Number(n ?? 0).toLocaleString()}`;

export const PFStatement: React.FC<PFStatementProps> = ({ employeeId }) => {
  const [pfDetails, setPFDetails] = useState<PFDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [fromMonth, setFromMonth] = useState(1);
  const [fromYear, setFromYear] = useState(new Date().getFullYear());
  const [toMonth, setToMonth] = useState(new Date().getMonth() + 1);
  const [toYear, setToYear] = useState(new Date().getFullYear());
  const [statementLoading, setStatementLoading] = useState(false);
  const [statementError, setStatementError] = useState<string | null>(null);
  const [generatedStatement, setGeneratedStatement] = useState<PFContribution[] | null>(null);

  useEffect(() => {
    if (employeeId) fetchPFDetails();
  }, [employeeId]);

  const fetchPFDetails = async () => {
    try {
      setLoading(true);
      setFetchError(null);
      const response = await benefitsService.getPFDetails(employeeId);
      setPFDetails(response.data);
    } catch (error: any) {
      setFetchError(error.response?.data?.message || 'Failed to fetch PF details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateStatement = async () => {
    try {
      setStatementLoading(true);
      setStatementError(null);
      setGeneratedStatement(null);
      const response = await benefitsService.getPFStatement(
        employeeId, fromMonth, fromYear, toMonth, toYear
      );
      setGeneratedStatement(response.data?.contributions || []);
    } catch (error: any) {
      setStatementError(error.response?.data?.message || 'Failed to generate statement. Please try again.');
    } finally {
      setStatementLoading(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading PF details...</div>;

  if (fetchError) {
    return (
      <div className="p-4 bg-destructive/10 border border-destructive rounded-lg flex gap-2 items-start">
        <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
        <p className="text-sm text-destructive">{fetchError}</p>
      </div>
    );
  }

  if (!pfDetails || !pfDetails.account) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No PF account found. Contact HR to set up your PF account.
      </div>
    );
  }

  const contributions: PFContribution[] = pfDetails.contributions || [];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">PF Statement</h2>

      {/* Account Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">PF Account Number</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold font-mono">
              {pfDetails.account.pf_number || '—'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Current Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {currency(pfDetails.account.current_balance)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Statement Generator */}
      <Card>
        <CardHeader>
          <CardTitle>Generate Statement</CardTitle>
          <CardDescription>Select a date range to view contributions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            <div>
              <Label>From Month</Label>
              <Select value={String(fromMonth)} onValueChange={(v: string) => setFromMonth(Number(v))}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m) => (
                    <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="fromYear">From Year</Label>
              <Input
                id="fromYear"
                type="number"
                min="2000"
                max={new Date().getFullYear()}
                value={fromYear}
                onChange={(e) => setFromYear(parseInt(e.target.value) || fromYear)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>To Month</Label>
              <Select value={String(toMonth)} onValueChange={(v: string) => setToMonth(Number(v))}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m) => (
                    <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="toYear">To Year</Label>
              <Input
                id="toYear"
                type="number"
                min="2000"
                max={new Date().getFullYear()}
                value={toYear}
                onChange={(e) => setToYear(parseInt(e.target.value) || toYear)}
                className="mt-1"
              />
            </div>
          </div>

          {statementError && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive rounded-lg flex gap-2 items-center">
              <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
              <p className="text-sm text-destructive">{statementError}</p>
            </div>
          )}

          <Button onClick={handleGenerateStatement} disabled={statementLoading} className="gap-2">
            <Download className="w-4 h-4" />
            {statementLoading ? 'Generating...' : 'Generate Statement'}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Statement */}
      {generatedStatement !== null && (
        <Card>
          <CardHeader>
            <CardTitle>
              Statement: {MONTHS[fromMonth - 1]?.label} {fromYear} — {MONTHS[toMonth - 1]?.label} {toYear}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {generatedStatement.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No contributions found for the selected period
              </p>
            ) : (
              <ContributionTable contributions={generatedStatement} />
            )}
          </CardContent>
        </Card>
      )}

      {/* Recent Contributions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Contributions</CardTitle>
        </CardHeader>
        <CardContent>
          {contributions.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No contributions recorded yet</p>
          ) : (
            <ContributionTable contributions={contributions.slice(0, 12)} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const ContributionTable: React.FC<{ contributions: PFContribution[] }> = ({ contributions }) => {
  const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2 px-2">Month / Year</th>
            <th className="text-right py-2 px-2">Basic Salary</th>
            <th className="text-right py-2 px-2">Employee</th>
            <th className="text-right py-2 px-2">Employer</th>
            <th className="text-right py-2 px-2">Total</th>
          </tr>
        </thead>
        <tbody>
          {contributions.map((c, idx) => (
            <tr key={idx} className="border-b hover:bg-muted/50">
              <td className="py-2 px-2">{MONTH_NAMES[(c.month ?? 1) - 1]} {c.year}</td>
              <td className="text-right py-2 px-2">₹{Number(c.basic_salary ?? 0).toLocaleString()}</td>
              <td className="text-right py-2 px-2">₹{Number(c.employee_contribution ?? 0).toLocaleString()}</td>
              <td className="text-right py-2 px-2">₹{Number(c.employer_contribution ?? 0).toLocaleString()}</td>
              <td className="text-right py-2 px-2 font-medium">
                ₹{Number((c.employee_contribution ?? 0) + (c.employer_contribution ?? 0)).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
