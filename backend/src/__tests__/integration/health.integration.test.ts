/**
 * Health Check API Integration Tests
 * 
 * Tests for health check endpoints including:
 * - Basic health check
 * - Resilience metrics
 * - Service-specific metrics
 * - Detailed health status
 */

import request from 'supertest';
import express, { Express } from 'express';
import healthRoutes from '../../routes/health';

describe('Health Check API Integration Tests', () => {
  let app: Express;

  beforeAll(() => {
    // Setup Express app
    app = express();
    app.use(express.json());
    app.use('/health', healthRoutes);
  });

  describe('GET /health', () => {
    it('should return basic health status', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body.status).toBe('healthy');
    });

    it('should include uptime information', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('uptime');
      expect(typeof response.body.uptime).toBe('number');
      expect(response.body.uptime).toBeGreaterThan(0);
    });

    it('should respond quickly (< 100ms)', async () => {
      const startTime = Date.now();
      const response = await request(app).get('/health');
      const endTime = Date.now();

      expect(response.status).toBe(200);
      expect(endTime - startTime).toBeLessThan(100);
    });
  });

  describe('GET /health/resilience', () => {
    it('should return resilience metrics for all services', async () => {
      const response = await request(app).get('/health/resilience');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('metrics');
      expect(typeof response.body.metrics).toBe('object');
    });

    it('should include circuit breaker states', async () => {
      const response = await request(app).get('/health/resilience');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('metrics');
      
      // Check if metrics contain circuit breaker information
      const metrics = response.body.metrics;
      if (Object.keys(metrics).length > 0) {
        const firstService = Object.values(metrics)[0] as any;
        expect(firstService).toHaveProperty('circuitBreaker');
      }
    });

    it('should include retry statistics', async () => {
      const response = await request(app).get('/health/resilience');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('metrics');
      
      const metrics = response.body.metrics;
      if (Object.keys(metrics).length > 0) {
        const firstService = Object.values(metrics)[0] as any;
        expect(firstService).toHaveProperty('retries');
      }
    });

    it('should include timeout information', async () => {
      const response = await request(app).get('/health/resilience');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('metrics');
      
      const metrics = response.body.metrics;
      if (Object.keys(metrics).length > 0) {
        const firstService = Object.values(metrics)[0] as any;
        expect(firstService).toHaveProperty('timeouts');
      }
    });
  });

  describe('GET /health/resilience/:serviceName', () => {
    it('should return metrics for specific service', async () => {
      const serviceName = 'email';
      const response = await request(app).get(`/health/resilience/${serviceName}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('service');
      expect(response.body.service).toBe(serviceName);
      expect(response.body).toHaveProperty('metrics');
    });

    it('should include detailed circuit breaker state', async () => {
      const serviceName = 'email';
      const response = await request(app).get(`/health/resilience/${serviceName}`);

      expect(response.status).toBe(200);
      expect(response.body.metrics).toHaveProperty('circuitBreaker');
      
      const circuitBreaker = response.body.metrics.circuitBreaker;
      expect(circuitBreaker).toHaveProperty('state');
      expect(['closed', 'open', 'half-open']).toContain(circuitBreaker.state);
    });

    it('should include retry attempt counts', async () => {
      const serviceName = 'email';
      const response = await request(app).get(`/health/resilience/${serviceName}`);

      expect(response.status).toBe(200);
      expect(response.body.metrics).toHaveProperty('retries');
      
      const retries = response.body.metrics.retries;
      expect(retries).toHaveProperty('totalAttempts');
      expect(retries).toHaveProperty('successfulRetries');
      expect(retries).toHaveProperty('failedRetries');
    });

    it('should include timeout statistics', async () => {
      const serviceName = 'email';
      const response = await request(app).get(`/health/resilience/${serviceName}`);

      expect(response.status).toBe(200);
      expect(response.body.metrics).toHaveProperty('timeouts');
      
      const timeouts = response.body.metrics.timeouts;
      expect(timeouts).toHaveProperty('count');
      expect(timeouts).toHaveProperty('threshold');
    });

    it('should return 404 for non-existent service', async () => {
      const response = await request(app).get('/health/resilience/nonexistent-service');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });

    it('should handle service names with special characters', async () => {
      const response = await request(app).get('/health/resilience/service-with-dashes');

      // Should either return 200 with metrics or 404 if service doesn't exist
      expect([200, 404]).toContain(response.status);
    });
  });

  describe('GET /health/detailed', () => {
    it('should return comprehensive health information', async () => {
      const response = await request(app).get('/health/detailed');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('services');
    });

    it('should include database health status', async () => {
      const response = await request(app).get('/health/detailed');

      expect(response.status).toBe(200);
      expect(response.body.services).toHaveProperty('database');
      
      const database = response.body.services.database;
      expect(database).toHaveProperty('status');
      expect(['healthy', 'unhealthy', 'degraded']).toContain(database.status);
    });

    it('should include Redis health status', async () => {
      const response = await request(app).get('/health/detailed');

      expect(response.status).toBe(200);
      expect(response.body.services).toHaveProperty('redis');
      
      const redis = response.body.services.redis;
      expect(redis).toHaveProperty('status');
      expect(['healthy', 'unhealthy', 'degraded']).toContain(redis.status);
    });

    it('should include external service health', async () => {
      const response = await request(app).get('/health/detailed');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('services');
      
      // Check for at least one external service
      const services = response.body.services;
      expect(Object.keys(services).length).toBeGreaterThan(0);
    });

    it('should include memory usage information', async () => {
      const response = await request(app).get('/health/detailed');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('system');
      expect(response.body.system).toHaveProperty('memory');
      
      const memory = response.body.system.memory;
      expect(memory).toHaveProperty('used');
      expect(memory).toHaveProperty('total');
      expect(memory).toHaveProperty('percentage');
    });

    it('should include CPU usage information', async () => {
      const response = await request(app).get('/health/detailed');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('system');
      expect(response.body.system).toHaveProperty('cpu');
      
      const cpu = response.body.system.cpu;
      expect(cpu).toHaveProperty('usage');
      expect(typeof cpu.usage).toBe('number');
    });

    it('should include version information', async () => {
      const response = await request(app).get('/health/detailed');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('version');
      expect(typeof response.body.version).toBe('string');
    });

    it('should respond within acceptable time (< 500ms)', async () => {
      const startTime = Date.now();
      const response = await request(app).get('/health/detailed');
      const endTime = Date.now();

      expect(response.status).toBe(200);
      expect(endTime - startTime).toBeLessThan(500);
    });
  });

  describe('Health Check Error Scenarios', () => {
    it('should handle invalid routes gracefully', async () => {
      const response = await request(app).get('/health/invalid-endpoint');

      expect(response.status).toBe(404);
    });

    it('should return proper content-type headers', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('application/json');
    });

    it('should not expose sensitive information', async () => {
      const response = await request(app).get('/health/detailed');

      expect(response.status).toBe(200);
      
      // Ensure no sensitive data is exposed
      const responseText = JSON.stringify(response.body);
      expect(responseText).not.toContain('password');
      expect(responseText).not.toContain('secret');
      expect(responseText).not.toContain('token');
      expect(responseText).not.toContain('api_key');
    });
  });

  describe('Health Check Performance', () => {
    it('should handle multiple concurrent requests', async () => {
      const requests = Array(10).fill(null).map(() => 
        request(app).get('/health')
      );

      const responses = await Promise.all(requests);

      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('status');
      });
    });

    it('should maintain consistent response format', async () => {
      const response1 = await request(app).get('/health');
      const response2 = await request(app).get('/health');

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
      
      // Check that both responses have the same structure
      expect(Object.keys(response1.body).sort()).toEqual(
        Object.keys(response2.body).sort()
      );
    });
  });
});
