import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { UserPlus, Save, X } from 'lucide-react';

interface EmployeeFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  personal_email?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  pan?: string;
  aadhar?: string;
  department_id?: string;
  designation_id?: string;
  date_of_joining: string;
  employment_type: 'permanent' | 'contract' | 'temporary' | 'intern';
}

interface EmployeeFormProps {
  initialData?: Partial<EmployeeFormData>;
  employee?: any;
  onSubmit: (data: EmployeeFormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export const EmployeeForm: React.FC<EmployeeFormProps> = ({
  initialData,
  employee,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const data = employee || initialData;
  const [formData, setFormData] = useState<EmployeeFormData>({
    first_name: data?.first_name || '',
    last_name: data?.last_name || '',
    email: data?.email || '',
    phone: data?.phone || '',
    personal_email: data?.personal_email || '',
    date_of_birth: data?.date_of_birth || '',
    gender: data?.gender || 'male',
    address: data?.address || '',
    city: data?.city || '',
    state: initialData?.state || '',
    postal_code: initialData?.postal_code || '',
    country: initialData?.country || '',
    pan: initialData?.pan || '',
    aadhar: initialData?.aadhar || '',
    department_id: initialData?.department_id || '',
    designation_id: initialData?.designation_id || '',
    date_of_joining: initialData?.date_of_joining || '',
    employment_type: initialData?.employment_type || 'permanent',
  });

  interface FormErrors { first_name?: string; last_name?: string; email?: string; date_of_joining?: string; }
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.date_of_joining) {
      newErrors.date_of_joining = 'Date of joining is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field if it's a validated field
    const errorKey = name as keyof FormErrors;
    if (errors[errorKey]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[errorKey];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Convert empty strings to undefined for optional UUID and nullable fields
    const uuidFields = ['department_id', 'designation_id', 'reporting_manager_id'] as const;
    const optionalStringFields = [
      'phone', 'personal_email', 'date_of_birth', 'address',
      'city', 'state', 'postal_code', 'country', 'pan', 'aadhar',
    ] as const;

    const sanitized: any = { ...formData };
    for (const field of uuidFields) {
      if (!sanitized[field]) sanitized[field] = undefined;
    }
    for (const field of optionalStringFields) {
      if (!sanitized[field]) sanitized[field] = undefined;
    }

    await onSubmit(sanitized);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          {employee || initialData ? 'Edit Employee' : 'Add New Employee'}
        </CardTitle>
        <CardDescription>
          {employee || initialData
            ? 'Update employee information'
            : 'Create a new employee record in the system'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Personal Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">First Name *</label>
                <Input
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="John"
                  className={errors.first_name ? 'border-destructive' : ''}
                />
                {errors.first_name && (
                  <p className="text-sm text-destructive mt-1">{errors.first_name}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">Last Name *</label>
                <Input
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="Doe"
                  className={errors.last_name ? 'border-destructive' : ''}
                />
                {errors.last_name && (
                  <p className="text-sm text-destructive mt-1">{errors.last_name}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">Date of Birth</label>
                <Input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Contact Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Work Email *</label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@company.com"
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-destructive mt-1">{errors.email}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">Personal Email</label>
                <Input
                  type="email"
                  name="personal_email"
                  value={formData.personal_email}
                  onChange={handleChange}
                  placeholder="john@personal.com"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Phone</label>
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Address</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-sm font-medium">Street Address</label>
                <Input
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="123 Main Street"
                />
              </div>
              <div>
                <label className="text-sm font-medium">City</label>
                <Input
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="New York"
                />
              </div>
              <div>
                <label className="text-sm font-medium">State</label>
                <Input
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="NY"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Postal Code</label>
                <Input
                  name="postal_code"
                  value={formData.postal_code}
                  onChange={handleChange}
                  placeholder="10001"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Country</label>
                <Input
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  placeholder="United States"
                />
              </div>
            </div>
          </div>

          {/* Employment Information */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Employment Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Date of Joining *</label>
                <Input
                  type="date"
                  name="date_of_joining"
                  value={formData.date_of_joining}
                  onChange={handleChange}
                  className={errors.date_of_joining ? 'border-destructive' : ''}
                />
                {errors.date_of_joining && (
                  <p className="text-sm text-destructive mt-1">{errors.date_of_joining}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">Employment Type</label>
                <select
                  name="employment_type"
                  value={formData.employment_type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="permanent">Permanent</option>
                  <option value="contract">Contract</option>
                  <option value="temporary">Temporary</option>
                  <option value="intern">Intern</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Department ID</label>
                <Input
                  name="department_id"
                  value={formData.department_id}
                  onChange={handleChange}
                  placeholder="Department UUID"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Designation ID</label>
                <Input
                  name="designation_id"
                  value={formData.designation_id}
                  onChange={handleChange}
                  placeholder="Designation UUID"
                />
              </div>
            </div>
          </div>

          {/* Government IDs */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Government IDs</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">PAN</label>
                <Input
                  name="pan"
                  value={formData.pan}
                  onChange={handleChange}
                  placeholder="ABCDE1234F"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Aadhar</label>
                <Input
                  name="aadhar"
                  value={formData.aadhar}
                  onChange={handleChange}
                  placeholder="123456789012"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="gap-2">
              <Save className="h-4 w-4" />
              {isLoading ? 'Saving...' : 'Save Employee'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
