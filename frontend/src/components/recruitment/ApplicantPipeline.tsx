import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { recruitmentService } from '../../services/recruitmentService';
import { Applicant } from '../../types/recruitment';
import { UserCheck, Mail, Phone, FileText } from 'lucide-react';

interface ApplicantPipelineProps {
  jobPostingId?: string;
}

export const ApplicantPipeline: React.FC<ApplicantPipelineProps> = ({ jobPostingId }) => {
  const [applicants, setApplicants] = useState<Record<string, Applicant[]>>({
    Applied: [],
    Screening: [],
    Interview: [],
    Offer: [],
    Hired: [],
    Rejected: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApplicants();
  }, [jobPostingId]);

  const loadApplicants = async () => {
    try {
      const response = await recruitmentService.getApplicants({
        job_posting_id: jobPostingId,
      });

      const grouped = {
        Applied: [],
        Screening: [],
        Interview: [],
        Offer: [],
        Hired: [],
        Rejected: [],
      } as Record<string, Applicant[]>;

      response.data?.forEach((applicant: Applicant) => {
        grouped[applicant.current_stage]?.push(applicant);
      });

      setApplicants(grouped);
    } catch (error) {
      console.error('Failed to load applicants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMoveStage = async (applicantId: string, newStage: string) => {
    try {
      await recruitmentService.moveApplicantStage(applicantId, newStage);
      await loadApplicants();
    } catch (error) {
      console.error('Failed to move applicant:', error);
    }
  };

  const stageColors: Record<string, string> = {
    Applied: 'bg-info',
    Screening: 'bg-pending',
    Interview: 'bg-warning',
    Offer: 'bg-approved',
    Hired: 'bg-success',
    Rejected: 'bg-destructive',
  };

  const stages = ['Applied', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected'];

  if (loading) {
    return <div className="text-center py-8">Loading applicants...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stages.map((stage) => (
          <Card key={stage} className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${stageColors[stage]}`} />
                {stage}
              </CardTitle>
              <CardDescription>{applicants[stage]?.length || 0} applicants</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {applicants[stage]?.map((applicant) => (
                <div key={applicant.id} className="p-3 border border-border rounded-lg hover:bg-muted/50 transition">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{applicant.name}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <Mail className="w-3 h-3" />
                        <span className="truncate">{applicant.email}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Phone className="w-3 h-3" />
                        <span>{applicant.contact_number}</span>
                      </div>
                    </div>
                    {applicant.resume_url && (
                      <a href={applicant.resume_url} target="_blank" rel="noopener noreferrer" className="text-info hover:underline">
                        <FileText className="w-4 h-4" />
                      </a>
                    )}
                  </div>

                  {stage !== 'Hired' && stage !== 'Rejected' && (
                    <div className="mt-2 flex gap-1 flex-wrap">
                      {stage === 'Applied' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMoveStage(applicant.id, 'Screening')}
                            className="text-xs"
                          >
                            Screen
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMoveStage(applicant.id, 'Rejected')}
                            className="text-xs"
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      {stage === 'Screening' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMoveStage(applicant.id, 'Interview')}
                            className="text-xs"
                          >
                            Interview
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMoveStage(applicant.id, 'Rejected')}
                            className="text-xs"
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      {stage === 'Interview' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMoveStage(applicant.id, 'Offer')}
                            className="text-xs"
                          >
                            Offer
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMoveStage(applicant.id, 'Rejected')}
                            className="text-xs"
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      {stage === 'Offer' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMoveStage(applicant.id, 'Hired')}
                            className="text-xs"
                          >
                            Hire
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMoveStage(applicant.id, 'Rejected')}
                            className="text-xs"
                          >
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {applicants[stage]?.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No applicants</p>}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
