import React, { useState, useRef } from 'react';
import { Upload, X, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUIStore } from '@/store/uiStore';

interface FileUploaderProps {
  accept: string[];
  maxSize: number; // in bytes
  multiple?: boolean;
  onUpload: (files: File[]) => Promise<void>;
  onError?: (error: string) => void;
  disabled?: boolean;
}

interface UploadedFile {
  file: File;
  preview?: string;
  progress: number;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  accept,
  maxSize,
  multiple = false,
  onUpload,
  onError,
  disabled = false,
}) => {
  const { addToast } = useUIStore();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validate file
  const validateFile = (file: File): string | null => {
    // Check file type
    const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
    const mimeType = file.type;

    const isValidType =
      accept.includes(mimeType) ||
      accept.some((type) => {
        if (type.endsWith('/*')) {
          return mimeType.startsWith(type.replace('/*', ''));
        }
        return type === fileExtension;
      });

    if (!isValidType) {
      return `File type not allowed. Accepted types: ${accept.join(', ')}`;
    }

    // Check file size
    if (file.size > maxSize) {
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2);
      return `File size exceeds ${maxSizeMB}MB limit`;
    }

    return null;
  };

  // Handle file selection
  const handleFiles = async (files: FileList | null) => {
    if (!files) return;

    const newFiles: UploadedFile[] = [];
    const errors: string[] = [];

    Array.from(files).forEach((file) => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        newFiles.push({
          file,
          progress: 0,
        });

        // Create preview for images
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setUploadedFiles((prev) =>
              prev.map((f) =>
                f.file === file ? { ...f, preview: reader.result as string } : f
              )
            );
          };
          reader.readAsDataURL(file);
        }
      }
    });

    if (errors.length > 0) {
      errors.forEach((error) => {
        addToast({
          type: 'error',
          message: error,
        });
      });
    }

    if (newFiles.length > 0) {
      if (multiple) {
        setUploadedFiles((prev) => [...prev, ...newFiles]);
      } else {
        setUploadedFiles(newFiles);
      }
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  // Handle drag and drop
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  // Remove file
  const handleRemoveFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Upload files
  const handleUploadClick = async () => {
    if (uploadedFiles.length === 0) {
      addToast({
        type: 'warning',
        message: 'Please select files to upload',
      });
      return;
    }

    setIsUploading(true);
    try {
      const filesToUpload = uploadedFiles.map((f) => f.file);
      await onUpload(filesToUpload);

      addToast({
        type: 'success',
        message: `${filesToUpload.length} file(s) uploaded successfully`,
      });

      setUploadedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Upload failed';
      addToast({
        type: 'error',
        message: errorMessage,
      });
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsUploading(false);
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition ${
          isDragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <label className="cursor-pointer">
          <div className="flex flex-col items-center gap-2">
            <Upload size={32} className="text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-700">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                {accept.join(', ')} up to {formatFileSize(maxSize)}
              </p>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept={accept.join(',')}
            onChange={handleInputChange}
            multiple={multiple}
            className="hidden"
            disabled={disabled || isUploading}
          />
        </label>
      </div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">
            Selected Files ({uploadedFiles.length})
          </h4>
          <div className="space-y-2">
            {uploadedFiles.map((uploadedFile, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                {uploadedFile.preview ? (
                  <img
                    src={uploadedFile.preview}
                    alt={uploadedFile.file.name}
                    className="w-10 h-10 object-cover rounded"
                  />
                ) : (
                  <File size={20} className="text-gray-400" />
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {uploadedFile.file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(uploadedFile.file.size)}
                  </p>
                  {uploadedFile.progress > 0 && uploadedFile.progress < 100 && (
                    <div className="mt-1 w-full bg-gray-200 rounded-full h-1">
                      <div
                        className="bg-blue-500 h-1 rounded-full transition-all"
                        style={{ width: `${uploadedFile.progress}%` }}
                      />
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveFile(index)}
                  className="p-1 hover:bg-gray-200 rounded transition"
                  disabled={isUploading}
                >
                  <X size={16} className="text-gray-500" />
                </button>
              </div>
            ))}
          </div>

          {/* Upload Button */}
          <Button
            type="button"
            onClick={handleUploadClick}
            disabled={isUploading || disabled}
            className="w-full"
          >
            {isUploading ? 'Uploading...' : 'Upload Files'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
