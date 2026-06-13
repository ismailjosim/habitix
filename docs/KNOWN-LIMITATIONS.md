# Known Limitations

- No automated browser/end-to-end suite; multi-account release flows still need manual QA.
- No email verification, password reset, social login, or multi-factor authentication workflow.
- User administration supports one active team per managed update even though the schema permits
  multiple active memberships.
- Team invitation and self-service team creation are not available to ordinary users.
- Corporate snapshots must be created through an operational process; no scheduled generator exists.
- Study materials currently use external URLs and metadata, not managed file uploads.
- Notification delivery is in-app only; email and push preferences are not connected to providers.
- Presence uses heartbeat polling and is not realtime over WebSocket or subscriptions.
- The focus timer persists server state but does not yet synchronize with VS Code.
- Accessibility has received a code review and keyboard-oriented improvements, but no automated axe
  suite or formal WCAG audit has been completed.
- Analytics use application server time and stored timestamps; deeper timezone reporting remains
  future work.

These are post-MVP items, not hidden production guarantees. Prioritize auth recovery, browser tests,
team onboarding, and operational reporting before broad external rollout.
