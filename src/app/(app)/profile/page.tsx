import { Suspense } from 'react';
import { getProfileData } from '@/lib/queries/profile';
import {
  ProfileHeader,
  ProfileForm,
  ProfileStats,
  ProfileBadges,
} from '@/components/profile';
import { LAYOUT_CONSTRAINTS } from '@/lib/layout-constraints';
import { LoadingState } from '@/components/shared';

async function ProfileContent() {
  const profile = await getProfileData();

  return (
    <>
      <ProfileHeader profile={profile} />

      <div className={`${LAYOUT_CONSTRAINTS.pageMaxWidth} ${LAYOUT_CONSTRAINTS.pagePadding} mx-auto`}>
        <div className={LAYOUT_CONSTRAINTS.pageVerticalSpacing}>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <ProfileForm profile={profile} />
            </div>
            <div>
              <ProfileStats profile={profile} />
            </div>
          </div>

          <div>
            <ProfileBadges profile={profile} />
          </div>
        </div>
      </div>
    </>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className={`${LAYOUT_CONSTRAINTS.pageMaxWidth} ${LAYOUT_CONSTRAINTS.pagePadding} mx-auto`}>
          <div className={LAYOUT_CONSTRAINTS.pageVerticalSpacing}>
            <LoadingState title="Loading profile..." count={4} />
          </div>
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}
