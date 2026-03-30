import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { useGeoTrackingStore } from '../../store/geoTrackingStore';
import { CheckCircle2, XCircle, MapPin } from 'lucide-react';

const formatDate = (date: Date | string, format: string): string => {
  const d = new Date(date);
  if (format === 'MMM dd, yyyy') {
    return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  }
  if (format === 'MMM dd, yyyy HH:mm') {
    return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) + ' ' +
           d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  }
  return d.toString();
};

const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};

interface TravelApprovalProps {
  managerId: string;
}

export const TravelApproval: React.FC<TravelApprovalProps> = ({ managerId }) => {
  const [selectedJourney, setSelectedJourney] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [selectedJourneys, setSelectedJourneys] = useState<Set<string>>(new Set());

  const {
    pendingApprovals,
    loadingApprovals,
    fetchPendingApprovals,
    approveJourney,
    rejectJourney,
  } = useGeoTrackingStore();

  useEffect(() => {
    fetchPendingApprovals();
  }, [fetchPendingApprovals]);

  const handleApprove = async () => {
    if (!selectedJourney) return;
    try {
      await approveJourney(selectedJourney.id, managerId, approvalNotes);
      setShowDetails(false);
      setApprovalNotes('');
      setActionType(null);
      await fetchPendingApprovals();
    } catch (error) {
      console.error('Approval failed:', error);
    }
  };

  const handleReject = async () => {
    if (!selectedJourney) return;
    try {
      await rejectJourney(selectedJourney.id, managerId, rejectionReason);
      setShowDetails(false);
      setRejectionReason('');
      setActionType(null);
      await fetchPendingApprovals();
    } catch (error) {
      console.error('Rejection failed:', error);
    }
  };

  const handleBulkApprove = async () => {
    try {
      for (const journeyId of selectedJourneys) {
        await approveJourney(journeyId, managerId);
      }
      setSelectedJourneys(new Set());
      await fetchPendingApprovals();
    } catch (error) {
      console.error('Bulk approval failed:', error);
    }
  };

  const toggleJourneySelection = (journeyId: string) => {
    const newSelected = new Set(selectedJourneys);
    if (newSelected.has(journeyId)) {
      newSelected.delete(journeyId);
    } else {
      newSelected.add(journeyId);
    }
    setSelectedJourneys(newSelected);
  };

  const totalPendingDistance = pendingApprovals.reduce(
    (sum, log) => sum + log.totalDistance,
    0
  );
  const totalPendingAllowance = pendingApprovals.reduce(
    (sum, log) => sum + log.travelAllowance,
    0
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            Travel Approval
          </CardTitle>
          <CardDescription>Approve or reject team member travel logs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">Pending Approvals</p>
              <p className="text-2xl font-bold">{pendingApprovals.length}</p>
            </div>

            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">Total Distance</p>
              <p className="text-2xl font-bold">{totalPendingDistance.toFixed(1)} km</p>
            </div>

            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">Total Allowance</p>
              <p className="text-2xl font-bold">₹{totalPendingAllowance.toFixed(2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Pending Travel Logs</CardTitle>
          </div>
          {selectedJourneys.size > 0 && (
            <Button onClick={handleBulkApprove} className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Approve Selected ({selectedJourneys.size})
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {loadingApprovals ? (
            <div className="text-center py-8 text-muted-foreground">Loading approvals...</div>
          ) : pendingApprovals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No pending travel logs for approval
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-2 px-2 w-12">
                      <input
                        type="checkbox"
                        checked={selectedJourneys.size === pendingApprovals.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedJourneys(
                              new Set(pendingApprovals.map((j) => j.id))
                            );
                          } else {
                            setSelectedJourneys(new Set());
                          }
                        }}
                        className="rounded border-input"
                      />
                    </th>
                    <th className="text-left py-2 px-2">Employee</th>
                    <th className="text-left py-2 px-2">Date</th>
                    <th className="text-left py-2 px-2">Distance</th>
                    <th className="text-left py-2 px-2">Duration</th>
                    <th className="text-left py-2 px-2">Allowance</th>
                    <th className="text-left py-2 px-2">Purpose</th>
                    <th className="text-left py-2 px-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingApprovals.map((log) => (
                    <tr key={log.id} className="border-b hover:bg-muted/50">
                      <td className="py-2 px-2">
                        <input
                          type="checkbox"
                          checked={selectedJourneys.has(log.id)}
                          onChange={() => toggleJourneySelection(log.id)}
                          className="rounded border-input"
                        />
                      </td>
                      <td className="font-medium py-2 px-2">
                        {log.employeeId}
                      </td>
                      <td className="text-sm py-2 px-2">
                        {formatDate(new Date(log.startTime), 'MMM dd, yyyy')}
                      </td>
                      <td className="py-2 px-2">{log.totalDistance.toFixed(1)} km</td>
                      <td className="py-2 px-2">{formatDuration(log.totalDuration)}</td>
                      <td className="font-semibold py-2 px-2">
                        ₹{log.travelAllowance.toFixed(2)}
                      </td>
                      <td className="text-sm py-2 px-2">
                        {log.purpose || '-'}
                      </td>
                      <td className="py-2 px-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedJourney(log);
                            setShowDetails(true);
                            setActionType(null);
                          }}
                        >
                          Review
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {showDetails && selectedJourney && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>Review Travel Log</CardTitle>
              <CardDescription>
                {formatDate(new Date(selectedJourney.startTime), 'MMM dd, yyyy HH:mm')}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Employee ID</p>
                  <p className="font-medium">{selectedJourney.employeeId}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">
                    {formatDate(new Date(selectedJourney.startTime), 'MMM dd, yyyy')}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Start Location</p>
                  <p className="font-medium">{selectedJourney.startLocation.address || 'N/A'}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">End Location</p>
                  <p className="font-medium">{selectedJourney.endLocation.address || 'N/A'}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Total Distance</p>
                  <p className="text-lg font-semibold">{selectedJourney.totalDistance.toFixed(1)} km</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="text-lg font-semibold">
                    {formatDuration(selectedJourney.totalDuration)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Travel Allowance</p>
                  <p className="text-lg font-semibold">
                    ₹{selectedJourney.travelAllowance.toFixed(2)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Purpose</p>
                  <p className="font-medium">{selectedJourney.purpose || '-'}</p>
                </div>
              </div>

              {!actionType ? (
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() => setActionType('approve')}
                    className="gap-2 flex-1"
                    variant="default"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Approve
                  </Button>
                  <Button
                    onClick={() => setActionType('reject')}
                    className="gap-2 flex-1"
                    variant="destructive"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </Button>
                </div>
              ) : actionType === 'approve' ? (
                <div className="space-y-3 pt-4 border-t">
                  <div>
                    <label className="text-sm font-medium">Approval Notes (Optional)</label>
                    <Textarea
                      placeholder="Add any notes for the employee..."
                      value={approvalNotes}
                      onChange={(e) => setApprovalNotes(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleApprove} className="flex-1">
                      Confirm Approval
                    </Button>
                    <Button
                      onClick={() => {
                        setActionType(null);
                        setApprovalNotes('');
                      }}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 pt-4 border-t">
                  <div>
                    <label className="text-sm font-medium">Rejection Reason</label>
                    <Textarea
                      placeholder="Please provide a reason for rejection..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleReject} variant="destructive" className="flex-1">
                      Confirm Rejection
                    </Button>
                    <Button
                      onClick={() => {
                        setActionType(null);
                        setRejectionReason('');
                      }}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button onClick={() => setShowDetails(false)} variant="outline" className="flex-1">
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
