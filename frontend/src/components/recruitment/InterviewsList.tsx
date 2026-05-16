import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { Interview, Applicant } from '../../types/recruitment';
import { Calendar, Clock, Users, XCircle, CheckCircle, Eye, Pencil, Trash2 } from 'lucide-react';

interface InterviewsListProps {
  interviews: Interview[];
  candidates?: Applicant[];
  loading?: boolean;
  onCancel?: (interviewId: string) => Promise<void>;
  onDelete?: (interviewId: string) => Promise<void>;
  onUpdate?: (interviewId: string, data: any) => Promise<void>;
  onFeedback?: (interviewId: string) => void;
}

const STATUS_COLORS: Record<string, string> = {
  Scheduled: 'bg-blue-100 text-blue-800',
  Completed: 'bg-green-100 text-green-800',
  Cancelled: 'bg-red-100 text-red-800',
  Rescheduled: 'bg-yellow-100 text-yellow-800',
};


const PAGE_SIZES = [10, 25, 50, 100];

const toModeLabel = (interview: Interview) =>
  interview.mode || interview.type?.replace('_', '-').replace(/\b\w/g, (c) => c.toUpperCase()) || '—';

const toStatusLabel = (status: string) =>
  status ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() : 'Scheduled';

export const InterviewsList: React.FC<InterviewsListProps> = ({
  interviews,
  candidates = [],
  loading = false,
  onCancel,
  onDelete,
  onUpdate,
  onFeedback,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [viewInterview, setViewInterview] = useState<Interview | null>(null);
  const [editInterview, setEditInterview] = useState<Interview | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [cancelling, setCancelling] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  const [editForm, setEditForm] = useState({ scheduled_at: '', type: '', duration_minutes: '', notes: '' });

  const getCandidateName = (applicant_id: string) =>
    candidates.find((c) => c.id === applicant_id)?.name || applicant_id;

  const getCandidateEmail = (applicant_id: string) =>
    candidates.find((c) => c.id === applicant_id)?.email || '';

  const safeInterviews = (interviews ?? []);
  const filtered = safeInterviews.filter(
    (i) => filterStatus === 'All' || toStatusLabel(i.status) === filterStatus
  );
  const sorted = [...filtered].sort(
    (a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime()
  );

  const totalPages = Math.ceil(sorted.length / pageSize);
  const paginated = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleCancel = async (id: string) => {
    if (!onCancel) return;
    setCancelling(id);
    try { await onCancel(id); } finally { setCancelling(null); }
  };

  const handleDelete = async () => {
    if (!deleteId || !onDelete) return;
    setDeleting(true);
    try { await onDelete(deleteId); } finally { setDeleting(false); setDeleteId(null); }
  };

  const openEdit = (interview: Interview) => {
    const d = new Date(interview.scheduled_at);
    const localISO = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setEditForm({
      scheduled_at: localISO,
      type: interview.type || '',
      duration_minutes: String(interview.duration_minutes || 30),
      notes: interview.notes || '',
    });
    setEditError('');
    setEditInterview(interview);
  };

  const handleEditSave = async () => {
    if (!editInterview || !onUpdate) return;
    setEditLoading(true);
    setEditError('');
    try {
      await onUpdate(editInterview.id, {
        scheduled_at: editForm.scheduled_at,
        type: editForm.type || undefined,
        duration_minutes: editForm.duration_minutes ? Number(editForm.duration_minutes) : undefined,
        notes: editForm.notes,
      });
      setEditInterview(null);
    } catch (err) {
      setEditError((err as Error).message || 'Failed to update interview');
    } finally {
      setEditLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="border-border">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Loading interviews...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
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
            {(['All', 'Scheduled', 'Completed', 'Cancelled', 'Rescheduled'] as const).map((s) => (
              <Button
                key={s}
                variant={filterStatus === s ? 'default' : 'outline'}
                size="sm"
                onClick={() => { setFilterStatus(s); setCurrentPage(1); }}
              >
                {s}
              </Button>
            ))}
          </div>

          {sorted.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground opacity-50 mb-2" />
              <p className="text-muted-foreground">
                {filterStatus === 'All' ? 'No interviews scheduled' : `No ${filterStatus.toLowerCase()} interviews`}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Candidate</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Mode</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Interviewers</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginated.map((interview) => {
                      const d = new Date(interview.scheduled_at);
                      const modeLabel = toModeLabel(interview);
                      const statusLabel = toStatusLabel(interview.status);
                      const interviewerCount = interview.interviewers?.length ?? (interview.interviewer_id ? 1 : 0);
                      return (
                        <TableRow key={interview.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium text-sm">{getCandidateName(interview.applicant_id)}</p>
                              <p className="text-xs text-muted-foreground">{getCandidateEmail(interview.applicant_id)}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <div>
                                <div className="font-medium text-sm">{d.toLocaleDateString()}</div>
                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm">
                              <span>{modeLabel}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {interview.duration_minutes ? `${interview.duration_minutes} min` : '—'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm">
                              <Users className="w-4 h-4 text-muted-foreground" />
                              <span>{interviewerCount}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={STATUS_COLORS[statusLabel] ?? 'bg-gray-100 text-gray-800'}>
                              {statusLabel}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm" onClick={() => setViewInterview(interview)} title="View">
                                <Eye className="w-4 h-4" />
                              </Button>
                              {statusLabel === 'Scheduled' && onUpdate && (
                                <Button variant="ghost" size="sm" onClick={() => openEdit(interview)} title="Edit">
                                  <Pencil className="w-4 h-4" />
                                </Button>
                              )}
                              {statusLabel === 'Completed' && onFeedback && (
                                <Button variant="ghost" size="sm" onClick={() => onFeedback(interview.id)} title="Feedback">
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                              )}
                              {statusLabel === 'Scheduled' && onCancel && (
                                <Button
                                  variant="ghost" size="sm"
                                  onClick={() => handleCancel(interview.id)}
                                  disabled={cancelling === interview.id}
                                  title="Cancel"
                                >
                                  <XCircle className="w-4 h-4 text-destructive" />
                                </Button>
                              )}
                              {onDelete && (
                                <Button variant="ghost" size="sm" onClick={() => setDeleteId(interview.id)} title="Delete">
                                  <Trash2 className="w-4 h-4 text-destructive" />
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

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Rows per page:</span>
                  {PAGE_SIZES.map((size) => (
                    <button
                      key={size}
                      onClick={() => { setPageSize(size); setCurrentPage(1); }}
                      className={`px-2 py-0.5 rounded text-xs border ${pageSize === size ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted'}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-muted-foreground">
                    {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, sorted.length)} of {sorted.length}
                  </span>
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>Previous</Button>
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* View Modal */}
      <Dialog open={!!viewInterview} onOpenChange={() => setViewInterview(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Interview Details
            </DialogTitle>
          </DialogHeader>
          {viewInterview && (() => {
            const d = new Date(viewInterview.scheduled_at);
            const modeLabel = toModeLabel(viewInterview);
            const statusLabel = toStatusLabel(viewInterview.status);
            const interviewerCount = viewInterview.interviewers?.length ?? (viewInterview.interviewer_id ? 1 : 0);
            return (
              <div className="space-y-3">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Candidate</p>
                  <p className="font-semibold">{getCandidateName(viewInterview.applicant_id)}</p>
                  <p className="text-sm text-muted-foreground">{getCandidateEmail(viewInterview.applicant_id)}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 border border-border rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Date</p>
                    <p className="font-medium text-sm">{d.toLocaleDateString()}</p>
                  </div>
                  <div className="p-3 border border-border rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Time</p>
                    <p className="font-medium text-sm">{d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <div className="p-3 border border-border rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Mode</p>
                    <p className="font-medium text-sm">{modeLabel}</p>
                  </div>
                  <div className="p-3 border border-border rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Duration</p>
                    <p className="font-medium text-sm">{viewInterview.duration_minutes ? `${viewInterview.duration_minutes} min` : '—'}</p>
                  </div>
                  <div className="p-3 border border-border rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Interviewers</p>
                    <p className="font-medium text-sm">{interviewerCount}</p>
                  </div>
                  <div className="p-3 border border-border rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Status</p>
                    <Badge className={STATUS_COLORS[statusLabel] ?? 'bg-gray-100 text-gray-800'}>{statusLabel}</Badge>
                  </div>
                </div>
                {viewInterview.notes && (
                  <div className="p-3 border border-border rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Notes</p>
                    <p className="text-sm whitespace-pre-wrap">{viewInterview.notes}</p>
                  </div>
                )}
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={!!editInterview} onOpenChange={() => setEditInterview(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-5 h-5" />
              Reschedule Interview
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {editError && <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">{editError}</div>}
            <div>
              <Label htmlFor="edit_scheduled_at">Date & Time</Label>
              <Input
                id="edit_scheduled_at"
                type="datetime-local"
                value={editForm.scheduled_at}
                onChange={(e) => setEditForm((f) => ({ ...f, scheduled_at: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="edit_type">Mode</Label>
              <select
                id="edit_type"
                value={editForm.type}
                onChange={(e) => setEditForm((f) => ({ ...f, type: e.target.value }))}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="video">Video Call</option>
                <option value="in_person">In-Person</option>
                <option value="phone">Phone Call</option>
              </select>
            </div>
            <div>
              <Label htmlFor="edit_duration">Duration (minutes)</Label>
              <Input
                id="edit_duration"
                type="number"
                value={editForm.duration_minutes}
                onChange={(e) => setEditForm((f) => ({ ...f, duration_minutes: e.target.value }))}
                min={15}
                step={15}
              />
            </div>
            <div>
              <Label htmlFor="edit_notes">Notes</Label>
              <Input
                id="edit_notes"
                value={editForm.notes}
                onChange={(e) => setEditForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="Optional notes"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button className="flex-1" onClick={handleEditSave} disabled={editLoading}>
                {editLoading ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button variant="outline" onClick={() => setEditInterview(null)} disabled={editLoading}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Interview</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this interview? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
