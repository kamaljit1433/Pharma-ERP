import fc from 'fast-check';
import { SupplierBuyerService } from '../supplierBuyerService';
import { SupplierBuyerRepository } from '../../repositories/supplierBuyerRepository';
import { VisitRepository } from '../../repositories/visitRepository';
import { SupplierBuyer, Visit } from '../../types/supplierBuyer';
import { v4 as uuidv4 } from 'uuid';

describe('SupplierBuyerService - Property-Based Tests', () => {
  let service: SupplierBuyerService;
  let supplierBuyerRepository: jest.Mocked<SupplierBuyerRepository>;
  let visitRepository: jest.Mocked<VisitRepository>;

  beforeEach(() => {
    supplierBuyerRepository = {
      createSupplierBuyer: jest.fn(),
      getSupplierBuyerById: jest.fn(),
      getSupplierBuyersByEmployee: jest.fn(),
      getSupplierBuyersByType: jest.fn(),
      updateSupplierBuyer: jest.fn(),
      deleteSupplierBuyer: jest.fn(),
      searchSupplierBuyers: jest.fn(),
      getSupplierBuyerCount: jest.fn(),
    } as any;

    visitRepository = {
      createVisit: jest.fn(),
      getVisitById: jest.fn(),
      getVisitsBySupplierBuyer: jest.fn(),
      getVisitsByEmployee: jest.fn(),
      getVisitsByDateRange: jest.fn(),
      updateVisit: jest.fn(),
      deleteVisit: jest.fn(),
      getVisitHistory: jest.fn(),
      getVisitCount: jest.fn(),
      getRecentVisits: jest.fn(),
    } as any;

    service = new SupplierBuyerService(supplierBuyerRepository, visitRepository);
  });

  // Property 50: Supplier/buyer visit GPS logging
  describe('Property 50: Supplier/buyer visit GPS logging', () => {
    it('should log visits with valid GPS coordinates', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.float({ min: -90, max: 90 }),
          fc.float({ min: -180, max: 180 }),
          fc.string({ minLength: 1, maxLength: 255 }),
          async (latitude, longitude, purpose) => {
            const employeeId = uuidv4();
            const supplierBuyerId = uuidv4();
            const mockSupplierBuyer: SupplierBuyer = {
              id: supplierBuyerId,
              employee_id: employeeId,
              name: 'Test Supplier',
              type: 'supplier',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };

            const mockVisit: Visit = {
              id: uuidv4(),
              record_id: supplierBuyerId,
              supplier_buyer_id: supplierBuyerId,
              employee_id: employeeId,
              visit_date: new Date().toISOString(),
              latitude,
              longitude,
              purpose,
              created_at: new Date().toISOString(),
            };

            supplierBuyerRepository.getSupplierBuyerById.mockResolvedValue(mockSupplierBuyer);
            visitRepository.createVisit.mockResolvedValue(mockVisit);

            const visit = await service.logVisit(supplierBuyerId, employeeId, {
              visit_date: new Date().toISOString(),
              latitude,
              longitude,
              purpose,
            });

            expect(visit.latitude).toBe(latitude);
            expect(visit.longitude).toBe(longitude);
            expect(visit.purpose).toBe(purpose);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should handle visits without GPS coordinates', async () => {
      await fc.assert(
        fc.asyncProperty(fc.string({ minLength: 1, maxLength: 255 }), async (purpose) => {
          const employeeId = uuidv4();
          const supplierBuyerId = uuidv4();
          const mockSupplierBuyer: SupplierBuyer = {
            id: supplierBuyerId,
            employee_id: employeeId,
            name: 'Test Supplier',
            type: 'supplier',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          const mockVisit: Visit = {
            id: uuidv4(),
            supplier_buyer_id: supplierBuyerId,
            employee_id: employeeId,
            visit_date: new Date().toISOString(),
            purpose,
            created_at: new Date().toISOString(),
          };

          supplierBuyerRepository.getSupplierBuyerById.mockResolvedValue(mockSupplierBuyer);
          visitRepository.createVisit.mockResolvedValue(mockVisit);

          const visit = await service.logVisit(supplierBuyerId, employeeId, {
            visit_date: new Date().toISOString(),
            purpose,
          });

          expect(visit.purpose).toBe(purpose);
        }),
        { numRuns: 50 }
      );
    });
  });

  // Property: Supplier/buyer name validation
  describe('Property: Supplier/buyer name validation', () => {
    it('should reject empty or whitespace-only names', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 0, maxLength: 10 }).filter((s) => s.trim().length === 0),
          async (name) => {
            try {
              await service.createSupplierBuyer(uuidv4(), {
                name,
                type: 'supplier',
              });
              throw new Error('Should have thrown');
            } catch (err: any) {
              expect(err.message).toContain('Supplier/Buyer name is required');
            }
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should accept valid non-empty names', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 100 }).filter((s) => s.trim().length > 0),
          async (name) => {
            const employeeId = uuidv4();
            const mockSupplierBuyer: SupplierBuyer = {
              id: uuidv4(),
              employee_id: employeeId,
              name,
              type: 'supplier',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };

            supplierBuyerRepository.createSupplierBuyer.mockResolvedValue(mockSupplierBuyer);

            const result = await service.createSupplierBuyer(employeeId, {
              name,
              type: 'supplier',
            });

            expect(result.name).toBe(name);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  // Property: Type validation
  describe('Property: Type validation', () => {
    it('should only accept "supplier" or "buyer" types', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }).filter((s) => !['supplier', 'buyer'].includes(s)),
          async (invalidType) => {
            try {
              await service.createSupplierBuyer(uuidv4(), {
                name: 'Test',
                type: invalidType as any,
              });
              throw new Error('Should have thrown');
            } catch (err: any) {
              expect(err.message).toContain('Type must be either "supplier" or "buyer"');
            }
          }
        ),
        { numRuns: 30 }
      );
    });
  });

  // Property: Visit date requirement
  describe('Property: Visit date requirement', () => {
    it('should require visit date for all visits', async () => {
      await fc.assert(
        fc.asyncProperty(fc.string({ maxLength: 5 }), async (visitDate) => {
          const employeeId = uuidv4();
          const supplierBuyerId = uuidv4();
          const mockSupplierBuyer: SupplierBuyer = {
            id: supplierBuyerId,
            employee_id: employeeId,
            name: 'Test Supplier',
            type: 'supplier',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          supplierBuyerRepository.getSupplierBuyerById.mockResolvedValue(mockSupplierBuyer);

          try {
            await service.logVisit(supplierBuyerId, employeeId, {
              visit_date: visitDate,
            });
            // If visit_date is empty, should throw
            if (!visitDate || visitDate.trim().length === 0) {
              throw new Error('Should have thrown');
            }
          } catch (err: any) {
            if (!visitDate || visitDate.trim().length === 0) {
              expect(err.message).toContain('Visit date is required');
            }
          }
        }),
        { numRuns: 30 }
      );
    });
  });

  // Property: Visit limit validation
  describe('Property: Visit limit validation', () => {
    it('should enforce limit boundaries (1-100)', async () => {
      await fc.assert(
        fc.asyncProperty(fc.integer(), async (limit) => {
          const employeeId = uuidv4();
          const supplierBuyerId = uuidv4();
          const mockSupplierBuyer: SupplierBuyer = {
            id: supplierBuyerId,
            employee_id: employeeId,
            name: 'Test Supplier',
            type: 'supplier',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          supplierBuyerRepository.getSupplierBuyerById.mockResolvedValue(mockSupplierBuyer);

          try {
            await service.getRecentVisits(supplierBuyerId, limit);
            // Should only succeed if limit is between 1 and 100
            expect(limit).toBeGreaterThanOrEqual(1);
            expect(limit).toBeLessThanOrEqual(100);
          } catch (err: any) {
            // Should fail if limit is outside range
            expect(limit < 1 || limit > 100).toBe(true);
            expect(err.message).toContain('Limit must be between 1 and 100');
          }
        }),
        { numRuns: 50 }
      );
    });
  });

  // Property: Employee authorization for visits
  describe('Property: Employee authorization for visits', () => {
    it('should only allow record owner to log visits', async () => {
      await fc.assert(
        fc.asyncProperty(fc.uuid(), fc.uuid(), async (employeeId1, employeeId2) => {
          fc.pre(employeeId1 !== employeeId2);

          const supplierBuyerId = uuidv4();
          const mockSupplierBuyer: SupplierBuyer = {
            id: supplierBuyerId,
            employee_id: employeeId1,
            name: 'Test Supplier',
            type: 'supplier',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          supplierBuyerRepository.getSupplierBuyerById.mockResolvedValue(mockSupplierBuyer);

          try {
            await service.logVisit(supplierBuyerId, employeeId2, {
              visit_date: new Date().toISOString(),
            });
            throw new Error('Should have thrown');
          } catch (err: any) {
            expect(err.message).toContain('Unauthorized');
          }
        }),
        { numRuns: 30 }
      );
    });
  });

  // Property: Search term handling
  describe('Property: Search term handling', () => {
    it('should handle empty search terms gracefully', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ maxLength: 5 }).filter((s) => s.trim().length === 0),
          async (searchTerm) => {
            const employeeId = uuidv4();
            const mockRecords: SupplierBuyer[] = [
              {
                id: uuidv4(),
                employee_id: employeeId,
                name: 'Test Supplier',
                type: 'supplier',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
            ];

            supplierBuyerRepository.getSupplierBuyersByEmployee.mockResolvedValue(mockRecords);

            const result = await service.searchSupplierBuyers(employeeId, searchTerm);
            expect(result).toEqual(mockRecords);
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should pass non-empty search terms to repository', async () => {
      await fc.assert(
        fc.asyncProperty(fc.string({ minLength: 1, maxLength: 100 }), async (searchTerm) => {
          const employeeId = uuidv4();
          const mockRecords: SupplierBuyer[] = [];

          supplierBuyerRepository.searchSupplierBuyers.mockResolvedValue(mockRecords);

          await service.searchSupplierBuyers(employeeId, searchTerm);
          expect(supplierBuyerRepository.searchSupplierBuyers).toHaveBeenCalledWith(employeeId, searchTerm);
        }),
        { numRuns: 50 }
      );
    });
  });

  // Property: Record not found handling
  describe('Property: Record not found handling', () => {
    it('should consistently throw error for non-existent records', async () => {
      await fc.assert(
        fc.asyncProperty(fc.uuid(), async (recordId) => {
          supplierBuyerRepository.getSupplierBuyerById.mockResolvedValue(null);

          try {
            await service.getSupplierBuyer(recordId);
            throw new Error('Should have thrown');
          } catch (err: any) {
            expect(err.message).toContain('not found');
          }
        }),
        { numRuns: 30 }
      );
    });
  });

  // Property: Visit count consistency
  describe('Property: Visit count consistency', () => {
    it('should return non-negative visit counts', async () => {
      await fc.assert(
        fc.asyncProperty(fc.integer({ min: 0, max: 1000 }), async (count) => {
          const employeeId = uuidv4();
          const supplierBuyerId = uuidv4();
          const mockSupplierBuyer: SupplierBuyer = {
            id: supplierBuyerId,
            employee_id: employeeId,
            name: 'Test Supplier',
            type: 'supplier',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          supplierBuyerRepository.getSupplierBuyerById.mockResolvedValue(mockSupplierBuyer);
          visitRepository.getVisitCount.mockResolvedValue(count);

          const result = await service.getVisitCount(supplierBuyerId);
          expect(result).toBe(count);
          expect(result).toBeGreaterThanOrEqual(0);
        }),
        { numRuns: 50 }
      );
    });
  });
});
