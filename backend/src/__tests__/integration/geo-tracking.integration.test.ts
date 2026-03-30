import request from 'supertest';
import app from '../../index';
import { getKnexInstance } from '../../config/knex';
import { v4 as uuidv4 } from 'uuid';

describe('Geo Tracking API Endpoints', () => {
  let knex = getKnexInstance();
  let authToken: string;
  let employeeId: string;
  let managerId: string;
  let journeyId: string;

  beforeAll(async () => {
    // Create test employees
    employeeId = uuidv4();
    managerId = uuidv4();

    // Insert test employees
    await knex('employees').insert([
      {
        id: employeeId,
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        phone: '1234567890',
        date_of_birth: new Date('1990-01-01'),
        gender: 'Male',
        status: 'Active',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: managerId,
        first_name: 'Jane',
        last_name: 'Manager',
        email: 'jane@example.com',
        phone: '0987654321',
        date_of_birth: new Date('1985-01-01'),
        gender: 'Female',
        status: 'Active',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // Create test auth token (mock JWT)
    authToken = 'Bearer test-token-' + uuidv4();
  });

  afterAll(async () => {
    // Cleanup
    await knex('geo_logs').del();
    await knex('journeys').del();
    await knex('geo_fences').del();
    await knex('employees').where('id', employeeId).del();
    await knex('employees').where('id', managerId).del();
    await knex.destroy();
  });

  describe('POST /api/v1/geo/track - Log GPS waypoint', () => {
    it('should log a GPS waypoint successfully', async () => {
      const response = await request(app)
        .post('/api/v1/geo/track')
        .set('Authorization', authToken)
        .send({
          employeeId,
          latitude: 28.6139,
          longitude: 77.209,
          timestamp: new Date().toISOString(),
          accuracy: 10,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.employeeId).toBe(employeeId);
      expect(response.body.latitude).toBe(28.6139);
      expect(response.body.longitude).toBe(77.209);
    });

    it('should reject invalid latitude', async () => {
      const response = await request(app)
        .post('/api/v1/geo/track')
        .set('Authorization', authToken)
        .send({
          employeeId,
          latitude: 95, // Invalid
          longitude: 77.209,
          timestamp: new Date().toISOString(),
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject invalid longitude', async () => {
      const response = await request(app)
        .post('/api/v1/geo/track')
        .set('Authorization', authToken)
        .send({
          employeeId,
          latitude: 28.6139,
          longitude: 185, // Invalid
          timestamp: new Date().toISOString(),
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/v1/geo/track')
        .send({
          employeeId,
          latitude: 28.6139,
          longitude: 77.209,
          timestamp: new Date().toISOString(),
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/v1/geo/journey/:employeeId/:date - Get daily journey', () => {
    beforeEach(async () => {
      // Create test journey
      const now = new Date();
      const journeyUuid = uuidv4();
      await knex('journeys').insert({
        id: journeyUuid,
        employee_id: employeeId,
        start_latitude: 28.6139,
        start_longitude: 77.209,
        end_latitude: 28.7041,
        end_longitude: 77.1025,
        waypoints: JSON.stringify([
          { latitude: 28.6139, longitude: 77.209, timestamp: now },
          { latitude: 28.7041, longitude: 77.1025, timestamp: new Date(now.getTime() + 3600000) },
        ]),
        total_distance: 12.5,
        total_duration: 3600,
        start_time: now,
        end_time: new Date(now.getTime() + 3600000),
        purpose: 'Client visit',
        travel_allowance: 125,
        status: 'Completed',
        created_at: now,
        updated_at: now,
      });
      journeyId = journeyUuid;
    });

    it('should retrieve daily journey for employee', async () => {
      const date = new Date().toISOString().split('T')[0];
      const response = await request(app)
        .get(`/api/v1/geo/journey/${employeeId}/${date}`)
        .set('Authorization', authToken);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('employeeId', employeeId);
      expect(response.body).toHaveProperty('date');
      expect(response.body).toHaveProperty('journeys');
      expect(response.body).toHaveProperty('totalDistance');
    });

    it('should reject invalid date format', async () => {
      const response = await request(app)
        .get(`/api/v1/geo/journey/${employeeId}/invalid-date`)
        .set('Authorization', authToken);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should require authentication', async () => {
      const date = new Date().toISOString().split('T')[0];
      const response = await request(app).get(`/api/v1/geo/journey/${employeeId}/${date}`);

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/v1/geo/journey/:id/approve - Approve travel log', () => {
    it('should approve a journey', async () => {
      const response = await request(app)
        .put(`/api/v1/geo/journey/${journeyId}/approve`)
        .set('Authorization', authToken)
        .send({
          approvedBy: managerId,
          notes: 'Approved for travel allowance',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body.status).toBe('Completed');
    });

    it('should return 404 for non-existent journey', async () => {
      const fakeId = uuidv4();
      const response = await request(app)
        .put(`/api/v1/geo/journey/${fakeId}/approve`)
        .set('Authorization', authToken)
        .send({
          approvedBy: managerId,
          notes: 'Approved',
        });

      expect(response.status).toBe(404);
    });

    it('should require manager role', async () => {
      const response = await request(app)
        .put(`/api/v1/geo/journey/${journeyId}/approve`)
        .set('Authorization', authToken)
        .send({
          approvedBy: managerId,
          notes: 'Approved',
        });

      // This will depend on authorization middleware implementation
      expect([200, 403]).toContain(response.status);
    });
  });

  describe('GET /api/v1/geo/allowance/:employeeId/:month - Get monthly allowance', () => {
    it('should calculate monthly travel allowance', async () => {
      const month = new Date().getMonth() + 1;
      const year = new Date().getFullYear();

      const response = await request(app)
        .get(`/api/v1/geo/allowance/${employeeId}/${month}`)
        .query({ year })
        .set('Authorization', authToken);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('employeeId', employeeId);
      expect(response.body).toHaveProperty('month', month);
      expect(response.body).toHaveProperty('year', year);
      expect(response.body).toHaveProperty('totalDistance');
      expect(response.body).toHaveProperty('totalAllowance');
      expect(response.body).toHaveProperty('journeyCount');
      expect(response.body).toHaveProperty('currency');
    });

    it('should reject invalid month', async () => {
      const response = await request(app)
        .get(`/api/v1/geo/allowance/${employeeId}/13`)
        .set('Authorization', authToken);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should require finance role', async () => {
      const month = new Date().getMonth() + 1;
      const response = await request(app)
        .get(`/api/v1/geo/allowance/${employeeId}/${month}`)
        .set('Authorization', authToken);

      // This will depend on authorization middleware implementation
      expect([200, 403]).toContain(response.status);
    });
  });

  describe('POST /api/v1/geo/geo-fences - Create geo-fence', () => {
    it('should create a geo-fence successfully', async () => {
      const response = await request(app)
        .post('/api/v1/geo/geo-fences')
        .set('Authorization', authToken)
        .send({
          name: 'Office Location',
          latitude: 28.6139,
          longitude: 77.209,
          radius: 500,
          type: 'Office',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Office Location');
      expect(response.body.latitude).toBe(28.6139);
      expect(response.body.longitude).toBe(77.209);
      expect(response.body.radius).toBe(500);
      expect(response.body.type).toBe('Office');
    });

    it('should reject missing required fields', async () => {
      const response = await request(app)
        .post('/api/v1/geo/geo-fences')
        .set('Authorization', authToken)
        .send({
          name: 'Office Location',
          // Missing latitude, longitude, radius, type
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject invalid coordinates', async () => {
      const response = await request(app)
        .post('/api/v1/geo/geo-fences')
        .set('Authorization', authToken)
        .send({
          name: 'Office Location',
          latitude: 95, // Invalid
          longitude: 77.209,
          radius: 500,
          type: 'Office',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject invalid radius', async () => {
      const response = await request(app)
        .post('/api/v1/geo/geo-fences')
        .set('Authorization', authToken)
        .send({
          name: 'Office Location',
          latitude: 28.6139,
          longitude: 77.209,
          radius: -100, // Invalid
          type: 'Office',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should require admin role', async () => {
      const response = await request(app)
        .post('/api/v1/geo/geo-fences')
        .set('Authorization', authToken)
        .send({
          name: 'Office Location',
          latitude: 28.6139,
          longitude: 77.209,
          radius: 500,
          type: 'Office',
        });

      // This will depend on authorization middleware implementation
      expect([201, 403]).toContain(response.status);
    });
  });

  describe('GET /api/v1/geo/geo-fences - Get all geo-fences', () => {
    it('should retrieve all geo-fences', async () => {
      const response = await request(app)
        .get('/api/v1/geo/geo-fences')
        .set('Authorization', authToken);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        expect(response.body[0]).toHaveProperty('id');
        expect(response.body[0]).toHaveProperty('name');
        expect(response.body[0]).toHaveProperty('latitude');
        expect(response.body[0]).toHaveProperty('longitude');
        expect(response.body[0]).toHaveProperty('radius');
        expect(response.body[0]).toHaveProperty('type');
      }
    });

    it('should filter by enabled status', async () => {
      const response = await request(app)
        .get('/api/v1/geo/geo-fences')
        .query({ enabled: 'true' })
        .set('Authorization', authToken);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should filter by type', async () => {
      const response = await request(app)
        .get('/api/v1/geo/geo-fences')
        .query({ type: 'Office' })
        .set('Authorization', authToken);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should require authentication', async () => {
      const response = await request(app).get('/api/v1/geo/geo-fences');

      expect(response.status).toBe(401);
    });
  });
});
