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
    <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
      <CardContent className="flex items-center justify-between p-6">
        <div>
          <p className="text-lg font-semibold">
            {getGreeting()}, {userName}!
          </p>
          <p className="mt-1 text-blue-100">
            Ready to focus? Start a session and track your progress.
          </p>
        </div>
        <Link href="/focus-mode">
          <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
            <IconRocket className="mr-2 h-5 w-5" />
            Start Focus
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
