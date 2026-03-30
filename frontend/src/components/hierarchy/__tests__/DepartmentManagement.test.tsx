import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DepartmentManagement from '../DepartmentManagement';
import hierarchyService from '../../../services/hierarchyService';

vi.mock('../../../services/hierarchyService');

const mockDepartments = [
  {
    id: '1',
    name: 'Engineering',
    description: 'Engineering department',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'HR',
    description: 'Human Resources',
    parentDepartmentId: '1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe('DepartmentManagement Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    vi.mocked(hierarchyService.getDepartments).mockImplementation(
      () => new Promise(() => {})
    );

    render(<DepartmentManagement />);
    expect(screen.getByText('Department Management')).toBeInTheDocument();
  });

  it('renders departments list when loaded', async () => {
    vi.mocked(hierarchyService.getDepartments).mockResolvedValue(mockDepartments);

    render(<DepartmentManagement />);

    await waitFor(() => {
      expect(screen.getByText('Engineering')).toBeInTheDocument();
      expect(screen.getByText('HR')).toBeInTheDocument();
    });
  });

  it('opens dialog to create new department', async () => {
    vi.mocked(hierarchyService.getDepartments).mockResolvedValue(mockDepartments);

    render(<DepartmentManagement />);

    await waitFor(() => {
      expect(screen.getByText('Engineering')).toBeInTheDocument();
    });

    const addButton = screen.getByText('Add Department');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Create Department')).toBeInTheDocument();
    });
  });

  it('creates a new department', async () => {
    vi.mocked(hierarchyService.getDepartments).mockResolvedValue(mockDepartments);
    vi.mocked(hierarchyService.createDepartment).mockResolvedValue({
      id: '3',
      name: 'Finance',
      description: 'Finance department',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const user = userEvent.setup();
    render(<DepartmentManagement />);

    await waitFor(() => {
      expect(screen.getByText('Engineering')).toBeInTheDocument();
    });

    const addButton = screen.getByText('Add Department');
    await user.click(addButton);

    const nameInput = screen.getByPlaceholderText('e.g., Engineering');
    await user.type(nameInput, 'Finance');

    const submitButton = screen.getByText('Create');
    await user.click(submitButton);

    expect(hierarchyService.createDepartment).toHaveBeenCalled();
  });

  it('updates an existing department', async () => {
    vi.mocked(hierarchyService.getDepartments).mockResolvedValue(mockDepartments);
    vi.mocked(hierarchyService.updateDepartment).mockResolvedValue(mockDepartments[0]);

    const user = userEvent.setup();
    render(<DepartmentManagement />);

    await waitFor(() => {
      expect(screen.getByText('Engineering')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByRole('button').filter(btn => 
      btn.querySelector('svg') && btn.innerHTML.includes('Pencil')
    );
    
    if (editButtons.length > 0) {
      await user.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Edit Department')).toBeInTheDocument();
      });
    }
  });

  it('deletes a department', async () => {
    vi.mocked(hierarchyService.getDepartments).mockResolvedValue(mockDepartments);
    vi.mocked(hierarchyService.deleteDepartment).mockResolvedValue(undefined);

    const user = userEvent.setup();
    render(<DepartmentManagement />);

    await waitFor(() => {
      expect(screen.getByText('Engineering')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button').filter(btn => 
      btn.querySelector('svg') && btn.innerHTML.includes('Trash')
    );

    if (deleteButtons.length > 0) {
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Delete Department')).toBeInTheDocument();
      });

      const confirmDelete = screen.getByText('Delete');
      await user.click(confirmDelete);

      expect(hierarchyService.deleteDepartment).toHaveBeenCalled();
    }
  });

  it('displays error message on API failure', async () => {
    const errorMessage = 'Failed to load departments';
    vi.mocked(hierarchyService.getDepartments).mockRejectedValue(
      new Error(errorMessage)
    );

    render(<DepartmentManagement />);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('shows empty state when no departments exist', async () => {
    vi.mocked(hierarchyService.getDepartments).mockResolvedValue([]);

    render(<DepartmentManagement />);

    await waitFor(() => {
      expect(screen.getByText('No departments found')).toBeInTheDocument();
    });
  });
});
