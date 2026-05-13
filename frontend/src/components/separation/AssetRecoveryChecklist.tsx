import React, { useEffect, useState, useCallback } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { AlertCircle, CheckCircle2, Loader2, Package, RefreshCw } from 'lucide-react';
import { separationService, AssetRecoveryItem } from '../../services/separationService';

interface AssetRecoveryChecklistProps {
  employeeId: string;
  onUpdateStatus?: (assetRecoveryId: string, status: string, damageCost?: number) => Promise<void>;
  isLoading?: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  returned: 'bg-green-100 text-green-800 border-green-200',
  damaged: 'bg-red-100 text-red-800 border-red-200',
  missing: 'bg-red-100 text-red-800 border-red-200',
};

const getStatusIcon = (status: string) => {
  if (status === 'returned') return <CheckCircle2 className="h-4 w-4 text-green-600" />;
  if (status === 'damaged' || status === 'missing')
    return <AlertCircle className="h-4 w-4 text-red-600" />;
  return <Package className="h-4 w-4 text-amber-600" />;
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
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchAssets = useCallback(async () => {
    if (!employeeId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await separationService.getAssetRecoveryChecklist(employeeId);
      setAssets(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch asset recovery checklist');
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const handleStatusUpdate = async (assetId: string, newStatus: string, cost?: number) => {
    if (!onUpdateStatus) return;
    try {
      setUpdating(assetId);
      await onUpdateStatus(assetId, newStatus, cost);
      setSelectedAsset(null);
      setDamageCost('');
      await fetchAssets();
    } catch {
      // error handled by parent
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="py-8 space-y-4">
          <div className="flex items-center gap-2 p-4 bg-destructive/10 text-destructive rounded-lg">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
          <Button variant="outline" onClick={fetchAssets} className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const pendingCount = assets.filter((a) => a.status === 'pending').length;
  const returnedCount = assets.filter((a) => a.status === 'returned').length;
  const unreturnedAssets = assets.filter(
    (a) => a.status === 'damaged' || a.status === 'missing'
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Asset Recovery Checklist</CardTitle>
            <CardDescription>
              Track the return status of all assets assigned to the employee
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={fetchAssets} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-muted rounded-lg text-center">
            <p className="text-2xl font-bold">{assets.length}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-green-700">{returnedCount}</p>
            <p className="text-xs text-muted-foreground">Returned</p>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-amber-700">{pendingCount}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </div>
          <div className="p-3 bg-red-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-red-700">{unreturnedAssets.length}</p>
            <p className="text-xs text-muted-foreground">Unreturned</p>
          </div>
        </div>

        {/* Assets List */}
        {assets.length === 0 ? (
          <div className="flex flex-col items-center py-10 gap-3 text-center">
            <Package className="h-12 w-12 text-muted-foreground/40" />
            <p className="text-muted-foreground">No assets assigned to this employee</p>
          </div>
        ) : (
          <div className="space-y-3">
            {assets.map((asset) => (
              <div
                key={asset.id}
                className="border border-border rounded-lg p-4 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {getStatusIcon(asset.status)}
                    <div className="min-w-0">
                      <p className="font-semibold truncate">
                        {asset.asset_name || `Asset ${asset.asset_code || asset.asset_id}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {asset.asset_code && <span>{asset.asset_code}</span>}
                        {asset.asset_category && <span className="ml-1">· {asset.asset_category}</span>}
                      </p>
                      {asset.notes && (
                        <p className="text-sm text-muted-foreground mt-1">{asset.notes}</p>
                      )}
                      {asset.damage_cost && (
                        <p className="text-sm text-red-600 mt-1">
                          Damage cost: ₹{asset.damage_cost.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded border ${
                        STATUS_COLORS[asset.status] || 'bg-muted'
                      }`}
                    >
                      {asset.status.toUpperCase()}
                    </span>

                    {onUpdateStatus && asset.status === 'pending' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setSelectedAsset(selectedAsset === asset.id ? null : asset.id)
                        }
                        disabled={!!updating}
                      >
                        Update
                      </Button>
                    )}
                  </div>
                </div>

                {/* Inline update panel */}
                {selectedAsset === asset.id && asset.status === 'pending' && (
                  <div className="mt-3 pt-3 border-t border-border space-y-3">
                    <p className="text-sm font-medium">Mark as:</p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-green-300 text-green-700 hover:bg-green-50"
                        onClick={() => handleStatusUpdate(asset.id, 'returned')}
                        disabled={updating === asset.id || isLoading}
                      >
                        {updating === asset.id ? (
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                        )}
                        Returned
                      </Button>

                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          placeholder="Damage cost (₹)"
                          value={damageCost}
                          onChange={(e) => setDamageCost(e.target.value)}
                          className="w-32 px-2 py-1 border border-input rounded text-sm bg-background"
                          min="0"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-300 text-red-700 hover:bg-red-50"
                          onClick={() =>
                            handleStatusUpdate(
                              asset.id,
                              'damaged',
                              damageCost ? parseFloat(damageCost) : undefined
                            )
                          }
                          disabled={updating === asset.id || isLoading}
                        >
                          Damaged
                        </Button>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-300 text-red-700 hover:bg-red-50"
                        onClick={() => handleStatusUpdate(asset.id, 'missing')}
                        disabled={updating === asset.id || isLoading}
                      >
                        Missing
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedAsset(null);
                          setDamageCost('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Unreturned assets warning */}
        {unreturnedAssets.length > 0 && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="font-semibold text-red-700 mb-2">
              {unreturnedAssets.length} Unreturned Asset(s) — Will affect F&amp;F Settlement
            </p>
            <ul className="space-y-1 text-sm text-red-600">
              {unreturnedAssets.map((asset) => (
                <li key={asset.id} className="flex items-center gap-2">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    {asset.asset_name || asset.asset_code || asset.asset_id} ({asset.status})
                    {asset.damage_cost ? ` — ₹${asset.damage_cost.toLocaleString()}` : ''}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* All done */}
        {assets.length > 0 && pendingCount === 0 && (
          <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 border border-green-200 rounded-md">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span className="text-sm">All assets have been processed</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
