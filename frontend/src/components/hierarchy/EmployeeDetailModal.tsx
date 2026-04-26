import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { HierarchyNode } from '../../services/hierarchyService';
import { Users, Mail, Briefcase, Building2, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface EmployeeDetailModalProps {
  node: HierarchyNode | null;
  isOpen: boolean;
  onClose: () => void;
}

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const EmployeeDetailModal: React.FC<EmployeeDetailModalProps> = ({
  node,
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();

  if (!node) return null;

  const handleViewProfile = () => {
    navigate(`/employees/${node.employeeId}`);
    onClose();
  };

  const directReportCount = node.children?.length || 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Employee Details</DialogTitle>
          <DialogDescription>View employee information and team structure</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Employee Header */}
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={node.profilePhotoUrl} alt={node.employeeName} />
              <AvatarFallback className="text-lg font-semibold">
                {getInitials(node.employeeName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate">{node.employeeName}</h3>
              <p className="text-sm text-muted-foreground truncate">{node.designationName}</p>
            </div>
          </div>

          {/* Employee Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Department */}
              <div className="flex items-start gap-3">
                <Building2 className="w-4 h-4 mt-1 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Department</p>
                  <p className="text-sm font-medium truncate">{node.departmentName}</p>
                </div>
              </div>

              {/* Designation */}
              <div className="flex items-start gap-3">
                <Briefcase className="w-4 h-4 mt-1 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Designation</p>
                  <p className="text-sm font-medium truncate">{node.designationName}</p>
                </div>
              </div>

              {/* Manager */}
              {node.managerName && (
                <div className="flex items-start gap-3">
                  <User className="w-4 h-4 mt-1 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Reporting Manager</p>
                    <p className="text-sm font-medium truncate">{node.managerName}</p>
                  </div>
                </div>
              )}

              {/* Status */}
              <div className="flex items-start gap-3">
                <div className="w-4 h-4 mt-1 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge variant={node.isActive ? 'default' : 'secondary'} className="text-xs">
                    {node.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Team Information */}
          {directReportCount > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Team</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Direct Reports</p>
                    <p className="text-lg font-semibold">{directReportCount}</p>
                  </div>
                </div>

                {/* Direct Reports List */}
                {node.children && node.children.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Team Members:</p>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {node.children.map((child) => (
                        <div
                          key={child.id}
                          className="flex items-center gap-2 p-2 rounded-md bg-muted/50 text-sm"
                        >
                          <Avatar className="w-6 h-6 flex-shrink-0">
                            <AvatarImage src={child.profilePhotoUrl} alt={child.employeeName} />
                            <AvatarFallback className="text-xs">
                              {getInitials(child.employeeName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium truncate">{child.employeeName}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {child.designationName}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Close
            </Button>
            <Button onClick={handleViewProfile} className="flex-1">
              View Full Profile
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeDetailModal;
