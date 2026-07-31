import re

with open('src/app/page.tsx', 'r') as f:
    content = f.read()

# HowItWorks Card backgrounds
content = content.replace("'rgba(14,17,28,.72)'", "'var(--fk-surface-1)'")
content = content.replace("'1px solid rgba(255,255,255,.07)'", "'1px solid var(--fk-line-soft)'")
content = content.replace("rgba(14,17,28,.72)", "var(--fk-surface-1)")
content = content.replace("rgba(8,92,240,.22)", "var(--fk-hero-orb-center)")

# SVG hardcoded fills and strokes
content = content.replace("rgba(22,24,34,0.96)", "var(--fk-surface-1)")
content = content.replace("rgba(16,18,26,0.97)", "var(--fk-surface-2)")
content = content.replace("rgba(12,20,36,0.9)", "var(--fk-surface-2)")

# SVG borders
content = content.replace("rgba(107,133,255,0.14)", "var(--fk-line)")
content = content.replace("rgba(107,133,255,0.13)", "var(--fk-line)")
content = content.replace("rgba(255,255,255,0.07)", "var(--fk-line-soft)")
content = content.replace("rgba(255,255,255,0.13)", "var(--fk-line)")
content = content.replace("rgba(255,255,255,0.08)", "var(--fk-line-soft)")
content = content.replace("rgba(255,255,255,0.06)", "var(--fk-line-soft)")
content = content.replace("rgba(255,255,255,0.05)", "var(--fk-line-soft)")
content = content.replace("rgba(255,255,255,0.04)", "var(--fk-line-soft)")

# Hero Typewriter subtitle (the white text you couldn't read)
content = content.replace("rgba(255,255,255,.7)", "var(--fk-text-mid)")
content = content.replace("rgba(255, 255, 255, 0.7)", "var(--fk-text-mid)")
content = content.replace("rgba(255,255,255,0.7)", "var(--fk-text-mid)")

with open('src/app/page.tsx', 'w') as f:
    f.write(content)

