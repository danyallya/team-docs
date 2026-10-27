# Daily work log

## Day 00 — foundation (2026-10-26, Asia/Tehran)

- Prepared the product-specific Next.js/TypeScript workspace, responsive interface, light/dark theme, React Icons, PWA shell, README, AGENTS.md and 30-day backlog.
- Review: inspected the starter page, tests, database schema/config, build, Git ignore rules and local registry setup; corrected issues found by checks before recording a passing result.
- Dependencies: generated package-lock.json and installed packages after Nexus 404s. The user approved npmjs fallback. Local .npmrc remains ignored, preserves Nexus as default and maps only required scopes. No private registry config is tracked.
- Checks: npm test passed (1/1), npm run lint passed, npm run typecheck passed, and npm run build passed. The production build emitted the PWA manifest/service-worker shell.
- Database setup: npm run db:generate generated Prisma Client from the local schema. No real database connection or data push was attempted.
- GitHub: Day 00 foundation commit 4c2390b is pushed to both main and day-00-foundation: https://github.com/danyallya/team-docs. Day 01 has not started.
- Schedule: Day 01 has not started. The next task is Day 01 in BACKLOG.md; wait for the user to trigger that day.

## Day 01 — baseline review (2026-10-27, Asia/Tehran)

- Request: the user triggered Day 01 across all twelve official workspace projects; this entry records the Team Docs project.
- Review: checked the foundation page, tests, Prisma schema, service worker, health route, responsive layout and Git state. Found dark-theme heading/count contrast, a create dialog without focus management, unlabeled search/favorite state, broad dynamic response caching, cache activation that could delete unrelated origin caches, and sidebar placeholder anchors without destinations.
- Implementation: fixed local dark-theme text color; added dialog autofocus, keyboard focus loop, Escape close and focus restoration; named search and favorite state; limited service-worker caching to the offline shell and public static assets; tied cache writes to event lifetime and limited cleanup to Forma caches. Added app accessibility and service-worker boundary tests. The sidebar navigation finding is recorded for Day 03 in BACKLOG.md.
- Dependencies: the first `npm ci` was blocked by the active npm `allow-remote=none` setting for lockfile tarball URLs. `npm ci --allow-remote=all` then completed from the configured Nexus registry (492 packages added). `.npmrc` remained ignored and unchanged; no package manifest or lockfile changes were needed.
- Checks: `npm test` passed (5 tests across 2 files), `npm run lint`, `npm run typecheck`, `npm run db:generate`, `npm run build` and `git diff --check` passed. Production build emitted no Autoprefixer warning. No database push or persistent sample-document creation was performed.
- Browser review: checked the responsive layout around 727 px, light/dark contrast and tab arrow-key navigation. Verified the create dialog focuses its title, keeps Tab within the dialog and restores focus after Escape.
- Git: implementation/documentation commit `20238ea` was pushed to `day-01/baseline-review`, fast-forwarded to `main` and pushed. This log entry is committed and synchronized immediately afterward.
- Carry-over and next day: complete Day 02 from BACKLOG.md by validating Prisma schema, local SQLite creation and seed strategy, and documenting the reset flow. Day 03 includes the keyboard-reachable sidebar destinations discovered today.

## Review workflow maintenance — 2026-10-27

- The user requested careful sequential project execution, commit content/counts suited to each product and an independent branch/PR per repository with panel review and merge.
- Forma Team Library review requires workspace-scoped document access, revision preservation and trustworthy author/state metadata, plus keyboard reading/search/dialog evidence. Added a standalone delivery policy and entry points in AGENTS, README and BACKLOG.
- Documentation-only maintenance on `docs/forma-workspace-review`; Markdown diff reviewed and `git diff --check` used. No application tests/build rerun for this process change. Next product work: Day 02 — Prisma schema validation, local SQLite creation, safe seed strategy and reset guidance.
- This is the pre-merge log state. The portfolio workspace DELIVERY-RECEIPTS.md records the actual PR URL, checked head, panel gates, merge SHA and sync afterward; reconcile it here in the next authorized update.
- Aligned DAILY_WORKFLOW.md with the library-specific PR gate and corrected the Day 01 backlog row to Done using its already-recorded checks; no new Day 01 or Day 02 feature work is claimed.
