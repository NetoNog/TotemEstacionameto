'use client';

import React, { useState, useEffect, useCallback } from 'react';
import QRCode from 'qrcode';
import {
  QrCode,
  CreditCard,
  ArrowLeft,
  CheckCircle2,
  Copy,
  Check,
  Radio,
  Loader2,
  Sparkles,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { MetodoPagamento, Ticket } from '@/types/parking';
import { formatarMoeda } from '@/lib/tariffCalculator';
import { sound } from '@/lib/soundEffects';

interface PaymentModalProps {
  ticket: Ticket;
  valor: number;
  onSuccess: (metodo: MetodoPagamento) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  ticket,
  valor,
  onSuccess,
  onCancel,
  isLoading,
}) => {
  const [metodo, setMetodo] = useState<MetodoPagamento>('PIX');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copiedPix, setCopiedPix] = useState(false);
  const [cardStatus, setCardStatus] = useState<'IDLE' | 'READING' | 'PROCESSING' | 'APPROVED'>('IDLE');
  const [autoSimulateCount, setAutoSimulateCount] = useState<number>(10);
  const [autoSimulateActive, setAutoSimulateActive] = useState<boolean>(true);

  const valorNumerico = Number(valor || 0);

  // Payload simulado do PIX Copia e Cola
  const checksum = (ticket.id || ticket.placa || 'TOTEM').slice(0, 4).toUpperCase();
  const pixCopiaCola = `00020126580014br.gov.bcb.pix0136totem-${ticket.id.slice(0, 8)}-${ticket.placa}520400005303986540${valorNumerico.toFixed(2)}5802BR5925SMARTPARK TOTEM ESTAC6009SAO PAULO62070503***6304${checksum}`;

  // Gera o QR Code dinâmico do PIX
  useEffect(() => {
    QRCode.toDataURL(pixCopiaCola, {
      width: 280,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((url) => setQrCodeDataUrl(url))
      .catch((err) => console.error('Erro ao gerar QR Code:', err));
  }, [pixCopiaCola]);

  const handleSimulatePixPayment = useCallback(async () => {
    sound.playSuccessSound();
    await onSuccess('PIX');
  }, [onSuccess]);

  // Contagem regressiva para simulação automática (facilita demonstração sem travar o usuário)
  useEffect(() => {
    if (!autoSimulateActive || metodo !== 'PIX' || isLoading) return;

    const timer = setInterval(() => {
      setAutoSimulateCount((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSimulatePixPayment();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [autoSimulateActive, metodo, isLoading, handleSimulatePixPayment]);

  const handleCopyPix = () => {
    sound.playKeyClick();
    navigator.clipboard.writeText(pixCopiaCola).catch(() => {});
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 3000);
  };

  const handleSimulateCard = async (type: MetodoPagamento) => {
    setAutoSimulateActive(false);
    sound.playKeyClick();
    setCardStatus('READING');

    setTimeout(() => {
      setCardStatus('PROCESSING');
      sound.playKeyClick();

      setTimeout(async () => {
        setCardStatus('APPROVED');
        sound.playSuccessSound();
        await onSuccess(type);
      }, 1200);
    }, 1000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-between min-h-[calc(100vh-100px)] py-4 px-4 select-none">
      {/* Topo com botão voltar */}
      <div className="w-full flex items-center justify-between mb-4">
        <button
          type="button"
          disabled={isLoading || cardStatus === 'PROCESSING'}
          onClick={() => {
            sound.playKeyClear();
            onCancel();
          }}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 active:scale-95 disabled:opacity-40 transition-all text-sm font-bold cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Cancelar e Voltar</span>
        </button>

        <div className="text-right">
          <span className="text-xs text-slate-400">Total a Pagar:</span>
          <p className="text-2xl font-black text-emerald-400 font-mono">
            {formatarMoeda(valorNumerico)}
          </p>
        </div>
      </div>

      {/* Seletor do Método de Pagamento */}
      <div className="w-full max-w-2xl grid grid-cols-2 gap-3 mb-4">
        <button
          type="button"
          onClick={() => {
            sound.playKeyClick();
            setMetodo('PIX');
            setCardStatus('IDLE');
          }}
          className={`py-4 px-5 rounded-2xl flex items-center justify-center gap-3 font-bold text-lg border transition-all cursor-pointer ${
            metodo === 'PIX'
              ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-cyan-400 shadow-xl shadow-cyan-500/20 scale-102'
              : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-750'
          }`}
        >
          <QrCode className="w-6 h-6" />
          <span>PIX Instantâneo</span>
        </button>

        <button
          type="button"
          onClick={() => {
            sound.playKeyClick();
            setMetodo('CARTAO_DEBITO');
            setCardStatus('IDLE');
            setAutoSimulateActive(false);
          }}
          className={`py-4 px-5 rounded-2xl flex items-center justify-center gap-3 font-bold text-lg border transition-all cursor-pointer ${
            metodo !== 'PIX'
              ? 'bg-gradient-to-r from-blue-600 to-emerald-600 text-white border-emerald-400 shadow-xl shadow-emerald-500/20 scale-102'
              : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-750'
          }`}
        >
          <CreditCard className="w-6 h-6" />
          <span>Cartão / NFC</span>
        </button>
      </div>

      {/* Conteúdo do Método Selecionado */}
      <div className="w-full max-w-2xl bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl flex flex-col items-center">
        {metodo === 'PIX' ? (
          /* ================= FLUXO PIX ================= */
          <div className="w-full flex flex-col items-center text-center">
            {/* Barra de auto-simulação */}
            <div className="w-full mb-4 p-3 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-cyan-300 font-semibold">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Modo Demonstração: Confirmação em {autoSimulateCount}s</span>
              </div>
              <button
                type="button"
                onClick={() => setAutoSimulateActive(!autoSimulateActive)}
                className="text-[11px] text-slate-400 hover:text-white underline cursor-pointer"
              >
                {autoSimulateActive ? 'Pausar contagem' : 'Retomar contagem'}
              </button>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white">
              Escaneie o QR Code com o App do seu Banco
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md">
              Aponte a câmera do seu celular para a tela ou use o botão de simulação imediata abaixo:
            </p>

            {/* Container do QR Code */}
            <div className="my-5 p-4 bg-white rounded-3xl shadow-2xl border-4 border-cyan-500/40 relative group">
              {qrCodeDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qrCodeDataUrl}
                  alt="QR Code PIX para pagamento de ticket de estacionamento"
                  className="w-52 h-52 sm:w-60 sm:h-60 object-contain rounded-xl"
                />
              ) : (
                <div className="w-52 h-52 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                </div>
              )}
            </div>

            {/* Status dinâmico */}
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-4 animate-pulse">
              <Radio className="w-4 h-4 text-cyan-400 animate-ping" />
              <span>Aguardando transferência via PIX ({formatarMoeda(valorNumerico)})...</span>
            </div>

            {/* Botão de Destaque Primário para Simular Pagamento Imediato */}
            <div className="w-full flex flex-col gap-3">
              <button
                type="button"
                disabled={isLoading}
                onClick={handleSimulatePixPayment}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 active:scale-98 text-slate-950 font-black text-base sm:text-lg flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/30 cursor-pointer transition-all animate-bounce"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin text-slate-950" />
                    <span>PROCESSANDO PAGAMENTO...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-6 h-6 text-slate-950 fill-current" />
                    <span>SIMULAR PAGAMENTO PIX AGORA</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleCopyPix}
                className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 border border-slate-700 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                {copiedPix ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Chave PIX Copiada com Sucesso!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copiar Código PIX (Copia e Cola)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* ================= FLUXO CARTÃO ================= */
          <div className="w-full flex flex-col items-center text-center">
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Terminal de Cartões do Totem
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Aproxime seu cartão/celular (NFC) ou insira no leitor de chip
            </p>

            {/* Simulação Gráfica do Terminal POS do Totem */}
            <div className="w-full max-w-sm my-5 p-6 rounded-3xl bg-slate-950 border-2 border-slate-800 shadow-2xl flex flex-col items-center relative overflow-hidden">
              {/* Tela do Terminal */}
              <div className="w-full bg-blue-950/70 border border-blue-800/80 rounded-2xl p-4 mb-5 text-center">
                <span className="text-[10px] uppercase font-bold text-blue-300 tracking-wider">
                  Terminal SmartPay Pinpad
                </span>
                <p className="text-2xl font-mono font-black text-white mt-1">
                  {formatarMoeda(valorNumerico)}
                </p>

                <div className="mt-3 flex items-center justify-center gap-2">
                  {cardStatus === 'IDLE' && (
                    <span className="text-xs text-blue-200 font-medium animate-pulse">
                      Aguardando Cartão...
                    </span>
                  )}
                  {cardStatus === 'READING' && (
                    <div className="flex items-center gap-2 text-xs text-amber-300 font-bold">
                      <Radio className="w-4 h-4 animate-spin" />
                      <span>Lendo Cartão... Não remova!</span>
                    </div>
                  )}
                  {cardStatus === 'PROCESSING' && (
                    <div className="flex items-center gap-2 text-xs text-cyan-300 font-bold">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processando com o banco...</span>
                    </div>
                  )}
                  {cardStatus === 'APPROVED' && (
                    <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Transação Autorizada!</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Sensor NFC / Contactless */}
              <div className="w-20 h-20 rounded-full border-2 border-dashed border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-2 relative">
                <Radio className="w-8 h-8 animate-pulse" />
                <span className="absolute -bottom-2 bg-slate-900 px-2 text-[9px] font-bold text-slate-400 uppercase">
                  NFC
                </span>
              </div>
            </div>

            {/* Botões de Ação do Cartão */}
            <div className="w-full flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                disabled={cardStatus !== 'IDLE' || isLoading}
                onClick={() => handleSimulateCard('CARTAO_DEBITO')}
                className="flex-1 py-4 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 disabled:opacity-40 cursor-pointer transition-all"
              >
                <Radio className="w-5 h-5" />
                <span>Aproximar Cartão (NFC)</span>
              </button>

              <button
                type="button"
                disabled={cardStatus !== 'IDLE' || isLoading}
                onClick={() => handleSimulateCard('CARTAO_CREDITO')}
                className="flex-1 py-4 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 active:scale-95 text-white font-bold text-sm flex items-center justify-center gap-2 border border-slate-700 shadow-md disabled:opacity-40 cursor-pointer transition-all"
              >
                <CreditCard className="w-5 h-5" />
                <span>Inserir Chip (Crédito)</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-500 mt-4">
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
        <span>Transações criptografadas em ambiente 100% seguro</span>
      </div>
    </div>
  );
};
