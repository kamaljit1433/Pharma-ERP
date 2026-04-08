/**
 * Security Middleware Tests
 * Tests for security headers, CORS, rate limiting, and request validation
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import {
  validateAndSanitizeInput,
  preventCsrf,
  verifyCsrfToken,
  addSecurityHeaders,
  validateRequestSize
} from '../middleware/security';

describe('Security Middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      body: {},
      query: {},
      params: {},
      session: {} as any,
      headers: {},
      method: 'POST',
      path: '/api/test'
    };

    res = {
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    next = jest.fn();
  });

  describe('validateAndSanitizeInput', () => {
    it('should sanitize request body', () => {
      const middleware = validateAndSanitizeInput();
      req.body = {
        name: 'John<script>alert("xss")</script>',
        email: 'john@example.com'
      };

      middleware(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();
      expect(req.body.name).not.toContain('<script>');
    });

    it('should sanitize query parameters', () => {
      const middleware = validateAndSanitizeInput();
      req.query = {
        search: 'test<img src=x onerror="alert(1)">',
        filter: 'active'
      };

      middleware(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();
      expect(req.query.search).not.toContain('onerror');
    });

    it('should sanitize URL parameters', () => {
      const middleware = validateAndSanitizeInput();
      req.params = {
        id: "1'; DROP TABLE users; --"
      };

      middleware(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();
      expect(req.params.id).not.toContain('DROP');
    });

    it('should handle nested objects', () => {
      const middleware = validateAndSanitizeInput();
      req.body = {
        user: {
          name: 'John<script>alert("xss")</script>',
          address: {
            city: 'New York<img src=x>'
          }
        }
      };

      middleware(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();
      expect(req.body.user.name).not.toContain('<script>');
      expect(req.body.user.address.city).not.toContain('<img');
    });

    it('should remove SQL injection attempts', () => {
      const middleware = validateAndSanitizeInput();
      req.body = {
        username: "admin' OR '1'='1",
        password: "password'; DROP TABLE users; --"
      };

      middleware(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();
      expect(req.body.username).not.toContain("'");
      expect(req.body.password).not.toContain('DROP');
    });

    it('should preserve legitimate data', () => {
      const middleware = validateAndSanitizeInput();
      req.body = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1-555-0123'
      };

      middleware(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();
      expect(req.body.name).toBe('John Doe');
      expect(req.body.email).toBe('john@example.com');
    });
  });

  describe('preventCsrf', () => {
    it('should generate CSRF token', () => {
      const middleware = preventCsrf();
      middleware(req as Request, res as Response, next);

      expect(res.setHeader).toHaveBeenCalledWith('X-CSRF-Token', expect.any(String));
      expect(next).toHaveBeenCalled();
    });

    it('should store token in session', () => {
      const middleware = preventCsrf();
      middleware(req as Request, res as Response, next);

      expect(req.session?.csrfToken).toBeDefined();
      expect(typeof req.session?.csrfToken).toBe('string');
    });

    it('should generate different tokens each time', () => {
      const middleware = preventCsrf();
      const tokens = new Set();

      for (let i = 0; i < 5; i++) {
        const newReq = { session: {} } as any;
        const newRes = { setHeader: jest.fn() } as any;
        middleware(newReq, newRes, jest.fn());
        tokens.add(newReq.session.csrfToken);
      }

      expect(tokens.size).toBe(5);
    });
  });

  describe('verifyCsrfToken', () => {
    it('should skip verification for GET requests', () => {
      const middleware = verifyCsrfToken();
      req.method = 'GET';

      middleware(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should skip verification for HEAD requests', () => {
      const middleware = verifyCsrfToken();
      req.method = 'HEAD';

      middleware(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();
    });

    it('should skip verification for OPTIONS requests', () => {
      const middleware = verifyCsrfToken();
      req.method = 'OPTIONS';

      middleware(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();
    });

    it('should verify token for POST requests', () => {
      const middleware = verifyCsrfToken();
      const token = 'test-token-123';
      req.method = 'POST';
      req.headers = { 'x-csrf-token': token };
      req.session = { csrfToken: token };

      middleware(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should reject missing token', () => {
      const middleware = verifyCsrfToken();
      req.method = 'POST';
      req.headers = {};
      req.session = { csrfToken: 'test-token' };

      middleware(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject mismatched token', () => {
      const middleware = verifyCsrfToken();
      req.method = 'POST';
      req.headers = { 'x-csrf-token': 'token-1' };
      req.session = { csrfToken: 'token-2' };

      middleware(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('addSecurityHeaders', () => {
    it('should add X-Frame-Options header', () => {
      const middleware = addSecurityHeaders();
      middleware(req as Request, res as Response, next);

      expect(res.setHeader).toHaveBeenCalledWith('X-Frame-Options', 'DENY');
      expect(next).toHaveBeenCalled();
    });

    it('should add X-Content-Type-Options header', () => {
      const middleware = addSecurityHeaders();
      middleware(req as Request, res as Response, next);

      expect(res.setHeader).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff');
    });

    it('should add X-XSS-Protection header', () => {
      const middleware = addSecurityHeaders();
      middleware(req as Request, res as Response, next);

      expect(res.setHeader).toHaveBeenCalledWith('X-XSS-Protection', '1; mode=block');
    });

    it('should add Referrer-Policy header', () => {
      const middleware = addSecurityHeaders();
      middleware(req as Request, res as Response, next);

      expect(res.setHeader).toHaveBeenCalledWith(
        'Referrer-Policy',
        'strict-origin-when-cross-origin'
      );
    });

    it('should add Permissions-Policy header', () => {
      const middleware = addSecurityHeaders();
      middleware(req as Request, res as Response, next);

      expect(res.setHeader).toHaveBeenCalledWith(
        'Permissions-Policy',
        expect.stringContaining('geolocation=()')
      );
    });
  });

  describe('validateRequestSize', () => {
    it('should allow requests within size limit', () => {
      const middleware = validateRequestSize('10mb');
      req.headers = { 'content-length': '5242880' }; // 5MB

      middleware(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should reject requests exceeding size limit', () => {
      const middleware = validateRequestSize('10mb');
      req.headers = { 'content-length': '20971520' }; // 20MB

      middleware(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(413);
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle missing content-length header', () => {
      const middleware = validateRequestSize('10mb');
      req.headers = {};

      middleware(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();
    });

    it('should support different size units', () => {
      const middleware = validateRequestSize('5mb');
      req.headers = { 'content-length': '4194304' }; // 4MB

      middleware(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('Security Headers Compliance', () => {
    it('should prevent clickjacking attacks', () => {
      const middleware = addSecurityHeaders();
      middleware(req as Request, res as Response, next);

      expect(res.setHeader).toHaveBeenCalledWith('X-Frame-Options', 'DENY');
    });

    it('should prevent MIME type sniffing', () => {
      const middleware = addSecurityHeaders();
      middleware(req as Request, res as Response, next);

      expect(res.setHeader).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff');
    });

    it('should enable XSS protection', () => {
      const middleware = addSecurityHeaders();
      middleware(req as Request, res as Response, next);

      expect(res.setHeader).toHaveBeenCalledWith('X-XSS-Protection', '1; mode=block');
    });

    it('should restrict permissions', () => {
      const middleware = addSecurityHeaders();
      middleware(req as Request, res as Response, next);

      const call = (res.setHeader as jest.Mock).mock.calls.find(
        c => c[0] === 'Permissions-Policy'
      );
      expect(call).toBeDefined();
      expect(call[1]).toContain('geolocation=()');
      expect(call[1]).toContain('microphone=()');
      expect(call[1]).toContain('camera=()');
    });
  });

  describe('Input Sanitization Security', () => {
    it('should prevent XSS attacks', () => {
      const middleware = validateAndSanitizeInput();
      req.body = {
        comment: '<img src=x onerror="alert(\'XSS\')">'
      };

      middleware(req as Request, res as Response, next);

      expect(req.body.comment).not.toContain('onerror');
    });

    it('should prevent SQL injection', () => {
      const middleware = validateAndSanitizeInput();
      req.body = {
        username: "admin' OR '1'='1"
      };

      middleware(req as Request, res as Response, next);

      expect(req.body.username).not.toContain("'");
    });

    it('should prevent command injection', () => {
      const middleware = validateAndSanitizeInput();
      req.body = {
        filename: 'file.txt; rm -rf /'
      };

      middleware(req as Request, res as Response, next);

      expect(req.body.filename).not.toContain(';');
    });
  });
});
