import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { DateTimePicker } from '../ui/date-time-picker';
import { recruitmentService } from '../../services/recruitmentService';
import { Calendar } from 'lucide-react';

interface InterviewSchedulerProps {
  applicantId: string;
  applicantName: string;
  onSuccess?: () => void;
}

export const InterviewScheduler: React.FC<InterviewSchedulerProps> = ({ applicantId, applicantName, onSuccess }) => {
  const [formData, setFormData] = useState({
    scheduled_at: '',
    mode: 'Video' as 'In-Person' | 'Video' | 'Phone',
    interviewers: [] as string[],
  });

  const [interviewerInput, setInterviewerInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addInterviewer = () => {
    if (interviewerInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        interviewers: [...prev.interviewers, interviewerInput.trim()],
      }));
      setInterviewerInput('');
    }
  };

  const removeInterviewer = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      interviewers: prev.interviewers.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const modeToType: Record<string, string> = { 'In-Person': 'in_person', 'Video': 'video', 'Phone': 'phone' };
      await recruitmentService.scheduleInterview({
        applicant_id: applicantId,
        scheduled_at: new Date(formData.scheduled_at),
        type: modeToType[formData.mode] as any,
        interviewers: formData.interviewers,
      });

      setFormData({
        scheduled_at: '',
        mode: 'Video',
        interviewers: [],
      });
      onSuccess?.();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Schedule Interview
        </CardTitle>
        <CardDescription>Schedule an interview for {applicantName}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">{error}</div>}

          <div>
            <Label htmlFor="scheduled_at">Interview Date & Time</Label>
            <DateTimePicker
              id="scheduled_at"
              value={formData.scheduled_at}
              onChange={(val) => setFormData((prev) => ({ ...prev, scheduled_at: val }))}
              placeholder="Select date & time"
            />
          </div>

          <div>
            <Label htmlFor="mode">Interview Mode</Label>
            <select
              id="mode"
              name="mode"
              value={formData.mode}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-input rounded-md bg-background"
            >
              <option value="Video">Video Call</option>
              <option value="In-Person">In-Person</option>
              <option value="Phone">Phone Call</option>
            </select>
          </div>

          <div>
            <Label>Interviewers</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={interviewerInput}
                onChange={(e) => setInterviewerInput(e.target.value)}
                placeholder="Enter interviewer ID or email"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterviewer())}
              />
              <Button type="button" onClick={addInterviewer} variant="outline" size="sm">
                Add
              </Button>
            </div>
            <div className="space-y-2">
              {formData.interviewers.map((interviewer, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-sm">{interviewer}</span>
                  <button
                    type="button"
                    onClick={() => removeInterviewer(index)}
                    className="text-destructive hover:underline text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Scheduling...' : 'Schedule Interview'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
