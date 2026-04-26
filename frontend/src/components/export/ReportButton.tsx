/**
 * Report Button Component
 * Reusable button for triggering report generation with dialog
 * 
 * Requirements: 26.5, 26.6, 26.7, 26.8
 */

import React, { useState } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { ReportGenerator } from './ReportGenerator';
import { ReportColumn } from '@/utils/reportGenerator';
import { useToast } from '@/hooks/useToast';

export interface ReportButtonProps extends Omit<ButtonProps, 'onClick'> {
  title: string;
  description?: string;
  data: any[];
  columns: ReportColumn[];
  filters?: Record<string, any>;
  summary?: { label: string; value: string | number }[];
  pageSize?: 'A4' | 'Letter';
  disabled?: boolean;
  showIcon?: boolean;
  showLabel?: boolean;
  onGenerateStart?: () => void;
  onGenerateComplete?: () => void;
  onGenerateError?: (error: Error) => void;
}

export const ReportButton: React.FC<ReportButtonProps> = ({
  title,
  description,
  data,
  columns,
  filters,
  summary,
  pageSize = 'A4',
  disabled = false,
  showIcon = true,
  showLabel = true,
  onGenerateStart,
  onGenerateComplete,
  onGenerateError,
  ...buttonProps
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleGenerateError = (error: Error) => {
    toast({
      type: 'error',
      message: `Report generation failed: ${error.message}`,
    });
    onGenerateError?.(error);
  };

  const handleGenerateComplete = () => {
    toast({
      type: 'success',
      message: 'Report generated successfully',
    });
    onGenerateComplete?.();
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setDialogOpen(true)}
        disabled={disabled || data.length === 0}
        className="gap-2"
        {...buttonProps}
      >
        {showIcon && <FileText className="h-4 w-4" />}
        {showLabel && 'Generate Report'}
      </Button>

      <ReportGenerator
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={title}
        description={description}
        data={data}
        columns={columns}
        filters={filters}
        summary={summary}
        pageSize={pageSize}
        onGenerateStart={onGenerateStart}
        onGenerateComplete={handleGenerateComplete}
        onGenerateError={handleGenerateError}
      />
    </>
  );
};

export default ReportButton;
