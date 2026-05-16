import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { recruitmentService } from '../../services/recruitmentService';
import { useRecruitmentStore } from '../../store/recruitmentStore';
import { Applicant } from '../../types/recruitment';
import { InterviewScheduler } from './InterviewScheduler';
import { JobOfferForm } from './JobOfferForm';
import { Mail, Phone, FileText, UserCheck, Calendar, Award, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface ApplicantPipelineProps {
  jobPostingId?: string;
  onStageChange?: () => void;
}

type ModalType = 'screen' | 'interview' | 'offer' | 'hire' | 'reject';

interface ActiveModal {
  type: ModalType;
  applicant: Applicant;
}

const STAGE_COLORS: Record<string, string> = {
  Applied: 'bg-info',
  Screening: 'bg-pending',
  Interview: 'bg-warning',
  Offer: 'bg-approved',
  Hired: 'bg-success',
  Rejected: 'bg-destructive',
};

const STAGES = ['Applied', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected'];

export const ApplicantPipeline: React.FC<ApplicantPipelineProps> = ({ jobPostingId, onStageChange }) => {
  const { jobs } = useRecruitmentStore();

  const [applicants, setApplicants] = useState<Record<string, Applicant[]>>({
    Applied: [], Screening: [], Interview: [], Offer: [], Hired: [], Rejected: [],
  });
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ActiveModal | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    loadApplicants();
  }, [jobPostingId]);

  const loadApplicants = async () => {
    try {
      const response = await recruitmentService.getApplicants(
        jobPostingId ? { job_posting_id: jobPostingId } : undefined
      );
      const grouped = { Applied: [], Screening: [], Interview: [], Offer: [], Hired: [], Rejected: [] } as Record<string, Applicant[]>;
      (Array.isArray(response) ? response : []).forEach((a: Applicant) => {
        grouped[a.current_stage]?.push(a);
      });
      setApplicants(grouped);
    } catch (error) {
      console.error('Failed to load applicants:', error);
    } finally {
      setLoading(false);
    }
  };

  const moveStage = async (applicantId: string, newStage: string) => {
    await recruitmentService.moveApplicantStage(applicantId, newStage.toLowerCase());
    await loadApplicants();
    onStageChange?.();
  };

  const openModal = (type: ModalType, applicant: Applicant) => {
    setActionError('');
    setModal({ type, applicant });
  };

  const closeModal = () => {
    setModal(null);
    setActionError('');
    setActionLoading(false);
  };

  const handleConfirmAction = async (newStage: string) => {
    if (!modal) return;
    setActionLoading(true);
    setActionError('');
    try {
      await moveStage(modal.applicant.id, newStage);
      closeModal();
    } catch {
      setActionError('Failed to update stage. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const getJobForApplicant = (applicant: Applicant) =>
    jobs.find((j) => j.id === applicant.job_posting_id);

  const getDepartmentForApplicant = (applicant: Applicant) =>
    getJobForApplicant(applicant)?.department_name || '';

  const getPositionForApplicant = (applicant: Applicant) =>
    getJobForApplicant(applicant)?.title || '';

  if (loading) {
    return <div className="text-center py-8">Loading applicants...</div>;
  }

  return (
    <>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {STAGES.map((stage) => (
            <Card key={stage} className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${STAGE_COLORS[stage]}`} />
                  {stage}
                </CardTitle>
                <CardDescription>{applicants[stage]?.length || 0} applicants</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 max-h-[280px] overflow-y-auto">
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
                            <Button size="sm" variant="outline" className="text-xs gap-1" onClick={() => openModal('screen', applicant)}>
                              <UserCheck className="w-3 h-3" /> Screen
                            </Button>
                            <Button size="sm" variant="outline" className="text-xs text-destructive gap-1" onClick={() => openModal('reject', applicant)}>
                              <XCircle className="w-3 h-3" /> Reject
                            </Button>
                          </>
                        )}
                        {stage === 'Screening' && (
                          <>
                            <Button size="sm" variant="outline" className="text-xs gap-1" onClick={() => openModal('interview', applicant)}>
                              <Calendar className="w-3 h-3" /> Schedule Interview
                            </Button>
                            <Button size="sm" variant="outline" className="text-xs text-destructive gap-1" onClick={() => openModal('reject', applicant)}>
                              <XCircle className="w-3 h-3" /> Reject
                            </Button>
                          </>
                        )}
                        {stage === 'Interview' && (
                          <>
                            <Button size="sm" variant="outline" className="text-xs gap-1" onClick={() => openModal('offer', applicant)}>
                              <Award className="w-3 h-3" /> Create Offer
                            </Button>
                            <Button size="sm" variant="outline" className="text-xs text-destructive gap-1" onClick={() => openModal('reject', applicant)}>
                              <XCircle className="w-3 h-3" /> Reject
                            </Button>
                          </>
                        )}
                        {stage === 'Offer' && (
                          <>
                            <Button size="sm" variant="outline" className="text-xs gap-1" onClick={() => openModal('hire', applicant)}>
                              <CheckCircle className="w-3 h-3" /> Hire
                            </Button>
                            <Button size="sm" variant="outline" className="text-xs text-destructive gap-1" onClick={() => openModal('reject', applicant)}>
                              <XCircle className="w-3 h-3" /> Reject
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                {applicants[stage]?.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">No applicants</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* ── Screen Confirmation Modal ── */}
      <Dialog open={modal?.type === 'screen'} onOpenChange={closeModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-blue-500" />
              Move to Screening
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Move <span className="font-semibold text-foreground">{modal?.applicant.name}</span> to the Screening stage?
            </p>
            <div className="p-3 bg-muted rounded-lg text-sm">
              <p className="text-muted-foreground">{modal?.applicant.email}</p>
            </div>
            {actionError && <p className="text-sm text-destructive">{actionError}</p>}
            <div className="flex gap-2">
              <Button className="flex-1" onClick={() => handleConfirmAction('Screening')} disabled={actionLoading}>
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Confirm Screening
              </Button>
              <Button variant="outline" onClick={closeModal} disabled={actionLoading}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Schedule Interview Modal ── */}
      <Dialog open={modal?.type === 'interview'} onOpenChange={closeModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Schedule Interview
            </DialogTitle>
          </DialogHeader>
          {modal?.type === 'interview' && (
            <InterviewScheduler
              applicantId={modal.applicant.id}
              applicantName={modal.applicant.name}
              onSuccess={async () => {
                await moveStage(modal.applicant.id, 'Interview');
                closeModal();
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* ── Create Offer Modal ── */}
      <Dialog open={modal?.type === 'offer'} onOpenChange={closeModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Create Job Offer
            </DialogTitle>
          </DialogHeader>
          {modal?.type === 'offer' && (
            <JobOfferForm
              applicantId={modal.applicant.id}
              applicantName={modal.applicant.name}
              applicantEmail={modal.applicant.email}
              initialDepartment={getDepartmentForApplicant(modal.applicant)}
              initialPosition={getPositionForApplicant(modal.applicant)}
              onSuccess={async () => {
                await moveStage(modal.applicant.id, 'Offer');
                closeModal();
              }}
              onCancel={closeModal}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* ── Hire Confirmation Modal ── */}
      <Dialog open={modal?.type === 'hire'} onOpenChange={closeModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Confirm Hire
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Mark <span className="font-semibold text-foreground">{modal?.applicant.name}</span> as hired? They will be moved to the Hired stage.
            </p>
            <div className="p-3 bg-muted rounded-lg text-sm">
              <p className="text-muted-foreground">{modal?.applicant.email}</p>
            </div>
            {actionError && <p className="text-sm text-destructive">{actionError}</p>}
            <div className="flex gap-2">
              <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => handleConfirmAction('Hired')} disabled={actionLoading}>
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Confirm Hire
              </Button>
              <Button variant="outline" onClick={closeModal} disabled={actionLoading}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Reject Confirmation Modal ── */}
      <Dialog open={modal?.type === 'reject'} onOpenChange={closeModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-destructive" />
              Reject Applicant
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to reject <span className="font-semibold text-foreground">{modal?.applicant.name}</span>? This will move them to the Rejected stage.
            </p>
            <div className="p-3 bg-muted rounded-lg text-sm">
              <p className="text-muted-foreground">{modal?.applicant.email}</p>
            </div>
            {actionError && <p className="text-sm text-destructive">{actionError}</p>}
            <div className="flex gap-2">
              <Button variant="destructive" className="flex-1" onClick={() => handleConfirmAction('Rejected')} disabled={actionLoading}>
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Reject
              </Button>
              <Button variant="outline" onClick={closeModal} disabled={actionLoading}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
