import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Applicant } from '../../types/recruitment';
import { TrendingUp } from 'lucide-react';

interface CandidateStatusTrackerProps {
  candidates: Applicant[];
}

const stageColors: Record<string, string> = {
  Applied: 'bg-blue-100 text-blue-800',
  Screening: 'bg-yellow-100 text-yellow-800',
  Interview: 'bg-purple-100 text-purple-800',
  Offer: 'bg-green-100 text-green-800',
  Hired: 'bg-emerald-100 text-emerald-800',
  Rejected: 'bg-red-100 text-red-800',
};

const stages = ['Applied', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected'];

export const CandidateStatusTracker: React.FC<CandidateStatusTrackerProps> = ({ candidates }) => {
  const stageCounts = stages.reduce(
    (acc, stage) => {
      acc[stage] = candidates.filter((c) => c.current_stage === stage).length;
      return acc;
    },
    {} as Record<string, number>
  );

  const totalCandidates = candidates.length;
  const conversionRate =
    totalCandidates > 0 ? ((stageCounts.Hired / totalCandidates) * 100).toFixed(1) : '0';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Hiring Pipeline Status
        </CardTitle>
        <CardDescription>Track candidates through hiring stages</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{totalCandidates}</div>
            <p className="text-sm text-muted-foreground">Total Candidates</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{stageCounts.Hired}</div>
            <p className="text-sm text-muted-foreground">Hired</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{conversionRate}%</div>
            <p className="text-sm text-muted-foreground">Conversion Rate</p>
          </div>
        </div>

        <div className="space-y-3">
          {stages.map((stage) => {
            const count = stageCounts[stage];
            const percentage = totalCandidates > 0 ? (count / totalCandidates) * 100 : 0;

            return (
              <div key={stage}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{stage}</span>
                  <Badge variant="secondary">{count}</Badge>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${stageColors[stage].split(' ')[0]}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-4 border-t space-y-2">
          <h4 className="font-medium text-sm">Stage Breakdown</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {stages.map((stage) => (
              <div key={stage} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${stageColors[stage].split(' ')[0]}`} />
                <span className="text-muted-foreground">
                  {stage}: {stageCounts[stage]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
