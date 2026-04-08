import fc from 'fast-check';
import { FileStorageService } from '../../services/fileStorageService';
import { S3StorageProvider } from '../../services/storage/s3StorageProvider';
import { FileCategory } from '../../types/fileStorage';

// Mock the S3StorageProvider
jest.mock('../../services/storage/s3StorageProvider');
jest.mock('../../config', () => ({
  fileStorage: {
    provider: 's3',
  },
}));

describe('FileStorageService - Deletion and Cleanup Property Tests', () => {
  let fileStorageService: FileStorageService;
  let mockProvider: jest.Mocked<S3StorageProvider>;

  beforeEach(() => {
    jest.clearAllMocks();
    fileStorageService = new FileStorageService();
    mockProvider = (fileStorageService as any).provider as jest.Mocked<S3StorageProvider>;
  });

  /**
   * Property 1: File Deletion Audit Logging Consistency
   * For any file deletion operation with user context, audit logs must be generated
   * with consistent structure and required fields.
   */
  it('Property 1: File deletion audit logging consistency', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 100 }), // file key
        fc.record({
          userId: fc.string({ minLength: 1, maxLength: 50 }),
          role: fc.constantFrom('employee', 'manager', 'admin', 'super_admin'),
          employeeId: fc.string({ minLength: 1, maxLength: 50 }),
        }), // user context
        async (fileKey, userContext) => {
          mockProvider.fileExists.mockResolvedValue(true);
          mockProvider.deleteFile.mockResolvedValue();

          const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

          await fileStorageService.deleteFile(fileKey, userContext);

          // Verify audit log was generated
          expect(consoleSpy).toHaveBeenCalledWith('File Deletion:', expect.objectContaining({
            timestamp: expect.any(String),
            userId: userContext.userId,
            employeeId: userContext.employeeId,
            role: userContext.role,
            fileKey: fileKey,
            action: 'delete',
          }));

          consoleSpy.mockRestore();
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property 2: Bulk Deletion Result Consistency
   * For any array of file keys, the sum of deleted and failed counts must equal
   * the total number of input keys.
   */
  it('Property 2: Bulk deletion result consistency', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.string({ minLength: 1, maxLength: 100 }), { minLength: 1, maxLength: 50 }),
        async (fileKeys) => {
          // Mock provider bulk delete
          const mockResult = {
            deleted: fileKeys.slice(0, Math.floor(fileKeys.length / 2)),
            failed: fileKeys.slice(Math.floor(fileKeys.length / 2)).map(key => ({
              key,
              error: 'Mock error',
            })),
          };

          mockProvider.deleteFiles = jest.fn().mockResolvedValue(mockResult);

          const result = await fileStorageService.deleteFiles(fileKeys);

          // Property: deleted count + failed count = total input count
          expect(result.deleted.length + result.failed.length).toBe(fileKeys.length);

          // Property: no duplicate keys in results
          const allResultKeys = [...result.deleted, ...result.failed.map(f => f.key)];
          const uniqueResultKeys = new Set(allResultKeys);
          expect(uniqueResultKeys.size).toBe(allResultKeys.length);

          // Property: all result keys must be from input
          for (const key of allResultKeys) {
            expect(fileKeys).toContain(key);
          }
        }
      ),
      { numRuns: 30 }
    );
  });

  /**
   * Property 3: File Cleanup Age Filter Correctness
   * For any cleanup operation with an age threshold, only files older than
   * the threshold should be selected for deletion.
   */
  it('Property 3: File cleanup age filter correctness', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.date({ min: new Date('2020-01-01'), max: new Date('2024-12-31') }), // threshold date
        fc.array(
          fc.record({
            id: fc.string(),
            key: fc.string({ minLength: 1, maxLength: 100 }),
            category: fc.constantFrom(...Object.values(FileCategory)),
            uploadedAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2024-12-31') }),
            employeeId: fc.string({ minLength: 1, maxLength: 50 }),
          }),
          { minLength: 1, maxLength: 20 }
        ), // mock files
        async (thresholdDate, mockFiles) => {
          mockProvider.listFiles.mockResolvedValue(mockFiles as any);

          const options = {
            olderThan: thresholdDate,
            dryRun: true,
          };

          const result = await fileStorageService.cleanupFiles(options);

          // Property: all files in result must be older than threshold
          const expectedOldFiles = mockFiles.filter(file => file.uploadedAt < thresholdDate);
          expect(result.deletedCount).toBe(expectedOldFiles.length);
          expect(result.deletedFiles.length).toBe(expectedOldFiles.length);

          // Property: all selected files must be older than threshold
          for (const fileKey of result.deletedFiles) {
            const file = mockFiles.find(f => f.key === fileKey);
            expect(file).toBeDefined();
            expect(file!.uploadedAt.getTime()).toBeLessThan(thresholdDate.getTime());
          }
        }
      ),
      { numRuns: 30 }
    );
  });

  /**
   * Property 4: File Cleanup Category Filter Correctness
   * For any cleanup operation with a category filter, only files matching
   * the specified category should be selected for deletion.
   */
  it('Property 4: File cleanup category filter correctness', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...Object.values(FileCategory)), // target category
        fc.array(
          fc.record({
            id: fc.string(),
            key: fc.string({ minLength: 1, maxLength: 100 }),
            category: fc.constantFrom(...Object.values(FileCategory)),
            uploadedAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2024-12-31') }),
            employeeId: fc.string({ minLength: 1, maxLength: 50 }),
          }),
          { minLength: 1, maxLength: 20 }
        ), // mock files
        async (targetCategory, mockFiles) => {
          mockProvider.listFiles.mockResolvedValue(mockFiles as any);

          const options = {
            category: targetCategory,
            dryRun: true,
          };

          const result = await fileStorageService.cleanupFiles(options);

          // Property: all files in result must match target category
          const expectedCategoryFiles = mockFiles.filter(file => file.category === targetCategory);
          expect(result.deletedCount).toBe(expectedCategoryFiles.length);

          // Property: all selected files must have target category
          for (const fileKey of result.deletedFiles) {
            const file = mockFiles.find(f => f.key === fileKey);
            expect(file).toBeDefined();
            expect(file!.category).toBe(targetCategory);
          }
        }
      ),
      { numRuns: 30 }
    );
  });

  /**
   * Property 5: File Cleanup Employee Filter Correctness
   * For any cleanup operation with an employee filter, only files belonging
   * to the specified employee should be selected for deletion.
   */
  it('Property 5: File cleanup employee filter correctness', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 50 }), // target employee ID
        fc.array(
          fc.record({
            id: fc.string(),
            key: fc.string({ minLength: 1, maxLength: 100 }),
            category: fc.constantFrom(...Object.values(FileCategory)),
            uploadedAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2024-12-31') }),
            employeeId: fc.string({ minLength: 1, maxLength: 50 }),
          }),
          { minLength: 1, maxLength: 20 }
        ), // mock files
        async (targetEmployeeId, mockFiles) => {
          mockProvider.listFiles.mockResolvedValue(mockFiles as any);

          const options = {
            employeeId: targetEmployeeId,
            dryRun: true,
          };

          const result = await fileStorageService.cleanupFiles(options);

          // Property: all files in result must belong to target employee
          const expectedEmployeeFiles = mockFiles.filter(file => file.employeeId === targetEmployeeId);
          expect(result.deletedCount).toBe(expectedEmployeeFiles.length);

          // Property: all selected files must belong to target employee
          for (const fileKey of result.deletedFiles) {
            const file = mockFiles.find(f => f.key === fileKey);
            expect(file).toBeDefined();
            expect(file!.employeeId).toBe(targetEmployeeId);
          }
        }
      ),
      { numRuns: 30 }
    );
  });

  /**
   * Property 6: Dry Run Safety
   * For any cleanup operation with dryRun=true, no actual deletion operations
   * should be performed, but the count and list should be accurate.
   */
  it('Property 6: Dry run safety', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            id: fc.string(),
            key: fc.string({ minLength: 1, maxLength: 100 }),
            category: fc.constantFrom(...Object.values(FileCategory)),
            uploadedAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2023-12-31') }),
            employeeId: fc.string({ minLength: 1, maxLength: 50 }),
          }),
          { minLength: 1, maxLength: 20 }
        ), // mock files
        async (mockFiles) => {
          mockProvider.listFiles.mockResolvedValue(mockFiles as any);

          const options = {
            olderThan: new Date('2024-01-01'), // All files should be older
            dryRun: true,
          };

          const result = await fileStorageService.cleanupFiles(options);

          // Property: dry run should not call delete operations
          expect(mockProvider.deleteFile).not.toHaveBeenCalled();

          // Property: dry run should return accurate counts
          expect(result.deletedCount).toBe(mockFiles.length);
          expect(result.deletedFiles.length).toBe(mockFiles.length);
          expect(result.errors.length).toBe(0);

          // Property: all file keys should be in the result
          const resultKeys = new Set(result.deletedFiles);
          for (const file of mockFiles) {
            expect(resultKeys.has(file.key)).toBe(true);
          }
        }
      ),
      { numRuns: 30 }
    );
  });

  /**
   * Property 7: Orphaned File Detection Consistency
   * For any set of files, orphaned file detection should consistently identify
   * files based on age and metadata criteria.
   */
  it('Property 7: Orphaned file detection consistency', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            id: fc.string(),
            key: fc.string({ minLength: 1, maxLength: 100 }),
            category: fc.constantFrom(...Object.values(FileCategory)),
            uploadedAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2024-12-31') }),
            employeeId: fc.string({ minLength: 1, maxLength: 50 }),
            metadata: fc.oneof(
              fc.constant({}), // Empty metadata (potential orphan)
              fc.record({ documentId: fc.string() }), // Has metadata (not orphan)
            ),
          }),
          { minLength: 1, maxLength: 20 }
        ), // mock files
        async (mockFiles) => {
          mockProvider.listFiles.mockResolvedValue(mockFiles as any);

          const result = await fileStorageService.cleanupOrphanedFiles(undefined, true);

          // Property: orphaned files should be old files with empty metadata
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

          const expectedOrphans = mockFiles.filter(file => 
            file.uploadedAt < thirtyDaysAgo && 
            (!file.metadata || Object.keys(file.metadata).length === 0)
          );

          expect(result.orphanedCount).toBe(expectedOrphans.length);

          // Property: dry run should not delete anything
          expect(result.deletedCount).toBe(0);
          expect(mockProvider.deleteFile).not.toHaveBeenCalled();
        }
      ),
      { numRuns: 30 }
    );
  });

  /**
   * Property 8: Audit Log Timestamp Ordering
   * For any sequence of file operations, audit log timestamps should be
   * in chronological order (non-decreasing).
   */
  it('Property 8: Audit log timestamp ordering', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.string({ minLength: 1, maxLength: 100 }), { minLength: 2, maxLength: 10 }),
        fc.record({
          userId: fc.string({ minLength: 1, maxLength: 50 }),
          role: fc.constantFrom('employee', 'manager', 'admin', 'super_admin'),
          employeeId: fc.string({ minLength: 1, maxLength: 50 }),
        }),
        async (fileKeys, userContext) => {
          mockProvider.fileExists.mockResolvedValue(true);
          mockProvider.deleteFile.mockResolvedValue();

          const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
          const loggedTimestamps: string[] = [];

          // Override console.log to capture timestamps
          consoleSpy.mockImplementation((message, data) => {
            if (typeof data === 'object' && data.timestamp) {
              loggedTimestamps.push(data.timestamp);
            }
          });

          // Delete files sequentially
          for (const fileKey of fileKeys) {
            await fileStorageService.deleteFile(fileKey, userContext);
          }

          // Property: timestamps should be in non-decreasing order
          for (let i = 1; i < loggedTimestamps.length; i++) {
            const prevTime = new Date(loggedTimestamps[i - 1]!).getTime();
            const currTime = new Date(loggedTimestamps[i]!).getTime();
            expect(currTime).toBeGreaterThanOrEqual(prevTime);
          }

          consoleSpy.mockRestore();
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property 9: Cleanup Filter Combination Correctness
   * For any combination of cleanup filters (age, category, employee),
   * the result should satisfy ALL specified criteria.
   */
  it('Property 9: Cleanup filter combination correctness', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          olderThan: fc.option(fc.date({ min: new Date('2020-01-01'), max: new Date('2024-12-31') })),
          category: fc.option(fc.constantFrom(...Object.values(FileCategory))),
          employeeId: fc.option(fc.string({ minLength: 1, maxLength: 50 })),
        }),
        fc.array(
          fc.record({
            id: fc.string(),
            key: fc.string({ minLength: 1, maxLength: 100 }),
            category: fc.constantFrom(...Object.values(FileCategory)),
            uploadedAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2024-12-31') }),
            employeeId: fc.string({ minLength: 1, maxLength: 50 }),
          }),
          { minLength: 1, maxLength: 20 }
        ),
        async (filters, mockFiles) => {
          mockProvider.listFiles.mockResolvedValue(mockFiles as any);

          const options = {
            ...filters,
            dryRun: true,
          };

          const result = await fileStorageService.cleanupFiles(options);

          // Property: all selected files must satisfy ALL specified filters
          for (const fileKey of result.deletedFiles) {
            const file = mockFiles.find(f => f.key === fileKey);
            expect(file).toBeDefined();

            if (filters.olderThan) {
              expect(file!.uploadedAt.getTime()).toBeLessThan(filters.olderThan.getTime());
            }

            if (filters.category) {
              expect(file!.category).toBe(filters.category);
            }

            if (filters.employeeId) {
              expect(file!.employeeId).toBe(filters.employeeId);
            }
          }

          // Property: count should match the number of files satisfying all filters
          const expectedFiles = mockFiles.filter(file => {
            if (filters.olderThan && file.uploadedAt >= filters.olderThan) return false;
            if (filters.category && file.category !== filters.category) return false;
            if (filters.employeeId && file.employeeId !== filters.employeeId) return false;
            return true;
          });

          expect(result.deletedCount).toBe(expectedFiles.length);
        }
      ),
      { numRuns: 30 }
    );
  });

  /**
   * Property 10: Error Handling Consistency
   * For any bulk deletion operation, the total number of operations attempted
   * should equal the sum of successful and failed operations.
   */
  it('Property 10: Error handling consistency', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.string({ minLength: 1, maxLength: 100 }), { minLength: 1, maxLength: 20 }),
        fc.float({ min: 0, max: 1 }), // failure rate
        async (fileKeys, failureRate) => {
          // Mock provider to fail some operations based on failure rate
          mockProvider.deleteFiles = undefined; // Force fallback to individual deletions
          mockProvider.fileExists.mockImplementation(async (key) => {
            return Math.random() > failureRate / 2; // Some files don't exist
          });
          mockProvider.deleteFile.mockImplementation(async (key) => {
            if (Math.random() < failureRate) {
              throw new Error('Mock deletion error');
            }
          });

          const result = await fileStorageService.deleteFiles(fileKeys);

          // Property: total operations = successful + failed
          expect(result.deleted.length + result.failed.length).toBe(fileKeys.length);

          // Property: no duplicate keys in results
          const allKeys = [...result.deleted, ...result.failed.map(f => f.key)];
          const uniqueKeys = new Set(allKeys);
          expect(uniqueKeys.size).toBe(allKeys.length);

          // Property: all result keys must be from input
          for (const key of allKeys) {
            expect(fileKeys).toContain(key);
          }
        }
      ),
      { numRuns: 20 }
    );
  });
});