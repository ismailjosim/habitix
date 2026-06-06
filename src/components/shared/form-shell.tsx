import React from 'react';
import { Card } from '@/components/ui/card';

interface FormShellProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void | Promise<void>;
  isLoading?: boolean;
}

type DisableableChild = React.ReactElement<{ disabled?: boolean }>;

export function FormShell({
  title,
  description,
  children,
  onSubmit,
  isLoading = false,
}: FormShellProps) {
  return (
    <Card className="max-w-lg">
      <div className="space-y-6 p-6">
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          {React.cloneElement(children as DisableableChild, { disabled: isLoading })}
        </form>
      </div>
    </Card>
  );
}
