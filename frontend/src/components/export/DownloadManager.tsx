/**
 * Download Manager Component
 * Manages and displays export downloads
 * Shows download progress and provides download links
 * 
 * Requirements: 26.9, 26.10
 */

import React, { useEffect } from 'react';
import { useExportStore, ExportJob } from '@/store/exportStore';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Download, X, CheckCircle, AlertCircle, Clock, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { revokeDownloadUrl } from '@/utils/largeExportUtils';

export interface DownloadManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getStatusColor = (status: ExportJob['status']) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'failed':
      return 'bg-red-100 text-red-800';
    case 'processing':
      return 'bg-blue-100 text-blue-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'cancelled':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusIcon = (status: ExportJob['status']) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="h-4 w-4" />;
    case 'failed':
      return <AlertCircle className="h-4 w-4" />;
    case 'processing':
      return <Loader2 className="h-4 w-4 animate-spin" />;
    case 'pending':
      return <Clock className="h-4 w-4" />;
    case 'cancelled':
      return <X className="h-4 w-4" />;
    default:
      return null;
  }
};

const DownloadItem: React.FC<{
  job: ExportJob;
  onDownload: (job: ExportJob) => void;
  onRemove: (id: string) => void;
}> = ({ job, onDownload, onRemove }) => {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-medium text-sm">{job.filename}</span>
          <Badge variant="outline" className={cn('text-xs', getStatusColor(job.status))}>
            <span className="flex items-center gap-1">
              {getStatusIcon(job.status)}
              {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
            </span>
          </Badge>
        </div>

        {/* Progress Bar */}
        {job.status === 'processing' && (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Processing...</span>
              <span className="text-xs font-medium">{job.progress}%</span>
            </div>
            <Progress value={job.progress} className="h-1.5" />
          </div>
        )}

        {/* Error Message */}
        {job.status === 'failed' && job.error && (
          <p className="text-xs text-red-600 mt-1">{job.error}</p>
        )}

        {/* Metadata */}
        <div className="text-xs text-muted-foreground mt-2">
          <span>{job.format.toUpperCase()}</span>
          <span className="mx-1">•</span>
          <span>{(job.dataSize / 1024).toFixed(2)} KB</span>
          <span className="mx-1">•</span>
          <span>{new Date(job.createdAt).toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 ml-4">
        {job.status === 'completed' && job.downloadUrl && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDownload(job)}
            className="gap-1"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Download</span>
          </Button>
        )}

        <Button
          size="sm"
          variant="ghost"
          onClick={() => onRemove(job.id)}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export const DownloadManager: React.FC<DownloadManagerProps> = ({ open, onOpenChange }) => {
  const { jobs, removeJob, clearCompletedJobs } = useExportStore();

  // Clean up URLs when component unmounts
  useEffect(() => {
    return () => {
      jobs.forEach((job) => {
        if (job.downloadUrl) {
          revokeDownloadUrl(job.downloadUrl);
        }
      });
    };
  }, [jobs]);

  const handleDownload = (job: ExportJob) => {
    if (!job.downloadUrl) return;

    const link = document.createElement('a');
    link.href = job.downloadUrl;
    link.setAttribute('download', job.filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRemove = (id: string) => {
    const job = jobs.find((j) => j.id === id);
    if (job?.downloadUrl) {
      revokeDownloadUrl(job.downloadUrl);
    }
    removeJob(id);
  };

  const activeJobs = jobs.filter((j) => j.status === 'processing' || j.status === 'pending');
  const completedJobs = jobs.filter((j) => j.status === 'completed' || j.status === 'failed');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Download Manager</DialogTitle>
          <DialogDescription>
            Manage your export downloads and track progress
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Active Downloads */}
          {activeJobs.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Active Downloads</h3>
              <div className="space-y-2">
                {activeJobs.map((job) => (
                  <DownloadItem
                    key={job.id}
                    job={job}
                    onDownload={handleDownload}
                    onRemove={handleRemove}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Completed Downloads */}
          {completedJobs.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">Completed Downloads</h3>
                {completedJobs.length > 0 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={clearCompletedJobs}
                    className="text-xs"
                  >
                    Clear All
                  </Button>
                )}
              </div>
              <div className="space-y-2">
                {completedJobs.map((job) => (
                  <DownloadItem
                    key={job.id}
                    job={job}
                    onDownload={handleDownload}
                    onRemove={handleRemove}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {jobs.length === 0 && (
            <div className="text-center py-8">
              <Download className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground">No downloads yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Your exports will appear here
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DownloadManager;
