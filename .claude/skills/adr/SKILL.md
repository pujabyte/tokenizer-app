---
name: adr
description: Write or update an Architecture Decision Record in docs/adr/. Use when a significant/architectural decision is made, when a ticket's Implementation Approach refers to an ADR/RFC, or when the user says "write an ADR", "record this decision".
---

# ADR

Record a significant decision (architecture, boundaries, data model, dependency, design-system change)
under `docs/adr/`.

1. Next number: highest `NNNN` in `docs/adr/` + 1 (4 digits).
2. Create `docs/adr/NNNN-<kebab-title>.md`:
   `# NNNN. Title` · **Status** (Proposed|Accepted|Superseded) · **Date** · **Related** (issue/RFC/contract) ·
   `## Context` · `## Decision` · `## Consequences` · `## Alternatives considered`.
3. Link the ADR from the related issue and the spec.
4. Note behavior-affecting decisions in `CHANGELOG.md`.

Keep ADRs short and immutable once Accepted — supersede rather than rewrite.
