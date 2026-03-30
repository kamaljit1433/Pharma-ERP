import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { CompanyNoticeBoard } from '../CompanyNoticeBoard';

describe('CompanyNoticeBoard Component', () => {
  it('should render notice board', async () => {
    render(<CompanyNoticeBoard />);
    await waitFor(() => {
      expect(screen.getByText('Company Notice Board')).toBeInTheDocument();
    });
  });

  it('should display birthdays tab', async () => {
    render(<CompanyNoticeBoard />);
    await waitFor(() => {
      expect(screen.getByText(/Birthdays/)).toBeInTheDocument();
    });
  });

  it('should display anniversaries tab', async () => {
    render(<CompanyNoticeBoard />);
    await waitFor(() => {
      expect(screen.getByText(/Work Anniversaries/)).toBeInTheDocument();
    });
  });

  it('should display empty state for birthdays', async () => {
    render(<CompanyNoticeBoard />);
    await waitFor(() => {
      expect(screen.getByText('No birthdays this month')).toBeInTheDocument();
    });
  });

  it('should display empty state for anniversaries', async () => {
    render(<CompanyNoticeBoard />);
    
    const anniversariesTab = screen.getByText(/Work Anniversaries/);
    anniversariesTab.click();

    await waitFor(() => {
      expect(screen.getByText('No work anniversaries this month')).toBeInTheDocument();
    });
  });

  it('should have proper description', async () => {
    render(<CompanyNoticeBoard />);
    await waitFor(() => {
      expect(screen.getByText("Celebrate your team's special moments")).toBeInTheDocument();
    });
  });
});
