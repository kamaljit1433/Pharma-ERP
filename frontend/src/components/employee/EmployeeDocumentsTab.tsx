import React, { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import { Button } from '../ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { FileText, Download, Trash2, Upload, Loader2 } from 'lucide-react';
import { documentService } from '@/services/documentService';
import { useToast } from '@/hooks/useToast';
import { useAuthStore } from '@/store/authStore';
import { UserRole } from '@/types/auth';
import { DocumentUpload } from '@/components/documents/DocumentUpload';

interface EmployeeDocumentsTabProps {
  employeeId: string;
}

interface Document {
  id: string;
  name: string;
  type: string;
  file_url?: string;
  expiry_date?: string;
  status?: string;
  uploaded_at?: string;
}

export const EmployeeDocumentsTab: React.FC<EmployeeDocumentsTabProps> = ({ employeeId }) => {
  const { toast } = useToast();
  const { user } = useAuthStore();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const canManage =
    user?.role === UserRole.HR_MANAGER || user?.role === UserRole.SUPER_ADMIN;

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await documentService.getEmployeeDocuments(employeeId);
      setDocuments(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      toast({ type: 'error', message: 'Failed to load documents' });
    } finally {
      setLoading(false);
    }
  }, [employeeId, toast]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const MIME_TO_EXT: Record<string, string> = {
    'application/pdf': '.pdf',
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  };

  const handleDownload = async (docId: string, fileName: string, fileUrl?: string) => {
    setDownloadingId(docId);
    try {
      const blob = await documentService.downloadDocument(docId);
      const hasExt = /\.[a-z0-9]{2,5}$/i.test(fileName);
      const ext = hasExt ? '' : (MIME_TO_EXT[blob.type] ?? '');
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName + ext;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      if (fileUrl) {
        window.open(fileUrl, '_blank');
      } else {
        toast({ type: 'error', message: 'Download failed' });
      }
    } finally {
      setDownloadingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const { id, name } = deleteTarget;
    setDeleteTarget(null);
    setDeletingId(id);
    try {
      await documentService.deleteDocument(id);
      toast({ type: 'success', message: `"${name}" deleted` });
      fetchDocuments();
    } catch {
      toast({ type: 'error', message: 'Failed to delete document' });
    } finally {
      setDeletingId(null);
    }
  };

  const isExpiringSoon = (expiryDate?: string) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.floor(
      (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  const isExpired = (expiryDate?: string) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documents
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete document?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{deleteTarget?.name}&rdquo; will be permanently removed. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={confirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {showUpload && (
        <DocumentUpload
          employeeId={employeeId}
          onSuccess={() => {
            setShowUpload(false);
            fetchDocuments();
          }}
        />
      )}

      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documents
            </CardTitle>
            <CardDescription>Employee documents and certifications</CardDescription>
          </div>
          {canManage && (
            <Button
              variant={showUpload ? 'outline' : 'default'}
              size="sm"
              onClick={() => setShowUpload((v) => !v)}
            >
              <Upload className="h-4 w-4 mr-1" />
              {showUpload ? 'Cancel' : 'Upload Document'}
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No documents found</p>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium">{doc.name}</p>
                      {isExpired(doc.expiry_date) && (
                        <Badge variant="destructive" className="text-xs">
                          Expired
                        </Badge>
                      )}
                      {isExpiringSoon(doc.expiry_date) && (
                        <Badge variant="outline" className="text-xs">
                          Expiring Soon
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
                      {doc.type && <span>Type: {doc.type}</span>}
                      {doc.expiry_date && (
                        <span>
                          Expires: {new Date(doc.expiry_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(doc.id, doc.name, doc.file_url)}
                      disabled={downloadingId === doc.id}
                      title="Download"
                    >
                      {downloadingId === doc.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                    </Button>
                    {canManage && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteTarget({ id: doc.id, name: doc.name })}
                        disabled={deletingId === doc.id}
                        className="text-destructive hover:text-destructive"
                        title="Delete"
                      >
                        {deletingId === doc.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
