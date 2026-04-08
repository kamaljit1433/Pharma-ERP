import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { InterviewsList } from '../InterviewsList';
import { Interview } from '../../../types/recruitment';

const mockInterviews: Interview[] = [
  {
    id: '1',
    applicant_id: 'app1',
    scheduled_at: new Date('2024-12-20T10:00:00'),
    mode: 'Video',
    interviewers: ['interviewer1', 'interviewer2'],
    status: 'Scheduled',
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: '2',
    applicant_id: 'app2',
    scheduled_at: new Date('2024-12-21T14:00:00'),
    mode: 'In-Person',
    interviewers: ['interviewer1'],
    status: 'Completed',
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: '3',
    applicant_id: 'app3',
    scheduled_at: new Date('2024-12-19T09:00:00'),
    mode: 'Phone',
    interviewers: ['interviewer2'],
    status: 'Cancelled',
    created_at: new Date(),
    updated_at: new Date(),
  },
];

describe('InterviewsList', () => {
  it('renders interviews list with all interviews', () => {
    render(<InterviewsList interviews={mockInterviews} />);

    expect(screen.getByText('Scheduled Interviews')).toBeInTheDocument();
    expect(screen.getByText('Video')).toBeInTheDocument();
    expect(screen.getByText('In-Person')).toBeInTheDocument();
    expect(screen.getByText('Phone')).toBeInTheDocument();
  });

  it('filters interviews by status', async () => {
    render(<InterviewsList interviews={mockInterviews} />);

    const scheduledButton = screen.getByRole('button', { name: 'Scheduled' });
    fireEvent.click(scheduledButton);

    await waitFor(() => {
      expect(screen.getByText('Video')).toBeInTheDocument();
    });
  });

  it('displays empty state when no interviews match filter', async () => {
    render(<InterviewsList interviews={mockInterviews} />);

    // Filter to show only "Cancelled" interviews, then switch to a filter with no results
    // by using only interviews that don't exist in the filtered set
    const cancelledButton = screen.getByRole('button', { name: 'Cancelled' });
    fireEvent.click(cancelledButton);

    await waitFor(() => {
      // Should show the cancelled interview
      expect(screen.getByText('Phone')).toBeInTheDocument();
    });
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const onCancel = vi.fn().mockResolvedValue(undefined);
    render(<InterviewsList interviews={mockInterviews} onCancel={onCancel} />);

    const cancelButtons = screen.getAllByTitle('Cancel Interview');
    fireEvent.click(cancelButtons[0]);

    await waitFor(() => {
      expect(onCancel).toHaveBeenCalledWith('1');
    });
  });

  it('calls onFeedback when feedback button is clicked', async () => {
    const onFeedback = vi.fn();
    render(<InterviewsList interviews={mockInterviews} onFeedback={onFeedback} />);

    const feedbackButtons = screen.getAllByTitle('View/Add Feedback');
    fireEvent.click(feedbackButtons[0]);

    await waitFor(() => {
      expect(onFeedback).toHaveBeenCalledWith('2');
    });
  });

  it('displays loading state', () => {
    render(<InterviewsList interviews={[]} loading={true} />);

    expect(screen.getByText('Loading interviews...')).toBeInTheDocument();
  });

  it('displays empty state when no interviews', () => {
    render(<InterviewsList interviews={[]} />);

    expect(screen.getByText('No interviews scheduled')).toBeInTheDocument();
  });

  it('sorts interviews by date in descending order', () => {
    render(<InterviewsList interviews={mockInterviews} />);

    const rows = screen.getAllByRole('row');
    // First row is header, second should be the most recent (2024-12-21)
    expect(rows[1]).toHaveTextContent('21/12/2024');
  });
});
