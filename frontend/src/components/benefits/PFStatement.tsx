import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { benefitsService } from '../../services/benefitsService';
import { Download, AlertCircle } from 'lucide-react';

interface PFContribution {
  month: number;
  year: number;
  basic_salary: number;
  employee_contribution: number;
  employer_contribution: number;
}

interface PFDetails {
  account: {
    pf_number: string;
    current_balance: number;
  };
  contributions: PFContribution[];
  balance: number;
}

interface PFStatementProps {
  employeeId: string;
}

export const PFStatement: React.FC<PFStatementProps> = ({ employeeId }) => {
  const [pfDetails, setPFDetails] = useState<PFDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [fromMonth, setFromMonth] = useState(1);
  const [fromYear, setFromYear] = useState(new Date().getFullYear());
  const [toMonth, setToMonth] = useState(12);
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
    } catch (error) {
      setFetchError('Failed to fetch PF details. Please try again.');
      console.error('Failed to fetch PF details:', error);
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
        employeeId,
        fromMonth,
        fromYear,
        toMonth,
        toYear
      );
      setGeneratedStatement(response.data?.contributions || []);
    } catch (error) {
      setStatementError('Failed to generate statement. Please try again.');
      console.error('Failed to generate statement:', error);
    } finally {
      setStatementLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading PF details...</div>;
  }

  if (fetchError) {
    return (
      <div className="p-4 bg-destructive/10 border border-destructive rounded-lg flex gap-2 items-start">
        <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
        <p className="text-sm text-destructive">{fetchError}</p>
      </div>
    );
  }

  if (!pfDetails || !pfDetails.account) {
    return <div className="text-center py-8">No PF account found. Contact HR to set up your PF account.</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">PF Statement</h2>

      {/* Account Summary */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              PF Account Number
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold font-mono">{pfDetails.account.pf_number}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Current Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-success">
              ₹{pfDetails.account.current_balance.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Statement Generator */}
      <Card>
        <CardHeader>
          <CardTitle>Generate Statement</CardTitle>
          <CardDescription>Select date range for your PF statement</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div>
              <Label htmlFor="fromMonth">From Month</Label>
              <Input
                id="fromMonth"
                type="number"
                min="1"
                max="12"
                value={fromMonth}
                onChange={(e) => setFromMonth(parseInt(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="fromYear">From Year</Label>
              <Input
                id="fromYear"
                type="number"
                value={fromYear}
                onChange={(e) => setFromYear(parseInt(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="toMonth">To Month</Label>
              <Input
                id="toMonth"
                type="number"
                min="1"
                max="12"
                value={toMonth}
                onChange={(e) => setToMonth(parseInt(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="toYear">To Year</Label>
              <Input
                id="toYear"
                type="number"
                value={toYear}
                onChange={(e) => setToYear(parseInt(e.target.value))}
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
              Statement: {fromMonth}/{fromYear} — {toMonth}/{toYear}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {generatedStatement.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No contributions found for the selected period
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2">Month/Year</th>
                      <th className="text-right py-2 px-2">Basic Salary</th>
                      <th className="text-right py-2 px-2">Employee Contribution</th>
                      <th className="text-right py-2 px-2">Employer Contribution</th>
                      <th className="text-right py-2 px-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {generatedStatement.map((contrib, idx) => (
                      <tr key={idx} className="border-b hover:bg-muted/50">
                        <td className="py-2 px-2">
                          {contrib.month}/{contrib.year}
                        </td>
                        <td className="text-right py-2 px-2">
                          ₹{contrib.basic_salary.toLocaleString()}
                        </td>
                        <td className="text-right py-2 px-2">
                          ₹{contrib.employee_contribution.toLocaleString()}
                        </td>
                        <td className="text-right py-2 px-2">
                          ₹{contrib.employer_contribution.toLocaleString()}
                        </td>
                        <td className="text-right py-2 px-2 font-medium">
                          ₹
                          {(
                            contrib.employee_contribution + contrib.employer_contribution
                          ).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recent Contributions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Contributions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2">Month/Year</th>
                  <th className="text-right py-2 px-2">Basic Salary</th>
                  <th className="text-right py-2 px-2">Employee Contribution</th>
                  <th className="text-right py-2 px-2">Employer Contribution</th>
                  <th className="text-right py-2 px-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {pfDetails.contributions.slice(0, 12).map((contrib, idx) => (
                  <tr key={idx} className="border-b hover:bg-muted/50">
                    <td className="py-2 px-2">
                      {contrib.month}/{contrib.year}
                    </td>
                    <td className="text-right py-2 px-2">
                      ₹{contrib.basic_salary.toLocaleString()}
                    </td>
                    <td className="text-right py-2 px-2">
                      ₹{contrib.employee_contribution.toLocaleString()}
                    </td>
                    <td className="text-right py-2 px-2">
                      ₹{contrib.employer_contribution.toLocaleString()}
                    </td>
                    <td className="text-right py-2 px-2 font-medium">
                      ₹
                      {(
                        contrib.employee_contribution + contrib.employer_contribution
                      ).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
