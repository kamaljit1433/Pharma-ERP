import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Calendar, CheckCircle2, Clock, Award } from 'lucide-react';
import trainingService, { TrainingEnrollment } from '../../services/trainingService';

export const TrainingHistory: React.FC<{ employeeId: string }> = ({ employeeId }) => {
  const [enrollments, setEnrollments] = useState<TrainingEnrollment[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'completed' | 'enrolled' | 'in_progress'>('all');

  useEffect(() => {
    loadEnrollments();
  }, [employeeId]);

  const loadEnrollments = async () => {
    try {
      setLoading(true);
      const data = await trainingService.getEmployeeEnrollments(employeeId);
      setEnrollments(data);
    } catch (error) {
      console.error('Failed to load training history:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEnrollments = enrollments.filter((e) => {
    if (filter === 'all') return true;
    return e.status === filter;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'enrolled':
        return <Calendar className="w-5 h-5 text-amber-600" />;
      default:
        return <Award className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-100 text-emerald-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'enrolled':
        return 'bg-amber-100 text-amber-800';
      case 'cancelled':
        return 'bg-rose-100 text-rose-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Training History</h2>
        <div className="flex gap-2">
          {(['all', 'completed', 'enrolled', 'in_progress'] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(f)}
              className="capitalize"
            >
              {f}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : filteredEnrollments.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-600">No training records found</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredEnrollments.map((enrollment) => (
            <Card key={enrollment.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="mt-1">{getStatusIcon(enrollment.status)}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">Training Program</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Enrolled: {new Date(enrollment.enrollment_date).toLocaleDateString()}
                    </p>
                    {enrollment.completion_date && (
                      <p className="text-sm text-gray-600">
                        Completed: {new Date(enrollment.completion_date).toLocaleDateString()}
                      </p>
                    )}
                    {enrollment.score !== undefined && (
                      <p className="text-sm text-gray-600">
                        Score: {enrollment.score}% {enrollment.passed ? '✓ Passed' : '✗ Failed'}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(enrollment.status)}>{enrollment.status}</Badge>
                  {enrollment.status === 'completed' && (
                    <Button size="sm" variant="outline">
                      <Award className="w-4 h-4 mr-1" />
                      Certificate
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
