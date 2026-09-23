'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrandLogo } from '@/components/app/brand-logo';
import { SidebarFocusWidget } from '@/components/app/sidebar-focus-widget';
import { ScrollArea } from '@/components/ui/scroll-area';
import { navigationItems } from '@/lib/navigation';
import { canAccessModule } from '@/lib/permissions';
import { cn } from '@/lib/utils';
import type { AppRole } from '@/generated/prisma/client';
import type { SidebarContentProps } from './app-shell.types';

export function SidebarContent({ role, collapsed, activeFocusSession }: SidebarContentProps) {
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
