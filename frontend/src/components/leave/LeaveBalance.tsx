import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { useLeaveStore } from '../../store/leaveStore';
import { Plane, TrendingDown, TrendingUp } from 'lucide-react';

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
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">Loading leave balance...</p>
        </CardContent>
      </Card>
    );
  }

  if (leaveBalances.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plane className="h-5 w-5" />
            Leave Balance - {year}
          </CardTitle>
          <CardDescription>Your available leave for this year</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No leave balance data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plane className="h-5 w-5" />
            Leave Balance - {year}
          </CardTitle>
          <CardDescription>Your available leave for each leave type</CardDescription>
        </CardHeader>
      </Card>

      {/* Leave Balance Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {leaveBalances.map((balance) => {
          const leaveType = leaveTypes.find((lt) => lt.id === balance.leave_type_id);
          const usagePercent = Number(balance.opening_balance) > 0
            ? (Number(balance.used_balance) / Number(balance.opening_balance)) * 100
            : 0;
          const isLowBalance = Number(balance.available_balance) <= 2;

          return (
            <Card key={balance.id} className={isLowBalance ? 'border-amber-200 bg-amber-50' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{leaveType?.name || 'Unknown'}</CardTitle>
                    <CardDescription className="text-xs">
                      {leaveType?.code || 'N/A'}
                    </CardDescription>
                  </div>
                  {isLowBalance && (
                    <Badge variant="destructive" className="text-xs">
                      Low
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Balance Summary */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      {Number(balance.available_balance).toFixed(1)}
                    </p>
                    <p className="text-xs text-muted-foreground">Available</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-600">
                      {Number(balance.used_balance).toFixed(1)}
                    </p>
                    <p className="text-xs text-muted-foreground">Used</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-amber-600">
                      {Number(balance.carry_forward_balance).toFixed(1)}
                    </p>
                    <p className="text-xs text-muted-foreground">Carry Fwd</p>
                  </div>
                </div>

                {/* Usage Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">Usage</span>
                    <span className="text-xs text-muted-foreground">
                      {usagePercent.toFixed(0)}%
                    </span>
                  </div>
                  <Progress value={usagePercent} className="h-2" />
                </div>

                {/* Details */}
                <div className="space-y-1 border-t pt-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Opening Balance</span>
                    <span className="font-medium">{Number(balance.opening_balance).toFixed(1)}</span>
                  </div>
                  {balance.carry_forward_balance > 0 && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        Carry Forward
                      </span>
                      <span className="font-medium text-amber-600">
                        +{Number(balance.carry_forward_balance).toFixed(1)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <TrendingDown className="h-3 w-3" />
                      Used
                    </span>
                    <span className="font-medium text-blue-600">
                      -{Number(balance.used_balance).toFixed(1)}
                    </span>
                  </div>
                </div>

                {/* Leave Type Info */}
                <div className="space-y-1 border-t pt-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Type</span>
                    <Badge variant="outline" className="text-xs">
                      {leaveType?.is_paid ? 'Paid' : 'Unpaid'}
                    </Badge>
                  </div>
                  {leaveType?.requires_approval && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Approval</span>
                      <Badge variant="outline" className="text-xs">
                        Required
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
