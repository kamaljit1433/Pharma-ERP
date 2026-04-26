import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Calendar, Briefcase, Building2, Hash } from 'lucide-react';

interface Employee {
  id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  department_id?: string;
  designation_id?: string;
  reporting_manager_id?: string;
  employment_type: 'permanent' | 'contract' | 'temporary' | 'intern';
  status: 'active' | 'on_leave' | 'suspended' | 'resigned' | 'terminated';
  date_of_joining: string;
  date_of_birth?: string;
  gender?: string;
}

interface Props {
  employee: Employee;
}

export const EmployeeEmploymentDetails: React.FC<Props> = ({ employee }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success text-success-foreground';
      case 'on_leave': return 'bg-info text-info-foreground';
      case 'suspended': return 'bg-warning text-warning-foreground';
      case 'resigned':
      case 'terminated': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const capitalize = (s?: string) =>
    s ? s.charAt(0).toUpperCase() + s.slice(1) : '—';

  return (
    <div className="space-y-4">
      {/* Employment Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Employment Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Employee ID
              </p>
              <p className="font-mono font-medium">{employee.employee_id}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge className={getStatusColor(employee.status)}>
                {employee.status?.replace('_', ' ') ?? '—'}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date of Joining
              </p>
              <p className="font-medium">
                {employee.date_of_joining
                  ? new Date(employee.date_of_joining).toLocaleDateString()
                  : '—'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Employment Type</p>
              <p className="font-medium">{capitalize(employee.employment_type)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Organization Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Organization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Department</p>
              <p className="font-medium">{employee.department_id || '—'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Designation</p>
              <p className="font-medium">{employee.designation_id || '—'}</p>
            </div>
            {employee.reporting_manager_id && (
              <div>
                <p className="text-sm text-muted-foreground">Reporting Manager</p>
                <p className="font-medium">{employee.reporting_manager_id}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Work Email */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Work Contact</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Work Email</p>
              <p className="font-medium">{employee.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
