import React from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

export interface LineChartDataPoint {
  name: string;
  [key: string]: string | number;
}

interface LineChartProps {
  title: string;
  description?: string;
  data: LineChartDataPoint[];
  lines: Array<{
    dataKey: string;
    stroke: string;
    name: string;
  }>;
  loading?: boolean;
  empty?: boolean;
  emptyMessage?: string;
  height?: number;
  className?: string;
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

export default function LineChart({
  title,
  description,
  data,
  lines,
  loading = false,
  empty = false,
  emptyMessage = 'No data available',
  height = 300,
  className = '',
}: LineChartProps) {
  const dataDescription = `Line chart showing ${lines.map(l => l.name).join(', ')} over time`;
  
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
              <RechartsLineChart 
                data={data}
                aria-label={dataDescription}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {lines.map((line) => (
                  <Line
                    key={line.dataKey}
                    type="monotone"
                    dataKey={line.dataKey}
                    stroke={line.stroke}
                    name={line.name}
                    dot={false}
                    isAnimationActive={true}
                  />
                ))}
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
