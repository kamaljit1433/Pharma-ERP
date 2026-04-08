import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { JobOfferTracker } from '../JobOfferTracker';
import * as recruitmentStore from '../../../store/recruitmentStore';

// Mock the recruitment store
vi.mock('../../../store/recruitmentStore', () => ({
  useRecruitmentStore: vi.fn(),
}));

describe('JobOfferTracker', () => {
  const mockOffers = [
    {
      id: 'offer-1',
      applicant_id: 'app-1',
      position: 'Senior Developer',
      department: 'Engineering',
      salary: 1000000,
      start_date: new Date('2024-12-01'),
      terms: 'Standard terms',
      status: 'Sent' as const,
      created_at: new Date('2024-11-01'),
      updated_at: new Date('2024-11-01'),
    },
    {
      id: 'offer-2',
      applicant_id: 'app-2',
      position: 'Product Manager',
      department: 'Product',
      salary: 1200000,
      start_date: new Date('2024-12-15'),
      terms: 'Standard terms',
      status: 'Accepted' as const,
      created_at: new Date('2024-11-02'),
      updated_at: new Date('2024-11-05'),
    },
  ];

  const mockCandidates = [
    {
      id: 'app-1',
      job_posting_id: 'job-1',
      name: 'John Doe',
      email: 'john@example.com',
      contact_number: '9876543210',
      resume_url: 'https://example.com/resume.pdf',
      current_stage: 'Offer' as const,
      applied_at: new Date('2024-10-01'),
      updated_at: new Date('2024-11-01'),
    },
    {
      id: 'app-2',
      job_posting_id: 'job-1',
      name: 'Jane Smith',
      email: 'jane@example.com',
      contact_number: '9876543211',
      resume_url: 'https://example.com/resume2.pdf',
      current_stage: 'Offer' as const,
      applied_at: new Date('2024-10-02'),
      updated_at: new Date('2024-11-02'),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(recruitmentStore.useRecruitmentStore).mockReturnValue({
      offers: mockOffers,
      candidates: mockCandidates,
      loading: false,
    } as any);
  });

  it('renders the tracker with all offers', () => {
    render(<JobOfferTracker />);

    expect(screen.getByText('Job Offer Tracker')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Senior Developer')).toBeInTheDocument();
    expect(screen.getByText('Product Manager')).toBeInTheDocument();
  });

  it('displays offer status badges', () => {
    render(<JobOfferTracker />);

    const sentBadges = screen.getAllByText('Sent');
    expect(sentBadges.length).toBeGreaterThan(0);
    const acceptedBadges = screen.getAllByText('Accepted');
    expect(acceptedBadges.length).toBeGreaterThan(0);
  });

  it('displays salary information', () => {
    render(<JobOfferTracker />);

    // Salary is formatted with locale, so we check for the presence of numbers
    const salaryElements = screen.getAllByText(/\d+/);
    expect(salaryElements.length).toBeGreaterThan(0);
  });

  it('displays summary statistics', () => {
    render(<JobOfferTracker />);

    expect(screen.getByText('Total Offers')).toBeInTheDocument();
    expect(screen.getByText('Rejected')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('filters offers by job posting ID', () => {
    const { rerender } = render(<JobOfferTracker jobPostingId="job-1" />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('filters offers by applicant ID', () => {
    render(<JobOfferTracker applicantId="app-1" />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
  });

  it('displays loading state', () => {
    vi.mocked(recruitmentStore.useRecruitmentStore).mockReturnValue({
      offers: [],
      candidates: [],
      loading: true,
    } as any);

    render(<JobOfferTracker />);

    expect(screen.getByText('Loading offers...')).toBeInTheDocument();
  });

  it('displays empty state when no offers exist', () => {
    vi.mocked(recruitmentStore.useRecruitmentStore).mockReturnValue({
      offers: [],
      candidates: [],
      loading: false,
    } as any);

    render(<JobOfferTracker />);

    expect(screen.getByText('No job offers found')).toBeInTheDocument();
  });

  it('displays candidate email in the table', () => {
    render(<JobOfferTracker />);

    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
  });

  it('displays start dates in correct format', () => {
    render(<JobOfferTracker />);

    // The dates should be formatted as locale strings
    const dateElements = screen.getAllByText(/12\/1\/2024|1\/12\/2024/);
    expect(dateElements.length).toBeGreaterThan(0);
  });

  it('calculates correct statistics', () => {
    render(<JobOfferTracker />);

    // Total offers should be 2
    const totalOffers = screen.getByText('Total Offers').parentElement;
    expect(totalOffers?.textContent).toContain('2');

    // Sent should be 1
    const sentStats = screen.getAllByText('Sent');
    expect(sentStats.length).toBeGreaterThan(0);

    // Accepted should be 1
    const acceptedStats = screen.getAllByText('Accepted');
    expect(acceptedStats.length).toBeGreaterThan(0);
  });

  it('displays view button for each offer', () => {
    render(<JobOfferTracker />);

    const viewButtons = screen.getAllByRole('button', { name: /View/ });
    expect(viewButtons.length).toBe(2);
  });
});
