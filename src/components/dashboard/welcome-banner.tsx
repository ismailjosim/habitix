'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { IconArrowRight, IconFocus2 } from '@tabler/icons-react';
import Link from 'next/link';

interface WelcomeBannerProps {
  userName: string;
}

function getGreeting() {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  if (hour >= 17 && hour < 21) return 'Good evening';

  return 'Good night';
}

export function WelcomeBanner({ userName }: WelcomeBannerProps) {
  const [greeting, setGreeting] = useState(() => getGreeting());

  useEffect(() => {
    const interval = setInterval(() => {
      setGreeting(getGreeting());
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="relative overflow-hidden border-0 bg-[#172033] text-slate-50 shadow-[0_24px_60px_rgba(15,23,42,0.16)]">
      <div className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-primary/35 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-1/3 size-40 rounded-full bg-focus/20 blur-3xl" />

      <CardContent className="relative flex flex-col items-start justify-between gap-6 p-6 sm:flex-row sm:items-center lg:p-8">
        <div className="max-w-xl">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-1 text-xs font-semibold text-white/75">
            <IconFocus2 className="size-3.5 text-focus" />
            Today&apos;s workspace
          </p>

          <h2 className="text-2xl font-bold tracking-[-0.035em] text-white sm:text-3xl">
            {greeting}, {userName}
          </h2>

          <p className="mt-2 text-sm leading-6 text-white/65 sm:text-base">
            Ready to focus? Start a session and track your progress.
          </p>
        </div>

        <Button asChild size="lg" className="bg-white text-[#172033] shadow-lg hover:bg-white/90">
          <Link href="/focus-mode">
            Start Focus
            <IconArrowRight className="size-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
