/**
 * Security Middleware
 * Implements security headers, CORS, rate limiting, and request validation
 */

import helmet from 'helmet';
import cors from 'cors';
import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

/**
 * Configure Helmet for security headers
 */
export function configureHelmet() {
  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", process.env.CORS_ORIGIN || 'http://localhost:5173'],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"]
      }
    },
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true
    },
    frameguard: {
      action: 'deny'
    },
    noSniff: true,
    xssFilter: true,
    referrerPolicy: {
      policy: 'strict-origin-when-cross-origin'
    }
  });
}

/**
 * Configure CORS
 */
export function configureCors() {
  const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',');

  return cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400 // 24 hours
  });
}

/**
 * Rate limiting for general API endpoints
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health';
  }
});

/**
 * Rate limiting for login endpoint
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 login attempts per windowMs
  message: 'Too many login attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true // Don't count successful logins
});

/**
 * Rate limiting for password reset endpoint
 */
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 password reset attempts per hour
  message: 'Too many password reset attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Rate limiting for sensitive operations (payroll, etc.)
 */
export const sensitiveOperationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: 'Too many sensitive operations, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Middleware to validate and sanitize request input
 */
export function validateAndSanitizeInput() {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Sanitize request body
      if (req.body && typeof req.body === 'object') {
        sanitizeObject(req.body);
      }

      // Sanitize query parameters
      if (req.query && typeof req.query === 'object') {
        sanitizeObject(req.query);
      }

      // Sanitize URL parameters
      if (req.params && typeof req.params === 'object') {
        sanitizeObject(req.params);
      }

      next();
    } catch (error) {
      res.status(400).json({
        error: {
          code: 'INVALID_INPUT',
          message: 'Invalid input data'
        }
      });
    }
  };
}

/**
 * Sanitize object by removing potentially dangerous characters
 */
function sanitizeObject(obj: any): void {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];

      if (typeof value === 'string') {
        // Remove potentially dangerous characters
        obj[key] = sanitizeString(value);
      } else if (typeof value === 'object' && value !== null) {
        sanitizeObject(value);
      }
    }
  }
}

/**
 * Sanitize string by removing potentially dangerous characters
 */
function sanitizeString(str: string): string {
  // Remove script tags and event handlers
  let sanitized = str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=\s*[^\s>]*/gi, '');

  // Remove SQL injection attempts
  sanitized = sanitized.replace(/('|(\\x27)|(\\'))/g, '');
  sanitized = sanitized.replace(/(--|;|\/\*|\*\/)/g, '');

  return sanitized;
}

/**
 * Middleware to prevent CSRF attacks
 */
export function preventCsrf() {
  return (req: Request, res: Response, next: NextFunction) => {
    // Add CSRF token to response headers
    const token = require('crypto').randomBytes(32).toString('hex');
    res.setHeader('X-CSRF-Token', token);

    // Store token in session for verification
    if (req.session) {
      req.session.csrfToken = token;
    }

    next();
  };
}

/**
 * Middleware to verify CSRF token
 */
export function verifyCsrfToken() {
  return (req: Request, res: Response, next: NextFunction) => {
    // Skip CSRF verification for GET requests
    if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
      return next();
    }

    const token = req.headers['x-csrf-token'] as string;
    const sessionToken = req.session?.csrfToken;

    if (!token || !sessionToken || token !== sessionToken) {
      return res.status(403).json({
        error: {
          code: 'CSRF_TOKEN_INVALID',
          message: 'CSRF token validation failed'
        }
      });
    }

    next();
  };
}

/**
 * Middleware to add security headers
 */
export function addSecurityHeaders() {
  return (req: Request, res: Response, next: NextFunction) => {
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');

    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Enable XSS protection
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // Referrer policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Permissions policy
    res.setHeader(
      'Permissions-Policy',
      'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()'
    );

    next();
  };
}

/**
 * Middleware to log security events
 */
export function logSecurityEvents() {
  return (req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.send;

    res.send = function(data: any) {
      // Log failed authentication attempts
      if (res.statusCode === 401 || res.statusCode === 403) {
        console.warn(`Security event: ${res.statusCode} ${req.method} ${req.path} from ${req.ip}`);
      }

      return originalSend.call(this, data);
    };

    next();
  };
}

/**
 * Middleware to enforce HTTPS in production
 */
export function enforceHttps() {
  return (req: Request, res: Response, next: NextFunction) => {
    if (process.env.NODE_ENV === 'production' && req.protocol !== 'https') {
      return res.status(403).json({
        error: {
          code: 'HTTPS_REQUIRED',
          message: 'HTTPS is required'
        }
      });
    }

    next();
  };
}

/**
 * Middleware to validate request size
 */
export function validateRequestSize(maxSize: string = '10mb') {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);
    const maxBytes = parseSize(maxSize);

    if (contentLength > maxBytes) {
      return res.status(413).json({
        error: {
          code: 'PAYLOAD_TOO_LARGE',
          message: `Request size exceeds maximum of ${maxSize}`
        }
      });
    }

    next();
  };
}

/**
 * Parse size string to bytes
 */
function parseSize(size: string): number {
  const units: Record<string, number> = {
    b: 1,
    kb: 1024,
    mb: 1024 * 1024,
    gb: 1024 * 1024 * 1024
  };

  const match = size.toLowerCase().match(/^(\d+)(b|kb|mb|gb)?$/);
  if (!match) {
    return 10 * 1024 * 1024; // Default 10MB
  }

  const value = parseInt(match[1], 10);
  const unit = match[2] || 'b';

  return value * (units[unit] || 1);
}
