import React, { useState, useEffect, useRef } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import employeeService, { Employee } from '../../services/employeeService';
import { Search, X } from 'lucide-react';

interface EmployeeSearchProps {
  label?: string;
  placeholder?: string;
  onChange: (id: string, employee: Employee | null) => void;
  excludeId?: string | undefined;
}

export const EmployeeSearch: React.FC<EmployeeSearchProps> = ({
  label,
  placeholder = 'Search by name or employee ID...',
  onChange,
  excludeId,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Employee[]>([]);
  const [selected, setSelected] = useState<Employee | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const doSearch = (q: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (q.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const list = await employeeService.search(q, 10);
        const filtered = excludeId ? list.filter((e) => e.id !== excludeId) : list;
        setResults(filtered);
        setOpen(true);
      } catch {
        // ignore search errors
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setQuery(v);
    if (selected) {
      setSelected(null);
      onChange('', null);
    }
    doSearch(v);
  };

  const handleSelect = (emp: Employee) => {
    setSelected(emp);
    setQuery(`${emp.first_name} ${emp.last_name} (${emp.employee_id})`);
    setOpen(false);
    setResults([]);
    onChange(emp.id, emp);
  };

  const handleClear = () => {
    setSelected(null);
    setQuery('');
    setResults([]);
    setOpen(false);
    onChange('', null);
  };

  return (
    <div ref={containerRef} className="relative">
      {label && <Label className="mb-1.5 block">{label}</Label>}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          value={query}
          onChange={handleChange}
          placeholder={placeholder}
          className="pl-9 pr-8"
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {open && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-md max-h-52 overflow-y-auto">
          {loading ? (
            <p className="px-3 py-2 text-sm text-muted-foreground">Searching...</p>
          ) : results.length > 0 ? (
            results.map((emp) => (
              <button
                key={emp.id}
                type="button"
                className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground flex items-center gap-2"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(emp);
                }}
              >
                <span className="font-medium">
                  {emp.first_name} {emp.last_name}
                </span>
                <span className="text-xs text-muted-foreground">{emp.employee_id}</span>
              </button>
            ))
          ) : (
            <p className="px-3 py-2 text-sm text-muted-foreground">No employees found</p>
          )}
        </div>
      )}
    </div>
  );
};
