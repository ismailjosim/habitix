import assert from 'node:assert/strict';

import {
  canAccessModule,
  canEditStudyMaterial,
  canManageTask,
  canResolveHelpPost,
  canViewTask,
} from '../src/lib/permissions';

assert.equal(canAccessModule('STUDENT', 'corporateReport'), false);
assert.equal(canAccessModule('CORPORATE_VIEWER', 'tasks'), false);
assert.equal(canAccessModule('CORPORATE_VIEWER', 'dashboard'), false);
assert.equal(canAccessModule('CORPORATE_VIEWER', 'corporateReport'), true);
assert.equal(canAccessModule('MODERATOR', 'help'), true);
assert.equal(canAccessModule('MODERATOR', 'tasks'), false);
assert.equal(canAccessModule('MODERATOR', 'materials'), false);

assert.equal(
  canViewTask({
    role: 'STUDENT',
    profileId: 'student-1',
    createdByProfileId: 'mentor-1',
    assignedToProfileId: null,
    isActiveTeamMember: true,
  }),
  true
);
assert.equal(
  canViewTask({
    role: 'MENTOR',
    profileId: 'mentor-1',
    createdByProfileId: 'mentor-2',
    assignedToProfileId: 'student-2',
    isActiveTeamMember: false,
  }),
  false
);
assert.equal(
  canManageTask({
    role: 'STUDENT',
    profileId: 'student-1',
    createdByProfileId: 'mentor-1',
    assignedToProfileId: null,
    teamRole: 'MEMBER',
  }),
  false
);
assert.equal(
  canManageTask({
    role: 'STUDENT',
    profileId: 'student-1',
    createdByProfileId: 'mentor-1',
    assignedToProfileId: 'student-1',
    teamRole: 'MEMBER',
  }),
  true
);

assert.equal(
  canResolveHelpPost({
    role: 'MENTOR',
    profileId: 'mentor-1',
    authorProfileId: 'student-1',
    teamRole: null,
  }),
  false
);
assert.equal(
  canResolveHelpPost({
    role: 'MENTOR',
    profileId: 'mentor-1',
    authorProfileId: 'student-1',
    teamRole: 'MENTOR',
  }),
  true
);
assert.equal(
  canResolveHelpPost({
    role: 'MODERATOR',
    profileId: 'moderator-1',
    authorProfileId: 'student-1',
    teamRole: null,
  }),
  true
);

assert.equal(canEditStudyMaterial('MENTOR', 'mentor-1', 'mentor-2'), false);
assert.equal(canEditStudyMaterial('MENTOR', 'mentor-1', 'mentor-1'), true);
assert.equal(canEditStudyMaterial('ADMIN', 'admin-1', 'mentor-1'), true);

console.log('Permission policy checks passed.');
