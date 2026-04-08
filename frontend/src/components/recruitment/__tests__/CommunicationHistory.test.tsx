import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { CommunicationHistory } from '../CommunicationHistory';
import * as recruitmentService from '../../../services/recruitmentService';
import { CandidateCommunication } from '../../../types/recruitment';

// Mock the recruitment service
vi.mock('../../../services/recruitmentService', () => ({
  recruitmentService: {
    getCommunicationHistory: vi.fn(),
  },
}));

describe('CommunicationHistory', () => {
  const mockApplicantId = 'applicant-123';
  const mockApplicantName = 'John Doe';

  const mockCommunications: CandidateCommunication[] = [
    {
      id: 'comm-1',
      applicant_id: mockApplicantId,
      sender_id: 'user-1',
      sender_name: 'HR Manager',
      subject: 'Interview Scheduled',
      body: 'Your interview is scheduled for tomorrow at 10 AM',
      sent_at: new Date('2025-01-15T10:00:00'),
      read_at: new Date('2025-01-15T10:30:00'),
    },
    {
      id: 'comm-2',
      applicant_id: mockApplicantId,
      sender_id: 'user-2',
      sender_name: 'Recruiter',
      subject: 'Application Received',
      body: 'Thank you for applying. We will review your application and get back to you soon.',
      sent_at: new Date('2025-01-10T14:00:00'),
      read_at: undefined,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the communication history header', () => {
    vi.mocked(recruitmentService.recruitmentService.getCommunicationHistory).mockResolvedValueOnce(
      []
    );

    render(
      <CommunicationHistory
        applicantId={mockApplicantId}
        applicantName={mockApplicantName}
      />
    );

    expect(screen.getByText(/communication history/i)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(mockApplicantName))).toBeInTheDocument();
  });

  it('displays loading state initially', () => {
    vi.mocked(recruitmentService.recruitmentService.getCommunicationHistory).mockImplementationOnce(
      () => new Promise(() => {}) // Never resolves
    );

    render(
      <CommunicationHistory
        applicantId={mockApplicantId}
        applicantName={mockApplicantName}
      />
    );

    expect(screen.getByText(/loading communications/i)).toBeInTheDocument();
  });

  it('displays empty state when no communications exist', async () => {
    vi.mocked(recruitmentService.recruitmentService.getCommunicationHistory).mockResolvedValueOnce(
      []
    );

    render(
      <CommunicationHistory
        applicantId={mockApplicantId}
        applicantName={mockApplicantName}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/no communications yet/i)).toBeInTheDocument();
    });
  });

  it('displays communications when data is loaded', async () => {
    vi.mocked(recruitmentService.recruitmentService.getCommunicationHistory).mockResolvedValueOnce(
      mockCommunications
    );

    render(
      <CommunicationHistory
        applicantId={mockApplicantId}
        applicantName={mockApplicantName}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('HR Manager')).toBeInTheDocument();
      expect(screen.getByText('Recruiter')).toBeInTheDocument();
      expect(screen.getByText('Interview Scheduled')).toBeInTheDocument();
      expect(screen.getByText('Application Received')).toBeInTheDocument();
    });
  });

  it('displays read badge for read communications', async () => {
    vi.mocked(recruitmentService.recruitmentService.getCommunicationHistory).mockResolvedValueOnce(
      mockCommunications
    );

    render(
      <CommunicationHistory
        applicantId={mockApplicantId}
        applicantName={mockApplicantName}
      />
    );

    await waitFor(() => {
      const readBadges = screen.getAllByText(/read/i);
      expect(readBadges.length).toBeGreaterThan(0);
    });
  });

  it('displays formatted dates for communications', async () => {
    vi.mocked(recruitmentService.recruitmentService.getCommunicationHistory).mockResolvedValueOnce(
      mockCommunications
    );

    render(
      <CommunicationHistory
        applicantId={mockApplicantId}
        applicantName={mockApplicantName}
      />
    );

    await waitFor(() => {
      // Check for date formatting (should contain month abbreviation and year)
      const dateElements = screen.getAllByText(/Jan.*2025/i);
      expect(dateElements.length).toBeGreaterThan(0);
    });
  });

  it('displays error message when API call fails', async () => {
    const errorMessage = 'Failed to load communication history';
    vi.mocked(recruitmentService.recruitmentService.getCommunicationHistory).mockRejectedValueOnce(
      new Error(errorMessage)
    );

    render(
      <CommunicationHistory
        applicantId={mockApplicantId}
        applicantName={mockApplicantName}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('refetches communications when refreshTrigger changes', async () => {
    const { rerender } = render(
      <CommunicationHistory
        applicantId={mockApplicantId}
        applicantName={mockApplicantName}
        refreshTrigger={0}
      />
    );

    vi.mocked(recruitmentService.recruitmentService.getCommunicationHistory).mockResolvedValueOnce(
      mockCommunications
    );

    rerender(
      <CommunicationHistory
        applicantId={mockApplicantId}
        applicantName={mockApplicantName}
        refreshTrigger={1}
      />
    );

    await waitFor(() => {
      expect(recruitmentService.recruitmentService.getCommunicationHistory).toHaveBeenCalledTimes(2);
    });
  });

  it('handles array response from API', async () => {
    vi.mocked(recruitmentService.recruitmentService.getCommunicationHistory).mockResolvedValueOnce(
      mockCommunications
    );

    render(
      <CommunicationHistory
        applicantId={mockApplicantId}
        applicantName={mockApplicantName}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('HR Manager')).toBeInTheDocument();
    });
  });

  it('handles object response with data property from API', async () => {
    vi.mocked(recruitmentService.recruitmentService.getCommunicationHistory).mockResolvedValueOnce({
      data: mockCommunications,
    });

    render(
      <CommunicationHistory
        applicantId={mockApplicantId}
        applicantName={mockApplicantName}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('HR Manager')).toBeInTheDocument();
    });
  });

  it('displays communication body preview', async () => {
    vi.mocked(recruitmentService.recruitmentService.getCommunicationHistory).mockResolvedValueOnce(
      mockCommunications
    );

    render(
      <CommunicationHistory
        applicantId={mockApplicantId}
        applicantName={mockApplicantName}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Your interview is scheduled/i)).toBeInTheDocument();
    });
  });
});
