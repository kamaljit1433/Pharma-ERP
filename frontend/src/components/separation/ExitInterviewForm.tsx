import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface ExitInterviewFormProps {
  exitInterviewId: string;
  onSubmit: (data: ExitInterviewData) => Promise<void>;
  isLoading?: boolean;
}

interface ExitInterviewData {
  conducted_by: string;
  questionnaire_responses: Record<string, string>;
  feedback: string;
}

const DEFAULT_QUESTIONS = [
  'What was your overall experience working with us?',
  'How would you rate your manager and team?',
  'What could we improve as an organization?',
  'Would you recommend us as an employer?',
  'Any final comments or suggestions?',
];

export const ExitInterviewForm: React.FC<ExitInterviewFormProps> = ({
  exitInterviewId,
  onSubmit,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<ExitInterviewData>({
    conducted_by: '',
    questionnaire_responses: DEFAULT_QUESTIONS.reduce(
      (acc, _, idx) => ({
        ...acc,
        [`question_${idx + 1}`]: '',
      }),
      {}
    ),
    feedback: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleResponseChange = (questionKey: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      questionnaire_responses: {
        ...prev.questionnaire_responses,
        [questionKey]: value,
      },
    }));
  };

  const handleFeedbackChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      feedback: value,
    }));
  };

  const handleConductedByChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      conducted_by: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!formData.conducted_by) {
      setError('Conducted by field is required');
      return;
    }

    if (!formData.feedback) {
      setError('Feedback is required');
      return;
    }

    try {
      await onSubmit(formData);
      setSuccess(true);
      setFormData({
        conducted_by: '',
        questionnaire_responses: DEFAULT_QUESTIONS.reduce(
          (acc, _, idx) => ({
            ...acc,
            [`question_${idx + 1}`]: '',
          }),
          {}
        ),
        feedback: '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit exit interview');
    }
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Exit Interview Form</CardTitle>
        <CardDescription>
          Please complete this exit interview to gather feedback from the departing employee.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-md">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-3 bg-success/10 text-success rounded-md">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm">Exit interview submitted successfully</span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="conducted_by">Conducted By (HR Employee ID)</Label>
            <input
              id="conducted_by"
              type="text"
              placeholder="e.g., HR-EMP-001"
              value={formData.conducted_by}
              onChange={(e) => handleConductedByChange(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md"
              required
            />
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Questionnaire</h3>
            {DEFAULT_QUESTIONS.map((question, idx) => (
              <div key={idx} className="space-y-2">
                <Label htmlFor={`question_${idx + 1}`}>{question}</Label>
                <Textarea
                  id={`question_${idx + 1}`}
                  placeholder="Please provide your response..."
                  value={formData.questionnaire_responses[`question_${idx + 1}`] || ''}
                  onChange={(e) => handleResponseChange(`question_${idx + 1}`, e.target.value)}
                  rows={3}
                />
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="feedback">Overall Feedback & Comments</Label>
            <Textarea
              id="feedback"
              placeholder="Provide your overall assessment and any additional comments..."
              value={formData.feedback}
              onChange={(e) => handleFeedbackChange(e.target.value)}
              rows={4}
              required
            />
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? 'Submitting...' : 'Submit Exit Interview'}
            </Button>
            <Button type="button" variant="outline" className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
