import type { HelpDeskData } from '@/lib/queries/help-desk';

export interface HelpDeskFiltersState {
  q: string;
  status: string;
  topic: string;
}

export interface HelpDeskBoardProps {
  data: HelpDeskData;
  filters: HelpDeskFiltersState;
}

export type HelpDeskTopic =
  | 'Coding'
  | 'Styling'
  | 'Frontend'
  | 'Backend'
  | 'Database'
  | 'Learning'
  | 'Other';

export type HelpDeskUrgency = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
