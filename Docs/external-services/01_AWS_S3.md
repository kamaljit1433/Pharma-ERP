# AWS S3 — File Storage Setup

Used by: `backend/src/services/storage/s3StorageProvider.ts`  
Controls: `FILE_STORAGE_PROVIDER=s3` in `.env`

---

## What S3 Does in This Project

- Stores all uploaded files: profile photos, documents, certificates, payslips, contracts, training materials
- Files are kept **private** — accessed only via pre-signed URLs that expire after `FILE_URL_EXPIRY` seconds (default: 1 hour)
- Server-side encryption (`AES256`) is applied to every uploaded file automatically
- Supports multipart uploads for large files (e.g. training videos)

---

## Step 1 — Create an AWS Account

Go to [https://aws.amazon.com](https://aws.amazon.com) → **Create an AWS Account**

You'll need:
- An email address
- A credit card (free tier covers typical dev usage — ~5 GB storage, 20,000 GET requests/month free)

---

## Step 2 — Create the S3 Bucket

1. Log in to [https://console.aws.amazon.com](https://console.aws.amazon.com)
2. Search **S3** in the top bar → click it
3. Click **Create bucket** (orange button, top right)

### Bucket settings to fill in:

| Field | Value |
|-------|-------|
| Bucket name | `ems-file-storage` *(must be globally unique — append your company name if taken, e.g. `ems-file-storage-pharma`)* |
| AWS Region | Closest to you: `ap-south-1` (Mumbai), `us-east-1` (N. Virginia), `eu-west-1` (Ireland) |
| Object Ownership | ACLs disabled (default) |
| Block all public access | **All 4 checkboxes checked** ✅ |
| Bucket Versioning | Disable for now (enable in production) |
| Default encryption | Leave as SSE-S3 (the code also sets `AES256` per-object) |

4. Click **Create bucket** at the bottom

---

## Step 3 — Add CORS Policy

Files are accessed from your frontend browser, so CORS is required.

1. Click your newly created bucket
2. Go to the **Permissions** tab
3. Scroll to **Cross-origin resource sharing (CORS)** → click **Edit**
4. Paste this:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": ["http://localhost:5173"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

5. Click **Save changes**

> When you go to production, add your domain to `AllowedOrigins`:
> ```json
> "AllowedOrigins": ["http://localhost:5173", "https://yourapp.com"]
> ```

---

## Step 4 — Create an IAM User

Never use your root AWS account credentials in the app. Create a dedicated user.

1. Search **IAM** in the AWS Console → click it
2. Left sidebar → **Users** → **Create user**
3. Username: `pharma-erp-app` → click **Next**
4. **Permissions:** Choose **Attach policies directly**

### For development: attach `AmazonS3FullAccess`

Search `AmazonS3FullAccess` → check it → **Next** → **Create user**

### For production: use this minimal custom policy instead

Go to **Policies** → **Create policy** → **JSON** tab → paste:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:HeadObject",
        "s3:ListMultipartUploadParts",
        "s3:AbortMultipartUpload",
        "s3:CreateMultipartUpload",
        "s3:CompleteMultipartUpload"
      ],
      "Resource": "arn:aws:s3:::ems-file-storage/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket",
        "s3:ListBucketMultipartUploads"
      ],
      "Resource": "arn:aws:s3:::ems-file-storage"
    }
  ]
}
```

Name it `PhärmaERPFileStorage` → create it → attach it to the user.

---

## Step 5 — Generate Access Keys

1. Click the `pharma-erp-app` user you just created
2. Go to **Security credentials** tab
3. Scroll to **Access keys** → **Create access key**
4. Use case: **Application running outside AWS** → **Next**
5. Click **Create access key**

You will see:

```
Access key ID:     AKIA...
Secret access key: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

> **Copy both now.** The secret key is shown only once. Store it in a password manager.

---

## Step 6 — Update `.env`

Open `backend/.env` and fill in:

```env
# AWS S3 Configuration
AWS_REGION=ap-south-1
S3_BUCKET_NAME=ems-file-storage
AWS_ACCESS_KEY_ID=AKIA...your_key...
AWS_SECRET_ACCESS_KEY=...your_secret...
FILE_STORAGE_PROVIDER=s3
FILE_URL_EXPIRY=3600
```

**Region codes reference:**

| Location | Region code |
|----------|-------------|
| Mumbai (India) | `ap-south-1` |
| Singapore | `ap-southeast-1` |
| US East (N. Virginia) | `us-east-1` |
| US West (Oregon) | `us-west-2` |
| Europe (Ireland) | `eu-west-1` |
| Europe (Frankfurt) | `eu-central-1` |

> `AWS_REGION` must match the region you selected when creating the bucket.

---

## Step 7 — Test the Connection

Run this from the `backend/` directory after filling in your `.env`:

```bash
node -e "
const { S3Client, ListBucketsCommand } = require('@aws-sdk/client-s3');
const path = require('path');
const fs = require('fs');

const lines = fs.readFileSync(path.join(__dirname, '.env'), 'utf-8').split('\n');
const env = {};
for (const line of lines) {
  const t = line.trim();
  if (!t || t.startsWith('#')) continue;
  const [k, ...v] = t.split('=');
  env[k] = v.join('=').trim();
}

const client = new S3Client({
  region: env.AWS_REGION,
  credentials: { accessKeyId: env.AWS_ACCESS_KEY_ID, secretAccessKey: env.AWS_SECRET_ACCESS_KEY }
});

client.send(new ListBucketsCommand({}))
  .then(r => console.log('SUCCESS! Buckets:', r.Buckets.map(b => b.Name).join(', ')))
  .catch(e => console.error('FAILED:', e.message));
"
```

Expected output:
```
SUCCESS! Buckets: ems-file-storage
```

---

## File Upload Categories & Size Limits

These are configured in `backend/.env` and enforced by the app:

| Category | Default max size | Env variable |
|----------|-----------------|--------------|
| Profile photo | 5 MB | `PROFILE_PHOTO_MAX_SIZE` |
| Document | 20 MB | `DOCUMENT_MAX_SIZE` |
| Certificate | 10 MB | `CERTIFICATE_MAX_SIZE` |
| Payslip | 5 MB | `PAYSLIP_MAX_SIZE` |
| Contract | 15 MB | `CONTRACT_MAX_SIZE` |
| Training material | 50 MB | `TRAINING_MATERIAL_MAX_SIZE` |
| Reimbursement | 10 MB | `REIMBURSEMENT_MAX_SIZE` |

---

## Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| `The AWS Access Key Id you provided does not exist` | Wrong or placeholder key | Re-copy the Access Key ID from IAM — no spaces, no quotes |
| `InvalidAccessKeyId` | Extra spaces/quotes in `.env` | Values in `.env` must not be wrapped in quotes |
| `NoSuchBucket` | Bucket name typo or wrong region | `S3_BUCKET_NAME` must exactly match what you created; `AWS_REGION` must match bucket's region |
| `AccessDenied` | IAM policy too restrictive | Attach `AmazonS3FullAccess` to the IAM user for dev |
| `SignatureDoesNotMatch` | Secret key is wrong | Regenerate access keys in IAM and update `.env` |
| `PermanentRedirect` | Wrong region in `.env` | Change `AWS_REGION` to match your bucket's actual region |
| File upload silently fails | `ACL` header blocked | Your bucket has ACLs disabled — this is fine, the code handles it |

---

## Production Recommendations

- Switch from `AmazonS3FullAccess` to the minimal custom policy above
- Enable **Bucket Versioning** (Properties tab) to recover accidentally deleted files
- Enable **Server Access Logging** to track who accessed what
- Rotate access keys every 90 days
- Use **IAM Roles** (not access keys) when deploying to EC2/ECS/Lambda — remove `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` from `.env` entirely when using roles

---

## Cost Estimate (AWS Free Tier then pay-as-you-go)

| Resource | Free tier | After free tier |
|----------|-----------|-----------------|
| Storage | 5 GB / month | $0.023/GB |
| GET requests | 20,000 / month | $0.0004 per 1,000 |
| PUT requests | 2,000 / month | $0.005 per 1,000 |
| Data transfer out | 100 GB / month | $0.09/GB |

A typical small deployment with 50 GB of files costs about **$1–2/month**.
