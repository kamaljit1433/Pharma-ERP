import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InterviewFeedbackForm } from '../InterviewFeedbackForm';
import * as recruitmentService from '../../../services/recruitmentService';

vi.mock('../../../services/recruitmentService');

describe('InterviewFeedbackForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders feedback form with all fields', () => {
    render(<InterviewFeedbackForm interviewId="interview1" />);

    expect(screen.getByText('Interview Feedback')).toBeInTheDocument();
    expect(screen.getByText('Overall Rating')).toBeInTheDocument();
    expect(screen.getByText('Technical Skills')).toBeInTheDocument();
    expect(screen.getByText('Communication Skills')).toBeInTheDocument();
    expect(screen.getByText('Cultural Fit')).toBeInTheDocument();
    expect(screen.getByText('Overall Impression')).toBeInTheDocument();
    expect(screen.getByText('Recommendation')).toBeInTheDocument();
  });

  it('renders submit button', () => {
    render(<InterviewFeedbackForm interviewId="interview1" />);

    expect(screen.getByRole('button', { name: 'Submit Feedback' })).toBeInTheDocument();
  });

  it('renders cancel button when onCancel is provided', () => {
    const onCancel = vi.fn();
    render(<InterviewFeedbackForm interviewId="interview1" onCancel={onCancel} />);

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('calls onCancel when cancel button is clicked', () => {
    const onCancel = vi.fn();
    render(<InterviewFeedbackForm interviewId="interview1" onCancel={onCancel} />);

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelButton);

    expect(onCancel).toHaveBeenCalled();
  });

  it('allows changing recommendation', () => {
    render(<InterviewFeedbackForm interviewId="interview1" />);

    const recommendationSelect = screen.getByDisplayValue('Maybe');
    fireEvent.change(recommendationSelect, { target: { value: 'Strong Hire' } });

    expect(screen.getByDisplayValue('Strong Hire')).toBeInTheDocument();
  });

  it('allows entering overall impression', () => {
    render(<InterviewFeedbackForm interviewId="interview1" />);

    const impressionField = screen.getByPlaceholderText('Provide detailed feedback about the candidate...');
    fireEvent.change(impressionField, { target: { value: 'Great candidate with strong skills' } });

    expect(impressionField).toHaveValue('Great candidate with strong skills');
  });
});
