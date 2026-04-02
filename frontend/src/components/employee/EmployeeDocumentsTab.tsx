import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import { Button } from '../ui/button';
import { FileText, Download, AlertCircle } from 'lucide-react';
import { documentService } from '@/services/documentService';
import { useToast } from '@/hooks/useToast';

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
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        const data = await documentService.getEmployeeDocuments(employeeId);
        setDocuments(Array.isArray(data) ? data : data.data || []);
      } catch (error) {
        toast({
          type: 'error',
          message: 'Failed to load documents',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [employeeId, toast]);

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
      toast({
        type: 'error',
        message: 'Failed to download document',
      });
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Documents
        </CardTitle>
        <CardDescription>Employee documents and certifications</CardDescription>
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
                {doc.file_url && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(doc.id, doc.name)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
