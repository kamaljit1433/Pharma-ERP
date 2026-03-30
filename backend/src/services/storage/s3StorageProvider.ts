import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  ListMultipartUploadsCommand,
  AbortMultipartUploadCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  PutObjectCommandInput,
  GetObjectCommandInput,
  DeleteObjectCommandInput,
  DeleteObjectsCommandInput,
  HeadObjectCommandInput,
  ListObjectsV2CommandInput,
  ListMultipartUploadsCommandInput,
  CreateMultipartUploadCommandInput,
  UploadPartCommandInput,
  CompleteMultipartUploadCommandInput,
  AbortMultipartUploadCommandInput,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import config from '../../config';
import {
  FileStorageProvider,
  FileUploadOptions,
  FileMetadata,
  FileUploadResult,
  SignedUrlOptions,
  FileCategory,
} from '../../types/fileStorage';

export class S3StorageProvider implements FileStorageProvider {
  private s3Client: S3Client;
  private bucketName: string;

  constructor() {
    if (!config.fileStorage.s3) {
      throw new Error('S3 configuration is not available');
    }

    this.s3Client = new S3Client({
      region: config.fileStorage.s3.region,
      credentials: {
        accessKeyId: config.fileStorage.s3.accessKeyId,
        secretAccessKey: config.fileStorage.s3.secretAccessKey,
      },
    });
    this.bucketName = config.fileStorage.s3.bucket;
  }

  async uploadFile(file: Buffer, key: string, options: FileUploadOptions): Promise<FileUploadResult> {
    try {
      const metadata: Record<string, string> = {
        'uploaded-at': new Date().toISOString(),
        'category': options.category,
        ...(options.employeeId && { 'employee-id': options.employeeId }),
        ...(options.metadata || {}),
      };

      const putObjectParams: PutObjectCommandInput = {
        Bucket: this.bucketName,
        Key: key,
        Body: file,
        Metadata: metadata,
        ServerSideEncryption: 'AES256',
        ...(options.isPublic ? {} : { ACL: 'private' }),
      };

      const command = new PutObjectCommand(putObjectParams);
      await this.s3Client.send(command);

      const fileMetadata: FileMetadata = {
        id: uuidv4(),
        originalName: key.split('/').pop() || key,
        fileName: key.split('/').pop() || key,
        mimeType: this.getMimeTypeFromKey(key),
        size: file.length,
        category: options.category,
        isPublic: options.isPublic || false,
        key,
        uploadedAt: new Date(),
        uploadedBy: options.employeeId || 'system',
        ...(options.metadata && { metadata: options.metadata }),
        ...(options.employeeId && { employeeId: options.employeeId }),
      };

      const url = options.isPublic 
        ? `https://${this.bucketName}.s3.${config.fileStorage.s3?.region}.amazonaws.com/${key}`
        : await this.getSignedUrl(key, 'getObject');

      return {
        id: fileMetadata.id,
        url,
        key,
        metadata: fileMetadata,
      };
    } catch (error) {
      console.error('Error uploading file to S3:', error);
      throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async downloadFile(key: string): Promise<Buffer> {
    try {
      const getObjectParams: GetObjectCommandInput = {
        Bucket: this.bucketName,
        Key: key,
      };

      const command = new GetObjectCommand(getObjectParams);
      const response = await this.s3Client.send(command);

      if (!response.Body) {
        throw new Error('File not found or empty');
      }

      const chunks: Uint8Array[] = [];
      const stream = response.Body as any;

      for await (const chunk of stream) {
        chunks.push(chunk);
      }

      return Buffer.concat(chunks);
    } catch (error) {
      console.error('Error downloading file from S3:', error);
      throw new Error(`Failed to download file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      const deleteObjectParams: DeleteObjectCommandInput = {
        Bucket: this.bucketName,
        Key: key,
      };

      const command = new DeleteObjectCommand(deleteObjectParams);
      await this.s3Client.send(command);
    } catch (error) {
      console.error('Error deleting file from S3:', error);
      throw new Error(`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete multiple files in bulk (up to 1000 files per request)
   */
  async deleteFiles(keys: string[]): Promise<{ deleted: string[]; failed: Array<{ key: string; error: string }> }> {
    const result = {
      deleted: [] as string[],
      failed: [] as Array<{ key: string; error: string }>,
    };

    // S3 allows up to 1000 objects per delete request
    const batchSize = 1000;
    
    for (let i = 0; i < keys.length; i += batchSize) {
      const batch = keys.slice(i, i + batchSize);
      
      try {
        const deleteObjectsParams: DeleteObjectsCommandInput = {
          Bucket: this.bucketName,
          Delete: {
            Objects: batch.map(key => ({ Key: key })),
            Quiet: false, // Return information about deleted and failed objects
          },
        };

        const command = new DeleteObjectsCommand(deleteObjectsParams);
        const response = await this.s3Client.send(command);

        // Process successful deletions
        if (response.Deleted) {
          for (const deleted of response.Deleted) {
            if (deleted.Key) {
              result.deleted.push(deleted.Key);
            }
          }
        }

        // Process failed deletions
        if (response.Errors) {
          for (const error of response.Errors) {
            if (error.Key) {
              result.failed.push({
                key: error.Key,
                error: error.Message || 'Unknown error',
              });
            }
          }
        }
      } catch (error) {
        // If the entire batch fails, mark all keys as failed
        for (const key of batch) {
          result.failed.push({
            key,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
    }

    return result;
  }

  /**
   * List and clean up orphaned multipart uploads
   */
  async listMultipartUploads(olderThanHours: number = 24): Promise<Array<{ uploadId: string; key: string; initiated: Date }>> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setHours(cutoffDate.getHours() - olderThanHours);

      const listParams: ListMultipartUploadsCommandInput = {
        Bucket: this.bucketName,
        MaxUploads: 1000,
      };

      const command = new ListMultipartUploadsCommand(listParams);
      const response = await this.s3Client.send(command);

      const orphanedUploads: Array<{ uploadId: string; key: string; initiated: Date }> = [];

      if (response.Uploads) {
        for (const upload of response.Uploads) {
          if (upload.UploadId && upload.Key && upload.Initiated) {
            if (upload.Initiated < cutoffDate) {
              orphanedUploads.push({
                uploadId: upload.UploadId,
                key: upload.Key,
                initiated: upload.Initiated,
              });
            }
          }
        }
      }

      return orphanedUploads;
    } catch (error) {
      console.error('Error listing multipart uploads:', error);
      throw new Error(`Failed to list multipart uploads: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Clean up orphaned multipart uploads
   */
  async cleanupOrphanedMultipartUploads(olderThanHours: number = 24): Promise<{ abortedCount: number; errors: Array<{ uploadId: string; error: string }> }> {
    const result = {
      abortedCount: 0,
      errors: [] as Array<{ uploadId: string; error: string }>,
    };

    try {
      const orphanedUploads = await this.listMultipartUploads(olderThanHours);

      for (const upload of orphanedUploads) {
        try {
          await this.abortMultipartUpload(upload.uploadId, upload.key);
          result.abortedCount++;
        } catch (error) {
          result.errors.push({
            uploadId: upload.uploadId,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
    } catch (error) {
      console.error('Error cleaning up orphaned multipart uploads:', error);
      throw new Error(`Failed to cleanup orphaned multipart uploads: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return result;
  }

  async getSignedUrl(key: string, operation: 'getObject' | 'putObject', options?: SignedUrlOptions): Promise<string> {
    try {
      const expiresIn = options?.expiresIn || config.fileStorage.urlExpiry;
      
      let command;
      if (operation === 'getObject') {
        const params: GetObjectCommandInput = {
          Bucket: this.bucketName,
          Key: key,
          ...(options?.responseContentType && { ResponseContentType: options.responseContentType }),
          ...(options?.responseContentDisposition && { ResponseContentDisposition: options.responseContentDisposition }),
        };
        command = new GetObjectCommand(params);
      } else {
        const params: PutObjectCommandInput = {
          Bucket: this.bucketName,
          Key: key,
          ServerSideEncryption: 'AES256',
        };
        command = new PutObjectCommand(params);
      }

      return await getSignedUrl(this.s3Client, command, { expiresIn });
    } catch (error) {
      console.error('Error generating signed URL:', error);
      throw new Error(`Failed to generate signed URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async fileExists(key: string): Promise<boolean> {
    try {
      const headObjectParams: HeadObjectCommandInput = {
        Bucket: this.bucketName,
        Key: key,
      };

      const command = new HeadObjectCommand(headObjectParams);
      await this.s3Client.send(command);
      return true;
    } catch (error: any) {
      if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
        return false;
      }
      console.error('Error checking file existence:', error);
      throw new Error(`Failed to check file existence: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async listFiles(prefix?: string): Promise<FileMetadata[]> {
    try {
      const listObjectsParams: ListObjectsV2CommandInput = {
        Bucket: this.bucketName,
        ...(prefix && { Prefix: prefix }),
        MaxKeys: 1000,
      };

      const command = new ListObjectsV2Command(listObjectsParams);
      const response = await this.s3Client.send(command);

      if (!response.Contents) {
        return [];
      }

      const files: FileMetadata[] = [];
      for (const object of response.Contents) {
        if (object.Key) {
          // Get object metadata
          const headCommand = new HeadObjectCommand({
            Bucket: this.bucketName,
            Key: object.Key,
          });
          
          try {
            const headResponse = await this.s3Client.send(headCommand);
            const metadata = headResponse.Metadata || {};

            const fileMetadata: FileMetadata = {
              id: uuidv4(),
              originalName: object.Key.split('/').pop() || object.Key,
              fileName: object.Key.split('/').pop() || object.Key,
              mimeType: headResponse.ContentType || this.getMimeTypeFromKey(object.Key),
              size: object.Size || 0,
              category: (metadata['category'] as FileCategory) || FileCategory.OTHER,
              isPublic: false,
              key: object.Key,
              uploadedAt: object.LastModified || new Date(),
              uploadedBy: metadata['uploaded-by'] || 'unknown',
              metadata: metadata,
              ...(metadata['employee-id'] && { employeeId: metadata['employee-id'] }),
            };
            
            files.push(fileMetadata);
          } catch (headError) {
            console.warn(`Failed to get metadata for ${object.Key}:`, headError);
          }
        }
      }

      return files;
    } catch (error) {
      console.error('Error listing files from S3:', error);
      throw new Error(`Failed to list files: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async initiateMultipartUpload(key: string, options: FileUploadOptions): Promise<string> {
    try {
      const metadata: Record<string, string> = {
        'uploaded-at': new Date().toISOString(),
        'category': options.category,
        ...(options.employeeId && { 'employee-id': options.employeeId }),
        ...(options.metadata || {}),
      };

      const createMultipartParams: CreateMultipartUploadCommandInput = {
        Bucket: this.bucketName,
        Key: key,
        Metadata: metadata,
        ServerSideEncryption: 'AES256',
        ...(options.isPublic ? {} : { ACL: 'private' }),
      };

      const command = new CreateMultipartUploadCommand(createMultipartParams);
      const response = await this.s3Client.send(command);

      if (!response.UploadId) {
        throw new Error('Failed to initiate multipart upload');
      }

      return response.UploadId;
    } catch (error) {
      console.error('Error initiating multipart upload:', error);
      throw new Error(`Failed to initiate multipart upload: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async uploadPart(uploadId: string, key: string, partNumber: number, body: Buffer): Promise<string> {
    try {
      const uploadPartParams: UploadPartCommandInput = {
        Bucket: this.bucketName,
        Key: key,
        UploadId: uploadId,
        PartNumber: partNumber,
        Body: body,
      };

      const command = new UploadPartCommand(uploadPartParams);
      const response = await this.s3Client.send(command);

      if (!response.ETag) {
        throw new Error('Failed to upload part');
      }

      return response.ETag;
    } catch (error) {
      console.error('Error uploading part:', error);
      throw new Error(`Failed to upload part: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async completeMultipartUpload(
    uploadId: string,
    key: string,
    parts: Array<{ partNumber: number; etag: string }>
  ): Promise<FileUploadResult> {
    try {
      const completeMultipartParams: CompleteMultipartUploadCommandInput = {
        Bucket: this.bucketName,
        Key: key,
        UploadId: uploadId,
        MultipartUpload: {
          Parts: parts.map(part => ({
            PartNumber: part.partNumber,
            ETag: part.etag,
          })),
        },
      };

      const command = new CompleteMultipartUploadCommand(completeMultipartParams);
      await this.s3Client.send(command);

      // Get file metadata
      const headCommand = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });
      const headResponse = await this.s3Client.send(headCommand);
      const metadata = headResponse.Metadata || {};

      const fileMetadata: FileMetadata = {
        id: uuidv4(),
        originalName: key.split('/').pop() || key,
        fileName: key.split('/').pop() || key,
        mimeType: headResponse.ContentType || this.getMimeTypeFromKey(key),
        size: headResponse.ContentLength || 0,
        category: (metadata['category'] as FileCategory) || FileCategory.OTHER,
        isPublic: false,
        key,
        uploadedAt: new Date(),
        uploadedBy: metadata['uploaded-by'] || 'system',
        metadata: metadata,
        ...(metadata['employee-id'] && { employeeId: metadata['employee-id'] }),
      };

      const url = await this.getSignedUrl(key, 'getObject');

      return {
        id: fileMetadata.id,
        url,
        key,
        metadata: fileMetadata,
      };
    } catch (error) {
      console.error('Error completing multipart upload:', error);
      throw new Error(`Failed to complete multipart upload: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async abortMultipartUpload(uploadId: string, key: string): Promise<void> {
    try {
      const abortMultipartParams: AbortMultipartUploadCommandInput = {
        Bucket: this.bucketName,
        Key: key,
        UploadId: uploadId,
      };

      const command = new AbortMultipartUploadCommand(abortMultipartParams);
      await this.s3Client.send(command);
    } catch (error) {
      console.error('Error aborting multipart upload:', error);
      throw new Error(`Failed to abort multipart upload: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private getMimeTypeFromKey(key: string): string {
    const extension = key.split('.').pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'txt': 'text/plain',
    };
    return mimeTypes[extension || ''] || 'application/octet-stream';
  }
}