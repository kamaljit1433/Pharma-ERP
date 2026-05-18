import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types/auth';
import { OrgChartFlow } from '../components/hierarchy/OrgChartFlow';
import { DepartmentManagement } from '../components/hierarchy/DepartmentManagement';
import { DesignationManagement } from '../components/hierarchy/DesignationManagement';
import { Network, Building2, Briefcase } from 'lucide-react';

const tabs = [
  { id: 'chart', label: 'Org Chart', icon: Network },
  { id: 'departments', label: 'Departments', icon: Building2 },
  { id: 'designations', label: 'Designations', icon: Briefcase },
];

const Organization: React.FC = () => {
  const [activeTab, setActiveTab] = useState('chart');
  const { user } = useAuth();

  const isAdmin =
    user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.HR_MANAGER;

  const visibleTabs = tabs.filter((tab) => {
    if (tab.id === 'departments' || tab.id === 'designations') return isAdmin;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl lg:text-3xl">Organization</h1>
        <p className="text-sm text-muted-foreground mt-1">
          View the company hierarchy, manage departments and designations
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-6 overflow-x-auto">
          {visibleTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 whitespace-nowrap py-3 px-1 border-b-2 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'chart' && <OrgChartFlow />}
        {activeTab === 'departments' && isAdmin && <DepartmentManagement />}
        {activeTab === 'designations' && isAdmin && <DesignationManagement />}
      </div>
    </div>
  );
};

export default Organization;
