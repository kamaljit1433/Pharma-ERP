/**
 * Salary calculation utilities
 * Handles salary component calculations, deductions, and net salary computation
 */

export interface SalaryCalculationInput {
  basicSalary: number;
  hra?: number;
  allowances?: Record<string, number>;
  pfPercentage?: number;
  esiPercentage?: number;
  taxAmount?: number;
  otherDeductions?: Record<string, number>;
  attendanceDays?: number;
  totalWorkingDays?: number;
}

export interface SalaryCalculationResult {
  basicSalary: number;
  hra: number;
  allowances: Record<string, number>;
  totalEarnings: number;
  pf: number;
  esi: number;
  tax: number;
  otherDeductions: Record<string, number>;
  totalDeductions: number;
  netSalary: number;
}

/**
 * Calculate total earnings from salary components
 */
export const calculateTotalEarnings = (
  basicSalary: number,
  hra: number = 0,
  allowances: Record<string, number> = {}
): number => {
  const allowancesTotal = Object.values(allowances).reduce((sum, val) => sum + val, 0);
  return basicSalary + hra + allowancesTotal;
};

/**
 * Calculate PF (Provident Fund) deduction
 * Standard: 12% of basic salary
 */
export const calculatePF = (basicSalary: number, pfPercentage: number = 12): number => {
  return Math.round((basicSalary * pfPercentage) / 100);
};

/**
 * Calculate ESI (Employee State Insurance) deduction
 * Standard: 0.75% of gross salary (applicable if gross < 21000)
 */
export const calculateESI = (
  grossSalary: number,
  esiPercentage: number = 0.75,
  esiLimit: number = 21000
): number => {
  if (grossSalary > esiLimit) {
    return 0;
  }
  return Math.round((grossSalary * esiPercentage) / 100);
};

/**
 * Calculate income tax based on slab
 * Indian income tax slabs (FY 2023-24)
 */
export const calculateIncomeTax = (annualSalary: number): number => {
  // Assuming standard deduction of 50,000
  const standardDeduction = 50000;
  const taxableIncome = Math.max(0, annualSalary - standardDeduction);

  if (taxableIncome <= 250000) {
    return 0;
  } else if (taxableIncome <= 500000) {
    return Math.round((taxableIncome - 250000) * 0.05);
  } else if (taxableIncome <= 1000000) {
    return Math.round(12500 + (taxableIncome - 500000) * 0.2);
  } else {
    return Math.round(112500 + (taxableIncome - 1000000) * 0.3);
  }
};

/**
 * Calculate total deductions
 */
export const calculateTotalDeductions = (
  pf: number,
  esi: number,
  tax: number,
  otherDeductions: Record<string, number> = {}
): number => {
  const otherDeductionsTotal = Object.values(otherDeductions).reduce((sum, val) => sum + val, 0);
  return pf + esi + tax + otherDeductionsTotal;
};

/**
 * Calculate net salary
 */
export const calculateNetSalary = (totalEarnings: number, totalDeductions: number): number => {
  return Math.max(0, totalEarnings - totalDeductions);
};

/**
 * Calculate pro-rata salary based on attendance
 */
export const calculateProRataSalary = (
  basicSalary: number,
  attendanceDays: number,
  totalWorkingDays: number
): number => {
  if (totalWorkingDays === 0) {
    return 0;
  }
  return Math.round((basicSalary * attendanceDays) / totalWorkingDays);
};

/**
 * Complete salary calculation
 */
export const calculateSalary = (input: SalaryCalculationInput): SalaryCalculationResult => {
  const basicSalary = input.basicSalary;
  const hra = input.hra || 0;
  const allowances = input.allowances || {};

  // Calculate pro-rata salary if attendance data is provided
  let adjustedBasicSalary = basicSalary;
  if (input.attendanceDays !== undefined && input.totalWorkingDays !== undefined) {
    adjustedBasicSalary = calculateProRataSalary(
      basicSalary,
      input.attendanceDays,
      input.totalWorkingDays
    );
  }

  // Calculate earnings
  const totalEarnings = calculateTotalEarnings(adjustedBasicSalary, hra, allowances);

  // Calculate deductions
  const pf = input.pfPercentage !== undefined ? calculatePF(adjustedBasicSalary, input.pfPercentage) : calculatePF(adjustedBasicSalary);
  const esi = input.esiPercentage !== undefined ? calculateESI(totalEarnings, input.esiPercentage) : calculateESI(totalEarnings);
  const tax = input.taxAmount || 0;
  const otherDeductions = input.otherDeductions || {};

  const totalDeductions = calculateTotalDeductions(pf, esi, tax, otherDeductions);

  // Calculate net salary
  const netSalary = calculateNetSalary(totalEarnings, totalDeductions);

  return {
    basicSalary: adjustedBasicSalary,
    hra,
    allowances,
    totalEarnings,
    pf,
    esi,
    tax,
    otherDeductions,
    totalDeductions,
    netSalary,
  };
};
