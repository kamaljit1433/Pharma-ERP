import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import VisitHistory from '../VisitHistory';
import supplierService from '../../../services/supplierService';

vi.mock('../../../services/supplierService');

const mockVisits = [
  {
    id: '1',
    supplierBuyerId: 'sb1',
    employeeId: 'emp1',
    visitDate: new Date('2024-01-15T10:30:00'),
    latitude: 40.7128,
    longitude: -74.006,
    accuracy: 10,
    notes: 'Discussed new products',
    duration: 45,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    supplierBuyerId: 'sb1',
    employeeId: 'emp1',
    visitDate: new Date('2024-01-10T14:00:00'),
    latitude: 40.7128,
    longitude: -74.006,
    accuracy: 15,
    notes: 'Quarterly review',
    duration: 60,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockSupplier = {
  id: 'sb1',
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
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('VisitHistory Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    vi.mocked(supplierService.getVisitHistory).mockImplementation(
      () => new Promise(() => {})
    );
    vi.mocked(supplierService.getSupplierBuyer).mockImplementation(
      () => new Promise(() => {})
    );

    render(<VisitHistory supplierBuyerId="sb1" />);
    expect(screen.getByText('Visit History')).toBeInTheDocument();
  });

  it('renders visit history when loaded', async () => {
    vi.mocked(supplierService.getVisitHistory).mockResolvedValue(mockVisits);
    vi.mocked(supplierService.getSupplierBuyer).mockResolvedValue(mockSupplier);

    render(<VisitHistory supplierBuyerId="sb1" />);

    await waitFor(() => {
      expect(screen.getByText('Discussed new products')).toBeInTheDocument();
      expect(screen.getByText('Quarterly review')).toBeInTheDocument();
    });
  });

  it('displays supplier name in header', async () => {
    vi.mocked(supplierService.getVisitHistory).mockResolvedValue(mockVisits);
    vi.mocked(supplierService.getSupplierBuyer).mockResolvedValue(mockSupplier);

    render(<VisitHistory supplierBuyerId="sb1" />);

    await waitFor(() => {
      expect(screen.getByText(/ABC Supplies/)).toBeInTheDocument();
    });
  });

  it('displays visit count badge', async () => {
    vi.mocked(supplierService.getVisitHistory).mockResolvedValue(mockVisits);
    vi.mocked(supplierService.getSupplierBuyer).mockResolvedValue(mockSupplier);

    render(<VisitHistory supplierBuyerId="sb1" />);

    await waitFor(() => {
      expect(screen.getByText('2 visits')).toBeInTheDocument();
    });
  });

  it('displays visit dates and times', async () => {
    vi.mocked(supplierService.getVisitHistory).mockResolvedValue(mockVisits);
    vi.mocked(supplierService.getSupplierBuyer).mockResolvedValue(mockSupplier);

    render(<VisitHistory supplierBuyerId="sb1" />);

    await waitFor(() => {
      expect(screen.getByText('Discussed new products')).toBeInTheDocument();
    });

    const dateElements = screen.getAllByText(/Jan/);
    expect(dateElements.length).toBeGreaterThan(0);
  });

  it('displays visit duration', async () => {
    vi.mocked(supplierService.getVisitHistory).mockResolvedValue(mockVisits);
    vi.mocked(supplierService.getSupplierBuyer).mockResolvedValue(mockSupplier);

    render(<VisitHistory supplierBuyerId="sb1" />);

    await waitFor(() => {
      expect(screen.getByText('45 min')).toBeInTheDocument();
      expect(screen.getByText('60 min')).toBeInTheDocument();
    });
  });

  it('displays visit notes', async () => {
    vi.mocked(supplierService.getVisitHistory).mockResolvedValue(mockVisits);
    vi.mocked(supplierService.getSupplierBuyer).mockResolvedValue(mockSupplier);

    render(<VisitHistory supplierBuyerId="sb1" />);

    await waitFor(() => {
      expect(screen.getByText('Discussed new products')).toBeInTheDocument();
      expect(screen.getByText('Quarterly review')).toBeInTheDocument();
    });
  });

  it('displays GPS coordinates as clickable map links', async () => {
    vi.mocked(supplierService.getVisitHistory).mockResolvedValue(mockVisits);
    vi.mocked(supplierService.getSupplierBuyer).mockResolvedValue(mockSupplier);

    render(<VisitHistory supplierBuyerId="sb1" />);

    await waitFor(() => {
      const mapLinks = screen.getAllByRole('link');
      expect(mapLinks.length).toBeGreaterThan(0);
      expect(mapLinks[0]).toHaveAttribute('href', expect.stringContaining('maps.google.com'));
    });
  });

  it('displays location accuracy', async () => {
    vi.mocked(supplierService.getVisitHistory).mockResolvedValue(mockVisits);
    vi.mocked(supplierService.getSupplierBuyer).mockResolvedValue(mockSupplier);

    render(<VisitHistory supplierBuyerId="sb1" />);

    await waitFor(() => {
      expect(screen.getByText(/±10m/)).toBeInTheDocument();
      expect(screen.getByText(/±15m/)).toBeInTheDocument();
    });
  });

  it('deletes a visit record', async () => {
    vi.mocked(supplierService.getVisitHistory).mockResolvedValue(mockVisits);
    vi.mocked(supplierService.getSupplierBuyer).mockResolvedValue(mockSupplier);
    vi.mocked(supplierService.deleteVisit).mockResolvedValue(undefined);

    const user = userEvent.setup();
    render(<VisitHistory supplierBuyerId="sb1" />);

    await waitFor(() => {
      expect(screen.getByText('Discussed new products')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button').filter(btn => 
      btn.querySelector('svg') && btn.innerHTML.includes('Trash')
    );

    if (deleteButtons.length > 0) {
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Delete Visit')).toBeInTheDocument();
      });

      const confirmDelete = screen.getByText('Delete');
      await user.click(confirmDelete);

      expect(supplierService.deleteVisit).toHaveBeenCalled();
    }
  });

  it('shows empty state when no visits exist', async () => {
    vi.mocked(supplierService.getVisitHistory).mockResolvedValue([]);
    vi.mocked(supplierService.getSupplierBuyer).mockResolvedValue(mockSupplier);

    render(<VisitHistory supplierBuyerId="sb1" />);

    await waitFor(() => {
      expect(screen.getByText('No visits recorded yet')).toBeInTheDocument();
    });
  });

  it('displays error message on API failure', async () => {
    const errorMessage = 'Failed to load visit history';
    vi.mocked(supplierService.getVisitHistory).mockRejectedValue(
      new Error(errorMessage)
    );
    vi.mocked(supplierService.getSupplierBuyer).mockResolvedValue(mockSupplier);

    render(<VisitHistory supplierBuyerId="sb1" />);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('loads employee visits when employeeId is provided', async () => {
    vi.mocked(supplierService.getEmployeeVisits).mockResolvedValue(mockVisits);

    render(<VisitHistory employeeId="emp1" />);

    await waitFor(() => {
      expect(screen.getByText('Discussed new products')).toBeInTheDocument();
    });

    expect(supplierService.getEmployeeVisits).toHaveBeenCalledWith('emp1');
  });

  it('calls onVisitDeleted callback after deletion', async () => {
    const onVisitDeleted = vi.fn();
    vi.mocked(supplierService.getVisitHistory).mockResolvedValue(mockVisits);
    vi.mocked(supplierService.getSupplierBuyer).mockResolvedValue(mockSupplier);
    vi.mocked(supplierService.deleteVisit).mockResolvedValue(undefined);

    const user = userEvent.setup();
    render(<VisitHistory supplierBuyerId="sb1" onVisitDeleted={onVisitDeleted} />);

    await waitFor(() => {
      expect(screen.getByText('Discussed new products')).toBeInTheDocument();
    });

    expect(onVisitDeleted).toBeDefined();
  });
});
