# FileUploader Component

## Overview

The `FileUploader` component is a reusable file upload component with drag-and-drop support, file validation, and progress tracking. It can be used for uploading profile photos, documents, and other files throughout the application.

## Features

### 1. File Validation
- **File Type Validation**: Validates against accepted MIME types and file extensions
- **File Size Validation**: Enforces maximum file size limit
- **Error Messages**: Clear, user-friendly error messages for validation failures

### 2. Drag and Drop
- **Drag Enter/Over**: Visual feedback when dragging files over the drop zone
- **Drop Support**: Accept files via drag and drop
- **Fallback**: Click to upload for users who prefer traditional file selection

### 3. File Display
- **File List**: Shows all selected files with metadata
- **File Preview**: Displays image previews for image files
- **File Size**: Shows formatted file size (Bytes, KB, MB, GB)
- **Remove Option**: Allows removing individual files before upload

### 4. Upload Management
- **Single/Multiple Files**: Supports both single and multiple file uploads
- **Upload Button**: Explicit upload action (not automatic)
- **Progress Tracking**: Shows upload progress for each file
- **Loading State**: Disables interactions during upload

### 5. User Feedback
- **Toast Notifications**: Success and error messages via toast
- **Error Callback**: Optional error callback for custom error handling
- **Disabled State**: Can be disabled to prevent uploads

## Usage

### Basic Usage (Single File)

```tsx
import FileUploader from '@/components/forms/FileUploader';

function ProfilePhotoUpload() {
  const handleUpload = async (files: File[]) => {
    const file = files[0];
    const formData = new FormData();
    formData.append('photo', file);
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    
    return response.json();
  };

  return (
    <FileUploader
      accept={['image/jpeg', 'image/png', 'image/gif']}
      maxSize={5 * 1024 * 1024} // 5MB
      onUpload={handleUpload}
    />
  );
}
```

### Multiple Files Upload

```tsx
<FileUploader
  accept={['application/pdf', 'image/jpeg', 'image/png']}
  maxSize={10 * 1024 * 1024} // 10MB
  multiple={true}
  onUpload={handleUpload}
/>
```

### With Error Handling

```tsx
<FileUploader
  accept={['image/jpeg', 'image/png']}
  maxSize={5 * 1024 * 1024}
  onUpload={handleUpload}
  onError={(error) => {
    console.error('Upload error:', error);
  }}
  disabled={isLoading}
/>
```

## Props

```typescript
interface FileUploaderProps {
  accept: string[];              // Array of accepted MIME types or extensions
  maxSize: number;               // Maximum file size in bytes
  multiple?: boolean;            // Allow multiple files (default: false)
  onUpload: (files: File[]) => Promise<void>;  // Upload handler
  onError?: (error: string) => void;           // Error callback (optional)
  disabled?: boolean;            // Disable upload (default: false)
}
```

## Accepted File Types

### Images
```tsx
accept={['image/jpeg', 'image/png', 'image/gif', 'image/webp']}
```

### Documents
```tsx
accept={['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']}
```

### Mixed
```tsx
accept={['image/jpeg', 'image/png', 'application/pdf']}
```

### By Extension
```tsx
accept={['.jpg', '.png', '.pdf']}
```

## File Size Limits

```tsx
// 1MB
maxSize={1 * 1024 * 1024}

// 5MB
maxSize={5 * 1024 * 1024}

// 10MB
maxSize={10 * 1024 * 1024}

// 100MB
maxSize={100 * 1024 * 1024}
```

## Validation Rules

### File Type Validation
- Checks MIME type against accepted types
- Supports wildcard patterns (e.g., 'image/*')
- Supports file extensions (e.g., '.jpg', '.pdf')

### File Size Validation
- Enforces maximum file size limit
- Shows formatted error message with max size

### Error Messages
- "File type not allowed. Accepted types: ..."
- "File size exceeds X.XX MB limit"

## Upload Flow

1. **File Selection**: User selects files via click or drag-and-drop
2. **Validation**: Files are validated for type and size
3. **Display**: Valid files are displayed in the list
4. **Upload**: User clicks upload button to start upload
5. **Feedback**: Success or error message is shown
6. **Cleanup**: File list is cleared after successful upload

## Accessibility Features

- **Keyboard Navigation**: Full keyboard support
- **ARIA Labels**: Proper labels for screen readers
- **Focus Management**: Visible focus indicators
- **Error Announcements**: Errors are announced to screen readers
- **Drag and Drop**: Alternative to click-based upload

## Requirements Mapping

This component implements the following requirements:

- **Requirement 15.1**: Supports multiple file formats (PDF, DOC, DOCX, JPG, PNG)
- **Requirement 15.2**: Validates file size (maximum 10MB per file)
- **Requirement 15.3**: Validates file type before upload
- **Requirement 15.4**: Displays error messages for invalid files
- **Requirement 15.5**: Shows upload progress indicator
- **Requirement 15.6**: Supports drag-and-drop file selection

## Testing

The component includes comprehensive unit tests covering:
- File type validation
- File size validation
- File display and removal
- Drag and drop functionality
- Upload functionality
- Success and error handling
- Multiple file uploads
- Disabled state

Run tests with:
```bash
npm test -- FileUploader.test.tsx
```

## Integration with EmployeeForm

The FileUploader is integrated into the EmployeeForm component for profile photo uploads:

```tsx
// In EmployeeForm Photo Tab
<FileUploader
  accept={['image/jpeg', 'image/png', 'image/gif']}
  maxSize={5 * 1024 * 1024}
  onUpload={handlePhotoUpload}
/>
```

## Error Handling

### Validation Errors
- Shown as toast notifications
- User-friendly error messages
- Optional error callback for custom handling

### Upload Errors
- Caught and displayed as error toast
- Error callback is invoked if provided
- File list is preserved for retry

## Performance Considerations

- **File Preview**: Only created for image files
- **Lazy Loading**: File previews are created on demand
- **Memory Management**: File references are cleared after upload
- **Progress Tracking**: Supports real-time progress updates

## Browser Support

- Modern browsers with File API support
- Drag and drop support in all modern browsers
- FileReader API for image previews
- FormData API for file uploads

## Related Components

- **EmployeeForm**: Uses FileUploader for profile photo upload
- **Button**: UI component for upload action
- **Avatar**: Used to display photo preview in EmployeeForm

## Dependencies

- React 19.2
- TypeScript 5.9
- Zustand 5.0 (for UI store)
- Lucide React 0.577+ (for icons)
- Tailwind CSS 4.1 (for styling)

## Notes

- The component does not perform the actual upload; it delegates to the `onUpload` handler
- File validation is performed before display
- Multiple files can be selected but only uploaded when the upload button is clicked
- File list is cleared after successful upload
- The component is fully reusable and can be used in any form or page
