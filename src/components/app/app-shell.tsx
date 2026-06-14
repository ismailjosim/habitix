'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSyncExternalStore } from 'react';
import {
  IconBell,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconMenu2,
  IconSearch,
} from '@tabler/icons-react';

import { BrandLogo } from '@/components/app/brand-logo';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { SignOutMenuItem } from '@/components/app/sign-out-menu-item';
import { ThemeToggle } from '@/components/app/theme-toggle';
import { PresenceHeartbeat } from '@/components/app/presence-heartbeat';
import { SidebarFocusWidget } from '@/components/app/sidebar-focus-widget';
import { navigationItems } from '@/lib/navigation';
import { canAccessModule } from '@/lib/permissions';
import type { AppRole } from '@/generated/prisma/client';
import { cn } from '@/lib/utils';
import type { ActiveFocusSession } from '@/lib/queries/focus';

type AppShellProps = {
  children: React.ReactNode;
  activeFocusSession: ActiveFocusSession | null;
  user: {
    name: string;
    email: string;
    image?: string | null;
    role: string;
    unreadNotificationCount: number;
  };
};

const SIDEBAR_STORAGE_KEY = 'habitix-sidebar-collapsed';
const SIDEBAR_STORAGE_EVENT = 'habitix-sidebar-preference';

function subscribeToSidebarPreference(onStoreChange: () => void) {
  window.addEventListener('storage', onStoreChange);
  window.addEventListener(SIDEBAR_STORAGE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener('storage', onStoreChange);
    window.removeEventListener(SIDEBAR_STORAGE_EVENT, onStoreChange);
  };
}

function getSidebarPreference() {
  return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true';
}

function getServerSidebarPreference() {
  return false;
}

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

export function AppShell({ children, user, activeFocusSession }: AppShellProps) {
  const sidebarCollapsed = useSyncExternalStore(
    subscribeToSidebarPreference,
    getSidebarPreference,
    getServerSidebarPreference
  );

  function toggleSidebar() {
    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(!sidebarCollapsed));
    window.dispatchEvent(new Event(SIDEBAR_STORAGE_EVENT));
  }

  return (
    <div className="min-h-screen bg-canvas text-foreground">
      <a
        href="#main-content"
        className="sr-only fixed left-4 top-4 z-50 rounded-xl bg-primary px-4 py-2 text-primary-foreground shadow-lg focus:not-sr-only"
      >
        Skip to main content
      </a>
      <PresenceHeartbeat />
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 hidden border-r border-border/70 bg-sidebar text-sidebar-foreground shadow-[8px_0_32px_rgba(15,23,42,0.08)] transition-[width] duration-200 print:hidden lg:block',
          sidebarCollapsed ? 'w-20' : 'w-72'
        )}
      >
        <SidebarContent
          role={user.role}
          collapsed={sidebarCollapsed}
          activeFocusSession={activeFocusSession}
        />
      </aside>

      <div
        className={cn(
          'transition-[padding] duration-200 print:pl-0',
          sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72'
        )}
      >
        <TopBar
          user={user}
          activeFocusSession={activeFocusSession}
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={toggleSidebar}
        />
        <main
          id="main-content"
          tabIndex={-1}
          className="min-h-[calc(100vh-4rem)] px-4 py-6 print:min-h-0 print:p-0 sm:px-6 lg:px-8 xl:px-10"
        >
          {children}
        </main>
      </div>
    </div>
  );
}

function TopBar({
  user,
  activeFocusSession,
  sidebarCollapsed,
  onToggleSidebar,
}: Pick<AppShellProps, 'user' | 'activeFocusSession'> & {
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}) {
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

function SidebarContent({
  role,
  collapsed,
  activeFocusSession,
}: {
  role: string;
  collapsed: boolean;
  activeFocusSession: ActiveFocusSession | null;
}) {
  const pathname = usePathname();
  const visibleItems = navigationItems.filter((item) =>
    canAccessModule(role as AppRole, item.module)
  );

  return (
    <div className="flex h-full flex-col">
      <div
        className={cn(
          'flex h-16 items-center border-b border-border/70',
          collapsed ? 'justify-center px-2' : 'px-5'
        )}
      >
        {collapsed ? (
          <Link href="/dashboard" aria-label="Habitix dashboard">
            <BrandLogo compact priority />
          </Link>
        ) : (
          <Link
            href="/dashboard"
            aria-label="Habitix dashboard"
            className="flex h-10 w-full items-center gap-2 rounded-xl"
          >
            <BrandLogo priority className="size-10" />
            <p className="text-3xl font-bold tracking-widest">
              <span>Habiti</span>
              <span className=" text-primary">x</span>
            </p>
          </Link>
        )}
      </div>

      <ScrollArea className={cn('flex-1 py-5', collapsed ? 'px-2' : 'px-3')}>
        {!collapsed && (
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-sidebar-foreground/45">
            Workspace
          </p>
        )}
        <nav className="space-y-1.5">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.title : undefined}
                aria-label={collapsed ? item.title : undefined}
                className={cn(
                  'relative flex h-10 items-center rounded-xl text-sm font-medium text-sidebar-foreground/72 transition-[color,background-color,transform] hover:bg-sidebar-muted hover:text-sidebar-foreground',
                  collapsed ? 'justify-center px-2' : 'gap-3 px-3',
                  isActive &&
                    'bg-primary text-primary-foreground shadow-[0_8px_24px_rgba(0,0,0,0.12)] hover:bg-primary-hover hover:text-primary-foreground'
                )}
              >
                <Icon className="size-5" />
                {!collapsed && <span>{item.title}</span>}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <SidebarFocusWidget
        key={`${activeFocusSession?.id ?? 'idle'}-${activeFocusSession?.status ?? 'none'}-${activeFocusSession?.remainingSeconds ?? 0}`}
        session={activeFocusSession}
        collapsed={collapsed}
      />
    </div>
  );
}

function searchTarget(pathname: string) {
  if (pathname.startsWith('/help-desk')) return '/help-desk';
  if (pathname.startsWith('/study-materials')) return '/study-materials';
  return '/tasks';
}
