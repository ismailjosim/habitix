import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { LAYOUT_CONSTRAINTS } from '@/lib/layout-constraints';

export default function CorporateReportLoading() {
  return (
    <div
      className={`${LAYOUT_CONSTRAINTS.pageMaxWidth} ${LAYOUT_CONSTRAINTS.pagePadding} mx-auto py-6 space-y-6`}
    >
      {/* Header Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-32 rounded-lg" />
          <Skeleton className="h-9 w-24 rounded-lg" />
        </div>
      </div>

      {/* Metrics Cards Skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-7 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Report Cards Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-5 space-y-4">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-40 w-full rounded-lg" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 space-y-4">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-40 w-full rounded-lg" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
