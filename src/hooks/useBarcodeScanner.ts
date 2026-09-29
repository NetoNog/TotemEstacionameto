'use client';

import { useEffect, useRef } from 'react';

interface UseBarcodeScannerOptions {
  onScan: (barcode: string) => void;
  minChars?: number;
  maxIntervalMs?: number; // Tempo máximo entre teclas para ser considerado scanner laser (geralmente < 50ms)
  enabled?: boolean;
}

/**
 * Hook global para capturar leituras de scanners de código de barras USB/Bluetooth em totens físicos.
 * Funciona de forma transparente mesmo quando o foco não está em um campo de texto.
 */
export function useBarcodeScanner({
  onScan,
  minChars = 3,
  maxIntervalMs = 50,
  enabled = true,
}: UseBarcodeScannerOptions) {
  const bufferRef = useRef<string>('');
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignora se estiver digitando em campos de input textuais ativos normais para não atrapalhar digitação manual
      const target = e.target as HTMLElement | null;
      const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA');

      const now = Date.now();
      const interval = now - lastTimeRef.current;
      lastTimeRef.current = now;

      // Finalização da leitura ótica (Enter)
      if (e.key === 'Enter') {
        const barcode = bufferRef.current.trim();
        bufferRef.current = '';

        if (barcode.length >= minChars) {
          // Se não estava em input ou foi uma leitura rápida
          if (!isInput || interval < maxIntervalMs) {
            e.preventDefault();
            onScan(barcode);
          }
        }
        return;
      }

      // Se for tecla de controle (Shift, Ctrl, Alt), ignora
      if (e.key.length > 1) return;

      // Se o intervalo entre teclas for muito longo (> 70ms), reseta o buffer (pois é digitação humana lenta)
      if (interval > maxIntervalMs * 1.5 && bufferRef.current.length > 0) {
        bufferRef.current = '';
      }

      bufferRef.current += e.key;
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onScan, minChars, maxIntervalMs, enabled]);
}
