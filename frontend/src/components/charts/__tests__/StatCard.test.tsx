import { describe, it, expect, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatCard from '../StatCard';
import { Users } from 'lucide-react';

// Mock ResizeObserver for Recharts
beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as any;
});

describe('StatCard - Component Rendering', () => {
  it('renders title and value', () => {
    render(
      <StatCard
        title="Total Employees"
        value={150}
      />
    );

    expect(screen.getByText('Total Employees')).toBeInTheDocument();
    expect(screen.getByText('150')).toBeInTheDocument();
  });

  it('renders with icon', () => {
    const { container } = render(
      <StatCard
        title="Total Employees"
        value={150}
        icon={Users}
      />
    );

    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(
      <StatCard
        title="Active Employees"
        value={120}
        description="Currently active"
      />
    );

    expect(screen.getByText('Currently active')).toBeInTheDocument();
  });

  it('renders string value', () => {
    render(
      <StatCard
        title="Status"
        value="Active"
      />
    );

    expect(screen.getByText('Active')).toBeInTheDocument();
  });
});

describe('StatCard - Trend Indicators', () => {
  it('renders positive trend indicator', () => {
    render(
      <StatCard
        title="New Hires"
        value={10}
        trend={{ value: 25, isPositive: true }}
      />
    );

    const trendDiv = screen.getByLabelText(/Trend: increased by 25%/);
    expect(trendDiv).toBeInTheDocument();
  });

  it('renders negative trend indicator', () => {
    render(
      <StatCard
        title="Absent"
        value={5}
        trend={{ value: 10, isPositive: false }}
      />
    );

    const trendDiv = screen.getByLabelText(/Trend: decreased by 10%/);
    expect(trendDiv).toBeInTheDocument();
  });

  it('displays up arrow for positive trend', () => {
    const { container } = render(
      <StatCard
        title="Growth"
        value={100}
        trend={{ value: 15, isPositive: true }}
      />
    );

    const trendElement = container.querySelector('[aria-label*="increased"]');
    expect(trendElement?.textContent).toContain('↑');
  });

  it('displays down arrow for negative trend', () => {
    const { container } = render(
      <StatCard
        title="Decline"
        value={50}
        trend={{ value: 20, isPositive: false }}
      />
    );

    const trendElement = container.querySelector('[aria-label*="decreased"]');
    expect(trendElement?.textContent).toContain('↓');
  });

  it('handles zero trend value', () => {
    render(
      <StatCard
        title="Stable"
        value={100}
        trend={{ value: 0, isPositive: true }}
      />
    );

    const trendDiv = screen.getByLabelText(/Trend: increased by 0%/);
    expect(trendDiv).toBeInTheDocument();
  });
});

describe('StatCard - Loading State', () => {
  it('shows loading skeleton when loading is true', () => {
    const { container } = render(
      <StatCard
        title="Total Employees"
        value={150}
        loading={true}
      />
    );

    const skeleton = container.querySelector('.animate-pulse');
    expect(skeleton).toBeInTheDocument();
  });

  it('hides content when loading is true', () => {
    render(
      <StatCard
        title="Total Employees"
        value={150}
        loading={true}
      />
    );

    expect(screen.queryByText('150')).not.toBeInTheDocument();
  });

  it('shows content when loading is false', () => {
    render(
      <StatCard
        title="Total Employees"
        value={150}
        loading={false}
      />
    );

    expect(screen.getByText('150')).toBeInTheDocument();
  });
});

describe('StatCard - Styling and Customization', () => {
  it('applies custom className', () => {
    const { container } = render(
      <StatCard
        title="Total Employees"
        value={150}
        className="custom-class"
      />
    );

    const card = container.firstChild;
    expect(card).toHaveClass('custom-class');
  });

  it('renders with default styling when no className provided', () => {
    const { container } = render(
      <StatCard
        title="Total Employees"
        value={150}
      />
    );

    const card = container.firstChild;
    expect(card).toBeInTheDocument();
  });
});

describe('StatCard - Accessibility', () => {
  it('has proper role attribute', () => {
    const { container } = render(
      <StatCard
        title="Total Employees"
        value={150}
      />
    );

    const card = container.querySelector('[role="region"]');
    expect(card).toBeInTheDocument();
  });

  it('has aria-label with title', () => {
    const { container } = render(
      <StatCard
        title="Total Employees"
        value={150}
      />
    );

    const card = container.querySelector('[aria-label="Total Employees"]');
    expect(card).toBeInTheDocument();
  });

  it('includes description in aria-label', () => {
    const { container } = render(
      <StatCard
        title="Active Employees"
        value={120}
        description="Currently active"
      />
    );

    const card = container.querySelector('[aria-label*="Currently active"]');
    expect(card).toBeInTheDocument();
  });

  it('includes trend in aria-label', () => {
    const { container } = render(
      <StatCard
        title="New Hires"
        value={10}
        trend={{ value: 25, isPositive: true }}
      />
    );

    const card = container.querySelector('[aria-label*="increased by 25%"]');
    expect(card).toBeInTheDocument();
  });

  it('marks icon as hidden from screen readers', () => {
    const { container } = render(
      <StatCard
        title="Total Employees"
        value={150}
        icon={Users}
      />
    );

    const icon = container.querySelector('[aria-hidden="true"]');
    expect(icon).toBeInTheDocument();
  });

  it('has loading status role when loading', () => {
    const { container } = render(
      <StatCard
        title="Total Employees"
        value={150}
        loading={true}
      />
    );

    const loadingElement = container.querySelector('[role="status"]');
    expect(loadingElement).toBeInTheDocument();
  });

  it('has proper loading aria-label', () => {
    const { container } = render(
      <StatCard
        title="Total Employees"
        value={150}
        loading={true}
      />
    );

    const loadingElement = container.querySelector('[aria-label="Loading statistics"]');
    expect(loadingElement).toBeInTheDocument();
  });
});

describe('StatCard - Data Display', () => {
  it('formats numeric values correctly', () => {
    render(
      <StatCard
        title="Employees"
        value={1000}
      />
    );

    expect(screen.getByText('1000')).toBeInTheDocument();
  });

  it('handles large numeric values', () => {
    render(
      <StatCard
        title="Total Amount"
        value={999999}
      />
    );

    expect(screen.getByText('999999')).toBeInTheDocument();
  });

  it('handles zero value', () => {
    render(
      <StatCard
        title="Pending"
        value={0}
      />
    );

    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('handles negative numeric values', () => {
    render(
      <StatCard
        title="Change"
        value={-50}
      />
    );

    expect(screen.getByText('-50')).toBeInTheDocument();
  });

  it('displays value with aria-label', () => {
    const { container } = render(
      <StatCard
        title="Total Employees"
        value={150}
      />
    );

    const valueElement = container.querySelector('[aria-label*="150"]');
    expect(valueElement).toBeInTheDocument();
  });
});
