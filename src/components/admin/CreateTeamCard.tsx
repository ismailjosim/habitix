import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface CreateTeamCardProps {
  onCreateTeam: (formData: FormData) => void;
  isPending: boolean;
}

export function CreateTeamCard({ onCreateTeam, isPending }: CreateTeamCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create team</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={onCreateTeam} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <Input name="name" placeholder="Team name" required />
          <Input name="slug" placeholder="team-slug" required />
          <Button type="submit" disabled={isPending}>
            Create team
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
