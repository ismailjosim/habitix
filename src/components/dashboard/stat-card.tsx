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
    <Card className="group flex min-h-36 flex-col justify-between gap-4 p-5 transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {icon && (
          <div className="grid size-9 place-items-center rounded-xl bg-primary-soft text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            {icon}
          </div>
        )}
      </div>
      <div>
        <p className="text-3xl font-bold tracking-[-0.04em]">{value}</p>
        {trend && (
          <p className="mt-2 text-xs text-muted-foreground">
            <span
              className={`mr-1.5 rounded-full px-2 py-1 font-semibold ${
                trend.value >= 0
                  ? 'bg-success-soft text-success'
                  : 'bg-destructive/10 text-destructive'
              }`}
            >
              {trend.value > 0 ? '+' : ''}
              {trend.value}%
            </span>
            {trend.label ?? 'vs previous period'}
          </p>
        )}
      </div>
    </Card>
  );
}
