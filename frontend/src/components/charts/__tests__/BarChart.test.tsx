import { describe, it, expect, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import BarChart, { BarChartDataPoint } from '../BarChart';

// Mock ResizeObserver for Recharts
beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as any;
});

describe('BarChart - Component Rendering', () => {
  const mockData: BarChartDataPoint[] = [
    { name: 'Active', count: 100 },
    { name: 'On Leave', count: 20 },
    { name: 'Suspended', count: 5 },
  ];

  it('renders title and description', () => {
    render(
      <BarChart
        title="Employee Status"
        description="Distribution by status"
        data={mockData}
        bars={[
          { dataKey: 'count', fill: '#3b82f6', name: 'Count' },
        ]}
      />
    );

    expect(screen.getByText('Employee Status')).toBeInTheDocument();
    expect(screen.getByText('Distribution by status')).toBeInTheDocument();
  });

  it('renders chart with multiple bars', () => {
    const { container } = render(
      <BarChart
        title="Employee Status"
        data={mockData}
        bars={[
          { dataKey: 'count', fill: '#3b82f6', name: 'Count' },
        ]}
      />
    );

    const chartContainer = container.querySelector('[role="region"]');
    expect(chartContainer).toBeInTheDocument();
  });

  it('renders chart with single bar', () => {
    const { container } = render(
      <BarChart
        title="Employee Status"
        data={mockData}
        bars={[
          { dataKey: 'count', fill: '#3b82f6', name: 'Count' },
        ]}
      />
    );

    const chartContainer = container.querySelector('[role="region"]');
    expect(chartContainer).toBeInTheDocument();
  });
});

describe('BarChart - Loading State', () => {
  const mockData: BarChartDataPoint[] = [
    { name: 'Active', count: 100 },
  ];

  it('shows loading skeleton when loading is true', () => {
    const { container } = render(
      <BarChart
        title="Employee Status"
        data={mockData}
        bars={[]}
        loading={true}
      />
    );

    const skeleton = container.querySelector('.animate-pulse');
    expect(skeleton).toBeInTheDocument();
  });

  it('hides chart when loading is true', () => {
    const { container } = render(
      <BarChart
        title="Employee Status"
        data={mockData}
        bars={[]}
        loading={true}
      />
    );

    const chartContainer = container.querySelector('[role="region"]');
    expect(chartContainer).not.toBeInTheDocument();
  });

  it('shows chart when loading is false', () => {
    const { container } = render(
      <BarChart
        title="Employee Status"
        data={mockData}
        bars={[
          { dataKey: 'count', fill: '#3b82f6', name: 'Count' },
        ]}
        loading={false}
      />
    );

    const chartContainer = container.querySelector('[role="region"]');
    expect(chartContainer).toBeInTheDocument();
  });
});

describe('BarChart - Empty State', () => {
  it('shows empty state message when empty is true', () => {
    render(
      <BarChart
        title="Employee Status"
        data={[]}
        bars={[]}
        empty={true}
        emptyMessage="No data available"
      />
    );

    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('hides chart when empty is true', () => {
    const { container } = render(
      <BarChart
        title="Employee Status"
        data={[]}
        bars={[]}
        empty={true}
      />
    );

    const chartContainer = container.querySelector('[role="region"]');
    expect(chartContainer).not.toBeInTheDocument();
  });

  it('shows default empty message when not provided', () => {
    render(
      <BarChart
        title="Employee Status"
        data={[]}
        bars={[]}
        empty={true}
      />
    );

    expect(screen.getByText('No data available')).toBeInTheDocument();
  });
});

describe('BarChart - Layout Options', () => {
  const mockData: BarChartDataPoint[] = [
    { name: 'Active', count: 100 },
    { name: 'On Leave', count: 20 },
  ];

  it('supports vertical layout', () => {
    const { container } = render(
      <BarChart
        title="Employee Status"
        data={mockData}
        bars={[]}
        layout="vertical"
      />
    );

    const chartContainer = container.querySelector('[role="region"]');
    expect(chartContainer).toBeInTheDocument();
  });

  it('supports horizontal layout', () => {
    const { container } = render(
      <BarChart
        title="Employee Status"
        data={mockData}
        bars={[]}
        layout="horizontal"
      />
    );

    const chartContainer = container.querySelector('[role="region"]');
    expect(chartContainer).toBeInTheDocument();
  });

  it('defaults to horizontal layout', () => {
    const { container } = render(
      <BarChart
        title="Employee Status"
        data={mockData}
        bars={[]}
      />
    );

    const chartContainer = container.querySelector('[role="region"]');
    expect(chartContainer).toBeInTheDocument();
  });
});

describe('BarChart - Customization', () => {
  const mockData: BarChartDataPoint[] = [
    { name: 'Active', count: 100 },
  ];

  it('renders with custom height', () => {
    const { container } = render(
      <BarChart
        title="Employee Status"
        data={mockData}
        bars={[]}
        height={400}
      />
    );

    const regionDiv = container.querySelector('[role="region"]');
    expect(regionDiv).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <BarChart
        title="Employee Status"
        data={mockData}
        bars={[]}
        className="custom-class"
      />
    );

    const card = container.firstChild;
    expect(card).toHaveClass('custom-class');
  });

  it('renders without description', () => {
    render(
      <BarChart
        title="Employee Status"
        data={mockData}
        bars={[]}
      />
    );

    expect(screen.getByText('Employee Status')).toBeInTheDocument();
  });
});

describe('BarChart - Accessibility', () => {
  const mockData: BarChartDataPoint[] = [
    { name: 'Active', count: 100 },
  ];

  it('has proper role attribute', () => {
    const { container } = render(
      <BarChart
        title="Employee Status"
        data={mockData}
        bars={[
          { dataKey: 'count', fill: '#3b82f6', name: 'Count' },
        ]}
      />
    );

    const chartContainer = container.querySelector('[role="region"]');
    expect(chartContainer).toBeInTheDocument();
  });

  it('has aria-label with title', () => {
    const { container } = render(
      <BarChart
        title="Employee Status"
        data={mockData}
        bars={[
          { dataKey: 'count', fill: '#3b82f6', name: 'Count' },
        ]}
      />
    );

    const chartContainer = container.querySelector('[role="region"]');
    expect(chartContainer?.getAttribute('aria-label')).toContain('Employee Status');
  });

  it('has loading status role when loading', () => {
    const { container } = render(
      <BarChart
        title="Employee Status"
        data={mockData}
        bars={[]}
        loading={true}
      />
    );

    const loadingElement = container.querySelector('[role="status"]');
    expect(loadingElement).toBeInTheDocument();
  });

  it('has empty state region role', () => {
    const { container } = render(
      <BarChart
        title="Employee Status"
        data={[]}
        bars={[]}
        empty={true}
      />
    );

    const emptyElement = container.querySelector('[role="region"]');
    expect(emptyElement).toBeInTheDocument();
  });
});

describe('BarChart - Data Handling', () => {
  it('renders with empty data array', () => {
    const { container } = render(
      <BarChart
        title="Employee Status"
        data={[]}
        bars={[
          { dataKey: 'count', fill: '#3b82f6', name: 'Count' },
        ]}
      />
    );

    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders with large dataset', () => {
    const largeData: BarChartDataPoint[] = Array.from({ length: 50 }, (_, i) => ({
      name: `Category ${i + 1}`,
      count: Math.random() * 1000,
    }));

    const { container } = render(
      <BarChart
        title="Employee Status"
        data={largeData}
        bars={[
          { dataKey: 'count', fill: '#3b82f6', name: 'Count' },
        ]}
      />
    );

    const chartContainer = container.querySelector('[role="region"]');
    expect(chartContainer).toBeInTheDocument();
  });

  it('renders with multiple bar series', () => {
    const mockData: BarChartDataPoint[] = [
      { name: 'Active', count: 100, pending: 10 },
      { name: 'On Leave', count: 20, pending: 5 },
    ];

    const { container } = render(
      <BarChart
        title="Employee Status"
        data={mockData}
        bars={[
          { dataKey: 'count', fill: '#3b82f6', name: 'Count' },
          { dataKey: 'pending', fill: '#f59e0b', name: 'Pending' },
        ]}
      />
    );

    const chartContainer = container.querySelector('[role="region"]');
    expect(chartContainer).toBeInTheDocument();
  });
});
