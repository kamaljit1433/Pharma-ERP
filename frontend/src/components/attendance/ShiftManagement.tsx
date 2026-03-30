/**
 * Shift Management Component
 * Admin component for managing shifts
 */

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { AlertCircle, CheckCircle2, Plus, Edit2, Trash2 } from 'lucide-react';

interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  breakDuration: number;
  type: 'Fixed' | 'Rotating' | 'Flexible';
}

interface ShiftManagementProps {
  onShiftCreated?: (shift: Shift) => void;
  onShiftUpdated?: (shift: Shift) => void;
  onShiftDeleted?: (shiftId: string) => void;
}

export const ShiftManagement: React.FC<ShiftManagementProps> = ({
  onShiftCreated,
  onShiftUpdated,
  onShiftDeleted,
}) => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    startTime: '09:00',
    endTime: '17:00',
    breakDuration: 60,
    type: 'Fixed' as const,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    fetchShifts();
  }, []);

  const fetchShifts = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/v1/attendance/shifts');

      if (!response.ok) {
        throw new Error('Failed to fetch shifts');
      }

      const data = await response.json();
      setShifts(data.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load shifts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSubmitError(null);
      setIsSubmitting(true);

      if (!formData.name.trim()) {
        setSubmitError('Shift name is required');
        return;
      }

      const response = await fetch('/api/v1/attendance/shifts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to create shift');
      }

      const data = await response.json();
      setShifts([...shifts, data.data]);
      setSubmitSuccess(true);
      onShiftCreated?.(data.data);

      setTimeout(() => {
        setIsDialogOpen(false);
        resetForm();
      }, 1500);
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to create shift');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      startTime: '09:00',
      endTime: '17:00',
      breakDuration: 60,
      type: 'Fixed',
    });
    setSubmitError(null);
    setSubmitSuccess(false);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      resetForm();
    }
  };

  const getShiftTypeColor = (type: string) => {
    switch (type) {
      case 'Fixed':
        return 'bg-info text-info-foreground';
      case 'Rotating':
        return 'bg-warning text-warning-foreground';
      case 'Flexible':
        return 'bg-success text-success-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Shift Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Shift Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Shift Management</CardTitle>
          <Button onClick={() => setIsDialogOpen(true)} size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            New Shift
          </Button>
        </CardHeader>
        <CardContent>
          {shifts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No shifts configured yet
            </div>
          ) : (
            <div className="grid gap-4">
              {shifts.map((shift) => (
                <div
                  key={shift.id}
                  className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{shift.name}</h3>
                        <Badge className={getShiftTypeColor(shift.type)}>
                          {shift.type}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">Time:</span> {shift.startTime} -{' '}
                          {shift.endTime}
                        </div>
                        <div>
                          <span className="font-medium">Break:</span> {shift.breakDuration} min
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Shift Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Shift</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Shift Name */}
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Shift Name
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Morning Shift"
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                disabled={isSubmitting || submitSuccess}
              />
            </div>

            {/* Start Time */}
            <div className="space-y-2">
              <label htmlFor="startTime" className="text-sm font-medium">
                Start Time
              </label>
              <input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                disabled={isSubmitting || submitSuccess}
              />
            </div>

            {/* End Time */}
            <div className="space-y-2">
              <label htmlFor="endTime" className="text-sm font-medium">
                End Time
              </label>
              <input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                disabled={isSubmitting || submitSuccess}
              />
            </div>

            {/* Break Duration */}
            <div className="space-y-2">
              <label htmlFor="breakDuration" className="text-sm font-medium">
                Break Duration (minutes)
              </label>
              <input
                id="breakDuration"
                type="number"
                value={formData.breakDuration}
                onChange={(e) =>
                  setFormData({ ...formData, breakDuration: parseInt(e.target.value) })
                }
                min="0"
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                disabled={isSubmitting || submitSuccess}
              />
            </div>

            {/* Shift Type */}
            <div className="space-y-2">
              <label htmlFor="type" className="text-sm font-medium">
                Shift Type
              </label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value as 'Fixed' | 'Rotating' | 'Flexible',
                  })
                }
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                disabled={isSubmitting || submitSuccess}
              >
                <option value="Fixed">Fixed</option>
                <option value="Rotating">Rotating</option>
                <option value="Flexible">Flexible</option>
              </select>
            </div>

            {/* Error Message */}
            {submitError && (
              <div className="flex gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{submitError}</p>
              </div>
            )}

            {/* Success Message */}
            {submitSuccess && (
              <div className="flex gap-2 p-3 bg-success/10 border border-success/20 rounded-md">
                <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                <p className="text-sm text-success">Shift created successfully!</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting || submitSuccess}
                className="flex-1"
              >
                {isSubmitting ? 'Creating...' : 'Create Shift'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleDialogOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
