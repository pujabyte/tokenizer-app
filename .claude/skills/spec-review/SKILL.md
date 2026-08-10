---
name: spec-review
description: Adversarially review a spec/plan against a ticket's acceptance criteria before implementation (step 3). Use after a spec is written and before coding, or when the user says "review the spec/plan". Produces PASS or a concrete feedback list that loops back to spec-writing.
---

# Spec Review (step 3)

Review the spec against the source issue. Try to make the plan fail before code does.

Check: **acceptance criteria** (each addressed + testable, mapped to a plan step); **dependencies**;
**scope** (nothing extra/missing); **ambiguity** (force one choice); **testability** (unit vs
integration/e2e stated; ≥95% feasible); **risk** (data loss, security, irreversible/migration steps).
Delegate: `architect` (design), `spec-miner` (missed requirements), `security-reviewer` (risk).

Output: **PASS** → step 4, or **CHANGES** (numbered) → loop to step 2. Never approve with unresolved
TBDs or unmapped acceptance criteria.
