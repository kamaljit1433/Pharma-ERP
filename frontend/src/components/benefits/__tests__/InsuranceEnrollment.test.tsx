import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { InsuranceEnrollment } from '../InsuranceEnrollment';
import * as benefitsService from '../../../services/benefitsService';

vi.mock('../../../services/benefitsService');

describe('InsuranceEnrollment Component', () => {
  const mockPlans = [
    {
      id: '1',
      name: 'Health Insurance',
      provider: 'ICICI Lombard',
      coverage_type: 'Health',
      premium_amount: 5000,
      enrollment_start_date: new Date().toISOString(),
      enrollment_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const mockEnrollments = [
    {
      id: '1',
      insurance_plan_id: '1',
      status: 'active',
      effective_from: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (benefitsService.benefitsService.getInsurancePlans as any).mockResolvedValue({
      data: mockPlans,
    });
    (benefitsService.benefitsService.getEmployeeEnrollments as any).mockResolvedValue({
      data: mockEnrollments,
    });
  });

  it('should render insurance enrollment component', async () => {
    render(<InsuranceEnrollment employeeId="emp1" />);

    await waitFor(() => {
      expect(screen.getByText('Insurance Enrollment')).toBeInTheDocument();
    });
  });

  it('should display available plans', async () => {
    render(<InsuranceEnrollment employeeId="emp1" />);

    await waitFor(() => {
      expect(screen.getByText('Health Insurance')).toBeInTheDocument();
      expect(screen.getByText('ICICI Lombard')).toBeInTheDocument();
    });
  });

  it('should allow selecting a plan', async () => {
    render(<InsuranceEnrollment employeeId="emp1" />);

    await waitFor(() => {
      const planCard = screen.getByText('Health Insurance').closest('div');
      fireEvent.click(planCard!);
    });

    await waitFor(() => {
      expect(screen.getByText('Confirm Enrollment')).toBeInTheDocument();
    });
  });

  it('should display current enrollments', async () => {
    render(<InsuranceEnrollment employeeId="emp1" />);

    await waitFor(() => {
      expect(screen.getByText('Your Enrollments')).toBeInTheDocument();
    });
  });

  it('should show error message on enrollment failure', async () => {
    (benefitsService.benefitsService.enrollInInsurance as any).mockRejectedValue({
      response: { data: { message: 'Enrollment window closed' } },
    });

    render(<InsuranceEnrollment employeeId="emp1" />);

    await waitFor(() => {
      const planCard = screen.getByText('Health Insurance').closest('div');
      fireEvent.click(planCard!);
    });

    const confirmButton = await screen.findByText('Confirm Enrollment');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(screen.getByText('Enrollment window closed')).toBeInTheDocument();
    });
  });
});
