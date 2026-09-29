'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Zap,
  Car,
  Fingerprint
} from 'lucide-react';
import { Language, translations } from '@/lib/translations';
import { sound } from '@/lib/soundEffects';
import { speechVoice } from '@/lib/speechVoice';
import { BrandLogo } from '@/components/ui/BrandLogo';

interface AttractModeScreenProps {
  onStart: () => void;
  lang: Language;
}

export const AttractModeScreen: React.FC<AttractModeScreenProps> = ({
  onStart,
  lang,
}) => {
  const t = translations[lang].attract;
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      const langLocale = lang === 'en' ? 'en-US' : lang === 'es' ? 'es-ES' : 'pt-BR';
      setDate(now.toLocaleDateString(langLocale, { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }).toUpperCase());
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [lang]);

  const handleTouchStart = () => {
    sound.playSuccessSound();
    speechVoice.speak(translations[lang].voice.welcome, lang);
    onStart();
  };

  return (
    <div
      onClick={handleTouchStart}
      className="relative w-full min-h-[calc(100vh-80px)] flex flex-col justify-between items-center py-10 px-6 cursor-pointer select-none text-center overflow-hidden"
    >
      {/* Luz ambiente de fundo (Glow) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-white/[0.03] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-emerald-500/[0.03] rounded-full blur-2xl pointer-events-none" />

      {/* Topo do Descanso: Identificação e Relógio */}
      <div className="relative z-10 flex flex-col items-center gap-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/90 border border-zinc-800 text-[11px] font-mono text-zinc-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{t.statusOnline}</span>
        </div>

        <div className="mt-3 flex flex-col items-center">
          <BrandLogo size="lg" layout="vertical" showTagline />
        </div>

        {/* Relógio Grande */}
        <div className="mt-3 flex flex-col items-center font-mono">
          <span className="text-4xl sm:text-5xl font-black text-zinc-100 tracking-tight">
            {time || '--:--:--'}
          </span>
          <span className="text-xs text-zinc-400 mt-1 font-sans">
            {date}
          </span>
        </div>
      </div>

      {/* Centro: O ÚNICO E GRANDE BOTÃO DE ATENDIMENTO SOLICITADO */}
      <div className="relative z-10 my-auto py-6 flex flex-col items-center gap-5 w-full max-w-md">
        {/* Botão Gigante de Iniciar Atendimento */}
        <button
          type="button"
          onClick={handleTouchStart}
          className="animate-attract-pulse w-full py-8 sm:py-10 px-8 rounded-3xl bg-zinc-100 hover:bg-white text-zinc-950 font-black text-lg sm:text-xl flex flex-col items-center justify-center gap-3 transition-all cursor-pointer shadow-2xl shadow-white/10 active:scale-95"
        >
          <div className="w-16 h-16 rounded-2xl bg-zinc-950 text-zinc-100 flex items-center justify-center shadow-inner">
            <Fingerprint className="w-10 h-10 text-zinc-100 animate-pulse" />
          </div>

          <span className="tracking-wide">
            {t.touchToStart}
          </span>

          <span className="text-xs font-medium text-zinc-600 font-sans tracking-normal -mt-1">
            {t.touchSubtitle}
          </span>
        </button>

        {/* Widget de Vagas do Estacionamento */}
        <div className="w-full kiosk-panel rounded-2xl p-4 border border-zinc-800 flex items-center justify-between text-left">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-400">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-mono text-zinc-400 uppercase">
                {t.vacanciesTitle}
              </div>
              <div className="text-sm font-bold font-mono text-emerald-400">
                {t.vacanciesAvailable}
              </div>
            </div>
          </div>

          <div className="text-right text-[11px] font-mono text-zinc-500 space-y-0.5">
            <div>{t.floorG1}</div>
            <div>{t.floorG2}</div>
          </div>
        </div>
      </div>

      {/* Rodapé do Descanso */}
      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3 w-full max-w-xl text-[11px] font-mono text-zinc-500 pt-4 border-t border-zinc-900">
        <div className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-zinc-400" />
          <span>{t.barcodeTip}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
          <span>{t.securityBadge}</span>
        </div>
      </div>
    </div>
  );
};
