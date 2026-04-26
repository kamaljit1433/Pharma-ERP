import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { UserCircle, Mail, Phone, Calendar, Camera, Loader2 } from 'lucide-react';

interface Employee {
  id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  personal_email?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  department_id?: string;
  designation_id?: string;
  employment_type: 'permanent' | 'contract' | 'temporary' | 'intern';
  status: 'active' | 'on_leave' | 'suspended' | 'resigned' | 'terminated';
  date_of_joining: string;
  profile_photo_url?: string;
}

interface EmployeeDetailsProps {
  employee: Employee;
  onPhotoUpload?: () => void;
  isUploadingPhoto?: boolean;
}

export const EmployeeDetails: React.FC<EmployeeDetailsProps> = ({ employee, onPhotoUpload, isUploadingPhoto }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success text-success-foreground';
      case 'on_leave':
        return 'bg-info text-info-foreground';
      case 'suspended':
        return 'bg-warning text-warning-foreground';
      case 'resigned':
      case 'terminated':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getInitials = () => {
    const f = employee.first_name?.charAt(0) ?? '';
    const l = employee.last_name?.charAt(0) ?? '';
    return `${f}${l}`.toUpperCase() || '?';
  };

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="relative group shrink-0">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={employee.profile_photo_url} alt={employee.first_name} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                {onPhotoUpload && (
                  <button
                    type="button"
                    onClick={onPhotoUpload}
                    disabled={isUploadingPhoto}
                    className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {isUploadingPhoto
                      ? <Loader2 className="h-5 w-5 text-white animate-spin" />
                      : <Camera className="h-5 w-5 text-white" />}
                  </button>
                )}
              </div>
              <div>
                <CardTitle className="text-2xl">
                  {employee.first_name} {employee.last_name}
                </CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <span className="font-mono text-sm">{employee.employee_id}</span>
                  <Badge className={getStatusColor(employee.status)}>
                    {employee.status?.replace('_', ' ') ?? ''}
                  </Badge>
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Work Email</p>
              <p className="font-medium">{employee.email}</p>
            </div>
            {employee.personal_email && (
              <div>
                <p className="text-sm text-muted-foreground">Personal Email</p>
                <p className="font-medium">{employee.personal_email}</p>
              </div>
            )}
            {employee.phone && (
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone
                </p>
                <p className="font-medium">{employee.phone}</p>
              </div>
            )}
          </div>
          {employee.address && (
            <div>
              <p className="text-sm text-muted-foreground">Address</p>
              <p className="font-medium">
                {employee.address}
                {employee.city && `, ${employee.city}`}
                {employee.state && `, ${employee.state}`}
                {employee.postal_code && ` ${employee.postal_code}`}
                {employee.country && `, ${employee.country}`}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Personal Details */}
      {(employee.date_of_birth || employee.gender) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <UserCircle className="h-5 w-5" />
              Personal Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              {employee.date_of_birth && (
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Date of Birth
                  </p>
                  <p className="font-medium">
                    {new Date(employee.date_of_birth).toLocaleDateString()}
                  </p>
                </div>
              )}
              {employee.gender && (
                <div>
                  <p className="text-sm text-muted-foreground">Gender</p>
                  <p className="font-medium">
                    {employee.gender.charAt(0).toUpperCase() + employee.gender.slice(1)}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
