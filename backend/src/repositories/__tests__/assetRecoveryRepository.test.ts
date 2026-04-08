/**
 * Asset Recovery Repository - Unit Tests
 * Tests for asset recovery CRUD operations and status management
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { AssetRecoveryRepository } from '../assetRecoveryRepository';
import db from '../../config/knex';

describe('AssetRecoveryRepository', () => {
  let repository: AssetRecoveryRepository;
  const testEmployeeId = 'a0000000-0000-4000-a000-000000000001';
  const noAssetEmployeeId = 'a0000000-0000-4000-a000-000000000002';
  const noDamageEmployeeId = 'a0000000-0000-4000-a000-000000000003';
  let testRecoveryId: string;

  // Asset IDs used across tests
  const assetId1 = 'e0000000-0000-4000-d000-000000000001';
  const assetId2 = 'e0000000-0000-4000-d000-000000000002';
  const assetId3 = 'e0000000-0000-4000-d000-000000000003';
  const assetId4 = 'e0000000-0000-4000-d000-000000000004';
  const assetIdDelete = 'e0000000-0000-4000-d000-000000000005';

  beforeAll(async () => {
    repository = new AssetRecoveryRepository(db);
    await db('asset_recovery_checklists').del();

    // Create test employees (FK requirement)
    for (const [idx, empId] of [testEmployeeId, noAssetEmployeeId, noDamageEmployeeId].entries()) {
      await db('employees')
        .insert({
          id: empId,
          employee_id: `EMP-TEST-00${idx + 1}`,
          first_name: 'Test',
          last_name: 'Employee',
          email: `test.employee${idx + 1}@example.com`,
          phone: '+1234567890',
          date_of_joining: new Date(),
          employment_type: 'permanent',
          status: 'active',
        })
        .onConflict('id')
        .ignore();
    }

    // Create test assets (FK requirement for asset_recovery_checklists.asset_id)
    for (const [idx, assetId] of [assetId1, assetId2, assetId3, assetId4, assetIdDelete].entries()) {
      await db('assets')
        .insert({
          id: assetId,
          name: `Test Asset ${idx + 1}`,
          asset_code: `ASSET-TEST-00${idx + 1}`,
          category: 'laptop',
          status: 'assigned',
        })
        .onConflict('id')
        .ignore();
    }
  });

  afterAll(async () => {
    await db('asset_recovery_checklists').del();
    await db('assets').whereIn('id', [assetId1, assetId2, assetId3, assetId4, assetIdDelete]).del();
    await db('employees').whereIn('id', [testEmployeeId, noAssetEmployeeId, noDamageEmployeeId]).del();
  });

  describe('createAssetRecovery', () => {
    it('should create an asset recovery record', async () => {
      const recovery = await repository.createAssetRecovery(testEmployeeId, {
        asset_id: assetId1,
        status: 'pending',
        notes: 'Company laptop assigned to employee',
      });

      expect(recovery).toBeDefined();
      expect(recovery.id).toBeDefined();
      expect(recovery.employee_id).toBe(testEmployeeId);
      expect(recovery.asset_id).toBe(assetId1);
      expect(recovery.status).toBe('pending');

      testRecoveryId = recovery.id;
    });

    it('should default status to pending when not provided', async () => {
      const recovery = await repository.createAssetRecovery(testEmployeeId, {
        asset_id: assetId2,
      });

      expect(recovery.status).toBe('pending');
    });
  });

  describe('getAssetRecovery', () => {
    it('should retrieve asset recovery by ID', async () => {
      const recovery = await repository.getAssetRecovery(testRecoveryId);

      expect(recovery).toBeDefined();
      expect(recovery?.id).toBe(testRecoveryId);
      expect(recovery?.employee_id).toBe(testEmployeeId);
    });

    it('should return undefined for non-existent record', async () => {
      const recovery = await repository.getAssetRecovery('00000000-0000-4000-a000-ffffffffffff');

      expect(recovery).toBeUndefined();
    });
  });

  describe('getAssetRecoveriesByEmployeeId', () => {
    it('should retrieve all asset recoveries for an employee', async () => {
      const recoveries = await repository.getAssetRecoveriesByEmployeeId(testEmployeeId);

      expect(Array.isArray(recoveries)).toBe(true);
      expect(recoveries.length).toBeGreaterThan(0);
      expect(recoveries.every((r) => r.employee_id === testEmployeeId)).toBe(true);
    });

    it('should return empty array for employee with no records', async () => {
      const recoveries = await repository.getAssetRecoveriesByEmployeeId(noAssetEmployeeId);

      expect(Array.isArray(recoveries)).toBe(true);
      expect(recoveries.length).toBe(0);
    });
  });

  describe('updateAssetRecovery', () => {
    it('should update asset recovery record', async () => {
      const updated = await repository.updateAssetRecovery(testRecoveryId, {
        notes: 'Laptop returned in good condition',
      });

      expect(updated.notes).toBe('Laptop returned in good condition');
    });
  });

  describe('markAssetAsReturned', () => {
    it('should mark asset as returned', async () => {
      const updated = await repository.markAssetAsReturned(testRecoveryId);

      expect(updated.status).toBe('returned');
    });
  });

  describe('markAssetAsDamaged', () => {
    it('should mark asset as damaged with cost', async () => {
      const recovery = await repository.createAssetRecovery(testEmployeeId, {
        asset_id: assetId3,
      });

      const updated = await repository.markAssetAsDamaged(recovery.id, 500);

      expect(updated.status).toBe('damaged');
      expect(updated.damage_cost).toBe(500);
    });
  });

  describe('markAssetAsMissing', () => {
    it('should mark asset as missing', async () => {
      const recovery = await repository.createAssetRecovery(testEmployeeId, {
        asset_id: assetId4,
      });

      const updated = await repository.markAssetAsMissing(recovery.id);

      expect(updated.status).toBe('missing');
    });
  });

  describe('getUnreturnedAssets', () => {
    it('should retrieve damaged and missing assets', async () => {
      const assets = await repository.getUnreturnedAssets(testEmployeeId);

      expect(Array.isArray(assets)).toBe(true);
      assets.forEach((a) => {
        expect(['damaged', 'missing']).toContain(a.status);
      });
    });
  });

  describe('getTotalDamageCost', () => {
    it('should calculate total damage cost for employee', async () => {
      const total = await repository.getTotalDamageCost(testEmployeeId);

      expect(typeof total).toBe('number');
      expect(total).toBeGreaterThanOrEqual(0);
    });

    it('should return 0 for employee with no damage', async () => {
      const total = await repository.getTotalDamageCost(noDamageEmployeeId);

      expect(total).toBe(0);
    });
  });

  describe('getAllAssetRecoveries', () => {
    it('should retrieve all asset recoveries', async () => {
      const recoveries = await repository.getAllAssetRecoveries();

      expect(Array.isArray(recoveries)).toBe(true);
      expect(recoveries.length).toBeGreaterThan(0);
    });

    it('should support pagination', async () => {
      const page1 = await repository.getAllAssetRecoveries(2, 0);
      expect(page1.length).toBeLessThanOrEqual(2);
    });
  });

  describe('deleteAssetRecovery', () => {
    it('should delete an asset recovery record', async () => {
      const recovery = await repository.createAssetRecovery(testEmployeeId, {
        asset_id: assetIdDelete,
      });

      await repository.deleteAssetRecovery(recovery.id);

      const deleted = await repository.getAssetRecovery(recovery.id);
      expect(deleted).toBeUndefined();
    });
  });
});
