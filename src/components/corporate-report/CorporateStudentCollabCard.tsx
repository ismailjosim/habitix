import { IconHelpHexagon } from '@tabler/icons-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDuration } from '@/lib/display-helpers';

interface CorporateStudentCollabCardProps {
  collaboration: {
    helpPosts: number;
    resolutionRate: number;
    responsesGiven: number;
    acceptedResponses: number;
    efficiency: number;
    averageFirstResponseMinutes: number | null;
  };
}

export function CorporateStudentCollabCard({ collaboration }: CorporateStudentCollabCardProps) {
  return (
    <Card className="break-inside-avoid">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconHelpHexagon className="size-5 text-primary" /> Collaboration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <MiniMetric label="Questions" value={String(collaboration.helpPosts)} />
          <MiniMetric label="Resolved" value={`${collaboration.resolutionRate}%`} />
          <MiniMetric label="Responses" value={String(collaboration.responsesGiven)} />
          <MiniMetric label="Accepted" value={String(collaboration.acceptedResponses)} />
          <MiniMetric label="Efficiency" value={`${collaboration.efficiency}%`} />
          <MiniMetric
            label="First response"
            value={
              collaboration.averageFirstResponseMinutes === null
                ? 'N/A'
                : formatDuration(collaboration.averageFirstResponseMinutes)
            }
          />
        </div>
        <p className="text-xs leading-5 text-muted-foreground">
          Help efficiency is the share of the learner&apos;s responses accepted as resolutions.
          First response measures requests created by the learner.
        </p>
      </CardContent>
    </Card>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/50 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-bold">{value}</p>
    </div>
  );
}
