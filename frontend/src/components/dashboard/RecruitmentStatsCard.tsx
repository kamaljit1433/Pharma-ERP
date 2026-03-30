import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { RecruitmentStatistics } from '../../types/dashboard';
import { Briefcase, Users, TrendingUp, Calendar } from 'lucide-react';

interface RecruitmentStatsCardProps {
  stats: RecruitmentStatistics;
}

export default function RecruitmentStatsCard({ stats }: RecruitmentStatsCardProps) {
  return (
    <div className="space-y-4">
      {/* Recruitment Summary */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Positions</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.openPositions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applicants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalApplicants}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Time to Hire</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageTimeToHire}</div>
            <p className="text-xs text-muted-foreground">days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offers Accepted</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.offersAccepted}</div>
          </CardContent>
        </Card>
      </div>

      {/* Offer Status */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Offers Extended</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-info">{stats.offersExtended}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Offers Accepted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">{stats.offersAccepted}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Offers Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">{stats.offersRejected}</div>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Breakdown */}
      {Object.keys(stats.applicantsByStage).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Applicant Pipeline</CardTitle>
            <CardDescription>Distribution across recruitment stages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.applicantsByStage).map(([stage, count]) => (
                <div key={stage} className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize">{stage}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          stage === 'hired'
                            ? 'bg-success'
                            : stage === 'offer'
                            ? 'bg-info'
                            : stage === 'interview'
                            ? 'bg-warning'
                            : stage === 'rejected'
                            ? 'bg-destructive'
                            : 'bg-primary'
                        }`}
                        style={{ width: `${(count / stats.totalApplicants) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-12 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Sources */}
      {Object.keys(stats.topSourceOfApplicants).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Applicant Sources</CardTitle>
            <CardDescription>Where applicants are coming from</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.topSourceOfApplicants).map(([source, count]) => (
                <div key={source} className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize">{source}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{
                          width: `${
                            ((count / Object.values(stats.topSourceOfApplicants).reduce((a, b) => a + b, 0)) * 100)
                          }%`,
                        }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-12 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Hires */}
      {stats.recentHires.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Hires This Month</CardTitle>
            <CardDescription>New employees who joined recently</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentHires.map((hire) => (
                <div key={hire.employeeId} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{hire.employeeName}</p>
                    <p className="text-xs text-muted-foreground">{hire.designation}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium">
                      {new Date(hire.joinDate).toLocaleDateString()}
                    </p>
                    <Badge variant="secondary" className="text-xs mt-1">
                      New
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
