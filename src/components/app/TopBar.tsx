'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  IconBell,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconMenu2,
  IconSearch,
} from '@tabler/icons-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { SignOutMenuItem } from '@/components/app/sign-out-menu-item';
import { ThemeToggle } from '@/components/app/theme-toggle';
import { SidebarContent } from './SidebarContent';
import { formatRole, initialsForName, searchTarget } from './app-shell.utils';
import type { TopBarProps } from './app-shell.types';

export function TopBar({
  user,
  activeFocusSession,
  sidebarCollapsed,
  onToggleSidebar,
}: TopBarProps) {
  const pathname = usePathname();
  const roleLabel = formatRole(user.role);
  const initials = initialsForName(user.name) || 'HX';

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border/70 bg-background/80 px-4 backdrop-blur-xl print:hidden sm:px-6 lg:px-8 xl:px-10">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="lg:hidden" aria-label="Open navigation">
            <IconMenu2 />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="w-72 border-border/70 bg-sidebar p-0 text-sidebar-foreground"
        >
          <SheetTitle className="sr-only">Habitix navigation</SheetTitle>
          <SidebarContent
            role={user.role}
            collapsed={false}
            activeFocusSession={activeFocusSession}
          />
        </SheetContent>
      </Sheet>

      <Button
        type="button"
        variant="outline"
        size="icon"
        className="hidden lg:inline-flex"
        aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        aria-pressed={sidebarCollapsed}
        onClick={onToggleSidebar}
      >
        {sidebarCollapsed ? <IconChevronRight /> : <IconChevronLeft />}
      </Button>

      <form action={searchTarget(pathname)} className="relative hidden w-full max-w-md sm:block">
        <IconSearch className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          aria-label="Search"
          name={pathname.startsWith('/study-materials') ? 'search' : 'q'}
          className="h-10 border-border/80 bg-card/90 pl-9"
          placeholder="Search tasks, teammates, reports..."
        />
      </form>

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
            <Button variant="ghost" className="h-10 gap-2 px-2 hover:bg-card">
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
            <DropdownMenuItem asChild>
              <Link href="/profile">Account settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <SignOutMenuItem />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
