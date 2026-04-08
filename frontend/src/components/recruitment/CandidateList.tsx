import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { useRecruitmentStore } from '../../store/recruitmentStore';
import { Applicant } from '../../types/recruitment';
import { Users, Search, ChevronRight, AlertCircle } from 'lucide-react';

interface CandidateListProps {
  jobPostingId: string;
  onSelectCandidate: (candidate: Applicant) => void;
}

const stageColors: Record<string, string> = {
  Applied: 'bg-blue-100 text-blue-800',
  Screening: 'bg-yellow-100 text-yellow-800',
  Interview: 'bg-purple-100 text-purple-800',
  Offer: 'bg-green-100 text-green-800',
  Hired: 'bg-emerald-100 text-emerald-800',
  Rejected: 'bg-red-100 text-red-800',
};

export const CandidateList: React.FC<CandidateListProps> = ({ jobPostingId, onSelectCandidate }) => {
  const { candidates, loading, error, fetchCandidates } = useRecruitmentStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCandidates, setFilteredCandidates] = useState<Applicant[]>([]);

  useEffect(() => {
    fetchCandidates({ job_posting_id: jobPostingId });
  }, [jobPostingId, fetchCandidates]);

  useEffect(() => {
    const filtered = candidates.filter(
      (candidate) =>
        candidate.job_posting_id === jobPostingId &&
        (candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          candidate.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredCandidates(filtered);
  }, [candidates, searchTerm, jobPostingId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Candidates ({filteredCandidates.length})
        </CardTitle>
        <CardDescription>Manage candidates for this job posting</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {filteredCandidates.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No candidates found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredCandidates.map((candidate) => (
              <div
                key={candidate.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium truncate">{candidate.name}</h4>
                    <Badge className={stageColors[candidate.current_stage]}>
                      {candidate.current_stage}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{candidate.email}</p>
                  <p className="text-xs text-muted-foreground">
                    Applied: {new Date(candidate.applied_at).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSelectCandidate(candidate)}
                  className="ml-2"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
