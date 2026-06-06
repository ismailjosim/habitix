import React from 'react';
import { Card } from '@/components/ui/card';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
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
          className={`text-xs font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}
        >
          {trend.isPositive ? '+' : ''}
          {trend.value}% from yesterday
        </p>
      )}
    </Card>
  );
}
