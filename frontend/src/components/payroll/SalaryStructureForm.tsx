import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Loader2, TrendingUp, TrendingDown, Wallet, IndianRupee, Info } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SalaryStructureFormProps {
  employeeId: string;
  employeeName?: string;
  initialData?: {
    salary_mode?: string;
    base_salary?: number;
    hra?: number;
    dearness_allowance?: number;
    other_allowances?: number;
    pf_contribution_rate?: number;
    esi_contribution_rate?: number;
    professional_tax?: number;
  };
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
}

const SALARY_MODES = [
  { value: 'monthly', label: 'Monthly Fixed' },
  { value: 'daily',   label: 'Daily Rate'    },
  { value: 'hourly',  label: 'Hourly Rate'   },
];

function fmt(n: number) {
  return n.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
}

function MoneyInput({
  id, name, value, onChange, error, placeholder = '0',
}: {
  id: string; name: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string; placeholder?: string;
}) {
  return (
    <div>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
        <Input
          id={id} name={name} type="number" min="0" step="0.01"
          placeholder={placeholder} value={value} onChange={onChange}
          className={cn('pl-7', error && 'border-destructive focus-visible:ring-destructive')}
        />
      </div>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}

function RateInput({
  id, name, value, onChange, error, placeholder = '0',
}: {
  id: string; name: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string; placeholder?: string;
}) {
  return (
    <div>
      <div className="relative">
        <Input
          id={id} name={name} type="number" min="0" max="100" step="0.01"
          placeholder={placeholder} value={value} onChange={onChange}
          className={cn('pr-8', error && 'border-destructive focus-visible:ring-destructive')}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
      </div>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}

function SectionRow({
  label, hint, children,
}: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-5 items-start gap-3">
      <div className="col-span-2 pt-2">
        <p className="text-sm font-medium leading-none">{label}</p>
        {hint && <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>}
      </div>
      <div className="col-span-3">{children}</div>
    </div>
  );
}

function SummaryRow({
  label, amount, bold, muted, color,
}: { label: string; amount: number; bold?: boolean; muted?: boolean; color?: string }) {
  return (
    <div className={cn('flex items-center justify-between py-1.5', bold && 'border-t border-border mt-1 pt-2.5')}>
      <span className={cn('text-sm', muted && 'text-muted-foreground', bold && 'font-semibold')}>{label}</span>
      <span className={cn('text-sm tabular-nums', bold && 'font-bold text-base', color, muted && 'text-muted-foreground')}>
        {fmt(amount)}
      </span>
    </div>
  );
}

export const SalaryStructureForm: React.FC<SalaryStructureFormProps> = ({
  employeeId,
  employeeName,
  initialData,
  onSubmit,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    salary_mode:          initialData?.salary_mode          ?? 'monthly',
    base_salary:          initialData?.base_salary          != null ? String(initialData.base_salary)          : '',
    hra:                  initialData?.hra                  != null ? String(initialData.hra)                  : '',
    dearness_allowance:   initialData?.dearness_allowance   != null ? String(initialData.dearness_allowance)   : '',
    other_allowances:     initialData?.other_allowances     != null ? String(initialData.other_allowances)     : '',
    pf_contribution_rate: initialData?.pf_contribution_rate != null ? String(initialData.pf_contribution_rate) : '12',
    esi_contribution_rate:initialData?.esi_contribution_rate!= null ? String(initialData.esi_contribution_rate): '0.75',
    professional_tax:     initialData?.professional_tax     != null ? String(initialData.professional_tax)     : '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => { const n = { ...prev }; delete n[name]; return n; });
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!formData.base_salary || parseFloat(formData.base_salary) <= 0)
      e.base_salary = 'Base salary must be greater than 0';
    if (parseFloat(formData.pf_contribution_rate) < 0 || parseFloat(formData.pf_contribution_rate) > 100)
      e.pf_contribution_rate = 'Must be 0–100';
    if (parseFloat(formData.esi_contribution_rate) < 0 || parseFloat(formData.esi_contribution_rate) > 100)
      e.esi_contribution_rate = 'Must be 0–100';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    try {
      await onSubmit({
        employee_id:           employeeId,
        salary_mode:           formData.salary_mode,
        base_salary:           parseFloat(formData.base_salary),
        hra:                   parseFloat(formData.hra)                   || 0,
        dearness_allowance:    parseFloat(formData.dearness_allowance)    || 0,
        other_allowances:      parseFloat(formData.other_allowances)      || 0,
        pf_contribution_rate:  parseFloat(formData.pf_contribution_rate),
        esi_contribution_rate: parseFloat(formData.esi_contribution_rate),
        professional_tax:      parseFloat(formData.professional_tax)      || 0,
        effective_from:        new Date(),
      });
    } catch { /* parent handles toast */ }
  };

  // — Live calculations —
  const base  = parseFloat(formData.base_salary)          || 0;
  const hra   = parseFloat(formData.hra)                  || 0;
  const da    = parseFloat(formData.dearness_allowance)   || 0;
  const other = parseFloat(formData.other_allowances)     || 0;
  const gross = base + hra + da + other;

  const pfRate  = parseFloat(formData.pf_contribution_rate)  || 0;
  const esiRate = parseFloat(formData.esi_contribution_rate) || 0;
  const pt      = parseFloat(formData.professional_tax)      || 0;
  const pfAmt   = (base * pfRate)  / 100;
  const esiAmt  = (gross * esiRate) / 100;
  const totalDeductions = pfAmt + esiAmt + pt;
  const netTakeHome = gross - totalDeductions;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Employee context */}
      {employeeName && (
        <div className="flex items-center gap-3 px-1">
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-primary">
              {employeeName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-semibold leading-none">{employeeName}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Configuring salary structure</p>
          </div>
        </div>
      )}

      {/* Salary Mode */}
      <Card>
        <CardHeader className="pb-3 pt-4 px-5">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Payment Frequency
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <div className="flex gap-2">
            {SALARY_MODES.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => setFormData((p) => ({ ...p, salary_mode: m.value }))}
                className={cn(
                  'flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-all',
                  formData.salary_mode === m.value
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
                )}
              >
                {m.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Earnings */}
        <Card>
          <CardHeader className="pb-3 pt-4 px-5">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              <TrendingUp className="h-4 w-4 text-green-500" />
              Earnings
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 space-y-4">
            <SectionRow
              label="Base Salary"
              hint={
                formData.salary_mode === 'daily'   ? 'Required · Amount per day' :
                formData.salary_mode === 'hourly'  ? 'Required · Amount per hour' :
                                                     'Required · Amount per month'
              }
            >
              <MoneyInput
                id="base_salary" name="base_salary"
                value={formData.base_salary} onChange={handleChange}
                error={errors.base_salary} placeholder="50000"
              />
            </SectionRow>

            <div className="border-t border-dashed border-border" />

            <SectionRow label="HRA" hint="House Rent Allowance">
              <MoneyInput
                id="hra" name="hra"
                value={formData.hra} onChange={handleChange}
                placeholder="10000"
              />
            </SectionRow>

            <SectionRow label="Dearness Allow." hint="Cost-of-living adjustment">
              <MoneyInput
                id="dearness_allowance" name="dearness_allowance"
                value={formData.dearness_allowance} onChange={handleChange}
                placeholder="5000"
              />
            </SectionRow>

            <SectionRow label="Other Allow." hint="Travel, meals, etc.">
              <MoneyInput
                id="other_allowances" name="other_allowances"
                value={formData.other_allowances} onChange={handleChange}
                placeholder="2000"
              />
            </SectionRow>

            <div className="border-t border-border pt-3 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Gross Earnings</span>
              <span className="text-base font-bold text-green-600 dark:text-green-400 tabular-nums">
                {fmt(gross)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Deductions */}
        <Card>
          <CardHeader className="pb-3 pt-4 px-5">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              <TrendingDown className="h-4 w-4 text-red-500" />
              Deductions
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 space-y-4">
            <SectionRow label="PF Rate" hint="Provident Fund (on basic)">
              <div className="space-y-1">
                <RateInput
                  id="pf_contribution_rate" name="pf_contribution_rate"
                  value={formData.pf_contribution_rate} onChange={handleChange}
                  error={errors.pf_contribution_rate} placeholder="12"
                />
                {base > 0 && (
                  <p className="text-xs text-muted-foreground pl-1">
                    = {fmt(pfAmt)} / {formData.salary_mode === 'daily' ? 'day' : formData.salary_mode === 'hourly' ? 'hour' : 'month'}
                  </p>
                )}
              </div>
            </SectionRow>

            <div className="border-t border-dashed border-border" />

            <SectionRow label="ESI Rate" hint="Employee State Insurance (on gross)">
              <div className="space-y-1">
                <RateInput
                  id="esi_contribution_rate" name="esi_contribution_rate"
                  value={formData.esi_contribution_rate} onChange={handleChange}
                  error={errors.esi_contribution_rate} placeholder="0.75"
                />
                {gross > 0 && (
                  <p className="text-xs text-muted-foreground pl-1">
                    = {fmt(esiAmt)} / {formData.salary_mode === 'daily' ? 'day' : formData.salary_mode === 'hourly' ? 'hour' : 'month'}
                  </p>
                )}
              </div>
            </SectionRow>

            <SectionRow label="Professional Tax" hint="Fixed monthly deduction">
              <MoneyInput
                id="professional_tax" name="professional_tax"
                value={formData.professional_tax} onChange={handleChange}
                placeholder="200"
              />
            </SectionRow>

            <div className="border-t border-border pt-3 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Deductions</span>
              <span className="text-base font-bold text-red-600 dark:text-red-400 tabular-nums">
                − {fmt(totalDeductions)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Take-Home Summary */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="px-5 py-4">
          <div className="flex items-center gap-2 mb-3">
            <Wallet className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Salary Preview
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-0 sm:divide-x divide-border">
            <div className="sm:pr-4">
              <p className="text-xs text-muted-foreground mb-0.5">Gross Earnings</p>
              <p className="text-lg font-bold text-green-600 dark:text-green-400 tabular-nums">{fmt(gross)}</p>
            </div>
            <div className="sm:px-4">
              <p className="text-xs text-muted-foreground mb-0.5">Total Deductions</p>
              <p className="text-lg font-bold text-red-600 dark:text-red-400 tabular-nums">− {fmt(totalDeductions)}</p>
            </div>
            <div className="sm:pl-4">
              <p className="text-xs text-muted-foreground mb-0.5">Net Take-Home</p>
              <p className="text-2xl font-extrabold text-primary tabular-nums">{fmt(netTakeHome)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading} size="lg">
          {isLoading ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</>
          ) : (
            <><IndianRupee className="h-4 w-4 mr-2" />Save Salary Structure</>
          )}
        </Button>
      </div>
    </form>
  );
};
