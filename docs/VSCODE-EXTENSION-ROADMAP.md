# VS Code Extension Roadmap

## Objective

Connect editor activity to Habitix without collecting source code. The extension should display and
control focus sessions, update presence, and optionally associate activity with a Habitix task.

## Privacy Boundary

Allowed by default:

- Workspace name or a user-approved alias.
- Active language identifier.
- Relative activity state such as editing, debugging, terminal, or idle.
- Focus session ID, elapsed time, selected task ID, and presence heartbeat.

Do not transmit file contents, terminal contents, secrets, full local paths, repository remotes, or
keystrokes. Active filenames must be opt-in and reduced to a basename before transmission.

## Phase 1: Companion Status

- Add a TypeScript VS Code extension package with commands for sign in/out and opening Habitix.
- Authenticate with a short-lived device flow or one-time browser code; do not store a web password.
- Store refresh credentials in VS Code `SecretStorage`.
- Show connection, current focus state, and remaining time in the status bar.
- Poll a read-only session endpoint and open the web task or focus page from commands.

## Phase 2: Session Control

- Add authenticated API endpoints to start, pause, resume, stop, and complete owned sessions.
- Require an idempotency key for mutation retries.
- Use server timestamps as the source of truth; extension timers are presentation only.
- Add a task picker limited to tasks already visible to the authenticated user.
- Queue offline state changes locally and reconcile after reconnecting.

## Phase 3: Activity And Presence

- Listen to editor, debug, terminal, and window-focus events.
- Debounce activity classification and send a heartbeat every 30-60 seconds.
- Mark idle after a configurable inactivity period.
- Update `Presence` with editor state and optional approved metadata.
- Aggregate duration locally before sending; never stream individual keystrokes.

## Phase 4: Team Collaboration

- Show active teammates and their coarse activity state.
- Surface task assignment and help-response notifications.
- Add a command to open a prefilled Help Desk request in the browser.
- Keep role, task, team, and help authorization on the Habitix server.

## API And Data Work

- Add scoped extension tokens with revocation, expiry, device name, and last-used timestamp.
- Add endpoints under a versioned path such as `/api/extension/v1`.
- Add idempotency storage for session mutations.
- Extend presence metadata with a small validated JSON shape.
- Add audit events for token creation, revocation, and session changes.
- Rate-limit auth, heartbeat, and mutation endpoints independently.

## Definition Of Done

- No source or secret data leaves the editor in default configuration.
- Revoking a device immediately blocks further API access.
- Web and extension timers converge after reconnect and duplicate requests.
- Permission tests cover every extension endpoint.
- Extension unit tests, VS Code integration tests, and web API contract tests run in CI.
