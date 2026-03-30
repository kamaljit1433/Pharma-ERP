import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NotificationTemplateManagement } from '../NotificationTemplateManagement';
import notificationService from '../../../services/notificationService';

jest.mock('../../../services/notificationService');

const mockTemplates = [
  {
    id: '1',
    name: 'Leave Approved',
    subject: 'Your leave has been approved',
    body: 'Your leave request for {{date}} has been approved',
    channel: 'in_app' as const,
    variables: ['date'],
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: '2',
    name: 'Payroll Processed',
    subject: 'Your payslip is ready',
    body: 'Your payslip for {{month}} is ready for download',
    channel: 'email' as const,
    variables: ['month'],
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
];

describe('NotificationTemplateManagement Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render template management', async () => {
    (notificationService.getTemplates as jest.Mock).mockResolvedValue({
      data: mockTemplates,
      count: 2,
    });

    render(<NotificationTemplateManagement />);
    await waitFor(() => {
      expect(screen.getByText('Notification Templates')).toBeInTheDocument();
    });
  });

  it('should display templates list', async () => {
    (notificationService.getTemplates as jest.Mock).mockResolvedValue({
      data: mockTemplates,
      count: 2,
    });

    render(<NotificationTemplateManagement />);
    await waitFor(() => {
      expect(screen.getByText('Leave Approved')).toBeInTheDocument();
      expect(screen.getByText('Payroll Processed')).toBeInTheDocument();
    });
  });

  it('should display new template button', async () => {
    (notificationService.getTemplates as jest.Mock).mockResolvedValue({
      data: [],
      count: 0,
    });

    render(<NotificationTemplateManagement />);
    await waitFor(() => {
      expect(screen.getByText('New Template')).toBeInTheDocument();
    });
  });

  it('should open create template dialog', async () => {
    (notificationService.getTemplates as jest.Mock).mockResolvedValue({
      data: [],
      count: 0,
    });

    render(<NotificationTemplateManagement />);
    await waitFor(() => {
      expect(screen.getByText('New Template')).toBeInTheDocument();
    });

    const newButton = screen.getByText('New Template');
    fireEvent.click(newButton);

    await waitFor(() => {
      expect(screen.getByText('Create Template')).toBeInTheDocument();
    });
  });

  it('should create new template', async () => {
    (notificationService.getTemplates as jest.Mock).mockResolvedValue({
      data: [],
      count: 0,
    });
    (notificationService.createTemplate as jest.Mock).mockResolvedValue(mockTemplates[0]);

    render(<NotificationTemplateManagement />);
    await waitFor(() => {
      expect(screen.getByText('New Template')).toBeInTheDocument();
    });

    const newButton = screen.getByText('New Template');
    fireEvent.click(newButton);

    await waitFor(() => {
      expect(screen.getByDisplayValue('')).toBeInTheDocument();
    });

    const nameInput = screen.getByPlaceholderText(/e.g., Leave Approved/);
    fireEvent.change(nameInput, { target: { value: 'Leave Approved' } });

    const subjectInput = screen.getByPlaceholderText(/e.g., Your leave request/);
    fireEvent.change(subjectInput, { target: { value: 'Your leave has been approved' } });

    const bodyInput = screen.getByPlaceholderText(/e.g., Your leave request for/);
    fireEvent.change(bodyInput, { target: { value: 'Your leave request for {{date}} has been approved' } });

    const createButton = screen.getByText('Create');
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(notificationService.createTemplate).toHaveBeenCalled();
    });
  });

  it('should delete template', async () => {
    (notificationService.getTemplates as jest.Mock).mockResolvedValue({
      data: mockTemplates,
      count: 2,
    });
    (notificationService.deleteTemplate as jest.Mock).mockResolvedValue(undefined);

    render(<NotificationTemplateManagement />);
    await waitFor(() => {
      expect(screen.getByText('Leave Approved')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button').filter(btn => 
      btn.querySelector('svg') && btn.className.includes('hover:text-destructive')
    );
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Delete Template')).toBeInTheDocument();
    });

    const confirmDelete = screen.getByText('Delete');
    fireEvent.click(confirmDelete);

    await waitFor(() => {
      expect(notificationService.deleteTemplate).toHaveBeenCalled();
    });
  });

  it('should display empty state when no templates', async () => {
    (notificationService.getTemplates as jest.Mock).mockResolvedValue({
      data: [],
      count: 0,
    });

    render(<NotificationTemplateManagement />);
    await waitFor(() => {
      expect(screen.getByText('No templates yet')).toBeInTheDocument();
    });
  });

  it('should display error message on fetch failure', async () => {
    (notificationService.getTemplates as jest.Mock).mockRejectedValue(
      new Error('API Error')
    );

    render(<NotificationTemplateManagement />);
    await waitFor(() => {
      expect(screen.getByText('Failed to load templates')).toBeInTheDocument();
    });
  });

  it('should display channel badges', async () => {
    (notificationService.getTemplates as jest.Mock).mockResolvedValue({
      data: mockTemplates,
      count: 2,
    });

    render(<NotificationTemplateManagement />);
    await waitFor(() => {
      expect(screen.getByText('in app')).toBeInTheDocument();
      expect(screen.getByText('email')).toBeInTheDocument();
    });
  });
});
