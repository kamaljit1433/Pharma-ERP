import { describe, it, expect, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import PieChart, { PieChartDataPoint } from '../PieChart';

// Mock ResizeObserver for Recharts
beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as any;
});

describe('PieChart - Component Rendering', () => {
  const mockData: PieChartDataPoint[] = [
    { name: 'Casual', value: 30 },
    { name: 'Sick', value: 20 },
    { name: 'Earned', value: 50 },
  ];

  it('renders title and description', () => {
    render(
      <PieChart
        title="Leave Distribution"
        description="By leave type"
        data={mockData}
      />
    );

    expect(screen.getByText('Leave Distribution')).toBeInTheDocument();
    expect(screen.getByText('By leave type')).toBeInTheDocument();
  });

  it('renders pie chart with data', () => {
    const { container } = render(
      <PieChart
        title="Leave Distribution"
        data={mockData}
      />
    );

    const chartContainer = container.querySelector('[role="region"]');
    expect(chartContainer).toBeInTheDocument();
  });

  it('renders without description', () => {
    render(
      <PieChart
        title="Leave Distribution"
        data={mockData}
      />
    );

    expect(screen.getByText('Leave Distribution')).toBeInTheDocument();
  });
});

describe('PieChart - Loading State', () => {
  const mockData: PieChartDataPoint[] = [
    { name: 'Casual', value: 30 },
  ];

  it('shows loading skeleton when loading is true', () => {
    const { container } = render(
      <PieChart
        title="Leave Distribution"
        data={mockData}
        loading={true}
      />
    );

    const skeleton = container.querySelector('.animate-pulse');
    expect(skeleton).toBeInTheDocument();
  });

  it('hides chart when loading is true', () => {
    const { container } = render(
      <PieChart
        title="Leave Distribution"
        data={mockData}
        loading={true}
      />
    );

    const chartContainer = container.querySelector('[role="region"]');
    expect(chartContainer).not.toBeInTheDocument();
  });

  it('shows chart when loading is false', () => {
    const { container } = render(
      <PieChart
        title="Leave Distribution"
        data={mockData}
        loading={false}
      />
    );

    const chartContainer = container.querySelector('[role="region"]');
    expect(chartContainer).toBeInTheDocument();
  });
});

describe('PieChart - Empty State', () => {
  it('shows empty state message when empty is true', () => {
    render(
      <PieChart
        title="Leave Distribution"
        data={[]}
        empty={true}
        emptyMessage="No data available"
      />
    );

    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('hides chart when empty is true', () => {
    const { container } = render(
      <PieChart
        title="Leave Distribution"
        data={[]}
        empty={true}
      />
    );

    const chartContainer = container.querySelector('[role="region"]');
    expect(chartContainer).not.toBeInTheDocument();
  });

  it('shows default empty message when not provided', () => {
    render(
      <PieChart
        title="Leave Distribution"
        data={[]}
        empty={true}
      />
    );

    expect(screen.getByText('No data available')).toBeInTheDocument();
  });
});

describe('PieChart - Customization', () => {
  const mockData: PieChartDataPoint[] = [
    { name: 'Casual', value: 30 },
    { name: 'Sick', value: 20 },
  ];

  it('uses custom colors', () => {
    const customColors = ['#ff0000', '#00ff00', '#0000ff'];
    const { container } = render(
      <PieChart
        title="Leave Distribution"
        data={mockData}
        colors={customColors}
      />
    );

    const chartContainer = container.querySelector('[role="region"]');
    expect(chartContainer).toBeInTheDocument();
  });

  it('supports donut chart with innerRadius', () => {
    const { container } = render(
      <PieChart
        title="Leave Distribution"
        data={mockData}
        innerRadius={60}
      />
    );

    const chartContainer = container.querySelector('[role="region"]');
    expect(chartContainer).toBeInTheDocument();
  });

  it('renders with custom height', () => {
    const { container } = render(
      <PieChart
        title="Leave Distribution"
        data={mockData}
        height={400}
      />
    );

    const regionDiv = container.querySelector('[role="region"]');
    expect(regionDiv).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <PieChart
        title="Leave Distribution"
        data={mockData}
        className="custom-class"
      />
    );

    const card = container.firstChild;
    expect(card).toHaveClass('custom-class');
  });

  it('renders with default colors when not provided', () => {
    const { container } = render(
      <PieChart
        title="Leave Distribution"
        data={mockData}
      />
    );

    const chartContainer = container.querySelector('[role="region"]');
    expect(chartContainer).toBeInTheDocument();
  });
});

describe('PieChart - Accessibility', () => {
  const mockData: PieChartDataPoint[] = [
    { name: 'Casual', value: 30 },
    { name: 'Sick', value: 20 },
  ];

  it('has proper role attribute', () => {
    const { container } = render(
      <PieChart
        title="Leave Distribution"
        data={mockData}
      />
    );

    const chartContainer = container.querySelector('[role="region"]');
    expect(chartContainer).toBeInTheDocument();
  });

  it('has aria-label with title', () => {
    const { container } = render(
      <PieChart
        title="Leave Distribution"
        data={mockData}
      />
    );

    const chartContainer = container.querySelector('[role="region"]');
    expect(chartContainer?.getAttribute('aria-label')).toContain('Leave Distribution');
  });

  it('has loading status role when loading', () => {
    const { container } = render(
      <PieChart
        title="Leave Distribution"
        data={mockData}
        loading={true}
      />
    );

    const loadingElement = container.querySelector('[role="status"]');
    expect(loadingElement).toBeInTheDocument();
  });

  it('has empty state region role', () => {
    const { container } = render(
      <PieChart
        title="Leave Distribution"
        data={[]}
        empty={true}
      />
    );

    const emptyElement = container.querySelector('[role="region"]');
    expect(emptyElement).toBeInTheDocument();
  });
});

describe('PieChart - Data Handling', () => {
  it('renders with empty data array', () => {
    const { container } = render(
      <PieChart
        title="Leave Distribution"
        data={[]}
      />
    );

    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders with single data point', () => {
    const singleData: PieChartDataPoint[] = [
      { name: 'Casual', value: 100 },
    ];

    const { container } = render(
      <PieChart
        title="Leave Distribution"
        data={singleData}
      />
    );

    const chartContainer = container.querySelector('[role="region"]');
    expect(chartContainer).toBeInTheDocument();
  });

  it('renders with large dataset', () => {
    const largeData: PieChartDataPoint[] = Array.from({ length: 20 }, (_, i) => ({
      name: `Category ${i + 1}`,
      value: Math.random() * 100,
    }));

    const { container } = render(
      <PieChart
        title="Leave Distribution"
        data={largeData}
      />
    );

    const chartContainer = container.querySelector('[role="region"]');
    expect(chartContainer).toBeInTheDocument();
  });

  it('renders with zero values', () => {
    const dataWithZeros: PieChartDataPoint[] = [
      { name: 'Casual', value: 0 },
      { name: 'Sick', value: 20 },
      { name: 'Earned', value: 0 },
    ];

    const { container } = render(
      <PieChart
        title="Leave Distribution"
        data={dataWithZeros}
      />
    );

    const chartContainer = container.querySelector('[role="region"]');
    expect(chartContainer).toBeInTheDocument();
  });
});
