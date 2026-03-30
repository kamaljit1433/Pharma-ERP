import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { documentService } from '../../services/documentService';
import { AlertCircle, Download, Eye, Trash2, FileText, Clock } from 'lucide-react';

interface Document {
  id: string;
  employee_id: string;
  category: string;
  document_name: string;
  file_url: string;
  upload_date: string;
  expiry_date?: string;
  status: 'pending_review' | 'verified' | 'rejected';
  rejection_comment?: string;
  version: number;
  created_at: string;
}

interface DocumentViewerProps {
  employeeId: string;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({ employeeId }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, [employeeId]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const data = await documentService.getEmployeeDocuments(employeeId);
      setDocuments(data);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (documentId: string, fileName: string) => {
    try {
      const blob = await documentService.downloadDocument(documentId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download document:', error);
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      await documentService.deleteDocument(documentId);
      setDocuments(documents.filter((doc) => doc.id !== documentId));
      setSelectedDocument(null);
    } catch (error) {
      console.error('Failed to delete document:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-approved text-approved-foreground">Verified</Badge>;
      case 'rejected':
        return <Badge className="bg-destructive text-destructive-foreground">Rejected</Badge>;
      case 'pending_review':
        return <Badge className="bg-pending text-pending-foreground">Pending Review</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const isExpiringSoon = (expiryDate?: string) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  const isExpired = (expiryDate?: string) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const today = new Date();
    return expiry < today;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">
          Loading documents...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">My Documents</h2>
        <p className="text-muted-foreground mt-1">View and manage your uploaded documents</p>
      </div>

      {documents.length > 0 ? (
        <div className="space-y-4">
          {documents.map((doc) => (
            <Card key={doc.id} className="border-border">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-5 h-5 text-muted-foreground" />
                      <h3 className="font-semibold text-lg">{doc.document_name}</h3>
                      {getStatusBadge(doc.status)}
                      {isExpired(doc.expiry_date) && (
                        <Badge className="bg-destructive text-destructive-foreground">Expired</Badge>
                      )}
                      {isExpiringSoon(doc.expiry_date) && !isExpired(doc.expiry_date) && (
                        <Badge className="bg-warning text-warning-foreground">Expiring Soon</Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm mt-3">
                      <div>
                        <p className="text-muted-foreground">Category</p>
                        <p className="font-medium">{doc.category}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Upload Date</p>
                        <p className="font-medium">{formatDate(doc.upload_date)}</p>
                      </div>
                      {doc.expiry_date && (
                        <div>
                          <p className="text-muted-foreground">Expiry Date</p>
                          <p className="font-medium">{formatDate(doc.expiry_date)}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-muted-foreground">Version</p>
                        <p className="font-medium">v{doc.version}</p>
                      </div>
                    </div>

                    {doc.status === 'rejected' && doc.rejection_comment && (
                      <div className="mt-3 bg-destructive/10 border border-destructive/30 rounded-md p-3">
                        <p className="text-sm font-medium text-destructive mb-1">Rejection Reason:</p>
                        <p className="text-sm text-destructive/80">{doc.rejection_comment}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedDocument(doc);
                        setShowPreview(true);
                      }}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Preview
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownload(doc.id, doc.document_name)}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(doc.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-muted/50">
          <CardContent className="pt-6 text-center text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
            <p className="font-medium">No documents uploaded yet</p>
            <p className="text-sm">Upload your documents to get started</p>
          </CardContent>
        </Card>
      )}

      {/* Document Preview Modal */}
      {showPreview && selectedDocument && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-auto">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>{selectedDocument.document_name}</CardTitle>
                <CardDescription>{selectedDocument.category}</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPreview(false)}
              >
                ✕
              </Button>
            </CardHeader>
            <CardContent>
              <div className="bg-muted rounded-lg p-8 text-center min-h-[400px] flex items-center justify-center">
                <div className="space-y-4">
                  <FileText className="w-16 h-16 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Document preview not available in this view
                  </p>
                  <Button
                    onClick={() => handleDownload(selectedDocument.id, selectedDocument.document_name)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download to View
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Info Card */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-base">Document Management</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2 text-muted-foreground">
          <p>• Keep your documents updated and verified</p>
          <p>• Expired documents will be flagged for renewal</p>
          <p>• You can maintain multiple versions of documents</p>
          <p>• HR team will review and verify your documents</p>
          <p>• Download documents anytime for your records</p>
        </CardContent>
      </Card>
    </div>
  );
};
