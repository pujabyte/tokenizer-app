import re

with open('src/app/page.tsx', 'r') as f:
    content = f.read()

# Floating pills in Hero (BNB Chain, DAO Proposal)
content = content.replace("rgba(12,15,26,.82)", "var(--fk-surface-2)")
content = content.replace("rgba(255,255,255,.11)", "var(--fk-line-soft)")
content = content.replace("rgba(255,255,255,.32)", "var(--fk-text-mid)")
content = content.replace("rgba(255,255,255,.38)", "var(--fk-text-low)")
content = content.replace("rgba(255,255,255,.48)", "var(--fk-text-mid)")

# AssetCategories section
content = content.replace("rgba(255,255,255,.015)", "var(--glass-bg)")

# AssetCategories mockups
content = content.replace("rgba(255,255,255,.72)", "var(--fk-text-hi)")
content = content.replace("rgba(255,255,255,.13)", "var(--fk-line-soft)")
content = content.replace("rgba(255,255,255,.25)", "var(--fk-text-low)")

# How it Works
content = content.replace("rgba(255,255,255,0.42)", "var(--fk-text-mid)")
content = content.replace("rgba(255,255,255,0.72)", "var(--fk-text-hi)")
content = content.replace("rgba(255,255,255,0.2)", "var(--fk-line)")
content = content.replace("rgba(255,255,255,0.36)", "var(--fk-text-low)")

# CTA Frakta logo SVG and How it Works SVG
content = content.replace("rgba(255,255,255,0.92)", "var(--fk-text-hi)")
content = content.replace("rgba(255,255,255,0.7)", "var(--fk-text-mid)")
content = content.replace("rgba(255,255,255,.92)", "var(--fk-text-hi)")
content = content.replace("rgba(255,255,255,.65)", "var(--fk-text-mid)")
content = content.replace("rgba(255,255,255,0.65)", "var(--fk-text-mid)")
content = content.replace("rgba(255,255,255,.6)", "var(--fk-text-mid)")
content = content.replace("rgba(0,0,0,0.2)", "var(--fk-surface-1)")
content = content.replace("rgba(255,255,255,0.5)", "var(--fk-line)")
content = content.replace("rgba(255,255,255,0.75)", "var(--fk-text-low)")

with open('src/app/page.tsx', 'w') as f:
    f.write(content)

