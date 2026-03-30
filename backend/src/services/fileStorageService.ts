import { v4 as uuidv4 } from 'uuid';
import { FileValidationService, FileValidationOptions } from './fileValidationService';
import { StorageProviderFactory } from './factories/StorageProviderFactory';
import {
  FileStorageProvider,
  FileUploadOptions,
  FileMetadata,
  FileUploadResult,
  FileValidationResult,
  FileCleanupOptions,
  FileCleanupResult,
  FileCategory,
  SignedUrlOptions,
} from '../types/fileStorage';

export class FileStorageService {
  private provider: FileStorageProvider;

  constructor() {
    this.provider = StorageProviderFactory.createProvider();
  }

  /**
   * Upload a single file
   */
  async uploadFile(
    file: Buffer,
    originalName: string,
    options: FileUploadOptions
  ): Promise<FileUploadResult> {
    // Validate file with category-specific rules
    const validation = this.validateFile(file, originalName, options);
    if (!validation.isValid) {
      throw new Error(`File validation failed: ${validation.errors.join(', ')}`);
    }

    // Generate unique file key
    const key = this.generateFileKey(originalName, options);

    // Upload file using the provider
    return await this.provider.uploadFile(file, key, options);
  }

  /**
   * Upload multiple files
   */
  async uploadFiles(
    files: Array<{ buffer: Buffer; originalName: string }>,
    options: FileUploadOptions
  ): Promise<FileUploadResult[]> {
    const results: FileUploadResult[] = [];
    const errors: string[] = [];

    for (const file of files) {
      try {
        const result = await this.uploadFile(file.buffer, file.originalName, options);
        results.push(result);
      } catch (error) {
        errors.push(`Failed to upload ${file.originalName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    if (errors.length > 0) {
      console.warn('Some files failed to upload:', errors);
    }

    return results;
  }

  /**
   * Download a file
   */
  async downloadFile(key: string): Promise<Buffer> {
    return await this.provider.downloadFile(key);
  }

  /**
   * Delete a file with audit logging
   */
  async deleteFile(key: string, userContext?: { userId: string; role: string; employeeId?: string }): Promise<void> {
    // Check if file exists before deletion
    const exists = await this.provider.fileExists(key);
    if (!exists) {
      throw new Error('File not found');
    }

    // Log deletion attempt for audit purposes
    if (userContext) {
      console.log('File Deletion:', {
        timestamp: new Date().toISOString(),
        userId: userContext.userId,
        employeeId: userContext.employeeId,
        role: userContext.role,
        fileKey: key,
        action: 'delete',
      });
    }

    return await this.provider.deleteFile(key);
  }

  /**
   * Delete multiple files with enhanced error handling and audit logging
   */
  async deleteFiles(
    keys: string[], 
    userContext?: { userId: string; role: string; employeeId?: string }
  ): Promise<{ deleted: string[]; failed: Array<{ key: string; error: string }> }> {
    // Log bulk deletion attempt
    if (userContext) {
      console.log('Bulk File Deletion:', {
        timestamp: new Date().toISOString(),
        userId: userContext.userId,
        employeeId: userContext.employeeId,
        role: userContext.role,
        fileCount: keys.length,
        action: 'bulk_delete',
      });
    }

    let result: { deleted: string[]; failed: Array<{ key: string; error: string }> };

    // Use provider's bulk delete if available, otherwise fall back to individual deletions
    if (this.provider.deleteFiles && typeof this.provider.deleteFiles === 'function') {
      result = await this.provider.deleteFiles(keys);
    } else {
      const deleted: string[] = [];
      const failed: Array<{ key: string; error: string }> = [];

      for (const key of keys) {
        try {
          // Check if file exists before deletion
          const exists = await this.provider.fileExists(key);
          if (!exists) {
            failed.push({
              key,
              error: 'File not found',
            });
            continue;
          }

          await this.provider.deleteFile(key);
          deleted.push(key);
        } catch (error) {
          failed.push({
            key,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      result = { deleted, failed };
    }

    // Log results
    if (userContext) {
      console.log('Bulk File Deletion Completed:', {
        timestamp: new Date().toISOString(),
        userId: userContext.userId,
        employeeId: userContext.employeeId,
        role: userContext.role,
        deletedCount: result.deleted.length,
        failedCount: result.failed.length,
        action: 'bulk_delete_complete',
      });
    }

    return result;
  }

  /**
   * Get a signed URL for file access with enhanced security
   */
  async getSignedUrl(
    key: string,
    operation: 'getObject' | 'putObject' = 'getObject',
    options?: SignedUrlOptions,
    userContext?: { userId: string; role: string; employeeId?: string }
  ): Promise<string> {
    // Validate file exists before generating signed URL
    const exists = await this.provider.fileExists(key);
    if (!exists) {
      throw new Error('File not found');
    }

    // Apply time-limited access - default to 1 hour, max 24 hours
    const expiresIn = Math.min(options?.expiresIn || 3600, 86400);
    const enhancedOptions: SignedUrlOptions = {
      ...options,
      expiresIn,
    };

    // For download operations, set appropriate content disposition
    if (operation === 'getObject') {
      const filename = key.split('/').pop() || 'download';
      enhancedOptions.responseContentDisposition = `attachment; filename="${filename}"`;
    }

    // Log the signed URL generation for audit purposes
    if (userContext) {
      console.log('Signed URL Generated:', {
        timestamp: new Date().toISOString(),
        userId: userContext.userId,
        employeeId: userContext.employeeId,
        role: userContext.role,
        fileKey: key,
        operation,
        expiresIn,
      });
    }

    return await this.provider.getSignedUrl(key, operation, enhancedOptions);
  }

  /**
   * Check if a file exists with access control validation
   */
  async fileExists(key: string, userContext?: { userId: string; role: string; employeeId?: string }): Promise<boolean> {
    const exists = await this.provider.fileExists(key);
    
    if (exists && userContext) {
      // Log file existence check for audit purposes
      console.log('File Existence Check:', {
        timestamp: new Date().toISOString(),
        userId: userContext.userId,
        employeeId: userContext.employeeId,
        role: userContext.role,
        fileKey: key,
        exists,
      });
    }
    
    return exists;
  }

  /**
   * List files with optional prefix filter
   */
  async listFiles(prefix?: string): Promise<FileMetadata[]> {
    return await this.provider.listFiles(prefix);
  }

  /**
   * List files by employee ID with access control
   */
  async listFilesByEmployee(
    employeeId: string, 
    category?: FileCategory,
    userContext?: { userId: string; role: string; employeeId?: string }
  ): Promise<FileMetadata[]> {
    const prefix = category 
      ? `employees/${employeeId}/${category}/`
      : `employees/${employeeId}/`;
    
    const files = await this.provider.listFiles(prefix);
    
    // Filter files based on user permissions
    if (userContext) {
      return this.filterFilesByPermissions(files, userContext);
    }
    
    return files;
  }

  /**
   * List files by category with access control
   */
  async listFilesByCategory(
    category: FileCategory,
    userContext?: { userId: string; role: string; employeeId?: string }
  ): Promise<FileMetadata[]> {
    // This is a simplified implementation - in a real scenario, you might want to use database queries
    // for better performance when dealing with large numbers of files
    const allFiles = await this.provider.listFiles();
    const categoryFiles = allFiles.filter(file => file.category === category);
    
    // Filter files based on user permissions
    if (userContext) {
      return this.filterFilesByPermissions(categoryFiles, userContext);
    }
    
    return categoryFiles;
  }

  /**
   * Initiate multipart upload for large files
   */
  async initiateMultipartUpload(
    originalName: string,
    options: FileUploadOptions
  ): Promise<{ uploadId: string; key: string }> {
    const key = this.generateFileKey(originalName, options);
    const uploadId = await this.provider.initiateMultipartUpload(key, options);
    return { uploadId, key };
  }

  /**
   * Upload a part of a multipart upload
   */
  async uploadPart(
    uploadId: string,
    key: string,
    partNumber: number,
    body: Buffer
  ): Promise<string> {
    return await this.provider.uploadPart(uploadId, key, partNumber, body);
  }

  /**
   * Complete multipart upload
   */
  async completeMultipartUpload(
    uploadId: string,
    key: string,
    parts: Array<{ partNumber: number; etag: string }>
  ): Promise<FileUploadResult> {
    return await this.provider.completeMultipartUpload(uploadId, key, parts);
  }

  /**
   * Abort multipart upload
   */
  async abortMultipartUpload(uploadId: string, key: string): Promise<void> {
    return await this.provider.abortMultipartUpload(uploadId, key);
  }

  /**
   * Clean up old or orphaned files with enhanced functionality
   */
  async cleanupFiles(
    options: FileCleanupOptions,
    userContext?: { userId: string; role: string; employeeId?: string }
  ): Promise<FileCleanupResult> {
    // Log cleanup attempt
    if (userContext) {
      console.log('File Cleanup Started:', {
        timestamp: new Date().toISOString(),
        userId: userContext.userId,
        employeeId: userContext.employeeId,
        role: userContext.role,
        options,
        action: 'cleanup_start',
      });
    }

    const prefix = options.employeeId ? `employees/${options.employeeId}/` : undefined;
    const files = await this.provider.listFiles(prefix);

    const filesToDelete = files.filter(file => {
      // Filter by age
      if (options.olderThan && file.uploadedAt > options.olderThan) {
        return false;
      }

      // Filter by category
      if (options.category && file.category !== options.category) {
        return false;
      }

      // Filter by employee ID
      if (options.employeeId && file.employeeId !== options.employeeId) {
        return false;
      }

      return true;
    });

    const result: FileCleanupResult = {
      deletedCount: 0,
      deletedFiles: [],
      errors: [],
    };

    if (options.dryRun) {
      result.deletedFiles = filesToDelete.map(file => file.key);
      result.deletedCount = filesToDelete.length;
      
      // Log dry run results
      if (userContext) {
        console.log('File Cleanup Dry Run:', {
          timestamp: new Date().toISOString(),
          userId: userContext.userId,
          employeeId: userContext.employeeId,
          role: userContext.role,
          wouldDeleteCount: result.deletedCount,
          action: 'cleanup_dry_run',
        });
      }
      
      return result;
    }

    for (const file of filesToDelete) {
      try {
        await this.provider.deleteFile(file.key);
        result.deletedFiles.push(file.key);
        result.deletedCount++;
      } catch (error) {
        result.errors.push({
          key: file.key,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // Log cleanup completion
    if (userContext) {
      console.log('File Cleanup Completed:', {
        timestamp: new Date().toISOString(),
        userId: userContext.userId,
        employeeId: userContext.employeeId,
        role: userContext.role,
        deletedCount: result.deletedCount,
        errorCount: result.errors.length,
        action: 'cleanup_complete',
      });
    }

    return result;
  }

  /**
   * Clean up orphaned multipart uploads
   */
  async cleanupOrphanedMultipartUploads(
    olderThanHours: number = 24,
    userContext?: { userId: string; role: string; employeeId?: string }
  ): Promise<{ abortedCount: number; errors: Array<{ uploadId: string; error: string }> }> {
    // Log multipart cleanup attempt
    if (userContext) {
      console.log('Multipart Cleanup Started:', {
        timestamp: new Date().toISOString(),
        userId: userContext.userId,
        employeeId: userContext.employeeId,
        role: userContext.role,
        olderThanHours,
        action: 'multipart_cleanup_start',
      });
    }

    let result: { abortedCount: number; errors: Array<{ uploadId: string; error: string }> };

    // Use provider's cleanup method if available
    if (this.provider.cleanupOrphanedMultipartUploads && typeof this.provider.cleanupOrphanedMultipartUploads === 'function') {
      result = await this.provider.cleanupOrphanedMultipartUploads(olderThanHours);
    } else {
      // Fallback implementation
      result = {
        abortedCount: 0,
        errors: [],
      };
    }

    // Log multipart cleanup completion
    if (userContext) {
      console.log('Multipart Cleanup Completed:', {
        timestamp: new Date().toISOString(),
        userId: userContext.userId,
        employeeId: userContext.employeeId,
        role: userContext.role,
        abortedCount: result.abortedCount,
        errorCount: result.errors.length,
        action: 'multipart_cleanup_complete',
      });
    }

    return result;
  }

  /**
   * Find and clean up orphaned files (files without database references)
   */
  async cleanupOrphanedFiles(
    userContext?: { userId: string; role: string; employeeId?: string },
    dryRun: boolean = true
  ): Promise<{ orphanedCount: number; deletedCount: number; errors: Array<{ key: string; error: string }> }> {
    // Log orphaned file cleanup attempt
    if (userContext) {
      console.log('Orphaned File Cleanup Started:', {
        timestamp: new Date().toISOString(),
        userId: userContext.userId,
        employeeId: userContext.employeeId,
        role: userContext.role,
        dryRun,
        action: 'orphaned_cleanup_start',
      });
    }

    // Get all files from storage
    const allFiles = await this.provider.listFiles();
    
    // TODO: This would need database integration to check which files are referenced
    // For now, we'll identify potential orphans based on naming patterns and age
    const potentialOrphans = allFiles.filter(file => {
      // Files older than 30 days without proper metadata might be orphaned
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      return file.uploadedAt < thirtyDaysAgo && 
             (!file.metadata || Object.keys(file.metadata).length === 0);
    });

    const result = {
      orphanedCount: potentialOrphans.length,
      deletedCount: 0,
      errors: [] as Array<{ key: string; error: string }>,
    };

    if (!dryRun) {
      for (const file of potentialOrphans) {
        try {
          await this.provider.deleteFile(file.key);
          result.deletedCount++;
        } catch (error) {
          result.errors.push({
            key: file.key,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
    }

    // Log orphaned file cleanup completion
    if (userContext) {
      console.log('Orphaned File Cleanup Completed:', {
        timestamp: new Date().toISOString(),
        userId: userContext.userId,
        employeeId: userContext.employeeId,
        role: userContext.role,
        orphanedCount: result.orphanedCount,
        deletedCount: result.deletedCount,
        errorCount: result.errors.length,
        action: 'orphaned_cleanup_complete',
      });
    }

    return result;
  }

  /**
   * Validate file before upload
   */
  private validateFile(file: Buffer, originalName: string, options: FileUploadOptions): FileValidationResult {
    const validationOptions: FileValidationOptions = {
      category: options.category,
    };
    
    if (options.employeeId) {
      validationOptions.employeeId = options.employeeId;
    }
    
    if (options.isPublic !== undefined) {
      validationOptions.isPublic = options.isPublic;
    }
    
    if (options.metadata) {
      validationOptions.metadata = options.metadata;
    }
    
    return FileValidationService.validateFile(file, originalName, validationOptions);
  }

  /**
   * Generate a unique file key for storage
   */
  private generateFileKey(originalName: string, options: FileUploadOptions): string {
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const uuid = uuidv4();
    const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');

    let basePath = '';

    if (options.employeeId) {
      basePath = `employees/${options.employeeId}/${options.category}`;
    } else {
      basePath = `system/${options.category}`;
    }

    return `${basePath}/${timestamp}/${uuid}_${sanitizedName}`;
  }

  /**
   * Get file category from file type
   */
  static getCategoryFromMimeType(mimeType: string): FileCategory {
    if (mimeType.startsWith('image/')) {
      return FileCategory.PROFILE_PHOTO;
    }
    
    if (mimeType === 'application/pdf') {
      return FileCategory.DOCUMENT;
    }

    if (mimeType.includes('word') || mimeType.includes('document')) {
      return FileCategory.DOCUMENT;
    }

    return FileCategory.OTHER;
  }

  /**
   * Get human-readable file size
   */
  static formatFileSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Filter files based on user permissions
   */
  private filterFilesByPermissions(
    files: FileMetadata[],
    userContext: { userId: string; role: string; employeeId?: string }
  ): FileMetadata[] {
    return files.filter(file => {
      // Super Admin and HR Manager can see all files
      if (['super_admin', 'hr_manager'].includes(userContext.role)) {
        return true;
      }

      // System files are accessible to all authenticated users
      if (file.key.startsWith('system/')) {
        return true;
      }

      // Employee-specific files
      if (file.employeeId) {
        // Users can see their own files
        if (userContext.employeeId === file.employeeId) {
          return true;
        }

        // Department managers can see their team's files (simplified)
        if (userContext.role === 'department_manager') {
          return true;
        }

        // Finance role can see payslips and contracts
        if (userContext.role === 'finance' && 
            [FileCategory.PAYSLIP, FileCategory.CONTRACT].includes(file.category)) {
          return true;
        }

        // IT Admin can see profile photos
        if (userContext.role === 'it_admin' && file.category === FileCategory.PROFILE_PHOTO) {
          return true;
        }
      }

      return false;
    });
  }
}

// Export singleton instance
export default new FileStorageService();