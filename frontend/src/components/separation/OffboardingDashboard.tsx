import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  FileCheck,
  Package,
  LogOut,
  RefreshCw,
  UserMinus,
} from 'lucide-react';
import { separationService, OffboardingStatus } from '../../services/separationService';

interface OffboardingDashboardProps {
  employeeId: string;
  employeeName: string;
  lastWorkingDay?: Date;
  onNavigateToTab?: (tab: string) => void;
  isHR?: boolean;
}

const ChecklistItem: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  completed: boolean;
  actionTab?: string;
  onNavigate?: (tab: string) => void;
  onAction?: () => void;
  actionLabel?: string;
}> = ({ icon, title, description, completed, actionTab, onNavigate, onAction, actionLabel }) => (
  <div className="flex items-start gap-4 p-4 border border-border rounded-lg">
    <div className={`mt-1 ${completed ? 'text-green-600' : 'text-muted-foreground'}`}>
      {completed ? <CheckCircle2 className="h-5 w-5" /> : icon}
    </div>
    <div className="flex-1">
      <p className="font-semibold">{title}</p>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
    <div className="flex items-center gap-2">
      <Badge variant={completed ? 'default' : 'secondary'}>
        {completed ? 'Done' : 'Pending'}
      </Badge>
      {!completed && actionTab && onNavigate && (
        <Button size="sm" variant="outline" onClick={() => onNavigate(actionTab)}>
          Go
        </Button>
      )}
      {!completed && onAction && (
        <Button size="sm" variant="outline" onClick={onAction}>
          {actionLabel ?? 'Action'}
        </Button>
      )}
    </div>
  </div>
);

export const OffboardingDashboard: React.FC<OffboardingDashboardProps> = ({
  employeeId,
  employeeName,
  lastWorkingDay,
  onNavigateToTab,
  isHR = false,
}) => {
  const [status, setStatus] = useState<OffboardingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deactivating, setDeactivating] = useState(false);
  const [revokingAccess, setRevokingAccess] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [noSeparation, setNoSeparation] = useState(false);

  const fetchStatus = useCallback(async () => {
    if (!employeeId) return;
    try {
      setLoading(true);
      setError(null);
      setNoSeparation(false);
      const data = await separationService.getOffboardingStatus(employeeId);
      setStatus(data);
    } catch (err: any) {
      if (err?.response?.status === 404 || err?.message?.includes('not found')) {
        setNoSeparation(true);
      } else {
        setError(err?.message || 'Failed to fetch offboarding status');
      }
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleDeactivate = async () => {
    try {
      setDeactivating(true);
      await separationService.deactivateEmployee(employeeId);
      setDeactivateDialogOpen(false);
      await fetchStatus();
    } catch (err: any) {
      setError(err?.message || 'Failed to deactivate employee');
      setDeactivateDialogOpen(false);
    } finally {
      setDeactivating(false);
    }
  };

  const handleRevokeAccess = async () => {
    try {
      setRevokingAccess(true);
      await separationService.revokeSystemAccess(employeeId);
      setRevokeDialogOpen(false);
      await fetchStatus();
    } catch (err: any) {
      setError(err?.message || 'Failed to revoke system access');
      setRevokeDialogOpen(false);
    } finally {
      setRevokingAccess(false);
    }
  };

  const handleArchive = async () => {
    try {
      setArchiving(true);
      await separationService.archiveEmployee(employeeId);
      setArchiveDialogOpen(false);
      await fetchStatus();
    } catch (err: any) {
      setError(err?.message || 'Failed to archive employee data');
      setArchiveDialogOpen(false);
    } finally {
      setArchiving(false);
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-5 w-5 animate-spin" />
            <span>Loading offboarding status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (noSeparation) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Offboarding Dashboard</CardTitle>
          <CardDescription>{employeeName}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center py-8 text-center gap-4">
            <LogOut className="h-16 w-16 text-muted-foreground/40" />
            <div>
              <p className="text-lg font-semibold">No Active Separation Process</p>
              <p className="text-muted-foreground mt-1">
                There is no ongoing offboarding process for this employee.
              </p>
            </div>
            <div className="flex gap-3 mt-2">
              <Button variant="outline" onClick={() => onNavigateToTab?.('resignation')}>
                <FileCheck className="h-4 w-4 mr-2" />
                Submit Resignation
              </Button>
              {isHR && (
                <Button variant="outline" onClick={() => onNavigateToTab?.('termination')}>
                  <UserMinus className="h-4 w-4 mr-2" />
                  Initiate Termination
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="py-8 space-y-4">
          <div className="flex items-center gap-2 p-4 bg-destructive/10 text-destructive rounded-lg">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
          <Button variant="outline" onClick={fetchStatus} className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!status) return null;

  const totalItems = 5;
  const completedItems = [
    status.exitInterviewCompleted,
    status.fnfSettlementApproved,
    status.assetsRecovered,
    status.systemAccessRevoked,
    status.dataArchived,
  ].filter(Boolean).length;

  const completionPercentage = Math.round((completedItems / totalItems) * 100);

  return (
    <div className="w-full space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Offboarding Dashboard</CardTitle>
              <CardDescription>
                {employeeName}
                {lastWorkingDay && (
                  <> &mdash; Last Working Day: {new Date(lastWorkingDay).toLocaleDateString()}</>
                )}
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchStatus}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              <div className="text-right">
                <p className="text-3xl font-bold">{completionPercentage}%</p>
                <p className="text-sm text-muted-foreground">Complete</p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {completedItems} of {totalItems} tasks completed
          </p>
        </CardContent>
      </Card>

      {/* Status Alert */}
      {status.canDeactivate ? (
        <div className="flex items-center gap-2 p-4 bg-green-50 text-green-700 border border-green-200 rounded-lg">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>All offboarding tasks completed. Employee can be deactivated.</span>
          {isHR && (
            <Button
              size="sm"
              variant="destructive"
              className="ml-auto"
              onClick={() => setDeactivateDialogOpen(true)}
              disabled={deactivating}
            >
              Deactivate Employee
            </Button>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2 p-4 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{totalItems - completedItems} task(s) remaining before deactivation</span>
        </div>
      )}

      {/* Checklist */}
      <Card>
        <CardHeader>
          <CardTitle>Offboarding Checklist</CardTitle>
          <CardDescription>
            Complete all items to finalize the employee's separation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <ChecklistItem
            icon={<FileCheck className="h-5 w-5" />}
            title="Exit Interview"
            description="Conduct and complete the exit interview with the employee"
            completed={status.exitInterviewCompleted}
            actionTab="exit-interview"
            onNavigate={onNavigateToTab}
          />
          <ChecklistItem
            icon={<FileCheck className="h-5 w-5" />}
            title="F&F Settlement"
            description="Calculate and approve the Full & Final settlement"
            completed={status.fnfSettlementApproved}
            actionTab="fnf"
            onNavigate={onNavigateToTab}
          />
          <ChecklistItem
            icon={<Package className="h-5 w-5" />}
            title="Asset Recovery"
            description="Recover all assets assigned to the employee"
            completed={status.assetsRecovered}
            actionTab="assets"
            onNavigate={onNavigateToTab}
          />
          <ChecklistItem
            icon={<LogOut className="h-5 w-5" />}
            title="System Access"
            description="Revoke all system access and credentials"
            completed={status.systemAccessRevoked}
            onAction={isHR ? () => setRevokeDialogOpen(true) : undefined}
            actionLabel="Revoke Access"
          />
          <ChecklistItem
            icon={<FileCheck className="h-5 w-5" />}
            title="Data Archive"
            description="Archive employee data for compliance and records"
            completed={status.dataArchived}
            onAction={isHR ? () => setArchiveDialogOpen(true) : undefined}
            actionLabel="Archive Data"
          />
        </CardContent>
      </Card>

      {/* Confirmation modals */}
      <Dialog open={revokeDialogOpen} onOpenChange={setRevokeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke System Access</DialogTitle>
            <DialogDescription>
              This will immediately invalidate all active sessions, refresh tokens, and block future
              logins for <span className="font-medium text-foreground">{employeeName}</span>. This
              action takes effect right away.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRevokeDialogOpen(false)} disabled={revokingAccess}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRevokeAccess} disabled={revokingAccess}>
              {revokingAccess ? 'Revoking...' : 'Revoke Access'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Archive Employee Data</DialogTitle>
            <DialogDescription>
              This will archive all records for{' '}
              <span className="font-medium text-foreground">{employeeName}</span> for compliance and
              audit purposes. Archived employees are excluded from normal queries but remain
              accessible to HR and Admin. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setArchiveDialogOpen(false)} disabled={archiving}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleArchive} disabled={archiving}>
              {archiving ? 'Archiving...' : 'Archive Data'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deactivateDialogOpen} onOpenChange={setDeactivateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deactivate Employee</DialogTitle>
            <DialogDescription>
              This will mark <span className="font-medium text-foreground">{employeeName}</span> as
              deactivated in the system. All offboarding tasks must be complete before this step.
              This action cannot be reversed without manual intervention.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeactivateDialogOpen(false)} disabled={deactivating}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeactivate} disabled={deactivating}>
              {deactivating ? 'Deactivating...' : 'Deactivate Employee'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


    </div>
  );
};
