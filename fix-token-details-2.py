import re

with open('src/app/investor/dashboard/token/[id]/page.tsx', 'r') as f:
    content = f.read()

# Replace any remaining rgba(255,255,255, x) for backgrounds to var(--fk-surface-2) or var(--fk-line)
content = re.sub(r"background:\s*'rgba\(255,255,255,0\.0[0-9]+\)'", "background: 'var(--fk-surface-2)'", content)
content = re.sub(r"background:\s*'rgba\(255,255,255,0\.[1-9]+\)'", "background: 'var(--fk-surface-2)'", content)

content = re.sub(r"backgroundColor:\s*'rgba\(255,255,255,0\.0[0-9]+\)'", "backgroundColor: 'var(--fk-surface-2)'", content)
content = re.sub(r"backgroundColor:\s*'rgba\(255,255,255,0\.[1-9]+\)'", "backgroundColor: 'var(--fk-surface-2)'", content)

# Replace borders
content = re.sub(r"border:\s*'1px solid rgba\(255,255,255,0\.[0-9]+\)'", "border: '1px solid var(--fk-line)'", content)
content = re.sub(r"borderBottom:\s*'1px solid rgba\(255,255,255,0\.[0-9]+\)'", "borderBottom: '1px solid var(--fk-line)'", content)

# Black backgrounds
content = content.replace("background: 'rgba(0,0,0,0.2)'", "background: 'var(--fk-surface-2)'")
content = content.replace("background: 'rgba(0,0,0,0.4)'", "background: 'var(--fk-surface-2)'")
content = content.replace("background: 'rgba(0,0,0,.8)'", "background: 'var(--glass-bg)'") # overlays

# Hardcoded white colors for text
content = content.replace("color: '#ffffff'", "color: 'var(--fk-text-hi)'")
content = content.replace("color: 'white'", "color: 'var(--fk-text-hi)'")

with open('src/app/investor/dashboard/token/[id]/page.tsx', 'w') as f:
    f.write(content)
