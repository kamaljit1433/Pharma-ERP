import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { AlertCircle, Wallet } from 'lucide-react';

interface AdvanceSalaryRequestProps {
  employeeId: string;
  maxAmount: number;
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
}

export const AdvanceSalaryRequest: React.FC<AdvanceSalaryRequestProps> = ({
  employeeId,
  maxAmount,
  onSubmit,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    amount: '',
    reason: '',
    deduction_months: '1',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    const amount = parseFloat(formData.amount);

    if (!formData.amount || amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (amount > maxAmount) {
      newErrors.amount = `Amount cannot exceed ${maxAmount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}`;
    }

    if (!formData.reason || formData.reason.trim().length === 0) {
      newErrors.reason = 'Please provide a reason for the advance';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit({
        employee_id: employeeId,
        amount: parseFloat(formData.amount),
        reason: formData.reason,
        deduction_months: parseInt(formData.deduction_months),
      });

      setSubmitted(true);
      setFormData({ amount: '', reason: '', deduction_months: '1' });

      // Reset submitted state after 3 seconds
      setTimeout(() => setSubmitted(false), 3000);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const monthlyDeduction = formData.amount
    ? (parseFloat(formData.amount) / parseInt(formData.deduction_months)).toFixed(2)
    : '0';

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Request Advance Salary
        </CardTitle>
        <CardDescription>
          Request an advance on your salary to be deducted in future payrolls
        </CardDescription>
      </CardHeader>
      <CardContent>
        {submitted ? (
          <div className="bg-success/10 border border-success/20 rounded-lg p-4 text-center">
            <p className="text-success font-medium">Request submitted successfully!</p>
            <p className="text-sm text-muted-foreground mt-1">
              Your advance request is pending approval
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Max Amount Info */}
            <div className="bg-muted p-4 rounded-lg flex gap-3">
              <AlertCircle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium">Maximum Available</p>
                <p className="text-muted-foreground">
                  {maxAmount.toLocaleString('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                    maximumFractionDigits: 0,
                  })}
                </p>
              </div>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                placeholder="10000"
                value={formData.amount}
                onChange={handleChange}
                className={errors.amount ? 'border-red-500' : ''}
              />
              {errors.amount && <p className="text-sm text-red-500">{errors.amount}</p>}
            </div>

            {/* Deduction Months */}
            <div className="space-y-2">
              <Label htmlFor="deduction_months">Deduction Period (Months)</Label>
              <select
                id="deduction_months"
                name="deduction_months"
                value={formData.deduction_months}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1} month{i + 1 > 1 ? 's' : ''}
                  </option>
                ))}
              </select>
              {formData.amount && (
                <p className="text-xs text-muted-foreground">
                  Monthly deduction: {monthlyDeduction}
                </p>
              )}
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <Label htmlFor="reason">Reason *</Label>
              <Textarea
                id="reason"
                name="reason"
                placeholder="Please provide a reason for requesting advance salary"
                value={formData.reason}
                onChange={handleChange}
                className={errors.reason ? 'border-red-500' : ''}
                rows={4}
              />
              {errors.reason && <p className="text-sm text-red-500">{errors.reason}</p>}
            </div>

            {/* Summary */}
            {formData.amount && (
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Requested Amount</span>
                  <span className="font-medium">
                    {parseFloat(formData.amount).toLocaleString('en-IN', {
                      style: 'currency',
                      currency: 'INR',
                      maximumFractionDigits: 0,
                    })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Deduction Period</span>
                  <span className="font-medium">{formData.deduction_months} month(s)</span>
                </div>
                <div className="border-t pt-2 flex justify-between text-sm font-semibold">
                  <span>Monthly Deduction</span>
                  <span>{monthlyDeduction}</span>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-2 justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Submitting...' : 'Submit Request'}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
};
