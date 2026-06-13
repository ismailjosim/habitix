import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { IconArrowRight, IconFocus2 } from '@tabler/icons-react';
import Link from 'next/link';

interface WelcomeBannerProps {
  userName: string;
}

export function WelcomeBanner({ userName }: WelcomeBannerProps) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <Card className="relative overflow-hidden border-0 bg-sidebar text-sidebar-foreground shadow-[0_24px_60px_rgba(15,23,42,0.16)]">
      <div className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-primary/35 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-1/3 size-40 rounded-full bg-focus/20 blur-3xl" />
      <CardContent className="relative flex flex-col items-start justify-between gap-6 p-6 sm:flex-row sm:items-center lg:p-8">
        <div className="max-w-xl">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-1 text-xs font-semibold text-white/75">
            <IconFocus2 className="size-3.5 text-focus" /> Today&apos;s workspace
          </p>
          <h2 className="text-2xl font-bold tracking-[-0.035em] text-white sm:text-3xl">
            {getGreeting()}, {userName}
          </h2>
          <p className="mt-2 text-sm leading-6 text-white/65 sm:text-base">
            Ready to focus? Start a session and track your progress.
          </p>
        </div>
        <Button asChild size="lg" className="bg-white text-sidebar shadow-lg hover:bg-white/90">
          <Link href="/focus-mode">
            Start Focus
            <IconArrowRight className="size-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
