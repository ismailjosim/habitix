'use client';

import { ErrorState } from '@/components/shared';
import { LAYOUT_CONSTRAINTS } from '@/lib/layout-constraints';

export default function AppError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className={`${LAYOUT_CONSTRAINTS.pageMaxWidth} ${LAYOUT_CONSTRAINTS.pagePadding} mx-auto`}>
      <ErrorState retry={reset} />
    </div>
  );
}
