import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { documentService } from '../../services/documentService';
import { Upload, FileUp, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

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
const MAX_FILE_SIZE = 10 * 1024 * 1024;

interface FileEntry {
  file: File;
  documentName: string;
  category: string;
  expiryDate: string;
  status: 'pending' | 'uploading' | 'done' | 'error';
  error?: string;
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

export const DocumentUpload: React.FC<DocumentUploadProps> = ({ employeeId, onSuccess }) => {
  const [entries, setEntries] = useState<FileEntry[]>([]);
  const [uploading, setUploading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const newEntries: FileEntry[] = [];
    const errors: string[] = [];

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`"${file.name}" exceeds 10 MB limit`);
        continue;
      }
      const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
      if (!ALLOWED_FORMATS.includes(ext)) {
        errors.push(`"${file.name}" has an unsupported format`);
        continue;
      }
      newEntries.push({
        file,
        documentName: file.name.replace(/\.[^/.]+$/, ''),
        category: '',
        expiryDate: '',
        status: 'pending',
      });
    }

    if (errors.length) setGlobalError(errors.join(' | '));
    else setGlobalError(null);

    setEntries((prev) => [...prev, ...newEntries]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const updateEntry = (index: number, patch: Partial<FileEntry>) => {
    setEntries((prev) => prev.map((e, i) => (i === index ? { ...e, ...patch } : e)));
  };

  const removeEntry = (index: number) => {
    setEntries((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entries.length) return;

    const missing = entries.some((en) => !en.category || !en.documentName.trim());
    if (missing) {
      setGlobalError('Please fill in the document name and category for every file.');
      return;
    }
    setGlobalError(null);
    setUploading(true);

    let allOk = true;
    for (let i = 0; i < entries.length; i++) {
      const en = entries[i];
      if (en.status === 'done') continue;

      updateEntry(i, { status: 'uploading', error: undefined });
      try {
        const formData = new FormData();
        formData.append('employee_id', employeeId);
        formData.append('document_type', en.category);
        formData.append('document_name', en.documentName.trim());
        formData.append('file', en.file);
        if (en.expiryDate) formData.append('expiry_date', en.expiryDate);

        await documentService.uploadDocument(formData);
        updateEntry(i, { status: 'done' });
      } catch (err: any) {
        const msg = err.response?.data?.message || 'Upload failed';
        updateEntry(i, { status: 'error', error: msg });
        allOk = false;
      }
    }

    setUploading(false);

    if (allOk) {
      setTimeout(() => {
        setEntries([]);
        onSuccess?.();
      }, 1000);
    }
  };

  const allDone = entries.length > 0 && entries.every((e) => e.status === 'done');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Documents</CardTitle>
        <CardDescription>
          Select one or more files (PDF, JPG, PNG, DOCX — max 10 MB each)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Drop zone */}
          <div
            className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.docx"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
            <p className="font-medium">Click to select files</p>
            <p className="text-sm text-muted-foreground">PDF, JPG, PNG, DOCX — up to 10 MB each</p>
          </div>

          {globalError && (
            <div className="flex items-start gap-2 text-sm text-destructive">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p>{globalError}</p>
            </div>
          )}

          {/* File list */}
          {entries.length > 0 && (
            <div className="space-y-3">
              {entries.map((en, i) => (
                <div key={i} className="border rounded-lg p-3 space-y-2">
                  {/* File header */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {en.status === 'done' ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                      ) : en.status === 'uploading' ? (
                        <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                      ) : en.status === 'error' ? (
                        <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                      ) : (
                        <FileUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      )}
                      <span className="text-sm font-medium truncate">{en.file.name}</span>
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {formatFileSize(en.file.size)}
                      </span>
                    </div>
                    {en.status !== 'uploading' && en.status !== 'done' && (
                      <button
                        type="button"
                        onClick={() => removeEntry(i)}
                        className="text-muted-foreground hover:text-destructive flex-shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {en.status === 'error' && (
                    <p className="text-xs text-destructive">{en.error}</p>
                  )}

                  {en.status !== 'done' && (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Document Name *</Label>
                        <input
                          type="text"
                          value={en.documentName}
                          onChange={(ev) => updateEntry(i, { documentName: ev.target.value })}
                          className="w-full px-2 py-1 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                          disabled={uploading}
                          required
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Category *</Label>
                        <select
                          value={en.category}
                          onChange={(ev) => updateEntry(i, { category: ev.target.value })}
                          className="w-full px-2 py-1 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                          disabled={uploading}
                          required
                        >
                          <option value="">Select…</option>
                          {DOCUMENT_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-2">
                        <Label className="text-xs">Expiry Date (optional)</Label>
                        <input
                          type="date"
                          value={en.expiryDate}
                          onChange={(ev) => updateEntry(i, { expiryDate: ev.target.value })}
                          className="w-full px-2 py-1 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                          disabled={uploading}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {entries.length > 0 && !allDone && (
            <Button type="submit" disabled={uploading} className="w-full">
              {uploading
                ? 'Uploading…'
                : `Upload ${entries.filter((e) => e.status !== 'done').length} Document${entries.filter((e) => e.status !== 'done').length > 1 ? 's' : ''}`}
            </Button>
          )}

          {allDone && (
            <div className="flex items-center justify-center gap-2 text-green-600 font-medium py-2">
              <CheckCircle2 className="w-5 h-5" />
              All documents uploaded successfully
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};
