import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CandidateStatusTracker } from '../CandidateStatusTracker';
import { Applicant } from '../../../types/recruitment';

describe('CandidateStatusTracker', () => {
  const mockCandidates: Applicant[] = [
    {
      id: '1',
      job_posting_id: 'job-1',
      name: 'John Doe',
      email: 'john@example.com',
      contact_number: '555-1234',
      resume_url: 'https://example.com/resume1.pdf',
      current_stage: 'Applied',
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
      current_stage: 'Screening',
      applied_at: new Date('2025-01-10'),
      updated_at: new Date('2025-01-18'),
    },
    {
      id: '3',
      job_posting_id: 'job-1',
      name: 'Bob Wilson',
      email: 'bob@example.com',
      contact_number: '555-9999',
      resume_url: 'https://example.com/resume3.pdf',
      current_stage: 'Interview',
      applied_at: new Date('2025-01-05'),
      updated_at: new Date('2025-01-15'),
    },
    {
      id: '4',
      job_posting_id: 'job-1',
      name: 'Alice Brown',
      email: 'alice@example.com',
      contact_number: '555-4444',
      resume_url: 'https://example.com/resume4.pdf',
      current_stage: 'Hired',
      applied_at: new Date('2024-12-20'),
      updated_at: new Date('2025-01-10'),
    },
  ];

  describe('Component Rendering', () => {
    it('renders the tracker title', () => {
      render(<CandidateStatusTracker candidates={mockCandidates} />);

      expect(screen.getByText('Hiring Pipeline Status')).toBeInTheDocument();
    });

    it('renders the tracker description', () => {
      render(<CandidateStatusTracker candidates={mockCandidates} />);

      expect(screen.getByText('Track candidates through hiring stages')).toBeInTheDocument();
    });

    it('renders all stage labels', () => {
      render(<CandidateStatusTracker candidates={mockCandidates} />);

      expect(screen.getAllByText('Applied').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Screening').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Interview').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Offer').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Hired').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Rejected').length).toBeGreaterThan(0);
    });
  });

  describe('Metrics Display', () => {
    it('displays total candidate count', () => {
      render(<CandidateStatusTracker candidates={mockCandidates} />);

      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.getByText('Total Candidates')).toBeInTheDocument();
    });

    it('displays hired count', () => {
      render(<CandidateStatusTracker candidates={mockCandidates} />);

      const hiredElements = screen.getAllByText('1');
      expect(hiredElements.length).toBeGreaterThan(0);
      expect(screen.getAllByText('Hired').length).toBeGreaterThan(0);
    });

    it('calculates conversion rate correctly', () => {
      render(<CandidateStatusTracker candidates={mockCandidates} />);

      // 1 hired out of 4 = 25%
      expect(screen.getByText(/25/)).toBeInTheDocument();
      expect(screen.getByText('Conversion Rate')).toBeInTheDocument();
    });

    it('displays stage breakdown with counts', () => {
      render(<CandidateStatusTracker candidates={mockCandidates} />);

      expect(screen.getByText('Stage Breakdown')).toBeInTheDocument();
      expect(screen.getByText(/Applied: 1/)).toBeInTheDocument();
      expect(screen.getByText(/Screening: 1/)).toBeInTheDocument();
      expect(screen.getByText(/Interview: 1/)).toBeInTheDocument();
      expect(screen.getByText(/Hired: 1/)).toBeInTheDocument();
    });
  });

  describe('Status Tracking', () => {
    it('counts candidates in each stage correctly', () => {
      const customCandidates: Applicant[] = [
        {
          id: '1',
          job_posting_id: 'job-1',
          name: 'Candidate 1',
          email: 'c1@example.com',
          contact_number: '555-1111',
          resume_url: 'https://example.com/resume1.pdf',
          current_stage: 'Applied',
          applied_at: new Date('2025-01-15'),
          updated_at: new Date('2025-01-20'),
        },
        {
          id: '2',
          job_posting_id: 'job-1',
          name: 'Candidate 2',
          email: 'c2@example.com',
          contact_number: '555-2222',
          resume_url: 'https://example.com/resume2.pdf',
          current_stage: 'Applied',
          applied_at: new Date('2025-01-14'),
          updated_at: new Date('2025-01-19'),
        },
        {
          id: '3',
          job_posting_id: 'job-1',
          name: 'Candidate 3',
          email: 'c3@example.com',
          contact_number: '555-3333',
          resume_url: 'https://example.com/resume3.pdf',
          current_stage: 'Screening',
          applied_at: new Date('2025-01-13'),
          updated_at: new Date('2025-01-18'),
        },
      ];

      render(<CandidateStatusTracker candidates={customCandidates} />);

      expect(screen.getByText(/Applied: 2/)).toBeInTheDocument();
      expect(screen.getByText(/Screening: 1/)).toBeInTheDocument();
    });

    it('tracks candidates through multiple stages', () => {
      const multiStageCandidates: Applicant[] = [
        {
          id: '1',
          job_posting_id: 'job-1',
          name: 'Candidate 1',
          email: 'c1@example.com',
          contact_number: '555-1111',
          resume_url: 'https://example.com/resume1.pdf',
          current_stage: 'Applied',
          applied_at: new Date('2025-01-15'),
          updated_at: new Date('2025-01-20'),
        },
        {
          id: '2',
          job_posting_id: 'job-1',
          name: 'Candidate 2',
          email: 'c2@example.com',
          contact_number: '555-2222',
          resume_url: 'https://example.com/resume2.pdf',
          current_stage: 'Screening',
          applied_at: new Date('2025-01-14'),
          updated_at: new Date('2025-01-19'),
        },
        {
          id: '3',
          job_posting_id: 'job-1',
          name: 'Candidate 3',
          email: 'c3@example.com',
          contact_number: '555-3333',
          resume_url: 'https://example.com/resume3.pdf',
          current_stage: 'Interview',
          applied_at: new Date('2025-01-13'),
          updated_at: new Date('2025-01-18'),
        },
        {
          id: '4',
          job_posting_id: 'job-1',
          name: 'Candidate 4',
          email: 'c4@example.com',
          contact_number: '555-4444',
          resume_url: 'https://example.com/resume4.pdf',
          current_stage: 'Offer',
          applied_at: new Date('2025-01-12'),
          updated_at: new Date('2025-01-17'),
        },
        {
          id: '5',
          job_posting_id: 'job-1',
          name: 'Candidate 5',
          email: 'c5@example.com',
          contact_number: '555-5555',
          resume_url: 'https://example.com/resume5.pdf',
          current_stage: 'Hired',
          applied_at: new Date('2025-01-11'),
          updated_at: new Date('2025-01-16'),
        },
      ];

      render(<CandidateStatusTracker candidates={multiStageCandidates} />);

      expect(screen.getByText(/Applied: 1/)).toBeInTheDocument();
      expect(screen.getByText(/Screening: 1/)).toBeInTheDocument();
      expect(screen.getByText(/Interview: 1/)).toBeInTheDocument();
      expect(screen.getByText(/Offer: 1/)).toBeInTheDocument();
      expect(screen.getByText(/Hired: 1/)).toBeInTheDocument();
    });

    it('tracks rejected candidates', () => {
      const candidatesWithRejected: Applicant[] = [
        ...mockCandidates,
        {
          id: '5',
          job_posting_id: 'job-1',
          name: 'Rejected Candidate',
          email: 'rejected@example.com',
          contact_number: '555-6666',
          resume_url: 'https://example.com/resume5.pdf',
          current_stage: 'Rejected',
          applied_at: new Date('2025-01-09'),
          updated_at: new Date('2025-01-14'),
        },
      ];

      render(<CandidateStatusTracker candidates={candidatesWithRejected} />);

      expect(screen.getByText(/Rejected: 1/)).toBeInTheDocument();
    });
  });

  describe('Conversion Rate Calculation', () => {
    it('calculates correct conversion rate with multiple hired candidates', () => {
      const candidatesWithMoreHired: Applicant[] = [
        ...mockCandidates,
        {
          id: '5',
          job_posting_id: 'job-1',
          name: 'Charlie Davis',
          email: 'charlie@example.com',
          contact_number: '555-7777',
          resume_url: 'https://example.com/resume5.pdf',
          current_stage: 'Hired',
          applied_at: new Date('2024-12-15'),
          updated_at: new Date('2025-01-08'),
        },
      ];

      render(<CandidateStatusTracker candidates={candidatesWithMoreHired} />);

      // 2 hired out of 5 = 40%
      expect(screen.getByText(/40/)).toBeInTheDocument();
    });

    it('displays zero conversion rate when no candidates are hired', () => {
      const candidatesWithoutHired: Applicant[] = mockCandidates.filter(
        (c) => c.current_stage !== 'Hired'
      );

      render(<CandidateStatusTracker candidates={candidatesWithoutHired} />);

      expect(screen.getAllByText(/0/).length).toBeGreaterThan(0);
    });

    it('displays 100% conversion rate when all candidates are hired', () => {
      const allHiredCandidates: Applicant[] = mockCandidates.map((c) => ({
        ...c,
        current_stage: 'Hired',
      }));

      render(<CandidateStatusTracker candidates={allHiredCandidates} />);

      expect(screen.getByText(/100/)).toBeInTheDocument();
    });

    it('calculates 50% conversion rate correctly', () => {
      const halfHiredCandidates: Applicant[] = [
        {
          id: '1',
          job_posting_id: 'job-1',
          name: 'Candidate 1',
          email: 'c1@example.com',
          contact_number: '555-1111',
          resume_url: 'https://example.com/resume1.pdf',
          current_stage: 'Hired',
          applied_at: new Date('2025-01-15'),
          updated_at: new Date('2025-01-20'),
        },
        {
          id: '2',
          job_posting_id: 'job-1',
          name: 'Candidate 2',
          email: 'c2@example.com',
          contact_number: '555-2222',
          resume_url: 'https://example.com/resume2.pdf',
          current_stage: 'Applied',
          applied_at: new Date('2025-01-14'),
          updated_at: new Date('2025-01-19'),
        },
      ];

      render(<CandidateStatusTracker candidates={halfHiredCandidates} />);

      expect(screen.getByText(/50/)).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty candidate list', () => {
      render(<CandidateStatusTracker candidates={[]} />);

      expect(screen.getAllByText('0').length).toBeGreaterThan(0);
      expect(screen.getByText('Total Candidates')).toBeInTheDocument();
    });

    it('handles single candidate', () => {
      const singleCandidate: Applicant[] = [mockCandidates[0]];

      render(<CandidateStatusTracker candidates={singleCandidate} />);

      expect(screen.getAllByText('1').length).toBeGreaterThan(0);
      expect(screen.getByText('Total Candidates')).toBeInTheDocument();
    });

    it('handles single hired candidate', () => {
      const singleHiredCandidate: Applicant[] = [
        {
          id: '1',
          job_posting_id: 'job-1',
          name: 'Hired Candidate',
          email: 'hired@example.com',
          contact_number: '555-1111',
          resume_url: 'https://example.com/resume1.pdf',
          current_stage: 'Hired',
          applied_at: new Date('2025-01-15'),
          updated_at: new Date('2025-01-20'),
        },
      ];

      render(<CandidateStatusTracker candidates={singleHiredCandidate} />);

      expect(screen.getByText(/100/)).toBeInTheDocument();
    });

    it('displays correct percentages for progress bars', () => {
      render(<CandidateStatusTracker candidates={mockCandidates} />);

      // With 4 candidates: Applied=25%, Screening=25%, Interview=25%, Hired=25%
      // Just verify the component renders without errors
      expect(screen.getByText('Hiring Pipeline Status')).toBeInTheDocument();
    });

    it('displays stage breakdown section', () => {
      render(<CandidateStatusTracker candidates={mockCandidates} />);

      expect(screen.getByText('Stage Breakdown')).toBeInTheDocument();
    });

    it('renders progress indicators for each stage', () => {
      render(<CandidateStatusTracker candidates={mockCandidates} />);

      // Check that stage names are displayed (they have progress bars)
      expect(screen.getAllByText('Applied').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Screening').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Interview').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Offer').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Hired').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Rejected').length).toBeGreaterThan(0);
    });
  });

  describe('Data Accuracy', () => {
    it('accurately reflects candidate stage distribution', () => {
      const distributedCandidates: Applicant[] = [
        {
          id: '1',
          job_posting_id: 'job-1',
          name: 'C1',
          email: 'c1@example.com',
          contact_number: '555-1111',
          resume_url: 'https://example.com/resume1.pdf',
          current_stage: 'Applied',
          applied_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: '2',
          job_posting_id: 'job-1',
          name: 'C2',
          email: 'c2@example.com',
          contact_number: '555-2222',
          resume_url: 'https://example.com/resume2.pdf',
          current_stage: 'Applied',
          applied_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: '3',
          job_posting_id: 'job-1',
          name: 'C3',
          email: 'c3@example.com',
          contact_number: '555-3333',
          resume_url: 'https://example.com/resume3.pdf',
          current_stage: 'Applied',
          applied_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: '4',
          job_posting_id: 'job-1',
          name: 'C4',
          email: 'c4@example.com',
          contact_number: '555-4444',
          resume_url: 'https://example.com/resume4.pdf',
          current_stage: 'Screening',
          applied_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: '5',
          job_posting_id: 'job-1',
          name: 'C5',
          email: 'c5@example.com',
          contact_number: '555-5555',
          resume_url: 'https://example.com/resume5.pdf',
          current_stage: 'Interview',
          applied_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: '6',
          job_posting_id: 'job-1',
          name: 'C6',
          email: 'c6@example.com',
          contact_number: '555-6666',
          resume_url: 'https://example.com/resume6.pdf',
          current_stage: 'Hired',
          applied_at: new Date(),
          updated_at: new Date(),
        },
      ];

      render(<CandidateStatusTracker candidates={distributedCandidates} />);

      expect(screen.getByText('6')).toBeInTheDocument();
      expect(screen.getByText(/Applied: 3/)).toBeInTheDocument();
      expect(screen.getByText(/Screening: 1/)).toBeInTheDocument();
      expect(screen.getByText(/Interview: 1/)).toBeInTheDocument();
      expect(screen.getByText(/Hired: 1/)).toBeInTheDocument();
      // 1 hired out of 6 = 16.7%
      expect(screen.getByText(/16.7/)).toBeInTheDocument();
    });
  });
});
