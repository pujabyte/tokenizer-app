const fs = require('fs');

let content = fs.readFileSync('src/app/page.tsx', 'utf8');

// The `f` icon in the Sandbox card that has a blue gradient background MUST keep its white text.
// We'll temporarily shield it.
const shieldToken = 'COLOR_WHITE_SHIELDED';
content = content.replace("color: '#fff', flexShrink: 0", `color: '${shieldToken}', flexShrink: 0`);

// Replace remaining hardcoded colors
content = content.replace(/color: '#fff'/g, "color: 'var(--fk-text-hi)'");
content = content.replace(/color: 'rgba\(255,255,255,\.[678]\)'/g, "color: 'var(--fk-text-mid)'");
content = content.replace(/color: 'rgba\(255,255,255,\.[345]\)'/g, "color: 'var(--fk-text-low)'");

// Unshield
content = content.replace(`color: '${shieldToken}'`, "color: '#fff'");

// Replace backgrounds
content = content.replace(/backgroundColor: 'rgba\(10,11,16,\.85\)'/g, "backgroundColor: 'var(--fk-nav-bg)'");
content = content.replace(/background: 'rgba\(10,11,16,\.85\)'/g, "background: 'var(--fk-nav-bg)'");
content = content.replace(/background: 'linear-gradient\(0deg, #0A0B10 0%, transparent 100%\)'/g, "background: 'linear-gradient(0deg, var(--fk-bg) 0%, transparent 100%)'");
content = content.replace(/backgroundColor: '#0A0B10'/g, "backgroundColor: 'var(--fk-bg)'");

// Borders
content = content.replace(/1px solid rgba\(255,255,255,\.0[56]\)/g, "1px solid var(--fk-line)");
content = content.replace(/border: '1px solid rgba\(255,255,255,\.2\)'/g, "border: '1px solid var(--glass-border)'");

fs.writeFileSync('src/app/page.tsx', content, 'utf8');
console.log("Landing page fixed!");
