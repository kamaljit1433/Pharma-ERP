import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { OfferLetter } from '../../types/recruitment';
import { useRecruitmentStore } from '../../store/recruitmentStore';
import { Award, Mail, CheckCircle, XCircle, Clock, AlertCircle, Trash2, Send, Loader2 } from 'lucide-react';

interface JobOfferTrackerProps {
  jobPostingId?: string;
  applicantId?: string;
}

const statusConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  draft: { icon: <Clock className="w-4 h-4" />, color: 'bg-gray-100 text-gray-800', label: 'Draft' },
  sent: { icon: <Mail className="w-4 h-4" />, color: 'bg-blue-100 text-blue-800', label: 'Sent' },
  signed: { icon: <CheckCircle className="w-4 h-4" />, color: 'bg-purple-100 text-purple-800', label: 'Signed' },
  accepted: { icon: <CheckCircle className="w-4 h-4" />, color: 'bg-green-100 text-green-800', label: 'Accepted' },
  rejected: { icon: <XCircle className="w-4 h-4" />, color: 'bg-red-100 text-red-800', label: 'Rejected' },
};

const PAGE_SIZES = [10, 25, 50, 100];

export const JobOfferTracker: React.FC<JobOfferTrackerProps> = ({ jobPostingId, applicantId }) => {
  const { offers, loading, candidates, sendOffer, deleteOffer, fetchOffers } = useRecruitmentStore();
  const [filteredOffers, setFilteredOffers] = useState<OfferLetter[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<OfferLetter | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<OfferLetter | null>(null);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sendLoading, setSendLoading] = useState(false);
  const [sendError, setSendError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    let filtered = offers;

    if (jobPostingId) {
      const jobCandidateIds = candidates
        .filter((c) => c.job_posting_id === jobPostingId)
        .map((c) => c.id);
      filtered = filtered.filter((o) => jobCandidateIds.includes(o.applicant_id));
    }

    if (applicantId) {
      filtered = filtered.filter((o) => o.applicant_id === applicantId);
    }

    setFilteredOffers(filtered);
    setCurrentPage(1);
  }, [offers, jobPostingId, applicantId, candidates]);

  const getCandidateName = (id: string) =>
    candidates.find((c) => c.id === id)?.name || 'Unknown';

  const getCandidateEmail = (id: string) =>
    candidates.find((c) => c.id === id)?.email || 'N/A';

  const getStatusConfig = (status: string) =>
    statusConfig[status?.toLowerCase()] || statusConfig['draft'];

  const totalPages = Math.ceil(filteredOffers.length / pageSize);
  const paginatedOffers = filteredOffers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSendOffer = async (offer: OfferLetter) => {
    setSendLoading(true);
    setSendError('');
    try {
      await sendOffer(offer.id);
      await fetchOffers();
      // Refresh the selectedOffer to reflect new status
      setSelectedOffer((prev) => prev ? { ...prev, status: 'sent' } : null);
    } catch (err) {
      setSendError((err as Error).message || 'Failed to send offer letter');
    } finally {
      setSendLoading(false);
    }
  };

  const handleDeleteOffer = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    setDeleteError('');
    try {
      await deleteOffer(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err) {
      setDeleteError((err as Error).message || 'Failed to delete offer letter');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading && offers.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Loading offers...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Job Offer Tracker
          </CardTitle>
          <CardDescription>Track the status of all job offers sent to candidates</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredOffers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground opacity-50 mb-2" />
              <p className="text-muted-foreground">No job offers found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Candidate</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Salary</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedOffers.map((offer) => {
                      const config = getStatusConfig(offer.status);
                      const isDraft = offer.status?.toLowerCase() === 'draft';
                      return (
                        <TableRow key={offer.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{getCandidateName(offer.applicant_id)}</p>
                              <p className="text-xs text-muted-foreground">{getCandidateEmail(offer.applicant_id)}</p>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{offer.position}</TableCell>
                          <TableCell>{offer.department || '—'}</TableCell>
                          <TableCell>₹{(offer.salary ?? 0).toLocaleString()}</TableCell>
                          <TableCell>
                            {offer.start_date ? new Date(offer.start_date).toLocaleDateString() : '—'}
                          </TableCell>
                          <TableCell>
                            <Badge className={config.color}>
                              <span className="flex items-center gap-1">
                                {config.icon}
                                {config.label}
                              </span>
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {offer.created_at ? new Date(offer.created_at).toLocaleDateString() : '—'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="sm" onClick={() => { setSendError(''); setSelectedOffer(offer); }}>
                                View
                              </Button>
                              {isDraft && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => { setDeleteError(''); setDeleteTarget(offer); }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Rows per page:</span>
                  {PAGE_SIZES.map((size) => (
                    <button
                      key={size}
                      onClick={() => { setPageSize(size); setCurrentPage(1); }}
                      className={`px-2 py-0.5 rounded text-xs border ${pageSize === size ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted'}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-muted-foreground">
                    {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filteredOffers.length)} of {filteredOffers.length}
                  </span>
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* Summary Stats */}
          {filteredOffers.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6 pt-6 border-t">
              <div>
                <p className="text-xs text-muted-foreground">Total Offers</p>
                <p className="text-2xl font-bold">{filteredOffers.length}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Sent</p>
                <p className="text-2xl font-bold text-blue-600">
                  {filteredOffers.filter((o) => o.status?.toLowerCase() === 'sent').length}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Accepted</p>
                <p className="text-2xl font-bold text-green-600">
                  {filteredOffers.filter((o) => o.status?.toLowerCase() === 'accepted').length}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Rejected</p>
                <p className="text-2xl font-bold text-red-600">
                  {filteredOffers.filter((o) => o.status?.toLowerCase() === 'rejected').length}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {filteredOffers.filter((o) => ['draft', 'sent'].includes(o.status?.toLowerCase())).length}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Offer Modal */}
      <Dialog open={!!selectedOffer} onOpenChange={() => setSelectedOffer(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Offer Letter Details
            </DialogTitle>
          </DialogHeader>
          {selectedOffer && (() => {
            const config = getStatusConfig(selectedOffer.status);
            const isDraft = selectedOffer.status?.toLowerCase() === 'draft';
            return (
              <div className="space-y-4">
                {/* Status */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge className={config.color}>
                    <span className="flex items-center gap-1">{config.icon}{config.label}</span>
                  </Badge>
                </div>

                {/* Candidate */}
                <div className="p-4 bg-muted rounded-lg space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Candidate</p>
                  <p className="font-semibold">{getCandidateName(selectedOffer.applicant_id)}</p>
                  <p className="text-sm text-muted-foreground">{getCandidateEmail(selectedOffer.applicant_id)}</p>
                </div>

                {/* Offer Details */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 border border-border rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Position</p>
                    <p className="font-medium text-sm">{selectedOffer.position}</p>
                  </div>
                  <div className="p-3 border border-border rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Department</p>
                    <p className="font-medium text-sm">{selectedOffer.department || '—'}</p>
                  </div>
                  <div className="p-3 border border-border rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Annual Salary</p>
                    <p className="font-semibold text-sm text-green-700">₹{(selectedOffer.salary ?? 0).toLocaleString()}</p>
                  </div>
                  <div className="p-3 border border-border rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Start Date</p>
                    <p className="font-medium text-sm">
                      {selectedOffer.start_date ? new Date(selectedOffer.start_date).toLocaleDateString() : '—'}
                    </p>
                  </div>
                </div>

                {/* Terms */}
                {selectedOffer.terms && (
                  <div className="p-3 border border-border rounded-lg">
                    <p className="text-xs text-muted-foreground mb-2">Terms & Conditions</p>
                    <p className="text-sm whitespace-pre-wrap">{selectedOffer.terms}</p>
                  </div>
                )}

                {/* Footer dates */}
                <p className="text-xs text-muted-foreground text-right">
                  Created {selectedOffer.created_at ? new Date(selectedOffer.created_at).toLocaleDateString() : '—'}
                </p>

                {/* Send Offer action for draft */}
                {isDraft && (
                  <div className="border-t pt-4 space-y-2">
                    {sendError && <p className="text-sm text-destructive">{sendError}</p>}
                    <Button
                      className="w-full gap-2"
                      onClick={() => handleSendOffer(selectedOffer)}
                      disabled={sendLoading}
                    >
                      {sendLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      {sendLoading ? 'Sending...' : 'Send Offer Letter to Candidate'}
                    </Button>
                  </div>
                )}
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-destructive" />
              Delete Offer Letter
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete the draft offer letter for{' '}
              <span className="font-semibold text-foreground">
                {deleteTarget ? getCandidateName(deleteTarget.applicant_id) : ''}
              </span>
              ? This action cannot be undone.
            </p>
            {deleteTarget && (
              <div className="p-3 bg-muted rounded-lg text-sm">
                <p className="font-medium">{deleteTarget.position}</p>
                <p className="text-muted-foreground">{deleteTarget.department || '—'}</p>
              </div>
            )}
            {deleteError && <p className="text-sm text-destructive">{deleteError}</p>}
            <div className="flex gap-2">
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleDeleteOffer}
                disabled={deleteLoading}
              >
                {deleteLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Delete
              </Button>
              <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleteLoading}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
