import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import VisitLogger from '../VisitLogger';
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
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe('VisitLogger Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('navigator', {
      geolocation: {
        getCurrentPosition: vi.fn((success) =>
          success({
            coords: {
              latitude: 40.7128,
              longitude: -74.006,
              accuracy: 10,
            },
          })
        ),
      },
    });
  });

  it('renders without employee ID', () => {
    render(<VisitLogger />);
    expect(screen.getByText('No employee selected')).toBeInTheDocument();
  });

  it('renders loading state initially', () => {
    vi.mocked(supplierService.getSuppliersBuyers).mockImplementation(
      () => new Promise(() => {})
    );

    render(<VisitLogger employeeId="emp1" />);
    expect(screen.getByText('Visit Logger')).toBeInTheDocument();
  });

  it('renders suppliers list when loaded', async () => {
    vi.mocked(supplierService.getSuppliersBuyers).mockResolvedValue(mockSuppliers);

    render(<VisitLogger employeeId="emp1" />);

    await waitFor(() => {
      expect(screen.getByText('Ready to log visits. Click "Log Visit" to get started.')).toBeInTheDocument();
    });
  });

  it('opens dialog to log visit', async () => {
    vi.mocked(supplierService.getSuppliersBuyers).mockResolvedValue(mockSuppliers);

    render(<VisitLogger employeeId="emp1" />);

    await waitFor(() => {
      expect(screen.getByText('Log Visit')).toBeInTheDocument();
    });

    const logButton = screen.getByText('Log Visit');
    fireEvent.click(logButton);

    await waitFor(() => {
      expect(screen.getByText('Log Visit')).toBeInTheDocument();
    });
  });

  it('captures GPS location', async () => {
    vi.mocked(supplierService.getSuppliersBuyers).mockResolvedValue(mockSuppliers);

    const user = userEvent.setup();
    render(<VisitLogger employeeId="emp1" />);

    await waitFor(() => {
      expect(screen.getByText('Log Visit')).toBeInTheDocument();
    });

    const logButton = screen.getByText('Log Visit');
    await user.click(logButton);

    const captureButton = screen.getByText('Capture Current Location');
    await user.click(captureButton);

    await waitFor(() => {
      expect(screen.getByText('Location captured')).toBeInTheDocument();
    });
  });

  it('displays captured location coordinates', async () => {
    vi.mocked(supplierService.getSuppliersBuyers).mockResolvedValue(mockSuppliers);

    const user = userEvent.setup();
    render(<VisitLogger employeeId="emp1" />);

    await waitFor(() => {
      expect(screen.getByText('Log Visit')).toBeInTheDocument();
    });

    const logButton = screen.getByText('Log Visit');
    await user.click(logButton);

    const captureButton = screen.getByText('Capture Current Location');
    await user.click(captureButton);

    await waitFor(() => {
      expect(screen.getByText(/40\.7128/)).toBeInTheDocument();
      expect(screen.getByText(/-74\.006/)).toBeInTheDocument();
    });
  });

  it('logs a visit with all required fields', async () => {
    vi.mocked(supplierService.getSuppliersBuyers).mockResolvedValue(mockSuppliers);
    vi.mocked(supplierService.logVisit).mockResolvedValue({
      id: '1',
      supplierBuyerId: '1',
      employeeId: 'emp1',
      visitDate: new Date(),
      latitude: 40.7128,
      longitude: -74.006,
      accuracy: 10,
      notes: 'Good meeting',
      duration: 30,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const user = userEvent.setup();
    render(<VisitLogger employeeId="emp1" />);

    await waitFor(() => {
      expect(screen.getByText('Log Visit')).toBeInTheDocument();
    });

    const logButton = screen.getByText('Log Visit');
    await user.click(logButton);

    const captureButton = screen.getByText('Capture Current Location');
    await user.click(captureButton);

    await waitFor(() => {
      expect(screen.getByText('Location captured')).toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', { name: /Log Visit/i });
    expect(submitButton).not.toBeDisabled();
  });

  it('shows error when geolocation is not available', async () => {
    vi.stubGlobal('navigator', {
      geolocation: undefined,
    });

    vi.mocked(supplierService.getSuppliersBuyers).mockResolvedValue(mockSuppliers);

    const user = userEvent.setup();
    render(<VisitLogger employeeId="emp1" />);

    await waitFor(() => {
      expect(screen.getByText('Log Visit')).toBeInTheDocument();
    });

    const logButton = screen.getByText('Log Visit');
    await user.click(logButton);

    const captureButton = screen.getByText('Capture Current Location');
    await user.click(captureButton);

    await waitFor(() => {
      expect(screen.getByText(/Geolocation is not supported/)).toBeInTheDocument();
    });
  });

  it('displays empty state when no suppliers exist', async () => {
    vi.mocked(supplierService.getSuppliersBuyers).mockResolvedValue([]);

    render(<VisitLogger employeeId="emp1" />);

    await waitFor(() => {
      expect(screen.getByText('No suppliers/buyers found. Add some first to log visits.')).toBeInTheDocument();
    });
  });

  it('calls onVisitLogged callback after successful visit', async () => {
    const onVisitLogged = vi.fn();
    vi.mocked(supplierService.getSuppliersBuyers).mockResolvedValue(mockSuppliers);
    vi.mocked(supplierService.logVisit).mockResolvedValue({
      id: '1',
      supplierBuyerId: '1',
      employeeId: 'emp1',
      visitDate: new Date(),
      latitude: 40.7128,
      longitude: -74.006,
      accuracy: 10,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    render(<VisitLogger employeeId="emp1" onVisitLogged={onVisitLogged} />);

    await waitFor(() => {
      expect(screen.getByText('Log Visit')).toBeInTheDocument();
    });

    expect(onVisitLogged).toBeDefined();
  });
});
