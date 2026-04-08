import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { JobPostingDetails } from '../JobPostingDetails';
import * as recruitmentService from '../../../services/recruitmentService';

// Mock the recruitment service
vi.mock('../../../services/recruitmentService', () => ({
  recruitmentService: {
    getJobPosting: vi.fn(),
  },
}));

// Mock date-fns
vi.mock('date-fns', () => ({
  formatDistanceToNow: vi.fn(() => '2 days'),
}));

describe('JobPostingDetails', () => {
  const mockJobPosting = {
    id: '1',
    title: 'Senior Developer',
    location: 'New York, NY',
    department_id: 'eng-1',
    description: 'We are looking for a senior developer with 5+ years of experience.',
    required_skills: ['JavaScript', 'React', 'Node.js', 'TypeScript'],
    experience_min: 5,
    experience_max: 10,
    application_deadline: new Date('2025-12-31'),
    status: 'Open' as const,
    created_by: 'user-1',
    created_at: new Date('2025-01-01'),
    updated_at: new Date('2025-01-01'),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays job posting details after loading', async () => {
    vi.mocked(recruitmentService.recruitmentService.getJobPosting).mockResolvedValueOnce(
      mockJobPosting
    );

    render(<JobPostingDetails jobId="1" />);

    await waitFor(() => {
      expect(screen.getByText('Senior Developer')).toBeInTheDocument();
    });

    expect(screen.getByText('New York, NY')).toBeInTheDocument();
    expect(screen.getByText('5 - 10 years')).toBeInTheDocument();
  });

  it('displays all required skills', async () => {
    vi.mocked(recruitmentService.recruitmentService.getJobPosting).mockResolvedValueOnce(
      mockJobPosting
    );

    render(<JobPostingDetails jobId="1" />);

    await waitFor(() => {
      expect(screen.getByText('JavaScript')).toBeInTheDocument();
    });

    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Node.js')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
  });

  it('displays job status badge', async () => {
    vi.mocked(recruitmentService.recruitmentService.getJobPosting).mockResolvedValueOnce(
      mockJobPosting
    );

    render(<JobPostingDetails jobId="1" />);

    await waitFor(() => {
      expect(screen.getByText('Open')).toBeInTheDocument();
    });
  });

  it('displays error message when loading fails', async () => {
    const errorMessage = 'Failed to load job posting';
    vi.mocked(recruitmentService.recruitmentService.getJobPosting).mockRejectedValueOnce(
      new Error(errorMessage)
    );

    render(<JobPostingDetails jobId="1" />);

    await waitFor(() => {
      expect(screen.getByText('Error Loading Job Posting')).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('calls onEdit callback when Edit button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnEdit = vi.fn();

    vi.mocked(recruitmentService.recruitmentService.getJobPosting).mockResolvedValueOnce(
      mockJobPosting
    );

    render(<JobPostingDetails jobId="1" onEdit={mockOnEdit} />);

    await waitFor(() => {
      expect(screen.getByText('Senior Developer')).toBeInTheDocument();
    });

    const editButton = screen.getByRole('button', { name: /edit job posting/i });
    await user.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledWith(mockJobPosting);
  });

  it('fetches job details on mount', async () => {
    vi.mocked(recruitmentService.recruitmentService.getJobPosting).mockResolvedValueOnce(
      mockJobPosting
    );

    render(<JobPostingDetails jobId="1" />);

    await waitFor(() => {
      expect(recruitmentService.recruitmentService.getJobPosting).toHaveBeenCalledWith('1');
    });
  });
});
