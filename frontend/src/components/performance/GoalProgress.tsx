import React, { useState } from 'react';
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
import { Progress } from '../ui/progress';
import { usePerformanceStore } from '../../store/performanceStore';
import { TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Goal {
  id: string;
  title: string;
  description: string;
  type: 'OKR' | 'KPI';
  targetValue: number;
  currentValue: number;
  unit: string;
  weight: number;
  dueDate: string;
  status: 'On Track' | 'At Risk' | 'Behind' | 'Completed';
}

interface GoalProgressProps {
  goal: Goal;
  onProgressUpdate?: () => void;
}

export const GoalProgress: React.FC<GoalProgressProps> = ({ goal, onProgressUpdate }) => {
  const { updateGoalProgress, error, clearError } = usePerformanceStore();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [progressData, setProgressData] = useState({
    currentValue: goal.currentValue.toString(),
    comment: '',
  });

  const completionPercentage = Math.min(
    (goal.currentValue / goal.targetValue) * 100,
    100
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-success text-success-foreground';
      case 'On Track':
        return 'bg-info text-info-foreground';
      case 'At Risk':
        return 'bg-warning text-warning-foreground';
      case 'Behind':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const handleUpdateProgress = async () => {
    try {
      setLoading(true);
      clearError();
      await updateGoalProgress(
        goal.id,
        parseFloat(progressData.currentValue),
        progressData.comment
      );
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setIsOpen(false);
      }, 2000);
      onProgressUpdate?.();
    } catch (err) {
      console.error('Failed to update progress:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <TrendingUp className="w-5 h-5 mt-1 text-muted-foreground" />
            <div className="flex-1">
              <CardTitle className="text-lg">{goal.title}</CardTitle>
              <CardDescription>{goal.description}</CardDescription>
            </div>
          </div>
          <Badge className={getStatusColor(goal.status)}>{goal.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Goal Type and Weight */}
        <div className="flex gap-2">
          <Badge variant="secondary">{goal.type}</Badge>
          <Badge variant="outline">Weight: {goal.weight}%</Badge>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{completionPercentage.toFixed(1)}%</span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </div>

        {/* Values */}
        <div className="grid grid-cols-3 gap-4 p-3 bg-muted/50 rounded-lg">
          <div>
            <p className="text-xs text-muted-foreground">Current</p>
            <p className="font-semibold">
              {goal.currentValue} {goal.unit}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Target</p>
            <p className="font-semibold">
              {goal.targetValue} {goal.unit}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Due Date</p>
            <p className="font-semibold">{new Date(goal.dueDate).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Update Progress Dialog */}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
              Update Progress
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Goal Progress</DialogTitle>
              <DialogDescription>Record your progress towards this goal</DialogDescription>
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
                  <p className="text-sm text-success">Progress updated successfully</p>
                </div>
              )}

              <div>
                <Label htmlFor="currentValue">Current Value</Label>
                <Input
                  id="currentValue"
                  type="number"
                  step="0.01"
                  value={progressData.currentValue}
                  onChange={(e) =>
                    setProgressData((prev) => ({ ...prev, currentValue: e.target.value }))
                  }
                  aria-label="Current progress value"
                />
              </div>

              <div>
                <Label htmlFor="comment">Comment</Label>
                <Textarea
                  id="comment"
                  value={progressData.comment}
                  onChange={(e) =>
                    setProgressData((prev) => ({ ...prev, comment: e.target.value }))
                  }
                  placeholder="Add any notes about your progress"
                  rows={3}
                  aria-label="Progress comment"
                />
              </div>

              <Button onClick={handleUpdateProgress} disabled={loading} className="w-full">
                {loading ? 'Updating...' : 'Update Progress'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
