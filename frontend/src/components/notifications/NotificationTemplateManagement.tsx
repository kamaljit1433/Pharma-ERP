import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import notificationService, { NotificationTemplate, CreateTemplateDTO, UpdateTemplateDTO } from '../../services/notificationService';

interface NotificationTemplateManagementProps {
  className?: string;
}

export const NotificationTemplateManagement: React.FC<NotificationTemplateManagementProps> = ({ className = '' }) => {
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateTemplateDTO>({
    name: '',
    subject: '',
    body: '',
    channel: 'in_app',
    is_active: true,
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await notificationService.getTemplates(false);
      setTemplates(response.data);
    } catch (err) {
      setError('Failed to load templates');
      console.error('Error fetching templates:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (template?: NotificationTemplate) => {
    if (template) {
      setEditingTemplate(template);
      setFormData({
        name: template.name,
        subject: template.subject,
        body: template.body,
        channel: template.channel,
        variables: template.variables,
        is_active: template.is_active,
      });
    } else {
      setEditingTemplate(null);
      setFormData({
        name: '',
        subject: '',
        body: '',
        channel: 'in_app',
        is_active: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingTemplate(null);
  };

  const handleSaveTemplate = async () => {
    if (!formData.name || !formData.subject || !formData.body) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setError(null);
      if (editingTemplate) {
        const updated = await notificationService.updateTemplate(editingTemplate.id, formData as UpdateTemplateDTO);
        setTemplates(prev =>
          prev.map(t => (t.id === updated.id ? updated : t))
        );
      } else {
        const created = await notificationService.createTemplate(formData);
        setTemplates(prev => [created, ...prev]);
      }
      handleCloseDialog();
    } catch (err) {
      setError(editingTemplate ? 'Failed to update template' : 'Failed to create template');
      console.error('Error saving template:', err);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      setError(null);
      await notificationService.deleteTemplate(templateId);
      setTemplates(prev => prev.filter(t => t.id !== templateId));
      setDeleteConfirmId(null);
    } catch (err) {
      setError('Failed to delete template');
      console.error('Error deleting template:', err);
    }
  };

  const getChannelBadgeColor = (channel: string) => {
    switch (channel) {
      case 'email':
        return 'bg-info text-info-foreground';
      case 'push':
        return 'bg-warning text-warning-foreground';
      case 'in_app':
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className={`w-full max-w-4xl ${className}`}>
      <Card className="border-border">
        <CardHeader className="border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-foreground">Notification Templates</CardTitle>
              <CardDescription className="text-muted-foreground">
                Manage notification templates for system events
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => handleOpenDialog()} className="gap-2">
                  <Plus className="w-4 h-4" />
                  New Template
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingTemplate ? 'Edit Template' : 'Create Template'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingTemplate
                      ? 'Update the notification template details'
                      : 'Create a new notification template'}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  {error && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md flex gap-2 text-sm text-destructive">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-foreground">
                      Template Name *
                    </Label>
                    <Input
                      id="name"
                      placeholder="e.g., Leave Approved"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="border-border"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="channel" className="text-foreground">
                      Channel *
                    </Label>
                    <Select
                      value={formData.channel}
                      onValueChange={value => setFormData({ ...formData, channel: value as any })}
                    >
                      <SelectTrigger className="border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="in_app">In-App</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="push">Push Notification</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-foreground">
                      Subject *
                    </Label>
                    <Input
                      id="subject"
                      placeholder="e.g., Your leave request has been approved"
                      value={formData.subject}
                      onChange={e => setFormData({ ...formData, subject: e.target.value })}
                      className="border-border"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="body" className="text-foreground">
                      Body *
                    </Label>
                    <Textarea
                      id="body"
                      placeholder="e.g., Your leave request for {{date}} has been approved by {{approver}}"
                      value={formData.body}
                      onChange={e => setFormData({ ...formData, body: e.target.value })}
                      className="border-border min-h-24"
                    />
                    <p className="text-xs text-muted-foreground">
                      Use {{variable}} syntax for dynamic content
                    </p>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={handleCloseDialog}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveTemplate}
                      className="flex-1"
                    >
                      {editingTemplate ? 'Update' : 'Create'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {error && !isDialogOpen && (
            <div className="p-4 bg-destructive/10 border-b border-border text-destructive text-sm flex gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : templates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="w-12 h-12 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No templates yet</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {templates.map(template => (
                <div
                  key={template.id}
                  className="p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium text-foreground">{template.name}</h3>
                        <Badge className={`text-xs ${getChannelBadgeColor(template.channel)}`}>
                          {template.channel.replace('_', ' ')}
                        </Badge>
                        {!template.is_active && (
                          <Badge variant="secondary" className="text-xs">
                            Inactive
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{template.subject}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">{template.body}</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDialog(template)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteConfirmId(template.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteConfirmId !== null} onOpenChange={open => !open && setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this template? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirmId && handleDeleteTemplate(deleteConfirmId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
