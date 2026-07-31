import os

files_to_fix = [
    'src/app/investor/onboarding/page.tsx',
    'src/app/investor/onboarding/personal/page.tsx',
    'src/app/investor/onboarding/institutional/page.tsx',
    'src/app/investor/onboarding/pending/page.tsx'
]

for filepath in files_to_fix:
    if not os.path.exists(filepath):
        continue
    with open(filepath, 'r') as f:
        content = f.read()

    # Generic text colors
    content = content.replace("color: '#fff'", "color: 'var(--fk-text-hi)'")
    
    # Input field styles
    content = content.replace("background: 'rgba(255,255,255,.03)'", "background: 'var(--fk-surface-2)'")
    content = content.replace("border: '1px solid rgba(255,255,255,.1)'", "border: '1px solid var(--fk-line)'")
    
    # Drag and drop box
    content = content.replace("border: '1px dashed rgba(255,255,255,.2)'", "border: '1px dashed var(--fk-line)'")
    content = content.replace("background: 'rgba(255,255,255,.01)'", "background: 'var(--glass-bg)'")
    
    # Hover states on cards
    content = content.replace("e.currentTarget.style.background = 'rgba(255,255,255,.03)'", "e.currentTarget.style.background = 'var(--fk-surface-2)'")
    
    # Button texts that should remain white?
    # Institutional submit button has `background: '#A78BFA', color: '#000'` (black text is fine, but maybe let's fix color: '#fff' if it got replaced)
    
    with open(filepath, 'w') as f:
        f.write(content)

