import { AppShell } from '@/components/app/app-shell';
import { getCurrentUserProfile } from '@/lib/session';
import { redirect } from 'next/navigation';

export default async function ProtectedAppLayout({ children }: { children: React.ReactNode }) {
  const currentUser = await getCurrentUserProfile();

  if (!currentUser) {
    redirect('/sign-in');
  }

  return (
    <AppShell
      user={{
        name: currentUser.profile.displayName,
        email: currentUser.session.user.email,
        image: currentUser.session.user.image,
        role: currentUser.profile.role,
      }}
    >
      {children}
    </AppShell>
  );
}
