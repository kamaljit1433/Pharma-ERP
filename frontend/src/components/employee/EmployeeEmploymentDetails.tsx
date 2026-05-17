import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Calendar, Briefcase, Building2, Hash, ChevronDown, Package } from 'lucide-react';
import hierarchyService from '../../services/hierarchyService';
import employeeService from '../../services/employeeService';
import { assetService, Asset } from '../../services/assetService';

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

type EmployeeStatus = Employee['status'];

const STATUS_OPTIONS: { value: EmployeeStatus; label: string }[] = [
  { value: 'active',     label: 'Active' },
  { value: 'on_leave',   label: 'On Leave' },
  { value: 'suspended',  label: 'Suspended' },
  { value: 'resigned',   label: 'Resigned' },
  { value: 'terminated', label: 'Terminated' },
];

interface Props {
  employee: Employee;
  canEdit?: boolean;
  onStatusChange?: (newStatus: EmployeeStatus) => Promise<void>;
}

export const EmployeeEmploymentDetails: React.FC<Props> = ({ employee, canEdit = false, onStatusChange }) => {
  const [departmentName, setDepartmentName] = useState<string | null>(null);
  const [designationName, setDesignationName] = useState<string | null>(null);
  const [managerName, setManagerName] = useState<string | null>(null);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<EmployeeStatus>(employee.status);
  const [isSaving, setIsSaving] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [assetsLoading, setAssetsLoading] = useState(true);

  useEffect(() => {
    hierarchyService.getDepartments().then((depts) => {
      const match = depts.find((d) => d.id === employee.department_id);
      setDepartmentName(match?.name ?? null);
    });
    hierarchyService.getDesignations().then((desigs) => {
      const match = desigs.find((d) => d.id === employee.designation_id);
      setDesignationName(match?.name ?? null);
    });
    if (employee.reporting_manager_id) {
      employeeService.getById(employee.reporting_manager_id).then((mgr) => {
        setManagerName(`${mgr.first_name} ${mgr.last_name}`);
      }).catch(() => setManagerName(null));
    } else {
      setManagerName(null);
    }
  }, [employee.department_id, employee.designation_id, employee.reporting_manager_id]);

  useEffect(() => {
    setAssetsLoading(true);
    assetService.getByEmployee(employee.id)
      .then(setAssets)
      .catch(() => setAssets([]))
      .finally(() => setAssetsLoading(false));
  }, [employee.id]);

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

  const handleStatusSave = async () => {
    if (!onStatusChange || selectedStatus === employee.status) return;
    setIsSaving(true);
    try {
      await onStatusChange(selectedStatus);
      setShowStatusDialog(false);
    } finally {
      setIsSaving(false);
    }
  };

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
              <div className="flex items-center gap-2 mt-1">
                <Badge className={getStatusColor(employee.status)}>
                  {employee.status?.replace('_', ' ') ?? '—'}
                </Badge>
                {canEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      setSelectedStatus(employee.status);
                      setShowStatusDialog(true);
                    }}
                  >
                    <ChevronDown className="h-3 w-3 mr-1" />
                    Change
                  </Button>
                )}
              </div>
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
              <p className="font-medium">
                {employee.department_id
                  ? (departmentName ?? employee.department_id)
                  : '—'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Designation</p>
              <p className="font-medium">
                {employee.designation_id
                  ? (designationName ?? employee.designation_id)
                  : '—'}
              </p>
            </div>
            {employee.reporting_manager_id && (
              <div>
                <p className="text-sm text-muted-foreground">Reporting Manager</p>
                <p className="font-medium">
                  {managerName ?? employee.reporting_manager_id}
                </p>
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

      {/* Assigned Assets Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="h-5 w-5" />
            Assigned Assets
            {!assetsLoading && (
              <span className="ml-auto text-sm font-normal text-muted-foreground">
                {assets.length} {assets.length === 1 ? 'item' : 'items'}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {assetsLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : assets.length === 0 ? (
            <p className="text-sm text-muted-foreground">No assets assigned to this employee.</p>
          ) : (
            <div className="divide-y divide-border">
              {assets.map((asset) => (
                <div key={asset.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{asset.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{asset.asset_code}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge variant="outline" className="text-xs">{asset.category}</Badge>
                    {asset.assigned_date && (
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        Since {new Date(asset.assigned_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Change Status Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Change Employee Status</DialogTitle>
            <DialogDescription>
              Update the employment status for {employee.first_name} {employee.last_name}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Current status</span>
              <Badge className={getStatusColor(employee.status)}>
                {employee.status?.replace('_', ' ')}
              </Badge>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">New status</label>
              <Select
                value={selectedStatus}
                onValueChange={(v: string) => setSelectedStatus(v as EmployeeStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-block w-2 h-2 rounded-full ${
                            opt.value === 'active'     ? 'bg-green-500' :
                            opt.value === 'on_leave'   ? 'bg-blue-500'  :
                            opt.value === 'suspended'  ? 'bg-yellow-500':
                            'bg-red-500'
                          }`}
                        />
                        {opt.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowStatusDialog(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleStatusSave}
              disabled={isSaving || selectedStatus === employee.status}
            >
              {isSaving ? 'Saving…' : 'Update Status'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
