# Forma Library SQLite lifecycle

Use Node.js 20.12+ for local scripts. SQLite runs through the installed Prisma engine; no database server is needed. The web app reads only the seeded sample user's workspace memberships. Document content remains a synthetic session preview; this fixed sample identity is not authentication or an authorization boundary.

## Fresh setup

1. Run `npm ci`; copy `.env.example` to ignored `.env` if needed. Use `DATABASE_URL=file:./forma-dev.db`.
2. Run `npm run db:validate` and `npm run db:generate`.
3. Review `prisma/migrations/202610280002_initial/migration.sql`, then run `npm run db:setup`. The wrapper resolves the known name under this repository's `prisma/` folder, creates a fresh empty file only if missing, and applies tracked migrations. It never overwrites a file. Inspect existing database history before applying to a previously used file.
4. Run `npm run db:status`, then `npm run db:seed` twice. The transaction upserts one fictional author, two workspaces, owner/editor memberships, a draft document and its first revision, preserving matching records. The author's address is a reserved example domain. Do not put actual team documents in the fixture.

The wrapper accepts only `forma-dev.db` and timestamped `forma-verify-<13 digits>.db` under `prisma/`; paths, queries and remote URLs are refused. CLI and client receive the same absolute resolved datasource URL, avoiding relative-path disagreement. Only the shareable template is tracked; SQLite files/journal/WAL/SHM, `.env` and private registry configuration stay ignored.

## Integration rehearsal

`npm run db:verify` creates a new timestamped isolated file, applies the migration, seeds twice and asserts counts `[1,2,2,1,1]` for user/workspace/membership/document/revision. It checks revision body agreement, duplicate membership/version rejection and rejection of an orphan document by the foreign key. The fixture database is retained locally and ignored; no existing file is reset or deleted. These checks establish persistence invariants, not authenticated workspace permissions.

On 2026-10-28, initial migrate deploy against a nonexistent file returned a schema-engine error on this Windows runtime. Explicit exclusive creation of the fresh file before migration fixed it. The full Day 02 rehearsal then passed with its original single-workspace fixture counts `[1,1,1,1,1]`. Day 03 extends the fixture with a second member workspace so the switcher can be exercised; the current rehearsal count is `[1,2,2,1,1]`. No private document or external database was used.

## Reset and recovery flow

Stop the app and disconnect Prisma clients first. Identify the exact disposable `prisma/forma-dev.db`; inspect its migration history and decide whether its contents may be replaced. Back up useful data and keep any journal/WAL/SHM together after clean shutdown. To rehearse a clean setup, archive/rename that explicitly chosen file outside source control, then run setup/status/seed against the missing dedicated name. No automatic reset/drop/delete command is supplied. Never remove or move an arbitrary environment-supplied path, edit an applied migration, or overwrite another workspace's database. For a useful existing database, prefer a reviewed corrective migration and tested backup/restore.

The initial schema includes unique email/slug, unique user/workspace membership and document/version, workspace/time and author indexes, and foreign keys. Workspace/document deletion cascades into related content; user deletion is restricted by authored documents. Review retention/revision preservation before implementing deletion. Roles/status are Prisma enums represented as text in SQLite; direct SQL does not itself prove authorization or validate every product transition.

Day 03 adds workspace reads/switcher and fixes the recorded sidebar navigation issue. Permission checks, rich editing and revision restoration remain their scheduled tickets. PR panel delivery is blocked separately by disabled Work browser access.
