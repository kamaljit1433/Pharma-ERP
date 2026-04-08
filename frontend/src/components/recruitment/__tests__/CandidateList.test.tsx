import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CandidateList } from '../CandidateList';
import * as recruitmentStore from '../../../store/recruitmentStore';

// Mock the recruitment store
vi.mock('../../../store/recruitmentStore', () => ({
  useRecruitmentStore: vi.fn(),
}));

describe('CandidateList', () => {
  const mockCandidates = [
    {
      id: '1',
      job_posting_id: 'job-1',
      name: 'John Doe',
      email: 'john@example.com',
      contact_number: '555-1234',
      resume_url: 'https://example.com/resume1.pdf',
      current_stage: 'Interview' as const,
      applied_at: new Date('2025-01-15'),
      updated_at: new Date('2025-01-20'),
    },
    {
      id: '2',
      job_posting_id: 'job-1',
      name: 'Jane Smith',
      email: 'jane@example.com',
      contact_number: '555-5678',
      resume_url: 'https://example.com/resume2.pdf',
      current_stage: 'Screening' as const,
      applied_at: new Date('2025-01-10'),
      updated_at: new Date('2025-01-18'),
    },
  ];

  const mockOnSelectCandidate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (recruitmentStore.useRecruitmentStore as any).mockReturnValue({
      candidates: mockCandidates,
      loading: false,
      error: null,
      fetchCandidates: vi.fn(),
    });
  });

  it('renders candidate list with all candidates', () => {
    render(
      <CandidateList jobPostingId="job-1" onSelectCandidate={mockOnSelectCandidate} />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
  });

  it('displays candidate count', () => {
    render(
      <CandidateList jobPostingId="job-1" onSelectCandidate={mockOnSelectCandidate} />
    );

    expect(screen.getByText(/Candidates \(2\)/)).toBeInTheDocument();
  });

  it('displays candidate status badges', () => {
    render(
      <CandidateList jobPostingId="job-1" onSelectCandidate={mockOnSelectCandidate} />
    );

    expect(screen.getByText('Interview')).toBeInTheDocument();
    expect(screen.getByText('Screening')).toBeInTheDocument();
  });

  it('filters candidates by search term', async () => {
    const user = userEvent.setup();
    render(
      <CandidateList jobPostingId="job-1" onSelectCandidate={mockOnSelectCandidate} />
    );

    const searchInput = screen.getByPlaceholderText(/search by name or email/i);
    await user.type(searchInput, 'John');

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
  });

  it('filters candidates by email', async () => {
    const user = userEvent.setup();
    render(
      <CandidateList jobPostingId="job-1" onSelectCandidate={mockOnSelectCandidate} />
    );

    const searchInput = screen.getByPlaceholderText(/search by name or email/i);
    await user.type(searchInput, 'jane@');

    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
  });

  it('calls onSelectCandidate when candidate is clicked', async () => {
    const user = userEvent.setup();
    render(
      <CandidateList jobPostingId="job-1" onSelectCandidate={mockOnSelectCandidate} />
    );

    const selectButtons = screen.getAllByRole('button');
    await user.click(selectButtons[selectButtons.length - 1]); // Click the last button (first candidate)

    expect(mockOnSelectCandidate).toHaveBeenCalled();
  });

  it('displays loading state', () => {
    (recruitmentStore.useRecruitmentStore as any).mockReturnValue({
      candidates: [],
      loading: true,
      error: null,
      fetchCandidates: vi.fn(),
    });

    render(
      <CandidateList jobPostingId="job-1" onSelectCandidate={mockOnSelectCandidate} />
    );

    // Check for loading spinner
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('displays error message when error occurs', () => {
    const errorMessage = 'Failed to fetch candidates';
    (recruitmentStore.useRecruitmentStore as any).mockReturnValue({
      candidates: [],
      loading: false,
      error: errorMessage,
      fetchCandidates: vi.fn(),
    });

    render(
      <CandidateList jobPostingId="job-1" onSelectCandidate={mockOnSelectCandidate} />
    );

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('displays empty state when no candidates match search', async () => {
    const user = userEvent.setup();
    render(
      <CandidateList jobPostingId="job-1" onSelectCandidate={mockOnSelectCandidate} />
    );

    const searchInput = screen.getByPlaceholderText(/search by name or email/i);
    await user.type(searchInput, 'nonexistent');

    expect(screen.getByText('No candidates found')).toBeInTheDocument();
  });

  it('displays applied date for each candidate', () => {
    render(
      <CandidateList jobPostingId="job-1" onSelectCandidate={mockOnSelectCandidate} />
    );

    const appliedElements = screen.getAllByText(/Applied:/);
    expect(appliedElements.length).toBeGreaterThan(0);
  });

  it('fetches candidates on mount', () => {
    const mockFetchCandidates = vi.fn();
    (recruitmentStore.useRecruitmentStore as any).mockReturnValue({
      candidates: mockCandidates,
      loading: false,
      error: null,
      fetchCandidates: mockFetchCandidates,
    });

    render(
      <CandidateList jobPostingId="job-1" onSelectCandidate={mockOnSelectCandidate} />
    );

    expect(mockFetchCandidates).toHaveBeenCalledWith({ job_posting_id: 'job-1' });
  });

  it('filters candidates by job posting ID', () => {
    const mixedCandidates = [
      ...mockCandidates,
      {
        id: '3',
        job_posting_id: 'job-2',
        name: 'Bob Wilson',
        email: 'bob@example.com',
        contact_number: '555-9999',
        resume_url: 'https://example.com/resume3.pdf',
        current_stage: 'Applied' as const,
        applied_at: new Date('2025-01-20'),
        updated_at: new Date('2025-01-20'),
      },
    ];

    (recruitmentStore.useRecruitmentStore as any).mockReturnValue({
      candidates: mixedCandidates,
      loading: false,
      error: null,
      fetchCandidates: vi.fn(),
    });

    render(
      <CandidateList jobPostingId="job-1" onSelectCandidate={mockOnSelectCandidate} />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.queryByText('Bob Wilson')).not.toBeInTheDocument();
  });
});
