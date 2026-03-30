# Email Service - Complete Guide

## Overview

The Employee Management System includes a comprehensive email service infrastructure with support for multiple email providers (SendGrid, AWS SES, and SMTP). This document covers setup, configuration, usage, and verification.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Architecture](#architecture)
3. [Configuration](#configuration)
4. [Email Templates](#email-templates)
5. [API Reference](#api-reference)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)
8. [Security](#security)
9. [Verification Checklist](#verification-checklist)

---

## Quick Start

### 1. Choose Your Email Provider

```bash
# Option 1: SendGrid
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=your_sendgrid_api_key_here

# Option 2: AWS SES
EMAIL_PROVIDER=ses
AWS_SES_REGION=us-east-1
AWS_SES_ACCESS_KEY_ID=your_aws_access_key
AWS_SES_SECRET_ACCESS_KEY=your_aws_secret_key

# Option 3: SMTP (Fallback)
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password_here
```

### 2. Configure Common Settings

```bash
EMAIL_FROM_NAME=Employee Management System
EMAIL_FROM_ADDRESS=noreply@yourcompany.com
EMAIL_TEMPLATE_DIR=src/templates/email
```

### 3. Send Your First Email

```typescript
const emailService = new EmailService();

const result = await emailService.send({
  to: 'recipient@example.com',
  subject: 'Test Email',
  text: 'This is a test email',
});

console.log(result);
```

---

## Architecture

### Service Abstraction Layer

The email service implements a provider abstraction pattern:

```
EmailService (Main Service)
├── SendGridProvider
├── SESProvider
└── SMTPProvider
```

All providers implement the `EmailProvider` interface, allowing seamless switching without code changes.

### Provider Selection

The active provider is determined by the `EMAIL_PROVIDER` environment variable:

```bash
EMAIL_PROVIDER=sendgrid  # Use SendGrid
EMAIL_PROVIDER=ses       # Use AWS SES
EMAIL_PROVIDER=smtp      # Use SMTP (fallback)
```

---

## Configuration

### SendGrid Setup

1. Create a SendGrid account at https://sendgrid.com
2. Generate an API key from Settings > API Keys
3. Verify sender email is verified in SendGrid
4. Set environment variables:

```bash
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=your_sendgrid_api_key_here
```

### AWS SES Setup

1. Create AWS account and access AWS SES console
2. Verify sender email address in SES
3. Request production access (if in sandbox)
4. Create IAM user with SES permissions
5. Set environment variables:

```bash
EMAIL_PROVIDER=ses
AWS_SES_REGION=us-east-1
AWS_SES_ACCESS_KEY_ID=your_aws_access_key
AWS_SES_SECRET_ACCESS_KEY=your_aws_secret_key
```

### SMTP Setup (Gmail Example)

1. Enable 2-factor authentication on Gmail account
2. Generate app-specific password
3. Set environment variables:

```bash
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password_here
```

---

## Email Templates

### Available Templates

| Template | Purpose | Variables |
|----------|---------|-----------|
| welcome.hbs | New employee welcome | employeeName, employeeId, department, startDate, managerName, loginUrl |
| leave-request.hbs | Leave request notification | employeeName, leaveType, fromDate, toDate, days, reason, managerName, approvalUrl |
| payslip-generated.hbs | Payslip notification | employeeName, employeeId, month, year, netPay, downloadUrl |
| birthday-wish.hbs | Birthday greeting | employeeName, companyName, message |
| system-notification.hbs | General notifications | employeeName, title, message, actionUrl, actionText |

### Template Customization

Templates are located in `backend/src/templates/email/`. To customize:

1. Edit the `.hbs` file with your custom HTML
2. Use Handlebars syntax for variables: `{{variableName}}`
3. Available helpers:
   - `{{formatDate date format}}` - Format dates
   - `{{formatCurrency amount currency}}` - Format currency
   - `{{pluralize count singular plural}}` - Pluralization
   - `{{#if condition}}...{{/if}}` - Conditionals

---

## API Reference

### Basic Email Sending

```typescript
const result = await emailService.send({
  to: 'recipient@example.com',
  subject: 'Test Email',
  text: 'This is a test email',
  html: '<h1>Hello</h1><p>This is a test email</p>',
});
```

### Template-Based Sending

```typescript
const result = await emailService.sendWithTemplate(
  EmailTemplateType.WELCOME,
  'employee@example.com',
  'Welcome to the Company',
  {
    employeeName: 'John Doe',
    employeeId: 'EMP001',
    department: 'Engineering',
    startDate: '2024-01-15',
    managerName: 'Jane Smith',
    loginUrl: 'https://example.com/login',
  }
);
```

### Convenience Methods

```typescript
// Send welcome email
await emailService.sendWelcomeEmail(
  'employee@example.com',
  'John Doe',
  'EMP001',
  'Engineering',
  '2024-01-15',
  'Jane Smith',
  'https://example.com/login'
);

// Send leave request email
await emailService.sendLeaveRequestEmail(
  'manager@example.com',
  'John Doe',
  'Annual Leave',
  '2024-02-01',
  '2024-02-05',
  5,
  'Family vacation',
  'Jane Smith',
  'https://example.com/approve'
);

// Send payslip email
await emailService.sendPayslipEmail(
  'employee@example.com',
  'John Doe',
  'EMP001',
  'January',
  2024,
  '$5,000.00',
  'https://example.com/payslip'
);

// Send birthday wish
await emailService.sendBirthdayWish(
  'employee@example.com',
  'John Doe',
  'Acme Corp',
  'Hope you have a wonderful day!'
);

// Send system notification
await emailService.sendSystemNotification(
  'employee@example.com',
  'John Doe',
  'System Maintenance',
  'The system will be down for maintenance tonight.',
  'https://example.com/status',
  'Check Status'
);
```

### Advanced Features

```typescript
// Send with attachments
const result = await emailService.send({
  to: 'recipient@example.com',
  subject: 'Email with Attachment',
  text: 'Please see attached file',
  attachments: [
    {
      filename: 'document.pdf',
      content: pdfBuffer,
      contentType: 'application/pdf',
    },
  ],
});

// Send with CC and BCC
const result = await emailService.send({
  to: 'recipient@example.com',
  cc: 'cc@example.com',
  bcc: 'bcc@example.com',
  subject: 'Email with CC/BCC',
  text: 'This email has CC and BCC recipients',
});

// Send with priority
const result = await emailService.send({
  to: 'recipient@example.com',
  subject: 'Urgent Email',
  text: 'This is an urgent email',
  priority: 'high',
});

// Queue email for later delivery
const queueId = await emailService.queueEmail({
  to: 'recipient@example.com',
  subject: 'Scheduled Email',
  text: 'This email will be sent later',
}, new Date(Date.now() + 3600000)); // Send in 1 hour
```

### Queue Management

```typescript
// Get queue status
const status = emailService.getQueueStatus();
console.log(`Pending emails: ${status.pending}`);

// Get email statistics
const stats = emailService.getStats();
console.log(`Sent: ${stats.sent}, Failed: ${stats.failed}`);

// Clear queue
emailService.clearQueue();

// Get available templates
const templates = await emailService.getAvailableTemplates();
```

---

## Testing

### Running Tests

```bash
# Run all email service tests
npm test -- emailService

# Run specific test suite
npm test -- emailService.test.ts
npm test -- emailService.property.test.ts
npm test -- emailService.integration.test.ts

# Run with coverage
npm test -- emailService --coverage
```

### Test Coverage

**Total Tests: 64 (All Passing)**

- **Unit Tests**: 18 ✅
- **Property-Based Tests**: 8 ✅
- **Integration Tests**: 38 ✅

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| "Unsupported email provider" | Verify `EMAIL_PROVIDER` is set to 'sendgrid', 'ses', or 'smtp' |
| "SendGrid API key is not configured" | Ensure `SENDGRID_API_KEY` environment variable is set |
| "SMTP connection failed" | Verify SMTP credentials and firewall allows outbound connections |
| "Email template not found" | Verify template file exists in `backend/src/templates/email/` |
| "Invalid template data" | Ensure all required template variables are provided |

### Debug Mode

```typescript
// Set log level to debug
process.env['LOG_LEVEL'] = 'debug';

// Check email service stats
const emailService = new EmailService();
console.log(emailService.getStats());
console.log(emailService.getQueueStatus());
```

---

## Security

### Best Practices

1. **Never commit credentials** - Use environment variables
2. **Use HTTPS** - All API communications should be encrypted
3. **Validate email addresses** - Prevent injection attacks
4. **Sanitize template data** - Prevent XSS in HTML emails
5. **Encrypt sensitive data** - Store credentials securely
6. **Audit email logs** - Track all email operations
7. **Use TLS for SMTP** - Enable encryption for SMTP connections
8. **Rotate API keys** - Regularly update provider credentials

---

## Verification Checklist

### Pre-Production Setup

- [ ] Email provider account created and configured
- [ ] API keys/credentials generated and stored securely
- [ ] Sender email address verified with provider
- [ ] Environment variables configured in `.env`
- [ ] Email templates customized for your organization
- [ ] All tests passing (`npm test -- emailService`)
- [ ] Email configuration validated

### Provider-Specific Checks

**SendGrid:**
- [ ] API key is valid and has email sending permissions
- [ ] Sender email is verified in SendGrid
- [ ] Sender name is configured

**AWS SES:**
- [ ] AWS account has SES service enabled
- [ ] Sender email is verified in SES
- [ ] Production access requested (if in sandbox)
- [ ] IAM user has SES permissions

**SMTP:**
- [ ] SMTP server is accessible
- [ ] Authentication credentials are correct
- [ ] TLS/SSL settings are appropriate
- [ ] Firewall allows outbound SMTP connections

### Runtime Validation

```typescript
// Validate configuration at startup
const emailService = new EmailService();
const isValid = await emailService.validateConfiguration();

if (!isValid) {
  console.error('Email service configuration is invalid');
  process.exit(1);
}

// Check email statistics
const stats = emailService.getStats();
console.log('Email service ready:', stats);
```

---

## Performance Considerations

### Email Queuing

For high-volume email sending, use the queue feature:

```typescript
// Queue emails instead of sending immediately
const queueId = await emailService.queueEmail(emailOptions);

// Process queue periodically
setInterval(async () => {
  await emailService.processQueue();
}, 60000); // Process every minute
```

### Template Caching

Templates are automatically cached after first load. To clear cache:

```typescript
emailService.clearTemplateCache();
```

### Rate Limiting

Different providers have rate limits:
- **SendGrid**: 100 emails/second (Pro plan)
- **AWS SES**: 14 emails/second (sandbox), higher in production
- **SMTP**: Depends on server configuration

---

## Verification Results

### ✅ Infrastructure Verification

| Component | Status |
|-----------|--------|
| SendGrid Provider | ✅ Ready |
| AWS SES Provider | ✅ Ready |
| SMTP Provider | ✅ Ready |
| Email Service | ✅ Ready |
| Template Engine | ✅ Ready |
| Configuration | ✅ Ready |

### ✅ Test Results

```
Test Suites: 3 passed, 3 total
Tests:       64 passed, 64 total
Time:        ~9.8 seconds
```

---

## Support & Resources

- **SendGrid Documentation**: https://docs.sendgrid.com
- **AWS SES Documentation**: https://docs.aws.amazon.com/ses/
- **Handlebars Documentation**: https://handlebarsjs.com
- **Nodemailer Documentation**: https://nodemailer.com

---

## Maintenance

### Regular Tasks

1. **Monitor email statistics** - Check sent/failed ratios
2. **Review bounce rates** - Identify invalid email addresses
3. **Update templates** - Keep email content current
4. **Rotate credentials** - Update API keys periodically
5. **Test email delivery** - Send test emails regularly

### Monitoring

```typescript
// Set up monitoring
setInterval(() => {
  const stats = emailService.getStats();
  console.log('Email Stats:', {
    sent: stats.sent,
    failed: stats.failed,
    queued: stats.queued,
    lastSent: stats.lastSent,
    lastError: stats.lastError,
  });
}, 300000); // Every 5 minutes
```

---

## Conclusion

The email service is production-ready with comprehensive provider support, template management, and error handling. Follow the configuration steps above and run the validation tests to ensure proper setup.

**Status: READY FOR PRODUCTION** ✅
