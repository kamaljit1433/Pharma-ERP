/**
 * Signature Request Repository - Unit Tests
 * Tests for signature request CRUD operations
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { SignatureRequestRepository } from '../signatureRequestRepository';
import db from '../../config/knex';

describe('SignatureRequestRepository', () => {
  let repository: SignatureRequestRepository;
  let testRequestId: string;

  beforeAll(async () => {
    repository = new SignatureRequestRepository(db);
    await db('signature_requests').del();
  });

  afterAll(async () => {
    await db('signature_requests').del();
  });

  describe('createRequest', () => {
    it('should create a signature request with valid data', async () => {
      const request = await repository.createRequest({
        document_id: 'f0000000-0000-4000-a000-000000000001',
        requester_id: 'c0000000-0000-4000-a000-000000000701',
        signers: ['c0000000-0000-4000-a000-000000000301', 'c0000000-0000-4000-a000-000000000302'],
        status: 'pending',
      });

      expect(request).toBeDefined();
      expect(request.id).toBeDefined();
      expect(request.document_id).toBe('f0000000-0000-4000-a000-000000000001');
      expect(request.status).toBe('pending');
      expect(request.signers.length).toBe(2);

      testRequestId = request.id;
    });

    it('should create requests with different statuses', async () => {
      const statuses = ['pending', 'in_progress', 'completed', 'rejected', 'expired'];

      for (const status of statuses) {
        const request = await repository.createRequest({
          document_id: `doc-${status}`,
          requester_id: 'c0000000-0000-4000-a000-000000000701',
          signers: ['c0000000-0000-4000-a000-000000000301'],
          status: status as any,
        });

        expect(request.status).toBe(status);
      }
    });
  });

  describe('getRequestById', () => {
    it('should retrieve request by ID', async () => {
      const request = await repository.getRequestById(testRequestId);

      expect(request).toBeDefined();
      expect(request?.id).toBe(testRequestId);
      expect(request?.document_id).toBe('f0000000-0000-4000-a000-000000000001');
    });

    it('should return null for non-existent ID', async () => {
      const request = await repository.getRequestById('00000000-0000-4000-a000-ffffffffffff');
      expect(request).toBeNull();
    });
  });

  describe('getRequestsByDocument', () => {
    it('should retrieve requests by document ID', async () => {
      const requests = await repository.getRequestsByDocument('f0000000-0000-4000-a000-000000000001');

      expect(Array.isArray(requests)).toBe(true);
      expect(requests.length).toBeGreaterThan(0);
      requests.forEach((r) => {
        expect(r.document_id).toBe('f0000000-0000-4000-a000-000000000001');
      });
    });

    it('should return empty array for non-existent document', async () => {
      const requests = await repository.getRequestsByDocument('00000000-0000-4000-a000-fffffffffffd');
      expect(requests).toEqual([]);
    });
  });

  describe('getRequestsByRequester', () => {
    it('should retrieve requests by requester ID', async () => {
      const requests = await repository.getRequestsByRequester('c0000000-0000-4000-a000-000000000701');

      expect(Array.isArray(requests)).toBe(true);
      requests.forEach((r) => {
        expect(r.requester_id).toBe('c0000000-0000-4000-a000-000000000701');
      });
    });
  });

  describe('getRequestsByStatus', () => {
    it('should retrieve requests by status', async () => {
      const requests = await repository.getRequestsByStatus('pending');

      expect(Array.isArray(requests)).toBe(true);
      requests.forEach((r) => {
        expect(r.status).toBe('pending');
      });
    });
  });

  describe('getPendingRequests', () => {
    it('should retrieve pending requests', async () => {
      const requests = await repository.getPendingRequests();

      expect(Array.isArray(requests)).toBe(true);
      requests.forEach((r) => {
        expect(['pending', 'in_progress']).toContain(r.status);
      });
    });
  });

  describe('updateRequest', () => {
    it('should update request status', async () => {
      const updated = await repository.updateRequest(testRequestId, {
        status: 'in_progress',
      });

      expect(updated.status).toBe('in_progress');
    });

    it('should update signers', async () => {
      const newSigners = ['c0000000-0000-4000-a000-000000000301', 'c0000000-0000-4000-a000-000000000302', 'c0000000-0000-4000-a000-000000000303'];
      const updated = await repository.updateRequest(testRequestId, {
        signers: newSigners,
      });

      expect(updated.signers.length).toBe(3);
    });
  });

  describe('deleteRequest', () => {
    it('should delete a request', async () => {
      const request = await repository.createRequest({
        document_id: 'f0000000-0000-4000-a000-000000000003',
        requester_id: 'c0000000-0000-4000-a000-000000000701',
        signers: ['c0000000-0000-4000-a000-000000000301'],
        status: 'pending',
      });

      await repository.deleteRequest(request.id);

      const deleted = await repository.getRequestById(request.id);
      expect(deleted).toBeNull();
    });
  });

  describe('CRUD operations', () => {
    it('should support full CRUD lifecycle', async () => {
      // Create
      const created = await repository.createRequest({
        document_id: 'f0000000-0000-4000-a000-000000000002',
        requester_id: 'c0000000-0000-4000-a000-000000000701',
        signers: ['c0000000-0000-4000-a000-000000000301'],
        status: 'pending',
      });

      expect(created.id).toBeDefined();

      // Read
      const read = await repository.getRequestById(created.id);
      expect(read?.document_id).toBe('f0000000-0000-4000-a000-000000000002');

      // Update
      const updated = await repository.updateRequest(created.id, {
        status: 'completed',
      });

      expect(updated.status).toBe('completed');

      // Delete
      await repository.deleteRequest(created.id);
      const deleted = await repository.getRequestById(created.id);
      expect(deleted).toBeNull();
    });
  });

  describe('edge cases', () => {
    it('should handle single signer', async () => {
      const request = await repository.createRequest({
        document_id: 'f0000000-0000-4000-a000-000000000006',
        requester_id: 'c0000000-0000-4000-a000-000000000701',
        signers: ['c0000000-0000-4000-a000-000000000301'],
        status: 'pending',
      });

      expect(request.signers.length).toBe(1);
    });

    it('should handle many signers', async () => {
      const signers = Array.from({ length: 20 }, (_, i) => `signer-${i + 1}`);

      const request = await repository.createRequest({
        document_id: 'f0000000-0000-4000-a000-000000000004',
        requester_id: 'c0000000-0000-4000-a000-000000000701',
        signers,
        status: 'pending',
      });

      expect(request.signers.length).toBe(20);
    });

    it('should handle multiple requests for same document', async () => {
      const r1 = await repository.createRequest({
        document_id: 'f0000000-0000-4000-a000-000000000005',
        requester_id: 'c0000000-0000-4000-a000-000000000701',
        signers: ['c0000000-0000-4000-a000-000000000301'],
        status: 'pending',
      });

      const r2 = await repository.createRequest({
        document_id: 'f0000000-0000-4000-a000-000000000005',
        requester_id: 'c0000000-0000-4000-a000-000000000702',
        signers: ['c0000000-0000-4000-a000-000000000302'],
        status: 'pending',
      });

      expect(r1.id).not.toBe(r2.id);

      const requests = await repository.getRequestsByDocument('f0000000-0000-4000-a000-000000000005');
      expect(requests.length).toBeGreaterThanOrEqual(2);
    });
  });
});
