# Agent Role Catalog (agent-neutral)

Full definitions live as Claude subagents in [`.claude/agents/`](../../.claude/agents/) — plain
markdown, so Cursor/Codex/opencode/Antigravity read them too. This is the index: role → when → step.
Only the agents relevant to this project's profile are installed.

| Role | Use when | Step |
|------|----------|------|
| `architect` | System/architecture design, boundaries, trade-offs | 2 |
| `planner` | Turn an approved spec into an ordered plan | 2–3 |
| `spec-miner` | Extract requirements/edge-cases from an issue | 2–3 |
| `tdd-guide` | Drive test-first implementation | 4 |
| `build-error-resolver` / `*-build-resolver` | Fix build/type errors | 4 |
| `loop-operator` | Iterate implement→test→fix until criteria met | 4–5 |
| `code-reviewer` | General correctness/quality review | 5 |
| `<lang>-reviewer` | Language-specific review (typescript/go/python/rust/react) | 5 |
| `security-reviewer` | Authz, injection, secrets, error leakage | 5 |
| `database-reviewer` | Schema/migrations/queries (backend) | 5 |
| `a11y-architect` | Accessibility (frontend) | 5 |
| `web3-auditor` / `solana-anchor-reviewer` | Smart-contract security audit (web3) | 5 |
| `code-simplifier` | Reduce complexity / dead flexibility | 5 |
| `silent-failure-hunter` | Swallowed errors, missing guards/states | 5 |
| `e2e-runner` | End-to-end verification | 7 |
| `doc-updater` | Sync AGENTS.md / OpenAPI / CHANGELOG / DESIGN.md | 6–7 |

See [`../workflow.md`](../workflow.md) for how roles map onto the steps.
