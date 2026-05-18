import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { usePerformanceStore } from '../../store/performanceStore';
import { AlertCircle, CheckCircle2, MessageSquare } from 'lucide-react';
import { EmployeeSearch } from './EmployeeSearch';

interface FeedbackFormProps {
  excludeEmployeeId?: string;
  onSuccess?: () => void;
}

export const FeedbackForm: React.FC<FeedbackFormProps> = ({ excludeEmployeeId, onSuccess }) => {
  const { provideFeedback, error, clearError } = usePerformanceStore();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [toEmployeeId, setToEmployeeId] = useState('');
  const [formData, setFormData] = useState({
    type: 'Positive' as 'Positive' | 'Constructive' | 'Neutral',
    content: '',
    isAnonymous: false,
    visibility: 'Private' as 'Private' | 'Manager Only' | 'Public',
  });

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isAnonymous: checked }));
  };

  const validateForm = (): boolean => {
    if (!toEmployeeId) return false;
    if (formData.content.length < 10 || formData.content.length > 5000) return false;
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      clearError();
      await provideFeedback({
        toEmployeeId,
        type: formData.type,
        content: formData.content,
        isAnonymous: formData.isAnonymous,
        visibility: formData.visibility,
      });
      setSuccess(true);
      setToEmployeeId('');
      setFormData({
        type: 'Positive',
        content: '',
        isAnonymous: false,
        visibility: 'Private',
      });
      setTimeout(() => setSuccess(false), 3000);
      onSuccess?.();
    } catch (err) {
      console.error('Failed to provide feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  const contentLength = formData.content.length;
  const isValidLength = contentLength >= 10 && contentLength <= 5000;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          <div>
            <CardTitle>Provide Feedback</CardTitle>
            <CardDescription>Share constructive feedback with your colleague</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="flex gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {success && (
            <div className="flex gap-2 p-3 bg-success/10 border border-success/20 rounded-md">
              <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <p className="text-sm text-success">Feedback submitted successfully</p>
            </div>
          )}

          <EmployeeSearch
            label="Recipient Employee"
            placeholder="Search employee by name or ID..."
            onChange={(id) => setToEmployeeId(id)}
            excludeId={excludeEmployeeId}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Feedback Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: string) => handleSelectChange('type', value)}
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Positive">Positive</SelectItem>
                  <SelectItem value="Constructive">Constructive</SelectItem>
                  <SelectItem value="Neutral">Neutral</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="visibility">Visibility</Label>
              <Select
                value={formData.visibility}
                onValueChange={(value: string) => handleSelectChange('visibility', value)}
              >
                <SelectTrigger id="visibility">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Private">Private (Only recipient)</SelectItem>
                  <SelectItem value="Manager Only">Manager Only</SelectItem>
                  <SelectItem value="Public">Public</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="content">Feedback Content</Label>
            <Textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
              placeholder="Share your feedback (10-5000 characters)"
              rows={5}
            />
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-muted-foreground">{contentLength} / 5000 characters</p>
              {!isValidLength && contentLength > 0 && (
                <p className="text-xs text-destructive">
                  {contentLength < 10 ? 'Minimum 10 characters' : 'Maximum 5000 characters'}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="isAnonymous"
              checked={formData.isAnonymous}
              onCheckedChange={handleCheckboxChange}
            />
            <Label htmlFor="isAnonymous" className="cursor-pointer">
              Submit Anonymously
            </Label>
          </div>

          <Button
            type="submit"
            disabled={loading || !isValidLength || !toEmployeeId}
            className="w-full"
          >
            {loading ? 'Submitting Feedback...' : 'Submit Feedback'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
