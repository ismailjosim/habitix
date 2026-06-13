import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate, formatDuration } from '@/lib/display-helpers';

type DailyPoint = {
  date: string;
  focusMinutes: number;
  helpCreditMinutes: number;
  totalMinutes: number;
};

export function ActivityHeatmap({ days }: { days: DailyPoint[] }) {
  const max = Math.max(...days.map(({ totalMinutes }) => totalMinutes), 1);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">7-day activity</CardTitle>
        <p className="text-sm text-muted-foreground">
          Focus minutes plus 10 minutes of activity credit per help point.
        </p>
      </CardHeader>
      <CardContent>
        <div
          className="flex h-44 items-end gap-3"
          role="img"
          aria-label="Seven day focus and help-credit chart"
        >
          {days.map((day) => (
            <div key={day.date} className="flex min-w-0 flex-1 flex-col items-center gap-2">
              <div
                className="flex h-32 w-full items-end justify-center overflow-hidden rounded-t-md bg-muted/50"
                title={`${formatDate(day.date)}: ${formatDuration(day.focusMinutes)} focus, ${formatDuration(day.helpCreditMinutes)} help credit`}
              >
                <div
                  className="flex w-full flex-col-reverse"
                  style={{
                    height: `${Math.max((day.totalMinutes / max) * 100, day.totalMinutes ? 5 : 0)}%`,
                  }}
                >
                  <span
                    className="bg-primary"
                    style={{
                      height: `${day.totalMinutes ? (day.focusMinutes / day.totalMinutes) * 100 : 0}%`,
                    }}
                  />
                  <span
                    className="bg-amber-400"
                    style={{
                      height: `${day.totalMinutes ? (day.helpCreditMinutes / day.totalMinutes) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
              <span className="text-xs text-muted-foreground">
                {new Date(`${day.date}T00:00:00`).toLocaleDateString('en-US', { weekday: 'short' })}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-4 text-xs text-muted-foreground">
          <span>
            <i className="mr-1 inline-block size-2 rounded-full bg-primary" />
            Focus
          </span>
          <span>
            <i className="mr-1 inline-block size-2 rounded-full bg-amber-400" />
            Help credit
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
