import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEmployeeStore } from '@/store/employeeStore';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/useToast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Edit2, Save, X } from 'lucide-react';
import { UserRole } from '@/types/auth';
import { EmployeeDetails } from '@/components/employee/EmployeeDetails';
import { EmergencyContactForm } from '@/components/employee/EmergencyContactForm';
import { EmployeeForm } from '@/components/employee/EmployeeForm';
import { EmployeeAttendanceTab } from '@/components/employee/EmployeeAttendanceTab';
import { EmployeeLeaveTab } from '@/components/employee/EmployeeLeaveTab';
import { EmployeePayrollTab } from '@/components/employee/EmployeePayrollTab';
import { EmployeeDocumentsTab } from '@/components/employee/EmployeeDocumentsTab';
import { EmployeeHistoryTab } from '@/components/employee/EmployeeHistoryTab';

export const EmployeeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthStore();
  const { currentItem: employee, loading, fetchItem, updateItem } = useEmployeeStore();

  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Check if user can edit employees (HR Manager or Super Admin)
  const canEditEmployee =
    user?.role === UserRole.HR_MANAGER || user?.role === UserRole.SUPER_ADMIN;

  // Fetch employee on mount
  useEffect(() => {
    if (id) {
      fetchItem(id);
    }
  }, [id, fetchItem]);

  const handleEditToggle = () => {
    if (isEditMode) {
      setIsEditMode(false);
    } else if (canEditEmployee) {
      setIsEditMode(true);
    }
  };

  const handleSaveEmployee = async (formData: any) => {
    if (!id) return;

    setIsSaving(true);
    try {
      await updateItem(id, formData);
      toast({
        type: 'success',
        message: 'Employee updated successfully',
      });
      setIsEditMode(false);
    } catch (error) {
      toast({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to update employee',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditMode(false);
  };

  if (loading && !employee) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate('/employees')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32 mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate('/employees')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Employee not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate('/employees')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Employees
        </Button>
        {canEditEmployee && (
          <div className="flex gap-2">
            {isEditMode ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleEditToggle}
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Edit Mode */}
      {isEditMode ? (
        <EmployeeForm
          employee={employee}
          onSubmit={handleSaveEmployee}
          onCancel={handleCancel}
          isLoading={isSaving}
        />
      ) : (
        /* View Mode - Tabs */
        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="personal">Personal</TabsTrigger>
            <TabsTrigger value="employment">Employment</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="related">Related Records</TabsTrigger>
          </TabsList>

          {/* Personal Tab */}
          <TabsContent value="personal" className="space-y-4">
            <EmployeeDetails employee={employee} />
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Emergency Contacts</CardTitle>
              </CardHeader>
              <CardContent>
                <EmergencyContactForm employeeId={employee.id} readOnly={!isEditMode} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Employment Tab */}
          <TabsContent value="employment">
            <EmployeeDetails employee={employee} />
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <EmployeeDocumentsTab employeeId={employee.id} />
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <EmployeeHistoryTab employeeId={employee.id} />
          </TabsContent>

          {/* Related Records Tab */}
          <TabsContent value="related" className="space-y-6">
            <EmployeeAttendanceTab employeeId={employee.id} />
            <EmployeeLeaveTab employeeId={employee.id} />
            <EmployeePayrollTab employeeId={employee.id} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default EmployeeDetail;
