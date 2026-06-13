import React from 'react';
import { Card } from '@/components/ui/card';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    label?: string;
  };
}

export function StatCard({ label, value, icon, trend }: StatCardProps) {
  return (
    <Card className="flex flex-col gap-2 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
      <p className="text-2xl font-bold">{value}</p>
      {trend && (
        <p
          className={`text-xs font-medium ${trend.value >= 0 ? 'text-green-600' : 'text-red-600'}`}
        >
          {trend.value > 0 ? '+' : ''}
          {trend.value}% {trend.label ?? 'vs previous period'}
        </p>
      )}
    </Card>
  );
}
