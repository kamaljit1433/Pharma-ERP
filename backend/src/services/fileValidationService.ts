import mime from 'mime-types';
import config from '../config';

export interface FileValidationOptions {
  category?: string;
  employeeId?: string;
  isPublic?: boolean;
  metadata?: Record<string, any>;
}

export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
  category?: string;
  maxFileSize: number;
  allowedFileTypes: string[];
}

export interface FileValidationError extends Error {
  code: string;
  field?: string;
  details?: any;
}

export class FileValidationService {
  /**
   * Validates a file based on category-specific rules
   */
  static validateFile(
    file: Buffer | Express.Multer.File,
    originalName: string,
    options: FileValidationOptions = {}
  ): FileValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Determine file size and buffer
    const fileSize = Buffer.isBuffer(file) ? file.length : file.size;
    const fileBuffer = Buffer.isBuffer(file) ? file : file.buffer;
    
    // Determine category
    const category = options.category || this.detectCategoryFromFilename(originalName);
    
    // Get category-specific limits
    const categoryLimits = this.getCategoryLimits(category);
    
    // Validate file size
    if (fileSize > categoryLimits.maxFileSize) {
      errors.push(
        `File size ${this.formatFileSize(fileSize)} exceeds maximum allowed size ${this.formatFileSize(categoryLimits.maxFileSize)} for ${category} files`
      );
    }
    
    // Validate file type
    const mimeType = this.detectMimeType(originalName, fileBuffer);
    if (!mimeType) {
      errors.push('Unable to determine file type');
    } else if (!categoryLimits.allowedFileTypes.includes(mimeType)) {
      errors.push(
        `File type ${mimeType} is not allowed for ${category} files. Allowed types: ${categoryLimits.allowedFileTypes.join(', ')}`
      );
    }
    
    // Validate file is not empty
    if (fileSize === 0) {
      errors.push('File cannot be empty');
    }
    
    // Validate filename
    const filenameValidation = this.validateFilename(originalName);
    if (!filenameValidation.isValid) {
      errors.push(...filenameValidation.errors);
    }
    
    // Additional security checks
    const securityValidation = this.performSecurityChecks(fileBuffer, mimeType, originalName);
    if (!securityValidation.isValid) {
      errors.push(...securityValidation.errors);
    }
    if (securityValidation.warnings) {
      warnings.push(...securityValidation.warnings);
    }
    
    // Category-specific validations
    const categoryValidation = this.validateByCategory(fileBuffer, mimeType, category, options);
    if (!categoryValidation.isValid) {
      errors.push(...categoryValidation.errors);
    }
    if (categoryValidation.warnings) {
      warnings.push(...categoryValidation.warnings);
    }
    
    const result: FileValidationResult = {
      isValid: errors.length === 0,
      errors,
      category,
      maxFileSize: categoryLimits.maxFileSize,
      allowedFileTypes: categoryLimits.allowedFileTypes,
    };
    
    if (warnings.length > 0) {
      result.warnings = warnings;
    }
    
    return result;
  }
  
  /**
   * Get category-specific file limits
   */
  static getCategoryLimits(category: string): { maxFileSize: number; allowedFileTypes: string[] } {
    const categoryLimits = config.upload.categoryLimits[category];
    
    if (categoryLimits) {
      return categoryLimits;
    }
    
    // Fallback to default limits
    return {
      maxFileSize: config.upload.maxFileSize,
      allowedFileTypes: config.upload.allowedFileTypes,
    };
  }
  
  /**
   * Detect file category from filename
   */
  static detectCategoryFromFilename(filename: string): string {
    const lowercaseFilename = filename.toLowerCase();
    
    if (lowercaseFilename.includes('profile') || lowercaseFilename.includes('avatar')) {
      return 'profile-photo';
    }
    
    if (lowercaseFilename.includes('payslip') || lowercaseFilename.includes('salary')) {
      return 'payslip';
    }
    
    if (lowercaseFilename.includes('contract') || lowercaseFilename.includes('agreement')) {
      return 'contract';
    }
    
    if (lowercaseFilename.includes('certificate') || lowercaseFilename.includes('cert')) {
      return 'certificate';
    }
    
    if (lowercaseFilename.includes('training') || lowercaseFilename.includes('course')) {
      return 'training-material';
    }
    
    if (lowercaseFilename.includes('receipt') || lowercaseFilename.includes('reimbursement')) {
      return 'reimbursement';
    }
    
    return 'document';
  }
  
  // MIME types recognised by this system — exotic types (e.g. chemical/x-xyz) are excluded
  private static readonly RECOGNISED_MIME_TYPES = new Set([
    'application/pdf',
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'image/bmp', 'image/tiff', 'image/svg+xml',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/zip',
    'text/plain', 'text/csv',
  ]);

  /**
   * Detect MIME type using multiple methods
   */
  static detectMimeType(filename: string, fileBuffer?: Buffer): string | null {
    // First try to detect from filename, but only return recognised types
    const mimeFromName = mime.lookup(filename);
    const mimeType = (mimeFromName && this.RECOGNISED_MIME_TYPES.has(mimeFromName))
      ? mimeFromName
      : null;

    if (!mimeType && fileBuffer) {
      // Try to detect from file signature (magic numbers)
      return this.detectMimeTypeFromSignature(fileBuffer);
    }

    return mimeType;
  }
  
  /**
   * Detect MIME type from file signature (magic numbers)
   */
  static detectMimeTypeFromSignature(buffer: Buffer): string | null {
    if (buffer.length < 4) return null;

    const signature = buffer.subarray(0, 12);
    
    // PDF
    if (signature.subarray(0, 4).toString() === '%PDF') {
      return 'application/pdf';
    }
    
    // JPEG
    if (signature[0] === 0xFF && signature[1] === 0xD8 && signature[2] === 0xFF) {
      return 'image/jpeg';
    }
    
    // PNG
    if (signature.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]))) {
      return 'image/png';
    }
    
    // GIF
    if (signature.subarray(0, 6).toString() === 'GIF87a' || signature.subarray(0, 6).toString() === 'GIF89a') {
      return 'image/gif';
    }
    
    // WebP
    if (signature.subarray(0, 4).toString() === 'RIFF' && signature.subarray(8, 12).toString() === 'WEBP') {
      return 'image/webp';
    }
    
    // ZIP-based formats (DOCX, XLSX, etc.)
    if (signature.subarray(0, 4).equals(Buffer.from([0x50, 0x4B, 0x03, 0x04]))) {
      // This could be DOCX, XLSX, PPTX, etc. - would need more sophisticated detection
      return 'application/zip';
    }
    
    // DOC
    if (signature.subarray(0, 8).equals(Buffer.from([0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1]))) {
      return 'application/msword';
    }
    
    return null;
  }
  
  /**
   * Validate filename for security
   */
  static validateFilename(filename: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!filename || filename.trim().length === 0) {
      errors.push('Filename is required');
      return { isValid: false, errors };
    }
    
    // Check for path traversal attempts
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      errors.push('Filename contains invalid path characters');
    }
    
    // Check for null bytes
    if (filename.includes('\0')) {
      errors.push('Filename contains null bytes');
    }
    
    // Check filename length
    if (filename.length > 255) {
      errors.push('Filename is too long (maximum 255 characters)');
    }
    
    // Check for reserved names (Windows)
    const reservedNames = ['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9', 'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'];
    const nameWithoutExtension = filename.split('.')[0]?.toUpperCase() || '';
    if (reservedNames.includes(nameWithoutExtension)) {
      errors.push('Filename uses a reserved system name');
    }
    
    // Check for dangerous extensions
    const dangerousExtensions = ['.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar', '.sh'];
    const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    if (dangerousExtensions.includes(extension)) {
      errors.push('File extension is not allowed for security reasons');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }
  
  /**
   * Perform additional security checks
   */
  static performSecurityChecks(
    buffer: Buffer,
    mimeType: string | null,
    _filename: string
  ): { isValid: boolean; errors: string[]; warnings?: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Check for embedded executables in images
    if (mimeType && mimeType.startsWith('image/')) {
      if (this.containsExecutableSignature(buffer)) {
        errors.push('Image file contains suspicious executable content');
      }
    }
    
    // Check for suspicious PDF content
    if (mimeType === 'application/pdf') {
      const pdfValidation = this.validatePdfSecurity(buffer);
      if (!pdfValidation.isValid) {
        errors.push(...pdfValidation.errors);
      }
      if (pdfValidation.warnings) {
        warnings.push(...pdfValidation.warnings);
      }
    }
    
    // Check file size vs content ratio for potential zip bombs
    if (buffer.length > 1024 * 1024) { // Files larger than 1MB
      const compressionRatio = this.estimateCompressionRatio(buffer);
      if (compressionRatio > 100) { // Suspiciously high compression ratio
        warnings.push('File has unusually high compression ratio, may be a zip bomb');
      }
    }
    
    const result: { isValid: boolean; errors: string[]; warnings?: string[] } = {
      isValid: errors.length === 0,
      errors,
    };
    
    if (warnings.length > 0) {
      result.warnings = warnings;
    }
    
    return result;
  }
  
  /**
   * Check for executable signatures in file
   */
  static containsExecutableSignature(buffer: Buffer): boolean {
    const executableSignatures = [
      Buffer.from([0x4D, 0x5A]), // MZ (DOS/Windows executable)
      Buffer.from([0x7F, 0x45, 0x4C, 0x46]), // ELF (Linux executable)
      Buffer.from([0xFE, 0xED, 0xFA, 0xCE]), // Mach-O (macOS executable)
    ];
    
    for (const signature of executableSignatures) {
      if (buffer.indexOf(signature) !== -1) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Validate PDF security
   */
  static validatePdfSecurity(buffer: Buffer): { isValid: boolean; errors: string[]; warnings?: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];
    const content = buffer.toString('binary');
    
    // Check for JavaScript in PDF
    if (content.includes('/JavaScript') || content.includes('/JS')) {
      warnings.push('PDF contains JavaScript which may pose security risks');
    }
    
    // Check for embedded files
    if (content.includes('/EmbeddedFile')) {
      warnings.push('PDF contains embedded files');
    }
    
    // Check for forms
    if (content.includes('/AcroForm')) {
      warnings.push('PDF contains interactive forms');
    }
    
    const result: { isValid: boolean; errors: string[]; warnings?: string[] } = {
      isValid: errors.length === 0,
      errors,
    };
    
    if (warnings.length > 0) {
      result.warnings = warnings;
    }
    
    return result;
  }
  
  /**
   * Estimate compression ratio (simple heuristic)
   */
  static estimateCompressionRatio(buffer: Buffer): number {
    // Count unique bytes as a simple entropy measure
    const uniqueBytes = new Set(buffer).size;
    const maxEntropy = 256;
    const entropy = uniqueBytes / maxEntropy;
    
    // Lower entropy might indicate high compression
    return entropy < 0.1 ? 1000 : 1 / entropy;
  }
  
  /**
   * Category-specific validation
   */
  static validateByCategory(
    buffer: Buffer,
    mimeType: string | null,
    category: string,
    _options: FileValidationOptions
  ): { isValid: boolean; errors: string[]; warnings?: string[] } {
    switch (category) {
      case 'profile-photo':
        return this.validateProfilePhoto(buffer, mimeType);
      
      case 'payslip':
        return this.validatePayslip(buffer, mimeType);
      
      case 'certificate':
        return this.validateCertificate(buffer, mimeType);
      
      case 'contract':
        return this.validateContract(buffer, mimeType);
      
      default:
        return { isValid: true, errors: [] };
    }
  }
  
  /**
   * Validate profile photo specific requirements
   */
  static validateProfilePhoto(buffer: Buffer, mimeType: string | null): { isValid: boolean; errors: string[]; warnings?: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    if (!mimeType || !mimeType.startsWith('image/')) {
      errors.push('Profile photo must be an image file');
      return { isValid: false, errors };
    }
    
    // Check image dimensions (basic check)
    if (buffer.length < 1000) { // Very small image files are suspicious
      warnings.push('Image file is very small, may be corrupted or invalid');
    }
    
    const result: { isValid: boolean; errors: string[]; warnings?: string[] } = {
      isValid: errors.length === 0,
      errors,
    };
    
    if (warnings.length > 0) {
      result.warnings = warnings;
    }
    
    return result;
  }
  
  /**
   * Validate payslip specific requirements
   */
  static validatePayslip(_buffer: Buffer, mimeType: string | null): { isValid: boolean; errors: string[]; warnings?: string[] } {
    const errors: string[] = [];
    
    if (mimeType !== 'application/pdf') {
      errors.push('Payslips must be in PDF format');
    }
    
    return { isValid: errors.length === 0, errors };
  }
  
  /**
   * Validate certificate specific requirements
   */
  static validateCertificate(_buffer: Buffer, mimeType: string | null): { isValid: boolean; errors: string[]; warnings?: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!mimeType || !allowedTypes.includes(mimeType)) {
      errors.push('Certificates must be in PDF, JPEG, or PNG format');
    }
    
    const result: { isValid: boolean; errors: string[]; warnings?: string[] } = {
      isValid: errors.length === 0,
      errors,
    };
    
    if (warnings.length > 0) {
      result.warnings = warnings;
    }
    
    return result;
  }
  
  /**
   * Validate contract specific requirements
   */
  static validateContract(_buffer: Buffer, mimeType: string | null): { isValid: boolean; errors: string[]; warnings?: string[] } {
    const errors: string[] = [];
    
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!mimeType || !allowedTypes.includes(mimeType)) {
      errors.push('Contracts must be in PDF or Word document format');
    }
    
    return { isValid: errors.length === 0, errors };
  }
  
  /**
   * Format file size for human readability
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.ceil(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  /**
   * Create a validation error
   */
  static createValidationError(message: string, code: string, field?: string, details?: any): FileValidationError {
    const error = new Error(message) as FileValidationError;
    error.name = 'FileValidationError';
    error.code = code;
    if (field) error.field = field;
    if (details) error.details = details;
    return error;
  }
}