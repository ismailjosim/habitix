'use server';

import { getCurrentUserProfile } from '@/lib/session';
import { touchPresence } from '@/lib/presence';

export async function sendPresenceHeartbeat() {
  const current = await getCurrentUserProfile();
  if (!current) return { success: false as const };

  await touchPresence(current.profile.id);
  return { success: true as const };
}
