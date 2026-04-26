/**
 * Export Button Component
 * Reusable button for triggering data export with dialog
 * 
 * Requirements: 26.1, 26.2, 26.3, 26.4
 */

import React, { useState } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { ExportDialog } from './ExportDialog';
import { useToast } from '@/hooks/useToast';

export interface ExportButtonProps extends Omit<ButtonProps, 'onClick'> {
  data: any[];
  filename: string;
  title?: string;
  disabled?: boolean;
  showIcon?: boolean;
  showLabel?: boolean;
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  data,
  filename,
  title = 'Export Data',
  disabled = false,
  showIcon = true,
  showLabel = true,
  ...buttonProps
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleExportError = (error: Error) => {
    toast({
      type: 'error',
      message: `Export failed: ${error.message}`,
    });
  };

  const handleExportComplete = () => {
    toast({
      type: 'success',
      message: 'Data exported successfully',
    });
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
        {showIcon && <Download className="h-4 w-4" />}
        {showLabel && 'Export'}
      </Button>

      <ExportDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        data={data}
        filename={filename}
        title={title}
        onExportError={handleExportError}
        onExportComplete={handleExportComplete}
      />
    </>
  );
};

export default ExportButton;
