import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Skeleton } from '../ui/skeleton';
import { MapPin, Calendar, Clock, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import supplierService, { Visit, SupplierBuyer } from '../../services/supplierService';

interface VisitHistoryProps {
  supplierBuyerId?: string;
  employeeId?: string;
  onVisitDeleted?: () => void;
}

export const VisitHistory: React.FC<VisitHistoryProps> = ({
  supplierBuyerId,
  employeeId,
  onVisitDeleted,
}) => {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [supplier, setSupplier] = useState<SupplierBuyer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingVisit, setDeletingVisit] = useState<Visit | null>(null);

  useEffect(() => {
    if (supplierBuyerId) {
      fetchVisitHistory();
    } else if (employeeId) {
      fetchEmployeeVisits();
    }
  }, [supplierBuyerId, employeeId]);

  const fetchVisitHistory = async () => {
    if (!supplierBuyerId) return;
    try {
      setLoading(true);
      const [visitData, supplierData] = await Promise.all([
        supplierService.getVisitHistory(supplierBuyerId),
        supplierService.getSupplierBuyer(supplierBuyerId),
      ]);
      setVisits(visitData);
      setSupplier(supplierData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load visit history');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeeVisits = async () => {
    if (!employeeId) return;
    try {
      setLoading(true);
      const visitData = await supplierService.getEmployeeVisits(employeeId);
      setVisits(visitData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load visits');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingVisit) return;
    try {
      await supplierService.deleteVisit(deletingVisit.id);
      if (supplierBuyerId) {
        await fetchVisitHistory();
      } else if (employeeId) {
        await fetchEmployeeVisits();
      }
      setIsDeleteDialogOpen(false);
      setDeletingVisit(null);
      onVisitDeleted?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete visit');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Visit History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    );
  }

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getMapLink = (lat: number, lon: number) => {
    return `https://maps.google.com/?q=${lat},${lon}`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Visit History</CardTitle>
            {supplier && (
              <CardDescription>
                Visits to {supplier.name} ({supplier.type})
              </CardDescription>
            )}
            {!supplier && employeeId && (
              <CardDescription>All visits logged</CardDescription>
            )}
          </div>
          {visits.length > 0 && (
            <Badge variant="secondary">{visits.length} visits</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
            {error}
          </div>
        )}

        {visits.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No visits recorded yet
          </div>
        ) : (
          <div className="space-y-4">
            {visits.map((visit) => (
              <div
                key={visit.id}
                className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        {formatDate(visit.visitDate)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Clock className="w-4 h-4" />
                        {formatTime(visit.visitDate)}
                      </div>
                    </div>
                    {visit.duration && (
                      <div className="text-sm">
                        <div className="font-medium">{visit.duration} min</div>
                        <div className="text-xs text-muted-foreground">duration</div>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setDeletingVisit(visit);
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>

                {visit.notes && (
                  <div className="mb-3 p-2 bg-muted rounded text-sm">
                    <div className="font-medium text-xs text-muted-foreground mb-1">Notes</div>
                    <div className="text-foreground">{visit.notes}</div>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <a
                    href={getMapLink(visit.latitude, visit.longitude)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-mono text-xs"
                  >
                    {visit.latitude.toFixed(4)}, {visit.longitude.toFixed(4)}
                  </a>
                  <span className="text-xs text-muted-foreground">
                    (±{visit.accuracy.toFixed(0)}m)
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Visit</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this visit record? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive">
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default VisitHistory;
