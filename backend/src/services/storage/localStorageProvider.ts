import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { FileStorageProvider, FileUploadOptions, FileUploadResult, FileMetadata, SignedUrlOptions } from '../../types/fileStorage';

/**
 * Local file storage provider for development
 * Stores files in backend/uploads directory instead of AWS S3
 */
export class LocalStorageProvider implements FileStorageProvider {
  private uploadDir: string;

  constructor() {
    this.uploadDir = path.join(process.cwd(), 'uploads');
    this.ensureUploadDirExists();
  }

  private ensureUploadDirExists(): void {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
      console.log(`Created upload directory: ${this.uploadDir}`);
    }
  }

  async uploadFile(file: Buffer, key: string, options: FileUploadOptions): Promise<FileUploadResult> {
    try {
      const filePath = path.join(this.uploadDir, key);
      const fileDir = path.dirname(filePath);

      // Create directory if it doesn't exist
      if (!fs.existsSync(fileDir)) {
        fs.mkdirSync(fileDir, { recursive: true });
      }

      // Write file to disk
      fs.writeFileSync(filePath, file);

      const metadataObj: any = {
        id: uuidv4(),
        originalName: key,
        fileName: key,
        mimeType: (options.metadata?.['mimeType'] as string) || 'application/octet-stream',
        size: file.length,
        category: options.category,
        isPublic: options.isPublic || false,
        key,
        uploadedAt: new Date(),
        uploadedBy: 'system',
        metadata: options.metadata,
      };

      if (options.employeeId) {
        metadataObj.employeeId = options.employeeId;
      }

      const metadata: FileMetadata = metadataObj;

      return {
        id: metadata.id,
        url: `/uploads/${key}`,
        key,
        metadata,
      };
    } catch (error) {
      throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async downloadFile(key: string): Promise<Buffer> {
    try {
      const filePath = path.join(this.uploadDir, key);

      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${key}`);
      }

      return fs.readFileSync(filePath);
    } catch (error) {
      throw new Error(`Failed to download file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      const filePath = path.join(this.uploadDir, key);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      throw new Error(`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteFiles(keys: string[]): Promise<{ deleted: string[]; failed: Array<{ key: string; error: string }> }> {
    const deleted: string[] = [];
    const failed: Array<{ key: string; error: string }> = [];

    for (const key of keys) {
      try {
        await this.deleteFile(key);
        deleted.push(key);
      } catch (error) {
        failed.push({
          key,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return { deleted, failed };
  }

  async getSignedUrl(_key: string, _operation: 'getObject' | 'putObject', _options?: SignedUrlOptions): Promise<string> {
    // For local storage, just return the file path as URL
    return `/uploads/${_key}`;
  }

  async fileExists(key: string): Promise<boolean> {
    const filePath = path.join(this.uploadDir, key);
    return fs.existsSync(filePath);
  }

  async listFiles(prefix?: string): Promise<FileMetadata[]> {
    try {
      const files: FileMetadata[] = [];
      const searchDir = prefix ? path.join(this.uploadDir, prefix) : this.uploadDir;

      if (!fs.existsSync(searchDir)) {
        return files;
      }

      const walkDir = (dir: string, currentPrefix: string = ''): void => {
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          const relativePath = path.join(currentPrefix, entry.name);

          if (entry.isDirectory()) {
            walkDir(fullPath, relativePath);
          } else {
            const stats = fs.statSync(fullPath);
            files.push({
              id: uuidv4(),
              originalName: entry.name,
              fileName: entry.name,
              mimeType: 'application/octet-stream',
              size: stats.size,
              category: 'other' as any,
              isPublic: false,
              key: relativePath,
              uploadedAt: stats.mtime,
              uploadedBy: 'system',
            });
          }
        }
      };

      walkDir(searchDir);
      return files;
    } catch (error) {
      throw new Error(`Failed to list files: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async initiateMultipartUpload(_key: string, _options: FileUploadOptions): Promise<string> {
    // For local storage, just return a mock upload ID
    return uuidv4();
  }

  async uploadPart(_uploadId: string, key: string, partNumber: number, body: Buffer): Promise<string> {
    // For local storage, store part temporarily
    const partKey = `${key}.part${partNumber}`;
    await this.uploadFile(body, partKey, { category: 'other' as any });
    return `etag-${partNumber}`;
  }

  async completeMultipartUpload(
    _uploadId: string,
    key: string,
    parts: Array<{ partNumber: number; etag: string }>
  ): Promise<FileUploadResult> {
    try {
      // Combine all parts
      const filePath = path.join(this.uploadDir, key);
      const fileDir = path.dirname(filePath);

      if (!fs.existsSync(fileDir)) {
        fs.mkdirSync(fileDir, { recursive: true });
      }

      const writeStream = fs.createWriteStream(filePath);

      for (const part of parts.sort((a, b) => a.partNumber - b.partNumber)) {
        const partKey = `${key}.part${part.partNumber}`;
        const partBuffer = await this.downloadFile(partKey);
        writeStream.write(partBuffer);
        await this.deleteFile(partKey);
      }

      writeStream.end();

      return new Promise((resolve, reject) => {
        writeStream.on('finish', () => {
          const metadata: FileMetadata = {
            id: uuidv4(),
            originalName: key,
            fileName: key,
            mimeType: 'application/octet-stream',
            size: fs.statSync(filePath).size,
            category: 'other' as any,
            isPublic: false,
            key,
            uploadedAt: new Date(),
            uploadedBy: 'system',
          };

          resolve({
            id: metadata.id,
            url: `/uploads/${key}`,
            key,
            metadata,
          });
        });

        writeStream.on('error', reject);
      });
    } catch (error) {
      throw new Error(`Failed to complete multipart upload: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async abortMultipartUpload(_uploadId: string, key: string): Promise<void> {
    // Clean up any partial files
    try {
      const files = await this.listFiles();
      for (const file of files) {
        if (file.key.startsWith(`${key}.part`)) {
          await this.deleteFile(file.key);
        }
      }
    } catch (error) {
      console.error('Error cleaning up multipart upload:', error);
    }
  }

  async listMultipartUploads(_olderThanHours: number = 24): Promise<Array<{ uploadId: string; key: string; initiated: Date }>> {
    // Local storage doesn't track multipart uploads
    return [];
  }

  async cleanupOrphanedMultipartUploads(_olderThanHours: number = 24): Promise<{ abortedCount: number; errors: Array<{ uploadId: string; error: string }> }> {
    // Local storage doesn't track multipart uploads
    return { abortedCount: 0, errors: [] };
  }
}
