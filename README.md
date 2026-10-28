# Forma Team Library

Forma is a shared working library for independent creative studios. It gives teams one place for project briefs, decisions, operational guides and research notes, with clear authorship and a visible revision trail.

## Product direction

Forma is built for the moment a teammate needs the current answer without losing the context that led there. This foundation includes an editorial document library, search, favorites, status labels, document preview, a create-note flow, light/dark appearance, responsive layout, PWA shell and an initial workspace/document/revision data model. Visible documents are curated presentation records until persistence is connected.

## Technology and local setup

Next.js App Router, TypeScript, Radix UI primitives with bespoke CSS, React Icons and Prisma with SQLite for simple local-first development. Recharts, jsPDF and SheetJS are included for planned usage views and archive/export workflows.

Use Node.js 20.12+ and follow [DATABASE.md](DATABASE.md) for the guarded local SQLite setup, tracked migration, synthetic seed and reset/recovery flow. Run `db:validate`, `db:generate`, `db:setup`, `db:status` and `db:seed`; `db:verify` independently rehearses a fresh isolated database and twice-run seed. `db:push` is an unversioned experiment, not the normal migration path. Run tests/lint/typecheck/build before delivery.

The project-local `.npmrc` is intentionally ignored by Git because registry configuration is machine-specific. Run `npm ci` with your configured registry. If the configured mirror does not provide a dependency, npmjs is an approved fallback for dependency installation.

## Data and roadmap

The schema separates users, workspaces, memberships, documents and revisions. Before team use, add authentication, workspace authorization, invitation controls, revision retention and backups. See BACKLOG.md for the 30-day product plan and DAILY_WORKFLOW.md for required daily code review, tests, implementation, debugging, documentation and handoff.

## Day 01 baseline review (2026-10-27)

The current homepage and sample documents are presentation state; they are not persisted and do not represent authenticated team data. `/api/health`, `/offline` and `/manifest.webmanifest` are the other checked routes. The service worker keeps API responses and document/navigation pages out of its cache; it caches the offline shell, public metadata and versioned Next.js static assets.

The create-document dialog now focuses its title field, contains keyboard focus, closes with Escape and restores focus to its trigger. Search and favorite controls expose accessible names and favorite state. Light/dark contrast was checked, and the tab group supports arrow-key navigation. The current sidebar entries are placeholder anchors without destinations and are not keyboard reachable; see the Day 03 acceptance in BACKLOG.md. Do not treat the sample workspace as a connected collaboration product.

Day 01 checks: `npm ci --allow-remote=all` (using the configured Nexus registry), `npm test`, `npm run lint`, `npm run typecheck`, `npm run db:generate` and `npm run build`.

## Delivery and review

Forma Team Library review requires workspace-scoped document access, revision preservation and trustworthy author/state metadata, plus keyboard reading/search/dialog evidence. Follow [DELIVERY-POLICY.md](DELIVERY-POLICY.md) from Day 02 for sequential execution, scope-driven commits and this repository's separate branch/PR with GitHub panel review and merge.

## Contributions and examples

See [CONTRIBUTING.md](CONTRIBUTING.md) for reproducible reports, genuine collaboration and product examples such as a SQLite setup and team-document walkthrough with fictitious content. Contributions follow the product backlog and reviewed PR workflow.
