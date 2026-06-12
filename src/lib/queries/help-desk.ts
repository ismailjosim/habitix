import { prisma } from '@/lib/prisma';
import { getCurrentUserProfile } from '@/lib/session';

export const MAX_PEER_HELPERS = 4;

export type HelpDeskPost = {
  id: string;
  title: string;
  body: string;
  status: string;
  topic: string | null;
  urgency: string;
  createdAt: Date;
  resolvedAt: Date | null;
  author: { id: string; displayName: string; avatarUrl: string | null };
  tags: string[];
  helperCount: number;
  responses: {
    id: string;
    body: string;
    isAccepted: boolean;
    pointsAwarded: number;
    createdAt: Date;
    author: { id: string; displayName: string; avatarUrl: string | null; role: string };
  }[];
};

export type HelpDeskData = {
  posts: HelpDeskPost[];
  currentProfileId: string | null;
  currentRole: string | null;
  teamName: string | null;
  stats: {
    open: number;
    resolved: number;
    helpers: number;
    awardedPoints: number;
    averageFirstResponseMinutes: number | null;
    averageResolutionMinutes: number | null;
  };
};

export async function getHelpDeskData(): Promise<HelpDeskData> {
  const current = await getCurrentUserProfile();
  if (!current) return emptyData();

  const membership = await prisma.teamMembership.findFirst({
    where: { profileId: current.profile.id, leftAt: null },
    select: { teamId: true, team: { select: { name: true } } },
  });

  if (!membership) {
    return {
      ...emptyData(),
      currentProfileId: current.profile.id,
      currentRole: current.profile.role,
    };
  }

  const posts = await prisma.helpPost.findMany({
    where: { teamId: membership.teamId, status: { notIn: ['CLOSED', 'FLAGGED'] } },
    include: {
      author: { select: { id: true, displayName: true, avatarUrl: true } },
      tags: { select: { tag: true }, orderBy: { tag: 'asc' } },
      responses: {
        include: {
          author: { select: { id: true, displayName: true, avatarUrl: true, role: true } },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
  });

  const formatted = posts.map((post) => ({
    ...post,
    tags: post.tags.map((tag) => tag.tag),
    helperCount: new Set(
      post.responses
        .filter((response) => !['ADMIN', 'MODERATOR'].includes(response.author.role))
        .map((response) => response.author.id)
    ).size,
  }));

  return {
    posts: formatted,
    currentProfileId: current.profile.id,
    currentRole: current.profile.role,
    teamName: membership.team.name,
    stats: {
      open: formatted.filter((post) => post.status !== 'RESOLVED').length,
      resolved: formatted.filter((post) => post.status === 'RESOLVED').length,
      helpers: new Set(formatted.flatMap((post) => post.responses.map((item) => item.author.id)))
        .size,
      awardedPoints: formatted.reduce(
        (total, post) => total + post.responses.reduce((sum, item) => sum + item.pointsAwarded, 0),
        0
      ),
      averageFirstResponseMinutes: averageMinutes(
        formatted.flatMap((post) =>
          post.responses[0]
            ? [post.responses[0].createdAt.getTime() - post.createdAt.getTime()]
            : []
        )
      ),
      averageResolutionMinutes: averageMinutes(
        formatted.flatMap((post) =>
          post.resolvedAt ? [post.resolvedAt.getTime() - post.createdAt.getTime()] : []
        )
      ),
    },
  };
}

function emptyData(): HelpDeskData {
  return {
    posts: [],
    currentProfileId: null,
    currentRole: null,
    teamName: null,
    stats: {
      open: 0,
      resolved: 0,
      helpers: 0,
      awardedPoints: 0,
      averageFirstResponseMinutes: null,
      averageResolutionMinutes: null,
    },
  };
}

function averageMinutes(durations: number[]) {
  if (!durations.length) return null;
  return Math.round(
    durations.reduce((total, duration) => total + duration, 0) / durations.length / 60_000
  );
}
