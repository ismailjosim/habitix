'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { IconArrowRight, IconPlayerPause, IconTargetArrow } from '@tabler/icons-react';

import type { ActiveFocusSession } from '@/lib/queries/focus';
import { cn } from '@/lib/utils';

type SidebarFocusWidgetProps = {
  session: ActiveFocusSession | null;
  collapsed: boolean;
};

export function SidebarFocusWidget({ session, collapsed }: SidebarFocusWidgetProps) {
  const [startedAt] = useState(() => Date.now());
  const [now, setNow] = useState(startedAt);

  useEffect(() => {
    if (!session || session.status !== 'ACTIVE') return;

    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(interval);
  }, [session]);

  const elapsedSinceRender = session?.status === 'ACTIVE' ? Math.floor((now - startedAt) / 1000) : 0;
  const remainingSeconds = Math.max((session?.remainingSeconds ?? 0) - elapsedSinceRender, 0);

  if (collapsed) {
    return (
      <div className="border-t border-white/8 p-3">
        <Link
          href="/focus-mode"
          title={session ? `${formatClock(remainingSeconds)} remaining` : 'Start focus session'}
          aria-label={session ? `${formatClock(remainingSeconds)} remaining in focus session` : 'Start focus session'}
          className={cn(
            'relative grid size-11 place-items-center rounded-xl border transition-colors',
            session
              ? 'border-primary/30 bg-primary/15 text-primary-foreground hover:bg-primary/25'
              : 'border-white/8 bg-white/[0.045] text-sidebar-foreground/65 hover:bg-white/10 hover:text-white'
          )}
        >
          {session?.status === 'PAUSED' ? (
            <IconPlayerPause className="size-5" />
          ) : (
            <IconTargetArrow className="size-5" />
          )}
          {session?.status === 'ACTIVE' && (
            <span className="absolute right-2 top-2 size-1.5 rounded-full bg-success shadow-[0_0_8px_var(--success)]" />
          )}
        </Link>
      </div>
    );
  }

  const totalSeconds = (session?.plannedMinutes ?? 0) * 60;
  const progress = totalSeconds
    ? Math.min(((totalSeconds - remainingSeconds) / totalSeconds) * 100, 100)
    : 0;

  return (
    <div className="border-t border-white/8 p-4">
      <Link
        href="/focus-mode"
        className="group block rounded-2xl border border-white/8 bg-white/[0.045] p-3.5 transition-colors hover:bg-white/[0.075]"
      >
        {session ? (
          <>
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-white/55">
                {session.status === 'PAUSED' ? (
                  <IconPlayerPause className="size-3.5 text-warning" />
                ) : (
                  <span className="size-2 rounded-full bg-success shadow-[0_0_10px_var(--success)]" />
                )}
                {session.status === 'PAUSED' ? 'Paused' : 'Focusing'}
              </span>
              <IconArrowRight className="size-4 text-white/35 transition-transform group-hover:translate-x-0.5 group-hover:text-white/70" />
            </div>
            <p className="mt-3 font-mono text-2xl font-semibold tabular-nums tracking-tight text-white">
              {formatClock(remainingSeconds)}
            </p>
            <p className="mt-1 truncate text-xs text-white/55">
              {session.taskTitle ?? session.activityLabel}
            </p>
            <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-1000"
                style={{ width: `${progress}%` }}
              />
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary-foreground">
              <IconTargetArrow className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white">Start a focus session</p>
              <p className="mt-0.5 text-xs text-white/45">Protect time for deep work</p>
            </div>
            <IconArrowRight className="size-4 text-white/35 transition-transform group-hover:translate-x-0.5 group-hover:text-white/70" />
          </div>
        )}
      </Link>
    </div>
  );
}

function formatClock(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
}
