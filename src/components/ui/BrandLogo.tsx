'use client';

import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'hero';
  layout?: 'horizontal' | 'vertical' | 'icon-only';
  showTagline?: boolean;
  className?: string;
  theme?: 'dark' | 'light' | 'mono';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  layout = 'horizontal',
  showTagline = true,
  className = '',
  theme = 'dark',
}) => {
  // Tamanhos calibrados do ícone
  const iconDimensions = {
    sm: { w: 32, h: 32, box: 32 },
    md: { w: 42, h: 42, box: 42 },
    lg: { w: 56, h: 56, box: 56 },
    hero: { w: 84, h: 84, box: 84 },
  };

  const currentSize = iconDimensions[size];

  const iconSvg = (
    <div className="relative flex-shrink-0 flex items-center justify-center">
      {/* Brilho sutil ao redor do ícone (modo dark) */}
      {theme === 'dark' && (size === 'lg' || size === 'hero') && (
        <div className="absolute inset-0 bg-emerald-500/15 blur-xl rounded-full pointer-events-none" />
      )}

      <svg
        width={currentSize.w}
        height={currentSize.h}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 drop-shadow-md"
      >
        <defs>
          {/* Gradiente Titânio Platinum da Moldura */}
          <linearGradient id="shieldGrad" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#27272a" />
            <stop offset="50%" stopColor="#18181b" />
            <stop offset="100%" stopColor="#09090b" />
          </linearGradient>

          {/* Gradiente da Borda Chanfrada */}
          <linearGradient id="strokeGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
            <stop offset="40%" stopColor="#71717a" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.05" />
          </linearGradient>

          {/* Gradiente Metálico do P / Flecha */}
          <linearGradient id="pGrad" x1="25" y1="20" x2="75" y2="80" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="70%" stopColor="#e4e4e7" />
            <stop offset="100%" stopColor="#a1a1aa" />
          </linearGradient>

          {/* Acento Tecnológico Emerald */}
          <linearGradient id="accentGrad" x1="45" y1="40" x2="75" y2="70" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>

        {/* Chassi Base Hexagonal / Escudo Geométrico */}
        <path
          d="M 50 8 
             L 86 28 
             L 86 72 
             L 50 92 
             L 14 72 
             L 14 28 Z"
          fill="url(#shieldGrad)"
          stroke="url(#strokeGrad)"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        {/* Linhas de precisão industrial internas (Grade tecnológica) */}
        <path
          d="M 50 14 L 80 31 L 80 69 L 50 86 L 20 69 L 20 31 Z"
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="1.5"
        />

        {/* Símbolo "P" Estilizado Corporativo com Vetor Dinâmico */}
        {/* Haste Vertical do P */}
        <rect
          x="34"
          y="28"
          width="10"
          height="44"
          rx="2.5"
          fill="url(#pGrad)"
        />

        {/* Arco Superior do P */}
        <path
          d="M 38 28
             L 56 28
             C 67 28, 73 34, 73 42
             C 73 50, 67 56, 56 56
             L 38 56 Z"
          fill="url(#pGrad)"
        />

        {/* Núcleo vazado do P */}
        <path
          d="M 44 36
             L 54 36
             C 59 36, 62 38, 62 42
             C 62 46, 59 48, 54 48
             L 44 48 Z"
          fill="#0c0c0e"
        />

        {/* Traço de Sensor / Feixe Tecnológico Ativo (Acento Esmeralda) */}
        <circle cx="54" cy="42" r="3" fill="url(#accentGrad)" />

        <path
          d="M 64 64 L 74 74 M 74 74 L 68 74 M 74 74 L 74 68"
          stroke="url(#accentGrad)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );

  if (layout === 'icon-only') {
    return <div className={`inline-flex items-center ${className}`}>{iconSvg}</div>;
  }

  // Estilos de texto por tamanho
  const typographyStyles = {
    sm: {
      title: 'text-sm font-extrabold tracking-wider',
      badge: 'text-[9px] px-1.5 py-0.2',
      tagline: 'text-[9px]',
    },
    md: {
      title: 'text-base font-extrabold tracking-widest',
      badge: 'text-[10px] px-2 py-0.5',
      tagline: 'text-[10px]',
    },
    lg: {
      title: 'text-2xl font-black tracking-[0.2em]',
      badge: 'text-xs px-2.5 py-0.5',
      tagline: 'text-xs',
    },
    hero: {
      title: 'text-4xl sm:text-5xl font-black tracking-[0.25em]',
      badge: 'text-xs px-3 py-1',
      tagline: 'text-sm sm:text-base',
    },
  };

  const typo = typographyStyles[size];

  return (
    <div
      className={`inline-flex ${
        layout === 'vertical' ? 'flex-col items-center text-center gap-3' : 'items-center gap-3.5'
      } select-none ${className}`}
    >
      {iconSvg}

      <div className={`flex flex-col ${layout === 'vertical' ? 'items-center' : 'items-start'}`}>
        {/* Linha da Marca + Badge Corporativo */}
        <div className="flex items-center gap-2">
          <span
            className={`font-sans uppercase ${typo.title} text-zinc-100 font-display`}
            style={{
              letterSpacing: size === 'hero' ? '0.22em' : '0.12em',
              textShadow: theme === 'dark' ? '0 2px 10px rgba(0,0,0,0.7)' : 'none',
            }}
          >
            SMART<span className="text-zinc-400 font-light">PARK</span>
          </span>

          <span
            className={`font-mono font-bold uppercase rounded tracking-wider border ${typo.badge} ${
              theme === 'dark'
                ? 'bg-zinc-900/90 text-emerald-400 border-emerald-800/60 shadow-sm'
                : 'bg-zinc-100 text-zinc-800 border-zinc-300'
            }`}
          >
            ENTERPRISE
          </span>
        </div>

        {/* Tagline Corporativa */}
        {showTagline && (
          <div
            className={`font-mono uppercase text-zinc-500 tracking-widest mt-0.5 font-medium ${typo.tagline}`}
          >
            PARKING INTELLIGENCE & MOBILITY
          </div>
        )}
      </div>
    </div>
  );
};
