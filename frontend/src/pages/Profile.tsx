import React, { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/useToast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Camera, Loader2, Lock, Mail, Phone, User, Briefcase, Calendar, MapPin } from 'lucide-react';
import employeeService, { Employee } from '@/services/employeeService';
import hierarchyService from '@/services/hierarchyService';
import apiClient from '@/services/api';

const Profile: React.FC = () => {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [departmentName, setDepartmentName] = useState<string>('');
  const [designationName, setDesignationName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isSavingPersonal, setIsSavingPersonal] = useState(false);

  // Personal info edit state
  const [personalForm, setPersonalForm] = useState({
    phone: '',
    personal_email: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
  });

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user?.employeeId) {
      loadEmployee();
    }
  }, [user?.employeeId]);

  const loadEmployee = async () => {
    if (!user?.employeeId) return;
    setLoading(true);
    try {
      // Try by UUID first, fall back to employee_id string search
      let emp: Employee | null = null;
      try {
        emp = await employeeService.getById(user.employeeId);
      } catch {
        const results = await employeeService.search(user.employeeId, 1);
        emp = results[0] ?? null;
      }
      if (emp) {
        setEmployee(emp);

        const [departments, designations] = await Promise.all([
          hierarchyService.getDepartments(),
          hierarchyService.getDesignations(),
        ]);
        const deptId = (emp as any).department_id;
        const desigId = (emp as any).designation_id;
        setDepartmentName(departments.find((d) => d.id === deptId)?.name ?? deptId ?? '—');
        setDesignationName(designations.find((d) => d.id === desigId)?.name ?? desigId ?? '—');

        setPersonalForm({
          phone: (emp as any).phone ?? '',
          personal_email: (emp as any).personal_email ?? '',
          address: (emp as any).address ?? '',
          city: (emp as any).city ?? '',
          state: (emp as any).state ?? '',
          postal_code: (emp as any).postal_code ?? '',
          country: (emp as any).country ?? '',
        });
      }
    } catch (err: any) {
      toast({ type: 'error', message: err.message || 'Failed to load profile' });
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !employee?.id) return;
    setIsUploadingPhoto(true);
    try {
      await employeeService.uploadPhoto(employee.id, file);
      await loadEmployee();
      toast({ type: 'success', message: 'Profile photo updated' });
    } catch (err: any) {
      toast({ type: 'error', message: err.message || 'Failed to upload photo' });
    } finally {
      setIsUploadingPhoto(false);
      if (photoInputRef.current) photoInputRef.current.value = '';
    }
  };

  const handleSavePersonal = async () => {
    if (!employee?.id) return;
    setIsSavingPersonal(true);
    try {
      await employeeService.update(employee.id, {
        phone: personalForm.phone || undefined,
      } as any);
      // Patch non-standard fields directly
      await apiClient.put(`/employees/${employee.id}`, personalForm);
      await loadEmployee();
      toast({ type: 'success', message: 'Profile updated successfully' });
    } catch (err: any) {
      toast({ type: 'error', message: err.message || 'Failed to update profile' });
    } finally {
      setIsSavingPersonal(false);
    }
  };

  const validatePassword = () => {
    const errors: Record<string, string> = {};
    if (!passwordForm.current_password) errors.current_password = 'Current password is required';
    if (!passwordForm.new_password) errors.new_password = 'New password is required';
    else if (passwordForm.new_password.length < 8) errors.new_password = 'Password must be at least 8 characters';
    if (passwordForm.new_password !== passwordForm.confirm_password)
      errors.confirm_password = 'Passwords do not match';
    return errors;
  };

  const handleChangePassword = async () => {
    const errors = validatePassword();
    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }
    setPasswordErrors({});
    setIsChangingPassword(true);
    try {
      await apiClient.post('/auth/password/change', {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      });
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
      toast({ type: 'success', message: 'Password changed successfully' });
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to change password';
      toast({ type: 'error', message: msg });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const getInitials = () => {
    if (!employee) return user?.email?.charAt(0).toUpperCase() ?? 'U';
    return `${employee.first_name?.charAt(0) ?? ''}${employee.last_name?.charAt(0) ?? ''}`.toUpperCase();
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'hr_manager': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'department_manager': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'finance': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'it_admin': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatRole = (role: string) =>
    role.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  const formatDate = (d?: string) => {
    if (!d) return '—';
    try { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
    catch { return d; }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-48" />
        <div className="flex items-center gap-6">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold">My Profile</h1>

      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar with upload */}
            <div className="relative flex-shrink-0">
              <Avatar className="h-24 w-24 text-2xl">
                <AvatarImage src={employee?.profile_photo_url} alt="Profile photo" />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-semibold">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <button
                onClick={() => photoInputRef.current?.click()}
                disabled={isUploadingPhoto}
                className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                title="Change photo"
              >
                {isUploadingPhoto
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <Camera className="h-4 w-4" />}
              </button>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
              />
            </div>

            {/* Identity */}
            <div className="flex-1 text-center sm:text-left space-y-2">
              <h2 className="text-xl font-bold">
                {employee
                  ? `${employee.first_name} ${employee.last_name}`
                  : user?.email?.split('@')[0]}
              </h2>
              <p className="text-muted-foreground">{user?.email}</p>
              <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                <Badge className={getRoleBadgeColor(user?.role ?? '')}>
                  {formatRole(user?.role ?? '')}
                </Badge>
                {user?.employeeId && (
                  <Badge variant="outline">{user.employeeId}</Badge>
                )}
                {employee?.status && (
                  <Badge className={
                    employee.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }>
                    {employee.status.replace('_', ' ')}
                  </Badge>
                )}
              </div>
            </div>

            {/* Quick stats */}
            {employee && (
              <div className="hidden md:flex flex-col gap-1 text-sm text-muted-foreground text-right">
                <span>Joined {formatDate(employee.date_of_joining)}</span>
                <span className="capitalize">{employee.employment_type} employee</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="personal">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="employment">Employment</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* ── Personal Info ─────────────────────────────────────────── */}
        <TabsContent value="personal" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4" /> Personal Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">First Name</Label>
                  <p className="font-medium">{employee?.first_name || '—'}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">Last Name</Label>
                  <p className="font-medium">{employee?.last_name || '—'}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs flex items-center gap-1">
                    <Mail className="h-3 w-3" /> Work Email
                  </Label>
                  <p className="font-medium">{employee?.email || user?.email || '—'}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">Date of Birth</Label>
                  <p className="font-medium">{formatDate((employee as any)?.date_of_birth)}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">Gender</Label>
                  <p className="font-medium capitalize">{(employee as any)?.gender || '—'}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">Blood Group</Label>
                  <p className="font-medium">{(employee as any)?.blood_group || '—'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Editable contact fields */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Phone className="h-4 w-4" /> Contact & Address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={personalForm.phone}
                    onChange={(e) => setPersonalForm((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="+91-9000000000"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="personal_email">Personal Email</Label>
                  <Input
                    id="personal_email"
                    type="email"
                    value={personalForm.personal_email}
                    onChange={(e) => setPersonalForm((p) => ({ ...p, personal_email: e.target.value }))}
                    placeholder="personal@email.com"
                  />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1 md:col-span-2">
                  <Label htmlFor="address" className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> Address
                  </Label>
                  <Input
                    id="address"
                    value={personalForm.address}
                    onChange={(e) => setPersonalForm((p) => ({ ...p, address: e.target.value }))}
                    placeholder="Street address"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={personalForm.city}
                    onChange={(e) => setPersonalForm((p) => ({ ...p, city: e.target.value }))}
                    placeholder="Mumbai"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={personalForm.state}
                    onChange={(e) => setPersonalForm((p) => ({ ...p, state: e.target.value }))}
                    placeholder="Maharashtra"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="postal_code">Postal Code</Label>
                  <Input
                    id="postal_code"
                    value={personalForm.postal_code}
                    onChange={(e) => setPersonalForm((p) => ({ ...p, postal_code: e.target.value }))}
                    placeholder="400001"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={personalForm.country}
                    onChange={(e) => setPersonalForm((p) => ({ ...p, country: e.target.value }))}
                    placeholder="India"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSavePersonal} disabled={isSavingPersonal}>
                  {isSavingPersonal && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Employment ────────────────────────────────────────────── */}
        <TabsContent value="employment" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Briefcase className="h-4 w-4" /> Employment Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoRow label="Employee ID" value={user?.employeeId} />
                <InfoRow
                  label="Date of Joining"
                  value={<span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(employee?.date_of_joining)}</span>}
                />
                <InfoRow
                  label="Employment Type"
                  value={
                    <Badge variant="outline" className="capitalize">
                      {employee?.employment_type?.replace('_', ' ') || '—'}
                    </Badge>
                  }
                />
                <InfoRow
                  label="Status"
                  value={
                    <Badge className={employee?.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {employee?.status?.replace('_', ' ') || '—'}
                    </Badge>
                  }
                />
                <InfoRow label="Department" value={departmentName || '—'} />
                <InfoRow label="Designation" value={designationName || '—'} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Security ─────────────────────────────────────────────── */}
        <TabsContent value="security" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Lock className="h-4 w-4" /> Change Password
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 max-w-md">
              <div className="space-y-1">
                <Label htmlFor="current_password">Current Password</Label>
                <Input
                  id="current_password"
                  type="password"
                  value={passwordForm.current_password}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, current_password: e.target.value }))}
                  placeholder="Enter current password"
                />
                {passwordErrors.current_password && (
                  <p className="text-xs text-destructive">{passwordErrors.current_password}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="new_password">New Password</Label>
                <Input
                  id="new_password"
                  type="password"
                  value={passwordForm.new_password}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, new_password: e.target.value }))}
                  placeholder="At least 8 characters"
                />
                {passwordErrors.new_password && (
                  <p className="text-xs text-destructive">{passwordErrors.new_password}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="confirm_password">Confirm New Password</Label>
                <Input
                  id="confirm_password"
                  type="password"
                  value={passwordForm.confirm_password}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, confirm_password: e.target.value }))}
                  placeholder="Repeat new password"
                />
                {passwordErrors.confirm_password && (
                  <p className="text-xs text-destructive">{passwordErrors.confirm_password}</p>
                )}
              </div>
              <Button onClick={handleChangePassword} disabled={isChangingPassword}>
                {isChangingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Change Password
              </Button>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-base">Account Info</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoRow label="Email" value={user?.email} />
                <InfoRow label="Role" value={formatRole(user?.role ?? '')} />
                <InfoRow label="MFA" value={user?.mfaEnabled ? 'Enabled' : 'Disabled'} />
                <InfoRow label="Account Status" value={user?.isActive ? 'Active' : 'Inactive'} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Small helper to display a label + value row
const InfoRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="space-y-1">
    <p className="text-xs text-muted-foreground">{label}</p>
    <div className="font-medium text-sm">{value ?? '—'}</div>
  </div>
);

export default Profile;
