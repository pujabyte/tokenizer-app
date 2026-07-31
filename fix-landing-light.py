import re

with open('src/app/page.tsx', 'r') as f:
    content = f.read()

# 1. Hero background orbs and grid
content = content.replace("rgba(8,92,240,.52) 0%, rgba(8,92,240,.24) 28%, rgba(8,92,240,.07) 54%", "var(--fk-hero-orb-center) 0%, var(--fk-hero-orb-mid) 28%, var(--fk-hero-orb-edge) 54%")
content = content.replace("rgba(43,188,180,.07)", "var(--fk-hero-cyan)")
content = content.replace("rgba(46,92,255,.07)", "var(--fk-hero-blue-left)")
content = content.replace("rgba(107,133,255,.07)", "var(--fk-hero-blue-right)")
content = content.replace("rgba(255,255,255,.03)", "var(--fk-grid-line)")

# 2. CTA Section
content = content.replace("rgba(255,255,255,.045)", "var(--fk-grid-line)")
content = content.replace("rgba(8,60,200,.55)", "var(--fk-cta-top)")
content = content.replace("rgba(6,30,100,.25)", "var(--fk-cta-mid)")
content = content.replace("rgba(0,0,0,.82)", "var(--fk-cta-vignette)")
content = content.replace("rgba(255,255,255,.42)", "var(--fk-text-mid)")
content = content.replace("rgba(255,255,255,.6)", "var(--fk-text-mid)")
content = content.replace("rgba(255,255,255,.05)", "var(--fk-btn-secondary-bg)")
content = content.replace("rgba(255,255,255,.09)", "var(--fk-btn-secondary-hover)")

# 3. Text colors inside components
content = content.replace("color: '#fff'", "color: 'var(--fk-text-hi)'")
content = content.replace("color: '#111827'", "color: 'var(--fk-text-hi)'")

with open('src/app/page.tsx', 'w') as f:
    f.write(content)

with open('src/app/globals.css', 'r') as f:
    css = f.read()

light_vars = """
  /* Light mode specific background overlays */
  --fk-hero-orb-center: rgba(8,92,240,.15);
  --fk-hero-orb-mid: rgba(8,92,240,.08);
  --fk-hero-orb-edge: rgba(8,92,240,.02);
  --fk-hero-cyan: rgba(43,188,180,.03);
  --fk-hero-blue-left: rgba(46,92,255,.03);
  --fk-hero-blue-right: rgba(107,133,255,.03);
  --fk-grid-line: rgba(0,0,0,.03);
  
  --fk-cta-top: rgba(8,60,200,.15);
  --fk-cta-mid: rgba(6,30,100,.05);
  --fk-cta-vignette: rgba(255,255,255,.82);
  --fk-btn-secondary-hover: rgba(0,0,0,.08);
"""
css = css.replace('--fk-nav-bg: rgba(255, 255, 255, .85);', '--fk-nav-bg: rgba(255, 255, 255, .85);\n' + light_vars)

dark_vars = """
  --fk-hero-orb-center: rgba(8,92,240,.52);
  --fk-hero-orb-mid: rgba(8,92,240,.24);
  --fk-hero-orb-edge: rgba(8,92,240,.07);
  --fk-hero-cyan: rgba(43,188,180,.07);
  --fk-hero-blue-left: rgba(46,92,255,.07);
  --fk-hero-blue-right: rgba(107,133,255,.07);
  --fk-grid-line: rgba(255,255,255,.03);
  
  --fk-cta-top: rgba(8,60,200,.55);
  --fk-cta-mid: rgba(6,30,100,.25);
  --fk-cta-vignette: rgba(0,0,0,.82);
  
  --fk-btn-secondary-bg: rgba(255,255,255,.05);
  --fk-btn-secondary-hover: rgba(255,255,255,.09);
"""
css = css.replace('--fk-nav-bg: rgba(10, 11, 16, .85);', '--fk-nav-bg: rgba(10, 11, 16, .85);\n' + dark_vars)

with open('src/app/globals.css', 'w') as f:
    f.write(css)

with open('src/components/ui/ConfigureTokenOrbitAnimation.tsx', 'r') as f:
    anim = f.read()

anim = anim.replace("rgba(22,24,34,0.96)", "var(--fk-surface-1)")
anim = anim.replace("rgba(34,36,47,1)", "var(--fk-surface-2)")
anim = anim.replace("rgba(255,255,255,0.06)", "var(--fk-line)")
anim = anim.replace("rgba(255,255,255,0.05)", "var(--fk-line)")
anim = anim.replace("color: '#fff'", "color: 'var(--fk-text-hi)'")

with open('src/components/ui/ConfigureTokenOrbitAnimation.tsx', 'w') as f:
    f.write(anim)

