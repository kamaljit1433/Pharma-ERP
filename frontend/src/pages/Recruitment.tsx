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
import { AlertCircle, Briefcase, Users, TrendingUp, Plus, Calendar, Award, Copy, Check, RefreshCw, Loader2, Trash2, Search, Globe } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { UserRole } from '@/types/auth';
import { Link } from 'react-router-dom';
import { recruitmentService } from '@/services/recruitmentService';

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
    fetchOffers,
    cancelInterview,
    deleteInterview,
    updateInterview,
    updateJobStatus,
  } = useRecruitmentStore();

  const [activeTab, setActiveTab] = useState('pipeline');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedCandidateForInterview, setSelectedCandidateForInterview] = useState<string | null>(
    null
  );
  const [selectedCandidateForOffer, setSelectedCandidateForOffer] = useState<string | null>(null);
  const [showInterviewScheduler, setShowInterviewScheduler] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState<string | null>(null);
  const [showJobOfferForm, setShowJobOfferForm] = useState(false);
  const [copiedJobId, setCopiedJobId] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [interviewCandidateSearch, setInterviewCandidateSearch] = useState('');
  const [offerCandidateSearch, setOfferCandidateSearch] = useState('');
  const [deletingJobId, setDeletingJobId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [publishingJobId, setPublishingJobId] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const copyFormUrl = (jobId: string, url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedJobId(jobId);
      setTimeout(() => setCopiedJobId(null), 2000);
    });
  };

  const handleDeleteJob = async (id: string) => {
    setDeletingJobId(id);
    try {
      await recruitmentService.deleteJobPosting(id);
      await fetchJobs();
    } finally {
      setDeletingJobId(null);
      setConfirmDeleteId(null);
    }
  };

  const handlePublishJob = async (id: string) => {
    setPublishingJobId(id);
    try {
      await updateJobStatus(id, 'open');
    } finally {
      setPublishingJobId(null);
    }
  };

  const handleSyncNow = async () => {
    setSyncing(true);
    try {
      await recruitmentService.syncFormResponses();
      await fetchCandidates();
    } finally {
      setSyncing(false);
    }
  };

  // Check authorization - only HR Manager and Super Admin
  const isAuthorized =
    user?.role === UserRole.HR_MANAGER || user?.role === UserRole.SUPER_ADMIN;

  useEffect(() => {
    if (isAuthorized) {
      fetchJobs();
      fetchCandidates();
      fetchInterviews();
      fetchOffers();
    }
  }, [isAuthorized, fetchJobs, fetchCandidates, fetchInterviews, fetchOffers]);

  // Poll every 3s while any job has a pending form, stop once all resolved
  useEffect(() => {
    const hasPending = jobs.some((j) => j.form_status === 'pending');
    if (!hasPending) return;
    const timer = setInterval(() => fetchJobs(), 3000);
    return () => clearInterval(timer);
  }, [jobs, fetchJobs]);

  // Calculate recruitment metrics
  const totalJobPostings = jobs.length;
  const activeJobPostings = jobs.filter((job) => job.status === 'open').length;
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

  // Pagination
  const totalPages = Math.ceil(jobs.length / pageSize);
  const paginatedJobs = jobs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
                  <ApplicantPipeline
                    jobPostingId={selectedJobId || undefined}
                    onStageChange={() => { fetchCandidates(); fetchInterviews(); fetchOffers(); }}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Interviews Tab */}
          <TabsContent value="interviews" className="space-y-6">
            <div className="flex justify-end mb-4">
              <Button
                onClick={() => { setShowInterviewScheduler(true); fetchCandidates(); }}
                className="gap-2"
              >
                <Calendar className="h-4 w-4" />
                Schedule Interview
              </Button>
            </div>
            <InterviewsList
              interviews={interviews}
              candidates={candidates}
              loading={loading}
              onCancel={cancelInterview}
              onDelete={deleteInterview}
              onUpdate={updateInterview}
              onFeedback={(interviewId) => setShowFeedbackForm(interviewId)}
            />
          </TabsContent>

          {/* Job Postings Tab */}
          <TabsContent value="jobs" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Active Job Postings</CardTitle>
                    <CardDescription>View all job postings with applicant counts</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleSyncNow} disabled={syncing} className="gap-2">
                    {syncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                    Sync Applications
                  </Button>
                </div>
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
                  <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Job Title</TableHead>
                          <TableHead>Department</TableHead>
                          <TableHead>Positions</TableHead>
                          <TableHead>Applicants</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Closing Date</TableHead>
                          <TableHead>Application Form</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedJobs.map((job) => (
                          <TableRow key={job.id}>
                            <TableCell className="font-medium">{job.title}</TableCell>
                            <TableCell>{job.department_name || '—'}</TableCell>
                            <TableCell>{job.positions_count ?? '—'}</TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {getApplicantCountForJob(job.id)} applicants
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  job.status === 'open'
                                    ? 'default'
                                    : job.status === 'closed'
                                      ? 'secondary'
                                      : 'outline'
                                }
                              >
                                {job.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {job.closing_date
                                ? new Date(job.closing_date).toLocaleDateString()
                                : '—'}
                            </TableCell>
                            <TableCell>
                              {job.form_status === 'generated' && job.form_url ? (
                                <div className="flex items-center gap-1">
                                  <a
                                    href={job.form_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-primary underline truncate max-w-[120px]"
                                  >
                                    Open Form
                                  </a>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={() => copyFormUrl(job.id, job.form_url!)}
                                  >
                                    {copiedJobId === job.id ? (
                                      <Check className="h-3 w-3 text-green-500" />
                                    ) : (
                                      <Copy className="h-3 w-3" />
                                    )}
                                  </Button>
                                </div>
                              ) : job.form_status === 'failed' ? (
                                <Badge variant="destructive" className="text-xs">Form Failed</Badge>
                              ) : (
                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                  Generating…
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                {job.status === 'draft' && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-xs gap-1 text-green-700 border-green-300 hover:bg-green-50"
                                    onClick={() => handlePublishJob(job.id)}
                                    disabled={publishingJobId === job.id}
                                  >
                                    {publishingJobId === job.id
                                      ? <Loader2 className="h-3 w-3 animate-spin" />
                                      : <Globe className="h-3 w-3" />}
                                    Publish
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => { setSelectedJobId(job.id); setActiveTab('pipeline'); }}
                                >
                                  View Pipeline
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => setConfirmDeleteId(job.id)}
                                  disabled={deletingJobId === job.id}
                                >
                                  {deletingJobId === job.id
                                    ? <Loader2 className="h-4 w-4 animate-spin" />
                                    : <Trash2 className="h-4 w-4" />}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Rows per page:</span>
                      {[10, 25, 50, 100].map((size) => (
                        <button
                          key={size}
                          onClick={() => handlePageSizeChange(size)}
                          className={`px-2 py-0.5 rounded text-xs border ${pageSize === size ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted'}`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-muted-foreground">
                        {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, jobs.length)} of {jobs.length}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                  </>
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
                        {jobs.filter((j) => j.status === 'open').length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-yellow-500" />
                        <span className="text-sm font-medium">On Hold</span>
                      </div>
                      <span className="text-sm font-bold">
                        {jobs.filter((j) => j.status === 'on_hold').length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        <span className="text-sm font-medium">Closed</span>
                      </div>
                      <span className="text-sm font-bold">
                        {jobs.filter((j) => j.status === 'closed').length}
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
        <Dialog open={showInterviewScheduler} onOpenChange={(open) => { setShowInterviewScheduler(open); if (!open) { setInterviewCandidateSearch(''); setSelectedCandidateForInterview(null); } }}>
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
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search candidates..."
                    value={interviewCandidateSearch}
                    onChange={(e) => setInterviewCandidateSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {candidates
                    .filter((c) => c.current_stage === 'Interview')
                    .filter((c) =>
                      !interviewCandidateSearch ||
                      c.name?.toLowerCase().includes(interviewCandidateSearch.toLowerCase()) ||
                      c.email?.toLowerCase().includes(interviewCandidateSearch.toLowerCase())
                    )
                    .map((candidate) => (
                      <Button
                        key={candidate.id}
                        variant="outline"
                        className="w-full justify-start flex-col items-start h-auto py-2"
                        onClick={() => setSelectedCandidateForInterview(candidate.id)}
                      >
                        <span className="font-medium">{candidate.name}</span>
                        <span className="text-xs text-muted-foreground font-normal">{candidate.email}</span>
                      </Button>
                    ))}
                  {candidates.filter((c) => c.current_stage === 'Interview').length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No candidates in Interview stage
                    </p>
                  )}
                  {candidates.filter((c) => c.current_stage === 'Interview').length > 0 &&
                    candidates
                      .filter((c) => c.current_stage === 'Interview')
                      .filter((c) =>
                        !interviewCandidateSearch ||
                        c.name?.toLowerCase().includes(interviewCandidateSearch.toLowerCase()) ||
                        c.email?.toLowerCase().includes(interviewCandidateSearch.toLowerCase())
                      ).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No candidates match your search
                    </p>
                  )}
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

        {/* Delete Job Posting Confirmation */}
        <AlertDialog open={!!confirmDeleteId} onOpenChange={() => setConfirmDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Job Posting</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this job posting? This will also remove all associated applicants, interviews, and offers. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex gap-2 justify-end">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive hover:bg-destructive/90"
                onClick={() => confirmDeleteId && handleDeleteJob(confirmDeleteId)}
              >
                Delete
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>

        {/* Job Offer Form Dialog */}
        <Dialog open={showJobOfferForm} onOpenChange={(open) => { setShowJobOfferForm(open); if (!open) { setOfferCandidateSearch(''); setSelectedCandidateForOffer(null); } }}>
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
                initialDepartment={
                  jobs.find((j) => j.id === candidates.find((c) => c.id === selectedCandidateForOffer)?.job_posting_id)?.department_name || ''
                }
                onSuccess={() => {
                  setShowJobOfferForm(false);
                  setSelectedCandidateForOffer(null);
                  fetchOffers();
                }}
                onCancel={() => {
                  setSelectedCandidateForOffer(null);
                }}
              />
            ) : (
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search candidates..."
                    value={offerCandidateSearch}
                    onChange={(e) => setOfferCandidateSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {candidates
                    .filter((c) => c.current_stage === 'Offer' || c.current_stage === 'Interview')
                    .filter((c) =>
                      !offerCandidateSearch ||
                      c.name?.toLowerCase().includes(offerCandidateSearch.toLowerCase()) ||
                      c.email?.toLowerCase().includes(offerCandidateSearch.toLowerCase())
                    )
                    .map((candidate) => (
                      <Button
                        key={candidate.id}
                        variant="outline"
                        className="w-full justify-start flex-col items-start h-auto py-2"
                        onClick={() => setSelectedCandidateForOffer(candidate.id)}
                      >
                        <span className="font-medium">{candidate.name}</span>
                        <span className="text-xs text-muted-foreground font-normal">{candidate.email}</span>
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
