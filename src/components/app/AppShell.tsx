'use client';

import { useSyncExternalStore } from 'react';
import { PresenceHeartbeat } from '@/components/app/presence-heartbeat';
import { cn } from '@/lib/utils';
import { TopBar } from './TopBar';
import { SidebarContent } from './SidebarContent';
import {
  getSidebarPreference,
  getServerSidebarPreference,
  SIDEBAR_STORAGE_EVENT,
  SIDEBAR_STORAGE_KEY,
  subscribeToSidebarPreference,
} from './app-shell.utils';
import type { AppShellProps } from './app-shell.types';

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
