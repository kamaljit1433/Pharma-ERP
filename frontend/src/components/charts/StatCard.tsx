import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  loading?: boolean;
  className?: string;
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  loading = false,
  className = '',
}: StatCardProps) {
  const trendText = trend ? `${trend.isPositive ? 'increased' : 'decreased'} by ${Math.abs(trend.value)}%` : '';
  const ariaLabel = `${title}: ${value}${description ? `, ${description}` : ''}${trendText ? `, ${trendText}` : ''}`;

  return (
    <Card className={className} role="region" aria-label={title}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div 
            className="h-8 bg-muted rounded animate-pulse" 
            role="status" 
            aria-label="Loading statistics"
          />
        ) : (
          <>
            <div className="text-2xl font-bold" aria-label={ariaLabel}>
              {value}
            </div>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
            {trend && (
              <div 
                className={`text-xs mt-2 ${trend.isPositive ? 'text-success' : 'text-destructive'}`}
                aria-label={`Trend: ${trendText}`}
              >
                <span aria-hidden="true">{trend.isPositive ? '↑' : '↓'}</span> {Math.abs(trend.value)}%
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
