import { IconMedal } from "@tabler/icons-react"

import { ModulePage } from "@/components/app/module-page"

export default function LeaderboardPage() {
  return (
    <ModulePage
      title="Leaderboard"
      eyebrow="Recognition"
      description="Compare student and team progress through focus totals, completed work, help points, and badges."
      icon={IconMedal}
      metrics={[
        { label: "Your position", value: "#12" },
        { label: "Team points", value: "8,240" },
        { label: "Badges earned", value: "9" },
      ]}
      nextSteps={[
        "Create leaderboard snapshots so rankings are reproducible over time.",
        "Define scoring rules for focus, tasks, help desk, and badge awards.",
        "Plan privacy-safe scopes for class, team, organization, and global views.",
        "Add badge definitions and user badge awards to the data model.",
      ]}
    />
  )
}
