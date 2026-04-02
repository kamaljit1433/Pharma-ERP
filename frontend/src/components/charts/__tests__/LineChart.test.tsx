import { describe, it, expect, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import LineChart, { LineChartDataPoint } from '../LineChart';

// Mock ResizeObserver for Recharts
beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as any;
});

describe('LineChart - Component Rendering', () => {
  const mockData: LineChartDataPoint[] = [
    { name: 'Jan', sales: 100, revenue: 200 },
    { name: 'Feb', sales: 150, revenue: 250 },
    { name: 'Mar', sales: 120, revenue: 220 },
  ];

  it('renders title and description', () => {
    render(
      <LineChart
        title="Sales Trend"
        description="Monthly sales data"
        data={mockData}
        lines={[
          { dataKey: 'sales', stroke: '#3b82f6', name: 'Sales' },
        ]}
      />
    );

    expect(screen.getByText('Sales Trend')).toBeInTheDocument();
    expect(screen.getByText('Monthly sales data')).toBeInTheDocument();
  });

  it('renders chart with multiple lines', () => {
    const { container } = render(
      <LineChart
        title="Sales Trend"
        data={mockData}
        lines={[
          { dataKey: 'sales', stroke: '#3b82f6', name: 'Sales' },
          { dataKey: 'revenue', stroke: '#10b981', name: 'Revenue' },
        ]}
      />
    );

    const chartContainer = container.querySelector('[role="region"]');
    expect(chartContainer).toBeInTheDocument();
  });

  it('renders chart with single line', () => {
    const { container } = render(
      <LineChart
        title="Sales Trend"
        data={mockData}
        lines={[
          { dataKey: 'sales', stroke: '#3b82f6', name: 'Sales' },
        ]}
      />
    );

    const chartContainer = container.querySelector('[role="region"]');
    expect(chartContainer).toBeInTheDocument();
  });
});

describe('LineChart - Loading State', () => {
  const mockData: LineChartDataPoint[] = [
    { name: 'Jan', sales: 100, revenue: 200 },
  ];

  it('shows loading skeleton when loading is true', () => {
    const { container } = render(
      <LineChart
        title="Sales Trend"
        data={mockData}
        lines={[]}
        loading={true}
      />
    );

    const skeleton = container.querySelector('.animate-pulse');
    expect(skeleton).toBeInTheDocument();
  });

  it('hides chart when loading is true', () => {
    const { container } = render(
      <LineChart
        title="Sales Trend"
        data={mockData}
        lines={[]}
        loading={true}
      />
    );

    const chartContainer = container.querySelector('[role="region"]');
    expect(chartContainer).not.toBeInTheDocument();
  });

  it('shows chart when loading is false', () => {
    const { container } = render(
      <LineChart
        title="Sales Trend"
        data={mockData}
        lines={[
          { dataKey: 'sales', stroke: '#3b82f6', name: 'Sales' },
        ]}
        loading={false}
      />
    );

    const chartContainer = container.querySelector('[role="region"]');
    expect(chartContainer).toBeInTheDocument();
  });
});

describe('LineChart - Empty State', () => {
  it('shows empty state message when empty is true', () => {
    render(
      <LineChart
        title="Sales Trend"
        data={[]}
        lines={[]}
        empty={true}
        emptyMessage="No data available"
      />
    );

    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('uses custom empty message', () => {
    render(
      <LineChart
        title="Sales Trend"
        data={[]}
        lines={[]}
        empty={true}
        emptyMessage="Custom empty message"
      />
    );

    expect(screen.getByText('Custom empty message')).toBeInTheDocument();
  });

  it('hides chart when empty is true', () => {
    const { container } = render(
      <LineChart
        title="Sales Trend"
        data={[]}
        lines={[]}
        empty={true}
      />
    );

    const chartContainer = container.querySelector('[role="region"]');
    expect(chartContainer).not.toBeInTheDocument();
  });

  it('shows default empty message when not provided', () => {
    render(
      <LineChart
        title="Sales Trend"
        data={[]}
        lines={[]}
        empty={true}
      />
    );

    expect(screen.getByText('No data available')).toBeInTheDocument();
  });
});

describe('LineChart - Customization', () => {
  const mockData: LineChartDataPoint[] = [
    { name: 'Jan', sales: 100 },
  ];

  it('renders with custom height', () => {
    const { container } = render(
      <LineChart
        title="Sales Trend"
        data={mockData}
        lines={[]}
        height={400}
      />
    );

    const regionDiv = container.querySelector('[role="region"]');
    expect(regionDiv).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <LineChart
        title="Sales Trend"
        data={mockData}
        lines={[]}
        className="custom-class"
      />
    );

    const card = container.firstChild;
    expect(card).toHaveClass('custom-class');
  });

  it('renders without description', () => {
    render(
      <LineChart
        title="Sales Trend"
        data={mockData}
        lines={[]}
      />
    );

    expect(screen.getByText('Sales Trend')).toBeInTheDocument();
  });
});

describe('LineChart - Accessibility', () => {
  const mockData: LineChartDataPoint[] = [
    { name: 'Jan', sales: 100, revenue: 200 },
  ];

  it('has proper role attribute', () => {
    const { container } = render(
      <LineChart
        title="Sales Trend"
        data={mockData}
        lines={[
          { dataKey: 'sales', stroke: '#3b82f6', name: 'Sales' },
        ]}
      />
    );

    const chartContainer = container.querySelector('[role="region"]');
    expect(chartContainer).toBeInTheDocument();
  });

  it('has aria-label with title and description', () => {
    const { container } = render(
      <LineChart
        title="Sales Trend"
        data={mockData}
        lines={[
          { dataKey: 'sales', stroke: '#3b82f6', name: 'Sales' },
        ]}
      />
    );

    const chartContainer = container.querySelector('[role="region"]');
    expect(chartContainer?.getAttribute('aria-label')).toContain('Sales Trend');
  });

  it('has loading status role when loading', () => {
    const { container } = render(
      <LineChart
        title="Sales Trend"
        data={mockData}
        lines={[]}
        loading={true}
      />
    );

    const loadingElement = container.querySelector('[role="status"]');
    expect(loadingElement).toBeInTheDocument();
  });

  it('has empty state region role', () => {
    const { container } = render(
      <LineChart
        title="Sales Trend"
        data={[]}
        lines={[]}
        empty={true}
      />
    );

    const emptyElement = container.querySelector('[role="region"]');
    expect(emptyElement).toBeInTheDocument();
  });
});

describe('LineChart - Data Handling', () => {
  it('renders with empty data array', () => {
    const { container } = render(
      <LineChart
        title="Sales Trend"
        data={[]}
        lines={[
          { dataKey: 'sales', stroke: '#3b82f6', name: 'Sales' },
        ]}
      />
    );

    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders with large dataset', () => {
    const largeData: LineChartDataPoint[] = Array.from({ length: 100 }, (_, i) => ({
      name: `Month ${i + 1}`,
      sales: Math.random() * 1000,
      revenue: Math.random() * 2000,
    }));

    const { container } = render(
      <LineChart
        title="Sales Trend"
        data={largeData}
        lines={[
          { dataKey: 'sales', stroke: '#3b82f6', name: 'Sales' },
        ]}
      />
    );

    const chartContainer = container.querySelector('[role="region"]');
    expect(chartContainer).toBeInTheDocument();
  });

  it('renders with multiple data keys', () => {
    const mockData: LineChartDataPoint[] = [
      { name: 'Jan', sales: 100, revenue: 200, profit: 50 },
      { name: 'Feb', sales: 150, revenue: 250, profit: 75 },
    ];

    const { container } = render(
      <LineChart
        title="Sales Trend"
        data={mockData}
        lines={[
          { dataKey: 'sales', stroke: '#3b82f6', name: 'Sales' },
          { dataKey: 'revenue', stroke: '#10b981', name: 'Revenue' },
          { dataKey: 'profit', stroke: '#f59e0b', name: 'Profit' },
        ]}
      />
    );

    const chartContainer = container.querySelector('[role="region"]');
    expect(chartContainer).toBeInTheDocument();
  });
});
