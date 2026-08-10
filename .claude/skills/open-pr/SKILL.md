---
name: open-pr
description: Open a pull request for an approved, reviewed change linking its GitHub issue (step 6). Use when implementation passed review and it's time to branch/commit/PR, or when the user says "open a PR", "ship this", "create the PR". Never commits to main.
---

# Open PR (step 6)

Only after step 5 is CLEAN. Verify first (reuse verification-before-completion): tests+coverage,
lint, typecheck all clean; exercised end-to-end; no unresolved CRITICAL/HIGH.

1. **Branch** off base (never `main`): `feat/<issue-#>-<slug>` or `fix/<issue-#>-<slug>`.
2. **Commit** — Conventional Commits, scoped, small. No `.env`/secrets/build artifacts.
3. **Push** the branch.
4. **PR** via `gh pr create`: title (Conventional), body from `.github/pull_request_template.md`, plus
   evidence (tests/coverage, lint/typecheck, manual verification).
   - **Link the related ticket(s) — required:** `Closes #<issue>` for the ticket this PR resolves
     (auto-closes on merge), plus `Related: #<n>, #<m>` for dependency/parent tickets or the linked
     contract issue. Never open a PR without referencing its ticket.
5. Report the PR URL. Don't merge — hand to step 7 (`qa-verify`).

Commit/push/PR only when asked to reach this step. Never force-push, never target `main`.
Every PR must trace to a ticket — always include the related issue reference (`Closes` / `Related`).
