import Link from 'next/link';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';

import { Button } from '@/components/ui/button';

export function PaginationLinks({
  page,
  pageSize,
  total,
  params,
}: {
  page: number;
  pageSize: number;
  total: number;
  params: Record<string, string | undefined>;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  return (
    <nav className="flex items-center justify-between gap-3" aria-label="Pagination">
      <p className="text-sm text-muted-foreground">
        Page {Math.min(page, totalPages)} of {totalPages} · {total} results
      </p>
      <div className="flex gap-2">
        {page <= 1 ? (
          <Button variant="outline" size="sm" disabled>
            <IconChevronLeft /> Previous
          </Button>
        ) : (
          <Button asChild variant="outline" size="sm">
            <Link href={pageHref(params, page - 1)}>
              <IconChevronLeft /> Previous
            </Link>
          </Button>
        )}
        {page >= totalPages ? (
          <Button variant="outline" size="sm" disabled>
            Next <IconChevronRight />
          </Button>
        ) : (
          <Button asChild variant="outline" size="sm">
            <Link href={pageHref(params, page + 1)}>
              Next <IconChevronRight />
            </Link>
          </Button>
        )}
      </div>
    </nav>
  );
}

function pageHref(params: Record<string, string | undefined>, page: number) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) search.set(key, value);
  });
  search.set('page', String(Math.max(1, page)));
  return `?${search.toString()}`;
}
