# File Storage Service Documentation

## Overview

The File Storage Service provides a comprehensive solution for managing file uploads, downloads, and storage in the Employee Management System. It supports AWS S3 as the primary storage provider with plans for Google Cloud Storage integration.

## Features

- **Multiple Storage Providers**: Currently supports AWS S3, with extensible architecture for additional providers
- **File Upload**: Single and multiple file uploads with validation
- **Multipart Upload**: Support for large file uploads using multipart upload
- **File Access Control**: Role-based access control and signed URL generation
- **File Validation**: Size limits, file type validation, and security checks
- **File Organization**: Automatic file organization by employee, category, and date
- **File Cleanup**: Automated cleanup of old or orphaned files
- **Comprehensive Testing**: Unit tests, property-based tests, and integration tests

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    File Storage Service                      │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Controller │  │  Middleware  │  │   Service    │      │
│  │              │  │              │  │              │      │
│  │ - Upload     │  │ - Multer     │  │ - Validation │      │
│  │ - Download   │  │ - Auth       │  │ - Business   │      │
│  │ - Delete     │  │ - Validation │  │   Logic      │      │
│  │ - List       │  │              │  │ - File Mgmt  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                Storage Provider Layer                        │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ S3 Provider  │  │ GCS Provider │  │ Future       │      │
│  │              │  │ (Planned)    │  │ Providers    │      │
│  │ - AWS SDK    │  │              │  │              │      │
│  │ - S3 Ops     │  │              │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Storage Backend                           │
│                      (AWS S3)                               │
└─────────────────────────────────────────────────────────────┘
```

## Configuration

### Environment Variables

Add the following variables to your `.env` file:

```bash
# File Storage Configuration
FILE_STORAGE_PROVIDER=s3
FILE_URL_EXPIRY=3600

# AWS S3 Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_key_here
S3_BUCKET_NAME=ems-file-storage
S3_BUCKET_REGION=us-east-1

# File Upload Limits
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document
```

### AWS S3 Setup

1. Create an S3 bucket in your AWS account
2. Create an IAM user with the following permissions:
   - `s3:GetObject`
   - `s3:PutObject`
   - `s3:DeleteObject`
   - `s3:ListBucket`
   - `s3:GetObjectVersion`
   - `s3:PutObjectAcl`
3. Generate access keys for the IAM user
4. Configure CORS on your S3 bucket if needed for direct browser uploads

## File Organization

Files are automatically organized in the following structure:

```
bucket-name/
├── employees/
│   └── {employeeId}/
│       ├── profile-photo/
│       │   └── {date}/
│       │       └── {uuid}_{filename}
│       ├── document/
│       │   └── {date}/
│       │       └── {uuid}_{filename}
│       ├── certificate/
│       ├── payslip/
│       ├── contract/
│       └── other/
└── system/
    ├── training-material/
    ├── templates/
    └── other/
```

## API Endpoints

### Upload Single File
```http
POST /api/v1/files/upload
Content-Type: multipart/form-data

file: [File]
employeeId: string (optional)
category: FileCategory
isPublic: boolean (optional)
metadata: object (optional)
```

### Upload Multiple Files
```http
POST /api/v1/files/upload-multiple
Content-Type: multipart/form-data

files: [File[]]
employeeId: string (optional)
category: FileCategory
isPublic: boolean (optional)
metadata: object (optional)
```

### Download File
```http
GET /api/v1/files/download/{key}
```

### Delete File
```http
DELETE /api/v1/files/{key}
```

### Get Signed URL
```http
GET /api/v1/files/signed-url/{key}?operation=getObject&expiresIn=3600
```

### List Files
```http
GET /api/v1/files/list?prefix={prefix}&employeeId={employeeId}&category={category}
```

### Multipart Upload - Initiate
```http
POST /api/v1/files/multipart/initiate
Content-Type: application/json

{
  "originalName": "large-file.pdf",
  "employeeId": "emp-123",
  "category": "document",
  "isPublic": false,
  "metadata": {}
}
```

### Multipart Upload - Complete
```http
POST /api/v1/files/multipart/complete
Content-Type: application/json

{
  "uploadId": "upload-123",
  "key": "file-key",
  "parts": [
    { "partNumber": 1, "etag": "etag-1" },
    { "partNumber": 2, "etag": "etag-2" }
  ]
}
```

### Multipart Upload - Abort
```http
POST /api/v1/files/multipart/abort
Content-Type: application/json

{
  "uploadId": "upload-123",
  "key": "file-key"
}
```

### File Cleanup
```http
POST /api/v1/files/cleanup
Content-Type: application/json

{
  "olderThan": "2023-01-01T00:00:00.000Z",
  "category": "document",
  "employeeId": "emp-123",
  "dryRun": true
}
```

## File Categories

The system supports the following file categories:

- `profile-photo`: Employee profile pictures
- `document`: General documents (contracts, certificates, etc.)
- `certificate`: Training and professional certificates
- `payslip`: Monthly payslips
- `contract`: Employment contracts
- `training-material`: Training resources
- `reimbursement`: Reimbursement receipts and documents
- `other`: Miscellaneous files

## Security Features

### File Validation
- File size limits (configurable, default 10MB)
- File type validation based on MIME type
- Filename sanitization to prevent path traversal attacks
- Empty file rejection

### Access Control
- JWT-based authentication required for all endpoints
- Role-based access control
- Employee data isolation (employees can only access their own files)
- Signed URLs for secure file access

### Encryption
- Server-side encryption (AES-256) for all stored files
- Encrypted file keys in database
- Secure transmission over HTTPS

## Usage Examples

### Basic File Upload (Node.js)
```javascript
const formData = new FormData();
formData.append('file', fileBuffer, 'document.pdf');
formData.append('employeeId', 'emp-123');
formData.append('category', 'document');

const response = await fetch('/api/v1/files/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
  },
  body: formData,
});

const result = await response.json();
console.log('Uploaded file:', result.data);
```

### Large File Upload with Multipart
```javascript
// 1. Initiate multipart upload
const initiateResponse = await fetch('/api/v1/files/multipart/initiate', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    originalName: 'large-file.pdf',
    employeeId: 'emp-123',
    category: 'document',
  }),
});

const { uploadId, key } = await initiateResponse.json();

// 2. Upload parts (implement chunking logic)
const parts = [];
for (let i = 0; i < chunks.length; i++) {
  const etag = await uploadPart(uploadId, key, i + 1, chunks[i]);
  parts.push({ partNumber: i + 1, etag });
}

// 3. Complete multipart upload
const completeResponse = await fetch('/api/v1/files/multipart/complete', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    uploadId,
    key,
    parts,
  }),
});

const result = await completeResponse.json();
console.log('Upload completed:', result.data);
```

### File Download with Signed URL
```javascript
// Get signed URL
const urlResponse = await fetch(`/api/v1/files/signed-url/${encodeURIComponent(fileKey)}`, {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});

const { url } = await urlResponse.json();

// Use the signed URL to download the file
const fileResponse = await fetch(url);
const fileBlob = await fileResponse.blob();
```

## Error Handling

The service provides comprehensive error handling with consistent error response format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": ["Additional error details"],
    "timestamp": "2024-01-01T00:00:00.000Z",
    "requestId": "unique-request-id"
  }
}
```

Common error codes:
- `VALIDATION_ERROR`: File validation failed
- `FILE_TOO_LARGE`: File exceeds size limit
- `INVALID_FILE_TYPE`: File type not allowed
- `FILE_NOT_FOUND`: Requested file doesn't exist
- `UNAUTHORIZED`: Authentication required
- `ACCESS_DENIED`: Insufficient permissions
- `UPLOAD_ERROR`: General upload error

## Testing

The file storage service includes comprehensive testing:

### Unit Tests
```bash
npm test -- fileStorageService.test.ts
```

### Property-Based Tests
```bash
npm test -- fileStorageService.property.test.ts
```

### Integration Tests
```bash
npm test -- fileStorage.integration.test.ts
```

### Run All Tests
```bash
npm test
```

## Performance Considerations

### File Size Limits
- Default maximum file size: 10MB
- Use multipart upload for files larger than 5MB
- Consider implementing client-side compression for large files

### Caching
- Signed URLs are cached for the configured expiry time
- File metadata can be cached in Redis for better performance
- Consider implementing CDN for frequently accessed files

### Monitoring
- Monitor S3 costs and usage
- Track upload/download metrics
- Set up alerts for failed operations

## Maintenance

### File Cleanup
Regular cleanup of old or orphaned files:

```javascript
// Dry run to see what would be deleted
const dryRunResult = await fileStorageService.cleanupFiles({
  olderThan: new Date('2023-01-01'),
  dryRun: true,
});

console.log(`Would delete ${dryRunResult.deletedCount} files`);

// Actual cleanup
const cleanupResult = await fileStorageService.cleanupFiles({
  olderThan: new Date('2023-01-01'),
  dryRun: false,
});

console.log(`Deleted ${cleanupResult.deletedCount} files`);
```

### Backup and Recovery
- Enable S3 versioning for file recovery
- Set up cross-region replication for disaster recovery
- Regular backup of file metadata from database

## Future Enhancements

1. **Google Cloud Storage Provider**: Implement GCS provider for multi-cloud support
2. **Image Processing**: Automatic thumbnail generation and image optimization
3. **Virus Scanning**: Integration with antivirus services
4. **File Deduplication**: Detect and handle duplicate files
5. **Advanced Analytics**: File usage analytics and reporting
6. **CDN Integration**: CloudFront or CloudFlare integration for better performance
7. **File Versioning**: Support for file versions and history
8. **Bulk Operations**: Bulk upload/download/delete operations

## Troubleshooting

### Common Issues

1. **Upload Fails with 413 Error**
   - Check `MAX_FILE_SIZE` configuration
   - Verify nginx/proxy settings for large files

2. **AWS Credentials Error**
   - Verify AWS access keys are correct
   - Check IAM permissions for the user
   - Ensure S3 bucket exists and is accessible

3. **File Not Found Errors**
   - Check file key encoding/decoding
   - Verify file exists in S3 bucket
   - Check access permissions

4. **Slow Upload/Download**
   - Check network connectivity
   - Consider using multipart upload for large files
   - Verify S3 region configuration

### Debug Mode
Enable debug logging by setting `LOG_LEVEL=debug` in your environment variables.

## Support

For issues and questions:
1. Check the error logs for detailed error messages
2. Verify configuration settings
3. Test with smaller files first
4. Check AWS S3 console for bucket status
5. Review IAM permissions and policies