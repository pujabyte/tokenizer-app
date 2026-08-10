# Development Workflow (agent-neutral)

Single source of truth for how work flows here. Every agent — Claude Code, Cursor, Codex, opencode,
Antigravity — follows this. Skill-capable agents wrap each step as a skill (`.claude/skills/`); others
follow the steps directly.

```
1 ticket → 2 spec → 3 spec-review → 4 execute-with-tests → 5 review-implementation → 6 open-pr → 7 qa-verify → 8 retro
                 ▲          │                  ▲                       │
                 └─feedback─┘                  └──── loop until met ───┘
```

1. **PM ticket** — GitHub issue (`.github/ISSUE_TEMPLATE/feature-ticket.md`): Scope / Problem /
   Approach (→ADR/RFC) / Acceptance criteria / Dependencies.
2. **Ticket → spec** — `gh issue view <#>`, brainstorm/research, write a spec/plan. Skill:
   `dev-workflow` (agents: `spec-miner`, `architect`). **STOP for approval.**
3. **Spec review** (loop) — review vs acceptance criteria & dependencies. Feedback → step 2. Skill: `spec-review`.
4. **Implement + tests** — TDD; unit always, integration/e2e when a boundary changes. **≥95% coverage**
   on touched files: `npm run test:coverage`, then `npm run lint` and `npx tsc --noEmit`. Skill: `execute-with-tests`
   (agents: `tdd-guide`, build-resolver, `loop-operator`).
5. **Result review** (loop) — reviewers appropriate to the stack (code / language / security / a11y /
   web3-audit). Loop 4↔5 until criteria met. Skill: `review-implementation`.
6. **PR per issue** — branch (never `main`), Conventional commit, `gh pr create` **linking the related
   ticket** (`Closes #<issue>`, plus `Related: #<n>` for dependencies/parent/contract issues). A PR
   always references its ticket. Skill: `open-pr`.
7. **QA retest** — exercise the result end-to-end; log to `logs/`; comment on the PR. Skill: `qa-verify`.
8. **Retrospective** — capture lessons (`retrospective` skill) to `harness/memory/LEARNINGS.md`; promote
   durable ones into rules. Agents self-improve — see `harness/memory/README.md`.

## Cross-agent
The same skills run in Claude Code, opencode, and Codex (shared `SKILL.md` via symlinks);
Cursor/Antigravity follow these steps by reading this file. See `agents-integration.md`.

## Guardrails
Small scoped diffs; no unrelated refactors; never commit to `main`; no secrets in code/logs;
observability on meaningful paths. Definition of Done: acceptance criteria met · ≥95% coverage on
touched files · lint+typecheck+build clean · security reviewed · verified end-to-end · docs synced.
