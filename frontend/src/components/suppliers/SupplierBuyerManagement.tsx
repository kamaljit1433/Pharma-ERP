import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import { Plus, Pencil, Trash2, MapPin } from 'lucide-react';
import supplierService, { SupplierBuyer } from '../../services/supplierService';

interface SupplierBuyerManagementProps {
  employeeId?: string;
  onSupplierSelect?: (supplier: SupplierBuyer) => void;
}

export const SupplierBuyerManagement: React.FC<SupplierBuyerManagementProps> = ({
  employeeId,
  onSupplierSelect,
}) => {
  const [suppliers, setSuppliers] = useState<SupplierBuyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<SupplierBuyer | null>(null);
  const [deletingSupplier, setDeletingSupplier] = useState<SupplierBuyer | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'supplier' as 'supplier' | 'buyer',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    notes: '',
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

  const handleOpenDialog = (supplier?: SupplierBuyer) => {
    if (supplier) {
      setEditingSupplier(supplier);
      setFormData({
        name: supplier.name,
        type: supplier.type,
        contactPerson: supplier.contactPerson,
        email: supplier.email,
        phone: supplier.phone,
        address: supplier.address,
        city: supplier.city,
        state: supplier.state,
        zipCode: supplier.zipCode,
        country: supplier.country,
        notes: supplier.notes || '',
      });
    } else {
      setEditingSupplier(null);
      setFormData({
        name: '',
        type: 'supplier',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
        notes: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingSupplier(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId) return;

    try {
      const data = { ...formData, employeeId };
      if (editingSupplier) {
        await supplierService.updateSupplierBuyer(editingSupplier.id, data);
      } else {
        await supplierService.createSupplierBuyer(data);
      }
      await fetchSuppliers();
      handleCloseDialog();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save supplier/buyer');
    }
  };

  const handleDelete = async () => {
    if (!deletingSupplier) return;
    try {
      await supplierService.deleteSupplierBuyer(deletingSupplier.id);
      await fetchSuppliers();
      setIsDeleteDialogOpen(false);
      setDeletingSupplier(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete supplier/buyer');
    }
  };

  if (!employeeId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Supplier/Buyer Management</CardTitle>
          <CardDescription>No employee selected</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Supplier/Buyer Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
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
            <CardTitle>Supplier/Buyer Management</CardTitle>
            <CardDescription>Manage your suppliers and buyers</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Record
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingSupplier ? 'Edit Supplier/Buyer' : 'Add Supplier/Buyer'}
                </DialogTitle>
                <DialogDescription>
                  {editingSupplier
                    ? 'Update supplier/buyer information'
                    : 'Add a new supplier or buyer record'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Name *</label>
                    <Input
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Company name"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Type *</label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          type: value as 'supplier' | 'buyer',
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="supplier">Supplier</SelectItem>
                        <SelectItem value="buyer">Buyer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Contact Person *</label>
                    <Input
                      value={formData.contactPerson}
                      onChange={(e) =>
                        setFormData({ ...formData, contactPerson: e.target.value })
                      }
                      placeholder="Full name"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email *</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="email@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Phone *</label>
                    <Input
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder="+1 (555) 000-0000"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Country *</label>
                    <Input
                      value={formData.country}
                      onChange={(e) =>
                        setFormData({ ...formData, country: e.target.value })
                      }
                      placeholder="Country"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Address *</label>
                  <Input
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    placeholder="Street address"
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">City *</label>
                    <Input
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                      placeholder="City"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">State *</label>
                    <Input
                      value={formData.state}
                      onChange={(e) =>
                        setFormData({ ...formData, state: e.target.value })
                      }
                      placeholder="State"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Zip Code *</label>
                    <Input
                      value={formData.zipCode}
                      onChange={(e) =>
                        setFormData({ ...formData, zipCode: e.target.value })
                      }
                      placeholder="12345"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Notes</label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    placeholder="Additional notes"
                    rows={3}
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={handleCloseDialog}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingSupplier ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
            {error}
          </div>
        )}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Contact Person</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suppliers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No suppliers/buyers found
                  </TableCell>
                </TableRow>
              ) : (
                suppliers.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell className="font-medium">{supplier.name}</TableCell>
                    <TableCell>
                      <Badge variant={supplier.type === 'supplier' ? 'default' : 'secondary'}>
                        {supplier.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{supplier.contactPerson}</TableCell>
                    <TableCell className="text-sm">{supplier.email}</TableCell>
                    <TableCell className="text-sm">{supplier.phone}</TableCell>
                    <TableCell className="text-sm">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {supplier.city}, {supplier.state}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(supplier)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setDeletingSupplier(supplier);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Supplier/Buyer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingSupplier?.name}"? This action cannot be undone.
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

export default SupplierBuyerManagement;
