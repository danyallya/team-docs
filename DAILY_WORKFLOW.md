# Forma Team Library daily delivery cycle — effective Day 02

Follow [DELIVERY-POLICY.md](DELIVERY-POLICY.md). Finish this library repository, including its PR merge and receipt, before the next portfolio project; record an exact external blocker before moving past blocked work.

1. Read AGENTS.md, DELIVERY-POLICY.md, README.md, BACKLOG.md, DAILY-LOG.md, status and history. Reconcile the prior PR receipt and preserve user changes.
2. Confirm the manually requested day; do not automatically start a later day's ticket. Fetch and start `day-NN/<library-scope>` from current `origin/main`.
3. Review prior workspace/document boundaries, revision preservation, authorship and sharing claims, content rendering and cache privacy. Resolve relevant defects before extending the library.
4. Add meaningful tests for changed reading/editing/access behavior and error paths; implement the scheduled slice and debug its full flow with synthetic documents.
5. Run relevant tests, lint, typecheck and build; inspect touched search/favorite/dialog and reading flows for keyboard/focus, responsive layout and both themes. Record this repository's actual evidence.
6. Update product/setup/data guidance, backlog status, discoveries and concrete next-day criteria. Keep private team documents, credentials and machine config out of Git.
7. Choose commit count, boundaries, scope and wording from actual document/workspace changes. Do not copy a portfolio history pattern or create artificial commit splits.
8. Push this repository's branch and open its own PR. Explicitly verify base `main`, compared files/commits and the latest pushed head. Inspect every file in GitHub Files changed, Checks and the conversation, and address findings.
9. Required independent reviews and checks are gates; self-review cannot substitute for them. When GitHub permits, merge from its panel and verify Merged. Fetch and fast-forward local `main` to `origin/main`, retain the pushed branch and confirm a clean worktree.
10. Log the actual pre-merge state in DAILY-LOG.md; record the final merge SHA and sync receipt in workspace DELIVERY-RECEIPTS.md and reconcile it in the next authorized update. Finish that receipt before the next repository.
