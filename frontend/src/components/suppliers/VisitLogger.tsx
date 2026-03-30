import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import { Skeleton } from '../ui/skeleton';
import { MapPin, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import supplierService, { SupplierBuyer } from '../../services/supplierService';

interface VisitLoggerProps {
  employeeId?: string;
  onVisitLogged?: () => void;
}

interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export const VisitLogger: React.FC<VisitLoggerProps> = ({ employeeId, onVisitLogged }) => {
  const [suppliers, setSuppliers] = useState<SupplierBuyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLogging, setIsLogging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [geoLocation, setGeoLocation] = useState<GeoLocation | null>(null);
  const [formData, setFormData] = useState({
    supplierBuyerId: '',
    notes: '',
    duration: '',
  });

  useEffect(() => {
    if (employeeId) {
      fetchSuppliers();
    }
  }, [employeeId]);

  const fetchSuppliers = async () => {
    if (!employeeId) return;
    try {
      setLoading(true);
      const data = await supplierService.getSuppliersBuyers(employeeId);
      setSuppliers(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load suppliers/buyers');
    } finally {
      setLoading(false);
    }
  };

  const captureLocation = async () => {
    try {
      setError(null);
      if (!navigator.geolocation) {
        setError('Geolocation is not supported by your browser');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGeoLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
          setSuccess(true);
          setTimeout(() => setSuccess(false), 3000);
        },
        (err) => {
          setError(`Failed to get location: ${err.message}`);
        }
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to capture location');
    }
  };

  const handleOpenDialog = () => {
    setFormData({ supplierBuyerId: '', notes: '', duration: '' });
    setGeoLocation(null);
    setError(null);
    setSuccess(false);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setFormData({ supplierBuyerId: '', notes: '', duration: '' });
    setGeoLocation(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId || !geoLocation || !formData.supplierBuyerId) {
      setError('Please fill all required fields and capture location');
      return;
    }

    try {
      setIsLogging(true);
      await supplierService.logVisit({
        supplierBuyerId: formData.supplierBuyerId,
        employeeId,
        visitDate: new Date(),
        latitude: geoLocation.latitude,
        longitude: geoLocation.longitude,
        accuracy: geoLocation.accuracy,
        notes: formData.notes,
        duration: formData.duration ? parseInt(formData.duration) : undefined,
      });

      setSuccess(true);
      setTimeout(() => {
        handleCloseDialog();
        onVisitLogged?.();
        setSuccess(false);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log visit');
    } finally {
      setIsLogging(false);
    }
  };

  if (!employeeId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Visit Logger</CardTitle>
          <CardDescription>No employee selected</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Visit Logger</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Visit Logger</CardTitle>
            <CardDescription>Log visits to suppliers and buyers with GPS coordinates</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleOpenDialog} size="sm">
                <MapPin className="w-4 h-4 mr-2" />
                Log Visit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Log Visit</DialogTitle>
                <DialogDescription>
                  Record a visit to a supplier or buyer with GPS coordinates
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="border-success bg-success/10">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <AlertDescription className="text-success">
                      Visit logged successfully!
                    </AlertDescription>
                  </Alert>
                )}

                <div>
                  <label className="text-sm font-medium">Supplier/Buyer *</label>
                  <Select
                    value={formData.supplierBuyerId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, supplierBuyerId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select supplier/buyer" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name} ({supplier.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Duration (minutes)</label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({ ...formData, duration: e.target.value })
                    }
                    placeholder="e.g., 30"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Notes</label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    placeholder="Visit details, discussions, outcomes..."
                    rows={3}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">GPS Location *</label>
                  <div className="space-y-2">
                    {geoLocation ? (
                      <div className="p-3 bg-success/10 rounded-md border border-success/20">
                        <div className="flex items-center gap-2 text-sm text-success">
                          <CheckCircle2 className="w-4 h-4" />
                          Location captured
                        </div>
                        <div className="text-xs text-muted-foreground mt-2 font-mono">
                          <div>Lat: {geoLocation.latitude.toFixed(6)}</div>
                          <div>Lon: {geoLocation.longitude.toFixed(6)}</div>
                          <div>Accuracy: ±{geoLocation.accuracy.toFixed(0)}m</div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-muted rounded-md border border-border">
                        <div className="text-sm text-muted-foreground">
                          No location captured yet
                        </div>
                      </div>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={captureLocation}
                      className="w-full"
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      Capture Current Location
                    </Button>
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseDialog}
                    disabled={isLogging}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLogging || !geoLocation}>
                    {isLogging ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Logging...
                      </>
                    ) : (
                      'Log Visit'
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {suppliers.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No suppliers/buyers found. Add some first to log visits.
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            Ready to log visits. Click "Log Visit" to get started.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VisitLogger;
