import { describe, expect, it } from 'vitest';

import type { AppRole } from '@/generated/prisma/client';
import {
  canAccessModule,
  canAssignTask,
  canManageStudyMaterials,
  canResolveHelpPost,
  canViewTask,
} from '@/lib/permissions';

const roles: AppRole[] = ['STUDENT', 'MENTOR', 'ADMIN', 'MODERATOR', 'CORPORATE_VIEWER'];

describe('role permissions', () => {
  it.each([
    ['STUDENT', true, false, false],
    ['MENTOR', true, true, true],
    ['ADMIN', true, true, true],
    ['MODERATOR', false, false, false],
    ['CORPORATE_VIEWER', false, false, false],
  ] as const)('%s task and material capabilities are explicit', (role, tasks, assign, materials) => {
    expect(canAccessModule(role, 'tasks')).toBe(tasks);
    expect(canAssignTask(role)).toBe(assign);
    expect(canManageStudyMaterials(role)).toBe(materials);
  });

  it('covers module access for every role', () => {
    for (const role of roles) {
      expect(canAccessModule(role, 'profile')).toBe(true);
      expect(canAccessModule(role, 'notifications')).toBe(true);
    }
    expect(canAccessModule('CORPORATE_VIEWER', 'corporateReport')).toBe(true);
    expect(canAccessModule('STUDENT', 'corporateReport')).toBe(false);
    expect(canAccessModule('ADMIN', 'admin')).toBe(true);
    expect(canAccessModule('MENTOR', 'admin')).toBe(false);
    expect(canAccessModule('ADMIN', 'focus')).toBe(true);
  });

  it('allows task participants but rejects unrelated viewers', () => {
    const input = {
      role: 'STUDENT' as const,
      profileId: 'student',
      createdByProfileId: 'mentor',
      assignedToProfileId: 'student',
      isActiveTeamMember: false,
    };
    expect(canViewTask(input)).toBe(true);
    expect(canViewTask({ ...input, assignedToProfileId: 'other' })).toBe(false);
  });

  it('allows poster and moderation roles to resolve help posts', () => {
    expect(
      canResolveHelpPost({
        role: 'STUDENT',
        profileId: 'poster',
        authorProfileId: 'poster',
      })
    ).toBe(true);
    expect(
      canResolveHelpPost({
        role: 'MODERATOR',
        profileId: 'moderator',
        authorProfileId: 'poster',
      })
    ).toBe(true);
  });
});
