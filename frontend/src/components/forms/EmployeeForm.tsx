import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useUIStore } from '@/store/uiStore';
import { isValidEmail, isValidPhone, isRequired } from '@/utils/validators';
import { CreateEmployeeDTO, UpdateEmployeeDTO } from '@/services/employeeService';
import { Upload, X } from 'lucide-react';

interface Employee {
  id?: string;
  employee_id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  department_id?: string;
  designation_id?: string;
  reporting_manager_id?: string;
  date_of_joining: string;
  employment_type: 'permanent' | 'contract' | 'temporary' | 'intern';
  profile_photo_url?: string;
}

interface EmployeeFormProps {
  employee?: Employee;
  onSubmit: (data: CreateEmployeeDTO | UpdateEmployeeDTO) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

interface FormErrors {
  [key: string]: string;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({
  employee,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const { addToast } = useUIStore();
  const isEditMode = !!employee?.id;

  // Form state
  const [formData, setFormData] = useState<Employee>({
    first_name: employee?.first_name || '',
    last_name: employee?.last_name || '',
    email: employee?.email || '',
    phone: employee?.phone || '',
    date_of_birth: employee?.date_of_birth || '',
    gender: employee?.gender || '',
    address: employee?.address || '',
    city: employee?.city || '',
    state: employee?.state || '',
    postal_code: employee?.postal_code || '',
    country: employee?.country || '',
    department_id: employee?.department_id || '',
    designation_id: employee?.designation_id || '',
    reporting_manager_id: employee?.reporting_manager_id || '',
    date_of_joining: employee?.date_of_joining || '',
    employment_type: employee?.employment_type || 'permanent',
    profile_photo_url: employee?.profile_photo_url || '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>(
    employee?.profile_photo_url || ''
  );
  const [touched, setTouched] = useState<Set<string>>(new Set());

  // Validation schema
  const validateField = (name: string, value: any): string | undefined => {
    switch (name) {
      case 'first_name':
      case 'last_name':
        if (!isRequired(value)) return 'This field is required';
        if (typeof value === 'string' && value.length < 2)
          return 'Must be at least 2 characters';
        return undefined;

      case 'email':
        if (!isRequired(value)) return 'Email is required';
        if (!isValidEmail(value)) return 'Please enter a valid email address';
        return undefined;

      case 'phone':
        if (value && !isValidPhone(value))
          return 'Please enter a valid phone number';
        return undefined;

      case 'date_of_birth':
        if (value) {
          const date = new Date(value);
          if (isNaN(date.getTime())) return 'Please enter a valid date';
          const age = new Date().getFullYear() - date.getFullYear();
          if (age < 18) return 'Employee must be at least 18 years old';
        }
        return undefined;

      case 'date_of_joining':
        if (!isRequired(value)) return 'Date of joining is required';
        if (isNaN(new Date(value).getTime()))
          return 'Please enter a valid date';
        return undefined;

      case 'employment_type':
        if (!isRequired(value)) return 'Employment type is required';
        return undefined;

      default:
        return undefined;
    }
  };

  // Validate all fields
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key as keyof Employee]);
      if (error) {
        newErrors[key] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input change
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Validate on change if field was touched
    if (touched.has(name)) {
      const error = validateField(name, value);
      setErrors((prev) => ({
        ...prev,
        [name]: error || undefined,
      }));
    }
  };

  // Handle field blur
  const handleBlur = (
    e: React.FocusEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setTouched((prev) => new Set(prev).add(name));

    const error = validateField(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: error || undefined,
    }));
  };

  // Handle photo upload
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      addToast({
        type: 'error',
        message: 'Please upload a valid image file (JPEG, PNG, or GIF)',
      });
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      addToast({
        type: 'error',
        message: 'File size must be less than 5MB',
      });
      return;
    }

    setPhotoFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Remove photo
  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview('');
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      addToast({
        type: 'error',
        message: 'Please fix the errors in the form',
      });
      return;
    }

    try {
      const submitData = isEditMode
        ? ({
            first_name: formData.first_name,
            last_name: formData.last_name,
            phone: formData.phone,
            date_of_birth: formData.date_of_birth,
            gender: formData.gender,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            postal_code: formData.postal_code,
            country: formData.country,
            department_id: formData.department_id,
            designation_id: formData.designation_id,
            reporting_manager_id: formData.reporting_manager_id,
          } as UpdateEmployeeDTO)
        : ({
            first_name: formData.first_name,
            last_name: formData.last_name,
            email: formData.email,
            phone: formData.phone,
            date_of_birth: formData.date_of_birth,
            gender: formData.gender,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            postal_code: formData.postal_code,
            country: formData.country,
            department_id: formData.department_id,
            designation_id: formData.designation_id,
            reporting_manager_id: formData.reporting_manager_id,
            date_of_joining: formData.date_of_joining,
            employment_type: formData.employment_type,
          } as CreateEmployeeDTO);

      await onSubmit(submitData);

      addToast({
        type: 'success',
        message: isEditMode
          ? 'Employee updated successfully'
          : 'Employee created successfully',
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An error occurred';
      addToast({
        type: 'error',
        message: errorMessage,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Summary */}
      {Object.keys(errors).length > 0 && (
        <Card className="border-red-200 bg-red-50 p-4">
          <h3 className="font-semibold text-red-900 mb-2">
            Please fix the following errors:
          </h3>
          <ul className="list-disc list-inside space-y-1">
            {Object.entries(errors).map(([field, error]) => (
              <li key={field} className="text-sm text-red-700">
                {error}
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="employment">Employment</TabsTrigger>
          <TabsTrigger value="photo">Photo</TabsTrigger>
        </TabsList>

        {/* Personal Information Tab */}
        <TabsContent value="personal" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">
                First Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="John"
                className={errors.first_name ? 'border-red-500' : ''}
                disabled={isLoading}
              />
              {errors.first_name && (
                <p className="text-sm text-red-500">{errors.first_name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_name">
                Last Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Doe"
                className={errors.last_name ? 'border-red-500' : ''}
                disabled={isLoading}
              />
              {errors.last_name && (
                <p className="text-sm text-red-500">{errors.last_name}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="john.doe@company.com"
              className={errors.email ? 'border-red-500' : ''}
              disabled={isEditMode || isLoading}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="+1 (555) 123-4567"
                className={errors.phone ? 'border-red-500' : ''}
                disabled={isLoading}
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date_of_birth">Date of Birth</Label>
              <Input
                id="date_of_birth"
                name="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                onChange={handleChange}
                onBlur={handleBlur}
                className={errors.date_of_birth ? 'border-red-500' : ''}
                disabled={isLoading}
              />
              {errors.date_of_birth && (
                <p className="text-sm text-red-500">{errors.date_of_birth}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                onBlur={handleBlur}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Street address"
              disabled={isLoading}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="New York"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="NY"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="postal_code">Postal Code</Label>
              <Input
                id="postal_code"
                name="postal_code"
                value={formData.postal_code}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="10001"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="United States"
                disabled={isLoading}
              />
            </div>
          </div>
        </TabsContent>

        {/* Employment Information Tab */}
        <TabsContent value="employment" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date_of_joining">
              Date of Joining <span className="text-red-500">*</span>
            </Label>
            <Input
              id="date_of_joining"
              name="date_of_joining"
              type="date"
              value={formData.date_of_joining}
              onChange={handleChange}
              onBlur={handleBlur}
              className={errors.date_of_joining ? 'border-red-500' : ''}
              disabled={isEditMode || isLoading}
            />
            {errors.date_of_joining && (
              <p className="text-sm text-red-500">{errors.date_of_joining}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="employment_type">
              Employment Type <span className="text-red-500">*</span>
            </Label>
            <select
              id="employment_type"
              name="employment_type"
              value={formData.employment_type}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.employment_type ? 'border-red-500' : ''
              }`}
              disabled={isLoading}
            >
              <option value="permanent">Permanent</option>
              <option value="contract">Contract</option>
              <option value="temporary">Temporary</option>
              <option value="intern">Intern</option>
            </select>
            {errors.employment_type && (
              <p className="text-sm text-red-500">{errors.employment_type}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="department_id">Department</Label>
            <Input
              id="department_id"
              name="department_id"
              value={formData.department_id}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Department ID"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="designation_id">Designation</Label>
            <Input
              id="designation_id"
              name="designation_id"
              value={formData.designation_id}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Designation ID"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reporting_manager_id">Reporting Manager</Label>
            <Input
              id="reporting_manager_id"
              name="reporting_manager_id"
              value={formData.reporting_manager_id}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Manager ID"
              disabled={isLoading}
            />
          </div>
        </TabsContent>

        {/* Photo Tab */}
        <TabsContent value="photo" className="space-y-4">
          <div className="space-y-4">
            {photoPreview && (
              <div className="flex items-center justify-center">
                <div className="relative">
                  <Avatar className="h-32 w-32">
                    <AvatarImage src={photoPreview} alt="Profile" />
                    <AvatarFallback>
                      {formData.first_name[0]}
                      {formData.last_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            )}

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition">
              <label className="cursor-pointer">
                <div className="flex flex-col items-center gap-2">
                  <Upload size={32} className="text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 5MB
                    </p>
                  </div>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                  disabled={isLoading}
                />
              </label>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Form Actions */}
      <div className="flex gap-4 justify-end pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? 'Saving...'
            : isEditMode
              ? 'Update Employee'
              : 'Create Employee'}
        </Button>
      </div>
    </form>
  );
};

export default EmployeeForm;
