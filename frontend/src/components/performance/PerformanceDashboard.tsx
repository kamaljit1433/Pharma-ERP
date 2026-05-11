import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { usePerformanceStore } from '../../store/performanceStore';
import { BarChart3, Target, Users, MessageSquare, TrendingUp } from 'lucide-react';

interface DashboardStats {
  activeReviewCycles: number;
  pendingReviews: number;
  activePIPs: number;
  recentFeedback: Array<{
    id: string;
    type: string;
    count: number;
  }>;
  goalCompletionStats?: {
    completed: number;
    onTrack: number;
    atRisk: number;
    behind: number;
  };
  reviewRatingsDistribution?: {
    rating: number;
    count: number;
  }[];
  feedbackSentiment?: {
    positive: number;
    constructive: number;
    neutral: number;
  };
}

export const PerformanceDashboard: React.FC = () => {
  const { dashboardStats, loadingDashboard, fetchDashboardStats, error } = usePerformanceStore();
  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  const stats = dashboardStats as DashboardStats | null;

  if (loadingDashboard) {
    return <div className="text-center py-8">Loading dashboard...</div>;
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <p className="text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Performance Management Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of performance metrics and activities</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Review Cycles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-info" />
              <span className="text-2xl font-bold">{stats?.activeReviewCycles || 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-warning" />
              <span className="text-2xl font-bold">{stats?.pendingReviews || 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active PIPs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-destructive" />
              <span className="text-2xl font-bold">{stats?.activePIPs || 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Recent Feedback
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-success" />
              <span className="text-2xl font-bold">
                {stats?.recentFeedback?.reduce((sum, item) => sum + item.count, 0) || 0}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Goal Completion Distribution */}
      {stats?.goalCompletionStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Goal Completion Distribution
            </CardTitle>
            <CardDescription>Status breakdown of all goals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-success/10 rounded-lg border border-success/20">
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-success">{stats.goalCompletionStats.completed}</p>
              </div>
              <div className="p-4 bg-info/10 rounded-lg border border-info/20">
                <p className="text-sm text-muted-foreground">On Track</p>
                <p className="text-2xl font-bold text-info">{stats.goalCompletionStats.onTrack}</p>
              </div>
              <div className="p-4 bg-warning/10 rounded-lg border border-warning/20">
                <p className="text-sm text-muted-foreground">At Risk</p>
                <p className="text-2xl font-bold text-warning">{stats.goalCompletionStats.atRisk}</p>
              </div>
              <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                <p className="text-sm text-muted-foreground">Behind</p>
                <p className="text-2xl font-bold text-destructive">{stats.goalCompletionStats.behind}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Review Ratings Distribution */}
      {stats?.reviewRatingsDistribution && stats.reviewRatingsDistribution.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Review Ratings Distribution</CardTitle>
            <CardDescription>Distribution of performance ratings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.reviewRatingsDistribution.map((item) => (
                <div key={item.rating} className="flex items-center gap-3">
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        className={`w-4 h-4 rounded-full ${
                          i < item.rating ? 'bg-warning' : 'bg-muted'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium">{item.count} reviews</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feedback Sentiment Breakdown */}
      {stats?.feedbackSentiment && (
        <Card>
          <CardHeader>
            <CardTitle>Feedback Sentiment Breakdown</CardTitle>
            <CardDescription>Distribution of feedback types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-success/10 rounded-lg border border-success/20">
                <p className="text-sm text-muted-foreground">Positive</p>
                <p className="text-2xl font-bold text-success">{stats.feedbackSentiment.positive}</p>
              </div>
              <div className="p-4 bg-info/10 rounded-lg border border-info/20">
                <p className="text-sm text-muted-foreground">Constructive</p>
                <p className="text-2xl font-bold text-info">{stats.feedbackSentiment.constructive}</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Neutral</p>
                <p className="text-2xl font-bold text-foreground">{stats.feedbackSentiment.neutral}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
};
