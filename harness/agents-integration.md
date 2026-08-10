# Cross-Agent Integration

This harness is **not Claude-only**. It's built on files every major coding agent reads, with thin
per-agent adapters.

## Shared core (all agents)
- **`AGENTS.md`** (canonical; `CLAUDE.md` symlinks to it) — the entry point, plus nearest layer-scoped `AGENTS.md`.
- **`harness/`** — agent-neutral markdown: `workflow.md`, `rules/`, `roles/`, `memory/LEARNINGS.md`.
- **`.claude/skills/<name>/SKILL.md`** — portable SKILL.md skills, shared to other agents via symlinks.

## Per-agent
| Agent | Reads | Skills | MCP |
|-------|-------|--------|-----|
| **Claude Code** | `CLAUDE.md`, `.claude/` | `.claude/skills/` | `.mcp.json` |
| **Cursor** | `AGENTS.md`, `.cursor/rules/*.mdc` | via `harness/workflow.md` | `.cursor/mcp.json` |
| **Codex** | `AGENTS.md` (<32 KiB), `.codex/` | `.codex/skills/` → `.claude/skills` | `.codex/config.toml` |
| **opencode** | `AGENTS.md`, `opencode.json` | `.opencode/skills/` → `.claude/skills` (also reads `.claude/skills/`) | `opencode.json` |
| **Antigravity** | `AGENTS.md` | via `harness/` | via `codebase-memory-mcp install` |

The same `SKILL.md` files power Claude Code, opencode, and Codex (identical format).
`codebase-memory-mcp install` (in `scripts/harness-setup.sh`) auto-configures every detected agent.
