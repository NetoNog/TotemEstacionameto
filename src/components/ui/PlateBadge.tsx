'use client';

import React from 'react';
import { normalizarPlaca, validarFormatoPlaca } from '@/lib/tariffCalculator';

interface PlateBadgeProps {
  placa: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const PlateBadge: React.FC<PlateBadgeProps> = ({ placa, size = 'md', className = '' }) => {
  const limpa = normalizarPlaca(placa);
  const { tipo } = validarFormatoPlaca(limpa);

  const sizeStyles = {
    sm: 'w-32 h-10 text-sm tracking-wider',
    md: 'w-44 h-14 text-lg tracking-widest',
    lg: 'w-60 h-20 text-2xl tracking-[0.25em]',
    xl: 'w-72 sm:w-80 h-24 text-3xl sm:text-4xl tracking-[0.25em]',
  };

  const headerStyles = {
    sm: 'h-3 text-[7px]',
    md: 'h-4 text-[9px]',
    lg: 'h-5 text-[11px]',
    xl: 'h-6 text-xs',
  };

  const isMercosul = tipo === 'MERCOSUL' || (limpa.length === 7 && /[A-Z]/.test(limpa[4]));

  return (
    <div
      className={`relative inline-flex flex-col items-center justify-between rounded-lg border-2 border-slate-900 bg-white font-mono font-black uppercase text-slate-950 shadow-md select-none overflow-hidden ${sizeStyles[size]} ${className}`}
      style={{
        boxShadow: '0 4px 12px rgba(0,0,0,0.18), inset 0 0 0 1px rgba(255,255,255,0.8)',
      }}
    >
      {/* Faixa superior do Mercosul ou Tradicional */}
      {isMercosul ? (
        <div
          className={`w-full bg-[#003399] text-white flex items-center justify-between px-2 font-sans font-bold ${headerStyles[size]}`}
        >
          {/* Bandeira Mercosul simplificada / Estrelas */}
          <div className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-yellow-400"></span>
            <span className="text-[9px] font-extrabold tracking-normal">MERCOSUL</span>
          </div>
          <span className="tracking-widest font-black">BRASIL</span>
          {/* Bandeira do Brasil */}
          <div className="w-3.5 h-2.5 bg-emerald-600 relative flex items-center justify-center rounded-[1px] overflow-hidden">
            <div className="w-2.5 h-1.5 bg-yellow-400 rotate-45 flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-blue-700"></div>
            </div>
          </div>
        </div>
      ) : (
        <div
          className={`w-full bg-slate-300 text-slate-800 flex items-center justify-center border-b border-slate-400 font-sans font-semibold tracking-wider ${headerStyles[size]}`}
        >
          <span>SP - BRASIL</span>
        </div>
      )}

      {/* Conteúdo da Placa */}
      <div className="flex-1 flex items-center justify-center w-full px-2">
        <span className="drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)] font-black text-slate-900">
          {limpa.length > 0 ? (
            limpa.length === 7 && !isMercosul ? (
              `${limpa.slice(0, 3)}-${limpa.slice(3)}`
            ) : (
              limpa
            )
          ) : (
            <span className="text-slate-300 font-normal tracking-normal text-base">DIGITE A PLACA</span>
          )}
        </span>
      </div>
    </div>
  );
};
