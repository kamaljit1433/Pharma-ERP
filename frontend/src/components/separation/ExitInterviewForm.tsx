import React, { useEffect, useState, useCallback } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { DateTimePicker } from '../ui/date-time-picker';
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
  Calendar,
  ClipboardList,
  Loader2,
  Plus,
  RefreshCw,
  Clock,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { useAuth } from '../../hooks/useAuth';
import { separationService, ExitInterview } from '../../services/separationService';

interface ExitInterviewFormProps {
  employeeId: string;
  onSchedule?: (date: Date) => Promise<void>;
  onSubmit: (interviewId: string, data: ExitInterviewData) => Promise<void>;
  isLoading?: boolean;
  isHR?: boolean;
}

interface ExitInterviewData {
  conducted_by: string;
  questionnaire_responses: Record<string, string>;
  feedback: string;
}

const DEFAULT_QUESTIONS = [
  'What was your overall experience working with us?',
  'How would you rate your relationship with your manager and team?',
  'What are the primary reasons for your decision to leave?',
  'What could we improve as an organization?',
  'Would you recommend us as an employer to others? Why or why not?',
  'Any additional comments or suggestions?',
];

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  scheduled: { label: 'Scheduled', variant: 'secondary' },
  completed: { label: 'Completed', variant: 'default' },
  cancelled: { label: 'Cancelled', variant: 'outline' },
};

export const ExitInterviewForm: React.FC<ExitInterviewFormProps> = ({
  employeeId,
  onSchedule,
  onSubmit,
  isLoading = false,
  isHR = false,
}) => {
  const { user } = useAuth();

  // List state
  const [interviews, setInterviews] = useState<ExitInterview[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  // Schedule modal state
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduling, setScheduling] = useState(false);
  const [scheduleError, setScheduleError] = useState<string | null>(null);

  // Pagination state
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Questionnaire state — which interview is open for completion
  const [activeInterview, setActiveInterview] = useState<ExitInterview | null>(null);
  const [formData, setFormData] = useState<ExitInterviewData>({
    conducted_by: user?.employeeId ?? '',
    questionnaire_responses: DEFAULT_QUESTIONS.reduce(
      (acc, _, idx) => ({ ...acc, [`question_${idx + 1}`]: '' }),
      {}
    ),
    feedback: '',
  });
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const fetchInterviews = useCallback(async () => {
    if (!employeeId) return;
    try {
      setListLoading(true);
      setListError(null);
      const data = await separationService.getExitInterviewsByEmployee(employeeId);
      setInterviews(data);
    } catch (err: any) {
      setListError(err?.message || 'Failed to load exit interviews');
    } finally {
      setListLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    fetchInterviews();
  }, [fetchInterviews]);

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduledDate) {
      setScheduleError('Please select a date and time');
      return;
    }
    const date = new Date(scheduledDate);
    if (isNaN(date.getTime())) {
      setScheduleError('Invalid date');
      return;
    }
    setScheduleError(null);
    setScheduling(true);
    try {
      if (onSchedule) await onSchedule(date);
      setScheduleOpen(false);
      setScheduledDate('');
      await fetchInterviews();
    } catch (err: any) {
      setScheduleError(err?.message || 'Failed to schedule exit interview');
    } finally {
      setScheduling(false);
    }
  };

  const handleOpenQuestionnaire = (interview: ExitInterview) => {
    setActiveInterview(interview);
    setFormData({
      conducted_by: user?.employeeId ?? '',
      questionnaire_responses: DEFAULT_QUESTIONS.reduce(
        (acc, _, idx) => ({ ...acc, [`question_${idx + 1}`]: '' }),
        {}
      ),
      feedback: '',
    });
    setSubmitError(null);
    setSubmitSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!formData.conducted_by) {
      setSubmitError('Could not determine the conducting HR user. Please re-login.');
      return;
    }
    if (!formData.feedback.trim()) {
      setSubmitError('Overall feedback is required');
      return;
    }
    try {
      await onSubmit(activeInterview.id, formData);
      setSubmitSuccess(true);
      await fetchInterviews();
    } catch (err: any) {
      setSubmitError(err?.message || 'Failed to submit exit interview');
    }
  };

  // Show questionnaire panel when an interview is selected for completion
  if (activeInterview && !submitSuccess) {
    return (
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                Exit Interview Questionnaire
              </CardTitle>
              <CardDescription>
                Scheduled for{' '}
                {activeInterview.scheduled_at
                  ? new Date(activeInterview.scheduled_at).toLocaleString()
                  : '—'}
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => setActiveInterview(null)}>
              Back to list
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {submitError && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-md">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span className="text-sm">{submitError}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label>Conducted By</Label>
              <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-md text-sm">
                <span className="font-medium">{user?.email}</span>
                {user?.employeeId && (
                  <span className="text-xs text-muted-foreground">· {user.employeeId}</span>
                )}
              </div>
            </div>

            <div className="space-y-5">
              <h3 className="font-semibold text-base border-b pb-2">Questionnaire</h3>
              {DEFAULT_QUESTIONS.map((question, idx) => (
                <div key={idx} className="space-y-2">
                  <Label htmlFor={`question_${idx + 1}`}>
                    {idx + 1}. {question}
                  </Label>
                  <Textarea
                    id={`question_${idx + 1}`}
                    placeholder="Please provide your response..."
                    value={formData.questionnaire_responses[`question_${idx + 1}`] || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        questionnaire_responses: {
                          ...prev.questionnaire_responses,
                          [`question_${idx + 1}`]: e.target.value,
                        },
                      }))
                    }
                    rows={3}
                  />
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback">Overall Feedback &amp; Comments</Label>
              <Textarea
                id="feedback"
                placeholder="Provide your overall assessment and any additional comments..."
                value={formData.feedback}
                onChange={(e) => setFormData((prev) => ({ ...prev, feedback: e.target.value }))}
                rows={4}
                required
              />
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              )}
              {isLoading ? 'Submitting...' : 'Submit Exit Interview'}
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  if (activeInterview && submitSuccess) {
    return (
      <Card className="w-full max-w-4xl">
        <CardContent className="flex flex-col items-center py-12 gap-3 text-center">
          <CheckCircle2 className="h-12 w-12 text-green-600" />
          <p className="text-lg font-semibold">Exit Interview Submitted</p>
          <p className="text-muted-foreground">
            Thank you. The exit interview has been recorded successfully.
          </p>
          <Button variant="outline" onClick={() => { setActiveInterview(null); setSubmitSuccess(false); }}>
            Back to list
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Main list view
  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Exit Interviews
              </CardTitle>
              <CardDescription>
                {isHR
                  ? 'Schedule and manage exit interviews for this employee.'
                  : 'View your scheduled exit interviews.'}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={fetchInterviews} disabled={listLoading}>
                <RefreshCw className={`h-4 w-4 ${listLoading ? 'animate-spin' : ''}`} />
              </Button>
              {isHR && onSchedule && (
                <Button size="sm" onClick={() => { setScheduleError(null); setScheduledDate(''); setScheduleOpen(true); }}>
                  <Plus className="h-4 w-4 mr-1" />
                  Schedule Interview
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {listError && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-md mb-4">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span className="text-sm">{listError}</span>
            </div>
          )}

          {listLoading ? (
            <div className="flex items-center justify-center py-10 gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading...</span>
            </div>
          ) : interviews.length === 0 ? (
            <div className="flex flex-col items-center py-12 gap-3 text-center text-muted-foreground">
              <Calendar className="h-10 w-10 opacity-30" />
              <p className="font-medium">No exit interviews yet</p>
              {isHR ? (
                <p className="text-sm">Click "Schedule Interview" to create one.</p>
              ) : (
                <p className="text-sm">HR will schedule your exit interview and notify you.</p>
              )}
            </div>
          ) : (() => {
            const totalPages = Math.ceil(interviews.length / pageSize);
            const safePage = Math.min(currentPage, totalPages || 1);
            const paginated = interviews.slice((safePage - 1) * pageSize, safePage * pageSize);
            return (
              <>
                <div className="space-y-3">
                  {paginated.map((interview) => {
                    const config = STATUS_CONFIG[interview.status] ?? STATUS_CONFIG['scheduled'];
                    return (
                      <div
                        key={interview.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg"
                      >
                        <div className="flex items-start gap-3">
                          <Clock className="h-5 w-5 mt-0.5 text-muted-foreground shrink-0" />
                          <div>
                            <p className="font-medium text-sm">
                              {interview.scheduled_at
                                ? new Date(interview.scheduled_at).toLocaleString()
                                : 'Date not set'}
                            </p>
                            {interview.conducted_by && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Conducted by: {interview.conducted_by}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={config.variant}>{config.label}</Badge>
                          {isHR && interview.status === 'scheduled' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenQuestionnaire(interview)}
                            >
                              Complete
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Rows per page:</span>
                    <Select
                      value={String(pageSize)}
                      onValueChange={(val) => {
                        setPageSize(Number(val));
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger className="h-8 w-[70px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[10, 25, 50, 100].map((n) => (
                          <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span>
                      {interviews.length === 0
                        ? '0 of 0'
                        : `${(safePage - 1) * pageSize + 1}–${Math.min(safePage * pageSize, interviews.length)} of ${interviews.length}`}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        disabled={safePage <= 1}
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        disabled={safePage >= totalPages}
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            );
          })()}
        </CardContent>
      </Card>

      {/* Schedule modal */}
      <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule Exit Interview</DialogTitle>
            <DialogDescription>
              Choose a date and time for the exit interview. The employee will be notified once
              scheduled.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSchedule}>
            <div className="py-4 space-y-4">
              {scheduleError && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-md">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span className="text-sm">{scheduleError}</span>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="scheduled_date">Interview Date &amp; Time</Label>
                <DateTimePicker
                  id="scheduled_date"
                  value={scheduledDate}
                  onChange={(v) => setScheduledDate(v)}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setScheduleOpen(false)}
                disabled={scheduling}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={scheduling}>
                {scheduling ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Calendar className="h-4 w-4 mr-2" />
                )}
                {scheduling ? 'Scheduling...' : 'Schedule'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
