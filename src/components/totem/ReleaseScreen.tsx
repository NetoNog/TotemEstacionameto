'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  CheckCircle,
  Clock,
  Printer,
  ChevronRight,
  Sparkles,
  QrCode as QrIcon
} from 'lucide-react';
import { Ticket } from '@/types/parking';
import { PlateBadge } from '../ui/PlateBadge';
import { formatarMoeda } from '@/lib/tariffCalculator';
import { sound } from '@/lib/soundEffects';

interface ReleaseScreenProps {
  ticket: Ticket;
  toleranciaMinutos?: number;
  onFinish: () => void;
}

export const ReleaseScreen: React.FC<ReleaseScreenProps> = ({
  ticket,
  toleranciaMinutos = 15,
  onFinish,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState(toleranciaMinutos * 60);
  const [autoResetTimer, setAutoResetTimer] = useState(30);
  const [exitQrUrl, setExitQrUrl] = useState<string>('');
  const [isPrinting, setIsPrinting] = useState(false);

  // Gera o QR Code de saída para o leitor ótico da cancela
  useEffect(() => {
    const exitPayload = `SMARTPARK-SAIDA|${ticket.id}|${ticket.placa}|${ticket.toleranciaSaidaAte || new Date().toISOString()}`;
    QRCode.toDataURL(exitPayload, {
      width: 180,
      margin: 1,
      color: {
        dark: '#020617',
        light: '#ffffff',
      },
    })
      .then((url) => setExitQrUrl(url))
      .catch((err) => console.error(err));
  }, [ticket]);

  // Contagem regressiva da tolerância de saída
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Contagem regressiva de 30 segundos para auto-reset do totem
  useEffect(() => {
    const resetInterval = setInterval(() => {
      setAutoResetTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(resetInterval);
  }, []);

  // Ao zerar a contagem, volta para a tela de descanso
  useEffect(() => {
    if (autoResetTimer === 0) {
      onFinish();
    }
  }, [autoResetTimer, onFinish]);

  const formatExitCountdown = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePrintReceipt = () => {
    sound.playKeyClick();
    setIsPrinting(true);
    setTimeout(() => {
      setIsPrinting(false);
      sound.playSuccessSound();
      window.print();
    }, 800);
  };

  const ultimoPagamento = ticket.pagamentos && ticket.pagamentos.length > 0
    ? ticket.pagamentos[ticket.pagamentos.length - 1]
    : null;

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-between min-h-[calc(100vh-100px)] py-4 px-4 select-none">
      {/* Banner Principal de Confirmação */}
      <div className="w-full text-center flex flex-col items-center my-4">
        <div className="relative mb-4">
          <div className="w-24 h-24 rounded-full bg-emerald-500/20 border-2 border-emerald-500/50 flex items-center justify-center animate-bounce">
            <CheckCircle className="w-14 h-14 text-emerald-400" />
          </div>
          <Sparkles className="w-6 h-6 text-emerald-300 absolute -top-1 -right-1 animate-pulse" />
        </div>

        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Catraca Liberada!
        </h2>
        <p className="mt-2 text-base sm:text-lg text-slate-300 max-w-lg">
          Seu ticket foi validado com sucesso. Dirija-se à cancela de saída.
        </p>

        {/* Destaque do Tempo Limite para Sair */}
        <div className="mt-5 inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-950/80 to-slate-900 border border-emerald-500/40 shadow-lg shadow-emerald-500/10">
          <Clock className="w-6 h-6 text-emerald-400 animate-spin" />
          <span className="text-sm sm:text-base font-semibold text-slate-200">
            Você tem <strong className="text-emerald-400 font-mono text-xl sm:text-2xl font-black">{formatExitCountdown(secondsRemaining)}</strong> para sair
          </span>
        </div>
      </div>

      {/* Recibo Fiscal & Ticket de Saída */}
      <div className="w-full max-w-xl bg-white text-slate-900 rounded-3xl p-6 sm:p-7 shadow-2xl border-4 border-slate-200 flex flex-col gap-4 relative overflow-hidden print:m-0 print:border-none print:shadow-none">
        {/* Recorte dente de serra decorativo do comprovante */}
        <div className="w-full border-b-2 border-dashed border-slate-300 pb-4 text-center">
          <span className="text-xs font-black tracking-widest text-slate-500 uppercase">
            Comprovante de Estacionamento & Saída
          </span>
          <h4 className="text-lg font-black text-slate-950 mt-0.5">SMARTPARK ROTATIVO</h4>
          <p className="text-[11px] text-slate-500 font-mono">CNPJ: 12.345.678/0001-90</p>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Veículo</span>
            <div className="mt-1">
              <PlateBadge placa={ticket.placa} size="sm" />
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Ticket ID</span>
            <p className="font-mono text-xs font-bold text-slate-800">#{ticket.id.slice(0, 10).toUpperCase()}</p>
            <span className="inline-block mt-1 px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
              SAÍDA LIBERADA
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-200 font-mono">
          <div>
            <span className="text-slate-500 block text-[10px]">Entrada:</span>
            <span className="font-bold text-slate-800">
              {new Date(ticket.horarioEntrada).toLocaleString('pt-BR')}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">Validação:</span>
            <span className="font-bold text-slate-800">
              {new Date().toLocaleString('pt-BR')}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">Forma de Pagamento:</span>
            <span className="font-bold text-slate-800">
              {ultimoPagamento?.metodo || (ticket.valorTotal === 0 ? 'ISENTO (TOLERÂNCIA)' : 'PAGO')}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">Valor Pago:</span>
            <span className="font-bold text-slate-950 text-sm">
              {formatarMoeda(ticket.valorTotal)}
            </span>
          </div>
        </div>

        {/* QR Code de Saída para o sensor da cancela */}
        <div className="flex items-center justify-between gap-4 pt-2">
          <div className="flex-1">
            <p className="text-xs font-bold text-slate-800 flex items-center gap-1">
              <QrIcon className="w-4 h-4 text-slate-600" />
              <span>Aproxime na cancela</span>
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Se a placa não for lida pela câmera automática, aponte este QR Code no leitor.
            </p>
          </div>

          {exitQrUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={exitQrUrl}
              alt="QR Code de Saída"
              className="w-20 h-20 border border-slate-300 rounded-lg p-1 bg-white"
            />
          )}
        </div>
      </div>

      {/* Botões de Ação do Totem */}
      <div className="w-full max-w-xl flex flex-col sm:flex-row gap-3 mt-6 print:hidden">
        <button
          type="button"
          onClick={handlePrintReceipt}
          className="flex-1 py-4 px-6 rounded-2xl bg-slate-800/90 hover:bg-slate-700 active:scale-95 text-slate-200 border border-slate-700 font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg"
        >
          <Printer className="w-5 h-5" />
          <span>{isPrinting ? 'Imprimindo...' : 'Imprimir Comprovante'}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            sound.playKeyClick();
            onFinish();
          }}
          className="flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 active:scale-95 text-white font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-blue-600/30 cursor-pointer transition-all"
        >
          <span>Concluir e Liberar Token ({autoResetTimer}s)</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="text-center text-xs text-slate-500 mt-3 print:hidden">
        O totem retornará à tela de descanso automaticamente após a contagem
      </div>
    </div>
  );
};
