const fs = require('fs');
let content = fs.readFileSync('src/app/page.tsx', 'utf8');

// Navbar background
content = content.replace(/'rgba\(10,11,16,\.85\)'/g, "'var(--fk-nav-bg)'");

// Navbar hover color
content = content.replace(/e\.currentTarget\.style\.color = '#fff'/g, "e.currentTarget.style.color = 'var(--fk-text-hi)'");

// Hero section hardcoded backgrounds
content = content.replace(/background: '#0A0B10'/g, "background: 'var(--fk-bg)'");
content = content.replace(/background: '#1E2028'/g, "background: 'var(--fk-surface-1)'");
content = content.replace(/background: '#2B2D3A'/g, "background: 'var(--fk-surface-2)'");
content = content.replace(/background: 'rgba\(255,255,255,\.0[2345]\)'/g, "background: 'var(--glass-bg)'");

// How It Works cards
content = content.replace(/backgroundColor: '#1E2028'/g, "backgroundColor: 'var(--fk-surface-1)'");
content = content.replace(/backgroundColor: '#2B2D3A'/g, "backgroundColor: 'var(--fk-surface-2)'");
content = content.replace(/background: 'linear-gradient\(90deg, #1E2028 0%, #2B2D3A 100%\)'/g, "background: 'linear-gradient(90deg, var(--fk-surface-1) 0%, var(--fk-surface-2) 100%)'");
content = content.replace(/background: 'linear-gradient\(180deg, rgba\(255,255,255,\.05\) 0%, transparent 100%\)'/g, "background: 'linear-gradient(180deg, var(--glass-bg) 0%, transparent 100%)'");

// Any remaining `#fff`?
content = content.replace(/color: '#fff'/g, "color: 'var(--fk-text-hi)'");
content = content.replace(/color: "#fff"/g, "color: 'var(--fk-text-hi)'");

fs.writeFileSync('src/app/page.tsx', content, 'utf8');
console.log("Fixed more colors.");
