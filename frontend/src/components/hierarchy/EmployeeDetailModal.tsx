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
      <DialogContent className="max-w-sm flex flex-col max-h-[90vh] overflow-hidden p-0 gap-0">
        {/* Fixed header */}
        <DialogHeader className="px-5 pt-5 pb-3 flex-shrink-0 border-b">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12 flex-shrink-0">
              <AvatarImage src={node.profilePhotoUrl} alt={node.employeeName} />
              <AvatarFallback className="text-base font-semibold">
                {getInitials(node.employeeName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <DialogTitle className="text-base leading-tight truncate">
                {node.employeeName}
              </DialogTitle>
              <DialogDescription className="text-xs truncate mt-0.5">
                {node.designationName}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 min-h-0">
          {/* Information */}
          <Card>
            <CardHeader className="pb-2 pt-3 px-4">
              <CardTitle className="text-sm">Information</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-3 space-y-3">
              <div className="flex items-start gap-3">
                <Building2 className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Department</p>
                  <p className="text-sm font-medium truncate">{node.departmentName}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Briefcase className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Designation</p>
                  <p className="text-sm font-medium truncate">{node.designationName}</p>
                </div>
              </div>

              {node.managerName && (
                <div className="flex items-start gap-3">
                  <User className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Reporting Manager</p>
                    <p className="text-sm font-medium truncate">{node.managerName}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <div className="w-4 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge variant={node.isActive ? 'default' : 'secondary'} className="text-xs mt-0.5">
                    {node.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Team */}
          {directReportCount > 0 && (
            <Card>
              <CardHeader className="pb-2 pt-3 px-4">
                <CardTitle className="text-sm">Team</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-3">
                <div className="flex items-center gap-3 mb-3">
                  <Users className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Direct Reports</p>
                    <p className="text-base font-semibold leading-tight">{directReportCount}</p>
                  </div>
                </div>

                {node.children && node.children.length > 0 && (
                  <>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Team Members:</p>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-0.5">
                      {node.children.map((child) => (
                        <div
                          key={child.id}
                          className="flex items-center gap-2 p-2 rounded-md bg-muted/50"
                        >
                          <Avatar className="w-6 h-6 flex-shrink-0">
                            <AvatarImage src={child.profilePhotoUrl} alt={child.employeeName} />
                            <AvatarFallback className="text-xs">
                              {getInitials(child.employeeName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">{child.employeeName}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {child.designationName}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Fixed footer */}
        <div className="px-5 py-3 flex-shrink-0 border-t flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1 h-9 text-sm">
            Close
          </Button>
          <Button onClick={handleViewProfile} className="flex-1 h-9 text-sm">
            View Full Profile
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeDetailModal;
