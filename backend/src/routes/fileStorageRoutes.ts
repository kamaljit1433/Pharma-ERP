import { Router } from 'express';
import fileStorageController from '../controllers/fileStorageController';
import { uploadSingle, uploadMultiple, uploadNone } from '../middleware/fileUpload';
import { authenticateToken } from '../middleware/auth';
import { 
  canAccessFile, 
  canUploadFile, 
  canDeleteFile, 
  canListFiles,
  validateSignedUrlRequest,
  logFileAccess
} from '../middleware/fileAccessControl';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken as any);

/**
 * @route POST /api/v1/files/upload
 * @desc Upload a single file
 * @access Private
 * @body {
 *   file: File (multipart/form-data),
 *   employeeId?: string,
 *   category?: FileCategory,
 *   isPublic?: boolean,
 *   metadata?: object
 * }
 */
router.post('/upload', 
  uploadSingle('file'), 
  canUploadFile as any, 
  logFileAccess('upload') as any,
  fileStorageController.uploadFile
);

/**
 * @route POST /api/v1/files/upload-multiple
 * @desc Upload multiple files
 * @access Private
 * @body {
 *   files: File[] (multipart/form-data),
 *   employeeId?: string,
 *   category?: FileCategory,
 *   isPublic?: boolean,
 *   metadata?: object
 * }
 */
router.post('/upload-multiple', 
  uploadMultiple('files', 10), 
  canUploadFile as any, 
  logFileAccess('upload') as any,
  fileStorageController.uploadFiles
);

/**
 * @route GET /api/v1/files/download/:key
 * @desc Download a file by key
 * @access Private
 * @params {
 *   key: string (URL encoded file key)
 * }
 */
router.get('/download/:key', 
  canAccessFile as any, 
  logFileAccess('download') as any,
  fileStorageController.downloadFile
);

/**
 * @route DELETE /api/v1/files/:key
 * @desc Delete a file by key
 * @access Private
 * @params {
 *   key: string (URL encoded file key)
 * }
 */
router.delete('/:key', 
  canDeleteFile as any, 
  logFileAccess('delete') as any,
  fileStorageController.deleteFile
);

/**
 * @route GET /api/v1/files/signed-url/:key
 * @desc Get a signed URL for file access
 * @access Private
 * @params {
 *   key: string (URL encoded file key)
 * }
 * @query {
 *   operation?: 'getObject' | 'putObject',
 *   expiresIn?: number (seconds, max 86400)
 * }
 */
router.get('/signed-url/:key', 
  canAccessFile as any, 
  validateSignedUrlRequest as any,
  logFileAccess('signed_url') as any,
  fileStorageController.getSignedUrl
);

/**
 * @route GET /api/v1/files/list
 * @desc List files with optional filters
 * @access Private
 * @query {
 *   prefix?: string,
 *   employeeId?: string,
 *   category?: FileCategory
 * }
 */
router.get('/list', 
  canListFiles as any, 
  logFileAccess('list') as any,
  fileStorageController.listFiles
);

/**
 * @route POST /api/v1/files/multipart/initiate
 * @desc Initiate multipart upload for large files
 * @access Private
 * @body {
 *   originalName: string,
 *   employeeId?: string,
 *   category?: FileCategory,
 *   isPublic?: boolean,
 *   metadata?: object
 * }
 */
router.post('/multipart/initiate', uploadNone(), fileStorageController.initiateMultipartUpload);

/**
 * @route POST /api/v1/files/multipart/complete
 * @desc Complete multipart upload
 * @access Private
 * @body {
 *   uploadId: string,
 *   key: string,
 *   parts: Array<{ partNumber: number, etag: string }>
 * }
 */
router.post('/multipart/complete', uploadNone(), fileStorageController.completeMultipartUpload);

/**
 * @route POST /api/v1/files/multipart/abort
 * @desc Abort multipart upload
 * @access Private
 * @body {
 *   uploadId: string,
 *   key: string
 * }
 */
router.post('/multipart/abort', uploadNone(), fileStorageController.abortMultipartUpload);

/**
 * @route POST /api/v1/files/cleanup
 * @desc Clean up old or orphaned files (Admin only)
 * @access Private (Admin)
 * @body {
 *   olderThan?: string (ISO date),
 *   category?: FileCategory,
 *   employeeId?: string,
 *   dryRun?: boolean
 * }
 */
router.post('/cleanup', uploadNone(), fileStorageController.cleanupFiles);

/**
 * @route DELETE /api/v1/files/bulk
 * @desc Delete multiple files in bulk (Admin only)
 * @access Private (Admin)
 * @body {
 *   keys: string[] (array of file keys)
 * }
 */
router.delete('/bulk', uploadNone(), fileStorageController.deleteFiles);

/**
 * @route POST /api/v1/files/cleanup/multipart
 * @desc Clean up orphaned multipart uploads (Admin only)
 * @access Private (Admin)
 * @body {
 *   olderThanHours?: number (default 24, max 168)
 * }
 */
router.post('/cleanup/multipart', uploadNone(), fileStorageController.cleanupMultipartUploads);

/**
 * @route POST /api/v1/files/cleanup/orphaned
 * @desc Clean up orphaned files (Admin only)
 * @access Private (Admin)
 * @body {
 *   dryRun?: boolean (default true)
 * }
 */
router.post('/cleanup/orphaned', uploadNone(), fileStorageController.cleanupOrphanedFiles);

export default router;