import { IconBell } from "@tabler/icons-react"

import { ModulePage } from "@/components/app/module-page"

export default function NotificationsPage() {
  return (
    <ModulePage
      title="Notifications"
      eyebrow="Updates"
      description="Centralize deadline reminders, mentor feedback, help desk responses, badge awards, and system notices."
      icon={IconBell}
      metrics={[
        { label: "Unread", value: "5" },
        { label: "Due soon", value: "2" },
        { label: "Mentor notes", value: "1" },
      ]}
      nextSteps={[
        "Create typed notifications with read state, actor, target, and delivery metadata.",
        "Plan notification preferences before adding email or push channels.",
        "Link notifications to task, help desk, badge, and report records.",
        "Add digest-friendly grouping for busy team activity.",
      ]}
    />
  )
}
