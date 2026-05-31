'use client';

import { useRouter } from 'next/navigation';

import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { signOut } from '@/lib/auth-client';

export function SignOutMenuItem() {
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push('/sign-in');
    router.refresh();
  }

  return <DropdownMenuItem onSelect={handleSignOut}>Sign out</DropdownMenuItem>;
}
