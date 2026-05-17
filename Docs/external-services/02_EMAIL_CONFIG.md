# Email Configuration Setup

Used by: `backend/src/services/email/providers/smtpProvider.ts`  
and: `backend/src/services/email/providers/sendgridProvider.ts`  
Controls: `EMAIL_PROVIDER` in `.env` — set to `smtp` or `sendgrid`

---

## What Email Does in This Project

Emails are sent for:
- New employee welcome messages
- Password reset links
- Leave approval / rejection notifications
- Payslip delivery
- Offer letters
- Onboarding task reminders
- System alerts

---

## Option A — Gmail SMTP (Already Configured, Quickest)

Your `.env` already has Gmail SMTP credentials. This uses **Gmail App Passwords** — not your actual Gmail password. It works out of the box for development.

### Verify your current settings are correct

Open `backend/.env` and confirm:

```env
EMAIL_PROVIDER=smtp
EMAIL_FROM_NAME=Employee Management System
EMAIL_FROM_ADDRESS=XXXXXXXXXXXXXXXXX   # must match SMTP_USER exactly

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=XXXXXXXXXXXXXXXXX
SMTP_PASSWORD=XXXXXXXXXXXXXXXXX                 # 16-char Gmail App Password
```

> `EMAIL_FROM_ADDRESS` and `SMTP_USER` **must be the same Gmail address**. If they differ, Gmail rejects the send.

### If you need to generate a new Gmail App Password

1. Log in to [https://myaccount.google.com](https://myaccount.google.com)
2. Left sidebar → **Security**
3. Make sure **2-Step Verification is ON** (required for App Passwords)
4. Search "App passwords" in the search bar at the top of the page → click it
5. App name: `Pharma ERP` → **Create**
6. Copy the 16-character password shown (no spaces)
7. Paste it into `SMTP_PASSWORD=` in `.env`

### Gmail limits

| Limit | Value |
|-------|-------|
| Emails per day | 500 (free Gmail) / 2,000 (Google Workspace) |
| Recipients per email | 500 |
| Max attachment size | 25 MB |

> For production with high email volume, use SendGrid (Option B) or Amazon SES (Option C).

---

## Option B — SendGrid (Recommended for Production)

SendGrid's free tier allows 100 emails/day permanently. Paid plans start at ~$15/month for 50,000 emails.

### Step 1: Create a SendGrid account

1. Go to [https://sendgrid.com](https://sendgrid.com) → **Start for Free**
2. Sign up with your email
3. Complete email verification

### Step 2: Verify your sender identity

SendGrid requires you to verify who you're sending from. Two options:

**Option 2a — Single Sender Verification (easiest for dev):**
1. Dashboard → **Settings** → **Sender Authentication** → **Verify a Single Sender**
2. Fill in your name and the email address you'll send from
3. Click the verification link sent to that email

**Option 2b — Domain Authentication (recommended for production):**
1. Dashboard → **Settings** → **Sender Authentication** → **Authenticate Your Domain**
2. Choose your DNS provider (Cloudflare, GoDaddy, etc.)
3. Add the DNS records they show you
4. Click **Verify** once DNS propagates (~30 min)

### Step 3: Create an API Key

1. Dashboard → **Settings** → **API Keys** → **Create API Key**
2. Name: `pharma-erp-mailer`
3. Permission: **Restricted Access** → enable only **Mail Send** → **Full Access**
4. Click **Create & View**
5. Copy the key (starts with `SG.`)

> The key is shown only once. Store it securely.

### Step 4: Update `.env`

```env
EMAIL_PROVIDER=sendgrid
EMAIL_FROM_NAME=Pharma ERP
EMAIL_FROM_ADDRESS=noreply@yourcompany.com   # must be your verified sender address

SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxx
```

Comment out or leave the SMTP lines — they'll be ignored when `EMAIL_PROVIDER=sendgrid`.

---

## Option C — Amazon SES (Cheapest at Scale)

Amazon SES costs $0.10 per 1,000 emails. Free if sending from an EC2 instance.

### Step 1: Verify your sending domain or email in SES

1. AWS Console → search **SES** → click it
2. Left sidebar → **Verified identities** → **Create identity**
3. Choose **Email address** (for dev) or **Domain** (for production)
4. For email: click the verification link sent to your inbox
5. For domain: add the DNS records shown to your domain's DNS settings

### Step 2: Check if you're in the SES Sandbox

New SES accounts start in the **sandbox** — you can only send to verified email addresses.

To go to production:
1. SES Console → left sidebar → **Account dashboard**
2. Click **Request production access**
3. Fill in the form explaining your use case
4. AWS usually approves within 24 hours

### Step 3: Create SES-specific IAM credentials

1. IAM → **Users** → **Create user** → name: `pharma-erp-ses`
2. Attach policy: `AmazonSESFullAccess`
3. Create access keys for this user

### Step 4: Update `.env`

```env
EMAIL_PROVIDER=ses
EMAIL_FROM_NAME=Pharma ERP
EMAIL_FROM_ADDRESS=noreply@yourcompany.com   # must be verified in SES

AWS_SES_REGION=ap-south-1
AWS_SES_ACCESS_KEY_ID=AKIA...
AWS_SES_SECRET_ACCESS_KEY=...
```

---

## Test the Email Configuration

Run this from the `backend/` directory:

```bash
node -e "
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'XXXXXXXXXXXXXXXXX',
    pass: 'XXXXXXXXXXXXXXXXX'
  }
});

transporter.verify()
  .then(() => console.log('SUCCESS: SMTP connection verified'))
  .catch(e => console.error('FAILED:', e.message));
"
```

Expected output:
```
SUCCESS: SMTP connection verified
```

---

## Email Templates

Email templates live in `backend/src/templates/email/` (configured by `EMAIL_TEMPLATE_DIR`).  
The template engine is at `backend/src/services/email/templateEngine.ts`.

---

## Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| `Invalid login: 535-5.7.8 Username and Password not accepted` | App Password is wrong or 2FA not enabled | Enable 2-Step Verification on Google account, then regenerate App Password |
| `self-signed certificate in certificate chain` | `SMTP_SECURE=true` with port 587 | Set `SMTP_SECURE=false` for port 587 (STARTTLS), `true` only for port 465 (SSL) |
| `Unauthorized` from SendGrid | API key wrong or revoked | Regenerate API key in SendGrid dashboard |
| `The from address does not match a verified Sender Identity` | SendGrid: sender not verified | Verify your from-address in SendGrid → Sender Authentication |
| `Email address is not verified` | SES sandbox mode | Verify recipient email in SES, or request production access |
| Emails go to spam | Missing SPF/DKIM records | Set up Domain Authentication in SendGrid, or verify domain in SES |

---

## Provider Comparison

| | Gmail SMTP | SendGrid | Amazon SES |
|---|---|---|---|
| Free tier | 500/day | 100/day | 62,000/month (from EC2) |
| Paid cost | — | $15/month (50k emails) | $0.10/1,000 emails |
| Setup time | 5 minutes | 15 minutes | 30 minutes |
| Best for | Development | Startups / SMB | High volume / AWS infra |
| Deliverability | Medium | High | High |
| Analytics | No | Yes | Basic |
