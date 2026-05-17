import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';
import { SalaryStructureList } from './SalaryStructureList';
import { SalaryStructureForm } from './SalaryStructureForm';
import { payrollService } from '@/services/payrollService';
import { useToast } from '@/hooks/useToast';
import { SalaryStructure } from '@/types/payroll';

export const SalaryStructureTab: React.FC = () => {
  const { toast } = useToast();
  const [selected, setSelected] = useState<SalaryStructure | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSelect = (row: SalaryStructure) => {
    setSelected(row);
  };

  const handleBack = () => {
    setSelected(null);
  };

  const handleSubmit = async (data: any) => {
    setSaving(true);
    try {
      const employeeId = selected?.employee_uuid ?? selected?.employee_id ?? '';
      await payrollService.configureSalaryStructure({ ...data, employee_id: employeeId });
      toast({ type: 'success', message: 'Salary structure saved successfully' });
      setSelected(null);
    } catch (err) {
      toast({ type: 'error', message: err instanceof Error ? err.message : 'Failed to save salary structure' });
    } finally {
      setSaving(false);
    }
  };

  if (selected) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to list
        </Button>
        <SalaryStructureForm
          employeeId={selected.employee_uuid ?? selected.employee_id ?? ''}
          employeeName={selected.employee_name}
          initialData={
            selected.base_salary != null
              ? {
                  salary_mode: selected.salary_mode,
                  base_salary: selected.base_salary,
                  hra: selected.hra,
                  dearness_allowance: selected.dearness_allowance,
                  other_allowances: selected.other_allowances,
                  pf_contribution_rate: selected.pf_contribution_rate,
                  esi_contribution_rate: selected.esi_contribution_rate,
                  professional_tax: selected.professional_tax,
                }
              : undefined
          }
          onSubmit={handleSubmit}
          isLoading={saving}
        />
      </div>
    );
  }

  return <SalaryStructureList onSelect={handleSelect} />;
};
