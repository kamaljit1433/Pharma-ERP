/**
 * Email API Integration Tests
 * 
 * Tests for email service endpoints including:
 * - Email sending
 * - Template management
 * - Email status tracking
 * - Bulk email operations
 */

import request from 'supertest';
import express, { Express } from 'express';
import emailRoutes from '../../routes/emailRoutes';
import { generateTokenPair } from '../../utils/jwt';
import { v4 as uuidv4 } from 'uuid';

describe('Email API Integration Tests', () => {
  let app: Express;
  let adminToken: string;
  let employeeToken: string;

  beforeAll(() => {
    // Setup Express app
    app = express();
    app.use(express.json());
    app.use('/api/v1/email', emailRoutes);

    // Generate tokens
    const adminTokens = generateTokenPair({
      userId: uuidv4(),
      employeeId: uuidv4(),
      email: 'admin@example.com',
      role: 'admin',
    });
    adminToken = adminTokens.accessToken;

    const empTokens = generateTokenPair({
      userId: uuidv4(),
      employeeId: uuidv4(),
      email: 'employee@example.com',
      role: 'employee',
    });
    employeeToken = empTokens.accessToken;
  });

  describe('POST /api/v1/email/send', () => {
    it('should send a simple email', async () => {
      const response = await request(app)
        .post('/api/v1/email/send')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          to: 'test@example.com',
          subject: 'Test Email',
          text: 'This is a test email',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('messageId');
      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('sent');
    });

    it('should send an HTML email', async () => {
      const response = await request(app)
        .post('/api/v1/email/send')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          to: 'test@example.com',
          subject: 'HTML Test Email',
          html: '<h1>Test Email</h1><p>This is a test email</p>',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('messageId');
    });

    it('should send email with attachments', async () => {
      const response = await request(app)
        .post('/api/v1/email/send')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          to: 'test@example.com',
          subject: 'Email with Attachment',
          text: 'Please find the attachment',
          attachments: [
            {
              filename: 'test.txt',
              content: 'Test file content',
            },
          ],
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('messageId');
    });

    it('should reject email without authentication', async () => {
      const response = await request(app)
        .post('/api/v1/email/send')
        .send({
          to: 'test@example.com',
          subject: 'Test Email',
          text: 'This is a test email',
        });

      expect(response.status).toBe(401);
    });

    it('should reject email with invalid recipient', async () => {
      const response = await request(app)
        .post('/api/v1/email/send')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          to: 'invalid-email',
          subject: 'Test Email',
          text: 'This is a test email',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject email with missing required fields', async () => {
      const response = await request(app)
        .post('/api/v1/email/send')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          to: 'test@example.com',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/v1/email/send-template', () => {
    it('should send email using template', async () => {
      const response = await request(app)
        .post('/api/v1/email/send-template')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          to: 'test@example.com',
          templateName: 'welcome',
          templateData: {
            name: 'John Doe',
            companyName: 'Test Company',
          },
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('messageId');
    });

    it('should reject template email with non-existent template', async () => {
      const response = await request(app)
        .post('/api/v1/email/send-template')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          to: 'test@example.com',
          templateName: 'non-existent-template',
          templateData: {},
        });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject template email with missing template data', async () => {
      const response = await request(app)
        .post('/api/v1/email/send-template')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          to: 'test@example.com',
          templateName: 'welcome',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/v1/email/send-bulk', () => {
    it('should send bulk emails', async () => {
      const response = await request(app)
        .post('/api/v1/email/send-bulk')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          recipients: [
            'test1@example.com',
            'test2@example.com',
            'test3@example.com',
          ],
          subject: 'Bulk Test Email',
          text: 'This is a bulk test email',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('results');
      expect(Array.isArray(response.body.results)).toBe(true);
      expect(response.body.results.length).toBe(3);
    });

    it('should handle partial failures in bulk send', async () => {
      const response = await request(app)
        .post('/api/v1/email/send-bulk')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          recipients: [
            'valid@example.com',
            'invalid-email',
            'another-valid@example.com',
          ],
          subject: 'Bulk Test Email',
          text: 'This is a bulk test email',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('results');
      expect(response.body).toHaveProperty('summary');
      expect(response.body.summary).toHaveProperty('successful');
      expect(response.body.summary).toHaveProperty('failed');
    });

    it('should reject bulk email without admin role', async () => {
      const response = await request(app)
        .post('/api/v1/email/send-bulk')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          recipients: ['test@example.com'],
          subject: 'Bulk Test Email',
          text: 'This is a bulk test email',
        });

      expect(response.status).toBe(403);
    });

    it('should reject bulk email with empty recipients', async () => {
      const response = await request(app)
        .post('/api/v1/email/send-bulk')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          recipients: [],
          subject: 'Bulk Test Email',
          text: 'This is a bulk test email',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/v1/email/status/:messageId', () => {
    let messageId: string;

    beforeAll(async () => {
      // Send an email to get a message ID
      const response = await request(app)
        .post('/api/v1/email/send')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          to: 'test@example.com',
          subject: 'Status Test Email',
          text: 'This is a test email for status tracking',
        });

      messageId = response.body.messageId;
    });

    it('should retrieve email status', async () => {
      const response = await request(app)
        .get(`/api/v1/email/status/${messageId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('messageId');
      expect(response.body).toHaveProperty('status');
      expect(['sent', 'delivered', 'failed', 'pending']).toContain(
        response.body.status
      );
    });

    it('should return 404 for non-existent message ID', async () => {
      const response = await request(app)
        .get(`/api/v1/email/status/${uuidv4()}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject status request without authentication', async () => {
      const response = await request(app).get(
        `/api/v1/email/status/${messageId}`
      );

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/v1/email/templates', () => {
    it('should list all available email templates', async () => {
      const response = await request(app)
        .get('/api/v1/email/templates')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should include template metadata', async () => {
      const response = await request(app)
        .get('/api/v1/email/templates')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      
      if (response.body.length > 0) {
        const template = response.body[0];
        expect(template).toHaveProperty('name');
        expect(template).toHaveProperty('description');
        expect(template).toHaveProperty('requiredFields');
      }
    });

    it('should reject template list request without authentication', async () => {
      const response = await request(app).get('/api/v1/email/templates');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/v1/email/templates/:name', () => {
    it('should retrieve specific template details', async () => {
      const response = await request(app)
        .get('/api/v1/email/templates/welcome')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('subject');
      expect(response.body).toHaveProperty('content');
    });

    it('should return 404 for non-existent template', async () => {
      const response = await request(app)
        .get('/api/v1/email/templates/non-existent')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/v1/email/test', () => {
    it('should send test email to verify configuration', async () => {
      const response = await request(app)
        .post('/api/v1/email/test')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          to: 'test@example.com',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('messageId');
    });

    it('should reject test email without admin role', async () => {
      const response = await request(app)
        .post('/api/v1/email/test')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          to: 'test@example.com',
        });

      expect(response.status).toBe(403);
    });

    it('should reject test email with invalid recipient', async () => {
      const response = await request(app)
        .post('/api/v1/email/test')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          to: 'invalid-email',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Email Service Error Handling', () => {
    it('should handle provider failures gracefully', async () => {
      // This test assumes the email service has fallback mechanisms
      const response = await request(app)
        .post('/api/v1/email/send')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          to: 'test@example.com',
          subject: 'Error Test Email',
          text: 'Testing error handling',
        });

      // Should either succeed or return a proper error
      expect([200, 500, 503]).toContain(response.status);
      
      if (response.status !== 200) {
        expect(response.body).toHaveProperty('error');
      }
    });

    it('should validate email addresses properly', async () => {
      const invalidEmails = [
        'invalid',
        '@example.com',
        'test@',
        'test @example.com',
        'test@example',
      ];

      for (const email of invalidEmails) {
        const response = await request(app)
          .post('/api/v1/email/send')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            to: email,
            subject: 'Test',
            text: 'Test',
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
      }
    });

    it('should handle rate limiting', async () => {
      // Send multiple emails rapidly
      const requests = Array(20).fill(null).map(() =>
        request(app)
          .post('/api/v1/email/send')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            to: 'test@example.com',
            subject: 'Rate Limit Test',
            text: 'Testing rate limiting',
          })
      );

      const responses = await Promise.all(requests);

      // Some requests should succeed, some might be rate limited
      const statusCodes = responses.map(r => r.status);
      expect(statusCodes).toContain(200);
      
      // Check if any were rate limited (429)
      const rateLimited = statusCodes.filter(code => code === 429);
      if (rateLimited.length > 0) {
        expect(rateLimited.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Email Performance', () => {
    it('should send email within acceptable time (< 2s)', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .post('/api/v1/email/send')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          to: 'test@example.com',
          subject: 'Performance Test',
          text: 'Testing email send performance',
        });

      const endTime = Date.now();

      expect(response.status).toBe(200);
      expect(endTime - startTime).toBeLessThan(2000);
    });

    it('should handle concurrent email sends', async () => {
      const requests = Array(5).fill(null).map((_, index) =>
        request(app)
          .post('/api/v1/email/send')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            to: `test${index}@example.com`,
            subject: `Concurrent Test ${index}`,
            text: 'Testing concurrent email sends',
          })
      );

      const responses = await Promise.all(requests);

      responses.forEach(response => {
        expect([200, 429]).toContain(response.status);
      });
    });
  });
});
