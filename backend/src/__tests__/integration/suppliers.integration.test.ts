import request from 'supertest';
import app from '../../index';
import { createTestHelpers } from '../utils/test-helpers';

describe('Suppliers API Integration Tests', () => {
  const helpers = createTestHelpers();
  let authToken: string;
  let supplierId: string;

  beforeAll(async () => {
    await helpers.setup();
  });

  afterAll(async () => {
    await helpers.teardown();
  });

  afterEach(async () => {
    await helpers.reset();
  });

  beforeEach(async () => {
    // Create test employee
    const factories = helpers.getFactories();
    const employee = await factories.employees().create();

    // Mock auth token
    authToken = 'test-token';
  });

  describe('Supplier/Buyer CRUD', () => {
    it('should create a supplier', async () => {
      const response = await request(app)
        .post('/api/v1/suppliers')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'ABC Supplies Inc',
          type: 'supplier',
          contact_person: 'John Doe',
          email: 'john@abcsupplies.com',
          phone: '+1234567890',
          address: '123 Main St, City',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('ABC Supplies Inc');
      expect(response.body.data.type).toBe('supplier');
      supplierId = response.body.data.id;
    });

    it('should create a buyer', async () => {
      const response = await request(app)
        .post('/api/v1/suppliers')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'XYZ Retail Ltd',
          type: 'buyer',
          contact_person: 'Jane Smith',
          email: 'jane@xyzretail.com',
          phone: '+9876543210',
          address: '456 Oak Ave, Town',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('XYZ Retail Ltd');
      expect(response.body.data.type).toBe('buyer');
    });

    it('should get supplier by ID', async () => {
      // Create a supplier first
      const createResponse = await request(app)
        .post('/api/v1/suppliers')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'ABC Supplies Inc',
          type: 'supplier',
          contact_person: 'John Doe',
          email: 'john@abcsupplies.com',
          phone: '+1234567890',
          address: '123 Main St, City',
        });

      const suppId = createResponse.body.data.id;

      const response = await request(app)
        .get(`/api/v1/suppliers/${suppId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('ABC Supplies Inc');
    });

    it('should get all suppliers for employee', async () => {
      // Create suppliers first
      await request(app)
        .post('/api/v1/suppliers')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'ABC Supplies Inc',
          type: 'supplier',
          contact_person: 'John Doe',
          email: 'john@abcsupplies.com',
          phone: '+1234567890',
          address: '123 Main St, City',
        });

      const response = await request(app)
        .get('/api/v1/suppliers')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should update a supplier', async () => {
      // Create a supplier first
      const createResponse = await request(app)
        .post('/api/v1/suppliers')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'ABC Supplies Inc',
          type: 'supplier',
          contact_person: 'John Doe',
          email: 'john@abcsupplies.com',
          phone: '+1234567890',
          address: '123 Main St, City',
        });

      const suppId = createResponse.body.data.id;

      const response = await request(app)
        .put(`/api/v1/suppliers/${suppId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          contact_person: 'Jane Doe',
          email: 'jane@abcsupplies.com',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.contact_person).toBe('Jane Doe');
    });

    it('should delete a supplier', async () => {
      // Create a supplier first
      const createResponse = await request(app)
        .post('/api/v1/suppliers')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'ABC Supplies Inc',
          type: 'supplier',
          contact_person: 'John Doe',
          email: 'john@abcsupplies.com',
          phone: '+1234567890',
          address: '123 Main St, City',
        });

      const suppId = createResponse.body.data.id;

      const response = await request(app)
        .delete(`/api/v1/suppliers/${suppId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should search suppliers', async () => {
      // Create suppliers first
      await request(app)
        .post('/api/v1/suppliers')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'ABC Supplies Inc',
          type: 'supplier',
          contact_person: 'John Doe',
          email: 'john@abcsupplies.com',
          phone: '+1234567890',
          address: '123 Main St, City',
        });

      const response = await request(app)
        .get('/api/v1/suppliers/search?searchTerm=ABC')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should get supplier count', async () => {
      const response = await request(app)
        .get('/api/v1/suppliers/count')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(typeof response.body.data.count).toBe('number');
    });
  });

  describe('Visit Management', () => {
    beforeEach(async () => {
      // Create a supplier for visit tests
      const createResponse = await request(app)
        .post('/api/v1/suppliers')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'ABC Supplies Inc',
          type: 'supplier',
          contact_person: 'John Doe',
          email: 'john@abcsupplies.com',
          phone: '+1234567890',
          address: '123 Main St, City',
        });

      supplierId = createResponse.body.data.id;
    });

    it('should log a visit', async () => {
      const response = await request(app)
        .post(`/api/v1/suppliers/${supplierId}/visits`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          visit_date: new Date().toISOString().split('T')[0],
          location: 'Supplier Office',
          notes: 'Discussed new product line',
          latitude: 40.7128,
          longitude: -74.006,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.visit_date).toBeDefined();
    });

    it('should get visit history', async () => {
      // Log a visit first
      await request(app)
        .post(`/api/v1/suppliers/${supplierId}/visits`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          visit_date: new Date().toISOString().split('T')[0],
          location: 'Supplier Office',
          notes: 'Discussed new product line',
          latitude: 40.7128,
          longitude: -74.006,
        });

      const response = await request(app)
        .get(`/api/v1/suppliers/${supplierId}/visits`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should get recent visits', async () => {
      // Log visits first
      await request(app)
        .post(`/api/v1/suppliers/${supplierId}/visits`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          visit_date: new Date().toISOString().split('T')[0],
          location: 'Supplier Office',
          notes: 'Discussed new product line',
          latitude: 40.7128,
          longitude: -74.006,
        });

      const response = await request(app)
        .get(`/api/v1/suppliers/${supplierId}/visits/recent?limit=5`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should get visits by date range', async () => {
      // Log a visit first
      await request(app)
        .post(`/api/v1/suppliers/${supplierId}/visits`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          visit_date: new Date().toISOString().split('T')[0],
          location: 'Supplier Office',
          notes: 'Discussed new product line',
          latitude: 40.7128,
          longitude: -74.006,
        });

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      const endDate = new Date();

      const response = await request(app)
        .get(
          `/api/v1/suppliers/${supplierId}/visits/date-range?startDate=${startDate.toISOString().split('T')[0]}&endDate=${endDate.toISOString().split('T')[0]}`
        )
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should get visit count', async () => {
      const response = await request(app)
        .get(`/api/v1/suppliers/${supplierId}/visits/count`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(typeof response.body.data.count).toBe('number');
    });
  });

  describe('Authorization', () => {
    it('should prevent unauthorized supplier deletion', async () => {
      // Create a supplier with one employee
      const factories = helpers.getFactories();
      await factories.employees().create();
      await factories.employees().create();

      const createResponse = await request(app)
        .post('/api/v1/suppliers')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'ABC Supplies Inc',
          type: 'supplier',
          contact_person: 'John Doe',
          email: 'john@abcsupplies.com',
          phone: '+1234567890',
          address: '123 Main St, City',
        });

      const suppId = createResponse.body.data.id;

      // Try to delete with different employee
      const response = await request(app)
        .delete(`/api/v1/suppliers/${suppId}`)
        .set('Authorization', `Bearer different-token`);

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('Forbidden');
    });

    it('should prevent unauthorized visit logging', async () => {
      // Create a supplier with one employee
      const createResponse = await request(app)
        .post('/api/v1/suppliers')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'ABC Supplies Inc',
          type: 'supplier',
          contact_person: 'John Doe',
          email: 'john@abcsupplies.com',
          phone: '+1234567890',
          address: '123 Main St, City',
        });

      const suppId = createResponse.body.data.id;

      // Try to log visit with different employee
      const response = await request(app)
        .post(`/api/v1/suppliers/${suppId}/visits`)
        .set('Authorization', `Bearer different-token`)
        .send({
          visit_date: new Date().toISOString().split('T')[0],
          location: 'Supplier Office',
          notes: 'Discussed new product line',
          latitude: 40.7128,
          longitude: -74.006,
        });

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('Unauthorized');
    });
  });
});
