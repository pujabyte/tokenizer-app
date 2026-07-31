import re
with open('src/app/investor/dashboard/token/[id]/page.tsx', 'r') as f:
    content = f.read()

# Replace general white text colors
content = content.replace("color: '#fff'", "color: 'var(--fk-text-hi)'")
content = content.replace('color: "#fff"', 'color: "var(--fk-text-hi)"')

# Specific rgba whites for text
content = content.replace("color: 'rgba(255,255,255,.9)'", "color: 'var(--fk-text-hi)'")
content = content.replace("color: 'rgba(255,255,255,.8)'", "color: 'var(--fk-text-hi)'")
content = content.replace("color: 'rgba(255,255,255,.7)'", "color: 'var(--fk-text-mid)'")
content = content.replace("color: 'rgba(255,255,255,.6)'", "color: 'var(--fk-text-mid)'")
content = content.replace("color: 'rgba(255,255,255,.5)'", "color: 'var(--fk-text-low)'")
content = content.replace("color: 'rgba(255,255,255,.4)'", "color: 'var(--fk-text-low)'")
content = content.replace("color: 'rgba(255,255,255,.3)'", "color: 'var(--fk-text-low)'")
content = content.replace("color: 'rgba(255,255,255,0.7)'", "color: 'var(--fk-text-mid)'")
content = content.replace("color: 'rgba(255,255,255,0.5)'", "color: 'var(--fk-text-low)'")

# Specific rgba whites for borders
content = content.replace("border: '1px solid rgba(255,255,255,.1)'", "border: '1px solid var(--fk-line)'")
content = content.replace("borderBottom: '1px dashed rgba(255,255,255,.1)'", "borderBottom: '1px dashed var(--fk-line)'")
content = content.replace("border: '1px solid rgba(255,255,255,.05)'", "border: '1px solid var(--fk-line-soft)'")
content = content.replace("borderBottom: '1px solid rgba(255,255,255,.1)'", "borderBottom: '1px solid var(--fk-line)'")

# Specific backgrounds
content = content.replace("background: 'rgba(255,255,255,.03)'", "background: 'var(--fk-surface-2)'")
content = content.replace("backgroundColor: 'rgba(255,255,255,.03)'", "backgroundColor: 'var(--fk-surface-2)'")
content = content.replace("background: 'rgba(255,255,255,.02)'", "background: 'var(--fk-surface-2)'")
content = content.replace("backgroundColor: 'rgba(255,255,255,.05)'", "backgroundColor: 'var(--fk-surface-2)'")
content = content.replace("background: 'rgba(255,255,255,.1)'", "background: 'var(--fk-line)'")

with open('src/app/investor/dashboard/token/[id]/page.tsx', 'w') as f:
    f.write(content)
