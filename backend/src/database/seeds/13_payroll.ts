import { Knex } from 'knex';

const E1 = 'e0000000-0000-0000-0000-000000000001';
const E2 = 'e0000000-0000-0000-0000-000000000002';
const E3 = 'e0000000-0000-0000-0000-000000000003';
const E4 = 'e0000000-0000-0000-0000-000000000004';
const E5 = 'e0000000-0000-0000-0000-000000000005';
const E6 = 'e0000000-0000-0000-0000-000000000006';
const E7 = 'e0000000-0000-0000-0000-000000000007';
const E8 = 'e0000000-0000-0000-0000-000000000008';
const E9 = 'e0000000-0000-0000-0000-000000000009';

// HR Manager 1 (Priya) is the payroll processor
const PROCESSED_BY = E2;

// ── Salary component lookup ────────────────────────────────────────────────────
// Gross = base + hra + da + other; PF = base×12%; ESI = gross×rate%; PT = 200 fixed
const EMPLOYEES: Record<string, {
  base: number; hra: number; da: number; other: number;
  pfRate: number; esiRate: number; pt: number;
}> = {
  [E1]: { base: 120000, hra: 48000, da: 10000, other: 12000, pfRate: 12, esiRate: 0,    pt: 200 },
  [E2]: { base:  85000, hra: 34000, da:  7000, other:  8000, pfRate: 12, esiRate: 0,    pt: 200 },
  [E3]: { base:  82000, hra: 32800, da:  6500, other:  7500, pfRate: 12, esiRate: 0,    pt: 200 },
  [E4]: { base:  38000, hra: 15200, da:  3000, other:  3500, pfRate: 12, esiRate: 0.75, pt: 200 },
  [E5]: { base:  36000, hra: 14400, da:  2800, other:  3200, pfRate: 12, esiRate: 0.75, pt: 200 },
  [E6]: { base:  30000, hra: 12000, da:  2500, other:  2500, pfRate: 12, esiRate: 0.75, pt: 200 },
  [E7]: { base:  44000, hra: 17600, da:  3500, other:  4000, pfRate: 12, esiRate: 0.75, pt: 200 },
  [E8]: { base:  28000, hra: 11200, da:  2200, other:  2000, pfRate: 12, esiRate: 0.75, pt: 200 },
  [E9]: { base:  68000, hra: 27200, da:  5500, other:  6000, pfRate: 12, esiRate: 0,    pt: 200 },
};

function calc(empId: string) {
  const s = EMPLOYEES[empId]!;
  const gross = s.base + s.hra + s.da + s.other;
  const pf    = +(s.base  * s.pfRate  / 100).toFixed(2);
  const esi   = +(gross   * s.esiRate / 100).toFixed(2);
  const pt    = s.pt;
  const totalDeductions = +(pf + esi + pt).toFixed(2);
  const net   = +(gross - totalDeductions).toFixed(2);
  return { basic_salary: s.base, gross, net, totalDeductions, pf, esi, pt };
}

// month encoded as hex: 3→03, 4→04, 5→05
function monthHex(m: number) { return String(m).padStart(2, '0'); }

function makeRows(month: number, year: number, status: 'paid' | 'processed', paidAt?: string) {
  return Object.keys(EMPLOYEES).map((empId, i) => {
    const { basic_salary, gross, net, totalDeductions, pf, esi } = calc(empId);
    // UUID: cc{year}{month}-0000-0000-0000-{empIndex}
    return {
      id: `cc${year}${monthHex(month)}-0000-0000-0000-${String(i + 1).padStart(12, '0')}`,
      employee_id:      empId,
      month,
      year,
      basic_salary,
      gross_salary:     gross,
      net_salary:       net,
      total_earnings:   gross,
      total_deductions: totalDeductions,
      pf_deduction:     pf,
      esi_deduction:    esi,
      tds_deduction:    0,
      status,
      is_locked:        status === 'paid',
      processed_by:     PROCESSED_BY,
      processed_at:     new Date(`${year}-${String(month).padStart(2,'0')}-26T10:00:00Z`),
      paid_at:          paidAt ? new Date(paidAt) : null,
      locked_at:        status === 'paid' ? new Date(`${year}-${String(month).padStart(2,'0')}-28T18:00:00Z`) : null,
    };
  });
}

export async function seed(knex: Knex): Promise<void> {
  await knex('payroll').del();

  // March 2026 — paid & locked
  await knex('payroll').insert(makeRows(3, 2026, 'paid', '2026-03-31T09:00:00Z'));

  // April 2026 — paid & locked
  await knex('payroll').insert(makeRows(4, 2026, 'paid', '2026-04-30T09:00:00Z'));

  // May 2026 — processed (not yet paid — current month)
  await knex('payroll').insert(makeRows(5, 2026, 'processed'));

  console.log('Payroll seeded: Mar 2026 (paid) · Apr 2026 (paid) · May 2026 (processed) — 9 employees × 3 months = 27 records');
}
