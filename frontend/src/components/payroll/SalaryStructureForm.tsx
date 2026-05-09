import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { DollarSign } from 'lucide-react';

interface SalaryStructureFormProps {
  employeeId: string;
  employeeName?: string;
  initialData?: {
    salary_mode?: string;
    base_salary?: number;
    hra?: number;
    dearness_allowance?: number;
    other_allowances?: number;
    pf_contribution_rate?: number;
    esi_contribution_rate?: number;
    professional_tax?: number;
  };
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
}

export const SalaryStructureForm: React.FC<SalaryStructureFormProps> = ({
  employeeId,
  employeeName,
  initialData,
  onSubmit,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    employee_id: employeeId,
    salary_mode: initialData?.salary_mode ?? 'monthly',
    base_salary: initialData?.base_salary != null ? String(initialData.base_salary) : '',
    hra: initialData?.hra != null ? String(initialData.hra) : '',
    dearness_allowance: initialData?.dearness_allowance != null ? String(initialData.dearness_allowance) : '',
    other_allowances: initialData?.other_allowances != null ? String(initialData.other_allowances) : '',
    pf_contribution_rate: initialData?.pf_contribution_rate != null ? String(initialData.pf_contribution_rate) : '12',
    esi_contribution_rate: initialData?.esi_contribution_rate != null ? String(initialData.esi_contribution_rate) : '0.75',
    professional_tax: initialData?.professional_tax != null ? String(initialData.professional_tax) : '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

    if (!formData.employee_id || formData.employee_id.trim().length === 0) {
      newErrors.employee_id = 'Employee ID is required';
    }

    if (!formData.base_salary || parseFloat(formData.base_salary) <= 0) {
      newErrors.base_salary = 'Base salary must be greater than 0';
    }

    if (parseFloat(formData.pf_contribution_rate) < 0 || parseFloat(formData.pf_contribution_rate) > 100) {
      newErrors.pf_contribution_rate = 'PF rate must be between 0 and 100';
    }

    if (parseFloat(formData.esi_contribution_rate) < 0 || parseFloat(formData.esi_contribution_rate) > 100) {
      newErrors.esi_contribution_rate = 'ESI rate must be between 0 and 100';
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
        ...formData,
        base_salary: parseFloat(formData.base_salary),
        hra: parseFloat(formData.hra) || 0,
        dearness_allowance: parseFloat(formData.dearness_allowance) || 0,
        other_allowances: parseFloat(formData.other_allowances) || 0,
        pf_contribution_rate: parseFloat(formData.pf_contribution_rate),
        esi_contribution_rate: parseFloat(formData.esi_contribution_rate),
        professional_tax: parseFloat(formData.professional_tax) || 0,
        effective_from: new Date(),
      });
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const grossSalary =
    (parseFloat(formData.base_salary) || 0) +
    (parseFloat(formData.hra) || 0) +
    (parseFloat(formData.dearness_allowance) || 0) +
    (parseFloat(formData.other_allowances) || 0);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          {employeeName ? `Salary Structure — ${employeeName}` : 'Configure Salary Structure'}
        </CardTitle>
        <CardDescription>Set up salary components and deduction rates</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Employee ID */}
          <div className="space-y-2">
            <Label htmlFor="employee_id">Employee ID *</Label>
            <Input
              id="employee_id"
              name="employee_id"
              type="text"
              placeholder="Enter employee ID"
              value={formData.employee_id}
              onChange={handleChange}
              className={errors.employee_id ? 'border-red-500' : ''}
            />
            {errors.employee_id && <p className="text-sm text-red-500">{errors.employee_id}</p>}
          </div>

          {/* Salary Mode */}
          <div className="space-y-2">
            <Label htmlFor="salary_mode">Salary Mode</Label>
            <Select value={formData.salary_mode} onValueChange={(value) => setFormData((prev) => ({ ...prev, salary_mode: value }))}>
              <SelectTrigger id="salary_mode">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly Fixed</SelectItem>
                <SelectItem value="daily">Daily Rate</SelectItem>
                <SelectItem value="hourly">Hourly Rate</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Salary Components */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="base_salary">Base Salary *</Label>
              <Input
                id="base_salary"
                name="base_salary"
                type="number"
                placeholder="50000"
                value={formData.base_salary}
                onChange={handleChange}
                className={errors.base_salary ? 'border-red-500' : ''}
              />
              {errors.base_salary && <p className="text-sm text-red-500">{errors.base_salary}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="hra">HRA</Label>
              <Input
                id="hra"
                name="hra"
                type="number"
                placeholder="10000"
                value={formData.hra}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dearness_allowance">Dearness Allowance</Label>
              <Input
                id="dearness_allowance"
                name="dearness_allowance"
                type="number"
                placeholder="5000"
                value={formData.dearness_allowance}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="other_allowances">Other Allowances</Label>
              <Input
                id="other_allowances"
                name="other_allowances"
                type="number"
                placeholder="2000"
                value={formData.other_allowances}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Gross Salary Display */}
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">Gross Salary</p>
            <p className="text-2xl font-bold">{grossSalary.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</p>
          </div>

          {/* Deduction Rates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pf_contribution_rate">PF Contribution Rate (%)</Label>
              <Input
                id="pf_contribution_rate"
                name="pf_contribution_rate"
                type="number"
                step="0.01"
                placeholder="12"
                value={formData.pf_contribution_rate}
                onChange={handleChange}
                className={errors.pf_contribution_rate ? 'border-red-500' : ''}
              />
              {errors.pf_contribution_rate && <p className="text-sm text-red-500">{errors.pf_contribution_rate}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="esi_contribution_rate">ESI Contribution Rate (%)</Label>
              <Input
                id="esi_contribution_rate"
                name="esi_contribution_rate"
                type="number"
                step="0.01"
                placeholder="0.75"
                value={formData.esi_contribution_rate}
                onChange={handleChange}
                className={errors.esi_contribution_rate ? 'border-red-500' : ''}
              />
              {errors.esi_contribution_rate && <p className="text-sm text-red-500">{errors.esi_contribution_rate}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="professional_tax">Professional Tax</Label>
              <Input
                id="professional_tax"
                name="professional_tax"
                type="number"
                placeholder="200"
                value={formData.professional_tax}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-2 justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Salary Structure'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
