# Forma Team Library | 30-day delivery plan

## Product goal and daily gate
Deliver a dependable shared studio library with rich documents, collaboration, permissions, revision history, search and release documentation. Every day includes review of previous code, test writing/updating, implementation, debugging, docs/backlog updates and explicit next-day planning via DAILY_WORKFLOW.md. Mark work complete only when checks pass and acceptance criteria are met.

## Day 00 foundation prepared
Next.js/TypeScript, Radix UI primitives, original editorial responsive UI, searchable tabs, favorites, document preview and create-note interaction, light/dark theme, PWA shell, Prisma/SQLite schema, safe Git ignore, README and daily workflow are prepared. Library records are presentation content.

## Daily plan
### Day 00 validation
Nexus returned 404 for packages used by this project. Following the user's approval, dependencies were installed with npmjs fallback. The ignored local .npmrc preserves Nexus as default and contains only required scope overrides. Tests, lint, typecheck and production build passed; Day 01 has not started.

| Day | Focus | Acceptance |
|---|---|---|
| 01 | Baseline review | Done — foundation reviewed, dependencies installed from the approved registry, tests/lint/typecheck/build passed, and responsive/keyboard baseline checked; see Day 01 DAILY-LOG.md. |
| 02 | SQLite data lifecycle | Validate Prisma schema, local DB creation and seed strategy; document reset flow. |
| 03 | Workspace foundation | Add workspace reads, default space and workspace switcher; replace placeholder sidebar anchors with semantic, keyboard-reachable navigation and working destinations. |
| 04 | Document reads | Load persisted document list/detail with empty/loading/error states. |
| 05 | Create/edit documents | Persist title, summary, type and body with validation. |
| 06 | Search and filters | Add server-backed search, status filters and URL-safe views. |
| 07 | Favorites and recents | Persist favorites and recently viewed documents per user. |
| 08 | Rich text editing | Add accessible editor with headings, lists, links and autosave. |
| 09 | Draft and publish | Implement document lifecycle and clear status transitions. |
| 10 | Revision history | Save versions and compare/restore earlier revisions. |
| 11 | Comments | Add contextual comments and resolve/reopen workflow. |
| 12 | Mentions | Add teammate mentions with keyboard-accessible picker. |
| 13 | Workspace members | Add invitations and member list with clear role labels. |
| 14 | Permissions | Enforce owner/editor/viewer access on read and write operations. |
| 15 | Project spaces | Organize library by active project and studio operations. |
| 16 | Authentication | Add secure sign-in, sessions and protected routes. |
| 17 | Sharing controls | Add private workspace links, expiry and revoke controls. |
| 18 | Notifications | Add in-app notifications for mentions, comments and shared docs. |
| 19 | Templates | Add reusable studio brief, meeting note and handover templates. |
| 20 | Activity analytics | Visualize edits, active spaces and publishing trends. |
| 21 | Export | Add PDF and XLSX/CSV export with metadata and readable layout. |
| 22 | Import and migration | Support safe markdown/document import with validation and rollback. |
| 23 | PWA completion | Validate install, update, offline shell and cache boundaries. |
| 24 | Mobile reading/editing | Refine phone/tablet reading, navigation and editor interactions. |
| 25 | Accessibility/localization | Review keyboard/screen reader, contrast, focus and date formatting. |
| 26 | Reliability | Add structured errors, health/readiness and safe logs. |
| 27 | Security/privacy | Review workspace scoping, sharing, XSS/content handling and backups. |
| 28 | Performance/SEO | Improve document search/rendering and metadata where appropriate. |
| 29 | Release candidate | Run all checks and manually review create/edit/share/revision paths. |
| 30 | Release handoff | Finish deployment, backup, workspace admin, user guide and release notes. |

New findings require priority, target day and verifiable acceptance. Explain moved work; completion includes UI, permissions, tests, docs and error states.

### Day 01 baseline findings

- P1 · Target Day 03: The four sidebar entries are anchors without `href`, so keyboard users cannot reach them and they do not navigate. Acceptance: provide working, semantic destinations for library, favorites, team spaces and archive; verify mouse and keyboard navigation and active-state behavior with tests.

## Process change effective Day 02 — 2026-10-27

Apply [DELIVERY-POLICY.md](DELIVERY-POLICY.md) to every remaining ticket: finish Forma Team Library before the next repository, use meaningful scope-driven commits and deliver through its own reviewed PR. A blocked external gate needs a concrete record and next action. This adds delivery gates without moving Day 02–30 product work or changing completed history.

## Contribution integration — 2026-10-27

Effective Day 02: apply [CONTRIBUTING.md](CONTRIBUTING.md) inside existing tickets. At already scheduled weekly reviews, assess real feedback such as a synthetic workspace permission or revision-preservation case with expected access; at documentation/setup tickets, improve a SQLite setup and team-document walkthrough with fictitious content. Day 30 records actual contribution evidence and outstanding external dependencies. No day is renumbered and no quota or badge is a completion criterion. Next scope remains: Day 02 — Prisma schema validation, local SQLite creation, safe seed strategy and reset guidance.
