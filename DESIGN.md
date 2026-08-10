# DESIGN.md — tokenizer-app

Brand + style guideline. **Mandatory reading before any UI work.** Single source of truth for the
visual language. Use semantic design tokens — never hardcode hex, never invent colors.

_This file was scaffolded by harness-kit. Fill it in from your design system (tokens, theme config).
For an existing codebase, the `extract-design-md` / `taste-design` stitch skills can generate it from
your tokens._

## Brand
- **Personality:** <describe the brand mood/voice>
- **Logo / usage:** <rules>

## Color
Use semantic tokens (e.g. Tailwind `bg-background`, `text-foreground`, `bg-primary`,
`text-muted-foreground`, `border-border`). List each token, its value, and its use. Include status
(success/warning/info/destructive) and chart colors. Maintain WCAG AA contrast.

## Typography
- **Font family:** <primary>, fallbacks. Mono for code.
- **Scale:** headings/body sizes and weights; readable line length.

## Spacing, radius, layout
- Spacing on a consistent grid (e.g. 4px). No magic values.
- Radius scale (`rounded-*`). Responsive-first (mobile → desktop).

## Components
- Primitives location (e.g. `src/components/ui/`). **Reuse before building.** Variants via a
  variant API; compose classes with a `cn()`-style helper.

## Motion
- Subtle, purposeful; respect `prefers-reduced-motion`.

## Accessibility (non-negotiable)
- Semantic HTML; keyboard reachable; visible focus; labels/ARIA; contrast AA; color never the only signal.

## Rules of thumb
1. Semantic token first, brand var second, raw hex never.
2. Reuse a primitive before writing CSS.
3. Consistent spacing grid + radius scale — no magic numbers.
4. Server Component by default (if applicable); minimal client boundaries.
5. For craft, use the `impeccable` skill; for screens on the design system, the `stitch-*` skills.
