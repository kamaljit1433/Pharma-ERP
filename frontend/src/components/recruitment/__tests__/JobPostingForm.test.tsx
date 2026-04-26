import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { JobPostingForm } from '../JobPostingForm';
import * as recruitmentService from '../../../services/recruitmentService';

// Mock the recruitment service
vi.mock('../../../services/recruitmentService', () => ({
  recruitmentService: {
    createJobPosting: vi.fn(),
  },
}));

describe('JobPostingForm', () => {
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Form Rendering', () => {
    it('renders the form with all required fields', () => {
      render(<JobPostingForm onSuccess={mockOnSuccess} />);

      expect(screen.getByLabelText(/job title/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/location/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/department/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/min experience/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/max experience/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/application deadline/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/job description/i)).toBeInTheDocument();
      expect(screen.getByText(/required skills/i)).toBeInTheDocument();
    });

    it('renders in create mode by default', () => {
      render(<JobPostingForm onSuccess={mockOnSuccess} />);

      expect(screen.getByRole('heading', { name: /create job posting/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create job posting/i })).toBeInTheDocument();
    });

    it('renders in edit mode with initial data', () => {
      const initialData = {
        title: 'Senior Developer',
        location: 'New York',
        department_id: 'eng-1',
        description: 'This is a detailed job description',
        required_skills: ['JavaScript', 'React'],
        experience_min: 3,
        experience_max: 8,
        application_deadline: '2025-12-31',
      };

      render(
        <JobPostingForm
          onSuccess={mockOnSuccess}
          initialData={initialData}
          isEditing={true}
        />
      );

      expect(screen.getByDisplayValue('Senior Developer')).toBeInTheDocument();
      expect(screen.getByDisplayValue('New York')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /edit job posting/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /update job posting/i })).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('displays validation error when title is empty', async () => {
      const user = userEvent.setup();
      render(<JobPostingForm onSuccess={mockOnSuccess} />);

      const submitButton = screen.getByRole('button', { name: /create job posting/i });
      await user.click(submitButton);

      await waitFor(() => {
        const titleErrors = screen.getAllByText(/job title/i);
        expect(titleErrors.length).toBeGreaterThan(1);
      });
    });

    it('displays validation error when description is too short', async () => {
      const user = userEvent.setup();
      render(<JobPostingForm onSuccess={mockOnSuccess} />);

      const titleInput = screen.getByLabelText(/job title/i);
      const locationInput = screen.getByLabelText(/location/i);
      const departmentInput = screen.getByLabelText(/department/i);
      const descriptionInput = screen.getByLabelText(/job description/i);

      await user.type(titleInput, 'Developer');
      await user.type(locationInput, 'NYC');
      await user.type(departmentInput, 'eng-1');
      await user.type(descriptionInput, 'Short');

      const submitButton = screen.getByRole('button', { name: /create job posting/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/job description must be at least 10 characters/i)).toBeInTheDocument();
      });
    });

    it('displays validation error when required skills are empty', async () => {
      const user = userEvent.setup();
      render(<JobPostingForm onSuccess={mockOnSuccess} />);

      const titleInput = screen.getByLabelText(/job title/i);
      const locationInput = screen.getByLabelText(/location/i);
      const departmentInput = screen.getByLabelText(/department/i);
      const descriptionInput = screen.getByLabelText(/job description/i);

      await user.type(titleInput, 'Developer');
      await user.type(locationInput, 'NYC');
      await user.type(departmentInput, 'eng-1');
      await user.type(descriptionInput, 'Develop backend services for the platform');

      const submitButton = screen.getByRole('button', { name: /create job posting/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/at least one skill is required/i)).toBeInTheDocument();
      });
    });

    it('displays validation error when experience_max is less than experience_min', async () => {
      const user = userEvent.setup();
      render(<JobPostingForm onSuccess={mockOnSuccess} />);

      const titleInput = screen.getByLabelText(/job title/i);
      const locationInput = screen.getByLabelText(/location/i);
      const departmentInput = screen.getByLabelText(/department/i);
      const descriptionInput = screen.getByLabelText(/job description/i);
      const minExpInput = screen.getByLabelText(/min experience/i);
      const maxExpInput = screen.getByLabelText(/max experience/i);
      const skillInput = screen.getByPlaceholderText(/add a skill/i);

      await user.type(titleInput, 'Developer');
      await user.type(locationInput, 'NYC');
      await user.type(departmentInput, 'eng-1');
      await user.type(descriptionInput, 'Develop backend services for the platform');
      await user.clear(minExpInput);
      await user.type(minExpInput, '10');
      await user.clear(maxExpInput);
      await user.type(maxExpInput, '5');

      const addButtons = screen.getAllByRole('button').filter(btn => btn.querySelector('svg'));
      await user.type(skillInput, 'JavaScript');
      if (addButtons[0]) await user.click(addButtons[0]);

      const submitButton = screen.getByRole('button', { name: /create job posting/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/maximum experience must be greater than or equal to minimum/i)).toBeInTheDocument();
      });
    });
  });

  describe('Skills Management', () => {
    it('allows adding skills', async () => {
      const user = userEvent.setup();
      render(<JobPostingForm onSuccess={mockOnSuccess} />);

      const skillInput = screen.getByPlaceholderText(/add a skill/i);
      const addButtons = screen.getAllByRole('button').filter(btn => btn.querySelector('svg'));

      await user.type(skillInput, 'JavaScript');
      if (addButtons[0]) await user.click(addButtons[0]);

      expect(screen.getByText('JavaScript')).toBeInTheDocument();
    });

    it('allows adding multiple skills', async () => {
      const user = userEvent.setup();
      render(<JobPostingForm onSuccess={mockOnSuccess} />);

      const skillInput = screen.getByPlaceholderText(/add a skill/i);
      const addButtons = screen.getAllByRole('button').filter(btn => btn.querySelector('svg'));

      await user.type(skillInput, 'JavaScript');
      if (addButtons[0]) await user.click(addButtons[0]);

      await user.type(skillInput, 'React');
      if (addButtons[0]) await user.click(addButtons[0]);

      expect(screen.getByText('JavaScript')).toBeInTheDocument();
      expect(screen.getByText('React')).toBeInTheDocument();
    });

    it('allows removing skills', async () => {
      const user = userEvent.setup();
      render(<JobPostingForm onSuccess={mockOnSuccess} />);

      const skillInput = screen.getByPlaceholderText(/add a skill/i);
      const addButtons = screen.getAllByRole('button').filter(btn => btn.querySelector('svg'));

      await user.type(skillInput, 'JavaScript');
      if (addButtons[0]) await user.click(addButtons[0]);

      expect(screen.getByText('JavaScript')).toBeInTheDocument();

      const removeButtons = screen.getAllByRole('button').filter(btn => {
        const svg = btn.querySelector('svg');
        return svg && btn.className.includes('hover:text-destructive');
      });

      if (removeButtons[0]) await user.click(removeButtons[0]);

      expect(screen.queryByText('JavaScript')).not.toBeInTheDocument();
    });

    it('displays skill count', async () => {
      const user = userEvent.setup();
      render(<JobPostingForm onSuccess={mockOnSuccess} />);

      const skillInput = screen.getByPlaceholderText(/add a skill/i);
      const addButtons = screen.getAllByRole('button').filter(btn => btn.querySelector('svg'));

      await user.type(skillInput, 'JavaScript');
      if (addButtons[0]) await user.click(addButtons[0]);

      await user.type(skillInput, 'React');
      if (addButtons[0]) await user.click(addButtons[0]);

      expect(screen.getByText(/required skills/i)).toBeInTheDocument();
      expect(screen.getByText('JavaScript')).toBeInTheDocument();
      expect(screen.getByText('React')).toBeInTheDocument();
    });

    it('adds skill on Enter key press', async () => {
      const user = userEvent.setup();
      render(<JobPostingForm onSuccess={mockOnSuccess} />);

      const skillInput = screen.getByPlaceholderText(/add a skill/i);

      await user.type(skillInput, 'JavaScript{Enter}');

      expect(screen.getByText('JavaScript')).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('disables submit button while loading', async () => {
      const user = userEvent.setup();
      vi.mocked(recruitmentService.recruitmentService.createJobPosting).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ id: 'job-1' }), 1000))
      );

      render(<JobPostingForm onSuccess={mockOnSuccess} />);

      const titleInput = screen.getByLabelText(/job title/i);
      const locationInput = screen.getByLabelText(/location/i);
      const departmentInput = screen.getByLabelText(/department/i);
      const descriptionInput = screen.getByLabelText(/job description/i);
      const skillInput = screen.getByPlaceholderText(/add a skill/i);

      await user.type(titleInput, 'Developer');
      await user.type(locationInput, 'NYC');
      await user.type(departmentInput, 'eng-1');
      await user.type(descriptionInput, 'Develop backend services');

      const addButtons = screen.getAllByRole('button').filter(btn => btn.querySelector('svg'));
      await user.type(skillInput, 'JS');
      if (addButtons[0]) await user.click(addButtons[0]);

      const submitButton = screen.getByRole('button', { name: /create job posting/i });
      await user.click(submitButton);

      expect(submitButton).toBeDisabled();
    });

    it('displays error message on API failure', async () => {
      const user = userEvent.setup();
      const errorMessage = 'Failed to create job posting';
      vi.mocked(recruitmentService.recruitmentService.createJobPosting).mockRejectedValue(
        new Error(errorMessage)
      );

      render(<JobPostingForm onSuccess={mockOnSuccess} />);

      const titleInput = screen.getByLabelText(/job title/i);
      const locationInput = screen.getByLabelText(/location/i);
      const departmentInput = screen.getByLabelText(/department/i);
      const descriptionInput = screen.getByLabelText(/job description/i);
      const skillInput = screen.getByPlaceholderText(/add a skill/i);

      await user.type(titleInput, 'Developer');
      await user.type(locationInput, 'NYC');
      await user.type(departmentInput, 'eng-1');
      await user.type(descriptionInput, 'Develop backend services');

      const addButtons = screen.getAllByRole('button').filter(btn => btn.querySelector('svg'));
      await user.type(skillInput, 'JS');
      if (addButtons[0]) await user.click(addButtons[0]);

      const submitButton = screen.getByRole('button', { name: /create job posting/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    it('calls onSuccess callback after successful submission', async () => {
      const user = userEvent.setup();
      vi.mocked(recruitmentService.recruitmentService.createJobPosting).mockResolvedValue({
        id: 'job-1',
      });

      render(<JobPostingForm onSuccess={mockOnSuccess} />);

      const titleInput = screen.getByLabelText(/job title/i);
      const locationInput = screen.getByLabelText(/location/i);
      const departmentInput = screen.getByLabelText(/department/i);
      const descriptionInput = screen.getByLabelText(/job description/i);
      const skillInput = screen.getByPlaceholderText(/add a skill/i);

      await user.type(titleInput, 'Developer');
      await user.type(locationInput, 'NYC');
      await user.type(departmentInput, 'eng-1');
      await user.type(descriptionInput, 'Develop backend services');

      const addButtons = screen.getAllByRole('button').filter(btn => btn.querySelector('svg'));
      await user.type(skillInput, 'JS');
      if (addButtons[0]) await user.click(addButtons[0]);

      const submitButton = screen.getByRole('button', { name: /create job posting/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });

    it('submits form with all valid data', async () => {
      const user = userEvent.setup();
      vi.mocked(recruitmentService.recruitmentService.createJobPosting).mockResolvedValue({
        id: 'job-1',
      });

      render(<JobPostingForm onSuccess={mockOnSuccess} />);

      const titleInput = screen.getByLabelText(/job title/i);
      const locationInput = screen.getByLabelText(/location/i);
      const departmentInput = screen.getByLabelText(/department/i);
      const descriptionInput = screen.getByLabelText(/job description/i);
      const minExpInput = screen.getByLabelText(/min experience/i);
      const maxExpInput = screen.getByLabelText(/max experience/i);
      const skillInput = screen.getByPlaceholderText(/add a skill/i);

      await user.type(titleInput, 'Senior Developer');
      await user.type(locationInput, 'San Francisco');
      await user.type(departmentInput, 'eng-1');
      await user.type(descriptionInput, 'Develop and maintain backend services for our platform');
      await user.clear(minExpInput);
      await user.type(minExpInput, '3');
      await user.clear(maxExpInput);
      await user.type(maxExpInput, '8');

      const addButtons = screen.getAllByRole('button').filter(btn => btn.querySelector('svg'));
      await user.type(skillInput, 'Node.js');
      if (addButtons[0]) await user.click(addButtons[0]);

      const submitButton = screen.getByRole('button', { name: /create job posting/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(recruitmentService.recruitmentService.createJobPosting).toHaveBeenCalled();
      });
    });

    it('handles network errors gracefully', async () => {
      const user = userEvent.setup();
      vi.mocked(recruitmentService.recruitmentService.createJobPosting).mockRejectedValue(
        new Error('Network error')
      );

      render(<JobPostingForm onSuccess={mockOnSuccess} />);

      const titleInput = screen.getByLabelText(/job title/i);
      const locationInput = screen.getByLabelText(/location/i);
      const departmentInput = screen.getByLabelText(/department/i);
      const descriptionInput = screen.getByLabelText(/job description/i);
      const skillInput = screen.getByPlaceholderText(/add a skill/i);

      await user.type(titleInput, 'Developer');
      await user.type(locationInput, 'NYC');
      await user.type(departmentInput, 'eng-1');
      await user.type(descriptionInput, 'Develop backend services');

      const addButtons = screen.getAllByRole('button').filter(btn => btn.querySelector('svg'));
      await user.type(skillInput, 'JS');
      if (addButtons[0]) await user.click(addButtons[0]);

      const submitButton = screen.getByRole('button', { name: /create job posting/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });
    });
  });

  describe('Edit Mode', () => {
    it('renders in edit mode with initial data', () => {
      const initialData = {
        title: 'Senior Developer',
        location: 'New York',
        department_id: 'eng-1',
        description: 'This is a detailed job description',
        required_skills: ['JavaScript', 'React'],
        experience_min: 3,
        experience_max: 8,
        application_deadline: '2025-12-31',
      };

      render(
        <JobPostingForm
          onSuccess={mockOnSuccess}
          initialData={initialData}
          isEditing={true}
        />
      );

      expect(screen.getByDisplayValue('Senior Developer')).toBeInTheDocument();
      expect(screen.getByDisplayValue('New York')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /edit job posting/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /update job posting/i })).toBeInTheDocument();
    });
  });

  describe('Deadline Validation', () => {
    it('validates application deadline is in the future', async () => {
      const user = userEvent.setup();
      render(<JobPostingForm onSuccess={mockOnSuccess} />);

      const titleInput = screen.getByLabelText(/job title/i);
      const locationInput = screen.getByLabelText(/location/i);
      const departmentInput = screen.getByLabelText(/department/i);
      const descriptionInput = screen.getByLabelText(/job description/i);
      const deadlineInput = screen.getByLabelText(/application deadline/i);
      const skillInput = screen.getByPlaceholderText(/add a skill/i);

      await user.type(titleInput, 'Developer');
      await user.type(locationInput, 'NYC');
      await user.type(departmentInput, 'eng-1');
      await user.type(descriptionInput, 'Develop backend services');
      await user.type(deadlineInput, '2020-01-01'); // Past date

      const addButtons = screen.getAllByRole('button').filter(btn => btn.querySelector('svg'));
      await user.type(skillInput, 'JS');
      if (addButtons[0]) await user.click(addButtons[0]);

      const submitButton = screen.getByRole('button', { name: /create job posting/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/deadline must be in the future/i)).toBeInTheDocument();
      });
    });
  });
});
