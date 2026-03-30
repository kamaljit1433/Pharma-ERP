# Service Abstraction Layer - Factory Pattern Implementation

## Overview

This document describes the service abstraction layer implementation using the Factory Pattern for the Employee Management System. The abstraction layer enables easy provider switching for email, file storage, and notification services without modifying service code.

## Architecture

### Factory Pattern Benefits

1. **Decoupling**: Services are decoupled from specific provider implementations
2. **Easy Provider Switching**: Change providers via environment variables without code changes
3. **Configuration Validation**: Factories validate configuration before instantiation
4. **Extensibility**: New providers can be added by implementing the interface and registering in the factory
5. **Testability**: Factories can be mocked for testing

### Service Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  EmailService  │  FileStorageService  │  Notification  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Factory Layer                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ EmailProviderFactory │ StorageProviderFactory │ ...  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Provider Layer                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ SendGrid     │  │ AWS SES      │  │ SMTP         │      │
│  │ Provider     │  │ Provider     │  │ Provider     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ S3 Provider  │  │ GCS Provider │  │ FCM Provider │      │
│  │ (Active)     │  │ (Future)     │  │ (Active)     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## Factories

### 1. EmailProviderFactory

**Location**: `backend/src/services/factories/EmailProviderFactory.ts`

**Supported Providers**:
- SendGrid
- AWS SES (Simple Email Service)
- SMTP

**Configuration**:
```typescript
// Environment variables
EMAIL_PROVIDER=sendgrid|ses|smtp
EMAIL_FROM_ADDRESS=noreply@yourcompany.com
EMAIL_FROM_NAME=Employee Management System

// Provider-specific
SENDGRID_API_KEY=your-api-key
AWS_SES_REGION=us-east-1
AWS_SES_ACCESS_KEY_ID=your-key
AWS_SES_SECRET_ACCESS_KEY=your-secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-password
```

**Usage**:
```typescript
import { EmailProviderFactory } from './services/factories/EmailProviderFactory';

// Create provider based on configuration
const provider = EmailProviderFactory.createProvider();

// Get supported providers
const supported = EmailProviderFactory.getSupportedProviders();
// Returns: ['sendgrid', 'ses', 'smtp']
```

**Validation**:
- Checks if provider is supported
- Validates required configuration for each provider
- Throws descriptive errors if configuration is missing

### 2. StorageProviderFactory

**Location**: `backend/src/services/factories/StorageProviderFactory.ts`

**Supported Providers**:
- AWS S3 (Active)
- Google Cloud Storage (Future)

**Configuration**:
```typescript
// Environment variables
FILE_STORAGE_PROVIDER=s3|gcs
AWS_REGION=us-east-1
S3_BUCKET=ems-file-storage
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret

// GCS (Future)
GCS_PROJECT_ID=your-project
GCS_BUCKET=ems-file-storage
GCS_KEY_FILE=/path/to/key.json
```

**Usage**:
```typescript
import { StorageProviderFactory } from './services/factories/StorageProviderFactory';

// Create provider based on configuration
const provider = StorageProviderFactory.createProvider();

// Get supported providers
const supported = StorageProviderFactory.getSupportedProviders();
// Returns: ['s3', 'gcs']

// Validate configuration
const isValid = StorageProviderFactory.validateConfiguration('s3');
```

**Validation**:
- Checks if provider is supported
- Validates AWS S3 configuration (region, bucket, credentials)
- Validates GCS configuration (project ID, bucket, key file)
- Throws descriptive errors if configuration is missing

### 3. NotificationProviderFactory

**Location**: `backend/src/services/factories/NotificationProviderFactory.ts`

**Supported Providers**:
- Firebase Cloud Messaging (FCM)
- Disabled (no notifications)

**Configuration**:
```typescript
// Environment variables
NOTIFICATION_PROVIDER=fcm|disabled
FIREBASE_ENABLED=true
FIREBASE_PROJECT_ID=your-project
FIREBASE_PRIVATE_KEY_ID=your-key-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-email@firebase.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=your-cert-url
```

**Usage**:
```typescript
import { NotificationProviderFactory } from './services/factories/NotificationProviderFactory';

// Create provider based on configuration (returns null if disabled)
const provider = NotificationProviderFactory.createProvider();

// Get supported providers
const supported = NotificationProviderFactory.getSupportedProviders();
// Returns: ['fcm', 'disabled']

// Validate configuration
const isValid = NotificationProviderFactory.validateConfiguration('fcm');
```

**Validation**:
- Checks if provider is supported
- Validates Firebase configuration for FCM
- Returns null for disabled provider
- Throws descriptive errors if configuration is invalid

## Service Integration

### EmailService

**Before (Tightly Coupled)**:
```typescript
private initializeProvider(): void {
  const { provider, fromAddress, fromName } = config.email;

  switch (provider) {
    case 'sendgrid':
      this.provider = new SendGridProvider(...);
      break;
    case 'ses':
      this.provider = new SESProvider(...);
      break;
    // ... more cases
  }
}
```

**After (Using Factory)**:
```typescript
private initializeProvider(): void {
  this.provider = EmailProviderFactory.createProvider();
}
```

### FileStorageService

**Before (Tightly Coupled)**:
```typescript
constructor() {
  switch (config.fileStorage.provider) {
    case 's3':
      this.provider = new S3StorageProvider();
      break;
    case 'gcs':
      throw new Error('Google Cloud Storage provider not implemented yet');
      break;
  }
}
```

**After (Using Factory)**:
```typescript
constructor() {
  this.provider = StorageProviderFactory.createProvider();
}
```

### NotificationService

**Before (Tightly Coupled)**:
```typescript
private initializeFCM(): void {
  try {
    if (firebaseConfig.isEnabled()) {
      this.fcmProvider = new FCMProvider(firebaseConfig.getMessaging());
    }
  } catch (error) {
    logger.error('Failed to initialize FCM Provider:', error.message);
  }
}
```

**After (Using Factory)**:
```typescript
private initializeFCM(): void {
  try {
    this.fcmProvider = NotificationProviderFactory.createProvider();
    if (this.fcmProvider) {
      logger.info('Notification Provider initialized successfully');
    }
  } catch (error) {
    logger.error('Failed to initialize Notification Provider:', error.message);
  }
}
```

## Adding New Providers

### Step 1: Implement the Provider Interface

```typescript
// backend/src/services/email/providers/newProvider.ts
import { EmailProvider, EmailOptions, EmailResult } from '../../../types/email';

export class NewProvider implements EmailProvider {
  async send(options: EmailOptions): Promise<EmailResult> {
    // Implementation
  }

  async validateConfiguration(): Promise<boolean> {
    // Validation logic
  }
}
```

### Step 2: Update the Factory

```typescript
// backend/src/services/factories/EmailProviderFactory.ts
import { NewProvider } from '../email/providers/newProvider';

export class EmailProviderFactory {
  static createProvider(): EmailProvider {
    const { provider } = config.email;

    switch (provider) {
      case 'new-provider':
        return this.createNewProvider();
      // ... other cases
    }
  }

  static getSupportedProviders(): string[] {
    return ['sendgrid', 'ses', 'smtp', 'new-provider'];
  }

  private static createNewProvider(): EmailProvider {
    return new NewProvider(/* config */);
  }
}
```

### Step 3: Add Configuration

```bash
# .env
EMAIL_PROVIDER=new-provider
NEW_PROVIDER_API_KEY=your-key
```

## Configuration Validation

All factories validate configuration before creating providers:

```typescript
// Validation happens automatically in createProvider()
try {
  const provider = EmailProviderFactory.createProvider();
} catch (error) {
  // Error message indicates what's missing
  console.error(error.message);
  // Output: "SendGrid API key is not configured (SENDGRID_API_KEY)"
}
```

## Environment Variables

### Email Service
```
EMAIL_PROVIDER=sendgrid|ses|smtp
EMAIL_FROM_ADDRESS=noreply@yourcompany.com
EMAIL_FROM_NAME=Employee Management System
SENDGRID_API_KEY=...
AWS_SES_REGION=...
AWS_SES_ACCESS_KEY_ID=...
AWS_SES_SECRET_ACCESS_KEY=...
SMTP_HOST=...
SMTP_PORT=...
SMTP_SECURE=...
SMTP_USER=...
SMTP_PASSWORD=...
```

### File Storage Service
```
FILE_STORAGE_PROVIDER=s3|gcs
AWS_REGION=...
S3_BUCKET=...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
GCS_PROJECT_ID=...
GCS_BUCKET=...
GCS_KEY_FILE=...
```

### Notification Service
```
NOTIFICATION_PROVIDER=fcm|disabled
FIREBASE_ENABLED=true|false
FIREBASE_PROJECT_ID=...
FIREBASE_PRIVATE_KEY_ID=...
FIREBASE_PRIVATE_KEY=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_CLIENT_ID=...
FIREBASE_AUTH_URI=...
FIREBASE_TOKEN_URI=...
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=...
FIREBASE_CLIENT_X509_CERT_URL=...
```

## Testing

### Unit Tests

Tests are located in `backend/src/services/factories/__tests__/`:

- `EmailProviderFactory.test.ts` - Tests for email provider factory
- `StorageProviderFactory.test.ts` - Tests for storage provider factory
- `NotificationProviderFactory.test.ts` - Tests for notification provider factory

**Run tests**:
```bash
npm test -- factories
```

### Test Coverage

Each factory test covers:
- ✅ Creating each supported provider
- ✅ Throwing errors for unsupported providers
- ✅ Validating required configuration
- ✅ Returning list of supported providers
- ✅ Configuration validation methods

## Benefits

### 1. Easy Provider Switching
Change providers by updating environment variables without code changes:
```bash
# Switch from SendGrid to SES
EMAIL_PROVIDER=ses
AWS_SES_REGION=us-east-1
AWS_SES_ACCESS_KEY_ID=...
AWS_SES_SECRET_ACCESS_KEY=...
```

### 2. Configuration Validation
Factories validate configuration at startup, catching errors early:
```
Error: SendGrid API key is not configured (SENDGRID_API_KEY)
```

### 3. Extensibility
New providers can be added without modifying existing code:
- Implement the interface
- Add factory method
- Update supported providers list
- Add configuration

### 4. Testability
Factories can be mocked for testing:
```typescript
jest.mock('./factories/EmailProviderFactory', () => ({
  EmailProviderFactory: {
    createProvider: jest.fn(() => mockProvider),
  },
}));
```

### 5. Maintainability
Provider logic is isolated in separate files, making code easier to maintain and test.

## Migration Guide

### For Existing Code

If you have code that directly instantiates providers:

**Before**:
```typescript
import { SendGridProvider } from './email/providers/sendgridProvider';

const provider = new SendGridProvider(apiKey, fromAddress, fromName);
```

**After**:
```typescript
import { EmailProviderFactory } from './factories/EmailProviderFactory';

const provider = EmailProviderFactory.createProvider();
```

### For New Code

Always use factories:
```typescript
import { EmailProviderFactory } from './factories/EmailProviderFactory';
import { StorageProviderFactory } from './factories/StorageProviderFactory';
import { NotificationProviderFactory } from './factories/NotificationProviderFactory';

// Create providers
const emailProvider = EmailProviderFactory.createProvider();
const storageProvider = StorageProviderFactory.createProvider();
const notificationProvider = NotificationProviderFactory.createProvider();
```

## Troubleshooting

### "Unsupported email provider: xyz"
- Check `EMAIL_PROVIDER` environment variable
- Supported values: `sendgrid`, `ses`, `smtp`

### "SendGrid API key is not configured"
- Set `SENDGRID_API_KEY` environment variable
- Ensure `EMAIL_PROVIDER=sendgrid`

### "AWS S3 configuration is incomplete"
- Check `AWS_REGION` and `S3_BUCKET` environment variables
- Ensure `FILE_STORAGE_PROVIDER=s3`

### "Firebase is not enabled"
- Set `FIREBASE_ENABLED=true`
- Ensure `NOTIFICATION_PROVIDER=fcm`
- Check Firebase configuration variables

## Future Enhancements

1. **Provider Health Checks**: Add health check methods to factories
2. **Provider Metrics**: Track provider usage and performance
3. **Fallback Providers**: Support fallback providers if primary fails
4. **Dynamic Provider Switching**: Switch providers at runtime without restart
5. **Provider Plugins**: Support loading providers from external packages

## References

- [Factory Pattern](https://refactoring.guru/design-patterns/factory-method)
- [Dependency Injection](https://en.wikipedia.org/wiki/Dependency_injection)
- [Configuration Management](https://12factor.net/config)
