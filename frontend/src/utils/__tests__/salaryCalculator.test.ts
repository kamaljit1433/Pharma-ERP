import { describe, it, expect } from 'vitest';
import {
  calculateTotalEarnings,
  calculatePF,
  calculateESI,
  calculateIncomeTax,
  calculateTotalDeductions,
  calculateNetSalary,
  calculateProRataSalary,
  calculateSalary,
} from '../salaryCalculator';

describe('Salary Calculator Utilities', () => {
  describe('calculateTotalEarnings', () => {
    it('should calculate total earnings with basic salary only', () => {
      const result = calculateTotalEarnings(50000);
      expect(result).toBe(50000);
    });

    it('should calculate total earnings with HRA', () => {
      const result = calculateTotalEarnings(50000, 10000);
      expect(result).toBe(60000);
    });

    it('should calculate total earnings with allowances', () => {
      const allowances = { travel: 5000, medical: 2000 };
      const result = calculateTotalEarnings(50000, 10000, allowances);
      expect(result).toBe(67000);
    });

    it('should handle empty allowances', () => {
      const result = calculateTotalEarnings(50000, 10000, {});
      expect(result).toBe(60000);
    });
  });

  describe('calculatePF', () => {
    it('should calculate PF at 12% (default)', () => {
      const result = calculatePF(50000);
      expect(result).toBe(6000);
    });

    it('should calculate PF at custom percentage', () => {
      const result = calculatePF(50000, 10);
      expect(result).toBe(5000);
    });

    it('should round PF correctly', () => {
      const result = calculatePF(50001);
      expect(result).toBe(6000); // 50001 * 0.12 = 6000.12, rounded to 6000
    });
  });

  describe('calculateESI', () => {
    it('should calculate ESI at 0.75% for salary below limit', () => {
      const result = calculateESI(20000);
      expect(result).toBe(150); // 20000 * 0.0075 = 150
    });

    it('should return 0 ESI for salary above limit', () => {
      const result = calculateESI(25000);
      expect(result).toBe(0);
    });

    it('should calculate ESI at custom percentage', () => {
      const result = calculateESI(20000, 1);
      expect(result).toBe(200); // 20000 * 0.01 = 200
    });

    it('should calculate ESI with custom limit', () => {
      const result = calculateESI(25000, 0.75, 30000);
      expect(result).toBe(188); // 25000 * 0.0075 = 187.5, rounded to 188
    });
  });

  describe('calculateIncomeTax', () => {
    it('should return 0 tax for income below slab', () => {
      const result = calculateIncomeTax(250000);
      expect(result).toBe(0);
    });

    it('should calculate tax for 5% slab', () => {
      const result = calculateIncomeTax(400000);
      // Taxable income = 400000 - 50000 = 350000
      // Tax = (350000 - 250000) * 0.05 = 5000
      expect(result).toBe(5000);
    });

    it('should calculate tax for 20% slab', () => {
      const result = calculateIncomeTax(700000);
      // Taxable income = 700000 - 50000 = 650000
      // Tax = 12500 + (650000 - 500000) * 0.2 = 12500 + 30000 = 42500
      expect(result).toBe(42500);
    });

    it('should calculate tax for 30% slab', () => {
      const result = calculateIncomeTax(1200000);
      // Taxable income = 1200000 - 50000 = 1150000
      // Tax = 112500 + (1150000 - 1000000) * 0.3 = 112500 + 45000 = 157500
      expect(result).toBe(157500);
    });
  });

  describe('calculateTotalDeductions', () => {
    it('should calculate total deductions without other deductions', () => {
      const result = calculateTotalDeductions(6000, 150, 5000);
      expect(result).toBe(11150);
    });

    it('should calculate total deductions with other deductions', () => {
      const otherDeductions = { loan: 2000, advance: 1000 };
      const result = calculateTotalDeductions(6000, 150, 5000, otherDeductions);
      expect(result).toBe(14150);
    });

    it('should handle empty other deductions', () => {
      const result = calculateTotalDeductions(6000, 150, 5000, {});
      expect(result).toBe(11150);
    });
  });

  describe('calculateNetSalary', () => {
    it('should calculate net salary correctly', () => {
      const result = calculateNetSalary(67000, 11150);
      expect(result).toBe(55850);
    });

    it('should return 0 if deductions exceed earnings', () => {
      const result = calculateNetSalary(50000, 60000);
      expect(result).toBe(0);
    });
  });

  describe('calculateProRataSalary', () => {
    it('should calculate pro-rata salary for full attendance', () => {
      const result = calculateProRataSalary(50000, 22, 22);
      expect(result).toBe(50000);
    });

    it('should calculate pro-rata salary for partial attendance', () => {
      const result = calculateProRataSalary(50000, 20, 22);
      expect(result).toBe(45455); // (50000 * 20) / 22 = 45454.54, rounded to 45455
    });

    it('should return 0 for zero working days', () => {
      const result = calculateProRataSalary(50000, 20, 0);
      expect(result).toBe(0);
    });

    it('should return 0 for zero attendance days', () => {
      const result = calculateProRataSalary(50000, 0, 22);
      expect(result).toBe(0);
    });
  });

  describe('calculateSalary', () => {
    it('should calculate complete salary with basic inputs', () => {
      const result = calculateSalary({
        basicSalary: 50000,
        hra: 10000,
        allowances: { travel: 5000 },
      });

      expect(result.basicSalary).toBe(50000);
      expect(result.hra).toBe(10000);
      expect(result.totalEarnings).toBe(65000);
      expect(result.pf).toBe(6000);
      expect(result.esi).toBe(0); // 65000 > 21000
      expect(result.totalDeductions).toBe(6000);
      expect(result.netSalary).toBe(59000);
    });

    it('should calculate salary with pro-rata attendance', () => {
      const result = calculateSalary({
        basicSalary: 50000,
        hra: 10000,
        attendanceDays: 20,
        totalWorkingDays: 22,
      });

      expect(result.basicSalary).toBe(45455); // Pro-rata basic
      expect(result.totalEarnings).toBe(55455); // 45455 + 10000
      expect(result.pf).toBe(5455); // 45455 * 0.12
    });

    it('should calculate salary with custom tax', () => {
      const result = calculateSalary({
        basicSalary: 50000,
        hra: 10000,
        taxAmount: 5000,
      });

      expect(result.tax).toBe(5000);
      expect(result.totalDeductions).toBe(11000); // 6000 (PF) + 5000 (tax)
      expect(result.netSalary).toBe(49000);
    });

    it('should calculate salary with other deductions', () => {
      const result = calculateSalary({
        basicSalary: 50000,
        hra: 10000,
        otherDeductions: { loan: 2000, advance: 1000 },
      });

      expect(result.totalDeductions).toBe(9000); // 6000 (PF) + 2000 + 1000
      expect(result.netSalary).toBe(51000);
    });

    it('should calculate salary with all components', () => {
      const result = calculateSalary({
        basicSalary: 50000,
        hra: 10000,
        allowances: { travel: 5000, medical: 2000 },
        pfPercentage: 12,
        esiPercentage: 0.75,
        taxAmount: 3000,
        otherDeductions: { loan: 1000 },
        attendanceDays: 22,
        totalWorkingDays: 22,
      });

      expect(result.basicSalary).toBe(50000);
      expect(result.hra).toBe(10000);
      expect(result.totalEarnings).toBe(67000);
      expect(result.pf).toBe(6000);
      expect(result.esi).toBe(0);
      expect(result.tax).toBe(3000);
      expect(result.totalDeductions).toBe(10000);
      expect(result.netSalary).toBe(57000);
    });
  });
});
