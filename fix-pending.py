import re
filepath = 'src/app/investor/onboarding/pending/page.tsx'
with open(filepath, 'r') as f:
    content = f.read()

content = content.replace("rgba(255,255,255,.1)", "var(--fk-line)")
content = content.replace("rgba(255,255,255,.05)", "var(--fk-line-soft)")

with open(filepath, 'w') as f:
    f.write(content)
