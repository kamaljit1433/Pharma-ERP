import React from 'react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

export interface PieChartDataPoint {
  name: string;
  value: number;
}

interface PieChartProps {
  title: string;
  description?: string;
  data: PieChartDataPoint[];
  colors?: string[];
  loading?: boolean;
  empty?: boolean;
  emptyMessage?: string;
  height?: number;
  className?: string;
  innerRadius?: number;
}

const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-background border border-border rounded-lg p-2 shadow-lg">
        <p className="text-sm font-medium">{data.name}</p>
        <p className="text-xs" style={{ color: data.color }}>
          Value: {data.value}
        </p>
      </div>
    );
  }
  return null;
};

const DEFAULT_COLORS = [
  '#3b82f6',
  '#ef4444',
  '#10b981',
  '#f59e0b',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
  '#f97316',
];

export default function PieChart({
  title,
  description,
  data,
  colors = DEFAULT_COLORS,
  loading = false,
  empty = false,
  emptyMessage = 'No data available',
  height = 300,
  className = '',
  innerRadius = 0,
}: PieChartProps) {
  const chartType = innerRadius > 0 ? 'donut' : 'pie';
  const dataDescription = `${chartType} chart showing distribution of ${data.map(d => d.name).join(', ')}`;
  
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
              <RechartsPieChart aria-label={dataDescription}>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  innerRadius={innerRadius}
                  fill="#8884d8"
                  dataKey="value"
                  isAnimationActive={true}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
