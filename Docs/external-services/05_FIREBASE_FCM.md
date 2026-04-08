# Firebase & FCM (Push Notifications) Setup

Used by: `backend/src/config/firebase.ts`  
and: `backend/src/services/notification/fcmProvider.ts`  
and: `backend/src/services/factories/NotificationProviderFactory.ts`  
Controls: `FIREBASE_ENABLED` + `NOTIFICATION_PROVIDER` in `.env`

---

## What Firebase Does in This Project

Firebase is used exclusively for **Firebase Cloud Messaging (FCM)** — push notifications sent to employee browsers and mobile devices.

Notifications are sent for:
- Leave approval / rejection
- Payslip available
- Attendance reminders
- Task assignments
- System alerts

The backend uses the **Firebase Admin SDK** (`firebase-admin`) to send messages. It never handles authentication or Firestore — only push notifications.

**Current state:** Disabled by default (`FIREBASE_ENABLED=false`, `NOTIFICATION_PROVIDER=disabled`).

---

## Architecture

```
Backend (Node.js)
  └── FCMProvider (sends via Firebase Admin SDK)
        └── Firebase Cloud Messaging
              ├── Employee browser (Web Push)
              └── Employee mobile app (iOS / Android)
```

The frontend must register a **device token** with Firebase and send it to the backend API. The backend stores the token and uses it to push notifications.

---

## Step 1 — Create a Firebase Project

1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add project** (or **Create a project**)
3. Project name: `pharma-erp`
4. Google Analytics: optional, can disable → **Create project**
5. Wait for provisioning → **Continue**

---

## Step 2 — Generate a Service Account Key

This is what the backend uses to authenticate with Firebase.

1. In the Firebase Console, click the gear icon ⚙️ → **Project settings**
2. Go to the **Service accounts** tab
3. Click **Generate new private key**
4. Click **Generate key** in the confirmation popup
5. A JSON file downloads automatically — **keep this file secure, never commit it to git**

The downloaded file looks like this:

```json
{
  "type": "service_account",
  "project_id": "pharma-erp-12345",
  "private_key_id": "abc123def456...",
  "private_key": "-----BEGIN RSA PRIVATE KEY-----\nMIIE...\n-----END RSA PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@pharma-erp-12345.iam.gserviceaccount.com",
  "client_id": "123456789012345678",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40pharma-erp-12345.iam.gserviceaccount.com"
}
```

---

## Step 3 — Update `.env`

Map each field from the JSON file to the corresponding `.env` variable:

```env
# Enable Firebase
FIREBASE_ENABLED=true

# From "project_id"
FIREBASE_PROJECT_ID=pharma-erp-12345

# From "private_key_id"
FIREBASE_PRIVATE_KEY_ID=abc123def456...

# From "private_key" — IMPORTANT: copy the entire key including header/footer,
# but replace actual newlines with \n (the literal two characters backslash-n)
FIREBASE_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAAK...\n-----END RSA PRIVATE KEY-----\n"

# From "client_email"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@pharma-erp-12345.iam.gserviceaccount.com

# From "client_id"
FIREBASE_CLIENT_ID=123456789012345678

# These are always the same, no need to change
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs

# From "client_x509_cert_url"
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40pharma-erp-12345.iam.gserviceaccount.com
```

Also enable the notification provider:

```env
NOTIFICATION_PROVIDER=fcm
```

---

## The Private Key — Most Common Mistake

The `private_key` in the JSON file has **real newlines** in it. But `.env` files don't support multi-line values. You must convert newlines to the literal `\n` string.

### If the key in your JSON file looks like this:
```
"private_key": "-----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAAKCAQ..."
```
The JSON file already uses `\n` — paste it directly into `.env` with surrounding double quotes:
```env
FIREBASE_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAAKCAQ..."
```

### If it looks like this (actual newlines):
```
-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQ...
-----END RSA PRIVATE KEY-----
```
Run this to convert it:
```bash
node -e "const fs=require('fs'); const j=JSON.parse(fs.readFileSync('path/to/your-key.json')); console.log(JSON.stringify(j.private_key));"
```
Copy the output (it will be a single-line string with `\n` escapes) and paste into `.env`.

The config file handles the reverse conversion automatically at `backend/src/config/index.ts:310`:
```typescript
privateKey: process.env['FIREBASE_PRIVATE_KEY']?.replace(/\\n/g, '\n') || '',
```

---

## Step 4 — Enable Cloud Messaging in Firebase Console

1. In the Firebase Console, left sidebar → **Build** → **Cloud Messaging**
2. The page should show your **Server key** and **Sender ID** (the Admin SDK handles auth via service account, so you don't need these for the backend, but note the Sender ID — you'll need it for the frontend)

---

## Step 5 — Frontend Setup (Web Push)

The backend is ready once `.env` is configured. To receive notifications on the frontend:

### 5a — Get Firebase web config

1. Firebase Console → **Project settings** → **General** tab
2. Scroll to **Your apps** → click **Web** (`</>`)
3. App nickname: `pharma-erp-web` → **Register app**
4. Copy the `firebaseConfig` object shown

### 5b — Add to frontend `.env`

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=pharma-erp-12345.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=pharma-erp-12345
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abc123
```

### 5c — Get VAPID key for Web Push

1. Firebase Console → **Project settings** → **Cloud Messaging** tab
2. Scroll to **Web Push certificates**
3. Click **Generate key pair**
4. Copy the **Key pair** value

```env
VITE_FIREBASE_VAPID_KEY=BPxxxxxxxxxxxxxx...
```

### 5d — Register device token

The frontend must call `getToken(messaging, { vapidKey })` from the Firebase JS SDK, then POST the token to your backend API so it can be stored and used for pushes.

---

## Step 6 — Test Push Notifications

Once everything is configured, you can test via the Firebase Console:

1. Firebase Console → **Engage** → **Messaging**
2. **Create your first campaign** → **Firebase Notification messages**
3. Fill in title and body
4. Click **Send test message**
5. Paste a device token from your frontend (obtained from `getToken()`)
6. Click **Test**

Or test via the backend directly using the `sendToTopic` method in `fcmProvider.ts`.

---

## Notification Provider Factory

The app uses `NotificationProviderFactory` to decide which provider to use based on `NOTIFICATION_PROVIDER`:

| `NOTIFICATION_PROVIDER` | Behavior |
|--------------------------|----------|
| `fcm` | Uses Firebase Cloud Messaging. Requires `FIREBASE_ENABLED=true` |
| `disabled` | No push notifications sent. No errors thrown. Default. |

---

## Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| `Missing required Firebase credentials` | One of the required env vars is empty | Check `FIREBASE_PROJECT_ID`, `FIREBASE_PRIVATE_KEY`, `FIREBASE_CLIENT_EMAIL` are all set |
| `Error decoding credential: PEM routines...` | Private key newlines are wrong | See "The Private Key" section above — ensure `\n` is used, not real newlines |
| `Failed to initialize Firebase Admin SDK` | Invalid service account | Re-download the service account JSON and re-map the values |
| `Requested entity was not found` | Token is expired or invalid | The device token has expired — frontend must re-register and send new token |
| `SenderId mismatch` | Frontend uses different Firebase project | Frontend `VITE_FIREBASE_*` vars must point to the same project as the backend service account |
| Notifications sent but not received | Browser permissions denied | User must grant notification permission in the browser |
| `FIREBASE_ENABLED=true` but `NOTIFICATION_PROVIDER=disabled` | Both must be set | Set `NOTIFICATION_PROVIDER=fcm` alongside `FIREBASE_ENABLED=true` |

---

## Keeping It Disabled

If your app doesn't need push notifications, leave the defaults:

```env
FIREBASE_ENABLED=false
NOTIFICATION_PROVIDER=disabled
```

No Firebase credentials are needed. The `FCMProvider` won't be instantiated and the app starts normally.

---

## Cost

Firebase Cloud Messaging is **free with no limits** on the number of messages sent. The only cost is if you use other Firebase services (Firestore, Authentication, etc.) which this project does not use.
