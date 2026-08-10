#!/usr/bin/env bash
# PostToolUse hook: format a just-edited source file with the project formatter. Never blocks.
# The formatter command was set by harness-kit at install time.
set -euo pipefail

input="$(cat)"
file="$(printf '%s' "$input" | grep -oE '"file_path"[[:space:]]*:[[:space:]]*"[^"]+"' | head -1 \
  | sed -E 's/.*"file_path"[[:space:]]*:[[:space:]]*"([^"]+)".*/\1/')"
[ -f "$file" ] || exit 0

# Only format known source extensions.
case "$file" in
  *.ts|*.tsx|*.js|*.jsx|*.mjs|*.cjs|*.go|*.rs|*.py|*.sol) ;;
  *) exit 0 ;;
esac

# eslint --fix . formats the whole project; scope to the file where the tool supports it.
case "eslint --fix ." in
  biome*)   bunx biome check --write "$file" >/dev/null 2>&1 || npx biome check --write "$file" >/dev/null 2>&1 || true ;;
  eslint*)  bunx eslint --fix "$file"        >/dev/null 2>&1 || npx eslint --fix "$file"        >/dev/null 2>&1 || true ;;
  prettier*) bunx prettier --write "$file"   >/dev/null 2>&1 || npx prettier --write "$file"    >/dev/null 2>&1 || true ;;
  gofmt*)   gofmt -w "$file" >/dev/null 2>&1 || true ;;
  "cargo fmt"*) cargo fmt >/dev/null 2>&1 || true ;;
  "ruff format"*) ruff format "$file" >/dev/null 2>&1 || true ;;
  "forge fmt"*) forge fmt "$file" >/dev/null 2>&1 || true ;;
  *) : ;;
esac
exit 0
