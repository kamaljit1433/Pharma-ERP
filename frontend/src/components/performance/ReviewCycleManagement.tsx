import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { usePerformanceStore } from '../../store/performanceStore';
import { AlertCircle, CheckCircle2, Plus, Trash2, ArrowRight } from 'lucide-react';

interface ReviewCycle {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'Planning' | 'Active' | 'Closed' | 'Finalized';
}

export const ReviewCycleManagement: React.FC = () => {
  const {
    reviewCycles,
    loadingCycles,
    fetchReviewCycles,
    createReviewCycle,
    transitionCycleStatus,
    deleteReviewCycle,
    error,
    clearError,
  } = usePerformanceStore();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState<ReviewCycle | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    selfReviewDeadline: '',
    peerReviewDeadline: '',
    managerReviewDeadline: '',
  });

  useEffect(() => {
    fetchReviewCycles();
  }, [fetchReviewCycles]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = (): boolean => {
    if (
      !formData.name.trim() ||
      !formData.startDate ||
      !formData.endDate ||
      !formData.selfReviewDeadline ||
      !formData.peerReviewDeadline ||
      !formData.managerReviewDeadline
    ) {
      return false;
    }
    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      return false;
    }
    return true;
  };

  const handleCreateCycle = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      clearError();
      await createReviewCycle(formData);
      setSuccess(true);
      setFormData({
        name: '',
        startDate: '',
        endDate: '',
        selfReviewDeadline: '',
        peerReviewDeadline: '',
        managerReviewDeadline: '',
      });
      setTimeout(() => {
        setSuccess(false);
        setIsCreateOpen(false);
      }, 1500);
    } catch (err) {
      // error is already set in the store and shown inside the dialog
    } finally {
      setLoading(false);
    }
  };

  const handleTransitionStatus = async (cycle: ReviewCycle) => {
    const statusFlow: Record<string, string> = {
      Planning: 'Active',
      Active: 'Closed',
      Closed: 'Finalized',
    };

    const nextStatus = statusFlow[cycle.status];
    if (!nextStatus) return;

    try {
      setLoading(true);
      clearError();
      await transitionCycleStatus(cycle.id, nextStatus);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
      fetchReviewCycles();  // refresh so status badge updates
    } catch (err) {
      // error shown via store error state
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCycle = async () => {
    if (!selectedCycle) return;

    try {
      setLoading(true);
      clearError();
      await deleteReviewCycle(selectedCycle.id);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
      setIsDeleteOpen(false);
      setSelectedCycle(null);
      fetchReviewCycles();
    } catch (err) {
      console.error('Failed to delete cycle:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Planning':
        return 'bg-info text-info-foreground';
      case 'Active':
        return 'bg-warning text-warning-foreground';
      case 'Closed':
        return 'bg-muted text-muted-foreground';
      case 'Finalized':
        return 'bg-success text-success-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getNextStatus = (status: string) => {
    const flow: Record<string, string> = {
      Planning: 'Active',
      Active: 'Closed',
      Closed: 'Finalized',
    };
    return flow[status];
  };

  if (loadingCycles) {
    return <div className="text-center py-8">Loading review cycles...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Review Cycle Management</h2>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Cycle
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Review Cycle</DialogTitle>
              <DialogDescription>Set up a new performance review cycle</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {error && (
                <div className="flex gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                  <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {success && (
                <div className="flex gap-2 p-3 bg-success/10 border border-success/20 rounded-md">
                  <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-success">Cycle created successfully</p>
                </div>
              )}

              <div>
                <Label htmlFor="name">Cycle Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Q1 2026 Performance Review"
                  aria-label="Review cycle name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    name="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="selfReviewDeadline">Self Review Deadline</Label>
                  <Input
                    id="selfReviewDeadline"
                    name="selfReviewDeadline"
                    type="date"
                    value={formData.selfReviewDeadline}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <Label htmlFor="peerReviewDeadline">Peer Review Deadline</Label>
                  <Input
                    id="peerReviewDeadline"
                    name="peerReviewDeadline"
                    type="date"
                    value={formData.peerReviewDeadline}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="managerReviewDeadline">Manager Review Deadline</Label>
                <Input
                  id="managerReviewDeadline"
                  name="managerReviewDeadline"
                  type="date"
                  value={formData.managerReviewDeadline}
                  onChange={handleInputChange}
                />
              </div>

              <Button onClick={handleCreateCycle} disabled={loading} className="w-full">
                {loading ? 'Creating...' : 'Create Cycle'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {success && (
        <div className="flex gap-2 p-3 bg-success/10 border border-success/20 rounded-md">
          <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
          <p className="text-sm text-success">Operation completed successfully</p>
        </div>
      )}

      {/* Cycles List */}
      <div className="grid gap-4">
        {reviewCycles.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              No review cycles found. Create one to get started.
            </CardContent>
          </Card>
        ) : (
          reviewCycles.map((cycle) => (
            <Card key={cycle.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{cycle.name}</CardTitle>
                    <CardDescription>
                      {new Date(cycle.startDate).toLocaleDateString()} -{' '}
                      {new Date(cycle.endDate).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(cycle.status)}>{cycle.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  {getNextStatus(cycle.status) && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleTransitionStatus(cycle)}
                      disabled={loading}
                    >
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Move to {getNextStatus(cycle.status)}
                    </Button>
                  )}

                  <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setSelectedCycle(cycle)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                    {selectedCycle?.id === cycle.id && (
                      <AlertDialogContent>
                        <AlertDialogTitle>Delete Review Cycle</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this review cycle? This action cannot be
                          undone.
                        </AlertDialogDescription>
                        <div className="flex gap-2 justify-end">
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDeleteCycle}
                            disabled={loading}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {loading ? 'Deleting...' : 'Delete'}
                          </AlertDialogAction>
                        </div>
                      </AlertDialogContent>
                    )}
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
