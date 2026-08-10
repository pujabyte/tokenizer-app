---
name: retrospective
description: Capture lessons and improve the harness after finishing a task/PR (step 8 — self-improvement). Use at the end of the dev workflow, after a bug is fixed, when a mistake or better approach was discovered, or when the user says "retro", "capture learnings", "what did we learn", "self-improve". Writes to harness/memory/LEARNINGS.md and promotes stable lessons into rules.
---

# Retrospective (step 8 — self-learn & improve)

Turn what happened into durable improvement so agents don't repeat mistakes. See `harness/memory/README.md`.

1. **Reflect:** what went wrong / took too long? what worked and should be default? what non-obvious
   fact did we learn (gotcha, version pin, env quirk, API behavior)? did a durable convention emerge?
2. **Capture** — append to `harness/memory/LEARNINGS.md` (newest first):
   `### <type> · YYYY-MM-DD · <one-line lesson>` + 1–3 sentences + `**Trigger:**` + `**Apply:**`.
   type ∈ mistake·pattern·gotcha·decision·tooling. One lesson per entry; no secrets/PII; don't duplicate.
3. **Promote** — if a lesson recurs (≥2×) or is a durable rule, move it into `harness/rules/<area>.md`,
   `AGENTS.md` (or `DESIGN.md`), and mark the ledger entry `PROMOTED → <path>`.
4. **Recall check** — ensure it's in the ledger (SessionStart surfaces it) or promoted into a rule.

Signal over volume; prefer promoting to rules over a growing ledger. Cheap step — run it even for small fixes.
