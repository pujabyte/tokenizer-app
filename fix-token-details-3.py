import re

with open('src/app/investor/dashboard/token/[id]/page.tsx', 'r') as f:
    content = f.read()

# Replace any remaining hover rgba effects
content = re.sub(r"style\.background\s*=\s*'rgba\(255,255,255,0\.[0-9]+\)'", "style.background = 'var(--fk-surface-hover, var(--fk-surface-3))'", content)
content = re.sub(r"style\.background\s*=\s*'rgba\(255,255,255,\.0[0-9]+\)'", "style.background = 'var(--fk-surface-hover, var(--fk-surface-3))'", content)

# Fix rgba(255,255,255, ...) gradients
content = re.sub(r"linear-gradient\(.*rgba\(255,255,255,.*\).*rgba\(255,255,255,.*\).*\)", "var(--fk-surface-2)", content)

# Fix remaining rgbas
content = re.sub(r"rgba\(255,255,255,\.[0-9]+\)", "var(--fk-line)", content)
content = re.sub(r"rgba\(255,255,255,0\.[0-9]+\)", "var(--fk-line)", content)
content = re.sub(r"rgba\(0,0,0,0\.[0-9]+\)", "var(--fk-surface-2)", content)

with open('src/app/investor/dashboard/token/[id]/page.tsx', 'w') as f:
    f.write(content)
