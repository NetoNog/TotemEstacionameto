'use client';

import React from 'react';
import { Delete, Trash2 } from 'lucide-react';
import { sound } from '@/lib/soundEffects';

interface VirtualKeyboardProps {
  value: string;
  onChange: (val: string) => void;
  maxLength?: number;
  disabled?: boolean;
}

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  value,
  onChange,
  maxLength = 10,
  disabled = false,
}) => {
  const numberRow = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
  const row1 = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'];
  const row2 = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'];
  const row3 = ['Z', 'X', 'C', 'V', 'B', 'N', 'M'];

  const handleKeyPress = (char: string) => {
    if (disabled) return;
    if (value.length < maxLength) {
      sound.playKeyClick();
      onChange(value + char);
    }
  };

  const handleBackspace = () => {
    if (disabled || value.length === 0) return;
    sound.playKeyClear();
    onChange(value.slice(0, -1));
  };

  const handleClear = () => {
    if (disabled || value.length === 0) return;
    sound.playKeyClear();
    onChange('');
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-1.5 sm:gap-2 p-3 sm:p-4 bg-zinc-950/95 backdrop-blur-md rounded-2xl border border-zinc-800 shadow-2xl select-none animate-fadeIn">
      {/* Linha Numérica */}
      <div className="flex justify-center gap-1 sm:gap-1.5">
        {numberRow.map((num) => (
          <button
            key={num}
            type="button"
            disabled={disabled || value.length >= maxLength}
            onClick={() => handleKeyPress(num)}
            className="flex-1 min-w-[28px] sm:min-w-[42px] h-11 sm:h-12 bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-700 active:scale-95 disabled:opacity-30 disabled:pointer-events-none rounded-lg text-base sm:text-xl font-bold font-mono text-zinc-100 border border-zinc-800 shadow-sm transition-all flex items-center justify-center cursor-pointer"
          >
            {num}
          </button>
        ))}
      </div>

      {/* Linha 1 de Letras */}
      <div className="flex justify-center gap-1 sm:gap-1.5">
        {row1.map((char) => (
          <button
            key={char}
            type="button"
            disabled={disabled || value.length >= maxLength}
            onClick={() => handleKeyPress(char)}
            className="flex-1 min-w-[28px] sm:min-w-[42px] h-11 sm:h-12 bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-700 active:scale-95 disabled:opacity-30 disabled:pointer-events-none rounded-lg text-base sm:text-xl font-bold font-mono text-zinc-100 border border-zinc-800 shadow-sm transition-all flex items-center justify-center cursor-pointer"
          >
            {char}
          </button>
        ))}
      </div>

      {/* Linha 2 de Letras */}
      <div className="flex justify-center gap-1 sm:gap-1.5 px-2 sm:px-4">
        {row2.map((char) => (
          <button
            key={char}
            type="button"
            disabled={disabled || value.length >= maxLength}
            onClick={() => handleKeyPress(char)}
            className="flex-1 min-w-[28px] sm:min-w-[42px] h-11 sm:h-12 bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-700 active:scale-95 disabled:opacity-30 disabled:pointer-events-none rounded-lg text-base sm:text-xl font-bold font-mono text-zinc-100 border border-zinc-800 shadow-sm transition-all flex items-center justify-center cursor-pointer"
          >
            {char}
          </button>
        ))}
      </div>

      {/* Linha 3 de Letras + Teclas de Ação */}
      <div className="flex justify-center gap-1 sm:gap-1.5">
        {/* Botão Limpar Tudo */}
        <button
          type="button"
          disabled={disabled || value.length === 0}
          onClick={handleClear}
          className="flex-none px-2.5 sm:px-3 h-11 sm:h-12 bg-zinc-900/80 hover:bg-red-950/60 active:scale-95 text-red-400 hover:text-red-300 disabled:opacity-30 disabled:pointer-events-none rounded-lg text-xs font-semibold font-mono border border-zinc-800 hover:border-red-800/50 flex items-center gap-1 justify-center cursor-pointer transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Limpar</span>
        </button>

        {row3.map((char) => (
          <button
            key={char}
            type="button"
            disabled={disabled || value.length >= maxLength}
            onClick={() => handleKeyPress(char)}
            className="flex-1 min-w-[28px] sm:min-w-[42px] h-11 sm:h-12 bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-700 active:scale-95 disabled:opacity-30 disabled:pointer-events-none rounded-lg text-base sm:text-xl font-bold font-mono text-zinc-100 border border-zinc-800 shadow-sm transition-all flex items-center justify-center cursor-pointer"
          >
            {char}
          </button>
        ))}

        {/* Botão Apagar (Backspace) */}
        <button
          type="button"
          disabled={disabled || value.length === 0}
          onClick={handleBackspace}
          className="flex-none px-2.5 sm:px-3.5 h-11 sm:h-12 bg-zinc-900/80 hover:bg-amber-950/60 active:scale-95 text-amber-400 hover:text-amber-300 disabled:opacity-30 disabled:pointer-events-none rounded-lg text-xs font-semibold font-mono border border-zinc-800 hover:border-amber-800/50 flex items-center gap-1 justify-center cursor-pointer transition-all"
        >
          <Delete className="w-4 h-4" />
          <span className="hidden sm:inline">Apagar</span>
        </button>
      </div>
    </div>
  );
};
