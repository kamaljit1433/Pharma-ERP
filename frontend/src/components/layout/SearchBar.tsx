import React, { useState, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  className?: string;
  onClose?: () => void;
}

/**
 * SearchBar Component
 * 
 * Optional feature: Global search bar for quick navigation.
 * Provides search input with clear button.
 * 
 * Requirements: 4.10 (optional feature)
 */
export const SearchBar: React.FC<SearchBarProps> = ({ className, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    // TODO: Implement search functionality
    // This will be connected to a search service in future tasks
    console.log('Search query:', query);
  }, []);

  const handleClear = () => {
    setSearchQuery('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      handleSearch(searchQuery);
      // Navigate to search results page
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn('relative w-full', className)}
    >
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search employees, documents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-20"
        />
        <div className="absolute right-1 top-1/2 flex -translate-y-1/2 items-center gap-1">
          {searchQuery && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleClear}
              className="h-7 w-7"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          {onClose && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-7 px-2 text-xs"
            >
              Cancel
            </Button>
          )}
        </div>
      </div>
    </form>
  );
};

export default SearchBar;
