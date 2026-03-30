# File Access Control and Signed URL Generation Implementation

## Overview

This implementation adds comprehensive file access control and enhanced signed URL generation to the Employee Management System's file storage service. The implementation ensures secure file access with proper authorization checks and time-limited access.

## Features Implemented

### 1. File Access Control Middleware

**Location:** `src/middleware/fileAccessControl.ts`

#### Key Functions:
- `canAccessFile()` - Controls file download and signed URL access
- `canUploadFile()` - Controls file upload permissions
- `canDeleteFile()` - Controls file deletion permissions
- `canListFiles()` - Controls file listing permissions
- `validateSignedUrlRequest()` - Validates signed URL request parameters
- `logFileAccess()` - Logs file access attempts for audit purposes

#### Access Control Rules:

**Super Admin & HR Manager:**
- Can access, upload, and list all employee files
- Super Admin can delete any file
- HR Manager cannot delete system files

**Finance Role:**
- Can access and upload payslips and contracts for any employee
- Can delete payslips and contracts

**Department Manager:**
- Can access and upload files for team members (simplified implementation)
- Cannot delete restricted files

**Employee:**
- Can access, upload, and delete their own files
- Cannot upload or delete payslips and contracts
- Cannot access other employees' files

**IT Admin:**
- Can access profile photos for system management

**System Files:**
- Accessible by all authenticated users for download
- Only admins can upload system files
- Only super admin can delete system files

### 2. Enhanced File Storage Service

**Location:** `src/services/fileStorageService.ts`

#### Enhancements:
- **Time-Limited Signed URLs:** Maximum 24 hours, default 1 hour
- **User Context Logging:** Audit logging for all file operations
- **Permission-Based File Filtering:** Files are filtered based on user permissions
- **Enhanced Security:** Proper content disposition headers for downloads

#### Key Methods:
```typescript
getSignedUrl(key, operation, options, userContext) // Enhanced with user context and time limits
fileExists(key, userContext) // Enhanced with audit logging
listFilesByEmployee(employeeId, category, userContext) // Enhanced with permission filtering
listFilesByCategory(category, userContext) // Enhanced with permission filtering
filterFilesByPermissions(files, userContext) // New method for permission-based filtering
```

### 3. Updated API Routes

**Location:** `src/routes/fileStorageRoutes.ts`

#### Enhanced Endpoints:
- All endpoints now include proper access control middleware
- Audit logging for all file operations
- Enhanced parameter validation for signed URLs

#### Route Protection:
```
POST /upload -> canUploadFile + logFileAccess
POST /upload-multiple -> canUploadFile + logFileAccess
GET /download/:key -> canAccessFile + logFileAccess
DELETE /:key -> canDeleteFile + logFileAccess
GET /signed-url/:key -> canAccessFile + validateSignedUrlRequest + logFileAccess
GET /list -> canListFiles + logFileAccess
```

### 4. Enhanced Controllers

**Location:** `src/controllers/fileStorageController.ts`

#### Improvements:
- User context passed to service methods
- Enhanced error handling with proper HTTP status codes
- Improved signed URL generation with validation
- Better file existence checking with user context

### 5. Comprehensive Testing

#### Unit Tests
**Location:** `src/__tests__/middleware/fileAccessControl.test.ts`
- Tests for all access control middleware functions
- Role-based permission testing
- Parameter validation testing

#### Property-Based Tests
**Location:** `src/__tests__/services/fileStorageService.property.test.ts`
- File access control authorization property
- Signed URL time limitation property
- File key parsing consistency property
- File upload validation consistency property

#### Integration Tests
**Location:** `src/__tests__/integration/fileStorage.integration.test.ts`
- End-to-end testing of file operations with access control
- Authentication and authorization testing
- Parameter validation testing

## Security Features

### 1. Role-Based Access Control (RBAC)
- Granular permissions based on user roles
- Resource-level access control (users can only access their own files)
- Special permissions for administrative roles

### 2. Time-Limited Access
- Signed URLs expire after specified time (max 24 hours)
- Default expiry of 1 hour for security
- Configurable expiry times with validation

### 3. Audit Logging
- All file access attempts are logged
- User context included in logs (user ID, role, employee ID)
- IP address and user agent tracking
- Request ID for tracing

### 4. Input Validation
- File key validation to prevent path traversal
- Operation parameter validation for signed URLs
- Expiry time validation with maximum limits
- File category validation

### 5. Proper Authorization Checks
- Authentication required for all endpoints
- Role-based permissions enforced at middleware level
- Resource ownership validation
- System file access restrictions

## Configuration

### Environment Variables
The following environment variables control file access behavior:

```bash
# File Storage Configuration
FILE_STORAGE_PROVIDER=s3
FILE_URL_EXPIRY=3600  # Default signed URL expiry (1 hour)

# AWS S3 Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_key_here
S3_BUCKET_NAME=ems-file-storage
S3_BUCKET_REGION=us-east-1

# File Upload Limits
MAX_FILE_SIZE=10485760  # 10MB
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document
```

## Usage Examples

### Generate Signed URL with Access Control
```typescript
// GET /api/v1/files/signed-url/employees%2Femp1%2Fdocument%2F2024-01-01%2Ftest.pdf?operation=getObject&expiresIn=3600
// Headers: Authorization: Bearer <jwt_token>

// Response:
{
  "success": true,
  "data": {
    "url": "https://bucket.s3.amazonaws.com/...",
    "key": "employees/emp1/document/2024-01-01/test.pdf",
    "operation": "getObject",
    "expiresIn": 3600,
    "generatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

### Upload File with Access Control
```typescript
// POST /api/v1/files/upload
// Headers: Authorization: Bearer <jwt_token>
// Body: multipart/form-data
// - file: [File]
// - employeeId: "emp1"
// - category: "document"

// Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "url": "https://bucket.s3.amazonaws.com/...",
    "key": "employees/emp1/document/2024-01-01/uuid_filename.pdf",
    "metadata": { ... }
  }
}
```

## Error Handling

### Common Error Responses

#### Access Denied (403)
```json
{
  "error": {
    "code": "ACCESS_DENIED",
    "message": "You do not have permission to access this file",
    "timestamp": "2024-01-01T12:00:00.000Z",
    "requestId": "req-123"
  }
}
```

#### Invalid Parameters (400)
```json
{
  "error": {
    "code": "INVALID_EXPIRES_IN",
    "message": "expiresIn must be a number between 1 and 86400 seconds (24 hours)",
    "timestamp": "2024-01-01T12:00:00.000Z",
    "requestId": "req-123"
  }
}
```

#### Unauthorized (401)
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required",
    "timestamp": "2024-01-01T12:00:00.000Z",
    "requestId": "req-123"
  }
}
```

## Future Enhancements

1. **Hierarchy-Based Access Control:** Implement proper organizational hierarchy checking for department managers
2. **File Versioning:** Support for file versions with access control
3. **Temporary Access Tokens:** Generate temporary tokens for specific file access
4. **Advanced Audit Logging:** Store audit logs in database for compliance
5. **File Sharing:** Controlled file sharing between employees with permissions
6. **Bulk Operations:** Bulk file operations with proper access control
7. **File Encryption:** Client-side encryption for sensitive documents

## Compliance and Security

This implementation follows security best practices:
- **Principle of Least Privilege:** Users only get minimum required permissions
- **Defense in Depth:** Multiple layers of security (authentication, authorization, validation)
- **Audit Trail:** Complete logging of all file access attempts
- **Time-Limited Access:** Signed URLs expire to prevent unauthorized long-term access
- **Input Validation:** All inputs are validated to prevent security vulnerabilities
- **Role-Based Security:** Clear separation of permissions based on user roles

The implementation is designed to be compliant with data protection regulations and enterprise security requirements.