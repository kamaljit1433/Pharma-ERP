/**
 * Encryption Utilities
 * AES-256 encryption for sensitive data
 */

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const ENCODING = 'hex';
const AUTH_TAG_LENGTH = 16;
const IV_LENGTH = 12;

/**
 * Get encryption key from environment
 */
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is not set');
  }

  // Key should be 32 bytes (256 bits) for AES-256
  if (key.length !== 64) {
    throw new Error('ENCRYPTION_KEY must be 64 hex characters (32 bytes)');
  }

  return Buffer.from(key, 'hex');
}

/**
 * Encrypt data using AES-256-GCM
 */
export function encrypt(plaintext: string): string {
  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(plaintext, 'utf8', ENCODING);
    encrypted += cipher.final(ENCODING);

    const authTag = cipher.getAuthTag();

    // Combine IV + authTag + encrypted data
    const combined = iv.toString(ENCODING) + ':' + authTag.toString(ENCODING) + ':' + encrypted;

    return combined;
  } catch (error) {
    throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Decrypt data using AES-256-GCM
 */
export function decrypt(encryptedData: string): string {
  try {
    const key = getEncryptionKey();
    const parts = encryptedData.split(':');

    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }

    const iv = Buffer.from(parts[0] as string, ENCODING as import('crypto').Encoding);
    const authTag = Buffer.from(parts[1] as string, ENCODING as import('crypto').Encoding);
    const encrypted = parts[2] as string;

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, ENCODING, 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Hash data using SHA-256
 */
export function hash(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Generate a random encryption key (for setup)
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Mask sensitive data (show only last N characters)
 */
export function maskSensitiveData(data: string, showLastN: number = 4): string {
  if (data.length <= showLastN) {
    return '*'.repeat(data.length);
  }

  const masked = '*'.repeat(data.length - showLastN);
  return masked + data.slice(-showLastN);
}

/**
 * Mask bank account number
 */
export function maskBankAccountNumber(accountNumber: string): string {
  return maskSensitiveData(accountNumber, 4);
}

/**
 * Validate encryption key format
 */
export function isValidEncryptionKey(key: string): boolean {
  // Should be 64 hex characters (32 bytes)
  return /^[a-f0-9]{64}$/i.test(key);
}

/**
 * Encrypt object (converts to JSON first)
 */
export function encryptObject(obj: any): string {
  const json = JSON.stringify(obj);
  return encrypt(json);
}

/**
 * Decrypt object (parses JSON after decryption)
 */
export function decryptObject(encryptedData: string): any {
  const json = decrypt(encryptedData);
  return JSON.parse(json);
}

/**
 * Encrypt array of values
 */
export function encryptArray(values: string[]): string[] {
  return values.map(value => encrypt(value));
}

/**
 * Decrypt array of values
 */
export function decryptArray(encryptedValues: string[]): string[] {
  return encryptedValues.map(value => decrypt(value));
}
