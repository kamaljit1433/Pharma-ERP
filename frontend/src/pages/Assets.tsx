import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types/auth';
import { assetService, Asset, CreateAssetDTO } from '../services/assetService';
import { EmployeeSearch } from '../components/performance/EmployeeSearch';
import { Employee } from '../services/employeeService';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import {
  Package, Plus, Search, UserCheck, UserX, Loader2,
  Pencil, Trash2, AlertCircle, CheckCircle2, RefreshCw,
} from 'lucide-react';
import { useToast } from '../hooks/useToast';

const STATUS_COLORS: Record<string, string> = {
  available: 'default',
  assigned: 'secondary',
  damaged: 'destructive',
  lost: 'destructive',
  returned: 'outline',
};

const PRESET_CATEGORIES = ['Laptop', 'Mobile', 'Monitor', 'Keyboard', 'Mouse', 'Headset', 'Chair', 'Desk', 'Other'];

const formatCurrency = (v: number | null) =>
  v != null ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(v) : '—';

const Assets: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const canManage = user?.role === UserRole.HR_MANAGER || user?.role === UserRole.IT_ADMIN || user?.role === UserRole.SUPER_ADMIN;

  // ── Inventory state ──────────────────────────────────────────────
  const [assets, setAssets] = useState<Asset[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loadingList, setLoadingList] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);

  // ── Create asset state ────────────────────────────────────────────
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState<CreateAssetDTO>({ asset_code: '', name: '', category: '', value: undefined, notes: '' });
  const [creating, setCreating] = useState(false);

  // ── Assign state ──────────────────────────────────────────────────
  const [assignAssetId, setAssignAssetId] = useState('');
  const [assignAssetSearch, setAssignAssetSearch] = useState('');
  const [assignEmployee, setAssignEmployee] = useState<Employee | null>(null);
  const [assignEmployeeId, setAssignEmployeeId] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);
  const [availableForAssign, setAvailableForAssign] = useState<Asset[]>([]);
  const [loadingAvailable, setLoadingAvailable] = useState(false);

  // ── Edit state ────────────────────────────────────────────────────
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Asset>>({});
  const [editLoading, setEditLoading] = useState(false);

  const [limit, setLimit] = useState(10);

  const fetchAssets = useCallback(async () => {
    setLoadingList(true);
    try {
      const result = await assetService.list({ search, status: filterStatus, category: filterCategory, page, limit });
      setAssets(result.data);
      setTotal(result.total);
    } catch {
      toast({ type: 'error', message: 'Failed to load assets' });
    } finally {
      setLoadingList(false);
    }
  }, [search, filterStatus, filterCategory, page, limit]);

  const fetchCategories = useCallback(async () => {
    try {
      const cats = await assetService.getCategories();
      setCategories([...new Set([...PRESET_CATEGORIES, ...cats])]);
    } catch { /* ignore */ }
  }, []);

  const fetchAvailableAssets = useCallback(async () => {
    if (!assignAssetSearch) { setAvailableForAssign([]); return; }
    setLoadingAvailable(true);
    try {
      const result = await assetService.list({ status: 'available', search: assignAssetSearch, limit: 50 });
      setAvailableForAssign(result.data);
    } catch { /* ignore */ }
    finally { setLoadingAvailable(false); }
  }, [assignAssetSearch]);

  useEffect(() => { fetchAssets(); }, [fetchAssets]);
  useEffect(() => { fetchCategories(); }, [fetchCategories]);
  useEffect(() => { fetchAvailableAssets(); }, [fetchAvailableAssets]);

  // reset to page 1 when filters or page size change
  useEffect(() => { setPage(1); }, [search, filterStatus, filterCategory, limit]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await assetService.create(createForm);
      toast({ type: 'success', message: 'Asset created successfully' });
      setShowCreate(false);
      setCreateForm({ asset_code: '', name: '', category: '', value: undefined, notes: '' });
      fetchAssets();
      fetchCategories();
    } catch (err: any) {
      toast({ type: 'error', message: err?.response?.data?.message || err?.message || 'Failed to create asset' });
    } finally {
      setCreating(false);
    }
  };

  const handleAssign = async () => {
    if (!assignAssetId || !assignEmployeeId) return;
    setAssignLoading(true);
    try {
      await assetService.assign(assignAssetId, assignEmployeeId);
      toast({ type: 'success', message: 'Asset assigned successfully' });
      setAssignAssetId('');
      setAssignEmployee(null);
      setAssignEmployeeId('');
      fetchAssets();
      fetchAvailableAssets();
    } catch (err: any) {
      toast({ type: 'error', message: err?.response?.data?.message || err?.message || 'Failed to assign asset' });
    } finally {
      setAssignLoading(false);
    }
  };

  const handleUnassign = async (assetId: string) => {
    try {
      await assetService.unassign(assetId);
      toast({ type: 'success', message: 'Asset unassigned' });
      fetchAssets();
      fetchAvailableAssets();
    } catch (err: any) {
      toast({ type: 'error', message: err?.response?.data?.message || err?.message || 'Failed to unassign' });
    }
  };

  const handleDelete = async (assetId: string) => {
    try {
      await assetService.delete(assetId);
      toast({ type: 'success', message: 'Asset deleted' });
      fetchAssets();
    } catch (err: any) {
      toast({ type: 'error', message: err?.response?.data?.message || err?.message || 'Failed to delete' });
    }
  };

  const startEdit = (asset: Asset) => {
    setEditingId(asset.id);
    setEditForm({ name: asset.name, category: asset.category, value: asset.value ?? undefined, notes: asset.notes ?? '', status: asset.status });
  };

  const handleSaveEdit = async (assetId: string) => {
    setEditLoading(true);
    try {
      await assetService.update(assetId, editForm);
      toast({ type: 'success', message: 'Asset updated' });
      setEditingId(null);
      fetchAssets();
    } catch (err: any) {
      toast({ type: 'error', message: err?.response?.data?.message || err?.message || 'Failed to update' });
    } finally {
      setEditLoading(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl lg:text-3xl">Asset Management</h1>
        <p className="text-muted-foreground mt-2">Track, assign, and manage company assets</p>
      </div>

      <Tabs defaultValue="inventory">
        <TabsList className="w-full">
          <TabsTrigger value="inventory" className="flex items-center gap-1.5">
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">Inventory</span>
          </TabsTrigger>
          <TabsTrigger value="assign" className="flex items-center gap-1.5" disabled={!canManage}>
            <UserCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Assign Asset</span>
          </TabsTrigger>
        </TabsList>

        {/* ── INVENTORY TAB ── */}
        <TabsContent value="inventory" className="mt-6 space-y-4">

          {/* Filters + Add */}
          <div className="flex flex-wrap gap-3 items-end">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search name, code, category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value={filterStatus || 'all'}
              onValueChange={(v) => setFilterStatus(v === 'all' ? '' : v)}
            >
              <SelectTrigger className="h-10 w-36">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {['available', 'assigned', 'damaged', 'lost', 'returned'].map((s) => (
                  <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filterCategory || 'all'}
              onValueChange={(v) => setFilterCategory(v === 'all' ? '' : v)}
            >
              <SelectTrigger className="h-10 w-40">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            {canManage && (
              <Button onClick={() => setShowCreate((p) => !p)}>
                <Plus className="h-4 w-4 mr-1.5" />
                Add Asset
              </Button>
            )}
          </div>

          {/* Create form */}
          {showCreate && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">New Asset</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label>Asset Code *</Label>
                    <Input placeholder="e.g. LAP-001" value={createForm.asset_code}
                      onChange={(e) => setCreateForm((p) => ({ ...p, asset_code: e.target.value }))} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Name *</Label>
                    <Input placeholder="e.g. Dell Latitude 5420" value={createForm.name}
                      onChange={(e) => setCreateForm((p) => ({ ...p, name: e.target.value }))} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Category *</Label>
                    <select
                      value={createForm.category}
                      onChange={(e) => setCreateForm((p) => ({ ...p, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
                      required
                    >
                      <option value="">Select category</option>
                      {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Value (₹)</Label>
                    <Input type="number" min={0} placeholder="0" value={createForm.value ?? ''}
                      onChange={(e) => setCreateForm((p) => ({ ...p, value: e.target.value ? Number(e.target.value) : undefined }))} />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label>Notes</Label>
                    <Input placeholder="Optional notes" value={createForm.notes ?? ''}
                      onChange={(e) => setCreateForm((p) => ({ ...p, notes: e.target.value }))} />
                  </div>
                  <div className="sm:col-span-2 lg:col-span-3 flex gap-2 justify-end">
                    <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
                    <Button type="submit" disabled={creating}>
                      {creating && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
                      Create Asset
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Asset table */}
          {loadingList ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : assets.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center py-12 gap-3 text-center">
                <Package className="h-10 w-10 text-muted-foreground/40" />
                <p className="text-muted-foreground">No assets found.</p>
                <Button variant="outline" size="sm" onClick={fetchAssets}>
                  <RefreshCw className="h-4 w-4 mr-1.5" />Refresh
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    {['Code', 'Name', 'Category', 'Status', 'Assigned To', 'Value', canManage ? 'Actions' : ''].filter(Boolean).map((h) => (
                      <th key={h} className="px-4 py-3 text-left font-medium text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {assets.map((asset) => (
                    <tr key={asset.id} className="border-t hover:bg-muted/30">
                      {editingId === asset.id ? (
                        <>
                          <td className="px-4 py-2 font-mono text-xs">{asset.asset_code}</td>
                          <td className="px-4 py-2">
                            <Input className="h-7 text-sm" value={editForm.name ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))} />
                          </td>
                          <td className="px-4 py-2">
                            <select value={editForm.category ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, category: e.target.value }))}
                              className="w-full px-2 py-1 border border-input rounded text-sm bg-background">
                              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                          </td>
                          <td className="px-4 py-2">
                            <select value={editForm.status ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value as Asset['status'] }))}
                              className="w-full px-2 py-1 border border-input rounded text-sm bg-background">
                              {['available', 'assigned', 'damaged', 'lost', 'returned'].map((s) => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </td>
                          <td className="px-4 py-2 text-muted-foreground">{asset.assigned_employee_name ?? '—'}</td>
                          <td className="px-4 py-2">
                            <Input type="number" className="h-7 w-28 text-sm" value={editForm.value ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, value: e.target.value ? Number(e.target.value) : undefined }))} />
                          </td>
                          <td className="px-4 py-2">
                            <div className="flex gap-1.5">
                              <Button size="sm" className="h-7" onClick={() => handleSaveEdit(asset.id)} disabled={editLoading}>
                                {editLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                              </Button>
                              <Button size="sm" variant="outline" className="h-7" onClick={() => setEditingId(null)}>Cancel</Button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-4 py-3 font-mono text-xs">{asset.asset_code}</td>
                          <td className="px-4 py-3 font-medium">{asset.name}</td>
                          <td className="px-4 py-3 text-muted-foreground">{asset.category}</td>
                          <td className="px-4 py-3">
                            <Badge variant={STATUS_COLORS[asset.status] as any}>
                              {asset.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {asset.assigned_employee_name
                              ? <span>{asset.assigned_employee_name} <span className="text-xs">({asset.assigned_employee_code})</span></span>
                              : '—'}
                          </td>
                          <td className="px-4 py-3">{formatCurrency(asset.value)}</td>
                          {canManage && (
                            <td className="px-4 py-3">
                              <div className="flex gap-1.5">
                                <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => startEdit(asset)} title="Edit">
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                {asset.status === 'assigned' && (
                                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-amber-600" onClick={() => handleUnassign(asset.id)} title="Unassign">
                                    <UserX className="h-3.5 w-3.5" />
                                  </Button>
                                )}
                                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => handleDelete(asset.id)} title="Delete">
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </td>
                          )}
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {total > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <span>Rows per page:</span>
                <select
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                  className="px-2 py-1 border border-input rounded-md bg-background text-sm"
                >
                  {[10, 25, 50, 100].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
                <span className="ml-1">
                  {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
                </span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
                <span className="px-3 py-1.5 text-muted-foreground">Page {page} of {Math.max(totalPages, 1)}</span>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* ── ASSIGN TAB ── */}
        <TabsContent value="assign" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Select employee */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">1. Select Employee</CardTitle>
                <CardDescription>Search the employee to assign an asset to</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <EmployeeSearch
                  placeholder="Search by name or employee ID..."
                  onChange={(id, emp) => { setAssignEmployeeId(id); setAssignEmployee(emp); }}
                />
                {assignEmployee && (
                  <div className="p-3 bg-muted rounded-md text-sm">
                    <p className="font-medium">{assignEmployee.first_name} {assignEmployee.last_name}</p>
                    <p className="text-xs text-muted-foreground">{assignEmployee.employee_id} · {assignEmployee.email}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Select asset */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">2. Select Available Asset</CardTitle>
                <CardDescription>Only unassigned assets are shown</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    placeholder="Search assets..."
                    value={assignAssetSearch}
                    onChange={(e) => setAssignAssetSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                {!assignAssetSearch ? null : loadingAvailable ? (
                  <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
                ) : availableForAssign.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No available assets found</p>
                ) : (
                  <div className="space-y-1.5 max-h-64 overflow-y-auto">
                    {availableForAssign.map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => setAssignAssetId(a.id)}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm flex justify-between items-center border transition-colors ${
                          assignAssetId === a.id
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-background border-input hover:bg-muted'
                        }`}
                      >
                        <span>
                          <span className="font-medium">{a.name}</span>
                          <span className="text-xs ml-2 opacity-70">{a.asset_code}</span>
                        </span>
                        <span className="text-xs opacity-70">{a.category}</span>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Confirm */}
          {assignEmployeeId && assignAssetId && (
            <Card className="mt-4">
              <CardContent className="pt-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                  <span>
                    Assign <span className="font-medium">{availableForAssign.find(a => a.id === assignAssetId)?.name}</span>
                    {' '}to <span className="font-medium">{assignEmployee?.first_name} {assignEmployee?.last_name}</span>
                  </span>
                </div>
                <Button onClick={handleAssign} disabled={assignLoading}>
                  {assignLoading ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <UserCheck className="h-4 w-4 mr-1.5" />}
                  {assignLoading ? 'Assigning...' : 'Confirm Assignment'}
                </Button>
              </CardContent>
            </Card>
          )}

          {(!assignEmployeeId || !assignAssetId) && (
            <div className="flex items-center gap-2 mt-4 p-3 bg-muted rounded-md text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4 shrink-0" />
              Select both an employee and an available asset to proceed.
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Assets;
