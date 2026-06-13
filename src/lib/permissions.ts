import type { AppRole, TeamMembershipRole } from '@/generated/prisma/client';

export type AppModule =
  | 'dashboard'
  | 'activity'
  | 'focus'
  | 'tasks'
  | 'help'
  | 'leaderboard'
  | 'team'
  | 'notifications'
  | 'profile'
  | 'materials'
  | 'admin'
  | 'corporateReport';

const moduleRoles: Record<AppModule, readonly AppRole[]> = {
  dashboard: ['STUDENT', 'MENTOR', 'ADMIN', 'MODERATOR'],
  activity: ['STUDENT', 'MENTOR', 'ADMIN'],
  focus: ['STUDENT', 'MENTOR', 'ADMIN'],
  tasks: ['STUDENT', 'MENTOR', 'ADMIN'],
  help: ['STUDENT', 'MENTOR', 'ADMIN', 'MODERATOR'],
  leaderboard: ['STUDENT', 'MENTOR', 'ADMIN'],
  team: ['STUDENT', 'MENTOR', 'ADMIN'],
  notifications: ['STUDENT', 'MENTOR', 'ADMIN', 'MODERATOR', 'CORPORATE_VIEWER'],
  profile: ['STUDENT', 'MENTOR', 'ADMIN', 'MODERATOR', 'CORPORATE_VIEWER'],
  materials: ['STUDENT', 'MENTOR', 'ADMIN'],
  admin: ['ADMIN'],
  corporateReport: ['MENTOR', 'ADMIN', 'CORPORATE_VIEWER'],
};

export function canAccessModule(role: AppRole, module: AppModule) {
  return moduleRoles[module].includes(role);
}

export function canAssignTask(role: AppRole) {
  return role === 'MENTOR' || role === 'ADMIN';
}

export function canViewTask({
  role,
  profileId,
  createdByProfileId,
  assignedToProfileId,
  isActiveTeamMember,
}: {
  role: AppRole;
  profileId: string;
  createdByProfileId: string;
  assignedToProfileId: string | null;
  isActiveTeamMember: boolean;
}) {
  if (!canAccessModule(role, 'tasks')) return false;
  return (
    role === 'ADMIN' ||
    createdByProfileId === profileId ||
    assignedToProfileId === profileId ||
    isActiveTeamMember
  );
}

export function canManageTask({
  role,
  profileId,
  createdByProfileId,
  assignedToProfileId,
  teamRole,
}: {
  role: AppRole;
  profileId: string;
  createdByProfileId: string;
  assignedToProfileId: string | null;
  teamRole?: TeamMembershipRole | null;
}) {
  return (
    role === 'ADMIN' ||
    createdByProfileId === profileId ||
    assignedToProfileId === profileId ||
    Boolean(teamRole && ['LEAD', 'MENTOR', 'ADMIN'].includes(teamRole))
  );
}

export function canEditTaskDefinition(role: AppRole, profileId: string, creatorId: string) {
  return role === 'ADMIN' || profileId === creatorId;
}

export function canResolveHelpPost({
  role,
  profileId,
  authorProfileId,
  teamRole,
}: {
  role: AppRole;
  profileId: string;
  authorProfileId: string;
  teamRole?: TeamMembershipRole | null;
}) {
  return (
    role === 'ADMIN' ||
    role === 'MODERATOR' ||
    profileId === authorProfileId ||
    (role === 'MENTOR' && Boolean(teamRole)) ||
    Boolean(teamRole && ['ADMIN', 'MENTOR', 'LEAD'].includes(teamRole))
  );
}

export function canManageStudyMaterials(role: AppRole) {
  return role === 'MENTOR' || role === 'ADMIN';
}

export function canEditStudyMaterial(role: AppRole, profileId: string, ownerProfileId: string) {
  return role === 'ADMIN' || (role === 'MENTOR' && profileId === ownerProfileId);
}
