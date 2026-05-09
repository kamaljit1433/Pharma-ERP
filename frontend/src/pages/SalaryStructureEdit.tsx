import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SalaryStructureForm } from '@/components/payroll/SalaryStructureForm';
import { payrollService } from '@/services/payrollService';
import { usePayrollStore } from '@/store/payrollStore';
import { useToast } from '@/hooks/useToast';
import { SalaryStructure } from '@/types/payroll';

const SalaryStructureEdit: React.FC = () => {
  const { employeeId } = useParams<{ employeeId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { configureSalaryStructure, loading } = usePayrollStore();

  const [structure, setStructure] = useState<SalaryStructure | null>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!employeeId) return;
    payrollService
      .getSalaryStructure(employeeId)
      .then((res) => {
        const data = res?.data ?? res;
        setStructure(data ?? null);
      })
      .catch(() => setStructure(null))
      .finally(() => setFetching(false));
  }, [employeeId]);

  const handleSubmit = async (data: any) => {
    await configureSalaryStructure({ ...data, employee_id: employeeId });
    toast({ type: 'success', message: 'Salary structure saved successfully' });
    navigate('/payroll');
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground">
        Loading…
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Edit Salary Structure</h1>
      </div>

      <SalaryStructureForm
        employeeId={employeeId ?? ''}
        employeeName={structure?.employee_name}
        initialData={
          structure?.base_salary != null
            ? {
                salary_mode: structure.salary_mode,
                base_salary: structure.base_salary,
                hra: structure.hra,
                dearness_allowance: structure.dearness_allowance,
                other_allowances: structure.other_allowances,
                pf_contribution_rate: structure.pf_contribution_rate,
                esi_contribution_rate: structure.esi_contribution_rate,
                professional_tax: structure.professional_tax,
              }
            : undefined
        }
        onSubmit={handleSubmit}
        isLoading={loading}
      />
    </div>
  );
};

export default SalaryStructureEdit;
