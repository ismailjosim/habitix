import { IconChartBar } from "@tabler/icons-react"

import { ModulePage } from "@/components/app/module-page"

export default function ActivityPage() {
  return (
    <ModulePage
      title="Activity"
      eyebrow="Progress history"
      description="Track streaks, daily focus totals, task completion, and collaboration activity over time."
      icon={IconChartBar}
      metrics={[
        { label: "Weekly streak", value: "5 days" },
        { label: "Completed tasks", value: "21" },
        { label: "Help responses", value: "6" },
      ]}
      nextSteps={[
        "Design activity events that can power heatmaps and trend charts.",
        "Separate personal activity from mentor-visible and team-visible activity.",
        "Add filters for date range, activity type, and source module.",
        "Prepare seed data for the sample screenshots.",
      ]}
    />
  )
}
