---
name: execute-with-tests
description: Implement an approved plan test-first with the ≥95% coverage gate (step 4). Use after a spec/plan is approved and it's time to write code, or when the user says "implement this", "execute the plan", "build it with tests".
---

# Execute with Tests (step 4)

Implement the approved plan using TDD. Follow the nearest `AGENTS.md` and `harness/rules/`.

1. Drive RED → GREEN → REFACTOR with the `tdd-guide` agent.
2. Test scope from the change: **unit** always; **integration/e2e** when a boundary (API, route, queue,
   contract, UI flow) changes. Mirror tests to the source path.
3. Implement in small, scoped increments. Reuse existing patterns; no new singletons/abstractions for one call site.
4. **Gate before done** — run the project's coverage, lint, and typecheck commands (AGENTS.md §Test &
   verify); touched files ≥95%. Use a build-resolver agent for build/type errors, `loop-operator` to iterate.

Rules: never lower the coverage threshold — add real tests. No secrets/PII in code or logs. Stop and
get explicit go-ahead before any migration/irreversible action. On completion → step 5.
