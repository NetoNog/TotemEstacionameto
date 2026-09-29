'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  CheckCircle2,
  Printer,
  ArrowRight,
  Check,
  X,
  FileText,
  Loader2,
  ShieldCheck,
  Sparkles,
  Clock
} from 'lucide-react';
import { Ticket } from '@/types/parking';
import { formatarMoeda } from '@/lib/tariffCalculator';
import { sound } from '@/lib/soundEffects';
import { Language, translations } from '@/lib/translations';
import { speechVoice } from '@/lib/speechVoice';
import { ThermalPrinterSlot } from './ThermalPrinterSlot';
import { DanfeNfceReceipt } from './DanfeNfceReceipt';

interface MinimalReleaseScreenProps {
  ticket: Ticket;
  validadeMinutos?: number; // Padrão: 20 minutos
  onFinish: () => void;
  lang?: Language;
}

export const MinimalReleaseScreen: React.FC<MinimalReleaseScreenProps> = ({
  ticket,
  validadeMinutos = 20,
  onFinish,
  lang = 'pt',
}) => {
  const t = translations[lang].release;
  const totalSeconds = validadeMinutos * 60;
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const [autoResetSeconds, setAutoResetSeconds] = useState(30);
  const [exitQrUrl, setExitQrUrl] = useState('');
  const [printChoice, setPrintChoice] = useState<'ASKING' | 'PRINTING' | 'PRINTED' | 'NO_PRINT'>('ASKING');

  // Locução por voz de liberação de saída
  useEffect(() => {
    speechVoice.speak(translations[lang].voice.paymentApproved, lang);
  }, [lang]);

  // Gera o QR Code para leitura na cancela de saída
  useEffect(() => {
    const payload = `SMARTPARK-SAIDA|${ticket.codigoTicket || ticket.id}|VAL:20MIN|TS:${Date.now()}`;
    QRCode.toDataURL(payload, {
      width: 220,
      margin: 1,
      color: {
        dark: '#09090b',
        light: '#ffffff',
      },
    })
      .then((url) => setExitQrUrl(url))
      .catch((err) => console.error('Erro ao gerar QR Code de saída:', err));
  }, [ticket]);

  // Contagem regressiva da tolerância de saída (20 min)
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Contagem regressiva de 30 segundos para retornar ao modo descanso se o cliente não clicar
  useEffect(() => {
    const resetTimer = setInterval(() => {
      setAutoResetSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(resetTimer);
  }, []);

  // Quando a contagem regressiva atinge 0, retorna automaticamente à tela de descanso
  useEffect(() => {
    if (autoResetSeconds === 0) {
      onFinish();
    }
  }, [autoResetSeconds, onFinish]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handlePrintYes = () => {
    sound.playKeyClick();
    setPrintChoice('PRINTING');

    setTimeout(() => {
      sound.playSuccessSound();
      setPrintChoice('PRINTED');
      try {
        window.print();
      } catch {
        // ignora se bloqueado
      }
    }, 1800);
  };

  const handlePrintNo = () => {
    sound.playKeyClick();
    setPrintChoice('NO_PRINT');
  };

  // Cálculo da porcentagem do círculo radial
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const progressRatio = secondsLeft / totalSeconds;
  const strokeDashoffset = circumference * (1 - progressRatio);

  const formatDateTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '--:--';
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col justify-between items-center min-h-[calc(100vh-120px)] py-4 px-4 sm:px-6 select-none animate-fadeIn font-sans">
      {/* Cabeçalho de Status com Anel de Liberação */}
      <div className="flex flex-col items-center text-center w-full">
        {/* Anel Radial de Contagem Regressiva de 20 Minutos */}
        <div className="relative flex items-center justify-center my-2">
          <svg className="w-36 h-36 transform -rotate-90">
            <circle
              cx="72"
              cy="72"
              r={radius}
              stroke="currentColor"
              strokeWidth="6"
              fill="transparent"
              className="text-zinc-850"
            />
            <circle
              cx="72"
              cy="72"
              r={radius}
              stroke="currentColor"
              strokeWidth="6"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="text-emerald-400 transition-all duration-1000 ease-linear"
            />
          </svg>

          {/* Números Centrais do Cronômetro */}
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-2xl sm:text-3xl font-mono font-black text-zinc-100 tracking-tight">
              {formatTimer(secondsLeft)}
            </span>
            <span className="text-[9px] font-mono uppercase tracking-wider text-emerald-400 font-bold mt-0.5">
              {t.countdownLabel}
            </span>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-800/50 text-emerald-300 text-xs font-mono font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>{t.gateReleased}</span>
        </div>

        <p className="text-xs text-zinc-400 mt-2 max-w-md font-sans">
          {t.exitRuleText}
        </p>
      </div>

      {/* Grid Central: Card do Ticket Térmico + Pergunta da Nota Fiscal */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 my-4 max-w-xl">
        {/* Coluna 1: Ticket Térmico Digital de Saída */}
        <div className="relative kiosk-panel rounded-2xl p-5 border border-zinc-800 flex flex-col items-center text-center shadow-xl">
          <div className="w-full flex items-center justify-between pb-2.5 border-b border-zinc-800/80 text-[11px] font-mono text-zinc-400">
            <span>TICKET #{ticket.codigoTicket || ticket.id.slice(0, 8)}</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> {t.ticketBadgePaid}
            </span>
          </div>

          {/* QR Code de Validação para Cancela */}
          <div className="relative my-3 p-2.5 bg-white rounded-xl shadow-lg">
            {exitQrUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={exitQrUrl} alt="QR Code da Cancela" className="w-32 h-32 rounded" />
            ) : (
              <div className="w-32 h-32 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-zinc-950" />
              </div>
            )}
          </div>

          <div className="w-full space-y-1 text-left font-mono text-[11px] pt-2 border-t border-zinc-800/80">
            <div className="flex justify-between text-zinc-400">
              <span>Placa:</span>
              <span className="text-zinc-200 font-bold">{ticket.placa || 'Sem placa'}</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Entrada:</span>
              <span className="text-zinc-200">{formatDateTime(ticket.horarioEntrada)}</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Valor Quitado:</span>
              <span className="text-emerald-400 font-bold">{formatarMoeda(ticket.valorTotal)}</span>
            </div>
          </div>

          <div className="mt-2.5 text-[10px] font-mono text-zinc-500 text-center">
            {t.opticalGateNotice}
          </div>
        </div>

        {/* Coluna 2: Escolha de Impressão de Nota Fiscal com Impressora Térmica Animada */}
        <div className="kiosk-panel rounded-2xl p-5 border border-zinc-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-200 uppercase tracking-wide pb-2 border-b border-zinc-800">
              <FileText className="w-4 h-4 text-zinc-400" />
              <span>{t.receiptPromptTitle}</span>
            </div>

            <p className="text-xs text-zinc-400 mt-2">
              {t.receiptPromptDesc}
            </p>
          </div>

          {/* Estados da Escolha de Impressão */}
          <div className="my-2">
            {printChoice === 'ASKING' && (
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handlePrintYes}
                  className="kiosk-btn-active w-full py-3 px-4 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow"
                >
                  <Printer className="w-4 h-4" />
                  <span>{t.receiptBtnYes}</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrintNo}
                  className="kiosk-btn-active w-full py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border border-zinc-800 font-medium text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <X className="w-3.5 h-3.5 text-zinc-500" />
                  <span>{t.receiptBtnNo}</span>
                </button>
              </div>
            )}

            {/* Simulação Visual do Compartimento Físico com Papel Ejetado */}
            {(printChoice === 'PRINTING' || printChoice === 'PRINTED') && (
              <div className="flex flex-col items-center">
                <ThermalPrinterSlot
                  ticket={ticket}
                  isPrinting={printChoice === 'PRINTING'}
                  isPrinted={printChoice === 'PRINTED'}
                  onTakePaper={() => {
                    try {
                      window.print();
                    } catch {
                      // noop
                    }
                  }}
                />

                {printChoice === 'PRINTED' && (
                  <button
                    type="button"
                    onClick={handlePrintYes}
                    className="text-[10px] text-zinc-400 underline hover:text-white mt-1 text-center cursor-pointer"
                  >
                    {t.receiptReprint}
                  </button>
                )}
              </div>
            )}

            {printChoice === 'NO_PRINT' && (
              <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col gap-2 text-xs text-zinc-400">
                <div className="flex items-center gap-1.5 text-zinc-300 font-medium">
                  <Check className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{t.receiptNoPrint}</span>
                </div>
                <button
                  type="button"
                  onClick={handlePrintYes}
                  className="text-[10px] text-zinc-300 underline hover:text-white mt-1 text-left cursor-pointer"
                >
                  {t.receiptChangeMind}
                </button>
              </div>
            )}
          </div>

          <div className="text-[10px] font-mono text-zinc-500 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-zinc-500" />
            <span>{t.sefazAuth}</span>
          </div>
        </div>
      </div>

      {/* Emissão Exclusiva de DANFE NFC-e para Impressoras Térmicas */}
      <div className="hidden print:block">
        <DanfeNfceReceipt ticket={ticket} />
      </div>

      {/* Botão de Finalizar Operação com Contagem Regressiva de 30 Segundos */}
      <div className="w-full max-w-md mt-2 flex flex-col items-center gap-2.5 print:hidden">
        <button
          type="button"
          onClick={() => {
            sound.playKeyClick();
            onFinish();
          }}
          className="kiosk-btn-active relative overflow-hidden w-full py-4 px-6 rounded-2xl bg-zinc-100 hover:bg-white text-zinc-950 font-black text-sm sm:text-base flex items-center justify-between cursor-pointer shadow-xl shadow-white/5 transition-all group active:scale-[0.98]"
        >
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span className="tracking-tight">{t.finishBtn}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-zinc-950 text-emerald-400 border border-zinc-800 font-mono text-xs font-bold shadow-inner">
              {autoResetSeconds}s
            </span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </div>

          {/* Barra de progresso visual decrescente de 30 segundos */}
          <div
            className="absolute bottom-0 left-0 h-1 bg-emerald-500 transition-all duration-1000 ease-linear"
            style={{ width: `${(autoResetSeconds / 30) * 100}%` }}
          />
        </button>

        <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono">
          <Clock className="w-3.5 h-3.5 text-zinc-500 animate-pulse" />
          <span>
            {t.autoResetNotice} <strong className="text-zinc-200 font-bold">{autoResetSeconds}s</strong>
          </span>
        </div>
      </div>
    </div>
  );
};
