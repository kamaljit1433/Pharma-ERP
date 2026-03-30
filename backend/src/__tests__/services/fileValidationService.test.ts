import { FileValidationService } from '../../services/fileValidationService';

describe('FileValidationService', () => {
  describe('validateFile', () => {
    it('should validate a valid PDF document', () => {
      const pdfBuffer = Buffer.from('%PDF-1.4\n%âãÏÓ\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n');
      const result = FileValidationService.validateFile(pdfBuffer, 'test.pdf', { category: 'document' });
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.category).toBe('document');
    });

    it('should reject oversized files', () => {
      const largeBuffer = Buffer.alloc(25 * 1024 * 1024); // 25MB
      const result = FileValidationService.validateFile(largeBuffer, 'large.pdf', { category: 'document' });
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes('exceeds maximum allowed size'))).toBe(true);
    });

    it('should reject invalid file types for category', () => {
      const txtBuffer = Buffer.from('Hello world');
      const result = FileValidationService.validateFile(txtBuffer, 'test.exe', { category: 'profile-photo' });
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes('not allowed for profile-photo files'))).toBe(true);
    });

    it('should reject empty files', () => {
      const emptyBuffer = Buffer.alloc(0);
      const result = FileValidationService.validateFile(emptyBuffer, 'empty.pdf');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('File cannot be empty');
    });

    it('should reject dangerous filenames', () => {
      const buffer = Buffer.from('test content');
      const result = FileValidationService.validateFile(buffer, '../../../etc/passwd');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Filename contains invalid path characters');
    });

    it('should reject executable files', () => {
      const buffer = Buffer.from('test content');
      const result = FileValidationService.validateFile(buffer, 'malware.exe');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('File extension is not allowed for security reasons');
    });
  });

  describe('getCategoryLimits', () => {
    it('should return category-specific limits for profile-photo', () => {
      const limits = FileValidationService.getCategoryLimits('profile-photo');
      
      expect(limits.maxFileSize).toBe(5242880); // 5MB
      expect(limits.allowedFileTypes).toContain('image/jpeg');
      expect(limits.allowedFileTypes).toContain('image/png');
      expect(limits.allowedFileTypes).not.toContain('application/pdf');
    });

    it('should return category-specific limits for payslip', () => {
      const limits = FileValidationService.getCategoryLimits('payslip');
      
      expect(limits.maxFileSize).toBe(5242880); // 5MB
      expect(limits.allowedFileTypes).toEqual(['application/pdf']);
    });

    it('should return default limits for unknown category', () => {
      const limits = FileValidationService.getCategoryLimits('unknown-category');
      
      expect(limits.maxFileSize).toBe(10485760); // 10MB default
      expect(limits.allowedFileTypes).toContain('application/pdf');
    });
  });

  describe('detectCategoryFromFilename', () => {
    it('should detect profile photo category', () => {
      expect(FileValidationService.detectCategoryFromFilename('profile_photo.jpg')).toBe('profile-photo');
      expect(FileValidationService.detectCategoryFromFilename('avatar.png')).toBe('profile-photo');
    });

    it('should detect payslip category', () => {
      expect(FileValidationService.detectCategoryFromFilename('payslip_jan_2024.pdf')).toBe('payslip');
      expect(FileValidationService.detectCategoryFromFilename('salary_slip.pdf')).toBe('payslip');
    });

    it('should detect contract category', () => {
      expect(FileValidationService.detectCategoryFromFilename('employment_contract.pdf')).toBe('contract');
      expect(FileValidationService.detectCategoryFromFilename('agreement.docx')).toBe('contract');
    });

    it('should default to document category', () => {
      expect(FileValidationService.detectCategoryFromFilename('random_file.pdf')).toBe('document');
    });
  });

  describe('detectMimeType', () => {
    it('should detect MIME type from filename', () => {
      expect(FileValidationService.detectMimeType('test.pdf')).toBe('application/pdf');
      expect(FileValidationService.detectMimeType('image.jpg')).toBe('image/jpeg');
      expect(FileValidationService.detectMimeType('document.docx')).toBe('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    });

    it('should detect MIME type from file signature', () => {
      const pdfBuffer = Buffer.from('%PDF-1.4');
      expect(FileValidationService.detectMimeType('unknown', pdfBuffer)).toBe('application/pdf');
      
      const jpegBuffer = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]);
      expect(FileValidationService.detectMimeType('unknown', jpegBuffer)).toBe('image/jpeg');
      
      const pngBuffer = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
      expect(FileValidationService.detectMimeType('unknown', pngBuffer)).toBe('image/png');
    });
  });

  describe('validateFilename', () => {
    it('should accept valid filenames', () => {
      const result = FileValidationService.validateFilename('document.pdf');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject empty filenames', () => {
      const result = FileValidationService.validateFilename('');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Filename is required');
    });

    it('should reject path traversal attempts', () => {
      const result = FileValidationService.validateFilename('../../../etc/passwd');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Filename contains invalid path characters');
    });

    it('should reject null bytes', () => {
      const result = FileValidationService.validateFilename('file\0.pdf');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Filename contains null bytes');
    });

    it('should reject overly long filenames', () => {
      const longFilename = 'a'.repeat(300) + '.pdf';
      const result = FileValidationService.validateFilename(longFilename);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Filename is too long (maximum 255 characters)');
    });

    it('should reject reserved system names', () => {
      const result = FileValidationService.validateFilename('CON.pdf');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Filename uses a reserved system name');
    });

    it('should reject dangerous extensions', () => {
      const result = FileValidationService.validateFilename('malware.exe');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('File extension is not allowed for security reasons');
    });
  });

  describe('performSecurityChecks', () => {
    it('should detect executable signatures in images', () => {
      const maliciousBuffer = Buffer.concat([
        Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]), // JPEG header
        Buffer.from([0x4D, 0x5A]), // MZ executable signature
        Buffer.alloc(100)
      ]);
      
      const result = FileValidationService.performSecurityChecks(maliciousBuffer, 'image/jpeg', 'image.jpg');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Image file contains suspicious executable content');
    });

    it('should warn about JavaScript in PDFs', () => {
      const pdfWithJS = Buffer.from('%PDF-1.4\n/JavaScript\nsome content');
      const result = FileValidationService.performSecurityChecks(pdfWithJS, 'application/pdf', 'document.pdf');
      
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('PDF contains JavaScript which may pose security risks');
    });
  });

  describe('validateByCategory', () => {
    it('should validate profile photo requirements', () => {
      const jpegBuffer = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]);
      const result = FileValidationService.validateByCategory(jpegBuffer, 'image/jpeg', 'profile-photo', {});
      
      expect(result.isValid).toBe(true);
    });

    it('should reject non-image files for profile photos', () => {
      const pdfBuffer = Buffer.from('%PDF-1.4');
      const result = FileValidationService.validateByCategory(pdfBuffer, 'application/pdf', 'profile-photo', {});
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Profile photo must be an image file');
    });

    it('should require PDF format for payslips', () => {
      const jpegBuffer = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]);
      const result = FileValidationService.validateByCategory(jpegBuffer, 'image/jpeg', 'payslip', {});
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Payslips must be in PDF format');
    });
  });

  describe('formatFileSize', () => {
    it('should format file sizes correctly', () => {
      expect(FileValidationService.formatFileSize(0)).toBe('0 Bytes');
      expect(FileValidationService.formatFileSize(1024)).toBe('1 KB');
      expect(FileValidationService.formatFileSize(1048576)).toBe('1 MB');
      expect(FileValidationService.formatFileSize(1073741824)).toBe('1 GB');
      expect(FileValidationService.formatFileSize(1536)).toBe('1.5 KB');
    });
  });

  describe('createValidationError', () => {
    it('should create a properly formatted validation error', () => {
      const error = FileValidationService.createValidationError(
        'Test error message',
        'TEST_ERROR',
        'testField',
        { additional: 'data' }
      );
      
      expect(error.message).toBe('Test error message');
      expect(error.name).toBe('FileValidationError');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.field).toBe('testField');
      expect(error.details).toEqual({ additional: 'data' });
    });
  });
});