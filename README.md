# Forma Team Library

Forma is a shared working library for independent creative studios. It gives teams one place for project briefs, decisions, operational guides and research notes, with clear authorship and a visible revision trail.

## Product direction

Forma is built for the moment a teammate needs the current answer without losing the context that led there. This foundation includes an editorial document library, search, favorites, status labels, document preview, a create-note flow, light/dark appearance, responsive layout, PWA shell and an initial workspace/document/revision data model. Visible documents are curated presentation records until persistence is connected.

## Technology and local setup

Next.js App Router, TypeScript, Radix UI primitives with bespoke CSS, React Icons and Prisma with SQLite for simple local-first development. Recharts, jsPDF and SheetJS are included for planned usage views and archive/export workflows.

Use Node.js 20 or newer. Copy .env.example to .env and set DATABASE_URL. Run npm install, npm run db:generate, npm run db:push and npm run dev. Before a delivery run npm run lint, npm run typecheck and npm run build.

The local .npmrc points to the requested Nexus mirror and machine certificate. It is excluded from Git to keep registry details local. Configure an approved registry before installing.

## Data and roadmap

The schema separates users, workspaces, memberships, documents and revisions. Before team use, add authentication, workspace authorization, invitation controls, revision retention and backups. See BACKLOG.md for the 30-day product plan and DAILY_WORKFLOW.md for required daily code review, tests, implementation, debugging, documentation and handoff.