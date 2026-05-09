import { Knex } from 'knex';

const ADMIN = 'e0000000-0000-0000-0000-000000000001';

// Payroll numbers per employee (gross, basic, pf, tds, pt, net) — full attendance month
const SALARY: Record<string, { basic: number; gross: number; pf: number; tds: number; net: number }> = {
  'e0000000-0000-0000-0000-000000000001': { basic: 150000, gross: 260000, pf: 18000, tds: 21000, net: 220800 },
  'e0000000-0000-0000-0000-000000000002': { basic:  80000, gross: 138000, pf:  9600, tds:  8800, net: 119400 },
  'e0000000-0000-0000-0000-000000000003': { basic:  90000, gross: 156000, pf: 10800, tds: 10600, net: 134400 },
  'e0000000-0000-0000-0000-000000000004': { basic:  95000, gross: 164000, pf: 11400, tds: 11400, net: 141000 },
  'e0000000-0000-0000-0000-000000000005': { basic:  75000, gross: 128000, pf:  9000, tds:  7800, net: 111000 },
  'e0000000-0000-0000-0000-000000000006': { basic:  60000, gross: 102000, pf:  7200, tds:  5200, net:  89400 },
  'e0000000-0000-0000-0000-000000000007': { basic:  50000, gross:  85000, pf:  6000, tds:  3500, net:  75300 },
  'e0000000-0000-0000-0000-000000000008': { basic:  40000, gross:  68000, pf:  4800, tds:  1800, net:  61200 },
  'e0000000-0000-0000-0000-000000000009': { basic:  45000, gross:  77000, pf:  5400, tds:  2700, net:  68700 },
  'e0000000-0000-0000-0000-000000000010': { basic:  55000, gross:  94000, pf:  6600, tds:  4400, net:  82800 },
};

// March overrides (EMP008 absent 1 day, EMP010 half day)
const MARCH_OVERRIDES: Record<string, Partial<typeof SALARY[string]>> = {
  'e0000000-0000-0000-0000-000000000008': { basic: 38200, gross: 65000, pf: 4584, tds: 1500, net: 58716 },
  'e0000000-0000-0000-0000-000000000010': { basic: 53800, gross: 91800, pf: 6456, tds: 4180, net: 80964 },
};

// April overrides (EMP006 absent 1 day)
const APRIL_OVERRIDES: Record<string, Partial<typeof SALARY[string]>> = {
  'e0000000-0000-0000-0000-000000000006': { basic: 57000, gross: 96900, pf: 6840, tds: 4690, net: 85170 },
};

const EMPLOYEES = Object.keys(SALARY);
const PT = 200; // professional tax

function payrollId(monthCode: string, idx: number): string {
  return `${monthCode}-0000-0000-0000-${String(idx + 1).padStart(12, '0')}`;
}
function payslipId(monthCode: string, idx: number): string {
  return `${monthCode}-0001-0000-0000-${String(idx + 1).padStart(12, '0')}`;
}

export async function seed(knex: Knex): Promise<void> {
  // Cascades to payslips
  await knex('payroll').del();

  const payrollRows: any[] = [];
  const payslipRows: any[] = [];

  // ── Helper ────────────────────────────────────────────────────────────────
  function buildPayroll(
    monthCode: string,
    month: number,
    year: number,
    status: 'paid' | 'processed',
    processedAt: string,
    paidAt: string | null,
    overrides: Record<string, Partial<typeof SALARY[string]>>
  ) {
    EMPLOYEES.forEach((empId, idx) => {
      const sal = SALARY[empId]!;
      const over = overrides[empId] ?? {};
      const base = {
        basic: over.basic ?? sal.basic,
        gross: over.gross ?? sal.gross,
        pf:    over.pf    ?? sal.pf,
        tds:   over.tds   ?? sal.tds,
        net:   over.net   ?? sal.net,
      };
      const totalDed = base.pf + PT + base.tds;
      const payId = payrollId(monthCode, idx);

      payrollRows.push({
        id: payId,
        employee_id: empId,
        month,
        year,
        basic_salary: base.basic,
        gross_salary: base.gross,
        net_salary: base.net,
        total_deductions: totalDed,
        total_earnings: base.gross,
        pf_deduction: base.pf,
        esi_deduction: 0,
        tds_deduction: base.tds,
        status,
        processed_by: ADMIN,
        processed_at: processedAt,
        paid_at: paidAt,
        is_locked: false,
      });

      // Payslips only for paid months
      if (status === 'paid') {
        const empNum = String(idx + 1).padStart(3, '0');
        payslipRows.push({
          id: payslipId(monthCode, idx),
          payroll_id: payId,
          employee_id: empId,
          month,
          year,
          payslip_number: `PSL-${year}-${String(month).padStart(2, '0')}-EMP${empNum}`,
          earnings: JSON.stringify({
            'Basic Salary': base.basic,
            'House Rent Allowance': base.gross - base.basic,
          }),
          deductions: JSON.stringify({
            'Provident Fund (12%)': base.pf,
            'Professional Tax': PT,
            'TDS': base.tds,
          }),
          gross_salary: base.gross,
          net_salary: base.net,
          generated_at: processedAt,
        });
      }
    });
  }

  // February 2026 – paid, full attendance
  buildPayroll('f2260200', 2, 2026, 'paid', '2026-03-04 10:00:00', '2026-03-05 15:00:00', {});

  // March 2026 – paid, EMP008 absent 1 day, EMP010 half day
  buildPayroll('a2260300', 3, 2026, 'paid', '2026-04-04 10:00:00', '2026-04-05 15:00:00', MARCH_OVERRIDES);

  // April 2026 – processed (not yet paid), EMP006 absent 1 day
  buildPayroll('b2260400', 4, 2026, 'processed', '2026-04-26 18:00:00', null, APRIL_OVERRIDES);

  await knex('payroll').insert(payrollRows);
  await knex('payslips').insert(payslipRows);

  console.log(`Payroll seeded: ${payrollRows.length} records (Feb/Mar/Apr 2026)`);
  console.log(`Payslips seeded: ${payslipRows.length} records (Feb and Mar 2026)`);
}
