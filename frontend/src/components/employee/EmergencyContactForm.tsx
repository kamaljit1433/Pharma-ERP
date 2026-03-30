import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Save, X, Plus, Trash2 } from 'lucide-react';

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
  contacts: EmergencyContact[];
  onSave: (contacts: EmergencyContact[]) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  maxContacts?: number;
}

export const EmergencyContactForm: React.FC<EmergencyContactFormProps> = ({
  contacts: initialContacts,
  onSave,
  onCancel,
  isLoading = false,
  maxContacts = 3,
}) => {
  const [contacts, setContacts] = useState<EmergencyContact[]>(initialContacts);
  const [errors, setErrors] = useState<Record<number, Record<string, string>>>({});

  const validateContact = (contact: EmergencyContact, index: number): boolean => {
    const contactErrors: Record<string, string> = {};

    if (!contact.name.trim()) {
      contactErrors.name = 'Name is required';
    }
    if (!contact.relationship.trim()) {
      contactErrors.relationship = 'Relationship is required';
    }
    if (!contact.phone.trim()) {
      contactErrors.phone = 'Phone is required';
    } else if (!/^\d{10,}$/.test(contact.phone.replace(/\D/g, ''))) {
      contactErrors.phone = 'Invalid phone number';
    }
    if (contact.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) {
      contactErrors.email = 'Invalid email format';
    }

    if (Object.keys(contactErrors).length > 0) {
      setErrors((prev) => ({
        ...prev,
        [index]: contactErrors,
      }));
      return false;
    }

    return true;
  };

  const handleAddContact = () => {
    if (contacts.length < maxContacts) {
      setContacts([
        ...contacts,
        {
          name: '',
          relationship: '',
          phone: '',
          email: '',
          address: '',
          priority: contacts.length + 1,
        },
      ]);
    }
  };

  const handleRemoveContact = (index: number) => {
    setContacts(contacts.filter((_, i) => i !== index));
    const newErrors = { ...errors };
    delete newErrors[index];
    setErrors(newErrors);
  };

  const handleContactChange = (
    index: number,
    field: keyof EmergencyContact,
    value: string | number
  ) => {
    const newContacts = [...contacts];
    newContacts[index] = {
      ...newContacts[index],
      [field]: value,
    };
    setContacts(newContacts);

    // Clear error for this field
    if (errors[index]?.[field as string]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        if (newErrors[index]) {
          delete newErrors[index][field as string];
          if (Object.keys(newErrors[index]).length === 0) {
            delete newErrors[index];
          }
        }
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all contacts
    let isValid = true;
    for (let i = 0; i < contacts.length; i++) {
      if (!validateContact(contacts[i], i)) {
        isValid = false;
      }
    }

    if (isValid && contacts.length > 0) {
      await onSave(contacts);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Emergency Contacts</CardTitle>
        <CardDescription>
          Add up to {maxContacts} emergency contacts for this employee
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {contacts.map((contact, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between mb-3">
                <Badge variant="secondary">Contact {index + 1}</Badge>
                {contacts.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveContact(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Name *</label>
                  <Input
                    value={contact.name}
                    onChange={(e) => handleContactChange(index, 'name', e.target.value)}
                    placeholder="John Doe"
                    className={errors[index]?.name ? 'border-destructive' : ''}
                  />
                  {errors[index]?.name && (
                    <p className="text-sm text-destructive mt-1">{errors[index].name}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium">Relationship *</label>
                  <select
                    value={contact.relationship}
                    onChange={(e) => handleContactChange(index, 'relationship', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md bg-background ${
                      errors[index]?.relationship ? 'border-destructive' : 'border-input'
                    }`}
                  >
                    <option value="">Select relationship</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Parent">Parent</option>
                    <option value="Child">Child</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Friend">Friend</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors[index]?.relationship && (
                    <p className="text-sm text-destructive mt-1">{errors[index].relationship}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium">Phone *</label>
                  <Input
                    value={contact.phone}
                    onChange={(e) => handleContactChange(index, 'phone', e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className={errors[index]?.phone ? 'border-destructive' : ''}
                  />
                  {errors[index]?.phone && (
                    <p className="text-sm text-destructive mt-1">{errors[index].phone}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    value={contact.email || ''}
                    onChange={(e) => handleContactChange(index, 'email', e.target.value)}
                    placeholder="john@example.com"
                    className={errors[index]?.email ? 'border-destructive' : ''}
                  />
                  {errors[index]?.email && (
                    <p className="text-sm text-destructive mt-1">{errors[index].email}</p>
                  )}
                </div>

                <div className="col-span-2">
                  <label className="text-sm font-medium">Address</label>
                  <Input
                    value={contact.address || ''}
                    onChange={(e) => handleContactChange(index, 'address', e.target.value)}
                    placeholder="123 Main Street, City, State"
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Add Contact Button */}
          {contacts.length < maxContacts && (
            <Button
              type="button"
              variant="outline"
              onClick={handleAddContact}
              className="w-full gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Emergency Contact
            </Button>
          )}

          {contacts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No emergency contacts added yet</p>
              <Button
                type="button"
                variant="outline"
                onClick={handleAddContact}
                className="mt-4 gap-2"
              >
                <Plus className="h-4 w-4" />
                Add First Contact
              </Button>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || contacts.length === 0} className="gap-2">
              <Save className="h-4 w-4" />
              {isLoading ? 'Saving...' : 'Save Contacts'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
