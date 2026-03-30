import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { useGeoTrackingStore } from '../../store/geoTrackingStore';
import { MapPin, Plus, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';

const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
};

const typeColors: Record<string, { bg: string; text: string }> = {
  Office: { bg: 'bg-blue-100', text: 'text-blue-800' },
  Site: { bg: 'bg-green-100', text: 'text-green-800' },
  Restricted: { bg: 'bg-red-100', text: 'text-red-800' },
  Custom: { bg: 'bg-purple-100', text: 'text-purple-800' },
};

export const GeoFenceManagement: React.FC = () => {
  const [showDialog, setShowDialog] = useState(false);
  const [editingFence, setEditingFence] = useState<any>(null);
  const [filterType, setFilterType] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    latitude: '',
    longitude: '',
    radius: '',
    type: 'Office' as const,
  });

  const {
    geoFences,
    loadingGeoFences,
    fetchGeoFences,
    createGeoFence,
    updateGeoFence,
    deleteGeoFence,
    toggleGeoFence,
  } = useGeoTrackingStore();

  useEffect(() => {
    fetchGeoFences(filterType || undefined);
  }, [filterType, fetchGeoFences]);

  const handleOpenDialog = (fence?: any) => {
    if (fence) {
      setEditingFence(fence);
      setFormData({
        name: fence.name,
        latitude: fence.center.latitude.toString(),
        longitude: fence.center.longitude.toString(),
        radius: fence.radius.toString(),
        type: fence.type,
      });
    } else {
      setEditingFence(null);
      setFormData({
        name: '',
        latitude: '',
        longitude: '',
        radius: '',
        type: 'Office',
      });
    }
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingFence(null);
    setFormData({
      name: '',
      latitude: '',
      longitude: '',
      radius: '',
      type: 'Office',
    });
  };

  const handleSubmit = async () => {
    try {
      const data = {
        name: formData.name,
        center: {
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
        },
        radius: parseFloat(formData.radius),
        type: formData.type,
      };

      if (editingFence) {
        await updateGeoFence(editingFence.id, data);
      } else {
        await createGeoFence(data);
      }

      handleCloseDialog();
      await fetchGeoFences(filterType || undefined);
    } catch (error) {
      console.error('Failed to save geo-fence:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this geo-fence?')) {
      try {
        await deleteGeoFence(id);
        await fetchGeoFences(filterType || undefined);
      } catch (error) {
        console.error('Failed to delete geo-fence:', error);
      }
    }
  };

  const handleToggle = async (id: string, enabled: boolean) => {
    try {
      await toggleGeoFence(id, !enabled);
      await fetchGeoFences(filterType || undefined);
    } catch (error) {
      console.error('Failed to toggle geo-fence:', error);
    }
  };

  const filteredFences = filterType
    ? geoFences.filter((f) => f.type === filterType)
    : geoFences;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Geo-Fence Management
          </CardTitle>
          <CardDescription>Create and manage geo-fences for location validation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="flex-1">
              <label className="text-sm font-medium">Filter by Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">All Types</option>
                <option value="Office">Office</option>
                <option value="Site">Site</option>
                <option value="Restricted">Restricted</option>
                <option value="Custom">Custom</option>
              </select>
            </div>
            <Button onClick={() => handleOpenDialog()} className="gap-2">
              <Plus className="h-4 w-4" />
              New Geo-Fence
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Geo-Fences ({filteredFences.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingGeoFences ? (
            <div className="text-center py-8 text-muted-foreground">Loading geo-fences...</div>
          ) : filteredFences.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No geo-fences found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-2 px-2">Name</th>
                    <th className="text-left py-2 px-2">Type</th>
                    <th className="text-left py-2 px-2">Center</th>
                    <th className="text-left py-2 px-2">Radius</th>
                    <th className="text-left py-2 px-2">Status</th>
                    <th className="text-left py-2 px-2">Created</th>
                    <th className="text-left py-2 px-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFences.map((fence) => (
                    <tr key={fence.id} className="border-b hover:bg-muted/50">
                      <td className="font-medium py-2 px-2">{fence.name}</td>
                      <td className="py-2 px-2">
                        <Badge
                          className={`${typeColors[fence.type]?.bg || 'bg-gray-100'} ${typeColors[fence.type]?.text || 'text-gray-800'}`}
                        >
                          {fence.type}
                        </Badge>
                      </td>
                      <td className="text-xs font-mono py-2 px-2">
                        {fence.center.latitude.toFixed(4)}, {fence.center.longitude.toFixed(4)}
                      </td>
                      <td className="py-2 px-2">{fence.radius} m</td>
                      <td className="py-2 px-2">
                        <Badge variant={fence.enabled ? 'default' : 'secondary'}>
                          {fence.enabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </td>
                      <td className="text-sm py-2 px-2">
                        {formatDate(new Date(fence.createdAt))}
                      </td>
                      <td className="py-2 px-2">
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggle(fence.id, fence.enabled)}
                            title={fence.enabled ? 'Disable' : 'Enable'}
                          >
                            {fence.enabled ? (
                              <Eye className="h-4 w-4" />
                            ) : (
                              <EyeOff className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDialog(fence)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(fence.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {showDialog && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>
                {editingFence ? 'Edit Geo-Fence' : 'Create New Geo-Fence'}
              </CardTitle>
              <CardDescription>
                {editingFence
                  ? 'Update the geo-fence details'
                  : 'Add a new geo-fence for location validation'}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input
                  placeholder="e.g., Main Office"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Type</label>
                <select
                  value={formData.type}
                  onChange={(e: any) => setFormData({ ...formData, type: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="Office">Office</option>
                  <option value="Site">Site</option>
                  <option value="Restricted">Restricted</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Latitude</label>
                  <Input
                    type="number"
                    placeholder="e.g., 28.6139"
                    step="0.0001"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Longitude</label>
                  <Input
                    type="number"
                    placeholder="e.g., 77.2090"
                    step="0.0001"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Radius (meters)</label>
                <Input
                  type="number"
                  placeholder="e.g., 500"
                  value={formData.radius}
                  onChange={(e) => setFormData({ ...formData, radius: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleSubmit} className="flex-1">
                  {editingFence ? 'Update' : 'Create'}
                </Button>
                <Button onClick={handleCloseDialog} variant="outline" className="flex-1">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
