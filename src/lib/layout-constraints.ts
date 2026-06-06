/**
 * Layout conventions for Habitix UI
 */

export const LAYOUT_CONSTRAINTS = {
  // Page width constraints
  pageMaxWidth: 'max-w-7xl',
  contentMaxWidth: 'max-w-6xl',
  narrowMaxWidth: 'max-w-2xl',

  // Spacing
  pagePadding: 'px-4 sm:px-6 lg:px-8',
  pageVerticalSpacing: 'py-6 sm:py-8 lg:py-10',
  sectionSpacing: 'space-y-6',
  elementSpacing: 'space-y-4',

  // Responsive grid
  gridCols: {
    default: 'grid-cols-1',
    sm: 'sm:grid-cols-2',
    md: 'md:grid-cols-3',
    lg: 'lg:grid-cols-4',
  },
};

// Usage: className={`${LAYOUT_CONSTRAINTS.pageMaxWidth} ${LAYOUT_CONSTRAINTS.pagePadding}`}
