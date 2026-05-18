import bcrypt from 'bcrypt';
import crypto from 'crypto';

const SALT_ROUNDS = 12;

/**
 * Hash a password using bcrypt
 */
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Compare a plain text password with a hashed password
 */
export const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

/**
 * Generate a cryptographically secure random password that meets all strength requirements.
 * Uses unambiguous characters (no 0/O/1/l/I) to make it easy to read and type.
 */
export const generatePassword = (): string => {
  const upper   = 'ABCDEFGHJKMNPQRSTUVWXYZ';
  const lower   = 'abcdefghjkmnpqrstuvwxyz';
  const digits  = '23456789';
  const special = '!@#$%^&*';
  const all     = upper + lower + digits + special;

  const pick = (pool: string) => pool[crypto.randomInt(pool.length)]!;

  // Guarantee at least 2 chars from each required class (12-char password total)
  const chars = [
    pick(upper),  pick(upper),
    pick(lower),  pick(lower),
    pick(digits), pick(digits),
    pick(special),pick(special),
    pick(all),    pick(all),
    pick(all),    pick(all),
  ];

  // Fisher-Yates shuffle
  for (let i = chars.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j]!, chars[i]!];
  }

  return chars.join('');
};

/**
 * Validate password strength
 * Requirements:
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
export const validatePasswordStrength = (password: string): {
  valid: boolean;
  errors: string[];
  isStrong: boolean;
  score: number;
  feedback: string;
} => {
  const errors: string[] = [];
  let score = 0;

  // Length check
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  } else {
    score += 1;
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;
  }

  // Uppercase check
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  } else {
    score += 1;
  }

  // Lowercase check
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  } else {
    score += 1;
  }

  // Number check
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  } else {
    score += 1;
  }

  // Special character check
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  } else {
    score += 1;
  }

  const isStrong = errors.length === 0 && score >= 5;
  const feedback = errors.join(', ');

  return {
    valid: errors.length === 0,
    errors,
    isStrong,
    score,
    feedback,
  };
};
