import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PerformanceReviewForm } from '../PerformanceReviewForm';
import { usePerformanceStore } from '../../../store/performanceStore';
import { vi } from 'vitest';

vi.mock('../../../store/performanceStore');

describe('PerformanceReviewForm Component', () => {
  const mockSubmitReview = vi.fn();
  const mockClearError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (usePerformanceStore as any).mockReturnValue({
      submitReview: mockSubmitReview,
      error: null,
      clearError: mockClearError,
    });
  });

  it('renders self assessment form', () => {
    render(<PerformanceReviewForm employeeId="emp1" cycleId="cycle1" reviewType="self" />);
    expect(screen.getByText('Self Assessment')).toBeInTheDocument();
  });

  it('renders manager review form', () => {
    render(<PerformanceReviewForm employeeId="emp1" cycleId="cycle1" reviewType="manager" />);
    expect(screen.getByText('Manager Review')).toBeInTheDocument();
  });

  it('renders peer review form', () => {
    render(<PerformanceReviewForm employeeId="emp1" cycleId="cycle1" reviewType="peer" />);
    expect(screen.getByText('Peer Review')).toBeInTheDocument();
  });

  it('displays rating options', async () => {
    render(<PerformanceReviewForm employeeId="emp1" cycleId="cycle1" reviewType="self" />);
    const ratingSelect = screen.getByLabelText('Rating (1-5 Stars)');
    await userEvent.click(ratingSelect);
    expect(screen.getByText(/Needs Improvement/)).toBeInTheDocument();
    expect(screen.getByText(/Outstanding/)).toBeInTheDocument();
  });

  it('displays star rating visualization', async () => {
    render(<PerformanceReviewForm employeeId="emp1" cycleId="cycle1" reviewType="self" />);
    const ratingSelect = screen.getByLabelText('Rating (1-5 Stars)');
    await userEvent.click(ratingSelect);
    await userEvent.click(screen.getByText(/4 Stars/));
    
    const stars = screen.getAllByRole('img', { hidden: true });
    expect(stars.length).toBeGreaterThan(0);
  });

  it('submits review with valid data', async () => {
    mockSubmitReview.mockResolvedValue({});
    render(<PerformanceReviewForm employeeId="emp1" cycleId="cycle1" reviewType="self" />);

    const ratingSelect = screen.getByLabelText('Rating (1-5 Stars)');
    await userEvent.click(ratingSelect);
    await userEvent.click(screen.getByText(/4 Stars/));

    const commentsInput = screen.getByLabelText('Review comments');
    await userEvent.type(commentsInput, 'Great performance this quarter');

    const submitButton = screen.getByRole('button', { name: /Submit Review/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSubmitReview).toHaveBeenCalledWith(
        expect.objectContaining({
          employeeId: 'emp1',
          cycleId: 'cycle1',
          reviewType: 'self',
          rating: 4,
          comments: 'Great performance this quarter',
        })
      );
    });
  });

  it('displays success message after submission', async () => {
    mockSubmitReview.mockResolvedValue({});
    render(<PerformanceReviewForm employeeId="emp1" cycleId="cycle1" reviewType="self" />);

    const ratingSelect = screen.getByLabelText('Rating (1-5 Stars)');
    await userEvent.click(ratingSelect);
    await userEvent.click(screen.getByText(/3 Stars/));

    const commentsInput = screen.getByLabelText('Review comments');
    await userEvent.type(commentsInput, 'Meets expectations');

    const submitButton = screen.getByRole('button', { name: /Submit Review/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Review submitted successfully')).toBeInTheDocument();
    });
  });

  it('displays error message on submission failure', async () => {
    const errorMessage = 'Failed to submit review';
    (usePerformanceStore as any).mockReturnValue({
      submitReview: mockSubmitReview,
      error: errorMessage,
      clearError: mockClearError,
    });

    render(<PerformanceReviewForm employeeId="emp1" cycleId="cycle1" reviewType="self" />);
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('calls onSuccess callback after submission', async () => {
    mockSubmitReview.mockResolvedValue({});
    const onSuccess = vi.fn();
    render(
      <PerformanceReviewForm
        employeeId="emp1"
        cycleId="cycle1"
        reviewType="self"
        onSuccess={onSuccess}
      />
    );

    const ratingSelect = screen.getByLabelText('Rating (1-5 Stars)');
    await userEvent.click(ratingSelect);
    await userEvent.click(screen.getByText(/5 Stars/));

    const commentsInput = screen.getByLabelText('Review comments');
    await userEvent.type(commentsInput, 'Outstanding performance');

    const submitButton = screen.getByRole('button', { name: /Submit Review/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('resets form after successful submission', async () => {
    mockSubmitReview.mockResolvedValue({});
    render(<PerformanceReviewForm employeeId="emp1" cycleId="cycle1" reviewType="self" />);

    const ratingSelect = screen.getByLabelText('Rating (1-5 Stars)');
    await userEvent.click(ratingSelect);
    await userEvent.click(screen.getByText(/2 Stars/));

    const commentsInput = screen.getByLabelText('Review comments') as HTMLTextAreaElement;
    await userEvent.type(commentsInput, 'Below expectations');

    const submitButton = screen.getByRole('button', { name: /Submit Review/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(commentsInput.value).toBe('');
    });
  });

  it('displays character count for comments', async () => {
    render(<PerformanceReviewForm employeeId="emp1" cycleId="cycle1" reviewType="self" />);
    const commentsInput = screen.getByLabelText('Review comments');
    await userEvent.type(commentsInput, 'Test comment');
    expect(screen.getByText('12 characters')).toBeInTheDocument();
  });
});
