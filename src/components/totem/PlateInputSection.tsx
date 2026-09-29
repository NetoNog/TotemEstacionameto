'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Search, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { PlateBadge } from '../ui/PlateBadge';
import { VirtualKeyboard } from './VirtualKeyboard';
import { normalizarPlaca, validarFormatoPlaca } from '@/lib/tariffCalculator';
import { sound } from '@/lib/soundEffects';

interface PlateInputSectionProps {
  initialPlate?: string;
  onSearch: (placa: string) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  errorMessage?: string | null;
}

export const PlateInputSection: React.FC<PlateInputSectionProps> = ({
  initialPlate = '',
  onSearch,
  onCancel,
  isLoading,
  errorMessage,
}) => {
  const [placa, setPlaca] = useState(normalizarPlaca(initialPlate));
  const [inactivityCount, setInactivityCount] = useState(60);
  const inputRef = useRef<HTMLInputElement>(null);

  // Inactivity timeout: retorna para a tela inicial se o usuário abandonar o totem
  useEffect(() => {
    const timer = setInterval(() => {
      setInactivityCount((prev) => {
        if (prev <= 1) {
          onCancel();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onCancel]);

  const resetInactivity = () => {
    setInactivityCount(60);
  };

  const handlePlacaChange = (val: string) => {
    resetInactivity();
    const limpa = normalizarPlaca(val).slice(0, 7);
    setPlaca(limpa);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    resetInactivity();
    if (placa.length < 5 || isLoading) return;
    sound.playKeyClick();
    await onSearch(placa);
  };

  const { valida, tipo } = validarFormatoPlaca(placa);

  const testPlates = [
    { plate: 'ABC1234', desc: 'R$ 12,00 (1ª Hora)' },
    { plate: 'BRA2E19', desc: 'Grátis (Tolerância)' },
    { plate: 'XYZ9876', desc: 'R$ 24,00 (2h 15m)' },
  ];

  return (
    <div
      onMouseMove={resetInactivity}
      onTouchStart={resetInactivity}
      className="w-full max-w-4xl mx-auto flex flex-col items-center justify-between min-h-[calc(100vh-100px)] py-4 px-4 select-none"
    >
      {/* Barra de Topo com Botão Voltar e Temporizador de Segurança */}
      <div className="w-full flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => {
            sound.playKeyClear();
            onCancel();
          }}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 active:scale-95 transition-all text-sm font-bold cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Voltar ao Início</span>
        </button>

        <div className="flex items-center gap-2 bg-slate-900/60 px-4 py-2 rounded-2xl border border-slate-800 text-xs text-slate-400">
          <span>Tempo de sessão:</span>
          <span className="font-mono font-bold text-amber-400">{inactivityCount}s</span>
        </div>
      </div>

      {/* Título & Instrução Touch */}
      <div className="text-center mb-4">
        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Digite a Placa do Veículo
        </h2>
        <p className="mt-1 text-sm sm:text-base text-slate-400">
          Utilize o teclado na tela para consultar o ticket
        </p>
      </div>

      {/* Visualizador da Placa em Tamanho Grande */}
      <div className="flex flex-col items-center gap-2 my-1">
        <PlateBadge placa={placa} size="xl" />

        <div className="flex items-center gap-2 h-6">
          {placa.length === 7 ? (
            valida ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold animate-fadeIn">
                <Sparkles className="w-3.5 h-3.5" />
                Padrão {tipo === 'MERCOSUL' ? 'Mercosul' : 'Tradicional'} Reconhecido
              </span>
            ) : (
              <span className="text-amber-400 text-xs font-medium">
                Padrão não usual, mas você pode consultar normalmente
              </span>
            )
          ) : (
            <span className="text-slate-500 text-xs font-mono">
              {placa.length}/7 caracteres digitados
            </span>
          )}
        </div>
      </div>

      {/* Alerta caso a placa não seja encontrada */}
      {errorMessage && (
        <div className="w-full max-w-xl my-2 p-4 rounded-2xl bg-amber-950/70 border border-amber-600/70 text-amber-200 flex flex-col gap-2.5 animate-shake">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-400 flex-none" />
            <span className="text-sm font-bold">{errorMessage}</span>
          </div>
          <div className="text-xs text-amber-300/90 pl-7">
            <span>Ou selecione uma das placas ativas para testar:</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {testPlates.map((tp) => (
                <button
                  key={tp.plate}
                  type="button"
                  onClick={() => {
                    sound.playKeyClick();
                    setPlaca(tp.plate);
                    onSearch(tp.plate);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-amber-900/60 hover:bg-amber-800 text-white font-mono text-xs font-bold border border-amber-600/50 cursor-pointer"
                >
                  {tp.plate} ({tp.desc})
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Botão Gigante de Consulta */}
      <div className="w-full max-w-md my-3">
        <button
          type="button"
          disabled={placa.length < 5 || isLoading}
          onClick={() => handleSubmit()}
          className="w-full py-5 px-8 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-emerald-500 hover:from-blue-500 hover:to-emerald-400 text-white font-black text-xl tracking-wider shadow-xl shadow-blue-500/25 disabled:opacity-40 disabled:pointer-events-none active:scale-98 transition-all flex items-center justify-center gap-3 cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-7 h-7 animate-spin text-white" />
              <span>CONSULTANDO...</span>
            </>
          ) : (
            <>
              <Search className="w-7 h-7" />
              <span>CONSULTAR TICKET</span>
            </>
          )}
        </button>
      </div>

      {/* Teclado Virtual Touch */}
      <div className="w-full mt-auto">
        <VirtualKeyboard
          value={placa}
          onChange={handlePlacaChange}
          disabled={isLoading}
          maxLength={7}
        />
      </div>

      {/* Input oculto para digitação física opcional via teclado do computador */}
      <input
        ref={inputRef}
        type="text"
        value={placa}
        onChange={(e) => handlePlacaChange(e.target.value)}
        className="opacity-0 absolute pointer-events-none -z-10"
        maxLength={7}
        autoFocus
      />
    </div>
  );
};
