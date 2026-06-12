'use client';

import { useCallback, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { sendPresenceHeartbeat } from '@/lib/actions/presence';

const HEARTBEAT_INTERVAL_MS = 30_000;

export function PresenceHeartbeat() {
  const pathname = usePathname();
  const router = useRouter();
  const heartbeat = useCallback(async () => {
    await sendPresenceHeartbeat();

    if (pathname === '/dashboard' || pathname === '/team') {
      router.refresh();
    }
  }, [pathname, router]);

  useEffect(() => {
    void heartbeat();
    const intervalId = window.setInterval(() => void heartbeat(), HEARTBEAT_INTERVAL_MS);

    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') void heartbeat();
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [heartbeat]);

  return null;
}
