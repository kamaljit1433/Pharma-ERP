import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEmployeeStore } from '@/store/employeeStore';
import { useToast } from '@/hooks/useToast';
import { EmployeeForm } from '@/components/employee/EmployeeForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const EmployeeCreate: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createItem } = useEmployeeStore();
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (formData: any) => {
    setIsSaving(true);
    try {
      const newEmployee = await createItem(formData);
      toast({ type: 'success', message: 'Employee created successfully' });
      navigate(`/employees/${newEmployee.id}`);
    } catch (error) {
      toast({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to create employee',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/employees')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Employees
        </Button>
      </div>
      <EmployeeForm
        onSubmit={handleSubmit}
        onCancel={() => navigate('/employees')}
        isLoading={isSaving}
      />
    </div>
  );
};

export default EmployeeCreate;
