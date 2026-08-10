---
name: review-implementation
description: Review an implementation against its spec and acceptance criteria before opening a PR (step 5). Use after code+tests are written, before the PR, or when the user says "review my changes/implementation". Runs the reviewer agents and loops with execute-with-tests. (For a built-in diff linter use /code-review.)
---

# Review Implementation (step 5)

Review the working diff (`git diff`) against the spec and acceptance criteria. Loop with
`execute-with-tests` until it passes.

Run reviewers **in parallel** (single message, multiple Agent calls), scoped to the diff and stack:
`code-reviewer`, the language reviewer (`typescript-reviewer`/`go-reviewer`/`react-reviewer`/…),
`security-reviewer`, `silent-failure-hunter`, plus `database-reviewer` / `a11y-architect` /
`web3-auditor` where relevant. Optionally `/code-review` + `ponytail:ponytail-review`.

Triage by severity; fix CRITICAL/HIGH now → loop to step 4. Confirm the gate still holds (coverage,
lint, typecheck). Output: **CLEAN** → step 6, or **NEEDS WORK** (prioritized findings) → loop.
