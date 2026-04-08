import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Mail, Send, AlertCircle } from 'lucide-react';
import { recruitmentService } from '../../services/recruitmentService';

interface CandidateCommunicationFormProps {
  applicantId: string;
  applicantEmail: string;
  applicantName: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const CandidateCommunicationForm: React.FC<CandidateCommunicationFormProps> = ({
  applicantId,
  applicantEmail,
  applicantName,
  onSuccess,
  onError,
}) => {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validation
    if (!subject.trim()) {
      setError('Subject is required');
      onError?.('Subject is required');
      return;
    }

    if (!body.trim()) {
      setError('Message body is required');
      onError?.('Message body is required');
      return;
    }

    setIsLoading(true);

    try {
      await recruitmentService.sendCommunication({
        applicant_id: applicantId,
        subject: subject.trim(),
        body: body.trim(),
      });

      setSuccess(true);
      setSubject('');
      setBody('');
      onSuccess?.();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send email';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Send Email to Candidate
        </CardTitle>
        <CardDescription>
          Send an email to {applicantName} ({applicantEmail})
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5">✓</div>
              <p className="text-sm text-green-700">Email sent successfully!</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              placeholder="Email subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={isLoading}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Message *</Label>
            <Textarea
              id="body"
              placeholder="Write your message here..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              disabled={isLoading}
              rows={8}
              className="w-full resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {body.length} characters
            </p>
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSubject('');
                setBody('');
                setError(null);
              }}
              disabled={isLoading}
            >
              Clear
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !subject.trim() || !body.trim()}
              className="gap-2"
            >
              <Send className="w-4 h-4" />
              {isLoading ? 'Sending...' : 'Send Email'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
