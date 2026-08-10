---
name: design-check
description: Review a UI change for conformance to DESIGN.md and craft quality. Use when building or reviewing any UI, when the user says "check the design", "does this match the design system", "polish this UI", or before merging visual work. Wraps the impeccable + stitch skills against this repo's design system.
---

# Design Check

Verify a UI change looks right and stays on the design system. Complements `review-implementation`.

1. Load `DESIGN.md`. Confirm semantic tokens only (no hardcoded hex), consistent spacing grid, radius
   scale, and the design system's typography. Reuse existing UI primitives; `cn()`/variant APIs.
2. Invoke the **impeccable** skill for craft: hierarchy, alignment, spacing rhythm, states
   (hover/focus/active/disabled/loading/empty/error), motion, UX copy.
3. For generating/restyling screens on the design system, use the **stitch-*** skills; the `higgsfield`
   MCP (optional) only when new image assets are genuinely needed.
4. Verify in-browser: responsive, light/dark, `prefers-reduced-motion`, keyboard focus.
5. Accessibility pass (or `a11y-architect`): contrast AA, semantics, ARIA, focus order.

Output: design-system violations (with the token to use instead), craft issues, a11y gaps — each with a fix.
