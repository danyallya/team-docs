# Forma Team Library

Forma is a shared working library for independent creative studios. It gives teams one place for project briefs, decisions, operational guides and research notes, with clear authorship and a visible revision trail.

## Product direction

Forma is built for the moment a teammate needs the current answer without losing the context that led there. The editorial document library, search, favorites, status labels, light/dark appearance, responsive layout and PWA shell sit on an initial workspace/document/revision model. The workspace picker and document list/detail read local synthetic SQLite fixtures. The fixed sample member only scopes this demo; it is not authentication or a permission boundary. Favorites and newly created notes remain browser-session state until their planned persistence work.

## Technology and local setup

Next.js App Router, TypeScript, Radix UI primitives with bespoke CSS, React Icons and Prisma with SQLite for simple local-first development. Recharts, jsPDF and SheetJS are included for planned usage views and archive/export workflows.

Use Node.js 20.12+ and follow [DATABASE.md](DATABASE.md) for the guarded local SQLite setup, tracked migration, synthetic seed and reset/recovery flow. Run `db:validate`, `db:generate`, `db:setup`, `db:status` and `db:seed`; `db:verify` independently rehearses a fresh isolated database and twice-run seed. `db:push` is an unversioned experiment, not the normal migration path. Run tests/lint/typecheck/build before delivery.

The project-local `.npmrc` is intentionally ignored by Git because registry configuration is machine-specific. Run `npm ci` with your configured registry. If the configured mirror does not provide a dependency, npmjs is an approved fallback for dependency installation.

## Data and roadmap

The schema separates users, workspaces, memberships, documents and revisions. Before team use, add authentication, workspace authorization, invitation controls, revision retention and backups. See BACKLOG.md for the 30-day product plan and DAILY_WORKFLOW.md for required daily code review, tests, implementation, debugging, documentation and handoff.

## Day 01 baseline review (2026-10-27)

The current homepage and sample documents are presentation state; they are not persisted and do not represent authenticated team data. `/api/health`, `/offline` and `/manifest.webmanifest` are the other checked routes. The service worker keeps API responses and document/navigation pages out of its cache; it caches the offline shell, public metadata and versioned Next.js static assets.

The create-document dialog now focuses its title field, contains keyboard focus, closes with Escape and restores focus to its trigger. Search and favorite controls expose accessible names and favorite state. Light/dark contrast was checked, and the tab group supports arrow-key navigation. At the Day 01 baseline, sidebar entries were placeholder anchors without destinations; Day 03 adds semantic links and workspace navigation. Do not treat the sample workspace as an authenticated collaboration product.

Day 01 checks: `npm ci --allow-remote=all` (using the configured Nexus registry), `npm test`, `npm run lint`, `npm run typecheck`, `npm run db:generate` and `npm run build`.

## Day 03 workspace navigation

The server-rendered page reads workspaces joined to the seeded `sample-author` membership from local SQLite. `Northline Studio` is the deterministic default; the Radix workspace picker can switch to `Field Notes`, whose preview intentionally has no documents. The sample identity is fixed for this unauthenticated demo and must not be treated as an authorization boundary. Future authentication and workspace authorization remain on the roadmap.

Sidebar links navigate to the library, favorites view, team-space list and archive empty state. A compact version stays keyboard reachable on tablet and phone widths. The Day 03 workspace-switcher and navigation changes were merged in PR #5 at `c29b38b`.

## Day 04 persisted document reads

The server-rendered page loads a workspace-scoped document list and its first detail from SQLite. The list endpoint returns summary metadata; a separate detail endpoint returns the body only when both the document and its workspace match the sample member's membership. Both endpoints disable caching and return generic errors. The UI has loading, retryable error and empty states for list and detail reads.

Recent orders matching search results by `updatedAt` newest first, with a deterministic document-ID tie-breaker. This resolves the existing Recent ordering report (Issue #3). The seed now contains two synthetic Northline Studio documents and matching revisions so All and Recent can be distinguished; Field Notes remains an intentionally empty member workspace. Names and content are fictitious. No real team data or authentication is involved. Favorites and newly created notes remain browser-session state for their later backlog items.

## Delivery and review

Forma Team Library review requires workspace-scoped document access, revision preservation and trustworthy author/state metadata, plus keyboard reading/search/dialog evidence. Follow [DELIVERY-POLICY.md](DELIVERY-POLICY.md) from Day 02 for sequential execution, scope-driven commits and this repository's separate branch/PR with GitHub panel review and merge.

## Contributions and examples

See [CONTRIBUTING.md](CONTRIBUTING.md) for reproducible reports, genuine collaboration and product examples such as a SQLite setup and team-document walkthrough with fictitious content. Contributions follow the product backlog and reviewed PR workflow.
