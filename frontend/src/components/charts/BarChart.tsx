import React from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

export interface BarChartDataPoint {
  name: string;
  [key: string]: string | number;
}

interface BarChartProps {
  title: string;
  description?: string;
  data: BarChartDataPoint[];
  bars: Array<{
    dataKey: string;
    fill: string;
    name: string;
  }>;
  loading?: boolean;
  empty?: boolean;
  emptyMessage?: string;
  height?: number;
  className?: string;
  layout?: 'vertical' | 'horizontal';
}

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border rounded-lg p-2 shadow-lg">
        <p className="text-sm font-medium">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-xs" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function BarChart({
  title,
  description,
  data,
  bars,
  loading = false,
  empty = false,
  emptyMessage = 'No data available',
  height = 300,
  className = '',
  layout = 'horizontal',
}: BarChartProps) {
  const dataDescription = `Bar chart showing ${bars.map(b => b.name).join(', ')} by ${layout === 'vertical' ? 'category' : 'value'}`;
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div 
            className="w-full bg-muted rounded animate-pulse" 
            style={{ height }}
            role="status"
            aria-label="Loading chart data"
          />
        ) : empty ? (
          <div
            className="flex items-center justify-center bg-muted rounded text-muted-foreground"
            style={{ height }}
            role="region"
            aria-label={emptyMessage}
          >
            <p className="text-sm">{emptyMessage}</p>
          </div>
        ) : (
          <div role="region" aria-label={`${title}: ${dataDescription}`}>
            <ResponsiveContainer width="100%" height={height}>
              <RechartsBarChart 
                data={data} 
                layout={layout === 'vertical' ? 'vertical' : 'horizontal'}
                aria-label={dataDescription}
              >
                <CartesianGrid strokeDasharray="3 3" />
                {layout === 'vertical' ? (
                  <>
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                  </>
                ) : (
                  <>
                    <XAxis dataKey="name" />
                    <YAxis />
                  </>
                )}
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {bars.map((bar) => (
                  <Bar
                    key={bar.dataKey}
                    dataKey={bar.dataKey}
                    fill={bar.fill}
                    name={bar.name}
                    isAnimationActive={true}
                  />
                ))}
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
