import { notFound } from 'next/navigation';

import type { AppModule } from '@/lib/permissions';
import { canAccessModule } from '@/lib/permissions';
import { getCurrentUserProfile } from '@/lib/session';

export async function requireModuleAccess(module: AppModule) {
  const current = await getCurrentUserProfile();
  if (!current || !canAccessModule(current.profile.role, module)) notFound();
  return current;
}
