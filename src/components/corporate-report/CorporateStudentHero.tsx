import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { initials } from './corporate-report.utils';

interface CorporateStudentHeroProps {
  student: {
    displayName: string;
    avatarUrl: string | null;
    department: string | null;
    institution: string | null;
    memberships: { team: { name: string } }[];
    currentStreak: number;
  };
}

export function CorporateStudentHero({ student }: CorporateStudentHeroProps) {
  return (
    <section className="flex flex-col gap-4 rounded-xl bg-primary p-6 text-primary-foreground sm:flex-row sm:items-center sm:justify-between print:border print:bg-white print:text-black">
      <div className="flex items-center gap-4">
        <Avatar className="size-14">
          <AvatarImage src={student.avatarUrl ?? undefined} alt="" />
          <AvatarFallback>{initials(student.displayName)}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-2xl font-bold">{student.displayName}</h2>
          <p className="text-sm opacity-80">
            {[student.department, student.institution].filter(Boolean).join(' • ') || 'Student'}
          </p>
          <p className="text-xs opacity-70">
            {student.memberships[0]?.team.name ?? 'No active team'} • {student.currentStreak} day
            streak
          </p>
        </div>
      </div>
      <p className="max-w-md text-sm opacity-80">
        This report contains operational learning metrics only. Contact details and private profile
        fields are excluded.
      </p>
    </section>
  );
}
