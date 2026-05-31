import { IconBriefcase } from '@tabler/icons-react';

import { ModulePage } from '@/components/app/module-page';

export default function CorporateReportPage() {
  return (
    <ModulePage
      title="Corporate Report"
      eyebrow="Program insight"
      description="Summarize anonymized program health, team outcomes, engagement, help desk trends, and completion metrics."
      icon={IconBriefcase}
      metrics={[
        { label: 'Active teams', value: '8' },
        { label: 'Engagement', value: '76%' },
        { label: 'Completion', value: '68%' },
      ]}
      nextSteps={[
        'Model report snapshots separately from operational student records.',
        'Aggregate team and cohort metrics with privacy boundaries.',
        'Define corporate viewer permissions independently from admin permissions.',
        'Prepare exportable report data for later PDF or dashboard output.',
      ]}
    />
  );
}
