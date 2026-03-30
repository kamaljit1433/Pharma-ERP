import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { documentService } from '../../services/documentService';
import { CheckCircle2, AlertCircle, Upload, FileUp, X } from 'lucide-react';

interface DocumentUploadProps {
  employeeId: string;
  onSuccess?: () => void;
}

const DOCUMENT_CATEGORIES = [
  'Identity Proof',
  'Aadhar',
  'PAN',
  'Passport',
  'Driving License',
  'Educational Certificate',
  'Experience Letter',
  'Offer Letter',
  'Appointment Letter',
  'Bank Proof',
  'Insurance Document',
  'Certification',
  'Visa/Work Permit',
  'Other',
];

const ALLOWED_FORMATS = ['pdf', 'jpg', 'jpeg', 'png', 'docx'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export const DocumentUpload: React.FC<DocumentUploadProps> = ({ employeeId, onSuccess }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [category, setCategory] = useState('');
  const [documentName, setDocumentName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setMessage({ type: 'error', text: 'File size must be less than 10 MB' });
      return;
    }

    // Validate file format
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !ALLOWED_FORMATS.includes(fileExtension)) {
      setMessage({
        type: 'error',
        text: `Invalid file format. Allowed formats: ${ALLOWED_FORMATS.join(', ')}`,
      });
      return;
    }

    setSelectedFile(file);
    setMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile || !category || !documentName) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' });
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('employee_id', employeeId);
      formData.append('category', category);
      formData.append('document_name', documentName);
      formData.append('file', selectedFile);
      if (expiryDate) {
        formData.append('expiry_date', expiryDate);
      }

      await documentService.uploadDocument(formData);

      setMessage({ type: 'success', text: 'Document uploaded successfully. Awaiting HR verification.' });
      setSelectedFile(null);
      setCategory('');
      setDocumentName('');
      setExpiryDate('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      if (onSuccess) {
        setTimeout(onSuccess, 1500);
      }
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to upload document',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Upload Document</h2>

      {message && (
        <Card className={message.type === 'success' ? 'border-success' : 'border-destructive'}>
          <CardContent className="pt-6 flex gap-2">
            {message.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
            )}
            <p>{message.text}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Upload New Document</CardTitle>
          <CardDescription>
            Upload documents like ID proof, certificates, or other important files
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* File Upload Area */}
            <div>
              <Label htmlFor="file-input">Select File *</Label>
              <div
                className="mt-2 border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  id="file-input"
                  onChange={handleFileSelect}
                  accept=".pdf,.jpg,.jpeg,.png,.docx"
                  className="hidden"
                  required
                />

                {selectedFile ? (
                  <div className="space-y-2">
                    <FileUp className="w-8 h-8 mx-auto text-success" />
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                    <p className="font-medium">Click to upload or drag and drop</p>
                    <p className="text-sm text-muted-foreground">
                      PDF, JPG, PNG, DOCX (Max 10 MB)
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Document Name */}
            <div>
              <Label htmlFor="document_name">Document Name *</Label>
              <input
                id="document_name"
                type="text"
                placeholder="e.g., Aadhar Card, Passport"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            {/* Category */}
            <div>
              <Label htmlFor="category">Document Category *</Label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="">Select a category</option>
                {DOCUMENT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Expiry Date */}
            <div>
              <Label htmlFor="expiry_date">Expiry Date (Optional)</Label>
              <input
                id="expiry_date"
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Leave blank if the document doesn't expire
              </p>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Uploading...' : 'Upload Document'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-base">Upload Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2 text-muted-foreground">
          <p>• Supported formats: PDF, JPG, PNG, DOCX</p>
          <p>• Maximum file size: 10 MB</p>
          <p>• Documents will be reviewed by HR team</p>
          <p>• You'll receive a notification when status changes</p>
          <p>• Keep documents updated before expiry date</p>
        </CardContent>
      </Card>
    </div>
  );
};
