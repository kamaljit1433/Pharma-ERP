import React, { useEffect, useState } from 'react';
import { useRecruitmentStore } from '@/store/recruitmentStore';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ApplicantPipeline } from '@/components/recruitment/ApplicantPipeline';
import { InterviewsList } from '@/components/recruitment/InterviewsList';
import { InterviewScheduler } from '@/components/recruitment/InterviewScheduler';
import { InterviewFeedbackForm } from '@/components/recruitment/InterviewFeedbackForm';
import { JobOfferForm } from '@/components/recruitment/JobOfferForm';
import { JobOfferTracker } from '@/components/recruitment/JobOfferTracker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertCircle, Briefcase, Users, TrendingUp, Plus, Calendar, Award } from 'lucide-react';
import { UserRole } from '@/types/auth';
import { Link } from 'react-router-dom';

const Recruitment: React.FC = () => {
  const { user } = useAuthStore();
  const {
    jobs,
    candidates,
    interviews,
    loading,
    error,
    fetchJobs,
    fetchCandidates,
    fetchInterviews,
    cancelInterview,
  } = useRecruitmentStore();

  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedCandidateForInterview, setSelectedCandidateForInterview] = useState<string | null>(
    null
  );
  const [selectedCandidateForOffer, setSelectedCandidateForOffer] = useState<string | null>(null);
  const [showInterviewScheduler, setShowInterviewScheduler] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState<string | null>(null);
  const [showJobOfferForm, setShowJobOfferForm] = useState(false);

  // Check authorization - only HR Manager and Super Admin
  const isAuthorized =
    user?.role === UserRole.HR_MANAGER || user?.role === UserRole.SUPER_ADMIN;

  useEffect(() => {
    if (isAuthorized) {
      fetchJobs();
      fetchCandidates();
      fetchInterviews();
    }
  }, [isAuthorized, fetchJobs, fetchCandidates, fetchInterviews]);

  // Calculate recruitment metrics
  const totalJobPostings = jobs.length;
  const activeJobPostings = jobs.filter((job) => job.status === 'Open').length;
  const totalApplicants = candidates.length;

  // Calculate applicants by stage
  const applicantsByStage = {
    Applied: candidates.filter((c) => c.current_stage === 'Applied').length,
    Screening: candidates.filter((c) => c.current_stage === 'Screening').length,
    Interview: candidates.filter((c) => c.current_stage === 'Interview').length,
    Offer: candidates.filter((c) => c.current_stage === 'Offer').length,
    Hired: candidates.filter((c) => c.current_stage === 'Hired').length,
    Rejected: candidates.filter((c) => c.current_stage === 'Rejected').length,
  };

  // Calculate conversion rate
  const conversionRate =
    totalApplicants > 0 ? ((applicantsByStage.Hired / totalApplicants) * 100).toFixed(1) : '0';

  // Get applicant count for each job
  const getApplicantCountForJob = (jobId: string) => {
    return candidates.filter((c) => c.job_posting_id === jobId).length;
  };

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              You do not have permission to access the Recruitment module. Only HR Manager and
              Super Admin roles can access this section.
            </p>
          </CardContent>
        </Card>
      </div>
    );
    }

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Briefcase className="h-8 w-8" />
              Recruitment Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage job postings, track candidates, and monitor recruitment pipeline
            </p>
          </div>
          <Link to="/recruitment/jobs/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Job Posting
            </Button>
          </Link>
        </div>

        {/* Error Alert */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="h-5 w-5" />
                <p>{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Job Postings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Job Postings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">{totalJobPostings}</div>
                <Briefcase className="h-8 w-8 text-muted-foreground opacity-50" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {activeJobPostings} active postings
              </p>
            </CardContent>
          </Card>

          {/* Total Applicants */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Applicants
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">{totalApplicants}</div>
                <Users className="h-8 w-8 text-muted-foreground opacity-50" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Across all job postings
              </p>
            </CardContent>
          </Card>

          {/* Conversion Rate */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Conversion Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">{conversionRate}%</div>
                <TrendingUp className="h-8 w-8 text-muted-foreground opacity-50" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {applicantsByStage.Hired} hired candidates
              </p>
            </CardContent>
          </Card>

          {/* In Progress */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                In Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">
                  {applicantsByStage.Screening +
                    applicantsByStage.Interview +
                    applicantsByStage.Offer}
                </div>
                <Users className="h-8 w-8 text-muted-foreground opacity-50" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                In screening, interview, or offer stage
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pipeline" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
            <TabsTrigger value="interviews">Interviews</TabsTrigger>
            <TabsTrigger value="offers">Job Offers</TabsTrigger>
            <TabsTrigger value="jobs">Job Postings</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
          </TabsList>

          {/* Pipeline Tab */}
          <TabsContent value="pipeline" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recruitment Pipeline</CardTitle>
                <CardDescription>
                  Track candidates through different stages of the hiring process
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <p className="text-muted-foreground">Loading pipeline...</p>
                  </div>
                ) : (
                  <ApplicantPipeline jobPostingId={selectedJobId || undefined} />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Interviews Tab */}
          <TabsContent value="interviews" className="space-y-6">
            <div className="flex justify-end mb-4">
              <Button
                onClick={() => setShowInterviewScheduler(true)}
                className="gap-2"
              >
                <Calendar className="h-4 w-4" />
                Schedule Interview
              </Button>
            </div>
            <InterviewsList
              interviews={interviews}
              loading={loading}
              onCancel={cancelInterview}
              onFeedback={(interviewId) => setShowFeedbackForm(interviewId)}
            />
          </TabsContent>

          {/* Job Postings Tab */}
          <TabsContent value="jobs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Active Job Postings</CardTitle>
                <CardDescription>
                  View all job postings with applicant counts
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <p className="text-muted-foreground">Loading job postings...</p>
                  </div>
                ) : jobs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Briefcase className="h-12 w-12 text-muted-foreground opacity-50 mb-2" />
                    <p className="text-muted-foreground">No job postings found</p>
                    <Link to="/recruitment/jobs/new">
                      <Button variant="outline" className="mt-4">
                        Create First Job Posting
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Job Title</TableHead>
                          <TableHead>Department</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Applicants</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Deadline</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {jobs.map((job) => (
                          <TableRow key={job.id}>
                            <TableCell className="font-medium">{job.title}</TableCell>
                            <TableCell>{job.department_id}</TableCell>
                            <TableCell>{job.location}</TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {getApplicantCountForJob(job.id)} applicants
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  job.status === 'Open'
                                    ? 'default'
                                    : job.status === 'Closed'
                                      ? 'secondary'
                                      : 'outline'
                                }
                              >
                                {job.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(job.application_deadline).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedJobId(job.id)}
                              >
                                View Pipeline
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Job Offers Tab */}
          <TabsContent value="offers" className="space-y-6">
            <div className="flex justify-end mb-4">
              <Button
                onClick={() => setShowJobOfferForm(true)}
                className="gap-2"
              >
                <Award className="h-4 w-4" />
                Create Job Offer
              </Button>
            </div>
            <JobOfferTracker jobPostingId={selectedJobId || undefined} />
          </TabsContent>

          {/* Metrics Tab */}
          <TabsContent value="metrics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pipeline Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Pipeline Breakdown</CardTitle>
                  <CardDescription>
                    Applicants by stage
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(applicantsByStage).map(([stage, count]) => (
                      <div key={stage} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-primary" />
                          <span className="text-sm font-medium">{stage}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold">{count}</span>
                          <span className="text-xs text-muted-foreground">
                            ({totalApplicants > 0 ? ((count / totalApplicants) * 100).toFixed(0) : 0}%)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Job Status Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Job Status Summary</CardTitle>
                  <CardDescription>
                    Overview of all job postings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-sm font-medium">Open</span>
                      </div>
                      <span className="text-sm font-bold">
                        {jobs.filter((j) => j.status === 'Open').length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-yellow-500" />
                        <span className="text-sm font-medium">On Hold</span>
                      </div>
                      <span className="text-sm font-bold">
                        {jobs.filter((j) => j.status === 'On Hold').length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        <span className="text-sm font-medium">Closed</span>
                      </div>
                      <span className="text-sm font-bold">
                        {jobs.filter((j) => j.status === 'Closed').length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Recruitment Metrics</CardTitle>
                <CardDescription>
                  Key performance indicators for recruitment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Average Applicants per Job
                    </p>
                    <p className="text-2xl font-bold">
                      {totalJobPostings > 0 ? (totalApplicants / totalJobPostings).toFixed(1) : 0}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Screening Rate
                    </p>
                    <p className="text-2xl font-bold">
                      {totalApplicants > 0
                        ? ((applicantsByStage.Screening / totalApplicants) * 100).toFixed(1)
                        : 0}
                      %
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Interview Rate
                    </p>
                    <p className="text-2xl font-bold">
                      {totalApplicants > 0
                        ? ((applicantsByStage.Interview / totalApplicants) * 100).toFixed(1)
                        : 0}
                      %
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Interview Scheduler Dialog */}
        <Dialog open={showInterviewScheduler} onOpenChange={setShowInterviewScheduler}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Schedule Interview</DialogTitle>
            </DialogHeader>
            {selectedCandidateForInterview ? (
              <InterviewScheduler
                applicantId={selectedCandidateForInterview}
                applicantName={
                  candidates.find((c) => c.id === selectedCandidateForInterview)?.name || ''
                }
                onSuccess={() => {
                  setShowInterviewScheduler(false);
                  setSelectedCandidateForInterview(null);
                  fetchInterviews();
                }}
              />
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Select a candidate to schedule an interview
                </p>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {candidates
                    .filter((c) => c.current_stage === 'Interview')
                    .map((candidate) => (
                      <Button
                        key={candidate.id}
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => setSelectedCandidateForInterview(candidate.id)}
                      >
                        {candidate.name}
                      </Button>
                    ))}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Interview Feedback Dialog */}
        <Dialog open={!!showFeedbackForm} onOpenChange={() => setShowFeedbackForm(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Interview Feedback</DialogTitle>
            </DialogHeader>
            {showFeedbackForm && (
              <InterviewFeedbackForm
                interviewId={showFeedbackForm}
                onSuccess={() => {
                  setShowFeedbackForm(null);
                  fetchInterviews();
                }}
                onCancel={() => setShowFeedbackForm(null)}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Job Offer Form Dialog */}
        <Dialog open={showJobOfferForm} onOpenChange={setShowJobOfferForm}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Job Offer</DialogTitle>
            </DialogHeader>
            {selectedCandidateForOffer ? (
              <JobOfferForm
                applicantId={selectedCandidateForOffer}
                applicantName={
                  candidates.find((c) => c.id === selectedCandidateForOffer)?.name || ''
                }
                applicantEmail={
                  candidates.find((c) => c.id === selectedCandidateForOffer)?.email || ''
                }
                onSuccess={() => {
                  setShowJobOfferForm(false);
                  setSelectedCandidateForOffer(null);
                }}
                onCancel={() => {
                  setSelectedCandidateForOffer(null);
                }}
              />
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Select a candidate to create a job offer
                </p>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {candidates
                    .filter((c) => c.current_stage === 'Offer' || c.current_stage === 'Interview')
                    .map((candidate) => (
                      <Button
                        key={candidate.id}
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => setSelectedCandidateForOffer(candidate.id)}
                      >
                        <div className="text-left">
                          <p className="font-medium">{candidate.name}</p>
                          <p className="text-xs text-muted-foreground">{candidate.email}</p>
                        </div>
                      </Button>
                    ))}
                </div>
                {candidates.filter((c) => c.current_stage === 'Offer' || c.current_stage === 'Interview').length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No candidates in Interview or Offer stage
                  </p>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    );
};

export default Recruitment;
