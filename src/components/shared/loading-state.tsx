import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

interface LoadingStateProps {
  title?: string;
  count?: number;
}

export function LoadingState({ title, count = 3 }: LoadingStateProps) {
  return (
    <div className="space-y-4">
      {title && <Skeleton className="h-8 w-1/3" />}
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <CardContent className="space-y-2 py-4">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <Card>
      <CardContent className="space-y-2 py-4">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </CardContent>
    </Card>
  );
}
