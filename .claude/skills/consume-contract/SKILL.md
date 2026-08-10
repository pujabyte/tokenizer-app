---
name: consume-contract
description: Consume/sync the backend's API contract into the frontend so both build in parallel. Use when the backend publishes/changes a contract, when you need generated types for an endpoint, or when the user says "consume the contract", "generate API types", "sync with backend API".
---

# Consume Contract (frontend side)

The backend owns the contract (its OpenAPI); the frontend consumes it. See `harness/workflow.md`.

1. **Fetch** the contract slice: from the linked contract issue, the backend repo's
   `docs/contracts/<feature>.openapi.json`, or a running backend's doc endpoint. Optionally copy it into
   this repo's `docs/contracts/`.
2. **Generate types:** `bunx openapi-typescript docs/contracts/<feature>.openapi.json -o src/types/api-generated.ts`
   (add `openapi-typescript` as a dev dep on first use).
3. **Reconcile** with hand-written types and the API layer; keep any snake_case↔camelCase boundary.
4. **Diff for breaking changes** (removed/renamed/newly-required fields); update affected components.
5. **Verify:** typecheck, tests, lint. Comment the outcome on the contract issue.

Don't hand-edit generated files — regenerate on contract change.
