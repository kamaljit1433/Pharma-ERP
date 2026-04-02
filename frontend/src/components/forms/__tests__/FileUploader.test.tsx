import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FileUploader from '../FileUploader';
import { useUIStore } from '@/store/uiStore';

// Mock the UI store
vi.mock('@/store/uiStore', () => ({
  useUIStore: vi.fn(),
}));

describe('FileUploader', () => {
  const mockOnUpload = vi.fn();
  const mockOnError = vi.fn();
  const mockAddToast = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useUIStore as any).mockReturnValue({
      addToast: mockAddToast,
    });
  });

  describe('File Validation', () => {
    it('should reject files with invalid type', async () => {
      const user = userEvent.setup();
      render(
        <FileUploader
          accept={['image/jpeg', 'image/png']}
          maxSize={5 * 1024 * 1024}
          onUpload={mockOnUpload}
        />
      );

      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      const input = screen.getByRole('button', { name: /click to upload/i }).parentElement?.querySelector('input[type="file"]') as HTMLInputElement;

      await user.upload(input, file);

      await waitFor(() => {
        expect(mockAddToast).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'error',
            message: expect.stringContaining('File type not allowed'),
          })
        );
      });
    });

    it('should reject files exceeding max size', async () => {
      const user = userEvent.setup();
      const maxSize = 1024; // 1KB

      render(
        <FileUploader
          accept={['image/jpeg']}
          maxSize={maxSize}
          onUpload={mockOnUpload}
        />
      );

      const largeContent = new Array(2048).fill('a').join('');
      const file = new File([largeContent], 'large.jpg', { type: 'image/jpeg' });

      const input = screen.getByRole('button', { name: /click to upload/i }).parentElement?.querySelector('input[type="file"]') as HTMLInputElement;
      await user.upload(input, file);

      await waitFor(() => {
        expect(mockAddToast).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'error',
            message: expect.stringContaining('exceeds'),
          })
        );
      });
    });

    it('should accept valid files', async () => {
      const user = userEvent.setup();
      render(
        <FileUploader
          accept={['image/jpeg', 'image/png']}
          maxSize={5 * 1024 * 1024}
          onUpload={mockOnUpload}
        />
      );

      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      const input = screen.getByRole('button', { name: /click to upload/i }).parentElement?.querySelector('input[type="file"]') as HTMLInputElement;

      await user.upload(input, file);

      await waitFor(() => {
        expect(screen.getByText(/selected files/i)).toBeInTheDocument();
      });
    });
  });

  describe('File Display', () => {
    it('should display uploaded files in list', async () => {
      const user = userEvent.setup();
      render(
        <FileUploader
          accept={['image/jpeg']}
          maxSize={5 * 1024 * 1024}
          onUpload={mockOnUpload}
        />
      );

      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      const input = screen.getByRole('button', { name: /click to upload/i }).parentElement?.querySelector('input[type="file"]') as HTMLInputElement;

      await user.upload(input, file);

      await waitFor(() => {
        expect(screen.getByText('test.jpg')).toBeInTheDocument();
      });
    });

    it('should display file size', async () => {
      const user = userEvent.setup();
      render(
        <FileUploader
          accept={['image/jpeg']}
          maxSize={5 * 1024 * 1024}
          onUpload={mockOnUpload}
        />
      );

      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      const input = screen.getByRole('button', { name: /click to upload/i }).parentElement?.querySelector('input[type="file"]') as HTMLInputElement;

      await user.upload(input, file);

      await waitFor(() => {
        expect(screen.getByText(/bytes/i)).toBeInTheDocument();
      });
    });

    it('should remove file when remove button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <FileUploader
          accept={['image/jpeg']}
          maxSize={5 * 1024 * 1024}
          onUpload={mockOnUpload}
        />
      );

      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      const input = screen.getByRole('button', { name: /click to upload/i }).parentElement?.querySelector('input[type="file"]') as HTMLInputElement;

      await user.upload(input, file);

      await waitFor(() => {
        expect(screen.getByText('test.jpg')).toBeInTheDocument();
      });

      const removeButton = screen.getByRole('button', { name: '' }).parentElement?.querySelector('button:last-child');
      if (removeButton) {
        await user.click(removeButton);
      }

      await waitFor(() => {
        expect(screen.queryByText('test.jpg')).not.toBeInTheDocument();
      });
    });
  });

  describe('Drag and Drop', () => {
    it('should accept files via drag and drop', async () => {
      render(
        <FileUploader
          accept={['image/jpeg']}
          maxSize={5 * 1024 * 1024}
          onUpload={mockOnUpload}
        />
      );

      const dropZone = screen.getByRole('button', { name: /click to upload/i }).parentElement?.parentElement;
      if (!dropZone) return;

      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      const dataTransfer = {
        files: [file],
      };

      fireEvent.dragEnter(dropZone, { dataTransfer });
      fireEvent.dragOver(dropZone, { dataTransfer });
      fireEvent.drop(dropZone, { dataTransfer });

      await waitFor(() => {
        expect(screen.getByText('test.jpg')).toBeInTheDocument();
      });
    });

    it('should highlight drop zone on drag enter', () => {
      render(
        <FileUploader
          accept={['image/jpeg']}
          maxSize={5 * 1024 * 1024}
          onUpload={mockOnUpload}
        />
      );

      const dropZone = screen.getByRole('button', { name: /click to upload/i }).parentElement?.parentElement;
      if (!dropZone) return;

      const dataTransfer = { files: [] };
      fireEvent.dragEnter(dropZone, { dataTransfer });

      expect(dropZone).toHaveClass('border-blue-500');
    });
  });

  describe('Upload Functionality', () => {
    it('should call onUpload when upload button is clicked', async () => {
      const user = userEvent.setup();
      mockOnUpload.mockResolvedValue(undefined);

      render(
        <FileUploader
          accept={['image/jpeg']}
          maxSize={5 * 1024 * 1024}
          onUpload={mockOnUpload}
        />
      );

      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      const input = screen.getByRole('button', { name: /click to upload/i }).parentElement?.querySelector('input[type="file"]') as HTMLInputElement;

      await user.upload(input, file);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /upload files/i })).toBeInTheDocument();
      });

      const uploadButton = screen.getByRole('button', { name: /upload files/i });
      await user.click(uploadButton);

      await waitFor(() => {
        expect(mockOnUpload).toHaveBeenCalled();
      });
    });

    it('should show success toast on successful upload', async () => {
      const user = userEvent.setup();
      mockOnUpload.mockResolvedValue(undefined);

      render(
        <FileUploader
          accept={['image/jpeg']}
          maxSize={5 * 1024 * 1024}
          onUpload={mockOnUpload}
        />
      );

      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      const input = screen.getByRole('button', { name: /click to upload/i }).parentElement?.querySelector('input[type="file"]') as HTMLInputElement;

      await user.upload(input, file);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /upload files/i })).toBeInTheDocument();
      });

      const uploadButton = screen.getByRole('button', { name: /upload files/i });
      await user.click(uploadButton);

      await waitFor(() => {
        expect(mockAddToast).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'success',
            message: expect.stringContaining('uploaded successfully'),
          })
        );
      });
    });

    it('should show error toast on upload failure', async () => {
      const user = userEvent.setup();
      const error = new Error('Upload failed');
      mockOnUpload.mockRejectedValue(error);

      render(
        <FileUploader
          accept={['image/jpeg']}
          maxSize={5 * 1024 * 1024}
          onUpload={mockOnUpload}
          onError={mockOnError}
        />
      );

      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      const input = screen.getByRole('button', { name: /click to upload/i }).parentElement?.querySelector('input[type="file"]') as HTMLInputElement;

      await user.upload(input, file);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /upload files/i })).toBeInTheDocument();
      });

      const uploadButton = screen.getByRole('button', { name: /upload files/i });
      await user.click(uploadButton);

      await waitFor(() => {
        expect(mockAddToast).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'error',
          })
        );
      });
    });

    it('should disable upload button during upload', async () => {
      const user = userEvent.setup();
      mockOnUpload.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));

      render(
        <FileUploader
          accept={['image/jpeg']}
          maxSize={5 * 1024 * 1024}
          onUpload={mockOnUpload}
        />
      );

      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      const input = screen.getByRole('button', { name: /click to upload/i }).parentElement?.querySelector('input[type="file"]') as HTMLInputElement;

      await user.upload(input, file);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /upload files/i })).toBeInTheDocument();
      });

      const uploadButton = screen.getByRole('button', { name: /upload files/i });
      await user.click(uploadButton);

      await waitFor(() => {
        expect(uploadButton).toBeDisabled();
      });
    });
  });

  describe('Multiple Files', () => {
    it('should accept multiple files when multiple prop is true', async () => {
      const user = userEvent.setup();
      render(
        <FileUploader
          accept={['image/jpeg']}
          maxSize={5 * 1024 * 1024}
          multiple={true}
          onUpload={mockOnUpload}
        />
      );

      const file1 = new File(['content1'], 'test1.jpg', { type: 'image/jpeg' });
      const file2 = new File(['content2'], 'test2.jpg', { type: 'image/jpeg' });

      const input = screen.getByRole('button', { name: /click to upload/i }).parentElement?.querySelector('input[type="file"]') as HTMLInputElement;

      await user.upload(input, [file1, file2]);

      await waitFor(() => {
        expect(screen.getByText('test1.jpg')).toBeInTheDocument();
        expect(screen.getByText('test2.jpg')).toBeInTheDocument();
      });
    });

    it('should replace file when multiple is false', async () => {
      const user = userEvent.setup();
      render(
        <FileUploader
          accept={['image/jpeg']}
          maxSize={5 * 1024 * 1024}
          multiple={false}
          onUpload={mockOnUpload}
        />
      );

      const file1 = new File(['content1'], 'test1.jpg', { type: 'image/jpeg' });
      const input = screen.getByRole('button', { name: /click to upload/i }).parentElement?.querySelector('input[type="file"]') as HTMLInputElement;

      await user.upload(input, file1);

      await waitFor(() => {
        expect(screen.getByText('test1.jpg')).toBeInTheDocument();
      });

      const file2 = new File(['content2'], 'test2.jpg', { type: 'image/jpeg' });
      await user.upload(input, file2);

      await waitFor(() => {
        expect(screen.queryByText('test1.jpg')).not.toBeInTheDocument();
        expect(screen.getByText('test2.jpg')).toBeInTheDocument();
      });
    });
  });

  describe('Disabled State', () => {
    it('should disable upload when disabled prop is true', () => {
      render(
        <FileUploader
          accept={['image/jpeg']}
          maxSize={5 * 1024 * 1024}
          onUpload={mockOnUpload}
          disabled={true}
        />
      );

      const input = screen.getByRole('button', { name: /click to upload/i }).parentElement?.querySelector('input[type="file"]') as HTMLInputElement;
      expect(input.disabled).toBe(true);
    });
  });
});
