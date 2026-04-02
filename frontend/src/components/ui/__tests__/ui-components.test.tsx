import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Checkbox } from '../checkbox';
import { Switch } from '../switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../tabs';
import { Avatar, AvatarImage, AvatarFallback } from '../avatar';
import { Progress } from '../progress';
import { Skeleton } from '../skeleton';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '../tooltip';

describe('UI Components', () => {
  describe('Checkbox', () => {
    it('renders checkbox component', () => {
      render(<Checkbox data-testid="checkbox" />);
      expect(screen.getByTestId('checkbox')).toBeInTheDocument();
    });
  });

  describe('Switch', () => {
    it('renders switch component', () => {
      render(<Switch data-testid="switch" />);
      expect(screen.getByTestId('switch')).toBeInTheDocument();
    });
  });

  describe('Tabs', () => {
    it('renders tabs component', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );
      expect(screen.getByText('Tab 1')).toBeInTheDocument();
      expect(screen.getByText('Tab 2')).toBeInTheDocument();
    });
  });

  describe('Avatar', () => {
    it('renders avatar with fallback', () => {
      render(
        <Avatar>
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      );
      expect(screen.getByText('JD')).toBeInTheDocument();
    });
  });

  describe('Progress', () => {
    it('renders progress component', () => {
      const { container } = render(<Progress value={50} />);
      expect(container.querySelector('[role="progressbar"]')).toBeInTheDocument();
    });
  });

  describe('Skeleton', () => {
    it('renders skeleton component', () => {
      const { container } = render(<Skeleton className="h-4 w-full" />);
      expect(container.firstChild).toHaveClass('animate-pulse');
    });
  });

  describe('Tooltip', () => {
    it('renders tooltip component', () => {
      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>Hover me</TooltipTrigger>
            <TooltipContent>Tooltip content</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
      expect(screen.getByText('Hover me')).toBeInTheDocument();
    });
  });
});
