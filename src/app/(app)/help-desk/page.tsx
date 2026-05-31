import { IconHelpCircle } from "@tabler/icons-react"

import { ModulePage } from "@/components/app/module-page"

export default function HelpDeskPage() {
  return (
    <ModulePage
      title="Help Desk"
      eyebrow="Peer support"
      description="Ask for help, answer peer questions, award contributors, and track resolution outcomes."
      icon={IconHelpCircle}
      metrics={[
        { label: "Open posts", value: "14" },
        { label: "Resolved today", value: "7" },
        { label: "Helper points", value: "320" },
      ]}
      nextSteps={[
        "Model help posts, responses, awarded contributors, status, and moderation hooks.",
        "Add helper limits and point-award rules to prevent abuse.",
        "Support tags for courses, teams, urgency, and topic categories.",
        "Prepare moderator and mentor review states.",
      ]}
    />
  )
}
