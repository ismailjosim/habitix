'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { prisma } from '@/lib/prisma';
import { getCurrentUserProfile } from '@/lib/session';
import { MAX_PEER_HELPERS } from '@/lib/queries/help-desk';
import { awardEligibleBadges } from '@/lib/badges';

const topics = [
  'Coding',
  'Styling',
  'Frontend',
  'Backend',
  'Database',
  'Learning',
  'Other',
] as const;
const urgencies = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;

const createPostSchema = z.object({
  title: z.string().trim().min(5, 'Use at least 5 characters').max(160),
  body: z.string().trim().min(10, 'Describe the problem in a little more detail').max(3000),
  topic: z.enum(topics),
  urgency: z.enum(urgencies).default('MEDIUM'),
  tags: z.array(z.string().trim().min(1).max(30)).max(5).default([]),
});

const responseSchema = z.object({
  postId: z.string().trim().min(1),
  body: z.string().trim().min(5, 'Use at least 5 characters').max(2000),
});

const resolveSchema = z.object({
  postId: z.string().trim().min(1),
  responseId: z.string().trim().min(1).optional(),
});

const HELP_AWARD_POINTS = 2;

type ActionResult = { success: true; message: string } | { success: false; message: string };

export async function createHelpPost(
  input: z.input<typeof createPostSchema>
): Promise<ActionResult> {
  try {
    const current = await requireCurrent();
    const data = createPostSchema.parse(input);
    const membership = await requireTeamMembership(current.profile.id);
    const tags = [...new Set([data.topic, ...data.tags.map(normalizeTag)])].slice(0, 5);

    const post = await prisma.helpPost.create({
      data: {
        authorProfileId: current.profile.id,
        teamId: membership.teamId,
        title: data.title,
        body: data.body,
        topic: data.topic,
        urgency: data.urgency,
        tags: { create: tags.map((tag) => ({ tag })) },
      },
    });

    const teammates = await prisma.teamMembership.findMany({
      where: { teamId: membership.teamId, leftAt: null, profileId: { not: current.profile.id } },
      select: { profileId: true },
    });

    if (teammates.length) {
      await prisma.notification.createMany({
        data: teammates.map((member) => ({
          recipientProfileId: member.profileId,
          actorProfileId: current.profile.id,
          type: 'TEAM_UPDATE' as const,
          title: 'New help request',
          body: `${current.profile.displayName} asked: ${post.title}`,
          targetType: 'help_post',
          targetId: post.id,
        })),
      });
    }

    revalidateHelpDesk();
    return { success: true, message: 'Help request posted' };
  } catch (error) {
    return actionError(error, 'Could not create the help request');
  }
}

export async function createHelpResponse(
  input: z.input<typeof responseSchema>
): Promise<ActionResult> {
  try {
    const current = await requireCurrent();
    const data = responseSchema.parse(input);
    const post = await prisma.helpPost.findUnique({
      where: { id: data.postId },
      include: {
        responses: {
          select: {
            authorProfileId: true,
            author: { select: { role: true } },
          },
        },
      },
    });

    if (!post || !post.teamId) throw new Error('Help request was not found');
    await requireTeamMembership(current.profile.id, post.teamId);
    if (post.status === 'RESOLVED' || post.status === 'CLOSED') {
      throw new Error('This help request is already closed');
    }
    if (post.authorProfileId === current.profile.id) {
      throw new Error('The original poster cannot join as a helper');
    }

    const isExempt = ['ADMIN', 'MODERATOR'].includes(current.profile.role);
    const existingHelper = post.responses.some(
      (response) => response.authorProfileId === current.profile.id
    );
    const peerHelperCount = new Set(
      post.responses
        .filter((response) => !['ADMIN', 'MODERATOR'].includes(response.author.role))
        .map((response) => response.authorProfileId)
    ).size;

    if (!isExempt && !existingHelper && peerHelperCount >= MAX_PEER_HELPERS) {
      throw new Error(`This request already has the maximum of ${MAX_PEER_HELPERS} peer helpers`);
    }

    await prisma.$transaction([
      prisma.helpResponse.create({
        data: { postId: post.id, authorProfileId: current.profile.id, body: data.body },
      }),
      ...(post.status === 'OPEN'
        ? [prisma.helpPost.update({ where: { id: post.id }, data: { status: 'ANSWERED' } })]
        : []),
      prisma.notification.create({
        data: {
          recipientProfileId: post.authorProfileId,
          actorProfileId: current.profile.id,
          type: 'HELP_RESPONSE',
          title: 'New help response',
          body: `${current.profile.displayName} responded to "${post.title}"`,
          targetType: 'help_post',
          targetId: post.id,
        },
      }),
    ]);

    revalidateHelpDesk();
    return { success: true, message: 'Response added' };
  } catch (error) {
    return actionError(error, 'Could not add the response');
  }
}

export async function resolveHelpPost(input: z.input<typeof resolveSchema>): Promise<ActionResult> {
  try {
    const current = await requireCurrent();
    const data = resolveSchema.parse(input);
    const post = await prisma.helpPost.findUnique({
      where: { id: data.postId },
      include: { responses: { select: { id: true, authorProfileId: true, pointsAwarded: true } } },
    });

    if (!post || !post.teamId) throw new Error('Help request was not found');
    const membership = await requireTeamMembership(current.profile.id, post.teamId);
    const canResolve =
      post.authorProfileId === current.profile.id ||
      ['ADMIN', 'MODERATOR', 'MENTOR'].includes(current.profile.role) ||
      ['ADMIN', 'MENTOR', 'LEAD'].includes(membership.role);
    if (!canResolve)
      throw new Error('Only the poster, mentor, or moderator can resolve this request');
    if (post.status === 'RESOLVED') throw new Error('This help request is already resolved');

    const awardedResponse = data.responseId
      ? post.responses.find((response) => response.id === data.responseId)
      : null;
    if (data.responseId && !awardedResponse) throw new Error('Selected response was not found');
    if (awardedResponse?.authorProfileId === post.authorProfileId) {
      throw new Error('The original poster cannot receive the contributor award');
    }

    await prisma.$transaction(async (tx) => {
      const claimed = await tx.helpPost.updateMany({
        where: { id: post.id, status: { not: 'RESOLVED' }, awardedResponseId: null },
        data: {
          status: 'RESOLVED',
          resolvedAt: new Date(),
          awardedResponseId: awardedResponse?.id ?? null,
        },
      });
      if (claimed.count !== 1) throw new Error('This help request was already resolved or awarded');

      if (awardedResponse) {
        await tx.helpResponse.update({
          where: { id: awardedResponse.id },
          data: { isAccepted: true, pointsAwarded: HELP_AWARD_POINTS },
        });
        await tx.userProfile.update({
          where: { id: awardedResponse.authorProfileId },
          data: { helpPoints: { increment: HELP_AWARD_POINTS } },
        });
        await tx.activityEvent.create({
          data: {
            profileId: awardedResponse.authorProfileId,
            teamId: post.teamId,
            type: 'help_awarded',
            sourceType: 'HELP_RESPONSE',
            sourceId: awardedResponse.id,
            points: HELP_AWARD_POINTS,
          },
        });
        await tx.notification.create({
          data: {
            recipientProfileId: awardedResponse.authorProfileId,
            actorProfileId: current.profile.id,
            type: 'HELP_RESOLVED',
            title: 'Helpful contribution awarded',
            body: `You earned ${HELP_AWARD_POINTS} help points for "${post.title}"`,
            targetType: 'help_post',
            targetId: post.id,
          },
        });
      }

      if (post.authorProfileId !== current.profile.id) {
        await tx.notification.create({
          data: {
            recipientProfileId: post.authorProfileId,
            actorProfileId: current.profile.id,
            type: 'HELP_RESOLVED',
            title: 'Help request resolved',
            body: `"${post.title}" was marked resolved`,
            targetType: 'help_post',
            targetId: post.id,
          },
        });
      }
    });

    if (awardedResponse) {
      await awardEligibleBadges(awardedResponse.authorProfileId);
    }
    revalidateHelpDesk();
    revalidatePath('/activity');
    revalidatePath('/leaderboard');
    revalidatePath('/profile');
    return {
      success: true,
      message: awardedResponse ? 'Resolved and contributor awarded' : 'Help request resolved',
    };
  } catch (error) {
    return actionError(error, 'Could not resolve the help request');
  }
}

async function requireCurrent() {
  const current = await getCurrentUserProfile();
  if (!current) throw new Error('Unauthorized');
  return current;
}

async function requireTeamMembership(profileId: string, teamId?: string) {
  const membership = await prisma.teamMembership.findFirst({
    where: { profileId, leftAt: null, ...(teamId ? { teamId } : {}) },
    select: { teamId: true, role: true },
  });
  if (!membership) throw new Error('An active team membership is required');
  return membership;
}

function normalizeTag(tag: string) {
  return tag.trim().replace(/\s+/g, ' ');
}

function revalidateHelpDesk() {
  revalidatePath('/help-desk');
  revalidatePath('/dashboard');
  revalidatePath('/notifications');
}

function actionError(error: unknown, fallback: string): ActionResult {
  if (error instanceof z.ZodError)
    return { success: false, message: error.issues[0]?.message ?? fallback };
  return { success: false, message: error instanceof Error ? error.message : fallback };
}
