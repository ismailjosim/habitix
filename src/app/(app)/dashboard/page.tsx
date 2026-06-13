import { getDashboardData } from '@/lib/queries/dashboard';
import { WelcomeBanner } from '@/components/dashboard/welcome-banner';
import { StatCard } from '@/components/dashboard/stat-card';
import { NotificationPanel } from '@/components/dashboard/notification-panel';
import { TeamPresencePanel } from '@/components/presence/team-presence-panel';
import { ActivityHeatmap } from '@/components/dashboard/activity-heatmap';
import { IconClock, IconFlame, IconCheck, IconTrophy } from '@tabler/icons-react';
import { redirect } from 'next/navigation';
import { getCurrentUserProfile } from '@/lib/session';

export default async function DashboardPage() {
  const current = await getCurrentUserProfile();
  if (current?.profile.role === 'CORPORATE_VIEWER') redirect('/corporate-report');
  const data = await getDashboardData();

  const formatFocusTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <WelcomeBanner userName={current?.session.user.name || 'Student'} />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Focus Hours · 7 days"
          value={formatFocusTime(data.stats.focusMinutes)}
          icon={<IconClock className="h-5 w-5" />}
          trend={{ value: data.stats.trends.focus }}
        />
        <StatCard
          label="Current Streak"
          value={`${data.stats.currentStreak} days`}
          icon={<IconFlame className="h-5 w-5" />}
        />
        <StatCard
          label="Tasks Completed · 7 days"
          value={data.stats.completedTasks}
          icon={<IconCheck className="h-5 w-5" />}
          trend={{ value: data.stats.trends.tasks }}
        />
        <StatCard
          label="Help Points · 7 days"
          value={data.stats.helpPoints}
          icon={<IconTrophy className="h-5 w-5" />}
          trend={{ value: data.stats.trends.help }}
        />
      </div>

      {/* Activity Heatmap */}
      <ActivityHeatmap days={data.daily} />

      {/* Peers and Notifications */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <TeamPresencePanel members={data.onlinePeers} />
        <NotificationPanel notifications={data.notifications} />
      </div>
    </div>
  );
}
