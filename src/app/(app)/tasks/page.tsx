import { IconChecklist } from "@tabler/icons-react"

import { ModulePage } from "@/components/app/module-page"

export default function TasksPage() {
  return (
    <ModulePage
      title="Tasks"
      eyebrow="Work management"
      description="Manage personal tasks, mentor assignments, admin-created work, subtasks, comments, status, and due dates."
      icon={IconChecklist}
      metrics={[
        { label: "Due today", value: "3" },
        { label: "In progress", value: "5" },
        { label: "Blocked", value: "1" },
      ]}
      nextSteps={[
        "Define task ownership, assignment, category, status, and history tables.",
        "Support subtasks and comments with clear user permissions.",
        "Plan mentor and admin task creation flows separately from personal tasks.",
        "Create board, list, and detail views after the schema is stable.",
      ]}
    />
  )
}
