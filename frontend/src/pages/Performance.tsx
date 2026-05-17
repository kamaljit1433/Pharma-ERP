import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { PerformanceDashboard } from '../components/performance/PerformanceDashboard';
import { GoalSetting } from '../components/performance/GoalSetting';
import { FeedbackForm } from '../components/performance/FeedbackForm';
import { PerformanceReviewForm } from '../components/performance/PerformanceReviewForm';
import { ReviewCycleManagement } from '../components/performance/ReviewCycleManagement';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '../components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogTitle,
} from '../components/ui/alert-dialog';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { DatePicker } from '../components/ui/date-picker';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../components/ui/select';
import { usePerformanceStore } from '../store/performanceStore';
import {
  LayoutDashboard, Target, MessageSquare, Star, RefreshCw,
  Plus, TrendingUp, Eye, Pencil, Trash2, ChevronLeft, ChevronRight,
} from 'lucide-react';

// ─── constants ───────────────────────────────────────────────────────────────

const PAGE_SIZE = 8; // used by GoalsTab only
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

const STATUS_COLOR: Record<string, string> = {
  'On Track':  'bg-green-100 text-green-800',
  'At Risk':   'bg-yellow-100 text-yellow-800',
  'Behind':    'bg-red-100 text-red-800',
  'Completed': 'bg-blue-100 text-blue-800',
};

// ─── GoalsTab ─────────────────────────────────────────────────────────────────

const GoalsTab: React.FC = () => {
  const { goals, loadingGoals, fetchAllGoals, updateGoal, deleteGoal } = usePerformanceStore();

  const [createOpen, setCreateOpen]   = useState(false);
  const [viewGoal,   setViewGoal]     = useState<any>(null);
  const [editGoal,   setEditGoal]     = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [saving,   setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [page, setPage] = useState(1);

  // Edit form state
  const [editForm, setEditForm] = useState({
    title: '', description: '', type: 'OKR', targetValue: '',
    unit: '', weight: '', dueDate: '', status: 'On Track',
  });

  useEffect(() => { fetchAllGoals(); }, [fetchAllGoals]);

  // Reset to page 1 whenever goals list changes
  useEffect(() => { setPage(1); }, [goals.length]);

  const totalPages = Math.max(1, Math.ceil(goals.length / PAGE_SIZE));
  const paginated  = goals.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openEdit = (goal: any) => {
    setEditGoal(goal);
    setEditForm({
      title:       goal.title       ?? '',
      description: goal.description ?? '',
      type:        goal.type        ?? 'OKR',
      targetValue: String(goal.targetValue ?? ''),
      unit:        goal.unit        ?? '',
      weight:      String(goal.weight ?? ''),
      dueDate:     goal.dueDate
        ? new Date(goal.dueDate).toISOString().slice(0, 10)
        : '',
      status:      goal.status      ?? 'On Track',
    });
  };

  const handleSaveEdit = async () => {
    if (!editGoal) return;
    setSaving(true);
    try {
      await updateGoal(editGoal.id, {
        title:       editForm.title,
        description: editForm.description,
        type:        editForm.type,
        targetValue: parseFloat(editForm.targetValue),
        unit:        editForm.unit,
        weight:      parseFloat(editForm.weight),
        dueDate:     editForm.dueDate || undefined,
        status:      editForm.status,
      });
      setEditGoal(null);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteGoal(deleteTarget.id);
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Goals</h2>
          <p className="text-sm text-muted-foreground">
            {goals.length} goal{goals.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Create Goal
        </Button>
      </div>

      {/* List */}
      {loadingGoals ? (
        <div className="text-center py-10 text-muted-foreground">Loading goals...</div>
      ) : goals.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
            <Target className="w-8 h-8 opacity-40" />
            <p>No goals yet. Click <strong>Create Goal</strong> to add one.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-3">
            {paginated.map((goal: any) => {
              const pct = goal.completionPercentage ?? goal.completion_percentage ?? 0;
              return (
                <Card key={goal.id}>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start justify-between gap-4">
                      {/* Left: info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium truncate">{goal.title}</span>
                          <Badge variant="outline" className="text-xs shrink-0">{goal.type}</Badge>
                          <Badge className={`text-xs shrink-0 ${STATUS_COLOR[goal.status] ?? ''}`}>
                            {goal.status}
                          </Badge>
                        </div>
                        {goal.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                            {goal.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            {goal.currentValue ?? 0} / {goal.targetValue} {goal.unit}
                          </span>
                          {goal.dueDate && (
                            <span>Due {new Date(goal.dueDate).toLocaleDateString()}</span>
                          )}
                          <span>Weight: {goal.weight}%</span>
                        </div>
                      </div>

                      {/* Right: progress + actions */}
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-sm font-semibold">{pct}%</span>
                          <div className="w-24 h-1.5 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full bg-primary transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <button
                            onClick={() => setViewGoal(goal)}
                            title="View"
                            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEdit(goal)}
                            title="Edit"
                            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(goal)}
                            title="Delete"
                            className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages} &middot; {goals.length} goals
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline" size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <Button
                    key={n}
                    variant={n === page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPage(n)}
                    className="w-8 h-8 p-0"
                  >
                    {n}
                  </Button>
                ))}
                <Button
                  variant="outline" size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Create dialog ── */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Goal</DialogTitle>
          </DialogHeader>
          <GoalSetting onSuccess={() => setCreateOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* ── View dialog ── */}
      <Dialog open={!!viewGoal} onOpenChange={() => setViewGoal(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Goal Details</DialogTitle>
          </DialogHeader>
          {viewGoal && (
            <div className="space-y-3 text-sm">
              <div className="flex gap-2 flex-wrap">
                <Badge variant="outline">{viewGoal.type}</Badge>
                <Badge className={STATUS_COLOR[viewGoal.status] ?? ''}>{viewGoal.status}</Badge>
              </div>
              {[
                ['Title',       viewGoal.title],
                ['Description', viewGoal.description || '—'],
                ['Target',      `${viewGoal.targetValue} ${viewGoal.unit || ''}`],
                ['Current',     `${viewGoal.currentValue ?? 0} ${viewGoal.unit || ''}`],
                ['Progress',    `${viewGoal.completionPercentage ?? 0}%`],
                ['Weight',      `${viewGoal.weight}%`],
                ['Due Date',    viewGoal.dueDate ? new Date(viewGoal.dueDate).toLocaleDateString() : '—'],
                ['Created',     viewGoal.createdAt ? new Date(viewGoal.createdAt).toLocaleDateString() : '—'],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between border-b pb-2 last:border-0">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium text-right max-w-[60%]">{value}</span>
                </div>
              ))}
              <div className="pt-1">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Progress</span>
                  <span>{viewGoal.completionPercentage ?? 0}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${viewGoal.completionPercentage ?? 0}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Edit dialog ── */}
      <Dialog open={!!editGoal} onOpenChange={() => setEditGoal(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Goal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={editForm.title}
                onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))}
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={editForm.description}
                onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type</Label>
                <Select value={editForm.type} onValueChange={(v) => setEditForm((p) => ({ ...p, type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OKR">OKR</SelectItem>
                    <SelectItem value="KPI">KPI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={editForm.status} onValueChange={(v) => setEditForm((p) => ({ ...p, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="On Track">On Track</SelectItem>
                    <SelectItem value="At Risk">At Risk</SelectItem>
                    <SelectItem value="Behind">Behind</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Target Value</Label>
                <Input
                  type="number" step="0.01"
                  value={editForm.targetValue}
                  onChange={(e) => setEditForm((p) => ({ ...p, targetValue: e.target.value }))}
                />
              </div>
              <div>
                <Label>Unit</Label>
                <Input
                  value={editForm.unit}
                  onChange={(e) => setEditForm((p) => ({ ...p, unit: e.target.value }))}
                  placeholder="e.g. %"
                />
              </div>
              <div>
                <Label>Weight (%)</Label>
                <Input
                  type="number" min="0" max="100"
                  value={editForm.weight}
                  onChange={(e) => setEditForm((p) => ({ ...p, weight: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label>Due Date</Label>
              <DatePicker
                value={editForm.dueDate}
                onChange={(v) => setEditForm((p) => ({ ...p, dueDate: v }))}
                placeholder="Pick due date"
              />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={() => setEditGoal(null)}>Cancel</Button>
              <Button onClick={handleSaveEdit} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Delete confirmation ── */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogTitle>Delete Goal</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{deleteTarget?.title}</strong>? This cannot be undone.
          </AlertDialogDescription>
          <div className="flex gap-2 justify-end pt-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

// ─── ReviewsTab ───────────────────────────────────────────────────────────────

const REVIEW_STATUS_COLOR: Record<string, string> = {
  'Pending':                  'bg-yellow-100 text-yellow-800',
  'Self-Assessment Complete': 'bg-blue-100 text-blue-800',
  'Manager Review Complete':  'bg-purple-100 text-purple-800',
  'Finalized':                'bg-green-100 text-green-800',
};

const ReviewsTab: React.FC = () => {
  const {
    reviews, loadingReviews, fetchAllReviews,
    updateReview, deleteReview, reviewCycles, fetchReviewCycles,
  } = usePerformanceStore();

  const [submitOpen,   setSubmitOpen]   = useState(false);
  const [viewReview,   setViewReview]   = useState<any>(null);
  const [editReview,   setEditReview]   = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [saving,   setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [page, setPage]         = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [editForm, setEditForm] = useState({ rating: '', comments: '' });

  useEffect(() => {
    fetchAllReviews();
    fetchReviewCycles();
  }, [fetchAllReviews, fetchReviewCycles]);

  useEffect(() => { setPage(1); }, [reviews.length, pageSize]);

  const totalPages = Math.max(1, Math.ceil(reviews.length / pageSize));
  const paginated  = reviews.slice((page - 1) * pageSize, page * pageSize);

  const cycleName = (cycleId: string) =>
    reviewCycles.find((c: any) => c.id === cycleId)?.name ?? cycleId;

  const openEdit = (r: any) => {
    setEditReview(r);
    setEditForm({
      rating:   String(r.finalRating ?? r.selfRating ?? r.managerRating ?? ''),
      comments: r.comments ?? '',
    });
  };

  const handleSaveEdit = async () => {
    if (!editReview) return;
    setSaving(true);
    try {
      await updateReview(editReview.id, {
        rating:   parseInt(editForm.rating),
        comments: editForm.comments,
      });
      await fetchAllReviews();
      setEditReview(null);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteReview(deleteTarget.id);
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const reviewRating = (r: any) =>
    r.finalRating ?? r.selfRating ?? r.managerRating ?? (r.peerRatings?.[0]) ?? '—';

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Performance Reviews</h2>
          <p className="text-sm text-muted-foreground">
            {reviews.length} review{reviews.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <Button onClick={() => setSubmitOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Submit Review
        </Button>
      </div>

      {/* List */}
      {loadingReviews ? (
        <div className="text-center py-10 text-muted-foreground">Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
            <Star className="w-8 h-8 opacity-40" />
            <p>No reviews yet. Click <strong>Submit Review</strong> to add one.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-3">
            {paginated.map((r: any) => (
              <Card key={r.id}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {r.reviewType && (
                          <Badge variant="outline" className="text-xs shrink-0">{r.reviewType}</Badge>
                        )}
                        <Badge className={`text-xs shrink-0 ${REVIEW_STATUS_COLOR[r.status] ?? 'bg-muted text-muted-foreground'}`}>
                          {r.status}
                        </Badge>
                      </div>
                      {r.employeeName && (
                        <p className="text-sm font-medium mt-1">{r.employeeName}</p>
                      )}
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground flex-wrap">
                        {r.cycleId && <span>Cycle: {cycleName(r.cycleId)}</span>}
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          Rating: {reviewRating(r)} / 5
                        </span>
                        {r.completedAt && (
                          <span>Completed {new Date(r.completedAt).toLocaleDateString()}</span>
                        )}
                        {r.createdAt && (
                          <span>Submitted {new Date(r.createdAt).toLocaleDateString()}</span>
                        )}
                      </div>
                      {r.comments && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{r.comments}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => setViewReview(r)}
                        title="View"
                        className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEdit(r)}
                        title="Edit"
                        className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(r)}
                        title="Delete"
                        className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between pt-2 flex-wrap gap-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Rows per page:</span>
              <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
                <SelectTrigger className="h-8 w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZE_OPTIONS.map((n) => (
                    <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span>{reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                const n = totalPages <= 7 ? i + 1
                  : page <= 4 ? i + 1
                  : page >= totalPages - 3 ? totalPages - 6 + i
                  : page - 3 + i;
                return (
                  <Button key={n} variant={n === page ? 'default' : 'outline'} size="sm"
                    onClick={() => setPage(n)} className="w-8 h-8 p-0">
                    {n}
                  </Button>
                );
              })}
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </>
      )}

      {/* ── Submit Review modal ── */}
      <Dialog open={submitOpen} onOpenChange={setSubmitOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Submit Performance Review</DialogTitle>
          </DialogHeader>
          <PerformanceReviewForm onSuccess={() => { setSubmitOpen(false); fetchAllReviews(); }} />
        </DialogContent>
      </Dialog>

      {/* ── View dialog ── */}
      <Dialog open={!!viewReview} onOpenChange={() => setViewReview(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Review Details</DialogTitle>
          </DialogHeader>
          {viewReview && (
            <div className="space-y-3 text-sm">
              <div className="flex gap-2 flex-wrap">
                <Badge variant="outline">{viewReview.reviewType ?? '—'}</Badge>
                <Badge className={REVIEW_STATUS_COLOR[viewReview.status] ?? 'bg-muted text-muted-foreground'}>
                  {viewReview.status}
                </Badge>
              </div>
              {[
                ['Review Cycle',    viewReview.cycleId ? cycleName(viewReview.cycleId) : '—'],
                ['Review Type',     viewReview.reviewType ?? '—'],
                ['Rating',          `${reviewRating(viewReview)} / 5`],
                ['Status',          viewReview.status],
                ['Comments',        viewReview.comments || '—'],
                ['Submitted',       viewReview.createdAt ? new Date(viewReview.createdAt).toLocaleDateString() : '—'],
                ['Completed',       viewReview.completedAt ? new Date(viewReview.completedAt).toLocaleDateString() : '—'],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between border-b pb-2 last:border-0">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium text-right max-w-[60%] whitespace-pre-wrap">{value}</span>
                </div>
              ))}
              {/* Star visualization */}
              <div className="flex gap-1 pt-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${i < Number(reviewRating(viewReview)) ? 'fill-warning text-warning' : 'text-muted-foreground'}`}
                  />
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Edit dialog ── */}
      <Dialog open={!!editReview} onOpenChange={() => setEditReview(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Rating (1–5)</Label>
              <Select value={editForm.rating} onValueChange={(v) => setEditForm((p) => ({ ...p, rating: v }))}>
                <SelectTrigger><SelectValue placeholder="Select rating" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Star — Needs Improvement</SelectItem>
                  <SelectItem value="2">2 Stars — Below Expectations</SelectItem>
                  <SelectItem value="3">3 Stars — Meets Expectations</SelectItem>
                  <SelectItem value="4">4 Stars — Exceeds Expectations</SelectItem>
                  <SelectItem value="5">5 Stars — Outstanding</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Comments</Label>
              <Textarea
                value={editForm.comments}
                onChange={(e) => setEditForm((p) => ({ ...p, comments: e.target.value }))}
                rows={4}
              />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={() => setEditReview(null)}>Cancel</Button>
              <Button onClick={handleSaveEdit} disabled={saving || !editForm.rating}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Delete confirmation ── */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogTitle>Delete Review</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this <strong>{deleteTarget?.reviewType}</strong> review? This cannot be undone.
          </AlertDialogDescription>
          <div className="flex gap-2 justify-end pt-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

// ─── FeedbackTab ──────────────────────────────────────────────────────────────

const FEEDBACK_TYPE_COLOR: Record<string, string> = {
  'Positive':     'bg-green-100 text-green-800',
  'Constructive': 'bg-yellow-100 text-yellow-800',
  'Neutral':      'bg-blue-100 text-blue-800',
};

const VISIBILITY_COLOR: Record<string, string> = {
  'Private':      'bg-muted text-muted-foreground',
  'Manager Only': 'bg-purple-100 text-purple-800',
  'Public':       'bg-teal-100 text-teal-800',
};

const FeedbackTab: React.FC = () => {
  const { feedback, loadingFeedback, fetchAllFeedback, updateFeedback, deleteFeedback } =
    usePerformanceStore();

  const [giveOpen,     setGiveOpen]     = useState(false);
  const [viewItem,     setViewItem]     = useState<any>(null);
  const [editItem,     setEditItem]     = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [saving,   setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [page, setPage]         = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [editForm, setEditForm] = useState({
    type: 'Positive', content: '', visibility: 'Private',
  });

  useEffect(() => { fetchAllFeedback(); }, [fetchAllFeedback]);
  useEffect(() => { setPage(1); }, [feedback.length, pageSize]);

  const totalPages = Math.max(1, Math.ceil(feedback.length / pageSize));
  const paginated  = feedback.slice((page - 1) * pageSize, page * pageSize);

  const openEdit = (f: any) => {
    setEditItem(f);
    setEditForm({ type: f.type ?? 'Positive', content: f.content ?? '', visibility: f.visibility ?? 'Private' });
  };

  const handleSaveEdit = async () => {
    if (!editItem) return;
    setSaving(true);
    try {
      await updateFeedback(editItem.id, editForm);
      setEditItem(null);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteFeedback(deleteTarget.id);
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Feedback</h2>
          <p className="text-sm text-muted-foreground">
            {feedback.length} entr{feedback.length !== 1 ? 'ies' : 'y'} total
          </p>
        </div>
        <Button onClick={() => setGiveOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Give Feedback
        </Button>
      </div>

      {/* List */}
      {loadingFeedback ? (
        <div className="text-center py-10 text-muted-foreground">Loading feedback...</div>
      ) : feedback.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
            <MessageSquare className="w-8 h-8 opacity-40" />
            <p>No feedback yet. Click <strong>Give Feedback</strong> to add one.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-3">
            {paginated.map((f: any) => (
              <Card key={f.id}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={`text-xs shrink-0 ${FEEDBACK_TYPE_COLOR[f.type] ?? ''}`}>
                          {f.type}
                        </Badge>
                        <Badge className={`text-xs shrink-0 ${VISIBILITY_COLOR[f.visibility] ?? ''}`}>
                          {f.visibility}
                        </Badge>
                        {f.isAnonymous && (
                          <Badge variant="outline" className="text-xs shrink-0">Anonymous</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{f.content}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {f.createdAt ? new Date(f.createdAt).toLocaleDateString() : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => setViewItem(f)}
                        title="View"
                        className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEdit(f)}
                        title="Edit"
                        className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(f)}
                        title="Delete"
                        className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between pt-2 flex-wrap gap-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Rows per page:</span>
              <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
                <SelectTrigger className="h-8 w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZE_OPTIONS.map((n) => (
                    <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span>{feedback.length} entr{feedback.length !== 1 ? 'ies' : 'y'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                const n = totalPages <= 7 ? i + 1
                  : page <= 4 ? i + 1
                  : page >= totalPages - 3 ? totalPages - 6 + i
                  : page - 3 + i;
                return (
                  <Button key={n} variant={n === page ? 'default' : 'outline'} size="sm"
                    onClick={() => setPage(n)} className="w-8 h-8 p-0">
                    {n}
                  </Button>
                );
              })}
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </>
      )}

      {/* ── Give Feedback modal ── */}
      <Dialog open={giveOpen} onOpenChange={setGiveOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Give Feedback</DialogTitle>
          </DialogHeader>
          <FeedbackForm onSuccess={() => { setGiveOpen(false); fetchAllFeedback(); }} />
        </DialogContent>
      </Dialog>

      {/* ── View dialog ── */}
      <Dialog open={!!viewItem} onOpenChange={() => setViewItem(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Feedback Details</DialogTitle>
          </DialogHeader>
          {viewItem && (
            <div className="space-y-3 text-sm">
              <div className="flex gap-2 flex-wrap">
                <Badge className={FEEDBACK_TYPE_COLOR[viewItem.type] ?? ''}>{viewItem.type}</Badge>
                <Badge className={VISIBILITY_COLOR[viewItem.visibility] ?? ''}>{viewItem.visibility}</Badge>
                {viewItem.isAnonymous && <Badge variant="outline">Anonymous</Badge>}
              </div>
              {[
                ['Type',       viewItem.type],
                ['Visibility', viewItem.visibility],
                ['Anonymous',  viewItem.isAnonymous ? 'Yes' : 'No'],
                ['Date',       viewItem.createdAt ? new Date(viewItem.createdAt).toLocaleDateString() : '—'],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between border-b pb-2 last:border-0">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
              <div>
                <p className="text-muted-foreground mb-1">Content</p>
                <p className="text-sm whitespace-pre-wrap rounded-md bg-muted p-3">{viewItem.content}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Edit dialog ── */}
      <Dialog open={!!editItem} onOpenChange={() => setEditItem(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Feedback</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type</Label>
                <Select value={editForm.type} onValueChange={(v) => setEditForm((p) => ({ ...p, type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Positive">Positive</SelectItem>
                    <SelectItem value="Constructive">Constructive</SelectItem>
                    <SelectItem value="Neutral">Neutral</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Visibility</Label>
                <Select value={editForm.visibility} onValueChange={(v) => setEditForm((p) => ({ ...p, visibility: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Private">Private</SelectItem>
                    <SelectItem value="Manager Only">Manager Only</SelectItem>
                    <SelectItem value="Public">Public</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Content</Label>
              <Textarea
                value={editForm.content}
                onChange={(e) => setEditForm((p) => ({ ...p, content: e.target.value }))}
                rows={5}
              />
              <p className="text-xs text-muted-foreground mt-1">{editForm.content.length} / 5000 characters</p>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={() => setEditItem(null)}>Cancel</Button>
              <Button
                onClick={handleSaveEdit}
                disabled={saving || editForm.content.length < 10 || editForm.content.length > 5000}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Delete confirmation ── */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogTitle>Delete Feedback</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this <strong>{deleteTarget?.type}</strong> feedback? This cannot be undone.
          </AlertDialogDescription>
          <div className="flex gap-2 justify-end pt-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

// ─── Performance page ─────────────────────────────────────────────────────────

const Performance: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Performance Management</h1>
        <p className="text-muted-foreground mt-1">Manage goals, reviews, and feedback</p>
      </div>

      <Tabs defaultValue="dashboard">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <LayoutDashboard className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="cycles" className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Review Cycles</span>
          </TabsTrigger>
          <TabsTrigger value="goals" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            <span className="hidden sm:inline">Goals</span>
          </TabsTrigger>
          <TabsTrigger value="review" className="flex items-center gap-2">
            <Star className="w-4 h-4" />
            <span className="hidden sm:inline">Reviews</span>
          </TabsTrigger>
          <TabsTrigger value="feedback" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            <span className="hidden sm:inline">Feedback</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard"><PerformanceDashboard /></TabsContent>
        <TabsContent value="cycles"><ReviewCycleManagement /></TabsContent>
        <TabsContent value="goals"><GoalsTab /></TabsContent>
        <TabsContent value="review"><ReviewsTab /></TabsContent>
        <TabsContent value="feedback"><FeedbackTab /></TabsContent>
      </Tabs>
    </div>
  );
};

export default Performance;
