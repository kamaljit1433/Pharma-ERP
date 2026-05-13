import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { OffboardingDashboard } from '../components/separation/OffboardingDashboard';
import { ResignationForm } from '../components/separation/ResignationForm';
import { TerminationForm } from '../components/separation/TerminationForm';
import { ExitInterviewForm } from '../components/separation/ExitInterviewForm';
import { FnFCalculation } from '../components/separation/FnFCalculation';
import { AssetRecoveryChecklist } from '../components/separation/AssetRecoveryChecklist';
import { EmployeeSearch } from '../components/performance/EmployeeSearch';
import { UserRole } from '../types/auth';
import { separationService } from '../services/separationService';
import { useToast } from '../hooks/useToast';
import { Employee } from '../services/employeeService';
import { LogOut, FileText, UserX, MessageSquare, Calculator, Package, Search } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { X } from 'lucide-react';

const Separation: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  if (!user) return null;

  const isHR = user.role === UserRole.HR_MANAGER || user.role === UserRole.SUPER_ADMIN;
  const isFinance = user.role === UserRole.FINANCE || isHR;

  // HR operates on the searched employee; others operate on themselves
  const activeEmployeeId = isHR ? (selectedEmployee?.id ?? '') : (user.employeeId ?? '');
  const activeEmployeeName = isHR
    ? (selectedEmployee ? `${selectedEmployee.first_name} ${selectedEmployee.last_name}` : '')
    : (user.email ?? '');

  const handleSubmitResignation = async (data: any) => {
    setIsSubmitting(true);
    try {
      await separationService.submitResignation(activeEmployeeId, data);
      toast({ type: 'success', message: 'Resignation submitted successfully' });
      setActiveTab('overview');
    } catch (err: any) {
      toast({ type: 'error', message: err?.message || 'Failed to submit resignation' });
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInitiateTermination = async (targetEmployeeId: string, data: any) => {
    setIsSubmitting(true);
    try {
      await separationService.initiateTermination(targetEmployeeId, data);
      toast({ type: 'success', message: 'Termination initiated successfully' });
      setActiveTab('overview');
    } catch (err: any) {
      toast({ type: 'error', message: err?.message || 'Failed to initiate termination' });
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleScheduleExitInterview = async (date: Date) => {
    setIsSubmitting(true);
    try {
      await separationService.scheduleExitInterview(activeEmployeeId, date);
      toast({ type: 'success', message: 'Exit interview scheduled successfully' });
    } catch (err: any) {
      toast({ type: 'error', message: err?.message || 'Failed to schedule exit interview' });
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitExitInterview = async (interviewId: string, data: any) => {
    setIsSubmitting(true);
    try {
      await separationService.submitExitInterview(interviewId, data);
      toast({ type: 'success', message: 'Exit interview submitted successfully' });
      setActiveTab('overview');
    } catch (err: any) {
      toast({ type: 'error', message: err?.message || 'Failed to submit exit interview' });
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateFnF = async (fnfId: string, data: any) => {
    setIsSubmitting(true);
    try {
      await separationService.updateFnFSettlement(fnfId, data);
      toast({ type: 'success', message: 'Settlement updated' });
    } catch (err: any) {
      toast({ type: 'error', message: err?.message || 'Failed to update settlement' });
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApproveFnF = async (fnfId: string, approvedBy: string) => {
    setIsSubmitting(true);
    try {
      await separationService.approveFnFSettlement(fnfId, approvedBy);
      toast({ type: 'success', message: 'F&F settlement approved successfully' });
    } catch (err: any) {
      toast({ type: 'error', message: err?.message || 'Failed to approve settlement' });
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkFnFPaid = async (fnfId: string) => {
    setIsSubmitting(true);
    try {
      await separationService.markFnFAsPaid(fnfId);
      toast({ type: 'success', message: 'Settlement marked as paid' });
    } catch (err: any) {
      toast({ type: 'error', message: err?.message || 'Failed to mark as paid' });
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitFnFForApproval = async (fnfId: string) => {
    setIsSubmitting(true);
    try {
      await separationService.submitFnFForApproval(fnfId);
      toast({ type: 'success', message: 'Settlement submitted for approval' });
    } catch (err: any) {
      toast({ type: 'error', message: err?.message || 'Failed to submit for approval' });
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateAssetStatus = async (
    assetRecoveryId: string,
    status: string,
    damageCost?: number
  ) => {
    setIsSubmitting(true);
    try {
      await separationService.updateAssetRecoveryStatus(assetRecoveryId, status, damageCost);
      toast({ type: 'success', message: 'Asset status updated successfully' });
    } catch (err: any) {
      toast({ type: 'error', message: err?.message || 'Failed to update asset status' });
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabCount = isHR ? 6 : 5;
  const gridCols = tabCount === 6 ? 'grid-cols-6' : 'grid-cols-5';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Separation Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage employee offboarding, resignations, and full &amp; final settlements
        </p>
      </div>

      {/* HR employee selector — shown once, used across all tabs */}
      {isHR && (
        <Card>
          <CardContent className="pt-4 pb-4">
            {selectedEmployee ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <span className="font-medium">
                      {selectedEmployee.first_name} {selectedEmployee.last_name}
                    </span>
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {selectedEmployee.employee_id}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedEmployee(null);
                    setActiveTab('overview');
                  }}
                >
                  <X className="h-4 w-4 mr-1" />
                  Change employee
                </Button>
              </div>
            ) : (
              <EmployeeSearch
                label="Select employee to manage"
                placeholder="Search by name or employee ID..."
                onChange={(_, emp) => {
                  if (emp) {
                    setSelectedEmployee(emp);
                    setActiveTab('overview');
                  }
                }}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Require HR to select an employee before showing tabs */}
      {isHR && !selectedEmployee ? (
        <div className="flex flex-col items-center py-16 text-center gap-3 text-muted-foreground">
          <Search className="h-10 w-10 opacity-30" />
          <p className="text-lg font-medium">No employee selected</p>
          <p className="text-sm">Search for an employee above to manage their separation process.</p>
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className={`grid w-full ${gridCols}`}>
            <TabsTrigger value="overview" className="flex items-center gap-1.5">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="resignation" className="flex items-center gap-1.5">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Resignation</span>
            </TabsTrigger>
            {isHR && (
              <TabsTrigger value="termination" className="flex items-center gap-1.5">
                <UserX className="h-4 w-4" />
                <span className="hidden sm:inline">Termination</span>
              </TabsTrigger>
            )}
            <TabsTrigger value="exit-interview" className="flex items-center gap-1.5">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Exit Interview</span>
            </TabsTrigger>
            <TabsTrigger value="fnf" className="flex items-center gap-1.5">
              <Calculator className="h-4 w-4" />
              <span className="hidden sm:inline">F&amp;F Settlement</span>
            </TabsTrigger>
            <TabsTrigger value="assets" className="flex items-center gap-1.5">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Assets</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <OffboardingDashboard
              employeeId={activeEmployeeId}
              employeeName={activeEmployeeName}
              onNavigateToTab={setActiveTab}
              isHR={isHR}
            />
          </TabsContent>

          <TabsContent value="resignation" className="mt-6">
            <ResignationForm
              employeeId={activeEmployeeId}
              onSubmit={handleSubmitResignation}
              onCancel={() => setActiveTab('overview')}
              isLoading={isSubmitting}
            />
          </TabsContent>

          {isHR && (
            <TabsContent value="termination" className="mt-6">
              <TerminationForm
                onSubmit={handleInitiateTermination}
                onCancel={() => setActiveTab('overview')}
                isLoading={isSubmitting}
                initialEmployee={selectedEmployee}
              />
            </TabsContent>
          )}

          <TabsContent value="exit-interview" className="mt-6">
            <ExitInterviewForm
              employeeId={activeEmployeeId}
              onSchedule={handleScheduleExitInterview}
              onSubmit={handleSubmitExitInterview}
              isLoading={isSubmitting}
              isHR={isHR}
            />
          </TabsContent>

          <TabsContent value="fnf" className="mt-6">
            <FnFCalculation
              employeeId={activeEmployeeId}
              onUpdate={isFinance ? handleUpdateFnF : undefined}
              onApprove={isFinance ? handleApproveFnF : undefined}
              onMarkPaid={isFinance ? handleMarkFnFPaid : undefined}
              onSubmitForApproval={handleSubmitFnFForApproval}
              isLoading={isSubmitting}
            />
          </TabsContent>

          <TabsContent value="assets" className="mt-6">
            <AssetRecoveryChecklist
              employeeId={activeEmployeeId}
              onUpdateStatus={isHR ? handleUpdateAssetStatus : undefined}
              isLoading={isSubmitting}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default Separation;
