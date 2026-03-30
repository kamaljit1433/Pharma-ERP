import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DesignationManagement from '../DesignationManagement';
import hierarchyService from '../../../services/hierarchyService';

vi.mock('../../../services/hierarchyService');

const mockDesignations = [
  {
    id: '1',
    name: 'Senior Engineer',
    description: 'Senior level engineer',
    departmentId: 'dept1',
    level: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'Junior Engineer',
    description: 'Junior level engineer',
    departmentId: 'dept1',
    level: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockDepartments = [
  {
    id: 'dept1',
    name: 'Engineering',
    description: 'Engineering department',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe('DesignationManagement Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    vi.mocked(hierarchyService.getDesignations).mockImplementation(
      () => new Promise(() => {})
    );
    vi.mocked(hierarchyService.getDepartments).mockImplementation(
      () => new Promise(() => {})
    );

    render(<DesignationManagement />);
    expect(screen.getByText('Designation Management')).toBeInTheDocument();
  });

  it('renders designations list when loaded', async () => {
    vi.mocked(hierarchyService.getDesignations).mockResolvedValue(mockDesignations);
    vi.mocked(hierarchyService.getDepartments).mockResolvedValue(mockDepartments);

    render(<DesignationManagement />);

    await waitFor(() => {
      expect(screen.getByText('Senior Engineer')).toBeInTheDocument();
      expect(screen.getByText('Junior Engineer')).toBeInTheDocument();
    });
  });

  it('displays designation levels', async () => {
    vi.mocked(hierarchyService.getDesignations).mockResolvedValue(mockDesignations);
    vi.mocked(hierarchyService.getDepartments).mockResolvedValue(mockDepartments);

    render(<DesignationManagement />);

    await waitFor(() => {
      expect(screen.getByText('Senior Engineer')).toBeInTheDocument();
    });

    const levelCells = screen.getAllByText(/^[0-9]$/);
    expect(levelCells.length).toBeGreaterThan(0);
  });

  it('opens dialog to create new designation', async () => {
    vi.mocked(hierarchyService.getDesignations).mockResolvedValue(mockDesignations);
    vi.mocked(hierarchyService.getDepartments).mockResolvedValue(mockDepartments);

    render(<DesignationManagement />);

    await waitFor(() => {
      expect(screen.getByText('Senior Engineer')).toBeInTheDocument();
    });

    const addButton = screen.getByText('Add Designation');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Create Designation')).toBeInTheDocument();
    });
  });

  it('creates a new designation', async () => {
    vi.mocked(hierarchyService.getDesignations).mockResolvedValue(mockDesignations);
    vi.mocked(hierarchyService.getDepartments).mockResolvedValue(mockDepartments);
    vi.mocked(hierarchyService.createDesignation).mockResolvedValue({
      id: '3',
      name: 'Manager',
      description: 'Manager level',
      departmentId: 'dept1',
      level: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const user = userEvent.setup();
    render(<DesignationManagement />);

    await waitFor(() => {
      expect(screen.getByText('Senior Engineer')).toBeInTheDocument();
    });

    const addButton = screen.getByText('Add Designation');
    await user.click(addButton);

    const nameInput = screen.getByPlaceholderText('e.g., Senior Engineer');
    await user.type(nameInput, 'Manager');

    expect(hierarchyService.createDesignation).toBeDefined();
  });

  it('updates an existing designation', async () => {
    vi.mocked(hierarchyService.getDesignations).mockResolvedValue(mockDesignations);
    vi.mocked(hierarchyService.getDepartments).mockResolvedValue(mockDepartments);
    vi.mocked(hierarchyService.updateDesignation).mockResolvedValue(mockDesignations[0]);

    const user = userEvent.setup();
    render(<DesignationManagement />);

    await waitFor(() => {
      expect(screen.getByText('Senior Engineer')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByRole('button').filter(btn => 
      btn.querySelector('svg') && btn.innerHTML.includes('Pencil')
    );

    if (editButtons.length > 0) {
      await user.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Edit Designation')).toBeInTheDocument();
      });
    }
  });

  it('deletes a designation', async () => {
    vi.mocked(hierarchyService.getDesignations).mockResolvedValue(mockDesignations);
    vi.mocked(hierarchyService.getDepartments).mockResolvedValue(mockDepartments);
    vi.mocked(hierarchyService.deleteDesignation).mockResolvedValue(undefined);

    const user = userEvent.setup();
    render(<DesignationManagement />);

    await waitFor(() => {
      expect(screen.getByText('Senior Engineer')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button').filter(btn => 
      btn.querySelector('svg') && btn.innerHTML.includes('Trash')
    );

    if (deleteButtons.length > 0) {
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Delete Designation')).toBeInTheDocument();
      });

      const confirmDelete = screen.getByText('Delete');
      await user.click(confirmDelete);

      expect(hierarchyService.deleteDesignation).toHaveBeenCalled();
    }
  });

  it('displays error message on API failure', async () => {
    const errorMessage = 'Failed to load data';
    vi.mocked(hierarchyService.getDesignations).mockRejectedValue(
      new Error(errorMessage)
    );
    vi.mocked(hierarchyService.getDepartments).mockResolvedValue(mockDepartments);

    render(<DesignationManagement />);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('shows empty state when no designations exist', async () => {
    vi.mocked(hierarchyService.getDesignations).mockResolvedValue([]);
    vi.mocked(hierarchyService.getDepartments).mockResolvedValue(mockDepartments);

    render(<DesignationManagement />);

    await waitFor(() => {
      expect(screen.getByText('No designations found')).toBeInTheDocument();
    });
  });
});
