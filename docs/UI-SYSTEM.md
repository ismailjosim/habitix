# Habitix Shared UI System Documentation

## Overview

The shared UI system provides reusable components, display helpers, and layout conventions for consistent design across the Habitix application.

## Components

### PageHeader

Display a consistent page header with title, description, and optional action buttons.

```tsx
import { PageHeader } from '@/components/shared';
import { Button } from '@/components/ui/button';

export function MyPage() {
  return (
    <PageHeader
      eyebrow="Optional category"
      title="Page Title"
      description="Optional description of page content"
      actions={<Button>Create New</Button>}
    />
  );
}
```

**Props:**

- `title` (string): Main page title
- `description` (string, optional): Subtitle/description
- `eyebrow` (string, optional): Small text above title for categorization
- `actions` (ReactNode, optional): Buttons or controls to display on right

---

### DataPanel

Display grouped data with a title, description, and optional action buttons.

```tsx
import { DataPanel, DataRow } from '@/components/shared';

export function UserInfo() {
  return (
    <DataPanel
      title="User Profile"
      description="Personal information"
      actions={<Button variant="outline">Edit</Button>}
    >
      <DataRow label="Name" value="John Doe" />
      <DataRow label="Email" value="john@example.com" />
      <DataRow label="Role" value={<RoleBadge role="MENTOR" />} />
    </DataPanel>
  );
}
```

**DataPanel Props:**

- `title` (string): Panel title
- `description` (string, optional): Subtitle
- `children` (ReactNode): Content to display
- `actions` (ReactNode, optional): Action buttons

**DataRow Props:**

- `label` (string): Field label
- `value` (ReactNode): Field value (text, badge, component, etc.)
- `className` (string, optional): Additional CSS classes

---

### EmptyState

Display when there's no data to show, with icon, title, description, and optional action.

```tsx
import { EmptyState } from '@/components/shared';
import { Button } from '@/components/ui/button';

export function TaskList() {
  if (tasks.length === 0) {
    return (
      <EmptyState
        icon="📋"
        title="No tasks yet"
        description="Create a new task to get started"
        action={<Button>Create Task</Button>}
      />
    );
  }
  // ... render tasks
}
```

**Props:**

- `icon` (ReactNode, optional): Icon or emoji
- `title` (string): Main message
- `description` (string, optional): Additional info
- `action` (ReactNode, optional): Button or link

---

### LoadingState & SkeletonCard

Display loading placeholders while fetching data.

```tsx
import { LoadingState, SkeletonCard } from '@/components/shared';

// Full loading state with title and multiple skeletons
<LoadingState title="Loading tasks..." count={3} />

// Individual skeleton card
<SkeletonCard />
```

**LoadingState Props:**

- `title` (string, optional): "Loading..." message
- `count` (number): Number of skeleton rows (default: 3)

---

### ConfirmDialog

Reusable confirmation dialog for destructive or important actions.

```tsx
'use client';

import { ConfirmDialog } from '@/components/shared';
import { useState } from 'react';

export function DeleteButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    await deleteTask();
    setLoading(false);
    setOpen(false);
  }

  return (
    <>
      <Button variant="destructive" onClick={() => setOpen(true)}>
        Delete
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete task?"
        description="This action cannot be undone."
        actionLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDelete}
        isLoading={loading}
        variant="destructive"
      />
    </>
  );
}
```

**Props:**

- `open` (boolean): Dialog visibility
- `onOpenChange` (function): Callback when dialog state changes
- `title` (string): Dialog title
- `description` (string): Confirmation message
- `actionLabel` (string): Action button text (default: "Confirm")
- `cancelLabel` (string): Cancel button text (default: "Cancel")
- `onConfirm` (function): Callback when action confirmed
- `isLoading` (boolean): Show loading state (default: false)
- `variant` (string): "default" or "destructive" (default: "default")

---

### FormShell

Wrapper component for forms with consistent styling and layout.

```tsx
import { FormShell } from '@/components/shared';
import { Button } from '@/components/ui/button';

export function TaskForm() {
  return (
    <FormShell
      title="Create Task"
      description="Add a new task to your list"
      onSubmit={handleSubmit}
      isLoading={loading}
    >
      {/* Form fields */}
      <Button type="submit">Create</Button>
    </FormShell>
  );
}
```

**Props:**

- `title` (string): Form title
- `description` (string, optional): Form description
- `children` (ReactNode): Form fields and buttons
- `onSubmit` (function): Form submission handler
- `isLoading` (boolean): Disable form during submission (default: false)

---

### Badge Variants

Pre-styled badge components for common data types.

```tsx
import { StatusBadge, PriorityBadge, RoleBadge } from '@/components/shared';

// Status badge (TODO, IN_PROGRESS, DONE, BLOCKED, etc.)
<StatusBadge status="IN_PROGRESS" />

// Priority badge (LOW, MEDIUM, HIGH, URGENT)
<PriorityBadge priority="HIGH" />

// Role badge (STUDENT, MENTOR, ADMIN, MODERATOR)
<RoleBadge role="MENTOR" />
```

---

## Display Helpers

Located in `/src/lib/display-helpers.ts`, these utility functions format common data types.

### Date & Time Formatting

```tsx
import {
  formatDate,
  formatDateTime,
  formatRelativeTime,
  formatDuration,
} from '@/lib/display-helpers';

const date = new Date('2026-05-15');

formatDate(date)           // "May 15"
formatDateTime(date)       // "May 15, 02:30 PM"
formatRelativeTime(date)   // "2 days ago" or "May 15"
formatDuration(145)        // "2h 25m"
formatDuration(45)         // "45m"
```

**Functions:**

- `formatDate(date: Date | string): string`
  - Format: "Jan 1" or "Jan 1, 2025" (includes year if not current year)

- `formatDateTime(date: Date | string): string`
  - Format: "Jan 1, 02:30 PM"

- `formatRelativeTime(date: Date | string): string`
  - Relative times: "just now", "5m ago", "2h ago", "3d ago"
  - Fallback to date format for older dates

- `formatDuration(minutes: number): string`
  - Converts minutes to human-readable format: "2h 35m", "45m", "1h"

### Status & Priority Mappings

```tsx
import {
  statusColors,
  priorityColors,
  roleColors,
  getStatusLabel,
  getPriorityLabel,
} from '@/lib/display-helpers';

// Use color classes directly
const bgColor = statusColors['IN_PROGRESS'];  // 'bg-blue-100 text-blue-800'

// Get readable labels
getStatusLabel('IN_PROGRESS')  // "In Progress"
getPriorityLabel('HIGH')       // "High"
```

---

## Layout Constraints

Located in `/src/lib/layout-constraints.ts`, these constants enforce consistent spacing and responsive behavior.

```tsx
import { LAYOUT_CONSTRAINTS } from '@/lib/layout-constraints';

export function Page() {
  return (
    <div className={`${LAYOUT_CONSTRAINTS.pageMaxWidth} ${LAYOUT_CONSTRAINTS.pagePadding} mx-auto`}>
      <div className={LAYOUT_CONSTRAINTS.pageVerticalSpacing}>
        <div className={LAYOUT_CONSTRAINTS.sectionSpacing}>
          {/* Sections with consistent spacing */}
        </div>

        <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4`}>
          {/* Responsive grid */}
        </div>
      </div>
    </div>
  );
}
```

**Available Constraints:**

- `pageMaxWidth`: "max-w-7xl" - Maximum page width
- `contentMaxWidth`: "max-w-6xl" - Content container max width
- `narrowMaxWidth`: "max-w-2xl" - Narrow form/modal max width
- `pagePadding`: "px-4 sm:px-6 lg:px-8" - Horizontal page padding
- `pageVerticalSpacing`: "py-6 sm:py-8 lg:py-10" - Vertical page spacing
- `sectionSpacing`: "space-y-6" - Space between sections
- `elementSpacing`: "space-y-4" - Space between elements within section

---

## Design Patterns

### Page Template

```tsx
import { PageHeader, LAYOUT_CONSTRAINTS } from '@/components/shared';
import { Button } from '@/components/ui/button';

export default function MyPage() {
  return (
    <div className={`${LAYOUT_CONSTRAINTS.pageMaxWidth} ${LAYOUT_CONSTRAINTS.pagePadding} mx-auto`}>
      <div className={LAYOUT_CONSTRAINTS.pageVerticalSpacing}>
        <PageHeader
          eyebrow="Category"
          title="Page Title"
          description="Description"
          actions={<Button>Action</Button>}
        />

        <div className={LAYOUT_CONSTRAINTS.sectionSpacing}>
          {/* Main content */}
        </div>
      </div>
    </div>
  );
}
```

### Data Table Template

```tsx
<DataPanel title="Users" actions={<Button size="sm">Export</Button>}>
  <table className="w-full text-sm">
    <thead>
      <tr className="border-b">
        <th className="text-left py-2">Name</th>
        <th className="text-left py-2">Role</th>
        <th className="text-right py-2">Actions</th>
      </tr>
    </thead>
    <tbody>
      {users.map((user) => (
        <tr key={user.id} className="border-b">
          <td className="py-2">{user.name}</td>
          <td className="py-2"><RoleBadge role={user.role} /></td>
          <td className="text-right"><Button size="sm">Edit</Button></td>
        </tr>
      ))}
    </tbody>
  </table>
</DataPanel>
```

### Form Template

```tsx
import { FormShell } from '@/components/shared';
import { Button } from '@/components/ui/button';

export function TaskForm() {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await submitForm();
    } finally {
      setLoading(false);
    }
  }

  return (
    <FormShell
      title="Create Task"
      description="Add a new task"
      onSubmit={handleSubmit}
      isLoading={loading}
    >
      {/* Form fields */}
      <Button type="submit">Create</Button>
    </FormShell>
  );
}
```

---

## Import References

**Quick import paths:**

```tsx
// Shared components
import {
  PageHeader,
  DataPanel,
  DataRow,
  EmptyState,
  LoadingState,
  SkeletonCard,
  ConfirmDialog,
  FormShell,
  StatusBadge,
  PriorityBadge,
  RoleBadge,
} from '@/components/shared';

// Display helpers
import {
  formatDate,
  formatDateTime,
  formatRelativeTime,
  formatDuration,
  statusColors,
  priorityColors,
  roleColors,
  getStatusLabel,
  getPriorityLabel,
} from '@/lib/display-helpers';

// Layout constraints
import { LAYOUT_CONSTRAINTS } from '@/lib/layout-constraints';
```

---

## Best Practices

1. **Always use PageHeader** for all module pages to maintain consistency
2. **Use DataPanel** for grouped information display
3. **Use StatusBadge/PriorityBadge** for data type visualization
4. **Apply LAYOUT_CONSTRAINTS** to all pages for responsive spacing
5. **Use display helpers** for all date/time/duration formatting
6. **Use ConfirmDialog** for all destructive actions
7. **Use LoadingState** while fetching data instead of spinners
8. **Wrap forms in FormShell** for consistent styling
9. **Use EmptyState** with action buttons for no-data scenarios

---

## Examples

See `/src/app/(app)/ui-demo/page.tsx` for a live demo of all components.
