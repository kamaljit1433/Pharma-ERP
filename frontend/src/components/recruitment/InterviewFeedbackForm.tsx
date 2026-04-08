import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { recruitmentService } from '../../services/recruitmentService';
import { Star, Send } from 'lucide-react';

interface InterviewFeedbackFormProps {
  interviewId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface FeedbackData {
  rating: number;
  technical_score: number;
  communication_score: number;
  cultural_fit_score: number;
  overall_impression: string;
  recommendation: 'Strong Hire' | 'Hire' | 'Maybe' | 'No Hire';
}

export const InterviewFeedbackForm: React.FC<InterviewFeedbackFormProps> = ({
  interviewId,
  onSuccess,
  onCancel,
}) => {
  const [formData, setFormData] = useState<FeedbackData>({
    rating: 0,
    technical_score: 0,
    communication_score: 0,
    cultural_fit_score: 0,
    overall_impression: '',
    recommendation: 'Maybe',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleScoreChange = (field: keyof FeedbackData, value: number) => {
    if (typeof value === 'number' && value >= 0 && value <= 5) {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = (): boolean => {
    if (formData.rating === 0) {
      setError('Overall rating is required');
      return false;
    }
    if (formData.technical_score === 0) {
      setError('Technical score is required');
      return false;
    }
    if (formData.communication_score === 0) {
      setError('Communication score is required');
      return false;
    }
    if (formData.cultural_fit_score === 0) {
      setError('Cultural fit score is required');
      return false;
    }
    if (!formData.overall_impression.trim()) {
      setError('Overall impression is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await recruitmentService.submitInterviewFeedback(interviewId, formData);
      onSuccess?.();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const ScoreInput: React.FC<{
    label: string;
    field: keyof FeedbackData;
    value: number;
  }> = ({ label, field, value }) => (
    <div>
      <Label className="mb-2 block">{label}</Label>
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((score) => (
            <button
              key={score}
              type="button"
              onClick={() => handleScoreChange(field, score)}
              className="focus:outline-none transition-transform hover:scale-110"
            >
              <Star
                className={`w-6 h-6 ${
                  score <= value
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-muted-foreground'
                }`}
              />
            </button>
          ))}
        </div>
        <span className="text-sm font-medium ml-2">{value}/5</span>
      </div>
    </div>
  );

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="w-5 h-5" />
          Interview Feedback
        </CardTitle>
        <CardDescription>Provide feedback for this interview</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Overall Rating */}
          <ScoreInput label="Overall Rating" field="rating" value={formData.rating} />

          {/* Technical Score */}
          <ScoreInput label="Technical Skills" field="technical_score" value={formData.technical_score} />

          {/* Communication Score */}
          <ScoreInput
            label="Communication Skills"
            field="communication_score"
            value={formData.communication_score}
          />

          {/* Cultural Fit Score */}
          <ScoreInput
            label="Cultural Fit"
            field="cultural_fit_score"
            value={formData.cultural_fit_score}
          />

          {/* Overall Impression */}
          <div>
            <Label htmlFor="overall_impression">Overall Impression</Label>
            <textarea
              id="overall_impression"
              name="overall_impression"
              value={formData.overall_impression}
              onChange={handleTextChange}
              placeholder="Provide detailed feedback about the candidate..."
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary mt-2 min-h-24"
              required
            />
          </div>

          {/* Recommendation */}
          <div>
            <Label htmlFor="recommendation">Recommendation</Label>
            <select
              id="recommendation"
              name="recommendation"
              value={formData.recommendation}
              onChange={handleTextChange}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary mt-2"
            >
              <option value="Strong Hire">Strong Hire</option>
              <option value="Hire">Hire</option>
              <option value="Maybe">Maybe</option>
              <option value="No Hire">No Hire</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Submitting...' : 'Submit Feedback'}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
