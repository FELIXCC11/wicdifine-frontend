'use client';

import { WICFINAvatarLogo } from './icons';

interface AIOrbProps {
  isAnimating?: boolean;
  size?: number;
}

export function AIOrbAvatar({ isAnimating = false, size = 32 }: AIOrbProps) {
  return (
    <div
      className={`relative flex items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-800 ${
        isAnimating ? 'ai-orb-active' : ''
      }`}
      style={{ width: size, height: size, minWidth: size, minHeight: size }}
    >
      {/* Animated glow rings when active */}
      {isAnimating && (
        <>
          <div className="ai-orb-ring ai-orb-ring-1"></div>
          <div className="ai-orb-ring ai-orb-ring-2"></div>
          <div className="ai-orb-ring ai-orb-ring-3"></div>
        </>
      )}

      {/* Logo */}
      <div className="relative z-10">
        <WICFINAvatarLogo size={size * 0.6} />
      </div>
    </div>
  );
}
