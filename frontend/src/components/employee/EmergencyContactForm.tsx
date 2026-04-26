import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Save, Plus, Trash2 } from 'lucide-react';
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

export const EmergencyContactForm: React.FC<EmergencyContactFormProps> = ({
  employeeId,
  readOnly = false,
  maxContacts = 3,
}) => {
  interface ContactFieldErrors { name?: string; relationship?: string; phone?: string; email?: string; }

  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [errors, setErrors] = useState<Record<number, ContactFieldErrors>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!employeeId) return;
    setIsFetching(true);
    apiClient
      .get(`/employees/${employeeId}/emergency-contacts`)
      .then((res) => setContacts(res.data?.data ?? res.data ?? []))
      .catch(() => setContacts([]))
      .finally(() => setIsFetching(false));
  }, [employeeId]);

  const validateContact = (contact: EmergencyContact, index: number): boolean => {
    const contactErrors: ContactFieldErrors = {};
    if (!contact.name?.trim()) contactErrors.name = 'Name is required';
    if (!contact.relationship?.trim()) contactErrors.relationship = 'Relationship is required';
    if (!contact.phone?.trim()) {
      contactErrors.phone = 'Phone is required';
    } else if (!/^\d{10,}$/.test(contact.phone.replace(/\D/g, ''))) {
      contactErrors.phone = 'Invalid phone number';
    }
    if (contact.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) {
      contactErrors.email = 'Invalid email format';
    }
    if (Object.keys(contactErrors).length > 0) {
      setErrors((prev) => ({ ...prev, [index]: contactErrors }));
      return false;
    }
    return true;
  };

  const handleAddContact = () => {
    if (contacts.length < maxContacts) {
      setContacts([...contacts, { name: '', relationship: '', phone: '', email: '', address: '', priority: contacts.length + 1 }]);
    }
  };

  const handleRemoveContact = async (index: number) => {
    const contact = contacts[index];
    if (contact?.id) {
      try {
        await apiClient.delete(`/employees/${employeeId}/emergency-contacts/${contact.id}`);
      } catch {
        // ignore — remove locally anyway
      }
    }
    setContacts(contacts.filter((_, i) => i !== index));
    const newErrors = { ...errors };
    delete newErrors[index];
    setErrors(newErrors);
  };

  const handleContactChange = (index: number, field: keyof EmergencyContact, value: string | number) => {
    const updated = [...contacts];
    if (!updated[index]) return;
    updated[index] = { ...updated[index]!, [field]: value };
    setContacts(updated);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let isValid = true;
    for (let i = 0; i < contacts.length; i++) {
      const contact = contacts[i];
      if (contact && !validateContact(contact, i)) isValid = false;
    }
    if (!isValid || contacts.length === 0) return;

    setIsLoading(true);
    try {
      const saved: EmergencyContact[] = [];
      for (const contact of contacts) {
        if (contact.id) {
          const res = await apiClient.put(`/employees/${employeeId}/emergency-contacts/${contact.id}`, contact);
          saved.push(res.data?.data ?? res.data);
        } else {
          const res = await apiClient.post(`/employees/${employeeId}/emergency-contacts`, contact);
          saved.push(res.data?.data ?? res.data);
        }
      }
      setContacts(saved);
      setSaveMessage('Saved successfully');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch {
      setSaveMessage('Failed to save. Please try again.');
      setTimeout(() => setSaveMessage(null), 4000);
    } finally {
      setIsLoading(false);
    }
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
      <CardHeader>
        <CardTitle>Emergency Contacts</CardTitle>
        <CardDescription>
          {readOnly ? 'Emergency contacts on file.' : `Add up to ${maxContacts} emergency contacts.`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {contacts.map((contact, index) => (
            <div key={contact.id ?? index} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between mb-3">
                <Badge variant="secondary">Contact {index + 1}</Badge>
                {!readOnly && contacts.length > 0 && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveContact(index)} className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Name {!readOnly && '*'}</label>
                  <Input value={contact.name} onChange={(e) => handleContactChange(index, 'name', e.target.value)} placeholder="John Doe" disabled={readOnly} className={errors[index]?.name ? 'border-destructive' : ''} />
                  {errors[index]?.name && <p className="text-sm text-destructive mt-1">{errors[index].name}</p>}
                </div>

                <div>
                  <label className="text-sm font-medium">Relationship {!readOnly && '*'}</label>
                  {readOnly ? (
                    <p className="mt-1 font-medium">{contact.relationship}</p>
                  ) : (
                    <select value={contact.relationship} onChange={(e) => handleContactChange(index, 'relationship', e.target.value)} className={`w-full px-3 py-2 border rounded-md bg-background ${errors[index]?.relationship ? 'border-destructive' : 'border-input'}`}>
                      <option value="">Select relationship</option>
                      {['Spouse', 'Parent', 'Child', 'Sibling', 'Friend', 'Other'].map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  )}
                  {errors[index]?.relationship && <p className="text-sm text-destructive mt-1">{errors[index].relationship}</p>}
                </div>

                <div>
                  <label className="text-sm font-medium">Phone {!readOnly && '*'}</label>
                  <Input value={contact.phone} onChange={(e) => handleContactChange(index, 'phone', e.target.value)} placeholder="+1 (555) 000-0000" disabled={readOnly} className={errors[index]?.phone ? 'border-destructive' : ''} />
                  {errors[index]?.phone && <p className="text-sm text-destructive mt-1">{errors[index].phone}</p>}
                </div>

                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input type="email" value={contact.email ?? ''} onChange={(e) => handleContactChange(index, 'email', e.target.value)} placeholder="john@example.com" disabled={readOnly} className={errors[index]?.email ? 'border-destructive' : ''} />
                  {errors[index]?.email && <p className="text-sm text-destructive mt-1">{errors[index].email}</p>}
                </div>

                <div className="col-span-2">
                  <label className="text-sm font-medium">Address</label>
                  <Input value={contact.address ?? ''} onChange={(e) => handleContactChange(index, 'address', e.target.value)} placeholder="123 Main Street, City, State" disabled={readOnly} />
                </div>
              </div>
            </div>
          ))}

          {contacts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No emergency contacts on file.</p>
              {!readOnly && (
                <Button type="button" variant="outline" onClick={handleAddContact} className="mt-4 gap-2">
                  <Plus className="h-4 w-4" />
                  Add First Contact
                </Button>
              )}
            </div>
          )}

          {!readOnly && contacts.length < maxContacts && contacts.length > 0 && (
            <Button type="button" variant="outline" onClick={handleAddContact} className="w-full gap-2">
              <Plus className="h-4 w-4" />
              Add Emergency Contact
            </Button>
          )}

          {saveMessage && (
            <p className={`text-sm text-center ${saveMessage.startsWith('Failed') ? 'text-destructive' : 'text-green-600'}`}>
              {saveMessage}
            </p>
          )}

          {!readOnly && contacts.length > 0 && (
            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button type="submit" disabled={isLoading} className="gap-2">
                <Save className="h-4 w-4" />
                {isLoading ? 'Saving…' : 'Save Contacts'}
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};
