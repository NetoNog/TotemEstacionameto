'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ScanLine, ArrowRight, Loader2, AlertCircle, ShieldCheck, Keyboard } from 'lucide-react';
import { sound } from '@/lib/soundEffects';
import { useBarcodeScanner } from '@/hooks/useBarcodeScanner';
import { Language, translations } from '@/lib/translations';
import { VirtualKeyboard } from './VirtualKeyboard';

interface TicketScannerProps {
  onScan: (ticketCode: string) => Promise<void>;
  isLoading: boolean;
  errorMessage?: string | null;
  lang?: Language;
}

export const TicketScanner: React.FC<TicketScannerProps> = ({
  onScan,
  isLoading,
  errorMessage,
  lang = 'pt',
}) => {
  const t = translations[lang].scan;
  const [manualCode, setManualCode] = useState('');
  const [showKeyboard, setShowKeyboard] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Hook para capturar leituras físicas de leitoras laser USB/Bluetooth mesmo sem foco no input
  useBarcodeScanner({
    onScan: (code) => {
      sound.playKeyClick();
      onScan(code);
    },
    enabled: !isLoading,
  });

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSimulateScan = async (code: string) => {
    sound.playKeyClick();
    await onScan(code);
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim() || isLoading) return;
    sound.playKeyClick();
    await onScan(manualCode.trim());
  };

  const demoTickets = [
    { code: '1024', placa: 'ABC-1234', time: '48 min', value: 'R$ 12,00', tag: '1ª Hora' },
    { code: '1025', placa: 'XYZ-9876', time: '1h 45m', value: 'R$ 16,00', tag: 'Adicional' },
    { code: '1026', placa: 'BRA-2E19', time: '10 min', value: 'R$ 0,00', tag: 'Tolerância' },
    { code: '1027', placa: 'KTM-4G88', time: '8h 20m', value: 'R$ 45,00', tag: 'Teto Diário' },
  ];

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center justify-between min-h-[calc(100vh-140px)] py-6 px-4 select-none">
      {/* Título & Instrução Principal */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/80 border border-zinc-800 text-[11px] font-mono text-zinc-400 uppercase tracking-widest mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>{t.opticalSlotLabel}</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-100 tracking-tight">
          {t.instructionTitle}
        </h2>
        <p className="text-sm text-zinc-400 mt-2 max-w-md mx-auto">
          {t.instructionSub}
        </p>
      </div>

      {/* Chassi do Leitor Ótico com Mira de Alta Fidelidade */}
      <div className="w-full max-w-sm my-6 flex flex-col items-center">
        <div className="relative w-72 h-72 sm:w-80 sm:h-80 rounded-3xl kiosk-panel p-6 flex flex-col items-center justify-center overflow-hidden">
          {/* Luz reflexiva de vidro */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-transparent pointer-events-none" />

          {/* Mira ótica central calibrada */}
          <div className="relative w-56 h-56 rounded-2xl bg-black/60 border border-zinc-800/80 flex flex-col items-center justify-center overflow-hidden">
            {/* Feixe Laser vermelho suave e contínuo */}
            <div className="absolute left-3 right-3 h-0.5 bg-red-500 shadow-[0_0_16px_#ef4444,0_0_8px_#ef4444] animate-laser-sweep pointer-events-none z-20">
              <div className="absolute -top-3 left-0 right-0 h-6 bg-red-500/10 blur-sm pointer-events-none"></div>
            </div>

            {/* Cantoneiras industriais de precisão */}
            <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-zinc-400/80 rounded-tl-sm"></div>
            <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-zinc-400/80 rounded-tr-sm"></div>
            <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-zinc-400/80 rounded-bl-sm"></div>
            <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-zinc-400/80 rounded-br-sm"></div>

            {/* Ícone de mira ótica */}
            <div className="flex flex-col items-center text-zinc-600 gap-2 z-10">
              <ScanLine className="w-14 h-14 text-zinc-500/70" />
              <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">
                {t.opticalSlotSub}
              </span>
            </div>
          </div>

          {/* Slot de leitora física do totem */}
          <div className="w-36 h-2 bg-zinc-950 rounded-full mt-4 border border-zinc-800 flex items-center justify-center">
            <div className="w-20 h-0.5 bg-zinc-800 rounded-full"></div>
          </div>
        </div>

        {/* Alerta de erro de leitura */}
        {errorMessage && (
          <div className="mt-4 p-3.5 rounded-xl bg-zinc-900/95 border border-zinc-800 text-zinc-300 text-xs flex items-center gap-2.5 max-w-sm w-full animate-shake shadow-lg">
            <AlertCircle className="w-4 h-4 text-zinc-400 flex-none" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Painel de Simulação de Tickets de Teste */}
      <div className="w-full kiosk-panel rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3 text-xs">
          <span className="font-mono text-zinc-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-500" />
            {t.testPillsLabel}
          </span>
          <span className="text-zinc-500 text-[10px] font-mono">1 Toque</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {demoTickets.map((tItem) => (
            <button
              key={tItem.code}
              type="button"
              disabled={isLoading}
              onClick={() => handleSimulateScan(tItem.code)}
              className="p-3.5 rounded-xl kiosk-card hover:bg-zinc-800/80 active:bg-zinc-800 kiosk-btn-active text-left transition-all cursor-pointer disabled:opacity-40 group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-xs font-bold text-zinc-200 group-hover:text-white font-mono">
                  Ticket #{tItem.code}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800/80 text-zinc-400 font-mono font-medium">
                  {tItem.tag}
                </span>
              </div>
              <div className="flex items-baseline justify-between text-xs text-zinc-400 font-mono">
                <span>{tItem.time}</span>
                <span className="font-bold text-zinc-200">{tItem.value}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Input manual ou para leitor físico USB */}
        <form onSubmit={handleManualSubmit} className="mt-4 pt-3.5 border-t border-zinc-800/80 flex flex-col gap-2.5">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value.toUpperCase())}
              placeholder={t.manualPlaceholder}
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs font-mono uppercase text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
            />
            <button
              type="button"
              onClick={() => {
                sound.playKeyClick();
                setShowKeyboard((prev) => !prev);
              }}
              className={`p-2.5 rounded-xl border text-xs flex items-center justify-center transition-colors cursor-pointer ${
                showKeyboard
                  ? 'bg-zinc-100 text-zinc-950 border-white'
                  : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border-zinc-800'
              }`}
              title="Abrir teclado virtual touch"
            >
              <Keyboard className="w-4 h-4" />
            </button>
            <button
              type="submit"
              disabled={isLoading || !manualCode.trim()}
              className="px-4 py-2.5 rounded-xl bg-zinc-200 hover:bg-white text-zinc-950 text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-30 transition-all kiosk-btn-active"
            >
              {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowRight className="w-3.5 h-3.5" />}
              <span>{t.manualSubmit}</span>
            </button>
          </div>

          {showKeyboard && (
            <div className="pt-2">
              <VirtualKeyboard
                value={manualCode}
                onChange={(val) => setManualCode(val)}
                maxLength={10}
                disabled={isLoading}
              />
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
