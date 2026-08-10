---
name: qa-verify
description: QA end-to-end retest of a delivered change against acceptance criteria (step 7). Use after a PR is open and the feature needs QA sign-off, or when the user says "QA this", "retest", "verify end-to-end #<PR>". Exercises the real flow, logs the run, comments on the PR.
---

# QA Verify (step 7)

Independently exercise the delivered change end-to-end and confirm acceptance criteria. Reuse the
`verify` skill and the `e2e-runner` agent.

1. Load PR + issue (`gh pr view`, `gh issue view`); list acceptance criteria.
2. Bring up the affected surface and exercise the real flow — happy path + edge cases + error/empty
   states (and for UI: responsive, light/dark, keyboard/focus/contrast). Check logs/console for errors.
3. Verify each criterion: PASS/FAIL with observed evidence.
4. **Log** to `logs/qa-<PR#>-<date>.md`; **comment** on the PR (`gh pr comment`).
   PASS → ready to merge (human merges). FAIL → loop to step 5 with failing evidence.

Verify behavior, not just green tests. Never merge automatically. Redact secrets/PII.
