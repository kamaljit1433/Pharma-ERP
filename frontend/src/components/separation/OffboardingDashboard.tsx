import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { AlertCircle, CheckCircle2, Clock, FileCheck, Package, LogOut } from 'lucide-react';

interface OffboardingStatus {
  canDeactivate: boolean;
  missingItems: string[];
  exitInterviewCompleted: boolean;
  fnfSettlementApproved: boolean;
  assetsRecovered: boolean;
  systemAccessRevoked: boolean;
  dataArchived: boolean;
}

interface OffboardingDashboardProps {
  employeeId: string;
  employeeName: string;
  lastWorkingDay?: Date;
}

const ChecklistItem: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  completed: boolean;
}> = ({ icon, title, description, completed }) => (
  <div className="flex items-start gap-4 p-4 border border-border rounded-lg">
    <div className={`mt-1 ${completed ? 'text-success' : 'text-muted-foreground'}`}>
      {completed ? <CheckCircle2 className="h-5 w-5" /> : icon}
    </div>
    <div className="flex-1">
      <p className="font-semibold">{title}</p>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
    <Badge variant={completed ? 'default' : 'secondary'}>
      {completed ? 'Done' : 'Pending'}
    </Badge>
  </div>
);

export const OffboardingDashboard: React.FC<OffboardingDashboardProps> = ({
  employeeId,
  employeeName,
  lastWorkingDay,
}) => {
  const [status, setStatus] = useState<OffboardingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setLoading(true);
        // This would be replaced with actual API call
        // const response = await fetch(`/api/v1/separation/${employeeId}/offboarding-check`);
        // const data = await response.json();
        // setStatus(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch offboarding status');
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [employeeId]);

  if (loading) {
    return (
      <Card className="w-full max-w-4xl">
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin">
            <Clock className="h-6 w-6" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!status) {
    return (
      <Card className="w-full max-w-4xl">
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">No offboarding data found</p>
        </CardContent>
      </Card>
    );
  }

  const completionPercentage = Math.round(
    ((5 - status.missingItems.length) / 5) * 100
  );

  return (
    <div className="w-full max-w-4xl space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Offboarding Dashboard</CardTitle>
              <CardDescription>
                {employeeName} - Last Working Day:{' '}
                {lastWorkingDay ? new Date(lastWorkingDay).toLocaleDateString() : 'N/A'}
              </CardDescription>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">{completionPercentage}%</p>
              <p className="text-sm text-muted-foreground">Complete</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Status Alert */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-destructive/10 text-destructive rounded-lg">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      {status.canDeactivate ? (
        <div className="flex items-center gap-2 p-4 bg-success/10 text-success rounded-lg">
          <CheckCircle2 className="h-5 w-5" />
          <span>All offboarding tasks completed. Employee can be deactivated.</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 p-4 bg-warning/10 text-warning rounded-lg">
          <AlertCircle className="h-5 w-5" />
          <span>
            {status.missingItems.length} task(s) remaining before deactivation
          </span>
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
          />

          <ChecklistItem
            icon={<FileCheck className="h-5 w-5" />}
            title="F&F Settlement"
            description="Calculate and approve the Full & Final settlement"
            completed={status.fnfSettlementApproved}
          />

          <ChecklistItem
            icon={<Package className="h-5 w-5" />}
            title="Asset Recovery"
            description="Recover all assets assigned to the employee"
            completed={status.assetsRecovered}
          />

          <ChecklistItem
            icon={<LogOut className="h-5 w-5" />}
            title="System Access"
            description="Revoke all system access and credentials"
            completed={status.systemAccessRevoked}
          />

          <ChecklistItem
            icon={<FileCheck className="h-5 w-5" />}
            title="Data Archive"
            description="Archive employee data for compliance and records"
            completed={status.dataArchived}
          />
        </CardContent>
      </Card>

      {/* Missing Items */}
      {status.missingItems.length > 0 && (
        <Card className="border-warning">
          <CardHeader>
            <CardTitle className="text-warning">Pending Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {status.missingItems.map((item, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm">
                  <AlertCircle className="h-4 w-4 text-warning" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2 list-decimal list-inside text-sm">
            <li>Ensure all exit interview questions are answered</li>
            <li>Review and approve the F&F settlement calculation</li>
            <li>Verify all company assets have been returned or accounted for</li>
            <li>Revoke system access and disable user accounts</li>
            <li>Archive employee records for compliance</li>
            <li>Once all items are complete, deactivate the employee account</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};
