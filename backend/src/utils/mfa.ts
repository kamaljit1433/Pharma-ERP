import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import crypto from 'crypto';
import { MFASetup } from '../types/auth';

/**
 * Generate MFA secret and QR code for user
 */
export const generateMFASecret = async (
  email: string,
  issuer: string = 'Employee Management System'
): Promise<MFASetup> => {
  // Generate secret
  const secret = speakeasy.generateSecret({
    name: `${issuer} (${email})`,
    issuer,
    length: 32,
  });

  if (!secret.otpauth_url) {
    throw new Error('Failed to generate OTP auth URL');
  }

  // Generate QR code
  const qrCode = await qrcode.toDataURL(secret.otpauth_url);

  // Generate backup codes
  const backupCodes = generateBackupCodes(8);

  return {
    secret: secret.base32,
    qrCode,
    backupCodes,
  };
};

/**
 * Verify TOTP token
 */
export const verifyMFAToken = (token: string, secret: string): boolean => {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 2, // Allow 2 time steps before and after current time
  });
};

/**
 * Generate backup codes for MFA
 */
export const generateBackupCodes = (count: number = 8): string[] => {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    codes.push(code);
  }
  return codes;
};

/**
 * Hash backup code for storage
 */
export const hashBackupCode = (code: string): string => {
  return crypto.createHash('sha256').update(code).digest('hex');
};

/**
 * Verify backup code against hash
 */
export const verifyBackupCode = (code: string, hash: string): boolean => {
  const codeHash = hashBackupCode(code);
  return codeHash === hash;
};

/**
 * Generate current TOTP token (for testing)
 */
export const generateCurrentToken = (secret: string): string => {
  return speakeasy.totp({
    secret,
    encoding: 'base32',
  });
};
