import { Button } from '@/components/ui/button';

interface LeaderboardHeaderProps {
  teamName: string | null;
  view: 'rankings' | 'badges';
  setView: (view: 'rankings' | 'badges') => void;
  period: 'weekly' | 'monthly';
  setPeriod: (period: 'weekly' | 'monthly') => void;
}

export function LeaderboardHeader({
  teamName,
  view,
  setView,
  period,
  setPeriod,
}: LeaderboardHeaderProps) {
  return (
    <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="text-sm font-medium text-muted-foreground">Recognition</p>
        <h1 className="text-3xl font-bold">Leaderboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {teamName ? `Team-scoped rankings for ${teamName}.` : 'Join a team to view rankings.'}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="inline-flex rounded-lg border bg-background p-1">
          <Button
            variant={view === 'rankings' ? 'secondary' : 'ghost'}
            onClick={() => setView('rankings')}
          >
            Rankings
          </Button>
          <Button
            variant={view === 'badges' ? 'secondary' : 'ghost'}
            onClick={() => setView('badges')}
          >
            Badges
          </Button>
        </div>

        {view === 'rankings' && (
          <div className="inline-flex rounded-lg border bg-background p-1">
            <Button
              variant={period === 'weekly' ? 'secondary' : 'ghost'}
              onClick={() => setPeriod('weekly')}
            >
              Weekly
            </Button>
            <Button
              variant={period === 'monthly' ? 'secondary' : 'ghost'}
              onClick={() => setPeriod('monthly')}
            >
              Monthly
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
