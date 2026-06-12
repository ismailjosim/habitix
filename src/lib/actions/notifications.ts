'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { prisma } from '@/lib/prisma';
import { getCurrentUserProfile } from '@/lib/session';

const notificationSchema = z.object({ notificationId: z.string().trim().min(1) });

export async function markNotificationRead(input: z.input<typeof notificationSchema>) {
  const current = await getCurrentUserProfile();
  if (!current) return { success: false as const, message: 'Unauthorized' };
  const data = notificationSchema.parse(input);

  await prisma.notification.updateMany({
    where: { id: data.notificationId, recipientProfileId: current.profile.id, readAt: null },
    data: { readAt: new Date() },
  });
  revalidateNotifications();
  return { success: true as const };
}

export async function markAllNotificationsRead() {
  const current = await getCurrentUserProfile();
  if (!current) return { success: false as const, message: 'Unauthorized' };

  await prisma.notification.updateMany({
    where: { recipientProfileId: current.profile.id, readAt: null },
    data: { readAt: new Date() },
  });
  revalidateNotifications();
  return { success: true as const };
}

function revalidateNotifications() {
  revalidatePath('/notifications');
  revalidatePath('/dashboard');
  revalidatePath('/', 'layout');
}
