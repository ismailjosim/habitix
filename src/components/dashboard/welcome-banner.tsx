import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { IconRocket } from '@tabler/icons-react';
import Link from 'next/link';

interface WelcomeBannerProps {
  userName: string;
}

export function WelcomeBanner({ userName }: WelcomeBannerProps) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '🌅 Good morning';
    if (hour < 18) return '☀️ Good afternoon';
    return '🌙 Good evening';
  };

  return (
    <Card className="border-0 bg-gradient-to-br from-primary via-primary to-primary-hover text-primary-foreground shadow-lg shadow-indigo-950/10">
      <CardContent className="flex flex-col items-start justify-between gap-5 p-6 sm:flex-row sm:items-center">
        <div>
          <p className="text-lg font-semibold">
            {getGreeting()}, {userName}!
          </p>
          <p className="mt-1 text-indigo-100">
            Ready to focus? Start a session and track your progress.
          </p>
        </div>
        <Link href="/focus-mode">
          <Button size="lg" className="bg-white text-primary hover:bg-indigo-50">
            <IconRocket className="mr-2 h-5 w-5" />
            Start Focus
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
