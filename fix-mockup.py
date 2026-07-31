import re

with open('src/app/page.tsx', 'r') as f:
    content = f.read()

# Primary buttons text color (should always be white)
# I mistakenly replaced `#fff` with `var(--fk-text-hi)` inside primary buttons earlier, let's fix it by looking for common primary button text patterns.
content = content.replace("color: 'var(--fk-text-hi)', textDecoration: 'none'", "color: '#fff', textDecoration: 'none'")
content = content.replace("color: 'var(--fk-text-hi)', display: 'block'", "color: '#fff', display: 'block'")
content = content.replace("color: 'var(--fk-text-hi)' }}>Launch App", "color: '#fff' }}>Launch App")
content = content.replace("color: 'var(--fk-text-hi)' }}>Invest in Assets", "color: '#fff' }}>Invest in Assets")
content = content.replace("color: 'var(--fk-text-hi)' }}>Start tokenizing", "color: '#fff' }}>Start tokenizing")

# Dashboard Mockup
# Chrome
content = content.replace("backgroundColor: '#0D0F1A'", "backgroundColor: 'var(--fk-surface-1)'")
content = content.replace("rgba(255,255,255,.06)", "var(--glass-bg)")
content = content.replace("rgba(255,255,255,.22)", "var(--fk-text-low)")
# App Body
content = content.replace("backgroundColor: '#09090F'", "backgroundColor: 'var(--fk-bg)'")
content = content.replace("backgroundColor: '#0B0C16'", "backgroundColor: 'var(--fk-surface-1)'")
# Texts and borders in mockup
content = content.replace("rgba(255,255,255,.82)", "var(--fk-text-hi)")
content = content.replace("rgba(255,255,255,.28)", "var(--fk-text-mid)")
content = content.replace("rgba(255,255,255,.12)", "var(--fk-line)")
content = content.replace("rgba(255,255,255,.18)", "var(--fk-line)")
content = content.replace("rgba(255,255,255,.08)", "var(--fk-line-soft)")
content = content.replace("rgba(255,255,255,.04)", "var(--fk-line-soft)")
content = content.replace("rgba(255,255,255,.1)", "var(--fk-line)")
content = content.replace("rgba(255,255,255,.03)", "var(--fk-line-soft)")
content = content.replace("rgba(255,255,255,.2)", "var(--fk-text-low)")
content = content.replace("rgba(255,255,255,.15)", "var(--fk-line)")
content = content.replace("rgba(255,255,255,.16)", "var(--fk-line)")
content = content.replace("rgba(255,255,255,.05)", "var(--fk-line-soft)")

# DAO Proposal Mockup
content = content.replace("backgroundColor: '#2B2D3A'", "backgroundColor: 'var(--fk-surface-2)'")
content = content.replace("rgba(255,255,255,.55)", "var(--fk-text-low)")
content = content.replace("rgba(255,255,255,.85)", "var(--fk-text-hi)")
content = content.replace("rgba(255,255,255,.45)", "var(--fk-text-mid)")

# Token Card Mockup
content = content.replace("backgroundColor: '#1E2028'", "backgroundColor: 'var(--fk-surface-1)'")
content = content.replace("rgba(255,255,255,.4)", "var(--fk-text-low)")
content = content.replace("rgba(255,255,255,.9)", "var(--fk-text-hi)")
content = content.replace("rgba(255,255,255,.65)", "var(--fk-text-mid)")
content = content.replace("rgba(255,255,255,.14)", "var(--fk-line)")
content = content.replace("rgba(255,255,255,.5)", "var(--fk-text-mid)")

# Dashboard Mockup Lines
content = content.replace("rgba(255,255,255,0.06)", "var(--fk-line-soft)")

# Primary button text - if I missed them
content = content.replace("color: 'var(--fk-text-hi)', textDecoration: 'none',", "color: '#fff', textDecoration: 'none',")

# Let's fix the specific Invest in Assets primary CTA
content = content.replace("span style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, letterSpacing: '-.01em' }}>Invest in Assets", "span style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, letterSpacing: '-.01em', color: '#fff' }}>Invest in Assets")
content = content.replace("Launch App <ArrowRight size={13} />", "<span style={{color:'#fff'}}>Launch App</span> <ArrowRight size={13} color=\"#fff\" />")
content = content.replace("Start tokenizing <ArrowRight size={14} />", "<span style={{color:'#fff'}}>Start tokenizing</span> <ArrowRight size={14} color=\"#fff\" />")

with open('src/app/page.tsx', 'w') as f:
    f.write(content)

