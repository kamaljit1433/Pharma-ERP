import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { Save, Plus, Trash2, Pencil, ChevronDown, Phone, User } from 'lucide-react';
import apiClient from '../../services/api';

interface EmergencyContact {
  id?: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  address?: string;
  priority?: number;
}

interface EmergencyContactFormProps {
  employeeId: string;
  readOnly?: boolean;
  maxContacts?: number;
}

interface ContactFieldErrors {
  name?: string;
  relationship?: string;
  phone?: string;
  email?: string;
}

const RELATIONSHIPS = ['Spouse', 'Parent', 'Child', 'Sibling', 'Friend', 'Other'];

export const EmergencyContactForm: React.FC<EmergencyContactFormProps> = ({
  employeeId,
  readOnly = false,
  maxContacts = 3,
}) => {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<number, ContactFieldErrors>>({});
  const [savingIndex, setSavingIndex] = useState<number | null>(null);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ index: number; name: string } | null>(null);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    if (!employeeId) return;
    setIsFetching(true);
    apiClient
      .get(`/employees/${employeeId}/emergency-contacts`)
      .then((res) => setContacts(res.data?.data ?? res.data ?? []))
      .catch(() => setContacts([]))
      .finally(() => setIsFetching(false));
  }, [employeeId]);

  const validate = (contact: EmergencyContact, index: number): boolean => {
    const e: ContactFieldErrors = {};
    if (!contact.name?.trim()) e.name = 'Name is required';
    if (!contact.relationship?.trim()) e.relationship = 'Relationship is required';
    if (!contact.phone?.trim()) {
      e.phone = 'Phone is required';
    } else if (!/^\d{10,}$/.test(contact.phone.replace(/\D/g, ''))) {
      e.phone = 'Invalid phone number';
    }
    if (contact.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) {
      e.email = 'Invalid email format';
    }
    if (Object.keys(e).length > 0) {
      setErrors((prev) => ({ ...prev, [index]: e }));
      return false;
    }
    return true;
  };

  const handleAdd = () => {
    const newContact: EmergencyContact = {
      name: '',
      relationship: '',
      phone: '',
      email: '',
      address: '',
      priority: contacts.length + 1,
    };
    setContacts((prev) => [...prev, newContact]);
    setExpandedIndex(contacts.length);
  };

  const handleChange = (index: number, field: keyof EmergencyContact, value: string) => {
    setContacts((prev) => prev.map((c, i) => (i === index ? { ...c, [field]: value } : c)));
    const errorKey = field as keyof ContactFieldErrors;
    if (errors[index]?.[errorKey]) {
      setErrors((prev) => {
        const next = { ...prev };
        if (next[index]) {
          delete next[index][errorKey];
          if (Object.keys(next[index]).length === 0) delete next[index];
        }
        return next;
      });
    }
  };

  const handleSave = async (index: number) => {
    const contact = contacts[index];
    if (!contact || !validate(contact, index)) return;

    setSavingIndex(index);
    try {
      if (contact.id) {
        const res = await apiClient.put(
          `/employees/${employeeId}/emergency-contacts/${contact.id}`,
          contact
        );
        const saved = res.data?.data ?? res.data;
        setContacts((prev) => prev.map((c, i) => (i === index ? saved : c)));
      } else {
        const res = await apiClient.post(
          `/employees/${employeeId}/emergency-contacts`,
          contact
        );
        const saved = res.data?.data ?? res.data;
        setContacts((prev) => prev.map((c, i) => (i === index ? saved : c)));
      }
      setExpandedIndex(null);
    } catch {
      setErrors((prev) => ({
        ...prev,
        [index]: { name: 'Failed to save. Please try again.' },
      }));
    } finally {
      setSavingIndex(null);
    }
  };

  const handleDelete = (index: number) => {
    const contact = contacts[index];
    setDeleteTarget({ index, name: contact?.name || 'this contact' });
  };

  const executeDelete = async () => {
    if (deleteTarget === null) return;
    const { index } = deleteTarget;
    const contact = contacts[index];
    setDeleteTarget(null);
    setDeletingIndex(index);
    try {
      if (contact?.id) {
        await apiClient.delete(
          `/employees/${employeeId}/emergency-contacts/${contact.id}`
        );
      }
      setContacts((prev) => prev.filter((_, i) => i !== index));
      if (expandedIndex === index) setExpandedIndex(null);
      else if (expandedIndex !== null && expandedIndex > index)
        setExpandedIndex(expandedIndex - 1);
      setErrors((prev) => {
        const next = { ...prev };
        delete next[index];
        return next;
      });
    } catch {
      // ignore — entry stays
    } finally {
      setDeletingIndex(null);
    }
  };

  const handleCancel = (index: number) => {
    const contact = contacts[index];
    if (!contact?.id) {
      // unsaved new entry — remove it
      setContacts((prev) => prev.filter((_, i) => i !== index));
    }
    setExpandedIndex(null);
    setErrors((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
  };

  if (isFetching) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground text-center">Loading emergency contacts…</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>Emergency Contacts</CardTitle>
          <CardDescription>
            {readOnly
              ? 'Emergency contacts on file.'
              : `Up to ${maxContacts} emergency contacts.`}
          </CardDescription>
        </div>
        {!readOnly && contacts.length < maxContacts && expandedIndex === null && (
          <Button type="button" variant="outline" size="sm" onClick={handleAdd} className="gap-1 shrink-0">
            <Plus className="h-4 w-4" />
            Add Contact
          </Button>
        )}
      </CardHeader>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove emergency contact?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{deleteTarget?.name}&rdquo; will be permanently removed. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={executeDelete}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <CardContent className="space-y-3">
        {contacts.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <p className="text-sm">No emergency contacts on file.</p>
            {!readOnly && (
              <Button type="button" variant="outline" size="sm" onClick={handleAdd} className="mt-3 gap-1">
                <Plus className="h-4 w-4" />
                Add First Contact
              </Button>
            )}
          </div>
        )}

        {contacts.map((contact, index) => {
          const isExpanded = expandedIndex === index;
          const isSaving = savingIndex === index;
          const isDeleting = deletingIndex === index;

          return (
            <div key={contact.id ?? `new-${index}`} className="border rounded-lg overflow-hidden">
              {/* Collapsed summary row */}
              {!isExpanded && (
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted shrink-0">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">{contact.name || '—'}</span>
                      {contact.relationship && (
                        <Badge variant="secondary" className="text-xs shrink-0">
                          {contact.relationship}
                        </Badge>
                      )}
                    </div>
                    {contact.phone && (
                      <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        <span>{contact.phone}</span>
                      </div>
                    )}
                  </div>
                  {!readOnly && (
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedIndex(index)}
                        className="h-7 w-7 p-0"
                        title="Edit"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(index)}
                        disabled={isDeleting}
                        className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Expanded edit form */}
              {isExpanded && (
                <div className="p-4 space-y-3 bg-muted/30">
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant="secondary">Contact {index + 1}</Badge>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCancel(index)}
                      className="h-7 w-7 p-0"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium mb-1 block">Name *</label>
                      <Input
                        value={contact.name}
                        onChange={(e) => handleChange(index, 'name', e.target.value)}
                        placeholder="Jane Doe"
                        className={errors[index]?.name ? 'border-destructive' : ''}
                      />
                      {errors[index]?.name && (
                        <p className="text-xs text-destructive mt-1">{errors[index].name}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-medium mb-1 block">Relationship *</label>
                      <select
                        value={contact.relationship}
                        onChange={(e) => handleChange(index, 'relationship', e.target.value)}
                        className={`w-full px-3 py-2 text-sm border rounded-md bg-background ${
                          errors[index]?.relationship ? 'border-destructive' : 'border-input'
                        }`}
                      >
                        <option value="">Select…</option>
                        {RELATIONSHIPS.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                      {errors[index]?.relationship && (
                        <p className="text-xs text-destructive mt-1">{errors[index].relationship}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-medium mb-1 block">Phone *</label>
                      <Input
                        value={contact.phone}
                        onChange={(e) => handleChange(index, 'phone', e.target.value)}
                        placeholder="+91 98765 43210"
                        className={errors[index]?.phone ? 'border-destructive' : ''}
                      />
                      {errors[index]?.phone && (
                        <p className="text-xs text-destructive mt-1">{errors[index].phone}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-medium mb-1 block">Email</label>
                      <Input
                        type="email"
                        value={contact.email ?? ''}
                        onChange={(e) => handleChange(index, 'email', e.target.value)}
                        placeholder="jane@example.com"
                        className={errors[index]?.email ? 'border-destructive' : ''}
                      />
                      {errors[index]?.email && (
                        <p className="text-xs text-destructive mt-1">{errors[index].email}</p>
                      )}
                    </div>

                    <div className="col-span-2">
                      <label className="text-xs font-medium mb-1 block">Address</label>
                      <Input
                        value={contact.address ?? ''}
                        onChange={(e) => handleChange(index, 'address', e.target.value)}
                        placeholder="123 Main Street, City"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(index)}
                      disabled={isDeleting}
                      className="text-destructive hover:text-destructive gap-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      {isDeleting ? 'Removing…' : 'Remove'}
                    </Button>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancel(index)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleSave(index)}
                        disabled={isSaving}
                        className="gap-1"
                      >
                        <Save className="h-3.5 w-3.5" />
                        {isSaving ? 'Saving…' : 'Save'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
