import { Suspense } from 'react';
import { getTeamData } from '@/lib/queries/team';
import { getTeamTasks } from '@/lib/queries/team-tasks';
import { TeamHeader, TeamRoleCards, TeamMembers, TeamTasks } from '@/components/team';
import { LAYOUT_CONSTRAINTS } from '@/lib/layout-constraints';
import { LoadingState, PageHeader, EmptyState } from '@/components/shared';
import { TeamPresencePanel } from '@/components/presence/team-presence-panel';
import { getTeamPresence } from '@/lib/queries/presence';

async function TeamContent() {
  const teamData = await getTeamData();

  if (!teamData) {
    return (
      <div
        className={`${LAYOUT_CONSTRAINTS.pageMaxWidth} ${LAYOUT_CONSTRAINTS.pagePadding} mx-auto`}
      >
        <div className={LAYOUT_CONSTRAINTS.pageVerticalSpacing}>
          <PageHeader title="Team" description="Collaboration and team management" />
          <EmptyState
            title="You're not in a team yet"
            description="Ask your instructor to invite you to a team, or create one to get started"
          />
        </div>
      </div>
    );
  }

  const [tasks, presence] = await Promise.all([
    getTeamTasks(teamData.id),
    getTeamPresence({
      teamId: teamData.id,
      viewerProfileId: teamData.currentUserProfileId,
    }),
  ]);

  return (
    <>
      <TeamHeader team={teamData} />

      <div
        className={`${LAYOUT_CONSTRAINTS.pageMaxWidth} ${LAYOUT_CONSTRAINTS.pagePadding} mx-auto`}
      >
        <div className={LAYOUT_CONSTRAINTS.pageVerticalSpacing}>
          {/* Role Cards */}
          <TeamRoleCards leaders={teamData.roles.leaders} mentors={teamData.roles.mentors} />

          {/* Main Content Grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <TeamTasks tasks={tasks} />
            </div>
            <div>
              <div className="space-y-6">
                <TeamPresencePanel members={presence} />
                <TeamMembers members={teamData.members} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function TeamPage() {
  return (
    <Suspense
      fallback={
        <div
          className={`${LAYOUT_CONSTRAINTS.pageMaxWidth} ${LAYOUT_CONSTRAINTS.pagePadding} mx-auto`}
        >
          <div className={LAYOUT_CONSTRAINTS.pageVerticalSpacing}>
            <LoadingState title="Loading team..." count={4} />
          </div>
        </div>
      }
    >
      <TeamContent />
    </Suspense>
  );
}
