import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { LAYOUT_CONSTRAINTS } from '@/lib/layout-constraints';

export default function TasksLoading() {
  return (
    <div className={`${LAYOUT_CONSTRAINTS.pageMaxWidth} ${LAYOUT_CONSTRAINTS.pagePadding} mx-auto`}>
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1.5">
            <Skeleton className="h-8 w-44" />
            <Skeleton className="h-4 w-72 max-w-full" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-28 rounded-lg" />
            <Skeleton className="h-9 w-28 rounded-lg" />
          </div>
        </div>

        {/* Filters Bar Skeleton */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-10 w-full sm:max-w-xs rounded-lg" />
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-9 w-32 rounded-lg" />
            <Skeleton className="h-9 w-28 rounded-lg" />
          </div>
        </div>

        {/* Section Navigation Tabs Skeleton */}
        <div className="flex gap-2 border-b border-border pb-2">
          <Skeleton className="h-8 w-28 rounded-lg" />
          <Skeleton className="h-8 w-28 rounded-lg" />
        </div>

        {/* 3 Kanban Columns Skeleton */}
        <div className="grid gap-4 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, colIndex) => (
            <div
              key={colIndex}
              className="rounded-xl border border-border/60 bg-muted/20 p-3.5 space-y-3"
            >
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-2">
                  <Skeleton className="size-2.5 rounded-full" />
                  <Skeleton className="h-5 w-24" />
                </div>
                <Skeleton className="h-5 w-7 rounded-full" />
              </div>

              {/* Task Cards */}
              {Array.from({ length: colIndex === 0 ? 3 : 2 }).map((_, cardIndex) => (
                <Card key={cardIndex} className="shadow-xs">
                  <CardHeader className="p-4 pb-2 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-5 w-14 rounded-full" />
                    </div>
                    <Skeleton className="h-3 w-full" />
                  </CardHeader>
                  <CardContent className="p-4 pt-1 space-y-3">
                    <div className="flex items-center gap-1.5">
                      <Skeleton className="h-4 w-16 rounded-md" />
                      <Skeleton className="h-4 w-20 rounded-md" />
                    </div>
                    <div className="flex items-center justify-between border-t border-border/40 pt-2">
                      <div className="flex items-center gap-2">
                        <Skeleton className="size-6 rounded-full" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                      <Skeleton className="h-3 w-12" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
