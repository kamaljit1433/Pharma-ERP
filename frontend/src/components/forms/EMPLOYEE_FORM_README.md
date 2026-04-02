# EmployeeForm Component

## Overview

The `EmployeeForm` component is a comprehensive form for creating and editing employee records. It supports both create and edit modes, includes client-side validation, profile photo upload, and organized field grouping through tabs.

## Features

### 1. Create and Edit Modes
- **Create Mode**: All fields are enabled, including email and date of joining
- **Edit Mode**: Email and date of joining are disabled (immutable fields)
- Automatic mode detection based on `employee` prop

### 2. Form Organization
The form is organized into three tabs:
- **Personal**: First name, last name, email, phone, date of birth, gender, address, city, state, postal code, country
- **Employment**: Date of joining, employment type, department, designation, reporting manager
- **Photo**: Profile photo upload with preview

### 3. Comprehensive Validation
- **Required Fields**: First name, last name, email, date of joining, employment type
- **Email Validation**: RFC-compliant email format validation
- **Phone Validation**: Validates phone number format (minimum 10 digits)
- **Date Validation**: Validates date format and ensures date of birth is at least 18 years old
- **Real-time Validation**: Validates on blur and on submit
- **Error Clearing**: Automatically clears errors when user corrects input

### 4. Error Handling
- **Error Summary**: Displays all validation errors at the top of the form
- **Field-level Errors**: Shows error message below each invalid field
- **Error Highlighting**: Invalid fields are highlighted with red border
- **Toast Notifications**: Shows success/error messages via toast notifications

### 5. Profile Photo Upload
- Supports image formats: JPEG, PNG, GIF
- Maximum file size: 5MB
- Drag-and-drop support
- Image preview with remove option
- Integrated with FileUploader component

### 6. Form Submission
- Prevents submission when validation fails
- Disables submit button during API call
- Shows loading state with "Saving..." text
- Displays success/error toast notifications
- Handles both create and edit submissions

## Usage

### Basic Usage (Create Mode)

```tsx
import EmployeeForm from '@/components/forms/EmployeeForm';
import { useEmployeeStore } from '@/store/employeeStore';

function CreateEmployeePage() {
  const { createItem } = useEmployeeStore();

  const handleSubmit = async (data) => {
    await createItem(data);
  };

  const handleCancel = () => {
    // Navigate back or close modal
  };

  return (
    <EmployeeForm
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  );
}
```

### Edit Mode

```tsx
import EmployeeForm from '@/components/forms/EmployeeForm';
import { useEmployeeStore } from '@/store/employeeStore';

function EditEmployeePage({ employeeId }) {
  const { currentItem, updateItem, fetchItem } = useEmployeeStore();

  useEffect(() => {
    fetchItem(employeeId);
  }, [employeeId]);

  const handleSubmit = async (data) => {
    await updateItem(employeeId, data);
  };

  const handleCancel = () => {
    // Navigate back or close modal
  };

  return (
    <EmployeeForm
      employee={currentItem}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  );
}
```

### With Loading State

```tsx
<EmployeeForm
  employee={employee}
  onSubmit={handleSubmit}
  onCancel={handleCancel}
  isLoading={isLoading}
/>
```

## Props

```typescript
interface EmployeeFormProps {
  employee?: Employee;           // Employee data for edit mode (optional)
  onSubmit: (data: CreateEmployeeDTO | UpdateEmployeeDTO) => Promise<void>;  // Form submission handler
  onCancel: () => void;          // Cancel button handler
  isLoading?: boolean;           // Loading state (default: false)
}
```

## Validation Rules

### Required Fields
- First Name: Must be at least 2 characters
- Last Name: Must be at least 2 characters
- Email: Must be valid email format
- Date of Joining: Must be valid date
- Employment Type: Must be selected

### Optional Fields with Validation
- Phone: Must be valid phone format (if provided)
- Date of Birth: Must be valid date and at least 18 years old (if provided)

### Immutable Fields (Edit Mode)
- Email: Cannot be changed
- Date of Joining: Cannot be changed

## Form Data Structure

### Create Mode (CreateEmployeeDTO)
```typescript
{
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
}
```

### Edit Mode (UpdateEmployeeDTO)
```typescript
{
  first_name?: string;
  last_name?: string;
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
}
```

## Accessibility Features

- **ARIA Labels**: All form fields have proper labels
- **Error Announcements**: Error messages are announced to screen readers
- **Keyboard Navigation**: Full keyboard support for all form fields
- **Focus Management**: Proper focus handling and visual indicators
- **Required Field Indicators**: Red asterisk (*) indicates required fields

## Requirements Mapping

This component implements the following requirements:

- **Requirement 6.5**: Provides a form to create new employees
- **Requirement 6.6**: Provides a form to edit existing employees
- **Requirement 6.7**: Validates all required fields before submission
- **Requirement 6.8**: Calls Backend_API when creating or updating an employee
- **Requirement 6.9**: Displays success or error messages after operations
- **Requirement 18.1**: Validates required fields before submission
- **Requirement 18.2**: Validates email format for email fields
- **Requirement 18.3**: Validates phone number format for phone fields
- **Requirement 18.6**: Displays error messages below invalid fields
- **Requirement 18.7**: Prevents form submission when validation fails

## Testing

The component includes comprehensive unit tests covering:
- Form rendering in create and edit modes
- Field validation (required, email, phone, date)
- Error display and clearing
- Form submission with valid/invalid data
- Loading states
- Toast notifications
- Tab navigation
- Error summary display

Run tests with:
```bash
npm test -- EmployeeForm.test.tsx
```

## Related Components

- **FileUploader**: Used for profile photo upload
- **Button**: UI component for form actions
- **Input**: UI component for text fields
- **Textarea**: UI component for multi-line text
- **Tabs**: UI component for form organization
- **Avatar**: UI component for photo preview

## Dependencies

- React 19.2
- TypeScript 5.9
- Zustand 5.0 (for UI store)
- Lucide React 0.577+ (for icons)
- Tailwind CSS 4.1 (for styling)

## Notes

- The form uses Zustand's `useUIStore` for toast notifications
- Validation is performed on blur and on submit
- Email field is disabled in edit mode to prevent accidental changes
- Date of joining is disabled in edit mode as it's immutable
- Profile photo upload is handled separately and can be updated independently
- The form supports both create and edit operations through a single component
