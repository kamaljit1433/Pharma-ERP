import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GratuityCalculator } from '../GratuityCalculator';
import * as benefitsService from '../../../services/benefitsService';

vi.mock('../../../services/benefitsService');

describe('GratuityCalculator Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render gratuity calculator component', () => {
    render(<GratuityCalculator employeeId="emp1" />);

    expect(screen.getByText('Gratuity Calculator')).toBeInTheDocument();
    expect(screen.getByText('Calculate Your Gratuity')).toBeInTheDocument();
  });

  it('should calculate gratuity with valid salary', async () => {
    (benefitsService.benefitsService.calculateGratuity as any).mockResolvedValue({
      data: {
        gratuity_amount: 288461.54,
        is_eligible: true,
        years_of_service: 10,
      },
    });

    render(<GratuityCalculator employeeId="emp1" />);

    const salaryInput = screen.getByPlaceholderText('Enter salary amount');
    fireEvent.change(salaryInput, { target: { value: '50000' } });

    const calculateButton = screen.getByText('Calculate Gratuity');
    fireEvent.click(calculateButton);

    await waitFor(() => {
      expect(screen.getByText('Gratuity Calculation Result')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
    });
  });

  it('should show error for invalid salary', async () => {
    render(<GratuityCalculator employeeId="emp1" />);

    const salaryInput = screen.getByPlaceholderText('Enter salary amount');
    fireEvent.change(salaryInput, { target: { value: '-1000' } });

    const calculateButton = screen.getByText('Calculate Gratuity');
    fireEvent.click(calculateButton);

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid salary amount')).toBeInTheDocument();
    });
  });

  it('should show ineligibility message for less than 5 years', async () => {
    (benefitsService.benefitsService.calculateGratuity as any).mockResolvedValue({
      data: {
        gratuity_amount: 0,
        is_eligible: false,
        years_of_service: 3,
      },
    });

    render(<GratuityCalculator employeeId="emp1" />);

    const salaryInput = screen.getByPlaceholderText('Enter salary amount');
    fireEvent.change(salaryInput, { target: { value: '50000' } });

    const calculateButton = screen.getByText('Calculate Gratuity');
    fireEvent.click(calculateButton);

    await waitFor(() => {
      expect(screen.getByText('Not Eligible')).toBeInTheDocument();
    });
  });

  it('should display calculation formula', async () => {
    (benefitsService.benefitsService.calculateGratuity as any).mockResolvedValue({
      data: {
        gratuity_amount: 288461.54,
        is_eligible: true,
        years_of_service: 10,
      },
    });

    render(<GratuityCalculator employeeId="emp1" />);

    const salaryInput = screen.getByPlaceholderText('Enter salary amount');
    fireEvent.change(salaryInput, { target: { value: '50000' } });

    const calculateButton = screen.getByText('Calculate Gratuity');
    fireEvent.click(calculateButton);

    await waitFor(() => {
      expect(screen.getByText('(Last Salary × Years of Service × 15) ÷ 26')).toBeInTheDocument();
    });
  });
});
