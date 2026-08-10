# AGENTS.md — tokenizer-app

Canonical guide for AI agents (Claude Code, Cursor, Codex, opencode, Antigravity — all read this
file; `CLAUDE.md` is a symlink to it). The nearest layer-scoped `AGENTS.md` wins for a subtree.

> **Harness:** shared workflow, rules, and roles live in [`harness/`](harness/) — start with
> [`harness/workflow.md`](harness/workflow.md). Cross-agent map: `harness/agents-integration.md`.

## Project

- **Focus:** frontend
- **Stack:** typescript / npm
- **Package manager:** npm

_Fill in what this project does, its architecture, and key modules/directories._

## Conventions

- **Principles:** SOLID > DRY > KISS > YAGNI. Clean boundaries; small, focused units.
- **Strict types**, no untyped escapes. Self-documenting code; doc-comment public APIs.
- **No magic numbers/strings** — name them. Follow the framework/tool's own conventions.
- **Observability:** structured logging (no secrets/PII), tracing on meaningful paths, error tracking.
- **Security:** validate at trust boundaries; never commit `.env`/secrets; least privilege.
- Match existing naming, import style, and file layout. No unrequested refactors.

## Shared rules

Vendored under `harness/rules/` and imported for Claude Code (other agents read the same files).

@harness/rules/common/coding-style.md
@harness/rules/common/git-workflow.md
@harness/rules/common/testing.md
@harness/rules/common/security.md

## Test & verify

| Check | Command |
|-------|---------|
| Tests | `npm run test` |
| Coverage (≥95% gate) | `npm run test:coverage` |
| Lint | `npm run lint` |
| Typecheck | `npx tsc --noEmit` |
| Format | `eslint --fix .` |

Coverage rule: touched files ≥95% (statements/branches/functions/lines). Verify end-to-end — run the
affected flow, not just green tests.

## Harness & workflow

Full detail in [`harness/workflow.md`](harness/workflow.md). GitHub-issue flow:
`1 ticket → 2 spec → 3 spec-review → 4 execute-with-tests → 5 review-implementation → 6 open-pr → 7 qa-verify → 8 retrospective`.
Skills/agents/adapters live under `.claude/`, `.cursor/`, `.codex/`, `.opencode/`. MCP tooling
(context7, rtk, codebase-memory-mcp) is wired by `scripts/harness-setup.sh`.

**Cross-agent:** the same skills run in Claude Code, opencode, and Codex via symlinked `SKILL.md`.
See `harness/agents-integration.md`.

**Self-improvement:** the `retrospective` skill records lessons to `harness/memory/LEARNINGS.md`; the
SessionStart hook recalls them; durable ones are promoted into rules. See `harness/memory/README.md`.

## Guardrails

Small scoped diffs; never commit to `main` (branch + PR per issue); no secrets in code or logs;
verify end-to-end before claiming done; keep docs (AGENTS.md, OpenAPI, CHANGELOG, ADR) in sync.
