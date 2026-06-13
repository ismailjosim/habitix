'use client';

import { IconAlertTriangle } from '@tabler/icons-react';

import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';

export function ErrorState({
  title = 'Something went wrong',
  description = 'The page could not be loaded. Please try again.',
  retry,
}: {
  title?: string;
  description?: string;
  retry?: () => void;
}) {
  return (
    <EmptyState
      icon={<IconAlertTriangle className="size-10" />}
      title={title}
      description={description}
      action={retry ? <Button onClick={retry}>Try again</Button> : undefined}
    />
  );
}
