import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function FocusModeLoading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <header className="space-y-1.5">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-44" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </header>

      {/* Grid: Timer (left) + Sidebar (right) */}
      <div className="grid gap-6 lg:grid-cols-[1fr_24rem]">
        {/* Left Timer Dial Card */}
        <Card className="flex flex-col justify-between p-6 space-y-8">
          {/* Controls Skeleton */}
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-16 rounded-lg" />
              ))}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          </div>

          {/* Big Circular Dial Skeleton */}
          <div className="flex flex-col items-center justify-center py-6">
            <div className="relative flex size-64 items-center justify-center rounded-full border-8 border-muted/50">
              <div className="flex flex-col items-center gap-2">
                <Skeleton className="h-14 w-36 rounded-lg" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          </div>

          {/* Action Buttons Skeleton */}
          <div className="flex items-center justify-center gap-4">
            <Skeleton className="h-12 w-36 rounded-xl" />
            <Skeleton className="size-12 rounded-xl" />
            <Skeleton className="size-12 rounded-xl" />
          </div>
        </Card>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* VS Code Card Skeleton */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Skeleton className="size-6 rounded-md" />
                <Skeleton className="h-5 w-40" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-8 w-32 rounded-lg" />
            </CardContent>
          </Card>

          {/* Sessions History Card Skeleton */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg border border-border/40 p-3"
                >
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <Skeleton className="h-4 w-12" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
