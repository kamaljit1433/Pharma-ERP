import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { AlertCircle, CheckCircle2, Loader2, Package } from 'lucide-react';

interface AssetRecoveryItem {
  id: string;
  employee_id: string;
  asset_id: string;
  status: 'pending' | 'returned' | 'damaged' | 'missing';
  damage_cost?: number;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

interface AssetRecoveryChecklistProps {
  employeeId: string;
  onUpdateStatus?: (assetRecoveryId: string, status: string, damageCost?: number) => Promise<void>;
  isLoading?: boolean;
}

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'pending':
      return 'bg-warning text-warning-foreground';
    case 'returned':
      return 'bg-success text-success-foreground';
    case 'damaged':
      return 'bg-destructive text-destructive-foreground';
    case 'missing':
      return 'bg-destructive text-destructive-foreground';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'returned':
      return <CheckCircle2 className="h-4 w-4" />;
    case 'damaged':
    case 'missing':
      return <AlertCircle className="h-4 w-4" />;
    default:
      return <Package className="h-4 w-4" />;
  }
};

export const AssetRecoveryChecklist: React.FC<AssetRecoveryChecklistProps> = ({
  employeeId,
  onUpdateStatus,
  isLoading = false,
}) => {
  const [assets, setAssets] = useState<AssetRecoveryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [damageCost, setDamageCost] = useState('');

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        setLoading(true);
        // This would be replaced with actual API call
        // const response = await fetch(`/api/v1/separation/${employeeId}/asset-recovery`);
        // const data = await response.json();
        // setAssets(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch asset recovery checklist');
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, [employeeId]);

  const handleStatusUpdate = async (assetId: string, newStatus: string) => {
    try {
      if (onUpdateStatus) {
        const cost = newStatus === 'damaged' ? parseFloat(damageCost) : undefined;
        await onUpdateStatus(assetId, newStatus, cost);
        setSelectedAsset(null);
        setDamageCost('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update asset status');
    }
  };

  if (loading) {
    return (
      <Card className="w-full max-w-4xl">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  const pendingCount = assets.filter((a) => a.status === 'pending').length;
  const returnedCount = assets.filter((a) => a.status === 'returned').length;
  const unreturned = assets.filter((a) => a.status === 'damaged' || a.status === 'missing');

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Asset Recovery Checklist</CardTitle>
        <CardDescription>
          Track the return status of all assets assigned to the employee
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-md">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="p-3 bg-muted rounded-lg text-center">
            <p className="text-2xl font-bold">{assets.length}</p>
            <p className="text-xs text-muted-foreground">Total Assets</p>
          </div>
          <div className="p-3 bg-success/10 rounded-lg text-center">
            <p className="text-2xl font-bold text-success">{returnedCount}</p>
            <p className="text-xs text-muted-foreground">Returned</p>
          </div>
          <div className="p-3 bg-warning/10 rounded-lg text-center">
            <p className="text-2xl font-bold text-warning">{pendingCount}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </div>
          <div className="p-3 bg-destructive/10 rounded-lg text-center">
            <p className="text-2xl font-bold text-destructive">{unreturned.length}</p>
            <p className="text-xs text-muted-foreground">Unreturned</p>
          </div>
        </div>

        {/* Assets List */}
        {assets.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No assets assigned to this employee</p>
          </div>
        ) : (
          <div className="space-y-3">
            {assets.map((asset) => (
              <div
                key={asset.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition"
              >
                <div className="flex items-center gap-3 flex-1">
                  {getStatusIcon(asset.status)}
                  <div>
                    <p className="font-semibold">Asset ID: {asset.asset_id}</p>
                    {asset.notes && <p className="text-sm text-muted-foreground">{asset.notes}</p>}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge className={getStatusColor(asset.status)}>
                    {asset.status.toUpperCase()}
                  </Badge>

                  {selectedAsset === asset.id ? (
                    <div className="flex gap-2">
                      {asset.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusUpdate(asset.id, 'returned')}
                            disabled={isLoading}
                          >
                            Returned
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedAsset(null)}
                          >
                            Cancel
                          </Button>
                        </>
                      )}
                      {asset.status === 'pending' && (
                        <div className="flex gap-2">
                          <input
                            type="number"
                            placeholder="Damage cost"
                            value={damageCost}
                            onChange={(e) => setDamageCost(e.target.value)}
                            className="w-24 px-2 py-1 border border-input rounded text-sm"
                          />
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleStatusUpdate(asset.id, 'damaged', parseFloat(damageCost))}
                            disabled={isLoading || !damageCost}
                          >
                            Damaged
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleStatusUpdate(asset.id, 'missing')}
                            disabled={isLoading}
                          >
                            Missing
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    asset.status === 'pending' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedAsset(asset.id)}
                      >
                        Update Status
                      </Button>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Unreturned Assets Summary */}
        {unreturned.length > 0 && (
          <div className="p-4 bg-destructive/10 rounded-lg">
            <p className="font-semibold text-destructive mb-2">
              ⚠️ {unreturned.length} Unreturned Asset(s)
            </p>
            <p className="text-sm text-muted-foreground">
              These assets will be deducted from the F&F settlement:
            </p>
            <ul className="list-disc list-inside mt-2 text-sm">
              {unreturned.map((asset) => (
                <li key={asset.id}>
                  {asset.asset_id} ({asset.status})
                  {asset.damage_cost && ` - ₹${asset.damage_cost}`}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Completion Status */}
        {pendingCount === 0 && (
          <div className="flex items-center gap-2 p-3 bg-success/10 text-success rounded-md">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-sm">All assets have been processed</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
