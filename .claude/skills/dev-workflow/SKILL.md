---
name: dev-workflow
description: Umbrella orchestrator for this repo's 8-step GitHub-issue development workflow (ticket → spec → review → implement+tests → review → PR → QA → retrospective). Use when starting work on an issue/ticket, or when the user says "work on #<n>", "take this ticket", "run the dev workflow". Delegates to per-step skills and agents.
---

# Dev Workflow (umbrella)

Orchestrates the flow in `harness/workflow.md`. Delegate to per-step skills; never skip approval gates.
Create one todo per step:

1. **Read the ticket** — `gh issue view <#>`; confirm Scope/Acceptance/Dependencies; ask ONE question if ambiguous.
2. **Ticket → spec** — brainstorm/research, write spec/plan. Agents: `spec-miner`, `architect`. **STOP for approval.**
3. **Spec review** — `spec-review` skill. Feedback → step 2.
4. **Implement + tests** — `execute-with-tests` skill (TDD, ≥95% coverage on touched files).
5. **Result review** — `review-implementation` skill. Loop 4↔5 until criteria met.
6. **Open PR** — `open-pr` skill (branch, Conventional commit, PR links issue).
7. **QA** — `qa-verify` skill.
8. **Retrospective** — `retrospective` skill: capture lessons, promote durable ones into rules.

Rules: one issue → one branch → one PR; never commit to `main`. Use the project's commands from
AGENTS.md §Test & verify. Honor the Definition of Done in `harness/workflow.md`.
