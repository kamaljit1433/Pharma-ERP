import { FileValidationService } from '../fileValidationService';

describe('FileValidationService', () => {
  describe('validateFile', () => {
    it('should validate valid PDF file', () => {
      const pdfBuffer = Buffer.from('%PDF-1.4\n%test');
      const result = FileValidationService.validateFile(pdfBuffer, 'document.pdf', {
        category: 'document',
      });

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject empty file', () => {
      const emptyBuffer = Buffer.from('');
      const result = FileValidationService.validateFile(emptyBuffer, 'empty.pdf');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('File cannot be empty');
    });

    it('should reject file exceeding size limit', () => {
      const largeBuffer = Buffer.alloc(100 * 1024 * 1024); // 100MB
      const result = FileValidationService.validateFile(largeBuffer, 'large.pdf');

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('exceeds maximum'))).toBe(true);
    });

    it('should detect file category from filename', () => {
      const buffer = Buffer.from('test');
      const result = FileValidationService.validateFile(buffer, 'profile_photo.jpg', {});

      expect(result.category).toBe('profile-photo');
    });

    it('should validate profile photo category', () => {
      const jpegBuffer = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, ...Buffer.alloc(100)]);
      const result = FileValidationService.validateFile(jpegBuffer, 'profile.jpg', {
        category: 'profile-photo',
      });

      expect(result.category).toBe('profile-photo');
    });

    it('should reject invalid filename with path traversal', () => {
      const buffer = Buffer.from('test');
      const result = FileValidationService.validateFile(buffer, '../../../etc/passwd');

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('invalid path'))).toBe(true);
    });

    it('should reject filename with null bytes', () => {
      const buffer = Buffer.from('test');
      const result = FileValidationService.validateFile(buffer, 'file\0.pdf');

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('null bytes'))).toBe(true);
    });

    it('should reject dangerous file extensions', () => {
      const buffer = Buffer.from('test');
      const result = FileValidationService.validateFile(buffer, 'malware.exe');

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('not allowed'))).toBe(true);
    });

    it('should reject reserved Windows filenames', () => {
      const buffer = Buffer.from('test');
      const result = FileValidationService.validateFile(buffer, 'CON.txt');

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('reserved'))).toBe(true);
    });

    it('should reject filename exceeding 255 characters', () => {
      const buffer = Buffer.from('test');
      const longFilename = 'a'.repeat(256) + '.pdf';
      const result = FileValidationService.validateFile(buffer, longFilename);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('too long'))).toBe(true);
    });

    it('should detect MIME type from file signature', () => {
      const pdfBuffer = Buffer.from('%PDF-1.4');
      const mimeType = FileValidationService.detectMimeType('unknown', pdfBuffer);

      expect(mimeType).toBe('application/pdf');
    });

    it('should detect JPEG MIME type', () => {
      const jpegBuffer = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]);
      const mimeType = FileValidationService.detectMimeType('unknown', jpegBuffer);

      expect(mimeType).toBe('image/jpeg');
    });

    it('should detect PNG MIME type', () => {
      const pngBuffer = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
      const mimeType = FileValidationService.detectMimeType('unknown', pngBuffer);

      expect(mimeType).toBe('image/png');
    });

    it('should detect GIF MIME type', () => {
      const gifBuffer = Buffer.from('GIF89a');
      const mimeType = FileValidationService.detectMimeType('unknown', gifBuffer);

      expect(mimeType).toBe('image/gif');
    });

    it('should detect WebP MIME type', () => {
      const webpBuffer = Buffer.from('RIFF\x00\x00\x00\x00WEBP');
      const mimeType = FileValidationService.detectMimeType('unknown', webpBuffer);

      expect(mimeType).toBe('image/webp');
    });

    it('should detect ZIP MIME type', () => {
      const zipBuffer = Buffer.from([0x50, 0x4B, 0x03, 0x04]);
      const mimeType = FileValidationService.detectMimeType('unknown', zipBuffer);

      expect(mimeType).toBe('application/zip');
    });

    it('should detect DOC MIME type', () => {
      const docBuffer = Buffer.from([0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1]);
      const mimeType = FileValidationService.detectMimeType('unknown', docBuffer);

      expect(mimeType).toBe('application/msword');
    });
  });

  describe('getCategoryLimits', () => {
    it('should return limits for known category', () => {
      const limits = FileValidationService.getCategoryLimits('profile-photo');

      expect(limits).toHaveProperty('maxFileSize');
      expect(limits).toHaveProperty('allowedFileTypes');
      expect(limits.maxFileSize).toBeGreaterThan(0);
      expect(limits.allowedFileTypes).toBeInstanceOf(Array);
    });

    it('should return default limits for unknown category', () => {
      const limits = FileValidationService.getCategoryLimits('unknown-category');

      expect(limits).toHaveProperty('maxFileSize');
      expect(limits).toHaveProperty('allowedFileTypes');
    });
  });

  describe('detectCategoryFromFilename', () => {
    it('should detect profile-photo category', () => {
      expect(FileValidationService.detectCategoryFromFilename('profile.jpg')).toBe(
        'profile-photo'
      );
      expect(FileValidationService.detectCategoryFromFilename('avatar.png')).toBe(
        'profile-photo'
      );
    });

    it('should detect payslip category', () => {
      expect(FileValidationService.detectCategoryFromFilename('payslip.pdf')).toBe('payslip');
      expect(FileValidationService.detectCategoryFromFilename('salary_slip.pdf')).toBe(
        'payslip'
      );
    });

    it('should detect contract category', () => {
      expect(FileValidationService.detectCategoryFromFilename('contract.pdf')).toBe('contract');
      expect(FileValidationService.detectCategoryFromFilename('agreement.docx')).toBe('contract');
    });

    it('should detect certificate category', () => {
      expect(FileValidationService.detectCategoryFromFilename('certificate.pdf')).toBe(
        'certificate'
      );
      expect(FileValidationService.detectCategoryFromFilename('cert.jpg')).toBe('certificate');
    });

    it('should detect training-material category', () => {
      expect(FileValidationService.detectCategoryFromFilename('training.pdf')).toBe(
        'training-material'
      );
      expect(FileValidationService.detectCategoryFromFilename('course.pptx')).toBe(
        'training-material'
      );
    });

    it('should detect reimbursement category', () => {
      expect(FileValidationService.detectCategoryFromFilename('receipt.jpg')).toBe(
        'reimbursement'
      );
      expect(FileValidationService.detectCategoryFromFilename('reimbursement.pdf')).toBe(
        'reimbursement'
      );
    });

    it('should default to document category', () => {
      expect(FileValidationService.detectCategoryFromFilename('unknown.txt')).toBe('document');
    });
  });

  describe('detectMimeType', () => {
    it('should detect MIME type from filename', () => {
      const mimeType = FileValidationService.detectMimeType('document.pdf');

      expect(mimeType).toBe('application/pdf');
    });

    it('should fallback to signature detection', () => {
      const pdfBuffer = Buffer.from('%PDF-1.4');
      const mimeType = FileValidationService.detectMimeType('unknown', pdfBuffer);

      expect(mimeType).toBe('application/pdf');
    });

    it('should return null for unknown type', () => {
      const mimeType = FileValidationService.detectMimeType('unknown.xyz');

      expect(mimeType).toBeNull();
    });
  });

  describe('validateFilename', () => {
    it('should validate correct filename', () => {
      const result = FileValidationService.validateFilename('document.pdf');

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject empty filename', () => {
      const result = FileValidationService.validateFilename('');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Filename is required');
    });

    it('should reject path traversal attempts', () => {
      const result = FileValidationService.validateFilename('../../../etc/passwd');

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('invalid path'))).toBe(true);
    });

    it('should reject null bytes', () => {
      const result = FileValidationService.validateFilename('file\0.pdf');

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('null bytes'))).toBe(true);
    });

    it('should reject dangerous extensions', () => {
      const dangerousFiles = ['malware.exe', 'script.bat', 'virus.com', 'payload.jar'];

      dangerousFiles.forEach((file) => {
        const result = FileValidationService.validateFilename(file);
        expect(result.isValid).toBe(false);
      });
    });

    it('should reject reserved Windows names', () => {
      const reservedNames = ['CON.txt', 'PRN.pdf', 'AUX.doc', 'NUL.txt'];

      reservedNames.forEach((name) => {
        const result = FileValidationService.validateFilename(name);
        expect(result.isValid).toBe(false);
      });
    });
  });

  describe('performSecurityChecks', () => {
    it('should detect executable signature in image', () => {
      const maliciousBuffer = Buffer.from([0x4D, 0x5A, ...Buffer.alloc(100)]); // MZ header
      const result = FileValidationService.performSecurityChecks(
        maliciousBuffer,
        'image/jpeg',
        'image.jpg'
      );

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('executable'))).toBe(true);
    });

    it('should warn about JavaScript in PDF', () => {
      const pdfWithJS = Buffer.from('%PDF-1.4\n/JavaScript');
      const result = FileValidationService.performSecurityChecks(
        pdfWithJS,
        'application/pdf',
        'document.pdf'
      );

      expect(result.warnings).toBeDefined();
      expect(result.warnings?.some((w) => w.includes('JavaScript'))).toBe(true);
    });

    it('should warn about embedded files in PDF', () => {
      const pdfWithEmbedded = Buffer.from('%PDF-1.4\n/EmbeddedFile');
      const result = FileValidationService.performSecurityChecks(
        pdfWithEmbedded,
        'application/pdf',
        'document.pdf'
      );

      expect(result.warnings).toBeDefined();
      expect(result.warnings?.some((w) => w.includes('embedded'))).toBe(true);
    });

    it('should warn about forms in PDF', () => {
      const pdfWithForms = Buffer.from('%PDF-1.4\n/AcroForm');
      const result = FileValidationService.performSecurityChecks(
        pdfWithForms,
        'application/pdf',
        'document.pdf'
      );

      expect(result.warnings).toBeDefined();
      expect(result.warnings?.some((w) => w.includes('forms'))).toBe(true);
    });
  });

  describe('containsExecutableSignature', () => {
    it('should detect MZ header (DOS/Windows)', () => {
      const buffer = Buffer.from([0x4D, 0x5A, ...Buffer.alloc(100)]);
      const result = FileValidationService.containsExecutableSignature(buffer);

      expect(result).toBe(true);
    });

    it('should detect ELF header (Linux)', () => {
      const buffer = Buffer.from([0x7F, 0x45, 0x4C, 0x46, ...Buffer.alloc(100)]);
      const result = FileValidationService.containsExecutableSignature(buffer);

      expect(result).toBe(true);
    });

    it('should detect Mach-O header (macOS)', () => {
      const buffer = Buffer.from([0xFE, 0xED, 0xFA, 0xCE, ...Buffer.alloc(100)]);
      const result = FileValidationService.containsExecutableSignature(buffer);

      expect(result).toBe(true);
    });

    it('should return false for safe file', () => {
      const buffer = Buffer.from('This is a safe text file');
      const result = FileValidationService.containsExecutableSignature(buffer);

      expect(result).toBe(false);
    });
  });

  describe('validatePdfSecurity', () => {
    it('should validate safe PDF', () => {
      const pdfBuffer = Buffer.from('%PDF-1.4\n%Safe PDF');
      const result = FileValidationService.validatePdfSecurity(pdfBuffer);

      expect(result.isValid).toBe(true);
    });

    it('should warn about JavaScript', () => {
      const pdfBuffer = Buffer.from('%PDF-1.4\n/JavaScript');
      const result = FileValidationService.validatePdfSecurity(pdfBuffer);

      expect(result.warnings).toBeDefined();
      expect(result.warnings?.length).toBeGreaterThan(0);
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes', () => {
      expect(FileValidationService.formatFileSize(0)).toBe('0 Bytes');
      expect(FileValidationService.formatFileSize(512)).toBe('0.5 KB');
      expect(FileValidationService.formatFileSize(1024)).toBe('1 KB');
      expect(FileValidationService.formatFileSize(1024 * 1024)).toBe('1 MB');
      expect(FileValidationService.formatFileSize(1024 * 1024 * 1024)).toBe('1 GB');
    });
  });

  describe('validateProfilePhoto', () => {
    it('should validate image file', () => {
      const jpegBuffer = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, ...Buffer.alloc(1000)]);
      const result = FileValidationService.validateProfilePhoto(jpegBuffer, 'image/jpeg');

      expect(result.isValid).toBe(true);
    });

    it('should reject non-image file', () => {
      const pdfBuffer = Buffer.from('%PDF-1.4');
      const result = FileValidationService.validateProfilePhoto(pdfBuffer, 'application/pdf');

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('must be an image'))).toBe(true);
    });

    it('should warn about very small image', () => {
      const tinyBuffer = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]);
      const result = FileValidationService.validateProfilePhoto(tinyBuffer, 'image/jpeg');

      expect(result.warnings).toBeDefined();
      expect(result.warnings?.some((w) => w.includes('very small'))).toBe(true);
    });
  });

  describe('validatePayslip', () => {
    it('should accept PDF payslip', () => {
      const pdfBuffer = Buffer.from('%PDF-1.4');
      const result = FileValidationService.validatePayslip(pdfBuffer, 'application/pdf');

      expect(result.isValid).toBe(true);
    });

    it('should reject non-PDF payslip', () => {
      const jpegBuffer = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]);
      const result = FileValidationService.validatePayslip(jpegBuffer, 'image/jpeg');

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('must be in PDF'))).toBe(true);
    });
  });

  describe('validateCertificate', () => {
    it('should accept PDF certificate', () => {
      const pdfBuffer = Buffer.from('%PDF-1.4');
      const result = FileValidationService.validateCertificate(pdfBuffer, 'application/pdf');

      expect(result.isValid).toBe(true);
    });

    it('should accept JPEG certificate', () => {
      const jpegBuffer = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]);
      const result = FileValidationService.validateCertificate(jpegBuffer, 'image/jpeg');

      expect(result.isValid).toBe(true);
    });

    it('should accept PNG certificate', () => {
      const pngBuffer = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
      const result = FileValidationService.validateCertificate(pngBuffer, 'image/png');

      expect(result.isValid).toBe(true);
    });

    it('should reject unsupported format', () => {
      const buffer = Buffer.from('test');
      const result = FileValidationService.validateCertificate(buffer, 'text/plain');

      expect(result.isValid).toBe(false);
    });
  });

  describe('validateContract', () => {
    it('should accept PDF contract', () => {
      const pdfBuffer = Buffer.from('%PDF-1.4');
      const result = FileValidationService.validateContract(pdfBuffer, 'application/pdf');

      expect(result.isValid).toBe(true);
    });

    it('should accept Word document', () => {
      const docBuffer = Buffer.from([0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1]);
      const result = FileValidationService.validateContract(
        docBuffer,
        'application/msword'
      );

      expect(result.isValid).toBe(true);
    });

    it('should reject unsupported format', () => {
      const buffer = Buffer.from('test');
      const result = FileValidationService.validateContract(buffer, 'text/plain');

      expect(result.isValid).toBe(false);
    });
  });
});
