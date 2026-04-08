/**
 * Document Repository - Unit Tests
 * Tests for document management
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { DocumentRepository } from '../documentRepository';
import db from '../../config/knex';
import { CreateDocumentDTO, UpdateDocumentDTO } from '../../types/document';

describe('DocumentRepository', () => {
  let repository: DocumentRepository;
  let testEmployeeId: string;
  let testDocumentId: string;

  beforeAll(async () => {
    repository = new DocumentRepository(db);
    testEmployeeId = crypto.randomUUID();

    // Clean up test data
    await db('documents').del();
  });

  afterAll(async () => {
    await db('documents').del();
  });

  describe('createDocument', () => {
    it('should create document', async () => {
      const data: CreateDocumentDTO = {
        employee_id: testEmployeeId,
        document_type: 'passport',
        document_name: 'Passport',
        file_url: 'https://example.com/passport.pdf',
        expiry_date: '2030-01-01',
      };

      const document = await repository.createDocument(data);

      expect(document).toBeDefined();
      expect(document.id).toBeDefined();
      expect(document.employee_id).toBe(testEmployeeId);
      expect(document.document_type).toBe('passport');

      testDocumentId = document.id;
    });

    it('should create document without expiry', async () => {
      const data: CreateDocumentDTO = {
        employee_id: testEmployeeId,
        document_type: 'aadhar',
        document_name: 'Aadhar Card',
        file_url: 'https://example.com/aadhar.pdf',
      };

      const document = await repository.createDocument(data);

      expect(document.expiry_date).toBeNull();
    });
  });

  describe('getDocument', () => {
    it('should retrieve document by ID', async () => {
      const document = await repository.getDocument(testDocumentId);

      expect(document).toBeDefined();
      expect(document?.id).toBe(testDocumentId);
    });

    it('should return null for non-existent document', async () => {
      const document = await repository.getDocument('00000000-0000-4000-a000-ffffffffffff');

      expect(document).toBeNull();
    });
  });

  describe('updateDocument', () => {
    it('should update document', async () => {
      const updateData: UpdateDocumentDTO = {
        expiry_date: '2031-01-01',
      };

      const updated = await repository.updateDocument(testDocumentId, updateData);

      expect(updated.expiry_date).toBe('2031-01-01');
    });

    it('should throw error for non-existent document', async () => {
      await expect(
        repository.updateDocument('00000000-0000-4000-a000-ffffffffffff', { document_name: 'Test' })
      ).rejects.toThrow();
    });
  });

  describe('getEmployeeDocuments', () => {
    it('should retrieve employee documents', async () => {
      const documents = await repository.getEmployeeDocuments(testEmployeeId);

      expect(Array.isArray(documents)).toBe(true);
      expect(documents.length).toBeGreaterThan(0);
    });
  });

  describe('getDocumentsByType', () => {
    it('should retrieve documents by type', async () => {
      const documents = await repository.getDocumentsByType('passport');

      expect(Array.isArray(documents)).toBe(true);
    });

    it('should filter by employee', async () => {
      const documents = await repository.getDocumentsByType('passport', testEmployeeId);

      expect(Array.isArray(documents)).toBe(true);
    });
  });

  describe('getExpiringDocuments', () => {
    it('should retrieve expiring documents', async () => {
      const documents = await repository.getExpiringDocuments(30);

      expect(Array.isArray(documents)).toBe(true);
    });
  });

  describe('getExpiredDocuments', () => {
    it('should retrieve expired documents', async () => {
      const documents = await repository.getExpiredDocuments();

      expect(Array.isArray(documents)).toBe(true);
    });
  });

  describe('getDocumentCount', () => {
    it('should count documents', async () => {
      const count = await repository.getDocumentCount(testEmployeeId);

      expect(typeof count).toBe('number');
      expect(count).toBeGreaterThan(0);
    });
  });

  describe('searchDocuments', () => {
    it('should search documents by name', async () => {
      const results = await repository.searchDocuments('Passport');

      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe('deleteDocument', () => {
    it('should delete document', async () => {
      const data: CreateDocumentDTO = {
        employee_id: testEmployeeId,
        document_type: 'license',
        document_name: 'Driving License',
        file_url: 'https://example.com/license.pdf',
      };

      const document = await repository.createDocument(data);
      await repository.deleteDocument(document.id);

      const deleted = await repository.getDocument(document.id);
      expect(deleted).toBeNull();
    });
  });
});
