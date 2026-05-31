import type { Icon } from '@tabler/icons-react';
import { Badge } from '@/components/ui/badge';

type ModuleMetric = {
  label: string;
  value: string;
};

type ModulePageProps = {
  title: string;
  eyebrow: string;
  description: string;
  icon: Icon;
  metrics: ModuleMetric[];
  nextSteps: string[];
};

export function ModulePage({
  title,
  eyebrow,
  description,
  icon: Icon,
  metrics,
  nextSteps,
}: ModulePageProps) {
  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-5">
      <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5 shadow-sm sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-4">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-6" />
          </div>
          <div>
            <Badge variant="outline" className="mb-2 border-primary/20 bg-primary/10 text-primary">
              {eyebrow}
            </Badge>
            <h1 className="text-2xl font-semibold tracking-normal text-card-foreground">{title}</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{description}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-lg border border-border bg-card p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">{metric.label}</p>
            <p className="mt-2 text-2xl font-semibold text-card-foreground">{metric.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
        <h2 className="text-base font-semibold text-card-foreground">Upcoming build notes</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {nextSteps.map((step) => (
            <div
              key={step}
              className="rounded-lg border border-border bg-secondary px-4 py-3 text-sm text-secondary-foreground"
            >
              {step}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
