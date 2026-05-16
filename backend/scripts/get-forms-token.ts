/**
 * One-time script to get a Google OAuth2 refresh token for the Forms API.
 * Run: npx tsx scripts/get-forms-token.ts
 *
 * Steps:
 *  1. It prints an auth URL — open it in your browser
 *  2. Sign in with the Google account that will own the forms
 *  3. Paste the code shown in the browser back into this terminal
 *  4. Copy the printed refresh token into your .env as GOOGLE_FORMS_REFRESH_TOKEN
 */

import { google } from 'googleapis';
import * as readline from 'readline';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;

if (!CLIENT_ID || CLIENT_ID === 'your_google_client_id_here') {
  console.error('❌  GOOGLE_CLIENT_ID is not set in .env');
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  'urn:ietf:wg:oauth:2.0:oob'   // lets you paste the code instead of needing a redirect server
);

const SCOPES = [
  'https://www.googleapis.com/auth/forms.body',
  'https://www.googleapis.com/auth/forms.responses.readonly',
  'https://www.googleapis.com/auth/drive.file',
];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  prompt: 'consent',            // forces refresh_token to be returned every time
  scope: SCOPES,
});

console.log('\n─────────────────────────────────────────────────────');
console.log('  Step 1: Open this URL in your browser and sign in');
console.log('─────────────────────────────────────────────────────');
console.log('\n' + authUrl + '\n');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

rl.question('  Step 2: Paste the code from the browser here: ', async (code) => {
  rl.close();
  try {
    const { tokens } = await oauth2Client.getToken(code.trim());

    if (!tokens.refresh_token) {
      console.error('\n❌  No refresh token returned. Make sure you used prompt: consent and the account has not previously authorized this app without revoking access.');
      console.log('    Revoke access at: https://myaccount.google.com/permissions  then run this script again.\n');
      process.exit(1);
    }

    console.log('\n─────────────────────────────────────────────────────');
    console.log('  ✅  Success! Add this to your backend/.env:');
    console.log('─────────────────────────────────────────────────────');
    console.log(`\nGOOGLE_FORMS_REFRESH_TOKEN=${tokens.refresh_token}\n`);
  } catch (err: any) {
    console.error('\n❌  Failed to exchange code:', err.message);
    process.exit(1);
  }
});
