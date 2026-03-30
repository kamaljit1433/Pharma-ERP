import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EmergencyContactForm } from '../EmergencyContactForm';

describe('EmergencyContactForm Component', () => {
  const mockOnSave = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render emergency contact form', () => {
    render(<EmergencyContactForm contacts={[]} onSave={mockOnSave} />);
    expect(screen.getByText('Emergency Contacts')).toBeInTheDocument();
  });

  it('should display empty state when no contacts', () => {
    render(<EmergencyContactForm contacts={[]} onSave={mockOnSave} />);
    expect(screen.getByText('No emergency contacts added yet')).toBeInTheDocument();
  });

  it('should add new contact when button is clicked', () => {
    render(<EmergencyContactForm contacts={[]} onSave={mockOnSave} />);
    const addButton = screen.getByText('Add First Contact');
    fireEvent.click(addButton);
    expect(screen.getByText('Contact 1')).toBeInTheDocument();
  });

  it('should not allow adding more than max contacts', () => {
    const contacts = [
      { name: 'Contact 1', relationship: 'Spouse', phone: '5551234567' },
      { name: 'Contact 2', relationship: 'Parent', phone: '5559876543' },
      { name: 'Contact 3', relationship: 'Sibling', phone: '5555555555' },
    ];

    render(<EmergencyContactForm contacts={contacts} onSave={mockOnSave} maxContacts={3} />);
    expect(screen.queryByText('Add Emergency Contact')).not.toBeInTheDocument();
  });

  it('should validate required fields', async () => {
    render(<EmergencyContactForm contacts={[]} onSave={mockOnSave} />);

    const addButton = screen.getByText('Add First Contact');
    fireEvent.click(addButton);

    const saveButton = screen.getByText('Save Contacts');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
      expect(screen.getByText('Relationship is required')).toBeInTheDocument();
      expect(screen.getByText('Phone is required')).toBeInTheDocument();
    });

    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('should validate phone number format', async () => {
    render(<EmergencyContactForm contacts={[]} onSave={mockOnSave} />);

    const addButton = screen.getByText('Add First Contact');
    fireEvent.click(addButton);

    const nameInput = screen.getByPlaceholderText('John Doe');
    const phoneInput = screen.getByPlaceholderText('+1 (555) 000-0000');

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(phoneInput, { target: { value: '123' } });

    const saveButton = screen.getByText('Save Contacts');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid phone number')).toBeInTheDocument();
    });

    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('should validate email format', async () => {
    render(<EmergencyContactForm contacts={[]} onSave={mockOnSave} />);

    const addButton = screen.getByText('Add First Contact');
    fireEvent.click(addButton);

    const emailInput = screen.getByPlaceholderText('john@example.com');
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

    const saveButton = screen.getByText('Save Contacts');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid email format')).toBeInTheDocument();
    });
  });

  it('should remove contact when delete button is clicked', () => {
    const contacts = [
      { name: 'Contact 1', relationship: 'Spouse', phone: '5551234567' },
      { name: 'Contact 2', relationship: 'Parent', phone: '5559876543' },
    ];

    render(<EmergencyContactForm contacts={contacts} onSave={mockOnSave} />);
    expect(screen.getByText('Contact 1')).toBeInTheDocument();
    expect(screen.getByText('Contact 2')).toBeInTheDocument();

    const deleteButtons = screen.getAllByRole('button', { name: '' });
    const trashButton = deleteButtons.find((btn) => btn.querySelector('svg'));
    if (trashButton) {
      fireEvent.click(trashButton);
    }

    expect(screen.queryByText('Contact 2')).not.toBeInTheDocument();
  });

  it('should call onCancel when cancel button is clicked', () => {
    render(<EmergencyContactForm contacts={[]} onSave={mockOnSave} onCancel={mockOnCancel} />);
    const addButton = screen.getByText('Add First Contact');
    fireEvent.click(addButton);

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('should show loading state', () => {
    const contacts = [{ name: 'Contact 1', relationship: 'Spouse', phone: '5551234567' }];
    render(<EmergencyContactForm contacts={contacts} onSave={mockOnSave} isLoading={true} />);
    expect(screen.getByText('Saving...')).toBeInTheDocument();
  });
});
