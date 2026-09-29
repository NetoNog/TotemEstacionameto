'use client';

import React, { useState, useEffect } from 'react';
import { Car, CreditCard, QrCode, ShieldCheck, Sparkles, ChevronRight, Volume2, VolumeX } from 'lucide-react';
import { PlateBadge } from '../ui/PlateBadge';
import { sound } from '@/lib/soundEffects';

interface AttractScreenProps {
  onStart: (quickPlate?: string) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const AttractScreen: React.FC<AttractScreenProps> = ({
  onStart,
  soundEnabled,
  onToggleSound,
}) => {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setTime(new Date()), 0);
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  const demoVehicles = [
    { placa: 'BRA2E19', label: 'Tolerância (10m)', badge: 'Grátis' },
    { placa: 'ABC1234', label: '1ª Hora (48m)', badge: 'R$ 12,00' },
    { placa: 'XYZ9876', label: '2h 15m (3 frações)', badge: 'R$ 24,00' },
    { placa: 'KTM4G88', label: '8h 30m (Teto Diário)', badge: 'R$ 45,00' },
  ];

  return (
    <div
      onClick={() => onStart()}
      className="relative min-h-[calc(100vh-80px)] w-full flex flex-col justify-between items-center p-6 sm:p-10 cursor-pointer select-none overflow-hidden"
    >
      {/* Background ambient lighting effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header com Relógio e Indicadores de Saúde do Totem */}
      <div className="w-full max-w-5xl flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Car className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide flex items-center gap-2">
              SmartTotem <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-bold border border-blue-500/30">AUTOATENDIMENTO</span>
            </h1>
            <p className="text-xs text-slate-400">Estacionamento Rotativo Inteligente</p>
          </div>
        </div>

        {/* Data e Hora em Tempo Real */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSound();
            }}
            className="p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 shadow-lg transition-all"
            title="Alternar som do totem"
          >
            {soundEnabled ? <Volume2 className="w-5 h-5 text-emerald-400" /> : <VolumeX className="w-5 h-5 text-slate-500" />}
          </button>

          <div className="text-right bg-slate-900/70 border border-slate-800/80 px-4 py-2 rounded-2xl backdrop-blur-md">
            <div className="text-xl sm:text-2xl font-mono font-bold text-white tracking-wider">
              {time ? time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '--:--:--'}
            </div>
            <div className="text-xs text-slate-400 capitalize">
              {time ? time.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' }) : '...'}
            </div>
          </div>
        </div>
      </div>

      {/* Seção Central: Call to Action de Boas-Vindas */}
      <div className="flex flex-col items-center justify-center text-center my-auto py-8 z-10 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold mb-6 animate-pulse">
          <Sparkles className="w-4 h-4" />
          <span>Pagamento Rápido via PIX ou Cartão</span>
        </div>

        <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
          Pague seu ticket em <br />
          <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
            menos de 30 segundos
          </span>
        </h2>

        <p className="mt-4 text-base sm:text-xl text-slate-300 max-w-xl">
          Digite a placa do seu veículo para consultar o tempo de permanência e liberar sua saída na cancela.
        </p>

        {/* Botão de Iniciar Gigante com Efeito Pulse */}
        <div className="mt-8 relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-3xl blur-lg opacity-70 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
          <button
            type="button"
            className="relative px-10 py-6 bg-gradient-to-r from-blue-600 via-blue-500 to-emerald-500 rounded-2xl text-white font-extrabold text-2xl tracking-wide flex items-center gap-4 shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <span>TOQUE NA TELA PARA INICIAR</span>
            <ChevronRight className="w-8 h-8 animate-bounce" />
          </button>
        </div>

        {/* Formas de Pagamento Aceitas */}
        <div className="mt-10 flex items-center justify-center gap-6 text-slate-400 text-sm">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-cyan-400" />
            <span>PIX Instantâneo</span>
          </div>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-400" />
            <span>Aproximação / Débito / Crédito</span>
          </div>
        </div>
      </div>

      {/* Rodapé: Atalhos Rápidos para Demonstração */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl bg-slate-900/80 border border-slate-800 rounded-3xl p-5 backdrop-blur-lg z-10 shadow-2xl"
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Veículos de Teste Cadastrados (Clique para testar direto):</span>
          </div>
          <span className="text-xs text-slate-500">Tolerância inicial: 15 min grátis</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {demoVehicles.map((demo) => (
            <button
              key={demo.placa}
              type="button"
              onClick={() => {
                sound.playKeyClick();
                onStart(demo.placa);
              }}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700 active:bg-blue-600/40 border border-slate-700/60 hover:border-blue-500/50 transition-all group cursor-pointer"
            >
              <PlateBadge placa={demo.placa} size="sm" />
              <span className="mt-2 text-xs font-semibold text-slate-200 group-hover:text-blue-300">
                {demo.label}
              </span>
              <span className="text-[10px] px-2 py-0.5 mt-1 rounded bg-slate-900 text-emerald-400 font-bold">
                {demo.badge}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
