import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { recruitmentService } from '../../services/recruitmentService';
import { JobPosting } from '../../types/recruitment';
import { Briefcase, MapPin, Users, Calendar, AlertCircle, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface JobPostingDetailsProps {
  jobId: string;
  onEdit?: (job: JobPosting) => void;
  onClose?: () => void;
}

export const JobPostingDetails: React.FC<JobPostingDetailsProps> = ({ jobId, onEdit, onClose }) => {
  const [job, setJob] = useState<JobPosting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await recruitmentService.getJobPosting(jobId);
        setJob(data);
      } catch (err) {
        setError((err as Error).message || 'Failed to load job posting details');
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [jobId]);

  if (loading) {
    return (
      <Card className="border-border">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-border">
        <CardContent className="py-6">
          <div className="flex items-start gap-3 text-destructive">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Error Loading Job Posting</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!job) {
    return (
      <Card className="border-border">
        <CardContent className="py-6">
          <p className="text-muted-foreground">Job posting not found</p>
        </CardContent>
      </Card>
    );
  }

  const statusColors: Record<string, string> = {
    Open: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    Closed: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    'On Hold': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              {job.title}
            </CardTitle>
            <CardDescription className="mt-2">
              Posted {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
            </CardDescription>
          </div>
          <Badge className={statusColors[job.status] || 'bg-gray-100'}>
            {job.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Key Information */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Location</p>
              <p className="font-medium">{job.location}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Deadline</p>
              <p className="font-medium">
                {new Date(job.application_deadline).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Experience Requirements */}
        <div>
          <h3 className="font-semibold mb-2">Experience Requirements</h3>
          <p className="text-sm text-muted-foreground">
            {job.experience_min} - {job.experience_max} years
          </p>
        </div>

        <Separator />

        {/* Required Skills */}
        <div>
          <h3 className="font-semibold mb-3">Required Skills</h3>
          <div className="flex flex-wrap gap-2">
            {job.required_skills.map((skill, index) => (
              <Badge key={index} variant="secondary">
                {skill}
              </Badge>
            ))}
          </div>
        </div>

        <Separator />

        {/* Job Description */}
        <div>
          <h3 className="font-semibold mb-2">Job Description</h3>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {job.description}
          </p>
        </div>

        <Separator />

        {/* Department Information */}
        <div>
          <h3 className="font-semibold mb-2">Department</h3>
          <p className="text-sm text-muted-foreground">{job.department_id}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          {onEdit && (
            <Button onClick={() => onEdit(job)} variant="default">
              Edit Job Posting
            </Button>
          )}
          {onClose && (
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
