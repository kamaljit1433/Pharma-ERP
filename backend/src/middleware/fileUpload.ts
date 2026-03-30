import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';
import config from '../config';
import { FileValidationService } from '../services/fileValidationService';

// Custom error class for file upload errors
export class FileUploadError extends Error {
  public code: string;
  public field?: string;

  constructor(message: string, code: string, field?: string) {
    super(message);
    this.name = 'FileUploadError';
    this.code = code;
    if (field !== undefined) {
      this.field = field;
    }
  }
}

// File filter function with category-specific validation
const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback): void => {
  // Get category from request body
  const category = req.body?.category || 'document';
  
  // Get category-specific limits
  const categoryLimits = FileValidationService.getCategoryLimits(category);
  
  // Check if file type is allowed for this category
  if (!categoryLimits.allowedFileTypes.includes(file.mimetype)) {
    const error = new FileUploadError(
      `File type ${file.mimetype} is not allowed for ${category} files. Allowed types: ${categoryLimits.allowedFileTypes.join(', ')}`,
      'INVALID_FILE_TYPE',
      file.fieldname
    );
    return cb(error);
  }

  // Check filename for security
  if (file.originalname.includes('..') || file.originalname.includes('/') || file.originalname.includes('\\')) {
    const error = new FileUploadError(
      'Filename contains invalid characters',
      'INVALID_FILENAME',
      file.fieldname
    );
    return cb(error);
  }

  cb(null, true);
};

// Dynamic multer configuration based on category
const createUploadConfig = (category?: string) => {
  const categoryLimits = FileValidationService.getCategoryLimits(category || 'document');
  
  return multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: categoryLimits.maxFileSize,
      files: 10, // Maximum 10 files per request
      fields: 20, // Maximum 20 non-file fields
    },
    fileFilter,
  });
};

// Configure multer for memory storage (we'll handle the actual storage via our service)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: config.upload.maxFileSize,
    files: 10, // Maximum 10 files per request
    fields: 20, // Maximum 20 non-file fields
  },
  fileFilter,
});

// Middleware for single file upload
export const uploadSingle = (fieldName: string) => {
  return (req: Request, res: any, next: any) => {
    const singleUpload = upload.single(fieldName);
    
    singleUpload(req, res, (error: any) => {
      if (error) {
        if (error instanceof multer.MulterError) {
          let message = 'File upload error';
          let code = 'UPLOAD_ERROR';

          switch (error.code) {
            case 'LIMIT_FILE_SIZE':
              message = `File size exceeds maximum allowed size of ${config.upload.maxFileSize} bytes`;
              code = 'FILE_TOO_LARGE';
              break;
            case 'LIMIT_FILE_COUNT':
              message = 'Too many files uploaded';
              code = 'TOO_MANY_FILES';
              break;
            case 'LIMIT_UNEXPECTED_FILE':
              message = `Unexpected field name: ${error.field}`;
              code = 'UNEXPECTED_FIELD';
              break;
            case 'LIMIT_PART_COUNT':
              message = 'Too many parts in multipart form';
              code = 'TOO_MANY_PARTS';
              break;
            case 'LIMIT_FIELD_KEY':
              message = 'Field name too long';
              code = 'FIELD_NAME_TOO_LONG';
              break;
            case 'LIMIT_FIELD_VALUE':
              message = 'Field value too long';
              code = 'FIELD_VALUE_TOO_LONG';
              break;
            case 'LIMIT_FIELD_COUNT':
              message = 'Too many fields';
              code = 'TOO_MANY_FIELDS';
              break;
            default:
              message = error.message;
          }

          const uploadError = new FileUploadError(message, code, error.field);
          return next(uploadError);
        }

        if (error instanceof FileUploadError) {
          return next(error);
        }

        // Unknown error
        const uploadError = new FileUploadError(
          error.message || 'Unknown file upload error',
          'UNKNOWN_ERROR'
        );
        return next(uploadError);
      }

      next();
    });
  };
};

// Middleware for multiple file upload
export const uploadMultiple = (fieldName: string, maxCount: number = 10) => {
  return (req: Request, res: any, next: any) => {
    const multipleUpload = upload.array(fieldName, maxCount);
    
    multipleUpload(req, res, (error: any) => {
      if (error) {
        if (error instanceof multer.MulterError) {
          let message = 'File upload error';
          let code = 'UPLOAD_ERROR';

          switch (error.code) {
            case 'LIMIT_FILE_SIZE':
              message = `File size exceeds maximum allowed size of ${config.upload.maxFileSize} bytes`;
              code = 'FILE_TOO_LARGE';
              break;
            case 'LIMIT_FILE_COUNT':
              message = `Too many files uploaded. Maximum allowed: ${maxCount}`;
              code = 'TOO_MANY_FILES';
              break;
            case 'LIMIT_UNEXPECTED_FILE':
              message = `Unexpected field name: ${error.field}`;
              code = 'UNEXPECTED_FIELD';
              break;
            default:
              message = error.message;
          }

          const uploadError = new FileUploadError(message, code, error.field);
          return next(uploadError);
        }

        if (error instanceof FileUploadError) {
          return next(error);
        }

        // Unknown error
        const uploadError = new FileUploadError(
          error.message || 'Unknown file upload error',
          'UNKNOWN_ERROR'
        );
        return next(uploadError);
      }

      next();
    });
  };
};

// Middleware for mixed file upload (multiple fields)
export const uploadFields = (fields: Array<{ name: string; maxCount?: number }>) => {
  return (req: Request, res: any, next: any) => {
    const fieldsUpload = upload.fields(fields);
    
    fieldsUpload(req, res, (error: any) => {
      if (error) {
        if (error instanceof multer.MulterError) {
          let message = 'File upload error';
          let code = 'UPLOAD_ERROR';

          switch (error.code) {
            case 'LIMIT_FILE_SIZE':
              message = `File size exceeds maximum allowed size of ${config.upload.maxFileSize} bytes`;
              code = 'FILE_TOO_LARGE';
              break;
            case 'LIMIT_FILE_COUNT':
              message = 'Too many files uploaded';
              code = 'TOO_MANY_FILES';
              break;
            case 'LIMIT_UNEXPECTED_FILE':
              message = `Unexpected field name: ${error.field}`;
              code = 'UNEXPECTED_FIELD';
              break;
            default:
              message = error.message;
          }

          const uploadError = new FileUploadError(message, code, error.field);
          return next(uploadError);
        }

        if (error instanceof FileUploadError) {
          return next(error);
        }

        // Unknown error
        const uploadError = new FileUploadError(
          error.message || 'Unknown file upload error',
          'UNKNOWN_ERROR'
        );
        return next(uploadError);
      }

      next();
    });
  };
};

// Middleware for handling multipart upload initialization
export const uploadNone = () => {
  return (req: Request, res: any, next: any) => {
    const noneUpload = upload.none();
    
    noneUpload(req, res, (error: any) => {
      if (error) {
        if (error instanceof multer.MulterError) {
          const uploadError = new FileUploadError(
            error.message,
            'MULTIPART_ERROR',
            error.field
          );
          return next(uploadError);
        }

        const uploadError = new FileUploadError(
          error.message || 'Multipart form error',
          'UNKNOWN_ERROR'
        );
        return next(uploadError);
      }

      next();
    });
  };
};

// Middleware for single file upload with category-specific validation
export const uploadSingleWithCategory = (fieldName: string) => {
  return (req: Request, res: any, next: any) => {
    // Get category from request body or query params
    const category = req.body?.category || req.query?.['category'] || 'document';
    const categoryUpload = createUploadConfig(category as string);
    const singleUpload = categoryUpload.single(fieldName);
    
    singleUpload(req, res, (error: any) => {
      if (error) {
        if (error instanceof multer.MulterError) {
          let message = 'File upload error';
          let code = 'UPLOAD_ERROR';
          const categoryLimits = FileValidationService.getCategoryLimits(category as string);

          switch (error.code) {
            case 'LIMIT_FILE_SIZE':
              message = `File size exceeds maximum allowed size of ${FileValidationService.formatFileSize(categoryLimits.maxFileSize)} for ${category} files`;
              code = 'FILE_TOO_LARGE';
              break;
            case 'LIMIT_FILE_COUNT':
              message = 'Too many files uploaded';
              code = 'TOO_MANY_FILES';
              break;
            case 'LIMIT_UNEXPECTED_FILE':
              message = `Unexpected field name: ${error.field}`;
              code = 'UNEXPECTED_FIELD';
              break;
            case 'LIMIT_PART_COUNT':
              message = 'Too many parts in multipart form';
              code = 'TOO_MANY_PARTS';
              break;
            case 'LIMIT_FIELD_KEY':
              message = 'Field name too long';
              code = 'FIELD_NAME_TOO_LONG';
              break;
            case 'LIMIT_FIELD_VALUE':
              message = 'Field value too long';
              code = 'FIELD_VALUE_TOO_LONG';
              break;
            case 'LIMIT_FIELD_COUNT':
              message = 'Too many fields';
              code = 'TOO_MANY_FIELDS';
              break;
            default:
              message = error.message;
          }

          const uploadError = new FileUploadError(message, code, error.field);
          return next(uploadError);
        }

        if (error instanceof FileUploadError) {
          return next(error);
        }

        // Unknown error
        const uploadError = new FileUploadError(
          error.message || 'Unknown file upload error',
          'UNKNOWN_ERROR'
        );
        return next(uploadError);
      }

      next();
    });
  };
};

// Middleware for multiple file upload with category-specific validation
export const uploadMultipleWithCategory = (fieldName: string, maxCount: number = 10) => {
  return (req: Request, res: any, next: any) => {
    // Get category from request body or query params
    const category = req.body?.category || req.query?.['category'] || 'document';
    const categoryUpload = createUploadConfig(category as string);
    const multipleUpload = categoryUpload.array(fieldName, maxCount);
    
    multipleUpload(req, res, (error: any) => {
      if (error) {
        if (error instanceof multer.MulterError) {
          let message = 'File upload error';
          let code = 'UPLOAD_ERROR';
          const categoryLimits = FileValidationService.getCategoryLimits(category as string);

          switch (error.code) {
            case 'LIMIT_FILE_SIZE':
              message = `File size exceeds maximum allowed size of ${FileValidationService.formatFileSize(categoryLimits.maxFileSize)} for ${category} files`;
              code = 'FILE_TOO_LARGE';
              break;
            case 'LIMIT_FILE_COUNT':
              message = `Too many files uploaded. Maximum allowed: ${maxCount}`;
              code = 'TOO_MANY_FILES';
              break;
            case 'LIMIT_UNEXPECTED_FILE':
              message = `Unexpected field name: ${error.field}`;
              code = 'UNEXPECTED_FIELD';
              break;
            default:
              message = error.message;
          }

          const uploadError = new FileUploadError(message, code, error.field);
          return next(uploadError);
        }

        if (error instanceof FileUploadError) {
          return next(error);
        }

        // Unknown error
        const uploadError = new FileUploadError(
          error.message || 'Unknown file upload error',
          'UNKNOWN_ERROR'
        );
        return next(uploadError);
      }

      next();
    });
  };
};
// Helper function to validate file upload request with enhanced validation
export const validateFileUploadRequest = (req: Request): { isValid: boolean; errors: string[]; warnings?: string[] } => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const category = req.body?.category || 'document';

  // Check if files were uploaded
  if (!req.file && !req.files) {
    errors.push('No files uploaded');
    return { isValid: false, errors };
  }

  // Validate single file if present
  if (req.file) {
    const validation = FileValidationService.validateFile(
      req.file.buffer,
      req.file.originalname,
      { category }
    );
    
    if (!validation.isValid) {
      errors.push(...validation.errors);
    }
    
    if (validation.warnings) {
      warnings.push(...validation.warnings);
    }
  }

  // Validate multiple files if present
  if (req.files && Array.isArray(req.files)) {
    req.files.forEach((file, index) => {
      const validation = FileValidationService.validateFile(
        file.buffer,
        file.originalname,
        { category }
      );
      
      if (!validation.isValid) {
        validation.errors.forEach(error => {
          errors.push(`File ${index + 1} (${file.originalname}): ${error}`);
        });
      }
      
      if (validation.warnings) {
        validation.warnings.forEach(warning => {
          warnings.push(`File ${index + 1} (${file.originalname}): ${warning}`);
        });
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    ...(warnings.length > 0 && { warnings }),
  };
};