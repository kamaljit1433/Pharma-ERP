import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import { Clock } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import employeeService, { AuditLogEntry } from '@/services/employeeService';

interface EmployeeHistoryTabProps {
  employeeId: string;
}

interface HistoryEntry {
  id: string;
  action: 'created' | 'updated' | 'deleted';
  field?: string;
  old_value?: string;
  new_value?: string;
  changed_by?: string;
  changed_at: string;
}

function classifyAction(action: string): HistoryEntry['action'] {
  if (action.includes('creat')) return 'created';
  if (action.includes('archiv') || action.includes('delet')) return 'deleted';
  return 'updated';
}

function formatActionLabel(action: string): string {
  return action
    .replace(/^employee_/, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function mapAuditEntry(log: AuditLogEntry): HistoryEntry {
  const changes = log.changes ?? {};
  const oldKey = Object.keys(changes).find((k) => k.startsWith('old_'));
  const newKey = Object.keys(changes).find((k) => k.startsWith('new_'));

  const entry: HistoryEntry = {
    id: log.id,
    action: classifyAction(log.action),
    field: formatActionLabel(log.action),
    changed_at: typeof log.created_at === 'string' ? log.created_at : new Date(log.created_at).toISOString(),
  };
  if (oldKey !== undefined) entry.old_value = String(changes[oldKey]);
  if (newKey !== undefined) entry.new_value = String(changes[newKey]);
  if (log.performed_by !== undefined) entry.changed_by = log.performed_by;
  return entry;
}

const ACTION_COLORS: Record<HistoryEntry['action'], string> = {
  created: 'bg-success text-success-foreground',
  updated: 'bg-blue-100 text-blue-800',
  deleted: 'bg-destructive text-destructive-foreground',
};

export const EmployeeHistoryTab: React.FC<EmployeeHistoryTabProps> = ({ employeeId }) => {
  const { toast } = useToast();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const logs = await employeeService.getAuditLogs(employeeId);
        setHistory(logs.map(mapAuditEntry));
      } catch (error) {
        toast({ type: 'error', message: 'Failed to load history' });
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [employeeId, toast]);

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
          <p className="text-center text-muted-foreground py-4">No change history available</p>
        ) : (
          <div className="space-y-3">
            {history.map((entry) => (
              <div
                key={entry.id}
                className="flex items-start justify-between p-3 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge className={ACTION_COLORS[entry.action]}>
                      {entry.action}
                    </Badge>
                    {entry.field && (
                      <span className="text-sm font-medium">{entry.field}</span>
                    )}
                  </div>
                  {entry.old_value && entry.new_value && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Changed from{' '}
                      <span className="font-mono">{entry.old_value}</span> to{' '}
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
