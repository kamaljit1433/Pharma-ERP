import fc from 'fast-check';
import { FileValidationService } from '../../services/fileValidationService';

describe('FileValidationService Property Tests', () => {
  /**
   * Property: File validation consistency
   * For any valid file buffer and filename, validation should be deterministic
   */
  it('Property: File validation should be consistent', async () => {
    await fc.assert(
      fc.property(
        fc.uint8Array({ minLength: 1, maxLength: 1024 }), // File content
        fc.string({ minLength: 1, maxLength: 100 }).filter(s => !s.includes('\0') && !s.includes('/')), // Filename
        fc.constantFrom('document', 'profile-photo', 'certificate', 'payslip', 'contract'), // Category
        (fileContent, filename, category) => {
          const buffer = Buffer.from(fileContent);
          const result1 = FileValidationService.validateFile(buffer, filename + '.pdf', { category });
          const result2 = FileValidationService.validateFile(buffer, filename + '.pdf', { category });
          
          // Validation should be deterministic
          expect(result1.isValid).toBe(result2.isValid);
          expect(result1.errors).toEqual(result2.errors);
          expect(result1.category).toBe(result2.category);
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Category limits consistency
   * For any category, limits should be consistent and valid
   */
  it('Property: Category limits should be consistent and valid', async () => {
    await fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }), // Category name
        (category) => {
          const limits1 = FileValidationService.getCategoryLimits(category);
          const limits2 = FileValidationService.getCategoryLimits(category);
          
          // Should return same limits for same category
          expect(limits1.maxFileSize).toBe(limits2.maxFileSize);
          expect(limits1.allowedFileTypes).toEqual(limits2.allowedFileTypes);
          
          // Limits should be positive
          expect(limits1.maxFileSize).toBeGreaterThan(0);
          expect(limits1.allowedFileTypes.length).toBeGreaterThan(0);
          
          // All MIME types should be valid format
          limits1.allowedFileTypes.forEach(mimeType => {
            expect(mimeType).toMatch(/^[a-z]+\/[a-z0-9\-\+\.]+$/);
          });
        }
      ),
      { numRuns: 30 }
    );
  });

  /**
   * Property: File size validation
   * Files exceeding category limits should always be rejected
   */
  it('Property: Files exceeding size limits should be rejected', async () => {
    await fc.assert(
      fc.property(
        fc.constantFrom('document', 'profile-photo', 'certificate', 'payslip'), // Category
        fc.string({ minLength: 1, maxLength: 50 }).filter(s => !s.includes('\0')), // Filename
        (category, filename) => {
          const limits = FileValidationService.getCategoryLimits(category);
          const oversizedBuffer = Buffer.alloc(limits.maxFileSize + 1);
          
          const result = FileValidationService.validateFile(oversizedBuffer, filename + '.pdf', { category });
          
          expect(result.isValid).toBe(false);
          expect(result.errors.some(error => error.includes('exceeds maximum allowed size'))).toBe(true);
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property: Empty files should always be rejected
   */
  it('Property: Empty files should always be rejected', async () => {
    await fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }).filter(s => !s.includes('\0')), // Filename
        fc.constantFrom('document', 'profile-photo', 'certificate'), // Category
        (filename, category) => {
          const emptyBuffer = Buffer.alloc(0);
          const result = FileValidationService.validateFile(emptyBuffer, filename + '.pdf', { category });
          
          expect(result.isValid).toBe(false);
          expect(result.errors).toContain('File cannot be empty');
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property: Filename validation security
   * Filenames with path traversal should always be rejected
   */
  it('Property: Path traversal filenames should be rejected', async () => {
    await fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }), // Base filename
        fc.constantFrom('../', '../', '\\', '/'), // Path traversal characters
        (baseFilename, pathChar) => {
          const maliciousFilename = pathChar + baseFilename + '.pdf';
          const buffer = Buffer.from('test content');
          
          const result = FileValidationService.validateFile(buffer, maliciousFilename);
          
          expect(result.isValid).toBe(false);
          expect(result.errors.some(error => 
            error.includes('invalid path characters') || error.includes('invalid characters')
          )).toBe(true);
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property: MIME type detection consistency
   * MIME type detection should be consistent for same input
   */
  it('Property: MIME type detection should be consistent', async () => {
    await fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }), // Filename
        fc.constantFrom('.pdf', '.jpg', '.png', '.docx', '.txt'), // Extension
        fc.uint8Array({ minLength: 4, maxLength: 100 }), // File content
        (filename, extension, content) => {
          const fullFilename = filename + extension;
          const buffer = Buffer.from(content);
          
          const mimeType1 = FileValidationService.detectMimeType(fullFilename, buffer);
          const mimeType2 = FileValidationService.detectMimeType(fullFilename, buffer);
          
          expect(mimeType1).toBe(mimeType2);
        }
      ),
      { numRuns: 30 }
    );
  });

  /**
   * Property: Category detection from filename
   * Category detection should be consistent and return valid categories
   */
  it('Property: Category detection should be consistent', async () => {
    await fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }), // Filename
        (filename) => {
          const category1 = FileValidationService.detectCategoryFromFilename(filename);
          const category2 = FileValidationService.detectCategoryFromFilename(filename);
          
          expect(category1).toBe(category2);
          
          // Should return a known category
          const validCategories = [
            'profile-photo', 'payslip', 'contract', 'certificate', 
            'training-material', 'reimbursement', 'document'
          ];
          expect(validCategories).toContain(category1);
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: File size formatting
   * File size formatting should be consistent and human-readable
   */
  it('Property: File size formatting should be consistent', async () => {
    await fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 1073741824 }), // File size up to 1GB
        (fileSize) => {
          const formatted1 = FileValidationService.formatFileSize(fileSize);
          const formatted2 = FileValidationService.formatFileSize(fileSize);
          
          expect(formatted1).toBe(formatted2);
          expect(formatted1).toMatch(/^\d+(\.\d+)?\s+(Bytes|KB|MB|GB)$/);
          
          // Zero should always format as "0 Bytes"
          if (fileSize === 0) {
            expect(formatted1).toBe('0 Bytes');
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Security checks consistency
   * Security checks should be deterministic for same input
   */
  it('Property: Security checks should be consistent', async () => {
    await fc.assert(
      fc.property(
        fc.uint8Array({ minLength: 10, maxLength: 1000 }), // File content
        fc.constantFrom('application/pdf', 'image/jpeg', 'image/png'), // MIME type
        fc.string({ minLength: 1, maxLength: 50 }), // Filename
        (content, mimeType, filename) => {
          const buffer = Buffer.from(content);
          
          const result1 = FileValidationService.performSecurityChecks(buffer, mimeType, filename);
          const result2 = FileValidationService.performSecurityChecks(buffer, mimeType, filename);
          
          expect(result1.isValid).toBe(result2.isValid);
          expect(result1.errors).toEqual(result2.errors);
          expect(result1.warnings).toEqual(result2.warnings);
        }
      ),
      { numRuns: 30 }
    );
  });

  /**
   * Property: Validation error creation
   * Error creation should produce valid error objects
   */
  it('Property: Validation errors should be properly formatted', async () => {
    await fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }), // Error message
        fc.string({ minLength: 1, maxLength: 20 }), // Error code
        fc.option(fc.string({ minLength: 1, maxLength: 20 })), // Field (optional)
        (message, code, field) => {
          const error = FileValidationService.createValidationError(message, code, field || undefined);
          
          expect(error.message).toBe(message);
          expect(error.name).toBe('FileValidationError');
          expect(error.code).toBe(code);
          
          if (field) {
            expect(error.field).toBe(field);
          }
          
          expect(error).toBeInstanceOf(Error);
        }
      ),
      { numRuns: 30 }
    );
  });
});