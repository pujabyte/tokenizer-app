#!/usr/bin/env bash
# SessionStart hook: surface the branch, the workflow map, and recent learnings (recall).
set -euo pipefail
branch="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo unknown)"
root="$(git rev-parse --show-toplevel 2>/dev/null || echo .)"
cat <<TXT
Harness active — branch: ${branch}
Workflow (harness/workflow.md): 1 ticket → 2 spec → 3 spec-review → 4 execute-with-tests →
  5 review-implementation → 6 open-pr → 7 qa-verify → 8 retrospective
Coverage gate: >=95% on touched files. Never commit to main. Roles: harness/roles/README.md.
TXT
learn="${root}/harness/memory/LEARNINGS.md"
if [ -f "$learn" ]; then
  echo "Recent learnings (run the 'retrospective' skill to add):"
  grep -E '^### ' "$learn" | head -3 | sed 's/^### /  • /'
fi
exit 0
