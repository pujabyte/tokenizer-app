# Harness Memory — Self-Improvement Loop

Agent-neutral, committed memory so agents get **better over time**. Every agent reads these files.

```
CAPTURE ──► STORE ──► RECALL ──► PROMOTE ──► (durable rules)
retrospective  LEARNINGS.md  SessionStart   graduate stable
   skill                     hook + AGENTS   lessons into rules
```

1. **Capture** — at task/PR end (workflow step 8) run the `retrospective` skill.
2. **Store** — entries append to `LEARNINGS.md` (dated, tagged, with Trigger + Apply).
3. **Recall** — the SessionStart hook surfaces recent learnings; `AGENTS.md`/`opencode.json` reference the ledger.
4. **Promote** — recurring/durable lessons graduate into `harness/rules/`, `AGENTS.md` (or `DESIGN.md`).

One concrete lesson per entry, no secrets/PII, prune/mark PROMOTED once it lives in a rule.
