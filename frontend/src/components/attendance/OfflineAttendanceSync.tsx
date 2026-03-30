import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Clock, Trash2 } from 'lucide-react';
import {
  getPendingAttendance,
  syncPendingAttendance,
  deletePendingAttendance,
  getOfflineAttendanceStatus,
  onAttendanceSynced,
} from '@/services/offlineAttendanceService';
import { isOnline } from '@/utils/pwaRegister';

interface PendingRecord {
  id?: number;
  employeeId: string;
  checkInTime: string;
  timestamp: number;
  synced: boolean;
}

export const OfflineAttendanceSync: React.FC = () => {
  const [pending, setPending] = useState<PendingRecord[]>([]);
  const [status, setStatus] = useState({ pending: 0, synced: 0, failed: 0, isOnline: true });
  const [syncing, setSyncing] = useState(false);
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    loadPendingAttendance();

    // Listen for sync events
    const unsubscribe = onAttendanceSynced(() => {
      loadPendingAttendance();
    });

    // Listen for online status changes
    const handleOnline = () => {
      setStatus((prev) => ({ ...prev, isOnline: true }));
      // Auto-sync when coming online
      syncAttendance();
    };

    const handleOffline = () => {
      setStatus((prev) => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadPendingAttendance = async () => {
    try {
      const records = await getPendingAttendance();
      setPending(records);

      const statusData = await getOfflineAttendanceStatus();
      setStatus(statusData);
    } catch (error) {
      console.error('Failed to load pending attendance:', error);
    }
  };

  const syncAttendance = async () => {
    if (syncing || !isOnline()) return;

    setSyncing(true);
    try {
      const result = await syncPendingAttendance();
      console.log('Sync result:', result);

      // Reload pending records
      await loadPendingAttendance();

      // Show success message
      if (result.synced > 0) {
        window.dispatchEvent(
          new CustomEvent('toast', {
            detail: {
              type: 'success',
              message: `${result.synced} attendance record(s) synced successfully`,
            },
          })
        );
      }

      if (result.failed > 0) {
        window.dispatchEvent(
          new CustomEvent('toast', {
            detail: {
              type: 'error',
              message: `${result.failed} attendance record(s) failed to sync`,
            },
          })
        );
      }
    } catch (error) {
      console.error('Sync failed:', error);
      window.dispatchEvent(
        new CustomEvent('toast', {
          detail: {
            type: 'error',
            message: 'Failed to sync attendance records',
          },
        })
      );
    } finally {
      setSyncing(false);
    }
  };

  const handleDelete = async (recordId?: number) => {
    if (!recordId) return;

    try {
      await deletePendingAttendance(recordId);
      await loadPendingAttendance();
      window.dispatchEvent(
        new CustomEvent('toast', {
          detail: {
            type: 'success',
            message: 'Attendance record deleted',
          },
        })
      );
    } catch (error) {
      console.error('Failed to delete record:', error);
    }
  };

  if (status.pending === 0 && status.synced === 0) {
    return null;
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: status.pending > 0 ? '#fbbf24' : '#10b981',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          zIndex: 9996,
          color: '#ffffff',
          fontSize: '20px',
          fontWeight: 600,
        }}
        title={`${status.pending} pending attendance records`}
      >
        {status.pending > 0 ? status.pending : '✓'}
      </button>

      {/* Panel */}
      {showPanel && (
        <div
          style={{
            position: 'fixed',
            bottom: '90px',
            left: '20px',
            width: '360px',
            maxHeight: '500px',
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            zIndex: 9996,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '16px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#0a0a0a' }}>
              Offline Attendance
            </h3>
            <button
              onClick={() => setShowPanel(false)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '20px',
                color: '#6b7280',
              }}
            >
              ×
            </button>
          </div>

          {/* Status */}
          <div style={{ padding: '12px 16px', backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', gap: '16px', fontSize: '14px' }}>
              <div>
                <div style={{ color: '#6b7280', marginBottom: '4px' }}>Pending</div>
                <div style={{ fontSize: '18px', fontWeight: 600, color: '#fbbf24' }}>{status.pending}</div>
              </div>
              <div>
                <div style={{ color: '#6b7280', marginBottom: '4px' }}>Synced</div>
                <div style={{ fontSize: '18px', fontWeight: 600, color: '#10b981' }}>{status.synced}</div>
              </div>
              <div>
                <div style={{ color: '#6b7280', marginBottom: '4px' }}>Status</div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: status.isOnline ? '#10b981' : '#ef4444' }}>
                  {status.isOnline ? 'Online' : 'Offline'}
                </div>
              </div>
            </div>
          </div>

          {/* Records */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
            {pending.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
                <p style={{ margin: 0, fontSize: '14px' }}>No pending records</p>
              </div>
            ) : (
              pending.map((record) => (
                <div
                  key={record.id}
                  style={{
                    padding: '12px',
                    marginBottom: '8px',
                    backgroundColor: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 500, color: '#0a0a0a', marginBottom: '4px' }}>
                      {record.employeeId}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} />
                      {new Date(record.checkInTime).toLocaleTimeString()}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {record.synced ? (
                      <CheckCircle2 size={18} style={{ color: '#10b981' }} />
                    ) : (
                      <AlertCircle size={18} style={{ color: '#fbbf24' }} />
                    )}
                    <button
                      onClick={() => handleDelete(record.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#ef4444',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                      title="Delete record"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              padding: '12px 16px',
              borderTop: '1px solid #e5e7eb',
              display: 'flex',
              gap: '8px',
            }}
          >
            <button
              onClick={syncAttendance}
              disabled={syncing || !status.isOnline || status.pending === 0}
              style={{
                flex: 1,
                padding: '8px 12px',
                backgroundColor: status.isOnline && status.pending > 0 ? '#000000' : '#d1d5db',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: status.isOnline && status.pending > 0 ? 'pointer' : 'not-allowed',
                color: '#ffffff',
              }}
            >
              {syncing ? 'Syncing...' : 'Sync Now'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
