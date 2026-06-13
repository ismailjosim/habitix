'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconBell, IconChevronDown, IconMenu2, IconSearch } from '@tabler/icons-react';

import habitixLogo from '@/assets/Habitix-logo-with-text.png';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { SignOutMenuItem } from '@/components/app/sign-out-menu-item';
import { ThemeToggle } from '@/components/app/theme-toggle';
import { PresenceHeartbeat } from '@/components/app/presence-heartbeat';
import { navigationItems, type UserRole } from '@/lib/navigation';
import { cn } from '@/lib/utils';

type AppShellProps = {
  children: React.ReactNode;
  user: {
    name: string;
    email: string;
    image?: string | null;
    role: string;
    unreadNotificationCount: number;
  };
};

function formatRole(role: string) {
  return role
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function initialsForName(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export function AppShell({ children, user }: AppShellProps) {
  return (
    <div className="min-h-screen bg-canvas text-foreground">
      <PresenceHeartbeat />
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-white/10 bg-sidebar text-sidebar-foreground print:hidden lg:block">
        <SidebarContent role={user.role} />
      </aside>

      <div className="print:pl-0 lg:pl-72">
        <TopBar user={user} />
        <main className="min-h-[calc(100vh-4rem)] px-4 py-5 print:min-h-0 print:p-0 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}

function TopBar({ user }: Pick<AppShellProps, 'user'>) {
  const roleLabel = formatRole(user.role);
  const initials = initialsForName(user.name) || 'HX';

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-card/95 px-4 backdrop-blur print:hidden sm:px-6 lg:px-8">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="lg:hidden" aria-label="Open navigation">
            <IconMenu2 />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="w-72 border-white/10 bg-sidebar p-0 text-sidebar-foreground"
        >
          <SheetTitle className="sr-only">Habitix navigation</SheetTitle>
          <SidebarContent role={user.role} />
        </SheetContent>
      </Sheet>

      <div className="relative hidden w-full max-w-md sm:block">
        <IconSearch className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="h-9 border-border bg-secondary/70 pl-9"
          placeholder="Search tasks, teammates, reports..."
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        <Button
          asChild
          variant="outline"
          size="icon"
          aria-label="Notifications"
          className="relative"
        >
          <Link href="/notifications">
            <IconBell />
            {user.unreadNotificationCount > 0 && (
              <span className="absolute -right-1 -top-1 grid min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                {Math.min(user.unreadNotificationCount, 99)}
              </span>
            )}
          </Link>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-10 gap-2 px-2">
              <Avatar className="size-8">
                <AvatarImage src={user.image ?? ''} alt={user.name} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <span className="hidden text-left sm:block">
                <span className="block text-sm font-medium leading-4">{user.name}</span>
                <span className="block text-xs text-muted-foreground">{roleLabel}</span>
              </span>
              <IconChevronDown className="hidden size-4 text-muted-foreground sm:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <span className="block">{user.name}</span>
              <span className="block text-xs font-normal text-muted-foreground">{user.email}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>Account settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <SignOutMenuItem />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

function SidebarContent({ role }: { role: string }) {
  const pathname = usePathname();
  const navigationRole = toNavigationRole(role);
  const visibleItems = navigationItems.filter((item) => item.roles.includes(navigationRole));

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b border-white/10 px-5">
        <Image src={habitixLogo} alt="Habitix" className="h-9 w-auto object-contain" priority />
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-muted hover:text-white',
                  isActive && 'bg-primary text-primary-foreground shadow-sm shadow-blue-950/20'
                )}
              >
                <Icon className="size-5" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="border-t border-white/10 p-4">
        <div className="rounded-lg border border-white/10 bg-white/[0.06] p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium">SCE Workspace</span>
            <Badge className="bg-primary text-primary-foreground hover:bg-primary">MVP</Badge>
          </div>
          <p className="mt-2 text-xs leading-5 text-sidebar-foreground/80">
            Habitix branded student collaboration environment.
          </p>
        </div>
      </div>
    </div>
  );
}

function toNavigationRole(role: string): UserRole {
  if (role === 'CORPORATE_VIEWER') return 'corporate';
  return role.toLowerCase() as UserRole;
}
