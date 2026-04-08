# External Services Setup

This folder contains step-by-step setup guides for every external dependency used by the Pharma ERP backend.

---

## Guides

| # | Service | File | Status | `.env` key |
|---|---------|------|--------|------------|
| 1 | AWS S3 | [01_AWS_S3.md](01_AWS_S3.md) | Needs credentials | `AWS_ACCESS_KEY_ID` |
| 2 | Email (SMTP / SendGrid / SES) | [02_EMAIL_CONFIG.md](02_EMAIL_CONFIG.md) | Ready (Gmail configured) | `EMAIL_PROVIDER` |
| 3 | Google Maps API | [03_GOOGLE_MAPS_API.md](03_GOOGLE_MAPS_API.md) | Keys present, verify they work | `GOOGLE_MAPS_API_KEY` |
| 4 | Google OAuth | [04_GOOGLE_OAUTH.md](04_GOOGLE_OAUTH.md) | Needs credentials | `GOOGLE_CLIENT_ID` |
| 5 | Firebase / FCM | [05_FIREBASE_FCM.md](05_FIREBASE_FCM.md) | Disabled by default | `FIREBASE_ENABLED` |

---

## Quick-Start Checklist

```
[ ] 1. AWS S3       — Create bucket + IAM user → paste keys into .env
[ ] 2. Email        — Gmail SMTP already configured, verify it works
[ ] 3. Google Maps  — Confirm existing API keys are active and billing is enabled
[ ] 4. Google OAuth — Create OAuth 2.0 Client ID → paste into .env
[ ] 5. Firebase     — Create project → download service account JSON → paste into .env
                      Then set FIREBASE_ENABLED=true and NOTIFICATION_PROVIDER=fcm
```

---

## All `.env` Variables at a Glance

```env
# ── AWS S3 ──────────────────────────────────────────────────────
FILE_STORAGE_PROVIDER=s3
AWS_REGION=ap-south-1
S3_BUCKET_NAME=ems-file-storage
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
FILE_URL_EXPIRY=3600

# ── Email ───────────────────────────────────────────────────────
EMAIL_PROVIDER=smtp                        # smtp | sendgrid | ses
EMAIL_FROM_NAME=Pharma ERP
EMAIL_FROM_ADDRESS=smartops.mailer@gmail.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=smartops.mailer@gmail.com
SMTP_PASSWORD=rzbrlyqvxahwpntv             # Gmail App Password
SENDGRID_API_KEY=SG....                    # only if EMAIL_PROVIDER=sendgrid

# ── Google Maps ─────────────────────────────────────────────────
GOOGLE_MAPS_API_KEY=AIzaSy...
GOOGLE_MAPS_DISTANCE_MATRIX_API_KEY=AIzaSy...
GOOGLE_MAPS_ENABLED=true
GEO_TRACKING_ENABLED=true
TRAVEL_ALLOWANCE_RATE=5
TRAVEL_ALLOWANCE_UNIT=per_km

# ── Google OAuth ────────────────────────────────────────────────
GOOGLE_CLIENT_ID=...apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-...
GOOGLE_CALLBACK_URL=http://localhost:3000/api/v1/auth/google/callback
FRONTEND_URL=http://localhost:5173
FRONTEND_OAUTH_CALLBACK_PATH=/auth/callback

# ── Firebase / FCM ──────────────────────────────────────────────
FIREBASE_ENABLED=true                      # false to disable entirely
FIREBASE_PROJECT_ID=pharma-erp-12345
FIREBASE_PRIVATE_KEY_ID=abc123...
FIREBASE_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nMIIE...\n-----END RSA PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@pharma-erp.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=123456789
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/...
NOTIFICATION_PROVIDER=fcm                  # fcm | disabled
```
