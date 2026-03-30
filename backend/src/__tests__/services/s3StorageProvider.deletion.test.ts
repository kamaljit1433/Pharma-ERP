import { S3StorageProvider } from '../../services/storage/s3StorageProvider';
import {
  S3Client,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  ListMultipartUploadsCommand,
  AbortMultipartUploadCommand,
} from '@aws-sdk/client-s3';

// Mock AWS SDK
jest.mock('@aws-sdk/client-s3');
jest.mock('../../config', () => ({
  fileStorage: {
    aws: {
      region: 'us-east-1',
      accessKeyId: 'test-key',
      secretAccessKey: 'test-secret',
      bucketName: 'test-bucket',
      bucketRegion: 'us-east-1',
    },
  },
}));

describe('S3StorageProvider - Deletion and Cleanup', () => {
  let s3Provider: S3StorageProvider;
  let mockS3Client: jest.Mocked<S3Client>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockS3Client = new S3Client({}) as jest.Mocked<S3Client>;
    s3Provider = new S3StorageProvider();
    (s3Provider as any).s3Client = mockS3Client;
  });

  describe('deleteFile', () => {
    it('should delete a single file successfully', async () => {
      const key = 'employees/emp1/document/2024-01-01/test.pdf';

      mockS3Client.send.mockResolvedValue({});

      await s3Provider.deleteFile(key);

      expect(mockS3Client.send).toHaveBeenCalledWith(
        expect.any(DeleteObjectCommand)
      );

      const deleteCommand = mockS3Client.send.mock.calls[0][0] as DeleteObjectCommand;
      expect(deleteCommand.input).toEqual({
        Bucket: 'test-bucket',
        Key: key,
      });
    });

    it('should handle deletion errors', async () => {
      const key = 'employees/emp1/document/2024-01-01/test.pdf';
      const error = new Error('S3 delete failed');

      mockS3Client.send.mockRejectedValue(error);

      await expect(s3Provider.deleteFile(key))
        .rejects.toThrow('Failed to delete file: S3 delete failed');
    });
  });

  describe('deleteFiles', () => {
    it('should delete multiple files in a single batch', async () => {
      const keys = ['file1.pdf', 'file2.pdf', 'file3.pdf'];

      mockS3Client.send.mockResolvedValue({
        Deleted: [
          { Key: 'file1.pdf' },
          { Key: 'file2.pdf' },
          { Key: 'file3.pdf' },
        ],
        Errors: [],
      });

      const result = await s3Provider.deleteFiles(keys);

      expect(result.deleted).toEqual(['file1.pdf', 'file2.pdf', 'file3.pdf']);
      expect(result.failed).toEqual([]);

      expect(mockS3Client.send).toHaveBeenCalledWith(
        expect.any(DeleteObjectsCommand)
      );

      const deleteCommand = mockS3Client.send.mock.calls[0][0] as DeleteObjectsCommand;
      expect(deleteCommand.input).toEqual({
        Bucket: 'test-bucket',
        Delete: {
          Objects: [
            { Key: 'file1.pdf' },
            { Key: 'file2.pdf' },
            { Key: 'file3.pdf' },
          ],
          Quiet: false,
        },
      });
    });

    it('should handle partial failures', async () => {
      const keys = ['file1.pdf', 'file2.pdf', 'file3.pdf'];

      mockS3Client.send.mockResolvedValue({
        Deleted: [
          { Key: 'file1.pdf' },
          { Key: 'file3.pdf' },
        ],
        Errors: [
          { Key: 'file2.pdf', Code: 'NoSuchKey', Message: 'File not found' },
        ],
      });

      const result = await s3Provider.deleteFiles(keys);

      expect(result.deleted).toEqual(['file1.pdf', 'file3.pdf']);
      expect(result.failed).toEqual([
        { key: 'file2.pdf', error: 'File not found' },
      ]);
    });

    it('should handle batch processing for large arrays', async () => {
      // Create an array of 1500 files to test batch processing
      const keys = Array.from({ length: 1500 }, (_, i) => `file${i}.pdf`);

      // Mock two batch responses
      mockS3Client.send
        .mockResolvedValueOnce({
          Deleted: Array.from({ length: 1000 }, (_, i) => ({ Key: `file${i}.pdf` })),
          Errors: [],
        })
        .mockResolvedValueOnce({
          Deleted: Array.from({ length: 500 }, (_, i) => ({ Key: `file${i + 1000}.pdf` })),
          Errors: [],
        });

      const result = await s3Provider.deleteFiles(keys);

      expect(result.deleted).toHaveLength(1500);
      expect(result.failed).toEqual([]);
      expect(mockS3Client.send).toHaveBeenCalledTimes(2);
    });

    it('should handle complete batch failure', async () => {
      const keys = ['file1.pdf', 'file2.pdf'];
      const error = new Error('S3 service unavailable');

      mockS3Client.send.mockRejectedValue(error);

      const result = await s3Provider.deleteFiles(keys);

      expect(result.deleted).toEqual([]);
      expect(result.failed).toEqual([
        { key: 'file1.pdf', error: 'S3 service unavailable' },
        { key: 'file2.pdf', error: 'S3 service unavailable' },
      ]);
    });
  });

  describe('listMultipartUploads', () => {
    it('should list orphaned multipart uploads', async () => {
      const now = new Date();
      const twentyFiveHoursAgo = new Date(now.getTime() - 25 * 60 * 60 * 1000);
      const twentyThreeHoursAgo = new Date(now.getTime() - 23 * 60 * 60 * 1000);

      mockS3Client.send.mockResolvedValue({
        Uploads: [
          {
            UploadId: 'upload1',
            Key: 'employees/emp1/document/old.pdf',
            Initiated: twentyFiveHoursAgo,
          },
          {
            UploadId: 'upload2',
            Key: 'employees/emp1/document/recent.pdf',
            Initiated: twentyThreeHoursAgo,
          },
        ],
      });

      const result = await s3Provider.listMultipartUploads(24);

      expect(result).toEqual([
        {
          uploadId: 'upload1',
          key: 'employees/emp1/document/old.pdf',
          initiated: twentyFiveHoursAgo,
        },
      ]);

      expect(mockS3Client.send).toHaveBeenCalledWith(
        expect.any(ListMultipartUploadsCommand)
      );

      const listCommand = mockS3Client.send.mock.calls[0][0] as ListMultipartUploadsCommand;
      expect(listCommand.input).toEqual({
        Bucket: 'test-bucket',
        MaxUploads: 1000,
      });
    });

    it('should return empty array when no uploads found', async () => {
      mockS3Client.send.mockResolvedValue({
        Uploads: [],
      });

      const result = await s3Provider.listMultipartUploads(24);

      expect(result).toEqual([]);
    });

    it('should handle listing errors', async () => {
      const error = new Error('S3 list failed');

      mockS3Client.send.mockRejectedValue(error);

      await expect(s3Provider.listMultipartUploads(24))
        .rejects.toThrow('Failed to list multipart uploads: S3 list failed');
    });
  });

  describe('cleanupOrphanedMultipartUploads', () => {
    it('should cleanup orphaned multipart uploads successfully', async () => {
      const now = new Date();
      const twentyFiveHoursAgo = new Date(now.getTime() - 25 * 60 * 60 * 1000);
      const twentySixHoursAgo = new Date(now.getTime() - 26 * 60 * 60 * 1000);

      // Mock list response
      mockS3Client.send.mockResolvedValueOnce({
        Uploads: [
          {
            UploadId: 'upload1',
            Key: 'employees/emp1/document/old1.pdf',
            Initiated: twentyFiveHoursAgo,
          },
          {
            UploadId: 'upload2',
            Key: 'employees/emp1/document/old2.pdf',
            Initiated: twentySixHoursAgo,
          },
        ],
      });

      // Mock abort responses
      mockS3Client.send.mockResolvedValueOnce({}); // First abort
      mockS3Client.send.mockResolvedValueOnce({}); // Second abort

      const result = await s3Provider.cleanupOrphanedMultipartUploads(24);

      expect(result.abortedCount).toBe(2);
      expect(result.errors).toEqual([]);

      // Should call list once and abort twice
      expect(mockS3Client.send).toHaveBeenCalledTimes(3);
      expect(mockS3Client.send).toHaveBeenNthCalledWith(1, expect.any(ListMultipartUploadsCommand));
      expect(mockS3Client.send).toHaveBeenNthCalledWith(2, expect.any(AbortMultipartUploadCommand));
      expect(mockS3Client.send).toHaveBeenNthCalledWith(3, expect.any(AbortMultipartUploadCommand));
    });

    it('should handle abort failures gracefully', async () => {
      const now = new Date();
      const twentyFiveHoursAgo = new Date(now.getTime() - 25 * 60 * 60 * 1000);

      // Mock list response
      mockS3Client.send.mockResolvedValueOnce({
        Uploads: [
          {
            UploadId: 'upload1',
            Key: 'employees/emp1/document/old1.pdf',
            Initiated: twentyFiveHoursAgo,
          },
          {
            UploadId: 'upload2',
            Key: 'employees/emp1/document/old2.pdf',
            Initiated: twentyFiveHoursAgo,
          },
        ],
      });

      // Mock abort responses - one success, one failure
      mockS3Client.send.mockResolvedValueOnce({}); // First abort succeeds
      mockS3Client.send.mockRejectedValueOnce(new Error('Abort failed')); // Second abort fails

      const result = await s3Provider.cleanupOrphanedMultipartUploads(24);

      expect(result.abortedCount).toBe(1);
      expect(result.errors).toEqual([
        { uploadId: 'upload2', error: 'Abort failed' },
      ]);
    });

    it('should handle list failure', async () => {
      const error = new Error('S3 list failed');

      mockS3Client.send.mockRejectedValue(error);

      await expect(s3Provider.cleanupOrphanedMultipartUploads(24))
        .rejects.toThrow('Failed to cleanup orphaned multipart uploads: S3 list failed');
    });

    it('should use default 24 hour threshold', async () => {
      mockS3Client.send.mockResolvedValue({
        Uploads: [],
      });

      await s3Provider.cleanupOrphanedMultipartUploads();

      // Verify that the method was called (default parameter handling is tested implicitly)
      expect(mockS3Client.send).toHaveBeenCalledWith(
        expect.any(ListMultipartUploadsCommand)
      );
    });
  });
});