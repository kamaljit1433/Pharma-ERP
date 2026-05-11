import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Input } from './input';
import { Check, ChevronDown, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface SearchableSelectOption {
  id: string;
  name: string;
}

interface SearchableSelectProps {
  options: SearchableSelectOption[];
  value?: string;
  onChange: (id: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Search...',
  disabled = false,
  className,
}) => {
  const selected = options.find((o) => o.id === value);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = query.trim()
    ? options.filter((o) => o.name.toLowerCase().includes(query.toLowerCase()))
    : options;

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleOpen = () => {
    if (disabled) return;
    setOpen(true);
    setQuery('');
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleSelect = (option: SearchableSelectOption) => {
    onChange(option.id);
    setOpen(false);
    setQuery('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setOpen(false);
    setQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setOpen(false);
      setQuery('');
    }
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Trigger — shows selected name or placeholder */}
      {!open ? (
        <button
          type="button"
          onClick={handleOpen}
          disabled={disabled}
          className={cn(
            'flex w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm',
            'ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            !selected && 'text-muted-foreground'
          )}
        >
          <span className="truncate">{selected ? selected.name : placeholder}</span>
          <div className="flex items-center gap-1 flex-shrink-0 ml-2">
            {selected && (
              <span
                role="button"
                tabIndex={0}
                onClick={handleClear}
                onKeyDown={(e) => e.key === 'Enter' && handleClear(e as any)}
                className="text-muted-foreground hover:text-foreground rounded"
              >
                <X className="w-3 h-3" />
              </span>
            )}
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </div>
        </button>
      ) : (
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Search ${placeholder.toLowerCase()}...`}
          className="w-full"
        />
      )}

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover shadow-md">
          <ul className="max-h-56 overflow-auto py-1 text-sm">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-muted-foreground text-center">No results found</li>
            ) : (
              filtered.map((option) => (
                <li
                  key={option.id}
                  onMouseDown={() => handleSelect(option)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 cursor-pointer select-none',
                    'hover:bg-accent hover:text-accent-foreground',
                    option.id === value && 'bg-accent/50'
                  )}
                >
                  <Check
                    className={cn('w-4 h-4 flex-shrink-0', option.id === value ? 'opacity-100' : 'opacity-0')}
                  />
                  {option.name}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
};
