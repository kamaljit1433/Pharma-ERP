import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GeoFenceManagement } from '../GeoFenceManagement';
import { useGeoTrackingStore } from '../../../store/geoTrackingStore';

vi.mock('../../../store/geoTrackingStore', () => ({
  useGeoTrackingStore: vi.fn(),
}));

vi.mock('date-fns', () => ({
  format: (date: Date, format: string) => {
    if (format === 'MMM dd, yyyy') return 'Jan 15, 2024';
    return date.toString();
  },
}));

describe('GeoFenceManagement', () => {
  const mockGeoFences = [
    {
      id: '1',
      name: 'Main Office',
      center: {
        latitude: 28.6139,
        longitude: 77.209,
        timestamp: new Date(),
      },
      radius: 500,
      type: 'Office' as const,
      enabled: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      name: 'Restricted Zone',
      center: {
        latitude: 28.5244,
        longitude: 77.1855,
        timestamp: new Date(),
      },
      radius: 1000,
      type: 'Restricted' as const,
      enabled: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component with header', () => {
    (useGeoTrackingStore as any).mockReturnValue({
      geoFences: [],
      loadingGeoFences: false,
      fetchGeoFences: vi.fn(),
      createGeoFence: vi.fn(),
      updateGeoFence: vi.fn(),
      deleteGeoFence: vi.fn(),
      toggleGeoFence: vi.fn(),
    });

    render(<GeoFenceManagement adminId="ADMIN001" />);

    expect(screen.getByText('Geo-Fence Management')).toBeInTheDocument();
    expect(screen.getByText('Create and manage geo-fences for location validation')).toBeInTheDocument();
  });

  it('displays geo-fences in table', () => {
    (useGeoTrackingStore as any).mockReturnValue({
      geoFences: mockGeoFences,
      loadingGeoFences: false,
      fetchGeoFences: vi.fn(),
      createGeoFence: vi.fn(),
      updateGeoFence: vi.fn(),
      deleteGeoFence: vi.fn(),
      toggleGeoFence: vi.fn(),
    });

    render(<GeoFenceManagement adminId="ADMIN001" />);

    expect(screen.getByText('Main Office')).toBeInTheDocument();
    expect(screen.getByText('Restricted Zone')).toBeInTheDocument();
    expect(screen.getByText('500 m')).toBeInTheDocument();
    expect(screen.getByText('1000 m')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    (useGeoTrackingStore as any).mockReturnValue({
      geoFences: [],
      loadingGeoFences: true,
      fetchGeoFences: vi.fn(),
      createGeoFence: vi.fn(),
      updateGeoFence: vi.fn(),
      deleteGeoFence: vi.fn(),
      toggleGeoFence: vi.fn(),
    });

    render(<GeoFenceManagement adminId="ADMIN001" />);

    expect(screen.getByText('Loading geo-fences...')).toBeInTheDocument();
  });

  it('shows empty state when no geo-fences', () => {
    (useGeoTrackingStore as any).mockReturnValue({
      geoFences: [],
      loadingGeoFences: false,
      fetchGeoFences: vi.fn(),
      createGeoFence: vi.fn(),
      updateGeoFence: vi.fn(),
      deleteGeoFence: vi.fn(),
      toggleGeoFence: vi.fn(),
    });

    render(<GeoFenceManagement adminId="ADMIN001" />);

    expect(screen.getByText('No geo-fences found')).toBeInTheDocument();
  });

  it('opens create dialog on new geo-fence button click', async () => {
    (useGeoTrackingStore as any).mockReturnValue({
      geoFences: [],
      loadingGeoFences: false,
      fetchGeoFences: vi.fn(),
      createGeoFence: vi.fn(),
      updateGeoFence: vi.fn(),
      deleteGeoFence: vi.fn(),
      toggleGeoFence: vi.fn(),
    });

    render(<GeoFenceManagement adminId="ADMIN001" />);

    const newButton = screen.getByText('New Geo-Fence');
    fireEvent.click(newButton);

    await waitFor(() => {
      expect(screen.getByText('Create New Geo-Fence')).toBeInTheDocument();
    });
  });

  it('filters geo-fences by type', async () => {
    (useGeoTrackingStore as any).mockReturnValue({
      geoFences: mockGeoFences,
      loadingGeoFences: false,
      fetchGeoFences: vi.fn(),
      createGeoFence: vi.fn(),
      updateGeoFence: vi.fn(),
      deleteGeoFence: vi.fn(),
      toggleGeoFence: vi.fn(),
    });

    render(<GeoFenceManagement adminId="ADMIN001" />);

    const filterSelect = screen.getByDisplayValue('All Types');
    fireEvent.change(filterSelect, { target: { value: 'Office' } });

    await waitFor(() => {
      expect(screen.getByText('Main Office')).toBeInTheDocument();
    });
  });

  it('displays correct status badges', () => {
    (useGeoTrackingStore as any).mockReturnValue({
      geoFences: mockGeoFences,
      loadingGeoFences: false,
      fetchGeoFences: vi.fn(),
      createGeoFence: vi.fn(),
      updateGeoFence: vi.fn(),
      deleteGeoFence: vi.fn(),
      toggleGeoFence: vi.fn(),
    });

    render(<GeoFenceManagement adminId="ADMIN001" />);

    expect(screen.getByText('Enabled')).toBeInTheDocument();
    expect(screen.getByText('Disabled')).toBeInTheDocument();
  });

  it('displays correct type badges', () => {
    (useGeoTrackingStore as any).mockReturnValue({
      geoFences: mockGeoFences,
      loadingGeoFences: false,
      fetchGeoFences: vi.fn(),
      createGeoFence: vi.fn(),
      updateGeoFence: vi.fn(),
      deleteGeoFence: vi.fn(),
      toggleGeoFence: vi.fn(),
    });

    render(<GeoFenceManagement adminId="ADMIN001" />);

    const badges = screen.getAllByText(/Office|Restricted/);
    expect(badges.length).toBeGreaterThan(0);
  });

  it('calls delete function on delete button click', async () => {
    const mockDelete = vi.fn();
    (useGeoTrackingStore as any).mockReturnValue({
      geoFences: mockGeoFences,
      loadingGeoFences: false,
      fetchGeoFences: vi.fn(),
      createGeoFence: vi.fn(),
      updateGeoFence: vi.fn(),
      deleteGeoFence: mockDelete,
      toggleGeoFence: vi.fn(),
    });

    render(<GeoFenceManagement adminId="ADMIN001" />);

    const deleteButtons = screen.getAllByRole('button').filter((btn) =>
      btn.querySelector('svg')
    );

    // Find and click the delete button (last one in the row)
    const firstRowDeleteButton = deleteButtons[deleteButtons.length - 1];
    fireEvent.click(firstRowDeleteButton);

    // Confirm the delete
    window.confirm = vi.fn(() => true);
    fireEvent.click(firstRowDeleteButton);

    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalled();
    });
  });

  it('calls toggle function on toggle button click', async () => {
    const mockToggle = vi.fn();
    (useGeoTrackingStore as any).mockReturnValue({
      geoFences: mockGeoFences,
      loadingGeoFences: false,
      fetchGeoFences: vi.fn(),
      createGeoFence: vi.fn(),
      updateGeoFence: vi.fn(),
      deleteGeoFence: vi.fn(),
      toggleGeoFence: mockToggle,
    });

    render(<GeoFenceManagement adminId="ADMIN001" />);

    const toggleButtons = screen.getAllByRole('button').filter((btn) =>
      btn.querySelector('svg')
    );

    fireEvent.click(toggleButtons[0]);

    await waitFor(() => {
      expect(mockToggle).toHaveBeenCalled();
    });
  });
});
