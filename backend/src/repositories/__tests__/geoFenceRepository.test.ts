/**
 * GeoFence Repository - Unit Tests
 * Tests for geo-fence CRUD operations, filtering, and status management
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { GeoFenceRepository } from '../geoFenceRepository';
import db from '../../config/knex';

describe('GeoFenceRepository', () => {
  let repository: GeoFenceRepository;
  let testGeoFenceId: string;

  beforeAll(async () => {
    repository = new GeoFenceRepository(db);
    await db('geo_fences').del();
  });

  afterAll(async () => {
    await db('geo_fences').del();
  });

  describe('create', () => {
    it('should create a geo-fence with valid data', async () => {
      const data = {
        name: 'Office Building',
        latitude: 40.7128,
        longitude: -74.006,
        radius: 100,
        type: 'Office' as const,
      };

      const geoFence = await repository.create(data);

      expect(geoFence).toBeDefined();
      expect(geoFence.id).toBeDefined();
      expect(geoFence.name).toBe('Office Building');
      expect(geoFence.center.latitude).toBe(40.7128);
      expect(geoFence.center.longitude).toBe(-74.006);
      expect(geoFence.radius).toBe(100);
      expect(geoFence.type).toBe('Office');
      expect(geoFence.enabled).toBe(true);

      testGeoFenceId = geoFence.id;
    });

    it('should create geo-fences with different types', async () => {
      const types: Array<'Office' | 'Site' | 'Restricted' | 'Custom'> = [
        'Office',
        'Site',
        'Restricted',
        'Custom',
      ];

      for (const type of types) {
        const geoFence = await repository.create({
          name: `${type} Fence`,
          latitude: 40.7128,
          longitude: -74.006,
          radius: 50,
          type,
        });

        expect(geoFence.type).toBe(type);
      }
    });
  });

  describe('getById', () => {
    it('should retrieve geo-fence by ID', async () => {
      const geoFence = await repository.getById(testGeoFenceId);

      expect(geoFence).toBeDefined();
      expect(geoFence?.id).toBe(testGeoFenceId);
      expect(geoFence?.name).toBe('Office Building');
    });

    it('should return null for non-existent ID', async () => {
      const geoFence = await repository.getById('00000000-0000-4000-a000-ffffffffffff');
      expect(geoFence).toBeNull();
    });
  });

  describe('getAll', () => {
    it('should retrieve all geo-fences', async () => {
      const geoFences = await repository.getAll();

      expect(Array.isArray(geoFences)).toBe(true);
      expect(geoFences.length).toBeGreaterThan(0);
    });

    it('should return geo-fences ordered by creation date', async () => {
      const geoFences = await repository.getAll();

      for (let i = 0; i < geoFences.length - 1; i++) {
        const current = new Date(geoFences[i].createdAt).getTime();
        const next = new Date(geoFences[i + 1].createdAt).getTime();
        expect(current).toBeGreaterThanOrEqual(next);
      }
    });
  });

  describe('getEnabled', () => {
    it('should retrieve only enabled geo-fences', async () => {
      const geoFences = await repository.getEnabled();

      expect(Array.isArray(geoFences)).toBe(true);
      geoFences.forEach((gf) => {
        expect(gf.enabled).toBe(true);
      });
    });
  });

  describe('getByType', () => {
    it('should retrieve geo-fences by type', async () => {
      const geoFences = await repository.getByType('Office');

      expect(Array.isArray(geoFences)).toBe(true);
      geoFences.forEach((gf) => {
        expect(gf.type).toBe('Office');
        expect(gf.enabled).toBe(true);
      });
    });

    it('should return empty array for non-existent type', async () => {
      // Create a disabled fence first
      const fence = await repository.create({
        name: 'Disabled Fence',
        latitude: 40.7128,
        longitude: -74.006,
        radius: 50,
        type: 'Site',
      });

      await repository.update(fence.id, { enabled: false });

      const geoFences = await repository.getByType('Site');
      const disabledFence = geoFences.find((gf) => gf.id === fence.id);

      expect(disabledFence).toBeUndefined();
    });
  });

  describe('update', () => {
    it('should update geo-fence properties', async () => {
      const updated = await repository.update(testGeoFenceId, {
        name: 'Updated Office',
        radius: 200,
      });

      expect(updated).toBeDefined();
      expect(updated?.name).toBe('Updated Office');
      expect(updated?.radius).toBe(200);
    });

    it('should update enabled status', async () => {
      const updated = await repository.update(testGeoFenceId, {
        enabled: false,
      });

      expect(updated?.enabled).toBe(false);
    });

    it('should update coordinates', async () => {
      const updated = await repository.update(testGeoFenceId, {
        latitude: 51.5074,
        longitude: -0.1278,
      });

      expect(updated?.center.latitude).toBe(51.5074);
      expect(updated?.center.longitude).toBe(-0.1278);
    });

    it('should return null for non-existent ID', async () => {
      const updated = await repository.update('00000000-0000-4000-a000-ffffffffffff', {
        name: 'Updated',
      });

      expect(updated).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete a geo-fence', async () => {
      const fence = await repository.create({
        name: 'Fence to Delete',
        latitude: 40.7128,
        longitude: -74.006,
        radius: 50,
        type: 'Custom',
      });

      await repository.delete(fence.id);

      const deleted = await repository.getById(fence.id);
      expect(deleted).toBeNull();
    });
  });

  describe('CRUD operations', () => {
    it('should support full CRUD lifecycle', async () => {
      // Create
      const created = await repository.create({
        name: 'CRUD Test Fence',
        latitude: 40.7128,
        longitude: -74.006,
        radius: 75,
        type: 'Site',
      });

      expect(created.id).toBeDefined();

      // Read
      const read = await repository.getById(created.id);
      expect(read?.name).toBe('CRUD Test Fence');

      // Update
      const updated = await repository.update(created.id, {
        name: 'Updated CRUD Fence',
        radius: 150,
      });

      expect(updated?.name).toBe('Updated CRUD Fence');
      expect(updated?.radius).toBe(150);

      // Delete
      await repository.delete(created.id);
      const deleted = await repository.getById(created.id);
      expect(deleted).toBeNull();
    });
  });

  describe('edge cases', () => {
    it('should handle very small radius', async () => {
      const fence = await repository.create({
        name: 'Small Radius',
        latitude: 40.7128,
        longitude: -74.006,
        radius: 1,
        type: 'Custom',
      });

      expect(fence.radius).toBe(1);
    });

    it('should handle very large radius', async () => {
      const fence = await repository.create({
        name: 'Large Radius',
        latitude: 40.7128,
        longitude: -74.006,
        radius: 10000,
        type: 'Custom',
      });

      expect(fence.radius).toBe(10000);
    });

    it('should handle extreme coordinates', async () => {
      const fence = await repository.create({
        name: 'Extreme Coords',
        latitude: -90,
        longitude: 180,
        radius: 100,
        type: 'Custom',
      });

      expect(fence.center.latitude).toBe(-90);
      expect(fence.center.longitude).toBe(180);
    });
  });
});
