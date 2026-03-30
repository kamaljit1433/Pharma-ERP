import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { recruitmentService } from '../../services/recruitmentService';
import { OnboardingChecklist as OnboardingChecklistType } from '../../types/recruitment';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';

interface OnboardingChecklistProps {
  employeeId: string;
  employeeName: string;
}

export const OnboardingChecklist: React.FC<OnboardingChecklistProps> = ({ employeeId, employeeName }) => {
  const [checklist, setChecklist] = useState<OnboardingChecklistType | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState<string | null>(null);

  useEffect(() => {
    loadChecklist();
  }, [employeeId]);

  const loadChecklist = async () => {
    try {
      const response = await recruitmentService.getOnboardingChecklist(employeeId);
      setChecklist(response.data);
    } catch (error) {
      console.error('Failed to load checklist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteItem = async (itemId: string) => {
    setCompleting(itemId);
    try {
      await recruitmentService.completeChecklistItem(itemId);
      await loadChecklist();
    } catch (error) {
      console.error('Failed to complete item:', error);
    } finally {
      setCompleting(null);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading checklist...</div>;
  }

  if (!checklist) {
    return (
      <Card className="border-border">
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">No onboarding checklist found</p>
        </CardContent>
      </Card>
    );
  }

  const completedCount = checklist.items.filter((item) => item.completed).length;
  const totalCount = checklist.items.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle>Onboarding Checklist</CardTitle>
        <CardDescription>
          {employeeName} - {completedCount} of {totalCount} items completed ({completionPercentage}%)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="w-full bg-muted rounded-full h-2">
          <div className="bg-success h-2 rounded-full transition-all" style={{ width: `${completionPercentage}%` }} />
        </div>

        <div className="space-y-3">
          {checklist.items.map((item) => (
            <div key={item.id} className="flex items-start gap-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition">
              <div className="mt-1">
                {item.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-success" />
                ) : (
                  <Circle className="w-5 h-5 text-muted-foreground" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className={`font-medium text-sm ${item.completed ? 'line-through text-muted-foreground' : ''}`}>{item.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                {item.assigned_to && <p className="text-xs text-muted-foreground mt-1">Assigned to: {item.assigned_to}</p>}
                {item.completed && item.completed_at && (
                  <p className="text-xs text-success mt-1">Completed on {new Date(item.completed_at).toLocaleDateString()}</p>
                )}
              </div>

              {!item.completed && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCompleteItem(item.id)}
                  disabled={completing === item.id}
                  className="ml-2"
                >
                  {completing === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Complete'}
                </Button>
              )}
            </div>
          ))}
        </div>

        {completionPercentage === 100 && (
          <div className="p-4 bg-success/10 text-success rounded-lg text-center font-medium">
            ✓ Onboarding complete! Welcome to the team!
          </div>
        )}
      </CardContent>
    </Card>
  );
};
