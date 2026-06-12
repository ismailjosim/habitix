import { getDashboardData } from '@/lib/queries/dashboard';
import { getCurrentSession } from '@/lib/session';
import { WelcomeBanner } from '@/components/dashboard/welcome-banner';
import { StatCard } from '@/components/dashboard/stat-card';
import { NotificationPanel } from '@/components/dashboard/notification-panel';
import { TeamPresencePanel } from '@/components/presence/team-presence-panel';
import { ActivityHeatmap } from '@/components/dashboard/activity-heatmap';
import { IconClock, IconFlame, IconCheck, IconTrophy } from '@tabler/icons-react';

export default async function DashboardPage() {
  const session = await getCurrentSession();
  const data = await getDashboardData();

  const formatFocusTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <WelcomeBanner userName={session?.user?.name || 'Student'} />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Focus Time Today"
          value={formatFocusTime(data.stats.focusTimeToday)}
          icon={<IconClock className="h-5 w-5" />}
        />
        <StatCard
          label="Current Streak"
          value={`${data.stats.currentStreak} days`}
          icon={<IconFlame className="h-5 w-5" />}
        />
        <StatCard
          label="Tasks Completed"
          value={data.stats.completedTasksToday}
          icon={<IconCheck className="h-5 w-5" />}
        />
        <StatCard
          label="Help Points"
          value={data.stats.helpPoints}
          icon={<IconTrophy className="h-5 w-5" />}
        />
      </div>

      {/* Activity Heatmap */}
      <ActivityHeatmap activities={data.recentActivity} />

      {/* Peers and Notifications */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <TeamPresencePanel members={data.onlinePeers} />
        <NotificationPanel notifications={data.notifications} />
      </div>
    </div>
  );
}
