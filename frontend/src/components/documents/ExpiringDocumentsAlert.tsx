import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { documentService } from '../../services/documentService';
import { AlertTriangle, Clock, FileText, RefreshCw } from 'lucide-react';

interface ExpiringDocument {
  id: string;
  employee_id: string;
  employee_name: string;
  document_name: string;
  category: string;
  expiry_date: string;
  days_until_expiry: number;
  status: string;
}

interface ExpiringDocumentsAlertProps {
  employeeId?: string;
  isAdmin?: boolean;
}

export const ExpiringDocumentsAlert: React.FC<ExpiringDocumentsAlertProps> = ({
  employeeId,
  isAdmin = false,
}) => {
  const [expiringDocuments, setExpiringDocuments] = useState<ExpiringDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [daysThreshold, setDaysThreshold] = useState(30);

  useEffect(() => {
    fetchExpiringDocuments();
  }, [employeeId, daysThreshold]);

  const fetchExpiringDocuments = async () => {
    try {
      setLoading(true);
      let data;
      if (isAdmin) {
        data = await documentService.getExpiringDocuments(daysThreshold);
      } else if (employeeId) {
        data = await documentService.getEmployeeExpiringDocuments(employeeId, daysThreshold);
      } else {
        data = [];
      }
      setExpiringDocuments(data);
    } catch (error) {
      console.error('Failed to fetch expiring documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getUrgencyBadge = (daysUntilExpiry: number) => {
    if (daysUntilExpiry <= 7) {
      return <Badge className="bg-destructive text-destructive-foreground">Urgent</Badge>;
    } else if (daysUntilExpiry <= 14) {
      return <Badge className="bg-warning text-warning-foreground">Soon</Badge>;
    } else {
      return <Badge className="bg-pending text-pending-foreground">Upcoming</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">
          Loading expiring documents...
        </CardContent>
      </Card>
    );
  }

  if (expiringDocuments.length === 0) {
    return (
      <Card className="bg-success/10 border-success/30">
        <CardContent className="pt-6 flex gap-3">
          <div className="flex-shrink-0">
            <div className="flex items-center justify-center h-8 w-8 rounded-md bg-success/20">
              <FileText className="h-5 w-5 text-success" />
            </div>
          </div>
          <div>
            <p className="font-medium text-success">All documents are up to date</p>
            <p className="text-sm text-success/80">No documents expiring within {daysThreshold} days</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="bg-warning/10 border-warning/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              <CardTitle className="text-warning">Documents Expiring Soon</CardTitle>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={fetchExpiringDocuments}
              disabled={loading}
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Refresh
            </Button>
          </div>
          <CardDescription>
            {expiringDocuments.length} document{expiringDocuments.length !== 1 ? 's' : ''} expiring
            within {daysThreshold} days
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="space-y-3">
        {expiringDocuments.map((doc) => (
          <Card key={doc.id} className="border-border">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <h4 className="font-semibold">{doc.document_name}</h4>
                    {getUrgencyBadge(doc.days_until_expiry)}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm mt-2">
                    <div>
                      <p className="text-muted-foreground">Category</p>
                      <p className="font-medium">{doc.category}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Expiry Date</p>
                      <p className="font-medium">{formatDate(doc.expiry_date)}</p>
                    </div>
                    {isAdmin && (
                      <div>
                        <p className="text-muted-foreground">Employee</p>
                        <p className="font-medium">{doc.employee_name}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-muted-foreground">Days Remaining</p>
                      <p className="font-medium flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {doc.days_until_expiry} day{doc.days_until_expiry !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="ml-4">
                  <Button size="sm" variant="outline">
                    Renew
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Threshold Selector */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">Show documents expiring within:</label>
            <select
              value={daysThreshold}
              onChange={(e) => setDaysThreshold(parseInt(e.target.value))}
              className="px-3 py-1 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value={7}>7 days</option>
              <option value={14}>14 days</option>
              <option value={30}>30 days</option>
              <option value={60}>60 days</option>
              <option value={90}>90 days</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-base">Expiry Management Tips</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2 text-muted-foreground">
          <p>• Upload renewed documents before expiry date</p>
          <p>• HR will be notified of expiring documents</p>
          <p>• Expired documents may affect payroll processing</p>
          <p>• Keep backup copies of important documents</p>
          <p>• Set reminders for document renewal dates</p>
        </CardContent>
      </Card>
    </div>
  );
};
