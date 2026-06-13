// @vitest-environment jsdom

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ActivityDashboard } from '@/components/activity/activity-dashboard';

describe('activity page smoke test', () => {
  it('renders the empty-data state without crashing', () => {
    render(
      <ActivityDashboard
        data={{
          rangeDays: 30,
          stats: {
            totalSessions: 0,
            totalFocusMinutes: 0,
            tasksCompleted: 0,
            helpPoints: 0,
            helpCreditMinutes: 0,
            currentStreak: 0,
            bestDay: null,
          },
          heatmap: [],
          recentSessions: [],
          breakdown: [],
        }}
      />
    );

    expect(screen.getByRole('heading', { name: 'Activity' })).toBeInTheDocument();
    expect(screen.getByText('No completed focus sessions yet.')).toBeInTheDocument();
    expect(
      screen.getByText('Activity types will appear after your first completed session.')
    ).toBeInTheDocument();
  });
});
