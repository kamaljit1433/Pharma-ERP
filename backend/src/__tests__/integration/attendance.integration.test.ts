/**
 * Integration Tests for Attendance API Endpoints
 */

import request from 'supertest';
import { Express } from 'express';

describe('Attendance API Integration Tests', () => {
  let app: Express;

  beforeAll(() => {
    // In a real implementation, this would initialize the Express app
    // For now, we'll create a mock app
    const express = require('express');
    app = express();
    app.use(express.json());

    // Import and use attendance routes
    const attendanceRoutes = require('../../routes/attendance').default;
    app.use('/api/v1/attendance', attendanceRoutes);
  });

  const mockLocation = {
    latitude: 40.7128,
    longitude: -74.006,
    accuracy: 10,
    timestamp: new Date().toISOString(),
  };

  describe('POST /api/v1/attendance/check-in', () => {
    it('should mark check-in successfully', async () => {
      const response = await request(app)
        .post('/api/v1/attendance/check-in')
        .send({
          employeeId: 'emp-123',
          location: mockLocation,
          faceDetected: true,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.employeeId).toBe('emp-123');
      expect(response.body.data.faceDetected).toBe(true);
    });

    it('should reject check-in without employee ID', async () => {
      const response = await request(app)
        .post('/api/v1/attendance/check-in')
        .send({
          location: mockLocation,
          faceDetected: true,
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBe('MISSING_EMPLOYEE_ID');
    });

    it('should reject check-in without location', async () => {
      const response = await request(app)
        .post('/api/v1/attendance/check-in')
        .send({
          employeeId: 'emp-123',
          faceDetected: true,
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('MISSING_LOCATION');
    });

    it('should reject check-in without face detection', async () => {
      const response = await request(app)
        .post('/api/v1/attendance/check-in')
        .send({
          employeeId: 'emp-123',
          location: mockLocation,
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('MISSING_FACE_DETECTION');
    });

    it('should reject check-in with face detection false', async () => {
      const response = await request(app)
        .post('/api/v1/attendance/check-in')
        .send({
          employeeId: 'emp-123',
          location: mockLocation,
          faceDetected: false,
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('CHECK_IN_FAILED');
    });
  });

  describe('POST /api/v1/attendance/check-out', () => {
    it('should mark check-out successfully', async () => {
      const response = await request(app)
        .post('/api/v1/attendance/check-out')
        .send({
          attendanceId: 'att-123',
          location: mockLocation,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.checkOutTime).toBeDefined();
    });

    it('should reject check-out without attendance ID', async () => {
      const response = await request(app)
        .post('/api/v1/attendance/check-out')
        .send({
          location: mockLocation,
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('MISSING_ATTENDANCE_ID');
    });

    it('should reject check-out without location', async () => {
      const response = await request(app)
        .post('/api/v1/attendance/check-out')
        .send({
          attendanceId: 'att-123',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('MISSING_LOCATION');
    });
  });

  describe('GET /api/v1/attendance/monthly/:employeeId', () => {
    it('should get monthly attendance', async () => {
      const response = await request(app)
        .get('/api/v1/attendance/monthly/emp-123')
        .query({ month: 1, year: 2024 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should reject without month and year', async () => {
      const response = await request(app)
        .get('/api/v1/attendance/monthly/emp-123');

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('MISSING_PERIOD');
    });

    it('should reject invalid month', async () => {
      const response = await request(app)
        .get('/api/v1/attendance/monthly/emp-123')
        .query({ month: 13, year: 2024 });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('INVALID_MONTH');
    });
  });

  describe('POST /api/v1/attendance/regularization', () => {
    it('should create regularization request', async () => {
      const response = await request(app)
        .post('/api/v1/attendance/regularization')
        .send({
          attendanceId: 'att-123',
          employeeId: 'emp-123',
          reason: 'System error during check-out',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.status).toBe('Pending');
    });

    it('should reject without required fields', async () => {
      const response = await request(app)
        .post('/api/v1/attendance/regularization')
        .send({
          attendanceId: 'att-123',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('MISSING_FIELDS');
    });
  });

  describe('PUT /api/v1/attendance/regularization/:id/approve', () => {
    it('should approve regularization request', async () => {
      const response = await request(app)
        .put('/api/v1/attendance/regularization/req-123/approve')
        .send({
          approverId: 'mgr-123',
          comments: 'Approved',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('Approved');
    });

    it('should reject without approver ID', async () => {
      const response = await request(app)
        .put('/api/v1/attendance/regularization/req-123/approve')
        .send({
          comments: 'Approved',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('MISSING_FIELDS');
    });
  });

  describe('GET /api/v1/shifts', () => {
    it('should get all shifts', async () => {
      const response = await request(app)
        .get('/api/v1/attendance/shifts');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('POST /api/v1/shifts', () => {
    it('should create a new shift', async () => {
      const response = await request(app)
        .post('/api/v1/attendance/shifts')
        .send({
          name: 'Morning Shift',
          startTime: '09:00',
          endTime: '17:00',
          breakDuration: 60,
          type: 'Fixed',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.name).toBe('Morning Shift');
    });

    it('should reject without required fields', async () => {
      const response = await request(app)
        .post('/api/v1/attendance/shifts')
        .send({
          name: 'Morning Shift',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('MISSING_FIELDS');
    });
  });
});
