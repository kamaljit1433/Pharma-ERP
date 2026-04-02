import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import { Clock } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

interface EmployeeHistoryTabProps {
  employeeId: string;
}

interface HistoryEntry {
  id: string;
  action: string;
  field?: string;
  old_value?: string;
  new_value?: string;
  changed_by?: string;
  changed_at: string;
}

export const EmployeeHistoryTab: React.FC<EmployeeHistoryTabProps> = ({ employeeId }) => {
  const { toast } = useToast();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        // Note: This endpoint may need to be created in the backend
        // For now, we'll show a placeholder
        setHistory([]);
      } catch (error) {
        toast({
          type: 'error',
          message: 'Failed to load history',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [employeeId, toast]);

  const getActionColor = (action: string) => {
    switch (action) {
      case 'created':
        return 'bg-success text-success-foreground';
      case 'updated':
        return 'bg-info text-info-foreground';
      case 'deleted':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Change History
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Change History
        </CardTitle>
        <CardDescription>Record of changes made to this employee</CardDescription>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            No change history available
          </p>
        ) : (
          <div className="space-y-3">
            {history.map((entry) => (
              <div
                key={entry.id}
                className="flex items-start justify-between p-3 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge className={getActionColor(entry.action)}>
                      {entry.action}
                    </Badge>
                    {entry.field && (
                      <span className="text-sm font-medium">{entry.field}</span>
                    )}
                  </div>
                  {entry.old_value && entry.new_value && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Changed from <span className="font-mono">{entry.old_value}</span> to{' '}
                      <span className="font-mono">{entry.new_value}</span>
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {entry.changed_by && `By ${entry.changed_by} • `}
                    {new Date(entry.changed_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
