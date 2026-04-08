import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Interview } from '../../types/recruitment';
import { Calendar, Clock, Users, Trash2, CheckCircle, XCircle } from 'lucide-react';

interface InterviewsListProps {
  interviews: Interview[];
  loading?: boolean;
  onCancel?: (interviewId: string) => Promise<void>;
  onFeedback?: (interviewId: string) => void;
}

const statusColors: Record<string, string> = {
  Scheduled: 'bg-blue-100 text-blue-800',
  Completed: 'bg-green-100 text-green-800',
  Cancelled: 'bg-red-100 text-red-800',
};

const modeIcons: Record<string, string> = {
  'In-Person': '🏢',
  Video: '📹',
  Phone: '☎️',
};

export const InterviewsList: React.FC<InterviewsListProps> = ({
  interviews,
  loading = false,
  onCancel,
  onFeedback,
}) => {
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'All' | 'Scheduled' | 'Completed' | 'Cancelled'>('All');

  const filteredInterviews = interviews.filter(
    (interview) => filterStatus === 'All' || interview.status === filterStatus
  );

  const sortedInterviews = [...filteredInterviews].sort(
    (a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime()
  );

  const handleCancel = async (interviewId: string) => {
    if (!onCancel) return;
    setCancelling(interviewId);
    try {
      await onCancel(interviewId);
    } finally {
      setCancelling(null);
    }
  };

  const formatDateTime = (date: Date) => {
    const d = new Date(date);
    return {
      date: d.toLocaleDateString(),
      time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Scheduled Interviews
        </CardTitle>
        <CardDescription>View and manage all scheduled interviews</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filter Buttons */}
        <div className="flex gap-2 mb-4">
          {(['All', 'Scheduled', 'Completed', 'Cancelled'] as const).map((status) => (
            <Button
              key={status}
              variant={filterStatus === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus(status)}
            >
              {status}
            </Button>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Loading interviews...</p>
          </div>
        ) : sortedInterviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Calendar className="h-12 w-12 text-muted-foreground opacity-50 mb-2" />
            <p className="text-muted-foreground">
              {filterStatus === 'All'
                ? 'No interviews scheduled'
                : `No ${filterStatus.toLowerCase()} interviews`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Interviewers</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedInterviews.map((interview) => {
                  const { date, time } = formatDateTime(interview.scheduled_at);
                  return (
                    <TableRow key={interview.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{date}</div>
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {time}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{modeIcons[interview.mode]}</span>
                          <span className="text-sm">{interview.mode}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{interview.interviewers.length}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[interview.status]}>
                          {interview.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {interview.status === 'Completed' && onFeedback && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onFeedback(interview.id)}
                              title="View/Add Feedback"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          )}
                          {interview.status === 'Scheduled' && onCancel && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCancel(interview.id)}
                              disabled={cancelling === interview.id}
                              title="Cancel Interview"
                            >
                              <XCircle className="w-4 h-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
