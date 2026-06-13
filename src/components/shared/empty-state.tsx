import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <Card className="border-dashed bg-muted/35 shadow-none">
      <CardContent className="flex flex-col items-center justify-center px-6 py-14 text-center">
        {icon && (
          <div className="mb-5 grid size-12 place-items-center rounded-2xl bg-primary-soft text-2xl text-primary">
            {icon}
          </div>
        )}
        <h3 className="text-base font-semibold tracking-tight">{title}</h3>
        {description && (
          <p className="mt-1.5 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
        )}
        {action && <div className="mt-5">{action}</div>}
      </CardContent>
    </Card>
  );
}
