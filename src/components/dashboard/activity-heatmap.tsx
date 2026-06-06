import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ActivityEventModel } from '@/generated/prisma/models';

interface ActivityHeatmapProps {
  activities: ActivityEventModel[];
}

export function ActivityHeatmap({ activities }: ActivityHeatmapProps) {
  // Create a map of activity counts by date
  const activityMap = new Map<string, number>();

  activities.forEach((activity) => {
    const date = new Date(activity.createdAt).toLocaleDateString();
    activityMap.set(date, (activityMap.get(date) ?? 0) + 1);
  });

  // Get last 7 days
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toLocaleDateString();
    const count = activityMap.get(dateStr) ?? 0;
    days.push({
      date: dateStr,
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      count,
    });
  }

  const getIntensity = (count: number) => {
    if (count === 0) return 'bg-slate-100';
    if (count === 1) return 'bg-green-200';
    if (count === 2) return 'bg-green-400';
    return 'bg-green-600';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Activity Heatmap (7 days)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between gap-2">
          {days.map((day, idx) => (
            <div key={idx} className="flex flex-col items-center gap-1">
              <div
                className={`h-8 w-8 rounded ${getIntensity(day.count)} transition-colors hover:ring-2 hover:ring-primary`}
                title={`${day.date}: ${day.count} activities`}
              />
              <p className="text-xs text-muted-foreground">{day.day}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">Total: {activities.length} activities</p>
      </CardContent>
    </Card>
  );
}
