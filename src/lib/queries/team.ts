import { prisma } from '@/lib/prisma';
import { getCurrentSession } from '@/lib/session';
import { notFound } from 'next/navigation';

export interface TeamMember {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  email: string;
  role: string;
  joinedAt: Date;
  profileRole: string;
  helpPoints: number;
}

export interface TeamData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  avatarUrl: string | null;
  owner: {
    id: string;
    displayName: string;
    email: string;
  };
  members: TeamMember[];
  roles: {
    leaders: TeamMember[];
    mentors: TeamMember[];
    members: TeamMember[];
  };
  memberCount: number;
  currentUserRole: string;
  currentUserProfileId: string;
}

export async function getTeamData(): Promise<TeamData | null> {
  const session = await getCurrentSession();
  if (!session) {
    notFound();
  }

  // Get current user's profile
  const profile = await prisma.userProfile.findUnique({
    where: { authUserId: session.user.id },
  });

  if (!profile) {
    notFound();
  }

  // Get user's team membership
  const membership = await prisma.teamMembership.findFirst({
    where: {
      profileId: profile.id,
      leftAt: null, // Only active memberships
    },
    include: {
      team: {
        include: {
          owner: {
            include: {
              authUser: true,
            },
          },
          memberships: {
            where: { leftAt: null },
            include: {
              profile: {
                include: {
                  authUser: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!membership) {
    return null; // User has no active team
  }

  const team = membership.team;

  const members = team.memberships.map((m) => ({
    id: m.profile.id,
    displayName: m.profile.displayName,
    avatarUrl: m.profile.avatarUrl,
    email: m.profile.authUser.email,
    role: m.role,
    joinedAt: m.joinedAt,
    profileRole: m.profile.role,
    helpPoints: m.profile.helpPoints,
  }));

  const roles = {
    leaders: members.filter((m) => m.role === 'LEAD'),
    mentors: members.filter((m) => m.role === 'MENTOR'),
    members: members.filter((m) => m.role === 'MEMBER'),
  };

  return {
    id: team.id,
    name: team.name,
    slug: team.slug,
    description: team.description,
    avatarUrl: team.avatarUrl,
    owner: {
      id: team.owner.id,
      displayName: team.owner.displayName,
      email: team.owner.authUser.email,
    },
    members,
    roles,
    memberCount: members.length,
    currentUserRole: membership.role,
    currentUserProfileId: profile.id,
  };
}
