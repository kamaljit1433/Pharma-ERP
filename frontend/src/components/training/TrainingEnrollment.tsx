import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { BookOpen, Plus } from 'lucide-react';
import trainingService, { TrainingProgram, TrainingEnrollment } from '../../services/trainingService';

interface TrainingEnrollmentProps {
  employeeId: string;
}

export const TrainingEnrollmentComponent: React.FC<TrainingEnrollmentProps> = ({ employeeId }) => {
  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  const [enrollments, setEnrollments] = useState<TrainingEnrollment[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedProgramId, setSelectedProgramId] = useState('');

  useEffect(() => {
    loadData();
  }, [employeeId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [programsData, enrollmentsData] = await Promise.all([
        trainingService.getAllTrainingPrograms('active'),
        trainingService.getEmployeeEnrollments(employeeId),
      ]);
      setPrograms(programsData);
      setEnrollments(enrollmentsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await trainingService.enrollEmployee(employeeId, selectedProgramId, new Date());
      setSelectedProgramId('');
      setShowForm(false);
      loadData();
    } catch (error) {
      console.error('Failed to enroll:', error);
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
        <div className="flex items-center gap-2">
          <BookOpen className="w-6 h-6" />
          <h2 className="text-2xl font-bold">Training Enrollment</h2>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="w-4 h-4" />
          Enroll in Training
        </Button>
      </div>

      {showForm && (
        <Card className="p-6">
          <form onSubmit={handleEnroll} className="space-y-4">
            <div>
              <Label htmlFor="program">Select Training Program</Label>
              <select
                id="program"
                value={selectedProgramId}
                onChange={(e) => setSelectedProgramId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">Choose a program...</option>
                {programs.map((program) => (
                  <option key={program.id} value={program.id}>
                    {program.name} ({program.duration_hours} hours)
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <Button type="submit">Enroll</Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Your Enrollments</h3>
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : enrollments.length === 0 ? (
          <Card className="p-6 text-center text-gray-600">No training enrollments yet</Card>
        ) : (
          <div className="grid gap-4">
            {enrollments.map((enrollment) => {
              const program = programs.find((p) => p.id === enrollment.training_program_id);
              return (
                <Card key={enrollment.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold">{program?.name || 'Unknown Program'}</h4>
                      <p className="text-sm text-gray-600">
                        Enrolled: {new Date(enrollment.enrollment_date).toLocaleDateString()}
                      </p>
                      {enrollment.completion_date && (
                        <p className="text-sm text-gray-600">
                          Completed: {new Date(enrollment.completion_date).toLocaleDateString()}
                        </p>
                      )}
                      {enrollment.score !== undefined && (
                        <p className="text-sm text-gray-600">Score: {enrollment.score}%</p>
                      )}
                    </div>
                    <Badge className={getStatusColor(enrollment.status)}>{enrollment.status}</Badge>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
