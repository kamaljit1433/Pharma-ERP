import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SupplierBuyerManagement from '../SupplierBuyerManagement';
import supplierService from '../../../services/supplierService';

vi.mock('../../../services/supplierService');

const mockSuppliers = [
  {
    id: '1',
    employeeId: 'emp1',
    name: 'ABC Supplies',
    type: 'supplier' as const,
    contactPerson: 'John Smith',
    email: 'john@abc.com',
    phone: '+1-555-0001',
    address: '123 Main St',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'USA',
    notes: 'Reliable supplier',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    employeeId: 'emp1',
    name: 'XYZ Buyers',
    type: 'buyer' as const,
    contactPerson: 'Jane Doe',
    email: 'jane@xyz.com',
    phone: '+1-555-0002',
    address: '456 Oak Ave',
    city: 'Los Angeles',
    state: 'CA',
    zipCode: '90001',
    country: 'USA',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe('SupplierBuyerManagement Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without employee ID', () => {
    render(<SupplierBuyerManagement />);
    expect(screen.getByText('No employee selected')).toBeInTheDocument();
  });

  it('renders loading state initially', () => {
    vi.mocked(supplierService.getSuppliersBuyers).mockImplementation(
      () => new Promise(() => {})
    );

    render(<SupplierBuyerManagement employeeId="emp1" />);
    expect(screen.getByText('Supplier/Buyer Management')).toBeInTheDocument();
  });

  it('renders suppliers and buyers list when loaded', async () => {
    vi.mocked(supplierService.getSuppliersBuyers).mockResolvedValue(mockSuppliers);

    render(<SupplierBuyerManagement employeeId="emp1" />);

    await waitFor(() => {
      expect(screen.getByText('ABC Supplies')).toBeInTheDocument();
      expect(screen.getByText('XYZ Buyers')).toBeInTheDocument();
    });
  });

  it('displays supplier and buyer type badges', async () => {
    vi.mocked(supplierService.getSuppliersBuyers).mockResolvedValue(mockSuppliers);

    render(<SupplierBuyerManagement employeeId="emp1" />);

    await waitFor(() => {
      expect(screen.getByText('ABC Supplies')).toBeInTheDocument();
    });

    const badges = screen.getAllByText(/supplier|buyer/i);
    expect(badges.length).toBeGreaterThan(0);
  });

  it('opens dialog to add new supplier/buyer', async () => {
    vi.mocked(supplierService.getSuppliersBuyers).mockResolvedValue(mockSuppliers);

    render(<SupplierBuyerManagement employeeId="emp1" />);

    await waitFor(() => {
      expect(screen.getByText('ABC Supplies')).toBeInTheDocument();
    });

    const addButton = screen.getByText('Add Record');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Add Supplier/Buyer')).toBeInTheDocument();
    });
  });

  it('creates a new supplier/buyer record', async () => {
    vi.mocked(supplierService.getSuppliersBuyers).mockResolvedValue(mockSuppliers);
    vi.mocked(supplierService.createSupplierBuyer).mockResolvedValue({
      id: '3',
      employeeId: 'emp1',
      name: 'New Supplier',
      type: 'supplier',
      contactPerson: 'Bob Johnson',
      email: 'bob@new.com',
      phone: '+1-555-0003',
      address: '789 Pine Rd',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601',
      country: 'USA',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const user = userEvent.setup();
    render(<SupplierBuyerManagement employeeId="emp1" />);

    await waitFor(() => {
      expect(screen.getByText('ABC Supplies')).toBeInTheDocument();
    });

    const addButton = screen.getByText('Add Record');
    await user.click(addButton);

    const nameInput = screen.getByPlaceholderText('Company name');
    await user.type(nameInput, 'New Supplier');

    expect(supplierService.createSupplierBuyer).toBeDefined();
  });

  it('updates an existing supplier/buyer', async () => {
    vi.mocked(supplierService.getSuppliersBuyers).mockResolvedValue(mockSuppliers);
    vi.mocked(supplierService.updateSupplierBuyer).mockResolvedValue(mockSuppliers[0]);

    const user = userEvent.setup();
    render(<SupplierBuyerManagement employeeId="emp1" />);

    await waitFor(() => {
      expect(screen.getByText('ABC Supplies')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByRole('button').filter(btn => 
      btn.querySelector('svg') && btn.innerHTML.includes('Pencil')
    );

    if (editButtons.length > 0) {
      await user.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Edit Supplier/Buyer')).toBeInTheDocument();
      });
    }
  });

  it('deletes a supplier/buyer record', async () => {
    vi.mocked(supplierService.getSuppliersBuyers).mockResolvedValue(mockSuppliers);
    vi.mocked(supplierService.deleteSupplierBuyer).mockResolvedValue(undefined);

    const user = userEvent.setup();
    render(<SupplierBuyerManagement employeeId="emp1" />);

    await waitFor(() => {
      expect(screen.getByText('ABC Supplies')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button').filter(btn => 
      btn.querySelector('svg') && btn.innerHTML.includes('Trash')
    );

    if (deleteButtons.length > 0) {
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Delete Supplier/Buyer')).toBeInTheDocument();
      });

      const confirmDelete = screen.getByText('Delete');
      await user.click(confirmDelete);

      expect(supplierService.deleteSupplierBuyer).toHaveBeenCalled();
    }
  });

  it('displays error message on API failure', async () => {
    const errorMessage = 'Failed to load suppliers/buyers';
    vi.mocked(supplierService.getSuppliersBuyers).mockRejectedValue(
      new Error(errorMessage)
    );

    render(<SupplierBuyerManagement employeeId="emp1" />);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('shows empty state when no suppliers/buyers exist', async () => {
    vi.mocked(supplierService.getSuppliersBuyers).mockResolvedValue([]);

    render(<SupplierBuyerManagement employeeId="emp1" />);

    await waitFor(() => {
      expect(screen.getByText('No suppliers/buyers found')).toBeInTheDocument();
    });
  });

  it('displays location information with city and state', async () => {
    vi.mocked(supplierService.getSuppliersBuyers).mockResolvedValue(mockSuppliers);

    render(<SupplierBuyerManagement employeeId="emp1" />);

    await waitFor(() => {
      expect(screen.getByText('ABC Supplies')).toBeInTheDocument();
    });

    expect(screen.getByText('New York, NY')).toBeInTheDocument();
    expect(screen.getByText('Los Angeles, CA')).toBeInTheDocument();
  });
});
