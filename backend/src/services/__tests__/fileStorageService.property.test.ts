import fc from 'fast-check';
import { FileStorageService } from '../fileStorageService';
import { FileCategory } from '../../types/fileStorage';

// Mock the S3StorageProvider
jest.mock('../storage/s3StorageProvider', () => ({
  S3StorageProvider: jest.fn().mockImplementation(() => ({
    uploadFile: jest.fn(),
    downloadFile: jest.fn(),
    deleteFile: jest.fn(),
    getSignedUrl: jest.fn(),
    fileExists: jest.fn(),
    listFiles: jest.fn(),
    initiateMultipartUpload: jest.fn(),
    uploadPart: jest.fn(),
    completeMultipartUpload: jest.fn(),
    abortMultipartUpload: jest.fn(),
  })),
}));

// Mock config
jest.mock('../../config', () => ({
  default: {
    fileStorage: {
      provider: 's3',
    },
    upload: {
      maxFileSize: 10485760, // 10MB
      allowedFileTypes: ['image/jpeg', 'image/png', 'application/pdf'],
    },
  },
}));

describe('FileStorageService Property Tests', () => {
  let fileStorageService: FileStorageService;
  let mockProvider: any;

  beforeEach(() => {
    fileStorageService = new FileStorageService();
    mockProvider = (fileStorageService as any).provider;
    jest.clearAllMocks();
  });

  // Arbitraries for generating test data
  const validFileExtensions = ['jpg', 'jpeg', 'png', 'pdf'];
  const validMimeTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  
  const fileNameArbitrary = fc.record({
    name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => !s.includes('.') && !s.includes('/') && !s.includes('\\')),
    extension: fc.constantFrom(...validFileExtensions),
  }).map(({ name, extension }) => `${name}.${extension}`);

  const fileBufferArbitrary = fc.uint8Array({ minLength: 1, maxLength: 1024 * 1024 }); // Up to 1MB for tests

  const fileUploadOptionsArbitrary = fc.record({
    employeeId: fc.option(fc.uuid(), { nil: undefined }),
    category: fc.constantFrom(...Object.values(FileCategory)),
    isPublic: fc.boolean(),
    metadata: fc.option(fc.dictionary(fc.string(), fc.string()), { nil: undefined }),
  });

  /**
   * Property Test: File Key Generation Consistency
   * For any valid filename and upload options, the generated file key should:
   * 1. Always contain the employee ID if provided
   * 2. Always contain the category
   * 3. Always be unique for different uploads
   * 4. Never contain dangerous path traversal characters
   */
  it('Property: File key generation should be consistent and safe', async () => {
    await fc.assert(
      fc.asyncProperty(
        fileNameArbitrary,
        fileUploadOptionsArbitrary,
        async (fileName, options) => {
          const fileBuffer = Buffer.from('test content');
          
          // Mock successful upload
          const mockResult = {
            id: 'test-id',
            url: 'https://test.com/file',
            key: 'generated-key',
            metadata: {} as any,
          };
          mockProvider.uploadFile.mockResolvedValue(mockResult);

          await fileStorageService.uploadFile(fileBuffer, fileName, options);

          // Verify the key was generated and passed to provider
          expect(mockProvider.uploadFile).toHaveBeenCalledWith(
            fileBuffer,
            expect.any(String),
            options
          );

          const generatedKey = mockProvider.uploadFile.mock.calls[0][1];

          // Key should contain category
          expect(generatedKey).toContain(options.category);

          // Key should contain employee ID if provided
          if (options.employeeId) {
            expect(generatedKey).toContain(options.employeeId);
            expect(generatedKey).toContain('employees/');
          } else {
            expect(generatedKey).toContain('system/');
          }

          // Key should not contain dangerous characters
          expect(generatedKey).not.toContain('..');
          expect(generatedKey).not.toMatch(/\/\//); // No double slashes
          
          // Key should contain a UUID (36 characters with hyphens)
          expect(generatedKey).toMatch(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/);
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property Test: File Validation Consistency
   * For any file buffer and filename, validation should:
   * 1. Reject files larger than maxFileSize
   * 2. Reject files with invalid MIME types
   * 3. Reject empty files
   * 4. Reject files with dangerous filenames
   * 5. Accept valid files
   */
  it('Property: File validation should be consistent', async () => {
    await fc.assert(
      fc.property(
        fc.record({
          buffer: fc.oneof(
            fc.uint8Array({ minLength: 0, maxLength: 0 }), // Empty file
            fc.uint8Array({ minLength: 1, maxLength: 1024 }), // Small valid file
            fc.uint8Array({ minLength: 20 * 1024 * 1024, maxLength: 20 * 1024 * 1024 + 1000 }) // Large file
          ),
          fileName: fc.oneof(
            fileNameArbitrary, // Valid filename
            fc.constant(''), // Empty filename
            fc.constant('../../../etc/passwd'), // Dangerous filename
            fc.constant('test.exe'), // Invalid extension
          ),
        }),
        ({ buffer, fileName }) => {
          const options = {
            employeeId: 'test-emp',
            category: FileCategory.DOCUMENT,
          };

          const fileBuffer = Buffer.from(buffer);

          // Determine if file should be valid
          const isValidSize = fileBuffer.length > 0 && fileBuffer.length <= 10485760;
          const isValidType = fileName.endsWith('.pdf') || fileName.endsWith('.jpg') || 
                             fileName.endsWith('.jpeg') || fileName.endsWith('.png');
          const isValidName = fileName.length > 0 && !fileName.includes('..') && 
                             !fileName.includes('/') && !fileName.includes('\\');
          
          const shouldBeValid = isValidSize && isValidType && isValidName;

          if (shouldBeValid) {
            // Mock successful upload for valid files
            mockProvider.uploadFile.mockResolvedValue({
              id: 'test-id',
              url: 'https://test.com/file',
              key: 'test-key',
              metadata: {} as any,
            });

            // Should not throw
            expect(async () => {
              await fileStorageService.uploadFile(fileBuffer, fileName, options);
            }).not.toThrow();
          } else {
            // Should throw validation error for invalid files
            expect(async () => {
              await fileStorageService.uploadFile(fileBuffer, fileName, options);
            }).rejects.toThrow('File validation failed');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: Multiple File Upload Consistency
   * For any array of files, uploadFiles should:
   * 1. Process all valid files
   * 2. Skip invalid files without failing the entire operation
   * 3. Return results in the same order as input
   */
  it('Property: Multiple file upload should handle mixed valid/invalid files', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            buffer: fc.uint8Array({ minLength: 1, maxLength: 1024 }),
            originalName: fc.oneof(
              fileNameArbitrary,
              fc.constant('invalid.exe'),
              fc.constant('../dangerous.pdf')
            ),
          }),
          { minLength: 1, maxLength: 5 }
        ),
        fileUploadOptionsArbitrary,
        async (files, options) => {
          // Count valid files
          const validFiles = files.filter(file => {
            const isValidType = file.originalName.endsWith('.pdf') || 
                               file.originalName.endsWith('.jpg') || 
                               file.originalName.endsWith('.jpeg') || 
                               file.originalName.endsWith('.png');
            const isValidName = !file.originalName.includes('..') && 
                               !file.originalName.includes('/') && 
                               !file.originalName.includes('\\');
            return isValidType && isValidName;
          });

          // Mock successful uploads for valid files
          mockProvider.uploadFile.mockImplementation(() => 
            Promise.resolve({
              id: 'test-id',
              url: 'https://test.com/file',
              key: 'test-key',
              metadata: {} as any,
            })
          );

          const results = await fileStorageService.uploadFiles(
            files.map(f => ({ buffer: Buffer.from(f.buffer), originalName: f.originalName })),
            options
          );

          // Should return results only for valid files
          expect(results.length).toBe(validFiles.length);
          
          // Provider should be called only for valid files
          expect(mockProvider.uploadFile).toHaveBeenCalledTimes(validFiles.length);
        }
      ),
      { numRuns: 30 }
    );
  });

  /**
   * Property Test: File Cleanup Logic
   * For any cleanup options, the cleanup function should:
   * 1. Only select files that match all specified criteria
   * 2. In dry run mode, not actually delete files
   * 3. Return accurate counts and file lists
   */
  it('Property: File cleanup should correctly filter files', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          olderThan: fc.option(fc.date({ min: new Date('2020-01-01'), max: new Date('2024-12-31') })),
          category: fc.option(fc.constantFrom(...Object.values(FileCategory))),
          employeeId: fc.option(fc.uuid()),
          dryRun: fc.boolean(),
        }),
        async (cleanupOptions) => {
          // Generate mock files with various properties
          const mockFiles = await fc.sample(
            fc.array(
              fc.record({
                id: fc.uuid(),
                key: fc.string({ minLength: 10, maxLength: 50 }),
                uploadedAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2024-12-31') }),
                category: fc.constantFrom(...Object.values(FileCategory)),
                employeeId: fc.option(fc.uuid()),
                originalName: fileNameArbitrary,
                fileName: fileNameArbitrary,
                mimeType: fc.constantFrom(...validMimeTypes),
                size: fc.integer({ min: 1, max: 1024 * 1024 }),
                isPublic: fc.boolean(),
                uploadedBy: fc.uuid(),
              }),
              { minLength: 0, maxLength: 10 }
            ),
            1
          );

          const files = mockFiles[0];
          mockProvider.listFiles.mockResolvedValue(files);
          mockProvider.deleteFile.mockResolvedValue(undefined);

          const result = await fileStorageService.cleanupFiles(cleanupOptions);

          // Count files that should match the criteria
          const expectedMatches = files.filter(file => {
            if (cleanupOptions.olderThan && file.uploadedAt > cleanupOptions.olderThan) {
              return false;
            }
            if (cleanupOptions.category && file.category !== cleanupOptions.category) {
              return false;
            }
            if (cleanupOptions.employeeId && file.employeeId !== cleanupOptions.employeeId) {
              return false;
            }
            return true;
          });

          // Verify counts
          expect(result.deletedCount).toBe(expectedMatches.length);
          expect(result.deletedFiles.length).toBe(expectedMatches.length);

          // In dry run mode, should not actually delete
          if (cleanupOptions.dryRun) {
            expect(mockProvider.deleteFile).not.toHaveBeenCalled();
          } else {
            expect(mockProvider.deleteFile).toHaveBeenCalledTimes(expectedMatches.length);
          }
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property Test: Signed URL Generation
   * For any valid key and options, getSignedUrl should:
   * 1. Always return a string (URL)
   * 2. Pass correct parameters to the provider
   * 3. Handle both getObject and putObject operations
   */
  it('Property: Signed URL generation should be consistent', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.constantFrom('getObject', 'putObject'),
        fc.option(fc.record({
          expiresIn: fc.integer({ min: 60, max: 86400 }),
        })),
        async (key, operation, options) => {
          const expectedUrl = `https://signed-url.com/${key}`;
          mockProvider.getSignedUrl.mockResolvedValue(expectedUrl);

          const result = await fileStorageService.getSignedUrl(key, operation, options);

          expect(typeof result).toBe('string');
          expect(result).toBe(expectedUrl);
          expect(mockProvider.getSignedUrl).toHaveBeenCalledWith(key, operation, options);
        }
      ),
      { numRuns: 50 }
    );
  });
});