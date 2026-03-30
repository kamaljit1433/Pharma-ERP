import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { usePerformanceStore } from '../../store/performanceStore';
import { AlertCircle, CheckCircle2, Plus, TrendingDown } from 'lucide-react';

interface PIP {
  id: string;
  employeeId: string;
  initiatedBy: string;
  goalIds: string[];
  startDate: string;
  endDate: string;
  status: 'Active' | 'Completed';
  outcome?: 'Completed' | 'Extended' | 'Escalated';
  createdAt: string;
}

export const PIPManagement: React.FC = () => {
  const {
    pips,
    loadingPIPs,
    fetchActivePIPs,
    initiatePIP,
    recordPIPOutcome,
    error,
    clearError,
  } = usePerformanceStore();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isOutcomeOpen, setIsOutcomeOpen] = useState(false);
  const [selectedPIP, setSelectedPIP] = useState<PIP | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: '',
    goalIds: '',
    startDate: '',
    endDate: '',
  });
  const [outcomeData, setOutcomeData] = useState({
    outcome: 'Completed' as 'Completed' | 'Extended' | 'Escalated',
    notes: '',
  });

  useEffect(() => {
    fetchActivePIPs();
  }, [fetchActivePIPs]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOutcomeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setOutcomeData((prev) => ({ ...prev, notes: e.target.value }));
  };

  const validateCreateForm = (): boolean => {
    if (!formData.employeeId.trim() || !formData.goalIds.trim()) {
      return false;
    }
    if (!formData.startDate || !formData.endDate) {
      return false;
    }
    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      return false;
    }
    return true;
  };

  const handleCreatePIP = async () => {
    if (!validateCreateForm()) {
      return;
    }

    try {
      setLoading(true);
      clearError();
      await initiatePIP({
        employeeId: formData.employeeId,
        goalIds: formData.goalIds.split(',').map((id) => id.trim()),
        startDate: formData.startDate,
        endDate: formData.endDate,
      });
      setSuccess(true);
      setFormData({ employeeId: '', goalIds: '', startDate: '', endDate: '' });
      setTimeout(() => setSuccess(false), 2000);
      setIsCreateOpen(false);
      fetchActivePIPs();
    } catch (err) {
      console.error('Failed to create PIP:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordOutcome = async () => {
    if (!selectedPIP) return;

    try {
      setLoading(true);
      clearError();
      await recordPIPOutcome(selectedPIP.id, outcomeData.outcome, outcomeData.notes);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
      setIsOutcomeOpen(false);
      setSelectedPIP(null);
      setOutcomeData({ outcome: 'Completed', notes: '' });
      fetchActivePIPs();
    } catch (err) {
      console.error('Failed to record outcome:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-warning text-warning-foreground';
      case 'Completed':
        return 'bg-success text-success-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getOutcomeColor = (outcome?: string) => {
    switch (outcome) {
      case 'Completed':
        return 'bg-success text-success-foreground';
      case 'Extended':
        return 'bg-warning text-warning-foreground';
      case 'Escalated':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (loadingPIPs) {
    return <div className="text-center py-8">Loading PIPs...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Performance Improvement Plans</h2>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create PIP
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Initiate Performance Improvement Plan</DialogTitle>
              <DialogDescription>Create a new PIP for an employee</DialogDescription>
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
                  <p className="text-sm text-success">PIP created successfully</p>
                </div>
              )}

              <div>
                <Label htmlFor="employeeId">Employee ID</Label>
                <Input
                  id="employeeId"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleInputChange}
                  placeholder="Enter employee ID"
                  aria-label="Employee ID"
                />
              </div>

              <div>
                <Label htmlFor="goalIds">Goal IDs (comma-separated)</Label>
                <Input
                  id="goalIds"
                  name="goalIds"
                  value={formData.goalIds}
                  onChange={handleInputChange}
                  placeholder="e.g., goal1, goal2, goal3"
                  aria-label="Goal IDs"
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
                    aria-label="PIP start date"
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
                    aria-label="PIP end date"
                  />
                </div>
              </div>

              <Button onClick={handleCreatePIP} disabled={loading} className="w-full">
                {loading ? 'Creating...' : 'Create PIP'}
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

      {/* PIPs List */}
      <div className="grid gap-4">
        {pips.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              No active PIPs. Create one to get started.
            </CardContent>
          </Card>
        ) : (
          pips.map((pip) => (
            <Card key={pip.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <TrendingDown className="w-5 h-5 mt-1 text-muted-foreground" />
                    <div>
                      <CardTitle>Employee: {pip.employeeId}</CardTitle>
                      <CardDescription>
                        {new Date(pip.startDate).toLocaleDateString()} -{' '}
                        {new Date(pip.endDate).toLocaleDateString()}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getStatusColor(pip.status)}>{pip.status}</Badge>
                    {pip.outcome && <Badge className={getOutcomeColor(pip.outcome)}>{pip.outcome}</Badge>}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Goals</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {pip.goalIds.map((goalId) => (
                      <Badge key={goalId} variant="outline">
                        {goalId}
                      </Badge>
                    ))}
                  </div>
                </div>

                {pip.status === 'Active' && !pip.outcome && (
                  <Dialog open={isOutcomeOpen} onOpenChange={setIsOutcomeOpen}>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedPIP(pip)}
                      >
                        Record Outcome
                      </Button>
                    </DialogTrigger>
                    {selectedPIP?.id === pip.id && (
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Record PIP Outcome</DialogTitle>
                          <DialogDescription>
                            Document the outcome of this performance improvement plan
                          </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="outcome">Outcome</Label>
                            <Select
                              value={outcomeData.outcome}
                              onValueChange={(value) =>
                                setOutcomeData((prev) => ({
                                  ...prev,
                                  outcome: value as 'Completed' | 'Extended' | 'Escalated',
                                }))
                              }
                            >
                              <SelectTrigger id="outcome">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Completed">Completed</SelectItem>
                                <SelectItem value="Extended">Extended</SelectItem>
                                <SelectItem value="Escalated">Escalated</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea
                              id="notes"
                              value={outcomeData.notes}
                              onChange={handleOutcomeChange}
                              placeholder="Add any notes about the outcome"
                              rows={3}
                              aria-label="Outcome notes"
                            />
                          </div>

                          <Button
                            onClick={handleRecordOutcome}
                            disabled={loading}
                            className="w-full"
                          >
                            {loading ? 'Recording...' : 'Record Outcome'}
                          </Button>
                        </div>
                      </DialogContent>
                    )}
                  </Dialog>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
