import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types/auth';
import { InsurancePlanManagement } from '../components/benefits/InsurancePlanManagement';
import { InsuranceEnrollment } from '../components/benefits/InsuranceEnrollment';
import { PFStatement } from '../components/benefits/PFStatement';
import { GratuityCalculator } from '../components/benefits/GratuityCalculator';
import { ReimbursementClaimForm } from '../components/benefits/ReimbursementClaimForm';
import { ReimbursementApproval } from '../components/benefits/ReimbursementApproval';
import { RewardManagement } from '../components/benefits/RewardManagement';

const Benefits: React.FC = () => {
  const [activeTab, setActiveTab] = useState('insurance');
  const { user } = useAuth();

  const employeeId = user?.employeeId ?? '';
  const userId = user?.id ?? '';
  const isAdmin =
    user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.HR_MANAGER;
  const canApprove =
    user?.role === UserRole.SUPER_ADMIN ||
    user?.role === UserRole.HR_MANAGER ||
    user?.role === UserRole.DEPARTMENT_MANAGER ||
    user?.role === UserRole.FINANCE;

  const tabs = [
    { id: 'insurance', label: 'Insurance' },
    { id: 'pf', label: 'PF Statement' },
    { id: 'gratuity', label: 'Gratuity' },
    { id: 'reimbursement', label: 'Reimbursements' },
    ...(canApprove ? [{ id: 'approval', label: 'Approvals' }] : []),
    { id: 'rewards', label: 'Rewards' },
  ];

  return (
    <div className="space-y-4">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap py-3 px-1 border-b-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div>
        {activeTab === 'insurance' && (
          <div className="space-y-8">
            <InsurancePlanManagement />
            {employeeId && <InsuranceEnrollment employeeId={employeeId} />}
          </div>
        )}
        {activeTab === 'pf' && <PFStatement employeeId={employeeId} />}
        {activeTab === 'gratuity' && <GratuityCalculator employeeId={employeeId} />}
        {activeTab === 'reimbursement' && <ReimbursementClaimForm employeeId={employeeId} />}
        {activeTab === 'approval' && <ReimbursementApproval approverId={userId} />}
        {activeTab === 'rewards' && (
          <RewardManagement employeeId={employeeId} isAdmin={isAdmin} />
        )}
      </div>
    </div>
  );
};

export default Benefits;
