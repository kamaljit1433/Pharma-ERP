/**
 * Auth API Integration Tests
 * 
 * Tests for authentication endpoints including:
 * - User registration
 * - Login/logout
 * - Token refresh
 * - MFA setup and verification
 * - Password reset and change
 * - Profile management
 */

import request from 'supertest';
import express, { Express } from 'express';
import authRoutes from '../../routes/authRoutes';
import { AuthService } from '../../services/authService';
import db from '../../config/knex';
import { v4 as uuidv4 } from 'uuid';

describe('Auth API Integration Tests', () => {
  let app: Express;
  let authService: AuthService;
  let testUserId: string;
  let testEmployeeId: string;
  let accessToken: string;
  let refreshToken: string;

  beforeAll(async () => {
    // Setup Express app
    app = express();
    app.use(express.json());
    app.use('/api/v1/auth', authRoutes);

    authService = new AuthService(db);

    // Clean up test data
    await db('users').where('email', 'like', '%test@example.com%').del();
    await db('employees').where('email', 'like', '%test@example.com%').del();

    // Create test employee
    testEmployeeId = uuidv4();
    await db('employees').insert({
      id: testEmployeeId,
      employee_id: 'EMP-TEST-001',
      first_name: 'Test',
      last_name: 'User',
      email: 'test@example.com',
      phone: '1234567890',
      date_of_joining: '2024-01-01',
      employment_type: 'permanent',
      status: 'active',
    });
  });

  afterAll(async () => {
    // Clean up test data
    await db('users').where('email', 'like', '%test@example.com%').del();
    await db('employees').where('email', 'like', '%test@example.com%').del();
    await db.destroy();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com',
          password: 'SecurePassword123!',
          employeeId: testEmployeeId,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.user.email).toBe('test@example.com');

      testUserId = response.body.user.id;
      accessToken = response.body.accessToken;
      refreshToken = response.body.refreshToken;
    });

    it('should reject registration with duplicate email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com',
          password: 'SecurePassword123!',
          employeeId: testEmployeeId,
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject registration with weak password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'test2@example.com',
          password: 'weak',
          employeeId: testEmployeeId,
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject registration with missing fields', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'test3@example.com',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'SecurePassword123!',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.user.email).toBe('test@example.com');

      accessToken = response.body.accessToken;
      refreshToken = response.body.refreshToken;
    });

    it('should reject login with invalid email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'SecurePassword123!',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject login with invalid password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPassword123!',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject login with missing fields', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('should refresh access token with valid refresh token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({
          refreshToken,
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');

      accessToken = response.body.accessToken;
    });

    it('should reject refresh with invalid token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({
          refreshToken: 'invalid-token',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject refresh with missing token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/v1/auth/profile', () => {
    it('should get user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('test@example.com');
    });

    it('should reject profile request without token', async () => {
      const response = await request(app).get('/api/v1/auth/profile');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject profile request with invalid token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/v1/auth/mfa/setup', () => {
    it('should setup MFA for authenticated user', async () => {
      const response = await request(app)
        .post('/api/v1/auth/mfa/setup')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('secret');
      expect(response.body).toHaveProperty('qrCode');
      expect(response.body).toHaveProperty('backupCodes');
    });

    it('should reject MFA setup without authentication', async () => {
      const response = await request(app).post('/api/v1/auth/mfa/setup');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/v1/auth/password/change', () => {
    it('should change password with valid current password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/password/change')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: 'SecurePassword123!',
          newPassword: 'NewSecurePassword123!',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
    });

    it('should reject password change with invalid current password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/password/change')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: 'WrongPassword123!',
          newPassword: 'NewSecurePassword123!',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject password change without authentication', async () => {
      const response = await request(app)
        .post('/api/v1/auth/password/change')
        .send({
          currentPassword: 'NewSecurePassword123!',
          newPassword: 'AnotherPassword123!',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/v1/auth/password/reset-request', () => {
    it('should send password reset email for valid email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/password/reset-request')
        .send({
          email: 'test@example.com',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
    });

    it('should not reveal if email does not exist', async () => {
      const response = await request(app)
        .post('/api/v1/auth/password/reset-request')
        .send({
          email: 'nonexistent@example.com',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
    });

    it('should reject reset request with missing email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/password/reset-request')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should logout successfully with valid token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
    });

    it('should reject logout without authentication', async () => {
      const response = await request(app).post('/api/v1/auth/logout');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });
});
