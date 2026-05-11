import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { PerformanceDashboard } from '../components/performance/PerformanceDashboard';
import { GoalSetting } from '../components/performance/GoalSetting';
import { FeedbackForm } from '../components/performance/FeedbackForm';
import { PerformanceReviewForm } from '../components/performance/PerformanceReviewForm';
import { ReviewCycleManagement } from '../components/performance/ReviewCycleManagement';
import { LayoutDashboard, Target, MessageSquare, Star, RefreshCw } from 'lucide-react';

const Performance: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Performance Management</h1>
        <p className="text-muted-foreground mt-1">
          Manage goals, reviews, and feedback
        </p>
      </div>

      <Tabs defaultValue="dashboard">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <LayoutDashboard className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="cycles" className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Review Cycles</span>
          </TabsTrigger>
          <TabsTrigger value="goals" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            <span className="hidden sm:inline">Create Goal</span>
          </TabsTrigger>
          <TabsTrigger value="review" className="flex items-center gap-2">
            <Star className="w-4 h-4" />
            <span className="hidden sm:inline">Submit Review</span>
          </TabsTrigger>
          <TabsTrigger value="feedback" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            <span className="hidden sm:inline">Give Feedback</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <PerformanceDashboard />
        </TabsContent>

        <TabsContent value="cycles">
          <ReviewCycleManagement />
        </TabsContent>

        <TabsContent value="goals">
          <div className="max-w-2xl">
            <GoalSetting />
          </div>
        </TabsContent>

        <TabsContent value="review">
          <div className="max-w-2xl">
            <PerformanceReviewForm />
          </div>
        </TabsContent>

        <TabsContent value="feedback">
          <div className="max-w-2xl">
            <FeedbackForm />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Performance;
