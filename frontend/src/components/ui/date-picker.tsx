import React, { useState, useRef, useEffect } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  parseISO,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  id?: string;
  disabled?: boolean;
}

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = 'Select date',
  required,
  className,
  id,
  disabled,
}) => {
  const parsed = value ? parseISO(value) : null;
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(parsed ?? new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(parsed);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const calendarDays = eachDayOfInterval({
    start: startOfWeek(startOfMonth(viewDate)),
    end: endOfWeek(endOfMonth(viewDate)),
  });

  const handleSelect = (day: Date) => {
    setSelectedDate(day);
    onChange(format(day, 'yyyy-MM-dd'));
    setOpen(false);
  };

  const displayValue = selectedDate ? format(selectedDate, 'dd MMM yyyy') : '';

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        className={cn(
          'w-full flex items-center gap-2 px-3 py-2 text-sm border border-input rounded-md bg-background',
          'hover:bg-muted/50 transition-colors text-left focus:outline-none focus:ring-2 focus:ring-ring',
          !displayValue && 'text-muted-foreground',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
        <span className="flex-1 truncate">{displayValue || placeholder}</span>
      </button>

      {open && (
        <div className="absolute z-50 top-full mt-2 left-0 bg-background border border-border rounded-xl shadow-xl w-[280px] max-w-[calc(100vw-1.5rem)] overflow-hidden">
          {/* Header */}
          <div className="bg-primary/5 px-4 pt-4 pb-2">
            <div className="flex items-center justify-between mb-3">
              <button
                type="button"
                onClick={() => setViewDate(subMonths(viewDate, 1))}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-semibold tracking-wide">
                {format(viewDate, 'MMMM yyyy')}
              </span>
              <button
                type="button"
                onClick={() => setViewDate(addMonths(viewDate, 1))}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-7">
              {DAY_LABELS.map((d) => (
                <div key={d} className="text-center text-[11px] text-muted-foreground font-medium py-1">
                  {d}
                </div>
              ))}
            </div>
          </div>

          {/* Days grid */}
          <div className="px-4 py-3 grid grid-cols-7 gap-y-0.5">
            {calendarDays.map((day) => {
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const inMonth = isSameMonth(day, viewDate);
              const today = isToday(day);
              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => handleSelect(day)}
                  className={cn(
                    'h-8 w-8 mx-auto text-xs rounded-full flex items-center justify-center transition-colors',
                    !inMonth && 'text-muted-foreground/30 pointer-events-none',
                    inMonth && !isSelected && 'hover:bg-muted',
                    today && !isSelected && 'ring-1 ring-primary text-primary font-semibold',
                    isSelected && 'bg-primary text-primary-foreground font-semibold shadow-sm',
                  )}
                >
                  {format(day, 'd')}
                </button>
              );
            })}
          </div>

          {/* Today shortcut */}
          <div className="px-4 pb-4">
            <button
              type="button"
              onClick={() => handleSelect(new Date())}
              className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg border border-border hover:bg-muted transition-colors"
            >
              <Check className="w-4 h-4" />
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
