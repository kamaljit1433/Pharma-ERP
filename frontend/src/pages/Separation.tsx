import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { OffboardingDashboard } from '../components/separation/OffboardingDashboard';

const Separation: React.FC = () => {
  const { user } = useAuth();
  const employeeId = user?.employeeId ?? '';
  const employeeName = user ? `${user.email}` : '';

  return <OffboardingDashboard employeeId={employeeId} employeeName={employeeName} />;
};

export default Separation;
