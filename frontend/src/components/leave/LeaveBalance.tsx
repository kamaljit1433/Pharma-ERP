import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { useLeaveStore } from '../../store/leaveStore';
import { Plane } from 'lucide-react';

interface LeaveBalanceProps {
  employeeId: string;
  year?: number;
}

export const LeaveBalance: React.FC<LeaveBalanceProps> = ({
  employeeId,
  year = new Date().getFullYear(),
}) => {
  const { leaveBalances, loadingBalances, fetchLeaveBalance, leaveTypes } =
    useLeaveStore();

  useEffect(() => {
    fetchLeaveBalance(employeeId, year);
  }, [employeeId, year, fetchLeaveBalance]);

  if (loadingBalances) {
    return <div className="text-sm text-muted-foreground">Loading leave balance...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plane className="h-5 w-5" />
          Leave Balance - {year}
        </CardTitle>
        <CardDescription>Your available leave for this year</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {leaveBalances.length === 0 ? (
          <p className="text-sm text-muted-foreground">No leave balance data available</p>
        ) : (
          leaveBalances.map((balance) => {
            const leaveType = leaveTypes.find((lt) => lt.id === balance.leave_type_id);
            const usagePercent = (balance.used_balance / balance.opening_balance) * 100;

            return (
              <div key={balance.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{leaveType?.name || 'Unknown'}</p>
                    <p className="text-sm text-muted-foreground">
                      {balance.available_balance} of {balance.opening_balance} days available
                    </p>
                  </div>
                  <Badge variant="outline">
                    {balance.available_balance.toFixed(1)} days
                  </Badge>
                </div>
                <Progress value={usagePercent} className="h-2" />
                {balance.carry_forward_balance > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Carry forward: {balance.carry_forward_balance} days
                  </p>
                )}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};
