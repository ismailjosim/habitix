import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { LAYOUT_CONSTRAINTS } from '@/lib/layout-constraints';

export default function ProfileLoading() {
  return (
    <>
      {/* Profile Header Hero Banner Skeleton */}
      <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-muted/40 px-6 py-10">
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
          <Skeleton className="h-24 w-24 rounded-full border-4 border-background shadow-xl shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Skeleton className="h-8 w-52" />
              <Skeleton className="h-9 w-32 rounded-lg" />
            </div>
            <Skeleton className="h-4 w-44" />
            <div className="flex flex-wrap gap-2 pt-2">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-28 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      <div
        className={`${LAYOUT_CONSTRAINTS.pageMaxWidth} ${LAYOUT_CONSTRAINTS.pagePadding} mx-auto mt-6`}
      >
        <div className={LAYOUT_CONSTRAINTS.pageVerticalSpacing}>
          {/* Main Grid: Profile Form (2 cols) + Stats (1 col) */}
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="pb-4">
                  <Skeleton className="h-6 w-44" />
                  <Skeleton className="h-4 w-60" />
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Avatar Upload box */}
                  <div className="rounded-xl border border-border/50 p-4 space-y-3">
                    <Skeleton className="h-4 w-28" />
                    <div className="flex gap-4 items-center">
                      <Skeleton className="size-24 rounded-2xl shrink-0" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-8 w-28 rounded-lg" />
                      </div>
                    </div>
                  </div>

                  {/* Form fields */}
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="space-y-1.5">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-10 w-full rounded-lg" />
                    </div>
                  ))}
                  <Skeleton className="h-10 w-32 rounded-lg" />
                </CardContent>
              </Card>
            </div>

            {/* Stats Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <Skeleton className="h-5 w-28" />
                </CardHeader>
                <CardContent className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-2 border-b border-border/40 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <Skeleton className="size-8 rounded-lg" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <Skeleton className="h-6 w-14" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Badges Section */}
          <Card>
            <CardHeader className="pb-3">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-52" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl border border-border/40"
                  >
                    <Skeleton className="size-14 rounded-full" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
