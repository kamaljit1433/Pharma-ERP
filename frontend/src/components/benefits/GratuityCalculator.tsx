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
  const [error, setError] = useState<string | null>(null);

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
