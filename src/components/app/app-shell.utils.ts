export const SIDEBAR_STORAGE_KEY = 'habitix-sidebar-collapsed';
export const SIDEBAR_STORAGE_EVENT = 'habitix-sidebar-preference';

export function subscribeToSidebarPreference(onStoreChange: () => void) {
  window.addEventListener('storage', onStoreChange);
  window.addEventListener(SIDEBAR_STORAGE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener('storage', onStoreChange);
    window.removeEventListener(SIDEBAR_STORAGE_EVENT, onStoreChange);
  };
}

export function getSidebarPreference(): boolean {
  return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true';
}

export function getServerSidebarPreference(): boolean {
  return false;
}

export function formatRole(role: string): string {
  return role
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function initialsForName(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export function searchTarget(pathname: string): string {
  if (pathname.startsWith('/help-desk')) return '/help-desk';
  if (pathname.startsWith('/study-materials')) return '/study-materials';
  return '/tasks';
}
