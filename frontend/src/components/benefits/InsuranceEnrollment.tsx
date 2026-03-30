import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import { benefitsService } from '../../services/benefitsService';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface InsurancePlan {
  id: string;
  name: string;
  provider: string;
  coverage_type: string;
  premium_amount: number;
  enrollment_start_date: string;
  enrollment_end_date: string;
}

interface Enrollment {
  id: string;
  insurance_plan_id: string;
  status: string;
  effective_from: string;
  effective_to?: string;
}

interface InsuranceEnrollmentProps {
  employeeId: string;
}

export const InsuranceEnrollment: React.FC<InsuranceEnrollmentProps> = ({ employeeId }) => {
  const [plans, setPlans] = useState<InsurancePlan[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [enrolling, setEnrolling] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, [employeeId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [plansResponse, enrollmentsResponse] = await Promise.all([
        benefitsService.getInsurancePlans(true),
        benefitsService.getEmployeeEnrollments(employeeId),
      ]);
      setPlans(plansResponse.data || []);
      setEnrollments(enrollmentsResponse.data || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setMessage({ type: 'error', text: 'Failed to load insurance plans' });
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!selectedPlanId) {
      setMessage({ type: 'error', text: 'Please select a plan' });
      return;
    }

    try {
      setEnrolling(true);
      await benefitsService.enrollInInsurance({
        employee_id: employeeId,
        insurance_plan_id: selectedPlanId,
        enrollment_date: new Date(),
        effective_from: new Date(),
      });
      setMessage({ type: 'success', text: 'Successfully enrolled in insurance plan' });
      setSelectedPlanId('');
      fetchData();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to enroll' });
    } finally {
      setEnrolling(false);
    }
  };

  const isEnrolledInPlan = (planId: string) => {
    return enrollments.some((e) => e.insurance_plan_id === planId && e.status === 'active');
  };

  if (loading) {
    return <div className="text-center py-8">Loading insurance plans...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Insurance Enrollment</h2>

      {message && (
        <Card className={message.type === 'success' ? 'border-success' : 'border-destructive'}>
          <CardContent className="pt-6 flex gap-2">
            {message.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
            )}
            <p>{message.text}</p>
          </CardContent>
        </Card>
      )}

      {/* Available Plans */}
      <Card>
        <CardHeader>
          <CardTitle>Available Plans</CardTitle>
          <CardDescription>Select a plan to enroll</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {plans.map((plan) => {
              const isEnrolled = isEnrolledInPlan(plan.id);
              const isEnrollmentOpen =
                new Date() >= new Date(plan.enrollment_start_date) &&
                new Date() <= new Date(plan.enrollment_end_date);

              return (
                <div
                  key={plan.id}
                  className={`p-4 border rounded-lg cursor-pointer transition ${
                    selectedPlanId === plan.id ? 'border-primary bg-primary/5' : 'border-border'
                  } ${isEnrolled ? 'opacity-50' : ''}`}
                  onClick={() => !isEnrolled && setSelectedPlanId(plan.id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold">{plan.name}</h3>
                      <p className="text-sm text-muted-foreground">{plan.provider}</p>
                    </div>
                    {isEnrolled && <Badge className="bg-success">Enrolled</Badge>}
                    {!isEnrollmentOpen && (
                      <Badge variant="secondary">Enrollment Closed</Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Coverage</p>
                      <p className="font-medium">{plan.coverage_type}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Premium</p>
                      <p className="font-medium">₹{plan.premium_amount.toLocaleString()}/month</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {selectedPlanId && (
            <Button
              onClick={handleEnroll}
              disabled={enrolling}
              className="w-full mt-4"
            >
              {enrolling ? 'Enrolling...' : 'Confirm Enrollment'}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Current Enrollments */}
      {enrollments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Enrollments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {enrollments.map((enrollment) => {
                const plan = plans.find((p) => p.id === enrollment.insurance_plan_id);
                return (
                  <div key={enrollment.id} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{plan?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Effective from {new Date(enrollment.effective_from).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className={enrollment.status === 'active' ? 'bg-success' : 'bg-muted'}>
                        {enrollment.status}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
