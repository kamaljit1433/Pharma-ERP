import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { OfferLetter } from '../../types/recruitment';
import { useRecruitmentStore } from '../../store/recruitmentStore';
import { Award, Mail, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

interface JobOfferTrackerProps {
  jobPostingId?: string;
  applicantId?: string;
}

const statusConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  Draft: {
    icon: <Clock className="w-4 h-4" />,
    color: 'bg-gray-100 text-gray-800',
    label: 'Draft',
  },
  Sent: {
    icon: <Mail className="w-4 h-4" />,
    color: 'bg-blue-100 text-blue-800',
    label: 'Sent',
  },
  Signed: {
    icon: <CheckCircle className="w-4 h-4" />,
    color: 'bg-purple-100 text-purple-800',
    label: 'Signed',
  },
  Accepted: {
    icon: <CheckCircle className="w-4 h-4" />,
    color: 'bg-green-100 text-green-800',
    label: 'Accepted',
  },
  Rejected: {
    icon: <XCircle className="w-4 h-4" />,
    color: 'bg-red-100 text-red-800',
    label: 'Rejected',
  },
};

export const JobOfferTracker: React.FC<JobOfferTrackerProps> = ({ jobPostingId, applicantId }) => {
  const { offers, loading, candidates } = useRecruitmentStore();
  const [filteredOffers, setFilteredOffers] = useState<OfferLetter[]>([]);

  useEffect(() => {
    let filtered = offers;

    if (jobPostingId) {
      // Filter by job posting - get candidates for this job, then their offers
      const jobCandidates = candidates.filter((c) => c.job_posting_id === jobPostingId);
      const jobCandidateIds = jobCandidates.map((c) => c.id);
      filtered = filtered.filter((o) => jobCandidateIds.includes(o.applicant_id));
    }

    if (applicantId) {
      filtered = filtered.filter((o) => o.applicant_id === applicantId);
    }

    setFilteredOffers(filtered);
  }, [offers, jobPostingId, applicantId, candidates]);

  const getCandidateName = (applicantId: string): string => {
    const candidate = candidates.find((c) => c.id === applicantId);
    return candidate?.name || 'Unknown';
  };

  const getCandidateEmail = (applicantId: string): string => {
    const candidate = candidates.find((c) => c.id === applicantId);
    return candidate?.email || 'N/A';
  };

  const getStatusConfig = (status: string) => {
    return statusConfig[status] || statusConfig.Draft;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Loading offers...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="w-5 h-5" />
          Job Offer Tracker
        </CardTitle>
        <CardDescription>
          Track the status of all job offers sent to candidates
        </CardDescription>
      </CardHeader>
      <CardContent>
        {filteredOffers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <AlertCircle className="h-12 w-12 text-muted-foreground opacity-50 mb-2" />
            <p className="text-muted-foreground">No job offers found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Salary</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOffers.map((offer) => {
                  const config = getStatusConfig(offer.status);
                  return (
                    <TableRow key={offer.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {getCandidateName(offer.applicant_id)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {getCandidateEmail(offer.applicant_id)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{offer.position}</TableCell>
                      <TableCell>{offer.department}</TableCell>
                      <TableCell>₹{offer.salary.toLocaleString()}</TableCell>
                      <TableCell>
                        {new Date(offer.start_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge className={config.color}>
                          <span className="flex items-center gap-1">
                            {config.icon}
                            {config.label}
                          </span>
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(offer.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Summary Stats */}
        {filteredOffers.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6 pt-6 border-t">
            <div>
              <p className="text-xs text-muted-foreground">Total Offers</p>
              <p className="text-2xl font-bold">{filteredOffers.length}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Sent</p>
              <p className="text-2xl font-bold text-blue-600">
                {filteredOffers.filter((o) => o.status === 'Sent').length}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Accepted</p>
              <p className="text-2xl font-bold text-green-600">
                {filteredOffers.filter((o) => o.status === 'Accepted').length}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Rejected</p>
              <p className="text-2xl font-bold text-red-600">
                {filteredOffers.filter((o) => o.status === 'Rejected').length}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {filteredOffers.filter((o) => o.status === 'Draft' || o.status === 'Sent').length}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
