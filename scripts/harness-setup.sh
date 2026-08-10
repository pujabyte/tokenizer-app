#!/usr/bin/env bash
#
# harness-setup.sh — one-time, per-machine setup for the multi-agent harness MCP servers + plugins.
# Scaffolded by harness-kit. Idempotent and non-fatal. Flags: --skip-plugins --skip-mcp
#
set -uo pipefail
SKIP_PLUGINS=0; SKIP_MCP=0
for a in "$@"; do case "$a" in --skip-plugins) SKIP_PLUGINS=1;; --skip-mcp) SKIP_MCP=1;; esac; done

log(){ printf '\033[1;34m[harness]\033[0m %s\n' "$*"; }
ok(){  printf '\033[1;32m[ok]\033[0m %s\n' "$*"; }
warn(){ printf '\033[1;33m[warn]\033[0m %s\n' "$*"; }
has(){ command -v "$1" >/dev/null 2>&1; }

log "Project: tokenizer-app  ·  focus: frontend  ·  stack: typescript / npm"

# --- CLI tools ---
has jq || { log "installing jq..."; (has brew && brew install jq) || (has apt-get && sudo apt-get install -y jq) || warn "install jq manually"; }
if has cargo; then
  has rtk     || cargo install --git https://github.com/rtk-ai/rtk || warn "rtk install failed"
  has rtk-mcp || cargo install --git https://github.com/ousamabenyounes/rtk-mcp || warn "rtk-mcp install failed — set RTK_MCP_BIN"
else warn "cargo missing — install Rust for the rtk token tool (optional)."; fi

# --- Claude Code plugins (Claude-specific; other agents use AGENTS.md + MCP) ---
if [ "$SKIP_PLUGINS" != 1 ] && has claude; then
  add(){ claude plugin marketplace add "$2" >/dev/null 2>&1 && ok "marketplace $1" || log "marketplace $1 present"; }
  add "claude-plugins-official" "anthropics/claude-plugins-official"
  add "superpowers-marketplace" "obra/superpowers-marketplace"
  add "ponytail"                "DietrichGebert/ponytail"
  add "ecc"                     "affaan-m/ECC"
  for p in superpowers@superpowers-marketplace ponytail@ponytail context7@claude-plugins-official code-review@claude-plugins-official ecc@ecc; do
    claude plugin install "$p" >/dev/null 2>&1 && ok "installed $p" || warn "check: claude plugin list ($p)"
  done
else [ "$SKIP_PLUGINS" = 1 ] && warn "skipped plugins" || warn "claude CLI missing — skipped plugins"; fi

# --- MCP servers (all agents) ---
if [ "$SKIP_MCP" != 1 ]; then
  if has codebase-memory-mcp; then ok "codebase-memory-mcp present"
  elif has npm; then log "installing codebase-memory-mcp..."; npm install -g codebase-memory-mcp || warn "install failed"; fi
  has codebase-memory-mcp && { log "configuring codebase-memory-mcp for all agents..."; codebase-memory-mcp install || warn "run 'codebase-memory-mcp install' manually"; }
  [ -z "${CONTEXT7_API_KEY:-}" ] && warn "export CONTEXT7_API_KEY so context7 can authenticate"
  ok "context7 + rtk declared in .mcp.json / .cursor/mcp.json / .codex/config.toml / opencode.json"
fi

cat <<EOF

$(ok "Setup complete.") Follow-ups:
  1. export CONTEXT7_API_KEY=...      2. ensure ~/.cargo/bin on PATH (rtk-mcp) or set RTK_MCP_BIN
  3. restart your agent, then: claude mcp list && claude plugin list
Cross-agent + self-improvement: see harness/agents-integration.md and harness/memory/README.md.
EOF
