import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { benefitsService } from '../../services/benefitsService';
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';

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
  plan_id?: string;
  status: string;
  enrollment_date?: string;
  created_at: string;
}

interface InsuranceEnrollmentProps {
  employeeId: string;
}

export const InsuranceEnrollment: React.FC<InsuranceEnrollmentProps> = ({ employeeId }) => {
  const [plans, setPlans] = useState<InsurancePlan[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, [employeeId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [plansRes, enrollmentsRes] = await Promise.all([
        benefitsService.getInsurancePlans(true),
        benefitsService.getEmployeeEnrollments(employeeId),
      ]);
      setPlans(plansRes.data || []);
      setEnrollments(enrollmentsRes.data || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setMessage({ type: 'error', text: 'Failed to load insurance plans' });
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async (planId: string) => {
    setMessage(null);
    try {
      setRequesting(true);
      await benefitsService.enrollInInsurance({
        employee_id: employeeId,
        insurance_plan_id: planId,
        enrollment_date: new Date().toISOString(),
        effective_from: new Date().toISOString(),
      });
      setMessage({ type: 'success', text: 'Enrollment request submitted. Awaiting manager approval.' });
      fetchData();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to submit request' });
    } finally {
      setRequesting(false);
    }
  };

  const getEnrollmentForPlan = (planId: string) =>
    enrollments.find((e) => (e.insurance_plan_id || e.plan_id) === planId);

  const getStatusBadge = (status: string) => {
    if (status === 'active') return <Badge className="bg-green-100 text-green-800">Enrolled</Badge>;
    if (status === 'pending') return <Badge className="bg-yellow-100 text-yellow-800 gap-1"><Clock className="w-3 h-3" />Pending Approval</Badge>;
    if (status === 'rejected') return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
    if (status === 'cancelled') return <Badge className="bg-gray-100 text-gray-800">Cancelled</Badge>;
    return <Badge variant="secondary">{status}</Badge>;
  };

  if (loading) {
    return <div className="text-center py-8">Loading insurance plans...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Insurance Enrollment</h2>

      {message && (
        <Card className={message.type === 'success' ? 'border-green-400' : 'border-destructive'}>
          <CardContent className="pt-6 flex gap-2">
            {message.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
            )}
            <p>{message.text}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Available Plans</CardTitle>
          <CardDescription>Browse available plans and submit an enrollment request</CardDescription>
        </CardHeader>
        <CardContent>
          {plans.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No active insurance plans available</p>
          ) : (
            <div className="space-y-4">
              {plans.map((plan) => {
                const enrollment = getEnrollmentForPlan(plan.id);
                const isEnrollmentOpen =
                  new Date() >= new Date(plan.enrollment_start_date) &&
                  new Date() <= new Date(plan.enrollment_end_date);
                const canRequest = !enrollment && isEnrollmentOpen;

                return (
                  <div key={plan.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{plan.name}</h3>
                        <p className="text-sm text-muted-foreground">{plan.provider}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {enrollment ? (
                          getStatusBadge(enrollment.status)
                        ) : !isEnrollmentOpen ? (
                          <Badge variant="secondary">Enrollment Closed</Badge>
                        ) : null}
                      </div>
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
                      <div className="col-span-2">
                        <p className="text-muted-foreground">Enrollment Window</p>
                        <p className="font-medium text-xs">
                          {new Date(plan.enrollment_start_date).toLocaleDateString()} –{' '}
                          {new Date(plan.enrollment_end_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {canRequest && (
                      <Button
                        size="sm"
                        onClick={() => handleRequest(plan.id)}
                        disabled={requesting}
                        className="w-full"
                      >
                        {requesting ? 'Submitting…' : 'Request Enrollment'}
                      </Button>
                    )}

                    {enrollment?.status === 'rejected' && isEnrollmentOpen && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRequest(plan.id)}
                        disabled={requesting}
                        className="w-full"
                      >
                        Re-apply
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {enrollments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>My Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {enrollments.map((enrollment) => {
                const plan = plans.find((p) => p.id === (enrollment.insurance_plan_id || enrollment.plan_id));
                return (
                  <div key={enrollment.id} className="p-3 border rounded-lg flex justify-between items-center">
                    <div>
                      <p className="font-medium">{plan?.name ?? 'Unknown Plan'}</p>
                      <p className="text-sm text-muted-foreground">
                        Requested on {new Date(enrollment.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {getStatusBadge(enrollment.status)}
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
