import { IconNotebook } from "@tabler/icons-react"

import { ModulePage } from "@/components/app/module-page"

export default function StudyMaterialsPage() {
  return (
    <ModulePage
      title="Study Materials"
      eyebrow="Resources"
      description="Organize learning resources, attachments, links, and mentor-curated material collections."
      icon={IconNotebook}
      metrics={[
        { label: "Collections", value: "6" },
        { label: "New resources", value: "11" },
        { label: "Pinned items", value: "4" },
      ]}
      nextSteps={[
        "Model study materials with owner, visibility, team scope, type, and attachment metadata.",
        "Support mentor-curated and admin-published resource collections.",
        "Connect materials to tasks, focus sessions, and help desk topics where useful.",
        "Plan search and filtering by course, skill, team, and format.",
      ]}
    />
  )
}
