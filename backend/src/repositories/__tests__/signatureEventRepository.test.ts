/**
 * Signature Event Repository - Unit Tests
 * Tests for signature event CRUD operations
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { SignatureEventRepository } from '../signatureEventRepository';
import db from '../../config/knex';

describe('SignatureEventRepository', () => {
  let repository: SignatureEventRepository;
  let testEventId: string;
  let testRequestId: string;

  beforeAll(async () => {
    repository = new SignatureEventRepository(db);

    // Clean up test data
    await db('signature_events').del();
    await db('signature_requests').del();

    // Create test signature request
    const [request] = await db('signature_requests')
      .insert({
        id: 'b1000000-0000-4000-b000-000000000004',
        document_id: 'f0000000-0000-4000-a000-000000000001',
        requester_id: 'c0000000-0000-4000-a000-000000000701',
        status: 'pending',
      })
      .returning('*');

    testRequestId = request.id;
  });

  afterAll(async () => {
    await db('signature_events').del();
    await db('signature_requests').del();
  });

  describe('createEvent', () => {
    it('should create a signature event with valid data', async () => {
      const event = await repository.createEvent({
        request_id: testRequestId,
        signer_id: 'c0000000-0000-4000-a000-000000000301',
        event_type: 'signed',
        timestamp: new Date(),
        ip_address: '192.168.1.1',
        user_agent: 'Mozilla/5.0',
      });

      expect(event).toBeDefined();
      expect(event.id).toBeDefined();
      expect(event.request_id).toBe(testRequestId);
      expect(event.event_type).toBe('signed');

      testEventId = event.id;
    });

    it('should create events with different types', async () => {
      const types = ['viewed', 'signed', 'rejected', 'expired'];

      for (const type of types) {
        const event = await repository.createEvent({
          request_id: testRequestId,
          signer_id: 'c0000000-0000-4000-a000-000000000301',
          event_type: type as any,
          timestamp: new Date(),
          ip_address: '192.168.1.1',
          user_agent: 'Mozilla/5.0',
        });

        expect(event.event_type).toBe(type);
      }
    });
  });

  describe('getEventById', () => {
    it('should retrieve event by ID', async () => {
      const event = await repository.getEventById(testEventId);

      expect(event).toBeDefined();
      expect(event?.id).toBe(testEventId);
      expect(event?.request_id).toBe(testRequestId);
    });

    it('should return null for non-existent ID', async () => {
      const event = await repository.getEventById('00000000-0000-4000-a000-ffffffffffff');
      expect(event).toBeNull();
    });
  });

  describe('getEventsByRequest', () => {
    it('should retrieve events by request ID', async () => {
      const events = await repository.getEventsByRequest(testRequestId);

      expect(Array.isArray(events)).toBe(true);
      expect(events.length).toBeGreaterThan(0);
      events.forEach((e) => {
        expect(e.request_id).toBe(testRequestId);
      });
    });

    it('should return empty array for non-existent request', async () => {
      const events = await repository.getEventsByRequest('00000000-0000-4000-a000-fffffffffffc');
      expect(events).toEqual([]);
    });
  });

  describe('getEventsBySigner', () => {
    it('should retrieve events by signer ID', async () => {
      const events = await repository.getEventsBySigner('c0000000-0000-4000-a000-000000000301');

      expect(Array.isArray(events)).toBe(true);
      events.forEach((e) => {
        expect(e.signer_id).toBe('c0000000-0000-4000-a000-000000000301');
      });
    });
  });

  describe('getEventsByType', () => {
    it('should retrieve events by type', async () => {
      const events = await repository.getEventsByType('signed');

      expect(Array.isArray(events)).toBe(true);
      events.forEach((e) => {
        expect(e.event_type).toBe('signed');
      });
    });
  });

  describe('deleteEvent', () => {
    it('should delete an event', async () => {
      const event = await repository.createEvent({
        request_id: testRequestId,
        signer_id: 'c0000000-0000-4000-a000-000000000302',
        event_type: 'viewed',
        timestamp: new Date(),
        ip_address: '192.168.1.2',
        user_agent: 'Chrome',
      });

      await repository.deleteEvent(event.id);

      const deleted = await repository.getEventById(event.id);
      expect(deleted).toBeNull();
    });
  });

  describe('CRUD operations', () => {
    it('should support full CRUD lifecycle', async () => {
      // Create
      const created = await repository.createEvent({
        request_id: testRequestId,
        signer_id: 'c0000000-0000-4000-a000-000000000303',
        event_type: 'signed',
        timestamp: new Date(),
        ip_address: '192.168.1.3',
        user_agent: 'Firefox',
      });

      expect(created.id).toBeDefined();

      // Read
      const read = await repository.getEventById(created.id);
      expect(read?.signer_id).toBe('c0000000-0000-4000-a000-000000000303');

      // Delete
      await repository.deleteEvent(created.id);
      const deleted = await repository.getEventById(created.id);
      expect(deleted).toBeNull();
    });
  });

  describe('edge cases', () => {
    it('should handle different IP addresses', async () => {
      const ips = ['192.168.1.1', '10.0.0.1', '172.16.0.1', '::1'];

      for (const ip of ips) {
        const event = await repository.createEvent({
          request_id: testRequestId,
          signer_id: 'c0000000-0000-4000-a000-000000000301',
          event_type: 'viewed',
          timestamp: new Date(),
          ip_address: ip,
          user_agent: 'Mozilla/5.0',
        });

        expect(event.ip_address).toBe(ip);
      }
    });

    it('should handle long user agents', async () => {
      const longUserAgent = 'A'.repeat(500);

      const event = await repository.createEvent({
        request_id: testRequestId,
        signer_id: 'c0000000-0000-4000-a000-000000000301',
        event_type: 'viewed',
        timestamp: new Date(),
        ip_address: '192.168.1.1',
        user_agent: longUserAgent,
      });

      expect(event.user_agent?.length).toBe(500);
    });

    it('should handle multiple events for same request', async () => {
      const e1 = await repository.createEvent({
        request_id: testRequestId,
        signer_id: 'c0000000-0000-4000-a000-000000000301',
        event_type: 'viewed',
        timestamp: new Date('2024-06-01T10:00:00'),
        ip_address: '192.168.1.1',
        user_agent: 'Mozilla/5.0',
      });

      const e2 = await repository.createEvent({
        request_id: testRequestId,
        signer_id: 'c0000000-0000-4000-a000-000000000301',
        event_type: 'signed',
        timestamp: new Date('2024-06-01T10:05:00'),
        ip_address: '192.168.1.1',
        user_agent: 'Mozilla/5.0',
      });

      expect(e1.id).not.toBe(e2.id);

      const events = await repository.getEventsByRequest(testRequestId);
      expect(events.length).toBeGreaterThanOrEqual(2);
    });
  });
});
