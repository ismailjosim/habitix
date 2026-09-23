import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { LAYOUT_CONSTRAINTS } from '@/lib/layout-constraints';

export default function LeaderboardLoading() {
  return (
    <div className={`${LAYOUT_CONSTRAINTS.pageMaxWidth} ${LAYOUT_CONSTRAINTS.pagePadding} mx-auto`}>
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-44" />
              <Skeleton className="h-5 w-24 rounded-full" />
            </div>
            <Skeleton className="h-4 w-64 max-w-full" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-32 rounded-lg" />
            <Skeleton className="h-9 w-28 rounded-lg" />
          </div>
        </div>

        {/* 4 Metrics Grid Skeleton */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="space-y-1">
                  <Skeleton className="h-3.5 w-24" />
                  <Skeleton className="h-7 w-16" />
                </div>
                <Skeleton className="size-10 rounded-xl" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Champions Cards Skeleton */}
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i} className="border-primary/20 bg-muted/20">
              <CardContent className="flex items-center gap-4 p-5">
                <Skeleton className="size-16 rounded-full border-2 border-primary/40 shrink-0" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-3.5 w-24" />
                </div>
                <Skeleton className="size-10 rounded-full shrink-0" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 2-Column Rankings Skeleton */}
        <div className="grid gap-6 xl:grid-cols-2">
          {Array.from({ length: 2 }).map((_, col) => (
            <Card key={col}>
              <CardHeader className="pb-3">
                <Skeleton className="h-5 w-44" />
              </CardHeader>
              <CardContent className="space-y-3">
                {Array.from({ length: 5 }).map((_, row) => (
                  <div
                    key={row}
                    className="flex items-center justify-between rounded-lg border border-border/40 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <Skeleton className="size-6 rounded-full" />
                      <Skeleton className="size-8 rounded-full" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
