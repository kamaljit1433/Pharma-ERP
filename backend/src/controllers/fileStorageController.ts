import { Request, Response, NextFunction } from 'express';
import fileStorageService from '../services/fileStorageService';
import { FileCategory, SignedUrlOptions } from '../types/fileStorage';
import { validateFileUploadRequest } from '../middleware/fileUpload';

export class FileStorageController {
  /**
   * Upload a single file
   */
  async uploadFile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate request
      const validation = validateFileUploadRequest(req);
      if (!validation.isValid) {
        res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'File upload validation failed',
            details: validation.errors,
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown',
          },
        });
        return;
      }

      if (!req.file) {
        res.status(400).json({
          error: {
            code: 'NO_FILE',
            message: 'No file uploaded',
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown',
          },
        });
        return;
      }

      // Extract upload options from request body
      const {
        employeeId,
        category = FileCategory.OTHER,
        isPublic = false,
        metadata = {},
      } = req.body;

      // Validate category
      if (!Object.values(FileCategory).includes(category)) {
        res.status(400).json({
          error: {
            code: 'INVALID_CATEGORY',
            message: `Invalid file category. Allowed values: ${Object.values(FileCategory).join(', ')}`,
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown',
          },
        });
        return;
      }

      // Upload file
      const result = await fileStorageService.uploadFile(
        req.file.buffer,
        req.file.originalname,
        {
          employeeId,
          category,
          isPublic: Boolean(isPublic),
          metadata: typeof metadata === 'string' ? JSON.parse(metadata) : metadata,
        }
      );

      res.status(201).json({
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Upload multiple files
   */
  async uploadFiles(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate request
      const validation = validateFileUploadRequest(req);
      if (!validation.isValid) {
        res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'File upload validation failed',
            details: validation.errors,
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown',
          },
        });
        return;
      }

      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        res.status(400).json({
          error: {
            code: 'NO_FILES',
            message: 'No files uploaded',
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown',
          },
        });
        return;
      }

      // Extract upload options from request body
      const {
        employeeId,
        category = FileCategory.OTHER,
        isPublic = false,
        metadata = {},
      } = req.body;

      // Validate category
      if (!Object.values(FileCategory).includes(category)) {
        res.status(400).json({
          error: {
            code: 'INVALID_CATEGORY',
            message: `Invalid file category. Allowed values: ${Object.values(FileCategory).join(', ')}`,
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown',
          },
        });
        return;
      }

      // Prepare files for upload
      const files = req.files.map(file => ({
        buffer: file.buffer,
        originalName: file.originalname,
      }));

      // Upload files
      const results = await fileStorageService.uploadFiles(files, {
        employeeId,
        category,
        isPublic: Boolean(isPublic),
        metadata: typeof metadata === 'string' ? JSON.parse(metadata) : metadata,
      });

      res.status(201).json({
        success: true,
        data: results,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Download a file
   */
  async downloadFile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { key } = req.params;
      const user = (req as any).user;

      if (!key) {
        res.status(400).json({
          error: {
            code: 'MISSING_KEY',
            message: 'File key is required',
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown',
          },
        });
        return;
      }

      // Check if file exists with user context
      const exists = await fileStorageService.fileExists(key, user);
      if (!exists) {
        res.status(404).json({
          error: {
            code: 'FILE_NOT_FOUND',
            message: 'File not found',
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown',
          },
        });
        return;
      }

      // Download file
      const fileBuffer = await fileStorageService.downloadFile(key);
      
      // Set appropriate headers
      const filename = key.split('/').pop() || 'download';
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Length', fileBuffer.length);

      res.send(fileBuffer);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a file
   */
  async deleteFile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { key } = req.params;
      const user = (req as any).user;

      if (!key) {
        res.status(400).json({
          error: {
            code: 'MISSING_KEY',
            message: 'File key is required',
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown',
          },
        });
        return;
      }

      // Check if file exists with user context
      const exists = await fileStorageService.fileExists(key, user);
      if (!exists) {
        res.status(404).json({
          error: {
            code: 'FILE_NOT_FOUND',
            message: 'File not found',
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown',
          },
        });
        return;
      }

      // Delete file with user context for audit logging
      await fileStorageService.deleteFile(key, user);

      res.status(200).json({
        success: true,
        message: 'File deleted successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a signed URL for file access
   */
  async getSignedUrl(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { key } = req.params;
      const { operation = 'getObject', expiresIn } = req.query;
      const user = (req as any).user;

      if (!key) {
        res.status(400).json({
          error: {
            code: 'MISSING_KEY',
            message: 'File key is required',
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown',
          },
        });
        return;
      }

      if (operation !== 'getObject' && operation !== 'putObject') {
        res.status(400).json({
          error: {
            code: 'INVALID_OPERATION',
            message: 'Operation must be either "getObject" or "putObject"',
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown',
          },
        });
        return;
      }

      // Generate signed URL with enhanced security and user context
      const options: SignedUrlOptions = {};
      if (expiresIn) {
        const expiresInNum = parseInt(expiresIn as string, 10);
        if (isNaN(expiresInNum) || expiresInNum < 1 || expiresInNum > 86400) {
          res.status(400).json({
            error: {
              code: 'INVALID_EXPIRES_IN',
              message: 'expiresIn must be a number between 1 and 86400 seconds (24 hours)',
              timestamp: new Date().toISOString(),
              requestId: req.headers['x-request-id'] || 'unknown',
            },
          });
          return;
        }
        options.expiresIn = expiresInNum;
      }
      
      const signedUrl = await fileStorageService.getSignedUrl(
        key,
        operation as 'getObject' | 'putObject',
        options,
        user
      );

      res.status(200).json({
        success: true,
        data: {
          url: signedUrl,
          key,
          operation,
          expiresIn: options.expiresIn || 3600,
          generatedAt: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * List files
   */
  async listFiles(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { prefix, employeeId, category } = req.query;
      const user = (req as any).user;

      let files;

      if (employeeId) {
        files = await fileStorageService.listFilesByEmployee(
          employeeId as string,
          category as FileCategory,
          user
        );
      } else if (category) {
        files = await fileStorageService.listFilesByCategory(
          category as FileCategory,
          user
        );
      } else {
        const allFiles = await fileStorageService.listFiles(prefix as string);
        // Filter files based on user permissions
        files = user ? fileStorageService['filterFilesByPermissions'](allFiles, user) : allFiles;
      }

      res.status(200).json({
        success: true,
        data: files,
        count: files.length,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Initiate multipart upload
   */
  async initiateMultipartUpload(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        originalName,
        employeeId,
        category = FileCategory.OTHER,
        isPublic = false,
        metadata = {},
      } = req.body;

      if (!originalName) {
        res.status(400).json({
          error: {
            code: 'MISSING_FILENAME',
            message: 'Original filename is required',
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown',
          },
        });
        return;
      }

      // Validate category
      if (!Object.values(FileCategory).includes(category)) {
        res.status(400).json({
          error: {
            code: 'INVALID_CATEGORY',
            message: `Invalid file category. Allowed values: ${Object.values(FileCategory).join(', ')}`,
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown',
          },
        });
        return;
      }

      // Initiate multipart upload
      const result = await fileStorageService.initiateMultipartUpload(originalName, {
        employeeId,
        category,
        isPublic: Boolean(isPublic),
        metadata,
      });

      res.status(200).json({
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Complete multipart upload
   */
  async completeMultipartUpload(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { uploadId, key, parts } = req.body;

      if (!uploadId || !key || !parts || !Array.isArray(parts)) {
        res.status(400).json({
          error: {
            code: 'MISSING_PARAMETERS',
            message: 'uploadId, key, and parts array are required',
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown',
          },
        });
        return;
      }

      // Validate parts array
      for (const part of parts) {
        if (!part.partNumber || !part.etag) {
          res.status(400).json({
            error: {
              code: 'INVALID_PARTS',
              message: 'Each part must have partNumber and etag',
              timestamp: new Date().toISOString(),
              requestId: req.headers['x-request-id'] || 'unknown',
            },
          });
          return;
        }
      }

      // Complete multipart upload
      const result = await fileStorageService.completeMultipartUpload(uploadId, key, parts);

      res.status(200).json({
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Abort multipart upload
   */
  async abortMultipartUpload(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { uploadId, key } = req.body;

      if (!uploadId || !key) {
        res.status(400).json({
          error: {
            code: 'MISSING_PARAMETERS',
            message: 'uploadId and key are required',
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown',
          },
        });
        return;
      }

      // Abort multipart upload
      await fileStorageService.abortMultipartUpload(uploadId, key);

      res.status(200).json({
        success: true,
        message: 'Multipart upload aborted successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Clean up files
   */
  async cleanupFiles(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        olderThan,
        category,
        employeeId,
        dryRun = true,
      } = req.body;
      const user = (req as any).user;

      const options: any = {
        dryRun: Boolean(dryRun),
      };

      if (olderThan) {
        options.olderThan = new Date(olderThan);
      }

      if (category && Object.values(FileCategory).includes(category)) {
        options.category = category;
      }

      if (employeeId) {
        options.employeeId = employeeId;
      }

      // Clean up files with user context for audit logging
      const result = await fileStorageService.cleanupFiles(options, user);

      res.status(200).json({
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete multiple files (bulk deletion)
   */
  async deleteFiles(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { keys } = req.body;
      const user = (req as any).user;

      if (!keys || !Array.isArray(keys) || keys.length === 0) {
        res.status(400).json({
          error: {
            code: 'MISSING_KEYS',
            message: 'File keys array is required',
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown',
          },
        });
        return;
      }

      // Validate keys array
      if (keys.length > 1000) {
        res.status(400).json({
          error: {
            code: 'TOO_MANY_FILES',
            message: 'Maximum 1000 files can be deleted at once',
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown',
          },
        });
        return;
      }

      // Delete files with user context for audit logging
      const result = await fileStorageService.deleteFiles(keys, user);

      res.status(200).json({
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Clean up orphaned multipart uploads
   */
  async cleanupMultipartUploads(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { olderThanHours = 24 } = req.body;
      const user = (req as any).user;

      // Validate olderThanHours
      if (typeof olderThanHours !== 'number' || olderThanHours < 1 || olderThanHours > 168) {
        res.status(400).json({
          error: {
            code: 'INVALID_HOURS',
            message: 'olderThanHours must be a number between 1 and 168 (7 days)',
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown',
          },
        });
        return;
      }

      // Clean up orphaned multipart uploads
      const result = await fileStorageService.cleanupOrphanedMultipartUploads(olderThanHours, user);

      res.status(200).json({
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Clean up orphaned files
   */
  async cleanupOrphanedFiles(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { dryRun = true } = req.body;
      const user = (req as any).user;

      // Clean up orphaned files
      const result = await fileStorageService.cleanupOrphanedFiles(user, Boolean(dryRun));

      res.status(200).json({
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new FileStorageController();