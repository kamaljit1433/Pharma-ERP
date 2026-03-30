import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { benefitsService } from '../../services/benefitsService';
import { Download } from 'lucide-react';

interface PFDetails {
  account: {
    pf_account_number: string;
    opening_balance: number;
    current_balance: number;
  };
  contributions: Array<{
    month: number;
    year: number;
    basic_salary: number;
    employee_contribution: number;
    employer_contribution: number;
  }>;
  balance: number;
}

interface PFStatementProps {
  employeeId: string;
}

export const PFStatement: React.FC<PFStatementProps> = ({ employeeId }) => {
  const [pfDetails, setPFDetails] = useState<PFDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [fromMonth, setFromMonth] = useState(1);
  const [fromYear, setFromYear] = useState(new Date().getFullYear());
  const [toMonth, setToMonth] = useState(12);
  const [toYear, setToYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchPFDetails();
  }, [employeeId]);

  const fetchPFDetails = async () => {
    try {
      setLoading(true);
      const response = await benefitsService.getPFDetails(employeeId);
      setPFDetails(response.data);
    } catch (error) {
      console.error('Failed to fetch PF details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateStatement = async () => {
    try {
      const response = await benefitsService.getPFStatement(
        employeeId,
        fromMonth,
        fromYear,
        toMonth,
        toYear
      );
      // Handle statement generation (could download PDF or display)
      console.log('Statement generated:', response.data);
    } catch (error) {
      console.error('Failed to generate statement:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading PF details...</div>;
  }

  if (!pfDetails) {
    return <div className="text-center py-8">No PF account found</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">PF Statement</h2>

      {/* Account Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              PF Account Number
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold font-mono">{pfDetails.account.pf_account_number}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Opening Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">₹{pfDetails.account.opening_balance.toLocaleString()}</p>
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
          <Button onClick={handleGenerateStatement} className="gap-2">
            <Download className="w-4 h-4" />
            Generate Statement
          </Button>
        </CardContent>
      </Card>

      {/* Contributions Table */}
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
                      {(contrib.employee_contribution + contrib.employer_contribution).toLocaleString()}
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
