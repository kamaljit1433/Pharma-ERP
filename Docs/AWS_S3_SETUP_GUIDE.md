# AWS S3 Setup Guide for Employee Management System

This guide walks you through creating an AWS S3 bucket and configuring it for the EMS application.

---

## Prerequisites

- AWS Account (create one at https://aws.amazon.com if you don't have one)
- AWS Management Console access
- Basic understanding of AWS services

---

## Step 1: Sign In to AWS Management Console

1. Go to https://console.aws.amazon.com
2. Sign in with your AWS account credentials
3. You'll see the AWS Management Console dashboard

---

## Step 2: Navigate to S3 Service

1. In the AWS Management Console, search for "S3" in the search bar at the top
2. Click on "S3" from the results
3. You'll be taken to the S3 dashboard showing your buckets

---

## Step 3: Create a New S3 Bucket

### 3.1 Click "Create Bucket"

On the S3 dashboard, click the orange **"Create bucket"** button.

### 3.2 Configure Bucket Settings

Fill in the following details:

**Bucket name:**
```
ems-file-storage-[your-unique-id]
```
- Replace `[your-unique-id]` with something unique (e.g., your company name or random numbers)
- S3 bucket names must be globally unique across all AWS accounts
- Use lowercase letters, numbers, and hyphens only
- Example: `ems-file-storage-pharma-2026`

**AWS Region:**
- Select the region closest to your users
- Common choices: `us-east-1`, `eu-west-1`, `ap-south-1`
- For this guide, we'll use `us-east-1`

### 3.3 Block Public Access Settings

Keep the default settings:
- ✅ Block all public access (checked)
- This ensures your files are private by default

### 3.4 Create the Bucket

Click **"Create bucket"** button at the bottom.

You should see a success message: "Successfully created bucket 'ems-file-storage-xxx'"

---

## Step 4: Create IAM User for Application Access

### 4.1 Navigate to IAM Service

1. Search for "IAM" in the AWS search bar
2. Click on "IAM" (Identity and Access Management)
3. In the left sidebar, click **"Users"**

### 4.2 Create New User

1. Click **"Create user"** button
2. Enter username: `ems-app-user`
3. Click **"Next"**

### 4.3 Set Permissions

1. Click **"Attach policies directly"**
2. Search for "S3" in the policy search box
3. Select **"AmazonS3FullAccess"** (for development; use more restrictive policy in production)
4. Click **"Next"**
5. Click **"Create user"**

---

## Step 5: Create Access Keys

### 5.1 Open User Details

1. Click on the user `ems-app-user` you just created
2. Go to the **"Security credentials"** tab
3. Scroll down to **"Access keys"** section

### 5.2 Create Access Key

1. Click **"Create access key"**
2. Select **"Application running outside AWS"**
3. Click **"Next"**
4. Click **"Create access key"**

### 5.3 Copy Your Credentials

You'll see a screen with:
- **Access key ID** (starts with AKIA...)
- **Secret access key** (long string)

⚠️ **IMPORTANT:** Copy these values now. You won't be able to see the secret key again!

Store them securely:
```
Access Key ID: AKIA...
Secret Access Key: wJal...
```

---

## Step 6: Configure Your Application

### 6.1 Update Backend .env File

Open `backend/.env` and update these values:

```env
# AWS S3 Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=wJal...
S3_BUCKET_NAME=ems-file-storage-pharma-2026
S3_BUCKET_REGION=us-east-1
FILE_STORAGE_PROVIDER=s3
FILE_URL_EXPIRY=3600
```

Replace:
- `AKIA...` with your Access Key ID
- `wJal...` with your Secret Access Key
- `ems-file-storage-pharma-2026` with your actual bucket name
- `us-east-1` with your chosen region

### 6.2 Verify Configuration

```bash
cd backend
npm run dev
```

If configured correctly, you should see:
```
Server running on port 3000
Database connected
Redis connected
```

---

## Step 7: Test S3 Connection (Optional)

Create a test file to verify S3 is working:

### 7.1 Create Test Script

Create `backend/test-s3.ts`:

```typescript
import { S3StorageProvider } from './src/services/storage/s3StorageProvider';

async function testS3() {
  try {
    const provider = new S3StorageProvider();
    
    // Test upload
    const testFile = Buffer.from('Hello, S3!');
    const result = await provider.uploadFile(
      testFile,
      'test.txt',
      'text/plain',
      'test'
    );
    
    console.log('✅ Upload successful:', result);
    
    // Test download
    const downloadUrl = await provider.getSignedUrl(result.key, 3600);
    console.log('✅ Download URL:', downloadUrl);
    
  } catch (error) {
    console.error('❌ S3 test failed:', error);
  }
}

testS3();
```

### 7.2 Run Test

```bash
cd backend
npx tsx test-s3.ts
```

---

## Step 8: Configure CORS (Optional but Recommended)

If you want to upload files directly from the browser:

### 8.1 Go to S3 Bucket Settings

1. Go to S3 dashboard
2. Click on your bucket name
3. Go to **"Permissions"** tab
4. Scroll to **"Cross-origin resource sharing (CORS)"**
5. Click **"Edit"**

### 8.2 Add CORS Configuration

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": ["http://localhost:5173", "http://localhost:3000"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

For production, replace localhost URLs with your actual domain.

---

## Step 9: Enable Versioning (Optional but Recommended)

To keep file history:

1. Go to your S3 bucket
2. Go to **"Properties"** tab
3. Scroll to **"Versioning"**
4. Click **"Edit"**
5. Select **"Enable"**
6. Click **"Save changes"**

---

## Step 10: Set Up Lifecycle Policy (Optional)

To automatically delete old files:

1. Go to your S3 bucket
2. Go to **"Management"** tab
3. Click **"Create lifecycle rule"**
4. Name: `delete-old-files`
5. Set expiration: 90 days
6. Click **"Create rule"**

---

## Troubleshooting

### Issue: "Access Denied" Error

**Solution:**
1. Verify Access Key ID and Secret Access Key are correct
2. Check that IAM user has S3 permissions
3. Verify bucket name is spelled correctly

### Issue: "NoSuchBucket" Error

**Solution:**
1. Verify bucket name in .env matches actual bucket name
2. Verify region is correct
3. Check bucket exists in AWS console

### Issue: "InvalidAccessKeyId" Error

**Solution:**
1. Regenerate access keys in IAM console
2. Update .env with new credentials
3. Restart the application

### Issue: File Upload Fails

**Solution:**
1. Check bucket permissions
2. Verify IAM user has `s3:PutObject` permission
3. Check file size doesn't exceed limit (default 10MB)

---

## Security Best Practices

### 1. Restrict IAM Permissions (Production)

Instead of `AmazonS3FullAccess`, create a custom policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::ems-file-storage-pharma-2026/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket"
      ],
      "Resource": "arn:aws:s3:::ems-file-storage-pharma-2026"
    }
  ]
}
```

### 2. Enable Encryption

1. Go to S3 bucket **"Properties"**
2. Scroll to **"Default encryption"**
3. Click **"Edit"**
4. Select **"Enable"** with SSE-S3
5. Click **"Save changes"**

### 3. Enable Logging

1. Go to **"Properties"** tab
2. Scroll to **"Server access logging"**
3. Click **"Edit"**
4. Enable logging to track access

### 4. Rotate Access Keys Regularly

1. Go to IAM user
2. Create new access key
3. Update application with new key
4. Delete old access key

### 5. Use Environment Variables

Never commit credentials to Git:
- Add `.env` to `.gitignore`
- Use `.env.example` for template
- Use AWS IAM roles in production (not access keys)

---

## Production Deployment

For production, use **IAM Roles** instead of access keys:

1. Create an IAM role with S3 permissions
2. Attach role to your EC2/Lambda/ECS instance
3. Remove access keys from .env
4. Application will automatically use the role

---

## Cost Estimation

**Typical monthly costs for small-medium usage:**
- Storage: $0.023 per GB (first 50 TB)
- Data transfer out: $0.09 per GB
- API requests: $0.0004 per 1,000 PUT requests

Example: 100 GB storage + 10 GB transfer = ~$3/month

---

## Next Steps

1. ✅ Create S3 bucket
2. ✅ Create IAM user and access keys
3. ✅ Configure .env file
4. ✅ Test S3 connection
5. ✅ Deploy application

---

## Useful AWS S3 Links

- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [S3 Pricing](https://aws.amazon.com/s3/pricing/)
- [IAM Best Practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)
- [S3 Security Best Practices](https://docs.aws.amazon.com/AmazonS3/latest/userguide/security-best-practices.html)

---

**Last Updated:** 2026-03-21  
**Version:** 1.0
