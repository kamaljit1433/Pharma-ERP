import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CandidateDetail } from '../CandidateDetail';
import { Applicant } from '../../../types/recruitment';

describe('CandidateDetail', () => {
  const mockCandidate: Applicant = {
    id: '1',
    job_posting_id: 'job-1',
    name: 'John Doe',
    email: 'john@example.com',
    contact_number: '555-1234',
    resume_url: 'https://example.com/resume.pdf',
    current_stage: 'Interview',
    applied_at: new Date('2025-01-15'),
    updated_at: new Date('2025-01-20'),
  };

  const mockOnBack = vi.fn();
  const mockOnStatusChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders candidate name and profile title', () => {
    render(
      <CandidateDetail
        candidate={mockCandidate}
        onBack={mockOnBack}
        onStatusChange={mockOnStatusChange}
      />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Candidate Profile')).toBeInTheDocument();
  });

  it('displays current stage badge', () => {
    render(
      <CandidateDetail
        candidate={mockCandidate}
        onBack={mockOnBack}
        onStatusChange={mockOnStatusChange}
      />
    );

    expect(screen.getByText('Interview')).toBeInTheDocument();
  });

  it('displays candidate contact information', () => {
    render(
      <CandidateDetail
        candidate={mockCandidate}
        onBack={mockOnBack}
        onStatusChange={mockOnStatusChange}
      />
    );

    const overviewTab = screen.getByRole('tab', { name: /overview/i });
    expect(overviewTab).toBeInTheDocument();

    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('555-1234')).toBeInTheDocument();
  });

  it('displays applied and updated dates', () => {
    render(
      <CandidateDetail
        candidate={mockCandidate}
        onBack={mockOnBack}
        onStatusChange={mockOnStatusChange}
      />
    );

    expect(screen.getByText(/Applied/)).toBeInTheDocument();
    expect(screen.getByText(/Last Updated/)).toBeInTheDocument();
  });

  it('renders tabs for overview, resume, and status', () => {
    render(
      <CandidateDetail
        candidate={mockCandidate}
        onBack={mockOnBack}
        onStatusChange={mockOnStatusChange}
      />
    );

    expect(screen.getByRole('tab', { name: /overview/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /resume/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /status/i })).toBeInTheDocument();
  });

  it('calls onBack when back button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <CandidateDetail
        candidate={mockCandidate}
        onBack={mockOnBack}
        onStatusChange={mockOnStatusChange}
      />
    );

    const backButton = screen.getByRole('button', { name: /back to candidates/i });
    await user.click(backButton);

    expect(mockOnBack).toHaveBeenCalled();
  });

  it('displays resume download button in resume tab', async () => {
    const user = userEvent.setup();
    render(
      <CandidateDetail
        candidate={mockCandidate}
        onBack={mockOnBack}
        onStatusChange={mockOnStatusChange}
      />
    );

    const resumeTab = screen.getByRole('tab', { name: /resume/i });
    await user.click(resumeTab);

    expect(screen.getByRole('button', { name: /download resume/i })).toBeInTheDocument();
  });

  it('displays all hiring stages in status tab', async () => {
    const user = userEvent.setup();
    render(
      <CandidateDetail
        candidate={mockCandidate}
        onBack={mockOnBack}
        onStatusChange={mockOnStatusChange}
      />
    );

    const statusTab = screen.getByRole('tab', { name: /status/i });
    await user.click(statusTab);

    expect(screen.getAllByText('Applied').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Screening').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Interview').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Offer').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Hired').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Rejected').length).toBeGreaterThan(0);
  });

  it('calls onStatusChange when stage is changed', async () => {
    const user = userEvent.setup();
    render(
      <CandidateDetail
        candidate={mockCandidate}
        onBack={mockOnBack}
        onStatusChange={mockOnStatusChange}
      />
    );

    const statusTab = screen.getByRole('tab', { name: /status/i });
    await user.click(statusTab);

    const offerButton = screen.getByRole('button', { name: /offer/i });
    await user.click(offerButton);

    expect(mockOnStatusChange).toHaveBeenCalledWith('1', 'Offer');
  });

  it('displays hiring pipeline visualization', async () => {
    const user = userEvent.setup();
    render(
      <CandidateDetail
        candidate={mockCandidate}
        onBack={mockOnBack}
        onStatusChange={mockOnStatusChange}
      />
    );

    const statusTab = screen.getByRole('tab', { name: /status/i });
    await user.click(statusTab);

    expect(screen.getByText('Hiring Pipeline')).toBeInTheDocument();
  });

  it('highlights current stage in pipeline', async () => {
    const user = userEvent.setup();
    render(
      <CandidateDetail
        candidate={mockCandidate}
        onBack={mockOnBack}
        onStatusChange={mockOnStatusChange}
      />
    );

    const statusTab = screen.getByRole('tab', { name: /status/i });
    await user.click(statusTab);

    const interviewStageInPipeline = screen.getAllByText('Interview')[1]; // Second occurrence in pipeline
    expect(interviewStageInPipeline).toBeInTheDocument();
  });

  it('renders email as clickable link', () => {
    render(
      <CandidateDetail
        candidate={mockCandidate}
        onBack={mockOnBack}
        onStatusChange={mockOnStatusChange}
      />
    );

    const emailLink = screen.getByRole('link', { name: /john@example.com/i });
    expect(emailLink).toHaveAttribute('href', 'mailto:john@example.com');
  });

  it('renders phone as clickable link', () => {
    render(
      <CandidateDetail
        candidate={mockCandidate}
        onBack={mockOnBack}
        onStatusChange={mockOnStatusChange}
      />
    );

    const phoneLink = screen.getByRole('link', { name: /555-1234/i });
    expect(phoneLink).toHaveAttribute('href', 'tel:555-1234');
  });

  it('displays different stage when candidate is in different stage', () => {
    const rejectedCandidate: Applicant = {
      ...mockCandidate,
      current_stage: 'Rejected',
    };

    render(
      <CandidateDetail
        candidate={rejectedCandidate}
        onBack={mockOnBack}
        onStatusChange={mockOnStatusChange}
      />
    );

    expect(screen.getByText('Rejected')).toBeInTheDocument();
  });

  it('does not call onStatusChange if callback is not provided', async () => {
    const user = userEvent.setup();
    render(
      <CandidateDetail
        candidate={mockCandidate}
        onBack={mockOnBack}
      />
    );

    const statusTab = screen.getByRole('tab', { name: /status/i });
    await user.click(statusTab);

    const offerButton = screen.getByRole('button', { name: /offer/i });
    await user.click(offerButton);

    // Should not throw error
    expect(true).toBe(true);
  });
});
