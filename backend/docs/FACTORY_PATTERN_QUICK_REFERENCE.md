# Service Abstraction Layer - Quick Reference

## What Was Implemented

A factory pattern abstraction layer for easy provider switching in three core services:

1. **Email Service** - Switch between SendGrid, AWS SES, and SMTP
2. **File Storage Service** - Switch between AWS S3 and Google Cloud Storage (future)
3. **Notification Service** - Switch between Firebase Cloud Messaging and disabled

## Files Created

### Factories
- `backend/src/services/factories/EmailProviderFactory.ts`
- `backend/src/services/factories/StorageProviderFactory.ts`
- `backend/src/services/factories/NotificationProviderFactory.ts`
- `backend/src/services/factories/index.ts`

### Tests
- `backend/src/services/factories/__tests__/EmailProviderFactory.test.ts` (9 tests)
- `backend/src/services/factories/__tests__/StorageProviderFactory.test.ts` (8 tests)
- `backend/src/services/factories/__tests__/NotificationProviderFactory.test.ts` (7 tests)

### Documentation
- `backend/SERVICE_ABSTRACTION_LAYER.md` - Comprehensive documentation
- `backend/FACTORY_PATTERN_QUICK_REFERENCE.md` - This file

## Files Modified

### Services (Refactored to use factories)
- `backend/src/services/emailService.ts` - Now uses EmailProviderFactory
- `backend/src/services/fileStorageService.ts` - Now uses StorageProviderFactory
- `backend/src/services/notificationService.ts` - Now uses NotificationProviderFactory

### Configuration
- `backend/src/config/index.ts` - Added notification provider config, updated file storage config
- `backend/src/services/storage/s3StorageProvider.ts` - Updated to use new config structure

### Types
- `backend/src/types/notification.ts` - Added NotificationProvider interface

## How to Use

### Switch Email Provider

```bash
# SendGrid
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=your-key

# AWS SES
EMAIL_PROVIDER=ses
AWS_SES_REGION=us-east-1
AWS_SES_ACCESS_KEY_ID=your-key
AWS_SES_SECRET_ACCESS_KEY=your-secret

# SMTP
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email
SMTP_PASSWORD=your-password
```

### Switch File Storage Provider

```bash
# AWS S3 (default)
FILE_STORAGE_PROVIDER=s3
AWS_REGION=us-east-1
S3_BUCKET=ems-file-storage
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret

# Google Cloud Storage (future)
FILE_STORAGE_PROVIDER=gcs
GCS_PROJECT_ID=your-project
GCS_BUCKET=ems-file-storage
GCS_KEY_FILE=/path/to/key.json
```

### Switch Notification Provider

```bash
# Firebase Cloud Messaging (default)
NOTIFICATION_PROVIDER=fcm
FIREBASE_ENABLED=true
FIREBASE_PROJECT_ID=your-project
# ... other Firebase config

# Disabled
NOTIFICATION_PROVIDER=disabled
```

## Key Features

✅ **Easy Provider Switching** - Change providers via environment variables
✅ **Configuration Validation** - Validates config at startup, catches errors early
✅ **Extensibility** - Add new providers without modifying existing code
✅ **Testability** - All factories have comprehensive unit tests (24 tests, 100% passing)
✅ **No Breaking Changes** - Existing service APIs remain unchanged
✅ **Error Messages** - Clear, descriptive error messages for missing configuration

## Test Results

```
Test Suites: 3 passed, 3 total
Tests:       24 passed, 24 total
Time:        ~26 seconds
```

### Test Coverage

**EmailProviderFactory** (9 tests)
- ✅ Create SendGrid provider
- ✅ Create SES provider
- ✅ Create SMTP provider
- ✅ Error for unsupported provider
- ✅ Error for missing SendGrid API key
- ✅ Error for incomplete SES config
- ✅ Error for incomplete SMTP config
- ✅ Error for missing from address
- ✅ Get supported providers list

**StorageProviderFactory** (8 tests)
- ✅ Create S3 provider
- ✅ Error for GCS (not implemented)
- ✅ Error for unsupported provider
- ✅ Error for incomplete S3 config
- ✅ Error for missing S3 credentials
- ✅ Get supported providers list
- ✅ Validate S3 configuration
- ✅ Validate GCS configuration

**NotificationProviderFactory** (7 tests)
- ✅ Create FCM provider
- ✅ Return null for disabled provider
- ✅ Error for unsupported provider
- ✅ Error when Firebase not enabled
- ✅ Get supported providers list
- ✅ Validate FCM configuration
- ✅ Validate disabled provider

## Adding a New Provider

### 1. Implement the Interface

```typescript
// backend/src/services/email/providers/newProvider.ts
export class NewProvider implements EmailProvider {
  async send(options: EmailOptions): Promise<EmailResult> {
    // Implementation
  }

  async validateConfiguration(): Promise<boolean> {
    // Validation
  }
}
```

### 2. Update the Factory

```typescript
// backend/src/services/factories/EmailProviderFactory.ts
case 'new-provider':
  return this.createNewProvider();

private static createNewProvider(): EmailProvider {
  return new NewProvider(/* config */);
}
```

### 3. Add Configuration

```bash
EMAIL_PROVIDER=new-provider
NEW_PROVIDER_API_KEY=your-key
```

## Acceptance Criteria Met

✅ Factory pattern implemented for all three services
✅ Providers can be switched via environment variables without code changes
✅ All existing tests pass
✅ Configuration validation works correctly
✅ New providers can be added easily by implementing the interface
✅ No breaking changes to existing service APIs

## Architecture Benefits

1. **Separation of Concerns** - Provider logic isolated from service logic
2. **Open/Closed Principle** - Open for extension, closed for modification
3. **Dependency Inversion** - Services depend on abstractions, not concrete implementations
4. **Single Responsibility** - Each factory handles one type of provider
5. **Testability** - Factories can be mocked for testing

## Configuration Validation

All factories validate configuration at instantiation:

```typescript
try {
  const provider = EmailProviderFactory.createProvider();
} catch (error) {
  // Clear error message indicates what's missing
  console.error(error.message);
  // Example: "SendGrid API key is not configured (SENDGRID_API_KEY)"
}
```

## Migration Path

### For Existing Code

Replace direct provider instantiation with factory calls:

```typescript
// Before
import { SendGridProvider } from './email/providers/sendgridProvider';
const provider = new SendGridProvider(apiKey, fromAddress, fromName);

// After
import { EmailProviderFactory } from './factories/EmailProviderFactory';
const provider = EmailProviderFactory.createProvider();
```

### For New Code

Always use factories:

```typescript
import { EmailProviderFactory } from './factories/EmailProviderFactory';
import { StorageProviderFactory } from './factories/StorageProviderFactory';
import { NotificationProviderFactory } from './factories/NotificationProviderFactory';

const emailProvider = EmailProviderFactory.createProvider();
const storageProvider = StorageProviderFactory.createProvider();
const notificationProvider = NotificationProviderFactory.createProvider();
```

## Troubleshooting

| Error | Solution |
|-------|----------|
| "Unsupported email provider: xyz" | Check EMAIL_PROVIDER env var (sendgrid, ses, smtp) |
| "SendGrid API key is not configured" | Set SENDGRID_API_KEY env var |
| "AWS S3 configuration is incomplete" | Check AWS_REGION and S3_BUCKET env vars |
| "Firebase is not enabled" | Set FIREBASE_ENABLED=true |

## Next Steps

1. **Deploy** - Update environment variables in production
2. **Monitor** - Watch logs for configuration errors
3. **Test** - Verify provider switching works in staging
4. **Document** - Update deployment documentation with new env vars
5. **Extend** - Add new providers as needed

## References

- Full documentation: `backend/SERVICE_ABSTRACTION_LAYER.md`
- Factory tests: `backend/src/services/factories/__tests__/`
- Design pattern: Factory Method Pattern (Gang of Four)
