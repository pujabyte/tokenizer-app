import React from 'react';

interface TokenLogoProps {
  logo?: string;
  symbol: string;
  isGain?: boolean;
  size?: number;
}

export function TokenLogo({ logo, symbol, isGain = true, size = 44 }: TokenLogoProps) {
  // If there's a logo, we render it with a solid white background (or a slightly off-white) so it always looks clean.
  // If no logo, we render the first 2-3 characters of the symbol on a colored background.

  // We use #FFFFFF as a pure solid background for the image to prevent dark-mode blending issues.
  const padding = Math.max(4, Math.floor(size * 0.15)); // Proportional padding
  
  if (logo) {
    return (
      <div 
        style={{ 
          width: size, 
          height: size, 
          borderRadius: '50%', 
          background: 'transparent', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          overflow: 'hidden',
          flexShrink: 0
        }}
      >
        <img 
          src={logo} 
          alt={symbol} 
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'contain'
          }} 
        />
      </div>
    );
  }

  // Fallback if no logo
  const initials = symbol.length > 3 ? symbol.substring(0, 2) : symbol.substring(0, 3);
  const fallbackBg = isGain ? 'var(--fk-blue-bright)' : 'var(--fk-surface-3)';

  return (
    <div 
      className="fk-mono" 
      style={{ 
        width: size, 
        height: size, 
        borderRadius: '50%', 
        background: fallbackBg, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        fontSize: Math.max(10, Math.floor(size * 0.35)), 
        fontWeight: 700, 
        color: 'var(--fk-text-hi)',
        flexShrink: 0
      }}
    >
      {initials.toUpperCase()}
    </div>
  );
}
