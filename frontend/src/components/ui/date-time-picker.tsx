import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
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
  setHours,
  setMinutes,
  getHours,
  getMinutes,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar, Clock, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

interface DateTimePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  id?: string;
  disabled?: boolean;
}

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function buildDateTime(date: Date, hour: number, minute: number, ampm: 'AM' | 'PM'): Date {
  let h = hour % 12;
  if (ampm === 'PM') h += 12;
  return setMinutes(setHours(new Date(date), h), minute);
}

function toLocalInputValue(dt: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
}

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  value,
  onChange,
  placeholder = 'Select date & time',
  required,
  className,
  id,
  disabled,
}) => {
  const parsed = value ? new Date(value) : null;

  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(parsed ?? new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(parsed);
  const [hour, setHour] = useState<number>(parsed ? (getHours(parsed) % 12) || 12 : 9);
  const [minute, setMinute] = useState<number>(parsed ? getMinutes(parsed) : 0);
  const [ampm, setAmpm] = useState<'AM' | 'PM'>(parsed ? (getHours(parsed) >= 12 ? 'PM' : 'AM') : 'AM');
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const dropdownWidth = 320;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const openAbove = spaceBelow < 440 && spaceAbove > spaceBelow;

    setDropdownStyle({
      position: 'fixed',
      left: Math.min(rect.left, window.innerWidth - dropdownWidth - 8),
      top: openAbove ? undefined : rect.bottom + 8,
      bottom: openAbove ? window.innerHeight - rect.top + 8 : undefined,
      width: dropdownWidth,
      zIndex: 9999,
    });
  }, []);

  const handleToggle = () => {
    if (disabled) return;
    if (!open) updatePosition();
    setOpen((o) => !o);
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        dropdownRef.current?.contains(target)
      ) return;
      setOpen(false);
    };
    if (open) {
      document.addEventListener('mousedown', handler);
      window.addEventListener('scroll', () => setOpen(false), { passive: true, once: true });
      window.addEventListener('resize', updatePosition);
    }
    return () => {
      document.removeEventListener('mousedown', handler);
      window.removeEventListener('resize', updatePosition);
    };
  }, [open, updatePosition]);

  const calendarDays = eachDayOfInterval({
    start: startOfWeek(startOfMonth(viewDate)),
    end: endOfWeek(endOfMonth(viewDate)),
  });

  const emit = (date: Date, h: number, m: number, period: 'AM' | 'PM') => {
    const dt = buildDateTime(date, h, m, period);
    onChange(toLocalInputValue(dt));
  };

  const handleDateSelect = (day: Date) => {
    setSelectedDate(day);
    emit(day, hour, minute, ampm);
  };

  const handleHour = (delta: number) => {
    const h = ((hour - 1 + delta + 12) % 12) + 1;
    setHour(h);
    if (selectedDate) emit(selectedDate, h, minute, ampm);
  };

  const handleMinute = (delta: number) => {
    const m = (minute + delta * 5 + 60) % 60;
    setMinute(m);
    if (selectedDate) emit(selectedDate, hour, m, ampm);
  };

  const handleAmpm = (p: 'AM' | 'PM') => {
    setAmpm(p);
    if (selectedDate) emit(selectedDate, hour, minute, p);
  };

  const displayValue = selectedDate
    ? format(buildDateTime(selectedDate, hour, minute, ampm), 'dd MMM yyyy, hh:mm aa')
    : '';

  const dropdown = open ? (
    <div
      ref={dropdownRef}
      style={dropdownStyle}
      className="bg-background border border-border rounded-xl shadow-2xl overflow-hidden"
    >
      {/* Calendar header */}
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

      {/* Calendar days */}
      <div className="px-4 py-2 grid grid-cols-7 gap-y-0.5">
        {calendarDays.map((day) => {
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const inMonth = isSameMonth(day, viewDate);
          const today = isToday(day);
          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => handleDateSelect(day)}
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

      {/* Time section */}
      <div className="border-t border-border mx-4" />
      <div className="px-4 py-3">
        <div className="flex items-center justify-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground font-medium mr-1">Time</span>

          {/* Hour */}
          <div className="flex flex-col items-center">
            <button type="button" onClick={() => handleHour(1)} className="p-0.5 hover:bg-muted rounded transition-colors">
              <ChevronLeft className="w-3 h-3 -rotate-90" />
            </button>
            <span className="w-8 text-center text-base font-mono font-bold tabular-nums leading-tight">
              {String(hour).padStart(2, '0')}
            </span>
            <button type="button" onClick={() => handleHour(-1)} className="p-0.5 hover:bg-muted rounded transition-colors">
              <ChevronLeft className="w-3 h-3 rotate-90" />
            </button>
          </div>

          <span className="text-lg font-bold text-muted-foreground mb-0.5">:</span>

          {/* Minute */}
          <div className="flex flex-col items-center">
            <button type="button" onClick={() => handleMinute(1)} className="p-0.5 hover:bg-muted rounded transition-colors">
              <ChevronLeft className="w-3 h-3 -rotate-90" />
            </button>
            <span className="w-8 text-center text-base font-mono font-bold tabular-nums leading-tight">
              {String(minute).padStart(2, '0')}
            </span>
            <button type="button" onClick={() => handleMinute(-1)} className="p-0.5 hover:bg-muted rounded transition-colors">
              <ChevronLeft className="w-3 h-3 rotate-90" />
            </button>
          </div>

          {/* AM/PM */}
          <div className="flex flex-col gap-0.5 ml-1">
            {(['AM', 'PM'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => handleAmpm(p)}
                className={cn(
                  'px-2 py-0.5 text-xs font-semibold rounded transition-colors',
                  ampm === p
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Done */}
      <div className="px-4 pb-4">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
        >
          <Check className="w-4 h-4" />
          Done
        </button>
      </div>
    </div>
  ) : null;

  return (
    <div className={cn('relative', className)}>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        disabled={disabled}
        onClick={handleToggle}
        className={cn(
          'w-full flex items-center gap-2 px-3 py-2 text-sm border border-input rounded-md bg-background',
          'hover:bg-muted/50 transition-colors text-left focus:outline-none focus:ring-2 focus:ring-ring',
          !displayValue && 'text-muted-foreground',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
        <span className="flex-1 truncate">{displayValue || placeholder}</span>
        <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
      </button>

      {typeof document !== 'undefined' && ReactDOM.createPortal(dropdown, document.body)}
    </div>
  );
};
