# Google OAuth Setup

Used by: `backend/src/config/passport.ts`  
and: `backend/src/services/authService.ts`  
Controls: `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` in `.env`

---

## What Google OAuth Does in This Project

Allows employees to log in with their Google/Gmail account instead of (or in addition to) a username and password.

Flow:
1. User clicks "Sign in with Google" on the frontend
2. Browser redirects to Google's login page
3. After login, Google redirects back to `GOOGLE_CALLBACK_URL`
4. The backend's `passport-google-oauth20` strategy receives the profile
5. `authService.oauthLogin()` finds or creates the user account
6. A JWT is issued and the user is redirected to `FRONTEND_OAUTH_CALLBACK_PATH`

> The Google OAuth strategy is only registered in `passport.ts` if `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are present. If they're missing, local login still works — OAuth is skipped silently.

---

## Step 1 — Open Google Cloud Console

1. Go to [https://console.cloud.google.com](https://console.cloud.google.com)
2. Select your existing project (`pharma-erp`) or create one
3. Make sure billing is enabled (required for OAuth to work reliably)

---

## Step 2 — Enable the Required API

1. Left sidebar → **APIs & Services** → **Library**
2. Search **Google People API** → click it → **Enable**

> The `passport-google-oauth20` library uses the People API to fetch the user's email and profile. Without this, the callback will fail with a 403.

---

## Step 3 — Configure the OAuth Consent Screen

This is the screen users see when logging in. You must set it up before creating credentials.

1. Left sidebar → **APIs & Services** → **OAuth consent screen**
2. User type: **External** → **Create**

### Fill in the form:

| Field | Value |
|-------|-------|
| App name | `Pharma ERP` |
| User support email | Your email |
| App logo | Optional |
| App domain | `http://localhost:3000` (for dev) |
| Developer contact information | Your email |

3. Click **Save and Continue**

### Scopes page:
1. Click **Add or Remove Scopes**
2. Add these scopes:
   - `openid`
   - `https://www.googleapis.com/auth/userinfo.email`
   - `https://www.googleapis.com/auth/userinfo.profile`
3. Click **Update** → **Save and Continue**

### Test users page (important for development):
Since your app is in "Testing" mode, only users you explicitly add here can log in.
1. Click **Add Users**
2. Add the email addresses of your team members who need to test OAuth login
3. **Save and Continue** → **Back to Dashboard**

> In production, you'll submit the app for Google's verification to allow any Google account to log in. For internal company use, you can stay in "Testing" mode and add all employees as test users.

---

## Step 4 — Create OAuth 2.0 Credentials

1. Left sidebar → **APIs & Services** → **Credentials**
2. **Create Credentials** → **OAuth 2.0 Client ID**
3. Application type: **Web application**
4. Name: `pharma-erp-web`

### Authorized JavaScript origins:
```
http://localhost:3000
http://localhost:5173
```

### Authorized redirect URIs:
```
http://localhost:3000/api/v1/auth/google/callback
```

> This must match `GOOGLE_CALLBACK_URL` in your `.env` exactly — including the path, protocol, and port.

5. Click **Create**

You'll see a popup with:
```
Client ID:     123456789-abc123def456.apps.googleusercontent.com
Client secret: GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Copy both values.** You can always view the Client ID later but not the secret.

---

## Step 5 — Update `.env`

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=123456789-abc123def456.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxxxx
GOOGLE_CALLBACK_URL=http://localhost:3000/api/v1/auth/google/callback

# Where to redirect after successful OAuth login
FRONTEND_URL=http://localhost:5173
FRONTEND_LOGIN_PATH=/login
FRONTEND_OAUTH_CALLBACK_PATH=/auth/callback
```

---

## Step 6 — Test the OAuth Flow

Start the backend server, then open this URL in your browser:

```
http://localhost:3000/api/v1/auth/google
```

You should be redirected to Google's login screen. After logging in:
- If successful: redirected to `http://localhost:5173/auth/callback?token=...`
- If failed: redirected to `http://localhost:5173/login?error=oauth_failed`

---

## How the Callback Works (Code Reference)

The flow in `passport.ts` (lines 58–97):

1. Google returns the user's profile with `profile.emails[0].value`
2. This is passed to `authService.oauthLogin()` which either:
   - Finds an existing employee with that email and returns their account
   - Creates a new account linked to the Google profile
3. A `TokenPayload` is generated and a JWT is signed

If `GOOGLE_CLIENT_ID` or `GOOGLE_CLIENT_SECRET` are missing from `.env`, the `passport.use(GoogleStrategy)` block is skipped entirely (lines 58–97 are inside an `if` check).

---

## Production Setup Changes

When deploying to production, update these values:

```env
GOOGLE_CALLBACK_URL=https://api.yourapp.com/api/v1/auth/google/callback
FRONTEND_URL=https://yourapp.com
```

Also update in Google Cloud Console → **Credentials** → your OAuth client:
- Add `https://api.yourapp.com` to Authorized JavaScript origins
- Add `https://api.yourapp.com/api/v1/auth/google/callback` to Authorized redirect URIs

Then submit for **OAuth verification** in the consent screen settings if you want any Google account to log in (not just test users).

---

## Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| `redirect_uri_mismatch` | Callback URL in `.env` doesn't match what's registered in Google Cloud | Add the exact URL to Authorized redirect URIs in the Cloud Console |
| `403 access_denied` | User not in test users list | Add the email to test users in OAuth consent screen |
| `No email found in Google profile` | Google account has no email (rare) | User must use a Google account with a verified email |
| `invalid_client` | Wrong `GOOGLE_CLIENT_ID` or `GOOGLE_CLIENT_SECRET` | Double-check the values — no extra spaces or quotes |
| `OAuth strategy not registered` | Missing env vars | Ensure both `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set in `.env` |
| User logs in but gets a new account every time | `oauthLogin` can't match the user | The employee's email in the DB must match their Google account email |
| `This app is blocked` | App in testing with unverified scopes | Add the test user's email to the OAuth consent screen test users list |

---

## Disabling Google OAuth

If you don't want Google login at all, simply leave `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` as the placeholder values (or remove them). The `passport.ts` file checks for their presence before registering the strategy — local email/password login continues to work normally.
