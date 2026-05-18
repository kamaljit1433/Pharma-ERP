import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { benefitsService } from '../../services/benefitsService';
import { CheckCircle2, XCircle, AlertCircle, ChevronLeft, ChevronRight, Search, X } from 'lucide-react';

interface ReimbursementClaim {
  id: string;
  employee_id: string;
  claim_type: string;
  amount: number;
  description: string;
  status: string;
  claim_date: string;
  created_at: string;
  approved_at?: string;
  approval_notes?: string;
}

interface ReimbursementApprovalProps {
  approverId: string;
}

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];
const STATUS_OPTIONS = ['all', 'pending', 'approved', 'rejected', 'paid'];

export const ReimbursementApproval: React.FC<ReimbursementApprovalProps> = ({ approverId }) => {
  const [claims, setClaims] = useState<ReimbursementClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filters
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterSearch, setFilterSearch] = useState('');

  useEffect(() => {
    fetchAllClaims();
  }, []);

  const fetchAllClaims = async () => {
    try {
      setLoading(true);
      const response = await benefitsService.getAllReimbursementClaims();
      setClaims(response.data || []);
    } catch (error) {
      console.error('Failed to fetch claims:', error);
      setMessage({ type: 'error', text: 'Failed to load claims' });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (claimId: string) => {
    try {
      setProcessing(true);
      await benefitsService.approveClaim(claimId, approverId, approvalNotes);
      setMessage({ type: 'success', text: 'Claim approved successfully' });
      setSelectedClaimId(null);
      setApprovalNotes('');
      fetchAllClaims();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to approve claim' });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (claimId: string) => {
    if (!approvalNotes.trim()) {
      setMessage({ type: 'error', text: 'Please provide rejection reason' });
      return;
    }
    try {
      setProcessing(true);
      await benefitsService.rejectClaim(claimId, approverId, approvalNotes);
      setMessage({ type: 'success', text: 'Claim rejected successfully' });
      setSelectedClaimId(null);
      setApprovalNotes('');
      fetchAllClaims();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to reject claim' });
    } finally {
      setProcessing(false);
    }
  };

  const claimTypes = useMemo(() => {
    const types = Array.from(new Set(claims.map((c) => c.claim_type))).filter(Boolean);
    return types.sort();
  }, [claims]);

  const filtered = useMemo(() => {
    return claims.filter((c) => {
      if (filterStatus !== 'all' && c.status !== filterStatus) return false;
      if (filterType !== 'all' && c.claim_type !== filterType) return false;
      if (filterSearch.trim()) {
        const q = filterSearch.toLowerCase();
        if (
          !c.claim_type.toLowerCase().includes(q) &&
          !c.description.toLowerCase().includes(q) &&
          !String(c.amount).includes(q)
        ) return false;
      }
      return true;
    });
  }, [claims, filterStatus, filterType, filterSearch]);

  const hasActiveFilters = filterStatus !== 'all' || filterType !== 'all' || filterSearch.trim() !== '';

  const clearFilters = () => {
    setFilterStatus('all');
    setFilterType('all');
    setFilterSearch('');
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const getStatusBadge = (status: string) => {
    const cfg: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      paid: 'bg-blue-100 text-blue-800',
    };
    return (
      <Badge className={cfg[status] || 'bg-gray-100 text-gray-800'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return <div className="text-center py-8">Loading claims...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Reimbursement Claim Approval</h2>

      {message && (
        <Card className={message.type === 'success' ? 'border-green-400' : 'border-destructive'}>
          <CardContent className="pt-6 flex gap-2">
            {message.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
            )}
            <p>{message.text}</p>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search by type, description, amount…"
            value={filterSearch}
            onChange={(e) => { setFilterSearch(e.target.value); setPage(1); }}
            className="pl-9 h-9"
          />
        </div>

        {/* Status filter */}
        <Select value={filterStatus} onValueChange={(v: string) => { setFilterStatus(v); setPage(1); }}>
          <SelectTrigger className="h-9 w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>
                {s === 'all' ? 'All Statuses' : s.charAt(0).toUpperCase() + s.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Claim type filter */}
        {claimTypes.length > 0 && (
          <Select value={filterType} onValueChange={(v: string) => { setFilterType(v); setPage(1); }}>
            <SelectTrigger className="h-9 w-40">
              <SelectValue placeholder="Claim Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {claimTypes.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Clear filters */}
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 h-9 text-muted-foreground">
            <X className="w-4 h-4" /> Clear
          </Button>
        )}
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            {hasActiveFilters ? 'No claims match the current filters' : 'No claims found'}
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Rows per page + count */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Rows per page:</span>
            <Select
              value={String(pageSize)}
              onValueChange={(v: string) => { setPageSize(Number(v)); setPage(1); }}
            >
              <SelectTrigger className="h-8 w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map((n) => (
                  <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span>
              {filtered.length} claim{filtered.length !== 1 ? 's' : ''}
              {hasActiveFilters && claims.length !== filtered.length && ` (filtered from ${claims.length})`}
            </span>
          </div>

          <div className="space-y-4">
            {paginated.map((claim) => (
              <Card key={claim.id} className={selectedClaimId === claim.id ? 'border-primary' : ''}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{claim.claim_type} Claim</CardTitle>
                      <CardDescription>
                        Submitted on {new Date(claim.created_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    {getStatusBadge(claim.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Amount</p>
                        <p className="text-2xl font-bold">₹{claim.amount.toLocaleString()}</p>
                      </div>
                      {claim.approved_at && (
                        <div>
                          <p className="text-sm text-muted-foreground">
                            {claim.status === 'rejected' ? 'Rejected On' : 'Approved On'}
                          </p>
                          <p className="font-medium">{new Date(claim.approved_at).toLocaleDateString()}</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Description</p>
                      <p className="p-2 bg-muted rounded text-sm">{claim.description}</p>
                    </div>

                    {claim.approval_notes && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Notes</p>
                        <p className="p-2 bg-muted rounded text-sm">{claim.approval_notes}</p>
                      </div>
                    )}

                    {selectedClaimId === claim.id && (
                      <div className="space-y-3 pt-4 border-t">
                        <div>
                          <Label htmlFor={`notes-${claim.id}`}>Approval / Rejection Notes</Label>
                          <textarea
                            id={`notes-${claim.id}`}
                            placeholder="Add notes (required for rejection)"
                            value={approvalNotes}
                            onChange={(e) => setApprovalNotes(e.target.value)}
                            className="w-full mt-1 px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                            rows={3}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={() => handleApprove(claim.id)} disabled={processing} className="gap-2 flex-1">
                            <CheckCircle2 className="w-4 h-4" /> Approve
                          </Button>
                          <Button onClick={() => handleReject(claim.id)} disabled={processing} variant="destructive" className="gap-2 flex-1">
                            <XCircle className="w-4 h-4" /> Reject
                          </Button>
                          <Button onClick={() => { setSelectedClaimId(null); setApprovalNotes(''); }} variant="outline">
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}

                    {selectedClaimId !== claim.id && claim.status === 'pending' && (
                      <Button onClick={() => setSelectedClaimId(claim.id)} variant="outline" className="w-full">
                        Review Claim
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-end gap-2 pt-1">
            <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              const n = totalPages <= 7 ? i + 1
                : page <= 4 ? i + 1
                : page >= totalPages - 3 ? totalPages - 6 + i
                : page - 3 + i;
              return (
                <Button key={n} variant={n === page ? 'default' : 'outline'} size="sm"
                  onClick={() => setPage(n)} className="w-8 h-8 p-0">
                  {n}
                </Button>
              );
            })}
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
